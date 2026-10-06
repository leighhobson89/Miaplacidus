import { expect, test, type Page } from "../_harness/fixtures";

const DEBUG_ACTION_IDS = [
  "set-language",
  "timewarp",
  "trigger-event",
  "prepare-run-starship-launch",
  "clear-weather",
  "give-1b",
  "give-100",
  "give-1b-all-resources-compounds",
  "give-1m-all-resources-compounds",
  "give-1m-research",
  "grant-all-techs",
  "add-10-asteroids",
  "study-star",
  "build-launch-pad-scanner-rockets",
  "gain-10000-antimatter",
  "add-100-ap",
  "unlock-all-tabs",
  "add-fleets-envoy",
  "build-starship",
  "hold-enter-to-gain",
  "add-10000-cp",
  "reset-gp-spent",
  "play-miaplacidus-cinematic",
  "play-end-game-cinematic",
  "set-news-ticker",
] as const;

async function openDebugMenu(page: Page) {
  await page.keyboard.press("NumpadSubtract");
  const dialog = page.getByTestId("debug-scenario-menu");
  await expect(dialog).toBeVisible();
  return dialog;
}

test("opens and closes with NumpadSubtract and guards an editable control @debug-menu", async ({
  freshGame,
}) => {
  const dialog = freshGame.getByTestId("debug-scenario-menu");
  await expect(dialog).toBeHidden();

  await openDebugMenu(freshGame);
  await freshGame.keyboard.press("NumpadSubtract");
  await expect(dialog).toBeHidden();

  const testLab = freshGame.locator("dialog.debug-tools:not(.debug-scenario-menu)");
  await freshGame.keyboard.press("NumpadAdd");
  await expect(testLab).toBeVisible();
  await expect(dialog).toBeHidden();
  await freshGame.keyboard.press("NumpadSubtract");
  await expect(dialog).toBeVisible();
  await expect(testLab).toBeHidden();
  await freshGame.keyboard.press("NumpadSubtract");
  await expect(dialog).toBeHidden();

  await openDebugMenu(freshGame);
  const language = dialog.getByTestId("debug-control-set-language");
  await language.focus();
  await freshGame.keyboard.press("NumpadSubtract");
  await expect(dialog).toBeVisible();
});

test("applies selected timewarp, event, clear weather and news through visible controls @debug-menu", async ({
  freshGame,
}) => {
  const dialog = await openDebugMenu(freshGame);
  await dialog.getByTestId("debug-control-timewarp-duration").selectOption("20000");
  await dialog.getByTestId("debug-control-timewarp-multiplier").selectOption("200");
  await dialog.getByTestId("debug-action-timewarp").click();
  await expect
    .poll(() => freshGame.evaluate(() => window.miaplacidusTest!.getState().run.timeWarp))
    .toEqual({ multiplier: 200, remainingMs: 20_000 });

  await dialog.getByTestId("debug-action-give-1m-research").click();
  const beforeResearch = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.researchPoints,
  );
  const beforeVisibleResearch = await freshGame.getByTestId("research-balance").innerText();
  await dialog.getByTestId("debug-control-trigger-event").selectOption("researchBreakthrough");
  await expect(dialog.getByTestId("debug-action-trigger-event")).toBeEnabled();
  await dialog.getByTestId("debug-action-trigger-event").click();
  await expect
    .poll(() =>
      freshGame.evaluate(
        () => window.miaplacidusTest!.getState().run.randomEvents.history.at(-1)?.id,
      ),
    )
    .toBe("researchBreakthrough");
  await expect
    .poll(() => freshGame.evaluate(() => window.miaplacidusTest!.getState().run.researchPoints))
    .toBe(beforeResearch * 2);
  await expect(freshGame.getByTestId("research-balance")).not.toHaveText(beforeVisibleResearch);

  await dialog.getByTestId("debug-action-clear-weather").click();
  await expect
    .poll(() =>
      freshGame.evaluate(() => {
        const space = window.miaplacidusTest!.getState().run.space;
        return [
          space.currentSystemWeather,
          space.severeWeatherPeriodCount,
          space.currentPrecipitationRate,
        ];
      }),
    )
    .toEqual(["clear", 0, 0]);
  await expect(freshGame.getByTestId("top-location-weather")).toHaveText(/clear/i);

  await dialog.getByTestId("debug-control-set-news-ticker-category").selectOption("wackyEffects");
  await dialog.getByTestId("debug-control-set-news-ticker-interval").selectOption("20000");
  await dialog.getByTestId("debug-action-set-news-ticker").click();
  await expect
    .poll(() =>
      freshGame.evaluate(
        () => window.miaplacidusTest!.getState().run.newsTicker.entries.at(-1)?.category,
      ),
    )
    .toBe("wacky");
  await expect
    .poll(() =>
      freshGame.evaluate(() => window.miaplacidusTest!.getState().run.newsTicker.remainingMs),
    )
    .toBe(20_000);
  const newsId = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.newsTicker.entries.at(-1)!.id,
  );
  await expect(freshGame.getByTestId("news-ticker")).toHaveAttribute(
    "data-news-id",
    String(newsId),
  );
  await expect(freshGame.getByTestId("news-ticker")).toHaveText(/\S+/);
});

test("explains an unavailable event without allowing it to run @debug-menu", async ({
  freshGame,
}) => {
  const dialog = await openDebugMenu(freshGame);
  const eventControl = dialog.getByTestId("debug-control-trigger-event");
  await expect(eventControl.locator('option[value="starshipLostInSpace"]')).toHaveText(
    /unavailable/i,
  );
  await eventControl.selectOption("starshipLostInSpace");
  await expect(dialog.getByTestId("debug-action-trigger-event")).toBeDisabled();
  await expect(dialog.getByTestId("debug-reason-trigger-event")).toBeVisible();
  await expect(dialog.getByTestId("debug-reason-trigger-event")).toHaveText(/\S+/);
});

test("shows all source actions, disabled reasons, locale selection and a working grant @debug-menu", async ({
  freshGame,
}) => {
  const dialog = await openDebugMenu(freshGame);
  await expect(dialog.locator('[data-testid^="debug-action-"]')).toHaveCount(25);
  await expect(dialog.locator(".debug-scenario-row")).toHaveCount(25);
  for (const id of DEBUG_ACTION_IDS) {
    await expect(dialog.getByTestId(`debug-action-${id}`)).toBeVisible();
  }

  for (const id of ["play-miaplacidus-cinematic", "play-end-game-cinematic"] as const) {
    await expect(dialog.getByTestId(`debug-action-${id}`)).toBeDisabled();
    const reason = dialog.getByTestId(`debug-reason-${id}`);
    await expect(reason).toBeVisible();
    await expect(reason).toHaveText(/\S+/);
  }

  const tickerCategory = dialog.getByTestId("debug-control-set-news-ticker-category");
  const feedbackOption = tickerCategory.locator("option").filter({ hasText: /Feedback/i });
  await expect(feedbackOption).toHaveCount(1);
  await expect(feedbackOption).toHaveAttribute("disabled", "");
  const feedbackReason = dialog.getByTestId("debug-reason-set-news-ticker-feedback");
  await expect(feedbackReason).toBeVisible();
  await expect(feedbackReason).toHaveText(/\S+/);

  await dialog.getByTestId("debug-control-set-language").selectOption("es");
  await dialog.getByTestId("debug-action-set-language").click();
  await expect(freshGame.locator("html")).toHaveAttribute("lang", "es");
  await expect(dialog.getByRole("status")).toHaveText("Escenario aplicado.");

  const researchBalance = freshGame.getByTestId("research-balance");
  const previousVisibleBalance = await researchBalance.innerText();
  const previousResearchPoints = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.researchPoints,
  );
  await dialog.getByTestId("debug-action-give-1m-research").click();
  await expect
    .poll(() => freshGame.evaluate(() => window.miaplacidusTest!.getState().run.researchPoints))
    .toBe(previousResearchPoints + 1_000_000);
  await expect(researchBalance).not.toHaveText(previousVisibleBalance);
});

test("localizes the visible menu and immediate language confirmation in all six locales @debug-menu @localization", async ({
  freshGame,
}) => {
  const dialog = await openDebugMenu(freshGame);
  const examples = [
    {
      locale: "en",
      title: "Debug Scenario Menu",
      languageAction: "Set language",
      apply: "Apply",
      confirmation: "Scenario applied.",
    },
    {
      locale: "es",
      title: "Menú de escenarios de depuración",
      languageAction: "Cambiar idioma",
      apply: "Aplicar",
      confirmation: "Escenario aplicado.",
    },
    {
      locale: "pt",
      title: "Menu de cenários de depuração",
      languageAction: "Definir idioma",
      apply: "Aplicar",
      confirmation: "Cenário aplicado.",
    },
    {
      locale: "de",
      title: "Debug-Szenariomenü",
      languageAction: "Sprache festlegen",
      apply: "Anwenden",
      confirmation: "Szenario angewendet.",
    },
    {
      locale: "it",
      title: "Menu degli scenari di debug",
      languageAction: "Imposta lingua",
      apply: "Applica",
      confirmation: "Scenario applicato.",
    },
    {
      locale: "fr",
      title: "Menu des scénarios de débogage",
      languageAction: "Choisir la langue",
      apply: "Appliquer",
      confirmation: "Scénario appliqué.",
    },
  ];
  for (const example of examples) {
    await dialog.getByTestId("debug-control-set-language").selectOption(example.locale);
    await dialog.getByTestId("debug-action-set-language").click();
    await expect(freshGame.locator("html")).toHaveAttribute("lang", example.locale);
    const heading = dialog.locator(".debug-titlebar strong");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(example.title);
    await expect(dialog).toHaveAttribute("aria-label", example.title);
    await expect(dialog.getByText(example.languageAction, { exact: true })).toBeVisible();
    await expect(dialog.getByTestId("debug-action-set-language")).toHaveText(example.apply);
    await expect(dialog.getByRole("status")).toHaveText(example.confirmation);
  }
});

test("keeps localized event controls inside their row at desktop and narrow widths @debug-menu", async ({
  freshGame,
}) => {
  for (const sample of [
    { width: 1366, height: 900, theme: "terminal", locale: "en" },
    { width: 390, height: 844, theme: "dark", locale: "de" },
    { width: 320, height: 740, theme: "light", locale: "fr" },
  ]) {
    await freshGame.setViewportSize({ width: sample.width, height: sample.height });
    await freshGame.locator("#tab-settings").click();
    await freshGame.locator("#tab-settings-visual").click();
    await freshGame.getByTestId("theme-selector").selectOption(sample.theme);
    await freshGame.locator("#tab-hydrogen").click();
    const dialog = await openDebugMenu(freshGame);
    await dialog.getByTestId("debug-control-set-language").selectOption(sample.locale);
    await dialog.getByTestId("debug-action-set-language").click();
    await expect(freshGame.locator("html")).toHaveAttribute("lang", sample.locale);
    const geometry = await dialog.getByTestId("debug-control-trigger-event").evaluate((control) => {
      const select = control.getBoundingClientRect();
      const row = control.closest(".debug-scenario-controls")!.getBoundingClientRect();
      const menu = control.closest("dialog")!.getBoundingClientRect();
      return {
        selectLeft: select.left,
        selectRight: select.right,
        rowLeft: row.left,
        rowRight: row.right,
        menuRight: menu.right,
      };
    });
    expect(
      geometry.selectLeft,
      `${sample.width}px ${sample.locale} event select starts within its controls`,
    ).toBeGreaterThanOrEqual(geometry.rowLeft - 1);
    expect(
      geometry.selectRight,
      `${sample.width}px ${sample.locale} event select fits its controls`,
    ).toBeLessThanOrEqual(geometry.rowRight + 1);
    expect(
      geometry.selectRight,
      `${sample.width}px ${sample.locale} event select fits its dialog`,
    ).toBeLessThanOrEqual(geometry.menuRight + 1);
    await freshGame.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("does not open the scenario menu for the legacy pioneer name @debug-menu", async ({
  page,
}) => {
  await page.goto("/?testSeed=314159&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Test1981");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await expect(page.getByTestId("debug-scenario-menu")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.pioneerName))
    .toBe("Test1981");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        return {
          researched: state.run.economy.researchedTechnologies,
          anyBuiltModules: Object.values(state.run.space.starshipModules).some(
            (module) => module.builtParts > 0,
          ),
          ascendencyPoints: state.permanent.ascendencyPoints,
          casinoPoints: state.permanent.galacticCasino.casinoPoints,
        };
      }),
    )
    .toEqual({ researched: [], anyBuiltModules: false, ascendencyPoints: 0, casinoPoints: 0 });
});
