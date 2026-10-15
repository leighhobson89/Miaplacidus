import { createRequire } from "node:module";
import { expect, test, type Page } from "../_harness/fixtures";
import { GALAXY_SEED_DEFAULT } from "../../../src/content/ids";
import { createStarCatalogue } from "../../../src/content/starCatalogue";
import type { GameState } from "../../../src/engine/state";
import {
  canonicalJson,
  makeEnvelope,
  type SaveEnvelopeV1,
} from "../../../src/persistence/schema";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";

type StoredEntry = readonly [string, string];

const { compressToUTF16, decompressFromUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

async function startAsteroidMiningFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261014&testLocale=en&economyFixture=space-asteroid-mining");
  await page.getByLabel("Pioneer name").fill("Star Type Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function browserLocalStorageEntries(page: Page): Promise<StoredEntry[]> {
  return page.evaluate(() => {
    const prefix = "miaplacidus:v1:";
    const entries: StoredEntry[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) entries.push([key, value]);
    }
    return entries;
  });
}

function saveWithCurrentStar(entries: readonly StoredEntry[], currentSystemId: string): StoredEntry[] {
  const values = new Map(entries);
  const slotId = values.get("miaplacidus:v1:lastStartedSlot");
  if (!slotId) throw new Error("The star-type test save was not marked as the latest save.");
  const commitId = values.get(`miaplacidus:v1:head:${slotId}`);
  if (!commitId) throw new Error("The star-type test save has no committed generation.");
  const payloadKey = `miaplacidus:v1:slot:${slotId}:${commitId}`;
  const payload = values.get(payloadKey);
  if (!payload) throw new Error("The star-type test save payload could not be read.");
  const json = decompressFromUTF16(payload);
  if (!json) throw new Error("The star-type test save payload could not be decompressed.");

  const envelope = JSON.parse(json) as SaveEnvelopeV1;
  const state: GameState = {
    ...envelope.state,
    run: {
      ...envelope.state.run,
      space: { ...envelope.state.run.space, currentSystemId },
    },
  };
  const updated = makeEnvelope({
    slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: Math.max(Date.now(), envelope.savedAt),
    revision: envelope.revision + 1,
    state,
  });
  values.set(payloadKey, compressToUTF16(canonicalJson(updated)));
  return [...values.entries()];
}

async function openSavedPioneer(
  page: Page,
  entries: readonly StoredEntry[],
): Promise<Page> {
  const savedPage = await page.context().newPage();
  await savedPage.addInitScript(
    (storedEntries: StoredEntry[]) => {
      const prefix = "miaplacidus:v1:";
      const keys = Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index),
      ).filter((key): key is string => key?.startsWith(prefix) ?? false);
      for (const key of keys) localStorage.removeItem(key);
      for (const [key, value] of storedEntries) localStorage.setItem(key, value);
    },
    [...entries],
  );
  await savedPage.goto("/");
  await resumeSavedPioneer(savedPage, "Star Type Pioneer");
  await expect(savedPage.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => savedPage.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  return savedPage;
}

async function openMiningPane(page: Page): Promise<void> {
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-mining").click();
  await expect(page.getByTestId("antimatter-rate")).toBeVisible();
}

async function visibleMiningRate(page: Page): Promise<number> {
  const visibleValue = await page.getByTestId("antimatter-rate").locator("strong").innerText();
  return Number(visibleValue.replace(/\s*\/s$/, "").replaceAll(",", ""));
}

test("F-type current stars boost visible mining rate and mined asteroid yield @star-types", async ({
  page,
}) => {
  await startAsteroidMiningFixture(page);
  await openMiningPane(page);

  const baselineState = (await page.evaluate(() =>
    window.miaplacidusTest!.getState(),
  )) as GameState;
  const asteroidId = baselineState.run.space.rockets.rocket1.targetAsteroidId;
  expect(baselineState.run.space.rockets.rocket1.phase).toBe("mining");
  expect(asteroidId).toBeTruthy();
  const baselineAsteroid = baselineState.run.space.asteroids.find(({ id }) => id === asteroidId);
  expect(baselineAsteroid).toBeDefined();
  expect(baselineAsteroid!.systemId).toBe(baselineState.run.space.currentSystemId);
  const baselineRate = await visibleMiningRate(page);
  expect(baselineRate).toBeGreaterThan(0);

  const fTypeStar = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    ({ starType }) => starType === "F",
  );
  expect(fTypeStar).toBeDefined();
  expect(fTypeStar!.id).not.toBe(baselineState.run.space.currentSystemId);

  await saveNowFromSettings(page);
  const savedEntries = saveWithCurrentStar(
    await browserLocalStorageEntries(page),
    fTypeStar!.id,
  );
  const fTypePage = await openSavedPioneer(page, savedEntries);
  try {
    await openMiningPane(fTypePage);
    const fTypeState = (await fTypePage.evaluate(() =>
      window.miaplacidusTest!.getState(),
    )) as GameState;
    expect(fTypeState.run.space.currentSystemId).toBe(fTypeStar!.id);
    const fTypeAsteroid = fTypeState.run.space.asteroids.find(({ id }) => id === asteroidId);
    expect(fTypeAsteroid?.systemId).toBe(baselineAsteroid!.systemId);
    expect(fTypeAsteroid).toBeDefined();

    const fTypeRate = await visibleMiningRate(fTypePage);
    expect(Math.abs(fTypeRate - baselineRate * 1.5)).toBeLessThan(0.02);
    const antimatterRate = fTypePage.getByTestId("antimatter-rate");
    await expect(antimatterRate).toContainText("/s");

    await fTypePage.evaluate(() => window.miaplacidusTest!.advanceBy(5_000));
    const minedState = (await fTypePage.evaluate(() =>
      window.miaplacidusTest!.getState(),
    )) as GameState;
    const minedAsteroid = minedState.run.space.asteroids.find(({ id }) => id === asteroidId);
    expect(minedAsteroid).toBeDefined();
    const extracted = fTypeAsteroid!.remainingAntimatter - minedAsteroid!.remainingAntimatter;
    const expectedExtraction = fTypeRate * 5;
    expect(extracted).toBeGreaterThan(expectedExtraction * 0.8);
    expect(extracted).toBeLessThan(expectedExtraction * 1.2);
  } finally {
    await fTypePage.close();
  }
});
