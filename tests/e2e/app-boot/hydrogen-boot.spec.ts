import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { setGameLocale } from "../_harness/settings-controls";

test("first run starts with the pioneer name screen and reaches a ready Hydrogen state @app-boot @ui-navigation", async ({
  page,
  browserErrors,
}, testInfo) => {
  await page.goto("/?testSeed=90210&testLocale=es");
  await expect(page.getByRole("heading", { name: "MIAPLACIDUS" })).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "welcome-screen");
  await expect(page.locator('label[for="pioneer-name"]')).toHaveText(/\S/u);
  await page.locator("#pioneer-name").fill("Ada Lovelace");
  await page.getByTestId("start-game").click();
  await expect(page.locator("#pane-hydrogen .pane-heading h2")).toBeVisible();
  const hydrogenPane = page.locator("#pane-hydrogen");
  await expect(hydrogenPane.locator(".pane-heading h2")).toHaveText(/\S/u);
  await captureVisualCheckpoint(page, testInfo, "hydrogen-first-run-es");
  await expect(page.locator(".run-name")).toHaveText("Ada Lovelace");
  await page.locator(".game-nav [role='tab'][aria-controls='pane-miaplaedia']").click();
  await expect(page.locator(".miaplaedia-page button")).toHaveCount(0);
  await page.locator(".game-nav [role='tab'][aria-controls='pane-hydrogen']").click();
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("150");
  await expect(page.locator(".game-nav [role='tab']")).toHaveCount(4);
  await expect(page.locator("#tab-energy")).toHaveCount(0);
  await expect(page.locator("#tab-hydrogen")).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(async () => page.evaluate(() => window.miaplacidusTest?.getState().run.clock.wallNowMs))
    .not.toBeNull();
  const state = await page.evaluate(() => window.miaplacidusTest?.getState());
  expect(state?.run.unlockedResources).toEqual(["hydrogen"]);
  expect(state?.run.goods.hydrogen).toMatchObject({
    quantity: 0,
    storageCapacity: 150,
    saleValue: 0.02,
  });
  expect(state?.run.cash).toBe(10);
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("es");
  expect(browserErrors).toEqual([]);
});

test("keyboard navigation follows the visible main-tab order @app-boot @keyboard @ui-navigation", async ({
  freshGame,
}, testInfo) => {
  const collect = freshGame.getByRole("button", { name: "Collect 1 Hydrogen" });
  await collect.focus();
  await collect.press("Enter");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("1");
  await captureVisualCheckpoint(freshGame, testInfo, "hydrogen-collected-by-keyboard");

  const visibleTabLabels = (
    await freshGame.locator(".game-nav [role='tab'] > span:first-child").allTextContents()
  ).map((label) => label.trim());
  expect(visibleTabLabels).toEqual(["Resources", "Research", "Settings", "Miaplaedia"]);
  expect(visibleTabLabels.every((label) => !/^[0-9]/.test(label))).toBe(true);
  await expect(freshGame.getByRole("tab", { name: "Energy", exact: true })).toHaveCount(0);
  await expect(freshGame.getByRole("tab", { name: "Compounds", exact: true })).toHaveCount(0);
  await expect(freshGame.getByRole("tab", { name: "Space Mining", exact: true })).toHaveCount(0);
  await expect(freshGame.getByRole("tab", { name: "Interstellar", exact: true })).toHaveCount(0);

  const resourcesTab = freshGame.getByRole("tab", { name: /Resources/ });
  await resourcesTab.focus();
  await resourcesTab.press("ArrowRight");
  await expect(freshGame.locator("#tab-research")).toHaveAttribute("aria-selected", "true");
  await expect(freshGame.locator("#pane-research")).toBeVisible();
  await expect(freshGame.getByRole("tab", { name: "Energy", exact: true })).toHaveCount(0);
});

test("the Test Lab opens and closes with the keypad plus toggle @app-boot @test-lab", async ({
  freshGame,
}) => {
  const lab = freshGame.locator("dialog.debug-tools:not(.debug-scenario-menu)");
  const collect = freshGame.getByRole("button", { name: "Collect 1 Hydrogen" });
  await collect.focus();
  await expect(collect).toBeFocused();
  await expect(lab).toHaveCount(0);
  await freshGame.keyboard.press("NumpadAdd");
  await expect(lab).toBeVisible();
  await expect(lab.getByRole("button", { name: "Close", exact: true })).toBeVisible();
  await freshGame.keyboard.press("NumpadAdd");
  await expect(lab).not.toBeVisible();
});

test("a server that cannot compile the app shows startup guidance instead of a blank page @app-boot @startup", async ({
  page,
}, testInfo) => {
  await page.route("**/src/main.tsx*", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
  await page.goto("/");
  await expect(page.locator("[data-startup-fallback]")).toBeVisible();
  await expect(page.locator("[data-startup-help]")).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText("npm run dev", { exact: false })).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "startup-server-guidance", false);
});

test("locale changes update the live Hydrogen pane @app-boot @localization", async ({
  freshGame,
}) => {
  for (const locale of ["en", "es", "pt", "de", "it", "fr"]) {
    await setGameLocale(freshGame, locale);
    const heading = freshGame.locator("#pane-hydrogen .pane-heading h2");
    await expect(heading).toHaveText(/\S/u);
    expect(await freshGame.evaluate(() => document.documentElement.lang)).toBe(locale);
  }
});

test("the Hydrogen controls remain usable at a narrow viewport @app-boot @responsive", async ({
  freshGame,
}) => {
  await freshGame.setViewportSize({ width: 390, height: 844 });
  await setGameLocale(freshGame, "de");
  await expect(freshGame.locator(".collect-button")).toBeVisible();
  await expect
    .poll(() => freshGame.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});
