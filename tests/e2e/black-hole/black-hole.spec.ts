import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";
import { setNumberNotation } from "../_harness/settings-controls";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function selectBlackHoleLocale(page: Page, locale: LocaleId): Promise<void> {
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-game-options").click();
  await page.locator("#settings-language").selectOption(locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-black-hole").click();
}

async function expectLocalizedTimerProgress(
  page: Page,
  timer: "charging" | "warping",
): Promise<void> {
  for (const locale of LOCALE_IDS) {
    await selectBlackHoleLocale(page, locale);
    const label = blackHoleText(locale)[timer];
    const progress = page.getByRole("progressbar", { name: label, exact: true });
    await expect(progress, `${locale} ${timer} accessible progress name`).toBeVisible();
    await expect(progress).toHaveAttribute("aria-label", label);
    const nativeProgress = await progress.evaluate((element) => {
      const value = element as HTMLProgressElement;
      return { value: value.value, max: value.max };
    });
    expect(nativeProgress, `${locale} ${timer} native progress values`).toEqual({
      value: expect.any(Number),
      max: 100,
    });
    expect(nativeProgress.value, `${locale} ${timer} current value`).toBeGreaterThanOrEqual(0);
    expect(nativeProgress.value, `${locale} ${timer} current value`).toBeLessThan(
      nativeProgress.max,
    );
  }
  await selectBlackHoleLocale(page, "en");
}

async function setBlackHolePresentation(
  page: Page,
  locale: LocaleId,
  theme: ThemeId,
): Promise<void> {
  await page.evaluate(
    ({ nextLocale, nextTheme }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      }),
    { nextLocale: locale, nextTheme: theme },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);
}

test("shows the Black Hole power upgrade cost and applies its effect @p06-affordances", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const copy = blackHoleText("en");
  await page
    .getByTestId("black-hole-research")
    .getByRole("button", {
      name: new RegExp(copy.researchAction),
    })
    .click();

  const powerUpgrade = page.getByRole("button", { name: new RegExp(copy.upgradeNames.power) });
  await expect(powerUpgrade).toContainText(`${formatNumber("en", 850_000)} RP`);
  await expect(powerUpgrade).toBeEnabled();
  await powerUpgrade.click();

  const powerStat = page
    .locator(".black-hole-stats > div")
    .filter({ has: page.getByText(copy.power, { exact: true }) })
    .locator("dd");
  await expect(powerStat).toHaveText("7×");
  await expect(powerUpgrade).toContainText(`${formatNumber("en", 960_500)} RP`);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        return {
          researchPoints: state.run.researchPoints,
          power: state.permanent.blackHole.power,
          nextPowerPrice: state.permanent.blackHole.powerPrice,
        };
      }),
    )
    .toEqual({ researchPoints: 1_150_000, power: 7, nextPowerPrice: 960_500 });
});

test("shows an announced reason when Black Hole research is underfunded @black-hole @p20-announcements", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-underfunded");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const copy = blackHoleText("en");
  const pane = page.getByTestId("black-hole-research");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText(`${formatNumber("en", 999_999)} research points`);

  const research = pane.getByRole("button", { name: new RegExp(copy.researchAction) });
  await expect(research).toContainText(`${formatNumber("en", 1_000_000)} RP`);
  await expect(research).toBeDisabled();
  await expect(research).toHaveAttribute("aria-describedby", "black-hole-research-reason");
  const researchReason = page.locator("#black-hole-research-reason");
  await expect(researchReason).toBeVisible();
  await expect(researchReason).toHaveRole("status");
  await expect(researchReason).toHaveAttribute("aria-live", "polite");
  await expect(researchReason).toHaveAttribute("aria-atomic", "true");
  await expect(researchReason).toHaveText(copy.errors["black-hole-insufficient-research"]);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.blackHole.discovered),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.blackHole.researched),
    )
    .toBe(false);
});

test("researches, charges, saves and activates the Black Hole through the player pane @black-hole @p20-announcements", async ({
  page,
}, testInfo) => {
  const copy = blackHoleText("en");
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  const blackHoleTab = page.getByRole("tab", { name: "Black Hole" });
  await blackHoleTab.click();
  const blackHolePage = page.locator(".black-hole-pane");
  const pageHeading = blackHolePage.locator("#black-hole-title");
  await expect(pageHeading).toHaveCount(1);
  await expect(pageHeading).toHaveText("Black Hole");
  await expect(pageHeading).toBeVisible();
  const artworkRow = blackHolePage.locator(".page-artwork-row");
  await expect(artworkRow).toHaveCount(1);
  await expect(artworkRow).toBeVisible();
  await expect(artworkRow.locator('[data-celestial-illustration="black-hole"]')).toBeVisible();

  const pane = page.getByTestId("black-hole-research");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText(`${formatNumber("en", 3_000_000)} research points`);
  const warpAnnouncement = page.getByTestId("black-hole-warp-announcement");
  await expect(warpAnnouncement).toBeEmpty();
  await expect(warpAnnouncement).toHaveAttribute("aria-live", "polite");
  await expect(warpAnnouncement).toHaveAttribute("aria-atomic", "true");
  await pane.getByRole("button", { name: /Research Black Hole/ }).click();

  const readProgress = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      const timer = state.run.timers["black-hole:charge"];
      return {
        researched: state.permanent.blackHole.researched,
        researchPoints: state.run.researchPoints,
        chargeDurationMs: timer?.durationMs,
        chargeElapsedMs: timer?.elapsedMs,
        chargeStatus: timer?.status,
      };
    });
  await expect.poll(readProgress).toEqual({
    researched: true,
    researchPoints: 2_000_000,
    chargeDurationMs: 300_000,
    chargeElapsedMs: 0,
    chargeStatus: "running",
  });

  const chargeProgress = page.getByRole("progressbar", { name: copy.charging, exact: true });
  const statusRow = page
    .locator(".black-hole-stats > div")
    .filter({ has: page.getByText(blackHoleText("en").status, { exact: true }) });
  const chargeStatus = statusRow.locator("dd");
  await expect(chargeProgress).toBeVisible();
  await expect(chargeProgress).toHaveAttribute("aria-label", copy.charging);
  await expect(chargeProgress).toHaveAttribute("max", "100");
  await expect(blackHoleTab).toHaveAttribute("aria-selected", "true");
  const initialProgress = await chargeProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialProgress).toEqual({ value: expect.any(Number), max: 100 });
  expect(initialProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialProgress.value).toBeLessThan(initialProgress.max);
  const initialStatus = await chargeStatus.innerText();
  expect(initialStatus).toContain(copy.charging);
  expect(initialStatus).toContain("s");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!.elapsedMs,
      ),
    )
    .toBeGreaterThan(0);
  await expect(blackHoleTab).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => chargeStatus.innerText()).not.toBe(initialStatus);
  expect(
    await chargeProgress.evaluate((progress) => (progress as HTMLProgressElement).value),
  ).toBeGreaterThan(initialProgress.value);
  await expectLocalizedTimerProgress(page, "charging");
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-black-hole").click();
    const timer = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!,
    );
    const remainingSeconds = Math.max(0, timer.durationMs - timer.elapsedMs) / 1000;
    await expect(chargeStatus).toHaveText(
      `${copy.charging} · ${formatNumber("en", remainingSeconds, 1, notation)} s`,
    );
  }
  await setNumberNotation(page, "condensed");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-black-hole").click();

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Galactic" }).click();
  await blackHoleTab.click();
  await expect.poll(readProgress).toMatchObject({ researched: true, chargeStatus: "running" });

  const chargeAfterReload = await page.evaluate(() => {
    const timer = window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!;
    return { durationMs: timer.durationMs, elapsedMs: timer.elapsedMs };
  });
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    chargeAfterReload.durationMs - chargeAfterReload.elapsedMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleChargeReady))
    .toBe(true);
  await expect(chargeStatus).toHaveText(copy.ready);
  const chargeNotice = page
    .getByTestId("game-notification")
    .filter({ hasText: copy.chargedNotification });
  const notificationStack = page.getByTestId("notification-stack");
  await expect(notificationStack).toHaveAttribute("aria-live", "polite");
  await expect(chargeNotice).toHaveCount(1);
  await expect(chargeNotice).toHaveAttribute("aria-atomic", "true");
  await expect(chargeNotice).toHaveClass(/notification-info/);
  await expect(chargeNotice).toHaveAttribute("data-classification", "special");
  await expect(chargeProgress).toHaveCount(0);
  const galacticTab = page.locator("#tab-galaxy");
  const galacticAttention = galacticTab.locator(".attention-badge");
  const blackHoleAttention = blackHoleTab.locator(".attention-badge");
  const readyLabel = copy.ready;
  await expect(galacticAttention).toHaveText(readyLabel);
  await expect(blackHoleAttention).toHaveText(readyLabel);
  const activate = page.getByRole("button", { name: copy.activate });
  await expect(activate).toBeEnabled();
  await activate.click();
  await expect(warpAnnouncement).toHaveText(blackHoleText("en").warping);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        active: window.miaplacidusTest!.getState().run.blackHoleWarpActive,
        multiplier: window.miaplacidusTest!.getState().run.timeWarp.multiplier,
        remainingMs: window.miaplacidusTest!.getState().run.timeWarp.remainingMs,
      })),
    )
    .toEqual({ active: true, multiplier: 5, remainingMs: 3_000 });
  const warpProgress = page.getByRole("progressbar", { name: copy.warping, exact: true });
  await expect(warpProgress).toBeVisible();
  await expect(warpProgress).toHaveAttribute("aria-label", copy.warping);
  await expect(page.locator(".black-hole-stats > div")).toHaveCount(4);
  await expect(page.locator(".black-hole-upgrades")).toBeVisible();
  await expect(page.getByRole("button", { name: copy.charging })).toBeVisible();
  const initialWarpProgress = await warpProgress.evaluate((element) => {
    const progress = element as HTMLProgressElement;
    return { value: progress.value, max: progress.max };
  });
  expect(initialWarpProgress).toEqual({ value: expect.any(Number), max: 100 });
  expect(initialWarpProgress.value).toBeGreaterThanOrEqual(0);
  expect(initialWarpProgress.value).toBeLessThan(initialWarpProgress.max);
  const warpStatus = statusRow.locator("dd");
  await expect(warpStatus).toContainText(copy.warping);
  await expect(warpStatus).toContainText("s");
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-black-hole").click();
    const remainingMs = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.timeWarp.remainingMs,
    );
    await expect(warpStatus).toHaveText(
      `${copy.warping} · ${formatNumber("en", remainingMs / 1000, 1, notation)} s`,
    );
  }
  await setNumberNotation(page, "condensed");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-black-hole").click();
  await expect
    .poll(async () => ({
      galactic: (await galacticAttention.allTextContents()).some((label) => label === readyLabel),
      blackHole: (await blackHoleAttention.allTextContents()).some((label) => label === readyLabel),
    }))
    .toEqual({ galactic: false, blackHole: false });
  await expect(chargeNotice).toBeHidden();
  await captureVisualCheckpoint(page, testInfo, "black-hole-warp-active");
  await expectLocalizedTimerProgress(page, "warping");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => warpProgress.evaluate((progress) => (progress as HTMLProgressElement).value))
    .toBeGreaterThan(initialWarpProgress.value);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(2_001));
  await expect(warpAnnouncement).toBeEmpty();
  await expect(warpProgress).toHaveCount(0);
});

test("switching locale preserves Black Hole IDs, prices, save slot, and active charge @locale @p49", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.locator("#tab-galaxy").click();
  const blackHoleTab = page.locator("#tab-galactic-black-hole");
  await blackHoleTab.click();
  await page.getByRole("button", { name: /Research Black Hole/ }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  const readLocaleInvariant = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      const timer = state.run.timers["black-hole:charge"];
      if (!timer) throw new Error("Black Hole charge should remain active during locale changes");
      return {
        tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
          .map((tab) => tab.id)
          .sort(),
        blackHoleTabId: document.querySelector<HTMLElement>("#tab-galactic-black-hole")?.id,
        prices: {
          research: state.permanent.blackHole.researchPrice,
          power: state.permanent.blackHole.powerPrice,
          duration: state.permanent.blackHole.durationPrice,
          recharge: state.permanent.blackHole.rechargePrice,
        },
        notation: state.settings.notation,
        timer: {
          id: timer.id,
          status: timer.status,
          durationMs: timer.durationMs,
          elapsedMs: timer.elapsedMs,
        },
        saveHeads: Array.from({ length: localStorage.length }, (_, index) =>
          localStorage.key(index),
        )
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
      };
    });
  const baseline = await readLocaleInvariant();
  expect(baseline.blackHoleTabId).toBe("tab-galactic-black-hole");
  expect(baseline.timer).toMatchObject({ id: "black-hole:charge", status: "running" });
  expect(baseline.saveHeads).toHaveLength(1);

  for (const locale of LOCALE_IDS) {
    await selectBlackHoleLocale(page, locale);
    const current = await readLocaleInvariant();
    expect(current.tabIds, `${locale} stable tab IDs`).toEqual(baseline.tabIds);
    expect(current.blackHoleTabId, `${locale} Black Hole tab ID`).toBe(baseline.blackHoleTabId);
    expect(current.prices, `${locale} engine prices`).toEqual(baseline.prices);
    expect(current.timer, `${locale} active charge`).toMatchObject({
      id: baseline.timer.id,
      status: baseline.timer.status,
      durationMs: baseline.timer.durationMs,
    });
    expect(current.timer.elapsedMs, `${locale} charge must not reset`).toBeGreaterThanOrEqual(
      baseline.timer.elapsedMs,
    );
    expect(current.saveHeads, `${locale} saved slot identity`).toEqual(baseline.saveHeads);

    const copy = blackHoleText(locale);
    const upgradePrices = [
      ["power", baseline.prices.power],
      ["duration", baseline.prices.duration],
      ["recharge", baseline.prices.recharge],
    ] as const;
    for (const [upgradeId, price] of upgradePrices) {
      const button = page
        .locator(".black-hole-upgrade button")
        .filter({ hasText: copy.upgradeNames[upgradeId] });
      await expect(button).toContainText(formatNumber(locale, price, 0, current.notation));
    }
  }

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).not.toBeEmpty();
  expect(await readLocaleInvariant()).toMatchObject({ saveHeads: baseline.saveHeads });
});

test("P-65 Black Hole title and artwork fit all locales, themes, and widths @p65-identity", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await startMetaFixture(page, "meta-black-hole-discovered");

  for (const locale of LOCALE_IDS) {
    for (const theme of THEME_IDS) {
      await setBlackHolePresentation(page, locale, theme);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-galaxy").click();
        await page.locator("#tab-galactic-black-hole").click();

        const pane = page.locator(".black-hole-pane");
        const title = pane.locator("#black-hole-title");
        await expect(
          pane.locator("h2:visible"),
          `${locale}/${theme} visible heading count`,
        ).toHaveCount(1);
        const artwork = pane.locator(":scope > .page-artwork-row");
        await expect(title, `${locale}/${theme} Black Hole title`).toHaveText(
          blackHoleText(locale).title,
        );
        await expect(title, `${locale}/${theme} shared title class`).toHaveClass(/game-page-title/);
        await expect(artwork, `${locale}/${theme} artwork row`).toHaveCount(1);
        await expect(
          artwork.locator('[data-celestial-illustration="black-hole"]'),
          `${locale}/${theme} Black Hole artwork`,
        ).toBeVisible();
        await expect(artwork).toBeVisible();

        const bounds = await page.evaluate(() => {
          const titleElement = document.querySelector<HTMLElement>("#black-hole-title");
          const artworkElement = document.querySelector<HTMLElement>(
            ".black-hole-pane > .page-artwork-row",
          );
          if (!titleElement || !artworkElement) {
            throw new Error("Black Hole title or artwork row is missing.");
          }
          const box = (element: HTMLElement) => {
            const rect = element.getBoundingClientRect();
            return { left: rect.left, right: rect.right };
          };
          return {
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
            title: box(titleElement),
            artwork: box(artworkElement),
          };
        });
        const context = `${locale}/${theme} Black Hole at ${viewport.width}px`;
        expect(bounds.documentWidth, `${context} document width`).toBeLessThanOrEqual(
          bounds.viewportWidth,
        );
        for (const [name, box] of [
          ["title", bounds.title],
          ["artwork", bounds.artwork],
        ] as const) {
          expect(box.left, `${context} ${name} left edge`).toBeGreaterThanOrEqual(-1);
          expect(box.right, `${context} ${name} right edge`).toBeLessThanOrEqual(
            bounds.viewportWidth + 1,
          );
        }
      }
    }
  }
});
