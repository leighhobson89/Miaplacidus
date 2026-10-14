import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import type { LocaleId } from "../../../src/content/ids";
import type { ThemeId } from "../../../src/content/themes";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { philosophyText } from "../../../src/i18n/philosophyMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";

async function startResearchFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Research P-65 Visual Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.dispatch === "function"))
    .toBe(true);
  const tutorialDismissButton = page.getByRole("button", { name: "No thanks", exact: true });
  if (await tutorialDismissButton.isVisible()) await tutorialDismissButton.click();
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect(page.getByTestId("notification-stack").getByTestId("game-notification")).toHaveCount(0);

  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  await page
    .getByRole("button", { name: spaceText("en", "telescopeBuild"), exact: true })
    .click();
  await page
    .getByRole("button", { name: spaceText("en", "studyStars"), exact: true })
    .click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "survey:star-study",
      }),
    ),
  ).toBe(true);
  await page.getByTestId("philosophy-choice").getByRole("button", { name: "Expansionist" }).click();
  await expect(page.getByTestId("game-notification")).toHaveCount(0);
}

async function setPresentation(page: Page, locale: LocaleId, themeId: ThemeId): Promise<void> {
  await page.evaluate(
    ({ nextLocale, nextTheme }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      }),
    { nextLocale: locale, nextTheme: themeId },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
}

test("Research destinations have reviewed desktop and phone visuals across themes and locales @p65-visual-review", async ({
  page,
}, testInfo) => {
  await startResearchFixture(page);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  const cases = [
    {
      pageId: "tab-research-science-buildings",
      panelId: "panel-research-science-buildings",
      titleSelector: ".economy-section-heading > .economy-page-title-row > .game-page-title",
      artworkSelector: ":scope > .page-artwork-row",
      expectedTitle: (locale: LocaleId) => economyLabel(locale, "research"),
      artwork: "laboratory",
      viewport: { width: 1280, height: 900 },
      locale: "en",
      theme: "terminal",
      capture: "p65-research-science-buildings-terminal-en-desktop",
    },
    {
      pageId: "tab-research-science-buildings",
      panelId: "panel-research-science-buildings",
      titleSelector: ".economy-section-heading > .economy-page-title-row > .game-page-title",
      artworkSelector: ":scope > .page-artwork-row",
      expectedTitle: (locale: LocaleId) => economyLabel(locale, "research"),
      artwork: "laboratory",
      viewport: { width: 390, height: 844 },
      locale: "fr",
      theme: "light",
      capture: "p65-research-science-buildings-light-fr-phone",
    },
    {
      pageId: "tab-research-tech-tree",
      panelId: "panel-research-tech-tree",
      titleSelector: ".economy-section-heading > .economy-page-title-row > .game-page-title",
      artworkSelector: ":scope > .page-artwork-row",
      expectedTitle: (locale: LocaleId) => economyLabel(locale, "technologyTree"),
      artwork: "technology",
      viewport: { width: 1280, height: 900 },
      locale: "de",
      theme: "dark",
      capture: "p65-research-tech-tree-dark-de-desktop",
    },
    {
      pageId: "tab-research-tech-tree",
      panelId: "panel-research-tech-tree",
      titleSelector: ".economy-section-heading > .economy-page-title-row > .game-page-title",
      artworkSelector: ":scope > .page-artwork-row",
      expectedTitle: (locale: LocaleId) => economyLabel(locale, "technologyTree"),
      artwork: "technology",
      viewport: { width: 390, height: 844 },
      locale: "pt",
      theme: "terminal",
      capture: "p65-research-tech-tree-terminal-pt-phone",
    },
    {
      pageId: "tab-research-philosophy",
      panelId: "panel-research-philosophy",
      titleSelector: ".philosophy-path-heading .game-page-title",
      artworkSelector: ".philosophy-section .page-artwork-row",
      expectedTitle: (locale: LocaleId) => philosophyText(locale).paths.expansionist.name,
      artwork: "expansionist",
      viewport: { width: 1280, height: 900 },
      locale: "es",
      theme: "galaxy",
      capture: "p65-research-philosophy-galaxy-es-desktop",
    },
    {
      pageId: "tab-research-philosophy",
      panelId: "panel-research-philosophy",
      titleSelector: ".philosophy-path-heading .game-page-title",
      artworkSelector: ".philosophy-section .page-artwork-row",
      expectedTitle: (locale: LocaleId) => philosophyText(locale).paths.expansionist.name,
      artwork: "expansionist",
      viewport: { width: 390, height: 844 },
      locale: "it",
      theme: "space",
      capture: "p65-research-philosophy-space-it-phone",
    },
  ] as const;

  for (const item of cases) {
    const locale = item.locale satisfies LocaleId;
    const theme = item.theme satisfies ThemeId;
    await page.setViewportSize(item.viewport);
    await setPresentation(page, locale, theme);
    await page.locator("#tab-research").click();
    const tab = page.locator(`#${item.pageId}`);
    await tab.click();
    const panel = page.locator(`#${item.panelId}`);
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("aria-labelledby", item.pageId);

    const research = page.getByTestId("economy-research");
    const title = research.locator(`${item.titleSelector}:visible`);
    const artwork = research.locator(`${item.artworkSelector}:visible`);
    await expect(title).toHaveCount(1);
    await expect(title).toHaveText(item.expectedTitle(locale));
    await expect(artwork).toHaveCount(1);
    await expect(
      artwork.locator(
        `[data-${item.artwork === "expansionist" ? "philosophy-art" : "emblem-kind"}='${item.artwork}']`,
      ),
    ).toBeVisible();
    await captureVisualCheckpoint(page, testInfo, item.capture);
  }
});
