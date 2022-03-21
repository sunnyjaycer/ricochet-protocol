/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
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

export interface ISuperfluidTokenInterface extends utils.Interface {
  contractName: "ISuperfluidToken";
  functions: {
    "createAgreement(bytes32,bytes32[])": FunctionFragment;
    "getAccountActiveAgreements(address)": FunctionFragment;
    "getAgreementData(address,bytes32,uint256)": FunctionFragment;
    "getAgreementStateSlot(address,address,uint256,uint256)": FunctionFragment;
    "getHost()": FunctionFragment;
    "isAccountCritical(address,uint256)": FunctionFragment;
    "isAccountCriticalNow(address)": FunctionFragment;
    "isAccountSolvent(address,uint256)": FunctionFragment;
    "isAccountSolventNow(address)": FunctionFragment;
    "makeLiquidationPayouts(bytes32,address,address,uint256,uint256)": FunctionFragment;
    "realtimeBalanceOf(address,uint256)": FunctionFragment;
    "realtimeBalanceOfNow(address)": FunctionFragment;
    "settleBalance(address,int256)": FunctionFragment;
    "terminateAgreement(bytes32,uint256)": FunctionFragment;
    "updateAgreementData(bytes32,bytes32[])": FunctionFragment;
    "updateAgreementStateSlot(address,uint256,bytes32[])": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "createAgreement",
    values: [BytesLike, BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccountActiveAgreements",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAgreementData",
    values: [string, BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getAgreementStateSlot",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "getHost", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isAccountCritical",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isAccountCriticalNow",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "isAccountSolvent",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isAccountSolventNow",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "makeLiquidationPayouts",
    values: [BytesLike, string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "realtimeBalanceOf",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "realtimeBalanceOfNow",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "settleBalance",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "terminateAgreement",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "updateAgreementData",
    values: [BytesLike, BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "updateAgreementStateSlot",
    values: [string, BigNumberish, BytesLike[]]
  ): string;

  decodeFunctionResult(
    functionFragment: "createAgreement",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAccountActiveAgreements",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAgreementData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAgreementStateSlot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getHost", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isAccountCritical",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAccountCriticalNow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAccountSolvent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAccountSolventNow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "makeLiquidationPayouts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "realtimeBalanceOf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "realtimeBalanceOfNow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "settleBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "terminateAgreement",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateAgreementData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateAgreementStateSlot",
    data: BytesLike
  ): Result;

  events: {
    "AgreementAccountStateUpdated(address,address,bytes)": EventFragment;
    "AgreementCreated(address,bytes32,bytes32[])": EventFragment;
    "AgreementLiquidated(address,bytes32,address,address,uint256)": EventFragment;
    "AgreementLiquidatedBy(address,address,bytes32,address,address,uint256,uint256)": EventFragment;
    "AgreementStateUpdated(address,address,uint256)": EventFragment;
    "AgreementTerminated(address,bytes32)": EventFragment;
    "AgreementUpdated(address,bytes32,bytes32[])": EventFragment;
    "Bailout(address,uint256)": EventFragment;
  };

  getEvent(
    nameOrSignatureOrTopic: "AgreementAccountStateUpdated"
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AgreementCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AgreementLiquidated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AgreementLiquidatedBy"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AgreementStateUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AgreementTerminated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AgreementUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Bailout"): EventFragment;
}

export type AgreementAccountStateUpdatedEvent = TypedEvent<
  [string, string, string],
  { agreementClass: string; account: string; state: string }
>;

export type AgreementAccountStateUpdatedEventFilter =
  TypedEventFilter<AgreementAccountStateUpdatedEvent>;

export type AgreementCreatedEvent = TypedEvent<
  [string, string, string[]],
  { agreementClass: string; id: string; data: string[] }
>;

export type AgreementCreatedEventFilter =
  TypedEventFilter<AgreementCreatedEvent>;

export type AgreementLiquidatedEvent = TypedEvent<
  [string, string, string, string, BigNumber],
  {
    agreementClass: string;
    id: string;
    penaltyAccount: string;
    rewardAccount: string;
    rewardAmount: BigNumber;
  }
>;

export type AgreementLiquidatedEventFilter =
  TypedEventFilter<AgreementLiquidatedEvent>;

export type AgreementLiquidatedByEvent = TypedEvent<
  [string, string, string, string, string, BigNumber, BigNumber],
  {
    liquidatorAccount: string;
    agreementClass: string;
    id: string;
    penaltyAccount: string;
    bondAccount: string;
    rewardAmount: BigNumber;
    bailoutAmount: BigNumber;
  }
>;

export type AgreementLiquidatedByEventFilter =
  TypedEventFilter<AgreementLiquidatedByEvent>;

export type AgreementStateUpdatedEvent = TypedEvent<
  [string, string, BigNumber],
  { agreementClass: string; account: string; slotId: BigNumber }
>;

export type AgreementStateUpdatedEventFilter =
  TypedEventFilter<AgreementStateUpdatedEvent>;

export type AgreementTerminatedEvent = TypedEvent<
  [string, string],
  { agreementClass: string; id: string }
>;

export type AgreementTerminatedEventFilter =
  TypedEventFilter<AgreementTerminatedEvent>;

export type AgreementUpdatedEvent = TypedEvent<
  [string, string, string[]],
  { agreementClass: string; id: string; data: string[] }
>;

export type AgreementUpdatedEventFilter =
  TypedEventFilter<AgreementUpdatedEvent>;

export type BailoutEvent = TypedEvent<
  [string, BigNumber],
  { bailoutAccount: string; bailoutAmount: BigNumber }
>;

export type BailoutEventFilter = TypedEventFilter<BailoutEvent>;

export interface ISuperfluidToken extends BaseContract {
  contractName: "ISuperfluidToken";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ISuperfluidTokenInterface;

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
    createAgreement(
      id: BytesLike,
      data: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getAccountActiveAgreements(
      account: string,
      overrides?: CallOverrides
    ): Promise<[string[]] & { activeAgreements: string[] }>;

    getAgreementData(
      agreementClass: string,
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]] & { data: string[] }>;

    getAgreementStateSlot(
      agreementClass: string,
      account: string,
      slotId: BigNumberish,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]] & { slotData: string[] }>;

    getHost(overrides?: CallOverrides): Promise<[string] & { host: string }>;

    isAccountCritical(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean] & { isCritical: boolean }>;

    isAccountCriticalNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<[boolean] & { isCritical: boolean }>;

    isAccountSolvent(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean] & { isSolvent: boolean }>;

    isAccountSolventNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<[boolean] & { isSolvent: boolean }>;

    makeLiquidationPayouts(
      id: BytesLike,
      liquidator: string,
      penaltyAccount: string,
      rewardAmount: BigNumberish,
      bailoutAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    realtimeBalanceOf(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        availableBalance: BigNumber;
        deposit: BigNumber;
        owedDeposit: BigNumber;
      }
    >;

    realtimeBalanceOfNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        availableBalance: BigNumber;
        deposit: BigNumber;
        owedDeposit: BigNumber;
        timestamp: BigNumber;
      }
    >;

    settleBalance(
      account: string,
      delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    terminateAgreement(
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateAgreementData(
      id: BytesLike,
      data: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateAgreementStateSlot(
      account: string,
      slotId: BigNumberish,
      slotData: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  createAgreement(
    id: BytesLike,
    data: BytesLike[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getAccountActiveAgreements(
    account: string,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getAgreementData(
    agreementClass: string,
    id: BytesLike,
    dataLength: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getAgreementStateSlot(
    agreementClass: string,
    account: string,
    slotId: BigNumberish,
    dataLength: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getHost(overrides?: CallOverrides): Promise<string>;

  isAccountCritical(
    account: string,
    timestamp: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isAccountCriticalNow(
    account: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isAccountSolvent(
    account: string,
    timestamp: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isAccountSolventNow(
    account: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  makeLiquidationPayouts(
    id: BytesLike,
    liquidator: string,
    penaltyAccount: string,
    rewardAmount: BigNumberish,
    bailoutAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  realtimeBalanceOf(
    account: string,
    timestamp: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber] & {
      availableBalance: BigNumber;
      deposit: BigNumber;
      owedDeposit: BigNumber;
    }
  >;

  realtimeBalanceOfNow(
    account: string,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber] & {
      availableBalance: BigNumber;
      deposit: BigNumber;
      owedDeposit: BigNumber;
      timestamp: BigNumber;
    }
  >;

  settleBalance(
    account: string,
    delta: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  terminateAgreement(
    id: BytesLike,
    dataLength: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateAgreementData(
    id: BytesLike,
    data: BytesLike[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateAgreementStateSlot(
    account: string,
    slotId: BigNumberish,
    slotData: BytesLike[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    createAgreement(
      id: BytesLike,
      data: BytesLike[],
      overrides?: CallOverrides
    ): Promise<void>;

    getAccountActiveAgreements(
      account: string,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getAgreementData(
      agreementClass: string,
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getAgreementStateSlot(
      agreementClass: string,
      account: string,
      slotId: BigNumberish,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getHost(overrides?: CallOverrides): Promise<string>;

    isAccountCritical(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isAccountCriticalNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isAccountSolvent(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isAccountSolventNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    makeLiquidationPayouts(
      id: BytesLike,
      liquidator: string,
      penaltyAccount: string,
      rewardAmount: BigNumberish,
      bailoutAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    realtimeBalanceOf(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        availableBalance: BigNumber;
        deposit: BigNumber;
        owedDeposit: BigNumber;
      }
    >;

    realtimeBalanceOfNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        availableBalance: BigNumber;
        deposit: BigNumber;
        owedDeposit: BigNumber;
        timestamp: BigNumber;
      }
    >;

    settleBalance(
      account: string,
      delta: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    terminateAgreement(
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    updateAgreementData(
      id: BytesLike,
      data: BytesLike[],
      overrides?: CallOverrides
    ): Promise<void>;

    updateAgreementStateSlot(
      account: string,
      slotId: BigNumberish,
      slotData: BytesLike[],
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AgreementAccountStateUpdated(address,address,bytes)"(
      agreementClass?: string | null,
      account?: string | null,
      state?: null
    ): AgreementAccountStateUpdatedEventFilter;
    AgreementAccountStateUpdated(
      agreementClass?: string | null,
      account?: string | null,
      state?: null
    ): AgreementAccountStateUpdatedEventFilter;

    "AgreementCreated(address,bytes32,bytes32[])"(
      agreementClass?: string | null,
      id?: null,
      data?: null
    ): AgreementCreatedEventFilter;
    AgreementCreated(
      agreementClass?: string | null,
      id?: null,
      data?: null
    ): AgreementCreatedEventFilter;

    "AgreementLiquidated(address,bytes32,address,address,uint256)"(
      agreementClass?: string | null,
      id?: null,
      penaltyAccount?: string | null,
      rewardAccount?: string | null,
      rewardAmount?: null
    ): AgreementLiquidatedEventFilter;
    AgreementLiquidated(
      agreementClass?: string | null,
      id?: null,
      penaltyAccount?: string | null,
      rewardAccount?: string | null,
      rewardAmount?: null
    ): AgreementLiquidatedEventFilter;

    "AgreementLiquidatedBy(address,address,bytes32,address,address,uint256,uint256)"(
      liquidatorAccount?: null,
      agreementClass?: string | null,
      id?: null,
      penaltyAccount?: string | null,
      bondAccount?: string | null,
      rewardAmount?: null,
      bailoutAmount?: null
    ): AgreementLiquidatedByEventFilter;
    AgreementLiquidatedBy(
      liquidatorAccount?: null,
      agreementClass?: string | null,
      id?: null,
      penaltyAccount?: string | null,
      bondAccount?: string | null,
      rewardAmount?: null,
      bailoutAmount?: null
    ): AgreementLiquidatedByEventFilter;

    "AgreementStateUpdated(address,address,uint256)"(
      agreementClass?: string | null,
      account?: string | null,
      slotId?: null
    ): AgreementStateUpdatedEventFilter;
    AgreementStateUpdated(
      agreementClass?: string | null,
      account?: string | null,
      slotId?: null
    ): AgreementStateUpdatedEventFilter;

    "AgreementTerminated(address,bytes32)"(
      agreementClass?: string | null,
      id?: null
    ): AgreementTerminatedEventFilter;
    AgreementTerminated(
      agreementClass?: string | null,
      id?: null
    ): AgreementTerminatedEventFilter;

    "AgreementUpdated(address,bytes32,bytes32[])"(
      agreementClass?: string | null,
      id?: null,
      data?: null
    ): AgreementUpdatedEventFilter;
    AgreementUpdated(
      agreementClass?: string | null,
      id?: null,
      data?: null
    ): AgreementUpdatedEventFilter;

    "Bailout(address,uint256)"(
      bailoutAccount?: string | null,
      bailoutAmount?: null
    ): BailoutEventFilter;
    Bailout(
      bailoutAccount?: string | null,
      bailoutAmount?: null
    ): BailoutEventFilter;
  };

  estimateGas: {
    createAgreement(
      id: BytesLike,
      data: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getAccountActiveAgreements(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAgreementData(
      agreementClass: string,
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAgreementStateSlot(
      agreementClass: string,
      account: string,
      slotId: BigNumberish,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getHost(overrides?: CallOverrides): Promise<BigNumber>;

    isAccountCritical(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isAccountCriticalNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isAccountSolvent(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isAccountSolventNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    makeLiquidationPayouts(
      id: BytesLike,
      liquidator: string,
      penaltyAccount: string,
      rewardAmount: BigNumberish,
      bailoutAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    realtimeBalanceOf(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    realtimeBalanceOfNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    settleBalance(
      account: string,
      delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    terminateAgreement(
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateAgreementData(
      id: BytesLike,
      data: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateAgreementStateSlot(
      account: string,
      slotId: BigNumberish,
      slotData: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    createAgreement(
      id: BytesLike,
      data: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getAccountActiveAgreements(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAgreementData(
      agreementClass: string,
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAgreementStateSlot(
      agreementClass: string,
      account: string,
      slotId: BigNumberish,
      dataLength: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getHost(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isAccountCritical(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isAccountCriticalNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isAccountSolvent(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isAccountSolventNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    makeLiquidationPayouts(
      id: BytesLike,
      liquidator: string,
      penaltyAccount: string,
      rewardAmount: BigNumberish,
      bailoutAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    realtimeBalanceOf(
      account: string,
      timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    realtimeBalanceOfNow(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    settleBalance(
      account: string,
      delta: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    terminateAgreement(
      id: BytesLike,
      dataLength: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateAgreementData(
      id: BytesLike,
      data: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateAgreementStateSlot(
      account: string,
      slotId: BigNumberish,
      slotData: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
