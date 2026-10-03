import { expect, test } from "../_harness/fixtures";

test("records frame and heap metrics with four active rockets @performance @rockets", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=314159&testLocale=en&economyFixture=space-late-game");
  await page.getByLabel("Pioneer name").fill("Late Game Performance Pioneer");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByTestId("hydrogen-onboarding").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Begin exploring" }).click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const fixture = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      rockets: Object.values(state.run.space.rockets).filter(
        (rocket) => rocket.phase !== "assembly",
      ).length,
      reservedAsteroids: state.run.space.asteroids.filter(
        (asteroid) => asteroid.reservedBy !== null,
      ).length,
    };
  });
  expect(fixture).toEqual({ rockets: 4, reservedAsteroids: 4 });

  await page.locator("#tab-space-mining").click();
  const pane = page.getByTestId("space-mining-pane");
  await expect(pane.locator("[data-testid^='rocket-card-']")).toHaveCount(4);
  await page.waitForTimeout(5_000);

  const gatewayMetrics = await page.evaluate(() => window.miaplacidusTest?.readFrameMetrics());
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  const cdp = await session.send("Performance.getMetrics");
  const metrics = Object.fromEntries(cdp.metrics.map((entry) => [entry.name, entry.value]));
  const result = {
    fixture,
    durationMs: gatewayMetrics?.durationMs,
    frames: gatewayMetrics?.frames,
    framesPerSecond: gatewayMetrics?.framesPerSecond,
    jsHeapUsedMiB:
      metrics.JSHeapUsedSize === undefined
        ? null
        : Number((metrics.JSHeapUsedSize / (1024 * 1024)).toFixed(2)),
    domNodes: metrics.Nodes ?? null,
    eventListeners: metrics.JSEventListeners ?? null,
  };
  await testInfo.attach("space-late-game-performance.json", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  console.log("SPACE_LATE_GAME_PERFORMANCE " + JSON.stringify(result));
  expect(result.frames).toBeGreaterThan(50);
  expect(result.framesPerSecond).toBeGreaterThan(10);
  expect(result.jsHeapUsedMiB).not.toBeNull();
  expect(result.jsHeapUsedMiB!).toBeLessThan(256);
  await session.detach();
});
