import {z} from 'zod'

export const walletSchema = z.object({
    mnemonicState: z.string().optional()
})

export type WalletSchema = z.infer<typeof walletSchema>