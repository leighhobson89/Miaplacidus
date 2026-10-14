import { expect, test } from "../_harness/fixtures";
import { runTestLabAction } from "../_harness/test-lab";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

test("the compressor produces 4 Hydrogen per second at B-type Spica and pauses through a command @autobuyers", async ({
  freshGame,
}, testInfo) => {
  await runTestLabAction(freshGame, "Hydrogen ready to buy");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("50");
  const autobuyerSection = freshGame.locator(".hydrogen-autobuyer-section");
  await autobuyerSection.locator(":scope > summary").click();
  await autobuyerSection.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(freshGame.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  await expect(freshGame.getByTestId("hydrogen-rate")).toContainText("4");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-running");

  await runTestLabAction(freshGame, "Advance 10 seconds");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("40");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-produced-hydrogen");
  const compressorToggle = freshGame.getByRole("button", {
    name: "Autobuyer for Hydrogen, tier 1",
    exact: true,
  });
  await expect(compressorToggle).toHaveAttribute("aria-pressed", "true");
  await compressorToggle.click();
  await expect(compressorToggle).toHaveAttribute("aria-pressed", "false");
  await runTestLabAction(freshGame, "Advance 10 seconds");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("40");
  await expect(freshGame.getByTestId("hydrogen-rate")).toContainText("0");
  await captureVisualCheckpoint(freshGame, testInfo, "compressor-paused");
});
