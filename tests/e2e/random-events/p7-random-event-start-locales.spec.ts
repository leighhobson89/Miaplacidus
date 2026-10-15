import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { randomEventStartDialogText } from "../../../src/i18n/randomEventStartDialogMessages";
import { randomEventMarketLockdownTriggerNotificationText } from "../../../src/i18n/randomEventTriggerNotificationMessages";

async function prepareLocaleAndNotifications(
  page: import("@playwright/test").Page,
  locale: LocaleId,
) {
  const stack = page.getByTestId("notification-stack");
  const disabled = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { notificationsEnabled: false },
    }),
  );
  expect(disabled).toBe(true);
  await expect(stack).toBeEmpty();

  const selected = await page.evaluate(
    (nextLocale) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, notificationsEnabled: true },
      }),
    locale,
  );
  expect(selected).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.locale))
    .toBe(locale);
}

for (const locale of LOCALE_IDS) {
  test(`random-event start dialog and notice use the selected locale (${locale}) @p7-random-event-start-locales`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-market-ready");
    await prepareLocaleAndNotifications(page, locale);

    const eventId = "galacticMarketLockdown" as const;
    const expectedDialog = randomEventStartDialogText(locale, eventId);
    const expectedNotice = randomEventMarketLockdownTriggerNotificationText(locale);
    expect(expectedDialog).not.toBeNull();
    expect(expectedDialog!.title.trim()).not.toBe("");
    expect(expectedDialog!.summary.trim()).not.toBe("");
    expect(expectedDialog!.lines.length).toBeGreaterThan(0);
    for (const line of expectedDialog!.lines) expect(line.text.trim()).not.toBe("");
    expect(expectedDialog!.confirmLabel.trim()).not.toBe("");
    expect(expectedNotice.trim()).not.toBe("");

    const accepted = await page.evaluate(
      (id) => window.miaplacidusTest!.dispatch({ type: "random-event.force", eventId: id }),
      eventId,
    );
    expect(accepted).toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.miaplacidusTest!.getState().run.randomEvents.activeEffects.some(
            (effect) => effect.id === "galacticMarketLockdown",
          ),
        ),
      )
      .toBe(true);

    const resultDialog = page.getByTestId("random-event-result-dialog");
    await expect(resultDialog).toBeVisible();
    await expect(resultDialog.getByRole("heading")).toHaveText(expectedDialog!.title);
    await expect(resultDialog.locator("#random-event-result-copy")).toContainText(
      expectedDialog!.summary,
    );
    await expect(resultDialog.locator("#random-event-result-copy")).toContainText(
      expectedDialog!.lines[0]!.text,
    );
    await resultDialog
      .getByRole("button", { name: expectedDialog!.confirmLabel, exact: true })
      .click();
    await expect(resultDialog).toBeHidden();

    const eventNotice = page
      .getByTestId("notification-stack")
      .getByTestId("game-notification")
      .filter({ hasText: expectedNotice });
    await expect(eventNotice).toBeVisible();
    await expect(eventNotice).toHaveText(expectedNotice);
    await expect(eventNotice).toHaveAttribute("data-classification", "default");
    await expect(eventNotice).toHaveClass(/notification-info/);
  });
}
