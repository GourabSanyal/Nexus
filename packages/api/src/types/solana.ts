import { Request } from "express";
import { NetworkEnum } from "@repo/constants";

export interface SolanaRequest extends Request {
  validatedData?: {
    cluster: NetworkEnum;
    rpcUrl: string;
  };
}
