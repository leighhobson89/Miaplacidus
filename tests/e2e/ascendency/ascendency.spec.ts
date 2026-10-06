import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { metaText } from "../../../src/i18n/metaMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("spends AP once to buy a permanent ascendency perk", async ({ page }) => {
  await startMetaFixture(page);
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Ascendency Perks" }).click();
  const pane = page.getByTestId("ascendency-pane");
  await expect(pane.getByText("Ascendency Points: 100")).toBeVisible();
  await pane.getByRole("button", { name: "Purchase", exact: true }).first().click();
  await expect(pane.getByText("Ascendency Points: 97")).toBeVisible();
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.acquiredPerks).toContain("littleBagOfHydrogen");
  expect(state.permanent.ascendencyPoints).toBe(97);
});

test("disabled Ascendency perks explain the AP shortfall in every locale", async ({ page }) => {
  await startMetaFixture(page, "meta-market-action-reasons");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-ascendency-perks").click();

    const perk = page.locator('[data-perk-id="efficientStorage"]');
    const purchase = perk.getByRole("button");
    await expect(purchase).toBeDisabled();
    await expect(purchase).toHaveAttribute(
      "aria-describedby",
      "ascendency-perk-efficientStorage-reason",
    );
    await expect(perk.locator("#ascendency-perk-efficientStorage-reason")).toHaveText(
      metaText(locale, "perkInsufficient").replace("{required}", "10").replace("{available}", "3"),
    );
  }
});
