import { expect, test } from "../_harness/fixtures";

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
  await expect(weather).toContainText("blocking rocket launches");

  expect(await setWeather(hazardousCondition)).toBe(true);
  await page.waitForTimeout(3_200);
  await expect(weather).toHaveCount(0);

  expect(await setWeather("cloudy")).toBe(true);
  expect(await setWeather("clear")).toBe(true);
  await expect(weather).toHaveCount(0);
});
