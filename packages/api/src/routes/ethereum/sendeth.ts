import { Router, Response } from "express";
import { EthereumRequest } from "../../types/ethereum.js";
import { validateEthereumRequest } from "../../middleware/validateEthereumRequest.js";
import { handleEthereumError } from "../../middleware/ethereumErrorHandler.js";
import axios from "axios";

const router = Router();

router.post("/", validateEthereumRequest, async (req: EthereumRequest, res: Response) => {
  try {
    const { signedTransaction } = req.body;
    const { rpcUrl } = req.validatedData!;

    if (!signedTransaction || typeof signedTransaction !== "string") {
      return res.status(400).json({ error: "Signed transaction is required" });
    }

    const response = await axios.post(
      rpcUrl,
      {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sendRawTransaction",
        params: [signedTransaction],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    if (response.data?.error) {
      return res.status(500).json({
        error: "RPC error",
        message: response.data.error.message || "Unknown RPC error",
        rpcError: response.data.error,
      });
    }

    return res.json({ hash: response.data?.result });
  } catch (error: any) {
    handleEthereumError(res, error, "Failed to send transaction");
  }
});

router.post(
  "/prepare",
  validateEthereumRequest,
  async (req: EthereumRequest, res: Response) => {
    try {
      const { to, value } = req.body;
      const { address, rpcUrl } = req.validatedData!;

      if (!to || typeof to !== "string") {
        return res.status(400).json({ error: "Recipient address is required" });
      }

      if (!value || typeof value !== "string") {
        return res.status(400).json({ error: "Transaction value is required" });
      }

      const callRpc = async (method: string, params: unknown[]) => {
        const response = await axios.post(
          rpcUrl,
          {
            id: 1,
            jsonrpc: "2.0",
            method,
            params,
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          }
        );

        if (response.data?.error) {
          throw new Error(
            response.data.error.message || `RPC method ${method} failed`
          );
        }

        return response.data?.result;
      };

      const tx = {
        from: address,
        to,
        value,
      };

      const [chainId, nonce, gasPrice, gasLimit] = await Promise.all([
        callRpc("eth_chainId", []),
        callRpc("eth_getTransactionCount", [address, "pending"]),
        callRpc("eth_gasPrice", []),
        callRpc("eth_estimateGas", [tx]),
      ]);

      return res.json({
        chainId,
        nonce,
        gasPrice,
        gasLimit,
      });
    } catch (error: any) {
      handleEthereumError(res, error, "Failed to prepare transaction");
    }
  }
);

export { router as sendethRouter };
