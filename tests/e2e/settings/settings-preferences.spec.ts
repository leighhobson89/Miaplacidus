import { expect, test } from "../_harness/fixtures";
import {
  openSaveManager,
  resumeSavedPioneer,
  saveNowFromSettings,
} from "../_harness/save-controls";

test("visual and audio preferences affect the UI and persist with their save @settings @audio @visual", async ({
  freshGame,
}) => {
  const frame = freshGame.locator(".game-frame");
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");

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

test("audio and visual preferences restore independently for each local pioneer @settings @audio @visual @save-slots", async ({
  freshGame,
}) => {
  const pioneerA = "Hydrogen Pioneer";
  const pioneerB = "Hydrogen Pioneer B";
  const settings = freshGame.getByTestId("settings-pane");
  const frame = freshGame.locator(".game-frame");

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
  const pioneerAManager = freshGame.getByRole("dialog", { name: pioneerA });
  await pioneerAManager.getByLabel("New pioneer name").nth(1).fill(pioneerB);
  await pioneerAManager.getByRole("button", { name: "Save run as a new pioneer" }).click();
  await expect(freshGame.getByRole("dialog")).toHaveCount(0);
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
    .getByRole("dialog", { name: pioneerB })
    .locator(".slot-select")
    .filter({ hasText: pioneerA })
    .click();
  await resumeSavedPioneer(freshGame, pioneerA);
  await expect(freshGame.locator(".run-name")).toHaveText(pioneerA);
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
    .getByRole("dialog", { name: pioneerA })
    .locator(".slot-select")
    .filter({ hasText: pioneerB })
    .click();
  await resumeSavedPioneer(freshGame, pioneerB);
  await expect(freshGame.locator(".run-name")).toHaveText(pioneerB);
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
