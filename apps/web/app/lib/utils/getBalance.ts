import { BalanceParams } from "@api-types/BalanceParams";
import { ChainEnum } from "@repo/store/src/enums/network";
import { getSolBalance } from "./getSolBalance";
import { getEthBalance } from "./getEthBalance";
import { checkMissingParams } from "@repo/api/src/utils/checkMissingParams";
import { checkInternet } from "./internet";

export const getBalance = async (params: BalanceParams): Promise<bigint> => {
  checkInternet();
  checkMissingParams(params);

  switch (params.chain) {
    case ChainEnum.Solana:
      return getSolBalance(params);
    case ChainEnum.Ethereum:
      return getEthBalance(params);
    default:
      throw new Error("Unsupported chain: " + params.chain);
  }
};
