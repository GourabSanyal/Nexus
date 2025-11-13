import { Router } from "express";
import axios from "axios";
import { RPC_ENDPOINTS } from "../configs/rpcConfigs.js";
import { NetworkEnum } from "../../../store/src/enums/network.js";

const router = Router();

const VALID_ETHEREUM_NETWORKS: NetworkEnum[] = [
  NetworkEnum.Mainnet,
  NetworkEnum.Sepolia,
  NetworkEnum.Holesky,
];

router.post("/balance", async (req, res) => {
  try {
    const { address, cluster } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    if (!cluster) {
      return res.status(400).json({ error: "Cluster is required" });
    }

    if (!VALID_ETHEREUM_NETWORKS.includes(cluster as NetworkEnum)) {
      return res.status(400).json({
        error: `Invalid cluster. Must be one of: ${VALID_ETHEREUM_NETWORKS.join(", ")}`,
      });
    }

    const rpcUrl =
      RPC_ENDPOINTS.ethereum[cluster as keyof typeof RPC_ENDPOINTS.ethereum];

    if (!rpcUrl) {
      return res.status(500).json({
        error: `RPC endpoint not configured for cluster: ${cluster}`,
        details: `Please set ETHEREUM_${cluster.toUpperCase()} environment variable`,
      });
    }

    const requestPayload = {
      id: 1,
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
    };

    let response;
    try {
      response = await axios.post(rpcUrl, requestPayload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });
    } catch (axiosError: any) {
      throw new Error(
        `RPC call failed: ${axiosError.message}${axiosError.response?.data ? ` - ${JSON.stringify(axiosError.response.data)}` : ""}`
      );
    }

    if (response.data?.error) {
      return res.status(500).json({
        error: "RPC error",
        message: response.data.error.message || "Unknown RPC error",
        rpcError: response.data.error,
      });
    }

    const balance = response.data?.result || "0x0";

    res.json({
      balance,
      address,
      cluster,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch balance",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export { router as ethereumRoutes };
