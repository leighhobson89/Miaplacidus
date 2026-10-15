import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";

async function startFixture(page: Page, fixture: string, pioneer: string): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261008&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function hideAmbientOverlaysForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

test("Colonise surface flag uses its tab-specific page and artwork @phase6-tab-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await startFixture(page, "space-starship-scanning", "Presentation Pioneer");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByTestId("starship-scan-system-button").click();
  await page.locator("#tab-interstellar-colonise").click();
  const colonise = page.getByTestId("starship-pane");
  const surface = colonise.locator(
    '.space-card-illustration-wrap [data-celestial-illustration="colonised-surface"]',
  );
  await expect(surface).toBeVisible();
  await expect(surface.locator('path[d^="m204 58"]')).toHaveCount(1);
  await hideAmbientOverlaysForScreenshot(page);
  await expect(colonise).toHaveScreenshot("p66-colonise-flag-desktop.png", {
    animations: "disabled",
    caret: "hide",
  });
});
