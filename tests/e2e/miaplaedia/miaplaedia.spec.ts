import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { MIAPLAEDIA_PANE_IDS, miaplaediaSectionId } from "../../../src/app/presentationNavigation";
import {
  cosmicopediaArticles,
  cosmicopediaDescription,
} from "../../../src/i18n/cosmicopediaMessages";
import { settingsSectionName, settingsText } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

const cosmicForgeLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

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
    label: "Concepts - Early",
    firstHeading: "Resources",
    snapshotName: "miaplaedia-early-concepts",
  },
  { label: "Concepts - Mid", firstHeading: "Energy Generation & Consumption" },
  { label: "Concepts - Late", firstHeading: "Star Map" },
  { label: "Concepts - End Goal", firstHeading: "Ancient Manuscripts" },
  { label: "Philosophies", firstHeading: "Philosophies" },
];

async function dismissTutorialIfVisible(page: Page): Promise<void> {
  const dismissButton = page.getByRole("button", { name: "No thanks", exact: true });
  if (await dismissButton.isVisible()) await dismissButton.click();
}

test("Miaplaedia maps each guide option to its own source document @cosmicopedia @presentation @ui-navigation", async ({
  freshGame,
}, testInfo) => {
  await dismissTutorialIfVisible(freshGame);
  await freshGame.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
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
    const article = freshGame.locator(`#panel-${paneId} .miaplaedia-page`);
    const headingId = `miaplaedia-heading-${miaplaediaSectionId(paneId)}`;
    await expect(freshGame.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(article).toHaveAttribute("aria-labelledby", headingId);
    const pageHeading = article.getByRole("heading", {
      name: document.label,
      exact: true,
      level: 2,
    });
    await expect(pageHeading).toBeVisible();
    await expect(pageHeading).toHaveAttribute("id", headingId);
    const entries = article.locator(".miaplaedia-entry");
    await expect(entries.locator("h3").first()).toHaveText(document.firstHeading);
    expect(await article.getByRole("heading", { level: 3 }).count()).toBe(await entries.count());
    await expect(article.getByRole("heading", { level: 4 })).toHaveCount(0);
    const text = await article.innerText();
    expect(text).not.toContain("Cosmic Forge");
    expect(text).not.toContain("Cosmic Forger");
    if (document.label === "Story") {
      expect(text).toContain("Mia'Plac");
      const storyBodies = article.locator(".miaplaedia-entry-body");
      await expect(storyBodies).toHaveCount(3);
      for (const body of await storyBodies.all()) {
        const visibleBody = await body.innerText();
        expect(visibleBody).not.toContain("\\n");
        expect(visibleBody.split(/\n+/).filter((paragraph) => paragraph.trim())).toHaveLength(3);
        await expect(body.locator("br")).toHaveCount(4);
      }
    }
    if (document.snapshotName) {
      await captureVisualCheckpoint(freshGame, testInfo, document.snapshotName);
    }
  }
});

test("Miaplaedia guide pages follow the shell h1, page h2, and article h3 hierarchy @cosmicopedia @p15 @accessibility", async ({
  freshGame,
}) => {
  await freshGame.locator("#tab-miaplaedia").click();
  await expect(freshGame.getByRole("heading", { level: 1 })).toHaveCount(1);

  const navigation = freshGame.locator("#pane-miaplaedia .pane-nav");
  const pane = freshGame.locator("#pane-miaplaedia");

  for (const route of MIAPLAEDIA_PANE_IDS) {
    const sectionId = miaplaediaSectionId(route);
    const headingId = `miaplaedia-heading-${sectionId}`;
    await navigation.locator(`#tab-${route}`).click();

    const page = pane.locator(`#panel-${route} .miaplaedia-page`);
    await expect(page).toHaveAttribute("aria-labelledby", headingId);
    const pageHeading = page.getByRole("heading", {
      name: settingsSectionName("en", sectionId),
      exact: true,
      level: 2,
    });
    await expect(pageHeading).toBeVisible();
    await expect(pageHeading).toHaveAttribute("id", headingId);

    const entryCount = await page.locator(".miaplaedia-entry").count();
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(entryCount);
    await expect(page.getByRole("heading", { level: 4 })).toHaveCount(0);
  }
});

test("Miaplaedia guide descriptions follow their headings in all six locales @cosmicopedia @localization @p44-description", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const pane = freshGame.locator("#pane-miaplaedia");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);

    for (const route of MIAPLAEDIA_PANE_IDS) {
      const sectionId = miaplaediaSectionId(route);
      await pane.locator(`#tab-${route}`).click();
      const article = pane.locator(`#panel-${route} .miaplaedia-page`);
      const heading = article.locator(".game-page-title");
      const description = article.getByTestId("miaplaedia-page-description");
      const articles = article.locator(".miaplaedia-articles");

      await expect(heading).toHaveText(settingsSectionName(locale, sectionId));
      await expect(description).toHaveText(cosmicopediaDescription(locale, sectionId)!);
      await expect(articles.locator(".miaplaedia-entry h3").first()).toHaveText(
        cosmicopediaArticles(locale, sectionId)[0]!.heading,
      );
      const order = await article.evaluate((page) =>
        Array.from(page.children).map((child) =>
          child.classList.contains("game-page-title")
            ? "heading"
            : child.classList.contains("miaplaedia-page-description")
              ? "description"
              : child.classList.contains("miaplaedia-articles")
                ? "articles"
                : "other",
        ),
      );
      expect(order, `${locale} ${sectionId}`).toEqual(["heading", "description", "articles"]);
    }
  }
});

test("Story guide source keys render all three articles in six locales @cosmicopedia @localization @p44-story-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const route = MIAPLAEDIA_PANE_IDS[1]!;
  const entries = freshGame.locator(`#panel-${route} .miaplaedia-entry`);
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator(`#tab-${route}`).click();
    const sourceEntries = cosmicopediaArticles(locale, "story");
    await expect(entries).toHaveCount(sourceEntries.length);

    for (const [index, sourceEntry] of sourceEntries.entries()) {
      const renderedEntry = entries.nth(index);
      await expect(renderedEntry.locator("h3")).toHaveText(sourceEntry.heading);
      const sourceParagraphs = sourceEntry.body
        .replace(/\\n/g, "\n")
        .split(/\r?\n{2,}/)
        .map(normalize)
        .filter(Boolean);
      const renderedBody = renderedEntry.locator(".miaplaedia-entry-body");
      const renderedParagraphs = (await renderedBody.innerText())
        .split(/\n+/)
        .map(normalize)
        .filter(Boolean);
      expect(renderedParagraphs, `${locale} story article ${index + 1}`).toEqual(sourceParagraphs);
      await expect(renderedBody.locator("br")).toHaveCount((sourceParagraphs.length - 1) * 2);
    }

    const pageText = await freshGame.locator(`#panel-${route} .miaplaedia-page`).innerText();
    expect(pageText).toContain("Mia'Plac");
    expect(pageText).toContain("Miaplacidus");
    expect(pageText).not.toContain("Cosmic Forge");
    expect(pageText).not.toContain("Cosmic Forger");
  }
});

test("Get Started source key renders its localized article and paragraph breaks @cosmicopedia @localization @p44-get-started-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const route = MIAPLAEDIA_PANE_IDS[0]!;
  const article = freshGame.locator(`#panel-${route} .miaplaedia-page`);
  const entries = article.locator(".miaplaedia-entry");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator(`#tab-${route}`).click();
    const sourceEntry = cosmicopediaArticles(locale, "getStarted")[0]!;

    await expect(article.locator(".game-page-title")).toHaveText(
      settingsSectionName(locale, "getStarted"),
    );
    await expect(entries).toHaveCount(1);
    await expect(entries.locator("h3")).toHaveText(sourceEntry.heading);
    const body = entries.locator(".miaplaedia-entry-body");
    const visibleText = (await body.innerText()).replace(/\s+/g, " ").trim();
    const expectedText = sourceEntry.body
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    expect(visibleText, `${locale} Get Started copy`).toBe(expectedText);
    await expect(body.locator("br")).toHaveCount(18);

    const pageText = await article.innerText();
    expect(pageText).toContain("Miaplacidus");
    expect(pageText).toContain("Miaplaedia");
    expect(pageText).not.toContain("Cosmic Forge");
    expect(pageText).not.toContain("Cosmicopedia");
    expect(pageText).not.toContain("Cosmic Forger");
  }
});

test("Events guide points to the Settings page in every locale @cosmicopedia @localization @p44-events-owner-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    const articles = cosmicopediaArticles(locale, "conceptsMid");
    const eventsArticleIndex = articles.findIndex(
      (article) => article.heading === settingsSectionName(locale, "events"),
    );
    expect(eventsArticleIndex, `${locale} Events guide article`).toBeGreaterThanOrEqual(0);

    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator("#tab-miaplaedia-concepts-mid").click();
    const renderedBody = freshGame
      .locator("#panel-miaplaedia-concepts-mid .miaplaedia-entry-body")
      .nth(eventsArticleIndex);
    const sourceBody = articles[eventsArticleIndex]!.body;
    expect(sourceBody.trim(), `${locale} Events guide value`).not.toBe("");
    if (locale === "en") {
      expect(sourceBody).toContain(settingsText(locale, "title"));
    }
    await expect(renderedBody).toHaveText(sourceBody);
    await expect(renderedBody).not.toContainText(/menu|menú|menü/i);
  }
});

test("Concepts - End Goal source keys render all five articles in six locales @cosmicopedia @localization @p44-end-goal-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const route = MIAPLAEDIA_PANE_IDS[5]!;
  const article = freshGame.locator(`#panel-${route} .miaplaedia-page`);
  const entries = article.locator(".miaplaedia-entry");
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator(`#tab-${route}`).click();
    await expect(article.locator(".game-page-title")).toHaveText(
      settingsSectionName(locale, "endGoal"),
    );
    await expect(article.getByTestId("miaplaedia-page-description")).toHaveText(
      cosmicopediaDescription(locale, "endGoal")!,
    );

    const sourceEntries = cosmicopediaArticles(locale, "endGoal");
    await expect(entries).toHaveCount(sourceEntries.length);
    for (const [index, sourceEntry] of sourceEntries.entries()) {
      const renderedEntry = entries.nth(index);
      await expect(renderedEntry.locator("h3")).toHaveText(sourceEntry.heading);
      const sourceBodyWithBreaks = sourceEntry.body
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n");
      const expectedText = normalize(sourceBodyWithBreaks.replace(/\r?\n+/g, " "));
      const body = renderedEntry.locator(".miaplaedia-entry-body");
      expect(normalize(await body.innerText()), `${locale} End Goal article ${index + 1}`).toBe(
        expectedText,
      );
      const expectedBreakCount = (sourceBodyWithBreaks.match(/\r?\n{2,}/g)?.length ?? 0) * 2;
      await expect(body.locator("br")).toHaveCount(expectedBreakCount);
    }
  }
});

test("P-44 Early Concepts renders all eleven source articles in six locales @cosmicopedia @localization @p44-early-concepts-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const route = MIAPLAEDIA_PANE_IDS[2]!;
  const page = freshGame.locator(`#panel-${route} .miaplaedia-page`);
  const entries = page.locator(".miaplaedia-entry");
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

  for (const locale of LOCALE_IDS) {
    const source = cosmicForgeLocales[locale];
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator(`#tab-${route}`).click();

    await expect(page.locator(".game-page-title")).toHaveText(source.headerMainConceptsEarly);
    await expect(page.getByTestId("miaplaedia-page-description")).toHaveText(
      source.headerDescConceptsEarly,
    );
    await expect(entries).toHaveCount(11);

    for (let index = 0; index < 11; index += 1) {
      const articleNumber = index + 1;
      const article = entries.nth(index);
      const expectedHeading = source[`helpConceptsEarlySubHeading${articleNumber}`];
      const expectedBody = source[`helpConceptsEarlySubBody${articleNumber}`];
      expect(expectedHeading, `${locale} source heading ${articleNumber}`).toBeTruthy();
      expect(expectedBody, `${locale} source body ${articleNumber}`).toBeTruthy();
      await expect(article.locator("h3")).toHaveText(expectedHeading!);
      expect(
        normalize(await article.locator(".miaplaedia-entry-body").innerText()),
        `${locale} Early Concepts article ${articleNumber}`,
      ).toBe(normalize(expectedBody!));
    }
  }
});

test("Concepts - Mid source keys render all twelve articles in six locales @cosmicopedia @localization @p44-concepts-mid-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const route = MIAPLAEDIA_PANE_IDS[3]!;
  const article = freshGame.locator(`#panel-${route} .miaplaedia-page`);
  const entries = article.locator(".miaplaedia-entry");
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator(`#tab-${route}`).click();
    await expect(article.locator(".game-page-title")).toHaveText(
      settingsSectionName(locale, "conceptsMid"),
    );
    await expect(article.getByTestId("miaplaedia-page-description")).toHaveText(
      cosmicopediaDescription(locale, "conceptsMid")!,
    );

    const sourceEntries = cosmicopediaArticles(locale, "conceptsMid");
    await expect(entries).toHaveCount(sourceEntries.length);
    for (const [index, sourceEntry] of sourceEntries.entries()) {
      const renderedEntry = entries.nth(index);
      await expect(renderedEntry.locator("h3")).toHaveText(sourceEntry.heading);
      const sourceBodyWithBreaks = sourceEntry.body
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n");
      const expectedText = normalize(sourceBodyWithBreaks.replace(/\r?\n+/g, " "));
      const body = renderedEntry.locator(".miaplaedia-entry-body");
      expect(
        normalize(await body.innerText()),
        `${locale} Concepts - Mid article ${index + 1}`,
      ).toBe(expectedText);
      const expectedBreakCount = (sourceBodyWithBreaks.match(/\r?\n{2,}/g)?.length ?? 0) * 2;
      await expect(body.locator("br")).toHaveCount(expectedBreakCount);
    }

    const pageText = await article.innerText();
    expect(pageText).not.toContain("Cosmic Forge");
    expect(pageText).not.toContain("Cosmic Forger");
  }
});

test("Concepts - Late source keys render all sixteen articles in six locales @cosmicopedia @localization @p44-concepts-late-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const route = MIAPLAEDIA_PANE_IDS[4]!;
  const article = freshGame.locator(`#panel-${route} .miaplaedia-page`);
  const entries = article.locator(".miaplaedia-entry");
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator(`#tab-${route}`).click();
    await expect(article.locator(".game-page-title")).toHaveText(
      settingsSectionName(locale, "conceptsLate"),
    );
    await expect(article.getByTestId("miaplaedia-page-description")).toHaveText(
      cosmicopediaDescription(locale, "conceptsLate")!,
    );

    const sourceEntries = cosmicopediaArticles(locale, "conceptsLate");
    await expect(entries).toHaveCount(sourceEntries.length);
    for (const [index, sourceEntry] of sourceEntries.entries()) {
      const renderedEntry = entries.nth(index);
      await expect(renderedEntry.locator("h3")).toHaveText(sourceEntry.heading);
      const sourceBodyWithBreaks = sourceEntry.body
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n");
      const expectedText = normalize(sourceBodyWithBreaks.replace(/\r?\n+/g, " "));
      const body = renderedEntry.locator(".miaplaedia-entry-body");
      expect(
        normalize(await body.innerText()),
        `${locale} Concepts - Late article ${index + 1}`,
      ).toBe(expectedText);
      const expectedBreakCount = (sourceBodyWithBreaks.match(/\r?\n{2,}/g)?.length ?? 0) * 2;
      await expect(body.locator("br")).toHaveCount(expectedBreakCount);
      const renderedTextWithBreaks = await body.evaluate((element) =>
        Array.from(element.childNodes)
          .map((child) => (child.nodeName === "BR" ? "\n" : (child.textContent ?? "")))
          .join(""),
      );
      expect(
        renderedTextWithBreaks,
        `${locale} Concepts - Late article ${index + 1} paragraph boundaries`,
      ).toBe(sourceBodyWithBreaks.replace(/\r?\n{2,}/g, "\n\n"));
    }

    const pageText = await article.innerText();
    expect(pageText).not.toContain("Cosmic Forge");
    expect(pageText).not.toContain("Cosmic Forger");
  }
});

test("Philosophies source keys render all seven articles in six locales @cosmicopedia @localization @p44-philosophies-copy", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const route = MIAPLAEDIA_PANE_IDS[6]!;
  const article = freshGame.locator(`#panel-${route} .miaplaedia-page`);
  const entries = article.locator(".miaplaedia-entry");
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-miaplaedia").click();
    await freshGame.locator(`#tab-${route}`).click();
    await expect(article.locator(".game-page-title")).toHaveText(
      settingsSectionName(locale, "philosophies"),
    );
    await expect(article.getByTestId("miaplaedia-page-description")).toHaveText(
      cosmicopediaDescription(locale, "philosophies")!,
    );

    const sourceEntries = cosmicopediaArticles(locale, "philosophies");
    await expect(entries).toHaveCount(sourceEntries.length);
    for (const [index, sourceEntry] of sourceEntries.entries()) {
      const renderedEntry = entries.nth(index);
      await expect(renderedEntry.locator("h3")).toHaveText(sourceEntry.heading);
      const sourceBodyWithBreaks = sourceEntry.body
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n");
      const expectedText = normalize(sourceBodyWithBreaks.replace(/\r?\n+/g, " "));
      const body = renderedEntry.locator(".miaplaedia-entry-body");
      expect(normalize(await body.innerText()), `${locale} Philosophies article ${index + 1}`).toBe(
        expectedText,
      );
      const expectedBreakCount = (sourceBodyWithBreaks.match(/\r?\n{2,}/g)?.length ?? 0) * 2;
      await expect(body.locator("br")).toHaveCount(expectedBreakCount);
    }

    const pageText = await article.innerText();
    expect(pageText).not.toContain("Cosmic Forge");
    expect(pageText).not.toContain("Cosmic Forger");
  }
});

test("Remaining Miaplaedia guides have reviewed desktop and phone presentation captures @p66-visual-review", async ({
  freshGame,
}, testInfo) => {
  await dismissTutorialIfVisible(freshGame);
  await freshGame.locator("#tab-miaplaedia").click();
  const pane = freshGame.locator("#pane-miaplaedia");
  await expect(pane.locator(".page-artwork-row")).toHaveCount(0);

  for (const view of [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const) {
    await freshGame.setViewportSize({ width: view.width, height: view.height });
    await freshGame.evaluate((themeId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: "en", themeId },
      });
    }, view.theme);
    await expect(freshGame.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", view.theme);
    await freshGame.addStyleTag({
      content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
    });

    for (const [index, document] of guideDocuments.entries()) {
      if (index === 2) continue;
      const paneId = MIAPLAEDIA_PANE_IDS[index]!;
      await pane.locator(`#tab-${paneId}`).click();
      const article = pane.locator(`#panel-${paneId} .miaplaedia-page`);
      await expect(article.locator(".game-page-title")).toHaveText(document.label);
      await expect(article.locator(".miaplaedia-entry h3").first()).toHaveText(
        document.firstHeading,
      );
      await expect(article.locator(".page-artwork-row")).toHaveCount(0);
      const snapshotId = paneId.replace(/^miaplaedia-/, "");
      await captureVisualCheckpoint(
        freshGame,
        testInfo,
        `phase6-guide-${snapshotId}-${view.suffix}`,
      );
    }
  }
});

test("Early Concepts has durable desktop and phone presentation captures @p66-visual-review", async ({
  freshGame,
}, testInfo) => {
  await dismissTutorialIfVisible(freshGame);
  await freshGame.locator("#tab-miaplaedia").click();
  const pane = freshGame.locator("#pane-miaplaedia");
  const route = MIAPLAEDIA_PANE_IDS[2]!;
  await expect(pane.locator(".page-artwork-row")).toHaveCount(0);
  await freshGame.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  for (const view of [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const) {
    await freshGame.setViewportSize({ width: view.width, height: view.height });
    await freshGame.evaluate((themeId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: "en", themeId },
      });
    }, view.theme);
    await expect(freshGame.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", view.theme);
    await pane.locator(`#tab-${route}`).click();
    const article = pane.locator(`#panel-${route} .miaplaedia-page`);
    await expect(article.locator(".game-page-title")).toHaveText("Concepts - Early");
    await expect(article.locator(".miaplaedia-entry h3").first()).toHaveText("Resources");
    await expect(article.locator(".page-artwork-row")).toHaveCount(0);
    await captureVisualCheckpoint(
      freshGame,
      testInfo,
      `phase6-guide-concepts-early-${view.suffix}`,
    );
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
      { width: 320, height: 844 },
    ]) {
      await freshGame.setViewportSize(viewport);
      await freshGame.locator("#tab-miaplaedia").click();
      for (const paneId of MIAPLAEDIA_PANE_IDS) {
        await freshGame.locator(`#tab-${paneId}`).click();
        const sectionId = miaplaediaSectionId(paneId);
        const article = freshGame.locator(`#panel-${paneId} .miaplaedia-page`);
        await expect(article.locator("h2")).toHaveText(settingsSectionName(locale, sectionId));
        await expect(article.locator(".miaplaedia-entry h3").first()).toHaveText(
          cosmicopediaArticles(locale, sectionId)[0]!.heading,
        );

        const dimensions = await article.evaluate((element) => ({
          clientWidth: element.clientWidth,
          parentWidth: element.parentElement?.clientWidth ?? 0,
          scrollWidth: element.scrollWidth,
          documentWidth: document.documentElement.scrollWidth,
          left: element.getBoundingClientRect().left,
          right: element.getBoundingClientRect().right,
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
        expect(
          dimensions.left,
          `${locale} ${paneId} guide starts within the viewport at ${viewport.width}px`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          dimensions.right,
          `${locale} ${paneId} guide ends within the viewport at ${viewport.width}px`,
        ).toBeLessThanOrEqual(viewport.width);

        const text = await article.innerText();
        expect(text).not.toContain("Cosmic Forge");
        expect(text).not.toContain("Cosmic Forger");
        if (sectionId === "story") {
          expect(text).toContain("Mia'Plac");
          const storyBodies = article.locator(".miaplaedia-entry-body");
          await expect(storyBodies).toHaveCount(3);
          for (const body of await storyBodies.all()) {
            const visibleBody = await body.innerText();
            expect(visibleBody).not.toContain("\\n");
            expect(visibleBody.split(/\n+/).filter((paragraph) => paragraph.trim())).toHaveLength(
              3,
            );
            await expect(body.locator("br")).toHaveCount(4);
          }
        }
      }
    }
  }
});
