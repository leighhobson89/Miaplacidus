import type { Page } from "@playwright/test";

/** Run one Test Lab control, then return the app to its normal playable state. */
export async function runTestLabAction(page: Page, buttonName: string): Promise<void> {
  const dialog = page.locator("dialog.debug-tools");
  await dialog.waitFor({ state: "attached" });
  const isOpen = await dialog.evaluate((element) => (element as HTMLDialogElement).open);
  if (!isOpen) {
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.keyboard.press("NumpadSubtract");
    await dialog.waitFor({ state: "visible" });
  }
  await dialog.getByRole("button", { name: buttonName, exact: true }).click();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}
