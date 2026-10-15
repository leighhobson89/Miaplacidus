import { type Page } from "@playwright/test";
import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager } from "../_harness/save-controls";
import { saveText } from "../../../src/i18n/saveMessages";
import type { GameState } from "../../../src/engine/state";

const { decompressFromEncodedURIComponent, decompressFromUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

interface PortableSaveForRoundTrip {
  readonly pioneerName: string;
  readonly state: GameState;
}

function decodePortableCode(code: string): PortableSaveForRoundTrip {
  expect(code).toMatch(/^MIA1:/u);
  const json = decompressFromEncodedURIComponent(code.slice("MIA1:".length));
  expect(json).not.toBeNull();
  return JSON.parse(json ?? "null") as PortableSaveForRoundTrip;
}

function decodeLocalPayload(payload: string): PortableSaveForRoundTrip {
  const json = decompressFromUTF16(payload);
  expect(json).not.toBeNull();
  return JSON.parse(json ?? "null") as PortableSaveForRoundTrip;
}

async function startPioneer(
  page: Page,
  name: string,
  seed: number,
  origin?: string,
): Promise<void> {
  await page.goto(`${origin ?? ""}/?testSeed=${seed}&testLocale=en`);
  await page.getByLabel("Pioneer name").fill(name);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function readCommittedPayloads(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const payloads: string[] = [];
    const prefix = "miaplacidus:v1:head:";
    for (let index = 0; index < localStorage.length; index += 1) {
      const headKey = localStorage.key(index);
      if (!headKey?.startsWith(prefix)) continue;
      const slotId = headKey.slice(prefix.length);
      const commitId = localStorage.getItem(headKey);
      const payload = commitId
        ? localStorage.getItem(`miaplacidus:v1:slot:${slotId}:${commitId}`)
        : null;
      if (payload) payloads.push(payload);
    }
    return payloads;
  });
}

async function stableActiveRun(page: Page) {
  return page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const { clock, ...run } = state.run;
    const { lifetimeActiveMs, acceptedCommands, ...statistics } = state.statistics;
    void clock;
    void lifetimeActiveMs;
    void acceptedCommands;
    return { run, permanent: state.permanent, settings: state.settings, statistics };
  });
}

async function storageHeads(page: Page): Promise<Record<string, string | null>> {
  return page.evaluate(() => {
    const heads: Record<string, string | null> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith("miaplacidus:v1:head:")) heads[key] = localStorage.getItem(key);
    }
    return heads;
  });
}

test("portable export imports the exact game state into a new local profile @save-load-local @portable-round-trip", async ({
  page,
  browser,
}) => {
  await startPioneer(page, "Portable Source", 912);
  const origin = new URL(page.url()).origin;
  const collectHydrogen = page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  await collectHydrogen.click();
  await collectHydrogen.click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity))
    .toBe(2);

  await openSaveManager(page);
  const code = await page
    .getByTestId("save-manager-inline")
    .locator("textarea[readonly]")
    .inputValue();
  const exportedEnvelope = decodePortableCode(code);
  expect(code).toMatch(/^MIA1:/u);
  expect(exportedEnvelope.pioneerName).toBe("Portable Source");
  expect(exportedEnvelope.state.run.goods.hydrogen.quantity).toBe(2);

  const importContext = await browser.newContext();
  try {
    const importPage = await importContext.newPage();
    await startPioneer(importPage, "Import Shell", 913, origin);
    await openSaveManager(importPage);
    const manager = importPage.getByTestId("save-manager-inline");
    await manager.locator("#import-code").fill(code);
    await manager.getByRole("button", { name: "Preview import", exact: true }).click();
    await expect(manager.getByTestId("import-preview")).toBeVisible();
    await manager.locator("#import-new-name").fill(exportedEnvelope.pioneerName);
    await manager.getByRole("button", { name: "Import as a new pioneer", exact: true }).click();
    await expect(
      importPage
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: saveText("en", "importedAsNew") }),
    ).toBeVisible();

    const importedEnvelope = (await readCommittedPayloads(importPage))
      .map((payload) => decodeLocalPayload(payload))
      .find((envelope) => envelope.pioneerName === exportedEnvelope.pioneerName);
    expect(importedEnvelope).toBeDefined();
    expect(importedEnvelope?.state).toEqual(exportedEnvelope.state);
  } finally {
    await importContext.close();
  }
});

test("malformed portable input preserves the active run and its committed save @save-load-local @portable-round-trip", async ({
  page,
}) => {
  await startPioneer(page, "Malformed Survivor", 914);
  const collectHydrogen = page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  await collectHydrogen.click();
  await collectHydrogen.click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity))
    .toBe(2);
  await openSaveManager(page);

  const before = await stableActiveRun(page);
  const headsBefore = await storageHeads(page);
  const malformedCode = "MIA1:truncated-payload";
  const manager = page.getByTestId("save-manager-inline");
  await manager.locator("#import-code").fill(malformedCode);
  await manager.getByRole("button", { name: "Preview import", exact: true }).click();

  await expect(manager.getByTestId("import-preview")).toHaveCount(0);
  await expect(manager.locator("#import-code")).toHaveValue(malformedCode);
  await expect(
    page
      .getByTestId("notification-stack")
      .getByTestId("game-notification")
      .filter({ hasText: saveText("en", "errInvalidSaveString") }),
  ).toBeVisible();
  expect(await stableActiveRun(page)).toEqual(before);
  expect(await storageHeads(page)).toEqual(headsBefore);
});
