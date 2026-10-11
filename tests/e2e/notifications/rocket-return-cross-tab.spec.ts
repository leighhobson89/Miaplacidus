import { expect, test } from "../_harness/fixtures";
import { OFFLINE_GAINS_RATE } from "../../../src/engine/clock";
import type { GameCommand } from "../../../src/engine/commands";
import type { GameState } from "../../../src/engine/state";
import { spaceNotificationText } from "../../../src/i18n/spaceNotificationMessages";

async function startReturningRocketFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=es&economyFixture=space-returning-rocket");
  await page.locator("#pioneer-name").fill("Aviso de retorno");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function dispatch(page: import("@playwright/test").Page, command: GameCommand): Promise<void> {
  const accepted = await page.evaluate(
    (acceptedCommand) => window.miaplacidusTest!.dispatch(acceptedCommand),
    command,
  );
  expect(accepted, `accepted engine command: ${command.type}`).toBe(true);
}

async function readState(page: import("@playwright/test").Page): Promise<GameState> {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

test("announces Rocket return in Spanish while Settings stays selected @notifications @rockets @p20-announcements", async ({
  page,
}) => {
  await startReturningRocketFixture(page);
  const initialState = await readState(page);
  const rocket = initialState.run.space.rockets.rocket1;
  const timer = initialState.run.timers[rocket.timerId!]!;
  const asteroid = initialState.run.space.asteroids.find(
    ({ id }) => id === rocket.targetAsteroidId,
  )!;
  expect(rocket.phase).toBe("returning");
  expect(timer.durationMs - timer.elapsedMs).toBeGreaterThan(0);

  const settingsTab = page.locator("#tab-settings");
  await settingsTab.click();
  await expect(settingsTab).toHaveAttribute("aria-selected", "true");

  const wallNowMs = initialState.run.clock.wallNowMs ?? 0;
  const offlineElapsedMs = Math.ceil((timer.durationMs - timer.elapsedMs) / OFFLINE_GAINS_RATE) + 1_000;
  await dispatch(page, {
    type: "clock.advance",
    input: { wallNowMs: wallNowMs + 1, foreground: true, offlineElapsedMs },
  });

  const returnedState = await readState(page);
  expect(returnedState.run.space.rockets.rocket1.phase).toBe("ready");
  await expect(settingsTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  const expectedNotice = spaceNotificationText("es", "rocketReturned", {
    rocket: rocket.name,
    asteroid: asteroid.name,
  });
  const notice = page
    .locator('[data-testid="game-notification"][data-classification="rocket"]')
    .filter({ hasText: expectedNotice });
  await expect(notice).toHaveText(expectedNotice);
  await expect(notice).toHaveClass(/notification-info/);
  await expect(notice).toHaveRole("status");
  await expect(notice).toHaveAttribute("aria-atomic", "true");
  await expect(page.getByTestId("notification-stack")).toHaveAttribute("aria-live", "polite");
});
