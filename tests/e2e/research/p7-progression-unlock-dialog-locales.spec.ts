import { expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { TECHNOLOGY_BY_ID } from "../../../src/content/technology";
import { LOCALE_IDS, type TechId } from "../../../src/content/ids";
import {
  researchUnlockResultDialog,
  type ResearchUnlockResultDialogId,
} from "../../../src/i18n/researchUnlockResultDialogMessages";

const researchUnlockSequence = [
  { technologyId: "knowledgeSharing", dialogId: "knowledgeSharing" },
  { technologyId: "stellarCartography", dialogId: "stellarCartography" },
  { technologyId: "basicPowerGeneration", dialogId: "basicPowerGeneration" },
  { technologyId: "compounds", dialogId: "compounds" },
  { technologyId: "quantumComputing", dialogId: "quantumComputing" },
  { technologyId: "scienceLaboratories", dialogId: "scienceLaboratories" },
  { technologyId: "rocketComposites", dialogId: "rocketComposites" },
  { technologyId: "atmosphericTelescopes", dialogId: "atmosphericTelescopes" },
] as const satisfies readonly {
  readonly technologyId: TechId;
  readonly dialogId: ResearchUnlockResultDialogId;
}[];

function expectedDialogParagraphs(copy: ReturnType<typeof researchUnlockResultDialog>): string[] {
  return [
    copy.summary,
    ...copy.lines.map((line) =>
      line.parts ? line.parts.map((part) => part.text).join("") : line.text,
    ),
  ].filter((paragraph) => paragraph.trim().length > 0);
}

async function expectUnlockDialog(
  page: import("@playwright/test").Page,
  locale: (typeof LOCALE_IDS)[number],
  id: ResearchUnlockResultDialogId,
): Promise<void> {
  const copy = researchUnlockResultDialog(locale, id);
  const paragraphs = expectedDialogParagraphs(copy);
  for (const [index, text] of [copy.title, ...paragraphs, copy.confirmLabel].entries()) {
    expect(text.trim(), `${locale} ${id} dialog copy ${index}`).not.toBe("");
  }

  const dialog = page.getByTestId("random-event-result-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toHaveText(copy.title);
  await expect(dialog.locator("#random-event-result-copy p")).toHaveText(paragraphs);
  await expect(dialog.getByRole("button")).toHaveText(copy.confirmLabel);
  await dialog.getByRole("button", { name: copy.confirmLabel, exact: true }).click();
  await expect(dialog).toBeHidden();
}

async function researchWithPrerequisites(
  page: import("@playwright/test").Page,
  locale: (typeof LOCALE_IDS)[number],
  technologyId: TechId,
  researched: Set<TechId>,
  nextUnlockIndex: { value: number },
): Promise<void> {
  if (researched.has(technologyId)) return;

  const technology = TECHNOLOGY_BY_ID[technologyId];
  for (const prerequisiteId of technology.requires) {
    await researchWithPrerequisites(page, locale, prerequisiteId, researched, nextUnlockIndex);
  }

  if (researched.has(technologyId)) return;
  const accepted = await page.evaluate((id) =>
    window.miaplacidusTest!.dispatch({ type: "economy.research", technologyId: id }),
    technologyId,
  );
  expect(accepted, `${technologyId} research command`).toBe(true);
  researched.add(technologyId);

  const node = page.locator(`[data-technology-id="${technologyId}"]`);
  await expect(node.locator(".technology-map-researched")).toBeVisible();

  const expectedUnlock = researchUnlockSequence.find(
    (entry) => entry.technologyId === technologyId,
  );
  if (expectedUnlock) {
    const sequenceEntry = researchUnlockSequence[nextUnlockIndex.value];
    expect(expectedUnlock.dialogId, `research result ${nextUnlockIndex.value + 1}`).toBe(
      sequenceEntry?.dialogId,
    );
    await expectUnlockDialog(page, locale, expectedUnlock.dialogId);
    nextUnlockIndex.value += 1;
  }
}

for (const locale of LOCALE_IDS) {
  test(`source Research unlock dialogs follow the progression sequence in ${locale} @p7-locale @research`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await startEconomyFixture(page, "research", locale);

    expect(
      await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("give-1m-research")),
    ).toBe(true);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    await expect(page.getByTestId("technology-tree")).toBeVisible();

    const initialResearch = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.economy.researchedTechnologies,
    );
    expect(initialResearch).toEqual([]);
    const researched = new Set<TechId>();
    const nextUnlockIndex = { value: 0 };
    for (const { technologyId } of researchUnlockSequence) {
      await researchWithPrerequisites(page, locale, technologyId, researched, nextUnlockIndex);
    }
    expect(nextUnlockIndex.value).toBe(researchUnlockSequence.length);

    const apGranted = await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("add-100-ap"),
    );
    expect(apGranted).toBe(true);
    const levelOneAccepted = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "meta.perk.purchase", perkId: "nanoBrokers" }),
    );
    expect(levelOneAccepted).toBe(true);
    await expect(page.getByTestId("random-event-result-dialog")).toHaveCount(0);

    const levelTwoAccepted = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "meta.perk.purchase", perkId: "nanoBrokers" }),
    );
    expect(levelTwoAccepted).toBe(true);
    await expectUnlockDialog(page, locale, "compoundMachining");
    const acquiredPerks = await page.evaluate(
      () => window.miaplacidusTest!.getState().permanent.acquiredPerks,
    );
    expect(acquiredPerks).toContain("nanoBrokers:1");
    expect(acquiredPerks).toContain("nanoBrokers:2");
  });
}
