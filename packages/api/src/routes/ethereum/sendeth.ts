import { Router, Response } from "express";
import { EthereumRequest } from "../../types/ethereum.js";
import { validateEthereumRequest } from "../../middleware/validateEthereumRequest.js";
import { handleEthereumError } from "../../middleware/ethereumErrorHandler.js";

const router = Router();

router.post("/", validateEthereumRequest, async (req: EthereumRequest, res: Response) => {
  try {
    // 
  } catch (error: any) {
    handleEthereumError(res, error, "Failed to send transaction");
  }
});

export { router as sendethRouter };

