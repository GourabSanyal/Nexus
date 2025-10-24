import axios, { AxiosInstance } from "axios";
import { RPC_ENDPOINTS } from "../configs/rpcConfigs";
import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";

export const apiClient = (
  chain: ChainEnum.Solana | ChainEnum.Ethereum,
  cluster:
    | NetworkEnum.Devnet
    | NetworkEnum.Mainnet
    | NetworkEnum.Sepolia
    | NetworkEnum.Holesky
): AxiosInstance => {
  const baseURL =
    chain === ChainEnum.Solana
      ? RPC_ENDPOINTS.solana[cluster as keyof typeof RPC_ENDPOINTS.solana]
      : RPC_ENDPOINTS.ethereum[cluster as keyof typeof RPC_ENDPOINTS.ethereum];
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
