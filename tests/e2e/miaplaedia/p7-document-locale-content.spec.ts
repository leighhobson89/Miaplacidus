import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "../_harness/fixtures";
import {
  MIAPLAEDIA_PANE_IDS,
  miaplaediaSectionId,
} from "../../../src/app/presentationNavigation";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import {
  cosmicopediaArticles,
  type CosmicopediaSectionId,
} from "../../../src/i18n/cosmicopediaMessages";
import { translate } from "../../../src/i18n/messages";
import { settingsSectionName } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

const sourceDocuments = [
  {
    paneId: "miaplaedia-get-started",
    sectionId: "getStarted",
    sourceOptionId: "option4",
    sourceTitleKey: "headerMainGetStarted",
    firstHeadingKey: "helpGetStartedSubHeading1",
  },
  {
    paneId: "miaplaedia-story",
    sectionId: "story",
    sourceOptionId: "option12",
    sourceTitleKey: "headerMainStory",
    firstHeadingKey: "helpStorySubHeading1",
  },
  {
    paneId: "miaplaedia-concepts-early",
    sectionId: "conceptsEarly",
    sourceOptionId: "option5",
    sourceTitleKey: "headerMainConceptsEarly",
    firstHeadingKey: "helpConceptsEarlySubHeading1",
  },
  {
    paneId: "miaplaedia-concepts-mid",
    sectionId: "conceptsMid",
    sourceOptionId: "option6",
    sourceTitleKey: "headerMainConceptsMid",
    firstHeadingKey: "helpConceptsMidSubHeading1",
  },
  {
    paneId: "miaplaedia-concepts-late",
    sectionId: "conceptsLate",
    sourceOptionId: "option7",
    sourceTitleKey: "headerMainConceptsLate",
    firstHeadingKey: "helpConceptsLateSubHeading1",
  },
  {
    paneId: "miaplaedia-end-goal",
    sectionId: "endGoal",
    sourceOptionId: "option13",
    sourceTitleKey: "headerMainConceptsEndGoal",
    firstHeadingKey: "helpConceptsEndGoalSubHeading1",
  },
  {
    paneId: "miaplaedia-philosophies",
    sectionId: "philosophies",
    sourceOptionId: "option11",
    sourceTitleKey: "headerMainPhilosophies",
    firstHeadingKey: "helpPhilosophiesSubHeading1",
  },
] as const satisfies readonly {
  paneId: (typeof MIAPLAEDIA_PANE_IDS)[number];
  sectionId: CosmicopediaSectionId;
  sourceOptionId: `option${number}`;
  sourceTitleKey: string;
  firstHeadingKey: string;
}[];

test("P-7 renders each Miaplaedia source document with locale content and updated identities @p7-miaplaedia-locale-content", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const pane = freshGame.locator("#pane-miaplaedia");

  for (const locale of LOCALE_IDS) {
    const source = sourceLocales[locale];
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-miaplaedia").click();

    const navigation = pane.locator(".pane-nav");
    const tabs = navigation.getByRole("tab");
    await expect(tabs).toHaveCount(sourceDocuments.length);
    expect(
      await tabs.evaluateAll((items) =>
        items.map((item) => item.getAttribute("data-source-option-id")),
      ),
    ).toEqual(sourceDocuments.map((document) => document.sourceOptionId));

    for (const document of sourceDocuments) {
      const sectionId = miaplaediaSectionId(document.paneId);
      expect(sectionId).toBe(document.sectionId);
      const sourceTitle = source[document.sourceTitleKey];
      const sectionName = settingsSectionName(locale, sectionId);
      expect(sourceTitle, `${locale} ${document.paneId} source title`).toBeTruthy();
      expect(sectionName, `${locale} ${document.paneId} localized route title`).toBe(
        sourceTitle,
      );

      const tab = navigation.locator(`#tab-${document.paneId}`);
      await expect(tab).toBeVisible();
      const accessibleName = await tab.getAttribute("aria-label");
      expect([sectionName, `${sectionName}, ${translate(locale, "nav.new")}`]).toContain(
        accessibleName ?? sectionName,
      );
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");

      const page = pane.locator(`#panel-${document.paneId} .miaplaedia-page`);
      const headingId = `miaplaedia-heading-${sectionId}`;
      await expect(page).toHaveAttribute("aria-labelledby", headingId);
      await expect(page.getByRole("heading", { level: 2 })).toHaveText(sourceTitle!);

      const firstArticle = cosmicopediaArticles(locale, sectionId)[0]!;
      const sourceFirstHeading = source[document.firstHeadingKey];
      expect(sourceFirstHeading, `${locale} ${document.paneId} source article heading`).toBeTruthy();
      expect(firstArticle.heading).toBe(sourceFirstHeading);
      expect(firstArticle.body.trim(), `${locale} ${document.paneId} source article body`).not.toBe("");
      await expect(page.locator(".miaplaedia-entry h3").first()).toHaveText(sourceFirstHeading!);
      await expect(page.locator(".miaplaedia-entry-body").first()).toHaveText(/\S/);

      const pageText = await page.innerText();
      expect(pageText).not.toContain("Cosmic Forge");
      expect(pageText).not.toContain("Cosmic Forger");
      if (sectionId === "getStarted") {
        expect(pageText).toContain("Miaplacidus");
        expect(pageText).toContain("Miaplaedia");
        expect(pageText).not.toContain("Cosmicopedia");
      }
      if (sectionId === "story") {
        expect(pageText).toContain("Mia'Plac");
        expect(pageText).toContain("Miaplacidus");
      }
    }
  }
});
