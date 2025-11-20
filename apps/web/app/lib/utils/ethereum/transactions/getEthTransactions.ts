import { expressApiClient } from "@api-utils/expressApiClient";
import { GetEthTransactionsParams } from "@/app/types/components/GetEthTransactionsParams";
import {
    TransactionResponse,
    TransactionRequest,
  } from "@api-types/TransactionTypes";

export const getEthTransactions = async ({
    address,
    cluster,
    limit = 20,
  }: GetEthTransactionsParams): Promise<TransactionResponse> => {
    const client = expressApiClient();
  
    const requestData: TransactionRequest = {
      address,
      cluster,
      limit,
    };
  
    const response = await client.post<TransactionResponse>(
      "/wallet/ethereum/transactions", 
      requestData
    );
  
    return response.data;
  };