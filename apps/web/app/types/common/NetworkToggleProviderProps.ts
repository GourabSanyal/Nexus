import { ChainEnum, NetworkEnum } from "@repo/store";

export interface NetworkToggleProviderProps {
    chain: ChainEnum;
    walletId?: number;
    walletType: 'solana' | 'ethereum';
    onToggle?: () => void;
    currentNetwork?: NetworkEnum;
  } 