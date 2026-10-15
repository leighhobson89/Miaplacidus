import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { COSMIC_RIP_SECTOR_IDS, COSMIC_RIP_TECHNOLOGIES } from "../../../src/content/cosmicRip";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { cosmicRipStabilityProgress } from "../../../src/engine/cosmicRip";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

async function dismissRandomEventResultIfPresent(page: Page, timeout = 250): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  await dialog.waitFor({ state: "visible", timeout }).catch(() => undefined);
  if (await dialog.isVisible()) {
    await dialog.getByRole("button").click();
    await expect(dialog).toBeHidden();
  }
}

async function clearQueuedNotifications(page: Page): Promise<void> {
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect(page.getByTestId("notification-stack")).toBeEmpty();
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: true },
    }),
  );
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled),
    )
    .toBe(true);
}

async function selectLocale(page: import("@playwright/test").Page, locale: LocaleId) {
  await page.evaluate((nextLocale) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: nextLocale },
    });
  }, locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("P-45 Cosmic Rip pages render localized visible copy in all six locales @p45-visible-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await dismissRandomEventResultIfPresent(page, 1_000);
  await page.locator("#tab-cosmic-rip").click();

  const pane = page.getByTestId("cosmic-rip-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const stability = cosmicRipStabilityProgress(state.permanent.cosmicRip);

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    const copy = cosmicRipText(locale);
    await expect(pane.locator(":scope > .panel-heading .eyebrow")).toHaveText(copy.status);
    await expect(pane.locator(":scope > .panel-heading .game-page-title")).toHaveText(copy.title);
    await expect(pane.locator(":scope > .cosmic-rip-introduction")).toHaveText(copy.introduction);

    const wallet = pane.locator(":scope > .cosmic-rip-wallet > span");
    await expect(wallet.nth(0)).toContainText(`${copy.gp}:`);
    await expect(wallet.nth(1)).toContainText(`${copy.telemetry}:`);
    await expect(wallet.nth(2)).toContainText(`${copy.rate}:`);
    const situationTab = page.locator("#tab-cosmic-rip-situation");
    await expect(situationTab).toContainText(copy.situationTitle);
    await dismissRandomEventResultIfPresent(page);
    await situationTab.click();
    const situation = page.locator("#panel-cosmic-rip-situation");
    await expect(situation.locator("#cosmic-rip-situation-title")).toHaveText(copy.situationTitle);
    const foundSectorId = COSMIC_RIP_SECTOR_IDS[state.permanent.cosmicRip.ripLocationSectorIndex!]!;
    await expect(situation.getByTestId("cosmic-rip-status-row")).toHaveText(
      `${copy.statusRowLabel} ${copy.locatedInSector.replace("{sector}", foundSectorId)}`,
    );

    const scannerTab = page.locator("#tab-cosmic-rip-scanner-array");
    await expect(scannerTab).toContainText(copy.scannerArrayTitle);
    await dismissRandomEventResultIfPresent(page);
    await scannerTab.click();
    const scanner = page.locator("#panel-cosmic-rip-scanner-array");
    await expect(scanner.getByTestId("cosmic-rip-sectors-title")).toHaveCount(0);
    await expect(scanner.locator("#cosmic-rip-scan-title")).toHaveText(copy.scannerArrayTitle);
    await expect(scanner.locator(":scope > p").nth(0)).toHaveText(copy.scannerRestored);
    await expect(scanner.getByTestId("cosmic-rip-found-sector")).toBeVisible();
    await expect(scanner.getByTestId("cosmic-rip-found-sector").locator("small")).toHaveText(
      copy.sectorFound,
    );
    await expect(scanner.locator(".cosmic-rip-status")).toHaveText(copy.ripFound);

    await expect(pane.locator("#cosmic-rip-upgrades-title")).toHaveText(copy.upgrades);
    for (const upgradeName of Object.values(copy.upgradeNames)) {
      const upgrade = pane.locator(".cosmic-rip-upgrade").filter({ hasText: upgradeName });
      await expect(upgrade.locator("h4")).toContainText(upgradeName);
      await expect(upgrade.locator("p").first()).toContainText(copy.rate);
      const purchase = upgrade.getByRole("button", { name: copy.purchase, exact: true });
      await expect(purchase).toBeVisible();
      await expect(purchase).toHaveAccessibleName(/\S/);
    }

    const ripTab = page.locator("#tab-cosmic-rip-rip");
    await expect(ripTab).toContainText(copy.title);
    await dismissRandomEventResultIfPresent(page);
    await ripTab.click();
    const stabilityPanel = page.locator("#panel-cosmic-rip-rip .cosmic-rip-stability");
    await expect(stabilityPanel.locator(".space-mining-title-row > strong")).toHaveText(
      copy.stabilityLabel,
    );
    await expect(pane.getByTestId("cosmic-rip-stability-value")).toHaveText(
      copy.stabilityPercentage.replace(
        "{percentage}",
        formatNumber(locale, stability, 0, state.settings.notation),
      ),
    );
    await expect(stabilityPanel.getByRole("progressbar", { name: copy.stabilityLabel })).toHaveAttribute(
      "max",
      "100",
    );
    await expect(pane.locator("#cosmic-rip-tech-title")).toHaveText(copy.technologies);

    for (const technology of COSMIC_RIP_TECHNOLOGIES) {
      const card = pane.getByTestId(`cosmic-rip-technology-${technology.id}`);
      await expect(
        card.getByRole("heading", { name: copy.technologyNames[technology.id], exact: true }),
      ).toBeVisible();
      await expect(card.getByRole("button", { name: copy.research, exact: true })).toBeVisible();
    }

    const lockedTechnology = pane.getByTestId("cosmic-rip-technology-quantumContainmentField");
    const lockedReason = pane.locator("#cosmic-rip-technology-quantumContainmentField-reason");
    await expect(
      lockedTechnology.getByRole("button", { name: copy.research, exact: true }),
    ).toBeDisabled();
    await expect(lockedReason).toHaveText(
      `${copy.errors["cosmic-rip-tech-locked"]} ${copy.requires.replace(
        "{name}",
        copy.technologyNames.stabilizerArray,
      )}`,
    );
  }

  await selectLocale(page, "en");
  const firstTechnology = COSMIC_RIP_TECHNOLOGIES[0]!;
  const firstCard = pane.getByTestId(`cosmic-rip-technology-${firstTechnology.id}`);
  await firstCard.getByRole("button", { name: cosmicRipText("en").research, exact: true }).click();
  await page.evaluate(
    (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
    firstTechnology.durationMs,
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        window
          .miaplacidusTest!.getState()
          .permanent.cosmicRip.researchedTechnologyIds.includes("stabilizerArray"),
      ),
    )
    .toBe(true);
  await dismissRandomEventResultIfPresent(page, 1_000);

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(
      firstCard.getByText(
        cosmicRipText(locale).technologyStatusMessages[firstTechnology.id],
        { exact: true },
      ),
    ).toBeVisible();
  }
});

test("P-45 Cosmic Rip scan status and notices are localized in all six locales @p45-visible-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-objective-scan");
  await dismissRandomEventResultIfPresent(page, 1_000);
  await page.locator("#tab-cosmic-rip").click();
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-situation").click();
  await page.getByTestId("cosmic-rip-restore-scanner").click();
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  await clearQueuedNotifications(page);

  const scanner = page.locator("#panel-cosmic-rip-scanner-array");
  const situation = page.locator("#panel-cosmic-rip-situation");
  const targetSectorIndex = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.cosmicRip.ripLocationSectorIndex!,
  );
  const emptySectorIndexes = COSMIC_RIP_SECTOR_IDS.map((_, index) => index)
    .filter((index) => index !== targetSectorIndex)
    .slice(0, LOCALE_IDS.length);

  for (const [localeIndex, locale] of LOCALE_IDS.entries()) {
    const sectorIndex = emptySectorIndexes[localeIndex]!;
    await selectLocale(page, locale);
    const copy = cosmicRipText(locale);
    await expect(scanner.getByTestId("cosmic-rip-sectors-title")).toHaveText(copy.sectorsMapTitle);
    const sector = page.getByTestId(`cosmic-rip-sector-${sectorIndex}`);
    await sector.click();

    await expect(sector).toBeDisabled();
    await expect(sector).toHaveAttribute(
      "aria-label",
      `${COSMIC_RIP_SECTOR_IDS[sectorIndex]}, ${copy.sectorScanned}`,
    );
    await expect(sector.locator("small")).toHaveText(copy.sectorScanned);
    await expect(scanner.locator(".cosmic-rip-status")).toHaveText(copy.ripMissing);

    const noticeText = copy.sectorScanEmptyNotification.replace(
      "{sector}",
      COSMIC_RIP_SECTOR_IDS[sectorIndex]!,
    );
    await expect(
      page
        .locator('[data-testid="game-notification"][data-classification="cosmicRip"]')
        .filter({ hasText: noticeText }),
    ).toHaveText(noticeText);
    await clearQueuedNotifications(page);

    await dismissRandomEventResultIfPresent(page);
    await page.locator("#tab-cosmic-rip-situation").click();
    await expect(situation.getByTestId("cosmic-rip-status-row")).toHaveText(
      `${copy.statusRowLabel} ${copy.ripMissing}`,
    );
    await dismissRandomEventResultIfPresent(page);
    await page.locator("#tab-cosmic-rip-scanner-array").click();
  }
});

test("P-45 Cosmic Rip scanner restore disabled reason is localized in all six locales @p45-visible-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-restore-affordance");
  await dismissRandomEventResultIfPresent(page, 1_000);
  await page.locator("#tab-cosmic-rip").click();
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-situation").click();

  const restore = page.getByTestId("cosmic-rip-restore-scanner");
  const reason = page.locator("#cosmic-rip-restore-reason");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    const copy = cosmicRipText(locale);
    await expect(restore).toHaveText(
      `${copy.restoreScanner} · ${formatNumber(locale, 10)} ${copy.gpShort}`,
    );
    await expect(restore).toBeDisabled();
    await expect(restore).toHaveAttribute("aria-describedby", "cosmic-rip-restore-reason");
    await expect(reason).toHaveText(copy.errors["cosmic-rip-insufficient-gp"]);
  }
});

test("P-45 Cosmic Rip scan, upgrade, and research disabled reasons are localized in all six locales @p45-visible-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-action-affordances");
  await dismissRandomEventResultIfPresent(page, 1_000);
  await page.locator("#tab-cosmic-rip").click();

  const purchaseReason = page.locator("#cosmic-rip-upgrade-sensorBuoy-reason");
  const lockedTechnology = page.getByTestId("cosmic-rip-technology-quantumContainmentField");
  const researchReason = page.locator("#cosmic-rip-technology-quantumContainmentField-reason");

  await dismissRandomEventResultIfPresent(page);
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    const copy = cosmicRipText(locale);
    await page.locator("#tab-cosmic-rip-scanner-array").click();
    const sensorBuoy = page
      .locator(".cosmic-rip-upgrade")
      .filter({ hasText: copy.upgradeNames.sensorBuoy });
    const purchase = sensorBuoy.getByRole("button", { name: copy.purchase, exact: true });
    await expect(purchase).toHaveAccessibleName(/\S/);
    await expect(purchase).toBeDisabled();
    await expect(purchase).toHaveAttribute(
      "aria-describedby",
      "cosmic-rip-upgrade-sensorBuoy-reason",
    );
    await expect(purchaseReason).toHaveText(copy.errors["cosmic-rip-insufficient-cost"]);

    await page.locator("#tab-cosmic-rip-rip").click();
    const research = lockedTechnology.getByRole("button", {
      name: copy.research,
      exact: true,
    });
    await expect(research).toBeDisabled();
    await expect(research).toHaveAttribute(
      "aria-describedby",
      "cosmic-rip-technology-quantumContainmentField-reason",
    );
    await expect(researchReason).toHaveText(
      `${copy.errors["cosmic-rip-tech-locked"]} ${copy.requires.replace(
        "{name}",
        copy.technologyNames.stabilizerArray,
      )}`,
    );
  }
});

test("P-45 Cosmic Rip closure disabled reason is localized in all six locales @p45-visible-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-close-affordance");
  await dismissRandomEventResultIfPresent(page, 1_000);
  await page.locator("#tab-cosmic-rip").click();
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-rip").click();

  const close = page.locator(".cosmic-rip-close");
  const reason = page.locator("#cosmic-rip-close-reason");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    const copy = cosmicRipText(locale);
    await expect(close).toHaveText(`${copy.closeRip} · ${formatNumber(locale, 1)} ${copy.gpShort}`);
    await expect(close).toBeDisabled();
    await expect(close).toHaveAttribute("aria-describedby", "cosmic-rip-close-reason");
    await expect(reason).toHaveText(copy.errors["cosmic-rip-insufficient-gp"]);
  }
});
