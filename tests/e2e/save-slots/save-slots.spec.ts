import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { createRequire } from "node:module";
import { createInitialGameState } from "../../../src/engine/state";
import {
  canonicalJson,
  checksumFor,
  makeEnvelope,
  SAVE_SCHEMA_VERSION,
} from "../../../src/persistence/schema";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent, decompressFromUTF16 } =
  createRequire(import.meta.url)("lz-string") as typeof import("lz-string");

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

test("Confirm is only a preflight; cancelling creates no save and Start creates a local slot @save-slots @lifecycle", async ({
  page,
  browserErrors,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("another-game:keep", "untouched"));
  await page.goto("/?testSeed=71&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Ada Lovelace");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await captureVisualCheckpoint(page, testInfo, "name-confirmed");
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")),
    ),
  ).toEqual([]);

  await page.getByRole("button", { name: "Edit selection" }).click();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")),
    ),
  ).toEqual([]);
  await page.getByLabel("Pioneer name").fill("Grace");
  await expect(page.getByRole("button", { name: "Start", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await captureVisualCheckpoint(page, testInfo, "changed-name-reconfirmed");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".run-name")).toHaveText("Grace");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")).length,
      ),
    )
    .toBe(1);
  expect(await page.evaluate(() => localStorage.getItem("another-game:keep"))).toBe("untouched");
  await captureVisualCheckpoint(page, testInfo, "new-local-slot");
  expect(browserErrors).toEqual([]);
});

test("a fresh pioneer receives the Hydrogen briefing once and its completion survives reload @save-slots @onboarding", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=73&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Briefing Pioneer");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("hydrogen-onboarding")).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "hydrogen-first-run-briefing");

  await page.reload();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Briefing Pioneer");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("hydrogen-onboarding")).toBeVisible();

  await page.getByRole("button", { name: "Begin exploring" }).click();
  await expect(page.getByTestId("hydrogen-onboarding")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.includes(":hydrogenBriefing:")),
    ),
  ).toEqual([]);
  await captureVisualCheckpoint(page, testInfo, "hydrogen-briefing-complete");

  await page.reload();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("hydrogen-onboarding")).toHaveCount(0);
});

test("two pioneers keep separate Hydrogen progress across switching and reload @save-slots @reload @save-load-local", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=72&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Ada");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  await page.getByRole("button", { name: "Pioneer selection" }).click();

  await page.getByLabel("Pioneer name").fill("aDA");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".run-name")).toHaveText("Ada");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  expect(
    await page.evaluate(
      () =>
        Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")).length,
    ),
  ).toBe(1);
  await page.getByRole("button", { name: "Pioneer selection" }).click();

  await page.getByLabel("Pioneer name").fill("Grace");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  for (let count = 0; count < 3; count += 1)
    await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("3");
  await page.getByRole("button", { name: "Pioneer selection" }).click();
  await captureVisualCheckpoint(page, testInfo, "two-local-pioneers");

  await page.getByRole("button", { name: /^Ada/ }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".run-name")).toHaveText("Ada");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  await captureVisualCheckpoint(page, testInfo, "ada-resumed");

  await page.reload();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Ada");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  const resumedSimulationMs = await page.evaluate(
    () => window.miaplacidusTest?.getState().run.clock.simulationMs ?? 0,
  );
  expect(resumedSimulationMs).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().run.clock.simulationMs))
    .toBe(resumedSimulationMs);

  await page.getByRole("button", { name: "Save manager" }).click();
  const manager = page.getByRole("dialog", { name: "Ada" });
  await manager.getByRole("button", { name: /^Grace/ }).click();
  await expect(page.getByLabel("Pioneer name")).toHaveValue("Grace");
  await expect(page.getByRole("button", { name: "Start", exact: true })).toHaveCount(0);
  await captureVisualCheckpoint(page, testInfo, "manager-switch-prefill");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".run-name")).toHaveText("Grace");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("3");
});

test("durable timer IDs and offline clock anchors survive a player-triggered save and reload @save-slots @durable-timers @save-load-local", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=76&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Timer Pioneer");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
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
  await page.getByRole("button", { name: "Save now" }).click();
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
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
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
  await page.getByLabel("Pioneer name").fill("Fixture Pioneer");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Save manager" }).click();
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
  await page.getByRole("button", { name: "Pioneer selection" }).click();
  for (const rebirthCount of [1, 2] as const) {
    const importedName = rebirthCount === 1 ? "Once Reborn" : "Twice Reborn";
    await page.getByRole("button", { name: new RegExp("^" + importedName) }).click();
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().permanent.rebirthCount))
      .toBe(rebirthCount);
    await page.reload();
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().permanent.rebirthCount))
      .toBe(rebirthCount);
    await captureVisualCheckpoint(page, testInfo, `rebirth-${rebirthCount}-restored`);
    if (rebirthCount === 1) await page.getByRole("button", { name: "Pioneer selection" }).click();
  }
});

test("a synthetic MIAPLACIDUS v0 save migrates and starts as a playable slot @save-migration @migration", async ({
  freshGame,
}, testInfo) => {
  await freshGame.getByRole("button", { name: "Save manager" }).click();
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
  await freshGame.getByRole("button", { name: "Pioneer selection" }).click();
  await freshGame.getByRole("button", { name: /^Migrated Pioneer/ }).click();
  await freshGame.getByRole("button", { name: "Confirm", exact: true }).click();
  await freshGame.getByRole("button", { name: "Start", exact: true }).click();
  await expect(freshGame.locator(".run-name")).toHaveText("Migrated Pioneer");
  await expect(freshGame.getByTestId("hydrogen-onboarding")).toHaveCount(0);
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(freshGame, testInfo, "synthetic-v0-migrated-playable");
});

test("rename, save-as-new, and delete keep stable slots and return to a valid prefill @save-slots @management", async ({
  freshGame,
}, testInfo) => {
  for (let count = 0; count < 4; count += 1)
    await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await freshGame.getByRole("button", { name: "Save now" }).click();
  await freshGame.getByRole("button", { name: "Save manager" }).click();
  let manager = freshGame.getByRole("dialog", { name: "Hydrogen Pioneer" });
  await manager.getByLabel("New pioneer name").first().fill("Hydrogen Prime");
  await manager.getByRole("button", { name: "Rename save" }).click();
  manager = freshGame.getByRole("dialog", { name: "Hydrogen Prime" });
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Prime");
  await captureVisualCheckpoint(freshGame, testInfo, "renamed-pioneer");

  await manager.getByLabel("New pioneer name").nth(1).fill("Hydrogen Clone");
  await manager.getByRole("button", { name: "Save run as a new pioneer" }).click();
  await expect(freshGame.getByRole("dialog")).toHaveCount(0);
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Clone");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("4");
  expect(
    await freshGame.evaluate(
      () =>
        Object.keys(localStorage).filter((key) => key.startsWith("miaplacidus:v1:head:")).length,
    ),
  ).toBe(2);

  await freshGame.getByRole("button", { name: "Save manager" }).click();
  manager = freshGame.getByRole("dialog", { name: "Hydrogen Clone" });
  await manager.getByLabel("New pioneer name").first().fill("Hydrogen Prime");
  await manager.getByRole("button", { name: "Rename save" }).click();
  await expect(manager.getByRole("alert")).toContainText("already uses this name");
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Clone");
  await manager.getByRole("button", { name: "Delete this save" }).click();
  await manager.getByLabel("I exported this save or do not need it").click();
  await manager.getByRole("button", { name: "Confirm delete" }).click();
  await expect(freshGame.getByLabel("Pioneer name")).toHaveValue("Hydrogen Prime");
  await expect(freshGame.getByRole("button", { name: /^Hydrogen Prime/ })).toBeVisible();
  await captureVisualCheckpoint(freshGame, testInfo, "deleted-slot-valid-prefill");
});

test("portable save preview offers replace, new pioneer, and cancel before import @save-slots @import-export @save-load-local", async ({
  freshGame,
  browser,
}, testInfo) => {
  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await freshGame.getByRole("button", { name: "Save manager" }).click();
  const manager = freshGame.getByRole("dialog", { name: "Hydrogen Pioneer" });
  await expect(manager.getByText("Compressed local save")).toBeVisible();
  await expect(manager.getByText(/Estimated space left after this save/)).toBeVisible();
  const exportBox = manager.getByLabel("Portable save code");
  const portableCode = await exportBox.inputValue();
  expect(portableCode).toMatch(/^MIA1:/);

  await freshGame.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await manager.getByRole("button", { name: "Copy code" }).click();
  expect(await freshGame.evaluate(() => navigator.clipboard.readText())).toBe(portableCode);
  await manager.getByRole("button", { name: "Paste", exact: true }).click();
  await expect(manager.getByLabel("Paste a MIAPLACIDUS save code")).toHaveValue(portableCode);
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
  expect(downloadedText).toBe(portableCode);

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
  await freshGame.getByRole("button", { name: "Pioneer selection" }).click();
  await expect(freshGame.getByRole("button", { name: /^Hydrogen Restore/ })).toBeVisible();
  await freshGame.getByRole("button", { name: /^Hydrogen Restore/ }).click();
  await freshGame.getByRole("button", { name: "Confirm", exact: true }).click();
  await freshGame.getByRole("button", { name: "Start", exact: true }).click();
  await expect(freshGame.locator(".run-name")).toHaveText("Hydrogen Restore");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("2");
  await captureVisualCheckpoint(freshGame, testInfo, "portable-save-restored");

  const emptyProfile = await browser.newContext();
  const restorePage = await emptyProfile.newPage();
  const restoreErrors: string[] = [];
  restorePage.on("pageerror", (error) => restoreErrors.push(error.message));
  await restorePage.goto("/?testSeed=82&testLocale=en");
  await restorePage.getByLabel("Pioneer name").fill("Fresh Profile Starter");
  await restorePage.getByRole("button", { name: "Confirm", exact: true }).click();
  await restorePage.getByRole("button", { name: "Start", exact: true }).click();
  await restorePage.getByRole("button", { name: "Save manager" }).click();
  const freshManager = restorePage.getByRole("dialog", { name: "Fresh Profile Starter" });
  await freshManager.getByLabel("Paste a MIAPLACIDUS save code").fill(portableCode);
  await freshManager.getByRole("button", { name: "Preview import" }).click();
  await freshManager.getByLabel("New pioneer name").last().fill("Fresh Profile Restore");
  await freshManager.getByRole("button", { name: "Import as a new pioneer" }).click();
  await freshManager.getByRole("button", { name: "Cancel", exact: true }).click();
  await restorePage.getByRole("button", { name: "Pioneer selection" }).click();
  await restorePage.getByRole("button", { name: /^Fresh Profile Restore/ }).click();
  await restorePage.getByRole("button", { name: "Confirm", exact: true }).click();
  await restorePage.getByRole("button", { name: "Start", exact: true }).click();
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
  await page.getByLabel("Pioneer name").fill("Recover");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await page.getByRole("button", { name: "Save now" }).click();
  await page.evaluate(() => {
    const headKey = Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:"));
    if (!headKey) throw new Error("The first slot head was not written.");
    const slotId = headKey.slice("miaplacidus:v1:head:".length);
    const commitId = localStorage.getItem(headKey);
    if (!commitId) throw new Error("The slot head was empty.");
    localStorage.setItem("miaplacidus:v1:slot:" + slotId + ":" + commitId, "broken-generation");
  });
  await page.reload();
  await expect(page.getByText("Needs recovery").first()).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "damaged-save-recovery");
  await page.getByRole("button", { name: "Review recovery" }).first().click();
  await page.getByRole("button", { name: "Restore this validated generation" }).first().click();
  await expect(page.getByRole("status")).toContainText("generation was restored");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".run-name")).toHaveText("Recover");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(page, testInfo, "recovered-prior-generation");
});

test("blocked browser storage keeps the Hydrogen run playable and its code exportable @save-slots @storage-blocked", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=74&testLocale=en&testStorage=blocked");
  await page.getByLabel("Pioneer name").fill("Temporary");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("save-status")).toContainText("temporary");
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
  await page.getByRole("button", { name: "Save manager" }).click();
  await expect(page.getByLabel("Portable save code")).toHaveValue(/^MIA1:/);
  await captureVisualCheckpoint(page, testInfo, "unsaved-temporary-session");
  await page
    .getByRole("dialog", { name: "Temporary" })
    .getByRole("button", { name: "Cancel" })
    .click();
  await page.getByRole("button", { name: "Pioneer selection" }).click();
  await expect(page.getByTestId("unsaved-exit-dialog")).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "unsaved-exit-confirmation");
  await page.getByRole("button", { name: "Keep playing" }).click();
  await expect(page.getByTestId("unsaved-exit-dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Pioneer selection" }).click();
  await page.getByRole("button", { name: "Discard temporary run" }).click();
  await expect(page.getByLabel("Pioneer name")).toBeVisible();
});

test("quota failure exports the live run and leaves the previous generation loadable @save-slots @quota @save-migration", async ({
  page,
}, testInfo) => {
  await page.goto("/?testSeed=78&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Quota Pioneer");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await page.getByRole("button", { name: "Save now" }).click();
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
  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.getByTestId("save-status")).toContainText("Browser storage is full");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2");
  await captureVisualCheckpoint(page, testInfo, "quota-save-failure");
  await page.getByRole("button", { name: "Save manager" }).click();
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
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");
});

test("a second tab can play its loaded snapshot but cannot write over the active pioneer @save-slots @two-tabs", async ({
  freshGame,
}, testInfo) => {
  const secondTab = await freshGame.context().newPage();
  await secondTab.goto("/?testSeed=75&testLocale=en");
  await secondTab.getByLabel("Pioneer name").fill("Hydrogen Pioneer");
  await secondTab.getByRole("button", { name: "Confirm", exact: true }).click();
  await secondTab.getByRole("button", { name: "Start", exact: true }).click();
  await expect(secondTab.getByTestId("save-status")).toContainText("another tab");
  const headKey = await secondTab.evaluate(
    () => Object.keys(localStorage).find((key) => key.startsWith("miaplacidus:v1:head:")) ?? null,
  );
  expect(headKey).not.toBeNull();
  const priorHead = await secondTab.evaluate((key) => localStorage.getItem(key!), headKey);
  await secondTab.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await secondTab.getByRole("button", { name: "Save now" }).click();
  await expect
    .poll(() => secondTab.evaluate((key) => localStorage.getItem(key!), headKey))
    .toBe(priorHead);

  await freshGame.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await freshGame.getByRole("button", { name: "Save now" }).click();
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("1");
  await expect(secondTab.getByTestId("save-status")).toContainText("changed in another tab");
  await captureVisualCheckpoint(freshGame, testInfo, "single-writer-active-tab");
  await secondTab.close();
});
