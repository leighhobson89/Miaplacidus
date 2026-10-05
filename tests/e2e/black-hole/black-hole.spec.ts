import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";

test("researches, charges, saves and activates the Black Hole through the player pane @black-hole", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();
  const pane = page.getByTestId("black-hole-research");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText("3,000,000 research points");
  await pane.getByRole("button", { name: /Research Black Hole/ }).click();

  const readProgress = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      const timer = state.run.timers["black-hole:charge"];
      return {
        researched: state.permanent.blackHole.researched,
        researchPoints: state.run.researchPoints,
        chargeDurationMs: timer?.durationMs,
        chargeStatus: timer?.status,
      };
    });
  await expect.poll(readProgress).toEqual({
    researched: true,
    researchPoints: 2_000_000,
    chargeDurationMs: 300_000,
    chargeStatus: "running",
  });

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();
  await expect.poll(readProgress).toMatchObject({ researched: true, chargeStatus: "running" });

  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "black-hole:charge",
      }),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Activate time warp" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        active: window.miaplacidusTest!.getState().run.blackHoleWarpActive,
        multiplier: window.miaplacidusTest!.getState().run.timeWarp.multiplier,
        remainingMs: window.miaplacidusTest!.getState().run.timeWarp.remainingMs,
      })),
    )
    .toEqual({ active: true, multiplier: 5, remainingMs: 3_000 });
  await captureVisualCheckpoint(page, testInfo, "black-hole-warp-active");
});
