import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

async function startAudioMockedAchievementGame(page: Page): Promise<void> {
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
    (window as Window & { __achievementAudioSources?: string[] }).__achievementAudioSources =
      sources;
  });

  await startMetaFixture(page, "meta-rebirth-ready");
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { soundEffectsEnabled: true, backgroundAudioEnabled: false },
    });
    (window as Window & { __achievementAudioSources?: string[] }).__achievementAudioSources!.length =
      0;
  });
}

test("achievement notice adds no reward cue and auto-dismiss remains silent @achievements @audio @p29-achievement-audio", async ({
  page,
}) => {
  await startAudioMockedAchievementGame(page);
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(before.run.achievements.unlockedIds).not.toContain("collect50Hydrogen");
  const remaining = Math.max(1, 50 - before.run.goods.hydrogen.quantity);
  const collect = page.locator(".collect-button");
  await expect(collect).toBeEnabled();

  for (let index = 0; index < remaining; index += 1) await collect.click();

  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.achievements.unlockedIds).toContain("collect50Hydrogen");
  await expect(
    page
      .getByTestId("notification-stack")
      .locator('[data-testid="game-notification"][data-classification="achievement"]')
      .filter({ hasText: "collected 50 Hydrogen" }),
  ).toBeVisible();

  const cues = () =>
    page.evaluate(() =>
      (window as Window & { __achievementAudioSources?: string[] })
        .__achievementAudioSources!.map((source) => source.split("/").at(-1)),
    );
  const expected = Array.from({ length: remaining }, () => "clickButton.mp3");
  await expect.poll(cues).toEqual(expected);

  const achievementNotice = page
    .getByTestId("notification-stack")
    .locator('[data-testid="game-notification"][data-classification="achievement"]')
    .filter({ hasText: "collected 50 Hydrogen" });
  await expect(achievementNotice).toHaveCount(0, { timeout: 8_000 });
  await expect.poll(cues).toEqual(expected);
});
