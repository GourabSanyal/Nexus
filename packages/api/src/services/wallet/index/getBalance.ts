import { BalanceParams } from "@api-types/BalanceParams";
import { checkMissingParams } from "@api-utils/checkMissingParams";
import { getEthBalance } from "@api-service/ethereum/getEthBalance";
import { ChainEnum } from "../../../types/network.js";

export const getBalance = async (params: BalanceParams) => {
  checkMissingParams(params);

  if (params.chain === ChainEnum.Ethereum) {
    return getEthBalance(params);
  } else {
    throw new Error("Unsupported chain: " + params.chain);
  }
};
