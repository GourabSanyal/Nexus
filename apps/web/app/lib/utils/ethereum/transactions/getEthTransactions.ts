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
  
    console.log("🌐 [ETH API] Sending API request to /wallet/ethereum/transactions", {
      endpoint: "/wallet/ethereum/transactions",
      requestData,
    });
  
    const response = await client.post<TransactionResponse>(
      "/wallet/ethereum/transactions", 
      requestData
    );
  
    console.log("✅ [ETH API] Received response from API", {
      transactionCount: response.data?.transactions?.length || 0,
      transactions: response.data?.transactions,
      pagination: response.data?.pagination,
      status: response.status,
    });
  
    return response.data;
  };