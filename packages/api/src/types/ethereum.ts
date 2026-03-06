import { Request } from "express";
import { NetworkEnum } from "./network.js";

export interface EthereumRequest extends Request {
  validatedData?: {
    address: string;
    cluster: NetworkEnum;
    rpcUrl: string;
    limit?: number;
  };
}

