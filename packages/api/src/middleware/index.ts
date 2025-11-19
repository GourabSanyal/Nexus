import { Request, Response, NextFunction } from "express";

const NODE_ENV = process.env.NODE_ENV || "development";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (NODE_ENV === "development") {
    console.log(`[API Server: DEV] ${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
    });
  }
  next();
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("[API Server:DEV] Unhandled error:", err);
  res.status(500).json({
    error: NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}

export { validateEthereumRequest } from "./validateEthereumRequest.js";
