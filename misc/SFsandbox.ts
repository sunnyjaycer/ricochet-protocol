import { setup, IUser, ISuperToken } from "../misc/setup";
import { common } from "../misc/common";
import { waffle, ethers } from "hardhat";
import { expect } from "chai";
import axios from "axios";
import { Framework } from "@superfluid-finance/sdk-core";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  getSeconds,
  increaseTime,
  impersonateAccounts,
} from "../misc/helpers";
const { loadFixture } = waffle;
const {
  web3tx,
  toWad,
  wad4human,
  fromDecimals,
  BN,
} = require("@decentral.ee/web3-helpers");

let sf: Framework,
  superT: ISuperToken,
  u: { [key: string]: IUser },
  app: any,
  tokenss: { [key: string]: any },
  sfRegistrationKey: any,
  accountss: SignerWithAddress[],
  constant: { [key: string]: string },
  tp: any,
  approveSubscriptions: any,
  ERC20: any;

describe("RexOneWayMarket", function () {
    beforeEach(async () => {
      const {
        superfluid,
        users,
        accounts,
        tokens,
        superTokens,
        contracts,
        constants,
        tellor,
      } = await setup();
  
      const { createSFRegistrationKey } = await common();
  
      u = users;
      sf = superfluid;
      superT = superTokens;
      tokenss = tokens;
      accountss = accounts;
      sfRegistrationKey = createSFRegistrationKey;
      constant = constants;
      tp = tellor;
      console.log("here1")

      // ERROR IS HERE IN COMMON.TS
      const registrationKey = await sfRegistrationKey(sf, accountss[0].address);
      console.log("here1")

      const REXMarketFactory = await ethers.getContractFactory(
        "REXOneWayMarket",
        {signer:accountss[0]}
      );
      console.log("here1")

      app = await REXMarketFactory.deploy(
        u.admin.address,
        sf.host.hostContract.address,
        constant.IDA_SUPERFLUID_ADDRESS,
        constant.CFA_SUPERFLUID_ADDRESS,
        registrationKey
      );
      console.log("here1")

      await app.initializeOneWayMarket(
        constant.SUSHISWAP_ROUTER_ADDRESS,
        constant.TELLOR_ORACLE_ADDRESS,
        superT.usdcx.address,
        20000,
        constant.TELLOR_USDC_REQUEST_ID,
        superT.ethx.address,
        20000,
        constant.TELLOR_ETH_REQUEST_ID
      );
      console.log("here1")

      await app.addOutputPool(constant.RIC_TOKEN_ADDRESS, 0, 1000000000, 77);
      console.log("here1")

      u.app = {
        address: app.address,
        token: superT.wbtcx.address,
        alias: "App",
      };
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=wrapped-bitcoin&vs_currencies=usd"
      );
      console.log("here1")

      let oraclePrice: any = (
        parseInt(response.data["wrapped-bitcoin"].usd, 10) *
        1.02 *
        1000000
      ).toString();
      oraclePrice = parseInt(oraclePrice);
      console.log("oraclePrice", oraclePrice);
      await tp.submitValue(constant.TELLOR_ETH_REQUEST_ID, oraclePrice);
      await tp.submitValue(constant.TELLOR_USDC_REQUEST_ID, 1000000);
    });

    it('amount streamed', async function () {
        console.log("about to exec flow")
        const txnResponse = await sf.cfaV1
        .createFlow({
          sender: u.admin.address,
          receiver: u.app.address,
          superToken: superT.usdcx.address,
          flowRate: "100000",
        })
        .exec(accountss[0]);

        await increaseTime(3600);

        console.log("checking balance of account after 1 hour")
        console.log(
            await superT.usdcx.balanceOf({
                account: u.app.address,
                providerOrSigner: accountss[0],
            })
        );
        
    })


});