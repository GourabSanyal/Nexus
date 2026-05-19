import { ChainEnum, NetworkEnum } from "@my-org/store";

export const getCurrencySymbol = (chain: ChainEnum): string =>
  chain === ChainEnum.Ethereum ? "ETH" : "SOL";

export const getExplorerTransactionUrl = (
  signature: string,
  chain: ChainEnum,
  cluster: NetworkEnum
): string => {
  if (chain === ChainEnum.Solana) {
    const clusterString =
      cluster === NetworkEnum.Mainnet ? "mainnet" : "devnet";
    return `https://explorer.solana.com/tx/${signature}?cluster=${clusterString}`;
  }

  if (cluster === NetworkEnum.Sepolia) {
    return `https://sepolia.etherscan.io/tx/${signature}`;
  }

  return `https://etherscan.io/tx/${signature}`;
};

export const buildReceivePaymentUri = (
  publicKey: string,
  chain: ChainEnum,
  network: NetworkEnum
): string => {
  if (chain === ChainEnum.Solana) {
    const cluster = network === NetworkEnum.Devnet ? "devnet" : "mainnet-beta";
    return `solana:${publicKey}?cluster=${cluster}`;
  }

  if (chain === ChainEnum.Ethereum) {
    const chainId = network === NetworkEnum.Mainnet ? 1 : 11155111;
    return `ethereum:${publicKey}?chainId=${chainId}`;
  }

  return publicKey;
};

export const getChainLabel = (chain: ChainEnum): string =>
  chain === ChainEnum.Solana ? "Solana" : "Ethereum";
