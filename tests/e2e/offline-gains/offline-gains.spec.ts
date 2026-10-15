import { expect, test, type Page } from "../_harness/fixtures";
import { saveNowFromSettings } from "../_harness/save-controls";
import { formatDuration } from "../../../src/app/timeFormatting";

const AWAY_WALL_MS = 60_000;
const OWNER_APPROVED_OFFLINE_RATE = 0.334;
const FOREGROUND_TOLERANCE_MS = 250;

async function startFreshPioneer(page: Page, name: string): Promise<void> {
  await page.getByLabel("Pioneer name").fill(name);
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hydrogen", exact: true, level: 2 })).toBeVisible();
}

async function resumePioneer(page: Page, name: string): Promise<void> {
  await page.getByLabel("Pioneer name").fill(name);
  await page.getByRole("option").filter({ hasText: name }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hydrogen", exact: true, level: 2 })).toBeVisible();
}

test("a saved pioneer receives 33.4% of elapsed offline time once on resume @offline-gains @save-load-local", async ({
  page,
}) => {
  const pioneerName = "Offline Gains Pioneer";
  await page.clock.install({ time: new Date("2026-10-14T12:00:00.000Z") });

  await page.goto("/?testSeed=20261014&testLocale=en");
  await startFreshPioneer(page, pioneerName);
  const timerAdded = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "timer.add",
      timerId: "research:offline-gains-probe",
      domain: "research",
      durationMs: 60_000,
    }),
  );
  expect(timerAdded).toBe(true);

  await saveNowFromSettings(page);
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-saves").click();
  await expect(page.getByTestId("save-status")).toContainText("Saved on this device");
  const beforeAway = await page.evaluate(() => window.miaplacidusTest!.getState());
  const beforeSimulationMs = beforeAway.run.clock.simulationMs;
  const beforeTimerMs = beforeAway.run.timers["research:offline-gains-probe"]?.elapsedMs ?? 0;
  const beforeActiveMs = beforeAway.statistics.lifetimeActiveMs;

  await page.goto("about:blank");
  await page.clock.fastForward(AWAY_WALL_MS);
  await page.goto("/?testSeed=20261014&testLocale=en");
  await resumePioneer(page, pioneerName);
  await page.clock.runFor(100);

  const offlineNotice = page
    .getByTestId("notification-stack")
    .locator('[data-testid="game-notification"][data-classification="loadSave"]')
    .filter({ hasText: "Offline Gains Added!" });
  await expect(offlineNotice).toHaveCount(1);
  await expect(offlineNotice).toHaveAttribute("data-visible-duration-ms", "3000");

  const afterResume = await page.evaluate(() => window.miaplacidusTest!.getState());
  const expectedSimulationGainMs = AWAY_WALL_MS * OWNER_APPROVED_OFFLINE_RATE;
  const simulationGainMs = afterResume.run.clock.simulationMs - beforeSimulationMs;
  const timerGainMs =
    (afterResume.run.timers["research:offline-gains-probe"]?.elapsedMs ?? 0) - beforeTimerMs;
  expect(simulationGainMs).toBeGreaterThanOrEqual(expectedSimulationGainMs);
  expect(simulationGainMs).toBeLessThan(expectedSimulationGainMs + FOREGROUND_TOLERANCE_MS);
  expect(timerGainMs).toBeGreaterThanOrEqual(expectedSimulationGainMs);
  expect(timerGainMs).toBeLessThan(expectedSimulationGainMs + FOREGROUND_TOLERANCE_MS);
  expect(afterResume.statistics.lifetimeActiveMs).toBe(beforeActiveMs);
  await expect(page.getByTestId("top-stat-time").locator(".top-stat-value")).toHaveText(
    formatDuration("en", afterResume.run.clock.simulationMs, afterResume.settings.notation),
  );

  await saveNowFromSettings(page);
  const beforeSecondResume = await page.evaluate(() => window.miaplacidusTest!.getState());
  await page.reload();
  await resumePioneer(page, pioneerName);
  await page.clock.runFor(100);
  const afterSecondResume = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterSecondResume.run.clock.simulationMs - beforeSecondResume.run.clock.simulationMs).toBeLessThan(
    FOREGROUND_TOLERANCE_MS,
  );
  expect(
    (afterSecondResume.run.timers["research:offline-gains-probe"]?.elapsedMs ?? 0) -
      (beforeSecondResume.run.timers["research:offline-gains-probe"]?.elapsedMs ?? 0),
  ).toBeLessThan(FOREGROUND_TOLERANCE_MS);
});
