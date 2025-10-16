import { BalanceParams } from "@api-types/BalanceParams";
import { BalanceResult } from "@api-types/wallet";
import { solanaApiClient } from "../../../utils/apiClient";

export const getSolBalance = async ({ address, chain, cluster, network }: BalanceParams): Promise<BalanceResult> => {
  try {
    console.log(chain, cluster, network)
    const response = await solanaApiClient.post('/', {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [
        address,
        {
          commitment: "finalized",
        },
      ],
    });
    return { lamports: response.data.result.value, decimals: 9 };
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    throw error;
  }
};