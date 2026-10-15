import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { O_TYPE_POWER_PLANT_IDS } from "../../../src/content/starTypeRules";
import { oTypeStarTechAcquiredDialog } from "../../../src/i18n/spaceProgressionDialogMessages";
import { metaText, rebirthText } from "../../../src/i18n/metaMessages";

for (const locale of LOCALE_IDS) {
  test(`P7 O-type technology acquisition dialog follows ${locale} @phase8-p7-o-type-tech-dialog`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-o-type-rebirth-ready");
    const localeAccepted = await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    expect(localeAccepted).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    const systemId = before.permanent.settledSystemIds.at(-1)!;
    const plantId = O_TYPE_POWER_PLANT_IDS.find(
      (candidate) => before.permanent.oTypePowerPlantAssignments[candidate] === systemId,
    );
    expect(plantId).toBeDefined();
    if (!plantId) throw new Error("O-type rebirth fixture is missing its assigned plant.");

    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-rebirth").click();
    const pane = page.getByTestId("rebirth-pane");
    await pane.getByRole("button", { name: metaText(locale, "rebirthAction"), exact: true }).click();
    const rebirthDialog = page.getByRole("dialog", { name: rebirthText(locale, "title") });
    await expect(rebirthDialog).toBeVisible();
    await rebirthDialog
      .getByRole("button", { name: rebirthText(locale, "confirm"), exact: true })
      .click();

    const resultCopy = oTypeStarTechAcquiredDialog(locale, { systemId, plantId });
    const resultDialog = page.getByTestId("random-event-result-dialog");
    await expect(resultDialog).toBeVisible();
    await expect(resultDialog.getByRole("heading")).toHaveText(resultCopy.title);
    await expect(resultDialog.locator(".random-event-result-copy p")).toHaveText([
      resultCopy.summary,
      ...resultCopy.lines.map((line) => line.text),
    ]);
    await expect(resultDialog.getByRole("button", { name: resultCopy.confirmLabel })).toBeVisible();
  });
}
