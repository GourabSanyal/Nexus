import { atom } from "recoil";
import { SolanaWallet } from '@repo/zod'

export const solanaWalletsState = atom<SolanaWallet[]>({
    key: "solanaWalletsState",
    default: []
})

export const solanaWalletCountState = atom<number>({
    key: "solanaWalletCountState",
    default: 0
})

export const selectedSolanaWalletState = atom<SolanaWallet | null>({
    key: "selectedSolanaWalletState",
    default: null
})

// export const solWalletTransactionHistory
