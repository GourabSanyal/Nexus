import {z} from 'zod'

export const privateKeyPasswordSchema = z.object({
    password: z.string().min(8, "Passaword must be at least 8 characters")
})

