import { expect, type Page } from "@playwright/test";

export const E2E_VAULT_PASSWORD = "testpass1";

/** Completes the vault password modal that appears after Generate/Import. */
export async function completeVaultPasswordSetup(
  page: Page,
  password = E2E_VAULT_PASSWORD
): Promise<void> {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Password", { exact: true }).fill(password);
  await dialog.getByLabel("Confirm password").fill(password);
  await dialog.getByRole("button", { name: "Continue" }).click();
}
