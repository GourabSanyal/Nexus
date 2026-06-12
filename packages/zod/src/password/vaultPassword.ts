import { z } from "zod";

export const vaultPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const vaultPasswordSetupSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
