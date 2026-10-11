import type { TestInfo } from "@playwright/test";
import { expect, test, type Page } from "../_harness/fixtures";
import { createStarCatalogue } from "../../../src/content/starCatalogue";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { topStatusText } from "../../../src/i18n/topStatusMessages";

const PHONE_VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
] as const;

async function startInterstellarFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("P51 Interstellar Visual Review");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("prepare-run-starship-launch"),
    ),
  ).toBe(true);
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "fr", themeId: "terminal" },
    }),
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", "terminal");
}

async function expectDocumentFits(page: Page, width: number): Promise<void> {
  const bounds = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(bounds.viewport).toBe(width);
  expect(bounds.document, `${width}px document width`).toBeLessThanOrEqual(width);
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(name);
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

test("P-51 French Star Data and Starship phone detail fits at 320/390px @p51-interstellar-visual @star-map @presentation", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startInterstellarFixture(page);

  for (const viewport of PHONE_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-star-data").click();

    const weatherSummary = page.getByTestId("location-status").locator(".location-status-summary");
    await weatherSummary.focus();
    const weatherTooltip = page.locator("#location-status-tooltip");
    await expect(weatherTooltip).toBeVisible();
    await expect(weatherTooltip).toContainText(topStatusText("fr", "weather"));
    await expect(weatherTooltip).toContainText(topStatusText("fr", "precipitationRate"));
    await expect(weatherTooltip).toContainText(topStatusText("fr", "precipitationThisRun"));

    const tooltipBounds = await weatherTooltip.boundingBox();
    expect(tooltipBounds).not.toBeNull();
    expect(tooltipBounds!.x, `${viewport.width}px weather tooltip left`).toBeGreaterThanOrEqual(0);
    expect(
      tooltipBounds!.x + tooltipBounds!.width,
      `${viewport.width}px weather tooltip right`,
    ).toBeLessThanOrEqual(viewport.width + 1);
    expect(tooltipBounds!.y, `${viewport.width}px weather tooltip top`).toBeGreaterThanOrEqual(0);
    expect(
      tooltipBounds!.y + tooltipBounds!.height,
      `${viewport.width}px weather tooltip bottom`,
    ).toBeLessThanOrEqual(viewport.height + 1);

    const starData = page.getByTestId("star-data-view");
    const table = starData.getByTestId("star-data-table");
    const scroller = starData.locator(".star-data-table-scroll");
    const scrollMetrics = await scroller.evaluate((element) => {
      const node = element as HTMLElement;
      node.scrollLeft = node.scrollWidth;
      return {
        scrollLeft: node.scrollLeft,
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
      };
    });
    expect(scrollMetrics.scrollWidth).toBeGreaterThan(scrollMetrics.clientWidth);
    expect(scrollMetrics.scrollLeft).toBeGreaterThan(0);
    expect(scrollMetrics.scrollLeft + scrollMetrics.clientWidth).toBeGreaterThanOrEqual(
      scrollMetrics.scrollWidth - 1,
    );

    const firstRow = table.locator("tbody tr").first();
    const destinationAction = firstRow.locator("td:last-child button");
    await expect(destinationAction).toBeVisible();
    expect(await destinationAction.getAttribute("aria-label")).toContain(":");
    await scroller.scrollIntoViewIfNeeded();
    const tableActionBounds = await page.evaluate(() => {
      const scroller = document.querySelector<HTMLElement>(".star-data-table-scroll")!;
      const action = document.querySelector<HTMLElement>(
        ".star-data-table tbody tr:first-child td:last-child button",
      )!;
      const scroll = scroller.getBoundingClientRect();
      const button = action.getBoundingClientRect();
      return {
        scroll: { left: scroll.left, right: scroll.right },
        action: { left: button.left, right: button.right },
      };
    });
    expect(tableActionBounds.action.left).toBeGreaterThanOrEqual(tableActionBounds.scroll.left - 1);
    expect(tableActionBounds.action.right).toBeLessThanOrEqual(tableActionBounds.scroll.right + 1);
    const disabledReasonBounds = await page.evaluate(() => {
      const scroller = document.querySelector<HTMLElement>(".star-data-table-scroll")!;
      const scroll = scroller.getBoundingClientRect();
      return Array.from(
        document.querySelectorAll<HTMLElement>(
          ".star-data-table tbody tr td:last-child .control-reason",
        ),
      ).map((reason) => {
        const bounds = reason.getBoundingClientRect();
        return {
          left: bounds.left,
          right: bounds.right,
          scrollLeft: scroll.left,
          scrollRight: scroll.right,
        };
      });
    });
    expect(disabledReasonBounds.length).toBeGreaterThan(0);
    for (const bounds of disabledReasonBounds) {
      expect(bounds.left).toBeGreaterThanOrEqual(bounds.scrollLeft - 1);
      expect(bounds.right).toBeLessThanOrEqual(bounds.scrollRight + 1);
    }
    await expectDocumentFits(page, viewport.width);
    if (viewport.width === 320) {
      await capture(page, testInfo, "p51-star-data-fr-terminal-320-table-end-weather-tooltip.png");
    }
    await weatherSummary.evaluate((element) => (element as HTMLElement).blur());

    await page.locator("#tab-interstellar-star-map").click();
    const starMap = page.getByTestId("star-map-pane");
    await starMap.getByRole("searchbox", { name: starMapText("fr", "searchLabel") }).fill("Sirius");
    await starMap.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
    const sirius = createStarCatalogue().find((star) => star.name === "Sirius");
    expect(sirius).toBeDefined();
    const currentDestination = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
    );
    if (currentDestination !== sirius!.id) {
      await starMap
        .getByTestId("star-selection")
        .getByRole("button", {
          name: new RegExp(`^${starshipText("fr", "setDestination")}: Sirius$`),
        })
        .click();
    }

    await page.locator("#tab-interstellar-starship").click();
    const starship = page.getByTestId("starship-pane");
    const launch = starship.getByRole("button", {
      name: starshipText("fr", "launch"),
      exact: true,
    });
    await expect(launch).toBeEnabled();
    await expect(starship.locator(".starship-travel-summary .space-cost-list")).toBeVisible();
    await launch.click();
    const dialog = page.getByRole("dialog", {
      name: starshipText("fr", "pointOfNoReturnTitle"),
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(starshipText("fr", "pointOfNoReturn"));
    const cancel = dialog.getByRole("button", { name: starshipText("fr", "cancelLaunch") });
    const confirm = dialog.getByRole("button", { name: starshipText("fr", "confirmLaunch") });
    await expect(cancel).toBeVisible();
    await expect(confirm).toBeVisible();
    const dialogGeometry = await page.evaluate(() => {
      const node = document.querySelector<HTMLElement>(".starship-launch-dialog")!;
      const rect = node.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const outside = Array.from(node.querySelectorAll<HTMLElement>("button"))
        .filter((button) => button.getClientRects().length > 0)
        .map((button) => {
          const bounds = button.getBoundingClientRect();
          return {
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
            bottom: bounds.bottom,
          };
        })
        .filter(
          (bounds) =>
            bounds.left < rect.left - 1 ||
            bounds.right > rect.right + 1 ||
            bounds.top < rect.top - 1 ||
            bounds.bottom > rect.bottom + 1,
        );
      return {
        rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
        viewportWidth,
        viewportHeight,
        outside,
      };
    });
    expect(dialogGeometry.rect.left).toBeGreaterThanOrEqual(0);
    expect(dialogGeometry.rect.right).toBeLessThanOrEqual(viewport.width + 1);
    expect(dialogGeometry.rect.top).toBeGreaterThanOrEqual(0);
    expect(dialogGeometry.rect.bottom).toBeLessThanOrEqual(viewport.height + 1);
    expect(dialogGeometry.outside).toEqual([]);
    await expectDocumentFits(page, viewport.width);
    if (viewport.width === 320) {
      await capture(page, testInfo, "p51-starship-fr-terminal-320-launch-dialog.png");
    }
    await cancel.click();
    await expect(dialog).toBeHidden();
    await expect(launch).toBeEnabled();
  }
});
