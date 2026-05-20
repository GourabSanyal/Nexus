import { useMemo } from "react";
import { WalletAdapterFactory } from "./WalletAdapterFactory";
import type { IWalletAdapter } from "./IWalletAdapter";

/** Single factory entry for modals/hooks that have wallet type but not a full wallet record. */
export function useWalletAdapter(
  walletType: "solana" | "ethereum" | null | undefined
): IWalletAdapter | null {
  return useMemo(
    () => (walletType ? WalletAdapterFactory.create(walletType) : null),
    [walletType]
  );
}
