import { CorsOptions } from "cors";

export function getCorsOptions(): CorsOptions {
  const CORS_ORIGIN = process.env.CORS_ORIGIN;

  if (!CORS_ORIGIN) {
    console.warn("[API Server] WARNING: CORS_ORIGIN is missing in .env file. CORS requests will be denied.");
    return {
      origin: false,
      credentials: true,
      methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }

  return {
    origin: CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
}

