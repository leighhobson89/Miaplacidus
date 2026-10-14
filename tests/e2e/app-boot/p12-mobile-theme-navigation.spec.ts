import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";

const MAIN_TABS = [
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

async function setTheme(page: Page, theme: ThemeId): Promise<void> {
  await page.evaluate(
    (themeId) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { themeId },
      }),
    theme,
  );
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);
}

async function expectInsideRail(page: Page, tabId: string, railSelector: string, label: string) {
  const bounds = await page.evaluate(
    ({ id, selector }) => {
      const tab = document.getElementById(id);
      const rail = tab?.closest<HTMLElement>(selector);
      if (!tab || !rail) throw new Error(`${id} and ${selector} should be in the active layout`);
      const tabRect = tab.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      const visibleLeft = railRect.left + rail.clientLeft;
      return {
        tabLeft: tabRect.left,
        tabRight: tabRect.right,
        visibleLeft,
        visibleRight: visibleLeft + rail.clientWidth,
      };
    },
    { id: tabId, selector: railSelector },
  );
  expect(bounds.tabLeft, `${label} left edge`).toBeGreaterThanOrEqual(bounds.visibleLeft - 1);
  expect(bounds.tabRight, `${label} right edge`).toBeLessThanOrEqual(bounds.visibleRight + 1);
}

async function expectNoDocumentOverflow(page: Page, theme: ThemeId, area: string): Promise<void> {
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth, `${theme} ${area} document width`).toBeLessThanOrEqual(390);
}

test("all main and child navigation stays usable at 390px in every theme @p12-mobile-theme-navigation", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-megastructure-route");
  expect(await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("unlock-all-tabs"))).toBe(
    true,
  );
  await page.setViewportSize({ width: 390, height: 844 });

  const mainRail = ".game-nav";
  for (const theme of THEME_IDS) {
    await setTheme(page, theme);
    for (const tabId of MAIN_TABS) {
      const tab = page.locator(`#tab-${tabId}`);
      const pane = page.locator(`#pane-${tabId}`);
      await expect(tab, `${theme} ${tabId} tab`).toBeVisible();
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(pane, `${theme} ${tabId} pane`).toBeVisible();
      await expectInsideRail(page, `tab-${tabId}`, mainRail, `${theme} ${tabId} main tab`);
      await expectNoDocumentOverflow(page, theme, tabId);

      const childRails = pane.locator(".pane-nav-scroll:visible");
      for (let railIndex = 0; railIndex < (await childRails.count()); railIndex += 1) {
        const rail = childRails.nth(railIndex);
        const tabLists = rail.locator("[role='tablist']:visible");
        for (let listIndex = 0; listIndex < (await tabLists.count()); listIndex += 1) {
          const tabs = tabLists.nth(listIndex).locator("[role='tab']:visible");
          const count = await tabs.count();
          if (count === 0) continue;
          const lastTab = tabs.nth(count - 1);
          const childTabId = await lastTab.getAttribute("id");
          expect(childTabId, `${theme} ${tabId} child tab id`).toBeTruthy();
          await lastTab.click();
          await expect(lastTab, `${theme} ${tabId} selected child`).toHaveAttribute(
            "aria-selected",
            "true",
          );
          const childRailMetrics = await rail.evaluate((element) => ({
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            scrollLeft: element.scrollLeft,
          }));
          if (childRailMetrics.scrollWidth > childRailMetrics.clientWidth + 1) {
            expect(
              childRailMetrics.scrollLeft,
              `${theme} ${tabId} overflowing child rail should scroll its selected tab into view`,
            ).toBeGreaterThan(0);
          }
          await expectInsideRail(
            page,
            childTabId!,
            `.pane-nav-scroll`,
            `${theme} ${tabId} child tab`,
          );
          await expectNoDocumentOverflow(page, theme, `${tabId} child navigation`);
        }
      }

      if (tabId === "miaplaedia") {
        const scrollLeft = await page.locator(mainRail).evaluate((rail) => rail.scrollLeft);
        expect(scrollLeft, `${theme} Miaplaedia selection should scroll the main rail`).toBeGreaterThan(
          0,
        );
      }
    }
  }
});
