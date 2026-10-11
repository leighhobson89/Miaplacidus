import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function startScanningFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en&economyFixture=space-starship-scanning");
  await page.getByLabel("Pioneer name").fill("Interstellar Presentation Matrix Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.applyDebugAction === "function"))
    .toBe(true);
  expect(
    await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("build-starship")),
  ).toBe(true);
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  await page.getByTestId("starship-scan-system-button").click();
  await expect(page.locator("#tab-interstellar-colonise")).toBeVisible();
}

async function setPresentation(page: Page, locale: LocaleId, theme: ThemeId): Promise<void> {
  await page.evaluate(
    ({ nextLocale, nextTheme }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      }),
    { nextLocale: locale, nextTheme: theme },
  );
  await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);
}

async function visibleTabName(page: Page, tabId: string): Promise<string> {
  return page.locator(`#${tabId}`).evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
}

test("Interstellar child page identity fits every locale, theme, and viewport @p65 @p66 @ui", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await startScanningFixture(page);

  for (const locale of LOCALE_IDS) {
    for (const theme of THEME_IDS) {
      await setPresentation(page, locale, theme);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-interstellar").click();
        const hydrogenTitleSize = await page
          .locator("#panel-resources-hydrogen .pane-heading h2")
          .evaluate((element) => getComputedStyle(element).fontSize);

        const routes = [
          {
            id: "interstellar-star-map",
            panelSelector: "#panel-interstellar-star-map",
            titleSelector: ".pane-heading h2",
            expectedTitle: starMapText(locale, "title"),
            artworkSelector: '.page-artwork-row [data-celestial-illustration="star-system"]',
          },
          {
            id: "interstellar-star-data",
            panelSelector: "#panel-interstellar-star-data",
            titleSelector: ".pane-heading h2",
            expectedTitle: starMapText(locale, "dataView"),
            artworkSelector: '.page-artwork-row [data-celestial-illustration="star-system"]',
          },
          {
            id: "interstellar-starship",
            panelSelector: "#panel-interstellar-starship",
            titleSelector: "#starship-title",
            expectedTitle: starshipText(locale, "title"),
            artworkSelector: null,
            launchedStarship: true,
          },
          {
            id: "interstellar-fleet-hangar",
            panelSelector: "#panel-interstellar-starship",
            titleSelector: "#starship-title",
            expectedTitle: starshipText(locale, "fleetHangar"),
            artworkSelector: '[data-celestial-illustration="fleet"]',
          },
          {
            id: "interstellar-colonise",
            panelSelector: "#panel-interstellar-starship",
            titleSelector: "#starship-title",
            expectedTitle: starshipText(locale, "colonise"),
            artworkSelector: '[data-celestial-illustration="colonised-surface"]',
          },
        ] as const;

        for (const route of routes) {
          const expectedTitle = route.expectedTitle;
          const tab = page.locator(`#tab-${route.id}`);
          await expect(tab, `${locale} ${theme} ${route.id} is available`).toBeVisible();
          await expect.poll(() => visibleTabName(page, `tab-${route.id}`)).toBe(expectedTitle);
          await tab.click();

          const panel = page.locator(route.panelSelector);
          const title = panel.locator(route.titleSelector);
          await expect(panel).toBeVisible();
          await expect(tab).toHaveAttribute("aria-selected", "true");
          await expect(title, `${locale} ${theme} ${route.id} title`).toHaveText(expectedTitle);
          await expect(title, `${locale} ${theme} ${route.id} title scale`).toHaveCSS(
            "font-size",
            hydrogenTitleSize,
          );

          if (route.launchedStarship) {
            const starship = page.getByTestId("starship-pane");
            await expect(starship).toHaveClass(/starship-card-plain/);
            await expect(starship).toHaveCSS("border-width", "0px");
            await expect(starship.locator(".space-card-illustration-wrap")).toHaveCount(0);
            await expect(starship.locator(".space-card-heading .eyebrow")).toHaveCount(0);
          } else {
            await expect(panel.locator(route.artworkSelector!)).toBeVisible();
          }

          const bounds = await page.evaluate(
            ({ panelSelector, titleSelector, artworkSelector }) => {
              const panelElement = document.querySelector<HTMLElement>(panelSelector);
              const titleElement = panelElement?.querySelector<HTMLElement>(titleSelector);
              const artworkElement = artworkSelector
                ? panelElement?.querySelector<HTMLElement>(artworkSelector)
                : undefined;
              return {
                documentWidth: document.documentElement.scrollWidth,
                panelScrollWidth: panelElement?.scrollWidth ?? 0,
                panelClientWidth: panelElement?.clientWidth ?? 0,
                panelLeft: panelElement?.getBoundingClientRect().left ?? 0,
                panelRight: panelElement?.getBoundingClientRect().right ?? 0,
                titleLeft: titleElement?.getBoundingClientRect().left ?? 0,
                titleRight: titleElement?.getBoundingClientRect().right ?? 0,
                artworkLeft: artworkElement?.getBoundingClientRect().left ?? null,
                artworkRight: artworkElement?.getBoundingClientRect().right ?? null,
              };
            },
            route,
          );
          expect(
            bounds.documentWidth,
            `${locale} ${theme} ${route.id} document width at ${viewport.width}px`,
          ).toBeLessThanOrEqual(viewport.width);
          expect(
            bounds.panelScrollWidth,
            `${locale} ${theme} ${route.id} panel width at ${viewport.width}px`,
          ).toBeLessThanOrEqual(bounds.panelClientWidth + 1);
          expect(bounds.panelLeft).toBeGreaterThanOrEqual(0);
          expect(bounds.panelRight).toBeLessThanOrEqual(viewport.width);
          expect(bounds.titleLeft).toBeGreaterThanOrEqual(0);
          expect(bounds.titleRight).toBeLessThanOrEqual(viewport.width);
          if (bounds.artworkLeft !== null && bounds.artworkRight !== null) {
            expect(bounds.artworkLeft).toBeGreaterThanOrEqual(0);
            expect(bounds.artworkRight).toBeLessThanOrEqual(viewport.width);
          }
        }
      }
    }
  }
});
