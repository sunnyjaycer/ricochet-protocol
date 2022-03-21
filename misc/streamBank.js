const { web3tx, toWad, wad4human } = require("@decentral.ee/web3-helpers");

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

const erc20Token = artifacts.require("ERC20.sol");
const TradeableFlow = artifacts.require("TradeableFlow.sol");

const traveler = require("ganache-time-traveler");
const { assert } = require("hardhat");
const ONE_DAY = 3600 * 24;
const ONE_HOUR = 3600;
const ONE_MINUTE = 60;
const TO_GWEI = 10**18;

describe("TradeableFlow", function () {

  let accounts;

  before(async function () {
      accounts = await web3.eth.getAccounts();
  });
  
  const errorHandler = (err) => {
      if (err) throw err;
  };

  const names = ["Admin", "Alice", "Bob", "Carol", "Dan", "Emma", "Frank"];
  const tokens = ["fUSDC"]

  let sf;
  let app;
  const token_directory = {}  // token => regulartoken, supertoken
  const user_directory = {};  // alias => sf.user
  const alias_directory = {}; // address => alias

  alias_directory[`0x0000000000000000000000000000000000000000`] = "-----"

  before(async function () {
      //process.env.RESET_SUPERFLUID_FRAMEWORK = 1;
      // Deploy SuperFluid test framework
      await deployFramework(errorHandler, {
          web3,
          from: accounts[0],
      });
  });

  beforeEach(async function () {
      for (var i = 0; i < tokens.length; i++) {
          // Deploy ERC20 token
          await deployTestToken(errorHandler, [":", tokens[i]], {
              web3,
              from: accounts[0],
          });
          // Deploy SuperToken
          await deploySuperToken(errorHandler, [":", tokens[i]], {
              web3,
              from: accounts[0],
          });
      }

      // Deploy and Initialize Superfluid JS SDK framework with token
      sf = new SuperfluidSDK.Framework({
          web3,
          version: "test",
          tokens: tokens,
      });
      await sf.initialize();

      for (var i = 0; i < tokens.length; i++) {
          
          token_directory[tokens[i]] = {}
          token_directory[tokens[i]]['supertoken'] = sf.tokens[tokens[i]+"x"]
          token_directory[tokens[i]]['regulartoken'] = await sf.contracts.TestToken.at(await sf.tokens[tokens[i]].address)

      }

      // Constructing a user dictionary with the below mapping of aliases to Superfluid user objects
      // Constructing a alias diction with the mapping of addresses to aliases
      for (var i = 0; i < names.length; i++) {
          user_directory[names[i].toLowerCase()] = accounts[i];
          // user_directory[names[i].toLowerCase()].alias = names[i];
          alias_directory[user_directory[names[i].toLowerCase()]] = names[i];
          console.log(names[i],"|",accounts[i])

      }

      for (var i = 0; i < tokens.length; i++) {
          // Mint 100000000 regulartokens for each user 
          // Approving reception of supertokens for each user
          for (const [, user] of Object.entries(user_directory)) {
              if (alias_directory[user] === "App") return;
              await web3tx(token_directory[tokens[i]]['regulartoken'].mint, `${alias_directory[user]} mints many ${tokens[i]}`)(
                  user,
                  toWad(100000000),
                  {     
                      from: user,
                  }
              );
              await web3tx(token_directory[tokens[i]]['regulartoken'].approve, `${alias_directory[user]} approves ${tokens[i]}x`)(
                  token_directory[tokens[i]]['supertoken'].address,
                  toWad(100000000),
                  {
                      from: user,
                  }
              );

              checkTokenBalance(user,token_directory[tokens[i]]['regulartoken'])
          }

          console.log(tokens[i]+"x","|",token_directory[tokens[i]]['supertoken'].address);
      }

      //u.zero = { address: ZERO_ADDRESS, alias: "0x0" };
      console.log("Admin:", user_directory.admin);
      console.log("Host:", sf.host.address);
      console.log("CFA:", sf.agreements.cfa.address);

      // Mint "USDC" token
      usdc = await erc20Token.new(
          "US Dollar Coin",
          "USDC",
          {from:user_directory.alice}
      )
      
      console.log("$usdc Address:",usdc.address)
      console.log(`$usdc balance for Alice is ${await usdc.balanceOf(user_directory.alice)}`)

      // Deploy TradeableFlow contract
      app = await TradeableFlow.new(
          user_directory.admin,
          "SuperCard",
          "SC",
          "ipfs://",                                          // Base URI
          token_directory["fUSDC"]["supertoken"].address,
          usdc.address,
          130000,
          toWad(2000),
          sf.host.address,
          sf.agreements.cfa.address,
          ""
      );

      // Create user directory record for TradeableFlow contract
      user_directory.app = app.address

  });
});