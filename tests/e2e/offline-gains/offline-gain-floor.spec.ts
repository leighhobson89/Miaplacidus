import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager } from "../_harness/save-controls";
import { SCIENCE_BUILDINGS } from "../../../src/content/economy";
import { autobuyerUpgradeId } from "../../../src/content/ids";
import { createInitialGameState, isValidGameState } from "../../../src/engine/state";
import { canonicalJson, makeEnvelope } from "../../../src/persistence/schema";
import { saveText } from "../../../src/i18n/saveMessages";
import { starTypeForSystem } from "../../../src/content/starCatalogue";
import { bTypeAutoBuyerBonusPerSecond } from "../../../src/content/starTypeRules";

const { compressToEncodedURIComponent } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

const SAVED_AT_MS = Date.UTC(2026, 9, 14, 12, 0, 0);
const AWAY_WALL_MS = 1_000;
const OWNER_APPROVED_OFFLINE_RATE = 0.334;
const SCIENCE_KIT_COUNT = 6;
const HYDROGEN_TIER_1 = autobuyerUpgradeId("hydrogen", 1);
const PIONEER_NAME = "Offline Floor Pioneer";

function makeOfflineResearchSaveCode(): string {
  const initial = createInitialGameState({
    pioneerName: PIONEER_NAME,
    seed: 20261014,
    locale: "en",
  });
  const state = {
    ...initial,
    run: {
      ...initial.run,
      clock: { ...initial.run.clock, wallNowMs: SAVED_AT_MS },
      upgrades: {
        ...initial.run.upgrades,
        [HYDROGEN_TIER_1]: 1,
        scienceKit: SCIENCE_KIT_COUNT,
      },
      economy: {
        ...initial.run.economy,
        autobuyerEnabled: {
          ...initial.run.economy.autobuyerEnabled,
          [HYDROGEN_TIER_1]: true,
        },
        buildingEnabled: { ...initial.run.economy.buildingEnabled, scienceKit: true },
      },
    },
  };
  expect(isValidGameState(state)).toBe(true);

  const envelope = makeEnvelope({
    slotId: "10000000-0000-4000-8000-000000000001",
    pioneerName: PIONEER_NAME,
    createdAt: SAVED_AT_MS,
    savedAt: SAVED_AT_MS,
    revision: 1,
    state,
  });
  return `MIA1:${compressToEncodedURIComponent(canonicalJson(envelope))}`;
}

test("offline resource and Research gains are floored after the approved 33.4% rate @offline-gains @save-load-local", async ({
  page,
}) => {
  await page.clock.install({ time: new Date(SAVED_AT_MS) });
  await page.goto("/?testSeed=20261014&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Offline Import Shell");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();

  await page.clock.setFixedTime(new Date(SAVED_AT_MS));
  await openSaveManager(page);
  const manager = page.getByTestId("save-manager-inline");
  await manager.locator("#import-code").fill(makeOfflineResearchSaveCode());
  await manager.getByRole("button", { name: "Preview import", exact: true }).click();
  await expect(manager.getByTestId("import-preview")).toBeVisible();
  await manager.getByRole("button", { name: "Import as a new pioneer", exact: true }).click();
  await expect(
    page
      .getByTestId("notification-stack")
      .getByTestId("game-notification")
      .filter({ hasText: saveText("en", "importedAsNew") }),
  ).toBeVisible();

  await page.goto("about:blank");
  await page.clock.setFixedTime(new Date(SAVED_AT_MS + AWAY_WALL_MS));
  await page.goto("/?testSeed=20261014&testLocale=en");
  await page.locator("#pioneer-name").fill(PIONEER_NAME);
  await page.getByRole("option").filter({ hasText: PIONEER_NAME }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.locator("#tab-research").click();

  const beforeHydrogen = 0;
  const currentSystemType = starTypeForSystem(
    createInitialGameState({ seed: 20261014 }).run.space.currentSystemId,
  );
  const hydrogenProductionRate =
    2 + (currentSystemType === "B" ? bTypeAutoBuyerBonusPerSecond(1) : 0);
  const sourceFlooredHydrogenGain = Math.floor(
    hydrogenProductionRate * (AWAY_WALL_MS / 1_000) * OWNER_APPROVED_OFFLINE_RATE,
  );
  expect(hydrogenProductionRate * (AWAY_WALL_MS / 1_000) * OWNER_APPROVED_OFFLINE_RATE).toBeCloseTo(
    1.336,
  );
  const finalHydrogen = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );
  expect(finalHydrogen).toBe(beforeHydrogen + sourceFlooredHydrogenGain);

  const beforeResearchPoints = 50;
  const researchRate = SCIENCE_BUILDINGS.scienceKit.ratePerSecond * SCIENCE_KIT_COUNT;
  const sourceFlooredGain = Math.floor(
    researchRate * (AWAY_WALL_MS / 1_000) * OWNER_APPROVED_OFFLINE_RATE,
  );
  expect(researchRate * (AWAY_WALL_MS / 1_000) * OWNER_APPROVED_OFFLINE_RATE).toBeCloseTo(1.002);
  const finalResearchPoints = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.researchPoints,
  );
  expect(finalResearchPoints).toBe(beforeResearchPoints + sourceFlooredGain);
  await expect(page.getByTestId("research-points")).toHaveText(
    String(beforeResearchPoints + sourceFlooredGain),
  );
});
