"use client";

import { NetworkEnum, useNetwork } from "@my-org/store";
import { ClusterToggleProps } from "@/app/types/wallet/ClusterToggleTypes";

export function ClusterToggle({ chain, walletId }: ClusterToggleProps) {
  const { getEffectiveNetwork, toggleNetwork } = useNetwork();
  const networkType = getEffectiveNetwork(chain, walletId);

  const getNetworkDisplayName = (network: NetworkEnum) => {
    switch (network) {
      case NetworkEnum.Devnet:
        return "Devnet";
      case NetworkEnum.Mainnet:
        return "Mainnet";
      case NetworkEnum.Sepolia:
        return "Sepolia";
      case NetworkEnum.Holesky:
        return "Holesky";
      default:
        return "Unknown";
    }
  };

  const getNetworkColor = (network: NetworkEnum) => {
    switch (network) {
      case NetworkEnum.Devnet:
        return "border-green-600 text-green-700 bg-green-50 dark:text-green-500 dark:bg-green-950";
      case NetworkEnum.Sepolia:
        return "border-blue-600 text-blue-700 bg-blue-50 dark:text-blue-500 dark:bg-blue-950";
      case NetworkEnum.Holesky:
        return "border-purple-600 text-purple-700 bg-purple-50 dark:text-purple-500 dark:bg-purple-950";
      case NetworkEnum.Mainnet:
        return "border-orange-600 text-orange-700 bg-orange-50 dark:text-orange-500 dark:bg-orange-950";
      default:
        return "border-muted-foreground/20 text-muted-foreground";
    }
  };

  return (
    <button
      aria-label="Toggle network"
      title={getNetworkDisplayName(networkType)}
      onClick={() => toggleNetwork(chain, walletId)}
      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${getNetworkColor(networkType)}`}
    >
      {getNetworkDisplayName(networkType)}
    </button>
  );
}
