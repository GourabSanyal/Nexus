export const RPC_ENDPOINTS = {
  get ethereum() { 
    return {
      mainnet: process.env.ETHEREUM_MAINNET,
      sepolia: process.env.ETHEREUM_SEPOLIA,
      holesky: process.env.ETHEREUM_HOLESKY,
    };
  },
};
