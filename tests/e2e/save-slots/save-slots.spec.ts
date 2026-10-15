import { type Locator, type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { openSaveManager, openSaveSettings, saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";
import { createRequire } from "node:module";
import { createInitialGameState } from "../../../src/engine/state";
import { saveErrorText, saveText } from "../../../src/i18n/saveMessages";
import {
  canonicalJson,
  checksumFor,
  isSaveEnvelope,
  makeEnvelope,
} from "../../../src/persistence/schema";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent, decompressFromUTF16 } =
  createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

async function tabUntilFocused(page: Page, target: Locator): Promise<void> {
  for (let index = 0; index < 100; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Keyboard traversal did not reach the expected control");
}

function decodePortableFixture(code: string) {
  expect(code).toMatch(/^MIA1:/);
  const json = decompressFromEncodedURIComponent(code.slice("MIA1:".length));
  expect(json).not.toBeNull();
  const envelope: unknown = JSON.parse(json ?? "null");
  expect(isSaveEnvelope(envelope)).toBe(true);
  if (!isSaveEnvelope(envelope)) throw new Error("Portable save envelope is invalid");
  return envelope;
}

function rebirthFixtureCode(rebirthCount: 1 | 2, name: string): string {
  const state = createInitialGameState({ pioneerName: name, seed: 80 + rebirthCount });
  return (
    "MIA1:" +
    compressToEncodedURIComponent(
      canonicalJson(
        makeEnvelope({
          slotId: `00000000-0000-4000-8000-00000000000${rebirthCount}`,
          pioneerName: name,
          createdAt: 100,
          savedAt: 200,
          revision: 1,
          state: {
            ...state,
            permanent: { ...state.permanent, rebirthCount, ascendencyPoints: rebirthCount * 5 },
          },
        }),
      ),
    )
  );
}

async function startFreshPioneer(page: Page, name: string): Promise<void> {
  await page.getByLabel("Pioneer name").fill(name);
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  await page.getByTestId("start-game").click();
}

async function resumePioneer(page: Page, name: string): Promise<void> {
  await page.getByLabel("Pioneer name").fill(name);
  await page.getByRole("option").filter({ hasText: name }).click();
  await page.getByTestId("start-game").click();
}

async function waitForTransientNotifications(page: Page): Promise<void> {
  await expect(
    page.getByTestId("notification-stack").getByTestId("game-notification"),
  ).toHaveCount(0, { timeout: 10_000 });
}

async function dismissTutorialIfVisible(page: Page): Promise<void> {
  const tutorial = page.locator(".progression-tutorial");
  if (!(await tutorial.count())) return;
  const noThanks = tutorial.getByRole("button", { name: "No thanks", exact: true });
  await expect(noThanks).toBeVisible();
  await noThanks.click();
  await expect(tutorial).toHaveCount(0);
}

async function prepareSaveVisualCheckpoint(page: Page): Promise<void> {
  await dismissTutorialIfVisible(page);
  await waitForTransientNotifications(page);
  await page.locator(".weather-effects-overlay").evaluateAll((overlays) => {
    for (const overlay of overlays) (overlay as HTMLElement).style.visibility = "hidden";
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(600);
}

test("Start creates a slot directly and preselects the last started save for resume @save-slots @lifecycle", async ({
  page,
  browserErrors,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("another-game:keep", "untouched"));
  await page.goto("/?testSeed=71&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Ada Lovelace");
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")),
    ),
  ).toEqual([]);
  await page.getByTestId("start-game").click();
  await expect(page.locator(".run-name")).toHaveText("Ada Lovelace");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")).length,
      ),
    )
    .toBe(1);
  expect(await page.evaluate(() => localStorage.getItem("another-game:keep"))).toBe("untouched");
  await page.reload();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Ada Lovelace");
  await expect(page.getByTestId("start-game")).toHaveText("RESUME GAME Ada Lovelace");
  await captureVisualCheckpoint(page, testInfo, "last-started-save-preselected");
  await page.getByTestId("start-game").click();
  await expect(page.locator(".run-name")).toHaveText("Ada Lovelace");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")).length,
      ),
    )
    .toBe(1);
  expect(browserErrors).toEqual([]);
});

test("a fresh pioneer starts directly and Miaplaedia has no replay control @save-slots @presentation", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=73&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Direct Start Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator(".run-name")).toHaveText("Direct Start Pioneer");
  await expect(page.locator(".hydrogen-briefing")).toHaveCount(0);
  const hydrogenPageTab = page.locator("#tab-resources-hydrogen");
  await expect(hydrogenPageTab.locator(".attention-badge")).toHaveText("New");
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "hydrogen-first-run-no-briefing");

  await page.locator("#tab-settings").click();
  const settingsGameOptions = page.locator("#tab-settings-game-options");
  await expect(settingsGameOptions.locator(".attention-badge")).toHaveText("New");
  await settingsGameOptions.click();
  await expect(settingsGameOptions.locator(".attention-badge")).toHaveCount(0);
  await page.locator("#tab-miaplaedia").click();
  const miaplaediaStory = page.locator("#tab-miaplaedia-story");
  await expect(miaplaediaStory.locator(".attention-badge")).toHaveText("New");
  await miaplaediaStory.click();
  await expect(miaplaediaStory.locator(".attention-badge")).toHaveCount(0);
  await saveNowFromSettings(page);

  await page.reload();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Direct Start Pioneer");
  await page.getByLabel("Pioneer name").click();
  await page.getByRole("option", { name: /Direct Start Pioneer/ }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator(".hydrogen-briefing")).toHaveCount(0);
  await expect(page.locator(".run-name")).toHaveText("Direct Start Pioneer");
  await expect(hydrogenPageTab.locator(".attention-badge")).toHaveText("New");
  await page.locator("#tab-settings").click();
  await expect(page.locator("#tab-settings-game-options .attention-badge")).toHaveCount(0);
  await page.locator(".game-nav [role='tab'][aria-controls='pane-miaplaedia']").click();
  await expect(page.locator("#tab-miaplaedia-story .attention-badge")).toHaveCount(0);
  await expect(page.locator(".miaplaedia-page button")).toHaveCount(0);
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "hydrogen-resume-no-replay-control");

  await page.reload();
  await page.getByLabel("Pioneer name").click();
  await page.getByRole("option", { name: /Direct Start Pioneer/ }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator(".hydrogen-briefing")).toHaveCount(0);
});

test("keyboard can create a pioneer and search and resume a saved pioneer @save-slots @keyboard @accessibility @p21", async ({
  page,
}) => {
  await page.goto("/?testSeed=74&testLocale=en");
  const pioneerName = page.getByLabel("Pioneer name");
  const startButton = page.getByTestId("start-game");

  await page.keyboard.press("Tab");
  await expect(pioneerName).toBeFocused();
  await page.keyboard.type("Ada Lovelace");
  await expect(startButton).toHaveText("START NEW GAME");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(startButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".run-name")).toHaveText("Ada Lovelace");

  await page.reload();
  await tabUntilFocused(page, pioneerName);
  await expect(pioneerName).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Grace Hopper");
  await expect(startButton).toHaveText("START NEW GAME");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(startButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".run-name")).toHaveText("Grace Hopper");

  await page.reload();
  await tabUntilFocused(page, pioneerName);
  await expect(pioneerName).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Ada");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await expect(pioneerName).toHaveAttribute("aria-activedescendant", "pioneer-save-option-0");
  await page.keyboard.press("Enter");
  await expect(pioneerName).toHaveValue("Ada Lovelace");
  await expect(pioneerName).toHaveAttribute("aria-expanded", "false");
  await expect(startButton).toHaveText("RESUME GAME Ada Lovelace");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(startButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".run-name")).toHaveText("Ada Lovelace");
});

test("touch users can start and resume a saved pioneer from the picker @save-slots @touch @p21", async ({
  browser,
  baseURL,
  browserErrors,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const localOrigin = new URL(baseURL ?? "http://127.0.0.1:4173").origin;
  page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
  });
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== localOrigin) {
      browserErrors.push(`external request: ${request.url()}`);
    }
  });

  try {
    await page.goto(`${localOrigin}/?testSeed=79&testLocale=en`);
    expect(await page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);

    const pioneerName = page.getByRole("combobox", { name: "Pioneer name" });
    const startButton = page.getByTestId("start-game");
    await pioneerName.tap();
    await pioneerName.fill("Touch Pioneer");
    await expect(startButton).toHaveText("START NEW GAME");
    await startButton.tap();
    await expect(page.locator(".run-name")).toHaveText("Touch Pioneer");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:"))
              .length,
        ),
      )
      .toBe(1);

    await page.reload();
    const resumedName = page.getByRole("combobox", { name: "Pioneer name" });
    await resumedName.tap();
    const savedPioneer = page.getByRole("option", { name: /Touch Pioneer/ });
    await expect(savedPioneer).toBeVisible();
    await savedPioneer.tap();
    await expect(resumedName).toHaveValue("Touch Pioneer");
    await expect(startButton).toHaveText("RESUME GAME Touch Pioneer");
    await startButton.tap();
    await expect(page.locator(".run-name")).toHaveText("Touch Pioneer");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:"))
              .length,
        ),
      )
      .toBe(1);
    expect(browserErrors).toEqual([]);
  } finally {
    await context.close();
  }
});

test("name and import forms remain usable with zoom, larger text, long labels, and a reduced mobile viewport @save-slots @p22-forms", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 720 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const localOrigin = new URL(baseURL ?? "http://127.0.0.1:4173").origin;

  try {
    await page.goto(`${localOrigin}/?testSeed=84&testLocale=en`);
    await page.evaluate(() => (document.documentElement.style.fontSize = "125%"));
    await page.locator("#start-locale").selectOption("de");

    const pioneerName = page.locator("#pioneer-name");
    await page.setViewportSize({ width: 320, height: 520 });
    await expect(page.locator("label[for='pioneer-name']")).toHaveText(/\S/u);
    await pioneerName.focus();
    await pioneerName.fill("Skalierungspionierin");
    const nameBounds = await pioneerName.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return { top: bounds.top, bottom: bounds.bottom, viewport: window.innerHeight };
    });
    expect(nameBounds.top).toBeGreaterThanOrEqual(0);
    expect(nameBounds.bottom).toBeLessThanOrEqual(nameBounds.viewport);
    await page.keyboard.press("Enter");
    await expect(page.locator(".run-name")).toHaveText("Skalierungspionierin");

    await page.evaluate(() => (document.documentElement.style.fontSize = "100%"));
    await page.setViewportSize({ width: 390, height: 844 });
    await openSaveSettings(page);
    const importCode = page.locator("#import-code");
    await importCode.fill(rebirthFixtureCode(1, "Importierter Spielstand"));
    const previewButton = page.locator(".import-card .save-actions button").last();
    await previewButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("import-preview")).toBeVisible();

    await page.evaluate(() => (document.documentElement.style.fontSize = "125%"));
    await page.setViewportSize({ width: 390, height: 520 });
    const importName = page.locator("#import-new-name");
    await expect(page.locator("label[for='import-new-name']")).toHaveText(/\S/u);
    await importName.focus();
    await importName.fill("Deutscher Importname");
    const importBounds = await importName.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const visualViewport = window.visualViewport;
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        left: bounds.left,
        right: bounds.right,
        viewportTop: visualViewport?.offsetTop ?? 0,
        viewportLeft: visualViewport?.offsetLeft ?? 0,
        viewportWidth: visualViewport?.width ?? document.documentElement.clientWidth,
        viewportHeight: visualViewport?.height ?? window.innerHeight,
      };
    });
    expect(importBounds.top).toBeGreaterThanOrEqual(importBounds.viewportTop);
    expect(importBounds.bottom).toBeLessThanOrEqual(
      importBounds.viewportTop + importBounds.viewportHeight,
    );
    expect(importBounds.left).toBeGreaterThanOrEqual(importBounds.viewportLeft);
    expect(importBounds.right).toBeLessThanOrEqual(
      importBounds.viewportLeft + importBounds.viewportWidth,
    );
    const importCard = await page.locator(".import-card").boundingBox();
    expect(importCard).not.toBeNull();
    expect(importCard!.x + importCard!.width).toBeLessThanOrEqual(390);
    await page.setViewportSize({ width: 390, height: 844 });
    const importButton = page.locator(".import-preview .save-actions .primary-button");
    await importButton.focus();
    await page.keyboard.press("Enter");
    await expect(
      page
        .locator('[data-testid="game-notification"].notification-success')
        .filter({ hasText: saveText("de", "importedAsNew") }),
    ).toHaveText(saveText("de", "importedAsNew"));
  } finally {
    await context.close();
  }
});

test("name and import inputs stay in view under mobile zoom @save-slots @p22-zoom", async ({
  browser,
  baseURL,
}) => {
  const localOrigin = new URL(baseURL ?? "http://127.0.0.1:4173").origin;
  const mobileContext = () =>
    browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
  const visibleInVisualViewport = async (locator: Locator) =>
    locator.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const viewport = window.visualViewport;
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        left: bounds.left,
        right: bounds.right,
        viewportTop: viewport?.offsetTop ?? 0,
        viewportLeft: viewport?.offsetLeft ?? 0,
        viewportWidth: viewport?.width ?? document.documentElement.clientWidth,
        viewportHeight: viewport?.height ?? window.innerHeight,
      };
    });
  const isInsideViewport = (bounds: Awaited<ReturnType<typeof visibleInVisualViewport>>) => {
    expect(bounds.bottom).toBeGreaterThan(bounds.viewportTop);
    expect(bounds.top).toBeLessThan(bounds.viewportTop + bounds.viewportHeight);
    expect(bounds.right).toBeGreaterThan(bounds.viewportLeft);
    expect(bounds.left).toBeLessThan(bounds.viewportLeft + bounds.viewportWidth);
  };

  const nameContext = await mobileContext();
  try {
    const namePage = await nameContext.newPage();
    await namePage.goto(`${localOrigin}/?testSeed=85&testLocale=de`);
    const nameZoom = await nameContext.newCDPSession(namePage);
    await nameZoom.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1.5 });
    await namePage.setViewportSize({ width: 390, height: 520 });
    const nameInput = namePage.locator("#pioneer-name");
    await nameInput.focus();
    await nameInput.fill("Zoom Pionier");
    isInsideViewport(await visibleInVisualViewport(nameInput));
    await namePage.keyboard.press("Enter");
    await expect(namePage.locator(".run-name")).toHaveText("Zoom Pionier");
  } finally {
    await nameContext.close();
  }

  const importContext = await mobileContext();
  try {
    const importPage = await importContext.newPage();
    await importPage.goto(`${localOrigin}/?testSeed=86&testLocale=de`);
    await importPage.locator("#pioneer-name").fill("Zoom Import Test");
    await importPage.getByTestId("start-game").click();
    await openSaveSettings(importPage);
    await importPage.locator("#import-code").fill(rebirthFixtureCode(1, "Importierter Spielstand"));
    await importPage.getByRole("button", { name: "Importvorschau" }).click();

    const importZoom = await importContext.newCDPSession(importPage);
    await importZoom.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1.5 });
    await importPage.setViewportSize({ width: 390, height: 520 });
    const importName = importPage.locator("#import-new-name");
    await importName.focus();
    isInsideViewport(await visibleInVisualViewport(importName));
  } finally {
    await importContext.close();
  }
});

test("save management stays inline in Saving / Loading @save-slots @keyboard @ui-navigation", async ({
  freshGame,
}, testInfo) => {
  await openSaveManager(freshGame);
  const manager = freshGame.getByTestId("save-manager-inline");
  await expect(manager).toBeVisible();
  await expect(freshGame.locator("dialog.save-manager")).toHaveCount(0);
  await expect(freshGame.getByTestId("save-manager-open")).toHaveCount(0);
  await expect(manager.locator("#save-rename")).toBeVisible();
  await freshGame.keyboard.press("Escape");
  await expect(manager).toBeVisible();
  await captureVisualCheckpoint(freshGame, testInfo, "saving-and-loading-inline-management");
});

test("two pioneers keep separate Hydrogen progress across switching and reload @save-slots @reload @save-load-local", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=72&testLocale=en");
  await startFreshPioneer(page, "Ada");
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(page);
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  await page.reload();
  await resumePioneer(page, "Ada");
  await expect(page.locator(".run-name")).toHaveText("Ada");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  expect(
    await page.evaluate(
      () =>
        Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")).length,
    ),
  ).toBe(1);
  await page.reload();
  await startFreshPioneer(page, "Grace");
  for (let count = 0; count < 3; count += 1)
    await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(page);
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("3");
  await page.reload();
  await page.getByLabel("Pioneer name").fill("a");
  await expect(page.getByLabel("Pioneer name")).toHaveValue("a");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(2);
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  await captureVisualCheckpoint(page, testInfo, "two-local-pioneers");

  await resumePioneer(page, "Ada");
  await expect(page.locator(".run-name")).toHaveText("Ada");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "ada-resumed");

  await page.reload();
  await resumePioneer(page, "Ada");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  const resumedSimulationMs = await page.evaluate(
    () => window.miaplacidusTest?.getState().run.clock.simulationMs ?? 0,
  );
  expect(resumedSimulationMs).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().run.clock.simulationMs))
    .toBe(resumedSimulationMs);

  await openSaveManager(page);
  const manager = page.getByTestId("save-manager-inline");
  await manager.locator(".manager-slot-list").getByRole("button", { name: /^Grace/ }).click();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Grace");
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  await page.getByLabel("Pioneer name").blur();
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "manager-switch-prefill");
  await resumePioneer(page, "Grace");
  await expect(page.locator(".run-name")).toHaveText("Grace");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("3");
});

test("local slots preserve permanent state after one and two rebirths @save-slots @rebirth-save", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=77&testLocale=en");
  await startFreshPioneer(page, "Fixture Pioneer");
  await openSaveManager(page);
  const manager = page.getByTestId("save-manager-inline");

  for (const rebirthCount of [1, 2] as const) {
    const importedName = rebirthCount === 1 ? "Once Reborn" : "Twice Reborn";
    await manager
      .locator("#import-code")
      .fill(rebirthFixtureCode(rebirthCount, "Imported Pioneer"));
    await manager.getByRole("button", { name: "Preview import" }).click();
    await expect(manager.getByTestId("import-preview")).toContainText("Hydrogen");
    await manager.locator("#import-new-name").fill(importedName);
    await manager.getByRole("button", { name: "Import as a new pioneer" }).click();
    await expect(
      page
        .locator('[data-testid="game-notification"].notification-success')
        .filter({ hasText: saveText("en", "importedAsNew") })
        .last(),
    ).toHaveText(saveText("en", "importedAsNew"));
  }

  await page.locator("#tab-hydrogen").click();
  await page.reload();
  for (const rebirthCount of [1, 2] as const) {
    const importedName = rebirthCount === 1 ? "Once Reborn" : "Twice Reborn";
    await resumePioneer(page, importedName);
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().permanent.rebirthCount))
      .toBe(rebirthCount);
    await page.reload();
    await resumePioneer(page, importedName);
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().permanent.rebirthCount))
      .toBe(rebirthCount);
    await prepareSaveVisualCheckpoint(page);
    await captureVisualCheckpoint(page, testInfo, `rebirth-${rebirthCount}-restored`);
    if (rebirthCount === 1) await page.reload();
  }
});

test("rename, save-as-new, and delete keep stable slots and return to a valid prefill @save-slots @management", async ({
  freshGame,
}, testInfo) => {
  for (let count = 0; count < 4; count += 1)
    await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(freshGame);
  await openSaveManager(freshGame);
  let manager = freshGame.getByTestId("save-manager-inline");
  await manager.locator("#save-rename").fill("Hydrogen Prime");
  await manager.getByRole("button", { name: "Rename save" }).click();
  manager = freshGame.getByTestId("save-manager-inline");
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Prime");
  await prepareSaveVisualCheckpoint(freshGame);
  await captureVisualCheckpoint(freshGame, testInfo, "renamed-pioneer");

  await manager.locator("#save-copy-name").fill("Hydrogen Clone");
  await manager.getByRole("button", { name: "Save run as a new pioneer" }).click();
  await freshGame.locator("#tab-hydrogen").click();
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Clone");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("4");
  expect(
    await freshGame.evaluate(
      () =>
        Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")).length,
    ),
  ).toBe(2);

  await openSaveManager(freshGame);
  manager = freshGame.getByTestId("save-manager-inline");
  await manager.locator("#save-rename").fill("Hydrogen Prime");
  await manager.getByRole("button", { name: "Rename save" }).click();
  await expect(
    freshGame
      .locator('[data-testid="game-notification"].notification-error')
      .filter({ hasText: saveErrorText("en", "duplicate-name") }),
  ).toHaveText(saveErrorText("en", "duplicate-name"));
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Clone");
  await manager.getByRole("button", { name: "Delete this save" }).click();
  await manager.getByLabel("I exported this save or do not need it").click();
  await manager.getByRole("button", { name: "Confirm delete" }).click();
  await expect(
    freshGame
      .locator('[data-testid="game-notification"].notification-success')
      .filter({ hasText: saveText("en", "saveDeleted") }),
  ).toHaveText(saveText("en", "saveDeleted"));
  const pioneerName = freshGame.getByLabel("Pioneer name");
  await expect(pioneerName).toHaveValue("Hydrogen Prime");
  await pioneerName.click();
  await expect(freshGame.getByRole("option", { name: /^Hydrogen Prime/ })).toBeVisible();
  await pioneerName.blur();
  await prepareSaveVisualCheckpoint(freshGame);
  await captureVisualCheckpoint(freshGame, testInfo, "deleted-slot-valid-prefill");
});

test("portable save preview offers replace, new pioneer, and cancel before import @save-slots @import-export @save-load-local", async ({
  freshGame,
  browser,
}, testInfo) => {
  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await openSaveManager(freshGame);
  const manager = freshGame.getByTestId("save-manager-inline");
  await expect(manager.locator("p.save-capacity").first()).toHaveText(/\S/u);
  await expect(manager.locator("p.save-capacity").last()).toHaveText(/\S/u);
  const exportBox = manager.locator("textarea[readonly]");
  const portableCode = await exportBox.inputValue();
  const portableEnvelope = decodePortableFixture(portableCode);
  expect(portableEnvelope.state.run.goods.hydrogen.quantity).toBe(2);

  await freshGame.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await manager.locator(".save-manager-grid .save-manager-card").nth(1).locator(".save-actions button").nth(0).click();
  const copiedCode = await freshGame.evaluate(() => navigator.clipboard.readText());
  const copiedEnvelope = decodePortableFixture(copiedCode);
  expect(copiedEnvelope.pioneerName).toBe(portableEnvelope.pioneerName);
  expect(copiedEnvelope.state.run.goods.hydrogen.quantity).toBe(2);
  await manager.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(manager.locator("#import-code")).toHaveValue(copiedCode);
  await manager.locator('input[type="file"]').setInputFiles({
    name: "hydrogen-save.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(portableCode, "utf8"),
  });
  await expect(manager.locator("#import-code")).toHaveValue(portableCode);
  const [download] = await Promise.all([
    freshGame.waitForEvent("download"),
    manager.locator(".save-manager-grid .save-manager-card").nth(1).locator(".save-actions button").nth(1).click(),
  ]);
  const stream = await download.createReadStream();
  let downloadedText = "";
  for await (const chunk of stream ?? []) downloadedText += chunk.toString();
  const downloadedEnvelope = decodePortableFixture(downloadedText);
  expect(downloadedEnvelope.pioneerName).toBe("Hydrogen Pioneer");
  expect(downloadedEnvelope.state.run.goods.hydrogen.quantity).toBe(2);

  await manager.locator("#import-code").fill(portableCode);
  await manager.getByRole("button", { name: "Preview import" }).click();
  await expect(manager.getByTestId("import-preview")).toBeVisible();
  await expect(manager.getByRole("alert")).toHaveText(/\S/u);
  await prepareSaveVisualCheckpoint(freshGame);
  await captureVisualCheckpoint(freshGame, testInfo, "import-conflict-preview");
  await expect(manager.getByRole("button", { name: "Replace matching save" })).toBeDisabled();
  await expect(manager.getByRole("button", { name: "Import as a new pioneer" })).toBeVisible();
  await manager.getByLabel("I exported this save or do not need it").click();
  await manager.getByRole("button", { name: "Replace matching save" }).click();
  await expect(
    freshGame
      .locator('[data-testid="game-notification"].notification-success')
      .filter({ hasText: saveText("en", "loaded") }),
  ).toHaveText(saveText("en", "loaded"));
  await expect(manager.getByTestId("import-preview")).toHaveCount(0);

  await manager.locator("#import-code").fill(portableCode);
  await manager.getByRole("button", { name: "Preview import" }).click();
  await expect(manager.getByRole("button", { name: "Import as a new pioneer" })).toBeVisible();
  await manager.getByRole("button", { name: "Cancel import" }).click();
  await expect(manager.getByTestId("import-preview")).toHaveCount(0);

  await manager.locator("#import-code").fill(portableCode);
  await manager.getByRole("button", { name: "Preview import" }).click();
  await manager.locator("#import-new-name").fill("Hydrogen Restore");
  await manager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await expect(
    freshGame
      .locator('[data-testid="game-notification"].notification-success')
      .filter({ hasText: saveText("en", "importedAsNew") }),
  ).toHaveText(saveText("en", "importedAsNew"));
  await freshGame.locator("#tab-hydrogen").click();
  await freshGame.reload();
  await resumePioneer(freshGame, "Hydrogen Restore");
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Restore");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("2");
  await prepareSaveVisualCheckpoint(freshGame);
  await captureVisualCheckpoint(freshGame, testInfo, "portable-save-restored");

  const emptyProfile = await browser.newContext();
  const restorePage = await emptyProfile.newPage();
  const restoreErrors: string[] = [];
  restorePage.on("pageerror", (error) => restoreErrors.push(error.message));
  await restorePage.goto("/?testSeed=82&testLocale=en");
  await startFreshPioneer(restorePage, "Fresh Profile Starter");
  await openSaveManager(restorePage);
  const freshManager = restorePage.getByTestId("save-manager-inline");
  await freshManager.locator("#import-code").fill(portableCode);
  await freshManager.getByRole("button", { name: "Preview import" }).click();
  await freshManager.locator("#import-new-name").fill("Fresh Profile Restore");
  await freshManager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await restorePage.locator("#tab-hydrogen").click();
  await restorePage.reload();
  await resumePioneer(restorePage, "Fresh Profile Restore");
  await expect(restorePage.locator(".run-name")).toHaveText("Fresh Profile Restore");
  await expect(restorePage.getByTestId("hydrogen-quantity")).toContainText("2");
  await prepareSaveVisualCheckpoint(restorePage);
  await captureVisualCheckpoint(restorePage, testInfo, "fresh-profile-restore");
  expect(restoreErrors).toEqual([]);
  await emptyProfile.close();
});

test("a damaged head can be restored from the retained prior generation @save-slots @recovery", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=73&testLocale=en");
  await startFreshPioneer(page, "Recover");
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(page);
  await page.evaluate(() => {
    const headKey = Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:"));
    if (!headKey) throw new Error("The first slot head was not written.");
    const slotId = headKey.slice("miaplacidus:v1:head:".length);
    const commitId = localStorage.getItem(headKey);
    if (!commitId) throw new Error("The slot head was empty.");
    localStorage.setItem("miaplacidus:v1:slot:" + slotId + ":" + commitId, "broken-generation");
  });
  await page.reload();
  const recoverySection = page.locator(".local-save-recovery");
  await recoverySection.locator("summary").click();
  await expect(recoverySection.getByText("Needs recovery").first()).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "damaged-save-recovery");
  await page.getByRole("button", { name: "Review recovery" }).first().click();
  await page.getByRole("button", { name: "Restore this validated generation" }).first().click();
  await expect(page.getByTestId("game-notification")).toContainText("generation was restored");
  await resumePioneer(page, "Recover");
  await expect(page.locator(".run-name")).toHaveText("Recover");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "recovered-prior-generation");
});

test("blocked browser storage keeps the Hydrogen run playable and its code exportable @save-slots @storage-blocked", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=74&testLocale=en&testStorage=blocked");
  await startFreshPioneer(page, "Temporary");
  await openSaveSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("temporary");
  await page.locator("#tab-hydrogen").click();
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  await openSaveManager(page);
  await expect(page.locator('[data-testid="save-manager-inline"] textarea[readonly]')).toHaveValue(/^MIA1:/);
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "unsaved-temporary-session");
  await page.locator("#tab-hydrogen").click();
  await page.locator("#tab-hydrogen").click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
});

test("quota failure exports the live run and leaves the previous generation loadable @save-slots @quota @save-migration", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=78&testLocale=en");
  await startFreshPioneer(page, "Quota Pioneer");
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(page);
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("miaplacidus:v1:slot:") || key.startsWith("miaplacidus:v1:head:")) {
        throw new DOMException("Storage quota exceeded", "QuotaExceededError");
      }
      nativeSetItem.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(page);
  await openSaveSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Browser storage is full");
  await page.locator("#tab-hydrogen").click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2");
  await prepareSaveVisualCheckpoint(page);
  await captureVisualCheckpoint(page, testInfo, "quota-save-failure");
  await openSaveManager(page);
  const manager = page.getByTestId("save-manager-inline");
  const code = await manager.locator("textarea[readonly]").inputValue();
  const exported = JSON.parse(
    decompressFromEncodedURIComponent(code.slice("MIA1:".length)) ?? "null",
  ) as {
    state?: { run?: { goods?: { hydrogen?: { quantity?: number } } } };
  };
  expect(exported.state?.run?.goods?.hydrogen?.quantity).toBe(2);
  await page.locator("#tab-hydrogen").click();
  await page.reload();
  await resumePioneer(page, "Quota Pioneer");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
});

test("a second tab can play its loaded snapshot but cannot write over the active pioneer @save-slots @two-tabs @p20-announcements", async ({
  freshGame,
}) => {
  const secondTab = await freshGame.context().newPage();
  await secondTab.goto("/?testSeed=75&testLocale=en");
  await resumePioneer(secondTab, "Hydrogen Pioneer");
  await openSaveSettings(secondTab);
  const conflictAnnouncement = secondTab.getByTestId("save-conflict-announcement");
  await expect(conflictAnnouncement).toHaveAttribute("role", "status");
  await expect(conflictAnnouncement).toHaveAttribute("aria-live", "polite");
  await expect(conflictAnnouncement).toHaveAttribute("aria-atomic", "true");
  await expect(conflictAnnouncement).toHaveText("");
  await expect(secondTab.getByTestId("save-status")).toContainText("another tab");
  await secondTab.locator("#tab-hydrogen").click();
  const headKey = await secondTab.evaluate(
    () => Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:")) ?? null,
  );
  expect(headKey).not.toBeNull();
  const priorHead = await secondTab.evaluate((key) => localStorage.getItem(key!), headKey);
  await secondTab.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(secondTab);
  await expect
    .poll(() => secondTab.evaluate((key) => localStorage.getItem(key!), headKey))
    .toBe(priorHead);

  await setGameLocale(secondTab, "fr");
  await expect(secondTab.locator("html")).toHaveAttribute("lang", "fr");
  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(freshGame);
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("1");
  const frenchConflict =
    "La sauvegarde a changé dans un autre onglet. Rechargez ou exportez cette partie avant d'enregistrer.";
  await expect(conflictAnnouncement).toContainText(frenchConflict);
  const conflictBanner = secondTab.locator(".save-conflict-banner");
  await expect(conflictBanner).toContainText(frenchConflict);
  await expect(conflictBanner).not.toHaveAttribute("role", "alert");

  await openSaveSettings(secondTab);
  await expect(secondTab.getByTestId("save-status")).not.toHaveAttribute("aria-live");
  await expect(secondTab.getByTestId("save-status")).toContainText(frenchConflict);
  await secondTab.locator("#tab-hydrogen").click();
  await expect(conflictAnnouncement).toContainText(frenchConflict);
  await secondTab.close();
});

test("unsaved-exit choices preserve the active pioneer-selection focus @save-slots @p16-focus", async ({
  freshGame,
}) => {
  await saveNowFromSettings(freshGame);
  await freshGame.reload();
  await startFreshPioneer(freshGame, "Grace");
  await saveNowFromSettings(freshGame);
  await freshGame.reload();
  await resumePioneer(freshGame, "Hydrogen Pioneer");

  const staleTab = await freshGame.context().newPage();
  await staleTab.goto("/?testSeed=75&testLocale=en");
  await resumePioneer(staleTab, "Hydrogen Pioneer");
  await openSaveSettings(staleTab);
  await expect(staleTab.getByTestId("save-status")).toContainText("another tab");

  const graceSlot = staleTab
    .getByTestId("save-manager-inline")
    .getByRole("button", { name: /^Grace/ });
  const exitDialog = staleTab.getByTestId("unsaved-exit-dialog");
  await graceSlot.click();
  await expect(exitDialog).toBeVisible();
  await expect(exitDialog.getByRole("button").first()).toBeFocused();
  await staleTab.keyboard.press("Escape");
  await expect(exitDialog).toHaveCount(0);
  await expect(graceSlot).toBeFocused();

  await graceSlot.click();
  await expect(exitDialog).toBeVisible();
  await exitDialog.getByRole("button", { name: "Keep playing", exact: true }).click();
  await expect(exitDialog).toHaveCount(0);
  await expect(graceSlot).toBeFocused();

  await graceSlot.click();
  await expect(exitDialog).toBeVisible();
  await exitDialog.getByRole("button", { name: "Manage saves", exact: true }).click();
  await expect(exitDialog).toHaveCount(0);
  await expect(staleTab.getByTestId("save-manager-inline")).toBeVisible();
  await expect(graceSlot).toBeFocused();

  await graceSlot.click();
  await expect(exitDialog).toBeVisible();
  await exitDialog.getByRole("button", { name: "Discard temporary run", exact: true }).click();
  await expect(staleTab.locator("#pioneer-name")).toHaveValue("Grace");
  await expect(staleTab.locator("#pioneer-name")).toBeFocused();
});

test("French unsaved-exit dialog copy and actions fit 320px @save-slots @p51-unsaved-exit", async ({
  freshGame,
}) => {
  await saveNowFromSettings(freshGame);
  await freshGame.reload();
  await startFreshPioneer(freshGame, "Grace");
  await saveNowFromSettings(freshGame);
  await freshGame.reload();
  await resumePioneer(freshGame, "Hydrogen Pioneer");
  await setGameLocale(freshGame, "fr");
  await saveNowFromSettings(freshGame);

  const staleTab = await freshGame.context().newPage();
  await staleTab.goto("/?testSeed=75&testLocale=fr");
  await staleTab.locator("#pioneer-name").fill("Hydrogen Pioneer");
  await staleTab.getByRole("option").filter({ hasText: "Hydrogen Pioneer" }).click();
  await staleTab.getByTestId("start-game").click();
  await expect(staleTab.locator("html")).toHaveAttribute("lang", "fr");
  await staleTab.setViewportSize({ width: 320, height: 740 });
  await openSaveSettings(staleTab);

  const frenchConflict =
    "La sauvegarde a chang\u00e9 dans un autre onglet. Rechargez ou exportez cette partie avant d'enregistrer.";
  await expect(staleTab.getByTestId("save-status")).toContainText(frenchConflict);

  const graceSlot = staleTab
    .getByTestId("save-manager-inline")
    .getByRole("button", { name: /^Grace/ });
  await graceSlot.click();

  const exitDialog = staleTab.getByTestId("unsaved-exit-dialog");
  await expect(exitDialog).toBeVisible();
  await expect(exitDialog.locator(".save-warning")).toHaveText(frenchConflict);
  const frenchActions = [
    "Gestion des sauvegardes",
    "Continuer \u00e0 jouer",
    "Abandonner la partie temporaire",
  ];
  for (const actionName of frenchActions) {
    await expect(exitDialog.getByRole("button", { name: actionName, exact: true })).toBeVisible();
  }

  const layout = await exitDialog.evaluate((dialog) => {
    const dialogRect = dialog.getBoundingClientRect();
    const warning = dialog.querySelector<HTMLElement>(".save-warning");
    if (!warning) throw new Error("The unsaved-exit warning is missing.");
    const warningRect = warning.getBoundingClientRect();
    const actions = Array.from(dialog.querySelectorAll<HTMLButtonElement>(".save-actions button"));
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      dialog: {
        left: dialogRect.left,
        top: dialogRect.top,
        right: dialogRect.right,
        bottom: dialogRect.bottom,
        clientWidth: dialog.clientWidth,
        scrollWidth: dialog.scrollWidth,
      },
      warning: {
        left: warningRect.left,
        top: warningRect.top,
        right: warningRect.right,
        bottom: warningRect.bottom,
        clientWidth: warning.clientWidth,
        scrollWidth: warning.scrollWidth,
        clientHeight: warning.clientHeight,
        scrollHeight: warning.scrollHeight,
      },
      actions: actions.map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          text: button.innerText.trim(),
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          clientWidth: button.clientWidth,
          scrollWidth: button.scrollWidth,
          clientHeight: button.clientHeight,
          scrollHeight: button.scrollHeight,
        };
      }),
    };
  });

  expect(layout.viewportWidth).toBe(320);
  expect(layout.viewportHeight).toBe(740);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.dialog.left).toBeGreaterThanOrEqual(0);
  expect(layout.dialog.top).toBeGreaterThanOrEqual(0);
  expect(layout.dialog.right).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.dialog.bottom).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.dialog.scrollWidth).toBeLessThanOrEqual(layout.dialog.clientWidth);
  expect(layout.warning.top).toBeGreaterThanOrEqual(layout.dialog.top);
  expect(layout.warning.left).toBeGreaterThanOrEqual(layout.dialog.left);
  expect(layout.warning.right).toBeLessThanOrEqual(layout.dialog.right);
  expect(layout.warning.bottom).toBeLessThanOrEqual(layout.dialog.bottom);
  expect(layout.warning.scrollWidth).toBeLessThanOrEqual(layout.warning.clientWidth);
  expect(layout.warning.scrollHeight).toBeLessThanOrEqual(layout.warning.clientHeight + 1);
  expect(layout.actions).toHaveLength(frenchActions.length);
  for (const action of layout.actions) {
    expect(action.left).toBeGreaterThanOrEqual(layout.dialog.left);
    expect(action.top).toBeGreaterThanOrEqual(layout.dialog.top);
    expect(action.right).toBeLessThanOrEqual(layout.dialog.right);
    expect(action.bottom).toBeLessThanOrEqual(layout.dialog.bottom);
    expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth);
    expect(action.scrollHeight).toBeLessThanOrEqual(action.clientHeight + 1);
  }
});
