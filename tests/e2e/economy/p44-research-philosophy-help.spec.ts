import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { PHILOSOPHY_PATHS } from "../../../src/content/philosophy";
import { philosophyText } from "../../../src/i18n/philosophyMessages";

test("Research Philosophy information stays localized in its page content @p44-research-energy-help", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(
    "/?testSeed=20261010&testLocale=en&economyFixture=philosophy-notification-routes",
  );
  await page.locator("#pioneer-name").fill("P-44 Philosophy Help Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-philosophy").click();

  const panel = page.locator("#panel-research-philosophy [data-testid=philosophy-pane]");
  await expect(panel).toBeVisible();
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale: LocaleId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const copy = philosophyText(locale);
    const path = copy.paths.constructor;
    const ability = copy.abilities[PHILOSOPHY_PATHS.constructor.abilityId];
    await expect(panel.locator(".philosophy-path-heading .game-page-title")).toHaveText(path.name);
    await expect(panel.locator(".philosophy-path-heading p:not(.eyebrow)")).toHaveText(
      path.summary,
    );
    await expect(panel.locator(".philosophy-ability h3")).toHaveText(
      `${copy.ability}: ${ability.name}`,
    );
    await expect(panel.locator(".philosophy-ability > p").nth(0)).toHaveText(ability.effect);
    await expect(panel.locator(":scope > .economy-section-heading h3")).toHaveText(
      copy.repeatables,
    );

    const repeatables = panel.locator(".philosophy-repeatable");
    await expect(repeatables).toHaveCount(PHILOSOPHY_PATHS.constructor.repeatables.length);
    for (let index = 0; index < PHILOSOPHY_PATHS.constructor.repeatables.length; index += 1) {
      const repeatableId = PHILOSOPHY_PATHS.constructor.repeatables[index]!;
      const expected = copy.upgrades[repeatableId];
      const card = repeatables.nth(index);
      await expect(card.locator("h4")).toHaveText(expected.name);
      await expect(card.locator(":scope > p").nth(0)).toHaveText(expected.effect);
    }

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      `${locale} Philosophy information fits the 320px viewport`,
    ).toBe(true);
  }
});
