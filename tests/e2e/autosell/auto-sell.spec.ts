import { devices } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { expandHydrogenAutobuyers, setAllocationSlider, startEconomyFixture } from "../_harness/economyFixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

test("player-set allocations sell only new Hydrogen and Carbon production @autosell @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  for (const id of ["diesel", "glass", "steel", "concrete", "water", "titanium"]) {
    await page.locator(`#tab-compounds-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    await card.locator("details").locator("summary").click();
    const autoCreate = card.getByLabel("Automatic creation");
    if (await autoCreate.isChecked()) await autoCreate.uncheck();
  }
  await page.locator("#tab-hydrogen").click();
  const hydrogenAllocation = page
    .locator('[data-resource-id="hydrogen"]')
    .locator("details")
    .filter({ hasText: "Production allocation" });
  await hydrogenAllocation.locator("summary").click();
  const cashHandle = hydrogenAllocation.getByRole("slider", { name: "Cash share (%)" });
  const compoundHandle = hydrogenAllocation.getByRole("slider", { name: "Compound share (%)" });
  const track = hydrogenAllocation.locator(".allocation-slider-track");
  const trackBounds = await track.boundingBox();
  expect(trackBounds).not.toBeNull();
  await cashHandle.focus();
  const initialCashShare = Number(await cashHandle.getAttribute("aria-valuenow"));
  await cashHandle.press("ArrowRight");
  await expect(cashHandle).toHaveAttribute("aria-valuenow", String(initialCashShare + 5));
  await page.mouse.move(
    trackBounds!.x + trackBounds!.width * 0.2,
    trackBounds!.y + trackBounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    trackBounds!.x + trackBounds!.width * 0.4,
    trackBounds!.y + trackBounds!.height / 2,
    { steps: 4 },
  );
  await page.mouse.up();
  await expect(cashHandle).toHaveAttribute("aria-valuenow", "40");
  const compoundBoundaryBeforeKey = Number(await compoundHandle.getAttribute("aria-valuenow"));
  const compoundShareBeforeKey = compoundBoundaryBeforeKey - 40;
  await compoundHandle.focus();
  await compoundHandle.press("ArrowRight");
  await expect(compoundHandle).toHaveAttribute(
    "aria-valuenow",
    String(compoundBoundaryBeforeKey + 5),
  );
  await expect(compoundHandle).toHaveAttribute(
    "aria-valuetext",
    `Compound share: ${compoundShareBeforeKey + 5}%`,
  );
  await expect(
    hydrogenAllocation.getByText(`Retained share: ${95 - compoundBoundaryBeforeKey}%`),
  ).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "economy-production-allocation-slider");
  await hydrogenAllocation.locator("summary").click();
  const initialCash = await page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
  for (const id of [
    "hydrogen",
    "helium",
    "carbon",
    "neon",
    "oxygen",
    "sodium",
    "silicon",
    "iron",
  ] as const) {
    await page.locator(`#tab-resources-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    const allocation = card.locator("details").filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    await setAllocationSlider(allocation, "Cash share", 100);
    await expect(allocation.getByText("Retained share: 0%")).toBeVisible();
    await allocation.locator("summary").click();
  }
  await page.locator("#tab-resources-hydrogen").click();
  await expandHydrogenAutobuyers(page.locator('[data-resource-id="hydrogen"]'));
  await page.getByRole("button", { name: "Buy compressor" }).click();
  await expect(
    page.getByRole("button", { name: "Autobuyer for Hydrogen, tier 1" }),
  ).toBeVisible();
  await page.locator("#tab-resources-carbon").click();
  const carbon = page.locator('[data-resource-id="carbon"]');
  const carbonBuyers = carbon.locator("details").filter({ hasText: "Buy tier 1" });
  await carbonBuyers.locator("summary").click();
  await carbonBuyers
    .locator(".economy-tier")
    .first()
    .getByRole("button", { name: /^Buy/ })
    .first()
    .click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() =>
      page.evaluate(
        (startingCash) => window.miaplacidusTest!.getState().run.cash - startingCash,
        initialCash,
      ),
    )
    .toBeCloseTo(11.4, 1);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity))
    .toBeCloseTo(1_950, 5);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.carbon.quantity))
    .toBeCloseTo(1_920, 5);
  await captureVisualCheckpoint(page, testInfo, "economy-player-autosell-allocation");
});

test("mobile touch can drag a resource allocation handle @autosell @resources @touch", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    baseURL: String(testInfo.project.use.baseURL),
  });
  try {
    const page = await context.newPage();
    await startEconomyFixture(page, "full");
    await page.locator("#tab-resources-hydrogen").click();
    const allocation = page
      .locator('[data-resource-id="hydrogen"]')
      .locator("details")
      .filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    const track = allocation.locator(".allocation-slider-track");
    const bounds = await track.boundingBox();
    expect(bounds).not.toBeNull();
    const touch = await context.newCDPSession(page);
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
    await expect(allocation.getByRole("slider", { name: "Cash share (%)" })).toHaveAttribute(
      "aria-valuenow",
      "60",
    );
    await expect(allocation.getByText(/Compound share:/)).toBeVisible();
  } finally {
    await context.close();
  }
});
