import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { ACHIEVEMENT_CATALOGUE, achievementName } from "../../../src/content/achievements";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { formatNumber } from "../../../src/app/numberFormatting";
import { achievementText } from "../../../src/i18n/achievementMessages";
import { settingsText } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("Achievements route and earned status follow the selected locale @p7-achievement-state-locales @achievements @locale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-visual").click();

  const themeSelector = page.getByTestId("theme-selector");
  for (const themeId of THEME_IDS.slice(1)) {
    await themeSelector.selectOption(themeId);
  }

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const unlockedIds = new Set([
    ...state.run.achievements.unlockedIds,
    ...state.permanent.achievements.unlockedIds,
  ]);
  expect(unlockedIds.has("tryAllThemes"), "visiting all themes should award the achievement").toBe(
    true,
  );
  const unlockedCount = unlockedIds.size;
  const notation = state.settings.notation;

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-settings").click();

    const achievementsTab = page.locator("#tab-settings-achievements");
    await expect(achievementsTab).toHaveText(settingsText(locale, "achievements"));
    await achievementsTab.click();

    const pane = page.getByTestId("achievements-pane");
    await expect(pane.getByRole("heading", { level: 2 })).toHaveText(
      achievementText(locale, "title"),
    );
    await expect(pane.locator(".pane-intro")).toHaveText(achievementText(locale, "description"));
    await expect(pane.locator(".achievement-total strong")).toHaveText(
      formatNumber(locale, unlockedCount, 0, notation),
    );
    await expect(pane.locator(".achievement-total span")).toHaveText(
      achievementText(locale, "unlocked"),
    );

    const earnedAchievement = pane.locator('[data-achievement-id="tryAllThemes"]');
    await expect(earnedAchievement).toHaveClass(/is-earned/);
    await expect(earnedAchievement.locator("h3")).toHaveText(
      achievementName("tryAllThemes", locale),
    );
    await expect(earnedAchievement.locator(".achievement-status")).toHaveAttribute(
      "aria-label",
      `${achievementText(locale, "status")}: ${achievementText(locale, "achieved")}`,
    );

    for (const definition of ACHIEVEMENT_CATALOGUE) {
      const card = pane.locator(`[data-achievement-id="${definition.id}"]`);
      const isEarned = unlockedIds.has(definition.id);
      await expect(card.locator(".achievement-copy p > span")).toHaveText(
        achievementText(locale, "reward"),
      );
      await expect(card.locator(".achievement-copy > small").first()).toHaveText(
        `${achievementText(locale, "resetOnRebirth")}: ${achievementText(
          locale,
          definition.resetOnRebirth ? "yes" : "no",
        )} · ${achievementText(locale, "status")}: ${achievementText(
          locale,
          isEarned ? "achieved" : "notAchieved",
        )}`,
      );
      await expect(card.locator(".achievement-status")).toHaveAttribute(
        "aria-label",
        `${achievementText(locale, "status")}: ${achievementText(
          locale,
          isEarned ? "achieved" : "notAchieved",
        )}`,
      );
    }

    const activeTimeAchievement = pane.locator(
      '[data-achievement-id="have50HoursWithOnePioneer"]',
    );
    await expect(activeTimeAchievement.locator(".achievement-logged-time")).toHaveText(
      new RegExp(`^${achievementText(locale, "logged")}:\\s+\\S`),
    );
  }
});
