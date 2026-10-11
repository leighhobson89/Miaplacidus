import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import {
  ACHIEVEMENT_IDS,
  achievementName,
  type AchievementId,
} from "../../../src/content/achievements";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { ACHIEVEMENT_DESCRIPTIONS } from "../../../src/content/achievementDescriptions.generated";
import { achievementText } from "../../../src/i18n/achievementMessages";

const longestDescriptionByLocale: Record<LocaleId, AchievementId> = {
  en: "settleUnoccupiedSystem",
  es: "studyStarMoreThan20LYAway",
  pt: "activateBlackHoleOver10x",
  de: "activateBlackHoleOver10x",
  it: "settleUnoccupiedSystem",
  fr: "activateBlackHoleOver10x",
};

const viewports = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("P-56 Achievements cards and longest descriptions fit across locales, themes, and widths @p56-achievements-visual", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await startMetaFixture(page, "meta-rebirth-ready");

  // Cycle the theme selector through its real control to deterministically earn
  // one visible achievement before checking its earned-card presentation.
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-visual").click();
  const themeSelector = page.locator("#settings-theme");
  for (const themeId of THEME_IDS.slice(1)) await themeSelector.selectOption(themeId);
  await page.locator("#tab-settings-achievements").click();

  const pane = page.getByTestId("achievements-pane");
  const cards = pane.locator("[data-achievement-id]");
  await expect(cards).toHaveCount(ACHIEVEMENT_IDS.length);
  await expect(pane.locator('[data-achievement-id="tryAllThemes"]')).toHaveClass(/is-earned/);

  for (const locale of LOCALE_IDS) {
    for (const themeId of THEME_IDS) {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.evaluate(
          ({ nextLocale, nextTheme }) => {
            window.miaplacidusTest!.dispatch({
              type: "settings.update",
              patch: { locale: nextLocale, themeId: nextTheme },
            });
            window.scrollTo(0, 0);
          },
          { nextLocale: locale, nextTheme: themeId },
        );
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", themeId);
        await expect(pane.locator('[data-achievement-id="tryAllThemes"]')).toHaveClass(/is-earned/);
        await expect(cards).toHaveCount(ACHIEVEMENT_IDS.length);

        const capturePage =
          (locale === "fr" && themeId === "terminal" && viewport.width === 1280) ||
          (locale === "es" && themeId === "light" && viewport.width === 390) ||
          (locale === "de" && themeId === "supernova" && viewport.width === 320) ||
          (locale === "pt" && themeId === "space" && viewport.width === 320);
        if (locale === "de" && themeId === "terminal" && viewport.width === 390) {
          const name = "p56-achievements-de-terminal-390-header.png";
          const image = await page.screenshot({
            path: testInfo.outputPath(name),
            animations: "disabled",
          });
          await testInfo.attach(name, { body: image, contentType: "image/png" });
        }

        const longestId = longestDescriptionByLocale[locale];
        const longestName = achievementName(longestId, locale);
        const help = page.getByRole("button", {
          name: `${achievementText(locale, "showDescription")}: ${longestName}`,
          exact: true,
        });
        const tooltip = page.locator(`#achievement-description-${longestId}`);
        await help.scrollIntoViewIfNeeded();
        await help.focus();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText(ACHIEVEMENT_DESCRIPTIONS[longestId][locale]);
        await tooltip.scrollIntoViewIfNeeded();

        const geometry = await page.evaluate((id) => {
          const paneElement = document.querySelector<HTMLElement>(
            "[data-testid='achievements-pane']",
          );
          const frame = document.querySelector<HTMLElement>(".game-frame");
          const grid = document.querySelector<HTMLElement>(".achievement-grid");
          const tooltipElement = document.querySelector<HTMLElement>(
            `#achievement-description-${id}`,
          );
          if (!paneElement || !frame || !grid || !tooltipElement)
            throw new Error("Achievements layout elements should render.");

          const rect = (element: Element) => {
            const bounds = element.getBoundingClientRect();
            return {
              left: bounds.left,
              right: bounds.right,
              top: bounds.top,
              bottom: bounds.bottom,
            };
          };
          const within = (child: Element, parent: Element, tolerance = 1) => {
            const childBounds = child.getBoundingClientRect();
            const parentBounds = parent.getBoundingClientRect();
            return (
              childBounds.left >= parentBounds.left - tolerance &&
              childBounds.right <= parentBounds.right + tolerance &&
              childBounds.top >= parentBounds.top - tolerance &&
              childBounds.bottom <= parentBounds.bottom + tolerance
            );
          };
          const paneBounds = paneElement.getBoundingClientRect();
          const tooltipBounds = tooltipElement.getBoundingClientRect();
          const achievementCards = Array.from(
            grid.querySelectorAll<HTMLElement>("[data-achievement-id]"),
          );
          const cardRows = achievementCards.map((card) => {
            const content = card.querySelector<HTMLElement>(".achievement-copy");
            const name = card.querySelector<HTMLElement>("h3");
            const reward = card.querySelector<HTMLElement>(".achievement-copy p");
            const permanence = card.querySelector<HTMLElement>(".achievement-copy small");
            const helpButton = card.querySelector<HTMLElement>(
              ".achievement-description-help > button",
            );
            const status = card.querySelector<HTMLElement>(".achievement-status");
            const badge = card.querySelector<HTMLElement>("[data-achievement-badge]");
            if (!content || !name || !reward || !permanence || !helpButton || !status || !badge)
              throw new Error("Achievement card content should render.");
            const cardChildren = [badge, name, reward, permanence, helpButton, status];
            const textNodes = [name, reward, permanence];
            return {
              withinGrid: within(card, grid),
              childrenWithinCard: cardChildren.every((child) => within(child, card)),
              textFits: textNodes.every(
                (element) => element.scrollWidth <= element.clientWidth + 1,
              ),
              hasEarnedOrLockedState:
                card.classList.contains("is-earned") || card.classList.contains("is-locked"),
            };
          });
          const headingContent = Array.from(
            paneElement.querySelectorAll<HTMLElement>(
              ".pane-heading h2, .pane-intro, .achievement-total",
            ),
          );
          return {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            documentWidth: document.documentElement.scrollWidth,
            frameWidth: frame.clientWidth,
            frameScrollWidth: frame.scrollWidth,
            pane: rect(paneElement),
            paneWithinViewport: paneBounds.left >= 0 && paneBounds.right <= window.innerWidth + 1,
            headingWithinPane: headingContent.every((element) => within(element, paneElement)),
            headingDetails: headingContent.map((element) => ({
              selector: element.tagName.toLowerCase(),
              className: element.className,
              bounds: rect(element),
              insidePane: within(element, paneElement),
            })),
            gridWithinPane: within(grid, paneElement),
            cards: cardRows,
            tooltip: rect(tooltipElement),
            tooltipInsideViewport:
              tooltipBounds.left >= 0 &&
              tooltipBounds.right <= window.innerWidth + 1 &&
              tooltipBounds.top >= 0 &&
              tooltipBounds.bottom <= window.innerHeight + 1,
            helpButtonVisible: (() => {
              const button = tooltipElement.parentElement?.querySelector("button");
              if (!button) return false;
              const bounds = button.getBoundingClientRect();
              return (
                bounds.left >= 0 &&
                bounds.right <= window.innerWidth + 1 &&
                bounds.top >= 0 &&
                bounds.bottom <= window.innerHeight + 1
              );
            })(),
            scrollY: window.scrollY,
            scrollHeight: document.documentElement.scrollHeight,
          };
        }, longestId);

        const label = `${locale}/${themeId}/${viewport.width}px`;
        expect(geometry.documentWidth, `${label} document width`).toBeLessThanOrEqual(
          geometry.viewportWidth,
        );
        expect(geometry.frameScrollWidth, `${label} game-frame width`).toBeLessThanOrEqual(
          geometry.frameWidth + 1,
        );
        expect(geometry.paneWithinViewport, `${label} pane bounds`).toBe(true);
        expect(
          geometry.headingWithinPane,
          `${label} heading and count containment: ${JSON.stringify(geometry.headingDetails)}`,
        ).toBe(true);
        expect(geometry.gridWithinPane, `${label} grid containment`).toBe(true);
        expect(geometry.cards, `${label} card count`).toHaveLength(ACHIEVEMENT_IDS.length);
        expect(
          geometry.cards.every((card) => card.withinGrid),
          `${label} cards stay in the grid`,
        ).toBe(true);
        expect(
          geometry.cards.every((card) => card.childrenWithinCard),
          `${label} text, badge, and controls stay in their cards`,
        ).toBe(true);
        expect(
          geometry.cards.every((card) => card.textFits),
          `${label} achievement copy wraps without horizontal text overflow`,
        ).toBe(true);
        expect(
          geometry.cards.every((card) => card.hasEarnedOrLockedState),
          `${label} cards expose their earned or locked presentation`,
        ).toBe(true);
        expect(geometry.tooltipInsideViewport, `${label} longest tooltip bounds`).toBe(true);
        expect(
          geometry.helpButtonVisible,
          `${label} tooltip control stays in view after scroll`,
        ).toBe(true);
        expect(geometry.scrollHeight, `${label} page offers vertical scrolling`).toBeGreaterThan(
          geometry.viewportHeight,
        );

        if (capturePage) {
          const name = `p56-achievements-${locale}-${themeId}-${viewport.width}-tooltip.png`;
          const visibleImage = await page.screenshot({
            path: testInfo.outputPath(name),
            animations: "disabled",
          });
          await testInfo.attach(name, { body: visibleImage, contentType: "image/png" });

          const fullName = `p56-achievements-${locale}-${themeId}-${viewport.width}-full.png`;
          const image = await page.screenshot({
            path: testInfo.outputPath(fullName),
            fullPage: true,
            animations: "disabled",
          });
          await testInfo.attach(fullName, { body: image, contentType: "image/png" });
        }
      }
    }
  }
});
