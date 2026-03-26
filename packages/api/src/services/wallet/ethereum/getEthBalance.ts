import { BalanceParams } from "@api-types/BalanceParams";
import { expressApiClient } from "@api-utils/expressApiClient";

export const getEthBalance = async ({
  address,
  cluster,
}: BalanceParams): Promise<bigint> => {
  const client = expressApiClient();

  const requestPayload = {
    address,
    cluster,
  };

  try {
    const response = await client.post("/wallet/ethereum/balance", requestPayload);

    if (!response.data?.balance) {
      return BigInt(0);
    }

    try {
      const hexBalance = response.data.balance;
      const balance = BigInt(hexBalance);
      return balance;
    } catch (error: any) {
      console.error("Error parsing balance:", error);
      return BigInt(0);
    }
  } catch (error: any) {
    return BigInt(0);
  }
};
