import {
  dismissTutorialOfferIfPresent,
  expect,
  test,
  type Page,
  type TestInfo,
} from "../_harness/fixtures";
import { confirmStarshipWarEntry } from "../_harness/war-mode";
import { GALAXY_SEED_DEFAULT, LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { THEME_IDS, type ThemeId } from "../../../src/content/themes";
import { createStarCatalogue, distanceBetweenStars } from "../../../src/content/starCatalogue";
import { starMapText } from "../../../src/i18n/starMapMessages";
import { starshipText, type StarshipMessageKey } from "../../../src/i18n/starshipMessages";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

const VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

type Fixture =
  | "space-starship"
  | "space-starship-ready"
  | "space-battle-victory"
  | "space-battle-defeat";

type ColoniseState = "idle" | "in-progress" | "victory" | "defeat";

async function startFixture(page: Page, fixture: Fixture, pioneer: string): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.getState === "function"))
    .toBe(true);
  await dismissTutorialOfferIfPresent(page);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

async function setPresentation(page: Page, locale: LocaleId, theme: ThemeId): Promise<void> {
  await page.evaluate(
    ({ nextLocale, nextTheme }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      }),
    { nextLocale: locale, nextTheme: theme },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);
}

async function openInterstellarPage(page: Page, pageId: "starship" | "colonise"): Promise<void> {
  await page.locator("#tab-interstellar").click();
  await page.locator(`#tab-interstellar-${pageId}`).click();
  await expect(page.getByTestId("starship-pane")).toBeVisible();
}

async function assertContentAndControlBounds(
  page: Page,
  width: number,
  context: string,
  requireControls = true,
) {
  const pane = page.getByTestId("starship-pane");
  const geometry = await pane.evaluate((element) => {
    const paneRect = element.getBoundingClientRect();
    const visible = (candidate: HTMLElement) => {
      const style = getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        candidate.closest("[hidden]") === null &&
        !candidate.classList.contains("sr-only")
      );
    };
    const controls = Array.from(
      element.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, progress, [role="button"]',
      ),
    )
      .filter(visible)
      .map((control) => ({
        tag: control.tagName.toLowerCase(),
        name: (
          control.getAttribute("aria-label") ??
          control.getAttribute("placeholder") ??
          control.innerText ??
          control.textContent ??
          ""
        )
          .replace(/\s+/g, " ")
          .trim(),
        left: control.getBoundingClientRect().left,
        right: control.getBoundingClientRect().right,
        clientWidth: control.clientWidth,
        scrollWidth: control.scrollWidth,
      }));
    const copy = Array.from(
      element.querySelectorAll<HTMLElement>(
        'h2, h3, h4, p, li, dt, dd, [data-testid^="starship-module-"]',
      ),
    )
      .filter(visible)
      .map((text) => ({
        text: text.innerText.replace(/\s+/g, " ").trim(),
        left: text.getBoundingClientRect().left,
        right: text.getBoundingClientRect().right,
        clientWidth: text.clientWidth,
        scrollWidth: text.scrollWidth,
      }))
      .filter((text) => text.text.length > 0);
    return {
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      paneLeft: paneRect.left,
      paneRight: paneRect.right,
      paneClientWidth: element.clientWidth,
      paneScrollWidth: element.scrollWidth,
      controls,
      copy,
    };
  });

  expect(geometry.viewportWidth, `${context} viewport width`).toBe(width);
  expect(geometry.documentWidth, `${context} document horizontal overflow`).toBeLessThanOrEqual(
    width,
  );
  expect(geometry.paneLeft, `${context} pane left edge`).toBeGreaterThanOrEqual(-1);
  expect(geometry.paneRight, `${context} pane right edge`).toBeLessThanOrEqual(width + 1);
  expect(geometry.paneScrollWidth, `${context} pane content width`).toBeLessThanOrEqual(
    geometry.paneClientWidth + 2,
  );
  if (requireControls) {
    expect(geometry.controls.length, `${context} visible controls`).toBeGreaterThan(0);
  }

  for (const control of geometry.controls) {
    expect(control.name, `${context} ${control.tag} accessible/visible name`).not.toBe("");
    expect(control.left, `${context} ${control.name} left edge`).toBeGreaterThanOrEqual(
      geometry.paneLeft - 1,
    );
    expect(control.right, `${context} ${control.name} right edge`).toBeLessThanOrEqual(
      Math.min(geometry.paneRight, width) + 1,
    );
    expect(
      control.scrollWidth,
      `${context} ${control.name} internal horizontal clipping`,
    ).toBeLessThanOrEqual(control.clientWidth + 2);
  }

  for (const text of geometry.copy) {
    expect(text.left, `${context} copy “${text.text}” left edge`).toBeGreaterThanOrEqual(
      geometry.paneLeft - 1,
    );
    expect(text.right, `${context} copy “${text.text}” right edge`).toBeLessThanOrEqual(
      Math.min(geometry.paneRight, width) + 1,
    );
    expect(text.scrollWidth, `${context} copy clipping “${text.text}”`).toBeLessThanOrEqual(
      text.clientWidth + 2,
    );
  }
}

async function captureReviewedState(
  page: Page,
  testInfo: TestInfo,
  state: string,
  locale: LocaleId,
  theme: ThemeId,
  width: number,
): Promise<void> {
  if (locale !== "fr" || theme !== "terminal" || width !== 390) return;
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await captureVisualCheckpoint(page, testInfo, `p56-${state}-terminal-fr-390`);
}

async function visitPresentationMatrix(
  page: Page,
  testInfo: TestInfo,
  stateName: string,
  checkContent: (locale: LocaleId, theme: ThemeId, width: number) => Promise<void>,
): Promise<void> {
  for (const locale of LOCALE_IDS) {
    for (const theme of THEME_IDS) {
      await setPresentation(page, locale, theme);
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        const context = `${stateName}, ${locale}, ${theme}, ${viewport.width}px`;
        await checkContent(locale, theme, viewport.width);
        await assertContentAndControlBounds(
          page,
          viewport.width,
          context,
          stateName !== "starship-orbit",
        );
        await captureReviewedState(page, testInfo, stateName, locale, theme, viewport.width);
      }
    }
  }
}

async function prepareTravel(page: Page): Promise<string> {
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const current = catalogue.find(
    (star) =>
      star.id === state.run.space.currentSystemId ||
      star.name.toLocaleLowerCase("en") === state.run.space.currentSystemId.toLocaleLowerCase("en"),
  );
  expect(current, "fixture current star exists in the stable catalogue").toBeDefined();
  const destination = catalogue
    .filter((star) => star.id !== current!.id && star.accessGate === null)
    .map((star) => ({ star, distance: distanceBetweenStars(current!, star) }))
    .filter(({ distance }) => distance > 0 && distance <= state.run.space.starStudyRange)
    .sort((left, right) => right.distance - left.distance)[0]?.star;
  expect(
    destination,
    "fixture has a selectable far destination for a long travel state",
  ).toBeDefined();

  await page.locator("#tab-interstellar").click();
  await page.locator("#tab-interstellar-star-map").click();
  const map = page.getByTestId("star-map-pane");
  await map
    .getByRole("searchbox", { name: starMapText("en", "searchLabel") })
    .fill(destination!.name);
  await map
    .locator(".star-map-search-results button")
    .filter({ hasText: destination!.name })
    .click();
  const selection = map.getByTestId("star-selection");
  const setDestination = selection.getByRole("button");
  await expect(setDestination).toHaveCount(1);
  await setDestination.click();

  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: starshipText("en", "launch"), exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: starshipText("en", "pointOfNoReturnTitle"),
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: starshipText("en", "confirmLaunch") }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");
  return destination!.name;
}

async function prepareColoniseBattle(page: Page, state: ColoniseState): Promise<void> {
  await openInterstellarPage(page, "colonise");
  const starship = page.getByTestId("starship-pane");
  if (state === "idle") return;

  await confirmStarshipWarEntry(starship);
  await expect(starship.getByTestId("starship-war-mode")).toBeVisible();
  await starship.getByTestId("starship-battle-engage-button").click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe("inProgress");

  if (state === "in-progress") return;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const phase = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
    );
    if (phase !== "inProgress") break;
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  }
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.systemEncounters[0]?.battle.phase,
      ),
    )
    .toBe(state);
}

async function assertStarshipHeader(page: Page, locale: LocaleId, status: string): Promise<void> {
  const starship = page.getByTestId("starship-pane");
  await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "title"));
  await expect(starship.getByTestId("starship-readiness")).toHaveText(status);
}

async function assertColoniseReport(page: Page, locale: LocaleId): Promise<void> {
  const report = page.getByTestId("starship-colonise-scan-report");
  await expect(report).toBeVisible();
  await expect(report.getByRole("heading")).toHaveText(starshipText(locale, "scanReport"));
  await expect(report.locator("dl dt")).toHaveCount(15);
  await expect(report.locator("dl dd")).toHaveCount(15);
  const readings = await report.locator("dl dd").allTextContents();
  expect(readings.every((reading) => reading.trim().length > 0)).toBe(true);
  await expect(page.getByTestId("starship-diplomacy")).toBeVisible();
  await expect(page.getByTestId("starship-battle")).toBeVisible();
}

async function assertColoniseTooltips(page: Page, locale: LocaleId, width: number): Promise<void> {
  const tooltips = [
    ["starship-scan-civilization-help", "scanCivilizationHelp"],
    ["starship-scan-threat-help", "scanThreatHelp"],
    ["starship-scan-defense-help", "scanDefenseHelp"],
    ["starship-scan-enemy-fleets-help", "scanEnemyFleetsHelp"],
  ] as const satisfies readonly (readonly [string, StarshipMessageKey])[];
  const viewportHeight = page.viewportSize()!.height;

  for (const [testId, messageKey] of tooltips) {
    const trigger = page.getByTestId(`${testId}-trigger`);
    const tooltip = page.getByTestId(testId);
    await expect(trigger).toBeVisible();
    await trigger.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(starshipText(locale, messageKey));
    const bounds = await tooltip.boundingBox();
    expect(bounds, `${locale} ${testId} tooltip has bounds`).not.toBeNull();
    expect(bounds!.x, `${locale} ${width}px ${testId} left`).toBeGreaterThanOrEqual(11);
    expect(bounds!.x + bounds!.width, `${locale} ${width}px ${testId} right`).toBeLessThanOrEqual(
      width - 11,
    );
    expect(bounds!.y, `${locale} ${width}px ${testId} top`).toBeGreaterThanOrEqual(11);
    expect(bounds!.y + bounds!.height, `${locale} ${width}px ${testId} bottom`).toBeLessThanOrEqual(
      viewportHeight + 1,
    );
    const tooltipWidth = await tooltip.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(
      tooltipWidth.scrollWidth,
      `${locale} ${width}px ${testId} text wrapping`,
    ).toBeLessThanOrEqual(tooltipWidth.clientWidth + 2);
  }
  await page.mouse.move(0, 0);
}

test("Starship construction content and controls fit every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-starship", "P56 Starship Construction Matrix");
  await openInterstellarPage(page, "starship");
  await visitPresentationMatrix(page, testInfo, "starship-construction", async (locale) => {
    const starship = page.getByTestId("starship-pane");
    await assertStarshipHeader(page, locale, starshipText(locale, "building"));
    await expect(
      starship.getByText(starshipText(locale, "description"), { exact: true }),
    ).toBeVisible();
    const modules = starship.locator(".starship-module-grid .starship-module-card");
    await expect(modules).not.toHaveCount(0);
    for (const module of await modules.all()) {
      await expect(module.locator("h3")).toBeVisible();
      await expect(module.locator(".space-rocket-parts")).toBeVisible();
      await expect(module.getByRole("button")).toBeVisible();
    }
  });
});

test("Starship ready content and launch affordance fit every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-starship-ready", "P56 Starship Ready Matrix");
  await openInterstellarPage(page, "starship");
  await visitPresentationMatrix(page, testInfo, "starship-ready", async (locale) => {
    const starship = page.getByTestId("starship-pane");
    await assertStarshipHeader(page, locale, starshipText(locale, "ready"));
    const summary = starship.locator(".starship-travel-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(starshipText(locale, "noDestination"));
    await expect(
      summary.getByRole("button", { name: starshipText(locale, "launch"), exact: true }),
    ).toBeDisabled();
  });
});

test("Starship travel status, countdown, and progress fit every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-starship-ready", "P56 Starship Travel Matrix");
  await openInterstellarPage(page, "starship");
  const destinationName = await prepareTravel(page);
  await visitPresentationMatrix(page, testInfo, "starship-travel", async (locale) => {
    const starship = page.getByTestId("starship-pane");
    await assertStarshipHeader(
      page,
      locale,
      starshipText(locale, "travelling", { name: destinationName }),
    );
    await expect(starship.getByTestId("starship-feedback")).toHaveText(
      starshipText(locale, "travelling", { name: destinationName }),
    );
    const summary = starship.locator(".starship-travel-summary");
    await expect(summary).toContainText(destinationName);
    await expect(starship.getByTestId("starship-journey-countdown")).toBeVisible();
    const progress = starship.getByTestId("starship-travel-progress");
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute("aria-label", starshipText(locale, "journeyProgress"));
    await expect(progress).toHaveAttribute("max", "100");
  });
});

test("Starship orbit content fits every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-battle-victory", "P56 Starship Orbit Matrix");
  await openInterstellarPage(page, "starship");
  await visitPresentationMatrix(page, testInfo, "starship-orbit", async (locale) => {
    const starship = page.getByTestId("starship-pane");
    await assertStarshipHeader(page, locale, starshipText(locale, "orbiting", { name: "Sirius" }));
    await expect(starship.getByTestId("starship-system-scan")).toBeVisible();
    await expect(starship.getByTestId("starship-scan-complete")).toContainText(
      starshipText(locale, "scanComplete"),
    );
  });
});

test("Colonise idle report, diplomacy controls, and tooltips fit every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-battle-victory", "P56 Colonise Idle Matrix");
  await prepareColoniseBattle(page, "idle");
  await visitPresentationMatrix(page, testInfo, "colonise-idle", async (locale, _theme, width) => {
    const starship = page.getByTestId("starship-pane");
    await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "colonise"));
    await expect(starship.getByTestId("starship-readiness")).toHaveText(
      starshipText(locale, "orbiting", { name: "Sirius" }),
    );
    await assertColoniseReport(page, locale);
    await expect(starship.getByTestId("starship-battle-status")).toHaveText(
      starshipText(locale, "battleidle"),
    );
    await expect(starship.getByTestId("starship-enter-war-button")).toHaveText(
      starshipText(locale, "enterWar"),
    );
    await assertColoniseTooltips(page, locale, width);
  });
});

test("Colonise in-progress battle content and controls fit every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-battle-victory", "P56 Colonise Battle Matrix");
  await prepareColoniseBattle(page, "in-progress");
  await visitPresentationMatrix(page, testInfo, "colonise-in-progress", async (locale) => {
    const starship = page.getByTestId("starship-pane");
    await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "colonise"));
    await assertColoniseReport(page, locale);
    await expect(starship.getByTestId("starship-war-mode")).toHaveText(
      starshipText(locale, "warModeActive"),
    );
    const battle = starship.getByTestId("starship-battle");
    await expect(battle.getByTestId("starship-battle-status")).toContainText(
      starshipText(locale, "battleinProgress"),
    );
    await expect(battle.locator("dt")).toHaveText([
      starshipText(locale, "playerBattleHealth"),
      starshipText(locale, "enemyBattleHealth"),
    ]);
    await expect(battle.locator("dd")).toHaveCount(2);
    await expect(battle.getByTestId("starship-battle-engage-button")).toHaveCount(0);
  });
});

test("Colonise victory status and settlement control fit every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-battle-victory", "P56 Colonise Victory Matrix");
  await prepareColoniseBattle(page, "victory");
  await visitPresentationMatrix(page, testInfo, "colonise-victory", async (locale) => {
    const starship = page.getByTestId("starship-pane");
    await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "colonise"));
    await assertColoniseReport(page, locale);
    await expect(starship.getByTestId("starship-battle-status")).toContainText(
      starshipText(locale, "battlevictory"),
    );
    await expect(starship.getByTestId("starship-settle-system-button")).toHaveText(
      starshipText(locale, "settleSystem"),
    );
    await expect(starship.getByTestId("starship-settle-system-button")).toBeEnabled();
  });
});

test("Colonise defeat status and settlement reason fit every locale, theme, and viewport @p56-interstellar-content @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(1_200_000);
  await startFixture(page, "space-battle-defeat", "P56 Colonise Defeat Matrix");
  await prepareColoniseBattle(page, "defeat");
  await visitPresentationMatrix(page, testInfo, "colonise-defeat", async (locale) => {
    const starship = page.getByTestId("starship-pane");
    await expect(starship.locator("#starship-title")).toHaveText(starshipText(locale, "colonise"));
    await assertColoniseReport(page, locale);
    await expect(starship.getByTestId("starship-battle-status")).toContainText(
      starshipText(locale, "battledefeat"),
    );
    await expect(starship.locator("#starship-settle-reason")).toHaveText(
      starshipText(locale, "settlementUnavailable"),
    );
    await expect(starship.getByTestId("starship-enter-war-button")).toHaveText(
      starshipText(locale, "enterWar"),
    );
  });
});
