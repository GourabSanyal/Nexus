"use client";

import { ChainEnum } from "@repo/store/src/enums/network";
import { ClusterToggleProps } from "@/app/types/wallet/ClusterToggleTypes";
import { NetworkToggleProvider } from "@/app/components/ui/wallet/shared/NetworkToggleProvider";

export function ClusterToggle({ chain, walletId, onToggle, currentNetwork }: ClusterToggleProps) {
  const walletType = chain === ChainEnum.Solana ? 'solana' : 'ethereum';

  return (
    <NetworkToggleProvider
      chain={chain}
      walletId={walletId}
      walletType={walletType}
      onToggle={onToggle}
      currentNetwork={currentNetwork}
    />
  );
}
