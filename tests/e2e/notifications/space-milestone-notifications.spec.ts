import { expect, test } from "../_harness/fixtures";
import {
  ASTEROID_SCAN_TIMER_ID,
  ROCKET_FUEL_CAPACITY,
  ROCKET_FUEL_PUMP_RATE_PER_SECOND,
} from "../../../src/content/space";
import { starTypeForSystem } from "../../../src/content/starCatalogue";
import { antimatterStarTypeMultiplier } from "../../../src/content/starTypeRules";
import { OFFLINE_GAINS_RATE } from "../../../src/engine/clock";
import type { GameCommand } from "../../../src/engine/commands";
import { asteroidExtractionRatePerSecond } from "../../../src/engine/spaceRules";
import type { GameState } from "../../../src/engine/state";
import type {} from "../../../src/app/testing/DebugTools";

async function startFixture(
  page: import("@playwright/test").Page,
  fixture: "space-starship-ready" | "space-battle-victory" | "space-telescope",
  pioneerName: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneerName);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function dispatch(page: import("@playwright/test").Page, command: GameCommand) {
  const accepted = await page.evaluate(
    (acceptedCommand) => window.miaplacidusTest!.dispatch(acceptedCommand),
    command,
  );
  expect(accepted, `accepted engine command: ${command.type}`).toBe(true);
}

async function readState(page: import("@playwright/test").Page): Promise<GameState> {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

/** Advance deterministic offline simulation through the same accepted clock command boundary. */
async function advanceOffline(
  page: import("@playwright/test").Page,
  offlineElapsedMs: number,
): Promise<void> {
  const wallNowMs = (await readState(page)).run.clock.wallNowMs ?? 0;
  await dispatch(page, {
    type: "clock.advance",
    input: { wallNowMs: wallNowMs + 1, foreground: true, offlineElapsedMs },
  });
}

async function advanceForeground(
  page: import("@playwright/test").Page,
  elapsedMs: number,
): Promise<void> {
  const wallNowMs = (await readState(page)).run.clock.wallNowMs ?? 0;
  await dispatch(page, {
    type: "clock.advance",
    input: { wallNowMs: wallNowMs + elapsedMs, foreground: true },
  });
}

async function advanceForSimulation(
  page: import("@playwright/test").Page,
  simulatedMs: number,
): Promise<void> {
  await advanceOffline(page, Math.ceil(simulatedMs / OFFLINE_GAINS_RATE) + 1_000);
}

test("notifies on starship launch and arrival but stays quiet on travel shortening @notifications @starship", async ({
  page,
}) => {
  await startFixture(page, "space-starship-ready", "Starship Notice Pioneer");
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
  const notice = page.locator('[data-testid="game-notification"][data-classification="starShip"]');
  await starship.getByRole("button", { name: "Launch starship" }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();

  await expect(notice).toContainText("Starship launched toward Sirius");
  await expect(notice).toHaveCount(0);

  // A shortened travel milestone is accepted by the engine but intentionally has no toast.
  await dispatch(page, { type: "space.starship.travel.warp" });
  await expect(notice).toHaveCount(0);
  const travelling = await readState(page);
  const timer = travelling.run.timers[travelling.run.space.starship.timerId!]!;
  await advanceForSimulation(page, timer.durationMs - timer.elapsedMs + 1);
  await expect(notice).toContainText("Starship arrived at Sirius");
});

test("routes accepted rocket launch, outbound, arrival, and return milestones @notifications @rockets", async ({
  page,
}) => {
  await startFixture(page, "space-telescope", "Rocket Notice Pioneer");

  await dispatch(page, { type: "space.launch-pad.build" });
  for (let part = 0; part < 12; part += 1)
    await dispatch(page, { type: "space.rocket.part.build", rocketId: "rocket1" });
  await dispatch(page, { type: "space.rocket.pump.purchase", rocketId: "rocket1" });
  await dispatch(page, { type: "space.telescope.build" });

  // Seeded scans can miss; repeat the actual survey command until its generated asteroid exists.
  for (
    let attempt = 0;
    attempt < 10 && (await readState(page)).run.space.asteroids.length === 0;
    attempt += 1
  ) {
    await dispatch(page, { type: "space.telescope.scan.start" });
    const scanTimer = (await readState(page)).run.timers[ASTEROID_SCAN_TIMER_ID]!;
    await advanceForSimulation(page, scanTimer.durationMs + 1);
  }
  const discovered = await readState(page);
  expect(discovered.run.space.asteroids.length).toBeGreaterThan(0);
  const asteroid = discovered.run.space.asteroids[0]!;

  const fuelNeeded =
    ((ROCKET_FUEL_CAPACITY.rocket1 - discovered.run.space.rockets.rocket1.fuelQuantity) /
      ROCKET_FUEL_PUMP_RATE_PER_SECOND) *
    1_000;
  await advanceForSimulation(page, fuelNeeded + 1);
  await dispatch(page, { type: "space.weather.set-condition", condition: "clear" });
  await dispatch(page, { type: "space.rocket.launch", rocketId: "rocket1" });

  const notice = page.locator('[data-testid="game-notification"][data-classification="rocket"]');
  await expect(notice).toContainText("Rocket 1 launched.");
  await dispatch(page, { type: "space.asteroid.select", asteroidId: asteroid.id });
  await dispatch(page, {
    type: "space.rocket.travel",
    rocketId: "rocket1",
    asteroidId: asteroid.id,
  });
  await expect(notice).toContainText(`Rocket 1 is travelling to ${asteroid.name}`);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  const journeyCountdown = page.getByTestId("rocket-journey-countdown-rocket1");
  await expect(journeyCountdown).toBeVisible();
  const outboundRemainingMs = Number(await journeyCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await journeyCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(outboundRemainingMs);

  const travelState = await readState(page);
  const outbound = travelState.run.timers[travelState.run.space.rockets.rocket1.timerId!]!;
  await advanceForSimulation(page, outbound.durationMs + 1);
  await expect(notice).toContainText(`Rocket 1 arrived at ${asteroid.name}`);

  const miningState = await readState(page);
  const minedAsteroid = miningState.run.space.asteroids.find((entry) => entry.id === asteroid.id)!;
  const miningRate =
    asteroidExtractionRatePerSecond(minedAsteroid.extractionEase) *
    antimatterStarTypeMultiplier(starTypeForSystem(minedAsteroid.systemId));
  await advanceForSimulation(page, (minedAsteroid.remainingAntimatter / miningRate) * 1_000 + 1);
  await expect(notice).toContainText(`Rocket 1 is returning from ${asteroid.name}`);

  const returningState = await readState(page);
  const returningTimer =
    returningState.run.timers[returningState.run.space.rockets.rocket1.timerId!]!;
  const returnCountdown = page.getByTestId("rocket-journey-countdown-rocket1");
  await expect(returnCountdown).toBeVisible();
  const returnRemainingMs = Number(await returnCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await returnCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(returnRemainingMs);
  await advanceForSimulation(page, returningTimer.durationMs - returningTimer.elapsedMs + 1);
  await expect(notice).toContainText(`Rocket 1 returned from ${asteroid.name}`);
  expect((await readState(page)).run.space.rockets.rocket1.phase).toBe("ready");
});

test("shows one battle completion notice and keeps individual battle rounds silent @notifications @battle", async ({
  page,
}) => {
  await startFixture(page, "space-battle-victory", "Battle Notice Pioneer");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Colonise" }).click();
  const pane = page.getByTestId("starship-pane");
  await pane.getByRole("button", { name: "Enter war mode" }).click();
  await pane.getByTestId("starship-battle-engage-button").click();

  const notice = page.locator('[data-testid="game-notification"][data-classification="battle"]');
  let phase = (await readState(page)).run.space.systemEncounters[0]!.battle.phase;
  expect(phase).toBe("inProgress");
  await expect(notice).toHaveCount(0);

  // Each short accepted clock step resolves only a battle round or its terminal outcome.
  for (let round = 0; round < 500 && phase === "inProgress"; round += 1) {
    // Battle timers are foreground-only, so each accepted 250ms wall step resolves one round.
    await advanceForeground(page, 250);
    phase = (await readState(page)).run.space.systemEncounters[0]!.battle.phase;
    if (phase === "inProgress") await expect(notice).toHaveCount(0);
  }
  expect(phase).toBe("victory");
  await expect(notice).toContainText("Victory in Sirius: the enemy fleet was defeated.");
});
