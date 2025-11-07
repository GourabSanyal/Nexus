import axios, { AxiosInstance } from "axios";

const RUST_API_BASE_URL = process.env.NEXT_PUBLIC_RUST_API_URL;

export const rustApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: RUST_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

