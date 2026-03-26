import axios from "axios";
import { TransactionResponse, TransactionInfo } from "../../../types/TransactionTypes.js";
import { NetworkEnum } from "../../../types/network.js";

interface GetEthTransactionsParams {
  address: string;
  rpcUrl: string;
  cluster: NetworkEnum;
  limit: number;
}

export async function getEthTransactions({
  address,
  rpcUrl,
  cluster,
  limit = 20,
}: GetEthTransactionsParams): Promise<TransactionResponse> {
  try {
    // fetch sent or received txns
    async function fetchTransfers(params: Record<string, any>) {
      const response = await axios.post(
        rpcUrl,
        {
          id: 1,
          jsonrpc: "2.0",
          method: "alchemy_getAssetTransfers",
          params: [params],
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );
      if (response.data?.error) {
        throw new Error(
          `Alchemy error: ${response.data.error.message || "Unknown error"}`
        );
      }
      return response.data?.result?.transfers || [];
    }

    // convert limit to hex string, alchemy specific
    const maxCountHex = '0x' + limit.toString(16);

    const sentTransfers = await fetchTransfers({
      fromBlock: "0x0",
      fromAddress: address,
      category: ["external", "erc20", "erc721", "erc1155"],
      withMetadata: true,
      maxCount: maxCountHex,
    });

    const receivedTransfers = await fetchTransfers({
      fromBlock: "0x0",
      toAddress: address,
      category: ["external", "erc20", "erc721", "erc1155"],
      withMetadata: true,
      maxCount: maxCountHex,
    });

    // merge and deduplicate by transaction hash (case-insensitive)
    const allTransfers = [...sentTransfers, ...receivedTransfers];
    const uniqueTransfersMap = new Map<string, any>();
    for (const t of allTransfers) {
      if (t.hash) uniqueTransfersMap.set(t.hash.toLowerCase(), t);
    }
    const mergedTransfers = Array.from(uniqueTransfersMap.values());

    // sort by block number, descending
    mergedTransfers.sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));

    // map to TransactionInfo[]
    const addressLower = address.toLowerCase();
    const transactions: TransactionInfo[] = mergedTransfers.slice(0, limit).map((t) => {
      // if alchemy ever returns failed, use it, else default to 'success'
      let status: string = "success";
      if (typeof t.success !== "undefined") {
        status = t.success ? "success" : "failed";
      }
      let direction: "sent" | "received" | "self" = "received";
      if (t.from && t.to) {
        const fromLower = t.from.toLowerCase();
        const toLower = t.to.toLowerCase();
        if (fromLower === addressLower && toLower === addressLower) direction = "self";
        else if (fromLower === addressLower) direction = "sent";
        else if (toLower === addressLower) direction = "received";
      }
      return {
        signature: t.hash || "",
        slot: parseInt(t.blockNum, 16),
        block_time: t.metadata?.blockTimestamp ? Math.floor(new Date(t.metadata.blockTimestamp).getTime() / 1000) : null,
        status,
        err: status === "failed" ? "failed" : null,
        confirmation_status: null,
        amount: t.value !== undefined ? Number(t.value) : null,
        fee: null,
        direction,
        from_address: t.from || null,
        to_address: t.to || null,
        memo: null,
      };
    });

    return {
      transactions,
      pagination: {
        has_more: mergedTransfers.length > limit,
        next_cursor: null,
        limit,
      },
    };
  } catch (error: any) {
    console.error("[getEthTransactions] Error:", error);
    
    if (error.response?.data?.error) {
      throw new Error(
        `RPC call failed: ${error.response.data.error.message || error.message}`
      );
    } else if (error.request) {
      throw new Error(
        `RPC call failed: No response from server - ${error.message}`
      );
    } else {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }
}
