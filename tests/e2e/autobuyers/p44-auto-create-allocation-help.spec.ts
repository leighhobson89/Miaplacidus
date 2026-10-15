import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { economyLabel } from "../../../src/i18n/economyMessages";

test("automatic compound creation explains its ingredient-share rule in all locales @p44-auto-create-help @autobuyers", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=storage-all");
  await page.getByLabel("Pioneer name").fill("P-44 Auto-create Help Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.setViewportSize({ width: 320, height: 740 });

  const diesel = page.locator('#panel-compounds-diesel [data-compound-id="diesel"]');
  const autoBuyers = diesel.locator(".compound-autobuyer-section");
  const autoCreateHelp = diesel.locator("#compound-diesel-auto-create-allocation-help");
  const hydrogen = page.locator("#panel-resources-hydrogen");
  const allocation = hydrogen.locator("details:has(.allocation-slider-group)");

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") {
      await page.evaluate((nextLocale: LocaleId) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        });
      }, locale);
    }
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-compounds").click();
    await page.locator("#tab-compounds-diesel").click();
    if (!(await autoBuyers.evaluate((element) => element.hasAttribute("open"))))
      await autoBuyers.locator("summary").click();
    await expect(autoCreateHelp).toBeVisible();
    await expect(autoCreateHelp).toHaveText(economyLabel(locale, "autoCreateAllocationHelp"));
    await expect(autoBuyers.locator("input[type=checkbox]")).toHaveAttribute(
      "aria-describedby",
      "compound-diesel-auto-create-allocation-help",
    );

    await page.locator("#tab-hydrogen").click();
    if (!(await allocation.evaluate((element) => element.hasAttribute("open"))))
      await allocation.locator("summary").click();
    await expect(allocation.locator("#allocation-help-hydrogen")).toBeVisible();
    const originalAllocationHelp = economyLabel(locale, "allocationHelp");
    await expect(allocation.locator("#allocation-help-hydrogen")).toHaveText(
      originalAllocationHelp,
    );
    await expect(allocation).not.toContainText(economyLabel(locale, "autoCreateAllocationHelp"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      `${locale} helper fits the 320px viewport`,
    ).toBe(true);
  }
});
