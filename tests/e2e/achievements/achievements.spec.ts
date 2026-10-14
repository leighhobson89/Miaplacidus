import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import {
  ACHIEVEMENT_CATALOGUE,
  ACHIEVEMENT_IDS,
  achievementName,
  type AchievementDefinition,
} from "../../../src/content/achievements";
import { ACHIEVEMENT_DESCRIPTIONS } from "../../../src/content/achievementDescriptions.generated";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { achievementText } from "../../../src/i18n/achievementMessages";
import { settingsLabel, settingsText } from "../../../src/i18n/settingsMessages";
import { formatNumber } from "../../../src/app/numberFormatting";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { setGameLocale, setNumberNotation } from "../_harness/settings-controls";

test("shows unlocked game tabs and permanently awards the all-themes achievement", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  const mainTabs = page.getByRole("tablist", { name: "Game sections" }).getByRole("tab");
  expect(await mainTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id))).toEqual([
    "tab-hydrogen",
    "tab-research",
    "tab-galaxy",
    "tab-settings",
    "tab-miaplaedia",
  ]);
  await page.getByRole("tab", { name: "Settings" }).click();
  const settings = page.getByTestId("settings-pane");
  await expect(settings).toBeVisible();
  const settingsTabs = settings.getByRole("tablist").getByRole("tab");
  expect(await settingsTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id))).toEqual([
    "tab-settings-achievements",
    "tab-settings-events",
    "tab-settings-statistics",
    "tab-settings-visual",
    "tab-settings-game-options",
    "tab-settings-saves",
  ]);
  await settings.locator("#tab-settings-events").click();
  await expect(settings.getByTestId("meta-journal-pane")).toBeVisible();
  await settings.locator("#tab-settings-visual").click();

  const themeSelector = page.getByTestId("theme-selector");
  for (const themeId of THEME_IDS.slice(1)) {
    await themeSelector.selectOption(themeId);
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
  }
  await settings.locator("#tab-settings-achievements").click();
  await expect(settings.getByTestId("achievements-pane")).toBeVisible();
  await expect(settings.locator('[data-achievement-id="tryAllThemes"]')).toHaveClass(/is-earned/);
  const badgeIds = await settings
    .locator("[data-achievement-badge]")
    .evaluateAll((badges) => badges.map((badge) => badge.getAttribute("data-achievement-badge")));
  expect(badgeIds).toEqual(ACHIEVEMENT_CATALOGUE.map(({ id }) => id));

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await expect(page.getByTestId("theme-selector")).toHaveValue("space");
  await settings.locator("#tab-settings-achievements").click();
  await expect(
    page.getByTestId("settings-pane").locator('[data-achievement-id="tryAllThemes"]'),
  ).toHaveClass(/is-earned/);
  await settings.locator("#tab-settings-game-options").click();

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
    await settings.locator("#tab-settings-achievements").click();
    await expect(
      page.getByRole("heading", { name: achievementText(locale, "title"), exact: true }),
    ).toBeVisible();
    await expect(
      page.getByTestId("achievements-pane").locator('[data-achievement-id="collect50Hydrogen"] h3'),
    ).toHaveText(achievementName("collect50Hydrogen", locale));
    await settings.locator("#tab-settings-game-options").click();
  }
});

test("P-41 formats the visible unlocked-achievement total in every notation @p41-achievement-count", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.locator("#tab-settings-visual").click();

  const themeSelector = page.getByTestId("theme-selector");
  for (const themeId of THEME_IDS.slice(1)) await themeSelector.selectOption(themeId);
  await page.locator("#tab-settings-achievements").click();
  await expect(page.locator('[data-achievement-id="tryAllThemes"]')).toHaveClass(/is-earned/);

  const unlockedCount = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return new Set([
      ...state.run.achievements.unlockedIds,
      ...state.permanent.achievements.unlockedIds,
    ]).size;
  });
  const total = page.getByTestId("achievements-pane").locator(".achievement-total strong");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notation))
      .toBe(notation);
    await page.getByRole("tab", { name: "Settings" }).click();
    await page.locator("#tab-settings-achievements").click();
    await expect(total).toHaveText(formatNumber("en", unlockedCount, 0, notation));
  }
});

test("P-41 formats a visible achievement cash reward in every notation @p41-achievement-currency", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  const rewardDefinition = ACHIEVEMENT_CATALOGUE.find(
    ({ id }) => id === "discoverBlackHole",
  ) as AchievementDefinition;
  expect(rewardDefinition.reward.type).toBe("cash");
  if (rewardDefinition.reward.type !== "cash")
    throw new Error("Expected a cash achievement reward");

  const renderedRewards: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Settings" }).click();
    await page.locator("#tab-settings-achievements").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const expected = formatCurrency(
      "en",
      rewardDefinition.reward.amount,
      state.settings.currencyId ?? "usd",
      0,
      notation,
    );
    const rewardLine = page
      .locator('[data-achievement-id="discoverBlackHole"]')
      .locator(".achievement-copy p");
    await expect(rewardLine).toContainText(expected);
    renderedRewards[notation] = expected;
  }

  expect(renderedRewards.scientific).not.toBe(renderedRewards.standard);
});

test("P-44 exposes source achievement descriptions by keyboard and hover in every locale @p44-achievement-descriptions", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-rebirth-ready");

  const longestAchievement: Record<(typeof LOCALE_IDS)[number], (typeof ACHIEVEMENT_IDS)[number]> = {
    en: "settleUnoccupiedSystem",
    es: "studyStarMoreThan20LYAway",
    pt: "activateBlackHoleOver10x",
    de: "activateBlackHoleOver10x",
    it: "settleUnoccupiedSystem",
    fr: "activateBlackHoleOver10x",
  };

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-achievements").click();

    const cards = page.getByTestId("achievements-pane").locator("[data-achievement-id]");
    await expect(cards).toHaveCount(ACHIEVEMENT_IDS.length);
    const rendered = await page
      .getByTestId("achievements-pane")
      .locator("[data-achievement-id] [role='tooltip']")
      .evaluateAll((tooltips) =>
        tooltips.map((tooltip) => [
          tooltip.closest("[data-achievement-id]")?.getAttribute("data-achievement-id"),
          tooltip.textContent?.trim(),
        ]),
      );
    expect(rendered).toEqual(
      ACHIEVEMENT_IDS.map((id) => [id, ACHIEVEMENT_DESCRIPTIONS[id][locale]]),
    );

    for (const id of ["collect50Hydrogen", longestAchievement[locale]] as const) {
      const name = achievementName(id, locale);
      const help = page.getByRole("button", {
        name: `${achievementText(locale, "showDescription")}: ${name}`,
      });
      const tooltip = page.locator(`#achievement-description-${id}`);
      await expect(help).toHaveAttribute("aria-describedby", `achievement-description-${id}`);
      await help.focus();
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toHaveText(ACHIEVEMENT_DESCRIPTIONS[id][locale]);

      const bounds = await tooltip.boundingBox();
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewportWidth);
    }
  }
});
