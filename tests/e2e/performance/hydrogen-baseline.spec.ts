import { expect, test } from "../_harness/fixtures";

test("records the fresh Hydrogen screen frame and heap baseline @performance", async ({
  freshGame,
}, testInfo) => {
  await freshGame.waitForTimeout(5_000);
  const gatewayMetrics = await freshGame.evaluate(() => window.miaplacidusTest?.readFrameMetrics());
  const runtime = await freshGame.evaluate(() => ({
    userAgent: navigator.userAgent,
    viewport: `${innerWidth}x${innerHeight}`,
    locale: document.documentElement.lang,
  }));
  const session = await freshGame.context().newCDPSession(freshGame);
  await session.send("Performance.enable");
  const cdp = await session.send("Performance.getMetrics");
  const metrics = Object.fromEntries(cdp.metrics.map((entry) => [entry.name, entry.value]));
  const baseline = {
    seed: 314159,
    locale: runtime.locale,
    viewport: runtime.viewport,
    userAgent: runtime.userAgent,
    durationMs: gatewayMetrics?.durationMs,
    frames: gatewayMetrics?.frames,
    framesPerSecond: gatewayMetrics?.framesPerSecond,
    jsHeapUsedMiB:
      metrics.JSHeapUsedSize === undefined
        ? null
        : Number((metrics.JSHeapUsedSize / (1024 * 1024)).toFixed(2)),
    jsHeapTotalMiB:
      metrics.JSHeapTotalSize === undefined
        ? null
        : Number((metrics.JSHeapTotalSize / (1024 * 1024)).toFixed(2)),
    domNodes: metrics.Nodes ?? null,
    eventListeners: metrics.JSEventListeners ?? null,
  };
  await testInfo.attach("hydrogen-baseline.json", {
    body: JSON.stringify(baseline, null, 2),
    contentType: "application/json",
  });
  console.log(`HYDROGEN_BASELINE ${JSON.stringify(baseline)}`);
  expect(baseline.frames).toBeGreaterThan(50);
  expect(baseline.framesPerSecond).toBeGreaterThan(10);
  await session.detach();
});
