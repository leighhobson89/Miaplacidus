import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});

async function startFullEconomyFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("Allocation Input Tester");
  await page.getByTestId("start-game").tap();
  await expect(page.getByRole("heading", { name: "Hydrogen", exact: true })).toBeVisible();
}

test("Hydrogen allocation is grouped, keyboard adjustable, and touch draggable at 390px @p14-allocation-inputs @touch @keyboard", async ({
  page,
}) => {
  await startFullEconomyFixture(page);
  await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.clientWidth)).toBe(390);

  await page.locator("#tab-resources-hydrogen").tap();
  const allocation = page
    .locator('[data-resource-id="hydrogen"]')
    .locator("details")
    .filter({ hasText: "Production allocation" });
  await allocation.locator("summary").tap();

  const group = allocation.getByRole("group", { name: "Production allocation Hydrogen" });
  await expect(group).toBeVisible();
  const helpId = await group.getAttribute("aria-describedby");
  expect(helpId).toBe("allocation-help-hydrogen");
  await expect(allocation.locator(`#${helpId}`)).toHaveText(
    "Drag either handle to change the split. With a handle focused, use the arrow keys to move it by 5%; Home and End move it to an endpoint.",
  );

  const cashHandle = group.getByRole("slider", { name: "Cash share (%)" });
  const compoundHandle = group.getByRole("slider", { name: "Compound share (%)" });
  await expect(cashHandle).toHaveAttribute("aria-orientation", "horizontal");
  await expect(cashHandle).toHaveAttribute("aria-valuemin", "0");
  await expect(cashHandle).toHaveAttribute("aria-valuemax", "100");
  await expect(cashHandle).toHaveAttribute("aria-valuenow", "25");
  await expect(cashHandle).toHaveAttribute("aria-valuetext", "Cash share: 25%");
  await expect(compoundHandle).toHaveAttribute("aria-orientation", "horizontal");
  await expect(compoundHandle).toHaveAttribute("aria-valuemin", "25");
  await expect(compoundHandle).toHaveAttribute("aria-valuemax", "100");
  await expect(compoundHandle).toHaveAttribute("aria-valuenow", "50");
  await expect(compoundHandle).toHaveAttribute("aria-valuetext", "Compound share: 25%");

  await cashHandle.focus();
  await page.keyboard.press("ArrowRight");
  await expect(cashHandle).toHaveAttribute("aria-valuenow", "30");
  await expect(cashHandle).toHaveAttribute("aria-valuetext", "Cash share: 30%");
  await expect(allocation.getByText("Cash share: 30%")).toBeVisible();

  const track = group;
  const bounds = await track.boundingBox();
  expect(bounds).not.toBeNull();
  const touch = await page.context().newCDPSession(page);
  const y = bounds!.y + bounds!.height / 2;
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: bounds!.x + bounds!.width * 0.3, y }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: bounds!.x + bounds!.width * 0.6, y }],
  });
  await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

  await expect(cashHandle).toHaveAttribute("aria-valuenow", "60");
  await expect(cashHandle).toHaveAttribute("aria-valuetext", "Cash share: 60%");
  await expect(allocation.getByText("Cash share: 60%")).toBeVisible();
  await expect(compoundHandle).toHaveAttribute("aria-valuemin", "60");
  await expect(compoundHandle).toHaveAttribute("aria-valuenow", "60");
  await expect(compoundHandle).toHaveAttribute("aria-valuetext", "Compound share: 0%");
  await expect(allocation.getByText("Compound share: 0%")).toBeVisible();
  await expect(allocation.getByText("Retained share: 40%")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
