import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { BLACK_HOLE_CHARGE_TIMER_ID } from "../../../src/engine/blackHole";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId): Promise<void> {
  const accepted = await page.evaluate(
    (nextLocale) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      }),
    locale,
  );
  expect(accepted).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("Black Hole help and timed status copy follow the selected locale @phase8-p7-black-hole-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const pane = page.locator(".black-hole-pane");
  const headerTrigger = page.getByTestId("black-hole-header-help-trigger");
  const headerTooltip = page.getByTestId("black-hole-header-help");
  const trigger = page.getByTestId("black-hole-research-help-trigger");
  const tooltip = page.getByTestId("black-hole-research-help");
  const chargeProgress = pane.getByTestId("black-hole-charge-progress");
  const warpProgress = pane.getByTestId("black-hole-time-warp-progress");
  const research = page
    .getByTestId("black-hole-research")
    .locator(".space-action-help-group > .primary-button");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const copy = blackHoleText(locale);
    await expect(pane.locator(".black-hole-research > p")).toHaveText(
      `${formatNumber(locale, state.run.researchPoints, 0, state.settings.notation)} ${copy.researchPoints}`,
    );
    await expect(research).toHaveText(
      `${copy.researchAction} Â· ${formatNumber(locale, state.permanent.blackHole.researchPrice, 0, state.settings.notation)} RP`,
    );
    await expect(pane.getByText(copy.interactionHelp, { exact: true })).toBeVisible();
    await headerTrigger.focus();
    await expect(headerTooltip).toBeVisible();
    await expect(headerTooltip).toHaveText(copy.headerHelp);
    await trigger.focus();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(copy.researchHelp);
  }

  await setLocale(page, "en");
  await research.click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(15_000));
  const charging = await page.evaluate(() => window.miaplacidusTest!.getState());
  const chargeTimer = charging.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]!;
  expect(chargeTimer.status).toBe("running");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const copy = blackHoleText(locale);
    await expect(chargeProgress).toBeVisible();
    await expect(chargeProgress).toHaveAttribute("aria-label", copy.charging);
    await expect(pane.getByText(copy.interactionHelp, { exact: true })).toBeVisible();
    await expect(pane.getByText(copy.statsHelp, { exact: true })).toBeVisible();
    await expect(pane.locator(".black-hole-stats dt")).toHaveText([
      copy.power,
      copy.duration,
      copy.recharge,
      copy.status,
    ]);
    await expect(pane.locator(".black-hole-stats dd").first()).toContainText(
      formatNumber(locale, state.permanent.blackHole.power, 1, state.settings.notation),
    );
    const timer = state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]!;
    const expectedStatus = `${copy.charging} · ${formatNumber(
      locale,
      (timer.durationMs - timer.elapsedMs) / 1000,
      1,
      state.settings.notation,
    )} s`;
    await expect(pane.locator(".black-hole-stats dd").last()).toHaveText(expectedStatus);
  }

  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    chargeTimer.durationMs - chargeTimer.elapsedMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleChargeReady))
    .toBe(true);

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    await expect(
      pane.getByRole("button", { name: blackHoleText(locale).activate, exact: true }),
    ).toBeVisible();
  }

  await setLocale(page, "en");
  await pane.getByRole("button", { name: blackHoleText("en").activate, exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleWarpActive))
    .toBe(true);

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const copy = blackHoleText(locale);
    await expect(warpProgress).toBeVisible();
    await expect(warpProgress).toHaveAttribute("aria-label", copy.warping);
    await expect(pane.getByText(copy.statsHelp, { exact: true })).toBeVisible();
    await expect(pane.locator(".black-hole-stats dd").first()).toContainText(
      formatNumber(locale, state.permanent.blackHole.power, 1, state.settings.notation),
    );
    const expectedStatus = `${copy.warping} · ${formatNumber(
      locale,
      state.run.timeWarp.remainingMs / 1000,
      1,
      state.settings.notation,
    )} s`;
    await expect(pane.locator(".black-hole-stats dd").last()).toHaveText(expectedStatus);
  }
});
