import { expect, test } from "../_harness/fixtures";

type BattleFixture =
  | "space-battle-victory"
  | "space-battle-defeat"
  | "space-diplomacy-power"
  | "space-diplomacy-power-fail"
  | "space-diplomacy-aggressive"
  | "space-bully-scared"
  | "space-bully-surrender"
  | "space-unoccupied";

async function startBattleFixture(
  page: import("@playwright/test").Page,
  fixture: BattleFixture,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Battle Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.getByRole("tab", { name: "Interstellar" }).click();
}

async function advanceBattle(page: import("@playwright/test").Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const phase = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
    );
    if (phase !== "inProgress") return;
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  }
}

test("wins a hostile battle through the starship controls and records settlement rewards @battle @colonise", async ({
  page,
}) => {
  await startBattleFixture(page, "space-battle-victory");
  const pane = page.getByTestId("starship-pane");
  await pane.getByRole("button", { name: "Enter war mode" }).click();
  await pane.getByTestId("starship-battle-engage-button").click();
  await advanceBattle(page);

  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("victory");
  const victoryNotice = page.locator(
    '[data-testid="game-notification"][data-classification="battle"]',
  );
  await expect(victoryNotice).toContainText("Victory");
  const victory = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destinationId = victory.run.space.starship.destinationSystemId;
  const destinationProfile = victory.run.space.systemProfiles.find(
    (profile) => profile.systemId === destinationId,
  );
  expect(destinationProfile).toBeDefined();
  expect(victory.run.space.systemEncounters[0]?.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });

  await pane.getByTestId("starship-settle-system-button").click();
  await expect(pane.getByTestId("starship-system-settled")).toBeVisible();
  const settled = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(settled.permanent.settledSystemIds).toContain(destinationId);
  expect(settled.permanent.ascendencyPoints).toBe(destinationProfile!.ascendencyPoints * 2);
  expect(settled.permanent.gloryPoints).toBe(0);
  expect(settled.run.space.ascendencyAwardedThisRun).toBe(true);
  expect(
    await page.evaluate(() => window.miaplacidusTest!.dispatch({ type: "space.system.settle" })),
  ).toBe(false);
});

test("retains the starship and surviving enemy after defeat, then retries with rebuilt ships @battle", async ({
  page,
}) => {
  await startBattleFixture(page, "space-battle-defeat");
  const pane = page.getByTestId("starship-pane");
  const destinationBefore = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
  );
  await pane.getByRole("button", { name: "Enter war mode" }).click();
  await pane.getByTestId("starship-battle-engage-button").click();
  await advanceBattle(page);

  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("defeat");
  const defeatNotice = page.locator(
    '[data-testid="game-notification"][data-classification="battle"]',
  );
  await expect(defeatNotice).toContainText("Defeat");
  const defeat = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(defeat.run.space.playerFleets.scout).toBe(0);
  expect(defeat.run.space.systemEncounters[0]?.enemyFleets.air).toBeGreaterThan(0);
  expect(defeat.run.space.starship.destinationSystemId).toBe(destinationBefore);

  await pane
    .getByTestId("starship-fleet-scout")
    .getByRole("button", { name: "Build one ship" })
    .click();
  const rebuilt = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(rebuilt.run.space.playerFleets.scout).toBe(1);
  expect(rebuilt.run.space.systemEncounters[0]?.battle.playerHealthPool.scout).toBe(100);

  await pane.getByRole("button", { name: "Enter war mode" }).click();
  await pane.getByTestId("starship-battle-engage-button").click();
  const retry = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(retry.run.space.systemEncounters[0]?.battle.phase).toBe("inProgress");
  expect(retry.run.space.starship.destinationSystemId).toBe(destinationBefore);
});

test("shows the vassalization success result through the envoy controls @diplomacy", async ({
  page,
}) => {
  await startBattleFixture(page, "space-diplomacy-power");
  const pane = page.getByTestId("starship-pane");
  const diplomacy = pane.getByTestId("starship-diplomacy");
  await diplomacy.getByRole("button", { name: "Request vassalization" }).click();

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("vassalized");
  expect(state.run.space.systemEncounters[0]?.attitude).toBe("surrendered");
  expect(state.run.space.systemEncounters[0]?.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });
  await expect(pane.getByTestId("starship-settle-system-button")).toBeEnabled();
});

test("shows failed vassalization and offers war through the envoy controls @diplomacy", async ({
  page,
}) => {
  await startBattleFixture(page, "space-diplomacy-power-fail");
  const pane = page.getByTestId("starship-pane");
  await pane
    .getByTestId("starship-diplomacy")
    .getByRole("button", { name: "Request vassalization" })
    .click();

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("vassalizationFailed");
  expect(state.run.space.systemEncounters[0]?.warReady).toBe(true);
  await expect(pane.getByTestId("starship-enter-war-button")).toBeEnabled();
});

test("covers both bully outcomes and forced war through the envoy controls @diplomacy @battle", async ({
  page,
}) => {
  await startBattleFixture(page, "space-bully-scared");
  const pane = page.getByTestId("starship-pane");
  await pane
    .getByTestId("starship-diplomacy")
    .getByRole("button", { name: "Bully the civilization" })
    .click();
  let state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("bullyScared");
  expect(state.run.space.systemEncounters[0]?.attitude).toBe("scared");
  expect(state.run.space.systemEncounters[0]?.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });
  await expect(pane.getByTestId("starship-settle-system-button")).toBeEnabled();

  await startBattleFixture(page, "space-bully-surrender");
  const surrenderPane = page.getByTestId("starship-pane");
  await surrenderPane
    .getByTestId("starship-diplomacy")
    .getByRole("button", { name: "Bully the civilization" })
    .click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("bullySurrendered");
  expect(state.run.space.systemEncounters[0]?.attitude).toBe("surrendered");

  await startBattleFixture(page, "space-diplomacy-aggressive");
  const hostilePane = page.getByTestId("starship-pane");
  await hostilePane
    .getByTestId("starship-diplomacy")
    .getByRole("button", { name: "Bully the civilization" })
    .click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("bullyAttack");
  expect(state.run.space.systemEncounters[0]?.warReady).toBe(true);
  await hostilePane.getByTestId("starship-enter-war-button").click();
  await hostilePane.getByTestId("starship-battle-engage-button").click();
  expect(
    (await page.evaluate(() => window.miaplacidusTest!.getState())).run.space.systemEncounters[0]
      ?.battle.phase,
  ).toBe("inProgress");
});

test("settles an unoccupied arrival without opening battle @colonise", async ({ page }) => {
  await startBattleFixture(page, "space-unoccupied");
  const pane = page.getByTestId("starship-pane");
  const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateBefore.run.space.systemEncounters[0]?.civilizationLevel).toBe("unsentient");
  const destinationProfile = stateBefore.run.space.systemProfiles.find(
    (profile) => profile.systemId === stateBefore.run.space.starship.destinationSystemId,
  );
  expect(destinationProfile).toBeDefined();
  await expect(pane.getByTestId("starship-battle-engage-button")).toHaveCount(0);

  await pane.getByTestId("starship-settle-system-button").click();
  const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateAfter.permanent.settledSystemIds).toContain(
    stateBefore.run.space.starship.destinationSystemId,
  );
  expect(stateAfter.permanent.ascendencyPoints).toBe(destinationProfile!.ascendencyPoints);
  expect(stateAfter.permanent.gloryPoints).toBe(0);
});
