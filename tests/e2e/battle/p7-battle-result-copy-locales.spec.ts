import { expect, test } from "../_harness/fixtures";
import { confirmStarshipWarEntry } from "../_harness/war-mode";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { starshipText } from "../../../src/i18n/starshipMessages";

type BattleFixture = "space-battle-victory" | "space-battle-defeat" | "space-unoccupied";

async function startBattleRoute(
  page: import("@playwright/test").Page,
  fixture: BattleFixture,
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    for (const storage of [localStorage, sessionStorage]) {
      const keys = Array.from({ length: storage.length }, (_, index) =>
        storage.key(index),
      ).filter((key): key is string => key?.startsWith(prefix) ?? false);
      for (const key of keys) storage.removeItem(key);
    }
  });
  await page.goto(`/?testSeed=20261015&testLocale=${locale}&economyFixture=${fixture}`);
  await page.locator("#pioneer-name").fill(`Phase 7 ${locale.toUpperCase()} Battle`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-colonise").click();
}

async function resolveBattle(page: import("@playwright/test").Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const phase = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
    );
    if (phase !== "inProgress") return;
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  }
}

test("battle victory and defeat result copy follows the active locale @p7-battle-result-copy @localization @battle", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const locale of LOCALE_IDS) {
    await startBattleRoute(page, "space-battle-victory", locale);
    const pane = page.getByTestId("starship-pane");
    await confirmStarshipWarEntry(pane);
    await pane.getByTestId("starship-battle-engage-button").click();
    await resolveBattle(page);
    await expect(pane.locator('[data-testid="starship-battle"] h3')).toHaveText(
      starshipText(locale, "battleResultTitle"),
    );
    await expect(pane.getByTestId("starship-battle-status")).toContainText(
      starshipText(locale, "battlevictory"),
    );

    await startBattleRoute(page, "space-battle-defeat", locale);
    const defeatPane = page.getByTestId("starship-pane");
    await confirmStarshipWarEntry(defeatPane);
    await defeatPane.getByTestId("starship-battle-engage-button").click();
    await resolveBattle(page);
    await expect(defeatPane.locator('[data-testid="starship-battle"] h3')).toHaveText(
      starshipText(locale, "battleResultTitle"),
    );
    await expect(defeatPane.getByTestId("starship-battle-status")).toContainText(
      starshipText(locale, "battledefeat"),
    );
  }
});

test("no-sentient-life result copy is shown on the Interstellar Colonise route in all locales @p7-battle-result-copy @localization @battle", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const locale of LOCALE_IDS) {
    await startBattleRoute(page, "space-unoccupied", locale);
    const pane = page.getByTestId("starship-pane");
    await expect(pane.getByTestId("starship-colonise-no-resistance-title")).toHaveText(
      starshipText(locale, "coloniseNoResistanceTitle"),
    );
    await expect(pane.getByTestId("starship-colonise-description")).toHaveText(
      starshipText(locale, "coloniseNoResistance", { system: "Sirius" }),
    );
    await expect(pane.getByTestId("starship-settle-system-button")).toBeVisible();
  }
});
