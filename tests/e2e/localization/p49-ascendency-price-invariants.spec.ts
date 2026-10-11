import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { ASCENDENCY_PERKS, ascendencyPerkCost, ascendencyPerkLevel } from "../../../src/content/ascendency";
import { LOCALE_IDS } from "../../../src/content/ids";
import { metaText } from "../../../src/i18n/metaMessages";

test("live locale changes preserve Ascendency perk costs and state identity @locale @p49", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-ascendency-perks").click();
  await expect(page.getByTestId("ascendency-pane")).toBeVisible();
  await saveNowFromSettings(page);
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-ascendency-perks").click();
  await expect(page.getByTestId("ascendency-pane")).toBeVisible();

  const readIdentity = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        ascendencyPoints: state.permanent.ascendencyPoints,
        perks: state.permanent.acquiredPerks,
        slotHeads: Array.from({ length: localStorage.length }, (_, index) =>
          localStorage.key(index),
        )
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
        lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

  const baseline = await readIdentity();
  expect(baseline.pioneerName).toBe("Ascendency Pioneer");
  expect(baseline.slotHeads).toHaveLength(1);

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-ascendency-perks").click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByTestId("ascendency-pane")).toBeVisible();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);

    for (const perk of ASCENDENCY_PERKS) {
      const level = ascendencyPerkLevel(state.permanent.acquiredPerks, perk.id);
      const cost = ascendencyPerkCost(state.permanent.acquiredPerks, perk.id);
      const card = page.locator(`[data-perk-id="${perk.id}"]`);
      await expect(card.locator(".cost-line"), `${locale} ${perk.id} quote`).toHaveText(
        `${metaText(locale, "level")}: ${number(level)} \u00b7 ${metaText(locale, "cost")}: ${number(cost)} AP`,
      );
    }

    const current = await readIdentity();
    expect(current.pioneerName, `${locale} pioneer`).toBe(baseline.pioneerName);
    expect(current.ascendencyPoints, `${locale} AP balance`).toBe(baseline.ascendencyPoints);
    expect(current.perks, `${locale} perk levels`).toEqual(baseline.perks);
    expect(current.slotHeads, `${locale} save slots`).toEqual(baseline.slotHeads);
    expect(current.lastStartedSlot, `${locale} active save`).toBe(baseline.lastStartedSlot);
  }
});
