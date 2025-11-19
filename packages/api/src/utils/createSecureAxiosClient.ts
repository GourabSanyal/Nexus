import axios, { AxiosInstance } from "axios";

export function createSecureAxiosClient(
  baseURL: string | undefined
): AxiosInstance {
  if (!baseURL) {
    throw new Error("Base URL is required for API client");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const client = axios.create({
    baseURL,
    headers,
    timeout: 30000, // 30 second timeout for all requests
    validateStatus: (status) => status >= 200 && status < 500,
  });

  return client;
}
