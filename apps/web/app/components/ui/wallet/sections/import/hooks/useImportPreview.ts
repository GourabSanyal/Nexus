import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import type { FlatImportWalletEntry } from "@my-org/zod";
import { importWalletState } from "@repo/store/src/atoms/importWalletState";
import { useWalletAdapter } from "@/app/lib/adapters/useWalletAdapter";
import { buildImportWalletEntryId } from "@/app/lib/utils/import/buildImportWalletEntryId";
import { flattenImportPreview } from "@/app/lib/utils/import/flattenImportPreview";
import { importPreviewNetworkToEnum } from "@/app/lib/utils/import/importPreviewNetwork";
import { parseImportBalance } from "@/app/lib/utils/import/parseImportBalance";
import type { ImportPreviewWalletView } from "@/app/types/components/ImportPreviewTypes";
import { useImportPersist } from "./useImportPersist";

const SCHEME_LABELS = {
  standard: "Standard",
  nexus: "Nexus",
  nexusLegacy: "Legacy",
} as const;

const buildWalletView = (
  entry: FlatImportWalletEntry,
  solAdapter: ReturnType<typeof useWalletAdapter>,
  ethAdapter: ReturnType<typeof useWalletAdapter>
): ImportPreviewWalletView => {
  const adapter = entry.chain === "solana" ? solAdapter : ethAdapter;
  const network = importPreviewNetworkToEnum(entry.chain, entry.networkTier);
  const balance = parseImportBalance(entry.chain, entry.balance);

  return {
    entry,
    id: buildImportWalletEntryId(entry),
    chainLabel: adapter?.getChainLabel() ?? entry.chain,
    networkLabel: adapter?.getNetworkDisplayName(network) ?? entry.networkTier,
    networkColorClass:
      adapter?.getNetworkColor(network) ??
      "border-muted-foreground/20 text-muted-foreground",
    currencySymbol: adapter?.getCurrencySymbol() ?? "",
    formattedBalance: adapter?.formatBalance(balance) ?? entry.balance,
    formattedAddress: adapter?.formatAddress(entry.address) ?? entry.address,
    schemeLabel: SCHEME_LABELS[entry.scheme],
    hasActivity: entry.hasActivity,
  };
};

export const useImportPreview = () => {
  const [importState, setImportState] = useRecoilState(importWalletState);
  const { persistSelection, isPersisting } = useImportPersist();
  const solAdapter = useWalletAdapter("solana");
  const ethAdapter = useWalletAdapter("ethereum");

  const activeWallets = useMemo(() => {
    if (!importState.discoveredWallets) {
      return [];
    }
    return flattenImportPreview(importState.discoveredWallets);
  }, [importState.discoveredWallets]);

  const walletViews = useMemo(
    () =>
      activeWallets.map((entry) =>
        buildWalletView(entry, solAdapter, ethAdapter)
      ),
    [activeWallets, solAdapter, ethAdapter]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [importState.discoveredWallets]);

  const toggleWallet = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(walletViews.map((wallet) => wallet.id));
  }, [walletViews]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleConfirm = useCallback(async () => {
    const selected = activeWallets.filter((entry) =>
      selectedIds.includes(buildImportWalletEntryId(entry))
    );

    setImportState((prev) => ({
      ...prev,
      selectedImportWallets: selected,
    }));

    try {
      await persistSelection(selected);
    } catch (error) {
      setImportState((prev) => ({
        ...prev,
        validationErrors: [
          error instanceof Error ? error.message : "Failed to import wallets",
        ],
      }));
    }
  }, [activeWallets, persistSelection, selectedIds, setImportState]);

  return {
    walletViews,
    selectedIds,
    toggleWallet,
    selectAll,
    clearSelection,
    handleConfirm,
    isPersisting,
    isConfirmDisabled: selectedIds.length === 0 || isPersisting,
  };
};
