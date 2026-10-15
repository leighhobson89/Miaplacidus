import { expect, test, type Page } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { localizedRocketUserName, rocketText } from "../../../src/i18n/rocketMessages";
import { spaceNotificationText } from "../../../src/i18n/spaceNotificationMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { translate } from "../../../src/i18n/messages";

type SpaceFixture =
  | "space-telescope"
  | "space-voidborn-pillage"
  | "space-rocket-part-exact"
  | "space-rocket-fuel-pump";

async function expectSpaceTooltip(
  page: Page,
  testId: string,
  expectedCopy: string,
): Promise<void> {
  const trigger = page.getByTestId(`${testId}-trigger`);
  const tooltip = page.getByTestId(testId);
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText(expectedCopy);
}

async function startSpaceFixture(
  page: Page,
  fixture: SpaceFixture,
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill(`P7 Space Labels ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("Space Mining source labels resolve on their owning pages in all locales @p7-space-mining-source-labels", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await startSpaceFixture(page, "space-telescope", locale);
    await page.locator("#tab-space-mining").click();

    await page.locator("#tab-space-mining-telescope").click();
    const telescope = page.getByTestId("space-mining-pane");
    await expect(telescope.locator(".game-page-title")).toHaveText(
      spaceText(locale, "telescopeTitle"),
    );
    await expectSpaceTooltip(
      page,
      "space-telescope-build-help",
      spaceText(locale, "telescopeBuildHelp"),
    );
    const buildTelescope = telescope.getByRole("button", {
      name: spaceText(locale, "telescopeBuild"),
      exact: true,
    });
    await expect(buildTelescope).toBeEnabled();
    await buildTelescope.click();
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: spaceNotificationText(locale, "telescopeBuilt") }),
    ).toHaveText(spaceNotificationText(locale, "telescopeBuilt"));
    await expect(
      telescope.getByRole("heading", { name: spaceText(locale, "autoTitle"), exact: true }),
    ).toBeVisible();
    await expect(telescope.getByLabel(spaceText(locale, "autoRowLabel"), { exact: true })).toBeVisible();
    const autoMode = telescope.locator("#auto-telescope-mode");
    await expect(
      autoMode.getByRole("option", { name: spaceText(locale, "autoAsteroids"), exact: true }),
    ).toBeAttached();
    await expect(
      autoMode.getByRole("option", { name: spaceText(locale, "autoStars"), exact: true }),
    ).toBeAttached();
    await expect(
      telescope.getByRole("button", { name: spaceText(locale, "scanAsteroids"), exact: true }),
    ).toBeEnabled();
    await expect(
      telescope.getByRole("button", { name: spaceText(locale, "studyStars"), exact: true }),
    ).toBeEnabled();
    await expect(telescope.getByTestId("survey-ready-search")).toHaveText(
      spaceText(locale, "surveyReadySearch"),
    );
    await expect(telescope.getByTestId("survey-ready-study")).toHaveText(
      spaceText(locale, "surveyReadyStudy"),
    );
    await expectSpaceTooltip(
      page,
      "space-telescope-scan-help",
      spaceText(locale, "telescopeScanHelp", { power: formatNumber(locale, 0.4, 1) }),
    );
    await expectSpaceTooltip(
      page,
      "space-telescope-study-help",
      spaceText(locale, "telescopeStudyHelp", { power: formatNumber(locale, 0.7, 1) }),
    );

    await page.locator("#tab-space-mining-launch-pad").click();
    await expect(telescope.locator(".game-page-title")).toHaveText(
      rocketText(locale, "launchPadTitle"),
    );
    await expectSpaceTooltip(
      page,
      "space-mining-launch-pad-build-help",
      spaceText(locale, "launchPadBuildHelp"),
    );
    const buildLaunchPad = page.getByRole("button", {
      name: rocketText(locale, "buildLaunchPad"),
      exact: true,
    });
    await expect(buildLaunchPad).toBeEnabled();
    await buildLaunchPad.click();
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: spaceNotificationText(locale, "launchPadBuilt") }),
    ).toHaveText(spaceNotificationText(locale, "launchPadBuilt"));
    const launchPadHelp = page.getByTestId("space-mining-launch-pad-help");
    await page.getByTestId("space-mining-launch-pad-help-trigger").focus();
    await expect(launchPadHelp).toBeVisible();
    await expect(launchPadHelp).toContainText(rocketText(locale, "launchPadHeaderHelp"));
    await expect(launchPadHelp).toContainText(rocketText(locale, "launchPadHelp"));

    await startSpaceFixture(page, "space-voidborn-pillage", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();
    const voidbornTelescope = page.getByTestId("space-mining-pane");
    const voidbornAutoMode = voidbornTelescope.locator("#auto-telescope-mode");
    await expect(
      voidbornAutoMode.getByRole("option", {
        name: spaceText(locale, "autoPillageVoid"),
        exact: true,
      }),
    ).toBeAttached();
    await expect(
      voidbornTelescope.getByRole("button", {
        name: spaceText(locale, "pillageVoid"),
        exact: true,
      }),
    ).toBeEnabled();
    await expect(voidbornTelescope.getByTestId("survey-ready-pillage")).toHaveText(
      spaceText(locale, "surveyReadyPillage"),
    );
    await expectSpaceTooltip(
      page,
      "space-telescope-pillage-help",
      spaceText(locale, "telescopePillageHelp", { power: formatNumber(locale, 1.1, 1) }),
    );

    await startSpaceFixture(page, "space-rocket-fuel-pump", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();
    const rocket = page.getByTestId("rocket-card-rocket1");
    await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText(
      localizedRocketUserName(locale, "Rocket 1"),
    );
    await expect(rocket.getByText(rocketText(locale, "pumpTitle"), { exact: true })).toBeVisible();
    // Source rocketDescription maps by owner-approved adaptation to the live Rocket workflow intro.
    await expect(page.locator("#pane-space-mining .pane-intro:visible")).toHaveText(
      rocketText(locale, "rocketPageDescription"),
    );

    const buyPump = rocket.getByRole("button", {
      name: rocketText(locale, "buyPump"),
      exact: true,
    });
    await expect(buyPump).toBeEnabled();
    await buyPump.click();
    const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");
    const fuelEtaMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
    expect(fuelEtaMs).toBeGreaterThan(0);
    await page.evaluate((duration) => window.miaplacidusTest!.advanceBy(duration + 1), fuelEtaMs);
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "space.weather.set-condition",
        condition: "clear",
      }),
    );
    const launch = rocket.getByRole("button", {
      name: rocketText(locale, "launch"),
      exact: true,
    });
    await expect(launch).toBeEnabled();
    await launch.click();
    await expect(rocket.locator(".status-pill")).toHaveText(rocketText(locale, "orbit"));
    await expect(
      rocket
        .locator(".space-rocket-parts")
        .filter({ hasText: rocketText(locale, "destination") }),
    ).toHaveText(`${rocketText(locale, "destination")}: —`);
  }
});

test("Rocket Miner defaults match all four localized Launch Pad source names @p7-rocket-miner-names", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await startSpaceFixture(page, "space-rocket-part-exact", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-launch-pad").click();

    for (const index of [1, 2, 3, 4]) {
      const assemblyCard = page.getByTestId(`rocket-card-rocket${index}`);
      await expect(
        assemblyCard.getByRole("heading", {
          name: `${rocketText(locale, "rocketMinerLabel", { index })}:`,
          exact: true,
        }),
      ).toBeVisible();
    }
  }
});
