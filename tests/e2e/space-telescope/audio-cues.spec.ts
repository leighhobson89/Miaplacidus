import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";

type SpaceAudioFixture =
  | "space-telescope"
  | "space-asteroid-mining"
  | "space-rocket-fuel-pump"
  | "space-returning-rocket"
  | "space-voidborn-pillage";

async function startAudioFixture(
  page: Page,
  fixture: SpaceAudioFixture,
  pioneer: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) {
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }

    const sources: string[] = [];
    class MockAudio {
      loop = false;
      preload = "none";
      volume = 1;
      currentTime = 0;
      paused = true;

      constructor(readonly src: string) {}

      addEventListener(): void {}

      play(): Promise<void> {
        sources.push(this.src);
        this.paused = false;
        return Promise.resolve();
      }

      pause(): void {
        this.paused = true;
      }
    }

    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: MockAudio,
    });
    (window as Window & { __spaceAudioSources?: string[] }).__spaceAudioSources = sources;
  });

  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    (window as Window & { __spaceAudioSources?: string[] }).__spaceAudioSources!.length = 0;
  });
}

async function cueFiles(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    (window as Window & { __spaceAudioSources?: string[] }).__spaceAudioSources!.map((source) =>
      source.split("/").at(-1)!,
    ),
  );
}

async function clearCues(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as Window & { __spaceAudioSources?: string[] }).__spaceAudioSources!.length = 0;
  });
}

async function expectCues(page: Page, expected: readonly string[]): Promise<void> {
  await expect.poll(() => cueFiles(page)).toEqual(expected);
}

async function expectNoRocketTravelCue(page: Page): Promise<void> {
  const cues = await cueFiles(page);
  expect(cues.filter((cue) => cue !== "eventAlarm.mp3")).toEqual([]);
}

test("telescope build, asteroid search, and star study play their source cues @space-telescope @audio @p29-audio-space", async ({
  page,
}) => {
  await startAudioFixture(page, "space-telescope", "Audio Telescope Pioneer");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();

  await clearCues(page);
  await page.getByRole("button", { name: "Build telescope", exact: true }).click();
  await expectCues(page, ["clickButton.mp3", "buildTelescope.mp3"]);

  await clearCues(page);
  await page.getByRole("button", { name: "Scan for asteroids", exact: true }).click();
  await expectCues(page, ["clickButton.mp3", "asteroidScan.mp3"]);
  const scanRemainingMs = await page.evaluate(() => {
    const timer = window.miaplacidusTest!.getState().run.timers["survey:asteroid-scan"]!;
    return timer.durationMs - timer.elapsedMs;
  });
  await clearCues(page);
  await page.evaluate((remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1), scanRemainingMs);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBeNull();
  await expectCues(page, []);

  await page.getByRole("button", { name: "Study stars", exact: true }).click();
  await expectCues(page, ["clickButton.mp3", "starStudy.mp3"]);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("stars");
});

test("launch pad construction pairs its generic and dedicated cues @space-telescope @audio @p29-audio-space", async ({
  page,
}) => {
  await startAudioFixture(page, "space-telescope", "Audio Launch Pad Pioneer");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();
  const buildLaunchPad = page.getByRole("button", { name: /^Build launch pad$/i });
  await expect(buildLaunchPad).toBeEnabled();

  await clearCues(page);
  await buildLaunchPad.click();
  await expectCues(page, ["clickButton.mp3", "buildLaunchPad.mp3"]);
});

test("Void Pillage uses the Cosmic Forge star-study cue @space-telescope @audio @p29-audio-space", async ({
  page,
}) => {
  await startAudioFixture(page, "space-voidborn-pillage", "Audio Voidborn Pioneer");
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.philosophyId).toBe("voidborn");
  expect(state.run.philosophyAbilityActive).toBe(true);

  await clearCues(page);
  await page.getByRole("button", { name: "Pillage the Void", exact: true }).click();
  await expectCues(page, ["clickButton.mp3", "starStudy.mp3"]);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("pillageVoid");
});

test("the visible antimatter hold control starts the loop and stops silently on release @space-telescope @audio @p29-audio-space", async ({
  page,
}) => {
  await startAudioFixture(page, "space-asteroid-mining", "Audio Antimatter Pioneer");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-mining").click();

  const boost = page.getByTestId("antimatter-boost");
  await expect(boost).toBeEnabled();
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterBoostActive),
  ).toBe(false);
  await clearCues(page);
  await boost.hover();
  await page.mouse.down();
  await expect(boost).toHaveAttribute("aria-pressed", "true");
  await expectCues(page, ["boostAntimatter.mp3"]);

  await page.mouse.up();
  await expect(boost).toHaveAttribute("aria-pressed", "false");
  await expectCues(page, ["boostAntimatter.mp3"]);
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterBoostActive),
  ).toBe(false);
});

test("rocket pump, launch, outbound travel and outbound arrival follow source cues @space-telescope @audio @p29-audio-space", async ({
  page,
}) => {
  await startAudioFixture(page, "space-rocket-fuel-pump", "Audio Rocket Pioneer");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  const rocket = page.getByTestId("rocket-card-rocket1");

  await clearCues(page);
  await rocket.getByRole("button", { name: "Buy fuel pump", exact: true }).click();
  await expectCues(page, ["clickButton.mp3", "fuelRocket.mp3"]);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(6_000_000));
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity),
    )
    .toBe(10_000);
  expect((await cueFiles(page)).filter((cue) => cue === "fuelRocket.mp3")).toEqual([
    "fuelRocket.mp3",
  ]);

  await page.keyboard.press("NumpadSubtract");
  const debugMenu = page.getByTestId("debug-scenario-menu");
  await expect(debugMenu).toBeVisible();
  await debugMenu.getByTestId("debug-action-clear-weather").click();
  await debugMenu.getByTestId("debug-action-add-10-asteroids").click();
  await debugMenu.getByRole("button", { name: "Close" }).click();

  await clearCues(page);
  await rocket.getByRole("button", { name: "Launch rocket", exact: true }).click();
  await expectCues(page, ["rocketLaunch.mp3"]);

  await page.locator("#tab-space-mining-asteroids").click();
  const target = await page.evaluate(() =>
    window
      .miaplacidusTest!.getState()
      .run.space.asteroids.find((asteroid) => !asteroid.depleted && asteroid.reservedBy === null),
  );
  expect(target).toBeDefined();
  await page.getByTestId(`asteroid-${target!.id}`).getByRole("button").click();
  await page.locator("#tab-space-mining-rocket-1").click();
  await clearCues(page);
  await rocket.getByRole("button", { name: "Travel to selected asteroid", exact: true }).click();
  await expectNoRocketTravelCue(page);

  const outboundRemainingMs = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const timer = state.run.timers[state.run.space.rockets.rocket1.timerId!]!;
    return timer.durationMs - timer.elapsedMs;
  });
  await page.evaluate((remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1), outboundRemainingMs);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("mining");
  await expectNoRocketTravelCue(page);
});

test("returning rocket arrival plays rocketLand @space-telescope @audio @p29-audio-space", async ({
  page,
}) => {
  await startAudioFixture(page, "space-returning-rocket", "Audio Returning Rocket Pioneer");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  const remainingMs = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const rocket = state.run.space.rockets.rocket1;
    const timer = state.run.timers[rocket.timerId!]!;
    return timer.durationMs - timer.elapsedMs;
  });
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase))
    .toBe("returning");

  await clearCues(page);
  await page.evaluate((durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1), remainingMs);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase))
    .toBe("ready");
  await expectCues(page, ["rocketLand.mp3"]);
});
