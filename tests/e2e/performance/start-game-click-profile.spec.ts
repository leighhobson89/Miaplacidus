import { expect, test } from "../_harness/fixtures";

interface StartupTrace {
  submittedAt: number | null;
  submittedForm: string | null;
  submitToGameReadyAt: number | null;
  gameReadyAt: number | null;
  longTasks: { readonly startTime: number; readonly duration: number }[];
  longAnimationFrames: {
    readonly startTime: number;
    readonly duration: number;
    readonly paintTime: number;
    readonly presentationTime: number;
    readonly scripts: readonly {
      readonly invokerType: string;
      readonly invoker: string;
      readonly functionName: string;
      readonly sourceURL: string;
      readonly duration: number;
      readonly blockingDuration: number;
      readonly forcedStyleAndLayoutDuration: number;
    }[];
  }[];
}

test("profiles new-game form submission through first interactive game view @performance @settings-profile", async ({
  page,
}, testInfo) => {
  test.setTimeout(45_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Startup Click Profile");
  await expect(page.getByTestId("start-game")).toBeVisible();

  const session = await page.context().newCDPSession(page);
  await session.send("Profiler.enable");
  await session.send("Profiler.setSamplingInterval", { interval: 1_000 });
  await page.evaluate(() => {
    const trace: StartupTrace = {
      submittedAt: null,
      submittedForm: null,
      submitToGameReadyAt: null,
      gameReadyAt: null,
      longTasks: [],
      longAnimationFrames: [],
    };
    (window as Window & { __startupClickTrace?: StartupTrace }).__startupClickTrace = trace;
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        trace.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
      }
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((entries) => {
      for (const raw of entries.getEntries()) {
        const entry = raw as PerformanceEntry & {
          paintTime?: number;
          presentationTime?: number;
          scripts?: readonly {
            invokerType?: string;
            invoker?: string;
            sourceFunctionName?: string;
            sourceURL?: string;
            duration?: number;
            blockingDuration?: number;
            forcedStyleAndLayoutDuration?: number;
          }[];
        };
        trace.longAnimationFrames.push({
          startTime: entry.startTime,
          duration: entry.duration,
          paintTime: entry.paintTime ?? 0,
          presentationTime: entry.presentationTime ?? 0,
          scripts: Array.from(entry.scripts ?? []).map((script) => ({
            invokerType: script.invokerType ?? "",
            invoker: script.invoker ?? "",
            functionName: script.sourceFunctionName ?? "",
            sourceURL: script.sourceURL ?? "",
            duration: script.duration ?? 0,
            blockingDuration: script.blockingDuration ?? 0,
            forcedStyleAndLayoutDuration: script.forcedStyleAndLayoutDuration ?? 0,
          })),
        });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
    document.addEventListener(
      "submit",
      (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement) || trace.submittedAt !== null) return;
        trace.submittedAt = performance.now();
        trace.submittedForm = `${form.tagName}.${String(form.className)}`;
        queueMicrotask(() => {
          trace.submitToGameReadyAt = performance.now() - trace.submittedAt!;
        });
      },
      { capture: true },
    );
    const observer = new MutationObserver(() => {
      if (document.querySelector("#tab-hydrogen")) {
        trace.gameReadyAt ??= performance.now();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });

  await session.send("Profiler.start");
  const profileStartAt = await page.evaluate(() => performance.now());
  await page.getByTestId("start-game").click();
  await expect(page.locator("#tab-hydrogen")).toBeVisible();
  await page.waitForTimeout(2_000);
  const profile = await session.send("Profiler.stop");
  const measured = await page.evaluate(() => {
    const trace = (window as Window & { __startupClickTrace?: StartupTrace })
      .__startupClickTrace!;
    const from = trace.submittedAt;
    const to = from === null ? null : from + 2_000;
    return {
      ...trace,
      buildMode: document.querySelector("[data-app-ready]")?.getAttribute("data-build-mode"),
      gameReadyMs:
        from === null || trace.gameReadyAt === null ? null : trace.gameReadyAt - from,
      longTasks:
        from === null || to === null
          ? []
          : trace.longTasks
              .filter((entry) => entry.startTime >= from && entry.startTime <= to)
              .map((entry) => ({
                afterSubmitMs: Number((entry.startTime - from).toFixed(2)),
                durationMs: Number(entry.duration.toFixed(2)),
              })),
      longAnimationFrames:
        from === null || to === null
          ? []
          : trace.longAnimationFrames
              .filter((entry) => entry.startTime <= to && entry.startTime + entry.duration >= from)
              .map((entry) => ({
                afterSubmitMs: Number((entry.startTime - from).toFixed(2)),
                durationMs: Number(entry.duration.toFixed(2)),
                paintTime: Number(entry.paintTime.toFixed(2)),
                presentationTime: Number(entry.presentationTime.toFixed(2)),
                scripts: entry.scripts,
              })),
    };
  });
  const report = {
    buildMode: measured.buildMode,
    submitTarget: measured.submittedForm,
    submitToMicrotaskMs:
      measured.submitToGameReadyAt === null
        ? null
        : Number(measured.submitToGameReadyAt.toFixed(2)),
    submitToGameReadyMs: measured.gameReadyMs === null ? null : Number(measured.gameReadyMs.toFixed(2)),
    longTasks: measured.longTasks,
    longAnimationFrames: measured.longAnimationFrames,
    viewport: await page.evaluate(() => `${innerWidth}x${innerHeight}`),
    profileStartedAt: profileStartAt,
    profileSamples: (profile.profile as { samples?: readonly number[] }).samples?.length ?? 0,
  };
  await testInfo.attach("new-game-submit-profile.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
  console.log(`NEW_GAME_SUBMIT_PROFILE ${JSON.stringify(report)}`);
  expect(report.submitTarget).toContain("welcome-form");
  expect(report.submitToGameReadyMs).not.toBeNull();
  expect(report.profileSamples).toBeGreaterThan(0);
  await session.detach();
});
