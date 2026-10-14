import { expect, test, type Page } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { formatNumber } from "../../../src/app/numberFormatting";
import type { LocaleId } from "../../../src/content/ids";
import {
  ROCKET_FUEL_CAPACITY,
  STAR_STUDY_TIMER_ID,
  VOID_PILLAGE_TIMER_ID,
} from "../../../src/content/space";
import { STAR_WEATHER_TIMER_ID } from "../../../src/engine/weather";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { spaceNotificationText } from "../../../src/i18n/spaceNotificationMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";

const ALL_LOCALES: readonly LocaleId[] = ["en", "es", "pt", "de", "it", "fr"];

async function startSpaceFixture(
  page: import("@playwright/test").Page,
  fixture:
    | "space-telescope"
    | "space-late-game"
    | "space-rocket-part-shortfall"
    | "space-rocket-part-exact"
    | "space-voidborn-pillage" = "space-telescope",
  locale: LocaleId = "en",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Space Telescope Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect(page.getByText("Space Telescope Pioneer")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const dismissTutorial = page.getByRole("button", { name: "No thanks", exact: true });
  if (await dismissTutorial.isVisible()) await dismissTutorial.click();
}

async function buildTelescope(page: import("@playwright/test").Page): Promise<void> {
  const button = page.getByRole("button", {
    name: spaceText("en", "telescopeBuild"),
    exact: true,
  });
  await expect(button).toBeEnabled();
  await button.click();
}

async function clearQueuedNotifications(page: Page): Promise<void> {
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect(page.getByTestId("notification-stack")).toBeEmpty();
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: true },
    }),
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled))
    .toBe(true);
}

async function dismissRandomEventResultIfPresent(page: Page): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  for (let dismissed = 0; dismissed < 10; dismissed += 1) {
    if (!(await dialog.isVisible())) return;
    await dialog.getByRole("button").click();
    await expect
      .poll(async () => {
        if ((await dialog.count()) === 0) return null;
        if (!(await dialog.isVisible())) return undefined;
        return dialog.getByRole("heading").innerText();
      })
      .not.toBeUndefined();
  }
  await expect(dialog).toHaveCount(0);
}

test("keeps Mining hidden until a rocket reaches an asteroid @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await expect(page.locator("#tab-space-mining-mining")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterUnlocked),
    )
    .toBe(false);
});

test("explains why the antimatter boost is unavailable at zero mining rate @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-late-game");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterUnlocked),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("outbound");

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-mining").click();

  const miningRate = page.getByTestId("antimatter-rate");
  await expect(miningRate).toContainText("0 /s");
  const boost = page.getByTestId("antimatter-boost");
  await expect(boost).toBeDisabled();
  await expect(boost).toHaveAttribute("aria-pressed", "false");
  await expect(boost).toHaveAttribute("aria-describedby", "antimatter-boost-reason");
  await expect(page.getByTestId("antimatter-boost-reason")).toBeVisible();
  await expect(page.getByTestId("antimatter-boost-reason")).toHaveText(
    "The boost is available while antimatter is being mined.",
  );
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterBoostActive),
  ).toBe(false);
});

test("announces asteroid-search completion while another tab is selected @space-telescope @p20-announcements", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await clearQueuedNotifications(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  const pane = page.getByTestId("space-mining-pane");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText(`$${formatNumber("en", 10_000)}`);
  await expect(pane).toContainText(`${formatNumber("en", 20_000)} Iron`);
  await buildTelescope(page);
  const telescopeNotice = page.locator(
    '[data-testid="game-notification"][data-classification="special"]',
  );
  await expect(telescopeNotice).toHaveText("Space Telescope Built!");
  await expect(telescopeNotice).toHaveClass(/notification-info/);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.telescopeBuilt))
    .toBe(true);
  await expect(
    pane
      .getByRole("region", { name: spaceText("en", "telescopeTitle") })
      .locator(".space-card-heading .status-pill.is-ready"),
  ).toHaveText(spaceText("en", "telescopeBuilt"));
  await expect(page.getByTestId("space-feedback")).toHaveText("");
  const initialAsteroidIds = await page.evaluate(() =>
    window.miaplacidusTest!.getState().run.space.asteroids.map((asteroid) => asteroid.id),
  );
  await expect(telescopeNotice).toHaveCount(0);
  await page
    .getByRole("button", { name: spaceText("en", "scanAsteroids"), exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("asteroids");
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.timers["survey:asteroid-scan"]?.status,
      ),
    )
    .toBe("running");
  const surveyProgress = page.getByRole("progressbar", {
    name: spaceText("en", "surveySearching"),
    exact: true,
  });
  await expect(surveyProgress).toBeVisible();
  await expect(surveyProgress).toHaveAttribute("aria-label", spaceText("en", "surveySearching"));
  const initialSurveyProgress = await surveyProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialSurveyProgress).toEqual({ value: expect.any(Number), max: 100 });
  expect(initialSurveyProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialSurveyProgress.value).toBeLessThan(initialSurveyProgress.max);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => surveyProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialSurveyProgress.value);

  for (const locale of ALL_LOCALES) {
    expect(
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.applyDebugAction("set-language", { locale: nextLocale }),
        locale,
      ),
    ).toBe(true);
    const localizedProgress = page.getByRole("progressbar", {
      name: spaceText(locale, "surveySearching"),
      exact: true,
    });
    await expect(localizedProgress).toBeVisible();
    await expect(localizedProgress).toHaveAttribute(
      "aria-label",
      spaceText(locale, "surveySearching"),
    );
  }
  const remainingScanMs = Number(
    await page.getByTestId("space-survey-countdown").getAttribute("data-remaining-ms"),
  );
  await page.locator("#tab-hydrogen").click();
  await expect(page.locator("#pane-hydrogen")).toBeVisible();
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1_000),
    remainingScanMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBeNull();
  await expect(page.locator("#pane-hydrogen")).toBeVisible();
  const completedDiscovery = await page.evaluate((previousIds) => {
    const state = window.miaplacidusTest!.getState();
    const asteroid = state.run.space.asteroids.find((entry) => !previousIds.includes(entry.id));
    return asteroid ? { name: asteroid.name, rarity: asteroid.rarity } : null;
  }, initialAsteroidIds);
  const expectedNotification = completedDiscovery
    ? spaceNotificationText(
        "fr",
        completedDiscovery.rarity === "legendary"
          ? "legendaryAsteroidDiscovered"
          : "asteroidDiscovered",
        { asteroid: completedDiscovery.name },
      )
    : spaceNotificationText("fr", "asteroidScanMissed");
  const notificationRegion = page.getByTestId("notification-stack");
  const globalScanNotice = notificationRegion
    .getByTestId("game-notification")
    .filter({ hasText: completedDiscovery?.name ?? expectedNotification });
  await expect(notificationRegion).toHaveAttribute("data-visible-limit", "2");
  await expect(globalScanNotice).toHaveRole("status");
  await expect(globalScanNotice).toHaveAttribute("aria-atomic", "true");
  await expect(globalScanNotice).toHaveText(expectedNotification);

  await page.locator("#tab-space-mining").click();
  await expect(page.getByTestId("space-mining-pane")).toBeVisible();
});

test("shows telescope survey power loss as a pause and resumes the countdown @space-live-countdown", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await clearQueuedNotifications(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await buildTelescope(page);
  await page
    .getByRole("button", { name: spaceText("en", "scanAsteroids"), exact: true })
    .click();

  const status = page.getByTestId("space-survey-status");
  const countdown = page.getByTestId("space-survey-countdown");
  const progress = page.getByTestId("space-survey-progress");
  const readSurvey = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      const timer = state.run.timers["survey:asteroid-scan"];
      return {
        status: timer?.status ?? null,
        elapsedMs: timer?.elapsedMs ?? null,
        durationMs: timer?.durationMs ?? null,
        powerBlocked: state.run.space.surveyPowerBlocked,
      };
    });

  await expect(status).toHaveText(spaceText("en", "surveySearching"));
  await expect(progress).toBeVisible();
  await expect.poll(async () => (await readSurvey()).status).toBe("running");
  const initialRemainingMs = Number(await countdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await countdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialRemainingMs);

  await page.getByRole("tab", { name: "Energy" }).click();
  await page.locator("#tab-energy-power").click();
  const powerSwitch = page.locator("#panel-energy .energy-master-switch");
  await expect(powerSwitch).toHaveText(economyLabel("en", "deactivatePower"));
  await powerSwitch.click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.gridEnabled),
    )
    .toBe(false);

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await expect(status).toHaveText(spaceText("en", "surveyPowerBlocked"));
  await expect(progress).toHaveAttribute("aria-label", spaceText("en", "surveyPowerBlocked"));
  await expect.poll(async () => (await readSurvey()).status).toBe("paused");
  const pausedSurvey = await readSurvey();
  const pausedProgress = await progress.evaluate(
    (element) => (element as HTMLProgressElement).value,
  );
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect.poll(readSurvey).toEqual(pausedSurvey);
  await expect
    .poll(() => progress.evaluate((element) => (element as HTMLProgressElement).value))
    .toBe(pausedProgress);

  await page.getByRole("tab", { name: "Energy" }).click();
  await page.locator("#tab-energy-power").click();
  await expect(powerSwitch).toHaveText(economyLabel("en", "activatePower"));
  await powerSwitch.click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.gridEnabled),
    )
    .toBe(true);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await expect(status).toHaveText(spaceText("en", "surveySearching"));
  await expect.poll(async () => (await readSurvey()).status).toBe("running");
  const resumedRemainingMs = Number(await countdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await countdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(resumedRemainingMs);
});

test("exposes live Star Study and Void Pillage progress across all locales @space-live-countdown @p20-announcements", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await clearQueuedNotifications(page);
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  await buildTelescope(page);
  await clearQueuedNotifications(page);

  await page.getByRole("button", { name: spaceText("en", "studyStars"), exact: true }).click();
  const studyProgress = page.getByRole("progressbar", {
    name: spaceText("en", "surveyStudying"),
    exact: true,
  });
  await expect(studyProgress).toBeVisible();
  const initialStudy = await studyProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialStudy.max).toBe(100);
  expect(initialStudy.value).toBeGreaterThanOrEqual(0);
  expect(initialStudy.value).toBeLessThan(initialStudy.max);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => studyProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialStudy.value);
  for (const locale of ALL_LOCALES) {
    expect(
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.applyDebugAction("set-language", { locale: nextLocale }),
        locale,
      ),
    ).toBe(true);
    const localizedProgress = page.getByRole("progressbar", {
      name: spaceText(locale, "surveyStudying"),
      exact: true,
    });
    await expect(localizedProgress).toBeVisible();
    await expect(localizedProgress).toHaveAttribute(
      "aria-label",
      spaceText(locale, "surveyStudying"),
    );
  }
  const studyBeforeCompletion = await page.evaluate((timerId) => {
    const state = window.miaplacidusTest!.getState();
    const timer = state.run.timers[timerId];
    return {
      remainingMs: timer ? Math.max(0, timer.durationMs - timer.elapsedMs) : null,
      starStudyRange: state.run.space.starStudyRange,
    };
  }, STAR_STUDY_TIMER_ID);
  const spaceFeedback = page.getByTestId("space-feedback");
  await expect(spaceFeedback).toHaveRole("status");
  await expect(spaceFeedback).toHaveAttribute("aria-live", "polite");
  await expect(spaceFeedback).toHaveAttribute("aria-atomic", "true");
  expect(studyBeforeCompletion.remainingMs).not.toBeNull();
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    studyBeforeCompletion.remainingMs!,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBeNull();
  const completedStudy = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      starStudyRange: state.run.space.starStudyRange,
    };
  });
  expect(completedStudy.starStudyRange).toBeGreaterThan(studyBeforeCompletion.starStudyRange);
  await expect(
    page.getByRole("progressbar", {
      name: spaceText("fr", "surveyStudying"),
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(spaceFeedback).toHaveText("");

  await startSpaceFixture(page, "space-voidborn-pillage");
  await clearQueuedNotifications(page);
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("set-language", { locale: "fr" }),
    ),
  ).toBe(true);
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  const voidbornState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(voidbornState.permanent.rebirthCount).toBe(1);
  expect(voidbornState.permanent.philosophyId).toBe("voidborn");
  expect(voidbornState.run.philosophyAbilityActive).toBe(true);
  expect(voidbornState.run.space.telescopeBuilt).toBe(true);

  await page.getByRole("button", { name: spaceText("fr", "pillageVoid"), exact: true }).click();
  const pillageProgress = page.getByRole("progressbar", {
    name: spaceText("fr", "surveyPillaging"),
    exact: true,
  });
  await expect(pillageProgress).toBeVisible();
  const initialPillage = await pillageProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialPillage.max).toBe(100);
  expect(initialPillage.value).toBeGreaterThanOrEqual(0);
  expect(initialPillage.value).toBeLessThan(initialPillage.max);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => pillageProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialPillage.value);
  for (const locale of ALL_LOCALES) {
    expect(
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.applyDebugAction("set-language", { locale: nextLocale }),
        locale,
      ),
    ).toBe(true);
    const localizedProgress = page.getByRole("progressbar", {
      name: spaceText(locale, "surveyPillaging"),
      exact: true,
    });
    await expect(localizedProgress).toBeVisible();
    await expect(localizedProgress).toHaveAttribute(
      "aria-label",
      spaceText(locale, "surveyPillaging"),
    );
  }
  const pillageBeforeCompletion = await page.evaluate((timerId) => {
    const state = window.miaplacidusTest!.getState();
    const timer = state.run.timers[timerId];
    return {
      remainingMs: timer ? Math.max(0, timer.durationMs - timer.elapsedMs) : null,
      completions: state.run.space.voidPillageCompletions,
    };
  }, VOID_PILLAGE_TIMER_ID);
  await expect(spaceFeedback).toHaveRole("status");
  await expect(spaceFeedback).toHaveAttribute("aria-live", "polite");
  await expect(spaceFeedback).toHaveAttribute("aria-atomic", "true");
  expect(pillageBeforeCompletion.remainingMs).not.toBeNull();
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    pillageBeforeCompletion.remainingMs!,
  );
  const notificationRegion = page.getByTestId("notification-stack");
  const pillageNotice = notificationRegion
    .getByRole("status")
    .filter({ hasText: spaceNotificationText("fr", "voidPillageComplete") });
  await expect(pillageNotice).toContainText(spaceNotificationText("fr", "voidPillageComplete"));
  await expect(pillageNotice).toHaveAttribute("aria-atomic", "true");
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBeNull();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.voidPillageCompletions),
    )
    .toBeGreaterThan(pillageBeforeCompletion.completions);
  await expect(
    page.getByRole("progressbar", {
      name: spaceText("fr", "surveyPillaging"),
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(spaceFeedback).toHaveText("");
  await expect(notificationRegion).toHaveAttribute("data-visible-limit", "2");
  await expect(pillageNotice).toContainText(spaceNotificationText("fr", "voidPillageComplete"));
  await expect(page.getByTestId("space-feedback")).not.toContainText(
    spaceNotificationText("fr", "voidPillageComplete"),
  );
});

test("keeps launch-pad weather separate from the telescope and shows precipitation in the header tooltip @space-live-countdown", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await clearQueuedNotifications(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();

  await expect(page.getByTestId("space-weather-overview")).toHaveCount(0);
  const location = page.getByTestId("location-status");
  await location.locator(".location-status-summary").focus();
  const weatherTooltip = page.locator("#location-status-tooltip");
  await expect(weatherTooltip).toBeVisible();
  await expect(weatherTooltip).toContainText("Precipitation rate:");
  await expect(weatherTooltip).toContainText("Precipitation collected this run:");

  await page.locator("#tab-space-mining-launch-pad").click();
  await expect(page.getByTestId("space-weather-overview")).toBeVisible();
  const weatherCountdown = page.getByTestId("space-weather-timer");
  await expect(weatherCountdown).toBeVisible();
  const initialWeatherMs = Number(await weatherCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await weatherCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialWeatherMs);
  const weatherBeforeExpiry = await page.evaluate((timerId) => {
    const state = window.miaplacidusTest!.getState();
    const timer = state.run.timers[timerId];
    return {
      remainingMs: timer ? Math.max(0, timer.durationMs - timer.elapsedMs) : null,
      cycleCount: state.run.space.weatherCycleCount,
      condition: state.run.space.currentSystemWeather,
    };
  }, STAR_WEATHER_TIMER_ID);
  expect(weatherBeforeExpiry.remainingMs).not.toBeNull();
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    weatherBeforeExpiry.remainingMs!,
  );
  let previousCycleCount = weatherBeforeExpiry.cycleCount;
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.weatherCycleCount))
    .toBeGreaterThan(previousCycleCount);
  previousCycleCount = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.weatherCycleCount,
  );
  let currentWeather = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.currentSystemWeather,
  );
  for (let cycle = 0; cycle < 8 && currentWeather === weatherBeforeExpiry.condition; cycle += 1) {
    const nextWeatherMs = await page.evaluate((timerId) => {
      const state = window.miaplacidusTest!.getState();
      const timer = state.run.timers[timerId];
      return timer ? Math.max(0, timer.durationMs - timer.elapsedMs) : null;
    }, STAR_WEATHER_TIMER_ID);
    expect(nextWeatherMs).not.toBeNull();
    await page.evaluate(
      (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
      nextWeatherMs!,
    );
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().run.space.weatherCycleCount),
      )
      .toBeGreaterThan(previousCycleCount);
    previousCycleCount = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.weatherCycleCount,
    );
    currentWeather = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.currentSystemWeather,
    );
  }
  expect(currentWeather).not.toBe(weatherBeforeExpiry.condition);
  const weatherLabelByCondition = {
    clear: "weatherClear",
    cloudy: "weatherCloudy",
    rain: "weatherRain",
    heavyRain: "weatherHeavyRain",
    volcano: "weatherVolcano",
  } as const;
  await expect(page.getByTestId("space-current-weather")).toHaveText(
    spaceText("en", weatherLabelByCondition[currentWeather]),
  );
  await expect(weatherCountdown).toHaveAttribute("data-remaining-ms", /[1-9]\d*/);

  await page.locator("#tab-space-mining-telescope").click();
  await buildTelescope(page);
  await page
    .getByRole("button", { name: spaceText("en", "scanAsteroids"), exact: true })
    .click();
  const surveyCountdown = page.getByTestId("space-survey-countdown");
  await expect(surveyCountdown).toBeVisible();
  await expect(surveyCountdown).toContainText("Time remaining:");
  const initialSurveyMs = Number(await surveyCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await surveyCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialSurveyMs);
});

test("explains the one-unit rocket-part shortfall through its associated reason @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-rocket-part-shortfall");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();

  const rocket = page.getByTestId("rocket-card-rocket1");
  const buildPart = rocket.getByRole("button", { name: "Build Rocket Part" });
  await expect(rocket).toContainText(`${formatNumber("en", 3_000)} Steel`);
  await expect(buildPart).toBeDisabled();
  await expect(buildPart).toHaveAttribute(
    "aria-describedby",
    "rocket-rocket1-part-cost rocket-rocket1-part-reason",
  );
  await expect(page.locator("#rocket-rocket1-part-reason")).toHaveText(
    `Not enough Steel. Required: ${formatNumber("en", 3_000)}.`,
  );
});

test("builds a rocket part at exact stock and charges every quoted cost @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-rocket-part-exact");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();

  const rocket = page.getByTestId("rocket-card-rocket1");
  const buildPart = rocket.getByRole("button", { name: "Build Rocket Part" });
  await expect(buildPart).toBeEnabled();
  await expect(buildPart).toHaveAttribute("aria-describedby", "rocket-rocket1-part-cost");
  const cashBefore = await page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
  await buildPart.click();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        return {
          builtParts: state.run.space.rockets.rocket1.builtParts,
          glass: state.run.goods.glass.quantity,
          titanium: state.run.goods.titanium.quantity,
          steel: state.run.goods.steel.quantity,
        };
      }),
    )
    .toEqual({
      builtParts: 1,
      glass: 999_000,
      titanium: 999_300,
      steel: 0,
    });
  expect(await page.evaluate(() => window.miaplacidusTest!.getState().run.cash)).toBe(
    cashBefore - 1_000,
  );
  const nextPartCost = rocket.locator(".cost-line");
  await expect(nextPartCost).toContainText(`$${formatNumber("en", 1_130)}`);
  await expect(nextPartCost).toContainText(`${formatNumber("en", 1_130)} Glass`);
  await expect(nextPartCost).toContainText("791 Titanium");
  await expect(nextPartCost).toContainText(`${formatNumber("en", 3_390)} Steel`);
  await expect(buildPart).toBeDisabled();
  await expect(buildPart).toHaveAttribute(
    "aria-describedby",
    "rocket-rocket1-part-cost rocket-rocket1-part-reason",
  );
  await expect(page.locator("#rocket-rocket1-part-reason")).toHaveText(
    `Not enough Steel. Required: ${formatNumber("en", 3_390)}.`,
  );
});

test("unlocked Auto Telescope starts the selected survey mode @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await buildTelescope(page);
  const controls = page.getByTestId("auto-telescope-controls");
  await expect(controls).toBeVisible();
  await controls.getByLabel(spaceText("en", "autoRowLabel")).selectOption("stars");
  await page.getByRole("button", { name: "Enable automation" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        enabled: window.miaplacidusTest!.getState().run.space.autoTelescopeEnabled,
        mode: window.miaplacidusTest!.getState().run.space.autoTelescopeMode,
      })),
    )
    .toEqual({ enabled: true, mode: "stars" });
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("stars");
});

test("an orbiting rocket explains the missing asteroid target and travels after one is selected @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await clearQueuedNotifications(page);

  await page.keyboard.press("NumpadSubtract");
  const debugMenu = page.getByTestId("debug-scenario-menu");
  await expect(debugMenu).toBeVisible();
  await debugMenu.getByTestId("debug-action-add-10-asteroids").click();
  await debugMenu.getByRole("button", { name: "Close" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.selectedAsteroidId),
    )
    .toBeNull();

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();
  await page
    .getByRole("button", { name: rocketText("en", "buildLaunchPad"), exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
    .toBe(true);
  const rocket = page.getByTestId("rocket-card-rocket1");
  for (let part = 0; part < 12; part += 1) {
    await rocket.getByRole("button", { name: "Build Rocket Part" }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("ready");

  const rocket2 = page.getByTestId("rocket-card-rocket2");
  for (let part = 0; part < 17; part += 1) {
    await rocket2.getByRole("button", { name: "Build Rocket Part" }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket2.phase),
    )
    .toBe("ready");
  await page.locator("#tab-space-mining-rocket-2").click();
  await rocket2
    .getByRole("button", { name: rocketText("en", "buyPump"), exact: true })
    .click();
  await page.locator("#tab-space-mining-rocket-1").click();
  await rocket.getByRole("button", { name: rocketText("en", "buyPump"), exact: true }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(6_000_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
      ),
    )
    .toBe(10_000);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket2.fuelQuantity,
      ),
    )
    .toBe(12_000);

  await page.keyboard.press("NumpadSubtract");
  const clearWeatherMenu = page.getByTestId("debug-scenario-menu");
  await clearWeatherMenu.getByTestId("debug-action-clear-weather").click();
  await clearWeatherMenu.getByRole("button", { name: "Close" }).click();
  await dismissRandomEventResultIfPresent(page);
  const launchRocket1 = rocket.getByRole("button", {
    name: rocketText("en", "launch"),
    exact: true,
  });
  await expect(launchRocket1).toBeEnabled();
  await launchRocket1.click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("orbit");
  await page.locator("#tab-space-mining-rocket-2").click();
  const launchRocket2 = rocket2.getByRole("button", {
    name: rocketText("en", "launch"),
    exact: true,
  });
  await expect(launchRocket2).toBeEnabled();
  await launchRocket2.click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket2.phase),
    )
    .toBe("orbit");

  await page.locator("#tab-space-mining-rocket-1").click();
  const travelButton = rocket.getByRole("button", {
    name: rocketText("en", "travelToAsteroid"),
    exact: true,
  });
  await expect(
    rocket.getByText(`${rocketText("en", "destination")}: —`, { exact: true }),
  ).toBeVisible();
  await expect(travelButton).toBeDisabled();
  await expect(page.locator("#rocket-rocket1-travel-reason")).toHaveText(
    "Select an available asteroid in this system.",
  );
  await expect(travelButton).toHaveAttribute("aria-describedby", "rocket-rocket1-travel-reason");

  await page.locator("#tab-space-mining-asteroids").click();
  const availableAsteroid = await page.evaluate(() =>
    window
      .miaplacidusTest!.getState()
      .run.space.asteroids.find((asteroid) => !asteroid.depleted && asteroid.reservedBy === null),
  );
  expect(availableAsteroid).toBeDefined();
  await page.getByTestId(`asteroid-${availableAsteroid!.id}`).getByRole("button").click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.selectedAsteroidId),
    )
    .toBe(availableAsteroid!.id);

  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(travelButton).toBeEnabled();
  await travelButton.click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        const asteroid = state.run.space.asteroids.find(
          (entry) => entry.id === state.run.space.rockets.rocket1.targetAsteroidId,
        );
        return {
          phase: state.run.space.rockets.rocket1.phase,
          selected: state.run.space.selectedAsteroidId,
          reservedBy: asteroid?.reservedBy,
        };
      }),
    )
    .toEqual({ phase: "outbound", selected: availableAsteroid!.id, reservedBy: "rocket1" });

  const rocketTravelProgress = rocket.getByRole("progressbar", {
    name: rocketText("en", "outbound"),
    exact: true,
  });
  await expect(rocketTravelProgress).toBeVisible();
  await expect(rocketTravelProgress).toHaveAttribute("aria-label", rocketText("en", "outbound"));
  const initialRocketTravelProgress = await rocketTravelProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialRocketTravelProgress).toEqual({ value: expect.any(Number), max: 100 });
  expect(initialRocketTravelProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialRocketTravelProgress.value).toBeLessThan(initialRocketTravelProgress.max);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() =>
      rocketTravelProgress.evaluate((progress) => (progress as HTMLProgressElement).value),
    )
    .toBeGreaterThan(initialRocketTravelProgress.value);

  await page.locator("#tab-space-mining-rocket-2").click();
  const reservedTargetTravelButton = rocket2.getByRole("button", {
    name: rocketText("en", "travelToAsteroid"),
    exact: true,
  });
  await expect(reservedTargetTravelButton).toBeDisabled();
  await expect(page.locator("#rocket-rocket2-travel-reason")).toHaveText(
    "Select an available asteroid in this system.",
  );
  await expect(reservedTargetTravelButton).toHaveAttribute(
    "aria-describedby",
    "rocket-rocket2-travel-reason",
  );
});

test("assembles a rocket, buys its powered fuel pump, and reports fuel progress @rockets @ui-navigation @p20-announcements", async ({
  page,
}, testInfo) => {
  await startSpaceFixture(page);
  await clearQueuedNotifications(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();
  for (let rocket = 1; rocket <= 4; rocket += 1) {
    await expect(page.locator(`#tab-space-mining-rocket-${rocket}`)).toHaveCount(0);
  }
  await page
    .getByRole("button", { name: rocketText("en", "buildLaunchPad"), exact: true })
    .click();
  const launchPadNotice = page.locator(
    '[data-testid="game-notification"][data-classification="special"]',
  );
  await expect(launchPadNotice).toHaveText("Launch Pad Built!");
  await expect(launchPadNotice).toHaveClass(/notification-info/);
  await expect(page.locator("#panel-space-mining .space-survey-status")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
    .toBe(true);
  await expect(page.locator("[data-testid^='rocket-card-']")).toHaveCount(4);

  const rocket = page.getByTestId("rocket-card-rocket1");
  await expect(rocket).toBeVisible();
  for (let part = 0; part < 12; part += 1) {
    await rocket.getByRole("button", { name: "Build Rocket Part" }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.builtParts),
    )
    .toBe(12);
  await expect(page.locator("#tab-space-mining-rocket-1")).toBeVisible();
  for (let otherRocket = 2; otherRocket <= 4; otherRocket += 1) {
    await expect(page.locator(`#tab-space-mining-rocket-${otherRocket}`)).toHaveCount(0);
  }
  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(launchPadNotice).toHaveCount(0);
  await page.mouse.move(0, 0);
  await captureVisualCheckpoint(page, testInfo, "space-rocket-1-ready");

  const desktopHeight = page.viewportSize()?.height ?? 720;
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileGeometry = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>("#panel-space-mining")!;
    const card = document.querySelector<HTMLElement>("[data-testid='rocket-card-rocket1']")!;
    const paneBounds = pane.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    return {
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewportWidth: document.documentElement.clientWidth,
      paneLeft: paneBounds.left,
      paneRight: paneBounds.right,
      cardLeft: cardBounds.left,
      cardRight: cardBounds.right,
    };
  });
  expect(mobileGeometry.documentWidth).toBeLessThanOrEqual(mobileGeometry.viewportWidth);
  expect(mobileGeometry.cardLeft).toBeGreaterThanOrEqual(mobileGeometry.paneLeft);
  expect(mobileGeometry.cardRight).toBeLessThanOrEqual(mobileGeometry.paneRight);
  await page.mouse.move(0, 0);
  await captureVisualCheckpoint(page, testInfo, "space-rocket-1-mobile");
  await page.setViewportSize({ width: 1280, height: desktopHeight });

  await rocket.getByRole("button", { name: rocketText("en", "buyPump"), exact: true }).click();
  const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");
  const fuelProgress = rocket.getByRole("progressbar", {
    name: "Antimatter fuel",
    exact: true,
  });
  await expect(fuelEta).toBeVisible();
  await expect(fuelEta).toContainText("Time to full:");
  await expect(fuelProgress).toBeVisible();
  await expect(fuelProgress).toHaveAttribute("aria-label", "Antimatter fuel");
  const initialFuelProgress = await fuelProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialFuelProgress.max).toBeGreaterThan(0);
  expect(initialFuelProgress.max).toBe(ROCKET_FUEL_CAPACITY.rocket1);
  expect(initialFuelProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialFuelProgress.value).toBeLessThan(initialFuelProgress.max);
  for (const locale of ALL_LOCALES) {
    expect(
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.applyDebugAction("set-language", { locale: nextLocale }),
        locale,
      ),
    ).toBe(true);
    const localizedProgress = page.getByRole("progressbar", {
      name: rocketText(locale, "fuelLevel"),
      exact: true,
    });
    await expect(localizedProgress).toBeVisible();
    await expect(localizedProgress).toHaveAttribute("aria-label", rocketText(locale, "fuelLevel"));
  }
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("set-language", { locale: "en" }),
    ),
  ).toBe(true);
  const startingEtaMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelPumpPurchased,
      ),
    )
    .toBe(true);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
      ),
    )
    .toBeCloseTo(20, 5);
  await expect
    .poll(async () => Number(await fuelEta.getAttribute("data-remaining-ms")))
    .toBeLessThan(startingEtaMs);
  await expect
    .poll(() => fuelProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialFuelProgress.value);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(fuelEta).toBeVisible();
  await expect(fuelProgress).toBeVisible();
  const mobileFuelGeometry = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>("[data-testid='rocket-card-rocket1']");
    const progress = document.querySelector<HTMLElement>(
      "[data-testid='rocket-fuel-progress-rocket1']",
    );
    if (!card || !progress) throw new Error("Rocket fuel card and progress should be present");
    const cardBounds = card.getBoundingClientRect();
    const progressBounds = progress.getBoundingClientRect();
    return {
      cardLeft: cardBounds.left,
      cardRight: cardBounds.right,
      progressLeft: progressBounds.left,
      progressRight: progressBounds.right,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(mobileFuelGeometry.documentWidth).toBeLessThanOrEqual(mobileFuelGeometry.viewportWidth);
  expect(mobileFuelGeometry.progressLeft).toBeGreaterThanOrEqual(mobileFuelGeometry.cardLeft);
  expect(mobileFuelGeometry.progressRight).toBeLessThanOrEqual(mobileFuelGeometry.cardRight);
  await page.setViewportSize({ width: 1280, height: desktopHeight });

  const fuelAtPowerLoss = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
  );
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  const powerSwitch = page.locator("#panel-energy .energy-master-switch");
  await expect(powerSwitch).toHaveText(economyLabel("en", "deactivatePower"));
  await powerSwitch.click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.gridEnabled),
    )
    .toBe(false);

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(fuelEta).toHaveText("Turn on the power grid before fueling.");
  await expect(
    rocket.getByRole("button", { name: rocketText("en", "pauseFueling"), exact: true }),
  ).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelPumpEnabled,
    ),
  ).toBe(true);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
    ),
  ).toBe(fuelAtPowerLoss);

  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  await expect(powerSwitch).toHaveText(economyLabel("en", "activatePower"));
  await powerSwitch.click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.gridEnabled),
    )
    .toBe(true);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(fuelEta).toContainText("Time to full:");

  await rocket
    .getByRole("button", { name: rocketText("en", "pauseFueling"), exact: true })
    .click();
  await expect(fuelEta).toHaveText("Fueling is paused.");
  await expect(
    rocket.getByRole("button", { name: rocketText("en", "startFueling"), exact: true }),
  ).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  const pausedFuel = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
  );
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
    ),
  ).toBe(pausedFuel);

  await rocket
    .getByRole("button", { name: rocketText("en", "startFueling"), exact: true })
    .click();
  const resumedEtaMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(async () => Number(await fuelEta.getAttribute("data-remaining-ms")))
    .toBeLessThan(resumedEtaMs);

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(5_000_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
      ),
    )
    .toBe(10_000);
  const fuelReadyNotice = page.locator(
    '[data-testid="game-notification"][data-classification="rocket"]',
  );
  await expect(fuelReadyNotice).toHaveRole("status");
  await expect(fuelReadyNotice).toHaveAttribute("aria-atomic", "true");
  await expect(fuelReadyNotice).toHaveText("Rocket 1 is ready for Launch!");
  await expect(fuelReadyNotice).toHaveClass(/notification-info/);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect(fuelReadyNotice).toHaveCount(1);
});

test("shows the rocket's live outbound countdown on its page @space-live-countdown", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-late-game");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();

  const journeyCountdown = page.getByTestId("rocket-journey-countdown-rocket1");
  await expect(journeyCountdown).toBeVisible();
  await expect(journeyCountdown).toContainText("Journey time remaining:");
  const journeyProgress = page.getByRole("progressbar", {
    name: rocketText("en", "outbound"),
    exact: true,
  });
  await expect(journeyProgress).toBeVisible();
  await expect(journeyProgress).toHaveAttribute("aria-label", rocketText("en", "outbound"));
  const initialJourneyProgress = await journeyProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialJourneyProgress.max).toBe(100);
  expect(initialJourneyProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialJourneyProgress.value).toBeLessThan(initialJourneyProgress.max);
  const initialRemainingMs = Number(await journeyCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await journeyCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialRemainingMs);
  await expect
    .poll(() => journeyProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialJourneyProgress.value);
  for (const locale of ALL_LOCALES) {
    expect(
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.applyDebugAction("set-language", { locale: nextLocale }),
        locale,
      ),
    ).toBe(true);
    const localizedProgress = page.getByRole("progressbar", {
      name: rocketText(locale, "outbound"),
      exact: true,
    });
    await expect(localizedProgress).toBeVisible();
    await expect(localizedProgress).toHaveAttribute("aria-label", rocketText(locale, "outbound"));
  }
});

test("shows localized live returning-rocket progress across all locales @space-live-countdown", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-returning-rocket");
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-rocket-1").click();

  const rocketState = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.rockets.rocket1,
  );
  expect(rocketState.phase).toBe("returning");
  expect(rocketState.timerId).toBeTruthy();

  const returningProgress = page.getByRole("progressbar", {
    name: rocketText("en", "returning"),
    exact: true,
  });
  await expect(returningProgress).toBeVisible();
  await expect(returningProgress).toHaveAttribute("aria-label", rocketText("en", "returning"));
  const initialProgress = await returningProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialProgress.max).toBe(100);
  expect(initialProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialProgress.value).toBeLessThan(initialProgress.max);

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => returningProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialProgress.value);

  for (const locale of ALL_LOCALES) {
    expect(
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.applyDebugAction("set-language", { locale: nextLocale }),
        locale,
      ),
    ).toBe(true);
    const localizedProgress = page.getByRole("progressbar", {
      name: rocketText(locale, "returning"),
      exact: true,
    });
    await expect(localizedProgress).toBeVisible();
    await expect(localizedProgress).toHaveAttribute("aria-label", rocketText(locale, "returning"));
  }
});
