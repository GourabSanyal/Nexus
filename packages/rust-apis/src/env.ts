export interface Env {
  CORS_ORIGIN?: string;
  SOLANA_MAINNET_RPC?: string;
  SOLANA_DEVNET_RPC?: string;
  ETHEREUM_MAINNET_RPC?: string;
  ETHEREUM_SEPOLIA_RPC?: string;
}

export const ENV_TO_HEADER: Array<{ envKey: keyof Env; header: string }> = [
  { envKey: "CORS_ORIGIN", header: "x-cors-origin" },
  { envKey: "SOLANA_MAINNET_RPC", header: "x-solana-mainnet-rpc" },
  { envKey: "SOLANA_DEVNET_RPC", header: "x-solana-devnet-rpc" },
  { envKey: "ETHEREUM_MAINNET_RPC", header: "x-ethereum-mainnet-rpc" },
  { envKey: "ETHEREUM_SEPOLIA_RPC", header: "x-ethereum-sepolia-rpc" },
];
