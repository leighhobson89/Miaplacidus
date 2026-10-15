import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { randomEventInstabilityNotificationText } from "../../../src/i18n/randomEventInstabilityNotificationMessages";
import { randomEventStartDialogText } from "../../../src/i18n/randomEventStartDialogMessages";
import { randomEventTriggerNotificationText } from "../../../src/i18n/randomEventTriggerNotificationMessages";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

for (const locale of LOCALE_IDS) {
  test(`Black Hole Instability start copy follows ${locale} @phase8-p7-black-hole-instability-locale`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-black-hole-discovered");
    const localeAccepted = await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    expect(localeAccepted).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-black-hole").click();
    await page
      .getByTestId("black-hole-research")
      .locator(".space-action-help-group > .primary-button")
      .click();

    const researched = await page.evaluate(
      () => window.miaplacidusTest!.getState().permanent.blackHole.researched,
    );
    expect(researched).toBe(true);
    const accepted = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "random-event.force",
        eventId: "blackHoleInstability",
      }),
    );
    expect(accepted).toBe(true);

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const entry = state.run.randomEvents.history.at(-1);
    expect(entry?.id).toBe("blackHoleInstability");
    const durationMs = entry?.durationMs ?? 0;
    expect(durationMs).toBeGreaterThan(0);
    const minutes = Math.round(durationMs / 60_000);
    const values = {
      minutes: formatNumber(locale, minutes, 0, state.settings.notation),
    };
    const dialogCopy = randomEventStartDialogText(locale, "blackHoleInstability", values);
    expect(dialogCopy).not.toBeNull();
    if (!dialogCopy) throw new Error(`Missing Black Hole Instability dialog copy for ${locale}.`);

    const dialog = page.getByTestId("random-event-result-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading")).toHaveText(dialogCopy.title);
    await expect(dialog.locator(".random-event-result-copy p")).toHaveText([
      dialogCopy.summary,
      dialogCopy.lines[0]!.text,
    ]);
    await expect(dialog.getByRole("button")).toHaveText(dialogCopy.confirmLabel);

    const triggerNotice = randomEventTriggerNotificationText(
      locale,
      "blackHoleInstability",
      entry,
    );
    expect(triggerNotice.trim()).not.toBe("");
    await expect(
      page.locator('[data-testid="game-notification"]').filter({ hasText: triggerNotice }),
    ).toHaveText(triggerNotice);

    const effect = state.run.randomEvents.activeEffects.find(
      (active) => active.id === "blackHoleInstability",
    );
    expect(effect).toBeDefined();
    if (!effect) throw new Error("Black Hole Instability effect was not active after triggering.");
    const shiftNotice = randomEventInstabilityNotificationText(
      locale,
      effect.powerMultiplier,
      effect.durationMultiplier,
      true,
    );
    expect(shiftNotice.trim()).not.toBe("");
    await expect(
      page.locator('[data-testid="game-notification"]').filter({ hasText: shiftNotice }),
    ).toHaveText(shiftNotice);

    await dialog.getByRole("button", { name: dialogCopy.confirmLabel, exact: true }).click();
    await expect(dialog).not.toBeVisible();
  });
}
