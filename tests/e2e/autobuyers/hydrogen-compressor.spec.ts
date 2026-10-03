import { expect, test } from "../_harness/fixtures";
import { runTestLabAction } from "../_harness/test-lab";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

test("the compressor produces 4 Hydrogen per second at B-type Spica and pauses through a command @autobuyers", async ({
  freshGame,
}, testInfo) => {
  await runTestLabAction(freshGame, "Hydrogen ready to buy");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("50");
  await freshGame.getByRole("button", { name: "Buy compressor" }).click();
  await expect(freshGame.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  await expect(freshGame.getByTestId("hydrogen-rate")).toContainText("4");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-running");

  await runTestLabAction(freshGame, "Advance 10 seconds");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("40");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-produced-hydrogen");
  await freshGame.getByRole("button", { name: "Pause compressor" }).click();
  await runTestLabAction(freshGame, "Advance 10 seconds");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("40");
  await expect(freshGame.getByTestId("hydrogen-rate")).toContainText("0");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-paused");
});
