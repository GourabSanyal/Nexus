
export const SOLANA_RPC_ENDPOINTS = {
    "mainnet": "https://solana-mainnet.g.alchemy.com/v2/_czUokBIPxlF-zpeg0MH83_ZQcjSOFp_",
    "devnet": "https://solana-devnet.g.alchemy.com/v2/_czUokBIPxlF-zpeg0MH83_ZQcjSOFp_"
} as const;

export type SolanaCluster = keyof typeof SOLANA_RPC_ENDPOINTS;