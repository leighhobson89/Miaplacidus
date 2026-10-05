import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("sweeps map, stable star names, telescope, fleet, and battle UI in all locales @localization @star-map @space-telescope @starship @battle", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=314159&testLocale=en&economyFixture=space-battle-victory");
  await page.getByLabel("Pioneer name").fill("Interstellar Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const renderedTitles = new Set<string>();
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await page.locator("#tab-interstellar").click();
    const map = page.getByTestId("star-map-pane");
    await map.getByRole("tab", { name: starMapText(locale, "mapView") }).click();
    await expect(map.locator("h2")).toHaveText(starMapText(locale, "title"));
    await expect(
      map.getByRole("searchbox", { name: starMapText(locale, "searchLabel") }),
    ).toBeVisible();
    await expect(
      map.getByTestId("star-selection").getByRole("heading", { name: "Sirius" }),
    ).toBeVisible();
    await map.getByRole("tab", { name: starMapText(locale, "dataView") }).click();
    await expect(map.getByTestId("star-data-table")).toBeVisible();

    const starship = page.getByTestId("starship-pane");
    await page.locator("#tab-interstellar-starship").click();
    await expect(
      starship.getByRole("heading", { name: starshipText(locale, "title") }),
    ).toBeVisible();
    await page.locator("#tab-interstellar-fleet-hangar").click();
    await expect(
      starship.getByTestId("starship-fleet-hangar").getByRole("heading", {
        name: starshipText(locale, "envoyTitle"),
      }),
    ).toBeVisible();
    await page.locator("#tab-interstellar-colonise").click();
    await expect(
      starship.getByTestId("starship-battle").getByRole("heading", {
        name: starshipText(locale, "battleTitle"),
      }),
    ).toBeVisible();

    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-launch-pad").click();
    const mining = page.getByTestId("space-mining-pane");
    await expect(mining.getByRole("heading", { name: spaceText(locale, "title") })).toBeVisible();
    await expect(mining.getByText(spaceText(locale, "systemWeather"))).toBeVisible();
    const currentWeather = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.currentSystemWeather,
    );
    const weatherKey = {
      clear: "weatherClear",
      cloudy: "weatherCloudy",
      rain: "weatherRain",
      heavyRain: "weatherHeavyRain",
      volcano: "weatherVolcano",
    }[currentWeather];
    await expect(mining.getByTestId("space-current-weather")).toContainText(
      spaceText(locale, weatherKey),
    );

    renderedTitles.add(starMapText(locale, "title"));
    renderedTitles.add(starshipText(locale, "battleTitle"));
    renderedTitles.add(spaceText(locale, "title"));
    if (locale !== "en") {
      expect(starshipText(locale, "envoyTitle")).not.toBe(starshipText("en", "envoyTitle"));
      expect(starshipText(locale, "battleTitle")).not.toBe(starshipText("en", "battleTitle"));
    }
  }
  expect(renderedTitles.size).toBeGreaterThan(6);
});
