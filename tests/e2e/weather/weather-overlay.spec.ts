import { expect, test } from "../_harness/fixtures";

type PixelStats = {
  readonly visiblePixels: number;
  readonly sourceColoredPixels: number;
};

async function pixelsMatchingWeatherSource(
  page: import("@playwright/test").Page,
  weather: "rain" | "volcano",
): Promise<PixelStats> {
  return page.evaluate((expectedWeather) => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-testid='weather-effects-overlay']");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return { visiblePixels: 0, sourceColoredPixels: 0 };

    const computed = getComputedStyle(canvas);
    const sourceColor = expectedWeather === "volcano"
      ? "rgb(193 60 11)"
      : computed.getPropertyValue("--text-color").trim() || computed.color;
    const colorProbe = document.createElement("canvas").getContext("2d");
    if (!colorProbe) return { visiblePixels: 0, sourceColoredPixels: 0 };
    colorProbe.fillStyle = sourceColor;
    colorProbe.fillRect(0, 0, 1, 1);
    const expected = colorProbe.getImageData(0, 0, 1, 1).data;

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let visiblePixels = 0;
    let sourceColoredPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] === 0) continue;
      visiblePixels += 1;
      if (
        pixels[index] === expected[0] &&
        pixels[index + 1] === expected[1] &&
        pixels[index + 2] === expected[2]
      ) {
        sourceColoredPixels += 1;
      }
    }
    return { visiblePixels, sourceColoredPixels };
  }, weather);
}

async function startWeather(page: import("@playwright/test").Page, weather: "rain" | "volcano") {
  const accepted = await page.evaluate((condition) =>
    window.miaplacidusTest!.dispatch({ type: "space.weather.set-condition", condition }), weather);
  expect(accepted).toBe(true);
  await expect(page.getByTestId("weather-effects-overlay")).toHaveAttribute("data-weather", weather);
  await expect.poll(async () => (await pixelsMatchingWeatherSource(page, weather)).sourceColoredPixels)
    .toBeGreaterThan(0);
}

async function installCanvasDrawProbe(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    type CanvasProbe = { clearCalls: number; fillCalls: number };
    type ProbedWindow = Window & {
      __weatherCanvasProbe?: CanvasProbe;
    };
    const probedWindow = window as ProbedWindow;
    const canvas = document.querySelector<HTMLCanvasElement>("[data-testid='weather-effects-overlay']");
    if (!canvas) throw new Error("Weather overlay canvas is missing");
    const probe: CanvasProbe = { clearCalls: 0, fillCalls: 0 };
    const prototype = CanvasRenderingContext2D.prototype;
    const clearRect = prototype.clearRect;
    const fillRect = prototype.fillRect;
    Object.defineProperty(probedWindow, "__weatherCanvasProbe", { configurable: true, value: probe });
    prototype.clearRect = function (this: CanvasRenderingContext2D, ...args) {
      if (this.canvas === canvas) probe.clearCalls += 1;
      return clearRect.apply(this, args);
    };
    prototype.fillRect = function (this: CanvasRenderingContext2D, ...args) {
      if (this.canvas === canvas) probe.fillCalls += 1;
      return fillRect.apply(this, args);
    };
  });
}

async function canvasDrawCounts(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const root = window as Window & {
      __weatherCanvasProbe?: { clearCalls: number; fillCalls: number };
    };
    return root.__weatherCanvasProbe ?? { clearCalls: 0, fillCalls: 0 };
  });
}

async function expectAnimationStopped(page: import("@playwright/test").Page) {
  await expect.poll(async () => (await pixelsMatchingWeatherSource(page, "rain")).visiblePixels)
    .toBe(0);
  const settledDraws = await canvasDrawCounts(page);
  await page.waitForTimeout(200);
  expect(await canvasDrawCounts(page)).toEqual(settledDraws);
}

test("draws source-colored rain and lava in the hidden, fixed viewport canvas @weather @presentation", async ({
  freshGame,
}) => {
  const canvas = freshGame.getByTestId("weather-effects-overlay");
  await expect(canvas).toHaveAttribute("aria-hidden", "true");

  const bounds = await canvas.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      position: getComputedStyle(element).position,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  expect(bounds).toEqual({
    position: "fixed",
    x: 0,
    y: 0,
    width: bounds.viewportWidth,
    height: bounds.viewportHeight,
    viewportWidth: bounds.viewportWidth,
    viewportHeight: bounds.viewportHeight,
  });

  await startWeather(freshGame, "rain");
  const rainPixels = await pixelsMatchingWeatherSource(freshGame, "rain");
  expect(rainPixels.visiblePixels).toBeGreaterThan(0);
  expect(rainPixels.sourceColoredPixels).toBeGreaterThan(0);

  await startWeather(freshGame, "volcano");
  const lavaPixels = await pixelsMatchingWeatherSource(freshGame, "volcano");
  expect(lavaPixels.visiblePixels).toBeGreaterThan(0);
  expect(lavaPixels.sourceColoredPixels).toBeGreaterThan(0);
});

test("weather, weather-effects and reduced-motion changes clear and stop overlay frames @weather @settings", async ({
  freshGame,
}) => {
  const canvas = freshGame.getByTestId("weather-effects-overlay");
  await installCanvasDrawProbe(freshGame);
  await startWeather(freshGame, "rain");
  await expect.poll(async () => (await canvasDrawCounts(freshGame)).clearCalls).toBeGreaterThan(1);

  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await settings.locator("#settings-weather-effects").uncheck();
  await expect(freshGame.locator(".game-frame")).toHaveAttribute("data-weather-effects", "off");
  await expectAnimationStopped(freshGame);

  await settings.locator("#settings-weather-effects").check();
  await expect.poll(async () => (await pixelsMatchingWeatherSource(freshGame, "rain")).sourceColoredPixels)
    .toBeGreaterThan(0);
  await settings.locator("#settings-motion").check();
  await expect(freshGame.locator(".game-frame")).toHaveAttribute("data-reduced-motion", "true");
  await expectAnimationStopped(freshGame);

  await settings.locator("#settings-motion").uncheck();
  await expect.poll(async () => (await pixelsMatchingWeatherSource(freshGame, "rain")).sourceColoredPixels)
    .toBeGreaterThan(0);

  const accepted = await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "space.weather.set-condition", condition: "clear" }),
  );
  expect(accepted).toBe(true);
  await expect(canvas).toHaveAttribute("data-weather", "clear");
  await expectAnimationStopped(freshGame);
});
