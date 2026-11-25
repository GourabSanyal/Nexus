import { NetworkEnum } from "@repo/store";
import type {
  ImportCandidate,
  ImportPreviewNetworkTier,
} from "@repo/zod";

export const importPreviewNetworkToEnum = (
  chain: ImportCandidate["chain"],
  tier: ImportPreviewNetworkTier
): NetworkEnum => {
  if (tier === "mainnet") {
    return NetworkEnum.Mainnet;
  }

  return chain === "solana" ? NetworkEnum.Devnet : NetworkEnum.Sepolia;
};
