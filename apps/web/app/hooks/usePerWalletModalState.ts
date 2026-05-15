import { useCallback, useState } from "react";

/** Receive / send / history modal open flags keyed by wallet id. */
export function usePerWalletModalState() {
  const [receiveOpenById, setReceiveOpenById] = useState<
    Record<number, boolean>
  >({});
  const [sendOpenById, setSendOpenById] = useState<Record<number, boolean>>({});
  const [historyOpenById, setHistoryOpenById] = useState<
    Record<number, boolean>
  >({});

  const openReceive = useCallback((id: number) => {
    setReceiveOpenById((p) => ({ ...p, [id]: true }));
  }, []);

  const closeReceive = useCallback((id: number) => {
    setReceiveOpenById((p) => ({ ...p, [id]: false }));
  }, []);

  const openSend = useCallback((id: number) => {
    setSendOpenById((p) => ({ ...p, [id]: true }));
  }, []);

  const closeSend = useCallback((id: number) => {
    setSendOpenById((p) => ({ ...p, [id]: false }));
  }, []);

  const openHistory = useCallback((id: number) => {
    setHistoryOpenById((p) => ({ ...p, [id]: true }));
  }, []);

  const closeHistory = useCallback((id: number) => {
    setHistoryOpenById((p) => ({ ...p, [id]: false }));
  }, []);

  return {
    receiveOpenById,
    sendOpenById,
    historyOpenById,
    openReceive,
    closeReceive,
    openSend,
    closeSend,
    openHistory,
    closeHistory,
  };
}
