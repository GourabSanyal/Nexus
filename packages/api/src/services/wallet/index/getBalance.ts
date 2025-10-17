import { BalanceParams } from "@api-types/BalanceParams";
import { getSolBalance } from "../solana/getSolBalance";
import { checkMissingParams } from "@api-utils/checkMissingParams"

export const getSolanaBalance = async (params: BalanceParams) => {
  try {
    checkMissingParams(params);

    if (params.chain === "solana") {
      return getSolBalance(params);
    } else {


      throw new Error("Unsupported chain: " + params.chain);
    }
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    throw error;
  }
};
