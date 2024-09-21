import { atom } from "recoil";
import { WalletSchema } from '@my-org/zod'

export const walletState =  atom<WalletSchema>({
    key:"walletState",
    default: {
        mnemonicState : undefined
    }
})