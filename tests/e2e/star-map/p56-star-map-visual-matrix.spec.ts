import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { stabilizeStarMapVisual } from "./visual-stability";

const VIEWPORTS = [
  { width: 1280, height: 900, key: "desktop" },
  { width: 390, height: 844, key: "phone" },
  { width: 320, height: 740, key: "narrow" },
] as const;

async function startFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("P56 Star Map Visual Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("prepare-run-starship-launch"),
    ),
  ).toBe(true);
  await stabilizeStarMapVisual(page);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

async function setPresentation(
  page: import("@playwright/test").Page,
  locale: LocaleId,
  theme: ThemeId,
): Promise<void> {
  const actual = await page.evaluate(
    async ({ nextLocale, nextTheme }) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      return {
        lang: document.documentElement.lang,
        theme: document.querySelector<HTMLElement>(".game-frame:not(.notification-portal)")
          ?.dataset.theme,
      };
    },
    { nextLocale: locale, nextTheme: theme },
  );
  expect(actual.lang).toBe(locale);
  expect(actual.theme).toBe(theme);
}

test("Star Map route presentation fits all locales, themes, and viewport widths @p56-visual-matrix", async ({
  page,
}, testInfo) => {
  // This runs every locale/theme/viewport combination and captures three visual baselines.
  test.setTimeout(300_000);
  await startFixture(page);

  const reviewed = new Set(["en:terminal:desktop", "fr:frosty:phone", "de:space:narrow"]);
  for (const locale of LOCALE_IDS) {
    for (const theme of THEME_IDS) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await setPresentation(page, locale, theme);
        await page.locator("#tab-interstellar").click();
        await page.locator("#tab-interstellar-star-map").click();

        const map = page.getByTestId("star-map-pane");
        const search = map.getByRole("searchbox", {
          name: starMapText(locale, "searchLabel"),
        });
        await search.fill("Sirius");
        await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();

        const zoomInLabel = starMapText(locale, "zoomIn");
        const geometry = await page.evaluate((expectedZoomLabel) => {
          const visible = (element: Element | null): boolean => {
            if (!element || element.getClientRects().length === 0) return false;
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
          };
          const rect = (element: Element) => {
            const { left, right, top, bottom } = element.getBoundingClientRect();
            return { left, right, top, bottom };
          };
          const mapElement = document.querySelector<HTMLElement>('[data-testid="star-map-pane"]');
          const heading = mapElement?.querySelector<HTMLElement>(":scope > .pane-heading h2");
          const selection = mapElement?.querySelector<HTMLElement>(
            '[data-testid="star-selection"]',
          );
          const selectedHeading = selection?.querySelector<HTMLElement>("h3");
          const distance = selection?.querySelector('[data-testid="star-distance"]');
          const antimatter = selection?.querySelector('[data-testid="star-route-antimatter"]');
          const routeLabel = mapElement?.querySelector('[data-testid="star-map-selected-route-label"]');
          const powerCard = document.querySelector<HTMLElement>('[data-testid="top-stat-power"]');
          const powerValue = powerCard?.querySelector<HTMLElement>(".top-stat-value");
          const powerDuration = powerValue?.querySelector<HTMLElement>("small");
          const zoomButton = Array.from(
            mapElement?.querySelectorAll<HTMLButtonElement>("button[aria-label]") ?? [],
          ).find((button) => button.getAttribute("aria-label") === expectedZoomLabel);
          return {
            documentWidth: Math.max(
              document.documentElement.scrollWidth,
              document.body.scrollWidth,
            ),
            map: mapElement ? rect(mapElement) : null,
            heading: heading ? rect(heading) : null,
            selection: selection ? rect(selection) : null,
            mapVisible: visible(mapElement ?? null),
            headingText: heading?.textContent?.replace(/\s+/g, " ").trim() ?? null,
            headingVisible: visible(heading ?? null),
            selectionHeading: selectedHeading?.textContent?.trim() ?? null,
            selectionHeadingVisible: visible(selectedHeading ?? null),
            distanceVisible: visible(distance),
            antimatterVisible: visible(antimatter),
            routeLabelVisible: visible(routeLabel),
            zoomLabel: zoomButton?.getAttribute("aria-label") ?? null,
            zoomButtonVisible: visible(zoomButton ?? null),
            powerCard: powerCard ? rect(powerCard) : null,
            powerValue: powerValue ? rect(powerValue) : null,
            powerDuration: powerDuration ? rect(powerDuration) : null,
          };
        }, zoomInLabel);
        expect(geometry.mapVisible).toBe(true);
        expect(geometry.headingText).toBe(starMapText(locale, "title"));
        expect(geometry.headingVisible).toBe(true);
        expect(geometry.selectionHeading).toBe("Sirius");
        expect(geometry.selectionHeadingVisible).toBe(true);
        expect(geometry.distanceVisible).toBe(true);
        expect(geometry.antimatterVisible).toBe(true);
        expect(geometry.routeLabelVisible).toBe(true);
        expect(geometry.zoomLabel).toBe(zoomInLabel);
        expect(geometry.zoomButtonVisible).toBe(true);
        expect(
          geometry.documentWidth,
          `${locale}/${theme}/${viewport.width} document width`,
        ).toBeLessThanOrEqual(viewport.width);
        for (const [name, bounds] of Object.entries({
          map: geometry.map,
          heading: geometry.heading,
          selection: geometry.selection,
        })) {
          expect(bounds, `${name} exists`).not.toBeNull();
          expect(
            bounds!.left,
            `${locale}/${theme}/${viewport.width} ${name} left`,
          ).toBeGreaterThanOrEqual(-1);
          expect(
            bounds!.right,
            `${locale}/${theme}/${viewport.width} ${name} right`,
          ).toBeLessThanOrEqual(viewport.width + 1);
        }
        if (geometry.powerCard && geometry.powerValue && geometry.powerDuration) {
          expect(
            geometry.powerValue.right,
            `${locale}/${theme}/${viewport.width} power value stays in its card`,
          ).toBeLessThanOrEqual(geometry.powerCard.right + 1);
          expect(
            geometry.powerDuration.right,
            `${locale}/${theme}/${viewport.width} battery timer stays in its value`,
          ).toBeLessThanOrEqual(geometry.powerValue.right + 1);
        }

        const captureKey = `${locale}:${theme}:${viewport.key}`;
        if (reviewed.has(captureKey)) {
          await captureVisualCheckpoint(
            page,
            testInfo,
            `p56-star-map-${locale}-${theme}-${viewport.key}`,
          );
        }
      }
    }
  }
});
