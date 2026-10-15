import { expect, test, type Page } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import {
  PLAYER_FLEET_IDS,
  STARSHIP_MODULE_IDS,
  type PlayerFleetId,
} from "../../../src/content/space";
import { starshipText, type StarshipMessageKey } from "../../../src/i18n/starshipMessages";

const FLEET_NAME_KEYS: Readonly<Record<PlayerFleetId, StarshipMessageKey>> = {
  scout: "fleetScout",
  marauder: "fleetMarauder",
  landStalker: "fleetLandStalker",
  navalStrafer: "fleetNavalStrafer",
};

// Authored for Phase 8 V-59; NOT RUN.
async function startStarshipFixture(page: Page, locale: LocaleId): Promise<void> {
  await page.addInitScript(() => {
    const appKeys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith("miaplacidus:v1:") ?? false);
    for (const key of appKeys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=${locale}&economyFixture=space-starship`);
  await page.locator("#pioneer-name").fill(`Phase 7 Starship ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("computed Starship module and fleet names follow the selected locale @p7-locale @starship", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const locale of LOCALE_IDS) {
    await startStarshipFixture(page, locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();

    for (const moduleId of STARSHIP_MODULE_IDS) {
      const moduleCard = page.getByTestId(`starship-module-${moduleId}`);
      await expect(moduleCard.locator("h3")).toHaveText(starshipText(locale, moduleId));
    }

    expect(
      await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("build-starship")),
    ).toBe(true);
    await page.locator("#tab-interstellar-fleet-hangar").click();

    const hangar = page.getByTestId("starship-fleet-hangar");
    await expect(hangar).toBeVisible();
    await expect(hangar.locator("h3").first()).toHaveText(starshipText(locale, "envoyTitle"));
    for (const fleetId of PLAYER_FLEET_IDS) {
      const fleetCard = hangar.getByTestId(`starship-fleet-${fleetId}`);
      await expect(fleetCard.locator("h4")).toHaveText(
        starshipText(locale, FLEET_NAME_KEYS[fleetId]),
      );
    }
  }
});
