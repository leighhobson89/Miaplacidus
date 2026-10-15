import { expect, test, type Page } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import { createStarCatalogue } from "../../../src/content/starCatalogue";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { selectStarDestination } from "../../../src/engine/starMapSelectors";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";

const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function startFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("E57 Star Data Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("prepare-run-starship-launch"),
    ),
  ).toBe(true);
}

async function selectLocale(page: Page, locale: LocaleId): Promise<void> {
  const actualLocale = await page.evaluate(async (nextLocale) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: nextLocale },
    });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    return document.documentElement.lang;
  }, locale);
  expect(actualLocale).toBe(locale);
}

async function expectNoPageOverflow(page: Page, width: number): Promise<void> {
  const bounds = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(bounds.viewport).toBe(width);
  expect(bounds.document, `${width}px document width`).toBeLessThanOrEqual(width);
}

test("Star Map route cost and Star Data rows, weather tooltip, and table controls fit at 390/320px in all locales @e57-star-map", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page);

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-interstellar").click();
      await page.locator("#tab-interstellar-star-map").click();
      const map = page.getByTestId("star-map-pane");
      await expect(
        map.getByRole("heading", { name: starMapText(locale, "title"), exact: true }),
      ).toBeVisible();
      const search = map.getByRole("searchbox", { name: starMapText(locale, "searchLabel") });
      await search.fill("Sirius");
      await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();

      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const destination = createStarCatalogue().find((star) => star.name === "Sirius");
      expect(destination, `${locale} Sirius profile`).toBeDefined();
      const plan = starshipTravelPlan(state, destination!.id);
      expect(plan, `${locale} travel quote`).not.toBeNull();
      const preview = selectStarDestination(state, destination!.id).route;
      expect(preview, `${locale} route preview`).not.toBeNull();
      const selection = map.getByTestId("star-selection");
      await expect(selection.getByRole("heading", { name: "Sirius", exact: true })).toBeVisible();
      await expect(selection.getByTestId("star-distance")).toContainText(
        formatNumber(locale, plan!.distanceLy, 2, state.settings.notation),
      );
      await expect(selection.getByTestId("star-route-antimatter")).toHaveText(
        formatNumber(locale, plan!.antimatter, 0, state.settings.notation),
      );
      await expect(selection.getByTestId("star-route-ap")).toHaveText(
        preview!.ascendencyPoints === null
          ? "—"
          : formatNumber(locale, preview!.ascendencyPoints, 0, state.settings.notation),
      );
      const destinationMarker = map.getByTestId(`star-marker-${destination!.id}`);
      await expect(destinationMarker).toHaveAttribute(
        "aria-label",
        `${destination!.name}, ${starMapText(locale, "starType")} ${destination!.starType}, ${formatNumber(locale, plan!.distanceLy, 2, state.settings.notation)} ly`,
      );
      const setDestination = selection.getByRole("button", {
        name: `${starshipText(locale, "setDestination")}: Sirius`,
      });
      await expect(setDestination).toBeEnabled();
      await expect(map.getByTestId("star-map-selected-route")).toHaveClass(/green-ready-text/);
      await expect(map.getByTestId("star-map-selected-route-label")).toContainText(
        `${starMapText(locale, "distance")}:`,
      );
      await expect(map.getByTestId("star-map-selected-route-label")).toContainText(
        `${starMapText(locale, "antimatterRequired")}: ${formatNumber(locale, plan!.antimatter, 0, state.settings.notation)}`,
      );
      await expectNoPageOverflow(page, viewport.width);
      const selectionBounds = await selection.boundingBox();
      expect(selectionBounds).not.toBeNull();
      expect(selectionBounds!.x + selectionBounds!.width).toBeLessThanOrEqual(viewport.width + 1);

      await page.locator("#tab-interstellar-star-data").click();
      const data = page.getByTestId("star-data-view");
      await expect(page.locator("#panel-interstellar-star-data .pane-heading h2")).toHaveText(
        starMapText(locale, "dataView"),
      );
      const table = data.getByTestId("star-data-table");
      const expectedHeaders = [
        starMapText(locale, "sortName"),
        starMapText(locale, "distance"),
        starMapText(locale, "dataType"),
        starMapText(locale, "weather"),
        starMapText(locale, "precipitation"),
        starMapText(locale, "fuel"),
        starMapText(locale, "ascendency"),
        starMapText(locale, "mapColumn"),
        starshipText(locale, "setDestination"),
      ];
      const actualHeaders = await table.locator("thead th").evaluateAll((headers) =>
        headers.map((header) => {
          const copy = header.cloneNode(true) as HTMLElement;
          copy
            .querySelectorAll(".scan-info-tooltip-anchor, button")
            .forEach((control) => control.remove());
          return copy.textContent?.replace(/\s+/g, " ").trim() ?? "";
        }),
      );
      expect(actualHeaders).toEqual(expectedHeaders);
      await expect(data.getByLabel(starMapText(locale, "filterName"))).toBeVisible();
      await expect(data.getByLabel(starMapText(locale, "filterType"))).toBeVisible();
      await expect(data.getByLabel(starMapText(locale, "sortDescending"))).toBeVisible();
      const rows = table.locator("tbody tr");
      await expect(rows.first()).toBeVisible();
      const rowStates = await rows.evaluateAll((elements) =>
        elements.map((row) => {
          const isVisible = (element: Element | null): boolean => {
            if (!element || element.getClientRects().length === 0) return false;
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
          };
          const heading = row.querySelector("th[scope='row']");
          const headingCopy = heading?.cloneNode(true) as HTMLElement | undefined;
          headingCopy?.querySelector(".star-data-factory-marker")?.remove();
          const buttons = Array.from(row.querySelectorAll<HTMLButtonElement>("button"));
          const destination = buttons[1];
          const reasonId = destination?.getAttribute("aria-describedby") ?? null;
          const reason = reasonId ? document.getElementById(reasonId) : null;
          const weather = row.querySelector<HTMLElement>("[data-testid^='star-data-weather-']");
          const weatherIcon = weather?.querySelector(".weather-symbol svg") ?? null;
          return {
            visible: isVisible(row),
            systemName: headingCopy?.textContent?.trim() ?? "",
            mapActionLabel: buttons[0]?.getAttribute("aria-label") ?? null,
            destinationActionLabel: destination?.getAttribute("aria-label") ?? null,
            destinationDisabled: destination?.disabled ?? null,
            reasonId,
            reasonText: reason?.textContent?.trim() ?? "",
            weatherLabel: weather?.getAttribute("aria-label") ?? null,
            weatherTitle: weather?.getAttribute("title") ?? null,
            weatherIconVisible: isVisible(weatherIcon),
          };
        }),
      );
      expect(rowStates.length).toBeGreaterThan(0);
      expect(rowStates[0]?.visible).toBe(true);
      for (const row of rowStates) {
        const systemName = row.systemName;
        const destinationActionName = row.destinationActionLabel;
        expect(row.mapActionLabel).toBe(`${starMapText(locale, "mapTarget")}: ${systemName}`);
        expect(
          [
            `${starshipText(locale, "setDestination")}: ${systemName}`,
            `${starshipText(locale, "destinationSelected")}: ${systemName}`,
          ].includes(destinationActionName ?? ""),
        ).toBe(true);
        if (row.destinationDisabled) {
          expect(row.reasonId).toBeTruthy();
          expect(row.reasonText).not.toBe("");
        }

        const label = row.weatherLabel;
        expect(label).toBeTruthy();
        expect(row.weatherTitle).toBe(label);
        expect(label).toMatch(/\d+%$/);
        const knownWeatherLabels = ["sunny", "cloudy", "rain", "volcano"].map((key) =>
          starMapText(locale, key as "sunny" | "cloudy" | "rain" | "volcano"),
        );
        expect(
          knownWeatherLabels.some((weatherLabel) => label!.startsWith(`${weatherLabel} `)),
        ).toBe(true);
        expect(row.weatherIconVisible).toBe(true);
      }
      const tableScroller = data.locator(".star-data-table-scroll");
      const scrollerBounds = await tableScroller.boundingBox();
      expect(scrollerBounds).not.toBeNull();
      expect(scrollerBounds!.x).toBeGreaterThanOrEqual(-1);
      expect(scrollerBounds!.x + scrollerBounds!.width).toBeLessThanOrEqual(viewport.width + 1);
      await expectNoPageOverflow(page, viewport.width);
    }
  }
});
