import { expect, test } from "../_harness/fixtures";
import { ENERGY_BUILDINGS, SCIENCE_BUILDINGS } from "../../../src/content/economy";
import { LOCALE_IDS, type EconomicGoodId } from "../../../src/content/ids";
import { scaledPriceAfterPurchases } from "../../../src/content/economyRules";
import { displayCurrency } from "../../../src/engine/precision";
import { philosophyRepeatableRank } from "../../../src/engine/philosophy";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import type { GameState } from "../../../src/engine/state";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";

async function startFullEconomyFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    for (const key of Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    )) {
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("Research Energy Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

function localizedCash(state: GameState, locale: GameState["settings"]["locale"], amount: number) {
  return formatCurrency(
    locale,
    Number(displayCurrency(amount)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

test("live locale changes preserve Research and Energy building quotes @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFullEconomyFixture(page);
  await saveNowFromSettings(page);

  const readInvariant = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        locale: state.settings.locale,
        cash: state.run.cash,
        upgrades: state.run.upgrades,
        goods: Object.fromEntries(
          Object.entries(state.run.goods).map(([id, good]) => [id, good.quantity]),
        ),
        tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
          .map((tab) => tab.id)
          .sort(),
        slotHeads: Array.from({ length: localStorage.length }, (_, index) =>
          localStorage.key(index),
        )
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
        lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

  const baseline = await page.evaluate(() => window.miaplacidusTest!.getState());
  const baselineInvariant = await readInvariant();
  expect(baselineInvariant.pioneerName).toBe("Research Energy Locale Pioneer");
  expect(baselineInvariant.slotHeads).toHaveLength(1);
  expect(baselineInvariant.lastStartedSlot).toBe(
    baselineInvariant.slotHeads[0]?.slice("miaplacidus:v1:head:".length),
  );
  const droneDiscount = 0.95 ** philosophyRepeatableRank(baseline, "energyDrones");

  const verifyResearchQuotes = async (locale: GameState["settings"]["locale"]) => {
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-science-buildings").click();
    await expect(page.getByTestId("economy-research")).toBeVisible();
    for (const [buildingId, definition] of Object.entries(SCIENCE_BUILDINGS)) {
      const price = scaledPriceAfterPurchases(
        definition.price * droneDiscount,
        baseline.run.upgrades[buildingId as keyof typeof baseline.run.upgrades] ?? 0,
      );
      const card = page.locator(`[data-building-id="${buildingId}"]`);
      await expect(card).toBeVisible();
      await expect(card.getByText(localizedCash(baseline, locale, price), { exact: true })).toBeVisible();
    }
    await expect(page.locator("#tab-research-science-buildings")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  };

  const verifyEnergyQuotes = async (
    locale: GameState["settings"]["locale"],
    pane: "power" | "batteries",
    buildingIds: readonly (keyof typeof ENERGY_BUILDINGS)[],
  ) => {
    await page.locator("#tab-energy").click();
    await page.locator(`#tab-energy-${pane}`).click();
    for (const buildingId of buildingIds) {
      const definition = ENERGY_BUILDINGS[buildingId];
      const owned = baseline.run.upgrades[buildingId as keyof typeof baseline.run.upgrades] ?? 0;
      const cashPrice = scaledPriceAfterPurchases(
        definition.price.cash * droneDiscount,
        owned,
      );
      const card = page.locator(`[data-building-id="${buildingId}"]`);
      await expect(card).toBeVisible();
      const costId =
        pane === "power"
          ? `energy-building-${buildingId}-cost`
          : `battery-${buildingId}-cost`;
      const costLine = card.locator(`#${costId}`);
      await expect(costLine).toContainText(localizedCash(baseline, locale, cashPrice));
      for (const material of definition.price.materials) {
        const amount = scaledPriceAfterPurchases(material.amount * droneDiscount, owned);
        const formattedAmount = formatNumber(locale, amount, 2, baseline.settings.notation);
        await expect(costLine).toContainText(formattedAmount);
        await expect(costLine).toContainText(economyGoodName(locale, material.goodId as EconomicGoodId));
      }
    }
    await expect(page.locator(`#tab-energy-${pane}`)).toHaveAttribute("aria-selected", "true");
  };

  let stableTabIds: readonly string[] | null = null;
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await verifyResearchQuotes(locale);
    await verifyEnergyQuotes(locale, "power", ["powerPlant1", "powerPlant2", "powerPlant3"]);
    await verifyEnergyQuotes(locale, "batteries", ["battery1", "battery2", "battery3"]);

    const current = await readInvariant();
    stableTabIds ??= current.tabIds;
    expect(current.tabIds, `${locale} stable tab IDs`).toEqual(stableTabIds);
    expect(current.cash, `${locale} cash balance`).toBe(baselineInvariant.cash);
    expect(current.upgrades, `${locale} building quantities`).toEqual(baselineInvariant.upgrades);
    expect(current.goods, `${locale} material quantities`).toEqual(baselineInvariant.goods);
    expect(current.pioneerName, `${locale} canonical save name`).toBe(baselineInvariant.pioneerName);
    expect(current.slotHeads, `${locale} save head keys`).toEqual(baselineInvariant.slotHeads);
    expect(current.lastStartedSlot, `${locale} selected save slot`).toBe(
      baselineInvariant.lastStartedSlot,
    );
  }

  await saveNowFromSettings(page);
  const afterSave = await readInvariant();
  expect(afterSave.slotHeads).toEqual(baselineInvariant.slotHeads);
  expect(afterSave.lastStartedSlot).toBe(baselineInvariant.lastStartedSlot);
});
