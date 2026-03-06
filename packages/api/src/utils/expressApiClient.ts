import { AxiosInstance } from "axios";
import { createSecureAxiosClient } from "./createSecureAxiosClient";

export const expressApiClient = (): AxiosInstance => {
  const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
  return createSecureAxiosClient(apiBaseURL);
};
