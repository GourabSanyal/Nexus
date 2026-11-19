// import { BalanceParams } from "../../../types/BalanceParams.js";
// import { rustApiClient } from "../../../utils/rustApiClient.js";

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
