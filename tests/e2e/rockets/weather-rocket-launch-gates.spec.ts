import { expect, test } from "../_harness/fixtures";
import { ROCKET_FUEL_CAPACITY } from "../../../src/content/space";
import { rocketText } from "../../../src/i18n/rocketMessages";

async function startRocketFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261014&testLocale=en&economyFixture=space-rocket-fuel-pump");
  await page.getByLabel("Pioneer name").fill("Weather Launch Gate Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const dismissTutorial = page.getByRole("button", { name: "No thanks", exact: true });
  if (await dismissTutorial.isVisible()) await dismissTutorial.click();
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
}

async function setWeather(
  page: import("@playwright/test").Page,
  condition: "clear" | "rain" | "volcano",
): Promise<void> {
  const accepted = await page.evaluate((weather) =>
    window.miaplacidusTest!.dispatch({ type: "space.weather.set-condition", condition: weather }),
  condition);
  expect(accepted, `the ${condition} weather setup should be accepted`).toBe(true);
}

test("Rain and Volcano block a full Rocket launch until Clear weather @weather @rockets", async ({
  page,
}) => {
  await startRocketFixture(page);
  const rocket = page.getByTestId("rocket-card-rocket1");
  const buyPump = rocket.getByRole("button", {
    name: rocketText("en", "buyPump"),
    exact: true,
  });
  await expect(buyPump).toBeEnabled();
  await buyPump.click();

  const stateAfterPurchase = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateAfterPurchase.run.space.rockets.rocket1.fuelPumpPurchased).toBe(true);
  expect(stateAfterPurchase.run.space.rockets.rocket1.fuelPumpEnabled).toBe(true);
  const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");
  const remainingMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
  expect(remainingMs).toBeGreaterThan(0);
  await page.evaluate((duration) => window.miaplacidusTest!.advanceBy(duration + 1), remainingMs);

  const fueledState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(fueledState.run.space.rockets.rocket1.fuelQuantity).toBe(ROCKET_FUEL_CAPACITY.rocket1);
  expect(fueledState.run.space.rockets.rocket1.fuelPumpEnabled).toBe(false);
  const launch = rocket.getByRole("button", { name: rocketText("en", "launch"), exact: true });
  const launchReason = page.locator("#rocket-rocket1-launch-reason");

  for (const condition of ["rain", "volcano"] as const) {
    await setWeather(page, condition);
    const blockedState = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(blockedState.run.space.currentSystemWeather).toBe(condition);
    expect(blockedState.run.space.rockets.rocket1.phase).toBe("ready");
    expect(blockedState.run.space.rockets.rocket1.fuelQuantity).toBe(ROCKET_FUEL_CAPACITY.rocket1);
    await expect(launch).toBeDisabled();
    await expect(launchReason).toHaveText(rocketText("en", "reasonWeatherBlocked"));
  }

  await setWeather(page, "clear");
  await expect(launch).toBeEnabled();
  await expect(launchReason).toHaveCount(0);
  await launch.click();
  expect(
    (await page.evaluate(() => window.miaplacidusTest!.getState())).run.space.rockets.rocket1.phase,
  ).toBe("orbit");
});
