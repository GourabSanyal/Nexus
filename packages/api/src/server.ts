import { loadEnv } from "./utils/loadEnv";
import { validateEnv } from "./configs/envValidation";
import { getCorsOptions } from "./configs/corsConfig.js";
import { requestLogger, errorHandler } from "./middleware/index";
import {
  generalRateLimiter,
  walletRateLimiter,
} from "./middleware/rateLimiter.js";
import { securityHeaders } from "./middleware/securityHeaders.js";

loadEnv();
validateEnv();

import express from "express";
import cors from "cors";
import axios from "axios";
import { ethereumRoutes } from "./routes/ethereum";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const HOST_ENV = process.env.HOST;
const HOST = HOST_ENV || (NODE_ENV === "production" ? "0.0.0.0" : "localhost");

app.use(securityHeaders);

const corsOptions = getCorsOptions();
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10kb" }));

app.use(requestLogger);

app.use(generalRateLimiter);

app.get("/health", async (_req, res) => {
  const apiStatus = {
    status: "ok",
    service: "api",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  const rustApiUrl = process.env.NEXT_PUBLIC_RUST_API_URL;
  let rustApiStatus = {
    status: "unknown",
    service: "rust-apis",
    error: null as string | null,
  };

  try {
    const response = await axios.get(`${rustApiUrl}/health`, {
      timeout: 5000,
    });
    rustApiStatus = {
      status: response.data?.status === "ok" ? "ok" : "error",
      service: "rust-apis",
      error: null,
    };
  } catch (error: any) {
    rustApiStatus = {
      status: "error",
      service: "rust-apis",
      error: error.message || "Failed to connect to Rust API",
    };
  }

  const overallStatus =
    apiStatus.status === "ok" && rustApiStatus.status === "ok"
      ? "ok"
      : "degraded";

  res.status(overallStatus === "ok" ? 200 : 503).json({
    status: overallStatus,
    services: {
      api: apiStatus,
      rustApi: rustApiStatus,
    },
    timestamp: new Date().toISOString(),
  });
});

app.use("/wallet/ethereum", walletRateLimiter, ethereumRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, HOST.includes("https://") ? "0.0.0.0" : HOST, () => {
  const serverUrl = HOST.includes("https://") ? HOST : `http://${HOST}:${PORT}`;
  console.log(`\n🚀 Server is live at ${serverUrl}`);
  console.log(`📊 Rate limiting: Enabled`);
  console.log(`🛡️  Security headers: Enabled`);
});
