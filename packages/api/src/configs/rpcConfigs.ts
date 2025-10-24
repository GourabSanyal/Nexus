export const RPC_ENDPOINTS = {
  solana: {
    mainnet:
      "https://solana-mainnet.g.alchemy.com/v2/_czUokBIPxlF-zpeg0MH83_ZQcjSOFp_",
    devnet:
      "https://solana-devnet.g.alchemy.com/v2/_czUokBIPxlF-zpeg0MH83_ZQcjSOFp_",
  },
  ethereum: {
    mainnet:
      "https://eth-mainnet.g.alchemy.com/v2/_czUokBIPxlF-zpeg0MH83_ZQcjSOFp_",
    sepolia:
      "https://eth-holesky.g.alchemy.com/v2/_czUokBIPxlF-zpeg0MH83_ZQcjSOFp_",
    holesky:
      "https://eth-holesky.g.alchemy.com/v2/_czUokBIPxlF-zpeg0MH83_ZQcjSOFp_",
  },
} as const;

export type SolanaCluster = keyof typeof RPC_ENDPOINTS.solana;
export type EthCluster = keyof typeof RPC_ENDPOINTS.ethereum;
