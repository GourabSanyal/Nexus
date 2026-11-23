import { AxiosInstance } from "axios";
import { createSecureAxiosClient } from "./createSecureAxiosClient";
import { resolveRustApiBaseUrl } from "./resolveRustApiBaseUrl";

export const rustApiClient = (): AxiosInstance => {
  const client = createSecureAxiosClient(resolveRustApiBaseUrl());

  return client;
};
