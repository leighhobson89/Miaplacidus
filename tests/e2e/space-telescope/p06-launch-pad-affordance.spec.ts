import { expect, test } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LAUNCH_PAD_COST, type SpacePurchaseCost } from "../../../src/content/space";
import { philosophyDiscountedSpaceCost } from "../../../src/engine/philosophy";
import type { GameState } from "../../../src/engine/state";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";

function expectedCostLines(state: GameState, cost: SpacePurchaseCost): string[] {
  return [
    formatCurrency(
      state.settings.locale,
      cost.cash,
      state.settings.currencyId ?? "usd",
      0,
      state.settings.notation,
    ),
    ...cost.materials.map(
      ({ goodId, amount }) =>
        `${formatNumber(state.settings.locale, amount, 0, state.settings.notation)} ${economyGoodName(state.settings.locale, goodId)}`,
    ),
  ];
}

test("Launch Pad reason follows an Iron shortfall and recovers through an actual build @p06-launch-pad-affordance", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("P06 Launch Pad Affordance Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
  const cost = philosophyDiscountedSpaceCost(
    initial,
    LAUNCH_PAD_COST,
    "efficientAssembly",
    0.01,
    true,
  );
  const ironRequirement = cost.materials.find(({ goodId }) => goodId === "iron")!.amount;
  const ironShortStock = Math.floor(ironRequirement) - 1;
  const ironQuantity = initial.run.goods.iron.quantity;
  const ironToSell = ironQuantity - ironShortStock;
  expect(Number.isSafeInteger(ironToSell)).toBe(true);
  expect(ironToSell).toBeGreaterThan(0);

  const shortState = await page.evaluate((amount) => {
    const accepted = window.miaplacidusTest!.dispatch({
      type: "resource.sell",
      goodId: "iron",
      amount,
    });
    if (!accepted) throw new Error("Could not prepare the Launch Pad Iron shortfall.");
    return window.miaplacidusTest!.getState();
  }, ironToSell);
  expect(shortState.run.goods.iron.quantity).toBe(ironShortStock);

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();
  const pane = page.getByTestId("space-mining-pane");
  const costList = pane.getByRole("list", { name: rocketText("en", "launchPadCost") });
  const buildButton = pane.getByRole("button", {
    name: rocketText("en", "buildLaunchPad"),
    exact: true,
  });
  await expect(costList.getByRole("listitem")).toHaveText(expectedCostLines(initial, cost));
  await expect(buildButton).toBeDisabled();
  await expect(buildButton).toHaveAttribute("aria-describedby", "launch-pad-build-reason");
  await expect(page.locator("#launch-pad-build-reason")).toHaveText(
    spaceText("en", "reasonInsufficientMaterial", {
      material: economyGoodName("en", "iron"),
      amount: formatNumber("en", ironRequirement, 0, initial.settings.notation),
    }),
  );

  let recovered = await page.evaluate(() => window.miaplacidusTest!.getState());
  while (recovered.run.goods.iron.quantity < ironRequirement) {
    const collected = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "resource.collect", goodId: "iron" }),
    );
    expect(collected).toBe(true);
    recovered = await page.evaluate(() => window.miaplacidusTest!.getState());
  }
  await expect(buildButton).toBeEnabled();
  await expect(buildButton).not.toHaveAttribute("aria-describedby", /.+/);

  const beforeBuild = recovered;
  await buildButton.click();
  const afterBuild = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterBuild.run.space.launchPadBuilt).toBe(true);
  expect(afterBuild.run.cash).toBeCloseTo(beforeBuild.run.cash - cost.cash, 6);
  for (const material of cost.materials) {
    expect(afterBuild.run.goods[material.goodId].quantity).toBeCloseTo(
      beforeBuild.run.goods[material.goodId].quantity - material.amount,
      6,
    );
  }
});
