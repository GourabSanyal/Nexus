import { NetworkEnum } from "../types/network.js";
import { RPC_ENDPOINTS } from "../configs/rpcConfigs.js";

export function getSolanaRpcUrl(cluster: NetworkEnum): string | undefined {
  const clusterKey = cluster.toLowerCase() as "mainnet" | "devnet";
  return RPC_ENDPOINTS.solana[clusterKey];
}
