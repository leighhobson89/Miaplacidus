import { expect, test } from "../_harness/fixtures";
import { ACHIEVEMENT_CATALOGUE } from "../../../src/content/achievements";
import type { GameState } from "../../../src/engine/state";
import { antimatterMiningRatePerSecond } from "../../../src/engine/spaceMechanics";

test("holding the Mining boost doubles asteroid extraction and conserves Antimatter @antimatter-boost", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261014&testLocale=en&economyFixture=space-asteroid-mining");
  await page.getByLabel("Pioneer name").fill("Antimatter Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-mining").click();

  const stateBefore = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
  const activeAsteroidId = stateBefore.run.space.rockets.rocket1.targetAsteroidId;
  expect(stateBefore.run.space.rockets.rocket1.phase).toBe("mining");
  expect(activeAsteroidId).toBeTruthy();
  const asteroidBefore = stateBefore.run.space.asteroids.find(({ id }) => id === activeAsteroidId);
  expect(asteroidBefore).toBeDefined();
  expect(stateBefore.run.space.antimatterBoostActive).toBe(false);
  const baseRate = antimatterMiningRatePerSecond(stateBefore);
  expect(baseRate).toBeGreaterThan(0);

  const boost = page.getByTestId("antimatter-boost");
  await expect(boost).toBeEnabled();
  await expect(boost).toHaveAttribute("aria-pressed", "false");
  await boost.focus();
  await page.keyboard.down("Space");
  await expect(boost).toHaveAttribute("aria-pressed", "true");
  const boostedState = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
  expect(boostedState.run.space.antimatterBoostActive).toBe(true);
  expect(antimatterMiningRatePerSecond(boostedState)).toBeCloseTo(baseRate * 2, 10);

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(5_000));
  await page.keyboard.up("Space");
  await expect(boost).toHaveAttribute("aria-pressed", "false");
  const stateAfter = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
  const asteroidAfter = stateAfter.run.space.asteroids.find(({ id }) => id === activeAsteroidId);
  expect(asteroidAfter).toBeDefined();
  const antimatterGained = stateAfter.run.space.antimatter - stateBefore.run.space.antimatter;
  const asteroidAntimatterRemoved =
    asteroidBefore!.remainingAntimatter - asteroidAfter!.remainingAntimatter;
  const extractedThisRun =
    stateAfter.run.space.antimatterMinedThisRun - stateBefore.run.space.antimatterMinedThisRun;
  const mineAllAchievement = ACHIEVEMENT_CATALOGUE.find(
    ({ id }) => id === "mineAllAntimatterAsteroid",
  );
  expect(mineAllAchievement?.reward).toMatchObject({ type: "antimatter", amount: 150 });
  const earnedMineAllAchievement =
    !stateBefore.run.achievements.unlockedIds.includes("mineAllAntimatterAsteroid") &&
    stateAfter.run.achievements.unlockedIds.includes("mineAllAntimatterAsteroid");
  const achievementBonus =
    earnedMineAllAchievement && mineAllAchievement?.reward.type === "antimatter"
      ? mineAllAchievement.reward.amount
      : 0;
  expect(antimatterGained).toBeGreaterThan(0);
  expect(extractedThisRun).toBeCloseTo(asteroidAntimatterRemoved, 6);
  expect(antimatterGained).toBeCloseTo(extractedThisRun + achievementBonus, 6);
  expect(stateAfter.run.space.antimatterBoostActive).toBe(false);
  await expect(page.getByTestId("antimatter-rate")).toContainText("/s");
});
