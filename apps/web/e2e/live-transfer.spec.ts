import { expect, test } from "@playwright/test";
import {
  fundDevnetSol,
  waitForDevnetSolBalance,
} from "./helpers/solanaFaucet";
import {
  ensureWalletOnDevnet,
  generateVaultAndSolanaWallets,
  openHistoryAndExpectActivity,
  readWalletAddress,
  refreshWalletBalance,
  sendSolFromWallet,
  walletCards,
} from "./helpers/solanaWallets";

/**
 * Opt-in Solana transfer against whatever RUST_API_URL the Next proxy uses.
 *
 * Requires E2E_SOLANA_FUNDER_SECRET (public RPC airdrop is closed).
 * Fund that key once at https://faucet.solana.com
 *
 * Local worker:
 *   yarn workspace rust-apis dev
 *   E2E_SOLANA_FUNDER_SECRET='...' yarn test:e2e:solana:local
 *
 * Live worker:
 *   E2E_SOLANA_FUNDER_SECRET='...' yarn test:e2e:solana:live
 */
test.describe("solana live transfer", () => {
  test.skip(
    process.env.E2E_LIVE_TRANSFER !== "1",
    "Set E2E_LIVE_TRANSFER=1 (see yarn test:e2e:solana:local|live)"
  );

  test.describe.configure({ mode: "serial" });
  test.setTimeout(180_000);

  test("fund → send between two SOL wallets on devnet", async ({ page }) => {
    await generateVaultAndSolanaWallets(page, 2);
    await expect(walletCards(page)).toHaveCount(2);

    await ensureWalletOnDevnet(page, 0);
    await ensureWalletOnDevnet(page, 1);

    const sender = await readWalletAddress(page, 0);
    const recipient = await readWalletAddress(page, 1);
    expect(sender).not.toEqual(recipient);

    // ~0.05 SOL covers a 0.01 UI send + fees
    await fundDevnetSol(sender, 0.05);
    await waitForDevnetSolBalance(sender, 0.04);

    await refreshWalletBalance(page, 0);
    await expect(walletCards(page).nth(0)).toContainText(/Balance:.*SOL/i);

    const transferAmount = "0.01";
    await sendSolFromWallet(page, 0, recipient, transferAmount);

    await waitForDevnetSolBalance(recipient, 0.009);
    await refreshWalletBalance(page, 1);
    await expect(walletCards(page).nth(1)).toContainText(/Balance:.*SOL/i);

    await openHistoryAndExpectActivity(page, 0);
  });
});
