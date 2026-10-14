import { expect, test } from "../_harness/fixtures";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { displayCurrency } from "../../../src/engine/precision";
import { rocketText } from "../../../src/i18n/rocketMessages";

async function startLateGame(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-late-game");
  await page.getByLabel("Pioneer name").fill("P13 Outbound Rocket");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function expectNarrowBounds(
  page: import("@playwright/test").Page,
  width: number,
): Promise<void> {
  const selectors = [
    ["Space Mining pane", '[data-testid="space-mining-pane"]'],
    ["Cash balance", '[data-testid="top-stat-cash"]'],
    ["Antimatter balance", '[data-testid="top-stat-antimatter"]'],
    ["Rocket card", '[data-testid="rocket-card-rocket1"]'],
    ["journey countdown", '[data-testid="rocket-journey-countdown-rocket1"]'],
    ["journey progress", '[data-testid="rocket-card-rocket1"] .space-survey-progress'],
  ] as const;
  const bounds = await page.evaluate((items) => {
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Expected visible trip-context element: ${selector}`);
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    };
    return {
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      elements: items.map(([name, selector]) => [name, rect(selector)] as const),
    };
  }, selectors);
  expect(bounds.documentWidth, `${width}px document width`).toBeLessThanOrEqual(width);
  for (const [name, rect] of bounds.elements) {
    expect(rect.left, `${width}px ${name} left edge`).toBeGreaterThanOrEqual(-1);
    expect(rect.right, `${width}px ${name} right edge`).toBeLessThanOrEqual(width + 1);
  }
}

test("outbound Rocket route, balances, ETA, and progress fit at 390px and 320px @p13-space-mining-rocket-travel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startLateGame(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();

  const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
  const rocketState = stateBefore.run.space.rockets.rocket1;
  expect(rocketState.phase).toBe("outbound");
  const destination = stateBefore.run.space.asteroids.find(
    (asteroid) => asteroid.id === rocketState.targetAsteroidId,
  );
  expect(destination).toBeDefined();
  expect(destination!.systemId).toBe(stateBefore.run.space.currentSystemId);
  const timer = stateBefore.run.timers[rocketState.timerId!];
  expect(timer?.status).toBe("running");

  const pane = page.getByTestId("space-mining-pane");
  const rocket = page.getByTestId("rocket-card-rocket1");
  const countdown = rocket.getByTestId("rocket-journey-countdown-rocket1");
  const progress = rocket.getByRole("progressbar", {
    name: rocketText("en", "outbound"),
    exact: true,
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    const currentState = await page.evaluate(() => window.miaplacidusTest!.getState());
    await expect(pane).toBeVisible();
    await expect(page.getByTestId("cash-balance")).toHaveText(
      formatCurrency(
        "en",
        Number(displayCurrency(currentState.run.cash)),
        currentState.settings.currencyId ?? "usd",
        2,
        currentState.settings.notation,
      ),
    );
    await expect(page.getByTestId("top-stat-antimatter").locator(".top-stat-value")).toHaveText(
      formatNumber("en", currentState.run.space.antimatter, 0, currentState.settings.notation),
    );
    await expect(
      rocket.getByRole("heading", { name: rocketText("en", "rocketLabel", { index: 1 }) }),
    ).toBeVisible();
    await expect(rocket.locator(".status-pill")).toHaveText(rocketText("en", "outbound"));
    await expect(countdown).toContainText("Journey time remaining:");
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute("aria-label", rocketText("en", "outbound"));
    await expect(progress).toHaveAttribute("max", "100");
    expect(Number(await countdown.getAttribute("data-remaining-ms"))).toBeGreaterThan(0);
    await expectNarrowBounds(page, viewport.width);
  }

  const initialRemaining = Number(await countdown.getAttribute("data-remaining-ms"));
  const initialProgress = await progress.evaluate(
    (element) => (element as HTMLProgressElement).value,
  );
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await countdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialRemaining);
  await expect
    .poll(() => progress.evaluate((element) => (element as HTMLProgressElement).value))
    .toBeGreaterThan(initialProgress);
});
