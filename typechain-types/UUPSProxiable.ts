/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface UUPSProxiableInterface extends utils.Interface {
  contractName: "UUPSProxiable";
  functions: {
    "getCodeAddress()": FunctionFragment;
    "proxiableUUID()": FunctionFragment;
    "updateCode(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getCodeAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "updateCode", values: [string]): string;

  decodeFunctionResult(
    functionFragment: "getCodeAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "updateCode", data: BytesLike): Result;

  events: {
    "CodeUpdated(bytes32,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CodeUpdated"): EventFragment;
}

export type CodeUpdatedEvent = TypedEvent<
  [string, string],
  { uuid: string; codeAddress: string }
>;

export type CodeUpdatedEventFilter = TypedEventFilter<CodeUpdatedEvent>;

export interface UUPSProxiable extends BaseContract {
  contractName: "UUPSProxiable";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: UUPSProxiableInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getCodeAddress(
      overrides?: CallOverrides
    ): Promise<[string] & { codeAddress: string }>;

    proxiableUUID(overrides?: CallOverrides): Promise<[string]>;

    updateCode(
      newAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  getCodeAddress(overrides?: CallOverrides): Promise<string>;

  proxiableUUID(overrides?: CallOverrides): Promise<string>;

  updateCode(
    newAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getCodeAddress(overrides?: CallOverrides): Promise<string>;

    proxiableUUID(overrides?: CallOverrides): Promise<string>;

    updateCode(newAddress: string, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "CodeUpdated(bytes32,address)"(
      uuid?: null,
      codeAddress?: null
    ): CodeUpdatedEventFilter;
    CodeUpdated(uuid?: null, codeAddress?: null): CodeUpdatedEventFilter;
  };

  estimateGas: {
    getCodeAddress(overrides?: CallOverrides): Promise<BigNumber>;

    proxiableUUID(overrides?: CallOverrides): Promise<BigNumber>;

    updateCode(
      newAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getCodeAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    proxiableUUID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateCode(
      newAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
