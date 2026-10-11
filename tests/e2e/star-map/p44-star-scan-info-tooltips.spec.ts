import { expect, test, type Page } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { starshipText } from "../../../src/i18n/starshipMessages";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { setGameLocale } from "../_harness/settings-controls";

const SCAN_HELP_KEYS = [
  "scanMoreInfoLabel",
  "scanApHelp",
  "scanWeatherHelp",
  "scanCivilizationHelp",
  "scanDefenseHelp",
  "scanEnemyFleetsHelp",
  "scanThreatHelp",
] as const;

async function expectContainedTooltip(
  page: Page,
  testId: string,
  label: string,
  content: string,
): Promise<void> {
  const trigger = page.getByTestId(`${testId}-trigger`);
  const tooltip = page.getByTestId(testId);
  await expect(trigger).toHaveAttribute("aria-label", label);
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText(content);

  const bounds = await tooltip.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
}

test("shows source-matched Star Map and scan report help in all locales @p44-star-scan-info", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/?testSeed=314159&testLocale=en&economyFixture=space-battle-victory");
  await page.getByLabel("Pioneer name").fill("Star Scan Info Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-star-data").click();
  const dataTable = page.getByTestId("star-data-view").getByTestId("star-data-table");
  await expect(dataTable).toBeVisible();
  await expect(dataTable.locator("tbody tr").first()).toBeVisible();

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    if (locale !== "en") {
      for (const key of SCAN_HELP_KEYS) {
        expect(starshipText(locale, key), `${locale} must provide ${key}`).not.toBe(
          starshipText("en", key),
        );
      }
    }
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-star-data").click();

    const starDataScroll = page.locator(".star-data-table-scroll");
    await starDataScroll.evaluate((element) => {
      element.scrollLeft = 0;
    });
    await expectContainedTooltip(
      page,
      "star-data-weather-help",
      `${starMapText(locale, "weather")} — ${starshipText(locale, "scanMoreInfoLabel")}`,
      starshipText(locale, "scanWeatherHelp"),
    );
    await starDataScroll.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await expectContainedTooltip(
      page,
      "star-data-ap-help",
      `${starMapText(locale, "ascendency")} — ${starshipText(locale, "scanMoreInfoLabel")}`,
      starshipText(locale, "scanApHelp"),
    );

    await page.locator("#tab-interstellar-colonise").click();
    const pane = page.getByTestId("starship-pane");
    const report = pane.getByTestId("starship-colonise-scan-report");
    await expect(report).toBeVisible();

    const reportKeys = [
      ["civilization", "scanCivilizationHelp"],
      ["threat", "scanThreatHelp"],
      ["defense", "scanDefenseHelp"],
      ["enemyFleets", "scanEnemyFleetsHelp"],
    ] as const;
    for (const [field, message] of reportKeys) {
      const label = starshipText(locale, field);
      await expectContainedTooltip(
        page,
        `starship-scan-${field === "enemyFleets" ? "enemy-fleets" : field}-help`,
        `${label} — ${starshipText(locale, "scanMoreInfoLabel")}`,
        starshipText(locale, message),
      );
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
  }
});
