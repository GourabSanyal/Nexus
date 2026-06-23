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
import { useNativeTokenPrices } from "@/app/hooks/useNativeTokenPrices";
import { formatBalanceUsdDisplay } from "@/app/lib/prices/formatUsdDisplay";
import { parseBalanceString } from "@/app/lib/utils/parseBalanceString";

export const WalletHeader = ({
  wallet,
  balance,
  isRefreshing,
  onRefresh,
  onEditName,
  onDelete,
}: WalletHeaderProps) => {
  const features = useWalletFeatures(wallet);
  const { prices } = useNativeTokenPrices();

  if (!features) {
    return null;
  }

  const chain = features.chain;

  const balanceDisplay = useMemo(() => {
    if (balance === undefined) {
      return formatBalanceUsdDisplay({
        chain,
        network: features.currentNetwork,
        nativeBalance: 0,
        formatBalance: features.formatBalance,
        prices,
      });
    }

    const balanceValue: number | bigint =
      typeof balance === "string"
        ? parseBalanceString(balance)
        : balance;

    return formatBalanceUsdDisplay({
      chain,
      network: features.currentNetwork,
      nativeBalance: balanceValue,
      formatBalance: features.formatBalance,
      prices,
    });
  }, [balance, chain, features, prices]);

  return (
    <CardHeader className="flex flex-row items-start sm:items-center justify-between space-y-0 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <WalletTitle name={wallet.name} />
        <div className="flex items-center gap-2">
          <BalancePill
            text={`Balance: ${balanceDisplay.text}`}
            title={balanceDisplay.title}
          />
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
