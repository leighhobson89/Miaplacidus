import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";

type AudioFixture =
  | "meta-market-ready"
  | "power-buildings"
  | "power-deficit"
  | "space-battle-victory";

type AudioMockState = {
  readonly src: string;
  readonly loop: boolean;
  readonly volume: number;
  readonly paused: boolean;
  readonly playCount: number;
  readonly pauseCount: number;
};

async function startAudioFixture(
  page: Page,
  fixture?: AudioFixture,
  configureAudioPreferences = true,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) {
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }

    const sources: string[] = [];
    const instances: MockAudio[] = [];
    class MockAudio {
      loop = false;
      preload = "none";
      volume = 1;
      currentTime = 0;
      paused = true;
      playCount = 0;
      pauseCount = 0;

      constructor(readonly src: string) {
        instances.push(this);
      }

      addEventListener(): void {}

      play(): Promise<void> {
        sources.push(this.src);
        this.paused = false;
        this.playCount += 1;
        return Promise.resolve();
      }

      pause(): void {
        this.paused = true;
        this.pauseCount += 1;
      }
    }

    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: MockAudio,
    });
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources = sources;
    (window as Window & { __p29AudioInstances?: MockAudio[] }).__p29AudioInstances = instances;
  });

  const fixtureQuery = fixture ? `&economyFixture=${fixture}` : "";
  await page.goto(`/?testSeed=20261003&testLocale=en${fixtureQuery}`);
  await page.getByLabel("Pioneer name").fill("Audio Route Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  if (configureAudioPreferences) {
    await page.evaluate(() => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
      });
      (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.length = 0;
    });
  }
}

async function clearAudioSources(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.length = 0;
  });
}

async function expectOnlyCue(page: Page, cue: string): Promise<void> {
  await expectCues(page, [cue]);
}

async function expectCues(page: Page, cues: string[]): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.map((source) =>
          source.split("/").at(-1),
        ),
      ),
    )
    .toEqual(cues);
}

async function readAudioInstances(page: Page): Promise<AudioMockState[]> {
  return page.evaluate(() =>
    ((window as Window & { __p29AudioInstances?: AudioMockState[] }).__p29AudioInstances ?? []).map(
      ({ src, loop, volume, paused, playCount, pauseCount }) => ({
        src,
        loop,
        volume,
        paused,
        playCount,
        pauseCount,
      }),
    ),
  );
}

async function readLoopTrack(page: Page, filename: string): Promise<AudioMockState | null> {
  return (await readAudioInstances(page)).find(
    (audio) => audio.loop && audio.src.includes(filename),
  ) ?? null;
}

test("sound effects toggle plays one switch cue before and after muting @settings @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioFixture(page, "power-buildings");
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-game-options").click();
  const soundEffects = page.locator("#settings-sound-effects");
  await expect(soundEffects).toBeChecked();

  await clearAudioSources(page);
  await soundEffects.uncheck();
  await expect(soundEffects).not.toBeChecked();
  await expectOnlyCue(page, "clickSwitch.mp3");
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().settings.soundEffectsEnabled),
  ).toBe(false);

  await clearAudioSources(page);
  await soundEffects.check();
  await expect(soundEffects).toBeChecked();
  await expectOnlyCue(page, "clickSwitch.mp3");
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().settings.soundEffectsEnabled),
  ).toBe(true);
});

test("generic UI categories keep click and swipe cues across keyboard activation @settings @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioFixture(page);

  const disabledSale = page.locator(".hydrogen-sale-controls .secondary-button");
  await expect(disabledSale).toBeDisabled();
  await clearAudioSources(page);
  await disabledSale.evaluate((button: HTMLButtonElement) => button.click());
  await expectCues(page, []);

  const disclosure = page.locator(".hydrogen-autobuyer-section > summary");
  await disclosure.focus();
  await clearAudioSources(page);
  await disclosure.press("Enter");
  await expect(page.locator(".hydrogen-autobuyer-section")).toHaveAttribute("open", "");
  await expectOnlyCue(page, "clickSwitch.mp3");

  const collect = page.locator(".collect-button");
  await collect.focus();
  await clearAudioSources(page);
  await collect.press("Enter");
  await expectOnlyCue(page, "clickButton.mp3");

  const settingsTab = page.locator("#tab-settings");
  await settingsTab.focus();
  await clearAudioSources(page);
  await settingsTab.press("Enter");
  await expect(settingsTab).toHaveAttribute("aria-selected", "true");
  await expectOnlyCue(page, "clickButton.mp3");

  const visualPaneTab = page.locator("#tab-settings-visual");
  await visualPaneTab.focus();
  await clearAudioSources(page);
  await visualPaneTab.press("Enter");
  await expectOnlyCue(page, "clickButton.mp3");

  const notation = page.locator("#settings-notation");
  await expect(notation).not.toHaveValue("standard");
  await notation.focus();
  await clearAudioSources(page);
  await notation.press("Enter");
  await expectOnlyCue(page, "clickSwitch.mp3");
  await page.keyboard.press("Escape");

  await clearAudioSources(page);
  await notation.selectOption("standard");
  await expectOnlyCue(page, "clickButton.mp3");
});

test("touch activation of a main tab plays one click cue @settings @audio @p29-audio-routes", async ({
  browser,
}) => {
  const port = process.env.MIAPLACIDUS_TEST_PORT ?? "4174";
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}`,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await startAudioFixture(page);
    await clearAudioSources(page);
    await page.locator("#tab-settings").tap();
    await expect(page.locator("#tab-settings")).toHaveAttribute("aria-selected", "true");
    await expectOnlyCue(page, "clickButton.mp3");
  } finally {
    await context.close();
  }
});

test("market trade, AP sale, and liquidation play the cash cue @settings @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioFixture(page, "meta-market-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  const market = page.getByRole("region", { name: "Galactic Market" });

  await market.getByLabel("You give").selectOption("hydrogen");
  await market.getByLabel("You receive").selectOption("helium");
  await market.getByLabel("Quantity to trade").fill("10");
  await clearAudioSources(page);
  await market.getByRole("button", { name: "Confirm trade", exact: true }).click();
  await expectCues(page, ["clickButton.mp3", "kaching.mp3"]);

  await market.getByLabel("AP to sell").selectOption("10");
  await clearAudioSources(page);
  await market.getByRole("button", { name: "Sell AP for cash", exact: true }).click();
  await expectCues(page, ["clickButton.mp3", "kaching.mp3"]);

  await clearAudioSources(page);
  await market.getByRole("button", { name: "Liquidate all assets", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm asset liquidation" });
  await expect(dialog).toBeVisible();
  await clearAudioSources(page);
  await dialog.getByRole("button", { name: "CONFIRM LIQUIDATION" }).click();
  await expectCues(page, ["clickButton.mp3", "kaching.mp3"]);
});

test("individual power plant toggle plays its power cue @settings @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioFixture(page, "power-buildings");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  const powerPlant = page.locator('[data-building-id="powerPlant1"]');
  await powerPlant.getByRole("button", { name: "Buy", exact: true }).click();
  const enabledControl = powerPlant.getByRole("checkbox", { name: "Power Plant" });
  await expect(enabledControl).toBeVisible();
  await expect(enabledControl).toBeChecked();

  await clearAudioSources(page);
  await enabledControl.uncheck();
  await expect(enabledControl).not.toBeChecked();
  await expectCues(page, ["clickButton.mp3", "powerOn.mp3"]);
});

test("grid trip and manual power recovery play the source-matched cues @settings @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioFixture(page, "power-deficit");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-summary").click();
  await page.getByRole("tab", { name: /Resources/ }).click();

  await clearAudioSources(page);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect(page.getByTestId("top-stat-power")).toContainText("TRIPPED");
  await expectCues(page, ["powerOff.mp3", "powerTripped.mp3"]);

  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  await clearAudioSources(page);
  await page.getByRole("button", { name: "DEACTIVATE POWER", exact: true }).click();
  await expectOnlyCue(page, "powerOff.mp3");

  await clearAudioSources(page);
  await page.getByRole("button", { name: "ACTIVATE POWER", exact: true }).click();
  await expectOnlyCue(page, "powerOn.mp3");
});

test("background audio gesture starts and switches weather loops, then pauses them when disabled @settings @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioFixture(page, undefined, false);
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().settings),
  ).toMatchObject({ backgroundAudioEnabled: false, soundEffectsEnabled: false });
  expect((await readAudioInstances(page)).filter((audio) => audio.loop)).toEqual([]);

  // Settings navigation and the checkbox are visible user gestures; background
  // audio remains disabled until the owner turns it on here.
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-game-options").click();
  const backgroundAudio = page.locator("#settings-background-audio");
  await expect(backgroundAudio).not.toBeChecked();
  await backgroundAudio.check();
  await expect(backgroundAudio).toBeChecked();
  await expect.poll(() => readLoopTrack(page, "bgAmbience.mp3")).toMatchObject({
    loop: true,
    volume: 0.5,
    paused: false,
    playCount: 1,
  });

  const setWeather = async (condition: "rain" | "volcano" | "clear") => {
    const result = await page.evaluate(
      (weather) =>
        window.miaplacidusTest!.dispatch({ type: "space.weather.set-condition", condition: weather }),
      condition,
    );
    expect(result).toBe(true);
  };

  await setWeather("rain");
  await expect.poll(() => readLoopTrack(page, "rainLoop.mp3")).toMatchObject({
    loop: true,
    volume: 0.3,
    paused: false,
    playCount: 1,
  });
  expect(await readLoopTrack(page, "bgAmbience.mp3")).toMatchObject({ paused: false, playCount: 1 });

  await setWeather("volcano");
  await expect.poll(() => readLoopTrack(page, "eruptionLoop.mp3")).toMatchObject({
    loop: true,
    volume: 0.3,
    paused: false,
    playCount: 1,
  });
  expect(await readLoopTrack(page, "rainLoop.mp3")).toMatchObject({ paused: true });
  expect(await readLoopTrack(page, "bgAmbience.mp3")).toMatchObject({ paused: false, playCount: 1 });

  await setWeather("clear");
  await expect.poll(() => readLoopTrack(page, "eruptionLoop.mp3")).toMatchObject({ paused: true });
  expect(await readLoopTrack(page, "rainLoop.mp3")).toMatchObject({ paused: true });
  expect(await readLoopTrack(page, "bgAmbience.mp3")).toMatchObject({ paused: false, playCount: 1 });

  await backgroundAudio.uncheck();
  await expect(backgroundAudio).not.toBeChecked();
  await expect
    .poll(async () => (await readAudioInstances(page)).filter((audio) => audio.loop).every((audio) => audio.paused))
    .toBe(true);
  expect(await page.evaluate(() => window.miaplacidusTest!.getState().settings)).toMatchObject({
    backgroundAudioEnabled: false,
    soundEffectsEnabled: false,
    backgroundAudioVolume: 0.5,
  });
});

test("settling a star system plays the settlement construction cue @settings @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioFixture(page, "space-battle-victory");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-colonise").click();
  const pane = page.getByTestId("starship-pane");
  await pane.getByRole("button", { name: "Enter war mode" }).click();
  await pane.getByTestId("starship-battle-engage-button").click();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const phase = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
    );
    if (phase !== "inProgress") break;
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  }
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("victory");

  const destinationId = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
  );
  await clearAudioSources(page);
  await pane.getByTestId("starship-settle-system-button").click();
  await expect(pane.getByTestId("starship-system-settled")).toBeVisible();
  await expectOnlyCue(page, "buildTelescope.mp3");
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().permanent.settledSystemIds),
  ).toContain(destinationId);
});
