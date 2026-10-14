import { expect, test, type Page } from "../_harness/fixtures";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { ASTEROID_SCAN_TIMER_ID, STAR_STUDY_TIMER_ID } from "../../../src/content/space";
import { spaceNotificationText } from "../../../src/i18n/spaceNotificationMessages";
import { localizedRocketUserName, rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { translate } from "../../../src/i18n/messages";
import { settingsStatisticLabel } from "../../../src/i18n/settingsMessages";
import { statisticsNotApplicableLabel } from "../../../src/i18n/statisticsMessages";

type SpaceFixture =
  | "space-telescope"
  | "space-asteroid-mining"
  | "space-late-game"
  | "space-rocket-fuel-pump";

async function startSpaceFixture(
  page: Page,
  fixture: SpaceFixture,
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill(`P-45 Space Copy ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
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

test("Telescope and Launch Pad actions, status, and completion notices use all locales @p45-space-mining-copy", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await startSpaceFixture(page, "space-telescope", locale);
    await clearQueuedNotifications(page);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();

    const telescope = page.getByRole("region", { name: spaceText(locale, "telescopeTitle") });
    const buildTelescope = telescope.getByRole("button", {
      name: spaceText(locale, "telescopeBuild"),
      exact: true,
    });
    await expect(buildTelescope).toBeEnabled();
    await buildTelescope.click();
    await expect(
      telescope.getByText(spaceText(locale, "telescopeBuilt"), { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("space-feedback")).toHaveText(spaceText(locale, "feedbackBuilt"));
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: spaceNotificationText(locale, "telescopeBuilt") }),
    ).toHaveText(spaceNotificationText(locale, "telescopeBuilt"));

    const scan = telescope.getByRole("button", {
      name: spaceText(locale, "scanAsteroids"),
      exact: true,
    });
    const study = telescope.getByRole("button", {
      name: spaceText(locale, "studyStars"),
      exact: true,
    });
    await expect(scan).toBeEnabled();
    await expect(study).toBeEnabled();

    await page.locator("#tab-space-mining-launch-pad").click();
    await clearQueuedNotifications(page);
    const buildLaunchPad = page.getByRole("button", {
      name: rocketText(locale, "buildLaunchPad"),
      exact: true,
    });
    await expect(buildLaunchPad).toBeEnabled();
    await buildLaunchPad.click();
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: spaceNotificationText(locale, "launchPadBuilt") }),
    ).toHaveText(spaceNotificationText(locale, "launchPadBuilt"));
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
      .toBe(true);

    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-statistics").click();
    const statistics = page.getByTestId("settings-statistics");
    const spaceMining = statistics.locator(".settings-stat-section").filter({
      has: page.getByRole("heading", {
        name: settingsStatisticLabel(locale, "spaceMiningSection"),
        exact: true,
      }),
    });
    for (const [id, label] of [
      ["spaceTelescopeBuilt", settingsStatisticLabel(locale, "spaceTelescopeBuilt")],
      ["launchPadBuilt", settingsStatisticLabel(locale, "launchPadBuilt")],
    ] as const) {
      const status = spaceMining.locator(`[data-statistic-id="${id}"]`);
      await expect(status.locator("dt")).toHaveText(label);
      await expect(status.locator(".settings-stat-pair-values small")).toHaveText([
        settingsStatisticLabel(locale, "run"),
        settingsStatisticLabel(locale, "lifetime"),
      ]);
      await expect(status.locator(".settings-stat-pair-values strong")).toHaveText([
        settingsStatisticLabel(locale, "yes"),
        statisticsNotApplicableLabel(locale),
      ]);
    }

    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();
    await clearQueuedNotifications(page);
    await study.click();
    await expect(page.getByTestId("space-survey-status")).toHaveText(
      spaceText(locale, "surveyStudying"),
    );
    await expect(page.getByTestId("space-feedback")).toHaveText(
      spaceText(locale, "feedbackSurveyStarted"),
    );

    const remainingMs = await page.evaluate((timerId) => {
      const timer = window.miaplacidusTest!.getState().run.timers[timerId];
      if (!timer) throw new Error("Star Study timer should be active");
      return Math.max(0, timer.durationMs - timer.elapsedMs);
    }, STAR_STUDY_TIMER_ID);
    const hydrogenTab = page.locator("#tab-hydrogen");
    await hydrogenTab.click();
    await page.evaluate((duration) => window.miaplacidusTest!.advanceBy(duration + 1), remainingMs);
    await expect(hydrogenTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: spaceNotificationText(locale, "starStudyComplete") }),
    ).toHaveText(spaceNotificationText(locale, "starStudyComplete"));
  }
});

test("Asteroid scan result feedback and discovery state use all locales @p45-space-mining-copy", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await startSpaceFixture(page, "space-telescope", locale);
    await clearQueuedNotifications(page);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();

    const telescope = page.getByRole("region", { name: spaceText(locale, "telescopeTitle") });
    const buildTelescope = telescope.getByRole("button", {
      name: spaceText(locale, "telescopeBuild"),
      exact: true,
    });
    if (await buildTelescope.isVisible()) await buildTelescope.click();
    await clearQueuedNotifications(page);
    await expect(
      telescope.getByRole("button", { name: spaceText(locale, "scanAsteroids"), exact: true }),
    ).toBeEnabled();

    const before = await page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        asteroidIds: state.run.space.asteroids.map((asteroid) => asteroid.id),
        lifetimeAsteroidsDiscovered: state.statistics.lifetimeAsteroidsDiscovered,
      };
    });
    await telescope
      .getByRole("button", {
        name: spaceText(locale, "scanAsteroids"),
        exact: true,
      })
      .click();
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
      .toBe("asteroids");

    const remainingMs = await page.evaluate((timerId) => {
      const timer = window.miaplacidusTest!.getState().run.timers[timerId];
      if (!timer) throw new Error("Asteroid scan timer should be active");
      return Math.max(0, timer.durationMs - timer.elapsedMs);
    }, ASTEROID_SCAN_TIMER_ID);
    await page.locator("#tab-hydrogen").click();
    await page.evaluate((duration) => window.miaplacidusTest!.advanceBy(duration + 1), remainingMs);
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
      .toBeNull();

    const result = await page.evaluate((previousIds) => {
      const state = window.miaplacidusTest!.getState();
      const discovered = state.run.space.asteroids.find(
        (asteroid) => !previousIds.includes(asteroid.id),
      );
      return {
        discovered: discovered
          ? { id: discovered.id, name: discovered.name, rarity: discovered.rarity }
          : null,
        asteroidCount: state.run.space.asteroids.length,
        lifetimeAsteroidsDiscovered: state.statistics.lifetimeAsteroidsDiscovered,
      };
    }, before.asteroidIds);

    const notificationText = result.discovered
      ? spaceNotificationText(
          locale,
          result.discovered.rarity === "legendary"
            ? "legendaryAsteroidDiscovered"
            : "asteroidDiscovered",
          { asteroid: result.discovered.name },
        )
      : spaceNotificationText(locale, "asteroidScanMissed");
    if (result.discovered) {
      expect(result.asteroidCount).toBe(before.asteroidIds.length + 1);
      expect(result.lifetimeAsteroidsDiscovered).toBe(before.lifetimeAsteroidsDiscovered + 1);
    } else {
      expect(result.asteroidCount).toBe(before.asteroidIds.length);
      expect(result.lifetimeAsteroidsDiscovered).toBe(before.lifetimeAsteroidsDiscovered);
    }

    await page.locator("#tab-space-mining").click();
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: notificationText }),
    ).toHaveText(notificationText);
  }
});

test("Asteroid selection and zero-rate Mining warning use all locales @p45-space-mining-copy", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await startSpaceFixture(page, "space-asteroid-mining", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-asteroids").click();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const asteroid = state.run.space.asteroids[1];
    expect(asteroid).toBeDefined();
    const selectAsteroid = page.getByTestId(`asteroid-${asteroid!.id}`).getByRole("button");
    await selectAsteroid.click();
    await expect(selectAsteroid).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("space-feedback")).toHaveText(
      spaceText(locale, "feedbackAsteroidSelected", { name: asteroid!.name }),
    );

    await startSpaceFixture(page, "space-late-game", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-mining").click();
    const boost = page.getByTestId("antimatter-boost");
    await expect(boost).toBeDisabled();
    await expect(boost).toHaveAttribute("aria-describedby", "antimatter-boost-reason");
    await expect(page.getByTestId("antimatter-boost-reason")).toHaveText(
      spaceText(locale, "reasonAntimatterBoostUnavailable"),
    );
  }
});

test("Built Rocket fuel and launch status, reasons, and ready notice use all locales @p45-space-mining-copy", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await startSpaceFixture(page, "space-rocket-fuel-pump", locale);
    await clearQueuedNotifications(page);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();

    const rocket = page.getByTestId("rocket-card-rocket1");
    const rocketLabel = rocketText(locale, "rocketLabel", { index: 1 });
    await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText(
      rocketLabel,
    );
    await expect(
      rocket.getByRole("heading", {
        name: localizedRocketUserName(locale, "Rocket 1"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(rocket.locator(".status-pill")).toHaveText(rocketText(locale, "readyForRefuel"));
    const launch = rocket.getByRole("button", { name: rocketText(locale, "launch"), exact: true });
    await expect(launch).toBeDisabled();
    await expect(launch).toHaveAttribute("aria-describedby", "rocket-rocket1-launch-reason");
    await expect(page.locator("#rocket-rocket1-launch-reason")).toHaveText(
      rocketText(locale, "reasonFuelEmpty"),
    );

    const buyPump = rocket.getByRole("button", {
      name: rocketText(locale, "buyPump"),
      exact: true,
    });
    await expect(buyPump).toBeEnabled();
    await buyPump.click();
    await expect
      .poll(() =>
        page.evaluate(
          () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelPumpPurchased,
        ),
      )
      .toBe(true);
    const pauseFueling = rocket.getByRole("button", {
      name: rocketText(locale, "pauseFueling"),
      exact: true,
    });
    await expect(pauseFueling).toHaveAttribute("aria-pressed", "true");

    await page.locator("#tab-energy").click();
    await page.locator("#tab-energy-power").click();
    const powerSwitch = page.locator("#panel-energy .energy-master-switch");
    await expect(powerSwitch).toHaveText(economyLabel(locale, "deactivatePower"));
    await powerSwitch.click();
    await expect(powerSwitch).toHaveText(economyLabel(locale, "activatePower"));
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();

    const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");
    await expect(fuelEta).toHaveText(rocketText(locale, "reasonNoGrid"));
    await pauseFueling.click();
    await expect(
      rocket.getByRole("button", { name: rocketText(locale, "startFueling") }),
    ).toBeDisabled();
    await expect(fuelEta).toHaveText(rocketText(locale, "fuelingPaused"));
    await expect(page.locator("#rocket-rocket1-fueling-reason")).toHaveText(
      rocketText(locale, "reasonNoGrid"),
    );

    await page.locator("#tab-energy").click();
    await page.locator("#tab-energy-power").click();
    await powerSwitch.click();
    await expect(powerSwitch).toHaveText(economyLabel(locale, "deactivatePower"));
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();
    const startFueling = rocket.getByRole("button", {
      name: rocketText(locale, "startFueling"),
      exact: true,
    });
    await expect(startFueling).toBeEnabled();
    await startFueling.click();
    await expect(
      rocket.getByRole("button", { name: rocketText(locale, "pauseFueling"), exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await clearQueuedNotifications(page);
    const fuelEtaMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
    expect(fuelEtaMs).toBeGreaterThan(0);

    const hydrogenTab = page.locator("#tab-hydrogen");
    await hydrogenTab.click();
    await page.evaluate((duration) => window.miaplacidusTest!.advanceBy(duration + 1), fuelEtaMs);
    const rocketName = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.name,
    );
    const readyNotice = spaceNotificationText(locale, "rocketFuelReady", {
      rocket: localizedRocketUserName(locale, rocketName),
    });
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: readyNotice }),
    ).toHaveText(readyNotice);
    await expect(hydrogenTab).toHaveAttribute("aria-selected", "true");

    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();
    await expect(rocket.locator(".status-pill")).toHaveText(rocketText(locale, "readyForLaunch"));
    await expect(
      rocket.getByRole("progressbar", { name: rocketText(locale, "fuelLevel") }),
    ).toBeVisible();
    await expect(
      rocket.getByRole("button", { name: rocketText(locale, "launch"), exact: true }),
    ).toBeVisible();
  }
});
