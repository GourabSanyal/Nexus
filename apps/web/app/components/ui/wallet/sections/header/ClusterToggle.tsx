"use client";

import { NetworkEnum, useNetwork } from "@my-org/store";
import { ClusterToggleProps } from "@/app/types/wallet/ClusterToggleTypes";

export function ClusterToggle({ chainEnum, walletId }: ClusterToggleProps) {
  const { getEffectiveNetwork, toggleNetwork } = useNetwork();
  const network = getEffectiveNetwork(chainEnum, walletId);
  return (
    <button
      aria-label="Toggle network"
      title={network === NetworkEnum.Devnet ? "Devnet" : "Mainnet"}
      onClick={() => toggleNetwork(chainEnum, walletId)}
      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
        network === NetworkEnum.Devnet
          ? "border-green-600 text-green-700 bg-green-50 dark:text-green-500 dark:bg-green-950"
          : "border-muted-foreground/20 text-muted-foreground"
      }`}
    >
      {network === NetworkEnum.Devnet ? "Devnet" : "Mainnet"}
    </button>
  );
}
