export enum WalletPath {
  SOLANA = "501",
  ETHEREUM = "60",
}

export const WALLET_PATHS = {
  SOLANA: "501" as const,
  ETHEREUM: "60" as const,
} as const;

export type WalletPathType = typeof WALLET_PATHS[keyof typeof WALLET_PATHS];
