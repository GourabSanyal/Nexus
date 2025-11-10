// import { TransactionResponse, TransactionRequest } from "@api-types/TransactionTypes";
// import { rustApiClient } from "@api-utils/rustApiClient";
// import { NetworkEnum } from "@repo/store/src/enums/network";

// export interface GetSolTransactionsParams {
//   address: string;
//   cluster: NetworkEnum.Devnet | NetworkEnum.Mainnet;
//   limit?: number;
// }

// const mapNetworkToCluster = (network: NetworkEnum.Devnet | NetworkEnum.Mainnet): string => {
//   switch (network) {
//     case NetworkEnum.Mainnet:
//       return "mainnet";
//     case NetworkEnum.Devnet:
//       return "devnet";
//     default:
//       return "devnet";
//   }
// };

// export const getSolTransactions = async ({
//   address,
//   cluster,
//   limit = 20,
// }: GetSolTransactionsParams): Promise<TransactionResponse> => {
//   const client = rustApiClient();
//   const clusterString = mapNetworkToCluster(cluster);
  
//   const requestData: TransactionRequest = {
//     address,
//     cluster: clusterString,
//     limit,
//   };

//   const response = await client.post<TransactionResponse>(
//     "/wallet/solana/transactions",
//     requestData
//   );

//   console.log("res from server : ", response );

//   return response.data;
// };

