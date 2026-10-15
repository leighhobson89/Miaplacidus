import type { Page } from "@playwright/test";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import type { ThemeId } from "../../../src/content/themes";

async function startLaunchedStarship(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=space-starship-scanning");
  await page.getByLabel("Pioneer name").fill("Interstellar Visual Review Pioneer");
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
  expect(await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("build-starship"))).toBe(
    true,
  );
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await expect(starship.locator("#starship-title")).toHaveText("Star Ship");
  await starship.getByTestId("starship-scan-system-button").click();
  await expect(starship.getByTestId("starship-scan-complete")).toBeVisible();
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

async function titlePoint(page: Page): Promise<{ left: number; top: number }> {
  return page
    .getByTestId("starship-pane")
    .locator("#starship-title")
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top };
    });
}

function expectAligned(
  actual: { left: number; top: number },
  reference: { left: number; top: number },
  description: string,
): void {
  expect(Math.abs(actual.left - reference.left), `${description} left alignment`).toBeLessThanOrEqual(
    2,
  );
  expect(Math.abs(actual.top - reference.top), `${description} top alignment`).toBeLessThanOrEqual(2);
}

test("Colonise has reviewed desktop and phone states @p66-visual-review", async ({
  page,
}, testInfo) => {
  await startLaunchedStarship(page);
  const starship = page.getByTestId("starship-pane");

  for (const viewport of [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const) {
    await page.setViewportSize(viewport);
    await setPresentation(page, viewport.theme);
    await hideAmbientOverlays(page);
    await page.locator("#tab-interstellar-starship").click();
    const starshipTitle = await titlePoint(page);
    const coloniseTab = page.locator("#tab-interstellar-colonise");
    await expect(coloniseTab).toBeVisible();
    await coloniseTab.click();
    await expect(starship.locator("#starship-title")).toHaveText("Colonise");
    await expect(
      starship.locator(
        '.space-card-illustration-wrap [data-celestial-illustration="colonised-surface"]',
      ),
    ).toBeVisible();
    expectAligned(
      await titlePoint(page),
      starshipTitle,
      `Colonise heading at ${viewport.width}px`,
    );
    await captureVisualCheckpoint(page, testInfo, `phase6-colonise-${viewport.suffix}`);
  }
});
