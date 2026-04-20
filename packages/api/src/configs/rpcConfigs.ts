export const RPC_ENDPOINTS = {
  get ethereum() { 
    return {
      mainnet: process.env.ETHEREUM_MAINNET,
      sepolia: process.env.ETHEREUM_SEPOLIA,
      holesky: process.env.ETHEREUM_HOLESKY,
    };
  },
  get solana() {
    return {
      mainnet:
        process.env.SOLANA_MAINNET ||
        process.env.SOLANA_MAINNET_RPC,
      devnet:
        process.env.SOLANA_DEVNET ||
        process.env.SOLANA_DEVNET_RPC,
    };
  },
};
