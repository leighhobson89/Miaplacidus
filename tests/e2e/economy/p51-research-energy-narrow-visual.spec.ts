import { expect, test } from "../_harness/fixtures";
import type { Page, TestInfo } from "@playwright/test";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { topStatusText } from "../../../src/i18n/topStatusMessages";

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
] as const;
const THEMES = ["terminal", "light"] as const;

async function startEconomyFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=storage-all");
  await page.getByLabel("Pioneer name").fill("P-51 Research Energy Visual Pioneer");
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

async function setPresentation(page: Page, themeId: (typeof THEMES)[number]): Promise<void> {
  await page.evaluate((theme) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "fr", themeId: theme },
    });
  }, themeId);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", themeId);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
}

async function expectTargetsFit(
  page: Page,
  viewportWidth: number,
  theme: string,
  selectors: readonly [string, string][],
): Promise<void> {
  const geometry = await page.evaluate((targets) => {
    const bounds = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing visible geometry target: ${selector}`);
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      };
    };
    return {
      documentWidth: document.documentElement.scrollWidth,
      elements: targets.map(([name, selector]) => [name, bounds(selector)] as const),
    };
  }, selectors);

  expect(
    geometry.documentWidth,
    `${viewportWidth}px document width (${theme})`,
  ).toBeLessThanOrEqual(viewportWidth);
  for (const [name, rect] of geometry.elements) {
    expect(rect.left, `${viewportWidth}px ${theme} ${name} left`).toBeGreaterThanOrEqual(-1);
    expect(rect.right, `${viewportWidth}px ${theme} ${name} right`).toBeLessThanOrEqual(
      viewportWidth + 1,
    );
    expect(
      rect.scrollWidth,
      `${viewportWidth}px ${theme} ${name} content width`,
    ).toBeLessThanOrEqual(rect.clientWidth + 1);
  }
}

test("P-51 Research and Energy cost context fits French narrow layouts and themes @p51-research-energy-visual", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page);

  const researchBalance = page.getByTestId("research-balance");
  const researchTooltip = page.locator("#top-stat-tooltip-rp");
  const scienceCard = page.locator(
    '#panel-research-science-buildings [data-building-id="scienceKit"]',
  );
  const sciencePrice = scienceCard.locator(":scope > p").nth(2);
  const scienceBuy = scienceCard.getByRole("button", {
    name: economyLabel("fr", "buy"),
    exact: true,
  });

  await page.locator("#tab-research").click();
  await page.locator("#tab-research-science-buildings").click();
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const theme of THEMES) {
      await setPresentation(page, theme);
      await expect(page.locator("#panel-research-science-buildings")).toBeVisible();
      await expect(scienceCard).toBeVisible();
      await expect(sciencePrice).toContainText(/\S/);
      await expect(scienceBuy).toBeVisible();
      await expect(page.getByTestId("cash-balance")).toContainText(/\S/);
      await expect(researchBalance).toContainText(/\S/);
      await expect(page.getByTestId("research-points")).toContainText(/\S/);

      await researchBalance.focus();
      await expect(researchTooltip).toBeVisible();
      await expect(researchTooltip).toContainText(topStatusText("fr", "researchPointsName"));
      await expect(researchTooltip).toContainText(topStatusText("fr", "researchTotalRate"));
      await expectTargetsFit(page, viewport.width, theme, [
        ["Research page", "#pane-research"],
        ["Science Kit card", '#panel-research-science-buildings [data-building-id="scienceKit"]'],
        [
          "Science Kit price",
          '#panel-research-science-buildings [data-building-id="scienceKit"] > p:nth-of-type(3)',
        ],
        [
          "Science Kit action",
          '#panel-research-science-buildings [data-building-id="scienceKit"] .economy-building-actions',
        ],
        ["RP tooltip", "#top-stat-tooltip-rp"],
      ]);

      if (
        (viewport.width === 320 && theme === "terminal") ||
        (viewport.width === 390 && theme === "light")
      ) {
        await capture(page, testInfo, `p51-research-fr-${viewport.width}-${theme}.png`);
      }
      await researchBalance.evaluate((element) => (element as HTMLElement).blur());
    }
  }

  await page.setViewportSize(VIEWPORTS[0]);
  await setPresentation(page, "terminal");
  const initialSciencePrice = await sciencePrice.textContent();
  await expect(scienceBuy).toBeEnabled();
  await scienceBuy.click();
  await expect(sciencePrice).not.toHaveText(initialSciencePrice ?? "");

  const batteryCard = page.locator('#panel-energy [data-building-id="battery1"]');
  const batteryPrice = batteryCard.locator(":scope > p").nth(1);
  const batteryBuy = batteryCard.getByRole("button", {
    name: economyLabel("fr", "buy"),
    exact: true,
  });
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-batteries").click();

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const theme of THEMES) {
      await setPresentation(page, theme);
      await expect(page.locator("#panel-energy")).toBeVisible();
      await expect(batteryCard).toBeVisible();
      await expect(batteryPrice).toContainText(/\S/);
      await expect(batteryBuy).toBeVisible();
      await expect(page.getByTestId("cash-balance")).toContainText(/\S/);
      await expect(researchBalance).toContainText(/\S/);

      await researchBalance.focus();
      await expect(researchTooltip).toBeVisible();
      await expect(researchTooltip).toContainText(topStatusText("fr", "researchPointsName"));
      await expectTargetsFit(page, viewport.width, theme, [
        ["Energy page", "#pane-energy"],
        ["Battery I card", '#panel-energy [data-building-id="battery1"]'],
        ["Battery I price", '#panel-energy [data-building-id="battery1"] > p:nth-of-type(2)'],
        [
          "Battery I action",
          '#panel-energy [data-building-id="battery1"] .economy-building-actions',
        ],
        ["RP tooltip", "#top-stat-tooltip-rp"],
      ]);

      if (
        (viewport.width === 320 && theme === "terminal") ||
        (viewport.width === 390 && theme === "light")
      ) {
        await capture(page, testInfo, `p51-energy-fr-${viewport.width}-${theme}.png`);
      }
      await researchBalance.evaluate((element) => (element as HTMLElement).blur());
    }
  }

  await page.setViewportSize(VIEWPORTS[0]);
  await setPresentation(page, "terminal");
  const initialBatteryPrice = await batteryPrice.textContent();
  await expect(batteryBuy).toBeEnabled();
  await batteryBuy.click();
  await expect(batteryPrice).not.toHaveText(initialBatteryPrice ?? "");
});
