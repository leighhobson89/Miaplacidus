import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { casinoSpecialName, casinoText } from "../../../src/i18n/casinoMessages";

const TELESCOPE_PRIZES = [
  {
    fixture: "meta-casino-telescope-asteroid-prize",
    sourceKey: "casinoPrizeTelescopeFinishAsteroidSearch",
    prizeKey: "special_telescope_finish_asteroid_search",
  },
  {
    fixture: "meta-casino-telescope-star-study-prize",
    sourceKey: "casinoPrizeTelescopeFinishStarStudy",
    prizeKey: "special_telescope_finish_star_study",
  },
  {
    fixture: "meta-casino-telescope-void-pillage-prize",
    sourceKey: "casinoPrizeTelescopeFinishVoidPillage",
    prizeKey: "special_telescope_finish_void_pillage",
  },
] as const;

for (const { fixture, sourceKey, prizeKey } of TELESCOPE_PRIZES) {
  test(`${sourceKey} uses the active Telescope prize route in all locales @p7-localization @galactic-casino`, async ({
    page,
  }) => {
    await startMetaFixture(page, fixture);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-casino").click();
    const casino = page.getByTestId("galactic-casino-pane");

    for (const locale of LOCALE_IDS) {
      const accepted = await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.dispatch({
            type: "settings.update",
            patch: { locale: nextLocale },
          }),
        locale,
      );
      expect(accepted, `${locale} locale selection is accepted`).toBe(true);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);

      const localizedSelect = casino.getByLabel(casinoText(locale, "choosePrize"));
      const localizedLabel = casinoSpecialName(locale, prizeKey);
      expect(localizedLabel, `${locale} ${sourceKey} has a value`).not.toBe("");
      await expect(localizedSelect.locator(`option[value="${prizeKey}"]`)).toHaveText(
        localizedLabel,
      );
    }
  });
}
