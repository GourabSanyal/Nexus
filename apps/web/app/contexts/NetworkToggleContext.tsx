"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useRecoilState } from "recoil";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import {
  globalNetworkState,
  walletNetworkOverrideState,
} from "@repo/store/src/atoms/networkState";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import {NetworkToggleContextValueProps} from "@/app/types/common/NetworkToggleContextValueProps";

const NetworkToggleContext = createContext<NetworkToggleContextValueProps | null>(null);

const keyFor = (chain: ChainEnum, walletId?: number) =>
  walletId != null ? `${chain}:${walletId}` : "";

interface NetworkToggleProviderProps {
  chain: ChainEnum;
  walletId?: number;
  adapter: IWalletAdapter;
  children: React.ReactNode;
}

export function NetworkToggleProvider({
  chain,
  walletId,
  adapter,
  children,
}: NetworkToggleProviderProps) {
  const [globalNetworks, setGlobalNetworks] = useRecoilState(globalNetworkState);
  const [overrides, setOverrides] = useRecoilState(walletNetworkOverrideState);

  const getEffectiveNetwork = useCallback((): NetworkEnum => {
    if (walletId != null) {
      const k = keyFor(chain, walletId);
      const o = overrides[k];
      if (o) return o;
    }
    return globalNetworks[chain];
  }, [chain, walletId, overrides, globalNetworks]);

  const currentNetwork = useMemo(() => getEffectiveNetwork(), [getEffectiveNetwork]);

  const setNetwork = useCallback(
    (network: NetworkEnum) => {
      if (!adapter.validateNetwork(network)) {
        throw new Error(`Invalid network ${network} for chain ${chain}`);
      }

      if (walletId != null) {
        const k = keyFor(chain, walletId);
        setOverrides((prev) => ({ ...prev, [k]: network }));
      } else {
        setGlobalNetworks((prev) => ({ ...prev, [chain]: network }));
      }
    },
    [chain, walletId, adapter, setOverrides, setGlobalNetworks]
  );

  const toggle = useCallback(() => {
    const next = adapter.getNextNetwork(currentNetwork);
    setNetwork(next);
  }, [currentNetwork, adapter, setNetwork]);

  const getDisplayName = useCallback(
    (network: NetworkEnum) => adapter.getNetworkDisplayName(network),
    [adapter]
  );

  const getNetworkColor = useCallback(
    (network: NetworkEnum) => adapter.getNetworkColor(network),
    [adapter]
  );

  const value: NetworkToggleContextValueProps = useMemo(
    () => ({
      currentNetwork,
      availableNetworks: adapter.supportedNetworks,
      toggle,
      setNetwork,
      getDisplayName,
      getNetworkColor,
    }),
    [currentNetwork, adapter.supportedNetworks, toggle, setNetwork, getDisplayName, getNetworkColor]
  );

  return (
    <NetworkToggleContext.Provider value={value}>
      {children}
    </NetworkToggleContext.Provider>
  );
}

export function useNetworkToggleContext(): NetworkToggleContextValueProps {
  const context = useContext(NetworkToggleContext);
  if (!context) {
    throw new Error("useNetworkToggleContext must be used within NetworkToggleProvider");
  }
  return context;
}

