import { Request } from "express";
import { NetworkEnum } from "./network.js";

export interface SolanaRequest extends Request {
  validatedData?: {
    cluster: NetworkEnum;
    rpcUrl: string;
  };
}
