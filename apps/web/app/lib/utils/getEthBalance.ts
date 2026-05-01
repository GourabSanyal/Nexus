import { BalanceParams } from "@api-types/BalanceParams";
import { rustApiClient } from "@api-utils/rustApiClient";

export const getEthBalance = async ({
  address,
  cluster,
}: BalanceParams): Promise<bigint> => {
  const client = rustApiClient();
  const requestData = {
    address,
    cluster: cluster as string,
  };

  const response = await client.post("/wallet/ethereum/balance", requestData);
  const balance = response.data?.balance;

  if (!balance) {
    return BigInt(0);
  }

  try {
    return BigInt(balance);
  } catch {
    return BigInt(0);
  }
};
