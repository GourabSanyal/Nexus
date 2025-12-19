import { Router, Response } from "express";
import { EthereumRequest } from "../../types/ethereum.js";
import { validateEthereumRequest } from "../../middleware/validateEthereumRequest.js";
import { handleEthereumError } from "../../middleware/ethereumErrorHandler.js";
import { getEthTransactions } from "../../services/wallet/ethereum/getEthTransactions.js";
import { TransactionResponse } from "../../types/TransactionTypes.js";

const router = Router();

router.post("/", validateEthereumRequest, async (req: EthereumRequest, res: Response) => {
  try {
    const { address, cluster, rpcUrl, limit } = req.validatedData!;

    if (!address || !cluster || !rpcUrl) {
      return res.status(400).json({
        error: "Missing required parameters: address, cluster, or rpcUrl",
      });
    }

    const result: TransactionResponse = await getEthTransactions({
      address,
      rpcUrl,
      cluster,
      limit: limit || 20,
    });

    res.json(result);
  } catch (error: any) {
    handleEthereumError(res, error, "Failed to fetch transactions");
  }
});

export { router as transactionsRouter };

