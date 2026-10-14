import { expect, test, type Page } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import type { GameState } from "../../../src/engine/state";
import { antimatterMiningRatePerSecond } from "../../../src/engine/spaceMechanics";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText, type SpaceMessageKey } from "../../../src/i18n/spaceMessages";

const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const RARITY_KEYS = {
  common: "rarityCommon",
  uncommon: "rarityUncommon",
  rare: "rarityRare",
  legendary: "rarityLegendary",
} as const satisfies Record<
  GameState["run"]["space"]["asteroids"][number]["rarity"],
  SpaceMessageKey
>;

async function startAsteroidMiningFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-asteroid-mining");
  await page.getByLabel("Pioneer name").fill("E57 Space Mining Pioneer");
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

async function expectMiningReadoutsReflectLiveState(page: Page): Promise<void> {
  let lastComparison = "No Mining snapshot was captured.";
  try {
    await expect
      .poll(async () => {
        const snapshot = await page.evaluate(() => ({
          state: window.miaplacidusTest!.getState(),
          readouts: Array.from(
            document
              .querySelector<HTMLElement>('[data-testid="antimatter-rate"]')
              ?.closest("section")
              ?.querySelectorAll<HTMLElement>(".space-range-readout") ?? [],
          ).map((readout) => readout.innerText.replace(/\s+/g, " ").trim()),
        }));
        const state = snapshot.state as GameState;
        const locale = state.settings.locale;
        const expected = [
          `${spaceText(locale, "antimatterStored")}: ${formatNumber(locale, state.run.space.antimatter, 0, state.settings.notation)}`,
          `${spaceText(locale, "miningRate")}: ${formatNumber(locale, antimatterMiningRatePerSecond(state), 2, state.settings.notation)} /s`,
          `${spaceText(locale, "runMined")}: ${formatNumber(locale, state.run.space.antimatterMinedThisRun, 0, state.settings.notation)}`,
          `${spaceText(locale, "lifetimeMined")}: ${formatNumber(locale, state.statistics.lifetimeAntimatterMined, 0, state.settings.notation)}`,
        ];
        const matches =
          snapshot.readouts.length === expected.length &&
          snapshot.readouts.every((actual, index) => actual === expected[index]);
        lastComparison = JSON.stringify({ locale, actual: snapshot.readouts, expected });
        return matches;
      })
      .toBe(true);
  } catch (error) {
    throw new Error(`${String(error)}\n${lastComparison}`);
  }
}

async function captureWithoutHover(page: Page, path: string): Promise<void> {
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await expect(page.locator('[role="tooltip"]:visible')).toHaveCount(0);
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
}

test("Asteroid dynamic rows and Mining summary stay localized and in bounds at 390/320px @e57-space-mining-content", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startAsteroidMiningFixture(page);

  for (const locale of LOCALE_IDS) {
    await selectLocale(page, locale);
    for (const viewport of NARROW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-space-mining").click();
      await page.locator("#tab-space-mining-asteroids").click();
      await page.getByTestId("space-mining-asteroids-help-trigger").focus();
      await expect(page.getByTestId("space-mining-asteroids-help")).toContainText(
        spaceText(locale, "asteroidsHelp"),
      );
      await expect(page.getByTestId("space-mining-asteroids-help")).toContainText(
        spaceText(locale, "asteroidComplexityHelp"),
      );

      const state = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
      const asteroids = state.run.space.asteroids;
      expect(asteroids).toHaveLength(4);
      const asteroidCards = asteroids.map((asteroid) => {
        const card = page.getByTestId(`asteroid-${asteroid.id}`);
        return { asteroid, card };
      });
      for (const { asteroid, card } of asteroidCards) {
        await expect(card).toBeVisible();
        await expect(card).toContainText(spaceText(locale, RARITY_KEYS[asteroid.rarity]));
        await expect(card).toContainText(
          `${spaceText(locale, "asteroidDistance")}: ${formatNumber(locale, asteroid.distance, 0, state.settings.notation)}`,
        );
        await expect(card).toContainText(
          `${spaceText(locale, "antimatterRemaining")}: ${formatNumber(locale, asteroid.remainingAntimatter, 0, state.settings.notation)}`,
        );
        await expect(card).toContainText(
          `${spaceText(locale, "asteroidComplexity")}: ${formatNumber(locale, asteroid.extractionEase, 0, state.settings.notation)}`,
        );
        if (asteroid.reservedBy) {
          await expect(card).toContainText(
            spaceText(locale, "asteroidReserved", {
              rocket: rocketText(locale, "rocketLabel", {
                index: Number(asteroid.reservedBy.slice(-1)),
              }),
            }),
          );
        }
        if (asteroid.depleted)
          await expect(card).toContainText(spaceText(locale, "asteroidDepleted"));
      }

      const selectedAsteroid = asteroidCards[0]!;
      const nextAsteroid = asteroidCards[1]!;
      await selectedAsteroid.card.getByRole("button").click();
      await expect(selectedAsteroid.card.getByRole("button")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await nextAsteroid.card.getByRole("button").click();
      await expect(nextAsteroid.card.getByRole("button")).toHaveAttribute("aria-pressed", "true");
      await expect(selectedAsteroid.card.getByRole("button")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await expectContextInsideViewport(page, viewport.width, [
        ["Asteroids page", '[data-testid="space-mining-pane"]'],
        ...asteroids.flatMap(({ id }) => [
          [`Asteroid ${id} row`, `[data-testid="asteroid-${id}"]`] as const,
          [`Asteroid ${id} select action`, `[data-testid="asteroid-${id}"] button`] as const,
        ]),
      ]);
      if (locale === "fr" && viewport.width === 320) {
        await selectedAsteroid.card.getByRole("button").click();
        await captureWithoutHover(page, "tests/e2e/space-mining/e57-asteroids-fr-320.png");
      }

      await page.locator("#tab-space-mining-mining").click();
      await page.getByTestId("space-mining-mining-help-trigger").focus();
      await expect(page.getByTestId("space-mining-mining-help")).toContainText(
        spaceText(locale, "miningHeaderHelp"),
      );
      await expect(page.getByTestId("space-mining-mining-help")).toContainText(
        spaceText(locale, "miningLayoutHelp"),
      );
      const stateForMining = (await page.evaluate(() =>
        window.miaplacidusTest!.getState(),
      )) as GameState;
      const miningRate = antimatterMiningRatePerSecond(stateForMining);
      expect(miningRate).toBeGreaterThan(0);
      const boost = page.getByTestId("antimatter-boost");
      await expect(boost).toBeVisible();
      await expect(boost).toBeEnabled();
      await expect(boost).toHaveAttribute("aria-label", spaceText(locale, "boostHold"));
      await expect(boost).toHaveAttribute("aria-pressed", "false");
      await expect(page.getByTestId("antimatter-boost-reason")).toHaveCount(0);
      await expectMiningReadoutsReflectLiveState(page);
      await expectContextInsideViewport(page, viewport.width, [
        ["Mining page", '[data-testid="space-mining-pane"]'],
        [
          "stored Antimatter",
          '[data-testid="space-mining-pane"] .space-range-readout:nth-of-type(1)',
        ],
        ["Mining rate", '[data-testid="antimatter-rate"]'],
        ["Mining boost action", '[data-testid="antimatter-boost"]'],
      ]);

      if (locale === "en" && viewport.width === 390) {
        await boost.focus();
        await page.keyboard.down("Space");
        await expect(boost).toHaveAttribute("aria-pressed", "true");
        await expect
          .poll(() =>
            page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterBoostActive),
          )
          .toBe(true);
        await expectMiningReadoutsReflectLiveState(page);
        await page.keyboard.up("Space");
        await expect(boost).toHaveAttribute("aria-pressed", "false");
        await expect
          .poll(() =>
            page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterBoostActive),
          )
          .toBe(false);
      }
      if (locale === "fr" && viewport.width === 320) {
        await captureWithoutHover(page, "tests/e2e/space-mining/e57-mining-fr-320.png");
      }

      await page.locator("#tab-space-mining-launch-pad").click();
      await page.getByTestId("space-mining-launch-pad-help-trigger").focus();
      await expect(page.getByTestId("space-mining-launch-pad-help")).toContainText(
        rocketText(locale, "launchPadHelp"),
      );
    }
  }
});
