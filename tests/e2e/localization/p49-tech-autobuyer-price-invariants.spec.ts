import { expect, test } from "../_harness/fixtures";
import { COMPOUND_CATALOG, MATERIAL_CATALOG } from "../../../src/content/economy";
import { autobuyerUpgradeId, COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS } from "../../../src/content/ids";
import { TECHNOLOGY_CATALOG, MEGASTRUCTURE_TECHNOLOGY_IDS } from "../../../src/content/technology";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatNumber } from "../../../src/app/numberFormatting";
import { selectAutobuyerBuyMax } from "../../../src/engine/selectors";
import type { GameState } from "../../../src/engine/state";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";
import { hydrogenAutobuyerPrice, HYDROGEN_AUTOBUYER_RATE } from "../../../src/content/hydrogen";
import { philosophyRepeatableRank } from "../../../src/engine/philosophy";
import { repeatedPerkMultiplier, scaledPriceAfterPurchases } from "../../../src/content/economyRules";
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
  await page.getByLabel("Pioneer name").fill("Tech Autobuyer Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

function previewText(
  state: GameState,
  goodId: (typeof MATERIAL_IDS)[number] | (typeof COMPOUND_IDS)[number],
  tier: 1 | 2 | 3 | 4,
): string {
  const locale = state.settings.locale;
  const selection = selectAutobuyerBuyMax(state, goodId, tier);
  const isMaterial = MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number]);
  const definition = isMaterial
    ? MATERIAL_CATALOG[goodId as (typeof MATERIAL_IDS)[number]]
    : COMPOUND_CATALOG[goodId as (typeof COMPOUND_IDS)[number]];
  const effectiveRate =
    definition.buyerTiers[tier - 1]!.ratePerSecond *
    repeatedPerkMultiplier(state.permanent.acquiredPerks, "smartAutoBuyers", 1.5);
  const format = (value: number, digits = 2) =>
    formatNumber(locale, value, digits, state.settings.notation);
  return formatEconomyMessage(locale, "buyMaxPreview", {
    count: format(selection.count),
    costs: `${format(selection.totalCost)} ${economyGoodName(locale, goodId)}`,
    result: `+${format(selection.count * effectiveRate)} ${economyLabel(locale, "perSecond")}`,
  });
}

test("live locale changes preserve Tech Tree and autobuyer prices @locale @p49", async ({ page }) => {
  test.setTimeout(180_000);
  await startFullEconomyFixture(page);
  await saveNowFromSettings(page);

  const readIdentity = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        locale: state.settings.locale,
        goods: Object.fromEntries(
          Object.entries(state.run.goods).map(([id, good]) => [id, good.quantity]),
        ),
        upgrades: state.run.upgrades,
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

  const baselineState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const baselineIdentity = await readIdentity();
  expect(baselineIdentity.pioneerName).toBe("Tech Autobuyer Locale Pioneer");
  expect(baselineIdentity.slotHeads).toHaveLength(1);
  expect(baselineIdentity.lastStartedSlot).toBe(
    baselineIdentity.slotHeads[0]?.slice("miaplacidus:v1:head:".length),
  );

  const verifyTechTreePrices = async (locale: GameState["settings"]["locale"]) => {
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    await expect(page.locator("[data-testid='economy-research']")).toBeVisible();
    const standardTechnologies = TECHNOLOGY_CATALOG.filter(
      (technology) => !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(technology.id),
    );
    const nodes = page.locator(".technology-map-node[data-technology-id]");
    await expect(nodes).toHaveCount(standardTechnologies.length);
    for (const technology of standardTechnologies) {
      const node = page.locator(`.technology-map-node[data-technology-id="${technology.id}"]`);
      await expect(node).toBeVisible();
      const expected = `${formatNumber(locale, technology.price, 2, baselineState.settings.notation)} ${economyLabel(locale, "researchCostSuffix")}`;
      await expect(node.locator(".technology-map-node-cost")).toHaveText(expected);
    }
    await expect(page.locator("#tab-research-tech-tree")).toHaveAttribute("aria-selected", "true");
  };

  const verifyHydrogenAutobuyer = async (locale: GameState["settings"]["locale"]) => {
    await page.locator("#tab-hydrogen").click();
    await page.locator("#tab-resources-hydrogen").click();
    const section = page.locator("details.hydrogen-autobuyer-section");
    if (!(await section.getAttribute("open"))) await section.locator("summary").click();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const owned = state.run.upgrades[autobuyerUpgradeId("hydrogen", 1)] ?? 0;
    const price = hydrogenAutobuyerPrice(owned);
    const cost = section.locator(".cost-line strong").nth(1);
    await expect(cost).toContainText(formatNumber(locale, price, 2, state.settings.notation));
    const selection = selectAutobuyerBuyMax(state, "hydrogen", 1);
    const format = (value: number, digits = 2) =>
      formatNumber(locale, value, digits, state.settings.notation);
    const name = translate(locale, "hydrogen.title");
    const expectedPreview = formatEconomyMessage(locale, "buyMaxPreview", {
      count: format(selection.count),
      costs: `${format(selection.totalCost)} ${name}`,
      result: `+${format(selection.count * HYDROGEN_AUTOBUYER_RATE)} ${name} ${economyLabel(locale, "perSecond")}`,
    });
    await expect(section.locator("#hydrogen-autobuyer-buy-max-preview")).toHaveText(expectedPreview);
  };

  const verifyMaterialAutobuyers = async (locale: GameState["settings"]["locale"]) => {
    await page.locator("#tab-hydrogen").click();
    await page.locator("#tab-resources-hydrogen").click();
    for (const id of MATERIAL_IDS) {
      const goodPage =
        id === "hydrogen"
          ? page.locator("details.hydrogen-autobuyer-section")
          : page.locator(`.resource-good-page[data-resource-id="${id}"]`);
      if (id !== "hydrogen") await page.getByTestId(`resource-rail-${id}`).click();
      const details =
        id === "hydrogen"
          ? goodPage
          : goodPage.locator("details.economy-details").first();
      if (!(await details.getAttribute("open"))) await details.locator("summary").click();
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const tiers = details.locator(".resource-autobuyer-tiers .economy-tier");
      const tierIds = id === "hydrogen" ? ([2, 3, 4] as const) : ([1, 2, 3, 4] as const);
      await expect(tiers).toHaveCount(tierIds.length);
      for (const [index, tier] of tierIds.entries()) {
        const tierCard = tiers.nth(index);
        const definition = MATERIAL_CATALOG[id].buyerTiers[tier - 1];
        const owned = state.run.upgrades[autobuyerUpgradeId(id, tier)] ?? 0;
        const discount = 0.95 ** philosophyRepeatableRank(state, "laserMining");
        const expectedPrice = scaledPriceAfterPurchases(definition.price * discount, owned);
        await expect(tierCard.locator("button").first()).toContainText(
          formatNumber(locale, expectedPrice, 2, state.settings.notation),
        );
        await expect(tierCard.locator(`#resource-${id}-autobuyer-${tier}-buy-max-preview`)).toHaveText(
          previewText(state, id, tier),
        );
      }
    }
  };

  const verifyCompoundAutobuyers = async (locale: GameState["settings"]["locale"]) => {
    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      await page.getByTestId(`compound-rail-${id}`).click();
      const card = page.locator(`[data-compound-id="${id}"]`);
      const details = card.locator("details.economy-details");
      if (!(await details.getAttribute("open"))) await details.locator("summary").click();
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const tierCards = details.locator(".economy-tier");
      await expect(tierCards).toHaveCount(4);
      for (const tier of [1, 2, 3, 4] as const) {
        const tierCard = tierCards.nth(tier - 1);
        const definition = COMPOUND_CATALOG[id].buyerTiers[tier - 1];
        const owned = state.run.upgrades[autobuyerUpgradeId(id, tier)] ?? 0;
        const expectedPrice = scaledPriceAfterPurchases(definition.price, owned);
        await expect(tierCard.locator("button").first()).toContainText(
          formatNumber(locale, expectedPrice, 2, state.settings.notation),
        );
        await expect(tierCard.locator(`#compound-${id}-autobuyer-${tier}-buy-max-preview`)).toHaveText(
          previewText(state, id, tier),
        );
      }
    }
  };

  let stableTabIds: readonly string[] | null = null;
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await verifyTechTreePrices(locale);
    await verifyHydrogenAutobuyer(locale);
    await verifyMaterialAutobuyers(locale);
    await verifyCompoundAutobuyers(locale);

    const current = await readIdentity();
    stableTabIds ??= current.tabIds;
    expect(current.tabIds, `${locale} stable tab IDs`).toEqual(stableTabIds);
    expect(current.goods, `${locale} good quantities`).toEqual(baselineIdentity.goods);
    expect(current.upgrades, `${locale} autobuyer quantities`).toEqual(baselineIdentity.upgrades);
    expect(current.pioneerName, `${locale} canonical save name`).toBe(baselineIdentity.pioneerName);
    expect(current.slotHeads, `${locale} save head keys`).toEqual(baselineIdentity.slotHeads);
    expect(current.lastStartedSlot, `${locale} selected save slot`).toBe(
      baselineIdentity.lastStartedSlot,
    );
  }

  await saveNowFromSettings(page);
  const afterSave = await readIdentity();
  expect(afterSave.slotHeads).toEqual(baselineIdentity.slotHeads);
  expect(afterSave.lastStartedSlot).toBe(baselineIdentity.lastStartedSlot);
});
