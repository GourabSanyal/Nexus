import { atom } from "recoil";
import { EthereumWallet } from '@my-org/zod'

export const ethereumWalletsState = atom<EthereumWallet[]>({
    key: "ethereumWalletsState",
    default: []
})

export const ethereumWalletCountState = atom<number>({
    key: "ethereumWalletCountState",
    default: 0
})

export const selectedEthereumWalletState = atom<EthereumWallet | null>({
    key: "selectedEthereumWalletState",
    default: null
})
