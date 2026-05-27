import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { TransactionResponse } from "@api-types/TransactionTypes";
import { getSolTransactions } from "@/app/lib/utils/getSolTransactions";
import { getEthTransactions } from "@/app/lib/utils/ethereum/transactions/getEthTransactions";
import type { FetchTransactionsParams } from "@/app/types/components/FetchTransactionsParams";

export type { FetchTransactionsParams };

export const fetchTransactions = async ({
  chain,
  address,
  cluster,
  limit = 20,
  cursor,
  untilSignature,
}: FetchTransactionsParams): Promise<TransactionResponse> => {
  switch (chain) {
    case ChainEnum.Solana:
      return getSolTransactions({
        address,
        cluster: cluster as NetworkEnum.Mainnet | NetworkEnum.Devnet,
        limit,
        cursor,
        untilSignature,
      });

    case ChainEnum.Ethereum: {
      return getEthTransactions({
        address,
        cluster: cluster as NetworkEnum.Mainnet | NetworkEnum.Sepolia,
        limit,
        cursor,
        untilSignature,
      });
    }

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};
