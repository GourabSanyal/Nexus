import axios, { AxiosInstance } from "axios";
import { RPC_ENDPOINTS } from "../configs/rpcConfigs";
import {
  ChainEnum,
  NetworkEnum,
  NetworkConnectionEnum,
} from "@repo/store/src/enums/network";
import { checkInternet } from "@repo/api/src/services/shared/checkInternet";

export const apiClient = (
  chain: ChainEnum.Ethereum,
  cluster:
    | NetworkEnum.Devnet
    | NetworkEnum.Mainnet
    | NetworkEnum.Sepolia
    | NetworkEnum.Holesky
): AxiosInstance => {
  try {
    const baseURL =
      RPC_ENDPOINTS.ethereum[
        cluster as keyof typeof RPC_ENDPOINTS.ethereum
      ];

    if (checkInternet()) {
      return axios.create({
        baseURL,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    throw new Error(NetworkConnectionEnum.NoInternet + " haha");
  } catch (error) {
    throw new Error(`${error}`);
  }
};

