import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
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

test("P-45 Black Hole fixed page copy renders across all locales and charge states @p45-black-hole-fixed-copy", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const pane = page.locator(".black-hole-pane");
  const researchButton = page.getByTestId("black-hole-research").getByRole("button");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const copy = blackHoleText(locale);
    await expect(pane.getByRole("heading", { name: copy.title, exact: true })).toBeVisible();
    await expect(pane.locator(".eyebrow")).toHaveText(copy.status);
    await expect(page.getByTestId("black-hole-research").locator("p")).toContainText(
      copy.researchPoints,
    );
    await expect(researchButton).toContainText(copy.researchAction);
  }

  await setLocale(page, "en");
  await researchButton.click();
  const charging = await page.evaluate(() => window.miaplacidusTest!.getState());
  const chargeTimer = charging.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]!;
  expect(chargeTimer.status).toBe("running");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const copy = blackHoleText(locale);
    await expect(pane.locator(".black-hole-summary")).toHaveText(copy.researched);
    await expect(pane.locator(".black-hole-stats dt")).toHaveText([
      copy.power,
      copy.duration,
      copy.recharge,
      copy.status,
    ]);
    await expect(pane.locator(".black-hole-stats dd").last()).toContainText(copy.charging);
    await expect(pane.getByRole("progressbar", { name: copy.charging, exact: true })).toBeVisible();
    for (const [index, upgradeId] of (["power", "duration", "recharge"] as const).entries()) {
      await expect(pane.locator(".black-hole-upgrade button").nth(index)).toContainText(
        copy.upgradeNames[upgradeId],
      );
    }
    await expect(pane.getByRole("button", { name: copy.charging, exact: true })).toBeDisabled();
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
    const copy = blackHoleText(locale);
    await expect(pane.locator(".black-hole-stats dd").last()).toHaveText(copy.ready);
    await expect(pane.getByRole("button", { name: copy.activate, exact: true })).toBeEnabled();
    await expect(pane.getByRole("progressbar", { name: copy.charging, exact: true })).toHaveCount(
      0,
    );
  }

  const french = blackHoleText("fr");
  await pane.getByRole("button", { name: french.activate, exact: true }).click();
  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const copy = blackHoleText(locale);
    await expect(pane.locator(".black-hole-stats dd").last()).toContainText(copy.warping);
    await expect(pane.getByRole("button", { name: copy.charging, exact: true })).toBeDisabled();
    await expect(pane.getByRole("progressbar", { name: copy.warping, exact: true })).toBeVisible();
  }
});
