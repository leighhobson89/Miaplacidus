import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { MEGASTRUCTURE_TRACKS, TECHNOLOGY_BY_ID } from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { technologyNotificationText } from "../../../src/i18n/technologyNotificationMessages";
import { megastructureResearchResultCopy } from "../../../src/i18n/megastructureResearchResultMessages";
import { megastructureText } from "../../../src/i18n/megastructureMessages";

const archiveStageThree = MEGASTRUCTURE_TRACKS.galacticMemoryArchive[2]!;

for (const locale of LOCALE_IDS) {
  test(`Galactic Memory Archive Stage 3 result follows ${locale} @p7-megastructure-result-locales`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-megastructure-route");

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

    const resultCopy = megastructureResearchResultCopy(locale, archiveStageThree);
    expect(resultCopy).not.toBeNull();
    if (!resultCopy) {
      throw new Error(`Missing Archive Stage 3 result copy for ${locale}.`);
    }
    expect(resultCopy.title.trim()).not.toBe("");
    expect(resultCopy.summary.trim()).not.toBe("");
    expect(resultCopy.lines.length).toBeGreaterThan(0);
    for (const line of resultCopy.lines) expect(line.text.trim()).not.toBe("");
    expect(resultCopy.confirmLabel.trim()).not.toBe("");

    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-megastructures").click();
    const archive = page.getByTestId("megastructure-track-galacticMemoryArchive");
    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(before.permanent.megastructures.researchedTechnologyIds).not.toContain(
      archiveStageThree,
    );
    expect(before.run.researchPoints).toBeGreaterThanOrEqual(
      TECHNOLOGY_BY_ID[archiveStageThree].price,
    );

    const researchAction = archive.getByRole("button", {
      name: megastructureText(locale).researchAction,
      exact: true,
    });
    await expect(researchAction).toBeEnabled();
    await researchAction.click();

    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.permanent.megastructures.researchedTechnologyIds).toContain(
      archiveStageThree,
    );

    const researchNotice = technologyNotificationText(
      locale,
      archiveStageThree,
      TECHNOLOGY_NAMES[archiveStageThree][locale],
    );
    await expect(
      page.getByTestId("game-notification").filter({ hasText: researchNotice }),
    ).toHaveText(researchNotice);

    const resultDialog = page.getByTestId("random-event-result-dialog");
    await expect(resultDialog).toBeVisible();
    await expect(resultDialog.getByRole("heading")).toHaveText(resultCopy.title);
    await expect(resultDialog.locator("#random-event-result-copy p")).toHaveText([
      resultCopy.summary,
      ...resultCopy.lines.map((line) => line.text),
    ]);
    await expect(resultDialog.getByRole("button")).toHaveText(resultCopy.confirmLabel);
    await resultDialog
      .getByRole("button", { name: resultCopy.confirmLabel, exact: true })
      .click();
    await expect(resultDialog).toBeHidden();
  });
}
