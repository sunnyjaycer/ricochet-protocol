// parseUnits - number in wei (second param with more control over denomination)
// parseEther - number in wei (gives bignumber)
// formatUnits - number in ethers
// chai assertion suite - https://www.chaijs.com/

import { network, ethers, web3 } from 'hardhat';
import { increaseTime } from "./helpers";
import { assert, expect } from 'chai';

import { Bank, GLDToken, TellorPlayground, USDToken } from "../typechain";
import { dtInstance2Abi } from "./artifacts/DAIABI.js"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';

import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import deployFramework from "@superfluid-finance/ethereum-contracts/scripts/deploy-framework.js";
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");

describe("Bank", function () {
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const KEEPER_ROLE = ethers.utils.solidityKeccak256(["string"], ["KEEPER_ROLE"]);
  const REPORTER_ROLE = ethers.utils.solidityKeccak256(["string"], ["REPORTER_ROLE"]);

  const DAYS_IN_A_YEAR = ethers.BigNumber.from(365);
  const BIGNUMBER_10000 = ethers.BigNumber.from(10000);
  const SECONDS_IN_A_YEAR = ethers.BigNumber.from(31536000);

  const TEN_ETH_PER_YEAR_FLOW_RATE = ethers.BigNumber.from(317097919837);

  const INTEREST_RATE = 200; // 2%
  const ORIGINATION_FEE = 100; // 1%
  const COLLATERALIZATION_RATIO = 150;
  const LIQUIDATION_PENALTY = 25;
  const PERIOD = 86400;
  const BANK_NAME = "Test Bank";
  const TELLOR_ORACLE_ADDRESS = '0xACC2d27400029904919ea54fFc0b18Bf07C57875';
  const TELLOR_REQUEST_ID = 60;
  let oracle;
  const INITIAL_BALANCE = "20000";
  let depositAmount: BigNumber;
  let largeDepositAmount: BigNumber;
  let withdrawAmount;
  let borrowAmount: BigNumber;
  let largeBorrowAmount: BigNumber;
  let smallBorrowAmount: BigNumber;

  let deployer: SignerWithAddress;    // admin
  let randomUser: SignerWithAddress;
  let randomUser2: SignerWithAddress;
  let randomUser3: SignerWithAddress;
  let randomUser4: SignerWithAddress;
  let randomUser5: SignerWithAddress;
  let randomUser6: SignerWithAddress;
  let randomUser7: SignerWithAddress;
  let randomUser8: SignerWithAddress;
  let randomUser9: SignerWithAddress;
  let user_directory: { [key: string]: string } = {};

  let sf: any;
  let superSigner: any;

  let CT2;
  let DT2;
  let ctInstance2: GLDToken;
  let dtInstance2: any;
  let dtInstance2x: SuperToken;
  let bankInstance2: Bank;
  let bank2;
  let tp: TellorPlayground;

  const errorHandler = (err:any) => {
    if (err) throw err;
  };

  before (async function () {

    // get signers
    [deployer, randomUser, randomUser2, randomUser3, randomUser4, randomUser5, randomUser6,
      randomUser7, randomUser8, randomUser9] = await ethers.getSigners();
    user_directory[deployer.address] = "Admin";
    user_directory[randomUser.address] = "randomUser";
    user_directory[randomUser2.address] = "randomUser2";
    user_directory[randomUser3.address] = "randomUser3";
    user_directory[randomUser4.address] = "randomUser4";
    user_directory[randomUser5.address] = "randomUser5";
    user_directory[randomUser6.address] = "randomUser6";
    user_directory[randomUser7.address] = "randomUser7";
    user_directory[randomUser8.address] = "randomUser8";
    user_directory[randomUser9.address] = "randomUser9";

    // Deploy SF Framework
    await deployFramework(
      (error:any) => {
        if (error) throw error;
      },
      {web3,from:deployer.address, newTestResolver:true}
    )

    sf = await Framework.create({
      networkName: "custom",
      provider: web3,
      dataMode: "WEB3_ONLY",
      resolverAddress: process.env.RESOLVER_ADDRESS, //this is how you get the resolver address
      protocolReleaseVersion: "test",
    })

    // Set a "super signer" for getting flow rate operations
    superSigner = await sf.createSigner({
      signer: deployer,
      provider: web3
    });

    //// Set up collateral token

    CT2 = await ethers.getContractFactory("GLDToken");
    ctInstance2 = await CT2.deploy(ethers.utils.parseUnits("100000000"));  // JR
    await ctInstance2.deployed();

    //// Set up debt token, both ERC20 and wrapped super token

    //deploy a fake erc20 debt token
    let fDtInstance2Address = await deployTestToken(errorHandler, [":", "fUSDC"], {
      web3,
      from: deployer.address,
    });
    //deploy a fake erc20 wrapper super token around the debt token
    let fDtInstance2xAddress = await deploySuperToken(errorHandler, [":", "fUSDC"], {
        web3,
        from: deployer.address,
    });

    //use the framework to get the debt super token
    dtInstance2x = await sf.loadSuperToken("fUSDCx");
    
    //get the contract object for the erc20 debt token
    let dtInstance2Address = dtInstance2x.underlyingToken.address;
    dtInstance2 = new ethers.Contract(dtInstance2Address, dtInstance2Abi, deployer);
    await dtInstance2.deployed();

    //// Set up bank

    bank2 = (await ethers.getContractFactory("Bank", deployer));

    bankInstance2 = await bank2.deploy(
      sf.settings.config.hostAddress, // supposed to be SF host
      sf.settings.config.cfaV1Address, // supposed to be SF CFA Resolver address
      (""),                    // reigstration key
      TELLOR_ORACLE_ADDRESS  // actual oracle contract
    );
    await bankInstance2.deployed();

    await bankInstance2.connect(deployer).init(deployer.address, BANK_NAME, INTEREST_RATE, ORIGINATION_FEE,
      COLLATERALIZATION_RATIO, LIQUIDATION_PENALTY, PERIOD, randomUser6.address, TELLOR_ORACLE_ADDRESS);
    await bankInstance2.setCollateral(ctInstance2.address, 2, 1000, 1000);
    await bankInstance2.setDebt(dtInstance2x.address, 1, 1000, 1000);
    depositAmount = ethers.utils.parseUnits("100");
    largeDepositAmount = ethers.utils.parseUnits("5000");
    withdrawAmount = ethers.utils.parseUnits("50");
    borrowAmount = ethers.utils.parseUnits("66");
    largeBorrowAmount = ethers.utils.parseUnits("75");
    smallBorrowAmount = ethers.utils.parseUnits("20");

    // set keepers
    await bankInstance2.addKeeper(randomUser3.address);
    await bankInstance2.addKeeper(randomUser4.address);
    //set updaters
    await bankInstance2.addReporter(randomUser5.address);
    await bankInstance2.addReporter(randomUser6.address);

    console.log("Bank Address:", bankInstance2.address);

    console.log("+++++++++++++ SET UP COMPLETE +++++++++++++")

  })

  beforeEach(async function () {

    await setTokenBalances1();

  });

    /**
   * Sets up user 2, 3, 4 with 20,000 Super Debt Tokens from the admin's original balance of 100,000 at minting
   * Admin approves bank for spending of Super Debt Tokens
   * User 2, 3, 4 approves bank for spending of collateral tokens
   */
  async function setTokenBalances1() {
      //// Set up initial token balances

      //  A non-admin has a positive balance (20,000)
      await ctInstance2.transfer(randomUser2.address, ethers.utils.parseUnits(INITIAL_BALANCE));
      await dtInstance2.connect(deployer).mint(randomUser2.address, ethers.utils.parseUnits(INITIAL_BALANCE));
      await ctInstance2.transfer(randomUser3.address, ethers.utils.parseUnits(INITIAL_BALANCE));
      await dtInstance2.connect(deployer).mint(randomUser3.address, ethers.utils.parseUnits(INITIAL_BALANCE));
      await ctInstance2.transfer(randomUser4.address, ethers.utils.parseUnits(INITIAL_BALANCE));
      await dtInstance2.connect(deployer).mint(randomUser4.address, ethers.utils.parseUnits(INITIAL_BALANCE));

      //  The admin has a positive balance (20,000)
      await ctInstance2.transfer(deployer.address, ethers.utils.parseUnits(INITIAL_BALANCE));  // Added line
      await dtInstance2.connect(deployer).mint(deployer.address, ethers.utils.parseUnits(INITIAL_BALANCE));

      // approve DTx to transfer DT
      await dtInstance2.connect(randomUser2).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
      await dtInstance2.connect(randomUser3).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
      await dtInstance2.connect(randomUser4).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
      await dtInstance2.connect(deployer).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));

      // user2 and admin upgrade 20,000 tokens
      const dtUpgradeOperation = dtInstance2x.upgrade({
        amount: ethers.utils.parseEther("20000").toString()
      });
      await dtUpgradeOperation.exec(randomUser2);
      await dtUpgradeOperation.exec(randomUser3);
      await dtUpgradeOperation.exec(randomUser4);
      await dtUpgradeOperation.exec(deployer);

      // Admin approves bank for spending of Super Debt Tokens
      const dtxApproveOperation = dtInstance2x.approve({
        receiver: bankInstance2.address,
        amount: ethers.utils.parseEther("10000000000000000000000000000000000000").toString()
      });
      await dtxApproveOperation.exec(deployer);

      // User 2 approves bank for spending of collateral tokens
      await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));

      await logTokenBalances([randomUser2, randomUser3, randomUser4, deployer], ["User 2", "User 3", "User 4", "Admin"]);
      
      console.log("+++++++++++++ TOKEN BALANCES SET ++++++++++++");
  }

  async function logTokenBalances(user:SignerWithAddress[], name:string[]) {
    console.log("===== Token Balances ====="); 
    for (let i = 0; i < name.length; ++i) {
      console.log(name[i])
      console.log("    Collateral Token Balance: ", parseInt( await ctInstance2.connect(user[i]).balanceOf(user[i].address))/(10**18) );
      console.log("    Debt Token Balance: ", parseInt( await dtInstance2.connect(user[i]).balanceOf(user[i].address) )/(10**18) );
      console.log("    Debt Super Token Balance: ", 
        parseInt( await dtInstance2x.balanceOf({
          account: user[i].address,
          providerOrSigner: user[i]
        }) )/(10**18)
      );
    }
    console.log("==========================\n");
  }

  async function logNetflowForEntities(user:SignerWithAddress[],name:string[]) {
    console.log("===== Netflow Rates ====="); 
    for (let i = 0; i < name.length; ++i) {
      const flowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: user[i].address,
        providerOrSigner: superSigner
      });
      console.log(name[i], "Net Flow Rate: ", flowRate);
    }
    console.log("==========================\n");
  }

  async function logFlows(user:SignerWithAddress[]) {
    console.log("========== Annual Flow Rates =========="); 
    for (let i = 0; i < user.length; ++i) {
      const userFlowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: user[i].address,
        providerOrSigner: superSigner
      });
      console.log(user_directory[ user[i].address ], "Net Flow Rate:\t", ( parseInt(userFlowRate) * 31536000 / (10**18) ).toFixed(2) );
    }
    const bankFlowRate = await sf.cfaV1.getFlow({
      superToken: dtInstance2x.address,
      sender: bankInstance2.address,
      receiver: randomUser6.address,
      providerOrSigner: superSigner
    });
    console.log("Bank Revenue Flow Rate:\t", ( parseInt(bankFlowRate.flowRate) * 31536000 / (10**18) ).toFixed(2) );
    console.log("======================================\n");
  }

  /** Returns the 2-hour stream deposit of the provided flow rate.
   * Toggle gwei or units by inputing "gwei" or "units as second param"
   */
  async function getStreamDeposit(flowRate:BigNumber,denom:string) {
    return flowRate.mul( 60*60*2 );
  }

  /** Returns whether the debt recorded in the user's vault is as expected
   * user: user who's debt is to be checked
   * expectedDebt: expected debt to be compared to actual debt of user
   * precision: how precise for comparison
   */
  async function checkDebt(user:SignerWithAddress,expectedDebt:BigNumber, precision: number) {
    const contractRecordedDebt = await bankInstance2.connect(user).getVaultDebtAmount();
    return parseFloat(ethers.utils.formatUnits(contractRecordedDebt)).toFixed(precision) == parseFloat(ethers.utils.formatUnits(expectedDebt)).toFixed(precision);
  }

  /** Returns whether the Super Debt Token reserves recorded in the contract is as expected
   * expectedReserves: expected debt to be compared to actual debt of user
   * precision: how precise for comparison
   */
  async function checkReserves(expectedReserves:BigNumber, precision: number) {
    const contractRecordedReserveBalance = await bankInstance2.connect(deployer).getReserveBalance();
    return parseFloat(ethers.utils.formatUnits(contractRecordedReserveBalance)).toFixed(precision) == parseFloat(ethers.utils.formatUnits(expectedReserves)).toFixed(precision);
  }

  async function sweepingCreateFlowCheck() {
    // check 
  }

  async function closeEnough(x:BigNumber, y:BigNumber, precision:number) {
    // console.log("Expected", parseFloat(ethers.utils.formatUnits(x)).toFixed(precision));
    // console.log("Actual  ", parseFloat(ethers.utils.formatUnits(y)).toFixed(precision));
    return parseFloat(ethers.utils.formatUnits(x)).toFixed(precision) == parseFloat(ethers.utils.formatUnits(y)).toFixed(precision);
  }

  xit('SF happy path', async function () {

    // approve DTx to transfer DT
    await dtInstance2.connect(randomUser2).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
    await dtInstance2.connect(deployer).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));

    // user2 and admin upgrade 20000 tokens
    const dtUpgradeOperation = dtInstance2x.upgrade({
        amount: ethers.utils.parseEther("20000").toString()
    });
    await dtUpgradeOperation.exec(randomUser2);
    await dtUpgradeOperation.exec(deployer);

    await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);

    // Admin and user approves bank to spend debt super token for reserve deposit and repayment respectively
    const dtxApproveOperation = dtInstance2x.approve({
      receiver: bankInstance2.address,
      amount: ethers.utils.parseEther("10000000000000000000000000000000000000").toString()
    });
    await dtxApproveOperation.exec(deployer);
    await dtxApproveOperation.exec(randomUser2);

    // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
    await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

    await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);

    // User approves spending of collateral token and debt token by bank contract
    await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
    await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));

    // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
    await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

    await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);

    console.log("Starting off with borrow:")
    // User starts stream of 20 dtInstance2x/year to bank
    await ( await sf.cfaV1.createFlow({
      receiver: bankInstance2.address,
      superToken: dtInstance2x.address,
      flowRate: "634195839675",
    }) ).exec( randomUser2 );


    // Check balance of dtx in borrower
    console.log("1000 Borrow Amount should be reflected");
    await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
    await logFlows([deployer,randomUser2]);

    // Update stream to 10 dtInstance2x/year (repay 500 in debt)
    await ( await sf.cfaV1.updateFlow({
      receiver: bankInstance2.address,
      superToken: dtInstance2x.address,
      flowRate: "317097919837",
    }) ).exec( randomUser2 );

    // Check balance of dtx in borrower and bank
    console.log("500 repay should be reflected");
    await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
    await logFlows([deployer,randomUser2]);

    // Update stream to 40 dtInstance2x/year (borrow additional 1500)
    await ( await sf.cfaV1.updateFlow({
      receiver: bankInstance2.address,
      superToken: dtInstance2x.address,
      flowRate: "1268391679350",
    }) ).exec( randomUser2 );

    // Check balance of dtx in borrower and bank
    console.log("1500 extra borrow should be reflected");
    await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
    await logFlows([deployer,randomUser2]);


    // Delte stream (repay of 1500 in debt)
    await ( await sf.cfaV1.deleteFlow({
      sender: randomUser2.address,
      receiver: bankInstance2.address,
      by: randomUser2.address,
      superToken: dtInstance2x.address,
    }) ).exec( randomUser2 );

    // Check balance of dtx in borrower and bank
    console.log("Total repay should be reflected");
    await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
    await logFlows([deployer,randomUser2]);

  });

  context("Pre-checks", function () {

    xit("should not be able to borrow with no collateral")

    xit("should be able to reserve deposit properly")

    xit("should be able to reserve withdraw properly")
    
    xit("should be able to reserve withdraw properly")
    
    xit("should be able to reserve withdraw properly")

  })

  context("create borrow checks", function () {

    beforeEach(async function () {

      // reserve deposit
      // start a borrow flow

    })

    xit("should not be able to borrow when no reserves are available", async function () {
      await setTokenBalances1()

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // User starts stream of 20 dtInstance2x/year to bank but should fail because there is not collateral
      try {
        await ( await sf.cfaV1.createFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: "634195839675",
        }) ).exec( randomUser2 );
      } catch (e) {
        console.log("Errored out as expected - should not be able to borrow when no reserves are available");
      }

    })

    xit("should not be able to borrow if not enough collateral", async function () {
      await setTokenBalances1()

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      const dtxApproveOperation = dtInstance2x.approve({
        receiver: bankInstance2.address,
        amount: ethers.utils.parseEther("10000000000000000000000000000000000000").toString()
      });
      await dtxApproveOperation.exec(deployer);
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 1000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("1000"));

      // User starts stream of 20 dtInstance2x/year to bank (borrow 1000) but should fail because there is not collateral
      try {
        await ( await sf.cfaV1.createFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: "634195839675",
        }) ).exec( randomUser2 );
      } catch (e) {
        console.log("Errored out as expected - should not be able to borrow if not enough collateral");
      }

    })

    // fleshed out
    xit("should be able to borrow correct amount", async function () {
      // await setTokenBalances1()
      console.log("Bank address",bankInstance2.address);

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // Original DT balance (in gwei)
      const origDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });
      
      // start flow of 20 DTx/year
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      const strDep = await getStreamDeposit(TEN_ETH_PER_YEAR_FLOW_RATE.mul(2), "wei");
      const newDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });

      // Interest rate payment of 20 DTx/year -> 1000 DTx loan (20/2% = 1000)
      await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
      // log flow rate changes
      await logFlows([randomUser2]);

      const randomUser2FlowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: randomUser2.address,
        providerOrSigner: superSigner
      });
      const bankOwnerFlowRate = await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      });
      const bankNetFlow = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: bankInstance2.address,
        providerOrSigner: superSigner
      });

      // correct balance changes (down to 4 decimals)
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(origDTxBal).add(ethers.utils.parseUnits("1000")), // 1000 is expected borrow amount 
          ethers.BigNumber.from(newDTxBal).add(strDep), 
          4
        ) ) == true
      );

      // assert owner income is equal to user's outflow
      assert.equal(parseInt(randomUser2FlowRate), -parseInt(bankOwnerFlowRate.flowRate), "outflow != inflow");
      // assert bank net flow is zero
      assert.equal(bankNetFlow,"0", "non net-zero");

      assert(
        ( await closeEnough(
          ethers.BigNumber.from(
              await bankInstance2.connect(randomUser2).getReserveBalance() 
          ),
          ethers.BigNumber.from(ethers.utils.parseUnits("9000")),
          4
        ) ) == true,
        "incorrect debt change"
      );

    })
  });

  context("update repay checks", function () {

    beforeEach( async function () {

      // reserve deposit
      // start a borrow flow

    })

    xit("should not be able to repay if not enough balance", async function () {
      await setTokenBalances1()

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      // User transfers away almost all his/her super tokens so there's nothing left for repay
      const dtxTransferOperation = dtInstance2x.transfer({
        receiver: bankInstance2.address,
        amount: ethers.utils.parseEther("14500").toString()
      });
      await dtxTransferOperation.exec( randomUser2 );

      // update flow to 10 DTx/year -> 500 DTx (10/2% = 500) -> 500 - 1000 = -500 repay
      try {
        await ( await sf.cfaV1.updateFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: TEN_ETH_PER_YEAR_FLOW_RATE,
        }) ).exec( randomUser2 );
      } catch (e) {
        console.log("Errored out as expected - should not be able to repay if user doesn't have enough debt token balance for repay");
      }

    });

    xit("should not be able to repay if not enough allowance", async function () {
        await setTokenBalances1()
  
        // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
        await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));
  
        // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
        await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));
  
        // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
        await ( await sf.cfaV1.createFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
        }) ).exec( randomUser2 );
  
        // User cancels approval
        const dtxTransferOperation = dtInstance2x.approve({
          receiver: bankInstance2.address,
          amount: ethers.utils.parseEther("0").toString()
        });
        await dtxTransferOperation.exec( randomUser2 );
  
        // update flow to 10 DTx/year -> 500 DTx (10/2% = 500) -> 500 - 1000 = -500 repay
        try {
          await ( await sf.cfaV1.updateFlow({
            receiver: bankInstance2.address,
            superToken: dtInstance2x.address,
            flowRate: TEN_ETH_PER_YEAR_FLOW_RATE,
          }) ).exec( randomUser2 );
        } catch (e) {
          console.log("Errored out as expected - should not be able to repay if user doesn't have enough allowance repay");
        }
    })

    xit("test withdrawals")
      // should be able to borrow less

    xit("test deposits")
      // should be able to borrow more
 
    xit("should be able to repay proper amounts", async function () {
      // await setTokenBalances1();
      console.log("Bank address",bankInstance2.address);

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // User approves bank to spend debt tokens for repay
      const dtxTransferOperation = dtInstance2x.approve({
        receiver: bankInstance2.address,
        amount: ethers.utils.parseEther("10000000000000000").toString()
      });
      await dtxTransferOperation.exec( randomUser2 );

      // Original DT balance (in gwei)
      const origDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });
      
      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      console.log("Creating Flow");
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      const strDep = await getStreamDeposit(TEN_ETH_PER_YEAR_FLOW_RATE.mul(2), "wei");
      const newDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });

      // log balances
      await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
      // log flow rate changes
      await logFlows([randomUser2]);

      const randomUser2FlowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: randomUser2.address,
        providerOrSigner: superSigner
      });
      const bankOwnerFlowRate = await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      });
      const bankNetFlow = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: bankInstance2.address,
        providerOrSigner: superSigner
      });

      // correct balance changes (down to 4 decimals)
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(origDTxBal).add(ethers.utils.parseUnits("1000")), // 1000 is expected borrow amount 
          ethers.BigNumber.from(newDTxBal).add(strDep), 
          4
        ) ) == true
      );

      // assert owner income is equal to user's outflow
      assert.equal(parseInt(randomUser2FlowRate), -parseInt(bankOwnerFlowRate.flowRate), "outflow != inflow");
      // assert bank net flow is zero
      assert.equal(bankNetFlow,"0", "non net-zero");

      // correct debt changes
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(
              await bankInstance2.connect(randomUser2).getReserveBalance() 
          ),
          ethers.BigNumber.from(ethers.utils.parseUnits("9000")),
          4
        ) ) == true
      );

      //// Update stream to borrow more

      // Interest rate payment of 10 DTx/year -> 500 DTx loan (10/2% = 500) -> -500 repay
      await sf.cfaV1.updateFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE,
      }).exec( randomUser2 );

      const newStrDep = await getStreamDeposit(TEN_ETH_PER_YEAR_FLOW_RATE, "wei");
      const newNewDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });

      // Interest rate payment of 20 DTx/year -> 1000 DTx loan (20/2% = 1000)
      await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
      // log flow rate changes
      await logFlows([randomUser2]);

      const newRandomUser2FlowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: randomUser2.address,
        providerOrSigner: superSigner
      });
      const newBankOwnerFlowRate = await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      });
      const newBankNetFlow = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: bankInstance2.address,
        providerOrSigner: superSigner
      });

      // correct balance changes (down to 2 decimals) - decrease of 500 (from 1000 to 500)
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(newDTxBal).add(strDep).sub(ethers.utils.parseUnits("500")), // 500 is expected borrow amount (prev 1000)
          ethers.BigNumber.from(newNewDTxBal).add(newStrDep), 
          4
        ) ) == true,
        "Incorrect loaned out amount change"
      );

      assert(
        ( await checkDebt(
            randomUser2,
            ethers.BigNumber.from(ethers.utils.parseUnits("500")),
            4
        ) ) == true,
        "Incorrect recorded debt amount"
      );

      // assert owner income is equal to user's outflow
      assert.equal(parseInt(newRandomUser2FlowRate), -parseInt(newBankOwnerFlowRate.flowRate), "outflow != inflow");
      // assert bank net flow is zero
      assert.equal(newBankNetFlow,"0", "non net-zero");

      // correct debt changes (should have increased by 500 from 9500)
      assert(
        ( await checkReserves(
          ethers.BigNumber.from(ethers.utils.parseUnits("9500")),
          4
        ) ) == true,
        "Incorrect reserve change"
      );

    })
  });

  context("update borrow checks", function () {

    beforeEach( async function () {

      // reserve deposit
      // start a borrow flow
      
    })

    xit("should not be able to borrow more if not enough reserves (caused by reserveWithdraw)", async function () {

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      // Admin reserve withdraws bank reserves
      await bankInstance2.connect(deployer).reserveWithdraw(ethers.utils.parseEther("9000"));

      // update flow to 30 DTx/year -> 1500 DTx (30/2% = 1500) -> 1500 - 1000 = 500 borrow
      try {
        await ( await sf.cfaV1.updateFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(3),
        }) ).exec( randomUser2 );
      } catch (e) {
        console.log("Errored out as expected - should not be able to repay if not enough debt tokens in reserve");
      }
    })

    xit("should not be able to borrow more if not enough reserves (caused by other borrowers)", async function () {

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      // User 3 borrows a lot so there's none left for borrowing
      // start flow of 180 DTx/year -> 9000 DTx (180/2% = 9000) -> +9000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(18),
      }) ).exec( randomUser3 );

      // update flow to 30 DTx/year -> 1500 DTx (30/2% = 1500) -> 1500 - 1000 = 500 borrow
      try {
        await ( await sf.cfaV1.updateFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(3),
        }) ).exec( randomUser2 );
      } catch (e) {
        console.log("Errored out as expected - should not be able to repay if not enough debt tokens in reserve");
      }
    })

    xit("should be able to borrow correct amount", async function () {

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // Original DT balance (in gwei)
      const origDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });
      
      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      const strDep = await getStreamDeposit(TEN_ETH_PER_YEAR_FLOW_RATE.mul(2), "wei");
      const newDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });

      // log balances
      await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
      // log flow rate changes
      await logFlows([randomUser2]);

      const randomUser2FlowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: randomUser2.address,
        providerOrSigner: superSigner
      });
      const bankOwnerFlowRate = await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      });
      const bankNetFlow = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: bankInstance2.address,
        providerOrSigner: superSigner
      });

      // correct balance changes (down to 4 decimals)
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(origDTxBal).add(ethers.utils.parseUnits("1000")), // 1000 is expected borrow amount 
          ethers.BigNumber.from(newDTxBal).add(strDep), 
          4
        ) ) == true,
        "Incorrect loaned out amount change"
      );

      // assert owner income is equal to user's outflow
      assert.equal(parseInt(randomUser2FlowRate), -parseInt(bankOwnerFlowRate.flowRate), "outflow != inflow");
      // assert bank net flow is zero
      assert.equal(bankNetFlow,"0", "non net-zero");

      // correct debt changes
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(
              await bankInstance2.connect(randomUser2).getReserveBalance() 
          ),
          ethers.BigNumber.from(ethers.utils.parseUnits("9000")),
          4
        ) ) == true,
        "Incorrect reserve change"
      );

      //// Update stream to borrow more

      // Interest rate payment of 30 DTx/year -> 1500 DTx loan (30/2% = 1500)
      await sf.cfaV1.updateFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(3),
      }).exec( randomUser2 );

      const newStrDep = await getStreamDeposit(TEN_ETH_PER_YEAR_FLOW_RATE.mul(3), "wei");
      const newNewDTxBal = await dtInstance2x.balanceOf({
        account: randomUser2.address,
        providerOrSigner: randomUser2
      });

      // Interest rate payment of 20 DTx/year -> 1000 DTx loan (20/2% = 1000)
      await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
      // log flow rate changes
      await logFlows([randomUser2]);

      const newRandomUser2FlowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: randomUser2.address,
        providerOrSigner: superSigner
      });
      const newBankOwnerFlowRate = await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      });
      const newBankNetFlow = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: bankInstance2.address,
        providerOrSigner: superSigner
      });

      // correct balance changes (down to 4 decimals) - increase of 500 (from 1000 to 1500)
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(newDTxBal).add(strDep).add(ethers.utils.parseUnits("500")), // 1500 is expected borrow amount (prev 1000)
          ethers.BigNumber.from(newNewDTxBal).add(newStrDep), 
          4
        ) ) == true,
        "Incorrect loaned out amount change"
      );

      // assert owner income is equal to user's outflow
      assert.equal(parseInt(newRandomUser2FlowRate), -parseInt(newBankOwnerFlowRate.flowRate), "outflow != inflow");
      // assert bank net flow is zero
      assert.equal(newBankNetFlow,"0", "non net-zero");

      // correct debt changes (should have fallen by 500 from 9000)
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(
              await bankInstance2.connect(randomUser2).getReserveBalance() 
          ),
          ethers.BigNumber.from(ethers.utils.parseUnits("8500")),
          4
        ) ) == true,
        "Incorrect reserve change"
      );

    })

  })

  context("delete checks", function () {

    beforeEach( async function () {

      // reserve deposit
      // start a borrow flow
      
    })

    it("should face liquidation if not enough allowance", async function () {

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // User approves bank to pull debt tokens for repay
      // const dtxApproveOperation = await dtInstance2x.approve({
      //   receiver: bankInstance2.address,
      //   amount: ethers.utils.parseEther("100000000000000000000000").toString()
      // });
      // await dtxApproveOperation.exec( randomUser2 );

      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      // log balances
      await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
      // log flow rate changes
      await logFlows([randomUser2]);

      // Delete flow
      await ( await sf.cfaV1.deleteFlow({
        sender: randomUser2.address,
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address
      }) ).exec( randomUser2 );

      // log balances
      await logTokenBalances([randomUser2, deployer], ["User 2", "Admin"]);
      // log flow rate changes
      await logFlows([randomUser2]);


      console.log("App jailed?",await sf.host.hostContract.connect(deployer).isAppJailed(bankInstance2.address));
      

    })

    xit("should face liquidation if not enough balance")

    xit("should be able to repay proper amounts")
      // correct balance changes
      // correct flow rate changes
      // correct reserve balance changes
      // correct debt changes

  });



});