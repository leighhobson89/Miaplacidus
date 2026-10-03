import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

test("first run starts with the pioneer name screen and reaches a ready Hydrogen state @app-boot", async ({
  page,
  browserErrors,
}, testInfo) => {
  await page.goto("/?testSeed=90210&testLocale=es");
  await expect(page.getByRole("heading", { name: "MIAPLACIDUS" })).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "welcome-screen");
  await page.getByLabel("Nombre del pionero").fill("Ada Lovelace");
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await captureVisualCheckpoint(page, testInfo, "confirmed-start");
  await page.getByRole("button", { name: "Comenzar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(page.getByTestId("hydrogen-onboarding")).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "hydrogen-first-run-briefing-es");
  await page.getByRole("button", { name: "Empezar a explorar" }).click();
  await expect(page.getByTestId("hydrogen-onboarding")).toHaveCount(0);
  await expect(page.locator(".run-name")).toHaveText("Ada Lovelace");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("150");
  await expect(page.getByRole("tab")).toHaveCount(9);
  await expect(page.getByRole("tab", { name: /Recursos/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
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
  await captureVisualCheckpoint(page, testInfo, "hydrogen-first-run");
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("es");
  expect(browserErrors).toEqual([]);
});

test("keyboard controls collect Hydrogen and navigate the nine semantic tabs @app-boot @keyboard", async ({
  freshGame,
}, testInfo) => {
  const collect = freshGame.getByRole("button", { name: "Collect 1 Hydrogen" });
  await collect.focus();
  await collect.press("Enter");
  await expect(freshGame.getByTestId("hydrogen-quantity")).toContainText("1");
  await captureVisualCheckpoint(freshGame, testInfo, "hydrogen-collected-by-keyboard");

  const resourcesTab = freshGame.getByRole("tab", { name: /Resources/ });
  await resourcesTab.focus();
  await resourcesTab.press("ArrowRight");
  await expect(freshGame.getByRole("tab", { name: /Energy/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(freshGame.locator("#pane-energy")).toBeVisible();
  await expect(freshGame.locator("#pane-energy")).toContainText("Locked");
  await captureVisualCheckpoint(freshGame, testInfo, "locked-energy-pane");
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
  const headings = new Set<string>();
  for (const locale of ["en", "es", "pt", "de", "it", "fr"]) {
    await freshGame.locator("#hydrogen-locale").selectOption(locale);
    const heading = freshGame.getByRole("heading", { level: 2 });
    await expect(heading).toBeVisible();
    headings.add((await heading.innerText()).trim());
    expect(await freshGame.evaluate(() => document.documentElement.lang)).toBe(locale);
  }
  expect(headings.size).toBe(6);
});

test("the Hydrogen controls remain usable at a narrow viewport @app-boot @responsive", async ({
  freshGame,
}) => {
  await freshGame.setViewportSize({ width: 390, height: 844 });
  await freshGame.locator("#hydrogen-locale").selectOption("de");
  await expect(freshGame.locator(".collect-button")).toBeVisible();
  await expect
    .poll(() => freshGame.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});
