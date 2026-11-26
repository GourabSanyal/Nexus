import { BalanceParams } from "../../../types/BalanceParams.js";
import { checkMissingParams } from "../../../utils/checkMissingParams.js";
import { getEthBalance } from "../ethereum/getEthBalance.js";
import { ChainEnum } from "@repo/constants";

export const getBalance = async (params: BalanceParams) => {
  checkMissingParams(params);

  if (params.chain === ChainEnum.Ethereum) {
    return getEthBalance(params);
  } else {
    throw new Error("Unsupported chain: " + params.chain);
  }
};
