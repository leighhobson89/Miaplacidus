import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { megastructureText } from "../../../src/i18n/megastructureMessages";

test("P-45 Megastructure prerequisite reasons render in all locales @p45-meta-locales", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-research-reasons");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();

  const expectedReason = (locale: (typeof LOCALE_IDS)[number]) => {
    const copy = megastructureText(locale);
    return [
      {
        trackId: "galacticMemoryArchive",
        text: copy.missingPrerequisites.replace(
          "{technologies}",
          TECHNOLOGY_NAMES.orbitalConstruction[locale],
        ),
      },
      { trackId: "dysonSphere", text: copy.notSettled.replace("{factory}", "Deneb") },
      { trackId: "celestialProcessingCore", text: copy.notAtFactory },
    ] as const;
  };

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
    for (const { trackId, text } of expectedReason(locale)) {
      const button = page
        .getByTestId(`megastructure-track-${trackId}`)
        .getByRole("button", { name: copy.researchAction, exact: true });
      await expect(button).toBeDisabled();
      const reasonId = await button.getAttribute("aria-describedby");
      expect(reasonId, `${locale}/${trackId} associated reason`).toBeTruthy();
      await expect(page.locator(`#${reasonId}`)).toHaveText(text);
    }
  }
});
