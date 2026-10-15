import { expect, test } from "../_harness/fixtures";

test("the startup illustration uses a black canvas with Terminal accents @theme-dropdowns", async ({
  page,
}) => {
  const assetResponse = await page.request.get("/src/assets/miaplacidus-startup-scene.svg");
  expect(assetResponse.ok()).toBe(true);
  const svg = await assetResponse.text();
  expect(svg).toContain('<rect width="960" height="300" fill="#000000" />');
  expect(svg).toContain("#00FF00");
  const graphicColors = svg.match(/#[0-9a-f]{6}/gi) ?? [];
  expect(graphicColors.length).toBeGreaterThan(0);
  expect(
    graphicColors.every(
      (color) => color.toLowerCase() === "#ffffff" || /^#00[0-9a-f]{2}00$/i.test(color),
    ),
  ).toBe(true);
});
