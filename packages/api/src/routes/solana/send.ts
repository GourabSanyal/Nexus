import { Router, Response } from "express";
import axios from "axios";
import { SolanaRequest } from "../../types/solana.js";
import { validateSolanaRequest } from "../../middleware/validateSolanaRequest.js";

const router = Router();

router.post(
  "/prepare",
  validateSolanaRequest,
  async (req: SolanaRequest, res: Response) => {
    try {
      const { rpcUrl } = req.validatedData!;

      const response = await axios.post(
        rpcUrl,
        {
          id: 1,
          jsonrpc: "2.0",
          method: "getLatestBlockhash",
          params: [{ commitment: "finalized" }],
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

      return res.json(response.data?.result?.value);
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to prepare transaction",
        message: error?.message || "Unknown error",
      });
    }
  }
);

router.post("/", validateSolanaRequest, async (req: SolanaRequest, res: Response) => {
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
        method: "sendTransaction",
        params: [
          signedTransaction,
          {
            encoding: "base64",
            preflightCommitment: "confirmed",
          },
        ],
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

    return res.json({ signature: response.data?.result });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to send transaction",
      message: error?.message || "Unknown error",
    });
  }
});

export { router as sendSolanaRouter };
