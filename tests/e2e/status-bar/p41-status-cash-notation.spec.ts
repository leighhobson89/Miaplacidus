import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { displayCurrency } from "../../../src/engine/precision";

async function startNotationCurrencyFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key?.startsWith(prefix) ?? false,
    );
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=notation-coverage");
  await page.getByLabel("Pioneer name").fill("P-41 Status Cash Notation Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

test("P-41 formats top-row Cash in every notation without changing the live balance or settings @p41-status-cash-notation", async ({
  page,
}) => {
  await startNotationCurrencyFixture(page);

  const initial = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      cash: state.run.cash,
      settings: state.settings,
      currencyId: state.settings.currencyId ?? "usd",
    };
  });
  expect(initial.cash).toBeGreaterThan(999_999_999);

  const cashValue = page.getByTestId("top-stat-cash").locator(".top-stat-value");
  const notations = ["condensed", "standard", "scientific"] as const;
  const rendered: Partial<Record<(typeof notations)[number], string>> = {};

  for (const notation of notations) {
    await setNumberNotation(page, notation);
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notation))
      .toBe(notation);

    const current = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(current.run.cash).toBe(initial.cash);
    expect({ ...current.settings, notation: initial.settings.notation }).toEqual(initial.settings);

    const expected = formatCurrency(
      "en",
      Number(displayCurrency(initial.cash)),
      initial.currencyId,
      2,
      notation,
    );
    await expect(cashValue).toHaveText(expected);
    rendered[notation] = await cashValue.innerText();
  }

  expect(rendered.standard).not.toBe(rendered.scientific);
});
