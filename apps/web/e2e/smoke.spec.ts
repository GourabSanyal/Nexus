import { expect, test } from "@playwright/test";
import { completeVaultPasswordSetup } from "./helpers/vault";

test.describe("smoke", () => {
  test("app shell shows entry actions", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Nexus" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Generate Wallet" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Import Wallet" })
    ).toBeVisible();
  });

  test("theme toggle persists across reload", async ({ page }) => {
    await page.goto("/");
    const themeToggle = page.getByRole("button", { name: "Toggle theme" });
    await expect(themeToggle).toBeVisible();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await themeToggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("generate wallet reaches main UI and opens send/receive/history", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Generate Wallet" }).click();
    await completeVaultPasswordSetup(page);

    await expect(
      page.getByRole("heading", { name: "Crypto Wallet Generator" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Generate SOL Wallet" }).click();

    await expect(page.getByRole("button", { name: "Send" }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: "Receive" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "History" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Send" }).first().click();
    await expect(page.getByRole("dialog")).toContainText("Send");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Receive" }).first().click();
    await expect(page.getByRole("dialog")).toContainText("Receive");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "History" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Transaction History" })
    ).toBeVisible();
  });

  test("import wallet opens seed phrase flow", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Import Wallet" }).click();
    await completeVaultPasswordSetup(page);
    await expect(
      page.getByRole("heading", { name: "Import Wallet" })
    ).toBeVisible();
  });
});
