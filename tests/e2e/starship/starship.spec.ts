import type { BrowserContext, Page } from "@playwright/test";
import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import type { GameState } from "../../../src/engine/state";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { canonicalJson, makeEnvelope, type SaveEnvelopeV1 } from "../../../src/persistence/schema";
import { saveNowFromSettings, resumeSavedPioneer } from "../_harness/save-controls";

type StoredEntry = readonly [string, string];

const { compressToUTF16, decompressFromUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

function saveWithAntimatter(entries: readonly StoredEntry[], quantity: number): StoredEntry[] {
  const values = new Map(entries);
  const slotId = values.get("miaplacidus:v1:lastStartedSlot") ?? null;
  if (!slotId) throw new Error("The Starship test save was not marked as the latest save.");
  const commitId = values.get(`miaplacidus:v1:head:${slotId}`);
  if (!commitId) throw new Error("The Starship test save has no committed generation.");
  const payloadKey = `miaplacidus:v1:slot:${slotId}:${commitId}`;
  const payload = values.get(payloadKey);
  if (!payload) throw new Error("The Starship test save payload could not be read.");
  const json = decompressFromUTF16(payload);
  if (!json) throw new Error("The Starship test save payload could not be decompressed.");
  const envelope = JSON.parse(json) as SaveEnvelopeV1;
  const state: GameState = {
    ...envelope.state,
    run: {
      ...envelope.state.run,
      space: { ...envelope.state.run.space, antimatter: quantity },
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
  context: BrowserContext,
  entries: readonly StoredEntry[],
): Promise<Page> {
  const page = await context.newPage();
  await page.addInitScript(
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
  await page.goto("/");
  await resumeSavedPioneer(page, "Starship Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  return page;
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

async function startStarshipFixture(
  page: import("@playwright/test").Page,
  fixture:
    | "space-starship"
    | "space-starship-ready"
    | "space-starship-scanning"
    | "space-diplomacy" = "space-starship",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Starship Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("builds required modules at discounted costs while the scanner stays optional @starship", async ({
  page,
}) => {
  await startStarshipFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship construction" }).click();

  const pane = page.getByTestId("starship-pane");
  await expect(pane.locator("[data-testid^='starship-module-']")).toHaveCount(5);
  await expect(pane.getByTestId("starship-readiness")).toHaveAttribute("data-status", "building");

  const structural = pane.getByTestId("starship-module-structural");
  await expect(structural).toContainText("3,610 Steel");
  await expect(structural).toContainText("1,353.75 Titanium");
  await expect(structural).toContainText("4,061.25 Silicon");
  await expect(structural).toContainText("$2,707.50");

  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await structural.getByRole("button", { name: "Build one part" }).click();
  const afterFirstPart = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterFirstPart.run.cash).toBeCloseTo(before.run.cash - 2_707.5, 6);
  expect(afterFirstPart.run.goods.steel.quantity).toBeCloseTo(
    before.run.goods.steel.quantity - 3_610,
    6,
  );
  expect(afterFirstPart.run.goods.titanium.quantity).toBeCloseTo(
    before.run.goods.titanium.quantity - 1_353.75,
    6,
  );
  expect(afterFirstPart.run.goods.silicon.quantity).toBeCloseTo(
    before.run.goods.silicon.quantity - 4_061.25,
    6,
  );

  const requiredModules = [
    ["structural", 20],
    ["lifeSupport", 10],
    ["antimatterEngine", 16],
    ["fleetHangar", 1],
  ] as const;
  for (const [moduleId, partCount] of requiredModules) {
    const card = pane.getByTestId(`starship-module-${moduleId}`);
    const builtParts =
      moduleId === "structural"
        ? afterFirstPart.run.space.starshipModules.structural.builtParts
        : 0;
    for (let index = builtParts; index < partCount; index += 1) {
      await card.getByRole("button", { name: "Build one part" }).click();
    }
  }

  await expect(pane.getByTestId("starship-readiness")).toHaveAttribute("data-status", "ready");
  for (const [moduleId, partCount] of requiredModules) {
    await expect(pane.getByTestId(`starship-module-${moduleId}`)).toContainText(
      `Parts built: ${partCount} / ${partCount}`,
    );
  }
  const scanner = pane.getByTestId("starship-module-stellarScanner");
  await expect(scanner).toContainText("Parts built: 0 / 8");
  await expect(scanner.getByRole("button", { name: "Build one part" })).toBeEnabled();
});

test("cancels the point-of-no-return prompt and arrives through the saved voyage timer @starship", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  const starship = page.getByTestId("starship-pane");
  await page.getByRole("tab", { name: "Starship construction" }).click();
  const launchButton = starship.getByRole("button", { name: "Launch starship" });
  await expect(launchButton).toBeEnabled();
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await launchButton.click();

  const warning = page.getByRole("dialog", { name: "Warning: point of no return" });
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("cannot be recovered in this run");
  await warning.getByRole("button", { name: "Cancel" }).click();
  await expect(warning).toBeHidden();
  const afterCancel = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterCancel.run.space.starship.phase).toBe("unlaunched");
  expect(afterCancel.run.space.antimatter).toBe(before.run.space.antimatter);

  await launchButton.click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");
  await expect(
    page.locator('[data-testid="game-notification"][data-classification="starShip"]'),
  ).toContainText("Starship launched toward Sirius");

  const travelling = await page.evaluate(() => window.miaplacidusTest!.getState());
  const voyageTimerId = travelling.run.space.starship.timerId!;
  expect(travelling.run.space.starship.destinationSystemId).not.toBeNull();
  expect(travelling.run.space.antimatter).toBe(
    before.run.space.antimatter - travelling.run.space.starship.antimatterSpent,
  );
  const voyageDuration = travelling.run.timers[voyageTimerId]!.durationMs;
  for (let elapsed = 0; elapsed < voyageDuration + 1; elapsed += 1_000_000) {
    await page.evaluate(
      (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds),
      Math.min(1_000_000, voyageDuration + 1 - elapsed),
    );
  }

  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("orbiting");
  const arrived = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(arrived.run.space.currentSystemId).toBe("spica");
  expect(arrived.run.space.starship.destinationSystemId).toBe(
    travelling.run.space.starship.destinationSystemId,
  );
  expect(arrived.run.timers[voyageTimerId]?.status).toBe("complete");
});

test("blocks the irreversible Starship launch one antimatter short @starship-fuel-shortfall", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();
  await page.getByRole("tab", { name: "Starship construction" }).click();
  await saveNowFromSettings(page);

  const savedState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destinationId = savedState.run.space.starship.destinationSystemId;
  expect(destinationId).not.toBeNull();
  const plan = starshipTravelPlan(savedState, destinationId!);
  expect(plan).not.toBeNull();
  const requiredFuel = plan!.antimatter;
  expect(requiredFuel).toBeGreaterThan(0);
  const formattedFuel = formatNumber(
    savedState.settings.locale,
    requiredFuel,
    2,
    savedState.settings.notation,
  );
  const savedEntries = await browserLocalStorageEntries(page);
  const context = page.context();
  await page.close();

  const shortfallEntries = saveWithAntimatter(savedEntries, requiredFuel - 1);
  const shortfallPage = await openSavedPioneer(context, shortfallEntries);
  try {
    await shortfallPage.getByRole("tab", { name: "Interstellar" }).click();
    await shortfallPage.getByRole("tab", { name: "Starship construction" }).click();
    const starship = shortfallPage.getByTestId("starship-pane");
    const travelSummary = starship.locator(".starship-travel-summary");
    await expect(travelSummary.locator(".space-cost-list")).toContainText(
      `${starshipText("en", "fuelCost")}: ${formattedFuel}`,
    );
    const launchButton = travelSummary.getByRole("button", { name: "Launch starship" });
    await expect(launchButton).toBeDisabled();
    await expect(launchButton).toHaveAttribute("aria-describedby", "starship-launch-reason");
    await expect(travelSummary.locator("#starship-launch-reason")).toHaveText(
      spaceText(savedState.settings.locale, "reasonInsufficientAntimatter", {
        amount: formattedFuel,
      }),
    );
    const shortfallState = await shortfallPage.evaluate(() => window.miaplacidusTest!.getState());
    expect(shortfallState.run.space.antimatter).toBe(requiredFuel - 1);
  } finally {
    await shortfallPage.close();
  }

  const exactStockEntries = saveWithAntimatter(savedEntries, requiredFuel);
  const exactStockPage = await openSavedPioneer(context, exactStockEntries);
  try {
    await exactStockPage.getByRole("tab", { name: "Interstellar" }).click();
    await exactStockPage.getByRole("tab", { name: "Starship construction" }).click();
    const starship = exactStockPage.getByTestId("starship-pane");
    const travelSummary = starship.locator(".starship-travel-summary");
    await expect(travelSummary.locator(".space-cost-list")).toContainText(
      `${starshipText("en", "fuelCost")}: ${formattedFuel}`,
    );
    const launchButton = travelSummary.getByRole("button", { name: "Launch starship" });
    await expect(launchButton).toBeEnabled();
    await expect(launchButton).not.toHaveAttribute("aria-describedby", "starship-launch-reason");
    const beforeCancel = await exactStockPage.evaluate(() => window.miaplacidusTest!.getState());
    expect(beforeCancel.run.space.antimatter).toBe(requiredFuel);

    await launchButton.click();
    const warning = exactStockPage.getByRole("dialog", { name: "Warning: point of no return" });
    await expect(warning).toBeVisible();
    await warning.getByRole("button", { name: starshipText("en", "cancelLaunch") }).click();
    await expect(warning).toBeHidden();
    await expect(launchButton).toBeEnabled();
    const afterCancel = await exactStockPage.evaluate(() => window.miaplacidusTest!.getState());
    expect(afterCancel.run.space.starship.phase).toBe("unlaunched");
    expect(afterCancel.run.space.antimatter).toBe(requiredFuel);
  } finally {
    await exactStockPage.close();
  }
});

test("shows the starship's live journey countdown on its page @starship-live-countdown", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  await page.getByRole("tab", { name: "Starship construction" }).click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: "Launch starship" }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");

  const journeyCountdown = starship.getByTestId("starship-journey-countdown");
  await expect(journeyCountdown).toBeVisible();
  const initialRemainingMs = Number(await journeyCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await journeyCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialRemainingMs);
});

test("scans an orbiting destination once and persists stable hostility data @starship", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-scanning");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Colonise" }).click();

  const pane = page.getByTestId("starship-pane");
  const scanButton = pane.getByTestId("starship-scan-system-button");
  await expect(scanButton).toBeEnabled();
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await scanButton.click();
  await expect(pane.getByTestId("starship-system-scan-results")).toBeVisible();

  const scanned = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scanned.run.space.systemEncounters).toHaveLength(1);
  expect(scanned.run.space.systemEncounters[0]?.systemId).toBe(
    before.run.space.starship.destinationSystemId,
  );
  expect(scanned.run.space.systemEncounters[0]?.raceName.length).toBeGreaterThan(0);
  expect(scanned.run.space.systemEncounters[0]?.currentImpression).toBe(
    scanned.run.space.systemEncounters[0]?.initialImpression,
  );
  expect(scanned.run.space.systemEncounters[0]?.latestDifferenceInImpression).toBe(0);
  expect(scanned.run.random).toEqual(before.run.random);
  expect(scanned.run.space.systemEncounters[0]?.anomalies.length).toBeLessThanOrEqual(2);

  const repeated = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "space.starship.system.scan" }),
  );
  expect(repeated).toBe(false);
  const afterRepeatedScan = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterRepeatedScan.run.space.systemEncounters).toHaveLength(1);
});

test("builds an Envoy and records message and harmony effects @starship", async ({ page }) => {
  await startStarshipFixture(page, "space-diplomacy");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();

  const pane = page.getByTestId("starship-pane");
  const hangar = pane.getByTestId("starship-fleet-hangar");
  const diplomacy = pane.getByTestId("starship-diplomacy");
  const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
  await page.getByRole("tab", { name: "Colonise" }).click();
  const messageButton = diplomacy.getByRole("button", { name: "Send a message" });
  await expect(messageButton).toBeDisabled();
  await expect(messageButton).toHaveAttribute(
    "aria-describedby",
    "starship-diplomacy-message-reason",
  );
  await expect(diplomacy.locator("#starship-diplomacy-message-reason")).toContainText(
    "Scan a sentient civilization and build an Envoy",
  );
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  await hangar.getByRole("button", { name: "Build Envoy" }).click();

  const built = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(built.run.space.fleetEnvoyBuilt).toBe(true);
  expect(built.run.cash).toBe(initial.run.cash - 2_000);
  expect(built.run.goods.hydrogen.quantity).toBe(initial.run.goods.hydrogen.quantity - 8_000);
  expect(built.run.goods.silicon.quantity).toBe(initial.run.goods.silicon.quantity - 300);
  expect(built.run.goods.titanium.quantity).toBe(initial.run.goods.titanium.quantity - 120);

  await pane
    .getByTestId("starship-fleet-scout")
    .getByRole("button", { name: "Build one ship" })
    .click();
  const scoutBuilt = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scoutBuilt.run.space.playerFleets.scout).toBe(1);
  expect(scoutBuilt.run.cash).toBe(built.run.cash - 5_000);
  expect(scoutBuilt.run.goods.hydrogen.quantity).toBe(built.run.goods.hydrogen.quantity - 14_000);
  expect(scoutBuilt.run.goods.silicon.quantity).toBe(built.run.goods.silicon.quantity - 1_000);
  expect(scoutBuilt.run.goods.titanium.quantity).toBe(built.run.goods.titanium.quantity - 300);

  await page.getByRole("tab", { name: "Colonise" }).click();
  await diplomacy.getByRole("button", { name: "Send a message" }).click();
  await expect(pane.getByTestId("starship-diplomacy-message")).toBeVisible();
  const messaged = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(messaged.run.space.systemEncounters[0]?.lastDiplomacyMessage).toMatch(/^message/);
  expect(messaged.run.space.systemEncounters[0]?.patience).toBe(4);

  await diplomacy.getByRole("button", { name: "Seek harmony" }).click();
  const harmonized = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(harmonized.run.space.systemEncounters[0]?.lastDiplomacyMessage).toMatch(/^harmony/);
  expect(harmonized.run.space.systemEncounters[0]?.patience).toBeLessThanOrEqual(2);
});

test("shows the Envoy shortfall one unit below cost and enables it at exact stock @starship-affordability", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-diplomacy");

  // Shape the deterministic fixture with valid sale commands; the Envoy
  // action itself is checked and completed through its visible UI control.
  await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const targets = { hydrogen: 7_999, silicon: 300, titanium: 120 } as const;
    for (const [goodId, target] of Object.entries(targets)) {
      const quantity = state.run.goods[goodId as keyof typeof targets].quantity;
      if (
        !window.miaplacidusTest!.dispatch({
          type: "resource.sell",
          goodId: goodId as keyof typeof targets,
          amount: quantity - target,
        })
      ) {
        throw new Error(`Could not prepare ${goodId} stock for the Envoy affordability check.`);
      }
    }
  });

  const underfunded = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(underfunded.run.goods.hydrogen.quantity).toBe(7_999);
  expect(underfunded.run.goods.silicon.quantity).toBe(300);
  expect(underfunded.run.goods.titanium.quantity).toBe(120);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  const hangar = page.getByTestId("starship-fleet-hangar");
  const envoyButton = hangar.getByRole("button", { name: "Build Envoy" });
  await expect(envoyButton).toBeDisabled();
  await expect(envoyButton).toHaveAttribute("aria-describedby", "starship-envoy-reason");
  await expect(hangar.locator("#starship-envoy-reason")).toHaveText(
    "Not enough Hydrogen. Required: 8,000.",
  );

  await page.getByRole("tab", { name: "Resources" }).click();
  await page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true }).click();
  const exactlyAffordable = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(exactlyAffordable.run.goods.hydrogen.quantity).toBe(8_000);
  expect(exactlyAffordable.run.goods.silicon.quantity).toBe(300);
  expect(exactlyAffordable.run.goods.titanium.quantity).toBe(120);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  await expect(envoyButton).toBeEnabled();
  await envoyButton.click();

  const built = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(built.run.space.fleetEnvoyBuilt).toBe(true);
  expect(built.run.goods.hydrogen.quantity).toBe(0);
  expect(built.run.goods.silicon.quantity).toBe(0);
  expect(built.run.goods.titanium.quantity).toBe(0);
  expect(built.run.cash).toBe(exactlyAffordable.run.cash - 2_000);
});

test("Fleet Hangar build controls support keyboard focus and activation @fleet-controls", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-diplomacy");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();

  const hangar = page.getByTestId("starship-fleet-hangar");
  const envoyButton = hangar.getByRole("button", { name: "Build Envoy" });
  const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());

  await envoyButton.focus();
  await page.keyboard.press("Tab");
  await expect(scoutButton).toBeFocused();
  expect(await scoutButton.evaluate((button) => button.matches(":focus-visible"))).toBe(true);
  const touchTarget = await scoutButton.boundingBox();
  expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
  expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

  await page.keyboard.press("Enter");
  await expect(scoutButton).toBeFocused();
  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
});

test.describe("Fleet Hangar touch controls", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test("touch users can build a fleet ship at a narrow viewport @fleet-controls", async ({
    page,
  }) => {
    await startStarshipFixture(page, "space-diplomacy");
    await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
    await page.getByRole("tab", { name: "Interstellar" }).tap();
    await page.getByRole("tab", { name: "Fleet Hangar" }).tap();

    const hangar = page.getByTestId("starship-fleet-hangar");
    const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    const touchTarget = await scoutButton.boundingBox();
    expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
    expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

    await scoutButton.tap();
    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
    const pageWidth = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport);
  });
});
