import { expect, test, type Page } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { starshipText, LOCALIZATION_VALIDATION_DATA as STARSHIP_LOCALIZATION } from "../../../src/i18n/starshipMessages";

// Phase 7 source-route coverage; authored but NOT RUN.
async function startFixture(page: Page, fixture: "space-battle-victory" | "space-starship") {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Phase 7 Colonise and Fleet Help Pioneer");
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

test("routes source Colonise diplomacy and reception help in all six locales @p7-localization @colonise", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-battle-victory");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();

  const pane = page.getByTestId("starship-pane");
  const report = pane.getByTestId("starship-colonise-scan-report");
  const diplomacy = pane.getByTestId("starship-diplomacy");
  await expect(report).toBeVisible();
  await expect(diplomacy).toBeVisible();

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    expect(STARSHIP_LOCALIZATION.messages[locale].diplomacyOptionsHelp).toBeTruthy();
    expect(STARSHIP_LOCALIZATION.messages[locale].receptionStatusHelp).toBeTruthy();
    await expectTooltip(
      page,
      "starship-diplomacy-options-help-trigger",
      "starship-diplomacy-options-help",
      starshipText(locale, "diplomacyOptionsHelp"),
    );
    await expectTooltip(
      page,
      "starship-scan-reception-help-trigger",
      "starship-scan-reception-help",
      starshipText(locale, "receptionStatusHelp"),
    );
  }
});

test("keeps source Envoy and fleet-unit descriptions on Fleet Hangar in all six locales @p7-localization @fleet-hangar", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  expect(await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("build-starship")))
    .toBe(true);
  await page.locator("#tab-interstellar-fleet-hangar").click();

  const pane = page.getByTestId("starship-pane");
  const hangar = pane.getByTestId("starship-fleet-hangar");
  await expect(hangar).toBeVisible();

  const fleetDescriptions = [
    ["scout", "fleetScoutDescription"],
    ["marauder", "fleetMarauderDescription"],
    ["landStalker", "fleetLandStalkerDescription"],
    ["navalStrafer", "fleetNavalStraferDescription"],
  ] as const;

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    expect(STARSHIP_LOCALIZATION.messages[locale].envoyDescription).toBeTruthy();
    await expect(hangar.getByTestId("starship-envoy-description")).toHaveText(
      starshipText(locale, "envoyDescription"),
    );
    for (const [fleetId, messageKey] of fleetDescriptions) {
      expect(STARSHIP_LOCALIZATION.messages[locale][messageKey]).toBeTruthy();
      await expect(hangar.getByTestId(`starship-fleet-description-${fleetId}`)).toHaveText(
        starshipText(locale, messageKey),
      );
    }
  }
});
