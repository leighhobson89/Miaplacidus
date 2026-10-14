import type { Page } from "@playwright/test";

/** Run one Test Lab control, then return the app to its normal playable state. */
export async function runTestLabAction(page: Page, buttonName: string): Promise<void> {
  const dialog = page.locator("dialog.debug-tools:not(.debug-scenario-menu)");
  const isAttached = (await dialog.count()) > 0;
  const isOpen = isAttached
    ? await dialog.evaluate((element) => (element as HTMLDialogElement).open)
    : false;
  if (!isOpen) {
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.keyboard.press("NumpadAdd");
    await dialog.waitFor({ state: "visible" });
  }
  await dialog.getByRole("button", { name: buttonName, exact: true }).click();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
}
