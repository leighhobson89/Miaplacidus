import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

async function openTestLab(page: import("@playwright/test").Page): Promise<void> {
  const panel = page.locator(".debug-tools");
  if (!(await panel.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await panel.locator("summary").first().click();
  }
}

test("manual collection sells Hydrogen and credits its catalogue value @resources @precision", async ({
  freshGame,
}, testInfo) => {
  const collect = freshGame.getByRole("button", { name: "Collect 1 Hydrogen" });
  await collect.click();
  await collect.click();
  await collect.click();
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("3");
  await expect(freshGame.getByText("Sale value: $0.06")).toBeVisible();
  await captureVisualCheckpoint(freshGame, testInfo, "hydrogen-ready-to-sell");
  await freshGame.getByRole("button", { name: "Sell", exact: true }).click();
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("0");
  await expect(freshGame.getByText("$10.06")).toBeVisible();
  await captureVisualCheckpoint(freshGame, testInfo, "hydrogen-after-sale");
  await freshGame.locator("#hydrogen-locale").selectOption("es");
  await expect(freshGame.locator(".header-balances strong").first()).toContainText("$");
  await expect(freshGame.locator(".header-balances strong").first()).not.toContainText("€");
});

test("the storage purchase charges 149 Hydrogen and doubles capacity @resources", async ({
  freshGame,
}, testInfo) => {
  await openTestLab(freshGame);
  await freshGame.getByRole("button", { name: "Hydrogen storage ready" }).click();
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("149");
  await freshGame.getByRole("button", { name: "Increase storage" }).click();
  await expect(freshGame.getByTestId("hydrogen-capacity")).toHaveText("300");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(freshGame, testInfo, "hydrogen-storage-expanded");
});
