import { expect, test, type Page } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { MEGASTRUCTURE_TRACKS, TECHNOLOGY_BY_ID } from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { megastructureText } from "../../../src/i18n/megastructureMessages";

async function openMegastructures(page: Page, locale: (typeof LOCALE_IDS)[number]): Promise<void> {
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();
  await expect(page.locator("#tab-galactic-megastructures")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("megastructure-pane").getByRole("heading", { level: 2 })).toHaveText(
    megastructureText(locale).title,
  );
}

async function readInvariant(page: Page) {
  return page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      locale: state.settings.locale,
      pioneerName: state.run.pioneerName,
      cash: state.run.cash,
      researchPoints: state.run.researchPoints,
      currentSystemId: state.run.space.currentSystemId,
      researchedStages: state.permanent.megastructures.researchedTechnologyIds,
      settledSystemIds: state.permanent.settledSystemIds,
      tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
        .map((tab) => tab.id)
        .sort(),
      saveHeads: Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
        .sort(),
      lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
    };
  });
}

function expectSameIdentity(
  current: Awaited<ReturnType<typeof readInvariant>>,
  baseline: Awaited<ReturnType<typeof readInvariant>>,
  locale: (typeof LOCALE_IDS)[number],
): void {
  expect(current.locale, `${locale} locale`).toBe(locale);
  expect(current.pioneerName, `${locale} pioneer/save name`).toBe(baseline.pioneerName);
  expect(current.cash, `${locale} cash balance`).toBe(baseline.cash);
  expect(current.researchPoints, `${locale} RP balance`).toBe(baseline.researchPoints);
  expect(current.currentSystemId, `${locale} current factory star`).toBe(baseline.currentSystemId);
  expect(current.researchedStages, `${locale} researched megastructure stages`).toEqual(
    baseline.researchedStages,
  );
  expect(current.settledSystemIds, `${locale} settled star identities`).toEqual(
    baseline.settledSystemIds,
  );
  expect(current.tabIds, `${locale} stable tab IDs`).toEqual(baseline.tabIds);
  expect(current.saveHeads, `${locale} save head keys`).toEqual(baseline.saveHeads);
  expect(current.lastStartedSlot, `${locale} selected save slot`).toBe(baseline.lastStartedSlot);
}

async function saveAndCheckIdentity(
  page: Page,
  baseline: Awaited<ReturnType<typeof readInvariant>>,
): Promise<void> {
  await saveNowFromSettings(page);
  const afterSave = await readInvariant(page);
  expect(afterSave.saveHeads).toEqual(baseline.saveHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
}

test("live locale switching preserves visible Megastructure mid-stage quote @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-megastructure-route");
  await saveNowFromSettings(page);

  let baseline: Awaited<ReturnType<typeof readInvariant>> | undefined;
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await openMegastructures(page, locale);

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const archiveTrack = page.getByTestId("megastructure-track-galacticMemoryArchive");
    const nextTechnologyId = MEGASTRUCTURE_TRACKS.galacticMemoryArchive.find(
      (id) => !state.permanent.megastructures.researchedTechnologyIds.includes(id),
    );
    expect(nextTechnologyId, `${locale} archive has a visible next stage`).toBeTruthy();
    const technology = TECHNOLOGY_BY_ID[nextTechnologyId!];
    expect(state.run.space.currentSystemId).toBe(
      state.permanent.megastructures.ancientManuscripts.find(
        (record) => record.megastructureId === "galacticMemoryArchive",
      )?.factorySystemId,
    );

    const stageLine = page.getByTestId("megastructure-next-stage");
    await expect(stageLine).toContainText(TECHNOLOGY_NAMES[nextTechnologyId!][locale]);
    await expect(stageLine).toContainText(
      megastructureText(locale).researchCost.replace(
        "{cost}",
        formatNumber(locale, technology.price, 0, state.settings.notation),
      ),
    );
    await expect(archiveTrack.getByRole("button", { name: megastructureText(locale).researchAction }))
      .toBeEnabled();

    const current = await readInvariant(page);
    if (!baseline) {
      baseline = current;
      expect(baseline.saveHeads).toHaveLength(1);
      expect(baseline.pioneerName).toBe("Ascendency Pioneer");
    } else {
      expectSameIdentity(current, baseline, locale);
    }
  }

  await saveAndCheckIdentity(page, baseline!);
});

test("live locale switching preserves Megastructure stage costs and research requirements @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-megastructure-research-reasons");
  await saveNowFromSettings(page);

  let baseline: Awaited<ReturnType<typeof readInvariant>> | undefined;
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await openMegastructures(page, locale);

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const messages = megastructureText(locale);
    const pane = page.getByTestId("megastructure-pane");
    const archiveId = MEGASTRUCTURE_TRACKS.galacticMemoryArchive[0];
    const archive = pane.getByTestId("megastructure-track-galacticMemoryArchive");
    const firstStage = TECHNOLOGY_BY_ID[archiveId];
    const stageLine = page.getByTestId("megastructure-next-stage");
    await expect(stageLine).toContainText(TECHNOLOGY_NAMES[archiveId][locale]);
    await expect(stageLine).toContainText(
      messages.researchCost.replace(
        "{cost}",
        formatNumber(locale, firstStage.price, 0, state.settings.notation),
      ),
    );

    const missingPrerequisite = messages.missingPrerequisites.replace(
      "{technologies}",
      TECHNOLOGY_NAMES.orbitalConstruction[locale],
    );
    const expectedReasons = [
      ["celestialProcessingCore", messages.notAtFactory],
      ["plasmaForge", messages.notAtFactory],
      ["galacticMemoryArchive", missingPrerequisite],
      ["dysonSphere", messages.notSettled.replace("{factory}", "Deneb")],
    ] as const;
    for (const [structureId, expected] of expectedReasons) {
      const track = pane.getByTestId(`megastructure-track-${structureId}`);
      await expect(track.getByTestId(`megastructure-research-reason-${structureId}`)).toHaveText(
        expected,
      );
      const nextStageId = MEGASTRUCTURE_TRACKS[structureId].find(
        (id) => !state.permanent.megastructures.researchedTechnologyIds.includes(id),
      );
      expect(nextStageId, `${locale} ${structureId} next stage remains visible`).toBeTruthy();
      await expect(track.getByRole("button", { name: messages.researchAction })).toBeDisabled();
    }

    const current = await readInvariant(page);
    if (!baseline) {
      baseline = current;
      expect(baseline.saveHeads).toHaveLength(1);
      expect(baseline.pioneerName).toBe("Ascendency Pioneer");
    } else {
      expectSameIdentity(current, baseline, locale);
    }
  }

  await saveAndCheckIdentity(page, baseline!);
});
