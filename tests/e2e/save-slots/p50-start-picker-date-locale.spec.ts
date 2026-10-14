import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import type { SaveEnvelopeV1 } from "../../../src/persistence/schema";
import { saveErrorText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";

const { decompressFromUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

const FIXED_SAVED_AT = Date.UTC(2026, 8, 23, 16, 45);

async function readSlot(page: Page, pioneerName: string) {
  const records = await page.evaluate(() => {
    const headKeys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false);
    const values: Array<{ slotId: string; commitId: string; payload: string }> = [];
    for (const headKey of headKeys) {
      const slotId = headKey.slice("miaplacidus:v1:head:".length);
      const commitId = localStorage.getItem(headKey);
      const payload = commitId
        ? localStorage.getItem(`miaplacidus:v1:slot:${slotId}:${commitId}`)
        : null;
      if (commitId && payload) values.push({ slotId, commitId, payload });
    }
    return values;
  });
  return records
    .map((record) => ({
      ...record,
      envelope: JSON.parse(decompressFromUTF16(record.payload) ?? "null") as SaveEnvelopeV1,
    }))
    .find(({ envelope }) => envelope.pioneerName === pioneerName);
}

test("startup save picker dates follow the selected locale without changing savedAt @save-slots @p50-start-picker-date-locale", async ({
  page,
}) => {
  const pioneerName = "Startup Date Pioneer";
  await page.addInitScript((fixedTime) => {
    Date.now = () => fixedTime;
  }, FIXED_SAVED_AT);
  await page.goto("/?testSeed=9051&testLocale=en");
  await expect(page.locator('label[for="pioneer-name"]')).toHaveText(/\S/u);
  await page.locator("#pioneer-name").fill(pioneerName);
  await page.getByTestId("start-game").click();
  await expect(page.locator(".run-name")).toHaveText(pioneerName);

  await page.reload();
  const nameInput = page.locator("#pioneer-name");
  await expect(nameInput).toHaveValue(pioneerName);
  await nameInput.focus();
  const suggestion = page.getByRole("option").filter({ hasText: pioneerName });
  await expect(suggestion).toBeVisible();
  await expect(suggestion).toHaveAttribute("aria-selected", "true");

  const initialSlot = await readSlot(page, pioneerName);
  expect(initialSlot, "the startup picker should use the saved local slot").toBeDefined();
  expect(initialSlot?.envelope.savedAt).toBe(FIXED_SAVED_AT);

  let activeLocale: LocaleId = "en";
  const renderedDates: string[] = [];
  for (const locale of LOCALE_IDS) {
    if (locale !== activeLocale) {
      await page.locator("#start-locale").selectOption(locale);
      activeLocale = locale;
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    }

    await expect(suggestion).toBeVisible();
    await expect(suggestion).toHaveAttribute("aria-selected", "true");
    const actualDate = (await suggestion.locator("small").textContent())?.trim() ?? "";
    const expectedDate = await page.evaluate(
      ({ timestamp, currentLocale }) =>
        new Intl.DateTimeFormat(currentLocale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(timestamp),
      { timestamp: FIXED_SAVED_AT, currentLocale: locale },
    );
    expect(actualDate, `${locale} startup picker date`).toBe(expectedDate);
    renderedDates.push(actualDate);

    const currentSlot = await readSlot(page, pioneerName);
    expect(currentSlot?.slotId, `${locale} keeps the same slot`).toBe(initialSlot?.slotId);
    expect(currentSlot?.commitId, `${locale} keeps the same generation`).toBe(
      initialSlot?.commitId,
    );
    expect(currentSlot?.envelope.savedAt, `${locale} preserves savedAt`).toBe(FIXED_SAVED_AT);
  }

  expect(new Set(renderedDates).size).toBeGreaterThan(1);
});

test("startup selection and duplicate-name validation use the selected locale @save-slots @p45-startup-locale", async ({
  page,
}) => {
  const pioneerName = "P-45 Startup Locale Pioneer";
  await page.goto("/?testSeed=9052&testLocale=en");

  const nameInput = page.locator("#pioneer-name");
  const startButton = page.getByTestId("start-game");
  await nameInput.fill("");
  for (const locale of LOCALE_IDS) {
    await page.locator("#start-locale").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator('label[for="pioneer-name"]')).toHaveText(/\S/u);
    await expect(page.locator('label[for="start-locale"]')).toHaveText(/\S/u);
    await expect(page.locator("#start-locale")).toHaveValue(locale);
    await expect(nameInput).toHaveAttribute("required", "");
    await expect(startButton).toBeDisabled();
    await expect(startButton).toHaveText(/\S/u);
  }

  await page.locator("#start-locale").selectOption("en");
  await nameInput.fill(pioneerName);
  await expect(startButton).toBeEnabled();
  await expect(startButton).toHaveText(/\S/u);
  await startButton.click();
  await expect(page.locator(".run-name")).toHaveText(pioneerName);
  await page.reload();

  const renderedDuplicateErrors: string[] = [];
  for (const locale of LOCALE_IDS) {
    await page.locator("#start-locale").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(nameInput).toHaveValue(pioneerName);
    await nameInput.focus();
    const suggestion = page.getByRole("option").filter({ hasText: pioneerName });
    await expect(suggestion).toBeVisible();
    await expect(suggestion).toHaveAttribute("aria-selected", "true");
    await expect(startButton).toContainText(pioneerName);

    await nameInput.fill(`${pioneerName} changed`);
    await nameInput.fill(pioneerName);
    await expect(suggestion).toHaveAttribute("aria-selected", "false");
    await expect(startButton).toHaveText(/\S/u);
    await startButton.click();
    const error = page
      .getByTestId("game-notification")
      .filter({ hasText: saveErrorText(locale, "duplicate-name") });
    await expect(error).toBeVisible();
    renderedDuplicateErrors.push((await error.textContent())?.trim() ?? "");
    await expect(error).toHaveCount(0, { timeout: 5_000 });

    await suggestion.click();
    await expect(startButton).toContainText(pioneerName);
  }

  for (const error of renderedDuplicateErrors) expect(error).toMatch(/\S/u);
});
