import { TransactionInfo } from "@api-types/TransactionTypes";
import {
  formatAmount,
  formatDate,
  truncateSignature,
} from "../utils/transactionFormatters";
import { ExternalLink } from "lucide-react";
import { NetworkEnum, ChainEnum } from "@my-org/store";

interface TransactionItemProps {
  transaction: TransactionInfo;
  cluster: NetworkEnum;
  chain: ChainEnum;
  currencySymbol: string;
}

function getExplorerUrl(
  signature: string,
  chain: ChainEnum,
  cluster: NetworkEnum
): string {
  if (chain === ChainEnum.Solana) {
    const clusterString =
      cluster === NetworkEnum.Mainnet ? "mainnet" : "devnet";
    return `https://explorer.solana.com/tx/${signature}?cluster=${clusterString}`;
  } else if (chain === ChainEnum.Ethereum) {
    switch (cluster) {
      case NetworkEnum.Mainnet:
        return `https://etherscan.io/tx/${signature}`;
      case NetworkEnum.Sepolia:
        return `https://sepolia.etherscan.io/tx/${signature}`;
      case NetworkEnum.Holesky:
        return `https://holesky.etherscan.io/tx/${signature}`;
      default:
        return `https://etherscan.io/tx/${signature}`;
    }
  }
  return `https://explorer.solana.com/tx/${signature}`;
}

export const TransactionItem = ({
  transaction: tx,
  cluster,
  chain,
  currencySymbol,
}: TransactionItemProps) => {
  // Log for Ethereum transactions only
  if (chain === ChainEnum.Ethereum) {
    console.log("🖼️ [ETH UI] Rendering TransactionItem", {
      signature: tx.signature,
      status: tx.status,
      amount: tx.amount,
      fee: tx.fee,
      direction: tx.direction,
      cluster,
    });
  }

  const explorerUrl = getExplorerUrl(tx.signature, chain, cluster);

  const handleSignatureClick = () => {
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="border border-border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              tx.status === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {tx.status}
          </span>
          {tx.direction && (
            <span
              className={`text-xs px-2 py-1 rounded ${
                tx.direction === "received"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : tx.direction === "sent"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {tx.direction}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(tx.block_time)}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Amount:</span>
          <span
            className={`text-sm font-semibold ${
              tx.amount && tx.amount > 0
                ? "text-green-600 dark:text-green-400"
                : tx.amount && tx.amount < 0
                  ? "text-red-600 dark:text-red-400"
                  : ""
            }`}
          >
            {tx.amount && tx.amount > 0 ? "+" : ""}
            {formatAmount(tx.amount, chain)} {currencySymbol}
          </span>
        </div>

        {tx.fee && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fee:</span>
            <span>
              {formatAmount(tx.fee, chain)} {currencySymbol}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Signature:</span>
          <button
            onClick={handleSignatureClick}
            className="flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3 w-3" />
            {truncateSignature(tx.signature)}
          </button>
        </div>

        {tx.memo && (
          <div className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Memo:</span> {tx.memo}
          </div>
        )}
      </div>
    </div>
  );
};
