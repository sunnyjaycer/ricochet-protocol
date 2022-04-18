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
        name: "collateralizationRatio",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "liquidationPenalty",
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
  "0x608060405234801561001057600080fd5b506040516107c73803806107c783398101604081905261002f916100ad565b6100383361005d565b600180546001600160a01b0319166001600160a01b03929092169190911790556100db565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156100be578081fd5b81516001600160a01b03811681146100d4578182fd5b9392505050565b6106dd806100ea6000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c8063715018a61161005b578063715018a6146100d65780637822ed49146100e05780638da5cb5b146100f3578063f2fde38b1461010457600080fd5b806304c660da14610082578063396bbcff146100b257806350308aaf146100c3575b600080fd5b6100956100903660046105c1565b610117565b6040516001600160a01b0390911681526020015b60405180910390f35b6002546040519081526020016100a9565b6100956100d13660046104e7565b610157565b6100de610296565b005b600154610095906001600160a01b031681565b6000546001600160a01b0316610095565b6100de6101123660046104c4565b610301565b6000806002838154811061013b57634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001600160a01b03169392505050565b6001546000908190610171906001600160a01b03166103cc565b9050806001600160a01b031663beada71e33898989896101996000546001600160a01b031690565b8a6040518863ffffffff1660e01b81526004016101bc97969594939291906105d9565b600060405180830381600087803b1580156101d657600080fd5b505af11580156101ea573d6000803e3d6000fd5b505060408051602080820183526001600160a01b038681168084526002805460018101825560009190915284517f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90910180546001600160a01b0319169190931617909155835190815233918101919091529093507f7e5337f187d761895980242ae2148ec29fc88dbfb602b00846d90ae73f9edda792500160405180910390a1509695505050505050565b6000546001600160a01b031633146102f55760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064015b60405180910390fd5b6102ff6000610469565b565b6000546001600160a01b0316331461035b5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102ec565b6001600160a01b0381166103c05760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016102ec565b6103c981610469565b50565b6000604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b81528260601b60148201526e5af43d82803e903d91602b57fd5bf360881b60288201526037816000f09150506001600160a01b0381166104645760405162461bcd60e51b8152602060048201526016602482015275115490cc4c4d8dce8818dc99585d194819985a5b195960521b60448201526064016102ec565b919050565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b803561046481610692565b6000602082840312156104d5578081fd5b81356104e081610692565b9392505050565b600080600080600060a086880312156104fe578081fd5b853567ffffffffffffffff80821115610515578283fd5b818801915088601f830112610528578283fd5b81358181111561053a5761053a61067c565b604051601f8201601f19908116603f011681019083821181831017156105625761056261067c565b816040528281528b602084870101111561057a578586fd5b82602086016020830137856020848301015280995050505050506020860135935060408601359250606086013591506105b5608087016104b9565b90509295509295909350565b6000602082840312156105d2578081fd5b5035919050565b60018060a01b03881681526000602060e08184015288518060e0850152825b81811015610615578a8101830151858201610100015282016105f8565b81811115610627578361010083870101525b50610100601f19601f8301168501019250505086604083015285606083015284608083015261066160a08301856001600160a01b03169052565b6001600160a01b03831660c083015298975050505050505050565b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146103c957600080fdfea26469706673582212205fb3fd25df373922d1b6abc6bc210cbecee882d89f0da465ef7bec2a7ff5e69564736f6c63430008040033";

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
