import { useRecoilState } from "recoil";
import {
  globalNetworkState,
  walletNetworkOverrideState,
} from "../atoms/networkState";
import { ChainEnum, NetworkEnum } from "../enums/network";

const keyFor = (chain: ChainEnum, walletId?: number) =>
  walletId != null ? `${chain}:${walletId}` : "";

export const useNetwork = () => {
  const [globalNetworks, setGlobalNetworks] =
    useRecoilState(globalNetworkState);
  const [overrides, setOverrides] = useRecoilState(walletNetworkOverrideState);

  const getEffectiveNetwork = (
    chain: ChainEnum,
    walletId?: number
  ): NetworkEnum => {
    if (walletId != null) {
      const k = keyFor(chain, walletId);
      const o = overrides[k];
      if (o) return o;
    }
    return globalNetworks[chain];
  };

  const setGlobalNetwork = (chain: ChainEnum, network: NetworkEnum) => {
    setGlobalNetworks((prev) => ({ ...prev, [chain]: network }));
  };

  const toggleNetwork = (chain: ChainEnum, walletId?: number) => {
    const current = getEffectiveNetwork(chain, walletId);
    const next: NetworkEnum =
      current === NetworkEnum.Mainnet
        ? NetworkEnum.Devnet
        : NetworkEnum.Mainnet;
    if (walletId != null) {
      const k = keyFor(chain, walletId);
      setOverrides((prev) => ({ ...prev, [k]: next }));
    } else {
      setGlobalNetwork(chain, next);
    }
  };

  const sendEth = async (params: {
    fromWalletId: number;
    to: string;
    amountEth: string;
  }) => {
    const network = getEffectiveNetwork(
      ChainEnum.Ethereum,
      params.fromWalletId
    );
    console.log("sendEth placeholder", { network, ...params });
  };

  const sendSol = async (params: {
    fromWalletId: number;
    to: string;
    amountSol: string;
  }) => {
    const network = getEffectiveNetwork(ChainEnum.Solana, params.fromWalletId);
    console.log("sendSol placeholder", { network, ...params });
  };

  return {
    globalNetworks,
    overrides,
    getEffectiveNetwork,
    setGlobalNetwork,
    toggleNetwork,
    sendEth,
    sendSol,
    ChainEnum,
    NetworkEnum,
  };
};
