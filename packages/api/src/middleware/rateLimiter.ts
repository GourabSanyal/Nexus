import rateLimit from "express-rate-limit";
import { Request } from "express";

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.path === "/health", // skip for health checks
});

export const walletRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: "Too many wallet requests, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const sendTransactionRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 45, // 45 requests per 5 minutes per IP
  message: "Too many transaction attempts, please wait.",
  standardHeaders: true,
  legacyHeaders: false,
});

