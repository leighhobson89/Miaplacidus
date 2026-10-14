import { expect, test } from "../_harness/fixtures";
import type { Page } from "@playwright/test";
import {
  openSaveManager,
  resumeSavedPioneer,
  saveNowFromSettings,
} from "../_harness/save-controls";

type AudioMockMode = "resolve" | "reject";

interface AudioMockAttempt {
  readonly src: string;
  readonly volume: number;
}

interface AudioMockState {
  readonly attempts: AudioMockAttempt[];
  readonly unhandledRejections: string[];
}

interface NativeAudioPlaybackState {
  readonly instances: number;
  readonly attempts: number;
  readonly started: number;
  readonly failures: string[];
}

async function startAudioMockedGame(page: Page, mode: AudioMockMode): Promise<void> {
  await page.addInitScript((playbackMode: AudioMockMode) => {
    const appPrefix = "miaplacidus:v1:";
    const clearedFlag = "miaplacidus:test:fresh-game-cleared";
    if (sessionStorage.getItem(clearedFlag) !== "1") {
      for (const storage of [localStorage, sessionStorage]) {
        const appKeys = Array.from({ length: storage.length }, (_, index) =>
          storage.key(index),
        ).filter((key): key is string => key?.startsWith(appPrefix) ?? false);
        for (const key of appKeys) storage.removeItem(key);
      }
      sessionStorage.setItem(clearedFlag, "1");
    }

    const audioState = { attempts: [] as AudioMockAttempt[], unhandledRejections: [] as string[] };
    class MockAudio {
      loop = false;
      preload = "none";
      volume = 1;
      currentTime = 0;
      paused = true;

      constructor(readonly src: string) {}

      addEventListener(): void {}

      play(): Promise<void> {
        audioState.attempts.push({ src: this.src, volume: this.volume });
        if (playbackMode === "reject") {
          return Promise.reject(new Error("Mock autoplay rejection"));
        }
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
    Object.defineProperty(window, "__miaplacidusAudioMock", {
      configurable: true,
      value: audioState,
    });
    window.addEventListener("unhandledrejection", (event) => {
      audioState.unhandledRejections.push(String(event.reason));
    });
  }, mode);

  await page.goto("/?testSeed=314159&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Hydrogen Pioneer");
  await page.getByTestId("start-game").click();
  await expect(
    page.getByRole("heading", { name: "Hydrogen", exact: true, level: 2 }),
  ).toBeVisible();
  await expect
    .poll(async () => page.evaluate(() => window.miaplacidusTest?.getState().run.clock.wallNowMs))
    .not.toBeNull();
}

async function readAudioMock(page: Page): Promise<AudioMockState> {
  return page.evaluate(() => {
    const harness = window as Window & { __miaplacidusAudioMock?: AudioMockState };
    return harness.__miaplacidusAudioMock ?? { attempts: [], unhandledRejections: [] };
  });
}

async function readNativeAudioPlayback(page: Page): Promise<NativeAudioPlaybackState> {
  return page.evaluate(() => {
    const harness = window as Window & {
      __miaplacidusNativeAudioPlayback?: NativeAudioPlaybackState;
    };
    return (
      harness.__miaplacidusNativeAudioPlayback ?? {
        instances: 0,
        attempts: 0,
        started: 0,
        failures: [],
      }
    );
  });
}

async function startNativeAudioGame(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const appPrefix = "miaplacidus:v1:";
    const clearedFlag = "miaplacidus:test:fresh-game-cleared";
    if (sessionStorage.getItem(clearedFlag) !== "1") {
      for (const storage of [localStorage, sessionStorage]) {
        const appKeys = Array.from({ length: storage.length }, (_, index) =>
          storage.key(index),
        ).filter((key): key is string => key?.startsWith(appPrefix) ?? false);
        for (const key of appKeys) storage.removeItem(key);
      }
      sessionStorage.setItem(clearedFlag, "1");
    }

    const playback = { instances: 0, attempts: 0, started: 0, failures: [] as string[] };
    const NativeAudio = window.Audio;
    class MutedObservedAudio extends NativeAudio {
      constructor(src?: string) {
        super(src);
        playback.instances += 1;
        this.muted = true;
      }

      play(): Promise<void> {
        playback.attempts += 1;
        this.addEventListener("playing", () => playback.started++, { once: true });
        try {
          return super.play().catch((error: unknown) => {
            playback.failures.push(String(error));
            throw error;
          });
        } catch (error) {
          playback.failures.push(String(error));
          return Promise.reject(error);
        }
      }
    }

    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: MutedObservedAudio,
    });
    Object.defineProperty(window, "__miaplacidusNativeAudioPlayback", {
      configurable: true,
      value: playback,
    });
  });

  await page.goto("/?testSeed=314159&testLocale=en");
}

test("visual and audio preferences affect the UI and persist with their save @settings @audio @visual", async ({
  freshGame,
}) => {
  const frame = freshGame.locator(".game-frame:not(.notification-portal)");
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await expect(settings.locator("#settings-notation")).toHaveValue("condensed");
  await expect(settings.locator("#settings-notation option:checked")).toHaveText("Condensed");

  await expect(frame).toHaveAttribute("data-custom-pointer", "true");
  expect(await frame.evaluate((element) => getComputedStyle(element).cursor)).toContain(
    "data:image/svg+xml",
  );
  await settings.locator("#settings-custom-pointer").uncheck();
  await expect(frame).toHaveAttribute("data-custom-pointer", "false");
  await settings.locator("#settings-pointer-trail").check();
  await freshGame.evaluate(() => {
    window.dispatchEvent(
      new PointerEvent("pointermove", { pointerType: "mouse", clientX: 60, clientY: 70 }),
    );
  });
  await expect(freshGame.locator(".pointer-trail-particle").first()).toBeAttached();
  await settings.locator("#settings-weather-effects").uncheck();
  await expect(frame).toHaveAttribute("data-weather-effects", "off");
  await settings.locator("#settings-weather-effects").check();
  await expect(frame).not.toHaveAttribute("data-weather-effects", "off");
  await freshGame.setViewportSize({ width: 390, height: 844 });
  expect(await freshGame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    390,
  );

  await settings.locator("#tab-settings-game-options").click();
  await settings.locator("#settings-background-audio").check();
  await settings.locator("#settings-sound-effects").check();
  const backgroundVolume = settings.locator("#settings-background-volume");
  await backgroundVolume.focus();
  await backgroundVolume.press("End");
  const effectsVolume = settings.locator("#settings-sound-effects-volume");
  await effectsVolume.focus();
  await effectsVolume.press("Home");
  expect(await freshGame.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    390,
  );

  await settings.locator("#tab-settings-saves").click();
  await settings.getByTestId("save-now").click();
  await expect(settings.getByTestId("save-status")).toContainText("Saved");
  await freshGame.reload();
  await expect(freshGame.getByTestId("start-game")).toBeVisible();
  await freshGame.getByTestId("start-game").click();
  await expect(freshGame.locator(".game-header")).toBeVisible();
  await expect
    .poll(() => freshGame.evaluate(() => typeof window.miaplacidusTest?.getState === "function"))
    .toBe(true);

  const restoredSettings = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().settings,
  );
  expect(restoredSettings).toMatchObject({
    backgroundAudioEnabled: true,
    soundEffectsEnabled: true,
    backgroundAudioVolume: 1,
    soundEffectsVolume: 0,
    customPointerEnabled: false,
    pointerTrailEnabled: true,
    weatherEffectsEnabled: true,
    notation: "condensed",
  });
  await expect(frame).toHaveAttribute("data-custom-pointer", "false");
});

test("background audio can be off while active sound effects continue @settings @audio", async ({
  freshGame,
}) => {
  await freshGame.evaluate(() => {
    const instances: Array<{ paused: boolean; pauseCount: number }> = [];
    class MockAudio {
      readonly src: string;
      loop = false;
      preload = "none";
      volume = 1;
      currentTime = 0;
      paused = true;
      pauseCount = 0;

      constructor(src: string) {
        this.src = src;
        instances.push(this);
      }

      addEventListener(): void {}

      play(): Promise<void> {
        this.paused = false;
        return Promise.resolve();
      }

      pause(): void {
        this.pauseCount += 1;
        this.paused = true;
      }
    }

    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: MockAudio,
    });
    Object.defineProperty(window, "__miaplacidusAudioMocks", {
      configurable: true,
      value: instances,
    });
  });

  await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { backgroundAudioEnabled: false, soundEffectsEnabled: true },
    }),
  );
  const firstEffect = async () =>
    freshGame.evaluate(() => {
      const harness = window as Window & {
        __miaplacidusAudioMocks?: Array<{ paused: boolean; pauseCount: number }>;
      };
      return harness.__miaplacidusAudioMocks?.[0] ?? null;
    });
  await expect.poll(async () => (await firstEffect())?.paused).toBe(false);

  await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notation: "scientific" },
    }),
  );
  await expect.poll(async () => (await firstEffect())?.pauseCount).toBe(0);

  await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: false },
    }),
  );
  await expect.poll(async () => (await firstEffect())?.pauseCount).toBe(1);
});

test("the Settings sound effects slider changes cue output volume @settings @audio @audio-output", async ({
  page,
  browserErrors,
}) => {
  await startAudioMockedGame(page, "resolve");
  await page.locator("#tab-settings").click();
  const settings = page.getByTestId("settings-pane");
  await settings.locator("#tab-settings-game-options").click();
  await settings.locator("#settings-sound-effects").check();

  await expect.poll(async () => (await readAudioMock(page)).attempts.length).toBeGreaterThan(0);
  const initialAttempt = (await readAudioMock(page)).attempts.at(-1);
  expect(initialAttempt).toMatchObject({
    src: expect.stringContaining("clickSwitch.mp3"),
    volume: 0.5,
  });

  const volume = settings.locator("#settings-sound-effects-volume");
  await volume.focus();
  await volume.press("Home");
  for (let step = 0; step < 5; step += 1) await volume.press("ArrowRight");
  await expect(volume).toHaveValue("0.25");
  await expect.poll(async () => (await readAudioMock(page)).attempts.at(-1)?.volume).toBe(0.25);

  const attempts = (await readAudioMock(page)).attempts;
  expect(attempts.at(-1)).toMatchObject({
    src: expect.stringContaining("clickSwitch.mp3"),
    volume: 0.25,
  });
  expect(browserErrors).toEqual([]);
});

test("rejected Audio playback fails silently and keeps Settings usable @settings @audio @audio-silent-fallback", async ({
  page,
  browserErrors,
}) => {
  await startAudioMockedGame(page, "reject");
  await page.locator("#tab-settings").click();
  const settings = page.getByTestId("settings-pane");
  await settings.locator("#tab-settings-game-options").click();
  await settings.locator("#settings-sound-effects").check();

  await expect.poll(async () => (await readAudioMock(page)).attempts.length).toBeGreaterThan(0);
  await expect(settings.locator("#settings-sound-effects")).toBeChecked();
  await expect.poll(async () => (await readAudioMock(page)).unhandledRejections).toEqual([]);
  const soundEffectsEnabled = await page.evaluate(
    () => window.miaplacidusTest!.getState().settings.soundEffectsEnabled,
  );
  expect(soundEffectsEnabled).toBe(true);
  expect(browserErrors).toEqual([]);
});

test("native audio starts only after an in-game user action @settings @audio @audio-native", async ({
  page,
  browserErrors,
}) => {
  await startNativeAudioGame(page);
  await expect.poll(async () => (await readNativeAudioPlayback(page)).instances).toBe(0);
  await page.getByLabel("Pioneer name").fill("Hydrogen Pioneer");
  await expect.poll(async () => (await readNativeAudioPlayback(page)).instances).toBe(0);

  await page.getByTestId("start-game").click();
  await expect(
    page.getByRole("heading", { name: "Hydrogen", exact: true, level: 2 }),
  ).toBeVisible();
  await page.locator("#tab-settings").click();
  const settings = page.getByTestId("settings-pane");
  await settings.locator("#tab-settings-game-options").click();
  await settings.locator("#settings-sound-effects").check();
  await page.locator("#tab-hydrogen").click();

  await expect.poll(async () => (await readNativeAudioPlayback(page)).attempts).toBeGreaterThan(0);
  await expect.poll(async () => (await readNativeAudioPlayback(page)).started).toBeGreaterThan(0);
  expect((await readNativeAudioPlayback(page)).failures).toEqual([]);
  expect(browserErrors).toEqual([]);
});

test("main and child navigation play the source click cue @settings @audio", async ({
  freshGame,
}) => {
  await freshGame.evaluate(() => {
    const sources: string[] = [];
    class MockAudio {
      loop = false;
      preload = "none";
      volume = 1;
      currentTime = 0;
      paused = true;

      constructor(readonly src: string) {
        sources.push(src);
      }

      addEventListener(): void {}

      play(): Promise<void> {
        this.paused = false;
        return Promise.resolve();
      }

      pause(): void {
        this.paused = true;
      }
    }

    const harness = window as Window & { __navigationAudioSources?: string[] };
    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: MockAudio,
    });
    harness.__navigationAudioSources = sources;
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    sources.length = 0;
  });

  const sources = () =>
    freshGame.evaluate(
      () => (window as Window & { __navigationAudioSources?: string[] }).__navigationAudioSources,
    );
  await freshGame.locator("#tab-research").click();
  await expect(freshGame.locator("#tab-research")).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(sources)
    .toEqual(expect.arrayContaining([expect.stringContaining("clickButton.mp3")]));

  await freshGame.evaluate(() => {
    (window as Window & { __navigationAudioSources?: string[] }).__navigationAudioSources!.length =
      0;
  });
  await freshGame.locator("#tab-settings").click();
  await expect(freshGame.locator("#tab-settings")).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(sources)
    .toEqual(expect.arrayContaining([expect.stringContaining("clickButton.mp3")]));

  await freshGame.evaluate(() => {
    (window as Window & { __navigationAudioSources?: string[] }).__navigationAudioSources!.length =
      0;
  });
  await freshGame.locator("#tab-settings-game-options").click();
  await expect
    .poll(sources)
    .toEqual(expect.arrayContaining([expect.stringContaining("clickButton.mp3")]));
});

test("collapsibles and native selects play the source swipe cue @settings @audio", async ({
  freshGame,
}) => {
  await freshGame.evaluate(() => {
    const sources: string[] = [];
    class MockAudio {
      loop = false;
      preload = "none";
      volume = 1;
      currentTime = 0;
      paused = true;

      constructor(readonly src: string) {
        sources.push(src);
      }

      addEventListener(): void {}

      play(): Promise<void> {
        this.paused = false;
        return Promise.resolve();
      }

      pause(): void {
        this.paused = true;
      }
    }

    const harness = window as Window & { __swipeAudioSources?: string[] };
    Object.defineProperty(window, "Audio", {
      configurable: true,
      writable: true,
      value: MockAudio,
    });
    harness.__swipeAudioSources = sources;
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    sources.length = 0;
  });

  const sources = () =>
    freshGame.evaluate(
      () => (window as Window & { __swipeAudioSources?: string[] }).__swipeAudioSources ?? [],
    );
  const clearSources = () =>
    freshGame.evaluate(() => {
      (window as Window & { __swipeAudioSources?: string[] }).__swipeAudioSources!.length = 0;
    });

  await freshGame.locator(".hydrogen-autobuyer-section > summary").click();
  await expect
    .poll(sources)
    .toEqual(expect.arrayContaining([expect.stringContaining("clickSwitch.mp3")]));

  await freshGame.locator("#tab-settings").click();
  await freshGame.locator("#tab-settings-visual").click();
  await clearSources();
  await freshGame.locator("#settings-notation").click();
  await expect
    .poll(sources)
    .toEqual(expect.arrayContaining([expect.stringContaining("clickSwitch.mp3")]));
  expect(await sources()).toHaveLength(1);

  await clearSources();
  await freshGame.locator("#settings-notation").selectOption("standard");
  await expect
    .poll(sources)
    .toEqual(expect.arrayContaining([expect.stringContaining("clickButton.mp3")]));
  expect(await sources()).toHaveLength(1);
});

test("audio and visual preferences restore independently for each local pioneer @settings @audio @visual @save-slots", async ({
  freshGame,
}) => {
  const pioneerA = "Hydrogen Pioneer";
  const pioneerB = "Hydrogen Pioneer B";
  const settings = freshGame.getByTestId("settings-pane");
  const frame = freshGame.locator(".game-frame:not(.notification-portal)");

  await freshGame.locator("#tab-settings").click();
  await settings.locator("#tab-settings-visual").click();
  await settings.locator("#settings-custom-pointer").uncheck();
  await settings.locator("#settings-pointer-trail").check();
  await settings.locator("#settings-weather-effects").check();
  await settings.locator("#tab-settings-game-options").click();
  await settings.locator("#settings-background-audio").check();
  await settings.locator("#settings-sound-effects").uncheck();
  await saveNowFromSettings(freshGame);

  await openSaveManager(freshGame);
  const pioneerAManager = freshGame.getByTestId("save-manager-inline");
  await pioneerAManager.locator("#save-copy-name").fill(pioneerB);
  await pioneerAManager.getByRole("button", { name: "Save run as a new pioneer" }).click();
  await expect(freshGame.getByRole("dialog", { name: pioneerB, exact: true })).toHaveCount(0);
  await expect(freshGame.locator(".run-name")).toHaveText(pioneerB);

  await freshGame.locator("#tab-settings").click();
  await settings.locator("#tab-settings-visual").click();
  await settings.locator("#settings-custom-pointer").check();
  await settings.locator("#settings-pointer-trail").uncheck();
  await settings.locator("#settings-weather-effects").uncheck();
  await settings.locator("#tab-settings-game-options").click();
  await settings.locator("#settings-background-audio").uncheck();
  await settings.locator("#settings-sound-effects").check();
  await saveNowFromSettings(freshGame);

  await openSaveManager(freshGame);
  await freshGame
    .getByTestId("save-manager-inline")
    .locator(".slot-select")
    .filter({ hasText: pioneerA })
    .click();
  await resumeSavedPioneer(freshGame, pioneerA);
  await expect(freshGame.locator(".run-name")).toHaveText(pioneerA);
  await expect
    .poll(() => freshGame.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
  const settingsA = await freshGame.evaluate(() => {
    const {
      backgroundAudioEnabled,
      soundEffectsEnabled,
      customPointerEnabled,
      pointerTrailEnabled,
      weatherEffectsEnabled,
    } = window.miaplacidusTest!.getState().settings;
    return {
      backgroundAudioEnabled,
      soundEffectsEnabled,
      customPointerEnabled,
      pointerTrailEnabled,
      weatherEffectsEnabled,
    };
  });
  expect(settingsA).toEqual({
    backgroundAudioEnabled: true,
    soundEffectsEnabled: false,
    customPointerEnabled: false,
    pointerTrailEnabled: true,
    weatherEffectsEnabled: true,
  });
  await freshGame.locator("#tab-settings").click();
  await settings.locator("#tab-settings-game-options").click();
  await expect(settings.locator("#settings-background-audio")).toBeChecked();
  await expect(settings.locator("#settings-sound-effects")).not.toBeChecked();
  await settings.locator("#tab-settings-visual").click();
  await expect(settings.locator("#settings-custom-pointer")).not.toBeChecked();
  await expect(settings.locator("#settings-pointer-trail")).toBeChecked();
  await expect(settings.locator("#settings-weather-effects")).toBeChecked();
  await expect(frame).toHaveAttribute("data-custom-pointer", "false");

  await openSaveManager(freshGame);
  await freshGame
    .getByTestId("save-manager-inline")
    .locator(".slot-select")
    .filter({ hasText: pioneerB })
    .click();
  await resumeSavedPioneer(freshGame, pioneerB);
  await expect(freshGame.locator(".run-name")).toHaveText(pioneerB);
  await expect
    .poll(() => freshGame.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
  const settingsB = await freshGame.evaluate(() => {
    const {
      backgroundAudioEnabled,
      soundEffectsEnabled,
      customPointerEnabled,
      pointerTrailEnabled,
      weatherEffectsEnabled,
    } = window.miaplacidusTest!.getState().settings;
    return {
      backgroundAudioEnabled,
      soundEffectsEnabled,
      customPointerEnabled,
      pointerTrailEnabled,
      weatherEffectsEnabled,
    };
  });
  expect(settingsB).toEqual({
    backgroundAudioEnabled: false,
    soundEffectsEnabled: true,
    customPointerEnabled: true,
    pointerTrailEnabled: false,
    weatherEffectsEnabled: false,
  });
  await freshGame.locator("#tab-settings").click();
  await settings.locator("#tab-settings-game-options").click();
  await expect(settings.locator("#settings-background-audio")).not.toBeChecked();
  await expect(settings.locator("#settings-sound-effects")).toBeChecked();
  await settings.locator("#tab-settings-visual").click();
  await expect(settings.locator("#settings-custom-pointer")).toBeChecked();
  await expect(settings.locator("#settings-pointer-trail")).not.toBeChecked();
  await expect(settings.locator("#settings-weather-effects")).not.toBeChecked();
  await expect(frame).toHaveAttribute("data-custom-pointer", "true");
  await expect(frame).toHaveAttribute("data-weather-effects", "off");
});
