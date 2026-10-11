import { expect, test } from "../_harness/fixtures";
import { precipitationForCurrentWeather, STAR_WEATHER_TIMER_ID } from "../../../src/engine/weather";
import { economyGoodName } from "../../../src/app/economyDisplay";

test("announces hazardous weather once and keeps ordinary conditions quiet @notifications", async ({
  page,
}) => {
  await page.goto("/?testSeed=20261003&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Weather Notice Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const weather = page.locator('[data-testid="game-notification"][data-classification="weather"]');
  const currentCondition = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.currentSystemWeather,
  );
  const hazardousCondition = currentCondition === "rain" ? "heavyRain" : "rain";
  const setWeather = async (condition: "clear" | "cloudy" | "rain" | "heavyRain") =>
    page.evaluate(
      (nextCondition) =>
        window.miaplacidusTest!.dispatch({
          type: "space.weather.set-condition",
          condition: nextCondition,
        }),
      condition,
    );

  expect(await setWeather(hazardousCondition)).toBe(true);
  await expect(weather).toHaveCount(1);
  await expect(weather).toHaveText("Heavy Rain!");
  await expect(weather).not.toContainText("No launches");

  expect(await setWeather(hazardousCondition)).toBe(true);
  await page.waitForTimeout(3_200);
  await expect(weather).toHaveCount(0);

  expect(await setWeather("cloudy")).toBe(true);
  expect(await setWeather("clear")).toBe(true);
  await expect(weather).toHaveCount(0);
});

test("announces timer-triggered severe weather while Hydrogen is selected @notifications @p20-announcements", async ({
  page,
}) => {
  await page.goto("/?testSeed=20261003&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Weather Timer Notice Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "space.weather.set-condition",
        condition: "clear",
      }),
    ),
  ).toBe(true);
  const hydrogenTab = page.locator("#tab-hydrogen");
  await hydrogenTab.click();
  await expect(hydrogenTab).toHaveAttribute("aria-selected", "true");

  const weatherNotice = page.locator(
    '[data-testid="game-notification"][data-classification="weather"]',
  );
  let severeWeatherReached = false;
  for (let cycle = 0; cycle < 40; cycle += 1) {
    const remainingMs = await page.evaluate((timerId) => {
      const timer = window.miaplacidusTest!.getState().run.timers[timerId];
      return timer ? Math.max(0, timer.durationMs - timer.elapsedMs) : null;
    }, STAR_WEATHER_TIMER_ID);
    expect(remainingMs).not.toBeNull();
    await page.evaluate(
      (elapsedMs) => window.miaplacidusTest!.advanceBy(elapsedMs + 1),
      remainingMs!,
    );
    const condition = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.currentSystemWeather,
    );
    if (
      condition === "rain" ||
      condition === "heavyRain" ||
      condition === "volcano"
    ) {
      severeWeatherReached = true;
      break;
    }
  }

  expect(severeWeatherReached).toBe(true);
  await expect(weatherNotice).toHaveCount(1);
  await expect(weatherNotice).toHaveRole("status");
  await expect(weatherNotice).toHaveAttribute("aria-atomic", "true");
  await expect(page.getByTestId("notification-stack")).toHaveAttribute("aria-live", "polite");
  await expect(hydrogenTab).toHaveAttribute("aria-selected", "true");
  await expect(weatherNotice).toContainText(/Heavy Rain|Volcano Eruption/);
});

test("weather notices describe unlocked rain benefits and volcanic effects @notifications @p08-weather-variants", async ({
  page,
}) => {
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-late-game");
  await page.getByLabel("Pioneer name").fill("Weather Benefits Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const weather = page.locator('[data-testid="game-notification"][data-classification="weather"]');
  const currentSpace = await page.evaluate(() => window.miaplacidusTest!.getState().run.space);
  const precipitation = precipitationForCurrentWeather({
    ...currentSpace,
    currentSystemWeather: "rain",
    weatherSystemId: currentSpace.currentSystemId,
    currentPrecipitationRate: 1,
  });
  expect(precipitation).not.toBeNull();
  const precipitationName = economyGoodName("en", precipitation!.goodId);
  const dispatchWeather = async (condition: "rain" | "volcano") =>
    page.evaluate(
      (nextCondition) =>
        window.miaplacidusTest!.dispatch({
          type: "space.weather.set-condition",
          condition: nextCondition,
        }),
      condition,
    );

  expect(await dispatchWeather("rain")).toBe(true);
  await expect(weather).toHaveText(
    `Heavy Rain! No launches until it clears, but ${precipitationName} stores benefit!`,
  );
  await expect(weather).toHaveClass(/notification-warning/);

  await page.waitForTimeout(3_200);
  expect(await dispatchWeather("volcano")).toBe(true);
  await expect(weather).toHaveText(
    "Volcano Eruption! No launches until it clears, and solar power generation severely affected!",
  );
  await expect(weather).toHaveClass(/notification-error/);
});
