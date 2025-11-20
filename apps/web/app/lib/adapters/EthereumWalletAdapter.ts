import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { IWalletAdapter } from "./IWalletAdapter";
import { BalanceParams } from "@api-types/BalanceParams";
import { TransactionResponse, TransactionRequest } from "@api-types/TransactionTypes";
import { getEthBalance } from "@repo/api/src/services/wallet/ethereum/getEthBalance";
import { getEthTransactions } from "@/app/lib/utils/ethereum/transactions/getEthTransactions";
import { validateAddress } from "@my-org/store";

export class EthereumWalletAdapter implements IWalletAdapter {
  readonly chain = ChainEnum.Ethereum;
  readonly supportedNetworks: NetworkEnum[] = [
    NetworkEnum.Mainnet,
    NetworkEnum.Sepolia,
    NetworkEnum.Holesky,
  ];

  getDefaultNetwork(): NetworkEnum {
    return NetworkEnum.Sepolia;
  }

  getNextNetwork(current: NetworkEnum): NetworkEnum {
    const order = [
      NetworkEnum.Sepolia,
      NetworkEnum.Holesky,
      NetworkEnum.Mainnet,
    ];
    const currentIndex = order.indexOf(current);
    if (currentIndex === -1) {
      return NetworkEnum.Sepolia;
    }
    const nextIndex = (currentIndex + 1) % order.length;
    return order[nextIndex]!;
  }

  validateNetwork(network: NetworkEnum): boolean {
    return this.supportedNetworks.includes(network);
  }

  async fetchBalance(params: BalanceParams): Promise<bigint> {
    return getEthBalance(params);
  }

  formatBalance(balance: number | bigint): string {
    const wei = typeof balance === 'bigint' ? balance : BigInt(balance);
    const eth = Number(wei) / 1e18;
    return eth.toString();
  }

  async fetchTransactions(params: TransactionRequest): Promise<TransactionResponse> {
    return getEthTransactions({
      address: params.address,
      cluster: params.cluster as NetworkEnum.Mainnet | NetworkEnum.Sepolia | NetworkEnum.Holesky,
      limit: params.limit,
    });
  }

  async sendTransaction(params: any): Promise<any> {
    throw new Error("Send transaction not yet implemented");
  }

  validateAddress(address: string): boolean {
    return validateAddress("ethereum", address);
  }

  formatAddress(address: string): string {
    // Format Ethereum address (0x + first 4 + ... + last 4)
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  }

  getNetworkDisplayName(network: NetworkEnum): string {
    switch (network) {
      case NetworkEnum.Mainnet:
        return "Mainnet";
      case NetworkEnum.Sepolia:
        return "Sepolia";
      case NetworkEnum.Holesky:
        return "Holesky";
      default:
        return "Unknown";
    }
  }

  getNetworkColor(network: NetworkEnum): string {
    switch (network) {
      case NetworkEnum.Sepolia:
        return "border-blue-600 text-blue-700 bg-blue-50 dark:text-blue-500 dark:bg-blue-950";
      case NetworkEnum.Holesky:
        return "border-purple-600 text-purple-700 bg-purple-50 dark:text-purple-500 dark:bg-purple-950";
      case NetworkEnum.Mainnet:
        return "border-orange-600 text-orange-700 bg-orange-50 dark:text-orange-500 dark:bg-orange-950";
      default:
        return "border-muted-foreground/20 text-muted-foreground";
    }
  }

  getCurrencySymbol(): string {
    return "ETH";
  }
}

