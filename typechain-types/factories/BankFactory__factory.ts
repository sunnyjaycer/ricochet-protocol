/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { BankFactory, BankFactoryInterface } from "../BankFactory";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_bankAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newBankAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "BankCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "bankAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "interestRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "originationFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralizationRatio",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "liquidationPenalty",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "period",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "oracleAddress",
        type: "address",
      },
    ],
    name: "createBank",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getBankAddressAtIndex",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNumberOfBanks",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516107f83803806107f883398101604081905261002f916100ad565b6100383361005d565b600180546001600160a01b0319166001600160a01b03929092169190911790556100db565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156100be578081fd5b81516001600160a01b03811681146100d4578182fd5b9392505050565b61070e806100ea6000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063715018a61161005b578063715018a6146100d65780637822ed49146100e05780638da5cb5b146100f3578063f2fde38b1461010457600080fd5b806304c660da14610082578063396bbcff146100b2578063438d7be8146100c3575b600080fd5b6100956100903660046105da565b610117565b6040516001600160a01b0390911681526020015b60405180910390f35b6002546040519081526020016100a9565b6100956100d13660046104ed565b610157565b6100de61029c565b005b600154610095906001600160a01b031681565b6000546001600160a01b0316610095565b6100de6101123660046104ca565b610307565b6000806002838154811061013b57634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001600160a01b03169392505050565b6001546000908190610171906001600160a01b03166103d2565b9050806001600160a01b03166370c12f1e338b8b8b8b8b8b61019b6000546001600160a01b031690565b8c6040518a63ffffffff1660e01b81526004016101c0999897969594939291906105f2565b600060405180830381600087803b1580156101da57600080fd5b505af11580156101ee573d6000803e3d6000fd5b505060408051602080820183526001600160a01b038681168084526002805460018101825560009190915284517f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90910180546001600160a01b0319169190931617909155835190815233918101919091529093507f7e5337f187d761895980242ae2148ec29fc88dbfb602b00846d90ae73f9edda792500160405180910390a15098975050505050505050565b6000546001600160a01b031633146102fb5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064015b60405180910390fd5b610305600061046f565b565b6000546001600160a01b031633146103615760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102f2565b6001600160a01b0381166103c65760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016102f2565b6103cf8161046f565b50565b6000604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b81528260601b60148201526e5af43d82803e903d91602b57fd5bf360881b60288201526037816000f09150506001600160a01b03811661046a5760405162461bcd60e51b8152602060048201526016602482015275115490cc4c4d8dce8818dc99585d194819985a5b195960521b60448201526064016102f2565b919050565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b803561046a816106c3565b6000602082840312156104db578081fd5b81356104e6816106c3565b9392505050565b600080600080600080600060e0888a031215610507578283fd5b873567ffffffffffffffff8082111561051e578485fd5b818a0191508a601f830112610531578485fd5b813581811115610543576105436106ad565b604051601f8201601f19908116603f0116810190838211818310171561056b5761056b6106ad565b816040528281528d6020848701011115610583578788fd5b826020860160208301378760208483010152809b5050505050506020880135955060408801359450606088013593506080880135925060a088013591506105cc60c089016104bf565b905092959891949750929550565b6000602082840312156105eb578081fd5b5035919050565b6001600160a01b038a16815261012060208083018290528a519183018290526000918291905b80831015610637578c8301820151858401610140015291810191610618565b80831115610649578361014082870101525b610140601f19601f83011686010193505050508860408301528760608301528660808301528560a08301528460c083015261068f60e08301856001600160a01b03169052565b6001600160a01b0383166101008301529a9950505050505050505050565b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146103cf57600080fdfea2646970667358221220e9ed5fe8a64972649118c8faaec3d4d6c4122e5d7700e22a2dbc7d0e1f984b7664736f6c63430008040033";

type BankFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BankFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BankFactory__factory extends ContractFactory {
  constructor(...args: BankFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "BankFactory";
  }

  deploy(
    _bankAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<BankFactory> {
    return super.deploy(_bankAddress, overrides || {}) as Promise<BankFactory>;
  }
  getDeployTransaction(
    _bankAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_bankAddress, overrides || {});
  }
  attach(address: string): BankFactory {
    return super.attach(address) as BankFactory;
  }
  connect(signer: Signer): BankFactory__factory {
    return super.connect(signer) as BankFactory__factory;
  }
  static readonly contractName: "BankFactory";
  public readonly contractName: "BankFactory";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BankFactoryInterface {
    return new utils.Interface(_abi) as BankFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BankFactory {
    return new Contract(address, _abi, signerOrProvider) as BankFactory;
  }
}
