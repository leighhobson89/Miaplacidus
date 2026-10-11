import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import {
  ASCENDENCY_PERKS,
  ascendencyPerkCost,
  ascendencyPerkLevel,
  ascendencyPerkMaxed,
} from "../../../src/content/ascendency";
import { LOCALE_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  metaPerkCopy,
  metaText,
  rebirthCarryText,
  rebirthText,
} from "../../../src/i18n/metaMessages";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("P-54 E-57 Ascendency perk copy and AP costs fit in all locales at phone widths @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page);
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-ascendency-perks").click();

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const pane = page.getByTestId("ascendency-pane");

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
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(
        pane.getByRole("heading", { name: metaText(locale, "perksTitle"), exact: true }),
      ).toBeVisible();
      await expect(pane.locator(".pane-intro")).toHaveText(
        `${metaText(locale, "ap")}: ${formatNumber(locale, state.permanent.ascendencyPoints, 0, state.settings.notation)}`,
      );
      for (const perk of ASCENDENCY_PERKS) {
        const card = pane.locator(`[data-perk-id="${perk.id}"]`);
        const [name, description] = metaPerkCopy(locale, perk.id);
        const level = ascendencyPerkLevel(state.permanent.acquiredPerks, perk.id);
        const cost = ascendencyPerkCost(state.permanent.acquiredPerks, perk.id);
        const maxed = ascendencyPerkMaxed(state.permanent.acquiredPerks, perk.id);
        const expectedCost = `${metaText(locale, "level")}: ${formatNumber(locale, level, 0, state.settings.notation)} · ${metaText(locale, "cost")}: ${maxed ? metaText(locale, "maxed") : formatNumber(locale, cost, 0, state.settings.notation)} AP`;
        await expect(card.getByRole("heading", { name, exact: true })).toBeVisible();
        await expect(card.locator(".card-copy p")).toHaveText(description);
        await expect(card.locator(".cost-line")).toHaveText(expectedCost);
        await expect(card.getByRole("button")).toBeVisible();
      }

      const bounds = await page.evaluate(() => {
        const paneElement = document.querySelector<HTMLElement>("[data-testid='ascendency-pane']")!;
        const paneRect = paneElement.getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          pane: {
            left: paneRect.left,
            right: paneRect.right,
            scrollWidth: paneElement.scrollWidth,
            clientWidth: paneElement.clientWidth,
          },
          cards: Array.from(paneElement.querySelectorAll<HTMLElement>("[data-perk-id]")).map(
            (card) => {
              const rect = card.getBoundingClientRect();
              return {
                id: card.dataset.perkId,
                left: rect.left,
                right: rect.right,
                scrollWidth: card.scrollWidth,
                clientWidth: card.clientWidth,
              };
            },
          ),
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      const boxes = {
        pane: bounds.pane,
        ...Object.fromEntries(bounds.cards.map((card) => [card.id, card])),
      };
      for (const [name, box] of Object.entries(boxes)) {
        expect(box.left, `${locale}/${viewport.width}px ${name} left`).toBeGreaterThanOrEqual(-1);
        expect(box.right, `${locale}/${viewport.width}px ${name} right`).toBeLessThanOrEqual(
          bounds.viewport + 1,
        );
        expect(
          box.scrollWidth,
          `${locale}/${viewport.width}px ${name} overflow`,
        ).toBeLessThanOrEqual(box.clientWidth + 1);
      }
      if (locale === "fr" && viewport.width === 320) {
        const name = "p54-e57-ascendency-fr-320.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
    }
  }
});

test("P-54 E-57 Rebirth confirmation copy fits in all locales at phone widths @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-galactic-identity-matrix");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-rebirth").click();
  const pane = page.getByTestId("rebirth-pane");
  const trigger = pane.getByRole("button", { name: metaText("en", "rebirthAction"), exact: true });
  await expect(trigger).toBeEnabled();

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const points = formatNumber("en", state.permanent.ascendencyPoints, 0, state.settings.notation);
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
    const title = rebirthText(locale, "title");

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await pane
        .getByRole("button", { name: metaText(locale, "rebirthAction"), exact: true })
        .click();
      const dialog = page.getByRole("dialog", { name: title, exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(dialog.locator(".rebirth-confirm-prompt")).toHaveText(
        rebirthText(locale, "prompt"),
      );
      await expect(dialog.locator("p").nth(1)).toHaveText(rebirthCarryText(locale, points));
      await expect(
        dialog.getByRole("button", { name: rebirthText(locale, "confirm"), exact: true }),
      ).toBeVisible();

      const bounds = await page.evaluate(() => {
        const dialogElement = document.querySelector<HTMLDialogElement>(
          "dialog[aria-labelledby='rebirth-confirm-title']",
        )!;
        const rect = dialogElement.getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          left: rect.left,
          right: rect.right,
          scrollWidth: dialogElement.scrollWidth,
          clientWidth: dialogElement.clientWidth,
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      expect(bounds.left, `${locale}/${viewport.width}px dialog left`).toBeGreaterThanOrEqual(-1);
      expect(bounds.right, `${locale}/${viewport.width}px dialog right`).toBeLessThanOrEqual(
        bounds.viewport + 1,
      );
      expect(
        bounds.scrollWidth,
        `${locale}/${viewport.width}px dialog content`,
      ).toBeLessThanOrEqual(bounds.clientWidth + 1);
      if (locale === "fr" && viewport.width === 320) {
        const name = "p54-e57-rebirth-fr-320-dialog.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
      await dialog
        .getByRole("button", { name: rebirthText(locale, "cancel"), exact: true })
        .click();
      await expect(dialog).toBeHidden();
    }
  }
});
