import { describe, expect, it } from "vitest";
import type { WalletImportPreview } from "@my-org/zod";
import { flattenImportPreview } from "@/app/lib/utils/import/flattenImportPreview";

const basePreview = (): WalletImportPreview => ({
  solana: { mainnet: { wallets: [] }, devnet: { wallets: [] } },
  ethereum: { mainnet: { wallets: [] }, devnet: { wallets: [] } },
});

describe("flattenImportPreview", () => {
  it("returns only wallets with hasActivity", () => {
    const preview = basePreview();
    preview.solana.devnet.wallets = [
      {
        address: "ActiveSol",
        derivationPath: "m/44'/501'/0'/0'",
        scheme: "standard",
        accountIndex: 0,
        balance: "1000",
        transactions: [],
        hasActivity: true,
      },
      {
        address: "InactiveSol",
        derivationPath: "m/44'/501'/1'/0'",
        scheme: "standard",
        accountIndex: 1,
        balance: "0",
        transactions: [],
        hasActivity: false,
      },
    ];

    const entries = flattenImportPreview(preview);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.address).toBe("ActiveSol");
    expect(entries[0]?.chain).toBe("solana");
    expect(entries[0]?.networkTier).toBe("devnet");
  });

  it("flattens multiple chains and network tiers", () => {
    const preview = basePreview();
    preview.ethereum.devnet.wallets = [
      {
        address: "0xabc",
        derivationPath: "m/44'/60'/0'/0/0",
        scheme: "standard",
        accountIndex: 0,
        balance: "1",
        transactions: [
          {
            signature: "0x1",
            slot: 1,
            block_time: null,
            status: "success",
            err: null,
            confirmation_status: null,
            amount: null,
            fee: null,
            direction: null,
            from_address: null,
            to_address: null,
            memo: null,
          },
        ],
        hasActivity: true,
      },
    ];

    const entries = flattenImportPreview(preview);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.chain).toBe("ethereum");
    expect(entries[0]?.networkTier).toBe("devnet");
  });
});
