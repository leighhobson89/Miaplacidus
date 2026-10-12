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

test("Miaplaedia pages have no artwork row and use the resource title scale @phase6-tab-layout", async ({
  freshGame,
}) => {
  const hydrogenTitle = freshGame.locator("#panel-resources-hydrogen .pane-heading h2");
  const miaplaedia = freshGame.locator("#pane-miaplaedia");
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await freshGame.setViewportSize(viewport);
    const hydrogenFontSize = await hydrogenTitle.evaluate(
      (element) => getComputedStyle(element).fontSize,
    );
    await freshGame.locator("#tab-miaplaedia").click();
    await expect(miaplaedia.locator(".page-artwork-row")).toHaveCount(0);
    for (const paneId of [
      "miaplaedia-get-started",
      "miaplaedia-story",
      "miaplaedia-concepts-early",
      "miaplaedia-concepts-mid",
      "miaplaedia-concepts-late",
      "miaplaedia-end-goal",
      "miaplaedia-philosophies",
    ]) {
      await freshGame.locator(`#tab-${paneId}`).click();
      const pageTitle = miaplaedia.locator(`#panel-${paneId} .game-page-title`);
      await expect(pageTitle, `${paneId} title at ${viewport.width}px`).toBeVisible();
      await expect(pageTitle, `${paneId} title scale at ${viewport.width}px`).toHaveCSS(
        "font-size",
        hydrogenFontSize,
      );
    }
  }
});

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
      name: "Choose a local pioneer",
    }),
  ).toHaveCount(1);
  await expect(savePanel.getByTestId("save-now")).toBeVisible();
  await expect(savePanel.locator("#save-rename")).toBeVisible();
  await expect(savePanel.locator("#save-copy-name")).toBeVisible();
  await expect(savePanel.locator("#import-code")).toBeVisible();
  await expect(savePanel.getByLabel("Portable save code")).toBeVisible();
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
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", view.theme);
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

test("unlaunched Starship keeps its title, artwork, and framed card @phase6-tab-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await startFixture(page, "space-starship-ready", "Prelaunch Presentation Pioneer");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship" }).click();

  const starship = page.getByTestId("starship-pane");
  await expect(starship.locator("#starship-title")).toHaveText("Starship");
  await expect(starship).not.toHaveClass(/starship-card-plain/);
  await expect(starship).toHaveCSS("border-top-width", "1px");
  await expect(
    starship.locator('.space-card-illustration-wrap [data-celestial-illustration="starship"]'),
  ).toBeVisible();
  await hideAmbientOverlaysForScreenshot(page);
  await expect(starship).toHaveScreenshot("p66-starship-unlaunched-desktop.png", {
    animations: "disabled",
    caret: "hide",
  });
});

test("launched Starship and Colonise use their tab-specific title and artwork @phase6-tab-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await startFixture(page, "space-starship-scanning", "Presentation Pioneer");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship" }).click();

  const starship = page.getByTestId("starship-pane");
  await expect(starship.locator("#starship-title")).toHaveText("Starship");
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

  await starship.getByTestId("starship-scan-system-button").click();
  await page.getByRole("tab", { name: "Colonise" }).click();
  const colonise = page.getByTestId("starship-pane");
  const surface = colonise.locator(
    '.space-card-illustration-wrap [data-celestial-illustration="colonised-surface"]',
  );
  await expect(surface).toBeVisible();
  await expect(surface.locator('path[d^="m204 58"]')).toHaveCount(1);
  await expect(colonise).toHaveScreenshot("p66-colonise-flag-desktop.png", {
    animations: "disabled",
    caret: "hide",
  });
});

test("Space Mining titles and artwork follow the selected child tab @phase6-tab-layout", async ({
  page,
}) => {
  await startFixture(page, "space-late-game", "Mining Presentation Pioneer");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  const pane = page.getByTestId("space-mining-pane");
  const childTabs = page.locator("#pane-space-mining .pane-nav [role='tab']");
  await expect(page.locator("#tab-space-mining-mining")).toHaveAttribute("aria-label", /Mining/);
  await expect(page.locator("#tab-space-mining-telescope")).toHaveAttribute(
    "aria-label",
    /Space Telescope/,
  );

  const asteroidsTab = page.locator("#tab-space-mining-asteroids");
  await expect
    .poll(() =>
      asteroidsTab.evaluate((element) => {
        const copy = element.cloneNode(true) as HTMLElement;
        copy.querySelector(".attention-badge")?.remove();
        return copy.innerText.trim();
      }),
    )
    .toBe("Asteroids");
  const childLabels = await childTabs.evaluateAll((tabs) =>
    tabs.map((tab) => {
      const copy = tab.cloneNode(true) as HTMLElement;
      copy.querySelector(".attention-badge")?.remove();
      return copy.innerText.trim();
    }),
  );
  expect(childLabels).not.toContain("Discovered Asteroids");

  for (const tab of await childTabs.all()) {
    const id = await tab.getAttribute("id");
    if (!id) throw new Error("Space Mining child tab has no stable ID.");
    const label = await tab.evaluate((element) => {
      const copy = element.cloneNode(true) as HTMLElement;
      copy.querySelector(".attention-badge")?.remove();
      return copy.innerText.trim();
    });
    await tab.click();
    await expect(pane.locator(".game-page-title")).toHaveText(label);
    await expect(pane.locator(".game-page-title")).toHaveCount(1);
  }

  await page.locator("#tab-space-mining-telescope").click();
  await expect(
    pane.locator(".page-artwork-row [data-celestial-illustration='radio-telescope']"),
  ).toHaveCount(1);
});
