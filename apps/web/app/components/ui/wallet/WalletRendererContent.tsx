import { useMemo } from "react";
import WalletHeader from "./sections/WalletHeader";
import ReceiveModal from "./modals/ReceiveModal";
import SendModal from "./modals/SendModal";
import HistoryModal from "./modals/HistoryModal";
import WalletMainSection from "./sections/WalletMainSection";
import { useWalletFeatures } from "@/app/hooks/useWalletFeatures";
import { Wallet } from "@/app/types/wallet/wallet";

interface WalletRendererContentProps {
  wallet: Wallet;
  getBalance: (walletId: number, network: "solana" | "ethereum", cluster?: string) => string | BigInt;
  isRefreshing: boolean;
  onRefresh: () => void;
  onEditName: (newName: string) => void;
  onDelete: () => void;
  onReceive: (id: number) => void;
  onSend: (id: number) => void;
  onHistory: (id: number) => void;
  receiveOpenById: Record<number, boolean>;
  sendOpenById: Record<number, boolean>;
  historyOpenById: Record<number, boolean>;
  closeReceive: (id: number) => void;
  closeSend: (id: number) => void;
  closeHistory: (id: number) => void;
}

export function WalletRendererContent({
  wallet,
  getBalance,
  isRefreshing,
  onRefresh,
  onEditName,
  onDelete,
  onReceive,
  onSend,
  onHistory,
  receiveOpenById,
  sendOpenById,
  historyOpenById,
  closeReceive,
  closeSend,
  closeHistory,
}: WalletRendererContentProps) {
  const features = useWalletFeatures(wallet);

  const balance = useMemo(() => {
    if (!features) return undefined;
    return getBalance(wallet.id, wallet.type, features.currentNetwork);
  }, [wallet.id, wallet.type, features, getBalance]);

  if (!features) {
    return null;
  }

  return (
    <>
      <WalletHeader
        wallet={wallet}
        balance={balance}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onEditName={onEditName}
        onDelete={onDelete}
      />
      <WalletMainSection
        wallet={wallet}
        onReceive={onReceive}
        onSend={onSend}
        onHistory={onHistory}
      />

      <ReceiveModal
        isOpen={!!receiveOpenById[wallet.id]}
        onClose={() => closeReceive(wallet.id)}
        publicKey={wallet.publicKey}
      />
      <SendModal
        isOpen={!!sendOpenById[wallet.id]}
        onClose={() => closeSend(wallet.id)}
        chain={wallet.type}
        walletId={wallet.id}
        network={wallet.type}
      />
      <HistoryModal
        isOpen={!!historyOpenById[wallet.id]}
        onClose={() => closeHistory(wallet.id)}
        walletId={wallet.id}
      />
    </>
  );
}

