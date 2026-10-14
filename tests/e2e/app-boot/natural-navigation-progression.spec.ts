import { expect, test } from "../_harness/fixtures";

async function confirmRandomEventResultIfPresent(
  page: import("@playwright/test").Page,
): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  if ((await dialog.count()) === 0) return;
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button").click();
  await expect(dialog).toBeHidden();
}

async function mainTabIds(page: import("@playwright/test").Page): Promise<string[]> {
  return page
    .locator(".game-nav [role='tab']")
    .evaluateAll((tabs) =>
      tabs.map((tab) => tab.getAttribute("aria-controls")?.replace(/^pane-/, "") ?? ""),
    );
}

async function expectLockedTabsAbsent(
  page: import("@playwright/test").Page,
  tabIds: readonly string[],
): Promise<void> {
  for (const id of tabIds) {
    await expect(page.locator(`.game-nav #tab-${id}`)).toHaveCount(0);
    await expect(page.locator(`#pane-${id}`)).toHaveCount(0);
  }
}

test("fresh natural progression unlocks Energy and Interstellar in source order @app-boot @ui-navigation @progression", async ({
  freshGame: game,
}) => {
  test.setTimeout(180_000);
  const lockedLaterTabs = [
    "energy",
    "compounds",
    "space-mining",
    "interstellar",
    "galaxy",
    "cosmic-rip",
  ];
  expect(await mainTabIds(game)).toEqual(["hydrogen", "research", "settings", "miaplaedia"]);
  const initialSettledSystemIds = await game.evaluate(
    () => window.miaplacidusTest!.getState().permanent.settledSystemIds,
  );
  await expectLockedTabsAbsent(game, lockedLaterTabs);

  await game.locator("#tab-research").click();
  await game.locator("#tab-research-science-buildings").click();
  const scienceKit = game.locator('[data-building-id="scienceKit"]');
  await scienceKit.locator(".economy-building-actions button").first().click();
  await expect
    .poll(() => game.evaluate(() => window.miaplacidusTest!.getState().run.upgrades.scienceKit))
    .toBe(1);

  await game.locator("#tab-hydrogen").click();
  const hydrogen = game.locator('[data-resource-id="hydrogen"]');
  const collectHydrogen = game.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  for (let count = 0; count < 50; count += 1) await collectHydrogen.click();
  const autobuyers = hydrogen.locator(".hydrogen-autobuyer-section");
  if ((await autobuyers.getAttribute("open")) === null) await autobuyers.locator("summary").click();
  await game.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(game.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  await game.evaluate(() => window.miaplacidusTest!.advanceBy(74_500));
  await game.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(game.getByTestId("hydrogen-capacity")).toHaveText("300");

  await game.locator("#hydrogen-sell-amount").selectOption("all");
  const sellHydrogen = game.getByRole("button", { name: "Sell", exact: true });
  for (let cycle = 0; cycle < 40; cycle += 1) {
    await game.evaluate(() => window.miaplacidusTest!.advanceBy(150_000));
    await confirmRandomEventResultIfPresent(game);
    await sellHydrogen.click();
  }

  await game.locator("#tab-research").click();
  await game.locator("#tab-research-tech-tree").click();
  const knowledgeSharing = game.locator('[data-technology-id="knowledgeSharing"]');
  await expect(knowledgeSharing).toBeEnabled();
  await knowledgeSharing.click();
  await expect(knowledgeSharing.locator(".technology-map-researched")).toBeVisible();

  await game.locator("#tab-research-science-buildings").click();
  const scienceClub = game.locator('[data-building-id="scienceClub"]');
  const buildScienceClub = scienceClub.locator(".economy-building-actions button").first();
  await expect(buildScienceClub).toBeEnabled();
  await buildScienceClub.click();
  await expect
    .poll(() => game.evaluate(() => window.miaplacidusTest!.getState().run.upgrades.scienceClub))
    .toBe(1);

  await game.locator("#tab-research-tech-tree").click();
  await game.evaluate(() => window.miaplacidusTest!.advanceBy(3_200_000));
  for (const technologyId of [
    "fusionTheory",
    "hydrogenFusion",
    "heliumFusion",
    "basicPowerGeneration",
  ]) {
    const technology = game.locator(`[data-technology-id="${technologyId}"]`);
    await expect(technology).toBeEnabled();
    await technology.click();
    await expect(technology.locator(".technology-map-researched")).toBeVisible();
  }

  expect(await mainTabIds(game)).toEqual([
    "hydrogen",
    "research",
    "energy",
    "settings",
    "miaplaedia",
  ]);
  await expectLockedTabsAbsent(game, [
    "compounds",
    "space-mining",
    "interstellar",
    "galaxy",
    "cosmic-rip",
  ]);
  await game.locator("#tab-energy").click();
  const energyTab = game.locator("#tab-energy");
  await expect(energyTab).toHaveAttribute("aria-selected", "true");
  await expect(game.locator("#pane-energy")).toBeVisible();
  const energyChildTabs = game.locator("#pane-energy .pane-nav-tab[role='tab']");
  const energyChildOrder = await energyChildTabs.evaluateAll((tabs) =>
    tabs.map((tab) => [
      tab.id,
      tab.getAttribute("data-source-option-id"),
      tab.getAttribute("data-source-option-ids"),
    ]),
  );
  expect(energyChildOrder).toEqual([
    ["tab-energy-summary", null, null],
    ["tab-energy-batteries", "option1", null],
    ["tab-energy-power", null, "option2,option3,option4"],
  ]);
  const energySummaryTab = game.locator("#tab-energy-summary");
  await expect(energySummaryTab).toHaveAttribute("aria-selected", "true");
  await expect(energySummaryTab).toHaveAttribute("aria-controls", "panel-energy");
  await expect(game.locator("#panel-energy")).toBeVisible();
  await expect(game.locator("#panel-energy")).toHaveAttribute("role", "tabpanel");
  await expect(game.locator("#panel-energy")).toHaveAttribute(
    "aria-labelledby",
    "tab-energy-summary",
  );
  await expect(game.locator(".pane-stack > [role='tabpanel']:visible")).toHaveCount(1);

  await game.locator("#tab-research").click();
  await game.locator("#tab-research-tech-tree").click();
  const stellarCartography = game.locator('[data-technology-id="stellarCartography"]');
  await expect(stellarCartography).toBeVisible();
  await expect(stellarCartography).toBeEnabled();
  await stellarCartography.click();
  await expect(stellarCartography.locator(".technology-map-researched")).toBeVisible();

  expect(await mainTabIds(game)).toEqual([
    "hydrogen",
    "research",
    "energy",
    "interstellar",
    "settings",
    "miaplaedia",
  ]);
  await expectLockedTabsAbsent(game, ["compounds", "space-mining", "galaxy", "cosmic-rip"]);
  await game.locator("#tab-interstellar").click();
  const starMapTab = game.locator("#tab-interstellar-star-map");
  const interstellarChildTabs = game.locator("#pane-interstellar .pane-nav-tab[role='tab']");
  await expect(interstellarChildTabs).toHaveCount(1);
  await expect(interstellarChildTabs.nth(0)).toHaveAttribute("id", "tab-interstellar-star-map");
  await expect(starMapTab).toBeVisible();
  await expect(starMapTab).toHaveAttribute("aria-selected", "true");
  await expect(starMapTab).toHaveAttribute("aria-controls", "panel-interstellar-star-map");
  await expect(game.locator("#panel-interstellar-star-map")).toBeVisible();
  await expect(game.locator("#panel-interstellar-star-map")).toHaveAttribute(
    "aria-labelledby",
    "tab-interstellar-star-map",
  );

  const progressionBoundary = await game.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      rebirthCount: state.permanent.rebirthCount,
      ascendencyAwardedThisRun: state.run.space.ascendencyAwardedThisRun,
      settledSystemIds: state.permanent.settledSystemIds,
      cosmicRipUnlocked: state.permanent.cosmicRip.unlocked,
      systemProfileCount: state.run.space.systemProfiles.length,
      orbitalConstructionResearched:
        state.run.economy.researchedTechnologies.includes("orbitalConstruction"),
      rocketCompositesResearched:
        state.run.economy.researchedTechnologies.includes("rocketComposites"),
      antimatterUnlocked: state.run.space.antimatterUnlocked,
      miaplacidusStoryPending: state.permanent.megastructures.miaplacidusStoryPending,
    };
  });
  expect(progressionBoundary.rebirthCount).toBe(0);
  expect(progressionBoundary.ascendencyAwardedThisRun).toBe(false);
  expect(progressionBoundary.settledSystemIds).toEqual(initialSettledSystemIds);
  expect(progressionBoundary.cosmicRipUnlocked).toBe(false);
  expect(progressionBoundary.systemProfileCount).toBe(1);
  expect(progressionBoundary.orbitalConstructionResearched).toBe(false);
  expect(progressionBoundary.rocketCompositesResearched).toBe(false);
  expect(progressionBoundary.antimatterUnlocked).toBe(false);
  expect(progressionBoundary.miaplacidusStoryPending).toBe(false);
  await expectLockedTabsAbsent(game, ["galaxy"]);
  await expect(game.locator("#tab-galactic-casino")).toHaveCount(0);
  await expect(game.locator("#tab-cosmic-rip")).toHaveCount(0);
});
