import { BalanceParams } from "@api-types/BalanceParams";
import { getSolBalance } from "@api-service/solana/getSolBalance";
import { checkMissingParams } from "@api-utils/checkMissingParams";
import { getEthBalance } from "@api-service/ethereum/getEthBalance";
import { ChainEnum } from "@repo/store/src/enums/network"

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
