import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";

export interface NetworkToggleProviderProps {
    chain: ChainEnum;
    walletId?: number;
    walletType: ChainEnum.Solana;
    onToggle?: () => void;
    currentNetwork?: NetworkEnum;
  } 