import { expect, test, type Page } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  ROCKET_IDS,
  TELESCOPE_COST,
  type RocketId,
  type SpacePurchaseCost,
} from "../../../src/content/space";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { permanentPerkPurchaseCount } from "../../../src/content/economyRules";
import { rocketPartCost } from "../../../src/engine/spaceRules";
import {
  philosophyDiscountedSpaceCost,
  philosophyRepeatableRank,
} from "../../../src/engine/philosophy";
import type { GameState } from "../../../src/engine/state";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { rocketText } from "../../../src/i18n/rocketMessages";

const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function startFixture(page: Page, fixture: string): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("E57 Space Locale Pioneer");
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

async function expectContextInsideViewport(
  page: Page,
  viewportWidth: number,
  selectors: readonly (readonly [string, string])[],
): Promise<void> {
  const geometry = await page.evaluate((items) => {
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing visible E-57 context: ${selector}`);
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right };
    };
    return {
      viewport: document.documentElement.clientWidth,
      document: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      elements: items.map(([name, selector]) => [name, rect(selector)] as const),
    };
  }, selectors);
  expect(geometry.viewport).toBe(viewportWidth);
  expect(geometry.document, `${viewportWidth}px document width`).toBeLessThanOrEqual(viewportWidth);
  for (const [name, bounds] of geometry.elements) {
    expect(bounds.left, `${viewportWidth}px ${name} left`).toBeGreaterThanOrEqual(-1);
    expect(bounds.right, `${viewportWidth}px ${name} right`).toBeLessThanOrEqual(viewportWidth + 1);
  }
}

async function visibleTabLabel(tab: ReturnType<Page["locator"]>): Promise<string> {
  return tab.evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
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

test("Space Telescope quote and one-material shortfall stay translated and readable at 390/320px @e57-space", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-telescope-shortfall");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-space-mining").click();
      await page.locator("#tab-space-mining-telescope").click();

      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const telescope = page.getByRole("region", { name: spaceText(locale, "telescopeTitle") });
      const quote = telescope.getByRole("list", { name: spaceText(locale, "telescopeCost") });
      const build = telescope.getByRole("button", {
        name: spaceText(locale, "telescopeBuild"),
        exact: true,
      });
      const discountedCost = philosophyDiscountedSpaceCost(
        state,
        TELESCOPE_COST,
        "efficientAssembly",
        0.01,
        true,
      );
      await expect(quote.getByRole("listitem")).toHaveText(
        expectedCostLines(state, discountedCost),
      );
      await expect(build).toBeDisabled();
      await expect(build).toHaveAttribute("aria-describedby", "telescope-build-reason");
      const missingMaterial = discountedCost.materials.find(
        ({ goodId, amount }) => state.run.goods[goodId]!.quantity < amount,
      );
      expect(missingMaterial).toBeDefined();
      await expect(page.locator("#telescope-build-reason")).toContainText(
        spaceText(locale, "reasonInsufficientMaterial", {
          material: economyGoodName(locale, missingMaterial!.goodId),
          amount: formatNumber(locale, missingMaterial!.amount, 0, state.settings.notation),
        }),
      );
      await expectContextInsideViewport(page, viewport.width, [
        ["Space Telescope page", '[data-testid="space-mining-pane"]'],
        ["build quote", ".space-cost-list"],
        ["disabled build action", "#panel-space-mining button.primary-button"],
        ["localized material reason", "#telescope-build-reason"],
      ]);
      if (locale === "fr" && viewport.width === 320) {
        await page.mouse.move(0, 0);
        await page.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          window.scrollTo(0, 0);
        });
        await page.screenshot({
          path: "tests/e2e/space-telescope/e57-space-telescope-cost-fr-320.png",
          fullPage: true,
          animations: "disabled",
          caret: "hide",
        });
      }
    }
  }
});

test("Rocket part cost, precondition text, and Rocket 1-4 travel progress fit narrow screens in all locales @e57-space", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-rocket-part-shortfall");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-space-mining").click();
      await page.locator("#tab-space-mining-launch-pad").click();
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const rocketId: RocketId = "rocket1";
      const rocketState = state.run.space.rockets[rocketId];
      const massProduction =
        permanentPerkPurchaseCount(state.permanent.acquiredPerks, "launchPadMassProduction") +
        philosophyRepeatableRank(state, "launchPadMassProduction");
      const cost = rocketPartCost(rocketState.builtParts, massProduction);
      const rocket = page.getByTestId(`rocket-card-${rocketId}`);
      const quote = rocket.locator(".cost-line");
      await expect(quote).toContainText(rocketText(locale, "partCost"));
      await expect(quote).toContainText(
        formatCurrency(
          locale,
          cost.cash,
          state.settings.currencyId ?? "usd",
          0,
          state.settings.notation,
        ),
      );
      for (const material of cost.materials) {
        await expect(quote).toContainText(
          `${formatNumber(locale, material.amount, 0, state.settings.notation)} ${economyGoodName(locale, material.goodId)}`,
        );
      }
      const buildPart = rocket.getByRole("button", { name: rocketText(locale, "buildPart") });
      await expect(buildPart).toBeDisabled();
      await expect(buildPart).toHaveAttribute(
        "aria-describedby",
        "rocket-rocket1-part-cost rocket-rocket1-part-reason",
      );
      await expect(page.locator("#rocket-rocket1-part-reason")).toHaveText(
        spaceText(locale, "reasonInsufficientMaterial", {
          material: economyGoodName(locale, "steel"),
          amount: formatNumber(locale, 3_000, 0, state.settings.notation),
        }),
      );
      for (const id of ROCKET_IDS) {
        const rocketCost = rocketPartCost(state.run.space.rockets[id].builtParts, massProduction);
        const assemblyCard = page.getByTestId(`rocket-card-${id}`);
        const assemblyQuote = assemblyCard.locator(".cost-line");
        await expect(assemblyQuote).toContainText(rocketText(locale, "partCost"));
        for (const line of expectedCostLines(state, rocketCost)) {
          await expect(assemblyQuote).toContainText(line);
        }
      }
      await expectContextInsideViewport(page, viewport.width, [
        ...ROCKET_IDS.map(
          (id) =>
            [`Rocket ${id.slice(-1)} part card`, `[data-testid="rocket-card-${id}"]`] as const,
        ),
        ["Rocket part quote", `[data-testid="rocket-card-${rocketId}"] .cost-line`],
        ["disabled part action", `[data-testid="rocket-card-${rocketId}"] button`],
        ["part shortfall reason", "#rocket-rocket1-part-reason"],
      ]);
    }
  }

  // Each built rocket page exposes its own localized timer/progress context. The
  // full late-game fixture gives all four routes an active trip without mutation.
  await startFixture(page, "space-late-game");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-space-mining").click();
      for (const [index, rocketId] of ROCKET_IDS.entries()) {
        const tab = page.locator(`#tab-space-mining-rocket-${index + 1}`);
        await expect
          .poll(() => visibleTabLabel(tab))
          .toBe(rocketText(locale, "rocketLabel", { index: index + 1 }));
        await tab.click();
        const rocket = page.getByTestId(`rocket-card-${rocketId}`);
        const progress = rocket.getByRole("progressbar", {
          name: rocketText(locale, "outbound"),
          exact: true,
        });
        const countdown = rocket.getByTestId(`rocket-journey-countdown-${rocketId}`);
        await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText(
          rocketText(locale, "rocketLabel", { index: index + 1 }),
        );
        await expect(progress).toBeVisible();
        await expect(countdown).toContainText(
          rocketText(locale, "journeyTimeRemaining", { time: "" }).trim(),
        );
        await expectContextInsideViewport(page, viewport.width, [
          ["Space Mining page", '[data-testid="space-mining-pane"]'],
          [`Rocket ${index + 1} progress`, `[data-testid="rocket-card-${rocketId}"] progress`],
          [`Rocket ${index + 1} countdown`, `[data-testid="rocket-journey-countdown-${rocketId}"]`],
        ]);
      }
    }
  }
});
