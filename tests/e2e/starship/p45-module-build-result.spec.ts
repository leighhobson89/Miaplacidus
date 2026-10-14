import { expect, test, type Page } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { STARSHIP_MODULES } from "../../../src/content/space";
import { starshipModulePartCost } from "../../../src/engine/spaceRules";
import { philosophyRepeatableRank } from "../../../src/engine/philosophy";
import { permanentPerkPurchaseCount } from "../../../src/content/economyRules";
import { formatNumber } from "../../../src/app/numberFormatting";
import { starshipText } from "../../../src/i18n/starshipMessages";

const PIONEER_NAME = "P-45 Starship Module Pioneer";

async function startStarshipFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-starship");
  await page.getByLabel("Pioneer name").fill(PIONEER_NAME);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("P-45 Structural module build result is visible in all six locales @p45-starship-module-result", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const locale of LOCALE_IDS) {
    await startStarshipFixture(page);
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();

    const beforeIdentity = await page.evaluate(() => ({
      pioneerName: window.miaplacidusTest!.getState().run.pioneerName,
      slotId: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
    }));
    expect(beforeIdentity).toEqual({
      pioneerName: PIONEER_NAME,
      slotId: expect.any(String),
    });

    const structural = page.getByTestId("starship-module-structural");
    const buildPart = structural.getByRole("button", {
      name: starshipText(locale, "buildPart"),
      exact: true,
    });
    const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(initial.run.space.starshipModules.structural.builtParts).toBe(0);
    const elevatorPurchases =
      permanentPerkPurchaseCount(initial.permanent.acquiredPerks, "spaceElevator") +
      philosophyRepeatableRank(initial, "spaceElevator");
    const cost = starshipModulePartCost("structural", 0, elevatorPurchases);
    expect(cost).not.toBeNull();
    const siliconCost = cost!.materials.find((material) => material.goodId === "silicon");
    expect(siliconCost).toBeDefined();
    const siliconShortStock = Math.floor(siliconCost!.amount);
    const siliconShaped = await page.evaluate((target) => {
      const state = window.miaplacidusTest!.getState();
      return window.miaplacidusTest!.dispatch({
        type: "resource.sell",
        goodId: "silicon",
        amount: state.run.goods.silicon.quantity - target,
      });
    }, siliconShortStock);
    expect(siliconShaped).toBe(true);
    const belowQuote = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(belowQuote.run.goods.silicon.quantity).toBe(siliconShortStock);
    await expect(buildPart).toBeDisabled();

    const collectSilicon = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "resource.collect",
        goodId: "silicon",
      }),
    );
    expect(collectSilicon).toBe(true);
    await expect(buildPart).toBeEnabled();

    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(before.run.goods.silicon.quantity).toBe(siliconShortStock + 1);

    await buildPart.click();

    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.run.pioneerName).toBe(beforeIdentity.pioneerName);
    expect(await page.evaluate(() => localStorage.getItem("miaplacidus:v1:lastStartedSlot"))).toBe(
      beforeIdentity.slotId,
    );
    expect(after.run.space.starshipModules.structural.builtParts).toBe(1);
    expect(after.run.cash).toBeCloseTo(before.run.cash - cost!.cash, 6);
    for (const material of cost!.materials) {
      expect(after.run.goods[material.goodId].quantity).toBeCloseTo(
        before.run.goods[material.goodId].quantity - material.amount,
        6,
      );
    }

    await expect(page.getByTestId("starship-feedback")).toHaveText(
      starshipText(locale, "partBuilt"),
    );
    await expect(structural.locator(".space-rocket-parts")).toHaveText(
      `${starshipText(locale, "parts")} ${formatNumber(locale, 1, 0, after.settings.notation)} / ${formatNumber(locale, STARSHIP_MODULES.structural.parts, 0, after.settings.notation)}`,
    );
    await expect(page.locator("#tab-interstellar-starship")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  }
});
