import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { RANDOM_EVENT_IDS } from "../../../src/content/metaSignals";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  journalLabel,
  metaSignalText,
  newsCategoryName,
  newsEntryText,
  randomEventName,
} from "../../../src/i18n/metaSignalMessages";
import { sourceNewsCopy } from "../../../src/i18n/sourceNewsCopy";

test("P-45 event names, journal labels, and prize notice render in every locale @p45-events-locales", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.evaluate(() => {
    window.miaplacidusTest!.dispatch({ type: "random-event.force", eventId: "scienceTheft" });
    window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "prize", id: 2000 });
  });

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-events").click();

    const journal = page.getByTestId("meta-journal-pane");
    await expect(
      journal.getByRole("heading", { name: metaSignalText(locale, "title") }),
    ).toBeVisible();
    await expect(
      journal.getByRole("heading", { name: metaSignalText(locale, "news") }),
    ).toBeVisible();
    await expect(
      journal.getByRole("heading", { name: metaSignalText(locale, "events") }),
    ).toBeVisible();
    await expect(
      journal.getByRole("heading", { name: metaSignalText(locale, "history") }),
    ).toBeVisible();

    const historyEvent = journal.locator('[data-event-id="scienceTheft"]');
    await expect(historyEvent.locator("p").first()).toHaveText(
      randomEventName(locale, "scienceTheft"),
    );

    const probabilityList = journal.locator("details.journal-event-odds");
    await probabilityList.locator("summary").click();
    await expect(probabilityList.locator("li")).toHaveCount(RANDOM_EVENT_IDS.length);
    await expect(probabilityList.locator("li span")).toHaveText(
      RANDOM_EVENT_IDS.map((id) => randomEventName(locale, id)),
    );
    await expect(probabilityList.locator("summary")).toContainText(
      journalLabel(locale, "eventProbabilities"),
    );

    const prize = journal.locator('[data-news-id="2000"]');
    const entry = await page.evaluate(() =>
      window
        .miaplacidusTest!.getState()
        .run.newsTicker.entries.find((candidate) => candidate.id === 2000),
    );
    expect(entry).toBeDefined();
    await expect(prize.locator("small").first()).toContainText(newsCategoryName(locale, "prize"));
    await expect(
      prize.getByRole("button", { name: metaSignalText(locale, "claim"), exact: true }),
    ).toBeVisible();
    const notation = await page.evaluate(
      () => window.miaplacidusTest!.getState().settings.notation,
    );
    await expect(prize.locator("p")).toHaveText(
      newsEntryText(locale, entry!, sourceNewsCopy(locale), (amount) =>
        formatNumber(locale, amount, 0, notation),
      ),
    );
  }
});
