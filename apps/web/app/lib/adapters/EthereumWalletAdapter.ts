import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { IWalletAdapter } from "./IWalletAdapter";
import { BalanceParams } from "@api-types/BalanceParams";
import { TransactionResponse, TransactionRequest } from "@api-types/TransactionTypes";
import { getEthBalance } from "@/app/lib/utils/getEthBalance";
import { fetchTransactions } from "@/app/lib/utils/fetchTransactions";
import { validateAddress } from "@my-org/store";
import {
  sendTransaction,
  type AdapterWalletSendParams,
  type WalletSendResult,
} from "@/app/lib/utils/sendTransaction";

export class EthereumWalletAdapter implements IWalletAdapter {
  readonly chain = ChainEnum.Ethereum;
  readonly supportedNetworks: NetworkEnum[] = [
    NetworkEnum.Mainnet,
    NetworkEnum.Sepolia,
  ];

  getDefaultNetwork(): NetworkEnum {
    return NetworkEnum.Sepolia;
  }

  getNextNetwork(current: NetworkEnum): NetworkEnum {
    const order = [
      NetworkEnum.Sepolia,
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
    const wei = typeof balance === "bigint" ? balance : BigInt(Math.trunc(balance));
    const divisor = 10n ** 18n;
    const whole = wei / divisor;
    const fraction = ((wei % divisor) * 1000n) / divisor;
    return `${whole.toString()}.${fraction.toString().padStart(3, "0")}`;
  }

  async fetchTransactions(params: TransactionRequest): Promise<TransactionResponse> {
    return fetchTransactions({
      chain: this.chain,
      address: params.address,
      cluster: params.cluster as NetworkEnum,
      limit: params.limit,
    });
  }

  async sendTransaction(
    params: AdapterWalletSendParams
  ): Promise<WalletSendResult> {
    return sendTransaction({
      ...params,
      chain: this.chain,
    });
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
      default:
        return "Unknown";
    }
  }

  getNetworkColor(network: NetworkEnum): string {
    switch (network) {
      case NetworkEnum.Sepolia:
        return "border-blue-600 text-blue-700 bg-blue-50 dark:text-blue-500 dark:bg-blue-950";
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
