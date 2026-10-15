import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { economyLabel } from "../../../src/i18n/economyMessages";
import {
  journalLabel,
  metaSignalText,
  randomEventName,
} from "../../../src/i18n/metaSignalMessages";
import { randomEventDescriptionTemplate } from "../../../src/i18n/randomEventDescriptionMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("Settings Events source labels and help follow the selected locale @phase7-locale @settings @events @locale", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-rebirth-ready");

  const journal = freshGame.getByTestId("meta-journal-pane");
  const helpTrigger = freshGame.getByTestId("settings-events-overview-help-trigger");
  const helpTooltip = freshGame.getByTestId("settings-events-overview-help");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-settings").click();
    await freshGame.locator("#tab-settings-events").click();

    await expect(journal.getByRole("heading", { level: 2, exact: true })).toHaveText(
      metaSignalText(locale, "title"),
    );
    await helpTrigger.click();
    await expect(helpTooltip).toBeVisible();
    await expect(helpTooltip).toHaveText(economyLabel(locale, "eventsOverviewHelp"));
    await journal
      .getByRole("heading", {
        level: 3,
        name: metaSignalText(locale, "activeTitle"),
        exact: true,
      })
      .click();
    await expect(helpTooltip).not.toBeVisible();

    await expect(
      journal.getByRole("heading", {
        level: 3,
        name: metaSignalText(locale, "activeTitle"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(journal.locator(".journal-empty").nth(0)).toHaveText(
      metaSignalText(locale, "noActiveEvents"),
    );
    await expect(journal.getByRole("heading", { level: 4, exact: true })).toHaveText(
      metaSignalText(locale, "history"),
    );
    await expect(journal.locator(".journal-empty").nth(1)).toHaveText(
      metaSignalText(locale, "noCompletedEvents"),
    );
  }

  const accepted = await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "galacticMarketLockdown",
    }),
  );
  expect(accepted).toBe(true);
  const resultDialog = freshGame.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await resultDialog.getByRole("button").click();
  await expect(resultDialog).not.toBeVisible();

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-settings").click();
    await freshGame.locator("#tab-settings-events").click();

    await expect(journal.getByRole("heading", { level: 3, exact: true })).toHaveText(
      metaSignalText(locale, "activeTitle"),
    );
    const activeEvent = journal.locator(".journal-active-effects li").first();
    await expect(activeEvent.locator("span").first()).toHaveText(
      randomEventName(locale, "galacticMarketLockdown"),
    );
    await expect(activeEvent.getByTestId("active-event-description")).toHaveText(
      randomEventDescriptionTemplate(locale, "eventDescGalacticMarketOffline"),
    );
    await expect(journal.locator(".journal-active-duration small")).toHaveText(
      metaSignalText(locale, "activeUntil"),
    );
    const historyEntry = journal.locator('[data-event-id="galacticMarketLockdown"]');
    await expect(historyEntry.locator("p").first()).toHaveText(
      randomEventName(locale, "galacticMarketLockdown"),
    );
    await expect(historyEntry.getByTestId("event-description")).toHaveText(
      randomEventDescriptionTemplate(locale, "eventDescGalacticMarketOffline"),
    );
    await expect(historyEntry.locator(".journal-event-meta")).toContainText(
      journalLabel(locale, "totalDuration"),
    );
  }
});
