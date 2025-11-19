import { AxiosInstance, AxiosError } from "axios";
import { createSecureAxiosClient } from "./createSecureAxiosClient";

const RUST_API_BASE_URL = process.env.NEXT_PUBLIC_RUST_API_URL;

export const rustApiClient = (): AxiosInstance => {
  const client = createSecureAxiosClient(RUST_API_BASE_URL);

  return client;
};
