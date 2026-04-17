import { z } from "zod";

export type SendChain = "solana" | "ethereum";

interface SendChainConfig {
  decimals: number;
  validateAddress: (address: string) => boolean;
}

const SEND_CHAIN_CONFIGS: Record<SendChain, SendChainConfig> = {
  ethereum: {
    decimals: 18,
    validateAddress: (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address),
  },
  solana: {
    decimals: 9,
    validateAddress: (address: string) =>
      /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address),
  },
};

const decimalToAtomicUnits = (amount: string, decimals: number): bigint => {
  const normalized = amount.trim();

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new Error("Amount must be a positive decimal number");
  }

  const [whole = "0", fraction = ""] = normalized.split(".");

  if (fraction.length > decimals) {
    throw new Error(`Amount supports up to ${decimals} decimal places`);
  }

  return (
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0")
  );
};

export const getSendChainConfig = (chain: SendChain): SendChainConfig =>
  SEND_CHAIN_CONFIGS[chain];

export const createSendInputSchema = (chain: SendChain, maxAmount?: string) => {
  const config = getSendChainConfig(chain);

  return z
    .object({
      recipient: z.string().trim().min(1, "Recipient address is required"),
      amount: z.string().trim().min(1, "Amount is required"),
    })
    .superRefine(({ recipient, amount }, ctx) => {
      if (!config.validateAddress(recipient)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recipient"],
          message: "Wallet address is not valid",
        });
      }

      let parsedAmount: bigint;

      try {
        parsedAmount = decimalToAtomicUnits(amount, config.decimals);
      } catch (error: any) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: error?.message || "Amount is invalid",
        });
        return;
      }

      if (parsedAmount <= 0n) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Amount must be greater than 0",
        });
      }

      if (maxAmount) {
        try {
          const parsedMaxAmount = decimalToAtomicUnits(
            maxAmount,
            config.decimals
          );

          if (parsedAmount > parsedMaxAmount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["amount"],
              message: "Amount exceeds available balance",
            });
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amount"],
            message: "Unable to validate available balance",
          });
        }
      }
    });
};

export const validateSendInput = (params: {
  chain: SendChain;
  recipient: string;
  amount: string;
  maxAmount?: string;
}) => createSendInputSchema(params.chain, params.maxAmount).safeParse(params);
