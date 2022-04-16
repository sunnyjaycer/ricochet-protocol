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
  const COLLATERALIZATION_RATIO = 150;
  const LIQUIDATION_PENALTY = 25;
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
  let bankFactoryOwnerUser: SignerWithAddress;
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
      randomUser7, randomUser8, bankFactoryOwnerUser] = await ethers.getSigners();
    user_directory[deployer.address] = "Admin";
    user_directory[randomUser.address] = "randomUser";
    user_directory[randomUser2.address] = "randomUser2";
    user_directory[randomUser3.address] = "randomUser3";
    user_directory[randomUser4.address] = "randomUser4";
    user_directory[randomUser5.address] = "randomUser5";
    user_directory[randomUser6.address] = "randomUser6";
    user_directory[randomUser7.address] = "randomUser7";
    user_directory[randomUser8.address] = "randomUser8";
    user_directory[bankFactoryOwnerUser.address] = "bankFactoryOwnerUser";

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
    ctInstance2 = await CT2.connect(deployer).deploy(ethers.utils.parseUnits("100000000000000000000"));
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

    await bankInstance2.connect(deployer).init(deployer.address, BANK_NAME, INTEREST_RATE,
      COLLATERALIZATION_RATIO, LIQUIDATION_PENALTY, randomUser6.address, TELLOR_ORACLE_ADDRESS);
    await bankInstance2.setDebt(dtInstance2x.address, 1, 1000, 1000);
    await bankInstance2.setCollateral(ctInstance2.address, 2, 1000, 1000);
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
    console.log("Bank Owner:", await bankInstance2.connect(deployer).owner());

    console.log("+++++++++++++ SET UP COMPLETE +++++++++++++")

    await setTokenBalances1();

  })

  beforeEach(async function () {


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

      // users and admin upgrade 20,000 tokens
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

      // Users approve bank for spending of collateral tokens
      await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
      await ctInstance2.connect(randomUser3).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
      await ctInstance2.connect(randomUser4).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));

      await logTokenBalances([randomUser2, randomUser3, randomUser4, deployer]);
      
      console.log("+++++++++++++ TOKEN BALANCES SET ++++++++++++");
  }

  /**
   * resets a users token balance to 20k for either collateral token or debt super token
   * @param user The signer that's having balance reset
   * @param token "super debt token" || "collateral token"
   */
  async function resetTokenBalance(user:SignerWithAddress, token:string) {
    if (token == "super debt token") {
      // get difference from target and current
      let currentDebtXBalance = await dtInstance2x.balanceOf({
        account: user.address,
        providerOrSigner: deployer
      })
      // negative -> over 20K | positive -> under 20K
      let debtXDiff = ethers.BigNumber.from(ethers.utils.parseEther("20000")).sub(ethers.BigNumber.from(currentDebtXBalance));
      if ( debtXDiff.gt(ethers.BigNumber.from("0")) ) { // if there's a deficit
        // mint and upgrade to the user
        await dtInstance2.connect(deployer).mint(user.address, debtXDiff.toString());
        const dtUpgradeOperation = dtInstance2x.upgrade({
          amount: debtXDiff.toString()
        });
        await dtUpgradeOperation.exec(user);
      } else if ( debtXDiff.lt(ethers.BigNumber.from("0")) ) { // if there's an excess
        // transfer them to randomUser (garbage account)
        const excessTransfer = dtInstance2x.transfer({
          receiver: randomUser.address,
          amount: (debtXDiff.mul(-1)).toString()
        })
        await excessTransfer.exec(user)
      }
    } else if (token == "collateral token") {
      // get difference from target and current
      let currentCollatBalance = await ctInstance2.connect(user).balanceOf(user.address);
      // if collatDiff positive: less collateral tokens than necessary
      // if collatDiff negative: more collateral tokens than necessary
      let collatDiff = ethers.BigNumber.from(ethers.utils.parseEther("20000")).sub(ethers.BigNumber.from(currentCollatBalance));

      if ( collatDiff.gt(ethers.BigNumber.from("0")) ) { 
        // mint tokens to the user to bridge deficit
        await ctInstance2.connect(user).mint(collatDiff.toString());
      } else if ( collatDiff.lt(ethers.BigNumber.from("0")) ) {
        // if there is more collat tokens than necessary, transfer them to randomUser (garbage account)
        await ctInstance2.connect(user).transfer(randomUser.address, (collatDiff.mul(-1)).toString());
      }
    }
  }

  async function backToBaseState(users:any[]) {
    console.log("+++++++++++++ RESETTING STATE ++++++++++++");
    
    // loop through users
    for (let i = 0; i < users.length; ++i) {
      // reset debt token balance to 20k
      await resetTokenBalance(users[i], "super debt token");

      // set max approval for repay of loan
      const dtxApproveOperation = dtInstance2x.approve({
        receiver: bankInstance2.address,
        amount: ethers.utils.parseEther("1000000000000000000000").toString()
      });
      await dtxApproveOperation.exec(users[i]);

      // see if flow to bank is positive and delete flow if so
      const userFlowRate = await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: users[i].address,
        receiver: bankInstance2.address,
        providerOrSigner: superSigner
      });
      if (parseInt(userFlowRate.flowRate) > 0) {
        await ( await sf.cfaV1.deleteFlow({
          sender: users[i].address,
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address
        }) ).exec( users[i] );
      }

      // vault withdraw all collateral (all users except deployer)
      if ( users[i] != deployer ) {
        await bankInstance2.connect(users[i]).vaultWithdraw(await bankInstance2.connect(users[i]).getVaultCollateralAmount());
      }

      // reset collateral and debt balance
      await resetTokenBalance(users[i], "collateral token");
      await resetTokenBalance(users[i], "super debt token");

      // set approval back to zero if not admin
      if (users[i].address != deployer.address) {
        const dtxDisapproveOperation = dtInstance2x.approve({
          receiver: bankInstance2.address,
          amount: ethers.utils.parseEther("0").toString()
        });
        await dtxDisapproveOperation.exec(users[i]);
      }

    }

    // deployer withdraws liquidity and has token balance reset
    await bankInstance2.connect(deployer).reserveWithdraw(await bankInstance2.connect(deployer).getReserveBalance());
    await resetTokenBalance(deployer, "super debt token");

    // assert bank netflow is zero
    expect( await sf.cfaV1.getNetFlow({
      superToken: dtInstance2x.address,
      account: bankInstance2.address,
      providerOrSigner: superSigner
    }) ).to.equal("0")

    // sweep all randomUser6 (bankFactoryOwner) balances to randomUser (trash account)
    await ctInstance2.connect(randomUser6).transfer(randomUser.address, await ctInstance2.connect(randomUser6).balanceOf(randomUser6.address));

    let toLog = users;
    toLog.push(bankInstance2);
    await logTokenBalances(toLog);
    await logFlows([randomUser2,randomUser3]);

    console.log("+++++++++++++ STATE RESET ✅ ++++++++++++");

  }

  async function logTokenBalances(user:any[]) {
    console.log("===== Token Balances ====="); 
    for (let i = 0; i < user.length; ++i) {
      if (user[i].address == bankInstance2.address ) {
        console.log("rexBank");
      } else {
        console.log(user_directory[ user[i].address ]);
      }
      console.log("    Collateral Token Balance: ", parseInt( await ctInstance2.connect(deployer).balanceOf(user[i].address))/(10**18) );
      console.log("    Debt Token Balance: ", parseInt( await dtInstance2.connect(deployer).balanceOf(user[i].address) )/(10**18) );
      console.log("    Debt Super Token Balance: ", 
        parseInt( await dtInstance2x.balanceOf({
          account: user[i].address,
          providerOrSigner: deployer
        }) )/(10**18)
      );
    }
    console.log("==========================\n");
  }

  async function logNetflowForEntities(user:SignerWithAddress[]) {
    console.log("===== Netflow Rates ====="); 
    for (let i = 0; i < user.length; ++i) {
      const flowRate = await sf.cfaV1.getNetFlow({
        superToken: dtInstance2x.address,
        account: user[i].address,
        providerOrSigner: superSigner
      });
      console.log(user_directory[ user[i].address ], "Net Flow Rate: ", flowRate);
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

  // kinda lost its purpose after I discovered closeTo
  async function closeEnough(x:BigNumber, y:BigNumber, precision:number) {
    return parseFloat(ethers.utils.formatUnits(x)).toFixed(precision) == parseFloat(ethers.utils.formatUnits(y)).toFixed(precision);
  }

  xit('SF happy path', async function () {

    // approve DTx to transfer DT
    await dtInstance2.connect(randomUser2).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
    await dtInstance2.connect(deployer).approve(dtInstance2x.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));

    // Admin and user approves bank to spend debt super token for reserve deposit and repayment respectively
    const dtxApproveOperation = dtInstance2x.approve({
      receiver: bankInstance2.address,
      amount: ethers.utils.parseEther("10000000000000000000000000000000000000").toString()
    });
    await dtxApproveOperation.exec(deployer);
    await dtxApproveOperation.exec(randomUser2);

    // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
    await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

    await logTokenBalances([randomUser2, deployer]);

    // User approves spending of collateral token and debt token by bank contract
    await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));
    await ctInstance2.connect(randomUser2).approve(bankInstance2.address, ethers.utils.parseEther("10000000000000000000000000000000000000"));

    // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
    await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

    await logTokenBalances([randomUser2, deployer]);

    console.log("Starting off with borrow:")
    // User starts stream of 20 dtInstance2x/year to bank
    await ( await sf.cfaV1.createFlow({
      receiver: bankInstance2.address,
      superToken: dtInstance2x.address,
      flowRate: "634195839675",
    }) ).exec( randomUser2 );


    // Check balance of dtx in borrower
    console.log("1000 Borrow Amount should be reflected");
    await logTokenBalances([randomUser2, deployer]);
    await logFlows([deployer,randomUser2]);

    // Update stream to 10 dtInstance2x/year (repay 500 in debt)
    await ( await sf.cfaV1.updateFlow({
      receiver: bankInstance2.address,
      superToken: dtInstance2x.address,
      flowRate: "317097919837",
    }) ).exec( randomUser2 );

    // Check balance of dtx in borrower and bank
    console.log("500 repay should be reflected");
    await logTokenBalances([randomUser2, deployer]);
    await logFlows([deployer,randomUser2]);

    // Update stream to 40 dtInstance2x/year (borrow additional 1500)
    await ( await sf.cfaV1.updateFlow({
      receiver: bankInstance2.address,
      superToken: dtInstance2x.address,
      flowRate: "1268391679350",
    }) ).exec( randomUser2 );

    // Check balance of dtx in borrower and bank
    console.log("1500 extra borrow should be reflected");
    await logTokenBalances([randomUser2, deployer]);
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
    await logTokenBalances([randomUser2, deployer]);
    await logFlows([deployer,randomUser2]);

  });

  context("create borrow checks", function () {

    it("should not be able to borrow when no reserves are available", async function () {

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

      await backToBaseState([randomUser2, deployer]);

    })

    it("should not be able to borrow if not enough collateral", async function () {

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

      // User starts stream of 20 dtInstance2x/year to bank (borrow 1000) but should fail because there is not enough collateral
      try {
        await ( await sf.cfaV1.createFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: "634195839675",
        }) ).exec( randomUser2 );
      } catch (e) {
        console.log("Errored out as expected - should not be able to borrow if not enough collateral");
      }

      await backToBaseState([randomUser2, deployer]);

    })

    it("should be able to borrow correct amount", async function () {

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
      await logTokenBalances([randomUser2, deployer]);
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

      await backToBaseState([randomUser2, deployer]);

    })

  });

  context("update repay checks", function () {

    it("should not be able to repay if not enough balance", async function () {

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
        receiver: randomUser.address,
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

      await backToBaseState([randomUser2, deployer]);

    });

    it("should not be able to repay if not enough allowance", async function () {
  
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

        await backToBaseState([randomUser2, deployer]);

    })
 
    it("should be able to repay proper amounts", async function () {

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
      await logTokenBalances([randomUser2, deployer]);
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
      console.log("Actual reserve balance",await bankInstance2.connect(randomUser2).getReserveBalance());
      console.log("Expected reserve balance",ethers.BigNumber.from(ethers.utils.parseUnits("9000")));
      assert(
        ( await closeEnough(
          ethers.BigNumber.from(
              await bankInstance2.connect(randomUser2).getReserveBalance() 
          ),
          ethers.BigNumber.from(ethers.utils.parseUnits("9000")),
          4
        ) ) == true,
        "Incorrect reserve balance!"
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
      await logTokenBalances([randomUser2, deployer]);
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

      await backToBaseState([randomUser2, deployer]);

    })
  });

  context("update borrow checks", function () {

    it("should not be able to borrow more if not enough reserves (caused by reserveWithdraw)", async function () {

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

      await backToBaseState([randomUser2, deployer]);

    })

    it("should not be able to borrow more if not enough reserves (caused by other borrowers)", async function () {

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // Disruptive user deposits 20000 worth of ctInstance2 
      await bankInstance2.connect(randomUser3).vaultDeposit(ethers.utils.parseEther("20000"));

      console.log("main user about to borrow");
      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      console.log("disruptive user about to borrow");
      // User 3 borrows a lot so there's none left for borrowing
      // start flow of 180 DTx/year -> 9000 DTx (180/2% = 9000) -> +9000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(18),
      }) ).exec( randomUser3 );

      console.log("entering try catch");
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

      await backToBaseState([randomUser2, randomUser3, deployer]);

    })

    it("should not be able to borrow more if not enough collateral (borrow into undercollateralization)", async function () {
      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("1500"));

      console.log("main user about to borrow");
      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      console.log("entering try catch");
      // update flow to 40 DTx/year -> 2000 DTx (40/2% = 2000) -> 2000 - 1000 = 1000 extra borrow
      try {
        await ( await sf.cfaV1.updateFlow({
          receiver: bankInstance2.address,
          superToken: dtInstance2x.address,
          flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(4),
        }) ).exec( randomUser2 );
      } catch (e) {
        console.log("Errored out as expected - should not be able to borrow into undercollateralization");
      }

      await backToBaseState([randomUser2, deployer]);
    });

    it("successful withdrawal while borrowing")
    // should be able to borrow less

    it("success deposit while borrowing - allow greater borrowing than initially")
      // should be able to borrow more

    it("should be able to borrow correct amount", async function () {

      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity

      // Original DT balance (in gwei)
      const origDTxBalv0 = await dtInstance2x.balanceOf({
        account: deployer.address,
        providerOrSigner: deployer
      });
      console.log("Balance of deployer before reserveDeposit", origDTxBalv0);

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
      await logTokenBalances([randomUser2, deployer]);
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
      await logTokenBalances([randomUser2, deployer]);
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

      await backToBaseState([randomUser2, deployer]);

    })

  })

  context("delete checks", function () {

    it("should face liquidation if not enough allowance", async function () {

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

      // log balances
      await logTokenBalances([randomUser2, deployer, bankInstance2]);
      // log flow rate changes
      await logFlows([randomUser2]);

      // Delete flow
      await ( await sf.cfaV1.deleteFlow({
        sender: randomUser2.address,
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address
      }) ).exec( randomUser2 );

      // log balances
      await logTokenBalances([randomUser2, deployer, bankInstance2]);
      // log flow rate changes
      await logFlows([randomUser2]);

      //// Liquidation checks

      // expect super app to not be jailed (shouldn't revert in deleteFlow callback)
      expect(await sf.host.hostContract.connect(deployer).isAppJailed(bankInstance2.address)).to.equal(false,"App is jailed!");

      // expect 25% liquidation penalty to be reflected in borrower's collateral amount state -> users collateral falls from 5000 to 5000 - (1000 * 1.25) = 3750
      expect(await bankInstance2.connect(randomUser2).getVaultCollateralAmount()).to.closeTo(ethers.utils.parseEther("3750"), ethers.utils.parseEther("0.0001"));

      // expect liquidated collateral to be transferred from bank to bankOwner (randomUser6) 1000 * 1.25 = 1250
      expect(await ctInstance2.connect(randomUser6).balanceOf(randomUser6.address)).to.closeTo(ethers.utils.parseEther("1250"), ethers.utils.parseEther("0.0001"));

      // expect owner revenue stream is zero
      expect( (await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      })).flowRate ).to.equal("0", "interest revenue stream not cancelled")

      // expect borrower payment stream is zero
      expect( (await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: randomUser2.address,
        receiver: bankInstance2.address,
        providerOrSigner: superSigner
      })).flowRate ).to.equal("0", "interest payment stream not cancelled")

      await backToBaseState([randomUser2,deployer]);

    })

    it("should face liquidation if not enough balance", async function () {
      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // User approves bank to pull debt tokens for repay
      const dtxApproveOperation = await dtInstance2x.approve({
        receiver: bankInstance2.address,
        amount: ethers.utils.parseEther("100000000000000000000000").toString()
      });
      await dtxApproveOperation.exec( randomUser2 );

      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      // log balances
      await logTokenBalances([randomUser2, deployer, bankInstance2]);
      // log flow rate changes
      await logFlows([randomUser2]);

      // User transfers away almost all his/her super tokens so there's nothing left for repay
      const dtxTransferOperation = dtInstance2x.transfer({
        receiver: bankFactoryOwnerUser.address,
        amount: ethers.utils.parseEther("20000").toString()
      });
      await dtxTransferOperation.exec( randomUser2 );

      // Delete flow
      await ( await sf.cfaV1.deleteFlow({
        sender: randomUser2.address,
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address
      }) ).exec( randomUser2 );

      // log balances
      await logTokenBalances([randomUser2, deployer, bankInstance2]);
      // log flow rate changes
      await logFlows([randomUser2]);

      //// Liquidation checks

      // expect super app to not be jailed (shouldn't revert in deleteFlow callback)
      expect(await sf.host.hostContract.connect(deployer).isAppJailed(bankInstance2.address)).to.equal(false,"App is jailed!");

      // expect 25% liquidation penalty to be reflected in borrower's collateral amount state -> users collateral falls from 5000 to 5000 - (1000 * 1.25) = 3750
      expect(await bankInstance2.connect(randomUser2).getVaultCollateralAmount()).to.closeTo(ethers.utils.parseEther("3750"), ethers.utils.parseEther("0.0001"));

      // expect liquidated collateral to be transferred from bank to bankOwner (randomUser6) 1000 * 1.25 = 1250
      expect(await ctInstance2.connect(randomUser6).balanceOf(randomUser6.address)).to.closeTo(ethers.utils.parseEther("1250"), ethers.utils.parseEther("0.0001"));

      // expect owner revenue stream is zero
      expect( (await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      })).flowRate ).to.equal("0", "interest revenue stream not cancelled")

      // expect borrower payment stream is zero
      expect( (await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: randomUser2.address,
        receiver: bankInstance2.address,
        providerOrSigner: superSigner
      })).flowRate ).to.equal("0", "interest payment stream not cancelled")

      await backToBaseState([randomUser2,deployer]);

    })

    it("should be able to repay proper amounts", async function () {
      // Admin deposits 10,000 dtInstance2x to bank as initial lending liquidity
      await bankInstance2.connect(deployer).reserveDeposit(ethers.utils.parseEther("10000"));

      // User depsits 5000 worth of ctInstance2 (at start, ctInstance2 is worth 1000, just as dtInstance2 is)
      await bankInstance2.connect(randomUser2).vaultDeposit(ethers.utils.parseEther("5000"));

      // User approves bank to pull debt tokens for repay
      const dtxApproveOperation = await dtInstance2x.approve({
        receiver: bankInstance2.address,
        amount: ethers.utils.parseEther("100000000000000000000000").toString()
      });
      await dtxApproveOperation.exec( randomUser2 );

      // start flow of 20 DTx/year -> 1000 DTx (20/2% = 1000) -> +1000 loan
      await ( await sf.cfaV1.createFlow({
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address,
        flowRate: TEN_ETH_PER_YEAR_FLOW_RATE.mul(2),
      }) ).exec( randomUser2 );

      // log balances
      await logTokenBalances([randomUser2, deployer, bankInstance2]);
      // log flow rate changes
      await logFlows([randomUser2]);

      // Delete flow
      await ( await sf.cfaV1.deleteFlow({
        sender: randomUser2.address,
        receiver: bankInstance2.address,
        superToken: dtInstance2x.address
      }) ).exec( randomUser2 );

      // log balances
      await logTokenBalances([randomUser2, deployer, bankInstance2]);
      // log flow rate changes
      await logFlows([randomUser2]);

      //// Assertions
      
      // User balance returns to original balance of 20k
      expect(await dtInstance2x.balanceOf({account:randomUser2.address,providerOrSigner:randomUser2})).to.closeTo(ethers.utils.parseEther("20000"),ethers.utils.parseEther("0.0001"),"incorrect user balance after repay");
      // Bank's balance returns to original balance of 10k
      expect(await dtInstance2x.balanceOf({account:bankInstance2.address,providerOrSigner:randomUser2})).to.closeTo(ethers.utils.parseEther("10000"),ethers.utils.parseEther("0.0001"),"banks actual liquidity incorrect");
      // Bank's recorded reserves are back at original balance of 10k
      expect(await bankInstance2.connect(deployer).getReserveBalance()).to.closeTo(ethers.utils.parseEther("10000"),ethers.utils.parseEther("0.0001"),"recorded reserve balance not restored");

      // expect owner revenue stream is zero
      expect( (await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: bankInstance2.address,
        receiver: randomUser6.address,
        providerOrSigner: superSigner
      })).flowRate ).to.equal("0", "interest revenue stream not cancelled")

      // expect borrower payment stream is zero
      expect( (await sf.cfaV1.getFlow({
        superToken: dtInstance2x.address,
        sender: randomUser2.address,
        receiver: bankInstance2.address,
        providerOrSigner: superSigner
      })).flowRate ).to.equal("0", "interest payment stream not cancelled")   
      
      await backToBaseState([randomUser2,deployer]);

    })

  });

  context("liquidation", function () {

    xit("basic liquidation", async function() {

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

      // set collateral token price down to a quarter of what it was (from 1000 to 250) (user's overall collateral value becomes 1250 while loan is 1000)
      // HELP! What am I missing here to set the collateralToken's price from 1000 to 250?
      
      // // requesting the token price
      // await web3.eth.sendTransaction({ to: TELLOR_ORACLE_ADDRESS, from: deployer.address, gas: 4000000, data: oracle.methods.requestData("GLD", "GLD/USD", 1000, 0).encodeABI() })
      // // submitting transaction to actually change price reported by Tellor
      // for (var i = 0; i <= 4; i++) {
      //   await web3.eth.sendTransaction({ to: TELLOR_ORACLE_ADDRESS, from: deployer.address, gas: 4000000, data: oracle.methods.submitMiningSolution("nonce", 2, 250).encodeABI() })
      // }
      // // Call update to set price in rexBank contract
      // await bankInstance2.updateCollateralPrice();

      // TODO: Liquidate and assert expectations

    });

  })



});