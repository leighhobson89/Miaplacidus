import { expect, test, type Page } from "../_harness/fixtures";
import { OFFLINE_GAINS_RATE } from "../../../src/engine/clock";
import type { GameCommand } from "../../../src/engine/commands";
import type { GameState } from "../../../src/engine/state";
import { spaceNotificationText } from "../../../src/i18n/spaceNotificationMessages";

type FixtureId =
  | "research"
  | "full"
  | "space-telescope"
  | "space-starship-ready"
  | "space-returning-rocket"
  | "space-battle-victory"
  | "space-battle-defeat";

async function startFixture(page: Page, fixture: FixtureId, pioneerName: string): Promise<void> {
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
  await clearNotificationQueue(page);
}

async function startFreshGame(page: Page, pioneerName: string): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en");
  await page.getByLabel("Pioneer name").fill(pioneerName);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await clearNotificationQueue(page);
}

async function clearNotificationQueue(page: Page): Promise<void> {
  const notifications = page
    .getByTestId("notification-stack")
    .locator('[data-testid="game-notification"]');
  for (const enabled of [false, true]) {
    const accepted = await page.evaluate((notificationsEnabled) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { notificationsEnabled },
      }),
      enabled,
    );
    expect(accepted).toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled),
      )
      .toBe(enabled);
    if (!enabled) await expect(notifications).toHaveCount(0);
  }
}

async function dispatch(page: Page, command: GameCommand): Promise<void> {
  const accepted = await page.evaluate(
    (acceptedCommand) => window.miaplacidusTest!.dispatch(acceptedCommand),
    command,
  );
  expect(accepted, `accepted engine command: ${command.type}`).toBe(true);
}

async function readState(page: Page): Promise<GameState> {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

async function advanceForeground(page: Page, elapsedMs: number): Promise<void> {
  const wallNowMs = (await readState(page)).run.clock.wallNowMs ?? 0;
  await dispatch(page, {
    type: "clock.advance",
    input: { wallNowMs: wallNowMs + elapsedMs, foreground: true },
  });
}

async function advanceForSimulation(page: Page, simulatedMs: number): Promise<void> {
  const wallNowMs = (await readState(page)).run.clock.wallNowMs ?? 0;
  await dispatch(page, {
    type: "clock.advance",
    input: {
      wallNowMs: wallNowMs + 1,
      foreground: true,
      offlineElapsedMs: Math.ceil(simulatedMs / OFFLINE_GAINS_RATE) + 1_000,
    },
  });
}

async function expectNoticeVisibleWithoutTakingFocus(
  notice: ReturnType<Page["locator"]>,
  focusTarget: ReturnType<Page["locator"]>,
): Promise<void> {
  await expect(notice).toBeVisible({ timeout: 1_000 });
  await expect(notice).not.toBeFocused();
  await expect(focusTarget).toBeFocused();
}

async function expectNoticeExpiresWithoutTakingFocus(
  notice: ReturnType<Page["locator"]>,
  focusTarget: ReturnType<Page["locator"]>,
): Promise<void> {
  await expect(notice).toHaveCount(0, { timeout: 4_000 });
  await expect(focusTarget).toBeFocused();
}

test("announces the Collect 50 Hydrogen achievement without taking focus @p08 @p16-focus", async ({
  page,
}, testInfo) => {
  await startFreshGame(page, "Achievement Notice Pioneer");
  const collect = page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  const notice = page
    .locator('[data-testid="game-notification"][data-classification="achievement"]')
    .filter({ hasText: "You have collected 50 Hydrogen!" });
  for (let count = 0; count < 50; count += 1) await collect.click();
  await expectNoticeVisibleWithoutTakingFocus(notice, collect);

  const earned = await page.evaluate(() =>
    window.miaplacidusTest!.getState().run.achievements.unlockedIds.includes("collect50Hydrogen"),
  );
  expect(earned).toBe(true);

  await expect(notice).toHaveCount(1);
  await expect(notice).toContainText("ACHIEVEMENT:");
  await expect(notice).toContainText("REWARD: $10");
  await expect(notice).toHaveCSS("border-left-color", "rgb(255, 204, 0)");
  await testInfo.attach("achievement-unlock-source-notice.png", {
    body: await notice.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
  await expectNoticeExpiresWithoutTakingFocus(notice, collect);
});

test("keeps the researched technology focused through its notification @p16-focus", async ({
  page,
}) => {
  await startFixture(page, "research", "Research Notice Pioneer");
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-tech-tree").click();
  const technology = page.locator('[data-technology-id="knowledgeSharing"]');
  await expect(technology).toHaveAttribute("aria-disabled", "false");
  const notice = page
    .locator('[data-testid="game-notification"][data-classification="tech"]')
    .filter({ hasText: "Knowledge Sharing Researched" });
  await technology.click();
  await expectNoticeVisibleWithoutTakingFocus(notice, technology);
  await expectNoticeExpiresWithoutTakingFocus(notice, technology);
});

test("moves focus to the next Telescope action when its build control is replaced @p16-focus", async ({
  page,
}) => {
  await startFixture(page, "space-telescope", "Telescope Notice Pioneer");
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  const nextAction = page.locator("#space-scan-asteroids");
  const notice = page
    .locator('[data-testid="game-notification"][data-classification="special"]')
    .filter({ hasText: "Space Telescope Built!" });
  await page.getByRole("button", { name: "Build Space Telescope", exact: true }).click();
  await expectNoticeVisibleWithoutTakingFocus(notice, nextAction);
  await expectNoticeExpiresWithoutTakingFocus(notice, nextAction);
});

test("keeps the active page focused through a hazardous-weather notice @p16-focus", async ({
  page,
}) => {
  await startFixture(page, "space-telescope", "Weather Focus Pioneer");
  await page.locator("#tab-space-mining").click();
  const telescopeTab = page.locator("#tab-space-mining-telescope");
  await telescopeTab.click();
  await telescopeTab.focus();

  const currentCondition = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.currentSystemWeather,
  );
  const hazardousCondition = currentCondition === "rain" ? "heavyRain" : "rain";
  const notice = page.locator('[data-testid="game-notification"][data-classification="weather"]');
  await clearNotificationQueue(page);
  await dispatch(page, {
    type: "space.weather.set-condition",
    condition: hazardousCondition,
  });
  await expectNoticeVisibleWithoutTakingFocus(notice, telescopeTab);
  await expectNoticeExpiresWithoutTakingFocus(notice, telescopeTab);
});

test("keeps the Rocket page focused through a return notice @p16-focus", async ({ page }) => {
  await startFixture(page, "space-returning-rocket", "Rocket Notice Focus Pioneer");
  await page.locator("#tab-space-mining").click();
  const rocketTab = page.locator("#tab-space-mining-rocket-1");
  await rocketTab.click();
  await rocketTab.focus();

  const state = await readState(page);
  const rocket = state.run.space.rockets.rocket1;
  const timer = state.run.timers[rocket.timerId!]!;
  const asteroid = state.run.space.asteroids.find(({ id }) => id === rocket.targetAsteroidId)!;
  const notice = page
    .locator('[data-testid="game-notification"][data-classification="rocket"]')
    .filter({
      hasText: spaceNotificationText("en", "rocketReturned", {
        rocket: rocket.name,
        asteroid: asteroid.name,
      }),
    });
  await clearNotificationQueue(page);
  await advanceForSimulation(page, timer.durationMs - timer.elapsedMs + 1);
  await expectNoticeVisibleWithoutTakingFocus(notice, rocketTab);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("ready");

  await expectNoticeExpiresWithoutTakingFocus(notice, rocketTab);
});

test("keeps the Starship page focused through an arrival notice @p16-focus", async ({ page }) => {
  await startFixture(page, "space-starship-ready", "Starship Notice Focus Pioneer");
  await page.locator("#tab-interstellar").click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();
  await page.locator("#tab-interstellar-starship").click();

  const launchNotice = page
    .locator('[data-testid="game-notification"][data-classification="starShip"]')
    .filter({ hasText: "Travelling to Sirius" });
  await page.getByRole("button", { name: "Travel", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect(launchNotice).toBeVisible({ timeout: 1_000 });
  await expect(launchNotice).toHaveCount(0, { timeout: 4_000 });

  const starshipTab = page.locator("#tab-interstellar-starship");
  await starshipTab.focus();
  const state = await readState(page);
  const timer = state.run.timers[state.run.space.starship.timerId!]!;
  const arrivalNotice = page
    .locator('[data-testid="game-notification"][data-classification="starShip"]')
    .filter({ hasText: "StarShip has reached orbit of the Sirius system!" });
  await clearNotificationQueue(page);
  await starshipTab.focus();
  await expect(starshipTab).toBeFocused();
  await advanceForSimulation(page, timer.durationMs - timer.elapsedMs + 1);
  const randomEventDialog = page.getByTestId("random-event-result-dialog");
  await expect(randomEventDialog).toBeVisible();
  await randomEventDialog.getByRole("button").click();
  await expect(randomEventDialog).toHaveCount(0);
  await expectNoticeVisibleWithoutTakingFocus(arrivalNotice, starshipTab);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("orbiting");
  await expectNoticeExpiresWithoutTakingFocus(arrivalNotice, starshipTab);
});

test("keeps the Colonise page focused through a battle-result notice @p16-focus", async ({
  page,
}) => {
  await startFixture(page, "space-battle-victory", "Battle Notice Focus Pioneer");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();
  const pane = page.getByTestId("starship-pane");
  await pane.getByRole("button", { name: "Conquest", exact: true }).click();
  await pane.getByTestId("starship-battle-engage-button").click();

  const colonisePage = page.locator("#panel-interstellar-starship");
  await colonisePage.focus();
  await expect(colonisePage).toBeFocused();
  const notice = page
    .locator('[data-testid="game-notification"][data-classification="battle"]')
    .filter({ hasText: "Victory in Sirius: the enemy fleet was defeated." });
  let phase = (await readState(page)).run.space.systemEncounters[0]!.battle.phase;
  await clearNotificationQueue(page);
  for (let round = 0; round < 500 && phase === "inProgress"; round += 1) {
    await advanceForeground(page, 250);
    phase = (await readState(page)).run.space.systemEncounters[0]!.battle.phase;
  }
  expect(phase).toBe("victory");
  await expectNoticeVisibleWithoutTakingFocus(notice, colonisePage);
  await expectNoticeExpiresWithoutTakingFocus(notice, colonisePage);
});

test("keeps the Colonise page focused through a battle-defeat notice @p16-focus", async ({
  page,
}) => {
  await startFixture(page, "space-battle-defeat", "Battle Defeat Notice Pioneer");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();
  const pane = page.getByTestId("starship-pane");
  await pane.getByRole("button", { name: "Conquest", exact: true }).click();
  await pane.getByTestId("starship-battle-engage-button").click();

  const colonisePage = page.locator("#panel-interstellar-starship");
  await colonisePage.focus();
  await expect(colonisePage).toBeFocused();
  const notice = page
    .locator('[data-testid="game-notification"][data-classification="battle"]')
    .filter({ hasText: "Defeat at Sirius: your fleet was defeated." });
  let phase = (await readState(page)).run.space.systemEncounters[0]!.battle.phase;
  await clearNotificationQueue(page);
  for (let round = 0; round < 500 && phase === "inProgress"; round += 1) {
    await advanceForeground(page, 250);
    phase = (await readState(page)).run.space.systemEncounters[0]!.battle.phase;
  }
  expect(phase).toBe("defeat");
  await expectNoticeVisibleWithoutTakingFocus(notice, colonisePage);
  await expectNoticeExpiresWithoutTakingFocus(notice, colonisePage);
});
