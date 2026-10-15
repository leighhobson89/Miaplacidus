import { expect, type Page } from "./fixtures";
import { displayCurrency } from "../../../src/engine/precision";
import { formatCurrency } from "../../../src/app/currencyFormatting";

export const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

export async function startEconomyFixture(
  page: Page,
  fixture: "research" | "power-buildings",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key?.startsWith(prefix) ?? false,
    );
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(`P-13 ${fixture} context`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await stabilizeCapture(page);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

async function stabilizeCapture(page: Page): Promise<void> {
  const tutorialStatus = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.progressionTutorial.status,
  );
  if (tutorialStatus === "available") {
    const dismissButton = page.getByRole("button", { name: "No thanks", exact: true });
    await expect(dismissButton).toBeVisible();
    await dismissButton.click();
  }
  await expect(page.locator(".progression-tutorial")).toHaveCount(0);

  const notifications = page.getByTestId("notification-stack").getByTestId("game-notification");
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled))
    .toBe(false);
  await expect(notifications).toHaveCount(0);
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: true },
    }),
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled))
    .toBe(true);
}

export function formattedCash(state: Awaited<ReturnType<typeof getState>>): string {
  return formatCurrency(
    "en",
    Number(displayCurrency(state.run.cash)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

export async function getState(page: Page) {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

export async function expectNoHorizontalOverflow(
  page: Page,
  width: number,
  selectors: readonly [string, string][],
): Promise<void> {
  const bounds = await page.evaluate((selected) => {
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Expected visible narrow-context element: ${selector}`);
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    };
    return {
      documentWidth: document.documentElement.scrollWidth,
      elements: selected.map(([name, selector]) => [name, rect(selector)] as const),
    };
  }, selectors);
  expect(bounds.documentWidth, `${width}px document width`).toBeLessThanOrEqual(width);
  for (const [name, rect] of bounds.elements) {
    expect(rect.left, `${width}px ${name} left edge`).toBeGreaterThanOrEqual(-1);
    expect(rect.right, `${width}px ${name} right edge`).toBeLessThanOrEqual(width + 1);
  }
}
