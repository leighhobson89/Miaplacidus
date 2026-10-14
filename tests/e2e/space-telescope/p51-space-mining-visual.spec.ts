import { expect, test } from "../_harness/fixtures";
import type { Page, TestInfo } from "@playwright/test";
import { topStatusText } from "../../../src/i18n/topStatusMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
] as const;
const THEMES = ["terminal", "light"] as const;

async function startSpaceFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("P-51 Space Mining Visual Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(name);
  await page.screenshot({ path, fullPage: true, animations: "disabled" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

test("P-51 Space Telescope quote and location tooltip fit French narrow layouts @p51-space-mining-visual", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();

  const pane = page.getByTestId("space-mining-pane");
  const costList = pane.locator(".space-cost-list");
  const buildButton = pane.getByRole("button", {
    name: spaceText("fr", "telescopeBuild"),
    exact: true,
  });
  const locationSummary = page.locator(".location-status-summary");
  const weatherTooltip = page.locator("#location-status-tooltip");

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const theme of THEMES) {
      await page.evaluate((themeId) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: "fr", themeId },
        });
      }, theme);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      await expect(pane).toBeVisible();
      await expect(pane.getByRole("heading", { level: 2 })).toHaveText(
        spaceText("fr", "telescopeTitle"),
      );
      await expect(costList).toBeVisible();
      await expect(costList.locator("li")).toHaveCount(4);
      await expect(buildButton).toBeVisible();
      await expect(costList).toContainText(/\d/);

      await locationSummary.focus();
      await expect(weatherTooltip).toBeVisible();
      await expect(weatherTooltip).toContainText(topStatusText("fr", "precipitationRate"));
      await expect(weatherTooltip).toContainText(topStatusText("fr", "precipitationThisRun"));

      const geometry = await page.evaluate(() => {
        const bounds = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error(`Missing visible geometry target: ${selector}`);
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          };
        };
        return {
          documentWidth: document.documentElement.scrollWidth,
          pane: bounds('[data-testid="space-mining-pane"]'),
          title: bounds(".space-mining-panel .game-page-title"),
          cost: bounds(".space-mining-panel .space-cost-list"),
          action: bounds(
            ".space-mining-panel .space-card:not([hidden]) .space-action-help-group > button.primary-button",
          ),
          tooltip: bounds("#location-status-tooltip"),
          viewportWidth: document.documentElement.clientWidth,
        };
      });
      expect(
        geometry.documentWidth,
        `${viewport.width}px document width (${theme})`,
      ).toBeLessThanOrEqual(viewport.width);
      for (const [name, target] of Object.entries(geometry).filter(
        (entry): entry is [string, typeof geometry.pane] => typeof entry[1] === "object",
      )) {
        expect(target.left, `${viewport.width}px ${theme} ${name} left`).toBeGreaterThanOrEqual(-1);
        expect(target.right, `${viewport.width}px ${theme} ${name} right`).toBeLessThanOrEqual(
          viewport.width + 1,
        );
        if ("clientWidth" in target) {
          expect(
            target.scrollWidth,
            `${viewport.width}px ${theme} ${name} text width`,
          ).toBeLessThanOrEqual(target.clientWidth + 1);
        }
      }

      if (
        (viewport.width === 320 && theme === "terminal") ||
        (viewport.width === 390 && theme === "light")
      ) {
        await capture(page, testInfo, `p51-space-telescope-fr-${viewport.width}-${theme}.png`);
      }
      await locationSummary.evaluate((element) => (element as HTMLElement).blur());
    }
  }
});
