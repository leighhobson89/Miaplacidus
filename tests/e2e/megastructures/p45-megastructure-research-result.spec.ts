import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { MEGASTRUCTURE_TRACKS, TECHNOLOGY_BY_ID } from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import {
  megastructureStageProgress,
  megastructureText,
} from "../../../src/i18n/megastructureMessages";

test("Megastructure stage research result localizes across all locales @p45-megastructure-result", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-megastructure-route");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();

  const trackId = "galacticMemoryArchive" as const;
  const stages = MEGASTRUCTURE_TRACKS[trackId];
  const completedStageId = stages[2]!;
  const nextStageId = stages[3]!;
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const researchPrice = TECHNOLOGY_BY_ID[completedStageId].price;
  const nextStagePrice = TECHNOLOGY_BY_ID[nextStageId].price;
  const archive = page.getByTestId(`megastructure-track-${trackId}`);

  expect(before.permanent.megastructures.researchedTechnologyIds).not.toContain(completedStageId);
  expect(before.run.researchPoints).toBeGreaterThanOrEqual(researchPrice);
  expect(before.run.space.currentSystemId).toBe(
    before.permanent.megastructures.ancientManuscripts.find(
      (record) => record.megastructureId === trackId,
    )?.factorySystemId,
  );

  const action = archive.getByRole("button", {
    name: megastructureText("en").researchAction,
    exact: true,
  });
  await expect(action).toBeEnabled();
  await action.click();

  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.permanent.megastructures.researchedTechnologyIds).toContain(completedStageId);
  expect(after.run.researchPoints).toBe(before.run.researchPoints - researchPrice);
  expect(after.run.cash).toBe(before.run.cash);
  expect(after.permanent.megastructures.researchedTechnologyIds).not.toContain(nextStageId);

  const shortfall = Math.ceil(Math.max(0, nextStagePrice - after.run.researchPoints));
  expect(shortfall).toBeGreaterThan(0);
  const number = (locale: (typeof LOCALE_IDS)[number], value: number) =>
    formatNumber(locale, value, 0, after.settings.notation);

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
    const expectedProgress = megastructureStageProgress(locale, 3, stages.length, (value) =>
      number(locale, value),
    );
    const nextStageText = copy.stage.replace("{number}", "4");
    const nextStageCost = copy.researchCost.replace("{cost}", number(locale, nextStagePrice));
    const expectedReason = copy.insufficientResearch
      .replace("{required}", number(locale, nextStagePrice))
      .replace("{shortfall}", number(locale, shortfall));

    await expect(archive.locator("p").first()).toHaveText(expectedProgress);
    await expect(archive.locator("ol li").nth(2).locator(".status-pill")).toHaveText(
      copy.researched,
    );
    await expect(archive.getByTestId("megastructure-next-stage")).toContainText(
      `${nextStageText}: ${TECHNOLOGY_NAMES[nextStageId][locale]}`,
    );
    await expect(archive.getByTestId("megastructure-next-stage")).toContainText(nextStageCost);
    await expect(page.getByTestId("research-balance")).toHaveText(
      number(locale, after.run.researchPoints),
    );
    await expect(
      archive.getByRole("button", { name: copy.researchAction, exact: true }),
    ).toBeDisabled();
    await expect(page.getByTestId(`megastructure-research-reason-${trackId}`)).toHaveText(
      expectedReason,
    );
    await expect(page.getByTestId("megastructure-force-field")).toHaveText(
      copy.forceFieldCleared.replace("{level}", "4").replace("{total}", "4"),
    );
  }
});
