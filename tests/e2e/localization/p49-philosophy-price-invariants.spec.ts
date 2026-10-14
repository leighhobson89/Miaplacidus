import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { PHILOSOPHY_ABILITY_RESEARCH_COST } from "../../../src/content/philosophy";
import { philosophyRepeatablePrice } from "../../../src/engine/philosophy";
import { philosophyText } from "../../../src/i18n/philosophyMessages";

test("live locale changes preserve Philosophy ability and repeatable prices @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    for (const key of Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    )) {
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Philosophy Price Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await dismissTutorialOfferIfPresent(page);

  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build Space Telescope", exact: true }).click();
  await page.getByRole("button", { name: "Study Stars", exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "survey:star-study",
      }),
    ),
  ).toBe(true);
  await page.getByTestId("philosophy-choice").getByRole("button", { name: "Expansionist" }).click();
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-philosophy").click();
  await expect(page.getByTestId("philosophy-pane")).toBeVisible();
  await saveNowFromSettings(page);
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-philosophy").click();

  const readIdentity = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        philosophyId: state.permanent.philosophyId,
        abilityActive: state.run.philosophyAbilityActive,
        ranks: state.permanent.philosophyRepeatableRanks,
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

  const baseline = await readIdentity();
  expect(baseline.pioneerName).toBe("Philosophy Price Locale Pioneer");
  expect(baseline.philosophyId).toBe("expansionist");
  expect(baseline.abilityActive).toBe(false);
  expect(baseline.slotHeads).toHaveLength(1);

  const repeatables = ["spaceElevator", "launchPadMassProduction", "asteroidAttractors", "warpDrive"] as const;
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-philosophy").click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const copy = philosophyText(locale);
    const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
    const ability = page.locator('[data-philosophy-ability="rapidExpansion"]');
    await expect(ability.locator("p").nth(1)).toHaveText(
      `${copy.nextCost}: ${number(PHILOSOPHY_ABILITY_RESEARCH_COST)} ${copy.researchShort}`,
    );
    for (const repeatableId of repeatables) {
      const card = page.locator(`[data-philosophy-repeatable="${repeatableId}"]`);
      const cost = philosophyRepeatablePrice(state, repeatableId);
      await expect(card.locator("p").nth(2), `${locale} ${repeatableId} quote`).toHaveText(
        `${copy.nextCost}: ${number(cost)} ${copy.researchShort}`,
      );
    }

    const current = await readIdentity();
    expect(current.pioneerName, `${locale} pioneer`).toBe(baseline.pioneerName);
    expect(current.philosophyId, `${locale} selected path`).toBe(baseline.philosophyId);
    expect(current.abilityActive, `${locale} ability state`).toBe(baseline.abilityActive);
    expect(current.ranks, `${locale} repeatable ranks`).toEqual(baseline.ranks);
    expect(current.tabIds, `${locale} route identities`).toEqual(baseline.tabIds);
    expect(current.slotHeads, `${locale} save slot`).toEqual(baseline.slotHeads);
    expect(current.lastStartedSlot, `${locale} active save`).toBe(baseline.lastStartedSlot);
  }
});
