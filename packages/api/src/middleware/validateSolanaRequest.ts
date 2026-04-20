import { Response, NextFunction } from "express";
import { NetworkEnum } from "../types/network.js";
import { getSolanaRpcUrl } from "../utils/getSolanaRpcUrl.js";
import { SolanaRequest } from "../types/solana.js";

const VALID_SOLANA_NETWORKS: NetworkEnum[] = [
  NetworkEnum.Mainnet,
  NetworkEnum.Devnet,
];

export function validateSolanaRequest(
  req: SolanaRequest,
  res: Response,
  next: NextFunction
): void {
  const { cluster } = req.body;

  if (!cluster) {
    res.status(400).json({ error: "Cluster is required" });
    return;
  }

  if (!VALID_SOLANA_NETWORKS.includes(cluster as NetworkEnum)) {
    res.status(400).json({
      error: `Invalid cluster. Must be one of: ${VALID_SOLANA_NETWORKS.join(", ")}`,
    });
    return;
  }

  const rpcUrl = getSolanaRpcUrl(cluster as NetworkEnum);

  if (!rpcUrl) {
    res.status(500).json({
      error: `RPC endpoint not configured for cluster: ${cluster}`,
      details: `Please set SOLANA_${cluster.toUpperCase()} or SOLANA_${cluster.toUpperCase()}_RPC environment variable`,
    });
    return;
  }

  req.validatedData = {
    cluster: cluster as NetworkEnum,
    rpcUrl,
  };

  next();
}
