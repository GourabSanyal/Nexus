"use client";

import React, { createContext, useContext } from "react";
import { useImportWalletFlow } from "./hooks/useImportWalletFlow";

type ImportWalletSession = ReturnType<typeof useImportWalletFlow>;

const ImportWalletSessionContext = createContext<ImportWalletSession | null>(
  null
);

export const ImportWalletSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = useImportWalletFlow();

  return (
    <ImportWalletSessionContext.Provider value={session}>
      {children}
    </ImportWalletSessionContext.Provider>
  );
};

export const useImportWalletSession = (): ImportWalletSession => {
  const session = useContext(ImportWalletSessionContext);
  if (!session) {
    throw new Error(
      "useImportWalletSession must be used within ImportWalletSessionProvider"
    );
  }
  return session;
};
