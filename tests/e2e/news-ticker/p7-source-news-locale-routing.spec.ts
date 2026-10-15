import { LOCALE_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { sourceNewsCopy } from "../../../src/i18n/sourceNewsCopy";
import { setGameLocale } from "../_harness/settings-controls";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

test("P7 indexed news copy follows the selected locale in the ticker @phase7-locale @news-ticker", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { reducedMotion: true },
      }),
    ),
  ).toBe(true);

  for (const [localeIndex, locale] of LOCALE_IDS.entries()) {
    await setGameLocale(freshGame, locale);
    const copy = sourceNewsCopy(locale);
    const cases = [
      {
        category: "headline",
        id: 199,
        expected: copy.headlines[199]!,
      },
      {
        category: "wacky",
        id: 1007,
        expected: copy.wackyEffects[7]!,
      },
      {
        category: "prize",
        id: 2000,
        expected: "",
      },
      {
        category: "oneOff",
        id: 3000 + localeIndex,
        expected: copy.oneOffs[localeIndex]!.replaceAll("{here}", copy.here),
      },
    ] as const;

    for (const entryCase of cases) {
      expect(
        await freshGame.evaluate(
          ({ category, id }) =>
            window.miaplacidusTest!.dispatch({
              type: "news.ticker.force",
              category,
              id,
            }),
          entryCase,
        ),
      ).toBe(true);
      await expect(ticker).toHaveAttribute("data-news-id", String(entryCase.id));
      const amountData = await freshGame.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        return {
          amount: state.run.newsTicker.entries.at(-1)?.prizeAmount ?? 0,
          notation: state.settings.notation,
        };
      });
      const expected =
        entryCase.category === "prize"
          ? copy.prizes[0]!
              .replace("{amount}", formatNumber(locale, amountData.amount, 0, amountData.notation))
              .replaceAll("{here}", copy.here)
          : entryCase.expected;
      await expect(ticker.locator(".news-ticker-copy")).toContainText(expected);
    }
  }

  const journalCopy = sourceNewsCopy("fr").oneOffs[5]!.replaceAll("{here}", sourceNewsCopy("fr").here);
  await freshGame.locator("#tab-settings").click();
  await freshGame.locator("#tab-settings-events").click();
  const journal = freshGame.getByTestId("meta-journal-pane");
  await expect(journal.locator('[data-news-id="3005"] p')).toContainText(journalCopy);
});

test("P7 manuscript clue templates follow the selected locale @phase7-locale @news-ticker", async ({
  page,
}) => {
  await startMetaFixture(page, "space-manuscript-hidden");
  const ticker = page.getByTestId("news-ticker");
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { reducedMotion: true },
      }),
    ),
  ).toBe(true);

  for (const [localeIndex, locale] of LOCALE_IDS.entries()) {
    await setGameLocale(page, locale);
    const clueId = 4000 + localeIndex;
    expect(
      await page.evaluate(
        (id) =>
          window.miaplacidusTest!.dispatch({
            type: "news.ticker.force",
            category: "manuscriptClue",
            id,
          }),
        clueId,
      ),
    ).toBe(true);
    await expect(ticker).toHaveAttribute("data-news-id", String(clueId));
    const sourceTemplate = sourceNewsCopy(locale).manuscriptClues[localeIndex]!;
    const visiblePrefix = sourceTemplate.split("{STAR}")[0]!;
    await expect(ticker.locator(".news-ticker-copy")).toContainText(visiblePrefix);
    await expect(ticker.locator(".news-ticker-action")).toHaveCount(0);
  }
});
