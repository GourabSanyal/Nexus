import { atom } from "recoil";
import { SolanaWallet } from '@my-org/zod'

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
