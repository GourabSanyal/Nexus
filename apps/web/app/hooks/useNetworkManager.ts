import { useRecoilState } from "recoil";
import { useMemo, useCallback } from "react";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import {
  globalNetworkState,
  walletNetworkOverrideState,
} from "@repo/store/src/atoms/networkState";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import {
  NetworkManager,
  getEffectiveNetworkFromStores,
} from "@/app/lib/services/NetworkManager";

export const useNetworkManager = (
  adapter: IWalletAdapter | null,
  chain: ChainEnum,
  walletId?: number
) => {
  const [globalNetworks, setGlobalNetworks] =
    useRecoilState(globalNetworkState);
  const [overrides, setOverrides] = useRecoilState(walletNetworkOverrideState);

  const manager = useMemo(() => {
    if (!adapter) return null;
    return new NetworkManager(
      adapter,
      chain,
      walletId,
      setGlobalNetworks,
      setOverrides
    );
  }, [adapter, chain, walletId, setGlobalNetworks, setOverrides]);

  const currentNetwork = useMemo(
    () =>
      getEffectiveNetworkFromStores(chain, walletId, globalNetworks, overrides),
    [chain, walletId, globalNetworks, overrides]
  );

  const toggle = useCallback(() => {
    if (!manager) return;
    manager.toggleNetwork(globalNetworks, overrides);
  }, [manager, globalNetworks, overrides]);

  const setNetwork = useCallback(
    (network: NetworkEnum) => {
      if (!manager) return;
      manager.setNetwork(network);
    },
    [manager]
  );

  return {
    currentNetwork,
    toggle,
    setNetwork,
    availableNetworks: adapter?.supportedNetworks ?? [],
  };
};
