import { ChainEnum, NetworkEnum } from "@repo/store/src/enums/network";
import { TransactionResponse } from "@api-types/TransactionTypes";
import { getSolTransactions } from "@/app/lib/utils/getSolTransactions";
import { getEthTransactions } from "@/app/lib/utils/ethereum/transactions/getEthTransactions";

interface FetchTransactionsParams {
  chain: ChainEnum;
  address: string;
  cluster: NetworkEnum;
  limit?: number;
}

export const fetchTransactions = async ({
  chain,
  address,
  cluster,
  limit = 20,
}: FetchTransactionsParams): Promise<TransactionResponse> => {
  switch (chain) {
    case ChainEnum.Solana:
      return getSolTransactions({
        address,
        cluster: cluster as NetworkEnum.Mainnet | NetworkEnum.Devnet,
        limit,
      });

    case ChainEnum.Ethereum: {
      console.log("🔄 [ETH Utility] fetchTransactions routing to Ethereum", {
        address,
        cluster,
        limit,
      });
      const ethResult = await getEthTransactions({
        address,
        cluster: cluster as NetworkEnum.Mainnet | NetworkEnum.Sepolia | NetworkEnum.Holesky,
        limit,
      });
      console.log("📦 [ETH Utility] Received Ethereum transactions in fetchTransactions", {
        transactionCount: ethResult.transactions?.length || 0,
      });
      return ethResult;
    }

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};
