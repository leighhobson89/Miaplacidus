import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { MEGASTRUCTURE_TRACKS } from "../../../src/content/technology";

test("opens Miaplacidus and completes its homecoming story through the player route @megastructures", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Megastructures" }).click();

  const archive = page.getByTestId("megastructure-track-galacticMemoryArchive");
  await expect(page.getByTestId("megastructure-force-field")).toContainText("3/4");
  const ascendencyBeforeFinalStage = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.ascendencyPoints,
  );
  await archive.getByRole("button", { name: "Research stage" }).click();
  await expect(page.getByTestId("megastructure-force-field")).toContainText("4/4");
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.ascendencyPoints))
    .toBe(ascendencyBeforeFinalStage + 100);
  const stageThree = MEGASTRUCTURE_TRACKS.galacticMemoryArchive[2]!;
  expect(
    (await page.evaluate(() => window.miaplacidusTest!.getState())).permanent.megastructures
      .researchedTechnologyIds,
  ).toContain(stageThree);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Miaplacidus");
  await map.locator(".star-map-search-results button").filter({ hasText: "Miaplacidus" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  await page.getByRole("tab", { name: "Starship construction" }).click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: "Launch starship" }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  const travelDuration = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return state.run.timers[state.run.space.starship.timerId!]!.durationMs;
  });
  await page.evaluate(
    (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
    travelDuration,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("orbiting");
  await page.locator("#tab-interstellar-colonise").click();
  await starship.getByTestId("starship-scan-system-button").click();
  await starship.getByTestId("starship-enter-war-button").click();
  await starship.getByTestId("starship-battle-engage-button").click();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const phase = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.systemEncounters.at(-1)?.battle.phase,
    );
    if (phase !== "inProgress") break;
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  }
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters.at(-1)?.battle.phase,
      ),
    )
    .toBe("victory");
  await starship.getByTestId("starship-settle-system-button").click();
  await expect(page.getByTestId("miaplacidus-endgame-story")).toBeVisible();
  const homeId = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
  );
  expect(
    (await page.evaluate(() => window.miaplacidusTest!.getState())).permanent.settledSystemIds,
  ).toContain(homeId);
  expect(
    (await page.evaluate(() => window.miaplacidusTest!.getState())).permanent.megastructures
      .miaplacidusStoryPending,
  ).toBe(true);

  const story = page.getByTestId("miaplacidus-endgame-story");
  for (let pageNumber = 0; pageNumber < 4; pageNumber += 1) {
    await expect(story.getByText(`Chapter ${pageNumber + 1} of 4`)).toBeVisible();
    await story.getByRole("button", { name: "Continue" }).click();
  }
  await expect(story).toHaveCount(0);
  const completed = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(completed.permanent.megastructures.miaplacidusStoryPending).toBe(false);
  expect(completed.permanent.megastructures.miaplacidusStoryShown).toBe(true);
  await captureVisualCheckpoint(page, testInfo, "miaplacidus-homecoming-complete");
});
