import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { formatCountdown } from "../../../src/app/timeFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { topStatusText } from "../../../src/i18n/topStatusMessages";

test("Hilo time warp stays visible globally through countdown and expires @galactic-casino @timers", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-timewarp");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  await expect(casino.getByRole("heading", { name: "Galactic Casino" })).toBeVisible();

  const beforeCashOut = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(beforeCashOut.permanent.galacticCasino.higherLower?.prizeKey).toBe(
    "hilo_timewarp_100_12000",
  );
  await expect(page.getByTestId("top-stat-time-warp")).toHaveCount(0);
  await casino.getByRole("button", { name: "Cash out", exact: true }).click();

  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.timeWarp.remainingMs))
    .toBe(12_000);
  const status = page.getByTestId("top-stat-time-warp");
  await expect(status).toBeVisible();
  await expect(status.locator(".top-stat-label")).toHaveText(topStatusText("en", "timeWarpLabel"));

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(2_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.timeWarp.remainingMs))
    .toBe(10_000);
  const afterTwoSeconds = await page.evaluate(() => window.miaplacidusTest!.getState());
  const englishValue = topStatusText("en", "timeWarpValue", {
    multiplier: formatNumber("en", 100, 0, afterTwoSeconds.settings.notation),
    time: formatCountdown("en", afterTwoSeconds.run.timeWarp.remainingMs),
  });
  await expect(status.locator(".top-stat-value")).toHaveText(englishValue);

  await page.locator("#tab-hydrogen").click();
  await expect(page.locator("#tab-hydrogen")).toHaveAttribute("aria-selected", "true");
  await expect(status).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: nextLocale } });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const multiplier = formatNumber(
      locale,
      state.run.timeWarp.multiplier,
      0,
      state.settings.notation,
    );
    const time = formatCountdown(locale, state.run.timeWarp.remainingMs);
    await expect(status.locator(".top-stat-label")).toHaveText(
      topStatusText(locale, "timeWarpLabel"),
    );
    await expect(status.locator(".top-stat-value")).toHaveText(
      topStatusText(locale, "timeWarpValue", { multiplier, time }),
    );
    await expect(status.locator('[role="tooltip"]')).toHaveText(
      topStatusText(locale, "timeWarpTooltip", { multiplier, time }),
    );
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth, `${locale} header at 390px`).toBeLessThanOrEqual(390);
  }

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.timeWarp.remainingMs))
    .toBe(0);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.timeWarp.multiplier))
    .toBe(1);
  await expect(page.getByTestId("top-stat-time-warp")).toHaveCount(0);
});
