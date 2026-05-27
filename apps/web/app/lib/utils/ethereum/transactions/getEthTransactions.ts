import { rustApiClient } from "@api-utils/rustApiClient";
import { GetEthTransactionsParams } from "@/app/types/components/GetEthTransactionsParams";
import {
    TransactionResponse,
    TransactionRequest,
  } from "@api-types/TransactionTypes";

export const getEthTransactions = async ({
    address,
    cluster,
    limit = 20,
    cursor,
    untilSignature,
  }: GetEthTransactionsParams): Promise<TransactionResponse> => {
    const client = rustApiClient();
  
    const requestData: TransactionRequest = {
      address,
      cluster,
      limit,
      cursor,
      untilSignature,
    };
  
    const response = await client.post<TransactionResponse>(
      "/wallet/ethereum/transactions", 
      requestData
    );
  
    return response.data;
  };