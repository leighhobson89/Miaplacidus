import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";

async function startAudioStarshipFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);

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
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources = sources;
  });

  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("Starship Audio Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.length = 0;
  });
}

async function readCueNames(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.map((source) =>
      source.split("/").at(-1)!,
    ),
  );
}

async function expectOnlyCue(page: Page, cue: string): Promise<void> {
  await expect.poll(() => readCueNames(page)).toEqual([cue]);
}

test("Starship launch and arrival each play one source-matched cue @starship @audio @p29-audio-routes", async ({
  page,
}) => {
  await startAudioStarshipFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map.getByTestId("star-selection").getByRole("button", { name: "Set as destination" }).click();

  await page.locator("#tab-interstellar-starship").click();
  const pane = page.getByTestId("starship-pane");
  await pane.getByRole("button", { name: "Travel" }).click();
  const warning = page.getByRole("dialog", { name: "Warning: point of no return" });
  await expect(warning).toBeVisible();
  await page.evaluate(() => {
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.length = 0;
  });
  await warning.getByRole("button", { name: "Confirm launch" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");
  await expectOnlyCue(page, "starShipLaunch.mp3");

  const timerDuration = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return state.run.timers[state.run.space.starship.timerId!]!.durationMs;
  });
  await page.evaluate(() => {
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.length = 0;
  });
  for (let elapsed = 0; elapsed < timerDuration + 1; elapsed += 1_000_000) {
    await page.evaluate(
      (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds),
      Math.min(1_000_000, timerDuration + 1 - elapsed),
    );
  }

  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("orbiting");
  await expect.poll(() => readCueNames(page)).toContain("starShipArrive.mp3");
  const arrivalCues = await readCueNames(page);
  expect(arrivalCues.filter((cue) => cue === "starShipArrive.mp3")).toHaveLength(1);
  expect(arrivalCues.filter((cue) => cue !== "eventAlarm.mp3" && cue !== "starShipArrive.mp3"))
    .toEqual([]);
  if (arrivalCues.includes("eventAlarm.mp3")) {
    const randomEventHistory = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.randomEvents.history,
    );
    expect(randomEventHistory.length).toBeGreaterThan(0);
  }
});
