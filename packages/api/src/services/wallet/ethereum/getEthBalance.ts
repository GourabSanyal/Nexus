import { BalanceParams } from "@api-types/BalanceParams";
import { apiClient } from "@api-utils/apiClient";
import { NetworkEnum } from "@repo/store/src/enums/network";
import { ChainEnum } from "@repo/store/src/enums/network";

export const getEthBalance = async ({
  address,
  chain,
  cluster,
}: BalanceParams) => {
  const client = apiClient(
    chain as ChainEnum.Ethereum,
    cluster as
      | NetworkEnum.Devnet
      | NetworkEnum.Holesky
      | NetworkEnum.Mainnet
      | NetworkEnum.Sepolia
  );

  const response = await client.post("/", {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBalance",
    params: [address, "latest"],
  });

  console.log("res from getEth server:", response);

  return response.data?.result;
};
