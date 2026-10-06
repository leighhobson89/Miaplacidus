import type { Page } from "@playwright/test";

export async function setGameLocale(page: Page, locale: string): Promise<void> {
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-game-options").click();
  await page.locator("#settings-language").selectOption(locale);
  await page.locator("#tab-hydrogen").click();
}

export async function setNumberNotation(
  page: Page,
  notation: "condensed" | "standard" | "scientific",
): Promise<void> {
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-visual").click();
  await page.locator("#settings-notation").selectOption(notation);
  await page.locator("#tab-hydrogen").click();
}
