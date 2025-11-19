import { Response, NextFunction } from "express";
import { NetworkEnum } from "../types/network.js";
import { getEthereumRpcUrl } from "../utils/getEthereumRpcUrl.js";
import { EthereumRequest } from "../types/ethereum.js";

const VALID_ETHEREUM_NETWORKS: NetworkEnum[] = [
  NetworkEnum.Mainnet,
  NetworkEnum.Sepolia,
  NetworkEnum.Holesky,
];

export function validateEthereumRequest(
  req: EthereumRequest,
  res: Response,
  next: NextFunction
): void {
  const { address, cluster } = req.body;

  if (!address) {
    res.status(400).json({ error: "Address is required" });
    return;
  }

  if (!cluster) {
    res.status(400).json({ error: "Cluster is required" });
    return;
  }

  if (!VALID_ETHEREUM_NETWORKS.includes(cluster as NetworkEnum)) {
    res.status(400).json({
      error: `Invalid cluster. Must be one of: ${VALID_ETHEREUM_NETWORKS.join(", ")}`,
    });
    return;
  }

  const rpcUrl = getEthereumRpcUrl(cluster as NetworkEnum);

  if (!rpcUrl) {
    res.status(500).json({
      error: `RPC endpoint not configured for cluster: ${cluster}`,
      details: `Please set ETHEREUM_${cluster.toUpperCase()} environment variable`,
    });
    return;
  }

  req.validatedData = {
    address,
    cluster: cluster as NetworkEnum,
    rpcUrl,
  };

  next();
}
