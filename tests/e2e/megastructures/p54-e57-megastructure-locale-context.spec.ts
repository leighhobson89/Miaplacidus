import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  MEGASTRUCTURE_TRACKS,
  TECHNOLOGY_BY_ID,
  type MegastructureId,
} from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  megastructureStageProgress,
  megastructureText,
} from "../../../src/i18n/megastructureMessages";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;
const TRACK_IDS = Object.keys(MEGASTRUCTURE_TRACKS) as MegastructureId[];

for (const trackId of TRACK_IDS) {
  test(`P-54 E-57 ${trackId} stage and cost rows fit in all locales at phone widths @p54-e57`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(VIEWPORTS[0]);
    await startMetaFixture(page, `meta-megastructure-factory-${trackId}`);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-megastructures").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const track = MEGASTRUCTURE_TRACKS[trackId];
    const completedIds = state.permanent.megastructures.researchedTechnologyIds;
    const factory = state.permanent.megastructures.ancientManuscripts.find(
      (entry) => entry.megastructureId === trackId,
    );
    expect(factory, `${trackId} should have a reported factory`).toBeTruthy();
    expect(state.run.space.currentSystemId, `${trackId} fixture should be at its factory`).toBe(
      factory!.factorySystemId,
    );
    const completedCount = track.filter((id) => completedIds.includes(id)).length;
    const nextTechnologyId = track.find((id) => !completedIds.includes(id));
    expect(nextTechnologyId, `${trackId} should have a next stage`).toBeTruthy();
    const price = TECHNOLOGY_BY_ID[nextTechnologyId!].price;
    const pane = page.getByTestId("megastructure-pane");
    const activeTrack = pane.getByTestId(`megastructure-track-${trackId}`);

    for (const locale of LOCALE_IDS) {
      await page.evaluate(
        (nextLocale) =>
          window.miaplacidusTest!.dispatch({
            type: "settings.update",
            patch: { locale: nextLocale },
          }),
        locale,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const copy = megastructureText(locale);
      const expectedNextName = TECHNOLOGY_NAMES[nextTechnologyId!][locale];
      const expectedCost = copy.researchCost.replace("{cost}", formatNumber(locale, price, 0));
      const expectedProgress = megastructureStageProgress(
        locale,
        completedCount,
        track.length,
        (value) => formatNumber(locale, value, 0),
      );

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await expect(pane.getByRole("heading", { name: copy.title, exact: true })).toBeVisible();
        await expect(pane.getByTestId("megastructure-next-stage")).toHaveCount(1);
        await expect(pane.locator(".megastructure-next-stage")).toHaveCount(1);
        await expect(activeTrack.getByTestId("megastructure-next-stage")).toContainText(
          expectedNextName,
        );
        await expect(activeTrack.getByTestId("megastructure-next-stage")).toContainText(
          expectedCost,
        );
        await expect(activeTrack).toContainText(expectedProgress);
        await expect(
          activeTrack.getByRole("button", { name: copy.researchAction, exact: true }),
        ).toBeEnabled();

        for (const [otherTrackId, stageIds] of Object.entries(MEGASTRUCTURE_TRACKS)) {
          const structure = pane.getByTestId(`megastructure-track-${otherTrackId}`);
          const reported = state.permanent.megastructures.ancientManuscripts.find(
            (entry) => entry.megastructureId === otherTrackId,
          );
          expect(reported?.reported, `${otherTrackId} should be reported`).toBe(true);
          const structureCompleted = stageIds.filter((id) => completedIds.includes(id)).length;
          await expect(
            structure.getByRole("heading", {
              name: copy.structureNames[otherTrackId as MegastructureId],
              exact: true,
            }),
          ).toBeVisible();
          await expect(structure).toContainText(
            megastructureStageProgress(locale, structureCompleted, stageIds.length, (value) =>
              formatNumber(locale, value, 0),
            ),
          );
          for (const technologyId of stageIds) {
            await expect(structure).toContainText(TECHNOLOGY_NAMES[technologyId][locale]);
          }
        }

        const bounds = await page.evaluate(() => {
          const read = (element: HTMLElement) => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
            };
          };
          return {
            viewport: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            pane: read(document.querySelector<HTMLElement>("[data-testid='megastructure-pane']")!),
            tracks: Array.from(document.querySelectorAll<HTMLElement>(".megastructure-track")).map(
              read,
            ),
            next: read(
              document.querySelector<HTMLElement>("[data-testid='megastructure-next-stage']")!,
            ),
          };
        });
        expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
          bounds.viewport,
        );
        for (const [label, box] of Object.entries({ pane: bounds.pane, next: bounds.next })) {
          expect(box.left, `${locale}/${viewport.width}px ${label} left`).toBeGreaterThanOrEqual(
            -1,
          );
          expect(box.right, `${locale}/${viewport.width}px ${label} right`).toBeLessThanOrEqual(
            bounds.viewport + 1,
          );
          expect(
            box.scrollWidth,
            `${locale}/${viewport.width}px ${label} overflow`,
          ).toBeLessThanOrEqual(box.clientWidth + 1);
        }
        for (const [index, box] of bounds.tracks.entries()) {
          expect(
            box.left,
            `${locale}/${viewport.width}px track ${index} left`,
          ).toBeGreaterThanOrEqual(-1);
          expect(
            box.right,
            `${locale}/${viewport.width}px track ${index} right`,
          ).toBeLessThanOrEqual(bounds.viewport + 1);
          expect(
            box.scrollWidth,
            `${locale}/${viewport.width}px track ${index} overflow`,
          ).toBeLessThanOrEqual(box.clientWidth + 1);
        }

        if (locale === "fr" && viewport.width === 320) {
          const name = `p54-e57-megastructure-${trackId}-fr-320.png`;
          const path = testInfo.outputPath(name);
          await page.screenshot({ path, fullPage: true, animations: "disabled" });
          await testInfo.attach(name, { path, contentType: "image/png" });
        }
      }
    }
  });
}
