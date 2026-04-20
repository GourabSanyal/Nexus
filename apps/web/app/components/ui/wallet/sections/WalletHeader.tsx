"use client";

import { useMemo } from "react";
import { CardHeader } from "../../card/card";
import { WalletTitle } from "./header/WalletTitle";
import { BalancePill } from "./header/BalancePill";
import { ClusterToggle } from "./header/ClusterToggle";
import RefreshButton from "../actions/RefreshButton";
import { InlineActions } from "./header/InlineActions";
import { SmallScreenMenu } from "./header/SmallScreenMenu";
import { WalletHeaderProps } from "@/app/types/wallet/WalletHeaderTypes";
import { useWalletFeatures } from "@/app/hooks/useWalletFeatures";

export const WalletHeader = ({
  wallet,
  balance,
  isRefreshing,
  onRefresh,
  onEditName,
  onDelete,
}: WalletHeaderProps) => {
  const features = useWalletFeatures(wallet);
  
  if (!features) {
    return null;
  }

  const chain = features.chain;

  const balanceToShow = useMemo(() => {
    if (balance === undefined) return "0";
    // Convert string | bigint to number | bigint for formatBalance
    const balanceValue: number | bigint = typeof balance === "string" 
      ? Number(balance) 
      : balance;
    return features.formatBalance(balanceValue);
  }, [balance, features]);

  return (
    <CardHeader className="flex flex-row items-start sm:items-center justify-between space-y-0 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <WalletTitle name={wallet.name} />
        <div className="flex items-center gap-2">
          <BalancePill text={`Balance: ${balanceToShow}`} />
          <ClusterToggle chain={chain} walletId={wallet.id} />
          <RefreshButton
            onClick={onRefresh}
            isRefreshing={isRefreshing}
            className="hidden sm:inline-flex"
          />
        </div>
      </div>

      <SmallScreenMenu
        wallet={wallet}
        onRefresh={onRefresh}
        onEditName={onEditName}
        onDelete={onDelete}
      />

      <InlineActions
        wallet={wallet}
        onEditName={onEditName}
        onDelete={onDelete}
      />
    </CardHeader>
  );
};

export default WalletHeader;
