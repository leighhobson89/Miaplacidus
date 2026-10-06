import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

test("shows the Black Hole power upgrade cost and applies its effect @p06-affordances", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const copy = blackHoleText("en");
  await page
    .getByTestId("black-hole-research")
    .getByRole("button", {
      name: new RegExp(copy.researchAction),
    })
    .click();

  const powerUpgrade = page.getByRole("button", { name: new RegExp(copy.upgradeNames.power) });
  await expect(powerUpgrade).toContainText("850,000 RP");
  await expect(powerUpgrade).toBeEnabled();
  await powerUpgrade.click();

  const powerStat = page
    .locator(".black-hole-stats > div")
    .filter({ has: page.getByText(copy.power, { exact: true }) })
    .locator("dd");
  await expect(powerStat).toHaveText("7×");
  await expect(powerUpgrade).toContainText("960,500 RP");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        return {
          researchPoints: state.run.researchPoints,
          power: state.permanent.blackHole.power,
          nextPowerPrice: state.permanent.blackHole.powerPrice,
        };
      }),
    )
    .toEqual({ researchPoints: 1_150_000, power: 7, nextPowerPrice: 960_500 });
});

test("shows the cost and reason when Black Hole research is underfunded @black-hole", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-underfunded");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const copy = blackHoleText("en");
  const pane = page.getByTestId("black-hole-research");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText("999,999 research points");

  const research = pane.getByRole("button", { name: new RegExp(copy.researchAction) });
  await expect(research).toContainText("1,000,000 RP");
  await expect(research).toBeDisabled();
  await expect(research).toHaveAttribute("aria-describedby", "black-hole-research-reason");
  await expect(page.locator("#black-hole-research-reason")).toBeVisible();
  await expect(page.locator("#black-hole-research-reason")).toHaveText(
    copy.errors["black-hole-insufficient-research"],
  );
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.blackHole.discovered),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.blackHole.researched),
    )
    .toBe(false);
});

test("researches, charges, saves and activates the Black Hole through the player pane @black-hole", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  const blackHoleTab = page.getByRole("tab", { name: "Black Hole" });
  await blackHoleTab.click();
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
        chargeElapsedMs: timer?.elapsedMs,
        chargeStatus: timer?.status,
      };
    });
  await expect.poll(readProgress).toEqual({
    researched: true,
    researchPoints: 2_000_000,
    chargeDurationMs: 300_000,
    chargeElapsedMs: 0,
    chargeStatus: "running",
  });

  const chargeProgress = page.getByTestId("black-hole-charge-progress");
  const statusRow = page
    .locator(".black-hole-stats > div")
    .filter({ has: page.getByText(blackHoleText("en").status, { exact: true }) });
  const chargeStatus = statusRow.locator("dd");
  await expect(chargeProgress).toBeVisible();
  await expect(blackHoleTab).toHaveAttribute("aria-selected", "true");
  const initialProgress = Number(await chargeProgress.getAttribute("value"));
  const initialStatus = await chargeStatus.innerText();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!.elapsedMs,
      ),
    )
    .toBeGreaterThan(0);
  await expect(blackHoleTab).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => chargeStatus.innerText()).not.toBe(initialStatus);
  expect(Number(await chargeProgress.getAttribute("value"))).toBeGreaterThan(initialProgress);

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Galactic" }).click();
  await blackHoleTab.click();
  await expect.poll(readProgress).toMatchObject({ researched: true, chargeStatus: "running" });

  const chargeAfterReload = await page.evaluate(() => {
    const timer = window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!;
    return { durationMs: timer.durationMs, elapsedMs: timer.elapsedMs };
  });
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    chargeAfterReload.durationMs - chargeAfterReload.elapsedMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleChargeReady))
    .toBe(true);
  await expect(chargeStatus).toHaveText(blackHoleText("en").ready);
  await expect(chargeProgress).toHaveCount(0);
  const activate = page.getByRole("button", { name: blackHoleText("en").activate });
  await expect(activate).toBeEnabled();
  await activate.click();
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
