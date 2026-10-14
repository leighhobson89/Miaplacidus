import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { BLACK_HOLE_CHARGE_TIMER_ID } from "../../../src/engine/blackHole";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("P-54 E-57 Black Hole status, upgrade costs, and progress fit in all locales at phone widths @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-black-hole").click();

  const pane = page.locator(".black-hole-pane");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const research = page.getByTestId("black-hole-research");
  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    const copy = blackHoleText(locale);
    const expectedResearchPrice = `${copy.researchAction} · ${formatNumber(locale, before.permanent.blackHole.researchPrice, 0, before.settings.notation)} RP`;
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(
        research.getByRole("button", { name: expectedResearchPrice, exact: true }),
      ).toBeVisible();
      const bounds = await page.evaluate(() => {
        const button = document.querySelector<HTMLElement>(".black-hole-research button")!;
        const rect = button.getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          left: rect.left,
          right: rect.right,
          scrollWidth: button.scrollWidth,
          clientWidth: button.clientWidth,
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      expect(bounds.left).toBeGreaterThanOrEqual(-1);
      expect(bounds.right).toBeLessThanOrEqual(bounds.viewport + 1);
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 1);
    }
  }
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en" },
    }),
  );
  await page.setViewportSize(VIEWPORTS[0]);
  await research.locator(".space-action-help-group > .primary-button").click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(15_000));
  const active = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(active.permanent.blackHole.researched).toBe(true);
  expect(active.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]?.elapsedMs).toBe(15_000);
  const charge = active.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]!;
  const upgradePrices = [
    ["power", active.permanent.blackHole.powerPrice],
    ["duration", active.permanent.blackHole.durationPrice],
    ["recharge", active.permanent.blackHole.rechargePrice],
  ] as const;

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
    const copy = blackHoleText(locale);
    const expectedStatus = `${copy.charging} · ${formatNumber(locale, (charge.durationMs - charge.elapsedMs) / 1000, 1, active.settings.notation)} s`;

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(pane.getByRole("heading", { name: copy.title, exact: true })).toBeVisible();
      await expect(pane.locator(".black-hole-summary")).toHaveText(copy.researched);
      await expect(pane.locator(".black-hole-stats")).toContainText(copy.status);
      await expect(pane.locator(".black-hole-stats dd").last()).toHaveText(expectedStatus);
      await expect(
        pane.getByRole("progressbar", { name: copy.charging, exact: true }),
      ).toBeVisible();
      for (const [upgradeId, price] of upgradePrices) {
        const upgradeIndex = ["power", "duration", "recharge"].indexOf(upgradeId);
        const upgradeButton = pane
          .locator(".black-hole-upgrade")
          .nth(upgradeIndex)
          .getByRole("button");
        await expect(upgradeButton).toBeVisible();
        await expect(upgradeButton).toContainText(
          `${formatNumber(locale, price, 0, active.settings.notation)} ${copy.researchPoints}`,
        );
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
          pane: read(document.querySelector<HTMLElement>(".black-hole-pane")!),
          stats: read(document.querySelector<HTMLElement>(".black-hole-stats")!),
          upgrades: read(document.querySelector<HTMLElement>(".black-hole-upgrades")!),
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      for (const [label, box] of Object.entries({
        pane: bounds.pane,
        stats: bounds.stats,
        upgrades: bounds.upgrades,
      })) {
        expect(box.left, `${locale}/${viewport.width}px ${label} left`).toBeGreaterThanOrEqual(-1);
        expect(box.right, `${locale}/${viewport.width}px ${label} right`).toBeLessThanOrEqual(
          bounds.viewport + 1,
        );
        expect(
          box.scrollWidth,
          `${locale}/${viewport.width}px ${label} overflow`,
        ).toBeLessThanOrEqual(box.clientWidth + 1);
      }
      if (locale === "fr" && viewport.width === 320) {
        const name = "p54-e57-black-hole-fr-320.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
    }
  }
});
