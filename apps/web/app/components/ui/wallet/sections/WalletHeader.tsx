"use client";

import { CardHeader } from "../../card/card";
import { ChainEnum } from "@my-org/store";
import { WalletTitle } from "./header/WalletTitle";
import { BalancePill } from "./header/BalancePill";
import { ClusterToggle } from "./header/ClusterToggle";
import RefreshButton from "../actions/RefreshButton";
import { InlineActions } from "./header/InlineActions";
import { SmallScreenMenu } from "./header/SmallScreenMenu";
import { WalletHeaderProps } from "@/app/types/wallet/WalletHeaderTypes";
import { WalletPath } from "@repo/constants/src/WalletPaths";
import { convertToDisplayBalance } from "@/app/lib/utils/convert";

export const WalletHeader = ({
  wallet,
  balance,
  isRefreshing,
  onRefresh,
  onEditName,
  onDelete,
}: WalletHeaderProps) => {
  const chain =
    wallet.type === "solana" ? ChainEnum.Solana : ChainEnum.Ethereum;

  const balanceToShow =
    balance !== undefined
      ? wallet.type === "solana"
        ? convertToDisplayBalance(balance, WalletPath.SOLANA)
        : convertToDisplayBalance(balance, WalletPath.ETHEREUM)
      : "0";

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
