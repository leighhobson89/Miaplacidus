import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { MEGASTRUCTURE_EFFECTS } from "../../../src/content/megastructureEffects";
import {
  MEGASTRUCTURE_TRACKS,
  type MegastructureId,
} from "../../../src/content/technology";

const trackIds = Object.keys(MEGASTRUCTURE_TRACKS) as MegastructureId[];

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

test("Megastructure stage effects follow all six locales @p7-locale @megastructures", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-megastructure-route");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();

  const pane = page.getByTestId("megastructure-pane");
  expect(trackIds).toHaveLength(4);

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

    let visibleEffects = 0;
    for (const trackId of trackIds) {
      const trackCard = pane.getByTestId(`megastructure-track-${trackId}`);
      const technologyIds = MEGASTRUCTURE_TRACKS[trackId];
      expect(MEGASTRUCTURE_EFFECTS[trackId]).toHaveLength(technologyIds.length);

      for (const [stageIndex, technologyId] of technologyIds.entries()) {
        const effect = MEGASTRUCTURE_EFFECTS[trackId][stageIndex]![locale];
        expect(effect.trim(), `${locale} ${trackId} stage ${stageIndex + 1}`).not.toBe("");

        const row = trackCard.locator("ol li").nth(stageIndex);
        const effectElement = row.getByTestId(`megastructure-stage-effect-${technologyId}`);
        await expect(row).toHaveCount(1);
        await expect(effectElement).toBeVisible();
        const rendered = await effectElement.evaluate((element) => element.textContent ?? "");
        expect(normalizeText(rendered), `${locale} ${technologyId} effect`).toBe(
          normalizeText(effect),
        );
        visibleEffects += 1;
      }
    }
    expect(visibleEffects).toBe(20);
  }
});
