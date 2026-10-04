import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { journalLabel, metaSignalText } from "../../../src/i18n/metaSignalMessages";
import { settingsLabel } from "../../../src/i18n/settingsMessages";

test("records an event and guarded news prize across locale changes and reload", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.getByRole("tab", { name: "Settings" }).click();
  const journal = page.getByTestId("meta-journal-pane");
  await expect(journal).toBeVisible();

  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({ type: "random-event.force", eventId: "scienceTheft" });
    window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "prize", id: 2000 });
  });
  await expect(journal.locator('[data-event-id="scienceTheft"]')).toBeVisible();
  const prize = journal.locator('[data-news-id="2000"]');
  await expect(prize).toBeVisible();
  await prize.getByRole("button", { name: "Claim", exact: true }).click();
  await expect(prize.getByRole("button", { name: "Claimed", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  const restored = page.getByTestId("meta-journal-pane");
  await expect(restored.locator('[data-event-id="scienceTheft"]')).toBeVisible();
  await expect(restored.locator('[data-news-id="2000"]')).toBeVisible();
  await expect(restored.locator('[data-news-id="2000"] button')).toHaveText("Claimed");

  let currentLocale = "en" as (typeof LOCALE_IDS)[number];
  for (const locale of LOCALE_IDS) {
    await page
      .getByTestId("settings-pane")
      .getByLabel(settingsLabel(currentLocale, "language"))
      .selectOption(locale);
    currentLocale = locale;
    await expect(
      restored.getByRole("heading", { name: metaSignalText(locale, "title"), exact: true }),
    ).toBeVisible();
    await expect(restored.getByText(journalLabel(locale, "eventProbabilities"))).toBeAttached();
  }
});
