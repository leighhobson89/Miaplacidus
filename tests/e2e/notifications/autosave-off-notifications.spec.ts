import { expect, test } from "../_harness/fixtures";

test("turning off autosave shows the warning for three seconds @notifications @p08-autosave-off", async ({ freshGame }) => {
  const game = freshGame;
  await game.locator("#tab-settings").click();
  await game.locator("#tab-settings-saves").click();
  const autoSave = game.locator("#settings-autosave");
  if (!(await autoSave.isChecked())) await autoSave.check();
  await autoSave.uncheck();

  const notice = game.locator('[data-testid="game-notification"][data-classification="loadSave"]');
  await expect(notice).toHaveCount(1);
  await expect(notice).toHaveText("AUTOSAVE IS OFF, REMEMBER TO BACK UP SAVES MANUALLY");
  await expect(notice).toHaveClass(/notification-error/);
  await expect(notice).toHaveAttribute("data-visible-duration-ms", "3000");
  await expect(autoSave).not.toBeChecked();
  await game.waitForTimeout(2_500);
  await expect(notice).toHaveCount(1);
  await expect(notice).toHaveCount(0, { timeout: 1_000 });
});
