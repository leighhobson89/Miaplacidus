import { expect, test, type Page } from "../_harness/fixtures";
import { confirmStarshipWarEntry } from "../_harness/war-mode";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";

type StarshipFixture =
  | "space-starship"
  | "space-starship-ready"
  | "space-battle-victory"
  | "space-battle-defeat";

async function startFixture(page: Page, fixture: StarshipFixture): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("P-45 Interstellar Copy Pioneer");
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

async function selectInterstellarPage(page: Page, pageId: "starship" | "colonise"): Promise<void> {
  await page.locator("#tab-interstellar").click();
  await page.locator(`#tab-interstellar-${pageId}`).click();
}

async function advanceBattle(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const phase = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
    );
    if (phase !== "inProgress") return;
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  }
}

test("Starship status copy localizes across construction, readiness, travel, and orbit @p45-interstellar-visible-copy", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship");
  await selectInterstellarPage(page, "starship");

  const starship = page.getByTestId("starship-pane");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "title"));
    await expect(starship.getByTestId("starship-readiness")).toHaveText(
      starshipText(locale, "building"),
    );
    await expect(
      starship.getByText(starshipText(locale, "description"), { exact: true }),
    ).toBeVisible();
  }

  await startFixture(page, "space-starship-ready");
  await selectInterstellarPage(page, "starship");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.getByTestId("starship-readiness")).toHaveText(
      starshipText(locale, "ready"),
    );
  }

  await selectLocale(page, "en");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-star-map").click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: starMapText("en", "searchLabel") }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: starshipText("en", "setDestination") })
    .click();
  await page.locator("#tab-interstellar-starship").click();
  await starship.getByRole("button", { name: starshipText("en", "launch") }).click();
  const dialog = page.getByRole("dialog", { name: starshipText("en", "pointOfNoReturnTitle") });
  await dialog.getByRole("button", { name: starshipText("en", "confirmLaunch") }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.getByTestId("starship-readiness")).toHaveText(
      starshipText(locale, "travelling", { name: "Sirius" }),
    );
  }

  await startFixture(page, "space-battle-victory");
  await selectInterstellarPage(page, "colonise");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.getByTestId("starship-readiness")).toHaveText(
      starshipText(locale, "orbiting", { name: "Sirius" }),
    );
  }
});

test("Colonise battle and settlement actions and statuses localize through victory @p45-interstellar-visible-copy", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-battle-victory");
  await selectInterstellarPage(page, "colonise");
  const starship = page.getByTestId("starship-pane");
  const diplomacy = starship.getByTestId("starship-diplomacy");
  const battle = starship.getByTestId("starship-battle");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "colonise"));
    await expect(diplomacy.getByRole("heading")).toHaveText(starshipText(locale, "diplomacyTitle"));
    await expect(battle.getByRole("heading")).toHaveText(starshipText(locale, "battleTitle"));
    await expect(starship.getByTestId("starship-battle-status")).toHaveText(
      starshipText(locale, "battleidle"),
    );
    await expect(starship.getByTestId("starship-enter-war-button")).toHaveText(
      starshipText(locale, "enterWar"),
    );
  }

  await selectLocale(page, "en");
  await confirmStarshipWarEntry(starship);
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.getByTestId("starship-war-mode")).toHaveText(
      starshipText(locale, "warModeActive"),
    );
    await expect(starship.getByTestId("starship-battle-engage-button")).toHaveText(
      starshipText(locale, "engageBattle"),
    );
  }

  await selectLocale(page, "en");
  await starship.getByTestId("starship-battle-engage-button").click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("inProgress");
  const round = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]!.battle.round,
  );
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    const status = starship.getByTestId("starship-battle-status");
    await expect(status).toContainText(starshipText(locale, "battleinProgress"));
    await expect(status).toContainText(starshipText(locale, "battleRound", { round }));
    await expect(battle.locator("dt")).toHaveText([
      starshipText(locale, "playerBattleHealth"),
      starshipText(locale, "enemyBattleHealth"),
    ]);
    await expect(battle.locator("dd").nth(0)).toContainText(starshipText(locale, "fleetScout"));
    await expect(battle.locator("dd").nth(1)).toContainText(starshipText(locale, "fleetAir"));
  }

  await selectLocale(page, "en");
  await advanceBattle(page);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("victory");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.getByTestId("starship-battle-status")).toContainText(
      starshipText(locale, "battlevictory"),
    );
    await expect(starship.getByTestId("starship-settle-system-button")).toHaveText(
      starshipText(locale, "settleSystem"),
    );
  }

  await selectLocale(page, "en");
  await starship.getByTestId("starship-settle-system-button").click();
  await expect(starship.getByTestId("starship-system-settled")).toBeVisible();
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.getByTestId("starship-system-settled")).toHaveText(
      starshipText(locale, "alreadySettled"),
    );
    await expect(starship.getByTestId("starship-feedback")).toHaveText(
      starshipText(locale, "settlementComplete"),
    );
  }
});

test("Colonise defeat and settlement-block reason localize across all locales @p45-interstellar-visible-copy", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-battle-defeat");
  await selectInterstellarPage(page, "colonise");
  const starship = page.getByTestId("starship-pane");

  await confirmStarshipWarEntry(starship);
  await starship.getByTestId("starship-battle-engage-button").click();
  await advanceBattle(page);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("defeat");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await expect(starship.getByTestId("starship-battle-status")).toContainText(
      starshipText(locale, "battledefeat"),
    );
    await expect(starship.getByTestId("starship-enter-war-button")).toHaveText(
      starshipText(locale, "enterWar"),
    );
    await expect(starship.locator("#starship-settle-reason")).toHaveText(
      starshipText(locale, "settlementUnavailable"),
    );
  }
});
