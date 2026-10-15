import { expect, test } from "../_harness/fixtures";

test("the production demo build stays playable without development test tools @demo-build", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "MIAPLACIDUS" })).toBeVisible();

  await page.locator("#pioneer-name").fill("Demo Pioneer");
  await page.getByTestId("start-game").click();

  const app = page.locator(".application-shell");
  await expect(app).toHaveAttribute("data-build-variant", "demo");
  await expect(page.locator("#pane-hydrogen")).toBeVisible();
  await page.getByRole("button", { name: "Collect 1 Hydrogen" }).click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("1");

  await page.keyboard.press("NumpadAdd");
  await page.keyboard.press("NumpadSubtract");
  await expect(page.locator("dialog.debug-tools")).toHaveCount(0);
});
