import { expect, test } from "../_harness/fixtures";

interface CpuProfileNode {
  readonly id: number;
  readonly callFrame: {
    readonly functionName: string;
    readonly url: string;
    readonly lineNumber: number;
  };
  readonly children?: readonly number[];
}

interface CpuProfile {
  readonly nodes: readonly CpuProfileNode[];
  readonly samples: readonly number[];
  readonly timeDeltas: readonly number[];
}

interface ColdClickRecord {
  clickAt: number | null;
  clickedTab: string | null;
  targetTag: string | null;
  clickToMicrotaskMs: number | null;
  paneReadyAt: number | null;
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

function summarizeTickStacks(profile: CpuProfile, skipMs: number, windowMs: number) {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const parentById = new Map<number, number>();
  for (const node of profile.nodes) {
    for (const childId of node.children ?? []) parentById.set(childId, node.id);
  }

  const stacks = new Map<string, number>();
  let skippedMs = 0;
  let measuredMs = 0;
  let tickSampleMs = 0;
  for (const [index, sampleId] of profile.samples.entries()) {
    let durationMs = (profile.timeDeltas[index] ?? 0) / 1000;
    if (skippedMs < skipMs) {
      const skipped = Math.min(durationMs, skipMs - skippedMs);
      durationMs -= skipped;
      skippedMs += skipped;
    }
    if (measuredMs >= windowMs) break;
    durationMs = Math.min(durationMs, windowMs - measuredMs);
    if (durationMs <= 0) continue;
    measuredMs += durationMs;

    const reversedPath: CpuProfileNode[] = [];
    let currentId: number | undefined = sampleId;
    while (currentId !== undefined) {
      const node = nodes.get(currentId);
      if (!node) break;
      reversedPath.push(node);
      currentId = parentById.get(currentId);
    }
    if (!reversedPath.some((node) => node.callFrame.functionName === "tick")) continue;
    tickSampleMs += durationMs;
    const stack = reversedPath
      .reverse()
      .filter((node) => node.callFrame.functionName)
      .map((node) => {
        const frame = node.callFrame;
        const url = frame.url.includes("/src/") ? frame.url.split("/src/")[1] : frame.url;
        return `${frame.functionName}@${url}:${frame.lineNumber + 1}`;
      })
      .join(" <- ");
    stacks.set(stack, (stacks.get(stack) ?? 0) + durationMs);
  }

  return {
    measuredMs: Number(measuredMs.toFixed(2)),
    tickSampleMs: Number(tickSampleMs.toFixed(2)),
    topStacks: [...stacks.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 12)
      .map(([stack, durationMs]) => ({ stack, sampledMs: Number(durationMs.toFixed(2)) })),
  };
}

test("profiles the first cold visit to Settings and identifies click and tick work @performance @settings-profile", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Settings Cold Click Profile");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.evaluate(() => window.miaplacidusTest!.runScenario("late-game-navigation"));
  await expect(page.locator("#tab-settings")).toBeVisible();
  await expect(page.locator("#pane-settings")).toBeHidden();

  const session = await page.context().newCDPSession(page);
  await session.send("Profiler.enable");
  await session.send("Profiler.setSamplingInterval", { interval: 1_000 });
  await page.evaluate(() => {
    const record: ColdClickRecord = {
      clickAt: null,
      clickedTab: null,
      targetTag: null,
      clickToMicrotaskMs: null,
      paneReadyAt: null,
      longTasks: [],
      longAnimationFrames: [],
    };
    (window as Window & { __settingsColdClick?: ColdClickRecord }).__settingsColdClick = record;
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        record.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
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
        record.longAnimationFrames.push({
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
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const tab = target.closest<HTMLElement>("#tab-settings");
        if (!tab || record.clickAt !== null) return;
        record.clickAt = performance.now();
        record.clickedTab = tab.id;
        record.targetTag = (target as HTMLElement).tagName;
        queueMicrotask(() => {
          record.clickToMicrotaskMs = performance.now() - record.clickAt!;
        });
      },
      { capture: true },
    );
    const observer = new MutationObserver(() => {
      if (document.querySelector("#pane-settings [data-testid='settings-pane']")) {
        record.paneReadyAt ??= performance.now();
        observer.disconnect();
      }
    });
    observer.observe(document.querySelector("#pane-settings")!, { childList: true, subtree: true });
  });

  await session.send("Profiler.start");
  const profileStartAt = await page.evaluate(() => performance.now());
  await page.locator("#tab-settings").click();
  await expect(page.locator("#pane-settings [data-testid='settings-pane']")).toBeVisible();
  await page.waitForTimeout(5_000);
  const profileResponse = await session.send("Profiler.stop");
  const measured = await page.evaluate(() => {
    const record = (window as Window & { __settingsColdClick?: ColdClickRecord })
      .__settingsColdClick!;
    const clickAt = record.clickAt;
    const endAt = clickAt === null ? null : clickAt + 5_000;
    return {
      ...record,
      buildMode: document.querySelector("[data-app-ready]")?.getAttribute("data-build-mode"),
      paneReadyMs:
        clickAt === null || record.paneReadyAt === null ? null : record.paneReadyAt - clickAt,
      elapsedMs: clickAt === null ? null : performance.now() - clickAt,
      longTasks:
        clickAt === null || endAt === null
          ? []
          : record.longTasks
              .filter((entry) => entry.startTime >= clickAt && entry.startTime <= endAt)
              .map((entry) => ({
                afterClickMs: Number((entry.startTime - clickAt).toFixed(2)),
                durationMs: Number(entry.duration.toFixed(2)),
              })),
      longAnimationFrames:
        clickAt === null || endAt === null
          ? []
          : record.longAnimationFrames
              .filter(
                (entry) =>
                  entry.startTime <= endAt && entry.startTime + entry.duration >= clickAt,
              )
              .map((entry) => ({
                afterClickMs: Number((entry.startTime - clickAt).toFixed(2)),
                durationMs: Number(entry.duration.toFixed(2)),
                paintTime: Number(entry.paintTime.toFixed(2)),
                presentationTime: Number(entry.presentationTime.toFixed(2)),
                scripts: entry.scripts,
              })),
      settingsResources: performance
        .getEntriesByType("resource")
        .filter((entry) => /SettingsPane|SettingsStatisticsPane|SaveManager/.test(entry.name))
        .map((entry) => ({ name: entry.name, durationMs: Number(entry.duration.toFixed(2)) })),
    };
  });
  const clickOffset = measured.clickAt === null ? 0 : measured.clickAt - profileStartAt;
  const tickStacks = summarizeTickStacks(
    profileResponse.profile as CpuProfile,
    clickOffset,
    Math.min(5_000, measured.elapsedMs ?? 5_000),
  );
  const report = {
    fixture: "late-game-navigation; no other tabs visited before Settings",
    buildMode: measured.buildMode,
    viewport: await page.evaluate(() => `${innerWidth}x${innerHeight}`),
    clickedTab: measured.clickedTab,
    targetTag: measured.targetTag,
    clickToMicrotaskMs:
      measured.clickToMicrotaskMs === null
        ? null
        : Number(measured.clickToMicrotaskMs.toFixed(2)),
    paneReadyMs: measured.paneReadyMs === null ? null : Number(measured.paneReadyMs.toFixed(2)),
    longTasks: measured.longTasks,
    longAnimationFrames: measured.longAnimationFrames,
    tickStacks,
    settingsResources: measured.settingsResources,
  };
  await testInfo.attach("settings-cold-first-visit-profile.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
  console.log(`SETTINGS_COLD_FIRST_VISIT_PROFILE ${JSON.stringify(report)}`);
  expect(report.clickedTab).toBe("tab-settings");
  expect(report.paneReadyMs).not.toBeNull();
  expect(tickStacks.measuredMs).toBeGreaterThan(0);
  await session.detach();
});
