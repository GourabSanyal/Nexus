import {z} from 'zod'

export const solanaWalletSchema = z.object({
    id: z.number(),
    name: z.string(),
    publicKey: z.string(),
    privateKey: z.string(),
    type: z.literal('solana'),
    mnemonic: z.string().optional(),
    path: z.string().optional(),
})

export const ethereumWalletSchema = z.object({
    id: z.number(),
    name: z.string(),
    publicKey: z.string(),
    privateKey: z.string(),
    type: z.literal('ethereum'),
    mnemonic: z.string().optional(),
    path: z.string().optional(),
})

export const solanaWalletsSchema = z.array(solanaWalletSchema)
export const ethereumWalletsSchema = z.array(ethereumWalletSchema)

export const walletSchema = z.object({
    mnemonicState: z.string(),
    solanaWallets: solanaWalletsSchema.optional(),
    ethereumWallets: ethereumWalletsSchema.optional(),
    activeTab: z.enum(['solana', 'ethereum']).optional(),
})

export type WalletSchema = z.infer<typeof walletSchema>
export type SolanaWallet = z.infer<typeof solanaWalletSchema>
export type EthereumWallet = z.infer<typeof ethereumWalletSchema>