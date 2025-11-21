import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { BalanceParams } from "@api-types/BalanceParams";
import { TransactionResponse, TransactionRequest } from "@api-types/TransactionTypes";

export interface IWalletAdapter {
  readonly chain: ChainEnum;
  readonly supportedNetworks: NetworkEnum[];

  // Network Management
  getDefaultNetwork(): NetworkEnum;
  getNextNetwork(current: NetworkEnum): NetworkEnum;
  validateNetwork(network: NetworkEnum): boolean;

  // Balance Operations
  fetchBalance(params: BalanceParams): Promise<number | bigint>;
  formatBalance(balance: number | bigint): string;

  // Transaction Operations
  fetchTransactions(params: TransactionRequest): Promise<TransactionResponse>;
  sendTransaction(params: any): Promise<any>; // Placeholder for future implementation

  // Address Operations
  validateAddress(address: string): boolean;
  formatAddress(address: string): string;

  // UI Helpers
  getNetworkDisplayName(network: NetworkEnum): string;
  getNetworkColor(network: NetworkEnum): string;
  getCurrencySymbol(): string;
}

