import { Router } from "express";
import { balanceRouter } from "./ethereum/balance.js";
import { transactionsRouter } from "./ethereum/transactions.js";
import { sendRouter } from "./ethereum/send.js";

const router = Router();

router.use("/balance", balanceRouter);
router.use("/transactions", transactionsRouter);
router.use("/send", sendRouter);

export { router as ethereumRoutes };
