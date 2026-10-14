import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { createStarCatalogue, GALAXY_SEED_DEFAULT } from "../../../src/content";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  MEGASTRUCTURE_TRACKS,
  TECHNOLOGY_BY_ID,
  type MegastructureId,
} from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { THEME_IDS } from "../../../src/content/themes";
import { miaplacidusForceFieldLevel } from "../../../src/engine/megastructures";
import {
  megastructureStageProgress,
  megastructureText,
} from "../../../src/i18n/megastructureMessages";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;
const TRACK_IDS = Object.keys(MEGASTRUCTURE_TRACKS) as MegastructureId[];

const starName = (systemId: string): string =>
  createStarCatalogue(GALAXY_SEED_DEFAULT).find((star) => star.id === systemId)?.name ?? systemId;

for (const activeTrackId of TRACK_IDS) {
  test(`P-56 ${activeTrackId} content fits all locale/theme/viewport combinations @p56-megastructure-visual`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(300_000);
    await page.setViewportSize(VIEWPORTS[0]);
    await startMetaFixture(page, `meta-megastructure-visual-${activeTrackId}`);
    await page.addStyleTag({
      content: ".weather-effects-overlay, .pointer-trail-layer { display: none !important; }",
    });
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-megastructures").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const pane = page.getByTestId("megastructure-pane");
    const manuscripts = state.permanent.megastructures.ancientManuscripts;
    const completedIds = state.permanent.megastructures.researchedTechnologyIds;
    const activeStages = MEGASTRUCTURE_TRACKS[activeTrackId];
    const activeNextStage = activeStages.find(
      (technologyId) => !completedIds.includes(technologyId),
    );
    expect(activeNextStage, `${activeTrackId} fixture needs an unresearched stage`).toBeTruthy();
    for (const trackId of TRACK_IDS) {
      const researchedStages = MEGASTRUCTURE_TRACKS[trackId].filter((technologyId) =>
        completedIds.includes(technologyId),
      );
      expect(
        researchedStages,
        `${trackId} fixture should have sequential stage 1–3 progress`,
      ).toEqual(MEGASTRUCTURE_TRACKS[trackId].slice(0, 3));
    }
    const activeStageNumber = activeStages.indexOf(activeNextStage!) + 1;
    const activePrice = TECHNOLOGY_BY_ID[activeNextStage!].price;

    const capture = async (name: string) => {
      const path = testInfo.snapshotPath(name);
      await page.screenshot({ path, fullPage: true, animations: "disabled" });
      await testInfo.attach(name, { path, contentType: "image/png" });
    };

    for (const locale of LOCALE_IDS) {
      const copy = megastructureText(locale);
      for (const theme of THEME_IDS) {
        for (const viewport of VIEWPORTS) {
          await page.setViewportSize(viewport);
          await page.evaluate(
            ({ nextLocale, nextTheme }) =>
              window.miaplacidusTest!.dispatch({
                type: "settings.update",
                patch: { locale: nextLocale, themeId: nextTheme },
              }),
            { nextLocale: locale, nextTheme: theme },
          );
          const context = `${activeTrackId}/${locale}/${theme}/${viewport.width}px`;
          await expect(page.locator("html"), `${context} language`).toHaveAttribute("lang", locale);
          await expect(page.locator(".game-frame:not(.notification-portal)"), `${context} theme`).toHaveAttribute(
            "data-theme",
            theme,
          );
          await expect(pane.getByRole("heading", { level: 2 }), `${context} title`).toHaveText(
            copy.title,
          );
          await expect(
            pane.locator(".economy-section-heading > p").first(),
            `${context} intro`,
          ).toHaveText(copy.introduction);

          const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
          await expect(
            pane.getByTestId("megastructure-force-field"),
            `${context} force field`,
          ).toContainText(
            (miaplacidusForceFieldLevel(state) >= 4 ? copy.forceFieldCleared : copy.forceField)
              .replace("{level}", number(miaplacidusForceFieldLevel(state)))
              .replace("{total}", number(4)),
          );

          for (const [index, record] of manuscripts.entries()) {
            const message = copy.manuscriptReported
              .replace("{number}", String(record.position))
              .replace("{manuscript}", starName(record.manuscriptSystemId))
              .replace("{structure}", copy.structureNames[record.megastructureId])
              .replace("{factory}", starName(record.factorySystemId));
            await expect(
              pane.getByTestId(`manuscript-${index + 1}`),
              `${context} manuscript ${index + 1}`,
            ).toHaveText(message);
          }

          for (const trackId of TRACK_IDS) {
            const stageIds = MEGASTRUCTURE_TRACKS[trackId];
            const card = pane.getByTestId(`megastructure-track-${trackId}`);
            const trackContext = `${context}/${trackId}`;
            const researchedCount = stageIds.filter((id) => completedIds.includes(id)).length;
            await expect(
              card.getByRole("heading", { level: 3 }),
              `${trackContext} heading`,
            ).toHaveText(copy.structureNames[trackId]);
            await expect(card.locator("p").first(), `${trackContext} progress`).toHaveText(
              megastructureStageProgress(locale, researchedCount, stageIds.length, number),
            );
            for (const [stageIndex, technologyId] of stageIds.entries()) {
              const row = card.locator("ol li").nth(stageIndex);
              await expect(
                row.locator("span").first(),
                `${trackContext} stage ${stageIndex + 1}`,
              ).toHaveText(
                `${copy.stage.replace("{number}", String(stageIndex + 1))}: ${TECHNOLOGY_NAMES[technologyId][locale]}`,
              );
              if (completedIds.includes(technologyId)) {
                await expect(
                  row.locator(".status-pill"),
                  `${trackContext} researched stage ${stageIndex + 1}`,
                ).toHaveText(copy.researched);
              }
            }

            const action = card.getByRole("button", {
              name: copy.researchAction,
              exact: true,
            });
            await expect(action, `${trackContext} action`).toBeVisible();
            if (trackId === activeTrackId) {
              const expectedCost = copy.researchCost.replace("{cost}", number(activePrice));
              const expectedActiveStage = `${copy.stage.replace("{number}", String(activeStageNumber))}: ${TECHNOLOGY_NAMES[activeNextStage!][locale]}`;
              await expect(
                card.getByTestId("megastructure-next-stage"),
                `${trackContext} cost`,
              ).toContainText(expectedActiveStage);
              await expect(
                card.getByTestId("megastructure-next-stage"),
                `${trackContext} price`,
              ).toContainText(expectedCost);
              await expect(action, `${trackContext} enabled action`).toBeEnabled();
            } else {
              await expect(
                card.getByTestId(`megastructure-research-reason-${trackId}`),
                `${trackContext} inactive reason`,
              ).toHaveText(copy.notAtFactory);
              await expect(action, `${trackContext} disabled action`).toBeDisabled();
            }
          }

          const bounds = await pane.evaluate((root) => {
            const rect = (element: Element) => {
              const box = element.getBoundingClientRect();
              return {
                left: box.left,
                right: box.right,
                width: box.width,
                scrollWidth: (element as HTMLElement).scrollWidth,
                clientWidth: (element as HTMLElement).clientWidth,
              };
            };
            const paneRect = root.getBoundingClientRect();
            const cards = Array.from(root.querySelectorAll<HTMLElement>(".megastructure-track"));
            const controls = Array.from(root.querySelectorAll<HTMLElement>("button"));
            const textRects: { left: number; right: number }[] = [];
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const textNode = walker.currentNode;
              if (!textNode.textContent?.trim()) continue;
              const parent = textNode.parentElement;
              if (!parent || parent.closest(".sr-only,[hidden]")) continue;
              const style = getComputedStyle(parent);
              if (style.display === "none" || style.visibility === "hidden") continue;
              const range = document.createRange();
              range.selectNodeContents(textNode);
              for (const box of Array.from(range.getClientRects())) {
                if (box.width && box.height) textRects.push({ left: box.left, right: box.right });
              }
            }
            return {
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: document.documentElement.clientWidth,
              pane: rect(root),
              paneLeft: paneRect.left,
              paneRight: paneRect.right,
              cards: cards.map(rect),
              controls: controls.map(rect),
              textRects,
            };
          });

          expect(bounds.documentWidth, `${context} document overflow`).toBeLessThanOrEqual(
            bounds.viewportWidth,
          );
          expect(bounds.pane.left, `${context} pane left`).toBeGreaterThanOrEqual(-1);
          expect(bounds.pane.right, `${context} pane right`).toBeLessThanOrEqual(
            bounds.viewportWidth + 1,
          );
          expect(bounds.pane.scrollWidth, `${context} pane scroll width`).toBeLessThanOrEqual(
            bounds.pane.clientWidth + 1,
          );
          for (const [index, card] of bounds.cards.entries()) {
            expect(card.left, `${context} card ${index + 1} left`).toBeGreaterThanOrEqual(
              bounds.paneLeft - 1,
            );
            expect(card.right, `${context} card ${index + 1} right`).toBeLessThanOrEqual(
              bounds.paneRight + 1,
            );
            expect(card.scrollWidth, `${context} card ${index + 1} content`).toBeLessThanOrEqual(
              card.clientWidth + 1,
            );
          }
          for (const [index, control] of bounds.controls.entries()) {
            expect(control.left, `${context} control ${index + 1} left`).toBeGreaterThanOrEqual(
              bounds.paneLeft - 1,
            );
            expect(control.right, `${context} control ${index + 1} right`).toBeLessThanOrEqual(
              bounds.paneRight + 1,
            );
          }
          for (const [index, textRect] of bounds.textRects.entries()) {
            expect(textRect.left, `${context} text ${index + 1} left`).toBeGreaterThanOrEqual(-1);
            expect(textRect.right, `${context} text ${index + 1} right`).toBeLessThanOrEqual(
              bounds.viewportWidth + 1,
            );
          }

          if (locale === "en" && theme === "terminal" && viewport.width === 1280) {
            await capture(`p56-megastructure-${activeTrackId}-en-terminal-desktop.png`);
          }
          if (
            activeTrackId === "galacticMemoryArchive" &&
            locale === "de" &&
            theme === "light" &&
            viewport.width === 390
          ) {
            await capture("p56-megastructure-archive-de-light-phone.png");
          }
          if (
            activeTrackId === "galacticMemoryArchive" &&
            locale === "fr" &&
            theme === "space" &&
            viewport.width === 320
          ) {
            await capture("p56-megastructure-archive-fr-space-narrow.png");
          }
        }
      }
    }
  });
}
