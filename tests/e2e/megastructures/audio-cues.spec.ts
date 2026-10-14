import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { MEGASTRUCTURE_TRACKS } from "../../../src/content/technology";

async function startMegastructureAudioFixture(
  page: Page,
  fixture: "meta-megastructure-audio" | "meta-megastructure-route",
): Promise<void> {
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
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources = sources;
  });
  await startMetaFixture(page, fixture);
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

async function clearCueLog(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as Window & { __p29AudioSources?: string[] }).__p29AudioSources!.length = 0;
  });
}

async function dismissRandomEventResultIfPresent(page: Page): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  await dialog.waitFor({ state: "visible", timeout: 1_000 }).catch(() => undefined);
  if (await dialog.isVisible()) await dialog.getByRole("button").click();
}

async function openArchiveResearch(page: Page) {
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();
  await dismissRandomEventResultIfPresent(page);
  await clearCueLog(page);
  return page.getByTestId("megastructure-track-galacticMemoryArchive");
}

test("visible stage 3 research plays the regular force-field cue and stage 5 plays capture @megastructures @audio @p29-audio-routes", async ({
  page,
}) => {
  await startMegastructureAudioFixture(page, "meta-megastructure-audio");
  await dismissRandomEventResultIfPresent(page);
  const archive = await openArchiveResearch(page);
  const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(initial.permanent.megastructures.researchedTechnologyIds).not.toContain(
    MEGASTRUCTURE_TRACKS.galacticMemoryArchive[2],
  );

  await archive.getByRole("button", { name: "Research", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window
          .miaplacidusTest!.getState()
          .permanent.megastructures.researchedTechnologyIds.includes(
            "galacticMemoryArchiveDisconnect",
          ),
      ),
    )
    .toBe(true);
  await expect
    .poll(() => readCueNames(page))
    .toEqual(["clickButton.mp3", "forcefieldTakedown.mp3"]);
  await dismissRandomEventResultIfPresent(page);

  const stageFour = MEGASTRUCTURE_TRACKS.galacticMemoryArchive[3]!;
  await clearCueLog(page);
  await archive.getByRole("button", { name: "Research", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        (technologyId) =>
          window
            .miaplacidusTest!.getState()
            .permanent.megastructures.researchedTechnologyIds.includes(technologyId),
        stageFour,
      ),
    )
    .toBe(true);
  expect(await readCueNames(page)).toEqual(["clickButton.mp3"]);
  await dismissRandomEventResultIfPresent(page);

  await clearCueLog(page);
  await archive.getByRole("button", { name: "Research", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window
          .miaplacidusTest!.getState()
          .permanent.megastructures.researchedTechnologyIds.includes(
            "galacticMemoryArchiveConnect",
          ),
      ),
    )
    .toBe(true);
  await expect
    .poll(() => readCueNames(page))
    .toEqual(["clickButton.mp3", "megastructureCaptured.mp3"]);
});

test("fourth force-field milestone plays final takedown cue @megastructures @audio @p29-audio-routes", async ({
  page,
}) => {
  await startMegastructureAudioFixture(page, "meta-megastructure-route");
  await dismissRandomEventResultIfPresent(page);
  const archive = await openArchiveResearch(page);
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const fieldStages = Object.values(MEGASTRUCTURE_TRACKS).map((track) => track[2]!);
  expect(
    fieldStages.filter((technologyId) =>
      before.permanent.megastructures.researchedTechnologyIds.includes(technologyId),
    ),
  ).toHaveLength(3);

  await clearCueLog(page);
  await archive.getByRole("button", { name: "Research", exact: true }).click();
  await expect(page.getByTestId("megastructure-force-field")).toContainText("4/4");
  await expect
    .poll(() => readCueNames(page))
    .toEqual(["clickButton.mp3", "forcefieldTakedownFinal.mp3"]);
});
