import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

test("spends AP once to buy a permanent ascendency perk", async ({ page }) => {
  await startMetaFixture(page);
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Ascendency Perks" }).click();
  const pane = page.getByTestId("ascendency-pane");
  await expect(pane.getByTestId("ascendency-points")).toHaveText("100");
  await pane.getByRole("button", { name: "Purchase", exact: true }).first().click();
  await expect(pane.getByTestId("ascendency-points")).toHaveText("97");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.acquiredPerks).toContain("littleBagOfHydrogen");
  expect(state.permanent.ascendencyPoints).toBe(97);
});
