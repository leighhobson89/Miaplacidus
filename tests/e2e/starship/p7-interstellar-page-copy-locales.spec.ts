import { expect, test, type Page } from "../_harness/fixtures";
import { confirmStarshipWarEntry } from "../_harness/war-mode";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { createStarCatalogue, GALAXY_SEED_DEFAULT } from "../../../src/content";
import { enemyFleetPower, totalPlayerFleetPower } from "../../../src/engine/fleetMechanics";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  LOCALIZATION_VALIDATION_DATA as STAR_MAP_LOCALIZATION,
  starMapText,
} from "../../../src/i18n/starMapMessages";
import {
  LOCALIZATION_VALIDATION_DATA as STARSHIP_LOCALIZATION,
  starshipScanTokenText,
  starshipText,
} from "../../../src/i18n/starshipMessages";

// Phase 7 selected-locale route coverage; authored but NOT RUN.
type InterstellarFixture =
  | "space-starship-ready"
  | "space-starship-scanning"
  | "space-starship-scanning-blind"
  | "space-battle-victory"
  | "space-unoccupied";

async function startFixture(page: Page, fixture: InterstellarFixture): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Phase 7 Interstellar Copy Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
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

async function expectTooltip(
  page: Page,
  triggerTestId: string,
  tooltipTestId: string,
  expectedCopy: string,
): Promise<void> {
  await page.getByTestId(triggerTestId).focus();
  await expect(page.getByTestId(tooltipTestId)).toHaveText(expectedCopy);
}

test("localizes the source Starship launch warning in all six locales @p7-localization @starship", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship-ready");
  await page.locator("#tab-interstellar").click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: starMapText("en", "searchLabel") }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: starshipText("en", "setDestination") })
    .click();
  await page.locator("#tab-interstellar-starship").click();

  const pane = page.getByTestId("starship-pane");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await pane.getByRole("button", { name: starshipText(locale, "launch") }).click();

    const title = starshipText(locale, "pointOfNoReturnTitle");
    const body = starshipText(locale, "pointOfNoReturn");
    expect(STARSHIP_LOCALIZATION.messages[locale].pointOfNoReturnTitle).toBeTruthy();
    expect(STARSHIP_LOCALIZATION.messages[locale].pointOfNoReturn).toBeTruthy();
    const dialog = page.getByRole("dialog", { name: title });
    await expect(dialog.locator("#starship-launch-dialog-title")).toHaveText(title);
    await expect(dialog.locator("#starship-launch-dialog-warning")).toHaveText(body);
    await dialog.getByRole("button", { name: starshipText(locale, "cancelLaunch") }).click();
  }
});

test("localizes the source Starship destination reminder in all six locales @p7-localization @starship", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship-ready");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();

  const pane = page.getByTestId("starship-pane");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    const reminder = starshipText(locale, "noDestination");
    expect(STARSHIP_LOCALIZATION.messages[locale].noDestination).toBeTruthy();
    await expect(pane.getByText(reminder, { exact: true })).toBeVisible();
  }
});

test("keeps Starship and Fleet Hangar page copy localized in all six locales @p7-localization @starship", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship-scanning");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();

  const starship = page.getByTestId("starship-pane");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "title"));
    await expectTooltip(
      page,
      "starship-page-help-trigger",
      "starship-page-help",
      starshipText(locale, "starshipHeaderHelp"),
    );
    await expect(starship.getByText(starshipText(locale, "description"), { exact: true }))
      .toBeVisible();
    await expect(starship.getByRole("heading", { name: starshipText(locale, "travellingTo") }))
      .toBeVisible();
    await expect(starship.getByTestId("starship-system-scan")).toBeVisible();
    await expect(
      starship.getByTestId("starship-system-scan").getByRole("heading", {
        name: starshipText(locale, "performSystemScan"),
      }),
    ).toBeVisible();
    await expect(
      starship.getByTestId("starship-scan-system-button"),
    ).toHaveText(starshipText(locale, "scanSystem"));
    await expectTooltip(
      page,
      "starship-scan-action-help-trigger",
      "starship-scan-action-help",
      starshipText(locale, "scanActionHelp"),
    );
  }

  expect(await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("build-starship")))
    .toBe(true);
  await page.locator("#tab-interstellar-fleet-hangar").click();
  const fleetHangar = page.getByTestId("starship-pane");
  const hangarState = await page.evaluate(() => window.miaplacidusTest!.getState());

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(fleetHangar.locator("#starship-title")).toHaveText(
      starshipText(locale, "fleetHangar"),
    );
    const helpTrigger = page.getByTestId("starship-fleet-hangar-help-trigger");
    await expect(helpTrigger).toHaveAttribute(
      "aria-label",
      starshipText(locale, "fleetHangarHelpLabel"),
    );
    await expectTooltip(
      page,
      "starship-fleet-hangar-help-trigger",
      "starship-fleet-hangar-help-tooltip",
      starshipText(locale, "fleetHangarHeaderHelp"),
    );
    const description = fleetHangar.locator(":scope > p");
    await expect(description).toContainText(starshipText(locale, "fleetHangarDescription"));
    await expect(description.locator(".green-ready-text")).toHaveText(
      formatNumber(
        locale,
        Math.round(totalPlayerFleetPower(hangarState.run.space.playerFleetCombatTotals).attackPower),
        2,
        hangarState.settings.notation,
      ),
    );
  }
});

test("routes Colonise title, source help, and dynamic fleet description in all six locales @p7-localization @colonise", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-battle-victory");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();

  const colonise = page.getByTestId("starship-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destination = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) => star.id === state.run.space.starship.destinationSystemId,
  );
  if (!destination) throw new Error("The Colonise fixture must provide a destination star.");
  const roundedFleetPower = Math.round(
    totalPlayerFleetPower(state.run.space.playerFleetCombatTotals).attackPower,
  );

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(colonise.locator("#starship-title")).toHaveText(
      starshipText(locale, "colonise"),
    );
    const formattedFleetPower = formatNumber(
      locale,
      roundedFleetPower,
      2,
      state.settings.notation,
    );
    await expectTooltip(
      page,
      "colonise-page-help-trigger",
      "colonise-page-help",
      starshipText(locale, "coloniseHeaderHelp")
        .replace("{system}", destination.name)
        .replace("{fleetPower}", formattedFleetPower),
    );
    await expect(colonise.getByTestId("starship-colonise-description")).toHaveText(
      starshipText(locale, "coloniseDescription")
        .replace("{system}", destination.name)
        .replace("{playerPower}", formattedFleetPower),
    );
    await expect(
      colonise.getByTestId("starship-diplomacy").getByRole("heading"),
    ).toHaveText(starshipText(locale, "diplomacyTitle"));
  }
});

test("localizes source-owned Colonise scan report labels, fields, and outcome in all six locales @p7-localization @colonise-scan-report", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startFixture(page, "space-starship-scanning");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();

  const pane = page.getByTestId("starship-pane");
  await pane.getByTestId("starship-scan-system-button").click();
  await expect(pane.getByTestId("starship-scan-complete")).toBeVisible();
  const scanState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destination = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) => star.id === scanState.run.space.starship.destinationSystemId,
  );
  const encounter = scanState.run.space.systemEncounters.find(
    (entry) => entry.systemId === scanState.run.space.starship.destinationSystemId,
  );
  if (!destination || !encounter) {
    throw new Error("The completed Sirius scan must populate a Colonise report.");
  }

  const reportFieldKeys = [
    "raceName",
    "civilization",
    "population",
    "threat",
    "defense",
    "attitude",
    "impression",
    "patience",
    "enemyFleets",
    "enemyFleetPower",
    "lifeformTraits",
    "anomalies",
  ] as const;
  const outcomeKey = encounter.lifeDetected ? "lifeDetected" : "noLifeDetected";

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-colonise").click();
    const report = pane.getByTestId("starship-colonise-scan-report");

    for (const key of reportFieldKeys) {
      expect(STARSHIP_LOCALIZATION.messages[locale][key], `${locale} value for ${key}`).toBeTruthy();
    }
    for (const key of ["sortName", "ascendency", "weather"] as const) {
      expect(STAR_MAP_LOCALIZATION.messages[locale][key], `${locale} value for ${key}`).toBeTruthy();
    }
    expect(STARSHIP_LOCALIZATION.messages[locale][outcomeKey]).toBeTruthy();

    await expect(report).toBeVisible();
    await expect(
      report.getByRole("heading", { name: starshipText(locale, "scanReport") }),
    ).toBeVisible();
    const labels = await report.locator("dt").evaluateAll((nodes) =>
      nodes.map((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("button").forEach((button) => button.remove());
        return clone.textContent?.trim().replace(/\s+/g, " ") ?? "";
      }),
    );
    expect(labels).toEqual([
      starMapText(locale, "sortName"),
      starMapText(locale, "ascendency"),
      starMapText(locale, "weather"),
      ...reportFieldKeys.map((key) => starshipText(locale, key)),
    ]);
    await expect(report.getByTestId("starship-system-scan-results")).toHaveText(
      starshipText(locale, outcomeKey),
    );

    const readings = report.locator("dd");
    await expect(readings).toHaveCount(reportFieldKeys.length + 3);
    for (const reading of await readings.allTextContents()) {
      expect(reading.trim().length).toBeGreaterThan(0);
    }
    await expect(readings.nth(0)).toHaveText(destination.name);
    await expect(readings.nth(3)).toHaveText(encounter.raceName);
    await expect(readings.nth(4)).toHaveText(
      starshipScanTokenText(locale, "civilization", encounter.civilizationLevel),
    );
    await expect(readings.nth(5)).toHaveText(
      formatNumber(locale, encounter.populationEstimate, 2, scanState.settings.notation),
    );
    await expect(readings.nth(6)).toHaveText(
      starshipScanTokenText(locale, "threat", encounter.threatLevel),
    );
    await expect(readings.nth(7)).toHaveText(
      formatNumber(locale, encounter.defenseRating, 2, scanState.settings.notation),
    );
    await expect(readings.nth(8)).toHaveText(
      starshipScanTokenText(locale, "attitude", encounter.attitude),
    );
    await expect(readings.nth(11)).toHaveText(
      `${formatNumber(locale, encounter.enemyFleets.air, 0, scanState.settings.notation)} / ${formatNumber(locale, encounter.enemyFleets.land, 0, scanState.settings.notation)} / ${formatNumber(locale, encounter.enemyFleets.sea, 0, scanState.settings.notation)}`,
    );
    await expect(readings.nth(13)).toHaveText(
      encounter.lifeformTraits
        .map((trait) => starshipScanTokenText(locale, "trait", trait))
        .join(", "),
    );
    await expect(readings.nth(14)).toHaveText(
      encounter.anomalies
        .map((anomaly) => starshipScanTokenText(locale, "anomaly", anomaly))
        .join(", ") || "—",
    );
  }
});

test("localizes the no-scanner result on Starship and Colonise in all six locales @p7-localization @colonise-scan-report", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship-scanning-blind");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();

  const pane = page.getByTestId("starship-pane");
  await pane.getByTestId("starship-scan-system-button").click();
  await expect(pane.getByTestId("starship-scan-complete")).toBeVisible();
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();
    await expect(pane.getByTestId("starship-scan-limited-notice")).toHaveText(
      starshipText(locale, "scanLimited"),
    );

    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-colonise").click();
    const report = pane.getByTestId("starship-colonise-scan-report");
    await expect(report).toBeVisible();
    await expect(report.getByTestId("starship-scan-report-limited-notice")).toHaveText(
      starshipText(locale, "scanLimited"),
    );
    await expect(report.getByTestId("starship-system-scan-results")).toHaveText("???");
  }
});

test("localizes the source battle description in all six locales @p7-localization @colonise", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-battle-victory");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();

  const pane = page.getByTestId("starship-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const encounter = state.run.space.systemEncounters.find(
    (entry) => entry.systemId === state.run.space.starship.destinationSystemId,
  );
  if (!encounter) throw new Error("The battle fixture must provide a Colonise encounter.");

  await confirmStarshipWarEntry(pane);
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    const localizedPlayerPower = formatNumber(
      locale,
      Math.round(totalPlayerFleetPower(state.run.space.playerFleetCombatTotals).attackPower),
      2,
      state.settings.notation,
    );
    const localizedEnemyPower = formatNumber(
      locale,
      Math.round(enemyFleetPower(encounter.enemyFleets)),
      2,
      state.settings.notation,
    );
    await expect(pane.getByTestId("starship-war-mode")).toHaveText(
      starshipText(locale, "warModeActive"),
    );
    await expect(pane.getByTestId("starship-colonise-description")).toHaveText(
      starshipText(locale, "coloniseBattleDescription")
        .replace("{playerPower}", localizedPlayerPower)
        .replace("{enemyPower}", localizedEnemyPower),
    );
  }
});

test("localizes immediate no-resistance settlement copy in all six locales @p7-localization @colonise", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-unoccupied");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();

  const pane = page.getByTestId("starship-pane");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destination = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) => star.id === state.run.space.starship.destinationSystemId,
  );
  if (!destination) throw new Error("The unoccupied fixture must provide a destination star.");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(pane.getByTestId("starship-colonise-description")).toHaveText(
      starshipText(locale, "coloniseNoResistance", { system: destination.name }),
    );
    await expect(pane.getByTestId("starship-colonise-no-resistance-title")).toHaveText(
      starshipText(locale, "coloniseNoResistanceTitle"),
    );
  }
});
