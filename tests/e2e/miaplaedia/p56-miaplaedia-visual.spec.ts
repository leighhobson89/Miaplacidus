import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import {
  cosmicopediaArticles,
  cosmicopediaDescription,
} from "../../../src/i18n/cosmicopediaMessages";
import { settingsSectionName } from "../../../src/i18n/settingsMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const normalizeCopy = (text: string) => text.replace(/\s+/g, " ").trim();

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(name);
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

test("P-56 Get Started long-copy page remains contained across locales, themes, and widths @p56-miaplaedia-visual @miaplaedia @presentation", async ({
  freshGame,
}, testInfo) => {
  test.setTimeout(300_000);

  const page = freshGame;
  const route = "miaplaedia-get-started";
  const pane = page.locator("#pane-miaplaedia");
  const article = pane.locator(`#panel-${route} .miaplaedia-page`);
  const sourceEntries = cosmicopediaArticles("es", "getStarted");
  const longestSourceArticle = sourceEntries.reduce(
    (longest, entry) => Math.max(longest, entry.heading.length + entry.body.length),
    0,
  );

  expect(longestSourceArticle).toBe(2859);
  await page.locator("#tab-miaplaedia").click();
  await pane.locator(`#tab-${route}`).click();
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

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
        await expect(page.locator("html"), `${locale} document language`).toHaveAttribute(
          "lang",
          locale,
        );
        await expect(page.locator(".game-frame"), `${themeId} theme`).toHaveAttribute(
          "data-theme",
          themeId,
        );
        await page.locator("#tab-miaplaedia").click();
        await pane.locator(`#tab-${route}`).click();

        const sectionId = "getStarted";
        const sourcePageEntries = cosmicopediaArticles(locale, sectionId);
        const heading = article.locator(".game-page-title");
        const description = article.locator(".miaplaedia-page-description");
        const entries = article.locator(".miaplaedia-entry");
        const body = entries.first().locator(".miaplaedia-entry-body");

        await expect(heading, `${locale} title at ${viewport.width}px`).toHaveText(
          settingsSectionName(locale, sectionId),
        );
        await expect(description, `${locale} description at ${viewport.width}px`).toHaveText(
          cosmicopediaDescription(locale, sectionId)!,
        );
        await expect(entries, `${locale} article count`).toHaveCount(sourcePageEntries.length);
        await expect(entries.first().locator("h3"), `${locale} article heading`).toHaveText(
          sourcePageEntries[0]!.heading,
        );

        const expectedBody = normalizeCopy(
          sourcePageEntries[0]!.body.replace(/\\n/g, "\n").replace(/<br\s*\/?\s*>/gi, " "),
        );
        expect(
          normalizeCopy(await body.innerText()),
          `${locale} source article copy at ${viewport.width}px`,
        ).toBe(expectedBody);

        const dimensions = await article.evaluate((element) => {
          const articleElement = element as HTMLElement;
          const articleBounds = articleElement.getBoundingClientRect();
          const headedElements = Array.from(
            articleElement.querySelectorAll<HTMLElement>(
              ".game-page-title, .miaplaedia-page-description, .miaplaedia-entry h3",
            ),
          );
          const contentElements = Array.from(
            articleElement.querySelectorAll<HTMLElement>(
              ".miaplaedia-page-description, .miaplaedia-entry, .miaplaedia-entry-body",
            ),
          );

          return {
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: Math.max(
              document.documentElement.scrollWidth,
              document.body.scrollWidth,
            ),
            article: {
              clientWidth: articleElement.clientWidth,
              parentWidth: articleElement.parentElement?.clientWidth ?? 0,
              scrollWidth: articleElement.scrollWidth,
              left: articleBounds.left,
              right: articleBounds.right,
            },
            headings: headedElements.map((heading) => {
              const bounds = heading.getBoundingClientRect();
              const styles = getComputedStyle(heading);
              return {
                text: heading.innerText,
                clientWidth: heading.clientWidth,
                clientHeight: heading.clientHeight,
                scrollWidth: heading.scrollWidth,
                scrollHeight: heading.scrollHeight,
                overflowX: styles.overflowX,
                overflowY: styles.overflowY,
                clipsContent:
                  ((styles.overflowX === "hidden" || styles.overflowX === "clip") &&
                    heading.scrollWidth > heading.clientWidth + 1) ||
                  ((styles.overflowY === "hidden" || styles.overflowY === "clip") &&
                    heading.scrollHeight > heading.clientHeight + 1),
                left: bounds.left,
                right: bounds.right,
              };
            }),
            content: contentElements.map((content) => {
              const bounds = content.getBoundingClientRect();
              const styles = getComputedStyle(content);
              return {
                className: content.className,
                clientWidth: content.clientWidth,
                clientHeight: content.clientHeight,
                scrollWidth: content.scrollWidth,
                scrollHeight: content.scrollHeight,
                overflowX: styles.overflowX,
                overflowY: styles.overflowY,
                clipsContent:
                  ((styles.overflowX === "hidden" || styles.overflowX === "clip") &&
                    content.scrollWidth > content.clientWidth + 1) ||
                  ((styles.overflowY === "hidden" || styles.overflowY === "clip") &&
                    content.scrollHeight > content.clientHeight + 1),
                left: bounds.left,
                right: bounds.right,
              };
            }),
          };
        });

        expect(dimensions.viewportWidth, `${viewport.width}px viewport`).toBe(viewport.width);
        expect(
          dimensions.documentWidth,
          `${locale}/${themeId} document width at ${viewport.width}px`,
        ).toBeLessThanOrEqual(viewport.width);
        expect(
          dimensions.article.clientWidth,
          `${locale}/${themeId} guide fills its parent at ${viewport.width}px`,
        ).toBeGreaterThanOrEqual(dimensions.article.parentWidth - 2);
        expect(
          dimensions.article.scrollWidth,
          `${locale}/${themeId} guide horizontal overflow at ${viewport.width}px`,
        ).toBeLessThanOrEqual(dimensions.article.clientWidth);
        expect(
          dimensions.article.left,
          `${viewport.width}px guide left edge`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          dimensions.article.right,
          `${viewport.width}px guide right edge`,
        ).toBeLessThanOrEqual(viewport.width + 1);

        for (const headingMetrics of dimensions.headings) {
          expect(
            headingMetrics.clientHeight,
            `${locale}/${themeId} heading renders: ${headingMetrics.text}`,
          ).toBeGreaterThan(0);
          expect(
            headingMetrics.clipsContent,
            `${locale}/${themeId} heading is not clipped: ${headingMetrics.text}`,
          ).toBe(false);
          expect(
            headingMetrics.scrollWidth,
            `${locale}/${themeId} heading is not horizontally clipped: ${headingMetrics.text}`,
          ).toBeLessThanOrEqual(headingMetrics.clientWidth + 1);
          expect(headingMetrics.left).toBeGreaterThanOrEqual(dimensions.article.left - 1);
          expect(headingMetrics.right).toBeLessThanOrEqual(dimensions.article.right + 1);
        }

        for (const contentMetrics of dimensions.content) {
          expect(
            contentMetrics.scrollWidth,
            `${locale}/${themeId} ${contentMetrics.className} fits ${viewport.width}px`,
          ).toBeLessThanOrEqual(contentMetrics.clientWidth);
          expect(
            contentMetrics.clipsContent,
            `${locale}/${themeId} ${contentMetrics.className} is not clipped`,
          ).toBe(false);
          expect(contentMetrics.left).toBeGreaterThanOrEqual(dimensions.article.left - 1);
          expect(contentMetrics.right).toBeLessThanOrEqual(dimensions.article.right + 1);
        }

        if (
          locale === "es" &&
          ((themeId === "terminal" && viewport.width === 1280) ||
            (themeId === "light" && viewport.width === 390) ||
            (themeId === "space" && viewport.width === 320))
        ) {
          await capture(
            page,
            testInfo,
            `p56-miaplaedia-get-started-es-${themeId}-${viewport.width}.png`,
          );
        }
      }
    }
  }
});
