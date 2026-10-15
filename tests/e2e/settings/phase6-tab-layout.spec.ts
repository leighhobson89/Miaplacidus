import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

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

test("Settings pages use the requested artwork, headings, and inline save controls @phase6-tab-layout", async ({
  freshGame,
}) => {
  await freshGame.setViewportSize({ width: 1280, height: 900 });
  const hydrogenTitleSize = await freshGame
    .locator("#panel-resources-hydrogen .pane-heading h2")
    .evaluate((element) => getComputedStyle(element).fontSize);
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  const settingsArtwork = settings.locator(
    ".page-artwork-row [data-celestial-illustration='settings']",
  );
  await expect(settingsArtwork).toHaveCount(1);
  await expect(settingsArtwork).toBeVisible();
  await settings.locator("#tab-settings-visual").click();
  await expect(settings.locator("#panel-settings-visual")).toBeVisible();
  await hideAmbientOverlaysForScreenshot(freshGame);
  await expect(settings).toHaveScreenshot("p66-settings-visual-desktop.png", {
    animations: "disabled",
    caret: "hide",
  });

  for (const paneId of ["settings-achievements", "settings-events", "settings-statistics"]) {
    await settings.locator(`#tab-${paneId}`).click();
    await expect(settings.locator(".page-artwork-row")).toHaveCount(0);
  }
  await settings.locator("#tab-settings-achievements").click();
  await expect(settings.getByTestId("achievements-pane")).not.toContainText(/META\s*\/\s*\d+/i);
  await expect(settings.locator("#panel-settings-achievements .pane-heading h2")).toHaveCSS(
    "font-size",
    hydrogenTitleSize,
  );
  await settings.locator("#tab-settings-events").click();
  await expect(settings.getByTestId("meta-journal-pane")).not.toContainText(/META\s*\/\s*SIGNALS/i);
  await expect(settings.locator("#panel-settings-events .pane-heading h2")).toHaveCSS(
    "font-size",
    hydrogenTitleSize,
  );

  for (const [paneId, heading] of [
    ["settings-visual", "Visual"],
    ["settings-game-options", "Game Options"],
    ["settings-saves", "Saving / Loading"],
  ] as const) {
    await settings.locator(`#tab-${paneId}`).click();
    await expect(
      settings.locator(".page-artwork-row [data-celestial-illustration='settings']"),
    ).toHaveCount(1);
    await expect(settings.locator(`#panel-${paneId} .game-page-title`)).toHaveText(heading, {
      ignoreCase: true,
    });
    await expect(settings.locator(`#panel-${paneId} .game-page-title`)).toHaveCSS(
      "font-size",
      hydrogenTitleSize,
    );
  }

  await settings.locator("#tab-settings-statistics").click();
  await expect(settings.locator("#panel-settings-statistics .game-page-title")).toHaveText(
    "Statistics",
  );
  await expect(settings.locator("#panel-settings-statistics .game-page-title")).toHaveCSS(
    "font-size",
    hydrogenTitleSize,
  );

  await settings.locator("#tab-settings-saves").click();
  const savePanel = settings.getByTestId("settings-saves-panel");
  await expect(savePanel.getByTestId("save-manager-inline")).toBeVisible();
  await expect(
    savePanel.getByTestId("save-manager-inline").getByRole("heading", {
      name: "Other saved pioneers",
    }),
  ).toHaveCount(1);
  await expect(savePanel.getByTestId("save-now")).toBeVisible();
  await expect(savePanel.locator("#save-rename")).toBeVisible();
  await expect(savePanel.locator("#save-copy-name")).toBeVisible();
  await expect(savePanel.locator("#import-code")).toBeVisible();
  await expect(savePanel.getByLabel("Please paste your Save Data here...")).toBeVisible();
  await expect(
    freshGame.getByRole("dialog", { name: "Hydrogen Pioneer", exact: true }),
  ).toHaveCount(0);
});

test("Settings child pages have durable desktop and phone visual captures @p66-visual-review", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await startFixture(page, "meta-megastructure-route", "P-66 Settings Visual Review Pioneer");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  const settings = page.locator("#pane-settings");
  const pages = [
    { id: "settings-achievements", title: "Achievements", noArtwork: true },
    { id: "settings-events", title: "Events", noArtwork: true },
    { id: "settings-statistics", title: "Statistics", noArtwork: true },
    { id: "settings-game-options", title: "Game Options", noArtwork: false },
    { id: "settings-visual", title: "Visual", noArtwork: false },
    { id: "settings-saves", title: "Saving / Loading", noArtwork: false },
  ] as const;
  const views = [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const;

  for (const view of views) {
    await page.setViewportSize({ width: view.width, height: view.height });
    const themeChanged = await page.evaluate(
      (themeId) =>
        window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { themeId } }),
      view.theme,
    );
    expect(themeChanged, `${view.theme} theme is applied`).toBe(true);
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", view.theme);
    await page.getByRole("tab", { name: "Settings" }).click();

    for (const settingsPage of pages) {
      await settings.locator(`#tab-${settingsPage.id}`).click();
      const panel = settings.locator(`#panel-${settingsPage.id}`);
      await expect(panel.locator(".game-page-title, .pane-heading h2").first()).toHaveText(
        settingsPage.title,
      );
      if (settingsPage.noArtwork) {
        await expect(settings.locator(".page-artwork-row")).toHaveCount(0);
        await expect(panel.locator(".eyebrow")).toHaveCount(0);
      } else {
        await expect(
          settings.locator(".page-artwork-row [data-celestial-illustration='settings']"),
        ).toHaveCount(1);
      }
      if (settingsPage.id === "settings-achievements") {
        await expect(settings.getByTestId("achievements-pane")).not.toContainText(
          /META\s*\/\s*\d+/i,
        );
      }
      if (settingsPage.id === "settings-events") {
        await expect(settings.getByTestId("meta-journal-pane")).not.toContainText(
          /META\s*\/\s*SIGNALS/i,
        );
      }
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo(0, 0);
      });
      await page.mouse.move(0, 0);
      await captureVisualCheckpoint(
        page,
        testInfo,
        `phase6-settings-${settingsPage.id.replace("settings-", "")}-${view.suffix}`,
      );
    }
  }
});
