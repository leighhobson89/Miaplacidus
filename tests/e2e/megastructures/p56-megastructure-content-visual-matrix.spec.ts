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
          const context = `${activeTrackId}/${locale}/${theme}/${viewport.width}px`;
          const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
          const presentation = await page.evaluate(async ({ trackIds, nextLocale, nextTheme }) => {
            window.miaplacidusTest!.dispatch({
              type: "settings.update",
              patch: { locale: nextLocale, themeId: nextTheme },
            });
            await new Promise<void>((resolve) => {
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            });
            const normalizeText = (element: Element | null): string | null =>
              element?.textContent?.replace(/\s+/g, " ").trim() ?? null;
            const pane = document.querySelector<HTMLElement>('[data-testid="megastructure-pane"]')!;
            const frame = document.querySelector<HTMLElement>(".game-frame:not(.notification-portal)");
            const tracks = Object.fromEntries(
              trackIds.map((trackId) => {
                const card = pane.querySelector<HTMLElement>(
                  `[data-testid="megastructure-track-${trackId}"]`,
                );
                const buttons = Array.from(card?.querySelectorAll<HTMLButtonElement>("button") ?? []);
                const button = buttons[0] ?? null;
                return [
                  trackId,
                  {
                    heading: normalizeText(card?.querySelector("h3") ?? null),
                    progress: normalizeText(card?.querySelector("p") ?? null),
                    stages: Array.from(card?.querySelectorAll("ol li") ?? [], (row) => ({
                      label: normalizeText(row.querySelector("span")),
                      status: normalizeText(row.querySelector(".status-pill")),
                    })),
                    nextStage: normalizeText(card?.querySelector('[data-testid="megastructure-next-stage"]') ?? null),
                    reason: normalizeText(
                      card?.querySelector(`[data-testid="megastructure-research-reason-${trackId}"]`) ?? null,
                    ),
                    actionName: normalizeText(button),
                    actionCount: buttons.length,
                    actionVisible: Boolean(
                      button &&
                        button.getClientRects().length > 0 &&
                        getComputedStyle(button).visibility !== "hidden" &&
                        getComputedStyle(button).display !== "none",
                    ),
                    actionDisabled: button?.disabled ?? null,
                  },
                ];
              }),
            );
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
            const paneRect = pane.getBoundingClientRect();
            const cards = Array.from(pane.querySelectorAll<HTMLElement>(".megastructure-track"));
            const controls = Array.from(pane.querySelectorAll<HTMLElement>("button"));
            const textRects: { left: number; right: number }[] = [];
            const walker = document.createTreeWalker(pane, NodeFilter.SHOW_TEXT);
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
              lang: document.documentElement.lang,
              theme: frame?.dataset.theme ?? null,
              title: normalizeText(pane.querySelector("h2")),
              introduction: normalizeText(pane.querySelector(".economy-section-heading > p")),
              forceField: normalizeText(pane.querySelector('[data-testid="megastructure-force-field"]')),
              manuscripts: Array.from(
                pane.querySelectorAll('[data-testid^="manuscript-"]'),
                normalizeText,
              ),
              tracks,
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: document.documentElement.clientWidth,
              pane: rect(pane),
              paneLeft: paneRect.left,
              paneRight: paneRect.right,
              cards: cards.map(rect),
              controls: controls.map(rect),
              textRects,
            };
          }, { trackIds: TRACK_IDS, nextLocale: locale, nextTheme: theme });

          expect(presentation.lang, `${context} language`).toBe(locale);
          expect(presentation.theme, `${context} theme`).toBe(theme);
          expect(presentation.title, `${context} title`).toBe(copy.title);
          expect(presentation.introduction, `${context} intro`).toBe(copy.introduction);
          expect(presentation.forceField, `${context} force field`).toContain(
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
            expect(presentation.manuscripts[index], `${context} manuscript ${index + 1}`).toBe(
              message,
            );
          }

          for (const trackId of TRACK_IDS) {
            const stageIds = MEGASTRUCTURE_TRACKS[trackId];
            const track = presentation.tracks[trackId];
            const trackContext = `${context}/${trackId}`;
            const researchedCount = stageIds.filter((id) => completedIds.includes(id)).length;
            expect(track?.heading, `${trackContext} heading`).toBe(copy.structureNames[trackId]);
            expect(track?.progress, `${trackContext} progress`).toBe(
              megastructureStageProgress(locale, researchedCount, stageIds.length, number),
            );
            for (const [stageIndex, technologyId] of stageIds.entries()) {
              const row = track?.stages[stageIndex];
              expect(row?.label, `${trackContext} stage ${stageIndex + 1}`).toBe(
                `${copy.stage.replace("{number}", String(stageIndex + 1))}: ${TECHNOLOGY_NAMES[technologyId][locale]}`,
              );
              if (completedIds.includes(technologyId)) {
                expect(row?.status, `${trackContext} researched stage ${stageIndex + 1}`).toBe(
                  copy.researched,
                );
              }
            }

            expect(track?.actionName, `${trackContext} action`).toBe(copy.researchAction);
            expect(track?.actionCount, `${trackContext} action count`).toBe(1);
            expect(track?.actionVisible, `${trackContext} action visibility`).toBe(true);
            if (trackId === activeTrackId) {
              const expectedCost = copy.researchCost.replace("{cost}", number(activePrice));
              const expectedActiveStage = `${copy.stage.replace("{number}", String(activeStageNumber))}: ${TECHNOLOGY_NAMES[activeNextStage!][locale]}`;
              expect(track?.nextStage, `${trackContext} next stage`).toContain(expectedActiveStage);
              expect(track?.nextStage, `${trackContext} cost`).toContain(expectedCost);
              expect(track?.actionDisabled, `${trackContext} enabled action`).toBe(false);
            } else {
              expect(track?.reason, `${trackContext} inactive reason`).toBe(copy.notAtFactory);
              expect(track?.actionDisabled, `${trackContext} disabled action`).toBe(true);
            }
          }

          const bounds = presentation;
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
