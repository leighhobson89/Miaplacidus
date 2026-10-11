import { expect, test } from "../_harness/fixtures";
import { COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { storagePurchaseCost } from "../../../src/content/economyRules";
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
  await page.getByLabel("Pioneer name").fill("Economy Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("live locale changes preserve every resource and compound storage quote @locale @p49", async ({
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
        notation: state.settings.notation,
        tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
          .map((tab) => tab.id)
          .sort(),
        goods: Object.fromEntries(
          Object.entries(state.run.goods).map(([id, good]) => [
            id,
            { quantity: good.quantity, capacity: good.storageCapacity },
          ]),
        ),
        slotHeads: Array.from({ length: localStorage.length }, (_, index) =>
          localStorage.key(index),
        )
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
        lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

  const baseline = await readInvariant();
  expect(baseline.pioneerName).toBe("Economy Locale Pioneer");
  expect(baseline.goods).toHaveProperty("hydrogen");
  expect(baseline.slotHeads).toHaveLength(1);
  expect(baseline.lastStartedSlot).toBe(
    baseline.slotHeads[0]?.slice("miaplacidus:v1:head:".length),
  );

  let stableTabIds: readonly string[] | null = null;
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    for (const id of MATERIAL_IDS) {
      await page.locator("#tab-hydrogen").click();
      await page.getByTestId(`resource-rail-${id}`).click();
      const goodState = await page.evaluate((goodId) => {
        const good = window.miaplacidusTest!.getState().run.goods[goodId];
        return { quantity: good.quantity, capacity: good.storageCapacity };
      }, id);
      const price = formatNumber(
        locale,
        storagePurchaseCost(goodState.capacity),
        0,
        baseline.notation,
      );
      const storageCard =
        id === "hydrogen"
          ? page.locator("#pane-hydrogen .hydrogen-storage-card:not([data-testid])")
          : page.getByTestId(`storage-card-${id}`);
      await expect(storageCard).toBeVisible();
      await expect(storageCard.locator(".cost-line")).toContainText(price);
      expect(goodState.quantity, `${locale}/${id} quantity`).toBe(baseline.goods[id]?.quantity);
      expect(goodState.capacity, `${locale}/${id} capacity`).toBe(baseline.goods[id]?.capacity);
    }

    for (const id of COMPOUND_IDS) {
      await page.locator("#tab-compounds").click();
      await page.getByTestId(`compound-rail-${id}`).click();
      const goodState = await page.evaluate((goodId) => {
        const good = window.miaplacidusTest!.getState().run.goods[goodId];
        return { quantity: good.quantity, capacity: good.storageCapacity };
      }, id);
      const price = formatNumber(
        locale,
        storagePurchaseCost(goodState.capacity),
        0,
        baseline.notation,
      );
      const storageCard = page.getByTestId(`storage-card-${id}`);
      await expect(storageCard).toBeVisible();
      await expect(storageCard.locator(".cost-line strong").first()).toContainText(price);
      expect(goodState.quantity, `${locale}/${id} quantity`).toBe(baseline.goods[id]?.quantity);
      expect(goodState.capacity, `${locale}/${id} capacity`).toBe(baseline.goods[id]?.capacity);
    }

    const current = await readInvariant();
    expect(current.locale, `${locale} active locale`).toBe(locale);
    stableTabIds ??= current.tabIds;
    expect(current.tabIds, `${locale} stable tab IDs`).toEqual(stableTabIds);
    expect(current.goods, `${locale} economy quantities and capacities`).toEqual(baseline.goods);
    expect(current.pioneerName, `${locale} canonical save name`).toBe(baseline.pioneerName);
    expect(current.slotHeads, `${locale} save head keys`).toEqual(baseline.slotHeads);
    expect(current.lastStartedSlot, `${locale} selected save slot`).toBe(baseline.lastStartedSlot);
  }

  await saveNowFromSettings(page);
  const afterSave = await readInvariant();
  expect(afterSave.slotHeads).toEqual(baseline.slotHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
});
