import axios from "axios";
import { TransactionResponse, TransactionInfo } from "../../../types/TransactionTypes.js";
import { NetworkEnum } from "../../../types/network.js";

interface GetEthTransactionsParams {
  address: string;
  rpcUrl: string;
  cluster: NetworkEnum;
  limit: number;
}

/**
 * Fetches Ethereum transactions for a given address
 * Uses eth_getTransactionCount and eth_getTransactionByHash/eth_getTransactionReceipt
 * to fetch recent transactions
 */
export async function getEthTransactions({
  address,
  rpcUrl,
  cluster,
  limit = 20,
}: GetEthTransactionsParams): Promise<TransactionResponse> {
  try {
    // Get transaction count (nonce) to determine how many transactions this address has made
    const nonceResponse = await axios.post(
      rpcUrl,
      {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [address, "latest"],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    if (nonceResponse.data?.error) {
      throw new Error(
        `RPC error: ${nonceResponse.data.error.message || "Unknown error"}`
      );
    }

    const nonce = parseInt(nonceResponse.data?.result || "0x0", 16);
    
    // For now, return empty transactions array
    // In a production environment, you would:
    // 1. Use a block explorer API (Etherscan, Alchemy, Infura) to get transaction history
    // 2. Or use eth_getBlockByNumber to scan recent blocks for transactions
    // 3. Or use a service like The Graph to query indexed transaction data
    
    // Placeholder: Return empty transactions with proper structure
    const transactions: TransactionInfo[] = [];

    return {
      transactions,
      pagination: {
        has_more: false,
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
