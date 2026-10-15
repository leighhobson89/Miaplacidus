import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

async function expectSelectedTabVisibleInRail(
  page: import("@playwright/test").Page,
  tab: import("@playwright/test").Locator,
  railSelector: string,
  viewportWidth: number,
  shouldWrap = false,
): Promise<void> {
  const bounds = await page.evaluate(
    ({ tabId, selector }) => {
      const element = document.getElementById(tabId);
      const rail = element?.closest<HTMLElement>(selector);
      if (!element || !rail) throw new Error(`${tabId} should be inside ${selector}`);
      const tabRect = element.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      const visibleLeft = railRect.left + rail.clientLeft;
      return {
        tabLeft: tabRect.left,
        tabRight: tabRect.right,
        visibleLeft,
        visibleRight: visibleLeft + rail.clientWidth,
        railScrollWidth: rail.scrollWidth,
        railClientWidth: rail.clientWidth,
      };
    },
    { tabId: await tab.getAttribute("id"), selector: railSelector },
  );

  expect(
    bounds.tabLeft,
    `${railSelector} selected tab left at ${viewportWidth}px`,
  ).toBeGreaterThanOrEqual(bounds.visibleLeft - 1);
  expect(
    bounds.tabRight,
    `${railSelector} selected tab right at ${viewportWidth}px`,
  ).toBeLessThanOrEqual(bounds.visibleRight + 1);
  if (shouldWrap) {
    expect(
      bounds.railScrollWidth,
      `${railSelector} should wrap rather than create horizontal scrolling at ${viewportWidth}px`,
    ).toBeLessThanOrEqual(bounds.railClientWidth + 1);
  }
}

async function expectPageWithinViewport(
  page: import("@playwright/test").Page,
  viewportWidth: number,
  route: string,
): Promise<void> {
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width, `${route} document width at ${viewportWidth}px`).toBeLessThanOrEqual(viewportWidth);
}

async function expectChildNavigation(
  page: import("@playwright/test").Page,
  parentPane: string,
  routeLabel: string,
  childIds: readonly string[],
  viewportWidth: number,
): Promise<void> {
  const pane = page.locator(parentPane);
  const nav = pane.locator(".pane-nav-scroll");
  await expect(nav).toBeVisible();

  for (const childId of childIds) {
    const tab = pane.locator(`#tab-${childId}`);
    await tab.click();
    await expect(tab, `${routeLabel} ${childId} selected`).toHaveAttribute("aria-selected", "true");

    const panelId = await tab.getAttribute("aria-controls");
    expect(panelId, `${routeLabel} ${childId} panel id`).toBeTruthy();
    const panel = page.locator(`#${panelId}`);
    await expect(panel, `${routeLabel} ${childId} panel`).toBeVisible();
    await expect(panel).toHaveAttribute("role", "tabpanel");
    await expect(panel).toHaveAttribute("aria-labelledby", `tab-${childId}`);

    await expectSelectedTabVisibleInRail(page, tab, ".pane-nav-scroll", viewportWidth, true);
    const navAndPanel = await page.evaluate(
      ({ navSelector, panelSelector }) => {
        const navElement = document.querySelector<HTMLElement>(navSelector);
        const panelElement = document.querySelector<HTMLElement>(panelSelector);
        if (!navElement || !panelElement)
          throw new Error("Navigation and selected panel should render");
        return {
          navBottom: navElement.getBoundingClientRect().bottom,
          panelTop: panelElement.getBoundingClientRect().top,
        };
      },
      { navSelector: `${parentPane} .pane-nav-scroll`, panelSelector: `#${panelId}` },
    );
    expect(
      navAndPanel.panelTop,
      `${routeLabel} panel should follow its navigation row at ${viewportWidth}px`,
    ).toBeGreaterThanOrEqual(navAndPanel.navBottom - 1);
    await expectPageWithinViewport(page, viewportWidth, `${routeLabel}/${childId}`);
  }
}

test("P-12 Settings and Miaplaedia child navigation wraps and stays reachable at narrow and tablet widths @p12-responsive-navigation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-route");
  expect(
    await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("unlock-all-tabs")),
  ).toBe(true);

  const viewports = [320, 768] as const;
  const settingsChildren = [
    "settings-achievements",
    "settings-events",
    "settings-statistics",
    "settings-visual",
    "settings-game-options",
    "settings-saves",
  ] as const;
  const miaplaediaChildren = [
    "miaplaedia-get-started",
    "miaplaedia-story",
    "miaplaedia-concepts-early",
    "miaplaedia-concepts-mid",
    "miaplaedia-concepts-late",
    "miaplaedia-end-goal",
    "miaplaedia-philosophies",
  ] as const;

  for (const width of viewports) {
    await page.setViewportSize({ width, height: 740 });
    for (const mainId of ["settings", "miaplaedia"] as const) {
      const mainTab = page.locator(`#tab-${mainId}`);
      await mainTab.click();
      await expect(mainTab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator(`#pane-${mainId}`)).toBeVisible();
      await expectSelectedTabVisibleInRail(page, mainTab, ".game-nav", width);
      await expectPageWithinViewport(page, width, mainId);
    }

    await page.locator("#tab-settings").click();
    await expectChildNavigation(page, "#pane-settings", "Settings", settingsChildren, width);

    await page.locator("#tab-miaplaedia").click();
    await expectChildNavigation(page, "#pane-miaplaedia", "Miaplaedia", miaplaediaChildren, width);
  }
});
