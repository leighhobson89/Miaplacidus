import type { Page } from "@playwright/test";

export async function saveNowFromSettings(page: Page): Promise<void> {
  const previousTabId = await page.locator(".game-nav .nav-tab.is-selected").getAttribute("id");
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-saves").click();
  await page.getByTestId("save-now").click();
  if (previousTabId && previousTabId !== "tab-settings") {
    await page.locator(`#${previousTabId}`).click();
  }
}

export async function openSaveManager(page: Page): Promise<void> {
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-saves").click();
  await page.getByTestId("save-manager-open").click();
}

export async function openSaveSettings(page: Page): Promise<void> {
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-saves").click();
}

export async function resumeSavedPioneer(page: Page, name: string): Promise<void> {
  await page.locator("#pioneer-name").fill(name);
  await page.getByRole("option").getByText(name, { exact: true }).click();
  await page.getByTestId("start-game").click();
}
