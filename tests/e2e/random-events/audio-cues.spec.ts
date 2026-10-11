import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

async function startAudioMockedEventGame(page: import("@playwright/test").Page): Promise<void> {
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
    (window as Window & { __randomEventAudioSources?: string[] }).__randomEventAudioSources =
      sources;
  });

  await startMetaFixture(page, "meta-rebirth-ready");
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    (window as Window & { __randomEventAudioSources?: string[] }).__randomEventAudioSources!.length =
      0;
  });
}

test("random-event trigger plays one event alarm with no replay as time advances @random-events @audio @p29-random-event-audio", async ({
  page,
}) => {
  await startAudioMockedEventGame(page);

  const accepted = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "researchBreakthrough",
    }),
  );
  expect(accepted).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as Window & { __randomEventAudioSources?: string[] })
          .__randomEventAudioSources!.map((source) => source.split("/").at(-1)),
      ),
    )
    .toEqual(["eventAlarm.mp3"]);
  expect(
    await page.evaluate(() =>
      window
        .miaplacidusTest!.getState()
        .run.randomEvents.history.map((entry) => entry.id),
    ),
  ).toContain("researchBreakthrough");

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(5_000));
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as Window & { __randomEventAudioSources?: string[] })
          .__randomEventAudioSources!.map((source) => source.split("/").at(-1)),
      ),
    )
    .toEqual(["eventAlarm.mp3"]);
});
