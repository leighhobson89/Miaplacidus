import type { Page } from "@playwright/test";
import { expect } from "../_harness/fixtures";

export async function stabilizeStarMapVisual(page: Page): Promise<void> {
  const tutorialStatus = () =>
    page.evaluate(() => window.miaplacidusTest!.getState().permanent.progressionTutorial.status);
  if ((await tutorialStatus()) === "available") {
    await page.getByRole("button", { name: "No thanks", exact: true }).click();
    await expect.poll(tutorialStatus).toBe("dismissed");
  }
  await expect(page.locator(".progression-tutorial")).toHaveCount(0);
  const notifications = page
    .getByTestId("notification-stack")
    .locator('[data-testid="game-notification"]');

  for (const notificationsEnabled of [false, true]) {
    const accepted = await page.evaluate((enabled) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { notificationsEnabled: enabled },
      }),
      notificationsEnabled,
    );
    expect(accepted).toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled),
      )
      .toBe(notificationsEnabled);
    if (!notificationsEnabled) await expect(notifications).toHaveCount(0);
  }
}
