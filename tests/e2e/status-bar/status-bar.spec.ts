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

async function startSpaceLateGameFixture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-late-game");
  await page.getByLabel("Pioneer name").fill("Status Layout Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState()))).toBe(true);
}

async function expectTopStatTooltip(
  page: import("@playwright/test").Page,
  testId: string,
  fullName: string,
) {
  const stat = page.getByTestId(testId);
  const value = stat.locator(".top-stat-value");
  await value.focus();
  await expect(stat.getByRole("tooltip")).toBeVisible();
  await expect(stat.getByRole("tooltip")).toContainText(fullName);
  await value.evaluate((element) => element.blur());
}

async function expectTooltipWithinViewport(
  page: import("@playwright/test").Page,
  stat: import("@playwright/test").Locator,
) {
  const tooltip = stat.getByRole("tooltip");
  const bounds = await tooltip.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewportWidth: window.innerWidth };
  });
  expect(bounds.left, `Tooltip extends left of ${bounds.viewportWidth}px viewport: ${JSON.stringify(bounds)}`).toBeGreaterThanOrEqual(0);
  expect(bounds.right, `Tooltip extends right of ${bounds.viewportWidth}px viewport: ${JSON.stringify(bounds)}`).toBeLessThanOrEqual(bounds.viewportWidth);
}

async function readFocusedTooltipBounds(
  page: import("@playwright/test").Page,
  testId: string,
) {
  const stat = page.getByTestId(testId);
  const focusTarget = stat.locator(".top-stat-value");
  await focusTarget.focus();
  const tooltip = stat.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const bounds = await tooltip.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      viewportWidth: window.innerWidth,
      text: element.textContent?.trim() ?? "",
    };
  });
  await focusTarget.evaluate((element) => element.blur());
  return bounds;
}

async function expectEveryVisibleStatKeyboardAccessible(page: import("@playwright/test").Page) {
  const stats = page.locator(
    ".global-context-bar .top-stat, .top-status-bar .top-stat, .top-status-bar .location-status",
  );
  for (const stat of await stats.all()) {
    const value = stat.locator("[tabindex='0'], button").first();
    await value.focus();
    await expect(stat.getByRole("tooltip")).toBeVisible();
    await expectTooltipWithinViewport(page, stat);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
    await value.evaluate((element) => element.blur());
  }
}

async function expectGlobalStatsFitWithTooltips(
  page: import("@playwright/test").Page,
  testIds: readonly string[],
) {
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    for (const testId of testIds) {
      const stat = page.getByTestId(testId);
      await expect(stat).toBeVisible();
      const value = stat.locator(".top-stat-value");
      await value.focus();
      await expect(stat.getByRole("tooltip")).toBeVisible();
      await expectTooltipWithinViewport(page, stat);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
      await value.evaluate((element) => element.blur());
    }
  }
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
  const globalContext = freshGame.getByTestId("global-context-bar");
  const runStats = freshGame.getByTestId("run-status-bar");
  await expect(globalContext).toBeVisible();
  await expect(runStats).toBeVisible();
  await expect(freshGame.getByTestId("global-stat-run-number")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-gp")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-ap")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-cp")).toHaveCount(0);
  const globalOrder = await globalContext.locator(":scope > *").evaluateAll((children) =>
    children.map((child) => child.getAttribute("data-testid")),
  );
  expect(globalOrder.indexOf("top-stat-gp")).toBeGreaterThanOrEqual(0);
  expect(globalOrder.indexOf("top-stat-ap")).toBeGreaterThan(globalOrder.indexOf("top-stat-gp"));
  const initialRunOrder = await runStats.locator(":scope > *").evaluateAll((children) =>
    children.map((child) => child.getAttribute("data-testid")),
  );
  expect(initialRunOrder.slice(0, 4)).toEqual([
    "location-status",
    "top-stat-time",
    "top-stat-cash",
    "top-stat-rp",
  ]);
  await expect(freshGame.getByTestId("cash-balance")).toBeVisible();
  await expect(freshGame.getByTestId("research-balance")).toBeVisible();
  await expectTopStatTooltip(freshGame, "top-stat-gp", "Galactic Points");
  await expectTopStatTooltip(freshGame, "top-stat-ap", "Ascendency Points");
  await expectTopStatTooltip(freshGame, "top-stat-cash", "Cash");
  await expectTopStatTooltip(freshGame, "top-stat-rp", "Research Points");
  await expectEveryVisibleStatKeyboardAccessible(freshGame);

  const accepted = await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "economy.building.purchase",
      buildingId: "scienceKit",
    }),
  );
  expect(accepted).toBe(true);
  const research = freshGame.getByTestId("research-balance");
  await expect(research.locator("xpath=..").locator(".top-stat-label")).toHaveText("RP");
  await research.focus();
  const researchTooltip = freshGame.getByTestId("top-stat-rp").getByRole("tooltip");
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
    const header = document.querySelector<HTMLElement>(".game-header");
    const eventCard = document.querySelector<HTMLElement>('[data-testid="top-stat-event"]');
    const eventTooltip = eventCard?.querySelector<HTMLElement>('[role="tooltip"]');
    if (!bar || !header || !eventCard || !eventTooltip)
      throw new Error("The status bar, header, or focused Event tooltip is missing");
    const barBounds = bar.getBoundingClientRect();
    const eventCardBounds = eventCard.getBoundingClientRect();
    const eventTooltipBounds = eventTooltip.getBoundingClientRect();
    const eventTooltipStyle = getComputedStyle(eventTooltip);
    const tooltips = Array.from(document.querySelectorAll<HTMLElement>(".top-stat-tooltip")).map(
      (tooltip) => {
        const bounds = tooltip.getBoundingClientRect();
        const style = getComputedStyle(tooltip);
        const owner = tooltip.closest<HTMLElement>("[data-testid]");
        const ownerBounds = owner?.getBoundingClientRect();
        return {
          owner: owner?.dataset.testid ?? null,
          ownerLeft: ownerBounds?.left ?? null,
          ownerRight: ownerBounds?.right ?? null,
          left: bounds.left,
          right: bounds.right,
          width: bounds.width,
          position: style.position,
          cssLeft: style.left,
          cssRight: style.right,
          minWidth: style.minWidth,
          maxWidth: style.maxWidth,
          visibility: style.visibility,
          opacity: style.opacity,
          hovered: owner?.matches(":hover") ?? false,
          focused: owner?.matches(":focus-within") ?? false,
          text: tooltip.textContent,
        };
      },
    );
    const chain = ["html", "body", "#root", "main", ".game-frame", ".game-header", ".top-status-bar"];
    const shellBounds = chain.map((selector) => {
      const element =
        selector === "html"
          ? document.documentElement
          : selector === "body"
            ? document.body
            : document.querySelector<HTMLElement>(selector);
      if (!element) return { selector, missing: true };
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        selector,
        left: bounds.left,
        right: bounds.right,
        width: bounds.width,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        styleWidth: style.width,
        minWidth: style.minWidth,
        maxWidth: style.maxWidth,
        boxSizing: style.boxSizing,
        marginLeft: style.marginLeft,
        marginRight: style.marginRight,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        position: style.position,
        transform: style.transform,
      };
    });
    const cards = Array.from(bar.children).map((card) => {
      const bounds = card.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right };
    });
    return {
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      shellBounds,
      barLeft: barBounds.left,
      barRight: barBounds.right,
      eventCard: {
        left: eventCardBounds.left,
        right: eventCardBounds.right,
        width: eventCardBounds.width,
      },
      eventTooltip: {
        left: eventTooltipBounds.left,
        right: eventTooltipBounds.right,
        width: eventTooltipBounds.width,
        text: eventTooltip.innerText,
        position: eventTooltipStyle.position,
        cssLeft: eventTooltipStyle.left,
        cssRight: eventTooltipStyle.right,
        minWidth: eventTooltipStyle.minWidth,
        maxWidth: eventTooltipStyle.maxWidth,
        overflowWrap: eventTooltipStyle.overflowWrap,
        whiteSpace: eventTooltipStyle.whiteSpace,
      },
      overflowingTooltips: tooltips.filter(
        (tooltip) => tooltip.left < 0 || tooltip.right > window.innerWidth,
      ),
      cards,
      headerChildren: Array.from(header.children).map((child) => {
        const element = child as HTMLElement;
        const bounds = element.getBoundingClientRect();
        return {
          testId: element.dataset.testid ?? null,
          className: element.className,
          left: bounds.left,
          right: bounds.right,
          width: bounds.width,
        };
      }),
      overflowingStatusChildren: Array.from(bar.children)
        .map((child) => {
          const element = child as HTMLElement;
          const bounds = element.getBoundingClientRect();
          return {
            testId: element.dataset.testid ?? null,
            left: bounds.left,
            right: bounds.right,
            width: bounds.width,
          };
        })
        .filter((child) => child.left < 0 || child.right > window.innerWidth),
    };
  });
  expect(
    layout.pageWidth,
    `Horizontal overflow at ${layout.viewportWidth}px; document/body widths ${layout.documentWidth}/${layout.documentClientWidth}, ${layout.bodyWidth}/${layout.bodyClientWidth}; event card: ${JSON.stringify(layout.eventCard)}; event tooltip: ${JSON.stringify(layout.eventTooltip)}; other tooltips outside viewport: ${JSON.stringify(layout.overflowingTooltips)}; shell: ${JSON.stringify(layout.shellBounds)}; header children: ${JSON.stringify(layout.headerChildren)}; status children beyond viewport: ${JSON.stringify(layout.overflowingStatusChildren)}`,
  ).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.barLeft).toBeGreaterThanOrEqual(0);
  expect(layout.barRight).toBeLessThanOrEqual(layout.viewportWidth);
  for (const card of layout.cards) {
    expect(card.left).toBeGreaterThanOrEqual(layout.barLeft);
    expect(card.right).toBeLessThanOrEqual(layout.barRight);
  }
  await expect(globalContext).toBeVisible();
});

test("reveals CP with the Galactic gate and exposes its full localized name @status-bar @meta-progression @locale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await expect(page.getByTestId("top-stat-ap")).toBeVisible();
  await expect(page.getByTestId("top-stat-cp")).toBeVisible();
  await expect(page.getByTestId("top-stat-gp")).toBeVisible();
  await expect(page.getByTestId("run-status-bar").getByTestId("top-stat-cp")).toBeVisible();
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectTopStatTooltip(
      page,
      "top-stat-ap",
      topStatusText(locale, "ascendencyPointsName"),
    );
    await expectTopStatTooltip(
      page,
      "top-stat-cp",
      topStatusText(locale, "casinoPointsName"),
    );
  }
});

test("keeps GP and AP in global order and CP in current-run stats after the Galactic gate @status-bar @meta-progression @locale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await expect(page.getByTestId("top-stat-gp")).toBeVisible();
  await expect(page.getByTestId("top-stat-ap")).toBeVisible();
  await expect(page.getByTestId("top-stat-cp")).toBeVisible();
  const balancesInOrder = await page.getByTestId("global-context-bar").locator(":scope > *").evaluateAll((children) =>
    children.map((balance) => balance.getAttribute("data-testid")),
  );
  expect(balancesInOrder.indexOf("top-stat-gp")).toBeGreaterThanOrEqual(0);
  expect(balancesInOrder.indexOf("top-stat-ap")).toBeGreaterThan(balancesInOrder.indexOf("top-stat-gp"));
  const runOrder = await page.getByTestId("run-status-bar").locator(":scope > *").evaluateAll((children) =>
    children.map((balance) => balance.getAttribute("data-testid")),
  );
  expect(runOrder.indexOf("top-stat-cp")).toBeGreaterThan(runOrder.indexOf("top-stat-rp"));
  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expectTopStatTooltip(
      page,
      "top-stat-ap",
      topStatusText(locale, "ascendencyPointsName"),
    );
    await expectTopStatTooltip(
      page,
      "top-stat-cp",
      topStatusText(locale, "casinoPointsName"),
    );
    await expectTopStatTooltip(
      page,
      "top-stat-gp",
      topStatusText(locale, "galacticPointsName"),
    );
  }
});

test("keeps localized current-run and whole-game stat order at 390px and 320px @status-bar @locale @presentation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  const globalContext = page.getByTestId("global-context-bar");
  const runStats = page.getByTestId("run-status-bar");
  const globalOrder = ["global-stat-run-number", "top-stat-gp", "top-stat-ap"];
  const currentRunOrder = [
    "location-status",
    "top-stat-time",
    "top-stat-cash",
    "top-stat-rp",
    "top-stat-cp",
    "top-stat-event",
  ];

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    for (const locale of LOCALE_IDS) {
      await setGameLocale(page, locale);

      await expect(globalContext).toHaveAttribute(
        "aria-label",
        topStatusText(locale, "globalContext"),
      );
      await expect(runStats).toHaveAttribute("aria-label", topStatusText(locale, "region"));
      await expect(globalContext.locator(":scope > *")).toHaveCount(globalOrder.length);
      await expect(runStats.locator(":scope > *")).toHaveCount(currentRunOrder.length);
      await expect
        .poll(() =>
          globalContext.locator(":scope > *").evaluateAll((children) =>
            children.map((child) => (child as HTMLElement).dataset.testid),
          ),
        )
        .toEqual(globalOrder);
      await expect
        .poll(() =>
          runStats.locator(":scope > *").evaluateAll((children) =>
            children.map((child) => (child as HTMLElement).dataset.testid),
          ),
        )
        .toEqual(currentRunOrder);

      await expect(globalContext.getByTestId("global-stat-run-number").locator(".top-stat-label"))
        .toHaveText(topStatusText(locale, "runNumber"));
      await expect(globalContext.getByTestId("top-stat-gp").locator(".top-stat-label")).toHaveText("GP");
      await expect(globalContext.getByTestId("top-stat-ap").locator(".top-stat-label")).toHaveText("AP");
      await expect(page.getByTestId("top-stat-time").locator(".top-stat-label")).toHaveText(
        topStatusText(locale, "time"),
      );
      await expect(page.getByTestId("top-stat-cash").locator(".top-stat-label")).toHaveText(
        topStatusText(locale, "cash"),
      );
      await expect(page.getByTestId("top-stat-rp").locator(".top-stat-label")).toHaveText("RP");
      await expect(page.getByTestId("top-stat-cp").locator(".top-stat-label")).toHaveText("CP");
      await expect(page.getByTestId("top-stat-event").locator(".top-stat-label")).toHaveText(
        topStatusText(locale, "eventStatusLabel"),
      );

      await expectTopStatTooltip(
        page,
        "global-stat-run-number",
        topStatusText(locale, "runNumber"),
      );
      await expectTopStatTooltip(page, "top-stat-gp", topStatusText(locale, "galacticPointsName"));
      await expectTopStatTooltip(page, "top-stat-ap", topStatusText(locale, "ascendencyPointsName"));
      await expectTopStatTooltip(page, "top-stat-cash", topStatusText(locale, "cash"));
      await expectTopStatTooltip(page, "top-stat-cp", topStatusText(locale, "casinoPointsName"));

      const timeStat = page.getByTestId("top-stat-time");
      await timeStat.locator(".top-stat-value").focus();
      const timeTooltip = timeStat.getByRole("tooltip");
      await expect(timeTooltip).toContainText(topStatusText(locale, "runDuration"));
      await expect(timeTooltip).toContainText(topStatusText(locale, "totalDuration"));
      await timeStat.locator(".top-stat-value").evaluate((element) => element.blur());

      const researchStat = page.getByTestId("top-stat-rp");
      await researchStat.locator(".top-stat-value").focus();
      const researchTooltip = researchStat.getByRole("tooltip");
      await expect(researchTooltip).toContainText(topStatusText(locale, "researchPointsName"));
      await expect(researchTooltip).toContainText(topStatusText(locale, "researchProduction"));
      await researchStat.locator(".top-stat-value").evaluate((element) => element.blur());

      const eventStat = page.getByTestId("top-stat-event");
      await expect(eventStat.locator(".top-stat-value")).toHaveText(topStatusText(locale, "eventNone"));
      await expectTopStatTooltip(page, "top-stat-event", topStatusText(locale, "eventNone"));

      const locationStat = page.getByTestId("location-status");
      const locationSummary = locationStat.locator(".location-status-summary");
      await locationSummary.focus();
      const locationTooltip = locationStat.getByRole("tooltip");
      await expect(locationTooltip).toContainText(topStatusText(locale, "weather"));
      await expect(locationTooltip).toContainText(topStatusText(locale, "precipitationRate"));
      await locationSummary.evaluate((element) => element.blur());

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
        `Horizontal document overflow at ${viewport.width}px in ${locale}.`,
      ).toBe(true);
    }
  }
});

test("shows each translated Runtime label in full on Diesel Compound at 1280px @status-bar @locale @presentation", async ({
  page,
}) => {
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("Status Runtime Labels");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.setViewportSize({ width: 1280, height: 720 });

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await page.locator("#tab-compounds").click();
    await page.locator("#tab-compounds-diesel").click();
    await page.evaluate(() => window.scrollTo(0, 0));
    const runtime = page.getByTestId("top-stat-time");
    const label = runtime.locator(".top-stat-label");
    await expect(label).toHaveText(topStatusText(locale, "time"));
    const layout = await runtime.evaluate((stat) => {
      const labelElement = stat.querySelector<HTMLElement>(".top-stat-label");
      const valueElement = stat.querySelector<HTMLElement>(".top-stat-value");
      if (!labelElement || !valueElement) throw new Error("Run Time label or value is missing.");
      const labelBounds = labelElement.getBoundingClientRect();
      const valueBounds = valueElement.getBoundingClientRect();
      const cardBounds = stat.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(labelElement);
      const textLines = Array.from(range.getClientRects()).map((rect) => ({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      }));
      return {
        label: labelElement.textContent?.trim() ?? "",
        labelBounds: {
          left: labelBounds.left,
          right: labelBounds.right,
          top: labelBounds.top,
          bottom: labelBounds.bottom,
          width: labelBounds.width,
          height: labelBounds.height,
        },
        valueBounds: { top: valueBounds.top, bottom: valueBounds.bottom },
        cardBounds: { top: cardBounds.top, bottom: cardBounds.bottom },
        textLines,
        labelScrollWidth: labelElement.scrollWidth,
        labelClientWidth: labelElement.clientWidth,
        labelScrollHeight: labelElement.scrollHeight,
        labelClientHeight: labelElement.clientHeight,
      };
    });
    expect(layout.textLines.length, `${locale}: label has no rendered text lines`).toBeGreaterThan(0);
    expect(
      layout.labelScrollWidth,
      `${locale}: Run Time label has horizontal text overflow: ${JSON.stringify(layout)}`,
    ).toBeLessThanOrEqual(layout.labelClientWidth + 1);
    expect(
      layout.labelScrollHeight,
      `${locale}: Run Time label is vertically clipped: ${JSON.stringify(layout)}`,
    ).toBeLessThanOrEqual(layout.labelClientHeight + 1);
    expect(
      layout.textLines.every(
        (line) =>
          line.left >= layout.labelBounds.left - 1 &&
          line.right <= layout.labelBounds.right + 1 &&
          line.top >= layout.labelBounds.top - 1 &&
          line.bottom <= layout.labelBounds.bottom + 1,
      ),
      `${locale}: one or more Run Time text lines extend outside the label box: ${JSON.stringify(layout)}`,
    ).toBe(true);
    expect(
      layout.valueBounds.top,
      `${locale}: Run Time value overlaps its label: ${JSON.stringify(layout)}`,
    ).toBeGreaterThanOrEqual(layout.labelBounds.bottom - 1);
    expect(
      layout.labelBounds.top,
      `${locale}: Run Time label escapes its card: ${JSON.stringify(layout)}`,
    ).toBeGreaterThanOrEqual(layout.cardBounds.top);
    expect(
      layout.valueBounds.bottom,
      `${locale}: Run Time value escapes its card: ${JSON.stringify(layout)}`,
    ).toBeLessThanOrEqual(layout.cardBounds.bottom + 1);
  }
});

test("wraps every localized status label without clipping or horizontal overflow @status-bar @locale @presentation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await expect(page.getByTestId("global-context-bar")).toBeVisible();
  await expect(page.getByTestId("run-status-bar")).toBeVisible();

  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    for (const locale of LOCALE_IDS) {
      await setGameLocale(page, locale);
      const labels = await page
        .locator(".global-context-bar .top-stat-label, .top-status-bar .top-stat-label")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const label = element as HTMLElement;
            const style = getComputedStyle(label);
            const bounds = label.getBoundingClientRect();
            return {
              stat: label.closest<HTMLElement>("[data-testid]")?.dataset.testid ?? "unknown",
              text: label.textContent?.trim() ?? "",
              left: bounds.left,
              right: bounds.right,
              whiteSpace: style.whiteSpace,
              textOverflow: style.textOverflow,
              overflow: style.overflow,
              scrollWidth: label.scrollWidth,
              clientWidth: label.clientWidth,
              scrollHeight: label.scrollHeight,
              clientHeight: label.clientHeight,
            };
          }),
        );
      expect(labels.length, `No status labels were rendered at ${viewport.width}px in ${locale}.`).toBeGreaterThan(0);
      const clippedLabels = labels.filter(
        (label) =>
          label.text.length === 0 ||
          label.whiteSpace === "nowrap" ||
          label.textOverflow === "ellipsis" ||
          label.overflow === "hidden" ||
          label.scrollWidth > label.clientWidth + 1 ||
          label.scrollHeight > label.clientHeight + 1,
      );
      expect(
        clippedLabels,
        `Status labels are clipped at ${viewport.width}px in ${locale}: ${JSON.stringify(clippedLabels)}`,
      ).toEqual([]);
      const documentFits = await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      );
      expect(
        documentFits,
        `Horizontal document overflow at ${viewport.width}px in ${locale}.`,
      ).toBe(true);
    }
  }
});

test("keeps global context borderless and preserves relative stat widths on desktop and phone @status-bar @presentation", async ({
  freshGame,
}) => {
  await startSpaceLateGameFixture(freshGame);

  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await freshGame.setViewportSize(viewport);
    const metrics = await freshGame.evaluate(() => {
      const context = document.querySelector<HTMLElement>(".global-context-bar");
      const run = document.querySelector<HTMLElement>(".top-status-bar");
      const header = document.querySelector<HTMLElement>(".game-header");
      if (!context || !run || !header) throw new Error("The status rows or game header are missing.");
      const contextStyle = getComputedStyle(context);
      const headerStyle = getComputedStyle(header);
      const contextBounds = context.getBoundingClientRect();
      const contextChildBounds = Array.from(context.children).map((child) =>
        child.getBoundingClientRect(),
      );
      const contextChildStyles = Array.from(context.children).map((child) => {
        const style = getComputedStyle(child);
        return {
          borders: [
            style.borderTopWidth,
            style.borderRightWidth,
            style.borderBottomWidth,
            style.borderLeftWidth,
          ],
          background: style.backgroundColor,
        };
      });

      const expectedIds = [
        "top-stat-time",
        "top-stat-cash",
        "top-stat-rp",
        "top-stat-energy",
        "top-stat-power",
        "top-stat-antimatter",
        "top-stat-event",
      ];
      const statWidths = new Map<string, number>();
      const probe = document.createElement("div");
      Object.assign(probe.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        display: "flex",
        flexWrap: "nowrap",
        gap: "0",
        width: `${run.clientWidth}px`,
        margin: "0",
        padding: "0",
        border: "0",
        visibility: "hidden",
      });
      probe.className = "top-status-bar";
      const baseline = document.createElement("div");
      baseline.className = "top-stat";
      probe.append(baseline);
      for (const id of expectedIds) {
        const source = run.querySelector<HTMLElement>(`[data-testid="${id}"]`);
        if (!source) throw new Error(`The ${id} status stat is missing.`);
        const clone = document.createElement("div");
        clone.className = "top-stat";
        clone.dataset.testid = id;
        clone.style.flex = `0 0 ${getComputedStyle(source).flexBasis}`;
        probe.append(clone);
      }
      document.body.append(probe);
      baseline.style.flex = `0 0 ${getComputedStyle(baseline).flexBasis}`;
      for (const id of expectedIds) {
        const item = probe.querySelector<HTMLElement>(`[data-testid="${id}"]`);
        if (!item) throw new Error(`The ${id} probe stat is missing.`);
        statWidths.set(id, item.getBoundingClientRect().width);
      }
      const baselineWidth = baseline.getBoundingClientRect().width;
      const renderedWidths = Object.fromEntries(
        expectedIds.map((id) => {
          const item = run.querySelector<HTMLElement>(`[data-testid="${id}"]`);
          if (!item) throw new Error(`The rendered ${id} status stat is missing.`);
          return [id, item.getBoundingClientRect().width];
        }),
      );
      probe.remove();
      const relativeWidths = Object.fromEntries(
        expectedIds.map((id) => [id, statWidths.get(id)! / baselineWidth]),
      );
      return {
        contextDisplay: contextStyle.display,
        contextWrap: contextStyle.flexWrap,
        contextBackground: contextStyle.backgroundColor,
        contextBorders: [
          contextStyle.borderTopWidth,
          contextStyle.borderRightWidth,
          contextStyle.borderBottomWidth,
          contextStyle.borderLeftWidth,
        ],
        contextChildStyles,
        contextWithinViewport:
          contextBounds.left >= 0 && contextBounds.right <= window.innerWidth,
        childrenWithinContext: contextChildBounds.every(
          (bounds) => bounds.left >= contextBounds.left && bounds.right <= contextBounds.right,
        ),
        childrenShareRow:
          contextChildBounds.every(
            (bounds) => Math.abs(bounds.top - contextChildBounds[0]!.top) <= 1,
          ),
        relativeWidths,
        statWidths: Object.fromEntries(statWidths),
        renderedWidths,
        baselineWidth,
        headerDisplay: headerStyle.display,
        headerDirection: headerStyle.flexDirection,
        headerBorders: [
          headerStyle.borderTopWidth,
          headerStyle.borderRightWidth,
          headerStyle.borderBottomWidth,
          headerStyle.borderLeftWidth,
        ],
        headerBackground: headerStyle.backgroundColor,
        pageWithinViewport: document.documentElement.scrollWidth <= window.innerWidth,
      };
    });

    expect(metrics.contextDisplay).toBe("flex");
    expect(metrics.contextWrap).toBe("nowrap");
    expect(metrics.contextBackground).toBe("rgba(0, 0, 0, 0)");
    expect(metrics.contextBorders).toEqual(["0px", "0px", "0px", "0px"]);
    expect(metrics.contextChildStyles.map((style) => style.borders)).toEqual(
      metrics.contextChildStyles.map(() => ["0px", "0px", "0px", "0px"]),
    );
    expect(metrics.contextChildStyles.map((style) => style.background)).toEqual(
      metrics.contextChildStyles.map(() => "rgba(0, 0, 0, 0)"),
    );
    expect(metrics.contextWithinViewport).toBe(true);
    expect(metrics.childrenWithinContext).toBe(true);
    expect(metrics.childrenShareRow).toBe(true);
    expect(metrics.headerDisplay).toBe("flex");
    expect(metrics.headerDirection).toBe("row");
    expect(metrics.headerBorders).toEqual(["0px", "0px", "0px", "0px"]);
    expect(metrics.headerBackground).toBe("rgba(0, 0, 0, 0)");
    expect(metrics.pageWithinViewport).toBe(true);
    console.log(
      "Status widths",
      JSON.stringify({
        viewport: viewport.width,
        baseline: metrics.baselineWidth,
        probeTime: metrics.statWidths["top-stat-time"],
        probeCash: metrics.statWidths["top-stat-cash"],
        renderedTime: metrics.renderedWidths["top-stat-time"],
        renderedCash: metrics.renderedWidths["top-stat-cash"],
      }),
    );
    for (const id of ["top-stat-time", "top-stat-cash"]) {
      expect(metrics.relativeWidths[id]).toBeCloseTo(0.5, 2);
    }
    for (const id of [
      "top-stat-rp",
      "top-stat-energy",
      "top-stat-power",
      "top-stat-antimatter",
    ]) {
      expect(metrics.relativeWidths[id]).toBeCloseTo(0.6, 2);
    }
    expect(metrics.relativeWidths["top-stat-event"]).toBeCloseTo(1.5, 2);
    await expectEveryVisibleStatKeyboardAccessible(freshGame);
    expect(
      await freshGame.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }

  await startMetaFixture(freshGame, "meta-megastructure-route");
  await expect(freshGame.getByTestId("global-stat-megastructure-progress")).toBeVisible();
  await expectGlobalStatsFitWithTooltips(freshGame, [
    "global-stat-run-number",
    "global-stat-megastructure-progress",
    "top-stat-gp",
    "top-stat-ap",
  ]);

  await freshGame.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await freshGame.getByLabel("Pioneer name").fill("Status Layout Philosophy Pioneer");
  await freshGame.getByTestId("start-game").click();
  await expect(freshGame.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => freshGame.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
  expect(
    await freshGame.evaluate(() => window.miaplacidusTest!.applyDebugAction("study-star")),
  ).toBe(true);
  await expect(freshGame.getByTestId("global-stat-philosophy")).toBeVisible();
  await expectGlobalStatsFitWithTooltips(freshGame, [
    "global-stat-run-number",
    "global-stat-philosophy",
    "top-stat-gp",
    "top-stat-ap",
  ]);
});

test("keeps phone status tooltips in view and fills each run-stat row at 390px and 320px @status-bar @presentation", async ({
  freshGame,
}) => {
  await startSpaceLateGameFixture(freshGame);

  const measurements = [];
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await freshGame.setViewportSize(viewport);
    const gpTooltip = await readFocusedTooltipBounds(freshGame, "top-stat-gp");
    const eventTooltip = await readFocusedTooltipBounds(freshGame, "top-stat-event");
    const rowMetrics = await freshGame.evaluate(() => {
      const bar = document.querySelector<HTMLElement>(".top-status-bar");
      const run = document.querySelector<HTMLElement>('[data-testid="top-stat-time"]');
      const cash = document.querySelector<HTMLElement>('[data-testid="top-stat-cash"]');
      if (!bar || !run || !cash) throw new Error("Required run stats are missing.");
      const barBounds = bar.getBoundingClientRect();
      const cards = Array.from(bar.children).map((child) => {
        const element = child as HTMLElement;
        const bounds = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          id: element.dataset.testid ?? null,
          x: bounds.left,
          width: bounds.width,
          top: bounds.top,
          flex: style.flex,
          flexGrow: style.flexGrow,
          flexBasis: style.flexBasis,
        };
      });
      const rows = new Map<number, Array<{ id: string | null; left: number; right: number }>>();
      for (const child of Array.from(bar.children)) {
        const element = child as HTMLElement;
        const bounds = element.getBoundingClientRect();
        const top = Math.round(bounds.top);
        const row = rows.get(top) ?? [];
        row.push({
          id: element.dataset.testid ?? null,
          left: bounds.left,
          right: bounds.right,
        });
        rows.set(top, row);
      }
      return {
        viewportWidth: window.innerWidth,
        bar: { left: barBounds.left, right: barBounds.right, width: barBounds.width },
        runtimeWidth: run.getBoundingClientRect().width,
        cashWidth: cash.getBoundingClientRect().width,
        cards,
        rows: Array.from(rows, ([top, children]) => ({
          top,
          children: children.map((child) => child.id),
          left: Math.min(...children.map((child) => child.left)),
          right: Math.max(...children.map((child) => child.right)),
        })),
      };
    });
    measurements.push({ ...rowMetrics, gpTooltip, eventTooltip });
  }

  console.log("Phone status row measurements", JSON.stringify(measurements));
  for (const measurement of measurements) {
    for (const tooltip of [measurement.gpTooltip, measurement.eventTooltip]) {
      expect(
        tooltip.left,
        `${measurement.viewportWidth}px tooltip extends left: ${JSON.stringify(tooltip)}`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        tooltip.right,
        `${measurement.viewportWidth}px tooltip extends right: ${JSON.stringify(tooltip)}`,
      ).toBeLessThanOrEqual(measurement.viewportWidth);
    }
    for (const row of measurement.rows) {
      expect(
        row.left,
        `${measurement.viewportWidth}px status row does not start at the bar edge: ${JSON.stringify(row)}`,
      ).toBeCloseTo(measurement.bar.left, 0);
      expect(
        row.right,
        `${measurement.viewportWidth}px status row does not fill the bar: ${JSON.stringify(row)}`,
      ).toBeCloseTo(measurement.bar.right, 0);
    }
  }
});
