import { economyGoodName } from "../../../src/app/economyDisplay";
import { COMPOUND_IDS, type MaterialId, LOCALE_IDS } from "../../../src/content/ids";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";

const SOURCE_SHORT_LABEL_RESOURCES = [
  "iron",
  "carbon",
  "sodium",
  "neon",
  "hydrogen",
  "oxygen",
  "silicon",
] as const satisfies readonly MaterialId[];

test("compound recipes show localized full names for every source short-label resource @phase7-locale @compounds @localization", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");
  await dismissTutorialOfferIfPresent(page);
  await page.locator("#tab-compounds").click();

  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const renderedRecipes: string[] = [];
    for (const compoundId of COMPOUND_IDS) {
      await page.locator(`#tab-compounds-${compoundId}`).click();
      const recipe = page.locator(`[data-compound-id="${compoundId}"] .compound-recipe`);
      await expect(recipe).toBeVisible();
      renderedRecipes.push(await recipe.innerText());
    }

    const allRecipes = renderedRecipes.join("\n");
    for (const resourceId of SOURCE_SHORT_LABEL_RESOURCES) {
      expect(allRecipes).toContain(economyGoodName(locale, resourceId));
    }
  }
});
