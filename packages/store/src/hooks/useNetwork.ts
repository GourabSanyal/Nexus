import { useRecoilState } from "recoil";
import {
  globalNetworkState,
  walletNetworkOverrideState,
} from "@repo/store/src/atoms/networkState";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { getBalance } from "@/lib/utils/getBalance";
import { getSolTransactions } from "@/lib/utils/getSolTransactions";

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
    let next: NetworkEnum;

    if (chain === ChainEnum.Solana) {
      next =
        current === NetworkEnum.Mainnet
          ? NetworkEnum.Devnet
          : NetworkEnum.Mainnet;
    } else if (chain === ChainEnum.Ethereum) {
      switch (current) {
        case NetworkEnum.Sepolia:
          next = NetworkEnum.Holesky;
          break;
        case NetworkEnum.Holesky:
          next = NetworkEnum.Mainnet;
          break;
        case NetworkEnum.Mainnet:
          next = NetworkEnum.Sepolia;
          break;
        default:
          next = NetworkEnum.Sepolia;
      }
    } else {
      next = current;
    }

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

  const fetchBalanceFromAPI = async (params: {
    walletId: string;
    chain: ChainEnum.Solana | ChainEnum.Ethereum;
    cluster:
      | NetworkEnum.Devnet
      | NetworkEnum.Mainnet
      | NetworkEnum.Holesky
      | NetworkEnum.Sepolia;
    address: string;
  }) => {
    return getBalance({
      chain: params.chain,
      cluster: params.cluster,
      address: params.address,
    });
  };

  const fetchAllSolTransactions = async (params: {
    walletId: string;
    chain: ChainEnum.Solana | ChainEnum.Ethereum;
    cluster:
      | NetworkEnum.Devnet
      | NetworkEnum.Mainnet
      | NetworkEnum.Holesky
      | NetworkEnum.Sepolia;
    address: string;
    limit?: number;
  }) => {
    return getSolTransactions({
      address: params.address,
      cluster: params.cluster as NetworkEnum.Mainnet | NetworkEnum.Devnet,
      limit: params.limit,
    });
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
    fetchBalanceFromAPI,
    fetchAllSolTransactions,
  };
};
