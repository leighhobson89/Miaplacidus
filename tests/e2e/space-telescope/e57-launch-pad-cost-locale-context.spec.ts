import { expect, test, type Page } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LAUNCH_PAD_COST, type SpacePurchaseCost } from "../../../src/content/space";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import type { GameState } from "../../../src/engine/state";
import { philosophyDiscountedSpaceCost } from "../../../src/engine/philosophy";
import { rocketText } from "../../../src/i18n/rocketMessages";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function startLaunchPadFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("E57 Launch Pad Locale Pioneer");
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

function expectedCostLines(state: GameState, cost: SpacePurchaseCost): string[] {
  const locale = state.settings.locale;
  return [
    formatCurrency(
      locale,
      cost.cash,
      state.settings.currencyId ?? "usd",
      0,
      state.settings.notation,
    ),
    ...(cost.antimatter === undefined
      ? []
      : [
          `${formatNumber(locale, cost.antimatter, 0, state.settings.notation)} ${spaceText(locale, "antimatterStored")}`,
        ]),
    ...cost.materials.map(
      ({ goodId, amount }) =>
        `${formatNumber(locale, amount, 0, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
    ),
  ];
}

async function expectWithinViewport(
  page: Page,
  width: number,
  selectors: readonly (readonly [string, string])[],
): Promise<void> {
  const result = await page.evaluate((items) => {
    const read = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing visible Launch Pad context: ${selector}`);
      const bounds = element.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      };
    };
    return {
      viewport: document.documentElement.clientWidth,
      document: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      items: items.map(([name, selector]) => [name, read(selector)] as const),
    };
  }, selectors);

  expect(result.viewport).toBe(width);
  expect(result.document, `${width}px document`).toBeLessThanOrEqual(width);
  for (const [name, bounds] of result.items) {
    expect(bounds.left, `${width}px ${name} left`).toBeGreaterThanOrEqual(-1);
    expect(bounds.right, `${width}px ${name} right`).toBeLessThanOrEqual(width + 1);
    expect(bounds.scrollWidth, `${width}px ${name} text width`).toBeLessThanOrEqual(
      bounds.clientWidth + 1,
    );
  }
}

test("Launch Pad construction quote and action fit at 390px and 320px in six locales @e57-space", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startLaunchPadFixture(page);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-launch-pad").click();
    const pane = page.getByTestId("space-mining-pane");
    const costList = pane.getByRole("list", { name: rocketText(locale, "launchPadCost") });
    const buildButton = pane.getByRole("button", {
      name: rocketText(locale, "buildLaunchPad"),
      exact: true,
    });

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.space.launchPadBuilt, `${locale} Launch Pad starts unbuilt`).toBe(false);
    expect(state.run.space.telescopeBuilt, `${locale} prerequisite Telescope starts unbuilt`).toBe(
      false,
    );
    const cost = philosophyDiscountedSpaceCost(
      state,
      LAUNCH_PAD_COST,
      "efficientAssembly",
      0.01,
      true,
    );
    await expect(costList.locator("li")).toHaveText(expectedCostLines(state, cost));
    await expect(buildButton).toBeEnabled();

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expectWithinViewport(page, viewport.width, [
        ["Launch Pad page", '[data-testid="space-mining-pane"]'],
        ["construction cost list", ".space-card:not([hidden]) .space-cost-list"],
        ["cash price", ".space-card:not([hidden]) .space-cost-list li:nth-child(1)"],
        ["material prices", ".space-card:not([hidden]) .space-cost-list li:nth-child(2)"],
        ["construction action", "#panel-space-mining button.primary-button"],
      ]);
      if (locale === "fr" && viewport.width === 320) {
        await page.mouse.move(0, 0);
        await page.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          window.scrollTo(0, 0);
        });
        await expect(page.locator('[role="tooltip"]:visible')).toHaveCount(0);
        await page.screenshot({
          path: "tests/e2e/space-telescope/e57-launch-pad-cost-fr-320.png",
          fullPage: true,
          animations: "disabled",
          caret: "hide",
        });
      }
    }
  }

  await page.getByRole("button", { name: rocketText("fr", "buildLaunchPad"), exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
    .toBe(true);
});
