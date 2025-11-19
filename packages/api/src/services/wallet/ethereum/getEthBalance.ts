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

  const response = await client.post("/wallet/ethereum/balance", requestPayload);

  if (!response.data?.balance) {
    return BigInt(0);
  }

  try {
    const balance = BigInt(response.data.balance);
    return balance;
  } catch (error: any) {
    console.error(
      `[getEthBalance] Failed to convert balance to BigInt: ${response.data.balance}`,
      error
    );
    return BigInt(0);
  }
};
