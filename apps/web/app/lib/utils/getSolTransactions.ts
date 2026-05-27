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
  cursor,
  untilSignature,
}: GetSolTransactionsParams): Promise<TransactionResponse> => {
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
