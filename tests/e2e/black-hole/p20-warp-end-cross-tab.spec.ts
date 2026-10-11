import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import {
  blackHoleText,
  blackHoleWarpEndedNotification,
} from "../../../src/i18n/blackHoleMessages";

test("Black Hole warp expiry is announced after leaving its tab @black-hole @p20-announcements", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  const copy = blackHoleText("en");
  const warpEndedCopy = blackHoleWarpEndedNotification("en");

  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-black-hole").click();
  await page
    .getByTestId("black-hole-research")
    .getByRole("button", { name: new RegExp(copy.researchAction) })
    .click();

  const chargeTimer = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!,
  );
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    chargeTimer.durationMs - chargeTimer.elapsedMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleChargeReady))
    .toBe(true);

  const notificationStack = page.getByTestId("notification-stack");
  const chargeNotice = notificationStack
    .locator('[data-testid="game-notification"][data-classification="special"]')
    .filter({ hasText: copy.chargedNotification });
  await expect(chargeNotice).toBeVisible();
  await expect(chargeNotice).toBeHidden({ timeout: 5000 });

  await page
    .locator(".black-hole-pane")
    .getByRole("button", { name: new RegExp(copy.activate) })
    .click();
  const warpRemainingMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.timeWarp.remainingMs,
  );
  const resourcesTab = page.locator("#tab-hydrogen");
  await resourcesTab.click();
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    warpRemainingMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleWarpActive))
    .toBe(false);
  await expect(resourcesTab).toHaveAttribute("aria-selected", "true");

  const announcementRegion = page.getByTestId("screen-reader-announcements");
  await expect(announcementRegion).toHaveAttribute("role", "status");
  await expect(announcementRegion).toHaveAttribute("aria-live", "polite");
  await expect(announcementRegion).toHaveAttribute("aria-atomic", "false");
  await expect(announcementRegion).toHaveClass(/sr-only/);
  await expect(announcementRegion.getByTestId("screen-reader-announcement").last()).toHaveText(
    warpEndedCopy,
  );
  await expect(notificationStack.getByTestId("game-notification").filter({ hasText: warpEndedCopy }))
    .toHaveCount(0);
});
