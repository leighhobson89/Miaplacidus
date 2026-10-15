import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

const MAIN_PANE_IDS = [
  "hydrogen",
  "compounds",
  "research",
  "energy",
  "space-mining",
  "interstellar",
  "galaxy",
  "cosmic-rip",
  "settings",
  "miaplaedia",
] as const;

async function unlockAllTabs(page: Page): Promise<void> {
  await startMetaFixture(page, "meta-megastructure-route");
  expect(
    await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("unlock-all-tabs")),
  ).toBe(true);
}

async function expectNoPageOverflow(page: Page, width: number, context: string): Promise<void> {
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth, `${context} document width`).toBeLessThanOrEqual(width);
}

test("P-12 Resource and Compound rails stack above their content at phone and tablet widths @p12-responsive-stress", async ({
  page,
}) => {
  await unlockAllTabs(page);

  for (const width of [320, 768] as const) {
    await page.setViewportSize({ width, height: 740 });
    for (const route of [
      { id: "hydrogen", rail: "resource-rail" },
      { id: "compounds", rail: "compound-rail" },
    ] as const) {
      await page.locator(`#tab-${route.id}`).click();
      const layout = page.locator(".main-layout.has-economy-rail");
      const rail = page.getByTestId(route.rail);
      const paneStack = layout.locator(":scope > .pane-stack");
      await expect(rail).toBeVisible();
      await expect(page.locator(`#pane-${route.id}`)).toBeVisible();

      const geometry = await page.evaluate((railTestId) => {
        const layoutElement = document.querySelector<HTMLElement>(".main-layout.has-economy-rail");
        const railElement = document.querySelector<HTMLElement>(`[data-testid="${railTestId}"]`);
        const paneStackElement = layoutElement?.querySelector<HTMLElement>(":scope > .pane-stack");
        if (!layoutElement || !railElement || !paneStackElement) {
          throw new Error("The active economy rail and pane stack should render");
        }
        return {
          columns: getComputedStyle(layoutElement).gridTemplateColumns,
          railBottom: railElement.getBoundingClientRect().bottom,
          paneTop: paneStackElement.getBoundingClientRect().top,
        };
      }, route.rail);

      expect(
        geometry.columns.trim().split(/\s+/u),
        `${route.id} should use one stacked grid column at ${width}px`,
      ).toHaveLength(1);
      expect(
        geometry.railBottom,
        `${route.id} ${route.rail} should precede content at ${width}px`,
      ).toBeLessThanOrEqual(geometry.paneTop + 1);
      await expectNoPageOverflow(page, width, `${route.id} at ${width}px`);
    }
  }
});

test("P-12 visible child navigation remains reachable without page overflow at 320px @p12-responsive-stress", async ({
  page,
}) => {
  await unlockAllTabs(page);
  await page.setViewportSize({ width: 320, height: 740 });

  for (const paneId of MAIN_PANE_IDS) {
    const mainTab = page.locator(`#tab-${paneId}`);
    const pane = page.locator(`#pane-${paneId}`);
    await mainTab.click();
    await expect(mainTab).toHaveAttribute("aria-selected", "true");
    await expect(pane).toBeVisible();

    const childRails = pane.locator(".pane-nav-scroll:visible");
    for (let railIndex = 0; railIndex < (await childRails.count()); railIndex += 1) {
      const rail = childRails.nth(railIndex);
      const tabLists = rail.locator("[role='tablist']:visible");
      const tabListCount = await tabLists.count();
      for (let listIndex = 0; listIndex < tabListCount; listIndex += 1) {
        const tabs = tabLists.nth(listIndex).locator("[role='tab']:visible");
        const tabCount = await tabs.count();
        if (tabCount === 0) continue;

        const selectedTab = tabs.nth(tabCount - 1);
        const selectedTabId = await selectedTab.getAttribute("id");
        expect(selectedTabId, `${paneId} child tab id`).toBeTruthy();
        await selectedTab.click();
        await expect(selectedTab, `${paneId} last child tab`).toHaveAttribute(
          "aria-selected",
          "true",
        );

        const panelId = await selectedTab.getAttribute("aria-controls");
        expect(panelId, `${paneId} child panel id`).toBeTruthy();
        const selectedPanel = page.locator(`#${panelId}`);
        await expect(selectedPanel, `${paneId} selected child panel`).toBeVisible();
        await expect(selectedPanel).toHaveAttribute("aria-labelledby", selectedTabId!);

        const metrics = await rail.evaluate((element) => {
          const railBounds = element.getBoundingClientRect();
          const activeTab = element.querySelector<HTMLElement>(
            "[role='tab'][aria-selected='true']",
          );
          if (!activeTab) throw new Error("Selected child tab should be inside its rail");
          const tabBounds = activeTab.getBoundingClientRect();
          return {
            railLeft: railBounds.left + element.clientLeft,
            railRight: railBounds.left + element.clientLeft + element.clientWidth,
            tabLeft: tabBounds.left,
            tabRight: tabBounds.right,
            scrollLeft: element.scrollLeft,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          };
        });
        expect(
          metrics.tabLeft,
          `${paneId} selected child left edge inside rail at 320px`,
        ).toBeGreaterThanOrEqual(metrics.railLeft - 1);
        expect(
          metrics.tabRight,
          `${paneId} selected child right edge inside rail at 320px`,
        ).toBeLessThanOrEqual(metrics.railRight + 1);
        if (listIndex === tabListCount - 1 && metrics.scrollWidth > metrics.clientWidth + 1) {
          expect(
            metrics.scrollLeft,
            `${paneId} overflowing child rail should scroll to its last tab at 320px`,
          ).toBeGreaterThan(0);
        }
      }
    }
    await expectNoPageOverflow(page, 320, `${paneId} child navigation`);
  }
});
