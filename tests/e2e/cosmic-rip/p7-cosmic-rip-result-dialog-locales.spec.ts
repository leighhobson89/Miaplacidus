import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import {
  COSMIC_RIP_SECTOR_IDS,
  COSMIC_RIP_TECHNOLOGIES,
} from "../../../src/content/cosmicRip";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { cosmicRipMilestoneResultDialogCopy } from "../../../src/i18n/cosmicRipMilestoneResultDialogMessages";
import {
  cosmicRipText,
  cosmicRipStatusDescription,
  cosmicRipTechnologyDescription,
  cosmicRipUpgradeDescription,
} from "../../../src/i18n/cosmicRipMessages";
import { cosmicRipResearchResultDialog } from "../../../src/i18n/cosmicRipResearchResultDialogMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";

const COSMIC_RIP_UPGRADE_IDS = ["sensorBuoy", "ripResearchOrbiter"] as const;

async function selectLocale(page: import("@playwright/test").Page, locale: LocaleId) {
  const accepted = await page.evaluate(
    (nextLocale) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, reducedMotion: true, notificationsEnabled: true },
      }),
    locale,
  );
  expect(accepted).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

function renderedLineText(line: {
  readonly text: string;
  readonly parts?: readonly { readonly text: string }[];
}): string {
  return line.parts ? line.parts.map((part) => part.text).join("") : line.text;
}

async function dismissResultDialogIfVisible(page: import("@playwright/test").Page) {
  const dialog = page.getByTestId("random-event-result-dialog");
  await dialog.waitFor({ state: "visible", timeout: 1_000 }).catch(() => undefined);
  if (await dialog.isVisible()) await dialog.getByRole("button").click();
}

async function expectResultDialog(
  page: import("@playwright/test").Page,
  copy: ReturnType<typeof cosmicRipResearchResultDialog>,
) {
  const dialog = page.getByTestId("random-event-result-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toHaveText(copy.title);
  await expect(dialog.locator("#random-event-result-copy p")).toHaveText(
    copy.lines.map(renderedLineText).filter(Boolean),
  );
  await expect(dialog.getByRole("button")).toHaveText(copy.confirmLabel);
  await dialog.getByRole("button").click();
  await expect(dialog).toHaveCount(0);
}

async function expectHelpTooltip(
  page: import("@playwright/test").Page,
  locale: LocaleId,
  testId: string,
  label: string,
  content: string,
) {
  const trigger = page.getByTestId(`${testId}-trigger`);
  const tooltip = page.getByTestId(testId);
  await expect(trigger).toHaveAttribute(
    "aria-label",
    `${label} — ${starshipText(locale, "scanMoreInfoLabel")}`,
  );
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText(content);
}

for (const locale of LOCALE_IDS) {
  test(`Cosmic Rip page copy, help, and result dialogs use ${locale} @p7-cosmic-rip-result-dialog-locales`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-cosmic-rip-objective-scan");
    await dismissResultDialogIfVisible(page);
    await selectLocale(page, locale);
    await page.locator("#tab-cosmic-rip").click();
    await page.locator("#tab-cosmic-rip-situation").click();

    const pageCopy = cosmicRipText(locale);
    await expect(page.locator(".cosmic-rip-introduction")).toHaveText(pageCopy.introduction);
    await expect(page.getByTestId("cosmic-rip-situation-introduction")).toHaveText(
      pageCopy.situationIntroduction,
    );
    await expectHelpTooltip(
      page,
      locale,
      "cosmic-rip-header-help",
      pageCopy.title,
      pageCopy.headerHelp,
    );
    await expectHelpTooltip(
      page,
      locale,
      "cosmic-rip-situation-help",
      pageCopy.situationTitle,
      pageCopy.situationHelp,
    );
    await page.locator("#tab-cosmic-rip-scanner-array").click();
    await expect(page.getByTestId("cosmic-rip-scanner-array-introduction")).toHaveText(
      pageCopy.scannerArrayIntroduction,
    );
    await expectHelpTooltip(
      page,
      locale,
      "cosmic-rip-scanner-array-help",
      pageCopy.scannerArrayTitle,
      pageCopy.scannerArrayHelp,
    );
    await page.locator("#tab-cosmic-rip-situation").click();

    await page.getByTestId("cosmic-rip-restore-scanner").click();
    await expectResultDialog(page, cosmicRipMilestoneResultDialogCopy(locale, "scannerRestored"));

    const targetSectorIndex = await page.evaluate(
      () => window.miaplacidusTest!.getState().permanent.cosmicRip.ripLocationSectorIndex!,
    );
    expect(COSMIC_RIP_SECTOR_IDS[targetSectorIndex]).toBeTruthy();
    await page.locator("#tab-cosmic-rip-scanner-array").click();
    for (const upgradeId of COSMIC_RIP_UPGRADE_IDS) {
      const label = pageCopy.upgradeNames[upgradeId];
      await expectHelpTooltip(
        page,
        locale,
        `cosmic-rip-upgrade-${upgradeId}-help`,
        label,
        cosmicRipUpgradeDescription(locale, upgradeId),
      );
    }
    await page.getByTestId(`cosmic-rip-sector-${targetSectorIndex}`).click();
    await expectResultDialog(page, cosmicRipMilestoneResultDialogCopy(locale, "ripLocated"));

    await page.locator("#tab-cosmic-rip-rip").click();
    await expect(page.getByTestId("cosmic-rip-rip-introduction")).toHaveText(pageCopy.ripIntroduction);
    await expectHelpTooltip(
      page,
      locale,
      "cosmic-rip-stability-help",
      `${pageCopy.stabilityLabel} ${starshipText(locale, "scanMoreInfoLabel")}`,
      cosmicRipStatusDescription(locale),
    );
    for (const technology of COSMIC_RIP_TECHNOLOGIES) {
      const gameCopy = cosmicRipResearchResultDialog(locale, technology.id);
      const card = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
      await expectHelpTooltip(
        page,
        locale,
        `cosmic-rip-technology-${technology.id}-help`,
        `${pageCopy.technologyNames[technology.id]}: ${starshipText(locale, "scanMoreInfoLabel")}`,
        cosmicRipTechnologyDescription(locale, technology.id),
      );
      await card.getByRole("button", { name: cosmicRipText(locale).research, exact: true }).click();
      await page.evaluate(
        (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
        technology.durationMs,
      );
      await expectResultDialog(page, gameCopy);
      await expect
        .poll(() =>
          page.evaluate((id) =>
            window.miaplacidusTest!
              .getState()
              .permanent.cosmicRip.researchedTechnologyIds.includes(id),
          technology.id),
        )
        .toBe(true);
      await expect(
        card.getByText(pageCopy.technologyStatusMessages[technology.id], { exact: true }),
      ).toBeVisible();
    }

    await page.locator("#tab-cosmic-rip-situation").click();
    await expect(page.getByTestId("cosmic-rip-status-row")).toContainText(pageCopy.fullyStabilised);
  });
}
