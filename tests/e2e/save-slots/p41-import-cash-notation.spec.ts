import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager } from "../_harness/save-controls";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";

async function startNotationImportFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key?.startsWith(prefix) ?? false,
    );
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=notation-coverage");
  await page.getByLabel("Pioneer name").fill("P-41 Import Cash Notation Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

test("P-41 import preview formats Cash using the imported save notation @p41-import-cash-notation", async ({
  page,
}) => {
  await startNotationImportFixture(page);
  const baseline = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(baseline.run.cash).toBeGreaterThan(999_999_999);

  const importedNotations = ["condensed", "standard", "scientific"] as const;
  const activeNotations = {
    condensed: "standard",
    standard: "scientific",
    scientific: "condensed",
  } as const;
  const expectedByNotation: Record<(typeof importedNotations)[number], string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };

  for (const importedNotation of importedNotations) {
    await setNumberNotation(page, importedNotation);
    await openSaveManager(page);
    const manager = page.getByTestId("save-manager-inline");
    const portableCode = await manager.locator("textarea[readonly]").inputValue();
    expect(portableCode).toMatch(/^MIA1:/);

    const activeNotation = activeNotations[importedNotation];
    await setNumberNotation(page, activeNotation);
    const liveState = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(liveState.settings.notation).toBe(activeNotation);
    expect(liveState.run.cash).toBe(baseline.run.cash);

    await openSaveManager(page);
    const liveManager = page.getByTestId("save-manager-inline");
    await liveManager.locator("#import-code").fill(portableCode);
    await liveManager.getByRole("button", { name: "Preview import" }).click();
    const preview = liveManager.getByTestId("import-preview");
    await expect(preview).toBeVisible();

    const expected = formatCurrency(
      "en",
      baseline.run.cash,
      baseline.settings.currencyId ?? "usd",
      2,
      importedNotation,
    );
    const cashRow = preview.locator("p").filter({ hasText: "Cash:" });
    await expect(cashRow).toHaveText(`Cash: ${expected}`);
    expectedByNotation[importedNotation] = await cashRow.innerText();

    const afterPreview = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(afterPreview.settings.notation).toBe(activeNotation);
    expect(afterPreview.run.cash).toBe(baseline.run.cash);
  }

  expect(expectedByNotation.standard).not.toBe(expectedByNotation.scientific);
});
