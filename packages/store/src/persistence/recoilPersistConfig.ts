import { recoilPersist } from 'recoil-persist';

export const { persistAtom } = recoilPersist({
  key: 'wallet-state',
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  }
});
