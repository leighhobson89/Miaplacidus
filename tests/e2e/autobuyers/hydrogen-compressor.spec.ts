import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

async function openTestLab(page: import("@playwright/test").Page): Promise<void> {
  const panel = page.locator(".debug-tools");
  if (!(await panel.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await panel.locator("summary").first().click();
  }
}

test("the compressor produces 2 Hydrogen per second and pauses through a command @autobuyers", async ({
  freshGame,
}, testInfo) => {
  await openTestLab(freshGame);
  await freshGame.getByRole("button", { name: "Hydrogen ready to buy" }).click();
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("50");
  await freshGame.getByRole("button", { name: "Buy compressor" }).click();
  await expect(freshGame.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  await expect(freshGame.getByTestId("hydrogen-rate")).toContainText("2");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-running");

  await openTestLab(freshGame);
  await freshGame.getByRole("button", { name: "Advance 10 seconds" }).click();
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("20");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-produced-hydrogen");
  await freshGame.getByRole("button", { name: "Pause compressor" }).click();
  await openTestLab(freshGame);
  await freshGame.getByRole("button", { name: "Advance 10 seconds" }).click();
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("20");
  await expect(freshGame.getByTestId("hydrogen-rate")).toContainText("0");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-paused");
});
