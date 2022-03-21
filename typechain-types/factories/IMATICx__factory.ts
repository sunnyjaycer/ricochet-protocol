/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IMATICx, IMATICxInterface } from "../IMATICx";

const _abi = [
  {
    inputs: [],
    name: "upgradeByETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export class IMATICx__factory {
  static readonly abi = _abi;
  static createInterface(): IMATICxInterface {
    return new utils.Interface(_abi) as IMATICxInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IMATICx {
    return new Contract(address, _abi, signerOrProvider) as IMATICx;
  }
}
