import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { IWalletAdapter } from "./IWalletAdapter";
import { BalanceParams } from "@api-types/BalanceParams";
import { TransactionResponse, TransactionRequest } from "@api-types/TransactionTypes";
import { getSolBalance } from "@/app/lib/utils/getSolBalance";
import { fetchTransactions } from "@/app/lib/utils/fetchTransactions";
import { validateAddress } from "@my-org/store";
import { sendTransaction } from "@/app/lib/utils/sendTransaction";

export class SolanaWalletAdapter implements IWalletAdapter {
  readonly chain = ChainEnum.Solana;
  readonly supportedNetworks: NetworkEnum[] = [NetworkEnum.Mainnet, NetworkEnum.Devnet];

  getDefaultNetwork(): NetworkEnum {
    return NetworkEnum.Mainnet;
  }

  getNextNetwork(current: NetworkEnum): NetworkEnum {
    // binary toggle: Mainnet ↔ Devnet
    return current === NetworkEnum.Mainnet 
      ? NetworkEnum.Devnet 
      : NetworkEnum.Mainnet;
  }

  validateNetwork(network: NetworkEnum): boolean {
    return this.supportedNetworks.includes(network);
  }

  async fetchBalance(params: BalanceParams): Promise<number | bigint> {
    return getSolBalance(params);
  }

  formatBalance(balance: number | bigint): string {
    const numBalance = typeof balance === 'bigint' ? Number(balance) : balance;
    const sol = numBalance / 1e9;
    return sol.toFixed(3);
  }

  async fetchTransactions(params: TransactionRequest): Promise<TransactionResponse> {
    return fetchTransactions({
      chain: this.chain,
      address: params.address,
      cluster: params.cluster as NetworkEnum,
      limit: params.limit,
    });
  }

  async sendTransaction(params: any): Promise<any> {
    return sendTransaction({
      ...params,
      chain: this.chain,
    });
  }

  validateAddress(address: string): boolean {
    return validateAddress("solana", address);
  }

  formatAddress(address: string): string {
    // due
    if (address.length > 8) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
    return address;
  }

  getNetworkDisplayName(network: NetworkEnum): string {
    switch (network) {
      case NetworkEnum.Devnet:
        return "Devnet";
      case NetworkEnum.Mainnet:
        return "Mainnet";
      default:
        return "Unknown";
    }
  }

  getNetworkColor(network: NetworkEnum): string {
    switch (network) {
      case NetworkEnum.Devnet:
        return "border-green-600 text-green-700 bg-green-50 dark:text-green-500 dark:bg-green-950";
      case NetworkEnum.Mainnet:
        return "border-orange-600 text-orange-700 bg-orange-50 dark:text-orange-500 dark:bg-orange-950";
      default:
        return "border-muted-foreground/20 text-muted-foreground";
    }
  }

  getCurrencySymbol(): string {
    return "SOL";
  }
}
