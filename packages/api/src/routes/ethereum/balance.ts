import { Router, Response } from "express";
import { EthereumRequest } from "../../types/ethereum.js";
import { validateEthereumRequest } from "../../middleware/validateEthereumRequest.js";
import { handleEthereumError } from "../../middleware/ethereumErrorHandler.js";
import axios from "axios";

const router = Router();

router.post(
  "/",
  validateEthereumRequest,
  async (req: EthereumRequest, res: Response) => {
    try {
      const { address, rpcUrl } = req.validatedData!;

      const requestPayload = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
      };

      const response = await axios.post(rpcUrl, requestPayload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });

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
      });
    } catch (error: any) {
      if (error.response) {
        handleEthereumError(
          res,
          new Error(
            `RPC call failed: ${error.message} - ${JSON.stringify(error.response.data)}`
          ),
          "Failed to fetch balance"
        );
      } else if (error.request) {
        handleEthereumError(
          res,
          new Error(`RPC call failed: No response from server - ${error.message}`),
          "Failed to fetch balance"
        );
      } else {
        handleEthereumError(res, error, "Failed to fetch balance");
      }
    }
  }
);

export { router as balanceRouter };
