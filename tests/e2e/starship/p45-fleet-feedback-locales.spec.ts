import { expect, test, type Page } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { starshipText } from "../../../src/i18n/starshipMessages";

async function startFleetFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-diplomacy-power");
  await page.getByLabel("Pioneer name").fill("P-45 Fleet Feedback Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const prepared = await page.evaluate(() => {
    const gateway = window.miaplacidusTest!;
    const cashAdded = gateway.applyDebugAction("give-1b");
    const resourcesAdded = gateway.applyDebugAction("give-1b-all-resources-compounds");
    return {
      cashAdded,
      resourcesAdded,
      fleetHangarBuilt: gateway.getState().run.space.starshipModules.fleetHangar.builtParts > 0,
    };
  });
  expect(prepared).toEqual({ cashAdded: true, resourcesAdded: true, fleetHangarBuilt: true });

  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-fleet-hangar").click();
}

async function selectLocale(page: Page, locale: LocaleId): Promise<void> {
  await page.evaluate((nextLocale) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: nextLocale },
    });
  }, locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("Fleet Hangar purchase feedback is localized after a visible build action @p45-fleet-feedback", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startFleetFixture(page);

  const hangar = page.getByTestId("starship-fleet-hangar");
  const scout = hangar.getByTestId("starship-fleet-scout");
  const build = scout.getByTestId("starship-fleet-build-scout");
  const feedback = page.getByTestId("starship-feedback");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(build).toBeEnabled();
    const before = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.playerFleets.scout,
    );
    await build.click();
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().run.space.playerFleets.scout),
      )
      .toBe(before + 1);
    await expect(feedback).toHaveText(starshipText(locale, "fleetBuilt"));
  }
});
