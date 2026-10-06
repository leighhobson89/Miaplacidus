import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { openSaveManager, openSaveSettings, saveNowFromSettings } from "../_harness/save-controls";
import type { Page } from "@playwright/test";
import { createRequire } from "node:module";
import { createInitialGameState } from "../../../src/engine/state";
import {
  canonicalJson,
  checksumFor,
  isSaveEnvelope,
  makeEnvelope,
  SAVE_SCHEMA_VERSION,
} from "../../../src/persistence/schema";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent, decompressFromUTF16 } =
  createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

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

function syntheticV0Code(name: string): string {
  const state = createInitialGameState({ pioneerName: name, seed: 2026 });
  const oldBody = {
    format: "miaplacidus.save",
    schemaVersion: 0,
    slotId: "00000000-0000-4000-8000-000000000100",
    pioneerName: name,
    createdAt: 100,
    savedAt: 200,
    revision: 1,
    state: {
      schemaVersion: 0,
      run: state.run,
      permanent: state.permanent,
      settings: state.settings,
    },
  };
  const checksum = checksumFor(oldBody as unknown as Parameters<typeof checksumFor>[0]);
  return "MIA1:" + compressToEncodedURIComponent(canonicalJson({ ...oldBody, checksum }));
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
  await expect(page.locator("#tab-resources-hydrogen .attention-badge")).toHaveText("New");
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

  await page.reload();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Direct Start Pioneer");
  await page.getByLabel("Pioneer name").click();
  await page.getByRole("option", { name: /Direct Start Pioneer/ }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator(".hydrogen-briefing")).toHaveCount(0);
  await expect(page.locator(".run-name")).toHaveText("Direct Start Pioneer");
  await page.locator(".game-nav [role='tab'][aria-controls='pane-miaplaedia']").click();
  await expect(page.locator(".miaplaedia-page button")).toHaveCount(0);
  await captureVisualCheckpoint(page, testInfo, "hydrogen-resume-no-replay-control");

  await page.reload();
  await page.getByLabel("Pioneer name").click();
  await page.getByRole("option", { name: /Direct Start Pioneer/ }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator(".hydrogen-briefing")).toHaveCount(0);
});

test("keyboard can create a pioneer and search and resume a saved pioneer @save-slots @keyboard @accessibility", async ({
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
  await page.keyboard.press("Tab");
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
  await page.keyboard.press("Tab");
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

test("Escape closes Save Manager and restores focus to its opener @save-slots @keyboard @ui-navigation", async ({
  freshGame,
}, testInfo) => {
  await openSaveManager(freshGame);
  const manager = freshGame.getByRole("dialog", { name: "Hydrogen Pioneer" });
  const opener = freshGame.getByTestId("save-manager-open");
  await expect(manager).toBeVisible();
  await freshGame.keyboard.press("Escape");
  await expect(manager).toHaveCount(0);
  await expect(opener).toBeFocused();
  await captureVisualCheckpoint(freshGame, testInfo, "save-manager-focus-restored");
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
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(2);
  await captureVisualCheckpoint(page, testInfo, "two-local-pioneers");

  await resumePioneer(page, "Ada");
  await expect(page.locator(".run-name")).toHaveText("Ada");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
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
  const manager = page.getByRole("dialog", { name: "Ada" });
  await manager.getByRole("button", { name: /^Grace/ }).click();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Grace");
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  await captureVisualCheckpoint(page, testInfo, "manager-switch-prefill");
  await resumePioneer(page, "Grace");
  await expect(page.locator(".run-name")).toHaveText("Grace");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("3");
});

test("durable timer IDs and offline clock anchors survive a player-triggered save and reload @save-slots @durable-timers @save-load-local", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=76&testLocale=en");
  await startFreshPioneer(page, "Timer Pioneer");
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const added = await page.evaluate(() =>
    window.miaplacidusTest?.dispatch({
      type: "timer.add",
      timerId: "research:long-study",
      domain: "research",
      durationMs: 60_000,
      repeat: true,
    }),
  );
  expect(added).toBe(true);
  expect(
    await page.evaluate(() => window.miaplacidusTest?.getState().run.timers["research:long-study"]),
  ).toMatchObject({ id: "research:long-study", status: "running" });
  await saveNowFromSettings(page);
  const activePayload = await page.evaluate(() => {
    const headKey = Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:"));
    if (!headKey) return null;
    const slotId = headKey.slice("miaplacidus:v1:head:".length);
    const commitId = localStorage.getItem(headKey);
    return commitId ? localStorage.getItem(`miaplacidus:v1:slot:${slotId}:${commitId}`) : null;
  });
  expect(activePayload).not.toBeNull();
  const savedEnvelope = JSON.parse(decompressFromUTF16(activePayload!) ?? "null") as {
    state?: { run?: { timers?: Record<string, unknown> } };
  };
  expect(savedEnvelope.state?.run?.timers?.["research:long-study"]).toMatchObject({
    id: "research:long-study",
    status: "running",
  });
  const savedWallTime = await page.evaluate(
    () => window.miaplacidusTest?.getState().run.clock.wallNowMs,
  );
  expect(savedWallTime).not.toBeNull();
  await page.reload();
  const reloadedPayload = await page.evaluate(() => {
    const headKey = Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:"));
    if (!headKey) return null;
    const slotId = headKey.slice("miaplacidus:v1:head:".length);
    const commitId = localStorage.getItem(headKey);
    return commitId ? localStorage.getItem(`miaplacidus:v1:slot:${slotId}:${commitId}`) : null;
  });
  expect(reloadedPayload).not.toBeNull();
  const reloadedEnvelope = JSON.parse(decompressFromUTF16(reloadedPayload!) ?? "null") as {
    state?: { run?: { timers?: Record<string, unknown> } };
  };
  expect(reloadedEnvelope.state?.run?.timers?.["research:long-study"]).toMatchObject({
    id: "research:long-study",
    status: "running",
  });
  await resumePioneer(page, "Timer Pioneer");
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const restored = await page.evaluate(() => window.miaplacidusTest?.getState());
  expect(restored?.run.timers["research:long-study"]).toMatchObject({
    id: "research:long-study",
    domain: "research",
    durationMs: 60_000,
    repeat: true,
    status: "running",
  });
  expect(restored?.run.clock.wallNowMs).toBeGreaterThanOrEqual(savedWallTime ?? 0);
  await captureVisualCheckpoint(page, testInfo, "durable-timer-after-reload");
});

test("local slots preserve permanent state after one and two rebirths @save-slots @rebirth-save", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=77&testLocale=en");
  await startFreshPioneer(page, "Fixture Pioneer");
  await openSaveManager(page);
  const manager = page.getByRole("dialog", { name: "Fixture Pioneer" });

  for (const rebirthCount of [1, 2] as const) {
    const importedName = rebirthCount === 1 ? "Once Reborn" : "Twice Reborn";
    await manager
      .getByLabel("Paste a MIAPLACIDUS save code")
      .fill(rebirthFixtureCode(rebirthCount, "Imported Pioneer"));
    await manager.getByRole("button", { name: "Preview import" }).click();
    await expect(manager.getByTestId("import-preview")).toContainText("Hydrogen");
    await manager.getByLabel("New pioneer name").last().fill(importedName);
    await manager.getByRole("button", { name: "Import as a new pioneer" }).click();
    await expect(manager.getByRole("status")).toContainText("Save imported");
  }

  await manager.getByRole("button", { name: "Cancel" }).click();
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
    await captureVisualCheckpoint(page, testInfo, `rebirth-${rebirthCount}-restored`);
    if (rebirthCount === 1) await page.reload();
  }
});

test("a synthetic MIAPLACIDUS v0 save migrates and starts as a playable slot @save-migration @migration", async ({
  freshGame,
}, testInfo) => {
  await openSaveManager(freshGame);
  const manager = freshGame.getByRole("dialog", { name: "Hydrogen Pioneer" });
  await manager.getByLabel("Paste a MIAPLACIDUS save code").fill(syntheticV0Code("Legacy Pioneer"));
  await manager.getByRole("button", { name: "Preview import" }).click();
  await expect(manager.getByTestId("import-preview")).toContainText(
    `Save version: ${SAVE_SCHEMA_VERSION}`,
  );
  await expect(manager.getByTestId("import-preview")).toContainText("Hydrogen");
  await manager.getByLabel("New pioneer name").last().fill("Migrated Pioneer");
  await manager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await expect(manager.getByRole("status")).toContainText("Save imported");
  await manager.getByRole("button", { name: "Cancel" }).click();
  await freshGame.reload();
  await resumePioneer(freshGame, "Migrated Pioneer");
  await expect(freshGame.locator(".run-name")).toHaveText("Migrated Pioneer");
  await expect(freshGame.locator(".hydrogen-briefing")).toHaveCount(0);
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(freshGame, testInfo, "synthetic-v0-migrated-playable");
});

test("rename, save-as-new, and delete keep stable slots and return to a valid prefill @save-slots @management", async ({
  freshGame,
}, testInfo) => {
  for (let count = 0; count < 4; count += 1)
    await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(freshGame);
  await openSaveManager(freshGame);
  let manager = freshGame.getByRole("dialog", { name: "Hydrogen Pioneer" });
  await manager.getByLabel("New pioneer name").first().fill("Hydrogen Prime");
  await manager.getByRole("button", { name: "Rename save" }).click();
  manager = freshGame.getByRole("dialog", { name: "Hydrogen Prime" });
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Prime");
  await captureVisualCheckpoint(freshGame, testInfo, "renamed-pioneer");

  await manager.getByLabel("New pioneer name").nth(1).fill("Hydrogen Clone");
  await manager.getByRole("button", { name: "Save run as a new pioneer" }).click();
  await expect(freshGame.getByRole("dialog")).toHaveCount(0);
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
  manager = freshGame.getByRole("dialog", { name: "Hydrogen Clone" });
  await manager.getByLabel("New pioneer name").first().fill("Hydrogen Prime");
  await manager.getByRole("button", { name: "Rename save" }).click();
  await expect(manager.getByRole("alert")).toContainText("already uses this name");
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Clone");
  await manager.getByRole("button", { name: "Delete this save" }).click();
  await manager.getByLabel("I exported this save or do not need it").click();
  await manager.getByRole("button", { name: "Confirm delete" }).click();
  const pioneerName = freshGame.getByLabel("Pioneer name");
  await expect(pioneerName).toHaveValue("Hydrogen Prime");
  await pioneerName.click();
  await expect(freshGame.getByRole("option", { name: /^Hydrogen Prime/ })).toBeVisible();
  await captureVisualCheckpoint(freshGame, testInfo, "deleted-slot-valid-prefill");
});

test("portable save preview offers replace, new pioneer, and cancel before import @save-slots @import-export @save-load-local", async ({
  freshGame,
  browser,
}, testInfo) => {
  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await openSaveManager(freshGame);
  const manager = freshGame.getByRole("dialog", { name: "Hydrogen Pioneer" });
  await expect(manager.getByText("Compressed local save")).toBeVisible();
  await expect(manager.getByText(/Estimated space left after this save/)).toBeVisible();
  const exportBox = manager.getByLabel("Portable save code");
  const portableCode = await exportBox.inputValue();
  const portableEnvelope = decodePortableFixture(portableCode);
  expect(portableEnvelope.state.run.goods.hydrogen.quantity).toBe(2);

  await freshGame.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await manager.getByRole("button", { name: "Copy code" }).click();
  const copiedCode = await freshGame.evaluate(() => navigator.clipboard.readText());
  const copiedEnvelope = decodePortableFixture(copiedCode);
  expect(copiedEnvelope.pioneerName).toBe(portableEnvelope.pioneerName);
  expect(copiedEnvelope.state.run.goods.hydrogen.quantity).toBe(2);
  await manager.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(manager.getByLabel("Paste a MIAPLACIDUS save code")).toHaveValue(copiedCode);
  await manager.getByLabel("Choose .txt save file").setInputFiles({
    name: "hydrogen-save.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(portableCode, "utf8"),
  });
  await expect(manager.getByLabel("Paste a MIAPLACIDUS save code")).toHaveValue(portableCode);
  const [download] = await Promise.all([
    freshGame.waitForEvent("download"),
    manager.getByRole("button", { name: "Download .txt" }).click(),
  ]);
  const stream = await download.createReadStream();
  let downloadedText = "";
  for await (const chunk of stream ?? []) downloadedText += chunk.toString();
  const downloadedEnvelope = decodePortableFixture(downloadedText);
  expect(downloadedEnvelope.pioneerName).toBe("Hydrogen Pioneer");
  expect(downloadedEnvelope.state.run.goods.hydrogen.quantity).toBe(2);

  await manager.getByLabel("Paste a MIAPLACIDUS save code").fill(portableCode);
  await manager.getByRole("button", { name: "Preview import" }).click();
  await expect(manager.getByTestId("import-preview")).toBeVisible();
  await captureVisualCheckpoint(freshGame, testInfo, "import-conflict-preview");
  await expect(manager.getByRole("button", { name: "Replace matching save" })).toBeDisabled();
  await expect(manager.getByRole("button", { name: "Import as a new pioneer" })).toBeVisible();
  await manager.getByLabel("I exported this save or do not need it").click();
  await manager.getByRole("button", { name: "Replace matching save" }).click();
  await expect(manager.getByRole("status")).toContainText("Save imported");
  await expect(manager.getByTestId("import-preview")).toHaveCount(0);

  await manager.getByLabel("Paste a MIAPLACIDUS save code").fill(portableCode);
  await manager.getByRole("button", { name: "Preview import" }).click();
  await expect(manager.getByRole("button", { name: "Import as a new pioneer" })).toBeVisible();
  await manager.getByRole("button", { name: "Cancel import" }).click();
  await expect(manager.getByTestId("import-preview")).toHaveCount(0);

  await manager.getByLabel("Paste a MIAPLACIDUS save code").fill(portableCode);
  await manager.getByRole("button", { name: "Preview import" }).click();
  await manager.getByLabel("New pioneer name").last().fill("Hydrogen Restore");
  await manager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await expect(manager.getByRole("status")).toContainText("Save imported");
  await manager.getByRole("button", { name: "Cancel" }).click();
  await freshGame.reload();
  await resumePioneer(freshGame, "Hydrogen Restore");
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Restore");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("2");
  await captureVisualCheckpoint(freshGame, testInfo, "portable-save-restored");

  const emptyProfile = await browser.newContext();
  const restorePage = await emptyProfile.newPage();
  const restoreErrors: string[] = [];
  restorePage.on("pageerror", (error) => restoreErrors.push(error.message));
  await restorePage.goto("/?testSeed=82&testLocale=en");
  await startFreshPioneer(restorePage, "Fresh Profile Starter");
  await openSaveManager(restorePage);
  const freshManager = restorePage.getByRole("dialog", { name: "Fresh Profile Starter" });
  await freshManager.getByLabel("Paste a MIAPLACIDUS save code").fill(portableCode);
  await freshManager.getByRole("button", { name: "Preview import" }).click();
  await freshManager.getByLabel("New pioneer name").last().fill("Fresh Profile Restore");
  await freshManager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await freshManager.getByRole("button", { name: "Cancel", exact: true }).click();
  await restorePage.reload();
  await resumePioneer(restorePage, "Fresh Profile Restore");
  await expect(restorePage.locator(".run-name")).toHaveText("Fresh Profile Restore");
  await expect(restorePage.getByTestId("hydrogen-quantity")).toContainText("2");
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
  await expect(page.getByRole("status")).toContainText("generation was restored");
  await resumePioneer(page, "Recover");
  await expect(page.locator(".run-name")).toHaveText("Recover");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
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
  await expect(page.getByLabel("Portable save code")).toHaveValue(/^MIA1:/);
  await captureVisualCheckpoint(page, testInfo, "unsaved-temporary-session");
  await page
    .getByRole("dialog", { name: "Temporary" })
    .getByRole("button", { name: "Cancel" })
    .click();
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
  await captureVisualCheckpoint(page, testInfo, "quota-save-failure");
  await openSaveManager(page);
  const manager = page.getByRole("dialog", { name: "Quota Pioneer" });
  const code = await manager.getByLabel("Portable save code").inputValue();
  const exported = JSON.parse(
    decompressFromEncodedURIComponent(code.slice("MIA1:".length)) ?? "null",
  ) as {
    state?: { run?: { goods?: { hydrogen?: { quantity?: number } } } };
  };
  expect(exported.state?.run?.goods?.hydrogen?.quantity).toBe(2);
  await manager.getByRole("button", { name: "Cancel" }).click();
  await page.reload();
  await resumePioneer(page, "Quota Pioneer");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
});

test("a second tab can play its loaded snapshot but cannot write over the active pioneer @save-slots @two-tabs", async ({
  freshGame,
}, testInfo) => {
  const secondTab = await freshGame.context().newPage();
  await secondTab.goto("/?testSeed=75&testLocale=en");
  await resumePioneer(secondTab, "Hydrogen Pioneer");
  await openSaveSettings(secondTab);
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

  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await saveNowFromSettings(freshGame);
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("1");
  await openSaveSettings(secondTab);
  await expect(secondTab.getByTestId("save-status")).toContainText("changed in another tab");
  await captureVisualCheckpoint(freshGame, testInfo, "single-writer-active-tab");
  await secondTab.close();
});
