// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

pragma abicoder v2;

import "hardhat/console.sol";

import "./BankStorage.sol";
import "./tellor/ITellor.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

import {
    ISuperfluid,
    ISuperToken,
    ISuperApp,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import {
    CFAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

import "hardhat/console.sol";

/**
 * @title Bank
 * This contract allows the owner to deposit reserves(debt token), earn interest and
 * origination fees from users that borrow against their collateral.
 * The oracle for Bank is Tellor.
 */
contract Bank is BankStorage, AccessControlEnumerable, Initializable, SuperAppBase {
    using SafeERC20 for IERC20;

    address private _bankFactoryOwner;

    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaV1; //initialize cfaV1 variable

    /*Events*/
    event ReserveDeposit(uint256 amount);
    event ReserveWithdraw(address indexed token, uint256 amount);
    event VaultDeposit(address indexed owner, uint256 amount);
    event VaultBorrow(address indexed borrower, uint256 amount);
    event VaultRepay(address indexed borrower, uint256 amount);
    event VaultWithdraw(address indexed borrower, uint256 amount);
    event PriceUpdate(address indexed token, uint256 price);
    event Liquidation(address indexed borrower, uint256 debtAmount);

    /*Constructor*/
    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        string memory registrationKey,
        address payable oracleContract
        ) {
        require(address(host) != address(0), "host");
        require(address(cfa) != address(0), "cfa");

        superfluid.host = host;
        superfluid.cfa = cfa;
        reserve.oracleContract = oracleContract;

        uint256 configWord =
            SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        //initialize InitData struct, and set equal to cfaV1
        cfaV1 = CFAv1Library.InitData(
        host,
        //here, we are deriving the address of the CFA using the host contract
        IConstantFlowAgreementV1(
            address(host.getAgreementClass(
                    keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
                ))
            )
        );

        // _scp.host.registerApp(configWord);
        if(bytes(registrationKey).length > 0) {
            superfluid.host.registerAppWithKey(configWord, registrationKey);
        } else {
            superfluid.host.registerApp(configWord);
        }
    }

    /*Modifiers*/
    modifier onlyOwner() {
        require(_owner == msg.sender, "IS NOT OWNER");
        _;
    }

    /**************************************************************************
     * SuperApp callback hooks
     *************************************************************************/

    function _createFlow(bytes calldata _agreementData, bytes calldata _ctx) internal returns(bytes memory newCtx) {
        newCtx = _ctx;

        // get borrower from agreementData
        (address borrower, ) = abi.decode(_agreementData, (address, address));

        // get interest payment flow rate
        (,int96 interestPaymentFlowRate,,) = superfluid.cfa.getFlow(ISuperToken(debt.tokenAddress), borrower, address(this));

        // Borrow Amount = Annualized Flow rate / Simple APR
        uint256 borrowAmount = ( ( uint(int(interestPaymentFlowRate)) * 31536000) * 10000 ) / reserve.interestRate;

        // Check if enough minimum collateral expected for borrow amount
        uint256 minimumCollateralExpected = ( ( vaults[borrower].debtAmount + borrowAmount ) * reserve.collateralizationRatio ) / 100;

        // Collateral Amount greater than minimum collateral expected
        require(vaults[borrower].collateralAmount >= minimumCollateralExpected, "Borrowing > collateral permits");

        // require that there is enough in reserve
        require(reserve.debtBalance >= borrowAmount, "Not enough in reserve");

        // Transfer loaned amount to borrower
        ISuperToken(debt.tokenAddress).transfer(borrower, borrowAmount);

        // Start adjunct stream to owner
        (,int96 currentOwnerFlow,,) = superfluid.cfa.getFlow(ISuperToken(debt.tokenAddress), address(this), _bankFactoryOwner);
        if (currentOwnerFlow == 0) {
            newCtx = cfaV1.createFlowWithCtx(newCtx, _bankFactoryOwner, ISuperToken(debt.tokenAddress), interestPaymentFlowRate);
        } else {
            newCtx = cfaV1.updateFlowWithCtx(newCtx, _bankFactoryOwner, ISuperToken(debt.tokenAddress), currentOwnerFlow + interestPaymentFlowRate);
        }

        // State updates
        vaults[borrower].debtAmount += borrowAmount;
        vaults[borrower].interestPaymentFlow = interestPaymentFlowRate; // might be unnecesary
        reserve.debtBalance -= borrowAmount;

    }

    function _updateFlow(bytes calldata _agreementData, bytes calldata _ctx) internal returns(bytes memory newCtx) {
        newCtx = _ctx;

        // get borrower from agreementData
        (address borrower, ) = abi.decode(_agreementData, (address, address));

        // get interest payment flow rate
        (,int96 interestPaymentFlowRate,,) = superfluid.cfa.getFlow(ISuperToken(debt.tokenAddress), borrower, address(this));
 
        // Borrow Amount = Annualized Flow rate / Simple APR
        uint256 newBorrowAmount = ( ( uint(int(interestPaymentFlowRate)) * 31536000) * 10000 ) / reserve.interestRate;

        // Check if enough minimum collateral expected for borrow amount
        uint256 minimumCollateralExpected = ( ( newBorrowAmount ) * reserve.collateralizationRatio ) / 100;

        // Collateral Amount greater than minimum collateral expected
        require(vaults[borrower].collateralAmount >= minimumCollateralExpected, "Borrowing too much");

        if (newBorrowAmount > vaults[borrower].debtAmount) {
            // if new borrow amount is greater than current borrow amount, lend out more
            ISuperToken(debt.tokenAddress).transfer(borrower, newBorrowAmount - vaults[borrower].debtAmount);
        } else {
            // if less, we expect partial repayment. Attain payment or revert due to not enough balance or spend allowance
            bool repaySuccess = ISuperToken(debt.tokenAddress).transferFrom(borrower, address(this), vaults[borrower].debtAmount - newBorrowAmount);
            require(repaySuccess, "Could not repay - insufficient approval or balance");
        }   

        // Start adjunct stream to owner (current + interest flow delta)
        (,int96 currentOwnerFlow,,) = superfluid.cfa.getFlow(ISuperToken(debt.tokenAddress), address(this), _bankFactoryOwner);
        newCtx = cfaV1.updateFlowWithCtx(newCtx, _bankFactoryOwner, ISuperToken(debt.tokenAddress), currentOwnerFlow + (interestPaymentFlowRate - vaults[borrower].interestPaymentFlow));

        // Set profile to proper debt amount and interest flow rate
        reserve.debtBalance = (reserve.debtBalance - newBorrowAmount) + vaults[borrower].debtAmount;
        vaults[borrower].debtAmount = newBorrowAmount; 
        vaults[borrower].interestPaymentFlow = interestPaymentFlowRate;

    }

    function _deleteFlow(bytes calldata _agreementData, bytes calldata _ctx) internal returns(bytes memory newCtx) {
        newCtx = _ctx;

        // get borrower from agreementData
        (address borrower, ) = abi.decode(_agreementData, (address, address));

        bool repaySuccess = ISuperToken(debt.tokenAddress).transferFrom(borrower, address(this), vaults[borrower].debtAmount);

        // should probably add getting function checking that it is safe to stop stream
        // perform liquidation if the repay is not successful
        if (!repaySuccess) {
            liquidate(borrower);
        } else {
            // if it was a success, increase reserve amount
            reserve.debtBalance += vaults[borrower].debtAmount;
        }

        // reduce stream to owner
        (,int96 currentOwnerFlow,,) = superfluid.cfa.getFlow(ISuperToken(debt.tokenAddress), address(this), _bankFactoryOwner);
        if (currentOwnerFlow - vaults[borrower].interestPaymentFlow == 0) {
            newCtx = cfaV1.deleteFlowWithCtx(newCtx, address(this), _bankFactoryOwner, ISuperToken(debt.tokenAddress) );
        } else {
            newCtx = cfaV1.updateFlowWithCtx(newCtx, _bankFactoryOwner, ISuperToken(debt.tokenAddress), currentOwnerFlow - vaults[borrower].interestPaymentFlow );
        }

        delete vaults[borrower];

    }

    /**************************************************************************
     * SuperApp callbacks
     *************************************************************************/

    /**
     * @dev Super App callback responding the creation of a CFA to the app
     *
     * Response logic in _createOutflow
     */
    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata _agreementData,
        bytes calldata ,// _cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
     
        return _createFlow(_agreementData, _ctx);
    
    }

    /**
     * @dev Super App callback responding to the update of a CFA to the app
     * 
     * Response logic in _updateOutflow
     */
    function afterAgreementUpdated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32 ,//_agreementId,
        bytes calldata _agreementData,
        bytes calldata ,//_cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        
        return _updateFlow(_agreementData, _ctx);
        
    }

    /**
     * @dev Super App callback responding the ending of a CFA to the app
     * 
     * Response logic in _updateOutflow
     */
    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32 ,//_agreementId,
        bytes calldata _agreementData,
        bytes calldata ,//_cbdata,
        bytes calldata _ctx
    )
        external override
        onlyHost
        returns (bytes memory newCtx)
    {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isValidToken(_superToken) || !_isCFAv1(_agreementClass)) return _ctx;

        return _deleteFlow(_agreementData, _ctx);

    }

    function _isValidToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == debt.tokenAddress;
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return ISuperAgreement(agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(superfluid.host), "RedirectAll: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isValidToken(superToken), "RedirectAll: not accepted token");
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }


    /**************************************************************************
     * Getters & Setters
     *************************************************************************/

    /*Functions*/
    /**
     * @dev Returns the owner of the bank
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     * NOTE: Override this to add changing the
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _owner = newOwner;
    }

    /**
     * @dev This function sets the fundamental parameters for the bank
     *      and assigns the first admin
     */
    function init(
        address creator,
        string memory bankName,
        uint256 interestRate,
        uint256 originationFee,
        uint256 collateralizationRatio,
        uint256 liquidationPenalty,
        uint256 period,
        address bankFactoryOwner,
        address payable oracleContract
    ) public initializer {
        //set up as admin / owner
        _setupRole(DEFAULT_ADMIN_ROLE, creator);
        reserve.interestRate = interestRate;
        reserve.collateralizationRatio = collateralizationRatio;
        reserve.oracleContract = oracleContract;
        reserve.liquidationPenalty = liquidationPenalty;
        _bankFactoryOwner = bankFactoryOwner;
        name = bankName;
    }

    /**
     * @dev This function sets the collateral token properties, only callable one time
     */
    function setCollateral(
        address collateralToken,
        uint256 collateralTokenTellorRequestId,
        uint256 collateralTokenPriceGranularity,
        uint256 collateralTokenPrice
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            collateral.tokenAddress == address(0) &&
                collateralToken != address(0),
            "!setable"
        );
        collateral.tokenAddress = collateralToken;
        collateral.price = collateralTokenPrice;
        collateral.priceGranularity = collateralTokenPriceGranularity;
        collateral.tellorRequestId = collateralTokenTellorRequestId;
    }

    /**
     * @dev This function sets the debt token properties, only callable one time
     */
    function setDebt(
        address debtToken,
        uint256 debtTokenTellorRequestId,
        uint256 debtTokenPriceGranularity,
        uint256 debtTokenPrice
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            debt.tokenAddress == address(0) && debtToken != address(0),
            "!setable"
        );
        debt.tokenAddress = debtToken;
        debt.price = debtTokenPrice;
        debt.priceGranularity = debtTokenPriceGranularity;
        debt.tellorRequestId = debtTokenTellorRequestId;
    }

    /**
     * @dev Use this function to get and update the price for the collateral token
     * using the Tellor Oracle.
     */
    function updateCollateralPrice() external {
        require(
            hasRole(REPORTER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "not price updater or admin"
        );
        (, collateral.price, collateral.lastUpdatedAt) = getCurrentValue(
            collateral.tellorRequestId
        ); //,now - 1 hours);
        emit PriceUpdate(collateral.tokenAddress, collateral.price);
    }

    /**
     * @dev Use this function to get and update the price for the debt token
     * using the Tellor Oracle.
     */
    function updateDebtPrice() external {
        require(
            hasRole(REPORTER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "not price updater or admin"
        );
        (, debt.price, debt.lastUpdatedAt) = getCurrentValue(
            debt.tellorRequestId
        ); //,now - 1 hours);
        emit PriceUpdate(debt.tokenAddress, debt.price);
    }

    function getBankFactoryOwner() public view returns (address) {
        return _bankFactoryOwner;
    }

    function setBankFactoryOwner(address newOwner) external {
        require(_bankFactoryOwner == msg.sender, "IS NOT BANK FACTORY OWNER");
        _bankFactoryOwner = newOwner;
    }

    function getCurrentValue(uint256 _requestId)
        public
        view
        returns (
            bool ifRetrieve,
            uint256 value,
            uint256 _timestampRetrieved
        )
    {
        ITellor oracle = ITellor(reserve.oracleContract);
        uint256 _count = oracle.getNewValueCountbyRequestId(_requestId);
        uint256 _time = oracle.getTimestampbyRequestIDandIndex(
            _requestId,
            _count - 1
        );
        uint256 _value = oracle.retrieveData(_requestId, _time);
        if (_value > 0) return (true, _value, _time);
        return (false, 0, _time);
    }

    /**
     * @dev Allows admin to add address to keeper role
     * @param keeper address of new keeper
     */
    function addKeeper(address keeper) external {
        require(keeper != address(0), "operation not allowed");
        grantRole(KEEPER_ROLE, keeper);
    }

    /**
     * @dev Allows admin to remove address from keeper role
     * @param oldKeeper address of old keeper
     */
    function revokeKeeper(address oldKeeper) external {
        revokeRole(KEEPER_ROLE, oldKeeper);
    }

    /**
     * @dev Allows admin to add address to price updater role
     * @param updater address of new price updater
     */
    function addReporter(address updater) external {
        require(updater != address(0), "operation not allowed");
        grantRole(REPORTER_ROLE, updater);
    }

    /**
     * @dev Allows admin to remove address from price updater role
     * @param oldUpdater address of old price updater
     */
    function revokeReporter(address oldUpdater) external {
        revokeRole(REPORTER_ROLE, oldUpdater);
    }

    /**************************************************************************
     * Reserve & Vault Functions (Includes Liquidation)
     *************************************************************************/

    /**
     * @dev This function allows the Bank owner to deposit the reserve (debt tokens)
     * @param amount is the amount to deposit
     */
    function reserveDeposit(uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(amount > 0, "Amount is zero !!");
        reserve.debtBalance += amount;
        IERC20(debt.tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        emit ReserveDeposit(amount);
    }

    /**
     * @dev This function allows the Bank owner to withdraw the reserve (debt tokens)
     *      Withdraws incur a 0.5% fee paid to the bankFactoryOwner
     * @param amount is the amount to withdraw
     */
    function reserveWithdraw(uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            IERC20(debt.tokenAddress).balanceOf(address(this)) >= amount,
            "NOT ENOUGH DEBT TOKENS IN RESERVE"
        );
        uint256 feeAmount = amount / 200; // Bank Factory collects 0.5% fee
        reserve.debtBalance -= amount;
        IERC20(debt.tokenAddress).safeTransfer(msg.sender, amount - feeAmount);
        IERC20(debt.tokenAddress).safeTransfer(_bankFactoryOwner, feeAmount);
        emit ReserveWithdraw(debt.tokenAddress, amount);
    }

    /**
  * @dev This function allows the user to withdraw their collateral
         Withdraws incur a 0.5% fee paid to the bankFactoryOwner
  * @param amount is the amount to withdraw
  */
    function reserveWithdrawCollateral(uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            reserve.collateralBalance >= amount,
            "NOT ENOUGH COLLATERAL IN RESERVE"
        );
        uint256 feeAmount = amount / 200; // Bank Factory collects 0.5% fee
        reserve.collateralBalance -= amount;
        emit ReserveWithdraw(collateral.tokenAddress, amount);
        IERC20(collateral.tokenAddress).safeTransfer(
            msg.sender,
            amount - feeAmount
        );
        IERC20(collateral.tokenAddress).safeTransfer(
            _bankFactoryOwner,
            feeAmount
        );
    }

    /**
     * @dev Use this function to allow users to deposit collateral to the vault
     * @param amount is the collateral amount
     */
    function vaultDeposit(uint256 amount) external {
        require(amount > 0, "Amount is zero !!");
        vaults[msg.sender].collateralAmount += amount;
        reserve.collateralBalance += amount;
        IERC20(collateral.tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        emit VaultDeposit(msg.sender, amount);
    }

    /**
     * @dev Allows users to withdraw their collateral from the vault
     * @param amount withdrawn
     */
    function vaultWithdraw(uint256 amount) external {
        require(
            amount <= vaults[msg.sender].collateralAmount,
            "CANNOT WITHDRAW MORE COLLATERAL"
        );
        // 
        uint256 maxBorrowAfterWithdraw = (((vaults[msg.sender]
            .collateralAmount - amount) * collateral.price) /
            debt.price /
            reserve.collateralizationRatio) * 100;
        maxBorrowAfterWithdraw *= debt.priceGranularity;
        maxBorrowAfterWithdraw /= collateral.priceGranularity;
        require(
            vaults[msg.sender].debtAmount <= maxBorrowAfterWithdraw,
            "CANNOT UNDERCOLLATERALIZE VAULT"
        );
        vaults[msg.sender].collateralAmount -= amount;
        reserve.collateralBalance -= amount;
        IERC20(collateral.tokenAddress).safeTransfer(msg.sender, amount);
        emit VaultWithdraw(msg.sender, amount);
    }

    /**
     * @dev Only keepers or admins can use this function to liquidate a vault's debt,
     * the bank admins gets the collateral liquidated, liquidated collateral
     * is charged a 10% fee which gets paid to the bankFactoryOwner
     * @param vaultOwner is the user the bank admins wants to liquidate
     */
    function liquidate(address vaultOwner) public {
        require(
            hasRole(KEEPER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "not keeper or admin"
        );
        // Require undercollateralization
        require(
            getVaultCollateralizationRatio(vaultOwner) <
                reserve.collateralizationRatio * 100,
            "VAULT NOT UNDERCOLLATERALIZED"
        );
        // add liquidation penalty to debt outstanding
        uint256 debtOwned = vaults[vaultOwner].debtAmount + ((vaults[vaultOwner].debtAmount * 100 * reserve.liquidationPenalty) / 100 / 100);
        // reframe the debt token quantity to collateral token quantity (because the collateral is getting slashed, need to know how much to take)
        uint256 collateralToLiquidate = (debtOwned * debt.price) /
            collateral.price;

        // if the amount of collateral to liquidate is greater than the collateral actual available, set it as such
        if (collateralToLiquidate > vaults[vaultOwner].collateralAmount) {
            collateralToLiquidate = vaults[vaultOwner].collateralAmount;
        }

        // 10% of the liquidated collateral goes to the Bank owner. Gets that amount here
        uint256 feeAmount = collateralToLiquidate / 10; // Bank Factory collects 10% fee

        // increase the amount of the reserve holds in the collateral token less the fee that's going to the bank owner
        reserve.collateralBalance += collateralToLiquidate - feeAmount;

        // reduce the collateral possessed by the vault owner
        vaults[vaultOwner].collateralAmount -= collateralToLiquidate;

        // forget outstanding debt
        vaults[vaultOwner].debtAmount = 0;

        // transfer fee to bank
        IERC20(collateral.tokenAddress).safeTransfer(
            _bankFactoryOwner,
            feeAmount
        );
        emit Liquidation(vaultOwner, debtOwned);
    }

}
