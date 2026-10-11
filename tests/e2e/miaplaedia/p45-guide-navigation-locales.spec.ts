import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { MIAPLAEDIA_PANE_IDS, miaplaediaSectionId } from "../../../src/app/presentationNavigation";
import { translate } from "../../../src/i18n/messages";
import { settingsSectionName } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("P-45 Miaplaedia guide tabs and selected section titles follow all six locales @p45-miaplaedia-locales", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-miaplaedia").click();

    const pane = freshGame.locator("#pane-miaplaedia");
    for (const paneId of MIAPLAEDIA_PANE_IDS) {
      const sectionId = miaplaediaSectionId(paneId);
      const sectionName = settingsSectionName(locale, sectionId);
      const guideTab = pane.locator(`#tab-${paneId}`);
      await expect(guideTab).toBeVisible();
      const accessibleName = await guideTab.getAttribute("aria-label");
      expect([sectionName, `${sectionName}, ${translate(locale, "nav.new")}`]).toContain(
        accessibleName ?? sectionName,
      );
      await guideTab.click();
      await expect(guideTab).toHaveAttribute("aria-selected", "true");
      await expect(pane.locator(`#panel-${paneId} .miaplaedia-page h2`)).toHaveText(sectionName);
    }
  }
});
