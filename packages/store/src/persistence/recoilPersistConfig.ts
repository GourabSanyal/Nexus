import { recoilPersist } from 'recoil-persist';

export const WALLET_STATE_STORAGE_KEY = 'wallet-state';
export const WALLET_VAULT_STORAGE_KEY = 'wallet-vault';
const LEGACY_WALLET_STATE_STORAGE_KEY = 'recoil-persist-wallet-state';

export const { persistAtom } = recoilPersist({
  key: WALLET_STATE_STORAGE_KEY,
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  }
});

export const { persistAtom: vaultPersistAtom } = recoilPersist({
  key: WALLET_VAULT_STORAGE_KEY,
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  }
});

/** Removes all wallet + vault keys from localStorage (call after Recoil atom resets). */
export const clearWalletPersistenceFromStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(WALLET_STATE_STORAGE_KEY);
  localStorage.removeItem(WALLET_VAULT_STORAGE_KEY);
  localStorage.removeItem(LEGACY_WALLET_STATE_STORAGE_KEY);
  localStorage.removeItem('import-wallet-state');
};
