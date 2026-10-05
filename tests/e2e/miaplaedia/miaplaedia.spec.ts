import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { LOCALE_IDS } from "../../../src/content/ids";
import { MIAPLAEDIA_PANE_IDS, miaplaediaSectionId } from "../../../src/app/presentationNavigation";
import { cosmicopediaArticles } from "../../../src/i18n/cosmicopediaMessages";
import { settingsSectionName } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

const settingsDestinations = [
  ["tab-settings-achievements", "option10"],
  ["tab-settings-events", "option14"],
  ["tab-settings-statistics", "option8"],
  ["tab-settings-visual", "option1"],
  ["tab-settings-game-options", "option3"],
  ["tab-settings-saves", "option2"],
];

const guideSourceOptionIds = [
  "option4",
  "option12",
  "option5",
  "option6",
  "option7",
  "option13",
  "option11",
];

const guideDocuments = [
  { label: "Get Started", firstHeading: "Introduction" },
  { label: "Story", firstHeading: "History" },
  {
    label: "Concepts · Early",
    firstHeading: "Resources",
    snapshotName: "miaplaedia-early-concepts",
  },
  { label: "Concepts · Mid", firstHeading: "Energy Generation & Consumption" },
  { label: "Concepts · Late", firstHeading: "Star Map" },
  { label: "Concepts · End Goal", firstHeading: "Ancient Manuscripts" },
  { label: "Philosophies", firstHeading: "Philosophies" },
];

test("Miaplaedia maps each guide option to its own source document @cosmicopedia @presentation @ui-navigation", async ({
  freshGame,
}, testInfo) => {
  await freshGame.locator("#tab-settings").click();
  const settingsOptions = freshGame.locator("#pane-settings .pane-nav [role='tab']");
  await expect(settingsOptions).toHaveCount(settingsDestinations.length);
  const actualSettingsDestinations = await settingsOptions.evaluateAll((tabs) =>
    tabs.map((tab) => [tab.id, tab.getAttribute("data-source-option-id")]),
  );
  expect(actualSettingsDestinations).toEqual(settingsDestinations);

  await freshGame.locator("#tab-miaplaedia").click();
  const guideNavigation = freshGame.locator("#pane-miaplaedia .pane-nav");
  const guideOptions = guideNavigation.getByRole("tab");
  await expect(guideOptions).toHaveCount(MIAPLAEDIA_PANE_IDS.length);
  const actualGuideDestinations = await guideOptions.evaluateAll((tabs) =>
    tabs.map((tab) => [tab.id.replace(/^tab-/, ""), tab.getAttribute("data-source-option-id")]),
  );
  expect(actualGuideDestinations).toEqual(
    MIAPLAEDIA_PANE_IDS.map((id, index) => [id, guideSourceOptionIds[index]]),
  );

  for (const [index, document] of guideDocuments.entries()) {
    const paneId = MIAPLAEDIA_PANE_IDS[index]!;
    await guideNavigation.locator(`#tab-${paneId}`).click();
    const article = freshGame.locator("#pane-miaplaedia .miaplaedia-page");
    await expect(article.locator("h3")).toHaveText(document.label);
    await expect(article.locator(".miaplaedia-entry h4").first()).toHaveText(document.firstHeading);
    const text = await article.innerText();
    expect(text).not.toContain("Cosmic Forge");
    expect(text).not.toContain("Cosmic Forger");
    if (document.label === "Story") expect(text).toContain("Mia'Plac");
    if (document.snapshotName) {
      await captureVisualCheckpoint(freshGame, testInfo, document.snapshotName);
    }
  }
});

test("Miaplaedia keeps all seven source documents mapped and within phone and desktop widths in six locales @cosmicopedia @localization @presentation", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);

    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await freshGame.setViewportSize(viewport);
      await freshGame.locator("#tab-miaplaedia").click();
      for (const paneId of MIAPLAEDIA_PANE_IDS) {
        await freshGame.locator(`#tab-${paneId}`).click();
        const sectionId = miaplaediaSectionId(paneId);
        const article = freshGame.locator("#pane-miaplaedia .miaplaedia-page");
        await expect(article.locator("h3")).toHaveText(settingsSectionName(locale, sectionId));
        await expect(article.locator(".miaplaedia-entry h4").first()).toHaveText(
          cosmicopediaArticles(locale, sectionId)[0]!.heading,
        );

        const dimensions = await article.evaluate((element) => ({
          clientWidth: element.clientWidth,
          parentWidth: element.parentElement?.clientWidth ?? 0,
          scrollWidth: element.scrollWidth,
          documentWidth: document.documentElement.scrollWidth,
        }));
        expect(
          dimensions.clientWidth,
          `${locale} ${paneId} content width at ${viewport.width}px`,
        ).toBeGreaterThanOrEqual(dimensions.parentWidth - 2);
        expect(
          dimensions.scrollWidth,
          `${locale} ${paneId} article at ${viewport.width}px`,
        ).toBeLessThanOrEqual(dimensions.clientWidth);
        expect(
          dimensions.documentWidth,
          `${locale} ${paneId} page at ${viewport.width}px`,
        ).toBeLessThanOrEqual(viewport.width);

        const text = await article.innerText();
        expect(text).not.toContain("Cosmic Forge");
        expect(text).not.toContain("Cosmic Forger");
        if (sectionId === "story") expect(text).toContain("Mia'Plac");
      }
    }
  }
});
