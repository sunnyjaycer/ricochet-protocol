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

export declare namespace REXMarket {
  export type OracleInfoStruct = {
    requestId: BigNumberish;
    usdPrice: BigNumberish;
    lastUpdatedAt: BigNumberish;
  };

  export type OracleInfoStructOutput = [BigNumber, BigNumber, BigNumber] & {
    requestId: BigNumber;
    usdPrice: BigNumber;
    lastUpdatedAt: BigNumber;
  };

  export type OutputPoolStruct = {
    token: string;
    feeRate: BigNumberish;
    emissionRate: BigNumberish;
    shareScaler: BigNumberish;
  };

  export type OutputPoolStructOutput = [
    string,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    token: string;
    feeRate: BigNumber;
    emissionRate: BigNumber;
    shareScaler: BigNumber;
  };
}

export interface REXMarketInterface extends utils.Interface {
  contractName: "REXMarket";
  functions: {
    "addOutputPool(address,uint128,uint256,uint256,uint128)": FunctionFragment;
    "afterAgreementCreated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
    "afterAgreementTerminated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
    "afterAgreementUpdated(address,address,bytes32,bytes,bytes,bytes)": FunctionFragment;
    "beforeAgreementCreated(address,address,bytes32,bytes,bytes)": FunctionFragment;
    "beforeAgreementTerminated(address,address,bytes32,bytes,bytes)": FunctionFragment;
    "beforeAgreementUpdated(address,address,bytes32,bytes,bytes)": FunctionFragment;
    "distribute(bytes)": FunctionFragment;
    "emergencyCloseStream(address)": FunctionFragment;
    "emergencyDrain()": FunctionFragment;
    "getCurrentValue(uint256)": FunctionFragment;
    "getEmissionRate(uint32)": FunctionFragment;
    "getFeeRate(uint32)": FunctionFragment;
    "getIDAShares(uint32,address)": FunctionFragment;
    "getInputToken()": FunctionFragment;
    "getLastDistributionAt()": FunctionFragment;
    "getOracleInfo(address)": FunctionFragment;
    "getOutputPool(uint32)": FunctionFragment;
    "getRateTolerance()": FunctionFragment;
    "getStreamRate(address,address)": FunctionFragment;
    "getTellorOracle()": FunctionFragment;
    "getTotalInflow()": FunctionFragment;
    "initializeMarket(address,uint256,address,uint256,uint128,uint128)": FunctionFragment;
    "isAppJailed()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setEmissionRate(uint32,uint128)": FunctionFragment;
    "setFeeRate(uint32,uint128)": FunctionFragment;
    "setRateTolerance(uint256)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "updateTokenPrice(address)": FunctionFragment;
    "updateTokenPrices()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addOutputPool",
    values: [string, BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "afterAgreementCreated",
    values: [string, string, BytesLike, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "afterAgreementTerminated",
    values: [string, string, BytesLike, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "afterAgreementUpdated",
    values: [string, string, BytesLike, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "beforeAgreementCreated",
    values: [string, string, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "beforeAgreementTerminated",
    values: [string, string, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "beforeAgreementUpdated",
    values: [string, string, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "distribute",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "emergencyCloseStream",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "emergencyDrain",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentValue",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getEmissionRate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getFeeRate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getIDAShares",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getInputToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLastDistributionAt",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOracleInfo",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getOutputPool",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRateTolerance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getStreamRate",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getTellorOracle",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalInflow",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initializeMarket",
    values: [
      string,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "isAppJailed",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setEmissionRate",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setFeeRate",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setRateTolerance",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateTokenPrice",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "updateTokenPrices",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "addOutputPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "afterAgreementCreated",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "afterAgreementTerminated",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "afterAgreementUpdated",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "beforeAgreementCreated",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "beforeAgreementTerminated",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "beforeAgreementUpdated",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "distribute", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "emergencyCloseStream",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emergencyDrain",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getEmissionRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getFeeRate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getIDAShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInputToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLastDistributionAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOracleInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOutputPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRateTolerance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getStreamRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTellorOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalInflow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "initializeMarket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAppJailed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setEmissionRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setFeeRate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setRateTolerance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateTokenPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateTokenPrices",
    data: BytesLike
  ): Result;

  events: {
    "Distribution(uint256,uint256,address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Distribution"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export type DistributionEvent = TypedEvent<
  [BigNumber, BigNumber, string],
  { totalAmount: BigNumber; feeCollected: BigNumber; token: string }
>;

export type DistributionEventFilter = TypedEventFilter<DistributionEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface REXMarket extends BaseContract {
  contractName: "REXMarket";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: REXMarketInterface;

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
    addOutputPool(
      _token: string,
      _feeRate: BigNumberish,
      _emissionRate: BigNumberish,
      _requestId: BigNumberish,
      _shareScaler: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    afterAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    afterAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    afterAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    beforeAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string] & { _cbdata: string }>;

    beforeAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string] & { _cbdata: string }>;

    beforeAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _ctx: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string] & { _cbdata: string }>;

    distribute(
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    emergencyCloseStream(
      streamer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    emergencyDrain(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getCurrentValue(
      _requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        _ifRetrieve: boolean;
        _value: BigNumber;
        _timestampRetrieved: BigNumber;
      }
    >;

    getEmissionRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getFeeRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getIDAShares(
      _index: BigNumberish,
      _streamer: string,
      overrides?: CallOverrides
    ): Promise<
      [boolean, boolean, BigNumber, BigNumber] & {
        _exist: boolean;
        _approved: boolean;
        _units: BigNumber;
        _pendingDistribution: BigNumber;
      }
    >;

    getInputToken(overrides?: CallOverrides): Promise<[string]>;

    getLastDistributionAt(overrides?: CallOverrides): Promise<[BigNumber]>;

    getOracleInfo(
      token: string,
      overrides?: CallOverrides
    ): Promise<[REXMarket.OracleInfoStructOutput]>;

    getOutputPool(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[REXMarket.OutputPoolStructOutput]>;

    getRateTolerance(overrides?: CallOverrides): Promise<[BigNumber]>;

    getStreamRate(
      _streamer: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { _requesterFlowRate: BigNumber }>;

    getTellorOracle(overrides?: CallOverrides): Promise<[string]>;

    getTotalInflow(overrides?: CallOverrides): Promise<[BigNumber]>;

    initializeMarket(
      _inputToken: string,
      _rateTolerance: BigNumberish,
      _tellor: string,
      _inputTokenRequestId: BigNumberish,
      _affiliateFee: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    isAppJailed(overrides?: CallOverrides): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setEmissionRate(
      _index: BigNumberish,
      _emissionRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setFeeRate(
      _index: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setRateTolerance(
      _rate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateTokenPrice(
      _token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    updateTokenPrices(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addOutputPool(
    _token: string,
    _feeRate: BigNumberish,
    _emissionRate: BigNumberish,
    _requestId: BigNumberish,
    _shareScaler: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  afterAgreementCreated(
    _superToken: string,
    _agreementClass: string,
    arg2: BytesLike,
    _agreementData: BytesLike,
    arg4: BytesLike,
    _ctx: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  afterAgreementTerminated(
    _superToken: string,
    _agreementClass: string,
    arg2: BytesLike,
    _agreementData: BytesLike,
    _cbdata: BytesLike,
    _ctx: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  afterAgreementUpdated(
    _superToken: string,
    _agreementClass: string,
    arg2: BytesLike,
    _agreementData: BytesLike,
    _cbdata: BytesLike,
    _ctx: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  beforeAgreementCreated(
    _superToken: string,
    _agreementClass: string,
    arg2: BytesLike,
    _agreementData: BytesLike,
    arg4: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  beforeAgreementTerminated(
    _superToken: string,
    _agreementClass: string,
    arg2: BytesLike,
    _agreementData: BytesLike,
    arg4: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  beforeAgreementUpdated(
    _superToken: string,
    _agreementClass: string,
    arg2: BytesLike,
    _agreementData: BytesLike,
    _ctx: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  distribute(
    _ctx: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  emergencyCloseStream(
    streamer: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  emergencyDrain(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getCurrentValue(
    _requestId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [boolean, BigNumber, BigNumber] & {
      _ifRetrieve: boolean;
      _value: BigNumber;
      _timestampRetrieved: BigNumber;
    }
  >;

  getEmissionRate(
    _index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getFeeRate(
    _index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getIDAShares(
    _index: BigNumberish,
    _streamer: string,
    overrides?: CallOverrides
  ): Promise<
    [boolean, boolean, BigNumber, BigNumber] & {
      _exist: boolean;
      _approved: boolean;
      _units: BigNumber;
      _pendingDistribution: BigNumber;
    }
  >;

  getInputToken(overrides?: CallOverrides): Promise<string>;

  getLastDistributionAt(overrides?: CallOverrides): Promise<BigNumber>;

  getOracleInfo(
    token: string,
    overrides?: CallOverrides
  ): Promise<REXMarket.OracleInfoStructOutput>;

  getOutputPool(
    _index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<REXMarket.OutputPoolStructOutput>;

  getRateTolerance(overrides?: CallOverrides): Promise<BigNumber>;

  getStreamRate(
    _streamer: string,
    _token: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getTellorOracle(overrides?: CallOverrides): Promise<string>;

  getTotalInflow(overrides?: CallOverrides): Promise<BigNumber>;

  initializeMarket(
    _inputToken: string,
    _rateTolerance: BigNumberish,
    _tellor: string,
    _inputTokenRequestId: BigNumberish,
    _affiliateFee: BigNumberish,
    _feeRate: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  isAppJailed(overrides?: CallOverrides): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setEmissionRate(
    _index: BigNumberish,
    _emissionRate: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setFeeRate(
    _index: BigNumberish,
    _feeRate: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setRateTolerance(
    _rate: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateTokenPrice(
    _token: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  updateTokenPrices(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addOutputPool(
      _token: string,
      _feeRate: BigNumberish,
      _emissionRate: BigNumberish,
      _requestId: BigNumberish,
      _shareScaler: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    afterAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      _ctx: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    afterAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    afterAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    beforeAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    beforeAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    beforeAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _ctx: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    distribute(_ctx: BytesLike, overrides?: CallOverrides): Promise<string>;

    emergencyCloseStream(
      streamer: string,
      overrides?: CallOverrides
    ): Promise<void>;

    emergencyDrain(overrides?: CallOverrides): Promise<void>;

    getCurrentValue(
      _requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        _ifRetrieve: boolean;
        _value: BigNumber;
        _timestampRetrieved: BigNumber;
      }
    >;

    getEmissionRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFeeRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getIDAShares(
      _index: BigNumberish,
      _streamer: string,
      overrides?: CallOverrides
    ): Promise<
      [boolean, boolean, BigNumber, BigNumber] & {
        _exist: boolean;
        _approved: boolean;
        _units: BigNumber;
        _pendingDistribution: BigNumber;
      }
    >;

    getInputToken(overrides?: CallOverrides): Promise<string>;

    getLastDistributionAt(overrides?: CallOverrides): Promise<BigNumber>;

    getOracleInfo(
      token: string,
      overrides?: CallOverrides
    ): Promise<REXMarket.OracleInfoStructOutput>;

    getOutputPool(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<REXMarket.OutputPoolStructOutput>;

    getRateTolerance(overrides?: CallOverrides): Promise<BigNumber>;

    getStreamRate(
      _streamer: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTellorOracle(overrides?: CallOverrides): Promise<string>;

    getTotalInflow(overrides?: CallOverrides): Promise<BigNumber>;

    initializeMarket(
      _inputToken: string,
      _rateTolerance: BigNumberish,
      _tellor: string,
      _inputTokenRequestId: BigNumberish,
      _affiliateFee: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    isAppJailed(overrides?: CallOverrides): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    setEmissionRate(
      _index: BigNumberish,
      _emissionRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setFeeRate(
      _index: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setRateTolerance(
      _rate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    updateTokenPrice(_token: string, overrides?: CallOverrides): Promise<void>;

    updateTokenPrices(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "Distribution(uint256,uint256,address)"(
      totalAmount?: null,
      feeCollected?: null,
      token?: null
    ): DistributionEventFilter;
    Distribution(
      totalAmount?: null,
      feeCollected?: null,
      token?: null
    ): DistributionEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    addOutputPool(
      _token: string,
      _feeRate: BigNumberish,
      _emissionRate: BigNumberish,
      _requestId: BigNumberish,
      _shareScaler: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    afterAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    afterAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    afterAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    beforeAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    beforeAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    beforeAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _ctx: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    distribute(
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    emergencyCloseStream(
      streamer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    emergencyDrain(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getCurrentValue(
      _requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getEmissionRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFeeRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getIDAShares(
      _index: BigNumberish,
      _streamer: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInputToken(overrides?: CallOverrides): Promise<BigNumber>;

    getLastDistributionAt(overrides?: CallOverrides): Promise<BigNumber>;

    getOracleInfo(token: string, overrides?: CallOverrides): Promise<BigNumber>;

    getOutputPool(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRateTolerance(overrides?: CallOverrides): Promise<BigNumber>;

    getStreamRate(
      _streamer: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTellorOracle(overrides?: CallOverrides): Promise<BigNumber>;

    getTotalInflow(overrides?: CallOverrides): Promise<BigNumber>;

    initializeMarket(
      _inputToken: string,
      _rateTolerance: BigNumberish,
      _tellor: string,
      _inputTokenRequestId: BigNumberish,
      _affiliateFee: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    isAppJailed(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setEmissionRate(
      _index: BigNumberish,
      _emissionRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setFeeRate(
      _index: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setRateTolerance(
      _rate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateTokenPrice(
      _token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    updateTokenPrices(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addOutputPool(
      _token: string,
      _feeRate: BigNumberish,
      _emissionRate: BigNumberish,
      _requestId: BigNumberish,
      _shareScaler: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    afterAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    afterAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    afterAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _cbdata: BytesLike,
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    beforeAgreementCreated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    beforeAgreementTerminated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      arg4: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    beforeAgreementUpdated(
      _superToken: string,
      _agreementClass: string,
      arg2: BytesLike,
      _agreementData: BytesLike,
      _ctx: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    distribute(
      _ctx: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    emergencyCloseStream(
      streamer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    emergencyDrain(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getCurrentValue(
      _requestId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getEmissionRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getFeeRate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getIDAShares(
      _index: BigNumberish,
      _streamer: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInputToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getLastDistributionAt(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOracleInfo(
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOutputPool(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRateTolerance(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getStreamRate(
      _streamer: string,
      _token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTellorOracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getTotalInflow(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initializeMarket(
      _inputToken: string,
      _rateTolerance: BigNumberish,
      _tellor: string,
      _inputTokenRequestId: BigNumberish,
      _affiliateFee: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    isAppJailed(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setEmissionRate(
      _index: BigNumberish,
      _emissionRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setFeeRate(
      _index: BigNumberish,
      _feeRate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setRateTolerance(
      _rate: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateTokenPrice(
      _token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    updateTokenPrices(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}