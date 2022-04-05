pragma solidity ^0.8.0;

pragma abicoder v2;

import "./BankStorage.sol";

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

contract FlowControl is SuperAppBase, BankStorage,  {

    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaV1; //initialize cfaV1 variable

    ISuperfluid host;
    IConstantFlowAgreementV1 cfa;

    /*Constructor*/
    constructor(
        ISuperfluid _host,
        IConstantFlowAgreementV1 _cfa,
        string memory registrationKey
        ) {
        require(address(_host) != address(0), "host");
        require(address(_cfa) != address(0), "cfa");

        host = _host;
        cfa = _cfa;

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
            host.registerAppWithKey(configWord, registrationKey);
        } else {
            host.registerApp(configWord);
        }
    }

       /**************************************************************************
     * SuperApp callback hooks
     *************************************************************************/

    function _createFlow(bytes calldata _agreementData, bytes calldata _ctx) internal returns(bytes memory newCtx) {
        newCtx = _ctx;

        // get borrower from agreementData
        (address borrower, ) = abi.decode(_agreementData, (address, address));

        // get interest payment flow rate
        (,int96 interestPaymentFlowRate,,) = cfa.getFlow(ISuperToken(debt.tokenAddress), borrower, address(this));

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
        (,int96 currentOwnerFlow,,) = cfa.getFlow(ISuperToken(debt.tokenAddress), address(this), _bankFactoryOwner);
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
        (,int96 interestPaymentFlowRate,,) = cfa.getFlow(ISuperToken(debt.tokenAddress), borrower, address(this));
 
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
        (,int96 currentOwnerFlow,,) = cfa.getFlow(ISuperToken(debt.tokenAddress), address(this), _bankFactoryOwner);
        newCtx = cfaV1.updateFlowWithCtx(newCtx, _bankFactoryOwner, ISuperToken(debt.tokenAddress), currentOwnerFlow + (interestPaymentFlowRate - vaults[borrower].interestPaymentFlow));

        // Set profile to proper debt amount and interest flow rate
        vaults[borrower].debtAmount = newBorrowAmount; 
        vaults[borrower].interestPaymentFlow = interestPaymentFlowRate;
        reserve.debtBalance = reserve.debtBalance - (newBorrowAmount - vaults[borrower].debtAmount) ;

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
        (,int96 currentOwnerFlow,,) = cfa.getFlow(ISuperToken(debt.tokenAddress), address(this), _bankFactoryOwner);
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
        require(msg.sender == address(host), "RedirectAll: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isValidToken(superToken), "RedirectAll: not accepted token");
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }


 
}