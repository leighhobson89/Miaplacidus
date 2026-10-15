import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  MEGASTRUCTURE_TRACKS,
  type MegastructureId,
} from "../../../src/content/technology";
import { TECHNOLOGY_DESCRIPTIONS } from "../../../src/content/technologyDescriptions";
import { technologySummary } from "../../../src/content/technologySummaries";

const trackIds = Object.keys(MEGASTRUCTURE_TRACKS) as MegastructureId[];

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

test("revealed Megastructure stage descriptions follow all six locales @p7-locale @megastructures", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-megastructure-route");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();

  const pane = page.getByTestId("megastructure-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const totalStages = trackIds.reduce(
    (count, trackId) => count + MEGASTRUCTURE_TRACKS[trackId].length,
    0,
  );
  const knownStages = new Set([
    ...state.run.economy.researchedTechnologies,
    ...state.run.economy.revealedTechnologies,
    ...state.permanent.megastructures.researchedTechnologyIds,
  ]);
  expect(trackIds).toHaveLength(4);
  for (const trackId of trackIds) {
    for (const technologyId of MEGASTRUCTURE_TRACKS[trackId]) {
      expect(
        knownStages.has(technologyId),
        `${technologyId} should be revealed in the fixture`,
      ).toBe(true);
    }
  }

  for (const locale of LOCALE_IDS) {
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

    let visibleDescriptions = 0;
    for (const trackId of trackIds) {
      const trackCard = pane.getByTestId(`megastructure-track-${trackId}`);
      for (const [stageIndex, technologyId] of MEGASTRUCTURE_TRACKS[trackId].entries()) {
        const description = TECHNOLOGY_DESCRIPTIONS[technologyId][locale];
        const summary = technologySummary(locale, technologyId);
        expect(description.trim(), `${locale} ${technologyId} description`).not.toBe("");
        expect(summary.trim(), `${locale} ${technologyId} source summary`).not.toBe("");

        const row = trackCard.locator("ol li").nth(stageIndex);
        const descriptionElement = row.getByTestId(
          `megastructure-stage-description-${technologyId}`,
        );
        if (knownStages.has(technologyId)) {
          visibleDescriptions += 1;
          const rendered = await descriptionElement.evaluate(
            (element) => element.textContent ?? "",
          );
          expect(normalizeText(rendered), `${locale} ${technologyId} description`).toBe(
            normalizeText(description.replace(/\s*\/\s*\/\s*/g, "\n")),
          );
          await expect(row).toHaveCount(1);
          await expect(row.getByTestId(`megastructure-stage-summary-${technologyId}`)).toHaveText(
            summary,
          );
          await expect(descriptionElement).toBeVisible();
        } else {
          await expect(
            trackCard.getByTestId(`megastructure-stage-description-${technologyId}`),
          ).toHaveCount(0);
        }
      }
    }
    expect(visibleDescriptions).toBe(totalStages);
  }
});
