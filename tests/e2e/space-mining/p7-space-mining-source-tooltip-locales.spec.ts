import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { ROCKET_FUEL_PUMP_POWER } from "../../../src/content/space";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { translate } from "../../../src/i18n/messages";

async function startLateSpaceFixture(
  page: Page,
  fixture: "space-late-game" | "space-rocket-fuel-pump" = "space-late-game",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261016&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel(translate("en", "app.pioneer")).fill("P7 Source Help Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function expectSpaceHelp(
  page: Page,
  testId: string,
  fragments: readonly string[],
): Promise<void> {
  const trigger = page.getByTestId(`${testId}-trigger`);
  const tooltip = page.getByTestId(testId);
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  for (const fragment of fragments) {
    expect(fragment.trim(), `${testId} locale copy is populated`).not.toBe("");
    await expect(tooltip).toContainText(fragment);
  }
}

test("Space Mining source header help stays on its owning child page in all six locales @p7-space-mining-source-tooltips", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startLateSpaceFixture(page);
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-space-mining").click();

    const miningTab = page.locator("#tab-space-mining-mining");
    await miningTab.click();
    await expect(miningTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText(
      spaceText(locale, "miningTitle"),
    );
    await expectSpaceHelp(page, "space-mining-mining-help", [
      spaceText(locale, "miningHeaderHelp"),
      spaceText(locale, "miningLayoutHelp"),
      spaceText(locale, "miningHelp"),
    ]);
    await expect(page.getByTestId("antimatter-rate")).toBeVisible();
    await expectSpaceHelp(page, "space-mining-antimatter-rate-help", [
      spaceText(locale, "antimatterBoostHelp"),
    ]);
    await expect(page.getByTestId("antimatter-boost")).toBeVisible();

    const asteroidsTab = page.locator("#tab-space-mining-asteroids");
    await asteroidsTab.click();
    await expect(asteroidsTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText(
      spaceText(locale, "asteroidsTitle"),
    );
    await expectSpaceHelp(page, "space-mining-asteroids-help", [
      spaceText(locale, "asteroidsHeaderHelp"),
      spaceText(locale, "asteroidsTableHelp"),
      spaceText(locale, "asteroidDistanceHelp"),
      spaceText(locale, "asteroidComplexityHelp"),
      spaceText(locale, "asteroidAntimatterHelp"),
      spaceText(locale, "asteroidsHelp"),
    ]);
    const firstAsteroidId = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.asteroids[0]?.id,
    );
    expect(firstAsteroidId).toBeTruthy();
    await expect(page.getByTestId(`asteroid-${firstAsteroidId}`)).toContainText(
      spaceText(locale, "asteroidComplexity"),
    );

    const launchPadTab = page.locator("#tab-space-mining-launch-pad");
    await launchPadTab.click();
    await expect(launchPadTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText(
      rocketText(locale, "launchPadTitle"),
    );
    await expectSpaceHelp(page, "space-mining-launch-pad-help", [
      rocketText(locale, "launchPadHeaderHelp"),
      rocketText(locale, "launchPadHelp"),
    ]);

    await startLateSpaceFixture(page, "space-rocket-fuel-pump");
    await setGameLocale(page, locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();
    const rocket = page.getByTestId("rocket-card-rocket1");
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    await expectSpaceHelp(page, "rocket-rocket1-fuel-help", [
      rocketText(locale, "rocketFuelHelp", {
        power: formatNumber(
          locale,
          ROCKET_FUEL_PUMP_POWER.rocket1,
          2,
          state.settings.notation,
        ),
      }),
    ]);
    const buyPump = rocket.getByRole("button", {
      name: rocketText(locale, "buyPump"),
      exact: true,
    });
    await buyPump.click();
    const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");
    const fuelEtaMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
    expect(fuelEtaMs).toBeGreaterThan(0);
    await page.evaluate((duration) => window.miaplacidusTest!.advanceBy(duration + 1), fuelEtaMs);
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "space.weather.set-condition",
        condition: "clear",
      }),
    );
    await rocket
      .getByRole("button", { name: rocketText(locale, "launch"), exact: true })
      .click();
    await expect(rocket.locator(".status-pill")).toHaveText(rocketText(locale, "orbit"));
    await expectSpaceHelp(page, "rocket-rocket1-travel-help", [
      rocketText(locale, "rocketTravelHelp"),
    ]);
  }
});
