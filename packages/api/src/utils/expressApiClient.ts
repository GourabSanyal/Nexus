import axios, { AxiosInstance } from "axios";

export const expressApiClient = (baseURL?: string): AxiosInstance => {
  const apiBaseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  return axios.create({
    baseURL: apiBaseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};



