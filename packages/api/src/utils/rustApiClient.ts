import axios, { AxiosInstance, AxiosError } from "axios";
// import { checkInternet } from "@repo/api/src/services/shared/checkInternet";
import { NetworkConnectionEnum } from "@repo/store/src/enums/network";

const RUST_API_BASE_URL = process.env.NEXT_PUBLIC_RUST_API_URL;

export const rustApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: RUST_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // client.interceptors.request.use(
  //   (config) => {
  //     if (!checkInternet()) {
  //       return Promise.reject(new Error(NetworkConnectionEnum.NoInternet));
  //     }
  //     return config;
  //   },
  //   (error: AxiosError) => {
  //     return Promise.reject(error);
  //   }
  // );

  return client;
};
