import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import type { SaveEnvelopeV1 } from "../../../src/persistence/schema";
import { settingsLabel } from "../../../src/i18n/settingsMessages";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager } from "../_harness/save-controls";

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

test("Save Manager saved-at dates follow the selected locale without changing the save timestamp @save-slots @p50-save-date-locale", async ({
  page,
}) => {
  await page.addInitScript((fixedTime) => {
    Date.now = () => fixedTime;
  }, FIXED_SAVED_AT);
  await page.goto("/?testSeed=9050&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Locale Date Sample");
  await page.getByTestId("start-game").click();
  await page.reload();
  await page.getByLabel("Pioneer name").fill("Locale Date Observer");
  await expect(page.getByTestId("start-game")).toHaveText("START NEW GAME");
  await page.getByTestId("start-game").click();
  await expect(page.locator(".run-name")).toHaveText("Locale Date Observer");
  await openSaveManager(page);

  const manager = page.getByTestId("save-manager-inline");
  const listedSave = manager
    .locator(".manager-slot-list .slot-select")
    .filter({ hasText: "Locale Date Sample" });
  await expect(listedSave).toBeVisible();

  const samplePayload = await readSlot(page, "Locale Date Sample");
  expect(samplePayload, "the first save should remain in the local Save Manager").toBeDefined();
  expect(samplePayload?.envelope.savedAt).toBe(FIXED_SAVED_AT);

  let activeLocale: LocaleId = "en";
  const renderedDates: string[] = [];
  for (const locale of LOCALE_IDS) {
    if (locale !== activeLocale) {
      await page.locator("#tab-settings-game-options").click();
      await page
        .getByTestId("settings-pane")
        .getByLabel(settingsLabel(activeLocale, "language"))
        .selectOption(locale);
      activeLocale = locale;
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    }

    await page.locator("#tab-settings-saves").click();
    await expect(listedSave).toBeVisible();
    const actualDate = (await listedSave.locator("span").textContent())?.trim() ?? "";
    const expectedDate = await page.evaluate(
      ({ timestamp, currentLocale }) =>
        new Intl.DateTimeFormat(currentLocale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(timestamp),
      { timestamp: FIXED_SAVED_AT, currentLocale: locale },
    );
    expect(actualDate, `${locale} Save Manager date`).toBe(expectedDate);
    renderedDates.push(actualDate);

    const currentSamplePayload = await readSlot(page, "Locale Date Sample");
    expect(currentSamplePayload?.slotId, `${locale} keeps the same saved slot`).toBe(
      samplePayload?.slotId,
    );
    expect(currentSamplePayload?.commitId, `${locale} does not write a new generation`).toBe(
      samplePayload?.commitId,
    );
    expect(currentSamplePayload?.envelope.savedAt, `${locale} preserves savedAt`).toBe(
      FIXED_SAVED_AT,
    );
  }

  expect(new Set(renderedDates).size).toBeGreaterThan(1);
});
