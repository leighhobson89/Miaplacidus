import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { formatCountdown } from "../../../src/app/timeFormatting";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { economyGoodName } from "../../../src/app/economyDisplay";
import {
  COSMIC_RIP_CLOSURE_GP,
  COSMIC_RIP_SCANNER_REPAIR_GP,
  COSMIC_RIP_SCAN_GP,
  COSMIC_RIP_SECTOR_COUNT,
  COSMIC_RIP_TECHNOLOGIES,
  COSMIC_RIP_UPGRADES,
} from "../../../src/content/cosmicRip";
import { LOCALE_IDS, type EconomicGoodId } from "../../../src/content/ids";
import { displayCurrency } from "../../../src/engine/precision";
import { cosmicRipUpgradeCost } from "../../../src/engine/cosmicRip";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("P-54 E-57 Cosmic Rip costs and active research fit in all locales at phone widths @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.locator("#tab-cosmic-rip").click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const pane = page.getByTestId("cosmic-rip-pane");
  const technology = COSMIC_RIP_TECHNOLOGIES[0]!;
  const card = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
  const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
  const initialGp = initial.permanent.gloryPoints;
  const technologyCosts = COSMIC_RIP_TECHNOLOGIES.map((entry) => ({
    technology: entry,
    card: page.getByTestId(`cosmic-rip-technology-${entry.id}`),
  }));
  await card.getByRole("button", { name: cosmicRipText("en").research, exact: true }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(15_000));
  const active = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(active.permanent.cosmicRip.activeResearchTechnologyId).toBe(technology.id);
  expect(active.permanent.gloryPoints).toBe(initialGp - 1);
  expect(active.permanent.cosmicRip.researchElapsedMs).toBe(15_000);

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
    const copy = cosmicRipText(locale);
    const cost = `${formatNumber(locale, technology.telemetryCost, 0, active.settings.notation)} ${copy.telemetry} · ${formatNumber(locale, technology.durationMs / 1000, 0, active.settings.notation)} s · 1 ${copy.gpShort}`;
    const progressName = `${copy.researching}: ${copy.technologyNames[technology.id]}`;
    const remaining = copy.remaining.replace(
      "{time}",
      formatCountdown(
        locale,
        technology.durationMs - active.permanent.cosmicRip.researchElapsedMs,
        active.settings.notation,
      ),
    );
    const currency = (amount: number) =>
      formatCurrency(
        locale,
        Number(displayCurrency(amount)),
        active.settings.currencyId ?? "usd",
        2,
        active.settings.notation,
      );

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(pane.getByRole("heading", { name: copy.title, exact: true })).toBeVisible();
      await expect(
        card.getByRole("heading", { name: copy.technologyNames[technology.id], exact: true }),
      ).toBeVisible();
      await expect(card.locator("p").first()).toHaveText(cost);
      await expect(card).toContainText(copy.researching);
      const progress = card.getByRole("progressbar", { name: progressName, exact: true });
      await expect(progress).toBeVisible();
      await expect(progress).toHaveAttribute("max", String(technology.durationMs));
      await expect(card.getByTestId("cosmic-rip-research-remaining")).toHaveText(remaining);
      for (const { technology: row, card: technologyCard } of technologyCosts) {
        const expectedRowCost = `${formatNumber(locale, row.telemetryCost, 0, active.settings.notation)} ${copy.telemetry} · ${formatNumber(locale, row.durationMs / 1000, 0, active.settings.notation)} s · 1 ${copy.gpShort}`;
        await expect(technologyCard.locator("p").first()).toHaveText(expectedRowCost);
        await expect(
          technologyCard.getByRole("heading", {
            name: copy.technologyNames[row.id],
            exact: true,
          }),
        ).toBeVisible();
      }
      const upgradeIds = Object.keys(COSMIC_RIP_UPGRADES) as (keyof typeof COSMIC_RIP_UPGRADES)[];
      const upgradeCards = pane.locator(".cosmic-rip-upgrade");
      await expect(upgradeCards).toHaveCount(upgradeIds.length);
      for (const [index, upgradeId] of upgradeIds.entries()) {
        const upgrade = upgradeCards.nth(index);
        const cost = cosmicRipUpgradeCost(active, upgradeId);
        const materials = Object.entries(cost.goods)
          .map(
            ([goodId, amount]) =>
              `${formatNumber(locale, amount!, 0, active.settings.notation)} ${economyGoodName(locale, goodId as EconomicGoodId)}`,
          )
          .join(" + ");
        await expect(upgrade.getByRole("heading")).toContainText(copy.upgradeNames[upgradeId]);
        await expect(upgrade.locator("p").nth(1)).toHaveText(
          `${currency(cost.cash)} + ${materials}`,
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
          pane: read(document.querySelector<HTMLElement>("[data-testid='cosmic-rip-pane']")!),
          card: read(
            document.querySelector<HTMLElement>(
              "[data-testid='cosmic-rip-technology-stabilizerArray']",
            )!,
          ),
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      for (const [label, box] of Object.entries({ pane: bounds.pane, card: bounds.card })) {
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
        const name = "p54-e57-cosmic-rip-fr-320.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
    }
  }
});

test("P-54 E-57 Cosmic Rip sector scan prices fit in all locales at phone widths @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.locator("#tab-cosmic-rip").click();
  await page.locator("#tab-cosmic-rip-scanner-array").click();

  const pane = page.getByTestId("cosmic-rip-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.cosmicRip.scannedSectorIndexes).toEqual([4]);
  const sectorButtons = Array.from({ length: COSMIC_RIP_SECTOR_COUNT }, (_, index) =>
    page.getByTestId(`cosmic-rip-sector-${index}`),
  );

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
    const copy = cosmicRipText(locale);
    const scanCost = `${formatNumber(locale, COSMIC_RIP_SCAN_GP, 0, state.settings.notation)} ${copy.gpShort}`;

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(
        pane.getByRole("heading", { name: copy.scannerArrayTitle, exact: true }),
      ).toBeVisible();
      for (const [index, button] of sectorButtons.entries()) {
        const isFound = index === state.permanent.cosmicRip.ripLocationSectorIndex;
        const status = isFound ? copy.sectorFound : scanCost;
        await expect(button).toHaveAttribute(
          "aria-label",
          `${copy.sector} ${index + 1}, ${status}`,
        );
        await expect(button.locator("small")).toHaveText(status);
        if (isFound) await expect(button).toBeDisabled();
        else await expect(button).toBeEnabled();
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
          pane: read(document.querySelector<HTMLElement>("[data-testid='cosmic-rip-pane']")!),
          sectors: Array.from(
            document.querySelectorAll<HTMLElement>(".cosmic-rip-sector-control"),
          ).map(read),
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      for (const [index, box] of [bounds.pane, ...bounds.sectors].entries()) {
        expect(
          box.left,
          `${locale}/${viewport.width}px sector area ${index} left`,
        ).toBeGreaterThanOrEqual(-1);
        expect(
          box.right,
          `${locale}/${viewport.width}px sector area ${index} right`,
        ).toBeLessThanOrEqual(bounds.viewport + 1);
        expect(
          box.scrollWidth,
          `${locale}/${viewport.width}px sector area ${index} overflow`,
        ).toBeLessThanOrEqual(box.clientWidth + 1);
      }
      if (locale === "fr" && viewport.width === 320) {
        const name = "p54-e57-cosmic-rip-scanner-fr-320.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
    }
  }
});

test("P-54 E-57 Cosmic Rip scanner restore price fits in all locales at phone widths @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-cosmic-rip-restore-affordance");
  await page.locator("#tab-cosmic-rip").click();
  await page.locator("#tab-cosmic-rip-situation").click();

  const pane = page.getByTestId("cosmic-rip-pane");
  const restore = page.getByTestId("cosmic-rip-restore-scanner");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.cosmicRip.scannerRestored).toBe(false);

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
    const copy = cosmicRipText(locale);
    const expectedName = `${copy.restoreScanner} · ${formatNumber(locale, COSMIC_RIP_SCANNER_REPAIR_GP, 0, state.settings.notation)} ${copy.gpShort}`;
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(
        pane.getByRole("heading", { name: copy.situationTitle, exact: true }),
      ).toBeVisible();
      await expect(restore).toHaveText(expectedName);
      await expect(restore).toBeDisabled();
      await expect(restore).toHaveAttribute("aria-describedby", "cosmic-rip-restore-reason");
      const bounds = await page.evaluate(() => {
        const element = document.querySelector<HTMLElement>(
          "[data-testid='cosmic-rip-restore-scanner']",
        )!;
        const rect = element.getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          left: rect.left,
          right: rect.right,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      expect(bounds.left).toBeGreaterThanOrEqual(-1);
      expect(bounds.right).toBeLessThanOrEqual(bounds.viewport + 1);
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 1);
      if (locale === "fr" && viewport.width === 320) {
        const name = "p54-e57-cosmic-rip-restore-fr-320.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
    }
  }
});

test("P-54 E-57 Cosmic Rip closure price fits in all locales at phone widths @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-cosmic-rip-close-affordance");
  await page.locator("#tab-cosmic-rip").click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const pane = page.getByTestId("cosmic-rip-pane");
  const close = pane.locator(".cosmic-rip-close");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.cosmicRip.researchedTechnologyIds).toHaveLength(
    COSMIC_RIP_TECHNOLOGIES.length,
  );
  expect(state.permanent.gloryPoints).toBe(0);

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
    const copy = cosmicRipText(locale);
    const expectedName = `${copy.closeRip} · ${formatNumber(locale, COSMIC_RIP_CLOSURE_GP, 0, state.settings.notation)} ${copy.gpShort}`;
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(close).toHaveText(expectedName);
      await expect(close).toBeDisabled();
      await expect(close).toHaveAttribute("aria-describedby", "cosmic-rip-close-reason");
      const bounds = await page.evaluate(() => {
        const element = document.querySelector<HTMLElement>(".cosmic-rip-close")!;
        const rect = element.getBoundingClientRect();
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          left: rect.left,
          right: rect.right,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      expect(bounds.left).toBeGreaterThanOrEqual(-1);
      expect(bounds.right).toBeLessThanOrEqual(bounds.viewport + 1);
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 1);
      if (locale === "fr" && viewport.width === 320) {
        const name = "p54-e57-cosmic-rip-close-fr-320.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
    }
  }
});
