import { expect, test } from "../_harness/fixtures";

test("turning off autosave shows the source warning for five seconds @notifications @p08-autosave-off", async ({ freshGame }) => {
  const game = freshGame;
  await game.locator("#tab-settings").click();
  await game.locator("#tab-settings-saves").click();
  const autoSave = game.getByRole("checkbox", { name: "Automatic saving", exact: true });
  if (!(await autoSave.isChecked())) await autoSave.check();
  await autoSave.uncheck();

  const notice = game.locator('[data-testid="game-notification"][data-classification="loadSave"]');
  await expect(notice).toHaveCount(1);
  await expect(notice).toHaveText("AUTOSAVE IS OFF, REMEMBER TO BACK UP SAVES MANUALLY");
  await expect(notice).toHaveClass(/notification-error/);
  await expect(autoSave).not.toBeChecked();
  await game.waitForTimeout(3_200);
  await expect(notice).toHaveCount(1);
  await expect(notice).toHaveCount(0, { timeout: 2_500 });
});
