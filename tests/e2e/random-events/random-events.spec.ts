import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { saveNowFromSettings } from "../_harness/save-controls";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { LOCALE_IDS } from "../../../src/content/ids";
import { journalLabel, metaSignalText } from "../../../src/i18n/metaSignalMessages";
import { settingsLabel, settingsSectionName } from "../../../src/i18n/settingsMessages";
import { formatNumber } from "../../../src/app/numberFormatting";
import { randomEventDescriptionTemplate } from "../../../src/i18n/randomEventDescriptionMessages";
import { setNumberNotation } from "../_harness/settings-controls";

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
  const resultDialog = page.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await resultDialog.getByRole("button").click();
  await expect(resultDialog).not.toBeVisible();
  await expect(journal.locator('[data-event-id="scienceTheft"]')).toBeVisible();
  const eventDetails = await page.evaluate(() => {
    const entry = window.miaplacidusTest!
      .getState()
      .run.randomEvents.history.find((candidate) => candidate.id === "scienceTheft");
    return entry?.details?.kind === "researchHalved" ? entry.details.amount : null;
  });
  expect(eventDetails).toBeGreaterThan(0);
  const notation = await page.evaluate(() => window.miaplacidusTest!.getState().settings.notation);
  await expect(journal.locator('[data-event-id="scienceTheft"] [data-testid="event-description"]')).toHaveText(
    randomEventDescriptionTemplate("en", "eventDescResearchHalvedAmount", {
      amount: formatNumber("en", eventDetails!, 0, notation),
    }),
  );
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
    const localeEventAmount = await page.evaluate(() => {
      const entry = window.miaplacidusTest!
        .getState()
        .run.randomEvents.history.find((candidate) => candidate.id === "scienceTheft");
      return entry?.details?.kind === "researchHalved" ? entry.details.amount : null;
    });
    expect(localeEventAmount).toBe(eventDetails);
    await expect(
      restored.locator('[data-event-id="scienceTheft"] [data-testid="event-description"]'),
    ).toHaveText(
      randomEventDescriptionTemplate(locale, "eventDescResearchHalvedAmount", {
        amount: formatNumber(locale, eventDetails!, 0, notation),
      }),
    );
  }
});

test("P-41 formats the visible active-event count in every notation @p41-event-count", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "galacticMarketLockdown",
    }),
  );
  const resultDialog = page.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await resultDialog.getByRole("button").click();
  await expect(resultDialog).not.toBeVisible();
  const activeCount = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.randomEvents.activeEffects.length,
  );
  expect(activeCount).toBeGreaterThan(0);

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notation))
      .toBe(notation);
    await page.getByRole("tab", { name: "Settings" }).click();
    await page.locator("#tab-settings-events").click();
    const journal = page.getByTestId("meta-journal-pane");
    const activeReadout = journal.getByTestId("journal-active-effect-count");
    await expect(activeReadout).toHaveText(
      `${metaSignalText("en", "active")}: ${formatNumber("en", activeCount, 0, notation)}`,
    );
    await expect(
      journal.locator('.journal-active-effects [data-testid="active-event-description"]'),
    ).toHaveText("Galactic Market is offline.");
  }
});
