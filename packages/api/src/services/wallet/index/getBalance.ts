import { BalanceParams } from "@api-types/BalanceParams";
import { getSolBalance } from "@api-service/solana/getSolBalance";
import { checkMissingParams } from "@api-utils/checkMissingParams";
import { getEthBalance } from "@api-service/ethereum/getEthBalance";

export const getBalance = async (params: BalanceParams) => {
  try {
    checkMissingParams(params);

    if (params.chain === "solana") {
      return getSolBalance(params);
    } else if (params.chain === "ethereum") {
      return getEthBalance(params);
    } else {
      throw new Error("Unsupported chain: " + params.chain);
    }
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    throw error;
  }
};
