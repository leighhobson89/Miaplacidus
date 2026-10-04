import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { ACHIEVEMENT_CATALOGUE } from "../../../src/content/achievements";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { achievementText } from "../../../src/i18n/achievementMessages";
import { settingsLabel, settingsText } from "../../../src/i18n/settingsMessages";

test("shows nine game tabs and permanently awards the all-themes achievement", async ({ page }) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await expect(page.getByRole("tab")).toHaveCount(9);
  await page.getByRole("tab", { name: "Settings" }).click();
  const settings = page.getByTestId("settings-pane");
  await expect(settings).toBeVisible();
  await expect(settings.getByTestId("achievements-pane")).toBeVisible();
  await expect(settings.getByTestId("meta-journal-pane")).toBeVisible();

  const themeSelector = page.getByTestId("theme-selector");
  for (const themeId of THEME_IDS.slice(1)) {
    await themeSelector.selectOption(themeId);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", themeId);
  }
  await expect(settings.locator('[data-achievement-id="tryAllThemes"]')).toHaveClass(/is-earned/);
  const badgeIds = await settings
    .locator("[data-achievement-badge]")
    .evaluateAll((badges) => badges.map((badge) => badge.getAttribute("data-achievement-badge")));
  expect(badgeIds).toEqual(ACHIEVEMENT_CATALOGUE.map(({ id }) => id));

  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await expect(page.getByTestId("theme-selector")).toHaveValue("space");
  await expect(
    page.getByTestId("settings-pane").locator('[data-achievement-id="tryAllThemes"]'),
  ).toHaveClass(/is-earned/);

  let currentLocale = "en" as (typeof LOCALE_IDS)[number];
  for (const locale of LOCALE_IDS) {
    await page
      .getByTestId("settings-pane")
      .getByLabel(settingsLabel(currentLocale, "language"))
      .selectOption(locale);
    currentLocale = locale;
    await expect(
      page.getByRole("heading", { name: settingsText(locale, "title"), exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: achievementText(locale, "title"), exact: true }),
    ).toBeVisible();
  }
});
