import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { randomEventHistoryDescription } from "../../../src/app/randomEventDescription";
import { randomEventName } from "../../../src/i18n/metaSignalMessages";
import { randomEventEndDialogText } from "../../../src/i18n/randomEventEndDialogMessages";
import { randomEventEndNotificationText } from "../../../src/i18n/randomEventEndNotificationMessages";

async function updateEventLocale(
  page: import("@playwright/test").Page,
  locale: LocaleId,
  notificationsEnabled: boolean,
) {
  const accepted = await page.evaluate(
    ({ nextLocale, nextNotificationsEnabled }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, notificationsEnabled: nextNotificationsEnabled },
      }),
    { nextLocale: locale, nextNotificationsEnabled: notificationsEnabled },
  );
  expect(accepted).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

for (const locale of LOCALE_IDS) {
  test(`random-event expiry result and journal history use ${locale} @p7-random-event-expiry-locales`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-black-hole-discovered");
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-black-hole").click();

    const researchAccepted = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { notificationsEnabled: false },
      }),
    );
    expect(researchAccepted).toBe(true);

    await page
      .getByTestId("black-hole-research")
      .locator(".space-action-help-group > .primary-button")
      .click();
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().permanent.blackHole.researched),
      )
      .toBe(true);

    const eventId = "blackHoleInstability" as const;
    const accepted = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "random-event.force",
        eventId: "blackHoleInstability",
      }),
    );
    expect(accepted).toBe(true);

    const startDialog = page.getByTestId("random-event-result-dialog");
    await expect(startDialog).toBeVisible();
    await startDialog.getByRole("button").click();
    await expect(startDialog).toBeHidden();

    const initialEffect = await page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return state.run.randomEvents.activeEffects.find(
        (effect) => effect.id === "blackHoleInstability",
      );
    });
    expect(initialEffect).toBeDefined();
    if (!initialEffect) throw new Error("Black Hole Instability was not active after forcing it.");
    expect(initialEffect.remainingMs).toBeGreaterThan(0);
    expect(initialEffect.remainingMs).toBeLessThan(30 * 60_000);
    expect(initialEffect.remainingMs % 60_000).toBe(0);

    // Keep periodic shift notices suppressed; select the locale before the expiry route fires.
    await page.evaluate(
      (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds),
      initialEffect.remainingMs - 1_000,
    );
    const oneSecondBeforeExpiry = await page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return state.run.randomEvents.activeEffects.find(
        (effect) => effect.id === "blackHoleInstability",
      )?.remainingMs;
    });
    expect(oneSecondBeforeExpiry).toBe(1_000);

    await updateEventLocale(page, locale, true);
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));

    const state = await page.evaluate(() => {
      const current = window.miaplacidusTest!.getState();
      return {
        active: current.run.randomEvents.activeEffects.some(
          (effect) => effect.id === "blackHoleInstability",
        ),
        history: current.run.randomEvents.history.find(
          (entry) => entry.id === "blackHoleInstability",
        ),
        notation: current.settings.notation,
      };
    });
    expect(state.active).toBe(false);
    expect(state.history).toBeDefined();
    if (!state.history) throw new Error("The Black Hole Instability journal entry is missing.");

    const expectedDialog = randomEventEndDialogText(locale, eventId);
    const expectedNotice = randomEventEndNotificationText(locale, eventId);
    expect(expectedDialog).not.toBeNull();
    expect(expectedNotice?.trim()).not.toBe("");
    if (!expectedDialog || !expectedNotice)
      throw new Error(`Missing Black Hole Instability expiry copy for ${locale}.`);
    expect(expectedDialog.title.trim()).not.toBe("");
    expect(expectedDialog.summary.trim()).not.toBe("");
    expect(expectedDialog.lines.length).toBeGreaterThan(0);
    for (const line of expectedDialog.lines) expect(line.text.trim()).not.toBe("");

    const expiryDialog = page.getByTestId("random-event-result-dialog");
    await expect(expiryDialog).toBeVisible();
    await expect(expiryDialog.getByRole("heading")).toHaveText(expectedDialog.title);
    await expect(expiryDialog.locator("#random-event-result-copy")).toContainText(
      expectedDialog.summary,
    );
    for (const line of expectedDialog.lines) {
      await expect(expiryDialog.locator("#random-event-result-copy")).toContainText(line.text);
    }
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: expectedNotice }),
    ).toHaveText(expectedNotice);
    await expiryDialog
      .getByRole("button", { name: expectedDialog.confirmLabel, exact: true })
      .click();
    await expect(expiryDialog).toBeHidden();

    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-events").click();
    const journal = page.getByTestId("meta-journal-pane");
    const historyRow = journal.locator('[data-event-id="blackHoleInstability"]');
    await expect(historyRow).toBeVisible();
    await expect(historyRow.locator("p").first()).toHaveText(
      randomEventName(locale, eventId),
    );
    await expect(historyRow.getByTestId("event-description")).toHaveText(
      randomEventHistoryDescription(locale, state.history, state.notation),
    );
  });
}
