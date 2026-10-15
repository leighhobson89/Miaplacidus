import { expect, test } from "../_harness/fixtures";
import { confirmStarshipWarEntry } from "../_harness/war-mode";

type DiplomacyFixture =
  | "space-diplomacy-power"
  | "space-diplomacy-power-fail"
  | "space-diplomacy-aggressive"
  | "space-bully-scared"
  | "space-bully-surrender";

async function startDiplomacyFixture(
  page: import("@playwright/test").Page,
  fixture: DiplomacyFixture,
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
  await page.getByRole("tab", { name: /Colonise/ }).click();
}

test("an impression shift closes the vassalization gate below admiration @diplomacy", async ({
  page,
}) => {
  await startDiplomacyFixture(page, "space-diplomacy-power");
  const diplomacy = page.getByTestId("starship-pane").getByTestId("starship-diplomacy");
  const vassalize = diplomacy.getByTestId("starship-diplomacy-vassalize-button");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());

  expect(before.run.space.systemEncounters[0]?.currentImpression).toBe(95);
  await expect(vassalize).toBeEnabled();

  await diplomacy.getByTestId("starship-diplomacy-harmony-button").click();

  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.space.systemEncounters[0]?.currentImpression).toBe(86);
  expect(after.run.space.systemEncounters[0]?.latestDifferenceInImpression).toBe(-9);
  await expect(diplomacy.getByTestId("starship-diplomacy-message")).toBeVisible();
  await expect(vassalize).toBeDisabled();
  await expect(diplomacy.locator("#starship-diplomacy-vassalize-reason")).toBeVisible();
});

test("shows the vassalization success result through the envoy controls @diplomacy", async ({
  page,
}) => {
  await startDiplomacyFixture(page, "space-diplomacy-power");
  const pane = page.getByTestId("starship-pane");
  const diplomacy = pane.getByTestId("starship-diplomacy");
  await diplomacy.getByTestId("starship-diplomacy-vassalize-button").click();

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("vassalized");
  expect(state.run.space.systemEncounters[0]?.attitude).toBe("surrendered");
  expect(state.run.space.systemEncounters[0]?.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });
  await expect(pane.getByTestId("starship-settle-system-button")).toBeEnabled();
});

test("shows failed vassalization and offers war through the envoy controls @diplomacy", async ({
  page,
}) => {
  await startDiplomacyFixture(page, "space-diplomacy-power-fail");
  const pane = page.getByTestId("starship-pane");
  await pane
    .getByTestId("starship-diplomacy")
    .getByTestId("starship-diplomacy-vassalize-button")
    .click();

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("vassalizationFailed");
  expect(state.run.space.systemEncounters[0]?.warReady).toBe(true);
  await expect(pane.getByTestId("starship-enter-war-button")).toBeEnabled();
});

test("covers both bully outcomes and forced war through the envoy controls @diplomacy @battle", async ({
  page,
}) => {
  await startDiplomacyFixture(page, "space-bully-scared");
  const pane = page.getByTestId("starship-pane");
  await pane
    .getByTestId("starship-diplomacy")
    .getByTestId("starship-diplomacy-bully-button")
    .click();
  let state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("bullyScared");
  expect(state.run.space.systemEncounters[0]?.attitude).toBe("scared");
  expect(state.run.space.systemEncounters[0]?.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });
  await expect(pane.getByTestId("starship-settle-system-button")).toBeEnabled();

  await startDiplomacyFixture(page, "space-bully-surrender");
  const surrenderPane = page.getByTestId("starship-pane");
  await surrenderPane
    .getByTestId("starship-diplomacy")
    .getByTestId("starship-diplomacy-bully-button")
    .click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("bullySurrendered");
  expect(state.run.space.systemEncounters[0]?.attitude).toBe("surrendered");

  await startDiplomacyFixture(page, "space-diplomacy-aggressive");
  const hostilePane = page.getByTestId("starship-pane");
  await hostilePane
    .getByTestId("starship-diplomacy")
    .getByTestId("starship-diplomacy-bully-button")
    .click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.space.systemEncounters[0]?.lastDiplomacyMessage).toBe("bullyAttack");
  expect(state.run.space.systemEncounters[0]?.warReady).toBe(true);
  await confirmStarshipWarEntry(hostilePane);
  await hostilePane.getByTestId("starship-battle-engage-button").click();
  expect(
    (await page.evaluate(() => window.miaplacidusTest!.getState())).run.space.systemEncounters[0]
      ?.battle.phase,
  ).toBe("inProgress");
});
