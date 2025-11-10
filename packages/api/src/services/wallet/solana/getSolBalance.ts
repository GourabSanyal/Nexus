// import { BalanceParams } from "@api-types/BalanceParams";
// import { rustApiClient } from "@api-utils/rustApiClient";

// export const getSolBalance = async ({ address, cluster }: BalanceParams) => {
//   const client = rustApiClient();
//   const requestData = {
//     address,
//     cluster: cluster as string,
//   };
//   const response = await client.post("/wallet/solana/balance", requestData);
//   // console.log("res ", response?.data)
//   return response.data?.balance as number;
// };
