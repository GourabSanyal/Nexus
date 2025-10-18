export type Chain = "solana" | "ethereum";

export interface BalanceParams {
  chain: Chain;
  address: string;
  cluster: string;
  network: string;
}
