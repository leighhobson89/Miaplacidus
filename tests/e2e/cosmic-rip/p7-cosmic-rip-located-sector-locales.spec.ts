import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { COSMIC_RIP_SECTOR_IDS } from "../../../src/content/cosmicRip";
import { LOCALE_IDS } from "../../../src/content/ids";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

async function dismissRandomEventResultIfPresent(page: Page): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  await dialog.waitFor({ state: "visible", timeout: 1_000 }).catch(() => undefined);
  if (await dialog.isVisible()) {
    await dialog.getByRole("button").click();
    await expect(dialog).toBeHidden();
  }
}

async function dismissRandomEventResult(page: Page): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button").click();
  await expect(dialog).toBeHidden();
}

test("P-7 located-sector status follows the selected locale after real scanning controls @p7-cosmic-rip-located-sector-locales @cosmic-rip @locale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-objective-scan");
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip").click();

  const restoreScanner = page.getByTestId("cosmic-rip-restore-scanner");
  await expect(restoreScanner).toBeEnabled();
  await restoreScanner.click();
  await dismissRandomEventResult(page);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.scannerRestored),
    )
    .toBe(true);

  const ripLocationSectorIndex = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.cosmicRip.ripLocationSectorIndex,
  );
  if (ripLocationSectorIndex === null) {
    throw new Error("The objective-scan fixture must have a deterministic Rip sector.");
  }
  expect(ripLocationSectorIndex).toBe(4);
  const foundSectorId = COSMIC_RIP_SECTOR_IDS[ripLocationSectorIndex]!;

  await page.locator("#tab-cosmic-rip-scanner-array").click();
  const scanner = page.locator("#panel-cosmic-rip-scanner-array");
  for (let sectorIndex = 0; sectorIndex <= ripLocationSectorIndex; sectorIndex += 1) {
    const sector = page.getByTestId(`cosmic-rip-sector-${sectorIndex}`);
    await expect(sector).toBeVisible();
    await sector.click();

    if (sectorIndex < ripLocationSectorIndex) {
      await expect(sector).toBeDisabled();
      await expect(scanner.getByTestId("cosmic-rip-found-sector")).toHaveCount(0);
    }
  }

  await dismissRandomEventResult(page);
  const foundSector = scanner.getByTestId("cosmic-rip-found-sector");
  await expect(foundSector).toBeVisible();
  await expect(foundSector.getByRole("button")).toBeDisabled();
  await expect(foundSector.locator("span")).toHaveText(foundSectorId);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.ripFound),
    )
    .toBe(true);

  await page.locator("#tab-cosmic-rip-situation").click();
  const statusRow = page.getByTestId("cosmic-rip-status-row");
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const copy = cosmicRipText(locale);
    expect(copy.locatedInSector.trim()).not.toBe("");
    await expect(statusRow).toHaveText(
      `${copy.statusRowLabel} ${copy.locatedInSector.replace("{sector}", foundSectorId)}`,
    );
  }
});
