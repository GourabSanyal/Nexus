import {
  TransactionResponse,
  TransactionRequest,
} from "@repo/api/types/TransactionTypes";
import { rustApiClient } from "@repo/api/utils/rustApiClient";
import { GetSolanaTransactionsParams } from "@/app/types/components/GetSolanaTransactionsParams";

export const getSolTransactions = async ({
  address,
  cluster,
  limit = 20,
  cursor,
  untilSignature,
}: GetSolanaTransactionsParams): Promise<TransactionResponse> => {
  const client = rustApiClient();

  const requestData: TransactionRequest = {
    address,
    cluster,
    limit,
    cursor,
    untilSignature,
  };

  const response = await client.post<TransactionResponse>(
    "/wallet/solana/transactions",
    requestData
  );

  return response.data;
};
