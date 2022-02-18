/* eslint-disable no-await-in-loop */
const {
    web3tx,
    toWad,
    wad4human,
    fromDecimals,
    BN,
  } = require('@decentral.ee/web3-helpers');
  const {
    numberToHex,
  } = require('web3-utils');
  const {
    expect,
  } = require('chai');
  const { time } = require('@openzeppelin/test-helpers');
  const axios = require('axios').default;
  const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework');
  const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token');
  const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token');
  const SuperfluidSDK = require('@superfluid-finance/js-sdk');
  const traveler = require('ganache-time-traveler');
  const SuperfluidGovernanceBase = require('./artifacts/superfluid/SuperfluidGovernanceII.json');
  
  const TEST_TRAVEL_TIME = 3600 * 2; // 1 hours
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  async function impersonateAccount(account) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [account],
    });
  }
  
  async function setBalance(account, balance) {
    const hexBalance = numberToHex(toWad(balance));
    await hre.network.provider.request({
      method: 'hardhat_setBalance',
      params: [
        account,
        hexBalance,
      ],
    });
  }
  async function impersonateAndSetBalance(account) {
    await impersonateAccount(account);
    await setBalance(account, 10000);
  }
  
  async function createSFRegistrationKey(sf, deployer) {
    const registrationKey = `testKey-${Date.now()}`;
    const appKey = web3.utils.sha3(
      web3.eth.abi.encodeParameters(
        ['string', 'address', 'string'],
        [
          'org.superfluid-finance.superfluid.appWhiteListing.registrationKey',
          deployer,
          registrationKey,
        ],
      ),
    );
  
    const governance = await sf.host.getGovernance.call();
    console.log(`SF Governance: ${governance}`);
  
    const sfGovernanceRO = await ethers
      .getContractAt(SuperfluidGovernanceBase.abi, governance);
  
    const govOwner = await sfGovernanceRO.owner();
    await impersonateAndSetBalance(govOwner);
  
    const sfGovernance = await ethers
      .getContractAt(SuperfluidGovernanceBase.abi, governance, await ethers.getSigner(govOwner));
  
    console.log("test1")
    await sfGovernance.whiteListNewApp(sf.host.address, appKey);
    console.log("test2")

    return registrationKey;
  }
  
  describe('REXTwoWayMarket', () => {
    const errorHandler = (err) => {
      if (err) throw err;
    };
  
    const names = ['Admin', 'Alice', 'Bob', 'Carl', 'UsdcSpender', 'EthSpender'];
  
    let sf;
    let dai;
    let daix;
    let ethx;
    let wbtc;
    let wbtcx;
    let usd;
    let usdcx;
    let ric;
    let usdc;
    let eth;
    let weth;
    let app;
    let tp; // Tellor playground
    let usingTellor;
    let sr; // Mock Sushi Router
    const ricAddress = '0x263026e7e53dbfdce5ae55ade22493f828922965';
    const u = {}; // object with all users
    const aliases = {};
    let owner;
    let alice;
    let bob;
    let carl;
    let usdcSpender;
    let ethSpender;
    const SF_RESOLVER = '0xE0cc76334405EE8b39213E620587d815967af39C';
    const RIC_TOKEN_ADDRESS = '0x263026E7e53DBFDce5ae55Ade22493f828922965';
    const SUSHISWAP_ROUTER_ADDRESS = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
    const TELLOR_ORACLE_ADDRESS = '0xACC2d27400029904919ea54fFc0b18Bf07C57875';
    const TELLOR_ETH_REQUEST_ID = 1;
    const TELLOR_USDC_REQUEST_ID = 78;
    const COINGECKO_KEY = 'ethereum';
  
    // random address from polygonscan that have a lot of usdcx
    const USDCX_SOURCE_ADDRESS = '0x81ea02098336435d5e92e032c029aab850304f5d';
    const ETHX_SOURCE_ADDRESS = '0x0154d25120Ed20A516fE43991702e7463c5A6F6e';
    const WBTC_SOURCE_ADDRESS = '0x5c2ed810328349100A66B82b78a1791B101C9D61';
    const USDC_SOURCE_ADDRESS = '0x1a13f4ca1d028320a707d99520abfefca3998b7f';
    const OUTPUT_TOKEN_ADDRESS = '0xB63E38D21B31719e6dF314D3d2c351dF0D4a9162'; // IDLE
  
  
    const CARL_ADDRESS = '0x8c3bf3EB2639b2326fF937D041292dA2e79aDBbf';
    const BOB_ADDRESS = '0x00Ce20EC71942B41F50fF566287B811bbef46DC8';
    const ALICE_ADDRESS = '0x9f348cdD00dcD61EE7917695D2157ef6af2d7b9B';
    const OWNER_ADDRESS = '0x3226C9EaC0379F04Ba2b1E1e1fcD52ac26309aeA';
    const REPORTER_ADDRESS = '0xeA74b2093280bD1E6ff887b8f2fE604892EBc89f';
    let oraclePrice;
  
    const appBalances = {
      outputx: [],
      ethx: [],
      wbtcx: [],
      daix: [],
      usdcx: [],
      ric: [],
    };
    const ownerBalances = {
      outputx: [],
      ethx: [],
      wbtcx: [],
      daix: [],
      usdcx: [],
      ric: [],
    };
    const aliceBalances = {
      outputx: [],
      ethx: [],
      wbtcx: [],
      daix: [],
      usdcx: [],
      ric: [],
    };
    const bobBalances = {
      outputx: [],
      ethx: [],
      wbtcx: [],
      daix: [],
      usdcx: [],
      ric: [],
    };
    const carlBalances = {
      outputx: [],
      ethx: [],
      wbtcx: [],
      daix: [],
      usdcx: [],
      ric: [],
    };
  
    async function approveSubscriptions(
      users = [u.alice.address, u.bob.address, u.carl.address, u.admin.address],
      tokens = [usdcx.address, ethx.address],
    ) {
      // Do approvals
      // Already approved?
      console.log('Approving subscriptions...');
  
      for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
        for (let userIndex = 0; userIndex < users.length; userIndex += 1) {
          await web3tx(
            sf.host.callAgreement,
            `${users[userIndex]} approves subscription to the app ${tokens[tokenIndex]} ${tokenIndex}`,
          )(
            sf.agreements.ida.address,
            sf.agreements.ida.contract.methods
              .approveSubscription(tokens[tokenIndex], app.address, tokenIndex, '0x')
              .encodeABI(),
            '0x', // user data
            {
              from: users[userIndex],
            },
          );
        }
      }
      console.log('Approved.');
    }
  
    before(async () => {
      // ==============
      // impersonate accounts and set balances
  
      const accountAddrs = [OWNER_ADDRESS, ALICE_ADDRESS, BOB_ADDRESS, CARL_ADDRESS, USDCX_SOURCE_ADDRESS, ETHX_SOURCE_ADDRESS];
  
      accountAddrs.forEach(async (account) => {
        await impersonateAndSetBalance(account);
      });
  
      // ==============
      // get signers
      owner = await ethers.provider.getSigner(OWNER_ADDRESS);
      reporter = await ethers.provider.getSigner(REPORTER_ADDRESS);
      alice = await ethers.provider.getSigner(ALICE_ADDRESS);
      bob = await ethers.provider.getSigner(BOB_ADDRESS);
      carl = await ethers.provider.getSigner(CARL_ADDRESS);
      usdcSpender = await ethers.provider.getSigner(USDCX_SOURCE_ADDRESS);
      ethSpender = await ethers.provider.getSigner(ETHX_SOURCE_ADDRESS);
      const accounts = [owner, alice, bob, carl, usdcSpender, ethSpender];
  
      // ==============
      // Init Superfluid Framework
  
      sf = new SuperfluidSDK.Framework({
        web3,
        resolverAddress: SF_RESOLVER,
        tokens: ['WBTC', 'DAI', 'USDC', 'ETH'],
        version: 'v1',
      });
      await sf.initialize();
      ethx = sf.tokens.ETHx;
      wbtcx = sf.tokens.WBTCx;
      daix = sf.tokens.DAIx;
      usdcx = sf.tokens.USDCx;
  
      // ==============
      // Init SF users
  
      for (let i = 0; i < names.length; i += 1) {
        // Bob will be the ETHx streamer
        if (names[i].toLowerCase() == "bob") {
          u[names[i].toLowerCase()] = sf.user({
            address: accounts[i]._address || accounts[i].address,
            token: ethx.address,
          });
        } else {
          u[names[i].toLowerCase()] = sf.user({
            address: accounts[i]._address || accounts[i].address,
            token: usdcx.address,
          });
        }
  
        u[names[i].toLowerCase()].alias = names[i];
        aliases[u[names[i].toLowerCase()].address] = names[i];
      }
  
      // ==============
      // NOTE: Assume the oracle is up to date
      // Deploy Tellor Oracle contracts
  
      const TellorPlayground = await ethers.getContractFactory('TellorPlayground');
      tp = await TellorPlayground.attach(TELLOR_ORACLE_ADDRESS);
      tp = tp.connect(owner);
  
      // ==============
      // Setup tokens
  
      const ERC20 = await ethers.getContractFactory('ERC20');
      ric = await ERC20.attach(RIC_TOKEN_ADDRESS);
      weth = await ERC20.attach(await ethx.getUnderlyingToken());
      wbtc = await ERC20.attach(await wbtcx.getUnderlyingToken());
      usdc = await ERC20.attach(await usdcx.getUnderlyingToken());
      ric = ric.connect(owner);
  
      // Attach alice to the SLP token
      outputx = ethx;
      output = await ERC20.attach(await outputx.getUnderlyingToken());
  
  
    });
  
    beforeEach(async () => {
      // ==============
      // Deploy REX Market
  
      const REXTwoWayMarket = await ethers.getContractFactory('REXTwoWayMarket', {
        signer: owner,
      });
  
      const registrationKey = await createSFRegistrationKey(sf, u.admin.address);
  
      console.log('Deploying REXTwoWayMarket...');
      app = await REXTwoWayMarket.deploy(
        u.admin.address,
        sf.host.address,
        sf.agreements.cfa.address,
        sf.agreements.ida.address,
        registrationKey);
  
      console.log('Deployed REXTwoWayMarket');
  
      await app.initializeTwoWayMarket(
        SUSHISWAP_ROUTER_ADDRESS,
        TELLOR_ORACLE_ADDRESS,
        usdcx.address,
        TELLOR_USDC_REQUEST_ID,
        ethx.address,
        TELLOR_ETH_REQUEST_ID,
        20000,
        20000
      )
  
  
  
      u.app = sf.user({
        address: app.address,
        token: outputx.address,
      });
      u.app.alias = 'App';
      // ==============
      // Get actual price
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids='+COINGECKO_KEY+'&vs_currencies=usd');
      oraclePrice = parseInt(response.data[COINGECKO_KEY].usd * 1000000).toString();
      console.log('oraclePrice', oraclePrice);
      await tp.submitValue(TELLOR_ETH_REQUEST_ID, oraclePrice);
      await tp.submitValue(TELLOR_USDC_REQUEST_ID, 1000000);
  
    });
  
    async function checkBalance(user) {
      console.log('Balance of ', user.alias);
      console.log('usdcx: ', (await usdcx.balanceOf(user.address)).toString());
      console.log('ethx: ', (await ethx.balanceOf(user.address)).toString());
    }
  
    async function delta(account, balances) {
      const len = balances.ethx.length;
      const changeInOutToken = balances.ethx[len - 1] - balances.ethx[len - 2];
      const changeInInToken = balances.usdcx[len - 1] - balances.usdcx[len - 2];
      console.log();
      console.log('Change in balances for ', account);
      console.log('ethx:', changeInOutToken, 'Bal:', balances.ethx[len - 1]);
      console.log('Usdcx:', changeInInToken, 'Bal:', balances.usdcx[len - 1]);
      return {
        ethx: changeInOutToken,
        usdcx: changeInInToken,
      }
    }
  
    async function takeMeasurements() {
  
      appBalances.ethx.push((await ethx.balanceOf(app.address)).toString());
      ownerBalances.ethx.push((await ethx.balanceOf(u.admin.address)).toString());
      aliceBalances.ethx.push((await ethx.balanceOf(u.alice.address)).toString());
      carlBalances.ethx.push((await ethx.balanceOf(u.carl.address)).toString());
      bobBalances.ethx.push((await ethx.balanceOf(u.bob.address)).toString());
  
      appBalances.usdcx.push((await usdcx.balanceOf(app.address)).toString());
      ownerBalances.usdcx.push((await usdcx.balanceOf(u.admin.address)).toString());
      aliceBalances.usdcx.push((await usdcx.balanceOf(u.alice.address)).toString());
      carlBalances.usdcx.push((await usdcx.balanceOf(u.carl.address)).toString());
      bobBalances.usdcx.push((await usdcx.balanceOf(u.bob.address)).toString());
  
      appBalances.ric.push((await ric.balanceOf(app.address)).toString());
      ownerBalances.ric.push((await ric.balanceOf(u.admin.address)).toString());
      aliceBalances.ric.push((await ric.balanceOf(u.alice.address)).toString());
      carlBalances.ric.push((await ric.balanceOf(u.carl.address)).toString());
      bobBalances.ric.push((await ric.balanceOf(u.bob.address)).toString());
    }

    describe('Superfluid Sandbox', async () => {

        it('amount streamed', async function () {
            console.log("about to exec flow")
            await sf.cfa.createFlow({
                superToken:   ethx.address, 
                sender:       u.alice,
                receiver:     u.app,
                flowRate:     "1000"
            });
    
            await increaseTime(3600);
    
            console.log("checking balance of account after 1 hour")

            await takeMeasurements()

            console.log(aliceBalances)

        })
        
    });
});