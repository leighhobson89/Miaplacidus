import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import { playerFleetBuildCost } from "../../../src/engine/fleetMechanics";
import { spaceText } from "../../../src/i18n/spaceMessages";

async function startFleetHangarFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-diplomacy");
  await page.getByLabel("Pioneer name").fill("Starship Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("shows the Envoy shortfall one unit below cost and enables it at exact stock @starship-affordability", async ({
  page,
}) => {
  await startFleetHangarFixture(page);

  // Shape the deterministic fixture with valid sale commands; the Envoy
  // action itself is checked and completed through its visible UI control.
  await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const targets = { hydrogen: 7_999, silicon: 300, titanium: 120 } as const;
    for (const [goodId, target] of Object.entries(targets)) {
      const quantity = state.run.goods[goodId as keyof typeof targets].quantity;
      if (
        !window.miaplacidusTest!.dispatch({
          type: "resource.sell",
          goodId: goodId as keyof typeof targets,
          amount: quantity - target,
        })
      ) {
        throw new Error(`Could not prepare ${goodId} stock for the Envoy affordability check.`);
      }
    }
  });

  const underfunded = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(underfunded.run.goods.hydrogen.quantity).toBe(7_999);
  expect(underfunded.run.goods.silicon.quantity).toBe(300);
  expect(underfunded.run.goods.titanium.quantity).toBe(120);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-fleet-hangar").click();
  const hangar = page.getByTestId("starship-fleet-hangar");
  const envoyButton = hangar.getByTestId("starship-envoy-build");
  await expect(envoyButton).toBeDisabled();
  await expect(envoyButton).toHaveAttribute("aria-describedby", "starship-envoy-reason");
  await expect(hangar.locator("#starship-envoy-reason")).toHaveText(
    `Not enough Hydrogen. Required: ${formatNumber("en", 8_000)}.`,
  );

  await page.getByRole("tab", { name: "Resources" }).click();
  await page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true }).click();
  const exactlyAffordable = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(exactlyAffordable.run.goods.hydrogen.quantity).toBe(8_000);
  expect(exactlyAffordable.run.goods.silicon.quantity).toBe(300);
  expect(exactlyAffordable.run.goods.titanium.quantity).toBe(120);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-fleet-hangar").click();
  await expect(envoyButton).toBeEnabled();
  await envoyButton.click();

  const built = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(built.run.space.fleetEnvoyBuilt).toBe(true);
  expect(built.run.goods.hydrogen.quantity).toBe(0);
  expect(built.run.goods.silicon.quantity).toBe(0);
  expect(built.run.goods.titanium.quantity).toBe(0);
  expect(built.run.cash).toBe(exactlyAffordable.run.cash - 2_000);
});

test("shows the fleet-unit shortfall and enables purchase at exact stock @p06-starship-purchase-affordances", async ({
  page,
}) => {
  await startFleetHangarFixture(page);
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const cost = playerFleetBuildCost(state, "scout");
  const shortfall = cost.materials.find((material) => material.goodId === "hydrogen")!;

  const shaped = await page.evaluate(
    ({ target }) => {
      const current = window.miaplacidusTest!.getState().run.goods.hydrogen.quantity;
      if (current < target + 1)
        throw new Error("The Fleet fixture lacks Hydrogen for the boundary.");
      const result = window.miaplacidusTest!.dispatch({
        type: "resource.sell",
        goodId: "hydrogen",
        amount: current - (target - 1),
      });
      if (!result) throw new Error("Could not prepare the one-unit-short Hydrogen balance.");
      return window.miaplacidusTest!.getState();
    },
    { target: shortfall.amount },
  );
  expect(shaped.run.goods.hydrogen.quantity).toBeCloseTo(shortfall.amount - 1, 6);

  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-fleet-hangar").click();
  const hangar = page.getByTestId("starship-fleet-hangar");
  const scout = hangar.getByTestId("starship-fleet-scout");
  const buildButton = scout.getByTestId("starship-fleet-build-scout");
  await expect(scout.locator(".space-cost-list")).toContainText(
    `${formatNumber("en", shortfall.amount)} Hydrogen`,
  );
  await expect(buildButton).toBeDisabled();
  await expect(buildButton).toHaveAttribute("aria-describedby", "starship-fleet-scout-reason");
  await expect(scout.locator("#starship-fleet-scout-reason")).toHaveText(
    spaceText("en", "reasonInsufficientMaterial", {
      material: "Hydrogen",
      amount: formatNumber("en", shortfall.amount),
    }),
  );

  const collected = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "resource.collect", goodId: "hydrogen", amount: 1 }),
  );
  expect(collected).toBe(true);
  await expect(buildButton).toBeEnabled();
  const beforeBuild = await page.evaluate(() => window.miaplacidusTest!.getState());
  await buildButton.click();
  const afterBuild = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterBuild.run.space.playerFleets.scout).toBe(
    beforeBuild.run.space.playerFleets.scout + 1,
  );
  expect(afterBuild.run.cash).toBeCloseTo(beforeBuild.run.cash - cost.cash, 6);
  for (const material of cost.materials) {
    expect(afterBuild.run.goods[material.goodId].quantity).toBeCloseTo(
      beforeBuild.run.goods[material.goodId].quantity - material.amount,
      6,
    );
  }
});

test("Fleet Hangar build controls support keyboard focus and activation @fleet-controls", async ({
  page,
}) => {
  await startFleetHangarFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-fleet-hangar").click();

  const hangar = page.getByTestId("starship-fleet-hangar");
  const envoyButton = hangar.getByTestId("starship-envoy-build");
  const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());

  await envoyButton.focus();
  await page.keyboard.press("Tab");
  await expect(scoutButton).toBeFocused();
  expect(await scoutButton.evaluate((button) => button.matches(":focus-visible"))).toBe(true);
  const touchTarget = await scoutButton.boundingBox();
  expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
  expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

  await page.keyboard.press("Enter");
  await expect(scoutButton).toBeFocused();
  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
});

test.describe("Fleet Hangar touch controls", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test("touch users can build a fleet ship at a narrow viewport @fleet-controls", async ({
    page,
  }) => {
    await startFleetHangarFixture(page);
    await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
    await page.getByRole("tab", { name: "Interstellar" }).tap();
    await page.locator("#tab-interstellar-fleet-hangar").tap();

    const hangar = page.getByTestId("starship-fleet-hangar");
    const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    const touchTarget = await scoutButton.boundingBox();
    expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
    expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

    await scoutButton.tap();
    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
    const pageWidth = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport);
  });
});
