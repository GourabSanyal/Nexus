import { expect, type Locator, type Page } from "@playwright/test";
import { completeVaultPasswordSetup } from "./vault";

export async function generateVaultAndSolanaWallets(
  page: Page,
  count: number
): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Generate Wallet" }).click();
  await completeVaultPasswordSetup(page);
  await expect(
    page.getByRole("heading", { name: "Crypto Wallet Generator" })
  ).toBeVisible();

  for (let i = 0; i < count; i += 1) {
    await page.getByRole("button", { name: "Generate SOL Wallet" }).click();
    await expect(page.getByRole("button", { name: "Send" })).toHaveCount(i + 1, {
      timeout: 20_000,
    });
  }
}

export function walletCards(page: Page): Locator {
  return page.locator("div.border.border-border").filter({
    has: page.getByText("Public Key:"),
  });
}

export async function readWalletAddress(
  page: Page,
  cardIndex: number
): Promise<string> {
  const card = walletCards(page).nth(cardIndex);
  await expect(card).toBeVisible();
  const address = (await card.locator("code").first().textContent())?.trim();
  if (!address || address.length < 32) {
    throw new Error(`Could not read Solana address for wallet card ${cardIndex}`);
  }
  return address;
}

export async function ensureWalletOnDevnet(
  page: Page,
  cardIndex: number
): Promise<void> {
  const card = walletCards(page).nth(cardIndex);
  const toggle = card.getByRole("button", { name: "Toggle network" });
  await expect(toggle).toBeVisible();

  const label = (await toggle.textContent())?.trim() ?? "";
  if (/devnet/i.test(label)) {
    return;
  }

  await toggle.click();
  await expect(toggle).toHaveText(/devnet/i);
}

export async function refreshWalletBalance(
  page: Page,
  cardIndex: number
): Promise<void> {
  const card = walletCards(page).nth(cardIndex);
  await card.getByRole("button", { name: "Refresh" }).click();
}

export async function sendSolFromWallet(
  page: Page,
  fromCardIndex: number,
  recipient: string,
  amount: string
): Promise<void> {
  const card = walletCards(page).nth(fromCardIndex);
  await card.getByRole("button", { name: "Send" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Send" })).toBeVisible();

  const networkToggle = dialog.getByRole("button", { name: "Toggle network" });
  if (await networkToggle.isVisible()) {
    const label = (await networkToggle.textContent())?.trim() ?? "";
    if (!/devnet/i.test(label)) {
      await networkToggle.click();
      await expect(networkToggle).toHaveText(/devnet/i);
    }
  }

  await dialog.getByPlaceholder(/Recipient .* address/i).fill(recipient);
  await dialog.getByPlaceholder("Amount").fill(amount);
  await expect(dialog.getByText("Address looks valid")).toBeVisible();
  await dialog.getByRole("button", { name: "Send", exact: true }).click();

  await expect(page.getByText(/Transaction submitted:/i)).toBeVisible({
    timeout: 90_000,
  });
}

export async function openHistoryAndExpectActivity(
  page: Page,
  cardIndex: number
): Promise<void> {
  const card = walletCards(page).nth(cardIndex);
  await card.getByRole("button", { name: "History" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Transaction History" })
  ).toBeVisible();

  const historyToggle = dialog.getByRole("button", { name: "Toggle network" });
  if (await historyToggle.isVisible()) {
    const label = (await historyToggle.textContent())?.trim() ?? "";
    if (!/devnet/i.test(label)) {
      await historyToggle.click();
      await expect(historyToggle).toHaveText(/devnet/i);
    }
  }

  // History auto-fetches on open; wait for the outbound tx to index.
  await expect(dialog.getByText("No transactions yet.")).toHaveCount(0, {
    timeout: 90_000,
  });
  await expect(dialog.getByText("Signature:")).toBeVisible({ timeout: 90_000 });
}
