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

test("launched Starship keeps its tab-specific title and artwork @phase6-tab-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await startFixture(page, "space-starship-scanning", "Presentation Pioneer");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-starship").click();

  const starship = page.getByTestId("starship-pane");
  await expect(starship.locator("#starship-title")).toHaveText("Star Ship");
  await expect(starship).toHaveClass(/starship-card-plain/);
  await expect(starship).toHaveCSS("border-width", "0px");
  await expect(starship.locator(".space-card-illustration-wrap")).toHaveCount(0);
  await expect(starship.locator(".space-card-heading .eyebrow")).toHaveCount(0);
  await expect(starship.getByTestId("starship-readiness")).toHaveText("Orbiting Sirius");
  await hideAmbientOverlaysForScreenshot(page);
  await expect(starship).toHaveScreenshot("p66-starship-launched-desktop.png", {
    animations: "disabled",
    caret: "hide",
  });
  const headingPrecedesOrbitingStatus = await starship.evaluate((pane) => {
    const heading = pane.querySelector("#starship-title");
    const status = pane.querySelector('[data-testid="starship-readiness"]');
    return Boolean(
      heading &&
      status &&
      heading.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING &&
      status.getBoundingClientRect().top >= heading.getBoundingClientRect().top,
    );
  });
  expect(headingPrecedesOrbitingStatus).toBe(true);
});
