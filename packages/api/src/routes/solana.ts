import { Router } from "express";
import { sendSolanaRouter } from "./solana/send.js";

const router = Router();

router.use("/send", sendSolanaRouter);

export { router as solanaRoutes };
