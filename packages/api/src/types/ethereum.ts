import { Request } from "express";
import { NetworkEnum } from "@repo/constants";

export interface EthereumRequest extends Request {
  validatedData?: {
    address: string;
    cluster: NetworkEnum;
    rpcUrl: string;
    limit?: number;
  };
}

