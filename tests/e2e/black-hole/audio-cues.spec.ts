import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

declare global {
  interface Window {
    __blackHoleAudioSources?: string[];
  }
}

test("Black Hole research is a normal action and warp activation plays its dedicated cue @black-hole @audio @p29-audio-meta", async ({
  page,
}) => {
  await page.addInitScript(() => {
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
    window.__blackHoleAudioSources = sources;
  });

  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    window.__blackHoleAudioSources!.length = 0;
  });

  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();
  await page.evaluate(() => {
    window.__blackHoleAudioSources!.length = 0;
  });

  const copy = blackHoleText("en");
  await page.locator(".black-hole-research .space-action-help-group > .primary-button").click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__blackHoleAudioSources!.map((source) => source.split("/").at(-1)),
      ),
    )
    .toEqual(["clickButton.mp3"]);

  const chargeDurationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!.durationMs,
  );
  await page.evaluate(
    (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
    chargeDurationMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleChargeReady))
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__blackHoleAudioSources!.map((source) => source.split("/").at(-1)),
      ),
    )
    .toEqual(["clickButton.mp3"]);

  await page.evaluate(() => {
    window.__blackHoleAudioSources!.length = 0;
  });
  await page.getByRole("button", { name: copy.activate, exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__blackHoleAudioSources!.map((source) => source.split("/").at(-1)),
      ),
    )
    .toEqual(["clickButton.mp3", "blackHoleActivated.mp3"]);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleWarpActive))
    .toBe(true);
});
