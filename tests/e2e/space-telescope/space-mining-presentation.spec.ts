import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import type { TestInfo } from "@playwright/test";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";

// Independent expected labels from Cosmic Forge localization.json. Keeping this
// literal map prevents the route test from validating the app against itself.
const SOURCE_SPACE_MINING_LABELS: Readonly<
  Record<LocaleId, { mining: string; telescope: string; asteroids: string; launchPad: string }>
> = {
  en: {
    mining: "Mining",
    telescope: "Space Telescope",
    asteroids: "Asteroids",
    launchPad: "Launch Pad",
  },
  es: {
    mining: "Minería",
    telescope: "Telescopio Espacial",
    asteroids: "Asteroides",
    launchPad: "Plataforma de Lanzamiento",
  },
  pt: {
    mining: "Mineração",
    telescope: "Telescópio Espacial",
    asteroids: "Asteroides",
    launchPad: "Plataforma de Lançamento",
  },
  de: {
    mining: "Bergbau",
    telescope: "Weltraumteleskop",
    asteroids: "Asteroiden",
    launchPad: "Startplattform",
  },
  it: {
    mining: "Estrazione",
    telescope: "Telescopio Spaziale",
    asteroids: "Asteroidi",
    launchPad: "Piattaforma di Lancio",
  },
  fr: {
    mining: "Extraction",
    telescope: "Télescope Spatial",
    asteroids: "Astéroïdes",
    launchPad: "Pas de Tir",
  },
};

const SPACE_MINING_CHILD_TAB_IDS = [
  "tab-space-mining-mining",
  "tab-space-mining-telescope",
  "tab-space-mining-asteroids",
  "tab-space-mining-launch-pad",
  "tab-space-mining-rocket-1",
  "tab-space-mining-rocket-2",
  "tab-space-mining-rocket-3",
  "tab-space-mining-rocket-4",
] as const;

const SPACE_MINING_SOURCE_OPTION_IDS = {
  "tab-space-mining-mining": "option8",
  "tab-space-mining-telescope": "option6",
  "tab-space-mining-asteroids": "option7",
  "tab-space-mining-launch-pad": "option1",
  "tab-space-mining-rocket-1": "option2",
  "tab-space-mining-rocket-2": "option3",
  "tab-space-mining-rocket-3": "option4",
  "tab-space-mining-rocket-4": "option5",
} as const;

const STANDARD_SPACE_MINING_TAB_IDS = [
  "tab-space-mining-telescope",
  "tab-space-mining-asteroids",
  "tab-space-mining-launch-pad",
] as const;

const MINING_SPACE_MINING_TAB_IDS = [
  "tab-space-mining-mining",
  "tab-space-mining-telescope",
  "tab-space-mining-launch-pad",
] as const;

interface SpaceMiningPresentationRoute {
  readonly tabId: string;
  readonly label: (locale: LocaleId) => string;
  readonly artwork: string;
  readonly contentKind?: "telescope" | "asteroids" | "launch-pad" | "mining";
}

const STANDARD_SPACE_MINING_ROUTES: readonly SpaceMiningPresentationRoute[] = [
  {
    tabId: "tab-space-mining-telescope",
    label: (locale) => SOURCE_SPACE_MINING_LABELS[locale].telescope,
    artwork: "radio-telescope",
    contentKind: "telescope",
  },
  {
    tabId: "tab-space-mining-asteroids",
    label: (locale) => SOURCE_SPACE_MINING_LABELS[locale].asteroids,
    artwork: "asteroid",
    contentKind: "asteroids",
  },
  {
    tabId: "tab-space-mining-launch-pad",
    label: (locale) => SOURCE_SPACE_MINING_LABELS[locale].launchPad,
    artwork: "rocket",
    contentKind: "launch-pad",
  },
];

const MINING_SPACE_MINING_ROUTES: readonly SpaceMiningPresentationRoute[] = [
  {
    tabId: "tab-space-mining-mining",
    label: (locale) => SOURCE_SPACE_MINING_LABELS[locale].mining,
    artwork: "asteroid",
    contentKind: "mining",
  },
];

const BUILT_ROCKET_ROUTES: readonly SpaceMiningPresentationRoute[] = [
  ...([1, 2, 3, 4] as const).map((index) => ({
    tabId: `tab-space-mining-rocket-${index}`,
    label: (locale: LocaleId) => rocketText(locale, "rocketLabel", { index }),
    artwork: "rocket",
  })),
];

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function startSpaceFixture(
  page: Page,
  fixture: "space-telescope" | "space-diplomacy" | "space-late-game",
  pioneerName: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261008&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneerName);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const dismissTutorial = page.getByRole("button", { name: "No thanks", exact: true });
  if (await dismissTutorial.isVisible()) await dismissTutorial.click();
}

async function revealAsteroids(page: Page): Promise<void> {
  await page.keyboard.press("NumpadSubtract");
  const debugMenu = page.getByTestId("debug-scenario-menu");
  await expect(debugMenu).toBeVisible();
  await debugMenu.getByTestId("debug-action-add-10-asteroids").click();
  await debugMenu.getByRole("button", { name: "Close" }).click();
  await page.locator("#tab-space-mining").click();
  await expect(page.locator("#tab-space-mining-asteroids")).toBeVisible();
}

async function visibleTabLabel(tab: ReturnType<Page["locator"]>): Promise<string> {
  return tab.evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector(".attention-badge")?.remove();
    return copy.innerText.trim();
  });
}

async function childNavigationToTitleGap(
  page: Page,
  paneId: string,
  titleSelector: string,
): Promise<number> {
  const navigation = page.locator(`#pane-${paneId} .pane-nav-scroll`);
  const title = page.locator(titleSelector);
  await expect(navigation, `${paneId} child navigation is visible`).toBeVisible();
  await expect(title, `${paneId} page title is visible`).toBeVisible();
  const nativeTitleSelector = titleSelector.replaceAll(":visible", "");
  return page.evaluate(
    ({ paneId: visiblePaneId, titleSelector: visibleTitleSelector }) => {
      const nav = document.querySelector(`#pane-${visiblePaneId} .pane-nav-scroll`);
      const visibleHeadings = Array.from(document.querySelectorAll(visibleTitleSelector)).filter(
        (element): element is HTMLElement => {
          if (!(element instanceof HTMLElement) || element.closest("[hidden]")) return false;
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return (
            bounds.width > 0 &&
            bounds.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden"
          );
        },
      );
      if (!(nav instanceof HTMLElement) || visibleHeadings.length !== 1) {
        throw new Error(`Could not measure child navigation/title spacing for ${visiblePaneId}`);
      }
      return visibleHeadings[0]!.getBoundingClientRect().top - nav.getBoundingClientRect().bottom;
    },
    { paneId, titleSelector: nativeTitleSelector },
  );
}

async function verifySpaceMiningPageContent(
  page: Page,
  locale: LocaleId,
  contentKind: NonNullable<SpaceMiningPresentationRoute["contentKind"]>,
): Promise<void> {
  const pane = page.getByTestId("space-mining-pane");
  const visibleCard = pane.locator("section.space-card:visible");
  await expect(visibleCard, `${locale} ${contentKind} content card is visible`).toHaveCount(1);

  if (contentKind === "telescope") {
    const costs = visibleCard.getByRole("list", { name: spaceText(locale, "telescopeCost") });
    await expect(costs, `${locale} Telescope quote is visible`).toBeVisible();
    await expect(
      costs.locator("li"),
      `${locale} Telescope quote has cash/material rows`,
    ).toHaveCount(4);
    await expect(
      visibleCard.getByRole("button", {
        name: spaceText(locale, "telescopeBuild"),
        exact: true,
      }),
      `${locale} Telescope build control`,
    ).toBeVisible();
  } else if (contentKind === "asteroids") {
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const asteroids = state.run.space.asteroids;
    expect(asteroids.length, `${locale} Asteroids fixture has unlocked entries`).toBeGreaterThan(0);
    const entries = visibleCard.locator(".space-asteroid-entry");
    await expect(entries, `${locale} Asteroids renders every seeded entry`).toHaveCount(
      asteroids.length,
    );
    await expect(entries.first(), `${locale} first asteroid entry is readable`).toContainText(
      spaceText(locale, "asteroidDistance"),
    );
    await expect(entries.first()).toContainText(spaceText(locale, "antimatterRemaining"));
  } else if (contentKind === "launch-pad") {
    await expect(pane.getByTestId("space-weather-overview")).toBeVisible();
    await expect(pane.getByTestId("space-current-weather")).toBeVisible();
    await expect(pane.getByTestId("space-weather-timer")).toContainText(
      spaceText(locale, "weatherChangesIn"),
    );
    const costs = visibleCard.getByRole("list", { name: rocketText(locale, "launchPadCost") });
    await expect(costs, `${locale} Launch Pad quote is visible`).toBeVisible();
    await expect(costs.locator("li"), `${locale} Launch Pad quote rows`).toHaveCount(4);
    await expect(
      visibleCard.getByRole("button", {
        name: rocketText(locale, "buildLaunchPad"),
        exact: true,
      }),
    ).toBeVisible();
  } else {
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.space.antimatterUnlocked, `${locale} Mining fixture is unlocked`).toBe(true);
    await expect(visibleCard).toContainText(spaceText(locale, "antimatterStored"));
    await expect(visibleCard.getByTestId("antimatter-rate")).toContainText(
      spaceText(locale, "miningRate"),
    );
    await expect(
      visibleCard.getByTestId("antimatter-boost"),
      `${locale} Mining boost action`,
    ).toBeVisible();
    await expect(visibleCard.getByTestId("antimatter-boost")).toHaveAttribute(
      "aria-label",
      spaceText(locale, "boostHold"),
    );
  }

  const geometry = await pane.evaluate((element) => {
    const paneRect = element.getBoundingClientRect();
    const visible = (candidate: Element): candidate is HTMLElement => {
      if (!(candidate instanceof HTMLElement) || candidate.closest("[hidden]")) return false;
      const rect = candidate.getBoundingClientRect();
      const style = getComputedStyle(candidate);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    };
    const controls = Array.from(
      element.querySelectorAll<HTMLElement>("button, input, select, textarea, [role='button']"),
    )
      .filter(visible)
      .map((control) => {
        const rect = control.getBoundingClientRect();
        return {
          name: control.getAttribute("aria-label") || control.innerText.trim(),
          left: rect.left,
          right: rect.right,
          clientWidth: control.clientWidth,
          scrollWidth: control.scrollWidth,
        };
      });
    return {
      pane: { left: paneRect.left, right: paneRect.right },
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      controls,
    };
  });
  expect(
    geometry.documentWidth,
    `${locale} document has no horizontal overflow`,
  ).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.controls.length, `${locale} page renders visible controls`).toBeGreaterThan(0);
  for (const control of geometry.controls) {
    expect(control.name, `${locale} visible control has a name`).not.toBe("");
    expect(control.left, `${locale} ${control.name} stays inside the page`).toBeGreaterThanOrEqual(
      geometry.pane.left - 1,
    );
    expect(control.right, `${locale} ${control.name} stays inside the page`).toBeLessThanOrEqual(
      geometry.pane.right + 1,
    );
    expect(control.left, `${locale} ${control.name} stays in the viewport`).toBeGreaterThanOrEqual(
      -1,
    );
    expect(control.right, `${locale} ${control.name} stays in the viewport`).toBeLessThanOrEqual(
      geometry.viewportWidth + 1,
    );
    expect(
      control.scrollWidth,
      `${locale} ${control.name} text is not clipped inside its control`,
    ).toBeLessThanOrEqual(control.clientWidth + 2);
  }
}

async function captureSpaceMiningPage(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const path = testInfo.outputPath(name);
  await page.screenshot({ path, fullPage: true, animations: "disabled", caret: "hide" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function verifySpaceMiningMatrix(
  page: Page,
  testInfo: TestInfo,
  routes: readonly SpaceMiningPresentationRoute[],
  expectedTabIds: readonly string[],
): Promise<void> {
  let checkedChildOrder = false;

  for (const locale of LOCALE_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-game-options").click();
    await page.locator("#settings-language").selectOption(locale);
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);

    for (const theme of THEME_IDS) {
      await page.locator("#tab-settings").click();
      await page.locator("#tab-settings-visual").click();
      await page.locator("#settings-theme").selectOption(theme);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await page.locator("#tab-hydrogen").click();
        const hydrogenTitleSize = await page
          .locator("#panel-resources-hydrogen .pane-heading h2")
          .evaluate((element) => getComputedStyle(element).fontSize);
        await page.locator("#tab-space-mining").click();
        const pane = page.getByTestId("space-mining-pane");
        await expect(pane).toBeVisible();

        if (!checkedChildOrder) {
          const childTabs = page.locator("#pane-space-mining .pane-nav [role='tab']");
          await expect(childTabs).toHaveCount(expectedTabIds.length);
          await expect
            .poll(() => childTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id)))
            .toEqual(expectedTabIds);
          await expect
            .poll(() =>
              childTabs.evaluateAll((tabs) =>
                tabs.map((tab) => [tab.id, tab.getAttribute("data-source-option-id")]),
              ),
            )
            .toEqual(
              expectedTabIds.map((tabId) => [
                tabId,
                SPACE_MINING_SOURCE_OPTION_IDS[
                  tabId as keyof typeof SPACE_MINING_SOURCE_OPTION_IDS
                ],
              ]),
            );
          checkedChildOrder = true;
        }

        for (const route of routes) {
          const tab = page.locator(`#${route.tabId}`);
          await expect(tab, `${locale} ${route.tabId} is available`).toBeVisible();
          const expectedLabel = route.label(locale);
          await expect.poll(() => visibleTabLabel(tab)).toBe(expectedLabel);
          await tab.click();
          await expect(
            pane.getByRole("heading", { name: spaceText(locale, "title"), exact: true }),
            `${locale} ${route.tabId} has no duplicate Space Mining parent heading`,
          ).toHaveCount(0);

          const title = pane.locator(".game-page-title:visible");
          await expect(title, `${locale} ${route.tabId} has one page title`).toHaveCount(1);
          await expect(title, `${locale} ${route.tabId} title`).toHaveText(expectedLabel);
          await expect(pane).toHaveAttribute("aria-labelledby", route.tabId);
          const artworkRow = pane.locator(".page-artwork-row:visible");
          await expect(artworkRow, `${locale} ${route.tabId} artwork row`).toHaveCount(1);
          await expect(
            artworkRow.locator(`[data-celestial-illustration='${route.artwork}']`),
            `${locale} ${route.tabId} illustration`,
          ).toHaveCount(1);
          const titleFontSize = await title.evaluate(
            (element) => getComputedStyle(element).fontSize,
          );

          const bounds = await pane.evaluate((element) => {
            const paneRect = element.getBoundingClientRect();
            return {
              paneLeft: paneRect.left,
              paneRight: paneRect.right,
              viewportWidth: document.documentElement.clientWidth,
              documentWidth: document.documentElement.scrollWidth,
            };
          });
          const context = `${locale} ${theme} ${route.tabId} at ${viewport.width}px`;
          expect(titleFontSize, `${context} title scale matches Hydrogen`).toBe(hydrogenTitleSize);
          expect(bounds.paneLeft, `${context} pane left`).toBeGreaterThanOrEqual(-1);
          expect(bounds.paneRight, `${context} pane right`).toBeLessThanOrEqual(
            bounds.viewportWidth + 1,
          );
          expect(bounds.documentWidth, `${context} document width`).toBeLessThanOrEqual(
            bounds.viewportWidth,
          );
          if (route.contentKind) {
            await verifySpaceMiningPageContent(page, locale, route.contentKind);
            const captureName =
              route.contentKind === "telescope" &&
              locale === "fr" &&
              theme === "terminal" &&
              viewport.width === 320
                ? "p56-space-mining-telescope-fr-terminal-320.png"
                : route.contentKind === "asteroids" &&
                    locale === "de" &&
                    theme === "light" &&
                    viewport.width === 390
                  ? "p56-space-mining-asteroids-de-light-390.png"
                  : route.contentKind === "launch-pad" &&
                      locale === "fr" &&
                      theme === "space" &&
                      viewport.width === 320
                    ? "p56-space-mining-launch-pad-fr-space-320.png"
                    : route.contentKind === "mining" &&
                        locale === "pt" &&
                        theme === "dark" &&
                        viewport.width === 1280
                      ? "p56-space-mining-mining-pt-dark-1280.png"
                      : null;
            if (captureName) await captureSpaceMiningPage(page, testInfo, captureName);
          }
        }
      }
    }
  }
}

test("Space Telescope, Asteroids, and Launch Pad content, art, and bounds fit all locales and themes @p56-space-mining-content @space-mining-presentation-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await startSpaceFixture(page, "space-telescope", "Space Mining Presentation Pioneer");
  await revealAsteroids(page);
  await verifySpaceMiningMatrix(
    page,
    testInfo,
    STANDARD_SPACE_MINING_ROUTES,
    STANDARD_SPACE_MINING_TAB_IDS,
  );
});

test("Mining content, identity, and bounds fit all locales and themes when antimatter is unlocked @p56-space-mining-content @space-mining-presentation-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await startSpaceFixture(page, "space-diplomacy", "Space Mining Presentation Matrix Pioneer");
  await verifySpaceMiningMatrix(
    page,
    testInfo,
    MINING_SPACE_MINING_ROUTES,
    MINING_SPACE_MINING_TAB_IDS,
  );
});

test("built Rocket 1-4 identity and bounds fit all locales and themes @space-mining-presentation-matrix", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await startSpaceFixture(page, "space-late-game", "Space Mining Presentation Matrix Pioneer");
  await verifySpaceMiningMatrix(page, testInfo, BUILT_ROCKET_ROUTES, SPACE_MINING_CHILD_TAB_IDS);
});

test("child navigation to title spacing is consistent across page groups @p65-layout-spacing", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-late-game", "Phase 6 Spacing Review Pioneer");
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  const sharedPageGap = await childNavigationToTitleGap(
    page,
    "space-mining",
    "#pane-space-mining .game-page-title:visible",
  );

  await page.locator("#tab-space-mining-rocket-1").click();
  const rocketGap = await childNavigationToTitleGap(
    page,
    "space-mining",
    "#pane-space-mining .game-page-title:visible",
  );
  expect(
    Math.abs(rocketGap - sharedPageGap),
    `Rocket 1 title gap (${rocketGap.toFixed(1)}px) matches Space Telescope (${sharedPageGap.toFixed(1)}px)`,
  ).toBeLessThanOrEqual(4);

  await page.locator("#tab-research").click();
  await page.locator("#tab-research-tech-tree").click();
  const researchGap = await childNavigationToTitleGap(
    page,
    "research",
    "#pane-research .game-page-title:visible",
  );
  expect(
    Math.abs(researchGap - sharedPageGap),
    `Tech Tree title gap (${researchGap.toFixed(1)}px) matches Space Telescope (${sharedPageGap.toFixed(1)}px)`,
  ).toBeLessThanOrEqual(4);

  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-summary").click();
  const energyGap = await childNavigationToTitleGap(
    page,
    "energy",
    "#pane-energy .game-page-title:visible",
  );
  expect(
    Math.abs(energyGap - sharedPageGap),
    `Energy Summary title gap (${energyGap.toFixed(1)}px) matches Space Telescope (${sharedPageGap.toFixed(1)}px)`,
  ).toBeLessThanOrEqual(4);

  // Resources and Compounds are already signed off. Keep their Hydrogen-style
  // title spacing aligned with the shared page gap while other page groups move.
  await page.locator("#tab-hydrogen").click();
  await page.locator("#tab-resources-hydrogen").click();
  const hydrogenGap = await childNavigationToTitleGap(
    page,
    "hydrogen",
    "#panel-resources-hydrogen .pane-heading h2:visible",
  );
  expect(
    Math.abs(hydrogenGap - sharedPageGap),
    `Hydrogen title gap (${hydrogenGap.toFixed(1)}px) remains aligned`,
  ).toBeLessThanOrEqual(4);

  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-diesel").click();
  const compoundGap = await childNavigationToTitleGap(
    page,
    "compounds",
    "#pane-compounds .pane-heading h2:visible",
  );
  expect(
    Math.abs(compoundGap - sharedPageGap),
    `Compound title gap (${compoundGap.toFixed(1)}px) remains aligned`,
  ).toBeLessThanOrEqual(4);
});

test("current Tech Tree and Space Mining pages have reviewable desktop and mobile visuals @p65-visual-review", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startSpaceFixture(page, "space-late-game", "Phase 6 Visual Review Pioneer");

  const setTheme = async (themeId: "terminal" | "dark" | "light") => {
    const accepted = await page.evaluate(
      (theme) =>
        window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { themeId: theme } }),
      themeId,
    );
    expect(accepted, `${themeId} theme applied for visual review`).toBe(true);
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
  };
  const capture = async (name: string) => {
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
    await expect(page).toHaveScreenshot(name, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.05,
    });
  };

  await page.setViewportSize({ width: 1280, height: 900 });
  await setTheme("terminal");
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-tech-tree").click();
  await expect(page.locator("#pane-research .game-page-title:visible")).toHaveText("Tech Tree");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect
    .poll(() =>
      page
        .getByTestId("technology-tree")
        .evaluate((tree) => tree.parentElement?.getBoundingClientRect().height ?? 0),
    )
    .toBeGreaterThan(0);
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const measure = () => {
          const viewport = document.querySelector<HTMLElement>("[data-testid='technology-tree-viewport']");
          const stage = document.querySelector<HTMLElement>(".technology-map-stage");
          const tree = document.querySelector<HTMLElement>("[data-testid='technology-tree']");
          if (!viewport || !stage || !tree) return null;
          return [
            viewport.getBoundingClientRect().height,
            stage.getBoundingClientRect().width,
            stage.getBoundingClientRect().height,
            tree.scrollWidth,
            tree.scrollHeight,
          ];
        };
        const first = measure();
        requestAnimationFrame(() => {
          const second = measure();
          requestAnimationFrame(() => {
            const third = measure();
            resolve(
              first !== null &&
                second !== null &&
                third !== null &&
                first.every((value, index) => value === second[index] && value === third[index]) &&
                third[2]! > 0,
            );
          });
        });
      }),
    null,
    { polling: "raf", timeout: 10_000 },
  );
  await capture("phase6-tech-tree-terminal-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await setTheme("light");
  const runName = page.locator(".run-name-label");
  await expect(runName).toHaveCSS("text-overflow", "ellipsis");
  const runNameWidth = await runName.evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(runNameWidth.scroll, "long pioneer names use the available header width").toBeGreaterThan(
    runNameWidth.client,
  );
  await capture("phase6-tech-tree-light-mobile.png");

  await page.setViewportSize({ width: 1280, height: 900 });
  await setTheme("dark");
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText(
    "Space Telescope",
  );
  await capture("phase6-space-telescope-dark-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await setTheme("terminal");
  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(page.locator("#pane-space-mining .game-page-title:visible")).toHaveText("Rocket 1");
  await capture("phase6-rocket-one-terminal-mobile.png");
});

test("Asteroids and Launch Pad have reviewable desktop and phone visuals @p65-visual-review @p66-visual-review", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startSpaceFixture(page, "space-telescope", "Phase 6 Standard Mining Review Pioneer");
  await revealAsteroids(page);

  const pane = page.getByTestId("space-mining-pane");
  const setTheme = async (themeId: "terminal" | "light") => {
    const accepted = await page.evaluate(
      (theme) =>
        window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { themeId: theme } }),
      themeId,
    );
    expect(accepted, `${themeId} theme applied for visual review`).toBe(true);
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
  };
  const capture = async (title: string, illustration: string, name: string) => {
    await expect(pane.locator(".game-page-title:visible")).toHaveText(title);
    await expect(
      pane.locator(`.page-artwork-row:visible [data-celestial-illustration='${illustration}']`),
    ).toBeVisible();
    await expect(pane.getByRole("heading", { name: "Space Mining", exact: true })).toHaveCount(0);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot(name, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.05,
    });
  };

  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await setTheme("terminal");
  await page.locator("#tab-space-mining-asteroids").click();
  await capture("Asteroids", "asteroid", "phase6-asteroids-terminal-desktop.png");
  await page.locator("#tab-space-mining-launch-pad").click();
  await capture("Launch Pad", "rocket", "phase6-launch-pad-terminal-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await setTheme("light");
  await page.locator("#tab-space-mining-asteroids").click();
  await capture("Asteroids", "asteroid", "phase6-asteroids-light-mobile.png");
  await page.locator("#tab-space-mining-launch-pad").click();
  await capture("Launch Pad", "rocket", "phase6-launch-pad-light-mobile.png");
});

test("Space Telescope has a reviewed phone state for its page title and artwork @p66-visual-review", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-telescope", "Phase 6 Telescope Phone Review Pioneer");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en", themeId: "light" },
    });
  });
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  const pane = page.getByTestId("space-mining-pane");
  await expect(pane.locator(".game-page-title:visible")).toHaveText("Space Telescope");
  await expect(
    pane.locator(".page-artwork-row:visible [data-celestial-illustration='radio-telescope']"),
  ).toBeVisible();
  await expect(pane.getByRole("heading", { name: "Space Mining", exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot("phase6-space-telescope-light-mobile.png", {
    fullPage: true,
    animations: "disabled",
    caret: "hide",
    maxDiffPixelRatio: 0.05,
  });
});

test("Mining has reviewable desktop and phone visuals @p65-visual-review @p66-visual-review", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startSpaceFixture(page, "space-diplomacy", "Phase 6 Mining Review Pioneer");

  const pane = page.getByTestId("space-mining-pane");
  const setTheme = async (themeId: "terminal" | "light") => {
    const accepted = await page.evaluate(
      (theme) =>
        window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { themeId: theme } }),
      themeId,
    );
    expect(accepted, `${themeId} theme applied for visual review`).toBe(true);
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
  };
  const capture = async (name: string) => {
    await expect(pane.locator(".game-page-title:visible")).toHaveText("Mining");
    await expect(
      pane.locator(".page-artwork-row:visible [data-celestial-illustration='asteroid']"),
    ).toBeVisible();
    await expect(pane.getByRole("heading", { name: "Space Mining", exact: true })).toHaveCount(0);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot(name, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.05,
    });
  };

  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await setTheme("terminal");
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-mining").click();
  await capture("phase6-mining-terminal-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await setTheme("light");
  await page.locator("#tab-space-mining-mining").click();
  await capture("phase6-mining-light-mobile.png");
});
