import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatDuration } from "../../../src/app/timeFormatting";
import { createEconomyTickPlan } from "../../../src/engine/economySimulation";

async function startBatteryCycleFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const clearedFlag = "miaplacidus:test:economy-storage-cleared";
    if (sessionStorage.getItem(clearedFlag) === "1") return;
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem(clearedFlag, "1");
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=battery-cycle");
  await page.getByLabel("Pioneer name").fill("P-41 Battery Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("P-41 formats and updates the Power battery countdown in every notation @p41-battery-duration", async ({
  page,
}) => {
  await startBatteryCycleFixture(page);
  const powerValue = page.getByTestId("top-stat-power").locator(".top-stat-value");

  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-batteries").click();
  await page
    .locator('[data-building-id="battery1"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();
  await page.locator("#tab-energy-power").click();
  await page
    .locator('[data-building-id="powerPlant2"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();

  await page.getByRole("tab", { name: /Research/ }).click();
  await page.locator("#tab-research-science-buildings").click();
  const lab = page.locator('[data-building-id="scienceLab"]');
  await lab.getByRole("button", { name: "Buy", exact: true }).click();
  await lab.getByRole("button", { name: "Pause", exact: true }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.quantity))
    .toBe(300);

  await lab.getByRole("button", { name: "Resume", exact: true }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.quantity))
    .toBe(150);
  await expect(powerValue).toHaveClass(/is-discharging/);

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const plan = createEconomyTickPlan(state);
    const netPowerRate = plan.generationPerSecond - plan.demandPerSecond;
    expect(netPowerRate).toBeLessThan(0);
    const secondsRemaining = state.run.economy.power.quantity / -netPowerRate;
    await expect(powerValue).toContainText(formatDuration("en", secondsRemaining * 1000, notation));
  }

  const beforeState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const beforePlan = createEconomyTickPlan(beforeState);
  const beforeSeconds =
    beforeState.run.economy.power.quantity /
    -(beforePlan.generationPerSecond - beforePlan.demandPerSecond);
  const beforeText = formatDuration("en", beforeSeconds * 1000, "scientific");
  await expect(powerValue).toContainText(beforeText);

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  const afterState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const afterPlan = createEconomyTickPlan(afterState);
  const afterSeconds =
    afterState.run.economy.power.quantity /
    -(afterPlan.generationPerSecond - afterPlan.demandPerSecond);
  const afterText = formatDuration("en", afterSeconds * 1000, "scientific");
  await expect(powerValue).toContainText(afterText);
  expect(afterText).not.toBe(beforeText);
});
