import { NetworkEnum } from "@repo/store/src/enums/network";
import type {
  ImportCandidate,
  ImportPreviewNetworkTier,
} from "@my-org/zod";

export const importPreviewNetworkToEnum = (
  chain: ImportCandidate["chain"],
  tier: ImportPreviewNetworkTier
): NetworkEnum => {
  if (tier === "mainnet") {
    return NetworkEnum.Mainnet;
  }

  return chain === "solana" ? NetworkEnum.Devnet : NetworkEnum.Sepolia;
};
