import type { Page, TestInfo } from "@playwright/test";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import type { ThemeId } from "../../../src/content/themes";

async function startFixture(
  page: Page,
  fixture: "space-starship-ready" | "space-starship-scanning",
  pioneer: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.applyDebugAction === "function"))
    .toBe(true);
  await dismissTutorialOfferIfPresent(page);
  const notificationsDisabled = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  expect(notificationsDisabled).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled))
    .toBe(false);
  await expect(page.getByTestId("notification-stack")).toBeEmpty();
}

async function setPresentation(page: Page, themeId: ThemeId): Promise<void> {
  await page.evaluate((theme) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en", themeId: theme },
    });
  }, themeId);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute(
    "data-theme",
    themeId,
  );
}

async function hideAmbientOverlays(page: Page): Promise<void> {
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

test("Starship has reviewed unlaunched and launched desktop and phone states @p66-visual-review", async ({
  page,
}, testInfo: TestInfo) => {
  await startFixture(page, "space-starship-ready", "Interstellar Visual Review Pioneer");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  const unlaunched = page.getByTestId("starship-pane");
  await expect(unlaunched.locator("#starship-title")).toHaveText("Star Ship");
  await expect(unlaunched).not.toHaveClass(/starship-card-plain/);
  await expect(
    unlaunched.locator('.space-card-illustration-wrap [data-celestial-illustration="starship"]'),
  ).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await setPresentation(page, "terminal");
  await hideAmbientOverlays(page);
  await captureVisualCheckpoint(page, testInfo, "phase6-starship-unlaunched-terminal-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await setPresentation(page, "light");
  await captureVisualCheckpoint(page, testInfo, "phase6-starship-unlaunched-light-mobile");

  await startFixture(page, "space-starship-scanning", "Interstellar Visual Review Pioneer");
  expect(await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("build-starship"))).toBe(
    true,
  );
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await expect(starship.locator("#starship-title")).toHaveText("Star Ship");
  await expect(starship).toHaveClass(/starship-card-plain/);
  await expect(starship).toHaveCSS("border-width", "0px");
  await expect(starship.locator(".space-card-illustration-wrap")).toHaveCount(0);
  await expect(starship.locator(".space-card-heading .eyebrow")).toHaveCount(0);
  await starship.getByTestId("starship-scan-system-button").click();
  await expect(starship.getByTestId("starship-scan-complete")).toBeVisible();
  await expect(page.getByTestId("notification-stack")).toBeEmpty();

  for (const viewport of [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const) {
    await page.setViewportSize(viewport);
    await setPresentation(page, viewport.theme);
    await hideAmbientOverlays(page);
    await page.locator("#tab-interstellar-starship").click();
    await captureVisualCheckpoint(page, testInfo, `phase6-starship-launched-${viewport.suffix}`);
  }
});
