import { Router } from "express";
import { balanceRouter } from "./ethereum/balance.js";
import { transactionsRouter } from "./ethereum/transactions.js";
import { sendethRouter } from "./ethereum/sendeth.js";

const router = Router();

router.use("/balance", balanceRouter);
router.use("/transactions", transactionsRouter);
router.use("/sendeth", sendethRouter);

export { router as ethereumRoutes };
