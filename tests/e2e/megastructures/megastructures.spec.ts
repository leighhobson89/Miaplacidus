import { createRequire } from "node:module";
import { type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { confirmStarshipWarEntry } from "../_harness/war-mode";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import type { GameState } from "../../../src/engine/state";
import { canonicalJson, makeEnvelope, type SaveEnvelopeV1 } from "../../../src/persistence/schema";
import {
  MEGASTRUCTURE_IDS,
  MEGASTRUCTURE_TECHNOLOGY_IDS,
  MEGASTRUCTURE_TRACKS,
  TECHNOLOGY_CATALOG,
} from "../../../src/content/technology";
import { LOCALE_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { miaplacidusStoryText } from "../../../src/i18n/miaplacidusStoryMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { THEME_IDS } from "../../../src/content/themes";
import {
  megastructureStageProgress,
  megastructureText,
} from "../../../src/i18n/megastructureMessages";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { setNumberNotation } from "../_harness/settings-controls";

type StoredEntry = readonly [string, string];

async function dismissRandomEventResultIfPresent(page: Page): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  await dialog.waitFor({ state: "visible", timeout: 1_000 }).catch(() => undefined);
  if (await dialog.isVisible()) await dialog.getByRole("button").click();
}

const { compressToUTF16, decompressFromUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

function saveWithPendingHomecomingStory(entries: readonly StoredEntry[]): StoredEntry[] {
  const values = new Map(entries);
  const slotId = values.get("miaplacidus:v1:lastStartedSlot");
  if (!slotId) throw new Error("The story test save was not marked as the latest save.");
  const commitId = values.get(`miaplacidus:v1:head:${slotId}`);
  if (!commitId) throw new Error("The story test save has no committed generation.");
  const payloadKey = `miaplacidus:v1:slot:${slotId}:${commitId}`;
  const payload = values.get(payloadKey);
  if (!payload) throw new Error("The story test save payload could not be read.");
  const decoded = decompressFromUTF16(payload);
  if (!decoded) throw new Error("The story test save payload could not be decompressed.");
  const envelope = JSON.parse(decoded) as SaveEnvelopeV1;
  const state: GameState = {
    ...envelope.state,
    permanent: {
      ...envelope.state.permanent,
      megastructures: {
        ...envelope.state.permanent.megastructures,
        miaplacidusStoryPending: true,
      },
    },
  };
  const updated = makeEnvelope({
    slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: Math.max(Date.now(), envelope.savedAt),
    revision: envelope.revision + 1,
    state,
  });
  values.set(payloadKey, compressToUTF16(canonicalJson(updated)));
  return [...values.entries()];
}

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
  await archive.getByRole("button", { name: "Research", exact: true }).click();
  await dismissRandomEventResultIfPresent(page);
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
  await starship.getByRole("button", { name: starshipText("en", "launch") }).click();
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
  await expect(starship.getByTestId("starship-scan-complete")).toContainText(
    starshipText("en", "scanComplete"),
  );
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.systemEncounters.length),
    )
    .toBe(1);
  await expect(page.locator("#tab-interstellar-colonise")).toBeVisible();
  await page.locator("#tab-interstellar-colonise").click();
  await expect(
    page.getByTestId("starship-pane").getByTestId("starship-system-scan-results"),
  ).toHaveText(starshipText("en", "lifeDetected"));
  await page.locator("#tab-interstellar-starship").click();

  await expect(page.locator("#tab-interstellar")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-interstellar-starship")).toHaveAttribute("aria-selected", "true");
  // A saved scan reveals Colonise even when Ascendency Points were already
  // awarded this run. Galactic child tabs are mounted when that section opens.
  await expect(page.locator("#tab-interstellar-colonise")).toBeVisible();

  await galactic.click();
  await expect(page.locator("#tab-galactic-rebirth")).toBeVisible();
  await expect(market).toHaveAttribute("aria-selected", "true");
  const galacticChildIds = await page
    .locator("#pane-galaxy .pane-nav-tab[role='tab']")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id));
  expect(galacticChildIds[0]).toBe("tab-galactic-rebirth");
  expect(galacticChildIds[1]).toBe("tab-galactic-market");
});

test("late-game continuation fixture: homecoming unlocks Cosmic Rip and gated tabs @megastructures @cosmic-rip @ui-navigation @p28-artwork-review", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-megastructure-route");
  await page.evaluate(() =>
    window.miaplacidusTest!.runScenario("late-game-homecoming-continuation"),
  );
  const continuationState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(continuationState.run.space.ascendencyAwardedThisRun).toBe(false);
  expect(continuationState.permanent.megastructures.researchedTechnologyIds).toContain(
    MEGASTRUCTURE_TRACKS.galacticMemoryArchive[1],
  );
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Megastructures" }).click();

  const archive = page.getByTestId("megastructure-track-galacticMemoryArchive");
  await expect(page.getByTestId("megastructure-force-field")).toContainText("3/4");
  const ascendencyBeforeFinalStage = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.ascendencyPoints,
  );
  await archive.getByRole("button", { name: "Research", exact: true }).click();
  await dismissRandomEventResultIfPresent(page);
  await expect(page.getByTestId("megastructure-force-field")).toContainText("4/4");
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.ascendencyPoints))
    .toBe(ascendencyBeforeFinalStage + 100);
  const stageThree = MEGASTRUCTURE_TRACKS.galacticMemoryArchive[2]!;
  expect(
    (await page.evaluate(() => window.miaplacidusTest!.getState())).permanent.megastructures
      .researchedTechnologyIds,
  ).toContain(stageThree);
  const stageFourButton = archive.getByRole("button", { name: "Research", exact: true });
  await expect(stageFourButton).toBeDisabled();
  const stageFourReasonId = await stageFourButton.getAttribute("aria-describedby");
  expect(stageFourReasonId).toBeTruthy();
  await expect(page.locator(`#${stageFourReasonId}`)).toHaveText(
    "Requires 200K RP; short by 50K RP.",
  );

  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Miaplacidus");
  await map.locator(".star-map-search-results button").filter({ hasText: "Miaplacidus" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  await page.getByRole("tab", { name: starshipText("en", "title") }).click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: starshipText("en", "launch") }).click();
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
  // Colonise is gated until the destination has been scanned.
  await expect(page.locator("#tab-interstellar-colonise")).toHaveCount(0);
  await starship.getByTestId("starship-scan-system-button").click();
  const coloniseTab = page.locator("#tab-interstellar-colonise");
  await expect(coloniseTab).toBeVisible();
  await coloniseTab.click();
  await confirmStarshipWarEntry(starship);
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
    for (const locale of LOCALE_IDS) {
      await page.evaluate((nextLocale) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        });
      }, locale);
      const localizedStory = miaplacidusStoryText(locale);
      const chapterText = localizedStory.pages[pageNumber]!;
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByTestId("starship-feedback")).toHaveText(
        starshipText(locale, "settlementComplete"),
      );
      await expect(
        story.getByRole("heading", {
          name: localizedStory.pageTitles[pageNumber],
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        story.getByText(
          localizedStory.page
            .replace("{current}", String(pageNumber + 1))
            .replace("{total}", String(localizedStory.pages.length)),
          { exact: true },
        ),
      ).toBeVisible();
      await expect(story.locator("#miaplacidus-story-page")).toHaveText(chapterText);
      const pageAction =
        pageNumber === localizedStory.pages.length - 1
          ? localizedStory.finish
          : localizedStory.continue;
      await expect(
        story.getByRole("button", { name: pageAction, exact: true }),
      ).toBeVisible();
    }
    for (const themeId of THEME_IDS) {
      for (const viewport of [
        { width: 1280, height: 720 },
        { width: 390, height: 844 },
      ] as const) {
        await page.setViewportSize(viewport);
        await page.evaluate((nextTheme) => {
          window.miaplacidusTest!.dispatch({
            type: "settings.update",
            patch: { locale: "en", themeId: nextTheme },
          });
        }, themeId);
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
        await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
        const scene = story.locator(`.miaplacidus-story-scene.scene-${pageNumber + 1}`);
        await expect(scene).toBeVisible();
        await expect(scene).toHaveAttribute("aria-hidden", "true");
        const sceneBounds = await scene.evaluate((element) => {
          const sceneRect = element.getBoundingClientRect();
          const dialogRect = element.closest("dialog")!.getBoundingClientRect();
          const frame = document.querySelector(".game-frame:not(.notification-portal)")!;
          const world = element.querySelector<HTMLElement>(".miaplacidus-story-world")!;
          return {
            viewportWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            width: sceneRect.width,
            height: sceneRect.height,
            insideDialog:
              sceneRect.left >= dialogRect.left &&
              sceneRect.right <= dialogRect.right &&
              sceneRect.top >= dialogRect.top &&
              sceneRect.bottom <= dialogRect.bottom,
            panelColor: getComputedStyle(frame).getPropertyValue("--bg-color").trim(),
            sceneBackground: getComputedStyle(element).backgroundColor,
            sceneBorder: getComputedStyle(element).borderColor,
            worldColor: getComputedStyle(world).backgroundImage,
          };
        });
        expect(sceneBounds.documentWidth).toBeLessThanOrEqual(sceneBounds.viewportWidth);
        expect(sceneBounds.width).toBeGreaterThan(0);
        expect(sceneBounds.height).toBeGreaterThan(0);
        expect(sceneBounds.insideDialog).toBe(true);
        expect(sceneBounds.panelColor).not.toBe("");
        expect(sceneBounds.sceneBackground).not.toBe("");
        expect(sceneBounds.sceneBorder).not.toBe("");
        expect(sceneBounds.worldColor).not.toBe("none");

        const representativeTheme = ["terminal", "light", "supernova", "space"][pageNumber]!;
        const representativeWidth = pageNumber % 2 === 0 ? 1280 : 390;
        if (themeId === representativeTheme && viewport.width === representativeWidth) {
          const name = `p28-endgame-scene-${pageNumber + 1}-${themeId}-${viewport.width}.png`;
          const artworkCapture = await page.screenshot({
            path: testInfo.outputPath(name),
            animations: "disabled",
          });
          await testInfo.attach(name, {
            body: artworkCapture,
            contentType: "image/png",
          });
        }
      }
    }
    await story
      .getByRole("button", { name: miaplacidusStoryText("en").finish, exact: true })
      .click();
  }
  await expect(story).toHaveCount(0);
  const completed = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(completed.permanent.megastructures.miaplacidusStoryPending).toBe(false);
  expect(completed.permanent.megastructures.miaplacidusStoryShown).toBe(true);
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en", themeId: "terminal" },
    });
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const tutorialDismissButton = page.getByRole("button", { name: "No thanks", exact: true });
  if (await tutorialDismissButton.isVisible()) await tutorialDismissButton.click();
  await expect(page.locator(".progression-tutorial")).toHaveCount(0);
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect(page.getByTestId("notification-stack")).toBeEmpty();
  const viewport = page.viewportSize();
  if (viewport) await page.mouse.move(viewport.width - 1, viewport.height - 1);
  await captureVisualCheckpoint(page, testInfo, "miaplacidus-homecoming-complete");
  const cosmicRipTab = page.locator("#tab-cosmic-rip");
  expect(completed.permanent.cosmicRip.unlocked).toBe(true);
  expect(completed.permanent.cosmicRip.scannerRestored).toBe(false);
  expect(completed.permanent.cosmicRip.ripFound).toBe(false);

  await expect(cosmicRipTab).toBeVisible();
  await cosmicRipTab.click();
  const cosmicRipPanel = page.locator("#pane-cosmic-rip");
  const cosmicRipChildTabs = cosmicRipPanel
    .getByRole("navigation", { name: "Pages in this section" })
    .getByRole("tab");
  await expect(cosmicRipChildTabs).toHaveCount(1);
  await expect(cosmicRipChildTabs).toHaveAttribute("id", "tab-cosmic-rip-situation");
  await expect(page.locator("#tab-cosmic-rip-scanner-array")).toHaveCount(0);
  await expect(page.locator("#tab-cosmic-rip-rip")).toHaveCount(0);
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
      .getByRole("button", { name: "Research", exact: true });
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
  await archive.getByRole("button", { name: "Research", exact: true }).click();
  const nextStageButton = archive.getByRole("button", { name: "Research", exact: true });
  await expect(nextStageButton).toBeDisabled();
  const reasonId = await nextStageButton.getAttribute("aria-describedby");
  expect(reasonId).toBeTruthy();
  await expect(page.locator(`#${reasonId}`)).toHaveText("Requires 200K RP; short by 50K RP.");
});

test("P-41 formats visible Megastructure and Tech Tree counts in every notation @p41-count-notation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-route");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const settledSystemIds = new Set(state.permanent.settledSystemIds);
  const capturedCount = new Set(
    state.permanent.megastructures.ancientManuscripts
      .filter((record) => settledSystemIds.has(record.factorySystemId))
      .map((record) => record.megastructureId),
  ).size;
  const researchedMegastructureTechs = new Set(
    state.permanent.megastructures.researchedTechnologyIds,
  );
  const forceFieldCount = MEGASTRUCTURE_IDS.filter((id) =>
    researchedMegastructureTechs.has(MEGASTRUCTURE_TRACKS[id][2]!),
  ).length;
  const researchedStandardCount = state.run.economy.researchedTechnologies.filter(
    (id) => !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(id),
  ).length;
  const standardTechnologyCount = TECHNOLOGY_CATALOG.filter(
    ({ id }) => !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(id),
  ).length;
  const visibleStandardCount = TECHNOLOGY_CATALOG.filter(
    ({ id }) =>
      !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(id) &&
      state.run.economy.revealedTechnologies.includes(id),
  ).length;

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notation))
      .toBe(notation);

    const globalProgress = page
      .getByTestId("global-stat-megastructure-progress")
      .locator(".top-stat-value");
    await expect(globalProgress).toHaveText(
      `${formatNumber("en", capturedCount, 0, notation)}/${formatNumber("en", MEGASTRUCTURE_IDS.length, 0, notation)}`,
    );

    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-megastructures").click();
    const megastructures = page.getByTestId("megastructure-pane");
    const forceFieldCopy =
      megastructureText("en")[forceFieldCount >= 4 ? "forceFieldCleared" : "forceField"];
    await expect(megastructures.getByTestId("megastructure-force-field")).toContainText(
      forceFieldCopy
        .replace("{level}", formatNumber("en", forceFieldCount, 0, notation))
        .replace("{total}", formatNumber("en", MEGASTRUCTURE_IDS.length, 0, notation)),
    );

    for (const id of MEGASTRUCTURE_IDS) {
      const completedStageCount = MEGASTRUCTURE_TRACKS[id].filter((technologyId) =>
        researchedMegastructureTechs.has(technologyId),
      ).length;
      await expect(
        megastructures.getByTestId(`megastructure-track-${id}`).locator("p").first(),
      ).toHaveText(
        megastructureStageProgress("en", completedStageCount, 5, (value) =>
          formatNumber("en", value, 0, notation),
        ),
      );
    }

    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    const treeSummary = page.locator("#panel-research-tech-tree .economy-section-heading p");
    await expect(treeSummary).toHaveText(
      `${formatNumber("en", researchedStandardCount, 2, notation)} / ${formatNumber("en", standardTechnologyCount, 2, notation)} ${economyLabel("en", "researched")} · ${formatNumber("en", visibleStandardCount, 2, notation)} ${economyLabel("en", "shown")}`,
    );
  }
});

test("returns focus to Cosmic Rip after the forced homecoming story @p16-focus", async ({
  freshGame,
}) => {
  await saveNowFromSettings(freshGame);
  const storedEntries = await freshGame.evaluate(() => {
    const entries: StoredEntry[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("miaplacidus:v1:")) continue;
      const value = localStorage.getItem(key);
      if (value !== null) entries.push([key, value]);
    }
    return entries;
  });
  const storyPendingEntries = saveWithPendingHomecomingStory(storedEntries);
  await freshGame.evaluate((entries) => {
    for (const [key, value] of entries) localStorage.setItem(key, value);
  }, storyPendingEntries);
  await freshGame.reload();
  await resumeSavedPioneer(freshGame, "Hydrogen Pioneer");

  const story = freshGame.getByTestId("miaplacidus-endgame-story");
  const continueButton = story.getByRole("button", { name: "Continue" });
  await expect(story).toBeVisible();
  await expect(continueButton).toBeFocused();
  await freshGame.keyboard.press("Escape");
  await expect(story).toBeVisible();
  await expect(continueButton).toBeFocused();

  for (let chapter = 0; chapter < 4; chapter += 1) await continueButton.click();
  await expect(story).toHaveCount(0);
  const cosmicRipTab = freshGame.locator("#tab-cosmic-rip");
  await expect(cosmicRipTab).toBeVisible();
  await expect(cosmicRipTab).toBeFocused();
});
