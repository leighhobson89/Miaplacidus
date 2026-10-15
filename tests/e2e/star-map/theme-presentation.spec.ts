import { expect, test } from "../_harness/fixtures";

test("Terminal keeps the Star Map canvas on its black theme background @theme-dropdowns", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Terminal Map Pioneer");
  await page.getByTestId("start-game").click();

  await page.getByRole("tab", { name: "Settings" }).click();
  await page.locator("#settings-theme").selectOption("terminal");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await expect(map).toBeVisible();
  const canvasColors = await map.getByTestId("star-map-canvas").evaluate((canvas) => {
    const viewport = canvas.parentElement;
    const background = canvas.querySelector("rect");
    if (!viewport || !background) throw new Error("Star Map canvas surface should render");
    return {
      viewport: getComputedStyle(viewport).backgroundColor,
      canvas: getComputedStyle(background).fill,
    };
  });

  expect(canvasColors).toEqual({
    viewport: "rgb(0, 0, 0)",
    canvas: "rgb(0, 0, 0)",
  });
});
