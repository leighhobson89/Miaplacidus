import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { setGameLocale } from "../_harness/settings-controls";

const FLEET_COPY = {
  scout: { name: "fleetScout", description: "fleetScoutDescription" },
  marauder: { name: "fleetMarauder", description: "fleetMarauderDescription" },
  landStalker: { name: "fleetLandStalker", description: "fleetLandStalkerDescription" },
  navalStrafer: { name: "fleetNavalStrafer", description: "fleetNavalStraferDescription" },
} as const;

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
    await page.locator("#tab-interstellar-star-map").click();
    const map = page.getByTestId("star-map-pane");
    await expect(map.locator("h2")).toHaveText(starMapText(locale, "title"));
    await expect(
      map.getByRole("searchbox", { name: starMapText(locale, "searchLabel") }),
    ).toBeVisible();
    await expect(
      map.getByTestId("star-selection").getByRole("heading", { name: "Sirius" }),
    ).toBeVisible();
    await page.locator("#tab-interstellar-star-data").click();
    await expect(page.getByTestId("star-data-view").getByTestId("star-data-table")).toBeVisible();

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
    await expect(starship.getByTestId("starship-battle-status")).toHaveText(
      starshipText(locale, "battleidle"),
    );

    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-launch-pad").click();
    const mining = page.getByTestId("space-mining-pane");
    await expect(
      mining.getByRole("heading", { name: rocketText(locale, "launchPadTitle") }),
    ).toBeVisible();
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

  // Battle navigation is intentionally locked while a battle is active, so
  // exercise the battle action after completing the cross-locale page sweep.
  await setGameLocale(page, "en");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: starshipText("en", "enterWar"), exact: true }).click();
  await starship.getByTestId("starship-battle-engage-button").click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase),
    )
    .toBe("inProgress");
});

test("shows source-matched Fleet Hangar copy and contained help at 320px in all locales @p44-fleet-copy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=314159&testLocale=en&economyFixture=space-battle-victory");
  await page.getByLabel("Pioneer name").fill("Fleet Copy Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-fleet-hangar").click();
    const pane = page.getByTestId("starship-pane");
    const hangar = pane.getByTestId("starship-fleet-hangar");

    await expect(
      pane.getByRole("heading", { level: 2, name: starshipText(locale, "fleetHangar") }),
    ).toBeVisible();
    await expect(
      hangar.getByRole("heading", { level: 3, name: starshipText(locale, "envoyTitle") }),
    ).toBeVisible();
    await expect(hangar.getByTestId("starship-envoy-description")).toHaveText(
      starshipText(locale, "envoyDescription"),
    );

    for (const fleetId of Object.keys(FLEET_COPY) as (keyof typeof FLEET_COPY)[]) {
      const copy = FLEET_COPY[fleetId];
      const card = hangar.getByTestId(`starship-fleet-${fleetId}`);
      await expect(
        card.getByRole("heading", { level: 4, name: starshipText(locale, copy.name) }),
      ).toBeVisible();
      await expect(card.getByTestId(`starship-fleet-description-${fleetId}`)).toHaveText(
        starshipText(locale, copy.description),
      );
    }

    const help = pane.getByTestId("starship-fleet-hangar-help-trigger");
    await expect(help).toHaveAttribute("aria-label", starshipText(locale, "fleetHangarHelpLabel"));
    await help.focus();
    const tooltip = pane.getByTestId("starship-fleet-hangar-help-tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(starshipText(locale, "fleetHangarHeaderHelp"));
    const bounds = await tooltip.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
  }
});
