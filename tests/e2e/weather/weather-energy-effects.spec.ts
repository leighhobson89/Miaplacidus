import { expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";

async function setWeather(
  page: import("@playwright/test").Page,
  condition: "clear" | "cloudy" | "rain" | "volcano",
): Promise<void> {
  const accepted = await page.evaluate(
    (weather) =>
      window.miaplacidusTest!.dispatch({
        type: "space.weather.set-condition",
        condition: weather,
      }),
    condition,
  );
  expect(accepted).toBe(true);
}

test("the Energy chart shows each weather modifier on solar output @weather @energy", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-buildings");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  await page
    .locator('[data-building-id="powerPlant2"] .economy-building-actions button')
    .first()
    .click();
  await page.locator("#tab-energy-summary").click();

  const chart = page.getByRole("figure", { name: "Power generation mix" });
  const solarOutput = async () => {
    const text = await chart.getByTestId("energy-generation-powerPlant2").innerText();
    return Number(text.replaceAll(",", ""));
  };

  await setWeather(page, "clear");
  await expect.poll(solarOutput).toBeGreaterThan(0);
  const clearOutput = await solarOutput();

  for (const [condition, multiplier] of [
    ["cloudy", 0.6],
    ["rain", 0.4],
    ["volcano", 0.05],
  ] as const) {
    await setWeather(page, condition);
    await expect.poll(solarOutput).toBeCloseTo(clearOutput * multiplier);
  }
});

test("rain adds its precipitation to the current system and collection total @weather @resources", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-buildings");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const startingWater = before.run.goods.water.quantity;
  const startingCollected = before.run.space.precipitationCollectedThisRun;

  await setWeather(page, "rain");
  await expect(page.getByTestId("top-location-weather")).toHaveText("Rain");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(5_000));

  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.space.precipitationCollectedThisRun - startingCollected).toBeCloseTo(5);
  expect(after.run.goods.water.quantity).toBeGreaterThanOrEqual(startingWater + 5);

  await page.getByTestId("location-status").locator(".location-status-summary").focus();
  await expect(page.getByTestId("location-precipitation-rate")).toContainText(/1(?:\.0)?\/s/);
  await expect(page.getByTestId("location-precipitation-this-run")).toContainText("5");
});
