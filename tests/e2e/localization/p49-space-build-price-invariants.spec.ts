import { expect, test, type Page } from "../_harness/fixtures";
import {
  FLEET_ENVOY_COST,
  LAUNCH_PAD_COST,
  PLAYER_FLEET_IDS,
  ROCKET_FUEL_PUMP_BASE_COST,
  STARSHIP_MODULE_IDS,
  TELESCOPE_COST,
  type RocketId,
  type SpacePurchaseCost,
} from "../../../src/content/space";
import { LOCALE_IDS } from "../../../src/content/ids";
import { permanentPerkPurchaseCount } from "../../../src/content/economyRules";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatNumber } from "../../../src/app/numberFormatting";
import { playerFleetBuildCost } from "../../../src/engine/fleetMechanics";
import { philosophyDiscountedSpaceCost, philosophyRepeatableRank } from "../../../src/engine/philosophy";
import { rocketPartCost, starshipModulePartCost } from "../../../src/engine/spaceRules";
import type { GameState } from "../../../src/engine/state";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";

type SpaceFixture =
  | "space-telescope"
  | "space-rocket-part-exact"
  | "space-rocket-fuel-pump"
  | "space-starship"
  | "space-starship-ready";

async function startSpaceFixture(
  page: Page,
  fixture: SpaceFixture,
  pioneerName: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    for (const key of Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    )) {
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneerName);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await saveNowFromSettings(page);
}

function expectedCostLines(
  state: GameState,
  cost: SpacePurchaseCost,
  cashDigits: 0 | 2,
  amountDigits: 0 | 2,
): string[] {
  const locale = state.settings.locale;
  return [
    formatCurrency(
      locale,
      cost.cash,
      state.settings.currencyId ?? "usd",
      cashDigits,
      state.settings.notation,
    ),
    ...(cost.antimatter === undefined
      ? []
      : [`${formatNumber(locale, cost.antimatter, amountDigits, state.settings.notation)} ${spaceText(locale, "antimatterStored")}`]),
    ...cost.materials.map(
      ({ goodId, amount }) =>
        `${formatNumber(locale, amount, amountDigits, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
    ),
  ];
}

async function readIdentity(page: Page) {
  return page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      pioneerName: state.run.pioneerName,
      locale: state.settings.locale,
      cash: state.run.cash,
      goods: Object.fromEntries(
        Object.entries(state.run.goods).map(([id, good]) => [id, good.quantity]),
      ),
      rockets: state.run.space.rockets,
      starshipModules: state.run.space.starshipModules,
      playerFleets: state.run.space.playerFleets,
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
}

async function expectStableIdentity(
  page: Page,
  baseline: Awaited<ReturnType<typeof readIdentity>>,
  locale: (typeof LOCALE_IDS)[number],
  stableTabIds: readonly string[] | null,
): Promise<readonly string[]> {
  const current = await readIdentity(page);
  expect(current.locale, `${locale} active locale`).toBe(locale);
  expect(current.cash, `${locale} cash balance`).toBe(baseline.cash);
  expect(current.goods, `${locale} material quantities`).toEqual(baseline.goods);
  expect(current.rockets, `${locale} rocket identities and progress`).toEqual(baseline.rockets);
  expect(current.starshipModules, `${locale} Starship module progress`).toEqual(
    baseline.starshipModules,
  );
  expect(current.playerFleets, `${locale} Fleet quantities`).toEqual(baseline.playerFleets);
  expect(current.pioneerName, `${locale} pioneer/save name`).toBe(baseline.pioneerName);
  expect(current.slotHeads, `${locale} save head keys`).toEqual(baseline.slotHeads);
  expect(current.lastStartedSlot, `${locale} selected save slot`).toBe(baseline.lastStartedSlot);
  if (stableTabIds) expect(current.tabIds, `${locale} stable tab IDs`).toEqual(stableTabIds);
  return stableTabIds ?? current.tabIds;
}

async function finishSaveIdentityCheck(
  page: Page,
  baseline: Awaited<ReturnType<typeof readIdentity>>,
): Promise<void> {
  await saveNowFromSettings(page);
  const afterSave = await readIdentity(page);
  expect(afterSave.slotHeads).toEqual(baseline.slotHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
}

test("live locale switching preserves Space Telescope and Launch Pad quotes @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startSpaceFixture(page, "space-telescope", "Telescope Locale Pioneer");
  const baseline = await readIdentity(page);
  expect(baseline.slotHeads).toHaveLength(1);
  let stableTabIds: readonly string[] | null = null;

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const telescopeCost = philosophyDiscountedSpaceCost(
      state,
      TELESCOPE_COST,
      "efficientAssembly",
      0.01,
      true,
    );
    const launchPadCost = philosophyDiscountedSpaceCost(
      state,
      LAUNCH_PAD_COST,
      "efficientAssembly",
      0.01,
      true,
    );

    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();
    expect(state.run.space.telescopeBuilt, `${locale} telescope remains buildable`).toBe(false);
    const telescopeList = page.getByRole("list", { name: spaceText(locale, "telescopeCost") });
    await expect(telescopeList.locator("li")).toHaveText(
      expectedCostLines(state, telescopeCost, 0, 0),
    );
    await expect(page.locator("#tab-space-mining-telescope")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page.locator("#tab-space-mining-launch-pad").click();
    const launchPadList = page.getByRole("list", { name: rocketText(locale, "launchPadCost") });
    await expect(launchPadList.locator("li")).toHaveText(
      expectedCostLines(state, launchPadCost, 0, 0),
    );
    await expect(page.locator("#tab-space-mining-launch-pad")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    stableTabIds = await expectStableIdentity(page, baseline, locale, stableTabIds);
  }

  await finishSaveIdentityCheck(page, baseline);
});

test("live locale switching preserves Rocket part and fuel-pump quotes @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startSpaceFixture(page, "space-rocket-part-exact", "Rocket Quote Locale Pioneer");
  const baseline = await readIdentity(page);
  let stableTabIds: readonly string[] | null = null;

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-launch-pad").click();
    const rocketId: RocketId = "rocket1";
    const rocket = state.run.space.rockets[rocketId];
    const massProduction =
      permanentPerkPurchaseCount(state.permanent.acquiredPerks, "launchPadMassProduction") +
      philosophyRepeatableRank(state, "launchPadMassProduction");
    const cost = rocketPartCost(rocket.builtParts, massProduction);
    const quote = page.getByTestId("rocket-card-rocket1").locator(".cost-line");
    for (const line of expectedCostLines(state, cost, 0, 0)) await expect(quote).toContainText(line);
    await expect(page.locator("#tab-space-mining-launch-pad")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    stableTabIds = await expectStableIdentity(page, baseline, locale, stableTabIds);
  }

  await finishSaveIdentityCheck(page, baseline);
});

test("live locale switching preserves Rocket fuel-pump quote @locale @p49", async ({ page }) => {
  test.setTimeout(120_000);
  await startSpaceFixture(page, "space-rocket-fuel-pump", "Fuel Pump Locale Pioneer");
  const baseline = await readIdentity(page);
  let stableTabIds: readonly string[] | null = null;

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const rocketId: RocketId = "rocket1";
    expect(state.run.space.rockets[rocketId].fuelPumpPurchased).toBe(false);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();
    const costText = page.getByTestId("rocket-card-rocket1").locator(".cost-line");
    await expect(costText).toContainText(rocketText(locale, "pumpCost"));
    await expect(costText).toContainText(
      formatCurrency(
        locale,
        ROCKET_FUEL_PUMP_BASE_COST[rocketId],
        state.settings.currencyId ?? "usd",
        0,
        state.settings.notation,
      ),
    );
    await expect(page.locator("#tab-space-mining-rocket-1")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    stableTabIds = await expectStableIdentity(page, baseline, locale, stableTabIds);
  }

  await finishSaveIdentityCheck(page, baseline);
});

test("live locale switching preserves Starship module quotes @locale @p49", async ({ page }) => {
  test.setTimeout(120_000);
  await startSpaceFixture(page, "space-starship", "Starship Build Locale Pioneer");
  const baseline = await readIdentity(page);
  const baselineState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const elevatorPurchases =
    permanentPerkPurchaseCount(baselineState.permanent.acquiredPerks, "spaceElevator") +
    philosophyRepeatableRank(baselineState, "spaceElevator");
  let stableTabIds: readonly string[] | null = null;

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();
    for (const moduleId of STARSHIP_MODULE_IDS) {
      const module = state.run.space.starshipModules[moduleId];
      const cost = starshipModulePartCost(moduleId, module.builtParts, elevatorPurchases);
      const costList = page.getByTestId(`starship-module-${moduleId}`).locator(".space-cost-list li");
      await expect(costList).toHaveText(expectedCostLines(state, cost, 2, 2));
    }
    await expect(page.locator("#tab-interstellar-starship")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    stableTabIds = await expectStableIdentity(page, baseline, locale, stableTabIds);
  }

  await finishSaveIdentityCheck(page, baseline);
});

test("live locale switching preserves Fleet Envoy and ship quotes @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startSpaceFixture(page, "space-starship-ready", "Fleet Build Locale Pioneer");
  const baseline = await page.evaluate(() => window.miaplacidusTest!.getState());
  const baselineIdentity = await readIdentity(page);
  let stableTabIds: readonly string[] | null = null;

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-fleet-hangar").click();

    const hangar = page.getByTestId("starship-fleet-hangar");
    await expect(hangar.locator(".space-cost-list").first().locator("li")).toHaveText(
      expectedCostLines(state, FLEET_ENVOY_COST, 2, 2),
    );
    for (const fleetId of PLAYER_FLEET_IDS) {
      const cost = playerFleetBuildCost(state, fleetId);
      const costList = page.getByTestId(`starship-fleet-${fleetId}`).locator(".space-cost-list li");
      await expect(costList).toHaveText(expectedCostLines(state, cost, 2, 2));
    }
    await expect(page.locator("#tab-interstellar-fleet-hangar")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    stableTabIds = await expectStableIdentity(page, baselineIdentity, locale, stableTabIds);
  }

  await finishSaveIdentityCheck(page, baselineIdentity);
});
