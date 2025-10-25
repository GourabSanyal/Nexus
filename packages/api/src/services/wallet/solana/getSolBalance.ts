import { BalanceParams } from "@api-types/BalanceParams";
import { apiClient } from "@api-utils/apiClient";
import { NetworkEnum } from "@repo/store/src/enums/network";

export const getSolBalance = async ({
  address,
  chain,
  cluster,
}: BalanceParams) => {
  const client = apiClient(
    chain,
    cluster as NetworkEnum.Devnet | NetworkEnum.Mainnet
  );
  const response = await client.post("/", {
    jsonrpc: "2.0",
    id: 1,
    method: "getBalance",
    params: [address],
  });
  return response.data?.result?.value as number;
};
