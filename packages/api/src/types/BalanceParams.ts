import { SOLANA_RPC_ENDPOINTS } from "@api-configs/solanaRpcConfigs"

export type Chain = "solana" | "ethereum";

export interface BalanceParams {
  chain: Chain;
  address: string;
  cluster: keyof typeof SOLANA_RPC_ENDPOINTS;
  network: string;
}
