import { expect, test } from "../_harness/fixtures";

async function startSpaceFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("miaplacidus:fixture-cleared") === "yes") return;
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem("miaplacidus:fixture-cleared", "yes");
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Space Telescope Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("keeps Mining hidden until a rocket reaches an asteroid @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await expect(page.locator("#tab-space-mining-mining")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterUnlocked),
    )
    .toBe(false);
});

test("builds a telescope, starts an asteroid scan, and keeps its timer in game state @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  const pane = page.getByTestId("space-mining-pane");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText("$10,000");
  await expect(pane).toContainText("20,000 Iron");
  await page.getByRole("button", { name: "Build telescope" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.telescopeBuilt))
    .toBe(true);
  await expect(pane).toContainText("Telescope built");
  await page.getByRole("button", { name: "Scan for asteroids" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("asteroids");
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.timers["survey:asteroid-scan"]?.status,
      ),
    )
    .toBe("running");
  await expect(page.getByTestId("space-survey-progress")).toBeVisible();
});

test("unlocked Auto Telescope starts the selected survey mode @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build telescope" }).click();
  const controls = page.getByTestId("auto-telescope-controls");
  await expect(controls).toBeVisible();
  await controls.getByLabel("Action").selectOption("stars");
  await page.getByRole("button", { name: "Enable automation" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        enabled: window.miaplacidusTest!.getState().run.space.autoTelescopeEnabled,
        mode: window.miaplacidusTest!.getState().run.space.autoTelescopeMode,
      })),
    )
    .toEqual({ enabled: true, mode: "stars" });
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("stars");
});

test("assembles a rocket, buys its powered fuel pump, and reports fuel progress @rockets @ui-navigation", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();
  for (let rocket = 1; rocket <= 4; rocket += 1) {
    await expect(page.locator(`#tab-space-mining-rocket-${rocket}`)).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Build launch pad" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
    .toBe(true);
  await expect(page.locator("[data-testid^='rocket-card-']")).toHaveCount(4);

  const rocket = page.getByTestId("rocket-card-rocket1");
  await expect(rocket).toBeVisible();
  for (let part = 0; part < 12; part += 1) {
    await rocket.getByRole("button", { name: "Build one part" }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.builtParts),
    )
    .toBe(12);
  await expect(page.locator("#tab-space-mining-rocket-1")).toBeVisible();
  for (let otherRocket = 2; otherRocket <= 4; otherRocket += 1) {
    await expect(page.locator(`#tab-space-mining-rocket-${otherRocket}`)).toHaveCount(0);
  }
  await page.locator("#tab-space-mining-rocket-1").click();
  await rocket.getByRole("button", { name: "Buy fuel pump" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelPumpPurchased,
      ),
    )
    .toBe(true);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
      ),
    )
    .toBeCloseTo(20, 5);
});
