import { BalanceParams } from "@api-types/BalanceParams";
import { expressApiClient } from "@api-utils/expressApiClient";

export const getEthBalance = async ({
  address,
  chain,
  cluster,
}: BalanceParams) => {
  const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
  const client = expressApiClient(apiBaseURL);

  const requestPayload = {
    address,
    cluster,
  };

  let response;
  try {
    response = await client.post("/api/ethereum/balance", requestPayload);
  } catch (error: any) {
    throw error;
  }

  // balance receieved as hex string (e.g., "0x1234...")
  // convert it to BigInt for consistency with solana balances
  if (response.data.balance) {
    try {
      const balance = BigInt(response.data.balance);
      return balance;
    } catch (e) {
      return BigInt(0);
    }
  }

  return BigInt(0);
};
