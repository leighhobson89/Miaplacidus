import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { starMapText } from "../../../src/i18n/starMapMessages";

async function startStarDataVisualFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("Star Data Visual Review Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.locator("#tab-interstellar").click();
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "fr", themeId: "frosty" },
    }),
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", "frosty");
}

test("P-65 French Star Data title and artwork fit the 320px Frosty layout @p65-visual-review", async ({
  page,
}, testInfo) => {
  await startStarDataVisualFixture(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.locator("#tab-interstellar-star-data").click();

  const panel = page.locator("#panel-interstellar-star-data");
  const title = panel.locator(":scope > .pane-heading h2");
  const artworkRow = panel.locator(":scope > .page-artwork-row");
  await expect(panel).toBeVisible();
  await expect(title).toHaveCount(1);
  await expect(title).toHaveText(starMapText("fr", "dataView"));
  await expect(artworkRow).toHaveCount(1);
  await expect(
    artworkRow.locator('[data-celestial-illustration="star-system"]'),
  ).toBeVisible();

  const hydrogenTitleSize = await page
    .locator("#panel-resources-hydrogen .pane-heading h2")
    .evaluate((element) => getComputedStyle(element).fontSize);
  await expect(title).toHaveCSS("font-size", hydrogenTitleSize);
  const bounds = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>("#panel-interstellar-star-data")!;
    const heading = pane.querySelector<HTMLElement>(":scope > .pane-heading h2")!;
    const artwork = pane.querySelector<HTMLElement>(":scope > .page-artwork-row")!;
    const rect = (element: HTMLElement) => {
      const { left, right } = element.getBoundingClientRect();
      return { left, right };
    };
    return {
      documentWidth: document.documentElement.scrollWidth,
      panel: rect(pane),
      heading: rect(heading),
      artwork: rect(artwork),
    };
  });
  expect(bounds.documentWidth).toBeLessThanOrEqual(320);
  for (const [name, rect] of Object.entries({
    panel: bounds.panel,
    heading: bounds.heading,
    artwork: bounds.artwork,
  })) {
    expect(rect.left, `${name} left edge`).toBeGreaterThanOrEqual(-1);
    expect(rect.right, `${name} right edge`).toBeLessThanOrEqual(321);
  }

  await captureVisualCheckpoint(page, testInfo, "p65-star-data-fr-frosty-320");
});
