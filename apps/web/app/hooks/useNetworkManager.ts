import { useRecoilState } from "recoil";
import { useMemo, useCallback } from "react";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import {
  globalNetworkState,
  walletNetworkOverrideState,
} from "@repo/store/src/atoms/networkState";
import { IWalletAdapter } from "@/app/lib/adapters/IWalletAdapter";
import { NetworkManager } from "@/app/lib/services/NetworkManager";

export const useNetworkManager = (
  adapter: IWalletAdapter,
  chain: ChainEnum,
  walletId?: number
) => {
  const [globalNetworks, setGlobalNetworks] =
    useRecoilState(globalNetworkState);
  const [overrides, setOverrides] = useRecoilState(walletNetworkOverrideState);

  // only recreate manager when adapter, chain, or walletId changes
  // don't include globalNetworks/overrides in dep, they're object references that change
  // even when values are the same
  // the manager will read current values from recoil state
  const manager = useMemo(
    () => {
      return new NetworkManager(
        adapter,
        chain,
        walletId,
        globalNetworks,
        overrides,
        setGlobalNetworks,
        setOverrides
      );
    },
    // only depend on stable values, not recoil state objects
    [adapter, chain, walletId, setGlobalNetworks, setOverrides]
  );

  // update manager's internal state references when recoil state changes
  // this ensures manager always has latest values without recreating it
  useMemo(() => {
    if (manager) {
      (manager as any).globalNetworks = globalNetworks;
      (manager as any).overrides = overrides;
    }
  }, [manager, globalNetworks, overrides]);

  // makes currentNetwork reactive to recoil state changes
  const currentNetwork = useMemo(() => {
    const network = manager.getEffectiveNetwork();
    return network;
  }, [manager, globalNetworks, overrides]);

  const toggle = useCallback(() => {
    manager.toggleNetwork();
  }, [manager]);

  const setNetwork = useCallback(
    (network: NetworkEnum) => {
      manager.setNetwork(network);
    },
    [manager]
  );

  return {
    currentNetwork,
    toggle,
    setNetwork,
    availableNetworks: adapter.supportedNetworks,
  };
};
