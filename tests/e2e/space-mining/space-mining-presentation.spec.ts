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

interface SpaceMiningPageSnapshot {
  readonly tabVisible: boolean;
  readonly tabLabel: string;
  readonly parentHeadingCount: number;
  readonly titleCount: number;
  readonly titleText: string | null;
  readonly labelledBy: string | null;
  readonly artworkRowCount: number;
  readonly artworkCount: number;
  readonly artworkKinds: readonly string[];
  readonly titleFontSize: string | null;
  readonly geometry: {
    readonly paneLeft: number;
    readonly paneRight: number;
    readonly viewportWidth: number;
    readonly documentWidth: number;
    readonly controls: readonly {
      readonly name: string;
      readonly left: number;
      readonly right: number;
      readonly clientWidth: number;
      readonly scrollWidth: number;
    }[];
  };
  readonly content: {
    readonly visibleCardCount: number;
    readonly cardText: string;
    readonly telescopeCostLabels: readonly string[];
    readonly telescopeCostRows: number;
    readonly buildButtonNames: readonly string[];
    readonly launchPadCostLabels: readonly string[];
    readonly launchPadCostRows: number;
    readonly weatherOverviewVisible: boolean;
    readonly currentWeatherVisible: boolean;
    readonly weatherTimerText: string;
    readonly asteroidCount: number;
    readonly asteroidEntries: readonly string[];
    readonly antimatterUnlocked: boolean;
    readonly antimatterRateText: string;
    readonly antimatterBoostVisible: boolean;
    readonly antimatterBoostLabel: string | null;
  };
}

async function inspectSpaceMiningPage(
  page: Page,
  route: SpaceMiningPresentationRoute,
  locale: LocaleId,
): Promise<SpaceMiningPageSnapshot> {
  return page.evaluate(
    ({ tabId, parentHeadingLabel, telescopeCostLabel, launchPadCostLabel }) => {
      const visible = (candidate: Element | null): candidate is HTMLElement => {
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
      const text = (candidate: Element | null) => candidate?.textContent?.trim() ?? "";
      const tab = document.getElementById(tabId);
      const tabCopy = tab?.cloneNode(true) as HTMLElement | null;
      tabCopy?.querySelector(".attention-badge")?.remove();
      const pane = document.querySelector<HTMLElement>('[data-testid="space-mining-pane"]');
      if (!pane) throw new Error("Space Mining page pane was not mounted");

      const titles = Array.from(pane.querySelectorAll<HTMLElement>(".game-page-title")).filter(
        visible,
      );
      const artworkRows = Array.from(
        pane.querySelectorAll<HTMLElement>(".page-artwork-row"),
      ).filter(visible);
      const visibleCards = Array.from(
        pane.querySelectorAll<HTMLElement>("section.space-card"),
      ).filter(visible);
      const card = visibleCards[0] ?? null;
      const labelledList = (label: string) =>
        card &&
        Array.from(card.querySelectorAll<HTMLUListElement>("ul[aria-label]")).find(
          (list) => list.getAttribute("aria-label") === label,
        );
      const visibleButtons = card
        ? Array.from(card.querySelectorAll<HTMLButtonElement>("button")).filter(visible)
        : [];
      const buildButtonNames = visibleButtons.map(
        (button) => button.getAttribute("aria-label")?.trim() || button.innerText.trim(),
      );
      const telescopeList = labelledList(telescopeCostLabel);
      const launchPadList = labelledList(launchPadCostLabel);
      const state = window.miaplacidusTest?.getState();
      const paneRect = pane.getBoundingClientRect();
      const controls = Array.from(
        pane.querySelectorAll<HTMLElement>("button, input, select, textarea, [role='button']"),
      )
        .filter(visible)
        .map((control) => {
          const rect = control.getBoundingClientRect();
          const referencedName = control
            .getAttribute("aria-labelledby")
            ?.split(/\s+/)
            .map((id) => document.getElementById(id))
            .filter((reference): reference is HTMLElement => reference instanceof HTMLElement)
            .map((reference) =>
              (reference.innerText || reference.textContent || "").replace(/\s+/g, " ").trim(),
            )
            .filter(Boolean)
            .join(" ");
          const nativeLabel =
            control instanceof HTMLInputElement ||
            control instanceof HTMLSelectElement ||
            control instanceof HTMLTextAreaElement
              ? Array.from(control.labels ?? [])
                  .map((label) => label.innerText.replace(/\s+/g, " ").trim())
                  .filter(Boolean)
                  .join(" ")
              : "";
          const normalizeName = (name: string | null | undefined) =>
            (name ?? "").replace(/\s+/g, " ").trim();
          return {
            name:
              referencedName ||
              normalizeName(control.getAttribute("aria-label")) ||
              nativeLabel ||
              normalizeName(control.innerText) ||
              normalizeName(control.getAttribute("title")) ||
              "",
            left: rect.left,
            right: rect.right,
            clientWidth: control.clientWidth,
            scrollWidth: control.scrollWidth,
          };
        });

      return {
        tabVisible: visible(tab),
        tabLabel: tabCopy?.innerText.trim() ?? "",
        parentHeadingCount: Array.from(
          pane.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, [role='heading']"),
        ).filter(
          (heading) => visible(heading) && heading.textContent?.trim() === parentHeadingLabel,
        ).length,
        titleCount: titles.length,
        titleText: titles[0]?.innerText.trim() ?? null,
        labelledBy: pane.getAttribute("aria-labelledby"),
        artworkRowCount: artworkRows.length,
        artworkCount: artworkRows[0]
          ? artworkRows[0].querySelectorAll("[data-celestial-illustration]").length
          : 0,
        artworkKinds: artworkRows[0]
          ? Array.from(
              artworkRows[0].querySelectorAll<HTMLElement>("[data-celestial-illustration]"),
            ).map((illustration) => illustration.dataset.celestialIllustration ?? "")
          : [],
        titleFontSize: titles[0] ? getComputedStyle(titles[0]).fontSize : null,
        geometry: {
          paneLeft: paneRect.left,
          paneRight: paneRect.right,
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          controls,
        },
        content: {
          visibleCardCount: visibleCards.length,
          cardText: text(card),
          telescopeCostLabels: Array.from(
            card?.querySelectorAll<HTMLUListElement>("ul[aria-label]") ?? [],
          ).map((list) => list.getAttribute("aria-label") ?? ""),
          telescopeCostRows: telescopeList?.querySelectorAll("li").length ?? 0,
          buildButtonNames,
          launchPadCostLabels: Array.from(
            card?.querySelectorAll<HTMLUListElement>("ul[aria-label]") ?? [],
          ).map((list) => list.getAttribute("aria-label") ?? ""),
          launchPadCostRows: launchPadList?.querySelectorAll("li").length ?? 0,
          weatherOverviewVisible: visible(
            pane.querySelector('[data-testid="space-weather-overview"]'),
          ),
          currentWeatherVisible: visible(
            pane.querySelector('[data-testid="space-current-weather"]'),
          ),
          weatherTimerText: text(pane.querySelector('[data-testid="space-weather-timer"]')),
          asteroidCount: state?.run.space.asteroids.length ?? 0,
          asteroidEntries: Array.from(
            card?.querySelectorAll<HTMLElement>(".space-asteroid-entry") ?? [],
          )
            .filter(visible)
            .map((entry) => entry.innerText.trim()),
          antimatterUnlocked: state?.run.space.antimatterUnlocked ?? false,
          antimatterRateText: text(card?.querySelector('[data-testid="antimatter-rate"]') ?? null),
          antimatterBoostVisible: visible(
            card?.querySelector('[data-testid="antimatter-boost"]') ?? null,
          ),
          antimatterBoostLabel:
            card?.querySelector('[data-testid="antimatter-boost"]')?.getAttribute("aria-label") ??
            null,
        },
      };
    },
    {
      tabId: route.tabId,
      parentHeadingLabel: spaceText(locale, "title"),
      telescopeCostLabel: spaceText(locale, "telescopeCost"),
      launchPadCostLabel: rocketText(locale, "launchPadCost"),
    },
  );
}

function verifySpaceMiningPageContent(
  snapshot: SpaceMiningPageSnapshot,
  locale: LocaleId,
  contentKind: NonNullable<SpaceMiningPresentationRoute["contentKind"]>,
): void {
  const content = snapshot.content;
  expect(content.visibleCardCount, `${locale} ${contentKind} content card is visible`).toBe(1);

  if (contentKind === "telescope") {
    const costLabel = spaceText(locale, "telescopeCost");
    expect(content.telescopeCostLabels, `${locale} Telescope quote is visible`).toContain(
      costLabel,
    );
    expect(content.telescopeCostRows, `${locale} Telescope quote has cash/material rows`).toBe(4);
    expect(
      content.buildButtonNames.filter((name) => name === spaceText(locale, "telescopeBuild")),
      `${locale} Telescope build control`,
    ).toHaveLength(1);
  } else if (contentKind === "asteroids") {
    expect(
      content.asteroidCount,
      `${locale} Asteroids fixture has unlocked entries`,
    ).toBeGreaterThan(0);
    expect(content.asteroidEntries, `${locale} Asteroids renders every seeded entry`).toHaveLength(
      content.asteroidCount,
    );
    expect(content.asteroidEntries[0], `${locale} first asteroid entry is readable`).toContain(
      spaceText(locale, "asteroidDistance"),
    );
    expect(content.asteroidEntries[0]).toContain(spaceText(locale, "antimatterRemaining"));
  } else if (contentKind === "launch-pad") {
    expect(content.weatherOverviewVisible).toBe(true);
    expect(content.currentWeatherVisible).toBe(true);
    expect(content.weatherTimerText).toContain(spaceText(locale, "weatherChangesIn"));
    expect(content.launchPadCostLabels).toContain(rocketText(locale, "launchPadCost"));
    expect(content.launchPadCostRows, `${locale} Launch Pad quote rows`).toBe(4);
    expect(
      content.buildButtonNames.filter((name) => name === rocketText(locale, "buildLaunchPad")),
    ).toHaveLength(1);
  } else {
    expect(content.antimatterUnlocked, `${locale} Mining fixture is unlocked`).toBe(true);
    expect(content.cardText).toContain(spaceText(locale, "antimatterStored"));
    expect(content.antimatterRateText).toContain(spaceText(locale, "miningRate"));
    expect(content.antimatterBoostVisible, `${locale} Mining boost action`).toBe(true);
    expect(content.antimatterBoostLabel).toBe(spaceText(locale, "boostHold"));
  }
}

function verifySpaceMiningPageGeometry(
  snapshot: SpaceMiningPageSnapshot,
  locale: LocaleId,
  context: string,
): void {
  const { geometry } = snapshot;
  expect(
    geometry.documentWidth,
    `${context} document has no horizontal overflow`,
  ).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.controls.length, `${context} page renders visible controls`).toBeGreaterThan(0);
  for (const control of geometry.controls) {
    expect(control.name, `${locale} visible control has a name`).not.toBe("");
    expect(control.left, `${locale} ${control.name} stays inside the page`).toBeGreaterThanOrEqual(
      geometry.paneLeft - 1,
    );
    expect(control.right, `${locale} ${control.name} stays inside the page`).toBeLessThanOrEqual(
      geometry.paneRight + 1,
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
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);

    for (const theme of THEME_IDS) {
      await page.evaluate((nextTheme) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { themeId: nextTheme },
        });
      }, theme);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute(
        "data-theme",
        theme,
      );

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
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
          const expectedLabel = route.label(locale);
          await tab.click();
          const snapshot = await inspectSpaceMiningPage(page, route, locale);
          const context = `${locale} ${theme} ${route.tabId} at ${viewport.width}px`;
          expect(snapshot.tabVisible, `${locale} ${route.tabId} is available`).toBe(true);
          expect(snapshot.tabLabel, `${locale} ${route.tabId} label`).toBe(expectedLabel);
          expect(
            snapshot.parentHeadingCount,
            `${locale} ${route.tabId} has no duplicate Space Mining parent heading`,
          ).toBe(0);
          expect(snapshot.titleCount, `${locale} ${route.tabId} has one page title`).toBe(1);
          expect(snapshot.titleText, `${locale} ${route.tabId} title`).toBe(expectedLabel);
          expect(snapshot.labelledBy).toBe(route.tabId);
          expect(snapshot.artworkRowCount, `${locale} ${route.tabId} artwork row`).toBe(1);
          expect(snapshot.artworkCount, `${locale} ${route.tabId} illustration`).toBe(1);
          expect(snapshot.artworkKinds, `${locale} ${route.tabId} illustration`).toContain(
            route.artwork,
          );
          expect(snapshot.titleFontSize, `${context} title scale matches Hydrogen`).toBe(
            hydrogenTitleSize,
          );
          expect(snapshot.geometry.paneLeft, `${context} pane left`).toBeGreaterThanOrEqual(-1);
          expect(snapshot.geometry.paneRight, `${context} pane right`).toBeLessThanOrEqual(
            snapshot.geometry.viewportWidth + 1,
          );
          verifySpaceMiningPageGeometry(snapshot, locale, context);
          if (route.contentKind) {
            verifySpaceMiningPageContent(snapshot, locale, route.contentKind);
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
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute(
      "data-theme",
      themeId,
    );
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
          const viewport = document.querySelector<HTMLElement>(
            "[data-testid='technology-tree-viewport']",
          );
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
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute(
      "data-theme",
      themeId,
    );
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
    await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute(
      "data-theme",
      themeId,
    );
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
