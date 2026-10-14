import { expect, test, type Page } from "../_harness/fixtures";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  FLEET_ENVOY_COST,
  PLAYER_FLEET_IDS,
  STARSHIP_MODULE_IDS,
  type SpacePurchaseCost,
} from "../../../src/content/space";
import { permanentPerkPurchaseCount } from "../../../src/content/economyRules";
import { createStarCatalogue } from "../../../src/content/starCatalogue";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { playerFleetBuildCost } from "../../../src/engine/fleetMechanics";
import { philosophyRepeatableRank } from "../../../src/engine/philosophy";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import { starshipModulePartCost } from "../../../src/engine/spaceRules";
import type { GameState } from "../../../src/engine/state";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starshipScanTokenText, starshipText } from "../../../src/i18n/starshipMessages";

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
  await page.getByLabel("Pioneer name").fill("E57 Interstellar Locale Pioneer");
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

async function visibleTabLabel(tab: ReturnType<Page["locator"]>): Promise<string> {
  return tab.evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
}

function expectedCostLines(state: GameState, cost: SpacePurchaseCost, digits: 0 | 2): string[] {
  const locale = state.settings.locale;
  return [
    formatCurrency(
      locale,
      cost.cash,
      state.settings.currencyId ?? "usd",
      digits,
      state.settings.notation,
    ),
    ...(cost.antimatter === undefined
      ? []
      : [
          `${formatNumber(locale, cost.antimatter, digits, state.settings.notation)} ${spaceText(locale, "antimatterStored")}`,
        ]),
    ...cost.materials.map(
      ({ goodId, amount }) =>
        `${formatNumber(locale, amount, digits, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
    ),
  ];
}

async function expectResponsiveBounds(
  page: Page,
  width: number,
  selectors: readonly (readonly [string, string])[],
): Promise<void> {
  const geometry = await page.evaluate((items) => {
    const getBounds = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing E-57 visible context: ${selector}`);
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right };
    };
    return {
      viewport: document.documentElement.clientWidth,
      document: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      elements: items.map(([name, selector]) => [name, getBounds(selector)] as const),
    };
  }, selectors);
  expect(geometry.viewport).toBe(width);
  expect(geometry.document, `${width}px page overflow`).toBeLessThanOrEqual(width);
  for (const [name, bounds] of geometry.elements) {
    expect(bounds.left, `${width}px ${name} left`).toBeGreaterThanOrEqual(-1);
    expect(bounds.right, `${width}px ${name} right`).toBeLessThanOrEqual(width + 1);
  }
}

test("Starship travel quote, confirmation modal, and Fleet purchase rows fit at 390/320px in all locales @e57-interstellar", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startFixture(page, "space-starship-ready");

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-interstellar").click();
      await page.locator("#tab-interstellar-star-map").click();
      const map = page.getByTestId("star-map-pane");
      await map.getByRole("searchbox", { name: starMapText(locale, "searchLabel") }).fill("Sirius");
      await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
      const selection = map.getByTestId("star-selection");
      const beforeRouteAction = await page.evaluate(() => window.miaplacidusTest!.getState());
      const siriusId = createStarCatalogue().find((star) => star.name === "Sirius")!.id;
      if (beforeRouteAction.run.space.starship.destinationSystemId !== siriusId) {
        await selection
          .getByRole("button", {
            name: new RegExp(`^${starshipText(locale, "setDestination")}: Sirius$`),
          })
          .click();
      }
      await page.locator("#tab-interstellar-starship").click();

      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const destinationId = state.run.space.starship.destinationSystemId;
      expect(destinationId).not.toBeNull();
      const plan = starshipTravelPlan(state, destinationId!);
      expect(plan).not.toBeNull();
      const travel = page.locator(".starship-travel-summary");
      const quote = travel.locator(".space-cost-list");
      await expect(quote.getByRole("listitem")).toHaveText([
        `${formatNumber(locale, plan!.distanceLy, 2, state.settings.notation)} ly`,
        `${starshipText(locale, "fuelCost")}: ${formatNumber(locale, plan!.antimatter, 2, state.settings.notation)}`,
      ]);
      const launch = travel.getByRole("button", {
        name: starshipText(locale, "launch"),
        exact: true,
      });
      await expect(launch).toBeEnabled();
      await expectResponsiveBounds(page, viewport.width, [
        ["Starship pane", '[data-testid="starship-pane"]'],
        ["travel quote", ".starship-travel-summary .space-cost-list"],
        ["launch action", ".starship-travel-summary button"],
      ]);

      await launch.click();
      const dialog = page.getByRole("dialog", {
        name: starshipText(locale, "pointOfNoReturnTitle"),
      });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(starshipText(locale, "pointOfNoReturn"));
      await expect(dialog).toContainText(
        `${formatNumber(locale, plan!.antimatter, 2, state.settings.notation)} ${spaceText(locale, "antimatterStored")}`,
      );
      await expect(
        dialog.getByRole("button", { name: starshipText(locale, "cancelLaunch") }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: starshipText(locale, "confirmLaunch") }),
      ).toBeVisible();
      await expectResponsiveBounds(page, viewport.width, [
        ["point-of-no-return modal", ".starship-launch-dialog"],
      ]);
      if (locale === "fr" && viewport.width === 390) {
        await page.mouse.move(0, 0);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: "tests/e2e/starship/e57-starship-launch-modal-fr-390.png",
          animations: "disabled",
          caret: "hide",
        });
      }
      await dialog.getByRole("button", { name: starshipText(locale, "cancelLaunch") }).click();
      await expect(dialog).toBeHidden();
      await expect(launch).toBeEnabled();
      expect(
        (await page.evaluate(() => window.miaplacidusTest!.getState())).run.space.starship.phase,
      ).toBe("unlaunched");

      await page.locator("#tab-interstellar-fleet-hangar").click();
      const hangar = page.getByTestId("starship-fleet-hangar");
      await expect(
        hangar.getByRole("heading", { name: starshipText(locale, "envoyTitle") }),
      ).toBeVisible();
      await expect(
        hangar.getByTestId("starship-envoy-build"),
      ).toBeVisible();
      await expect(hangar.locator(".space-cost-list").first().locator("li")).toHaveText(
        expectedCostLines(state, FLEET_ENVOY_COST, 2),
      );
      for (const fleetId of PLAYER_FLEET_IDS) {
        const cost = playerFleetBuildCost(state, fleetId);
        const card = hangar.getByTestId(`starship-fleet-${fleetId}`);
        await expect(card.locator(".space-cost-list li")).toHaveText(
          expectedCostLines(state, cost, 2),
        );
        await expect(
          card.getByRole("button", { name: starshipText(locale, "buildFleetShip"), exact: true }),
        ).toBeVisible();
      }
      await expectResponsiveBounds(page, viewport.width, [
        ["Fleet Hangar pane", '[data-testid="starship-pane"]'],
        ["Envoy cost and action", ".starship-fleet-hangar > .space-cost-list"],
        ["Fleet cards", ".starship-fleet-grid"],
      ]);
    }
  }
});

test("Colonise scan report and status rows fit at 390/320px in all locales @e57-interstellar", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship-scanning");
  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByTestId("starship-scan-system-button").click();
  await expect(starship.getByTestId("starship-scan-complete")).toBeVisible();

  const reportKeys = [
    "raceName",
    "civilization",
    "population",
    "threat",
    "defense",
    "attitude",
    "impression",
    "patience",
    "enemyFleets",
    "enemyFleetPower",
    "lifeformTraits",
    "anomalies",
  ] as const;
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-interstellar").click();
      const coloniseTab = page.locator("#tab-interstellar-colonise");
      await expect
        .poll(() => visibleTabLabel(coloniseTab))
        .toBe(starshipText(locale, "coloniseTabLabel"));
      await coloniseTab.click();
      const pane = page.getByTestId("starship-pane");
      const report = pane.getByTestId("starship-colonise-scan-report");
      await expect(report).toBeVisible();
      await expect(
        report.getByRole("heading", { name: starshipText(locale, "scanReport") }),
      ).toBeVisible();
      const reportLabels = await report.locator("dt").evaluateAll((labels) =>
        labels.map((label) => {
          const clone = label.cloneNode(true) as HTMLElement;
          clone.querySelectorAll("button").forEach((button) => button.remove());
          return clone.textContent?.trim().replace(/\s+/g, " ") ?? "";
        }),
      );
      expect(reportLabels).toEqual([
        starMapText(locale, "sortName"),
        starMapText(locale, "ascendency"),
        starMapText(locale, "weather"),
        ...reportKeys.map((key) => starshipText(locale, key)),
      ]);
      const readings = report.locator("dd");
      await expect(readings).toHaveCount(reportKeys.length + 3);
      for (let index = 3; index < reportKeys.length + 3; index += 1) {
        await expect(readings.nth(index)).not.toBeEmpty();
      }
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const encounter = state.run.space.systemEncounters.find(
        (item) => item.systemId === state.run.space.starship.destinationSystemId,
      );
      expect(encounter).toBeDefined();
      await expect(readings.nth(4)).toHaveText(
        starshipScanTokenText(locale, "civilization", encounter!.civilizationLevel),
      );
      await expect(readings.nth(5)).toHaveText(
        formatNumber(locale, encounter!.populationEstimate, 2, state.settings.notation),
      );
      await expect(readings.nth(6)).toHaveText(
        starshipScanTokenText(locale, "threat", encounter!.threatLevel),
      );
      await expect(readings.nth(7)).toHaveText(
        formatNumber(locale, encounter!.defenseRating, 2, state.settings.notation),
      );
      const diplomacy = pane.getByTestId("starship-diplomacy");
      await expect(diplomacy).toBeVisible();
      await expect(
        diplomacy.getByRole("heading", { name: starshipText(locale, "diplomacyTitle") }),
      ).toBeVisible();
      if (!state.run.space.fleetEnvoyBuilt) {
        await expect(diplomacy).toContainText(starshipText(locale, "diplomacyLocked"));
      }
      const diplomacyActions = [
        ["message", "sendMessage"],
        ["harmony", "seekHarmony"],
        ["bully", "bullyEnemy"],
        ["vassalize", "vassalizeEnemy"],
      ] as const;
      for (const [action, label] of diplomacyActions) {
        const button = diplomacy.getByTestId(`starship-diplomacy-${action}-button`);
        await expect(button).toHaveText(starshipText(locale, label));
        if (await button.isDisabled()) {
          const reasonId = await button.getAttribute("aria-describedby");
          expect(reasonId).toBeTruthy();
          await expect(diplomacy.locator(`[id="${reasonId}"]`)).not.toBeEmpty();
        }
      }
      await expectResponsiveBounds(page, viewport.width, [
        ["Colonise pane", '[data-testid="starship-pane"]'],
        ["scan report rows", '[data-testid="starship-colonise-scan-report"]'],
        ["diplomacy actions", '[data-testid="starship-diplomacy"]'],
      ]);
    }
  }
});

test("Starship module part quotes remain readable at 390/320px in all locales @e57-interstellar", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startFixture(page, "space-starship");
  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-interstellar").click();
      await page.locator("#tab-interstellar-starship").click();
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const elevatorPurchases =
        permanentPerkPurchaseCount(state.permanent.acquiredPerks, "spaceElevator") +
        philosophyRepeatableRank(state, "spaceElevator");
      for (const moduleId of STARSHIP_MODULE_IDS) {
        const module = state.run.space.starshipModules[moduleId];
        const cost = starshipModulePartCost(moduleId, module.builtParts, elevatorPurchases);
        const card = page.getByTestId(`starship-module-${moduleId}`);
        await expect(card).toBeVisible();
        await expect(card.locator(".space-cost-list li")).toHaveText(
          expectedCostLines(state, cost, 2),
        );
        await expect(
          card.getByRole("button", { name: starshipText(locale, "buildPart") }),
        ).toBeVisible();
      }
      await expectResponsiveBounds(page, viewport.width, [
        ["Starship pane", '[data-testid="starship-pane"]'],
        ["module grid", ".starship-module-grid"],
      ]);
    }
  }
});
