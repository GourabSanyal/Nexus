import { AxiosInstance } from "axios";
import { createSecureAxiosClient } from "./createSecureAxiosClient";

export const expressApiClient = (): AxiosInstance => {
  const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NODE_ENV === "development") {
    console.log("Express API base URL:", apiBaseURL);
  }

  return createSecureAxiosClient(apiBaseURL);
};
