import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { STAR_STUDY_TIMER_ID } from "../../../src/content/space";
import {
  blackHoleDiscoveryDialog,
  blackHoleText,
} from "../../../src/i18n/blackHoleMessages";

async function startDiscoveryFixture(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(
    "/?testSeed=20261003&testLocale=en&economyFixture=space-voidborn-pillage",
  );
  await page.getByLabel("Pioneer name").fill("Black Hole Discovery Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await dismissTutorialOfferIfPresent(page);
}

async function setLocale(
  page: import("@playwright/test").Page,
  locale: LocaleId,
): Promise<void> {
  expect(
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    ),
  ).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("Black Hole discovery dialog and notice follow all six locales @phase8-p7-black-hole-discovery", async ({
  page,
}) => {
  for (const locale of LOCALE_IDS) {
    await startDiscoveryFixture(page);
    await setLocale(page, locale);

    const seeded = await page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        rebirthCount: state.permanent.rebirthCount,
        discovered: state.permanent.blackHole.discovered,
        telescopeBuilt: state.run.space.telescopeBuilt,
      };
    });
    expect(seeded).toEqual({ rebirthCount: 1, discovered: false, telescopeBuilt: true });

    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();
    const studyButton = page.locator("#telescope-study-stars");
    let discovered = false;
    for (let attempt = 0; attempt < 34 && !discovered; attempt += 1) {
      if (attempt === 0) {
        await studyButton.click();
      } else {
        expect(
          await page.evaluate(() =>
            window.miaplacidusTest!.dispatch({ type: "space.telescope.study.start" }),
          ),
        ).toBe(true);
      }

      const remainingMs = await page.evaluate((timerId) => {
        const timer = window.miaplacidusTest!.getState().run.timers[timerId];
        if (!timer) throw new Error("The star-study timer did not start.");
        return timer.durationMs - timer.elapsedMs;
      }, STAR_STUDY_TIMER_ID);
      await page.evaluate(
        (timeToComplete) => window.miaplacidusTest!.advanceBy(timeToComplete + 1),
        remainingMs,
      );
      discovered = await page.evaluate(
        () => window.miaplacidusTest!.getState().permanent.blackHole.discovered,
      );
    }
    expect(discovered).toBe(true);

    const copy = blackHoleDiscoveryDialog(locale);
    const dialog = page.getByTestId("random-event-result-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading")).toHaveText(copy.title);
    await expect(dialog.locator(".random-event-result-copy p")).toHaveText([
      copy.summary,
      copy.lines[0]!.text,
      copy.lines[1]!.text,
    ]);
    await expect(dialog.locator(".random-event-result-copy p").nth(2)).toHaveClass(
      /green-ready-text/,
    );

    const notice = page
      .getByTestId("game-notification")
      .filter({ hasText: blackHoleText(locale).discoveredNotification });
    await expect(notice).toHaveCount(1);
    await expect(notice).toHaveText(blackHoleText(locale).discoveredNotification);

    await dialog.getByRole("button", { name: copy.confirmLabel, exact: true }).click();
    await expect(dialog).toBeHidden();
  }
});
