"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useRecoilState } from "recoil";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import {
  globalNetworkState,
  walletNetworkOverrideState,
} from "@repo/store/src/atoms/networkState";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import { NetworkToggleContextValueProps } from "@/app/types/common/NetworkToggleContextValueProps";
import {
  NetworkManager,
  getEffectiveNetworkFromStores,
} from "@/app/lib/services/NetworkManager";

const NetworkToggleContext =
  createContext<NetworkToggleContextValueProps | null>(null);

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
  const [globalNetworks, setGlobalNetworks] =
    useRecoilState(globalNetworkState);
  const [overrides, setOverrides] = useRecoilState(walletNetworkOverrideState);

  const manager = useMemo(
    () =>
      new NetworkManager(
        adapter,
        chain,
        walletId,
        setGlobalNetworks,
        setOverrides
      ),
    [adapter, chain, walletId, setGlobalNetworks, setOverrides]
  );

  const currentNetwork = useMemo(
    () =>
      getEffectiveNetworkFromStores(chain, walletId, globalNetworks, overrides),
    [chain, walletId, globalNetworks, overrides]
  );

  const setNetwork = useCallback(
    (network: NetworkEnum) => {
      manager.setNetwork(network);
    },
    [manager]
  );

  const toggle = useCallback(() => {
    manager.toggleNetwork(globalNetworks, overrides);
  }, [manager, globalNetworks, overrides]);

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
    [
      currentNetwork,
      adapter.supportedNetworks,
      toggle,
      setNetwork,
      getDisplayName,
      getNetworkColor,
    ]
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
    throw new Error(
      "useNetworkToggleContext must be used within NetworkToggleProvider"
    );
  }
  return context;
}
