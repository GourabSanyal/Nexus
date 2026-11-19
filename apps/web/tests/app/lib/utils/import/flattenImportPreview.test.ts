import { describe, expect, it } from "vitest";
import type { WalletImportPreview } from "@repo/zod";
import {
  flattenImportPreview,
  walletHasOnChainActivity,
} from "@/app/lib/utils/import/flattenImportPreview";

const basePreview = (): WalletImportPreview => ({
  solana: { mainnet: { wallets: [] }, devnet: { wallets: [] } },
  ethereum: { mainnet: { wallets: [] }, devnet: { wallets: [] } },
});

const walletEntry = (
  overrides: Partial<WalletImportPreview["solana"]["mainnet"]["wallets"][0]> &
    Pick<
      WalletImportPreview["solana"]["mainnet"]["wallets"][0],
      "address" | "derivationPath"
    >
) => ({
  scheme: "standard" as const,
  accountIndex: 0,
  balance: "0",
  transactions: [],
  hasActivity: false,
  ...overrides,
});

describe("walletHasOnChainActivity", () => {
  it("returns true for non-zero balance", () => {
    expect(
      walletHasOnChainActivity({
        hasActivity: false,
        balance: "1597805000",
        transactions: [],
      })
    ).toBe(true);
  });

  it("returns true for hex balance", () => {
    expect(
      walletHasOnChainActivity({
        hasActivity: false,
        balance: "0x6bfd71e1320e30",
        transactions: [],
      })
    ).toBe(true);
  });

  it("returns true when transactions exist", () => {
    expect(
      walletHasOnChainActivity({
        hasActivity: false,
        balance: "0",
        transactions: [
          {
            signature: "sig",
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
      })
    ).toBe(true);
  });

  it("returns false for empty wallets", () => {
    expect(
      walletHasOnChainActivity({
        hasActivity: false,
        balance: "0",
        transactions: [],
      })
    ).toBe(false);
  });
});

describe("flattenImportPreview", () => {
  it("returns only wallets with balance or transactions", () => {
    const preview = basePreview();
    preview.solana.devnet.wallets = [
      walletEntry({
        address: "ActiveSol",
        derivationPath: "m/44'/501'/0'/0'",
        balance: "1000",
        hasActivity: true,
      }),
      walletEntry({
        address: "InactiveSol",
        derivationPath: "m/44'/501'/1'/0'",
        accountIndex: 1,
      }),
    ];

    const entries = flattenImportPreview(preview);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.address).toBe("ActiveSol");
  });

  it("keeps activity from mainnet when devnet is empty", () => {
    const preview = basePreview();
    const shared = walletEntry({
      address: "SharedSol",
      derivationPath: "m/44'/501'/0'/0'",
      balance: "1000",
      hasActivity: true,
    });

    preview.solana.mainnet.wallets = [shared];
    preview.solana.devnet.wallets = [
      {
        ...shared,
        balance: "0",
        hasActivity: false,
        transactions: [],
      },
    ];

    const entries = flattenImportPreview(preview);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.balance).toBe("1000");
  });

  it("includes all six active wallets across chains and networks", () => {
    const preview = basePreview();
    preview.solana.mainnet.wallets = [
      walletEntry({
        address: "SolMain0",
        derivationPath: "m/44'/501'/0'/0'",
        balance: "1000",
        hasActivity: true,
      }),
      walletEntry({
        address: "SolMain1",
        derivationPath: "m/44'/501'/1'/0'",
        accountIndex: 1,
        balance: "2000",
        hasActivity: true,
      }),
    ];
    preview.solana.devnet.wallets = [
      walletEntry({
        address: "SolDev0",
        derivationPath: "m/44'/501'/2'/0'",
        accountIndex: 2,
        balance: "3000",
        hasActivity: true,
      }),
    ];
    preview.ethereum.mainnet.wallets = [
      walletEntry({
        address: "0xEthMain0",
        derivationPath: "m/44'/60'/0'/0/0",
        balance: "0x1",
        hasActivity: true,
      }),
      walletEntry({
        address: "0xEthMain1",
        derivationPath: "m/44'/60'/0'/0/1",
        accountIndex: 1,
        balance: "0x2",
        hasActivity: true,
      }),
    ];
    preview.ethereum.devnet.wallets = [
      walletEntry({
        address: "0xEthDev0",
        derivationPath: "m/44'/60'/0'/0/2",
        accountIndex: 2,
        balance: "0x3",
        hasActivity: true,
      }),
    ];

    const entries = flattenImportPreview(preview);
    expect(entries).toHaveLength(6);
    expect(entries.filter((entry) => entry.chain === "solana")).toHaveLength(3);
    expect(entries.filter((entry) => entry.chain === "ethereum")).toHaveLength(3);
  });
});
