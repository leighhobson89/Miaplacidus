import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { MEGASTRUCTURE_TRACKS } from "../../../src/content/technology";

test("reveals Rebirth after a destination scan without changing the selected page @ui-navigation @galactic", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-route");

  const initialState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(initialState.run.space.systemEncounters).toHaveLength(0);
  expect(initialState.run.space.ascendencyAwardedThisRun).toBe(true);

  const galactic = page.locator("#tab-galaxy");
  await galactic.click();
  const market = page.locator("#tab-galactic-market");
  await expect(market).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-galactic-rebirth")).toHaveCount(0);

  // The fixture starts one field milestone short of Miaplacidus route access.
  await page.locator("#tab-galactic-megastructures").click();
  const archive = page.getByTestId("megastructure-track-galacticMemoryArchive");
  await archive.getByRole("button", { name: "Research stage" }).click();
  await expect(page.getByTestId("megastructure-force-field")).toContainText("4/4");
  await expect(page.locator("#tab-galactic-rebirth")).toHaveCount(0);
  await market.click();
  await expect(market).toHaveAttribute("aria-selected", "true");

  await page.locator("#tab-interstellar").click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Miaplacidus");
  await map.locator(".star-map-search-results button").filter({ hasText: "Miaplacidus" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  const scanButton = starship.getByTestId("starship-scan-system-button");
  await expect(scanButton).toHaveCount(0);
  await expect(page.locator("#tab-interstellar-colonise")).toHaveCount(0);
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

  await expect(scanButton).toBeVisible();
  await expect(scanButton).toBeEnabled();
  await scanButton.click();
  await expect(starship.getByTestId("starship-system-scan-results")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.systemEncounters.length),
    )
    .toBe(1);

  await expect(page.locator("#tab-interstellar")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-interstellar-starship")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  // This route has already awarded Ascendency Points this run, so Colonise
  // remains correctly gated while the independent Rebirth gate opens.
  await expect(page.locator("#tab-interstellar-colonise")).toHaveCount(0);
  await expect(page.locator("#tab-galactic-rebirth")).toHaveCount(1);

  await galactic.click();
  await expect(page.locator("#tab-galactic-rebirth")).toBeVisible();
  await expect(market).toHaveAttribute("aria-selected", "true");
  const galacticChildIds = await page
    .locator("#pane-galaxy .pane-nav-tab[role='tab']")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id));
  expect(galacticChildIds[0]).toBe("tab-galactic-rebirth");
  expect(galacticChildIds[1]).toBe("tab-galactic-market");
});

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
  const stageFourButton = archive.getByRole("button", { name: "Research stage" });
  await expect(stageFourButton).toBeDisabled();
  const stageFourReasonId = await stageFourButton.getAttribute("aria-describedby");
  expect(stageFourReasonId).toBeTruthy();
  await expect(page.locator(`#${stageFourReasonId}`)).toHaveText(
    "Requires 200,000 RP; short by 50,000 RP.",
  );

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

test("explains and associates missing technology and factory location gates @megastructures @megastructure-guidance", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-research-reasons");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Megastructures" }).click();

  const reasons = [
    {
      track: "galacticMemoryArchive",
      expected: "Research these technologies first: Orbital Construction.",
    },
    {
      track: "dysonSphere",
      expected: "Settle Deneb before researching this structure.",
    },
    {
      track: "celestialProcessingCore",
      expected: "Start a run at the conquered factory star to research its stages.",
    },
  ] as const;

  for (const { track, expected } of reasons) {
    const button = page
      .getByTestId(`megastructure-track-${track}`)
      .getByRole("button", { name: "Research stage" });
    await expect(button).toBeDisabled();
    const reasonId = await button.getAttribute("aria-describedby");
    expect(reasonId).toBeTruthy();
    await expect(page.locator(`#${reasonId}`)).toHaveText(expected);
  }
});

test("shows the research point requirement and shortfall for a disabled next stage @megastructures @megastructure-guidance", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Megastructures" }).click();

  const archive = page.getByTestId("megastructure-track-galacticMemoryArchive");
  await archive.getByRole("button", { name: "Research stage" }).click();
  const nextStageButton = archive.getByRole("button", { name: "Research stage" });
  await expect(nextStageButton).toBeDisabled();
  const reasonId = await nextStageButton.getAttribute("aria-describedby");
  expect(reasonId).toBeTruthy();
  await expect(page.locator(`#${reasonId}`)).toHaveText("Requires 200,000 RP; short by 50,000 RP.");
});
