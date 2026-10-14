import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { settingsLabel } from "../../../src/i18n/settingsMessages";
import { expect, test } from "../_harness/fixtures";

test("Save Manager storage estimate label is localized in every locale @save-slots @p46-storage-copy", async ({
  page,
}) => {
  await page.goto("/?testSeed=9046&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Storage Copy Sample");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-saves").click();

  const manager = page.getByTestId("save-manager-inline");
  const sizeDetails = manager
    .locator(".save-manager-grid > .save-manager-card")
    .nth(1)
    .locator("p.save-capacity");
  const estimate = sizeDetails.nth(1);
  let activeLocale: LocaleId = "en";

  for (const locale of LOCALE_IDS) {
    if (locale !== activeLocale) {
      await page.locator("#tab-settings-game-options").click();
      await page
        .getByTestId("settings-pane")
        .getByLabel(settingsLabel(activeLocale, "language"))
        .selectOption(locale);
      activeLocale = locale;
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await page.locator("#tab-settings-saves").click();
    }

    await expect(estimate).toBeVisible();
    await expect(estimate).toHaveText(/\S/u);
    await expect(estimate).toContainText(/KB/);
    await expect(sizeDetails.first()).toContainText(/\d[\d,.\s\u00a0\u202f]*\s*KB/u);
    const labelText = (await estimate.textContent())?.replace(/[\d,.\s\u00a0\u202f]*KB/gu, "").trim();
    expect(labelText).toBeTruthy();
  }
});
