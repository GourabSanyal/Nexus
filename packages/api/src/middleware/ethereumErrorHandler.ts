import { Response } from "express";

export function handleEthereumError(
  res: Response,
  error: any,
  defaultMessage: string = "An error occurred"
): void {
  const message = error?.message || defaultMessage;
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(500).json({
    error: defaultMessage,
    message,
    ...(isDevelopment && { details: error?.stack }),
  });
}

