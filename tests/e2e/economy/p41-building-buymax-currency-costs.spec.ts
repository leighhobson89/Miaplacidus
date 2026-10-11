import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { selectBuildingBuyMax } from "../../../src/engine/selectors";

async function startPowerBuildingsFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key?.startsWith(prefix) ?? false,
    );
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=power-buildings");
  await page.getByLabel("Pioneer name").fill("P-41 Buy Max Cost Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState()))).toBe(true);
}

const buyMaxTargets = [
  { id: "scienceLab", mainTab: "Research", subTab: "#tab-research-science-buildings" },
  { id: "powerPlant1", mainTab: "Energy", subTab: "#tab-energy-power" },
  { id: "battery1", mainTab: "Energy", subTab: "#tab-energy-batteries" },
] as const;

test("P-41 formats Research, Energy, and Battery Buy Max cash totals in every notation @p41-building-buymax-currency-costs", async ({
  page,
}) => {
  await startPowerBuildingsFixture(page);

  const renderedPreviews: Record<
    "condensed" | "standard" | "scientific",
    Record<(typeof buyMaxTargets)[number]["id"], string>
  > = {
    condensed: { scienceLab: "", powerPlant1: "", battery1: "" },
    standard: { scienceLab: "", powerPlant1: "", battery1: "" },
    scientific: { scienceLab: "", powerPlant1: "", battery1: "" },
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);

    for (const target of buyMaxTargets) {
      await page.locator(".game-nav").getByRole("tab", { name: target.mainTab }).click();
      await page.locator(target.subTab).click();
      const card = page.locator(`[data-building-id="${target.id}"]`);
      const plan = selectBuildingBuyMax(state, target.id);
      expect(plan.enabled).toBe(true);
      expect(plan.count).toBeGreaterThan(0);
      await expect(card.getByRole("button", { name: "Buy max", exact: true })).toBeEnabled();

      const expectedCash = formatCurrency(
        "en",
        plan.cashCost,
        state.settings.currencyId ?? "usd",
        2,
        notation,
      );
      const preview = card.locator(".economy-rate");
      await expect(preview).toContainText(expectedCash);
      renderedPreviews[notation][target.id] = await preview.innerText();
    }
  }

  for (const target of buyMaxTargets) {
    expect(renderedPreviews.scientific[target.id]).not.toBe(renderedPreviews.standard[target.id]);
  }
});
