import { ChainEnum, NetworkEnum } from "@my-org/store";

/** Shared chain presentation rules — call via `IWalletAdapter`, not from UI. */
export function buildExplorerTransactionUrl(
  chain: ChainEnum,
  signature: string,
  network: NetworkEnum
): string {
  if (chain === ChainEnum.Solana) {
    const clusterString =
      network === NetworkEnum.Mainnet ? "mainnet" : "devnet";
    return `https://explorer.solana.com/tx/${signature}?cluster=${clusterString}`;
  }

  if (network === NetworkEnum.Sepolia) {
    return `https://sepolia.etherscan.io/tx/${signature}`;
  }

  return `https://etherscan.io/tx/${signature}`;
}

export function buildReceivePaymentUri(
  chain: ChainEnum,
  publicKey: string,
  network: NetworkEnum
): string {
  if (chain === ChainEnum.Solana) {
    const cluster = network === NetworkEnum.Devnet ? "devnet" : "mainnet-beta";
    return `solana:${publicKey}?cluster=${cluster}`;
  }

  if (chain === ChainEnum.Ethereum) {
    const chainId = network === NetworkEnum.Mainnet ? 1 : 11155111;
    return `ethereum:${publicKey}?chainId=${chainId}`;
  }

  return publicKey;
}

export function chainLabelFor(chain: ChainEnum): string {
  return chain === ChainEnum.Solana ? "Solana" : "Ethereum";
}
