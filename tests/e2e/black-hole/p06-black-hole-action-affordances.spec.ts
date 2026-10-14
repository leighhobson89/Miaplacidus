import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { selectEconomyAction } from "../../../src/engine/selectors";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId): Promise<void> {
  const accepted = await page.evaluate(
    (nextLocale) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      }),
    locale,
  );
  expect(accepted).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("Black Hole Recharge shortfall, recovery, charge, and warp actions match engine selection @p06-black-hole-action-affordances", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();

  const pane = page.locator(".black-hole-pane");
  const researchCommand = { type: "black-hole.research" } as const;
  const research = pane
    .getByTestId("black-hole-research")
    .locator(".space-action-help-group > .primary-button");
  const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(selectEconomyAction(initial, researchCommand)).toEqual({ enabled: true });
  await expect(research).toBeEnabled();
  await research.click();

  const powerCommand = { type: "black-hole.upgrade", upgradeId: "power" } as const;
  const durationCommand = { type: "black-hole.upgrade", upgradeId: "duration" } as const;
  const powerButton = pane
    .locator(".black-hole-upgrade")
    .nth(0)
    .getByRole("button");
  const durationButton = pane
    .locator(".black-hole-upgrade")
    .nth(1)
    .getByRole("button");
  await expect(powerButton).toBeEnabled();
  await expect(durationButton).toBeEnabled();
  expect(
    selectEconomyAction(await page.evaluate(() => window.miaplacidusTest!.getState()), powerCommand)
      .enabled,
  ).toBe(true);
  await powerButton.click();
  await durationButton.click();

  const rechargeCommand = { type: "black-hole.upgrade", upgradeId: "recharge" } as const;
  const underfunded = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(underfunded.run.researchPoints).toBeLessThan(
    underfunded.permanent.blackHole.rechargePrice,
  );
  const underfundedSelection = selectEconomyAction(underfunded, rechargeCommand);
  expect(underfundedSelection).toMatchObject({
    enabled: false,
    failure: { code: "black-hole-insufficient-research" },
  });

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const copy = blackHoleText(locale);
    const rechargeButton = pane
      .locator(".black-hole-upgrade")
      .filter({ hasText: copy.upgradeNames.recharge })
      .getByRole("button");
    await expect(rechargeButton).toContainText(
      formatNumber(
        locale,
        underfunded.permanent.blackHole.rechargePrice,
        0,
        underfunded.settings.notation,
      ),
    );
    await expect(rechargeButton).toBeDisabled();
    await expect(rechargeButton).toHaveAttribute("aria-describedby", "black-hole-recharge-reason");
    await expect(page.locator("#black-hole-recharge-reason")).toHaveText(
      copy.errors["black-hole-insufficient-research"],
    );
  }

  await setLocale(page, "en");
  const granted = await page.evaluate(() =>
    window.miaplacidusTest!.applyDebugAction("give-1m-research"),
  );
  expect(granted).toBe(true);
  const recovered = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(selectEconomyAction(recovered, rechargeCommand)).toEqual({ enabled: true });
  const rechargeButton = pane
    .locator(".black-hole-upgrade")
    .filter({ hasText: blackHoleText("en").upgradeNames.recharge })
    .getByRole("button");
  await expect(rechargeButton).toBeEnabled();
  await expect(rechargeButton).not.toHaveAttribute("aria-describedby", /.+/);

  const previousTimer = recovered.run.timers["black-hole:charge"]!;
  await rechargeButton.click();
  const recharged = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(recharged.run.researchPoints).toBe(
    recovered.run.researchPoints - recovered.permanent.blackHole.rechargePrice,
  );
  expect(recharged.permanent.blackHole.rechargeMultiplier).toBe(0.88);
  expect(recharged.permanent.blackHole.rechargePrice).toBe(1_017_000);
  expect(recharged.run.timers["black-hole:charge"]).toMatchObject({
    status: "running",
    durationMs: Math.round(previousTimer.durationMs * 0.88),
  });

  const activationCommand = { type: "black-hole.activate" } as const;
  const charging = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(selectEconomyAction(charging, activationCommand)).toMatchObject({
    enabled: false,
    failure: { code: "black-hole-charge-running" },
  });
  const chargingButton = pane.getByRole("button", { name: blackHoleText("en").charging });
  await expect(chargingButton).toBeDisabled();
  await expect(chargingButton).toHaveAttribute("aria-describedby", "black-hole-activate-reason");
  await expect(page.locator("#black-hole-activate-reason")).toHaveText(
    blackHoleText("en").errors["black-hole-charge-running"],
  );

  const timer = charging.run.timers["black-hole:charge"]!;
  await page.evaluate(
    (remaining) => window.miaplacidusTest!.advanceBy(remaining + 1),
    timer.durationMs - timer.elapsedMs,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleChargeReady))
    .toBe(true);
  const ready = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(selectEconomyAction(ready, activationCommand)).toEqual({ enabled: true });
  const activateButton = pane.getByRole("button", { name: blackHoleText("en").activate });
  await expect(activateButton).toBeEnabled();
  await activateButton.click();
  const warping = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(warping.run.blackHoleWarpActive).toBe(true);
  expect(selectEconomyAction(warping, activationCommand)).toMatchObject({
    enabled: false,
    failure: { code: "black-hole-warp-running" },
  });
  const warpButton = pane.getByRole("button", { name: blackHoleText("en").charging });
  await expect(warpButton).toBeDisabled();
  await expect(warpButton).toHaveAttribute("aria-describedby", "black-hole-activate-reason");
  await expect(page.locator("#black-hole-activate-reason")).toHaveText(
    blackHoleText("en").errors["black-hole-warp-running"],
  );
});
