import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";

async function startAudioEconomyFixture(
  page: Page,
  fixture: "full" | "storage" | "buyer-tiers" = "full",
  pioneer = "Economy Audio Pioneer",
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
    (window as Window & { __economyAudioSources?: string[] }).__economyAudioSources = sources;
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
    (window as Window & { __economyAudioSources?: string[] }).__economyAudioSources!.length = 0;
  });
}

async function soundFiles(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    (window as Window & { __economyAudioSources?: string[] }).__economyAudioSources!.map((source) =>
      source.split("/").at(-1)!,
    ),
  );
}

async function clearSounds(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as Window & { __economyAudioSources?: string[] }).__economyAudioSources!.length = 0;
  });
}

async function expectSounds(page: Page, expected: readonly string[]): Promise<void> {
  await expect.poll(() => soundFiles(page)).toEqual(expected);
}

test("visible Resource and Compound actions play the Cosmic Forge click and sale cues @economy @audio @p29-economy-audio", async ({
  page,
}) => {
  await startAudioEconomyFixture(page);

  const hydrogen = page.locator('[data-resource-id="hydrogen"]');
  const hydrogenBefore = await page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity);
  await hydrogen.getByRole("button", { name: /Collect.*Hydrogen/ }).click();
  await expectSounds(page, ["clickButton.mp3"]);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity))
    .toBe(hydrogenBefore + 1);

  await clearSounds(page);
  await hydrogen.locator("#hydrogen-sell-amount").selectOption("1");
  await hydrogen.getByRole("button", { name: "Sell", exact: true }).click();
  await expectSounds(page, ["clickButton.mp3", "kaching.mp3"]);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity))
    .toBe(hydrogenBefore);

  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-diesel").click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  await diesel.locator(".compound-autobuyer-section > summary").click();
  const automaticCreation = diesel.locator(".compound-autobuyer-section input[type=checkbox]");
  if (await automaticCreation.isChecked()) await automaticCreation.uncheck();
  await clearSounds(page);

  const dieselBefore = await page.evaluate(() => window.miaplacidusTest!.getState().run.goods.diesel.quantity);
  await diesel.getByRole("button", { name: "Create Diesel", exact: true }).click();
  await expectSounds(page, ["clickButton.mp3"]);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.diesel.quantity))
    .toBe(dieselBefore + 1);

  await clearSounds(page);
  await diesel.getByRole("button", { name: "Sell Diesel", exact: true }).click();
  await expectSounds(page, ["clickButton.mp3", "kaching.mp3"]);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.diesel.quantity))
    .toBe(0);
});

test("Hydrogen storage upgrade plays exactly one source storage cue @economy @audio @p29-economy-audio", async ({
  page,
}) => {
  await startAudioEconomyFixture(page, "storage", "Storage Audio Pioneer");

  const capacity = page.getByTestId("hydrogen-capacity");
  await expect(capacity).toHaveText("150");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("149");
  await page.getByRole("button", { name: "Increase storage", exact: true }).click();

  await expectSounds(page, ["increaseStorage.mp3"]);
  await expect(capacity).toHaveText("300");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
});

test("Hydrogen autobuyer purchase plays exactly one source button cue @economy @audio @p29-economy-audio", async ({
  page,
}) => {
  await startAudioEconomyFixture(page, "buyer-tiers", "Autobuyer Audio Pioneer");

  const hydrogen = page.locator('[data-resource-id="hydrogen"]');
  const autobuyers = hydrogen.locator(".hydrogen-autobuyer-section");
  await autobuyers.locator("summary").click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("0");
  await expect(autobuyers.getByRole("button", { name: "Buy compressor", exact: true })).toBeEnabled();
  await clearSounds(page);
  await autobuyers.getByRole("button", { name: "Buy compressor", exact: true }).click();

  await expectSounds(page, ["clickButton.mp3"]);
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
});
