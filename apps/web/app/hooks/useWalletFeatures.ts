import { useMemo } from "react";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { TransactionResponse } from "@api-types/TransactionTypes";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import type {
  AdapterWalletSendParams,
  WalletSendResult,
} from "@/app/lib/utils/sendTransaction";
import { useNetworkManager } from "./useNetworkManager";
import { Wallet } from "@/app/types/wallet/wallet";

interface UseWalletFeaturesReturn {
  // Chain
  chain: ChainEnum;

  // Network
  currentNetwork: NetworkEnum;
  toggleNetwork: () => void;
  setNetwork: (network: NetworkEnum) => void;
  availableNetworks: NetworkEnum[];
  networkCount: number;

  // Balance
  fetchBalance: (network: NetworkEnum) => Promise<number | bigint>;
  formatBalance: (balance: number | bigint) => string;

  // Transactions
  fetchTransactions: (
    network: NetworkEnum,
    limit?: number
  ) => Promise<TransactionResponse>;

  send: (params: AdapterWalletSendParams) => Promise<WalletSendResult>;

  // Validation
  validateAddress: (address: string) => boolean;
  formatAddress: (address: string) => string;

  // UI Helpers
  getNetworkDisplayName: (network: NetworkEnum) => string;
  getNetworkColor: (network: NetworkEnum) => string;
  getCurrencySymbol: () => string;
}

export function useWalletFeatures(wallet: Wallet | null | undefined): UseWalletFeaturesReturn | null {
  const adapter = useMemo(() => {
    if (!wallet) return null;
    return WalletAdapterFactory.create(wallet.type);
  }, [wallet]);

  const chain = useMemo(() => {
    if (!wallet) return ChainEnum.Solana;
    return wallet.type === "solana" ? ChainEnum.Solana : ChainEnum.Ethereum;
  }, [wallet]);

  const networkManager = useNetworkManager(adapter, chain, wallet?.id);

  if (!wallet || !adapter) {
    return null;
  }

  return {
    // Chain
    chain,

    // Network
    currentNetwork: networkManager.currentNetwork,
    toggleNetwork: networkManager.toggle,
    setNetwork: networkManager.setNetwork,
    availableNetworks: networkManager.availableNetworks,
    networkCount: networkManager.availableNetworks.length,

    // Balance
    fetchBalance: async (network: NetworkEnum) => {
      if (!wallet) throw new Error("Wallet not available");
      return adapter.fetchBalance({
        chain,
        cluster: network,
        address: wallet.publicKey,
      });
    },
    formatBalance: (balance: number | bigint) => adapter.formatBalance(balance),

    // Transactions
    fetchTransactions: async (network: NetworkEnum, limit?: number) => {
      if (!wallet) throw new Error("Wallet not available");
      return adapter.fetchTransactions({
        address: wallet.publicKey,
        cluster: network as string,
        limit,
      });
    },

    send: (params: AdapterWalletSendParams) => adapter.sendTransaction(params),

    // Validation
    validateAddress: (address: string) => adapter.validateAddress(address),
    formatAddress: (address: string) => adapter.formatAddress(address),

    // UI Helpers
    getNetworkDisplayName: (network: NetworkEnum) => adapter.getNetworkDisplayName(network),
    getNetworkColor: (network: NetworkEnum) => adapter.getNetworkColor(network),
    getCurrencySymbol: () => adapter.getCurrencySymbol(),
  };
}

