import { BalanceParams } from "@api-types/BalanceParams";

export const checkMissingParams = (params: BalanceParams ) => {
  const missingParams: string[] = [];

  if (!params.chain) missingParams.push("chain");
  if (!params.address) missingParams.push("address");
  if (!params.cluster) missingParams.push("cluster");
  if (!params.network) missingParams.push("network");

  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(", ")}`);
  }

  return;
};
