import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";

test("confirms, cancels, and reloads a second rebirth into the settled system", async ({
  page,
}) => {
  await startMetaFixture(page);
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Rebirth" }).click();
  const pane = page.getByTestId("rebirth-pane");
  const destination = await page.evaluate(() =>
    window.miaplacidusTest!.getState().permanent.settledSystemIds.at(-1),
  );
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints,
    ),
  ).toBe(12);

  await pane.getByRole("button", { name: "Rebirth", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "CANCEL", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => window.miaplacidusTest!.getState().permanent.rebirthCount)).toBe(
    1,
  );

  await pane.getByRole("button", { name: "Rebirth", exact: true }).click();
  const confirmation = page.getByRole("dialog", { name: "WARNING: REBIRTH!" });
  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByText("You will carry over 100 AP!", { exact: true }),
  ).toBeVisible();
  await confirmation
    .getByRole("button", { name: "RESET ALL PROGRESS AND KEEP AP", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().permanent.rebirthCount))
    .toBe(2);
  const reborn = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(reborn.run.space.currentSystemId).toBe(destination);
  expect(reborn.permanent.ascendencyPoints).toBe(100);
  expect(reborn.permanent.gloryPoints).toBe(2);
  expect(reborn.run.cash).toBe(10);
  expect(reborn.run.researchPoints).toBe(50);
  expect(reborn.run.space.ascendencyAwardedThisRun).toBe(false);
  expect(reborn.permanent.galacticCasino.casinoPoints).toBe(0);

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().permanent.rebirthCount))
    .toBe(2);
  const reloaded = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(reloaded.permanent.ascendencyPoints).toBe(100);
  expect(reloaded.permanent.gloryPoints).toBe(2);
  expect(reloaded.permanent.galacticCasino.casinoPoints).toBe(0);
  expect(reloaded.run.space.currentSystemId).toBe(destination);
});
