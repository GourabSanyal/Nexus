import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { BalanceParams } from "@api-types/BalanceParams";
import {
  TransactionResponse,
  TransactionRequest,
} from "@api-types/TransactionTypes";
import type {
  AdapterWalletSendParams,
  WalletSendResult,
} from "@/app/lib/utils/sendTransaction";

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
  sendTransaction(params: AdapterWalletSendParams): Promise<WalletSendResult>;

  // Address Operations
  validateAddress(address: string): boolean;
  formatAddress(address: string): string;

  // UI Helpers (delegate to chainPresentation internals)
  getNetworkDisplayName(network: NetworkEnum): string;
  getNetworkColor(network: NetworkEnum): string;
  getCurrencySymbol(): string;
  getChainLabel(): string;
  getExplorerTransactionUrl(signature: string, network: NetworkEnum): string;
  buildReceivePaymentUri(publicKey: string, network: NetworkEnum): string;
}
