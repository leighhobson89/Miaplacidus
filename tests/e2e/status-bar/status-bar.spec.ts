import { expect, test } from "../_harness/fixtures";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { randomEventName } from "../../../src/i18n/metaSignalMessages";
import { topStatusText } from "../../../src/i18n/topStatusMessages";
import { startMetaFixture } from "../_harness/meta-fixture";

async function forceEvent(page: import("@playwright/test").Page, eventId: "researchBreakthrough" | "endlessSummer") {
  const accepted = await page.evaluate((id) =>
    window.miaplacidusTest!.dispatch({ type: "random-event.force", eventId: id }), eventId);
  expect(accepted).toBe(true);
}

async function expectBalanceName(
  page: import("@playwright/test").Page,
  testId: "ascendency-balance" | "cp-balance" | "gp-balance",
  tooltipId: "ap" | "cp" | "gp",
  fullName: string,
) {
  const balance = page.getByTestId(testId);
  await balance.locator("strong").focus();
  const tooltip = page.locator(`#header-${tooltipId}-tooltip`);
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText(fullName);
  await balance.locator("strong").evaluate((element) => element.blur());
}

async function expectEventState(
  page: import("@playwright/test").Page,
  locale: (typeof LOCALE_IDS)[number],
  expectedEvent: "researchBreakthrough" | "endlessSummer" | null,
) {
  await setGameLocale(page, locale);
  const event = page.getByTestId("top-stat-event");
  await expect(event.locator(".top-stat-label")).toHaveText(
    topStatusText(locale, "eventStatusLabel"),
  );
  const eventValue = event.locator(".top-stat-value");
  if (expectedEvent === null) {
    await expect(eventValue).toHaveText(topStatusText(locale, "eventNone"));
    await eventValue.focus();
    await expect(event.getByRole("tooltip")).toContainText(topStatusText(locale, "eventNone"));
  } else {
    await expect(eventValue).toContainText(randomEventName(locale, expectedEvent));
    await eventValue.focus();
    const tooltip = event.getByRole("tooltip");
    const tooltipKey = expectedEvent === "endlessSummer" ? "eventRemaining" : "eventLastRecorded";
    const eventTooltip = topStatusText(locale, tooltipKey, { time: "" }).trim();
    await expect(tooltip).toContainText(eventTooltip);
  }
  await eventValue.evaluate((element) => element.blur());
}

test("localizes the static event label, shows latest event state and RP source rates, and fits narrow screens @status-bar @presentation @locale", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) await expectEventState(freshGame, locale, null);

  await setGameLocale(freshGame, "en");
  const initialBalances = freshGame.locator(".header-balances");
  await expect(freshGame.getByTestId("ascendency-balance")).toBeVisible();
  await expect(freshGame.getByTestId("cp-balance")).toHaveCount(0);
  await expect(freshGame.getByTestId("gp-balance")).toHaveCount(0);
  await expectBalanceName(freshGame, "ascendency-balance", "ap", "Ascendency Points");

  const accepted = await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "economy.building.purchase",
      buildingId: "scienceKit",
    }),
  );
  expect(accepted).toBe(true);
  const research = freshGame.getByTestId("research-balance");
  await expect(research.locator("xpath=..").locator(".balance-label")).toHaveText("RP");
  await research.focus();
  const researchTooltip = freshGame.locator("#header-rp-tooltip");
  await expect(researchTooltip).toBeVisible();
  await expect(researchTooltip).toContainText("Research Points");
  await expect(researchTooltip).toContainText("Production per second");
  await expect(researchTooltip).toContainText("Science Kits: 0.5/s");
  await expect(researchTooltip).toContainText("Science Clubs: 0/s");
  await expect(researchTooltip).toContainText("Powered Science Labs: 0/s");
  await expect(researchTooltip).toContainText("Megastructure / other bonuses: 0/s");
  await expect(researchTooltip).toContainText("Total rate: 0.5/s");
  await research.evaluate((element) => element.blur());

  await forceEvent(freshGame, "researchBreakthrough");
  for (const locale of LOCALE_IDS) {
    await expectEventState(freshGame, locale, "researchBreakthrough");
  }

  await setGameLocale(freshGame, "en");
  await forceEvent(freshGame, "endlessSummer");
  for (const locale of LOCALE_IDS) await expectEventState(freshGame, locale, "endlessSummer");

  await setGameLocale(freshGame, "en");
  await freshGame.setViewportSize({ width: 320, height: 700 });
  await freshGame.getByTestId("top-stat-event").locator(".top-stat-value").focus();
  const layout = await freshGame.evaluate(() => {
    const bar = document.querySelector<HTMLElement>(".top-status-bar");
    if (!bar) throw new Error("The status bar is missing");
    const barBounds = bar.getBoundingClientRect();
    const cards = Array.from(bar.children).map((card) => {
      const bounds = card.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right };
    });
    return {
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      barLeft: barBounds.left,
      barRight: barBounds.right,
      cards,
    };
  });
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.barLeft).toBeGreaterThanOrEqual(0);
  expect(layout.barRight).toBeLessThanOrEqual(layout.viewportWidth);
  for (const card of layout.cards) {
    expect(card.left).toBeGreaterThanOrEqual(layout.barLeft);
    expect(card.right).toBeLessThanOrEqual(layout.barRight);
  }
  expect(initialBalances).toBeVisible();
});

test("reveals CP with the Galactic gate and exposes its full localized name @status-bar @meta-progression @locale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await expect(page.getByTestId("ascendency-balance")).toBeVisible();
  await expect(page.getByTestId("cp-balance")).toBeVisible();
  await expect(page.getByTestId("gp-balance")).toHaveCount(0);
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectBalanceName(
      page,
      "ascendency-balance",
      "ap",
      topStatusText(locale, "ascendencyPointsName"),
    );
    await expectBalanceName(
      page,
      "cp-balance",
      "cp",
      topStatusText(locale, "casinoPointsName"),
    );
  }
});

test("reveals GP after the Cosmic Rip gate and keeps AP, CP, GP order @status-bar @meta-progression @locale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await expect(page.getByTestId("gp-balance")).toBeVisible();
  const balancesInOrder = await page.locator(".header-balances").evaluate((header) =>
    Array.from(header.querySelectorAll<HTMLElement>("[data-testid$='-balance']"))
      .map((balance) => balance.dataset.testid),
  );
  expect(balancesInOrder).toEqual([
    "ascendency-balance",
    "cp-balance",
    "gp-balance",
    "cash-balance",
    "research-balance",
  ]);
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectBalanceName(
      page,
      "ascendency-balance",
      "ap",
      topStatusText(locale, "ascendencyPointsName"),
    );
    await expectBalanceName(
      page,
      "cp-balance",
      "cp",
      topStatusText(locale, "casinoPointsName"),
    );
    await expectBalanceName(
      page,
      "gp-balance",
      "gp",
      topStatusText(locale, "galacticPointsName"),
    );
  }
});
