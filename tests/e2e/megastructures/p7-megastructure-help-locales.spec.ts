import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { miaplacidusForceFieldLevel } from "../../../src/engine/megastructures";
import { megastructureText } from "../../../src/i18n/megastructureMessages";

test("P-7 Megastructures header and force-field help follow all locales and states @p7-megastructure-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();

  const pane = page.getByTestId("megastructure-pane");
  const forceFieldLevel = async () => {
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    return miaplacidusForceFieldLevel(state);
  };
  const statusText = (level: number, locale: (typeof LOCALE_IDS)[number]) =>
    level >= 4 ? megastructureText(locale).forceFieldDown : `${(4 - level) * 25}%`;
  const checkCopy = async (level: number) => {
    for (const locale of LOCALE_IDS) {
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.dispatch({
            type: "settings.update",
            patch: { locale: nextLocale },
          }),
        locale,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", locale);

      const copy = megastructureText(locale);
      expect(copy.headerHelp.trim()).not.toBe("");
      expect(copy.forceFieldStrength.trim()).not.toBe("");
      expect(copy.forceFieldDown.trim()).not.toBe("");
      expect(copy.forceFieldKeepWeakening.trim()).not.toBe("");
      expect(copy.forceFieldCanMove.trim()).not.toBe("");

      await pane.getByTestId("megastructure-header-help-trigger").focus();
      await expect(page.getByTestId("megastructure-header-help")).toHaveText(copy.headerHelp);

      await pane.getByTestId("megastructure-force-field-help-trigger").focus();
      const forceFieldHelp = page.getByTestId("megastructure-force-field-help");
      await expect(forceFieldHelp).toContainText(copy.forceFieldStrength);
      await expect(forceFieldHelp).toContainText(statusText(level, locale));
      await expect(forceFieldHelp).toContainText(
        level >= 4 ? copy.forceFieldCanMove : copy.forceFieldKeepWeakening,
      );
    }
  };

  const initialLevel = await forceFieldLevel();
  expect(initialLevel).toBeLessThan(4);
  await checkCopy(initialLevel);

  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en" },
    }),
  );
  const archive = pane.getByTestId("megastructure-track-galacticMemoryArchive");
  await archive
    .getByRole("button", { name: megastructureText("en").researchAction, exact: true })
    .click();
  const resultDialog = page.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await resultDialog.getByRole("button").click();

  const clearedLevel = await forceFieldLevel();
  expect(clearedLevel).toBe(4);
  await checkCopy(clearedLevel);
});
