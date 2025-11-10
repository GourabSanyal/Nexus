import {
  TransactionResponse,
  TransactionRequest,
} from "@api-types/TransactionTypes";
import { rustApiClient } from "@api-utils/rustApiClient";
import { GetSolTransactionsParams } from "@/app/types/components/GetSolanaTransactionProps";

export const getSolTransactions = async ({
  address,
  cluster,
  limit = 20,
}: GetSolTransactionsParams): Promise<TransactionResponse> => {
  const client = rustApiClient();

  const requestData: TransactionRequest = {
    address,
    cluster,
    limit,
  };

  const response = await client.post<TransactionResponse>(
    "/wallet/solana/transactions",
    requestData
  );

  return response.data;
};
