import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { BLACK_HOLE_MINIMUM_CHARGE_MS } from "../../../src/content/blackHole";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
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

test("Black Hole final recharge upgrade follows the selected locale @phase8-p7-black-hole-controls", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-final-upgrade");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const pane = page.locator(".black-hole-pane");
  const rechargeButton = pane.locator(".black-hole-upgrade").nth(2).getByRole("button");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const copy = blackHoleText(locale);
    for (const [index, upgradeId] of (["power", "duration", "recharge"] as const).entries()) {
      await expect(pane.locator(".black-hole-upgrade button").nth(index)).toContainText(
        copy.upgradeNames[upgradeId],
      );
    }
    await expect(rechargeButton).toContainText(copy.rechargeFinalUpgrade);
    await expect(rechargeButton).toContainText(
      `${formatNumber(locale, state.permanent.blackHole.rechargePrice, 0, state.settings.notation)} ${copy.researchPoints}`,
    );
  }
});

test("Black Hole always-on and maxed upgrade copy follows the selected locale @phase8-p7-black-hole-controls", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-always-on");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const pane = page.locator(".black-hole-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const durationButton = pane.locator(".black-hole-upgrade").nth(1).getByRole("button");
  const rechargeButton = pane.locator(".black-hole-upgrade").nth(2).getByRole("button");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const copy = blackHoleText(locale);
    const minimumChargeSeconds = formatNumber(
      locale,
      BLACK_HOLE_MINIMUM_CHARGE_MS / 1000,
      0,
      state.settings.notation,
    );

    await expect(pane.locator(".black-hole-stats dt")).toHaveText([
      copy.power,
      copy.duration,
      copy.recharge,
      copy.status,
    ]);
    await expect(pane.locator(".black-hole-stats dd").first()).toContainText(
      formatNumber(locale, state.permanent.blackHole.power, 1, state.settings.notation),
    );
    await expect(pane.locator(".black-hole-stats dd").last()).toHaveText(copy.alwaysOn);
    await expect(durationButton).toContainText(
      `${copy.duration}: ${copy.upgradeMaxed.duration}`,
    );
    await expect(rechargeButton).toContainText(
      `${copy.recharge}: ${copy.upgradeMaxed.recharge.replace("{seconds}", minimumChargeSeconds)}`,
    );
    await expect(durationButton).toBeDisabled();
    await expect(rechargeButton).toBeDisabled();
  }
});
