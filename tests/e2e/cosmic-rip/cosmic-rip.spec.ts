import { type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import {
  COSMIC_RIP_SECTOR_IDS,
  COSMIC_RIP_TECHNOLOGIES,
  COSMIC_RIP_UPGRADES,
} from "../../../src/content/cosmicRip";
import { LOCALE_IDS, type EconomicGoodId } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { formatCountdown } from "../../../src/app/timeFormatting";
import { translate } from "../../../src/i18n/messages";
import {
  cosmicRipObjectiveText,
  cosmicRipText,
  type CosmicRipObjectiveId,
} from "../../../src/i18n/cosmicRipMessages";
import { ACHIEVEMENT_NOTIFICATION_COPY } from "../../../src/i18n/achievementNotificationCopy.generated";
import { setNumberNotation } from "../_harness/settings-controls";

async function dismissTutorialIfVisible(page: Page): Promise<void> {
  const dismissButton = page.getByRole("button", { name: "No thanks", exact: true });
  if (await dismissButton.isVisible()) await dismissButton.click();
}

async function dismissRandomEventResultIfPresent(page: Page, timeout = 1_000): Promise<void> {
  const dialog = page.getByTestId("random-event-result-dialog");
  await dialog.waitFor({ state: "visible", timeout }).catch(() => undefined);
  if (await dialog.isVisible()) await dialog.getByRole("button").click();
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

async function skipEndingCinematic(page: Page): Promise<void> {
  const ending = page.getByRole("dialog", { name: "MIAPLACIDUS ending" });
  await expect(ending).toBeVisible();
  await ending.getByRole("button", { name: /^(Skip ending|Continue)$/ }).click();
  await expect(ending).toHaveCount(0);
}

test("Cosmic Rip Situation, Scanner Array, and Rip have desktop and phone visual captures @p66-visual-review", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await dismissTutorialIfVisible(page);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.unlocked),
    )
    .toBe(true);
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect(page.locator('[data-testid="game-notification"]')).toHaveCount(0);

  const views = [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const;
  const pages = [
    {
      id: "situation",
      title: cosmicRipText("en").situationTitle,
      headingId: "cosmic-rip-situation-title",
    },
    {
      id: "scanner-array",
      title: cosmicRipText("en").scannerArrayTitle,
      headingId: "cosmic-rip-scan-title",
    },
    { id: "rip", title: cosmicRipText("en").title, headingId: null },
  ] as const;

  for (const view of views) {
    await page.setViewportSize({ width: view.width, height: view.height });
    await page.evaluate((themeId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: "en", themeId },
      });
    }, view.theme);
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", view.theme);
    await page.addStyleTag({
      content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
    });
    await page.locator("#tab-cosmic-rip").click();

    const pane = page.getByTestId("cosmic-rip-pane");
    await expect(pane.locator(":scope > .panel-heading .game-page-title")).toHaveText(
      cosmicRipText("en").title,
    );
    await expect(
      pane.locator(':scope > .page-artwork-row [data-celestial-illustration="cosmic-rip"]'),
    ).toBeVisible();

    for (const item of pages) {
      const tab = page.locator(`#tab-cosmic-rip-${item.id}`);
      await expect(tab).toBeVisible();
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      const childPage = pane.locator(`#panel-cosmic-rip-${item.id}`);
      await expect(childPage).toBeVisible();
      if (item.headingId) {
        await expect(childPage.locator(`#${item.headingId}`)).toHaveText(item.title);
      } else {
        await expect(childPage).toHaveAttribute("aria-labelledby", tab.id);
        await expect(pane.getByRole("heading", { name: item.title, exact: true })).toHaveCount(1);
      }
      await captureVisualCheckpoint(page, testInfo, `phase6-cosmic-rip-${item.id}-${view.suffix}`);
    }
  }
});

test("P-38 shows the source-gated next Cosmic Rip objective in six locales @p38-objectives", async ({
  freshGame,
}) => {
  test.setTimeout(180_000);
  const page = freshGame;

  await expect(page.locator("#tab-cosmic-rip")).toHaveCount(0);
  await expect(page.getByTestId("cosmic-rip-next-objective")).toHaveCount(0);

  await startMetaFixture(page, "meta-cosmic-rip-objective-scan");
  await dismissRandomEventResultIfPresent(page);
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  const objective = page.getByTestId("cosmic-rip-next-objective");
  const objectiveLabel = page.getByTestId("cosmic-rip-next-objective-label");
  const objectiveText = page.getByTestId("cosmic-rip-next-objective-text");
  const situation = page.locator("#panel-cosmic-rip-situation");

  await expect(objective).toHaveCount(0);
  await page.getByTestId("cosmic-rip-restore-scanner").click();
  await dismissRandomEventResultIfPresent(page);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.scannerRestored),
    )
    .toBe(true);
  await expect(objective).toBeVisible();
  const targetSectorIndex = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.cosmicRip.ripLocationSectorIndex!,
  );
  const emptySectorIndex = (targetSectorIndex + 1) % 9;

  const assertObjectiveForAllLocales = async (id: CosmicRipObjectiveId) => {
    for (const locale of LOCALE_IDS) {
      await page.evaluate((nextLocale) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        });
      }, locale);
      const copy = cosmicRipObjectiveText(locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(objectiveLabel).toHaveText(copy.label);
      await expect(objectiveText).toHaveText(copy.objectives[id]);
    }
    await page.evaluate(() => {
      window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: "en" } });
    });
  };

  await assertObjectiveForAllLocales("scan");
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  await page.getByTestId(`cosmic-rip-sector-${emptySectorIndex}`).click();
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-situation").click();
  await assertObjectiveForAllLocales("scan");
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  await page.getByTestId(`cosmic-rip-sector-${targetSectorIndex}`).click();
  await dismissRandomEventResultIfPresent(page);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.ripFound),
    )
    .toBe(true);
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-situation").click();

  for (const [index, technology] of COSMIC_RIP_TECHNOLOGIES.entries()) {
    await assertObjectiveForAllLocales(technology.id);
    await dismissRandomEventResultIfPresent(page);
    await page.locator("#tab-cosmic-rip-rip").click();
    const card = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
    await card.getByRole("button", { name: cosmicRipText("en").research }).click();
    await page.evaluate(
      (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
      technology.durationMs,
    );
    await dismissRandomEventResultIfPresent(page);
    await expect
      .poll(() =>
        page.evaluate(
          (id) =>
            window
              .miaplacidusTest!.getState()
              .permanent.cosmicRip.researchedTechnologyIds.includes(id),
          technology.id,
        ),
      )
      .toBe(true);
    await dismissRandomEventResultIfPresent(page);
    await page.locator("#tab-cosmic-rip-situation").click();
    await expect(objectiveText).toHaveText(
      cosmicRipObjectiveText("en").objectives[COSMIC_RIP_TECHNOLOGIES[index + 1]?.id ?? "close"],
    );
  }

  await assertObjectiveForAllLocales("close");
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-situation").click();
  await page.getByRole("button", { name: cosmicRipText("en").closeRip }).click();
  await expect(page.getByTestId("cosmic-rip-closed")).toBeVisible();
  await dismissRandomEventResultIfPresent(page);
  await skipEndingCinematic(page);
  await page.locator("#tab-cosmic-rip-situation").click();
  await expect(objective).toHaveCount(0);

  const bounds = await situation.evaluate((element) => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    rowRight: element.getBoundingClientRect().right,
  }));
  expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.rowRight).toBeLessThanOrEqual(bounds.viewportWidth);
});

test("empty Cosmic Rip sector scans show a localized Cosmic Rip notification", async ({ page }) => {
  await startMetaFixture(page, "meta-cosmic-rip-objective-scan");
  await dismissRandomEventResultIfPresent(page);
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.getByTestId("cosmic-rip-restore-scanner").click();
  await dismissRandomEventResultIfPresent(page);
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  await clearQueuedNotifications(page);

  const targetSectorIndex = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.cosmicRip.ripLocationSectorIndex!,
  );
  const emptySectorIndex = (targetSectorIndex + 1) % COSMIC_RIP_SECTOR_IDS.length;
  await page.getByTestId(`cosmic-rip-sector-${emptySectorIndex}`).click();
  await dismissRandomEventResultIfPresent(page);

  const notice = page.locator('[data-testid="game-notification"][data-classification="cosmicRip"]');
  await expect(notice).toHaveText(
    cosmicRipText("en").sectorScanEmptyNotification.replace(
      "{sector}",
      COSMIC_RIP_SECTOR_IDS[emptySectorIndex],
    ),
  );
});

test("announces Cosmic Rip research completion through the live status region across tabs @p20-announcements @cosmic-rip", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await dismissRandomEventResultIfPresent(page);
  await clearQueuedNotifications(page);
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const technology = COSMIC_RIP_TECHNOLOGIES[0];
  await page
    .getByTestId(`cosmic-rip-technology-${technology.id}`)
    .getByRole("button", { name: cosmicRipText("en").research })
    .click();
  await expect(
    page.getByTestId(`cosmic-rip-technology-${technology.id}`).getByRole("progressbar"),
  ).toBeVisible();

  await page.getByRole("tab", { name: /Resources/ }).click();
  await page.evaluate(
    (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
    technology.durationMs,
  );
  await dismissRandomEventResultIfPresent(page, 1_000);

  const notice = page.locator('[data-testid="game-notification"][data-classification="cosmicRip"]');
  await expect(notice).toHaveText(
    cosmicRipText("en").technologyResearchedNotification.replace(
      "{technology}",
      cosmicRipText("en").technologyNames[technology.id],
    ),
  );
  await expect(notice).toHaveRole("status");
  await expect(notice).toHaveAttribute("aria-atomic", "true");
  await expect(page.getByRole("tab", { name: /Resources/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("shows active research countdown while the Cosmic Rip page stays selected @cosmic-rip @timers", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const technology = COSMIC_RIP_TECHNOLOGIES[0];
  const card = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
  await card.getByRole("button", { name: cosmicRipText("en").research }).click();
  const researchProgress = card.getByRole("progressbar");
  await expect(researchProgress).toBeVisible();
  await expect(researchProgress).toHaveAttribute(
    "aria-label",
    `${cosmicRipText("en").researching}: ${cosmicRipText("en").technologyNames[technology.id]}`,
  );
  const stabilityProgress = page.getByTestId("cosmic-rip-stability-progress");
  const stabilityValue = page.getByTestId("cosmic-rip-stability-value");
  await expect(stabilityProgress).toBeVisible();
  await expect(stabilityProgress).toHaveAttribute("aria-label", cosmicRipText("en").stabilityLabel);
  await expect(stabilityValue).toContainText("%");
  const initialResearchProgress = await researchProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialResearchProgress.max).toBe(technology.durationMs);
  expect(initialResearchProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialResearchProgress.value).toBeLessThan(initialResearchProgress.max);
  await expect(stabilityProgress).toHaveAttribute("max", "100");
  expect(await stabilityProgress.getAttribute("aria-label")).not.toBe(
    await researchProgress.getAttribute("aria-label"),
  );
  const initialStabilityProgress = await stabilityProgress.evaluate(
    (progress) => (progress as HTMLProgressElement).value,
  );
  expect(initialStabilityProgress).toBeLessThan(100);
  const initialStabilityText = await stabilityValue.innerText();
  const remaining = page.getByTestId("cosmic-rip-research-remaining");
  await expect(remaining).toHaveText(
    cosmicRipText("en").remaining.replace("{time}", formatCountdown("en", technology.durationMs)),
  );
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-cosmic-rip").click();
    await page.locator("#tab-cosmic-rip-rip").click();
    const elapsedMs = await page.evaluate(
      () => window.miaplacidusTest!.getState().permanent.cosmicRip.researchElapsedMs,
    );
    await expect(remaining).toHaveText(
      cosmicRipText("en").remaining.replace(
        "{time}",
        formatCountdown("en", technology.durationMs - elapsedMs, notation),
      ),
    );
  }
  await setNumberNotation(page, "condensed");
  await page.locator("#tab-cosmic-rip").click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const elapsedBefore = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.cosmicRip.researchElapsedMs,
  );
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.researchElapsedMs),
    )
    .toBeGreaterThan(elapsedBefore);
  await expect
    .poll(() => researchProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialResearchProgress.value);
  await expect
    .poll(() => stabilityProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialStabilityProgress);
  await expect.poll(() => stabilityValue.innerText()).not.toBe(initialStabilityText);
  await expect(page.locator("#tab-cosmic-rip-rip")).toHaveAttribute("aria-selected", "true");

  const elapsed = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.cosmicRip.researchElapsedMs,
  );
  for (const locale of LOCALE_IDS) {
    const copy = cosmicRipText(locale);
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: nextLocale } });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(researchProgress).toHaveAttribute(
      "aria-label",
      `${copy.researching}: ${copy.technologyNames[technology.id]}`,
    );
    await expect(stabilityProgress).toHaveAttribute("aria-label", copy.stabilityLabel);
    await expect(remaining).toHaveText(
      copy.remaining.replace("{time}", formatCountdown(locale, technology.durationMs - elapsed)),
    );
  }
});

test("restores the scanner, researches all Cosmic Rip stages and closes the rip @cosmic-rip @p28-artwork-review", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await dismissTutorialIfVisible(page);
  await dismissRandomEventResultIfPresent(page);
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  const childTablist = page
    .getByRole("tabpanel", { name: "Cosmic Rip" })
    .getByRole("tablist", { name: "Pages in this section" });
  await expect(childTablist.getByRole("tab")).toHaveCount(3);
  const sourceDestinations = await childTablist
    .getByRole("tab")
    .evaluateAll((tabs) => tabs.map((tab) => [tab.id, tab.getAttribute("data-source-option-id")]));
  expect(sourceDestinations).toEqual([
    ["tab-cosmic-rip-situation", "option1"],
    ["tab-cosmic-rip-scanner-array", "option2"],
    ["tab-cosmic-rip-rip", "option3"],
  ]);
  const pane = page.getByTestId("cosmic-rip-pane");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText(
    cosmicRipText("en").locatedInSector.replace("{sector}", COSMIC_RIP_SECTOR_IDS[4]),
  );
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  const foundSector = page.getByTestId("cosmic-rip-found-sector").getByRole("button");
  await expect(foundSector).toBeDisabled();
  await expect(foundSector).toContainText(COSMIC_RIP_SECTOR_IDS[4]);

  // Upgrades belong to the Scanner Array source page, alongside sector scanning.
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  const copy = cosmicRipText("en");
  const buoy = pane
    .locator(".cosmic-rip-upgrade")
    .filter({ hasText: copy.upgradeNames.sensorBuoy });
  await buoy.getByRole("button", { name: copy.purchase, exact: true }).click();
  const orbiter = pane
    .locator(".cosmic-rip-upgrade")
    .filter({ hasText: copy.upgradeNames.ripResearchOrbiter });
  await orbiter.getByRole("button", { name: copy.purchase, exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.sensorBuoyCount),
    )
    .toBe(1);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().permanent.cosmicRip.ripResearchOrbiterCount,
      ),
    )
    .toBe(1);
  await page.locator("#tab-cosmic-rip-rip").click();

  for (const technology of COSMIC_RIP_TECHNOLOGIES) {
    const researchCard = page.getByTestId(`cosmic-rip-technology-${technology.id}`);
    await dismissRandomEventResultIfPresent(page);
    await researchCard.getByRole("button", { name: copy.research, exact: true }).click();
    const progress = researchCard.getByRole("progressbar");
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute(
      "aria-label",
      `${cosmicRipText("en").researching}: ${cosmicRipText("en").technologyNames[technology.id]}`,
    );
    const progressRange = await progress.evaluate((element) => {
      const bar = element as HTMLProgressElement;
      return { value: bar.value, max: bar.max };
    });
    expect(progressRange.max).toBe(technology.durationMs);
    expect(progressRange.value).toBeGreaterThanOrEqual(0);
    expect(progressRange.value).toBeLessThan(progressRange.max);

    for (const locale of LOCALE_IDS) {
      await page.evaluate((nextLocale) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        });
      }, locale);
      const copy = cosmicRipText(locale);
      const progressName = `${copy.researching}: ${copy.technologyNames[technology.id]}`;
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(
        researchCard.getByRole("progressbar", { name: progressName, exact: true }),
      ).toBeVisible();
      await expect(progress).toHaveAttribute("aria-label", progressName);
    }

    await page.evaluate(() => {
      window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: "en" } });
    });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(progress).toHaveAttribute(
      "aria-label",
      `${cosmicRipText("en").researching}: ${cosmicRipText("en").technologyNames[technology.id]}`,
    );

    await page.evaluate(
      (durationMs) => window.miaplacidusTest!.advanceBy(durationMs + 1),
      technology.durationMs,
    );
    await expect
      .poll(() =>
        page.evaluate(
          (id) =>
            window
              .miaplacidusTest!.getState()
              .permanent.cosmicRip.researchedTechnologyIds.includes(id),
          technology.id,
        ),
      )
      .toBe(true);
    await dismissRandomEventResultIfPresent(page);
    await expect(researchCard.getByRole("progressbar")).toHaveCount(0);
    await expect(
      researchCard.getByText(copy.technologyStatusMessages[technology.id], { exact: true }),
    ).toBeVisible();
  }

  await page.locator("#tab-cosmic-rip-situation").click();
  await pane.locator(".cosmic-rip-close").click();
  await expect(page.getByTestId("cosmic-rip-closed")).toBeVisible();
  await dismissRandomEventResultIfPresent(page);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.closed))
    .toBe(true);
  await skipEndingCinematic(page);
  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-situation").click();
  await expect(page.getByTestId("cosmic-rip-closed")).toBeVisible();
  await page.locator("#tab-cosmic-rip-rip").click();
  await expect(page.getByTestId("cosmic-rip-stability")).toBeVisible();
  await expect(page.getByTestId("cosmic-rip-stability-value")).toHaveText("100% Stabilised");
  await expect(page.getByTestId("cosmic-rip-stability-progress")).toHaveAttribute("value", "100");
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("#tab-cosmic-rip")).toContainText(translate(locale, "tab.cosmicRip"));
    const ripPage = page.locator("#panel-cosmic-rip-rip");
    await expect(ripPage).toHaveAttribute("aria-labelledby", "tab-cosmic-rip-rip");
    await expect(
      page
        .getByTestId("cosmic-rip-pane")
        .getByRole("tabpanel", { name: cosmicRipText(locale).title, exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("cosmic-rip-pane")
        .getByRole("heading", { name: cosmicRipText(locale).title, exact: true }),
    ).toHaveCount(1);
    await expect(page.getByTestId("cosmic-rip-closed")).toHaveText(cosmicRipText(locale).closed);
  }
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: "en" } });
  });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByTestId("cosmic-rip-stability")).toBeVisible();
  await expect(page.getByTestId("cosmic-rip-stability-value")).toHaveText("100% Stabilised");
  await page.locator("#tab-cosmic-rip-situation").click();
  const endingArt = page.getByTestId("cosmic-rip-ending-art");
  const endingState = page.locator(".cosmic-rip-closed-state");
  await expect(endingArt).toBeVisible();
  await expect(endingArt).toHaveAttribute("aria-hidden", "true");
  await expect(endingArt).toHaveAttribute("focusable", "false");
  await expect(endingArt.locator("animate, animateTransform, animateMotion")).toHaveCount(0);
  await expect(endingArt).toHaveJSProperty("tagName", "svg");
  expect(await endingArt.evaluate((element) => getComputedStyle(element).animationName)).toBe(
    "none",
  );
  await captureVisualCheckpoint(page, testInfo, "cosmic-rip-closed");

  for (const themeId of THEME_IDS) {
    for (const view of [
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
    ] as const) {
      await page.setViewportSize({ width: view.width, height: view.height });
      await page.evaluate((nextTheme) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { themeId: nextTheme },
        });
      }, themeId);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
      const bounds = await page.evaluate(() => {
        const art = document.querySelector<SVGElement>('[data-testid="cosmic-rip-ending-art"]')!;
        const state = art.closest<HTMLElement>(".cosmic-rip-closed-state")!;
        const artRect = art.getBoundingClientRect();
        const stateRect = state.getBoundingClientRect();
        const frame = document.querySelector<HTMLElement>(".game-frame:not(.notification-portal)")!;
        const path = art.querySelector("path")!;
        const tokens = ["--panel-raised", "--star-color-settled", "--accent-bright"].map((name) =>
          getComputedStyle(frame).getPropertyValue(name).trim(),
        );
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          insideState:
            artRect.left >= stateRect.left &&
            artRect.right <= stateRect.right &&
            artRect.top >= stateRect.top &&
            artRect.bottom <= stateRect.bottom,
          tokens,
          artFill: getComputedStyle(path).fill,
          artStroke: getComputedStyle(path).stroke,
          stateBackground: getComputedStyle(state).backgroundImage,
        };
      });
      expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);
      expect(bounds.insideState).toBe(true);
      expect(bounds.tokens.every((token) => token !== "")).toBe(true);
      expect(bounds.artFill).not.toBe("none");
      expect(bounds.artStroke).not.toBe("none");
      expect(bounds.stateBackground).not.toBe("none");
      if (
        (themeId === "terminal" && view.width === 1280) ||
        (themeId === "light" && view.width === 390) ||
        (themeId === "supernova" && view.width === 390)
      ) {
        const name = `p28-cosmic-rip-closed-${themeId}-${view.width}.png`;
        const image = await page.screenshot({
          path: testInfo.outputPath(name),
          fullPage: true,
          animations: "disabled",
        });
        await testInfo.attach(name, {
          body: image,
          contentType: "image/png",
        });
      }
    }
  }

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const [artBounds, stateBounds] = await Promise.all([
      endingArt.boundingBox(),
      endingState.boundingBox(),
    ]);
    expect(artBounds).not.toBeNull();
    expect(stateBounds).not.toBeNull();
    expect(stateBounds!.x).toBeGreaterThanOrEqual(0);
    expect(stateBounds!.x + stateBounds!.width).toBeLessThanOrEqual(width);
    expect(artBounds!.x).toBeGreaterThanOrEqual(stateBounds!.x);
    expect(artBounds!.x + artBounds!.width).toBeLessThanOrEqual(
      stateBounds!.x + stateBounds!.width,
    );
    await expect(page.getByTestId("cosmic-rip-closed")).toHaveText(cosmicRipText("en").closed);
  }
});

test("shows the scanner restore cost and localized disabled reason @cosmic-rip", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-restore-affordance");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();

  const childTablist = page
    .getByRole("tabpanel", { name: "Cosmic Rip" })
    .getByRole("tablist", { name: "Pages in this section" });
  await expect(childTablist.getByRole("tab")).toHaveCount(1);
  await expect(page.locator("#tab-cosmic-rip-scanner-array")).toHaveCount(0);
  const situation = page.locator("#panel-cosmic-rip-situation");
  await expect(situation).toBeVisible();

  const copy = cosmicRipText("en");
  const restore = situation.getByTestId("cosmic-rip-restore-scanner");
  await expect(restore).toHaveText(`${copy.restoreScanner} · 10 ${copy.gpShort}`);
  await expect(restore).toBeDisabled();
  await expect(restore).toHaveAttribute("aria-describedby", "cosmic-rip-restore-reason");
  await expect(page.locator("#cosmic-rip-restore-reason")).toHaveText(
    copy.errors["cosmic-rip-insufficient-gp"],
  );
});

test("shows the localized sector scan precondition before locating the Rip @cosmic-rip", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-sector-action-affordances");
  await dismissRandomEventResultIfPresent(page);
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await expect(page.locator("#tab-cosmic-rip-scanner-array")).toBeVisible();
  await expect(page.locator("#tab-cosmic-rip-rip")).toHaveCount(0);
  await page.locator("#tab-cosmic-rip-scanner-array").click();

  const sector = page.getByTestId("cosmic-rip-sector-0");
  await expect(sector).toBeDisabled();
  await expect(sector).toHaveAttribute("aria-describedby", "cosmic-rip-sector-0-reason");
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    const localizedCopy = cosmicRipText(locale);
    await expect(sector).toHaveAttribute(
      "aria-label",
      `${COSMIC_RIP_SECTOR_IDS[0]}, ${localizedCopy.sectorScanCost.replace("{cost}", "1")}`,
    );
    await expect(page.locator("#cosmic-rip-sector-0-reason")).toHaveText(
      localizedCopy.errors["cosmic-rip-insufficient-gp"],
    );
  }
});

test("shows upgrade and technology precondition reasons @cosmic-rip", async ({ page }) => {
  await startMetaFixture(page, "meta-cosmic-rip-action-affordances");
  await dismissRandomEventResultIfPresent(page);
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.scannerRestored),
    )
    .toBe(true);
  await expect(page.locator("#tab-cosmic-rip-scanner-array")).toBeVisible();
  await expect(page.getByTestId("cosmic-rip-restore-scanner")).toHaveCount(0);

  const copy = cosmicRipText("fr");
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: "fr" } });
  });
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  const sensorBuoy = page.locator(".cosmic-rip-upgrade").filter({
    has: page.locator("#cosmic-rip-upgrade-sensorBuoy-reason"),
  });
  const purchase = sensorBuoy.getByRole("button", { name: copy.purchase, exact: true });
  await expect(purchase).toHaveAccessibleName(/\S/);
  await expect(purchase).toBeDisabled();
  await expect(purchase).toHaveAttribute(
    "aria-describedby",
    "cosmic-rip-upgrade-sensorBuoy-reason",
  );
  await expect(page.locator("#cosmic-rip-upgrade-sensorBuoy-reason")).toHaveText(
    copy.errors["cosmic-rip-insufficient-cost"],
  );

  await page.locator("#tab-cosmic-rip-rip").click();
  const lockedTechnology = page.getByTestId("cosmic-rip-technology-quantumContainmentField");
  const research = lockedTechnology.getByRole("button", { name: copy.research });
  await expect(research).toBeDisabled();
  await expect(research).toHaveAttribute(
    "aria-describedby",
    "cosmic-rip-technology-quantumContainmentField-reason",
  );
  await expect(page.locator("#cosmic-rip-technology-quantumContainmentField-reason")).toContainText(
    copy.errors["cosmic-rip-tech-locked"],
  );
  await expect(page.locator("#cosmic-rip-technology-quantumContainmentField-reason")).toContainText(
    copy.technologyNames.stabilizerArray,
  );
});

test("localizes Cosmic Rip costs and keeps the live wallet quiet @cosmic-rip", async ({ page }) => {
  await startMetaFixture(page, "meta-cosmic-rip-action-affordances");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-rip").click();

  const wallet = page.locator(".cosmic-rip-wallet");
  expect(await wallet.getAttribute("aria-live")).toBeNull();

  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, currencyId: "eur" },
      });
    }, locale);
    const copy = cosmicRipText(locale);
    const sensorBuoy = page
      .locator(".cosmic-rip-upgrade")
      .filter({ hasText: copy.upgradeNames.sensorBuoy });
    await expect(sensorBuoy).toContainText(
      formatCurrency(locale, COSMIC_RIP_UPGRADES.sensorBuoy.cash, "eur"),
    );
    for (const [goodId, amount] of Object.entries(COSMIC_RIP_UPGRADES.sensorBuoy.goods)) {
      await expect(sensorBuoy).toContainText(
        `${formatNumber(locale, amount)} ${economyGoodName(locale, goodId as EconomicGoodId)}`,
      );
    }
    await expect(page.getByTestId("cosmic-rip-technology-stabilizerArray")).toContainText(
      `1 ${copy.gpShort}`,
    );
  }
});

test("shows the Cosmic Rip closure GP cost and disabled reason @cosmic-rip", async ({ page }) => {
  await startMetaFixture(page, "meta-cosmic-rip-close-affordance");
  await page.getByRole("tab", { name: "Cosmic Rip" }).click();
  await page.locator("#tab-cosmic-rip-situation").click();

  const copy = cosmicRipText("en");
  const close = page.getByRole("button", { name: `${copy.closeRip} · 1 ${copy.gpShort}` });
  await expect(close).toBeDisabled();
  await expect(close).toHaveAttribute("aria-describedby", "cosmic-rip-close-reason");
  await expect(page.locator("#cosmic-rip-close-reason")).toHaveText(
    copy.errors["cosmic-rip-insufficient-gp"],
  );
});

for (const locale of LOCALE_IDS) {
  test(`P-45 renders Cosmic Rip ending copy and achievement notice in ${locale} @p45-ending-localization`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-cosmic-rip-ending-ready");
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, notificationsEnabled: true },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await page.locator("#tab-cosmic-rip").click();
    await page.locator("#tab-cosmic-rip-situation").click();
    const pane = page.getByTestId("cosmic-rip-pane");
    const closeButton = pane.locator(".cosmic-rip-close");
    await expect(closeButton).toBeEnabled();
    await closeButton.click();

    await expect(page.getByTestId("cosmic-rip-closed")).toHaveText(cosmicRipText(locale).closed);
    await expect(
      page
        .locator('[data-testid="game-notification"][data-classification="achievement"]')
        .filter({ hasText: ACHIEVEMENT_NOTIFICATION_COPY[locale].closeCosmicRip }),
    ).toHaveText(ACHIEVEMENT_NOTIFICATION_COPY[locale].closeCosmicRip);
  });
}
