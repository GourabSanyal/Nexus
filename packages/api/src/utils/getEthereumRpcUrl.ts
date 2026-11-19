import { NetworkEnum } from "@repo/constants";
import { RPC_ENDPOINTS } from "../configs/rpcConfigs.js";

export function getEthereumRpcUrl(cluster: NetworkEnum): string | undefined {
  const clusterKey = cluster.toLowerCase() as "mainnet" | "sepolia" | "holesky";
  return RPC_ENDPOINTS.ethereum[clusterKey];
}
