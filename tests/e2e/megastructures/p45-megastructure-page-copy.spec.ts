import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { MEGASTRUCTURE_TRACKS } from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { miaplacidusForceFieldLevel } from "../../../src/engine/megastructures";
import {
  megastructureStageProgress,
  megastructureText,
} from "../../../src/i18n/megastructureMessages";
import { formatNumber } from "../../../src/app/numberFormatting";

const SOURCE_MAIN_MEGASTRUCTURES_TITLE: Readonly<Record<LocaleId, string>> = {
  en: "Megastructures",
  es: "Megaestructuras",
  pt: "Megaestruturas",
  de: "Megastrukturen",
  it: "Megastrutture",
  fr: "Mégastructures",
};

test("P-45 Megastructure page content follows each locale @p45-megastructure-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-research-reasons");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();

  const pane = page.getByTestId("megastructure-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const structures = [
    {
      id: "celestialProcessingCore",
      manuscript: "Sirius",
      factory: "Canopus",
    },
    { id: "plasmaForge", manuscript: "Procyon", factory: "Vega" },
    {
      id: "galacticMemoryArchive",
      manuscript: "Betelgeuse",
      factory: "Rigel",
    },
    { id: "dysonSphere", manuscript: "Altair", factory: "Deneb" },
  ] as const;

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
    const sourceTitle = SOURCE_MAIN_MEGASTRUCTURES_TITLE[locale];
    expect(copy.title).toBe(sourceTitle);
    await expect(pane.getByRole("heading", { level: 2 })).toHaveText(sourceTitle);
    await expect(page.locator("#tab-galactic-megastructures")).toHaveText(sourceTitle);
    await expect(pane.locator(".economy-section-heading > p").first()).toHaveText(
      copy.introduction,
    );
    await expect(pane.getByTestId("megastructure-force-field")).toContainText(
      (miaplacidusForceFieldLevel(state) >= 4 ? copy.forceFieldCleared : copy.forceField)
        .replace("{level}", String(miaplacidusForceFieldLevel(state)))
        .replace("{total}", "4"),
    );

    for (const [index, structure] of structures.entries()) {
      const manuscriptText = copy.manuscriptReported
        .replace("{number}", String(index + 1))
        .replace("{manuscript}", structure.manuscript)
        .replace("{structure}", copy.structureNames[structure.id])
        .replace("{factory}", structure.factory);
      await expect(pane.getByTestId(`manuscript-${index + 1}`)).toHaveText(manuscriptText);

      const card = pane.getByTestId(`megastructure-track-${structure.id}`);
      const track = MEGASTRUCTURE_TRACKS[structure.id];
      const researched = state.permanent.megastructures.researchedTechnologyIds.filter((id) =>
        track.includes(id),
      );
      const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(
        copy.structureNames[structure.id],
      );
      await expect(card.locator("p").first()).toHaveText(
        megastructureStageProgress(locale, researched.length, track.length, number),
      );
      for (const [stageIndex, technologyId] of track.entries()) {
        const row = card.locator("ol li").nth(stageIndex);
        await expect(row.locator("span").first()).toHaveText(
          `${copy.stage.replace("{number}", String(stageIndex + 1))}: ${TECHNOLOGY_NAMES[technologyId][locale]}`,
        );
        if (researched.includes(technologyId)) {
          await expect(row.locator(".status-pill")).toHaveText(copy.researched);
        }
      }
      await expect(card.getByRole("button", { name: copy.researchAction })).toBeVisible();
    }
  }
});
