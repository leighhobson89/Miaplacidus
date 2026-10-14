import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { RANDOM_EVENT_IDS } from "../../../src/content/metaSignals";
import { THEME_IDS } from "../../../src/content/themes";
import { economyLabel } from "../../../src/i18n/economyMessages";
import {
  journalLabel,
  metaSignalText,
  randomEventName,
} from "../../../src/i18n/metaSignalMessages";
import { settingsSectionName } from "../../../src/i18n/settingsMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

function pageLabels(locale: (typeof LOCALE_IDS)[number]): string[] {
  return [
    settingsSectionName(locale, "events"),
    metaSignalText(locale, "title"),
    economyLabel(locale, "eventsOverviewHelp"),
    metaSignalText(locale, "news"),
    metaSignalText(locale, "activeTitle"),
    metaSignalText(locale, "history"),
    journalLabel(locale, "eventProbabilities"),
    ...RANDOM_EVENT_IDS.map((id) => randomEventName(locale, id)),
  ];
}

const longestPageLabelLocale = LOCALE_IDS.reduce((longestLocale, locale) => {
  const longestLabelLength = Math.max(...pageLabels(locale).map((label) => label.length));
  const currentLongestLength = Math.max(...pageLabels(longestLocale).map((label) => label.length));
  return longestLabelLength > currentLongestLength ? locale : longestLocale;
}, LOCALE_IDS[0]);

const longestEventNameLocale = LOCALE_IDS.reduce((longestLocale, locale) => {
  const longestNameLength = Math.max(
    ...RANDOM_EVENT_IDS.map((id) => randomEventName(locale, id).length),
  );
  const currentLongestLength = Math.max(
    ...RANDOM_EVENT_IDS.map((id) => randomEventName(longestLocale, id).length),
  );
  return longestNameLength > currentLongestLength ? locale : longestLocale;
}, LOCALE_IDS[0]);

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(name);
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

test("P-56 Events journal and probabilities fit across locales, themes, and widths @p56-events-visual @random-events @presentation", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "scienceTheft",
    }),
  );
  const resultDialog = page.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await resultDialog.getByRole("button").click();
  await expect(resultDialog).not.toBeVisible();
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  const settings = page.getByTestId("settings-pane");
  const panel = page.locator("#panel-settings-events");
  const journal = panel.getByTestId("meta-journal-pane");
  const probabilityList = journal.locator("details.journal-event-odds");
  const probabilitySummary = probabilityList.locator("summary");
  const historyEntry = journal.locator('[data-event-id="scienceTheft"]');

  for (const locale of LOCALE_IDS) {
    for (const themeId of THEME_IDS) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.evaluate(
          ({ locale, themeId }) => {
            window.miaplacidusTest!.dispatch({
              type: "settings.update",
              patch: { locale, themeId },
            });
          },
          { locale, themeId },
        );
        await expect(page.locator("html"), `${locale} language`).toHaveAttribute("lang", locale);
        await expect(page.locator(".game-frame:not(.notification-portal)"), `${themeId} theme`).toHaveAttribute(
          "data-theme",
          themeId,
        );

        await page.locator("#tab-settings").click();
        await settings.locator("#tab-settings-events").click();
        await expect(panel, `${locale}/${themeId} Events page`).toBeVisible();
        await expect(panel.locator(".pane-heading h2")).toHaveText(metaSignalText(locale, "title"));
        await expect(page.getByTestId("settings-events-overview-help")).toContainText(
          economyLabel(locale, "eventsOverviewHelp"),
        );
        await expect(
          journal.getByRole("heading", { name: metaSignalText(locale, "activeTitle") }),
        ).toBeVisible();
        await expect(
          journal.getByRole("heading", { name: metaSignalText(locale, "history") }),
        ).toBeVisible();
        await expect(historyEntry.locator("p").first()).toHaveText(
          randomEventName(locale, "scienceTheft"),
        );

        if (!(await probabilityList.evaluate((element) => (element as HTMLDetailsElement).open))) {
          await probabilitySummary.click();
        }
        await expect(probabilityList).toHaveAttribute("open", "");
        await expect(probabilitySummary).toContainText(journalLabel(locale, "eventProbabilities"));
        await expect(probabilityList.locator("li")).toHaveCount(RANDOM_EVENT_IDS.length);
        await expect(probabilityList.locator("li span")).toHaveText(
          RANDOM_EVENT_IDS.map((id) => randomEventName(locale, id)),
        );

        const bounds = await panel.evaluate((panelElement) => {
          const activePanel = panelElement as HTMLElement;
          const journalElement = activePanel.querySelector<HTMLElement>(".meta-journal-pane");
          if (!journalElement) throw new Error("Events journal should render");
          const panelRect = activePanel.getBoundingClientRect();
          const journalRect = journalElement.getBoundingClientRect();
          const labelElements = Array.from(
            activePanel.querySelectorAll<HTMLElement>(
              ".pane-heading h2, .pane-heading .pane-intro, .journal-section-heading h3, .journal-section-heading small, .journal-subheading, .journal-empty, .journal-event-odds summary, .journal-event-odds li, .journal-event-odds li span, .journal-event-odds li strong, .journal-event-list p",
            ),
          ).filter((element) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
          });

          return {
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: Math.max(
              document.documentElement.scrollWidth,
              document.body.scrollWidth,
            ),
            panel: {
              left: panelRect.left,
              right: panelRect.right,
              clientWidth: activePanel.clientWidth,
              scrollWidth: activePanel.scrollWidth,
            },
            journal: {
              left: journalRect.left,
              right: journalRect.right,
              clientWidth: journalElement.clientWidth,
              scrollWidth: journalElement.scrollWidth,
            },
            labels: labelElements.map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                text: element.innerText,
                left: rect.left,
                right: rect.right,
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
              };
            }),
          };
        });

        expect(bounds.viewportWidth, `${viewport.width}px viewport`).toBe(viewport.width);
        expect(
          bounds.documentWidth,
          `${locale}/${themeId} document width at ${viewport.width}px`,
        ).toBeLessThanOrEqual(viewport.width);
        expect(bounds.panel.left, `${locale}/${themeId} Events panel left`).toBeGreaterThanOrEqual(
          -1,
        );
        expect(bounds.panel.right, `${locale}/${themeId} Events panel right`).toBeLessThanOrEqual(
          viewport.width + 1,
        );
        expect(
          bounds.panel.scrollWidth,
          `${locale}/${themeId} Events panel overflow`,
        ).toBeLessThanOrEqual(bounds.panel.clientWidth + 1);
        expect(
          bounds.journal.scrollWidth,
          `${locale}/${themeId} journal overflow`,
        ).toBeLessThanOrEqual(bounds.journal.clientWidth + 1);

        for (const label of bounds.labels) {
          expect(
            label.left,
            `${locale}/${themeId} label starts within its page: ${label.text}`,
          ).toBeGreaterThanOrEqual(bounds.panel.left - 1);
          expect(
            label.right,
            `${locale}/${themeId} label ends within its page: ${label.text}`,
          ).toBeLessThanOrEqual(bounds.panel.right + 1);
          expect(
            label.scrollWidth,
            `${locale}/${themeId} label is not horizontally clipped: ${label.text}`,
          ).toBeLessThanOrEqual(label.clientWidth + 2);
        }

        if (
          (locale === longestPageLabelLocale &&
            ((themeId === "terminal" && viewport.width === 1280) ||
              (themeId === "light" && viewport.width === 390) ||
              (themeId === "space" && viewport.width === 320))) ||
          (locale === longestEventNameLocale && themeId === "space" && viewport.width === 320)
        ) {
          const sample =
            locale === longestEventNameLocale && themeId === "space" && viewport.width === 320
              ? "longest-event"
              : "longest-page-label";
          await capture(
            page,
            testInfo,
            `p56-events-${sample}-${locale}-${themeId}-${viewport.width}.png`,
          );
        }
      }
    }
  }
});
