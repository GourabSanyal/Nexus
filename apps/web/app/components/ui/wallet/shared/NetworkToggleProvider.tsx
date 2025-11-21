"use client";

import { useMemo } from "react";
import { NetworkEnum } from "@repo/store/src/enums/network";
import { NetworkToggleProvider as ContextProvider, useNetworkToggleContext } from "@/app/contexts/NetworkToggleContext";
import { NetworkToggle } from "./NetworkToggle";
import { WalletAdapterFactory } from "@/app/lib/adapters/WalletAdapterFactory";
import { NetworkToggleProviderProps } from "@/app/types/common/NetworkToggleProviderProps";

export function NetworkToggleProvider({
  chain,
  walletId,
  walletType,
  onToggle,
  currentNetwork: externalCurrentNetwork,
}: NetworkToggleProviderProps) {
  const adapter = useMemo(() => WalletAdapterFactory.create(walletType), [walletType]);

  return (
    <ContextProvider chain={chain} walletId={walletId} adapter={adapter}>
      <NetworkToggleContent
        onToggle={onToggle}
        externalCurrentNetwork={externalCurrentNetwork}
      />
    </ContextProvider>
  );
}

function NetworkToggleContent({
  onToggle,
  externalCurrentNetwork,
}: {
  onToggle?: () => void;
  externalCurrentNetwork?: NetworkEnum;
}) {
  const context = useNetworkToggleContext();
  const {
    currentNetwork,
    toggle,
    getDisplayName,
    getNetworkColor,
  } = context;

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      toggle();
    }
  };

  const networkToDisplay = externalCurrentNetwork || currentNetwork;
  const displayName = getDisplayName(networkToDisplay);
  const colorClass = getNetworkColor(networkToDisplay);

  return (
    <NetworkToggle
      currentNetwork={networkToDisplay}
      onToggle={handleClick}
      displayName={displayName}
      colorClass={colorClass}
    />
  );
}

