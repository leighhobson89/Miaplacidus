import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { saveNowFromSettings } from "../_harness/save-controls";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { LOCALE_IDS } from "../../../src/content/ids";
import { journalLabel, metaSignalText } from "../../../src/i18n/metaSignalMessages";
import { settingsLabel, settingsSectionName } from "../../../src/i18n/settingsMessages";

test("records an event and guarded news prize across locale changes and reload", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("tab", { name: "Events" }).click();
  const journal = page.getByTestId("meta-journal-pane");
  await expect(journal).toBeVisible();

  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({ type: "random-event.force", eventId: "scienceTheft" });
    window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "prize", id: 2000 });
  });
  await expect(journal.locator('[data-event-id="scienceTheft"]')).toBeVisible();
  await expect(journal.locator('[data-event-art="scienceTheft"]')).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "events-journal-event-artwork");
  const prize = journal.locator('[data-news-id="2000"]');
  await expect(prize).toBeVisible();
  await prize.getByRole("button", { name: "Claim", exact: true }).click();
  await expect(prize.getByRole("button", { name: "Claimed", exact: true })).toBeDisabled();
  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await page.getByLabel("Pioneer name").click();
  await page.getByRole("option", { name: /Ascendency Pioneer/ }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("tab", { name: "Events" }).click();
  const restored = page.getByTestId("meta-journal-pane");
  await expect(restored.locator('[data-event-id="scienceTheft"]')).toBeVisible();
  await expect(restored.locator('[data-news-id="2000"]')).toBeVisible();
  await expect(restored.locator('[data-news-id="2000"] button')).toHaveText("Claimed");

  let currentLocale = "en" as (typeof LOCALE_IDS)[number];
  for (const locale of LOCALE_IDS) {
    await page
      .getByRole("tab", { name: settingsSectionName(currentLocale, "gameOptions") })
      .click();
    await page
      .getByTestId("settings-pane")
      .getByLabel(settingsLabel(currentLocale, "language"))
      .selectOption(locale);
    currentLocale = locale;
    await page.getByRole("tab", { name: settingsSectionName(locale, "events") }).click();
    await expect(
      restored.getByRole("heading", { name: metaSignalText(locale, "title"), exact: true }),
    ).toBeVisible();
    await expect(restored.getByText(journalLabel(locale, "eventProbabilities"))).toBeAttached();
  }
});
