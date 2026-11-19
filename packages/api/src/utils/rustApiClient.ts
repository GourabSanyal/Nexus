import { AxiosInstance } from "axios";
import { createSecureAxiosClient } from "./createSecureAxiosClient.js";
import { resolveRustApiBaseUrl } from "./resolveRustApiBaseUrl.js";

export const rustApiClient = (): AxiosInstance => {
  const client = createSecureAxiosClient(resolveRustApiBaseUrl());

  return client;
};
