import { loadEnv } from "./utils/loadEnv.js";
import { validateEnv } from "./configs/envValidation.js";
import { getCorsOptions } from "./configs/corsConfig.js";
import { requestLogger, errorHandler } from "./middleware/index.js";

loadEnv();
validateEnv();

import express from "express";
import cors from "cors";
import { ethereumRoutes } from "./routes/ethereum.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const HOST = NODE_ENV === "production" ? "0.0.0.0" : "localhost";

const corsOptions = getCorsOptions();
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/ethereum", ethereumRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server is live at http://${HOST}:${PORT}`);
});
