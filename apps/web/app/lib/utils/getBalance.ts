import { BalanceParams } from "@api-types/BalanceParams";
import { ChainEnum } from "@repo/store/src/enums/network";
import { getSolBalance } from "./getSolBalance";
import { getEthBalance } from "@repo/api/src/services/wallet/ethereum/getEthBalance";
import { checkMissingParams } from "@repo/api/src/utils/checkMissingParams";

export const getBalance = async (params: BalanceParams) => {
  checkMissingParams(params);


  if (params.chain === ChainEnum.Solana) {
    return getSolBalance(params);
  } else if (params.chain === ChainEnum.Ethereum) {
    return getEthBalance(params);
  } else {
    throw new Error("Unsupported chain: " + params.chain);
  }
};

