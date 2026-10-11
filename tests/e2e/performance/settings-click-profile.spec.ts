import { expect, test } from "../_harness/fixtures";

interface CpuProfileNode {
  readonly id: number;
  readonly callFrame: {
    readonly functionName: string;
    readonly url: string;
    readonly lineNumber: number;
    readonly columnNumber: number;
  };
  readonly children?: readonly number[];
}

interface CpuProfile {
  readonly startTime: number;
  readonly endTime: number;
  readonly nodes: readonly CpuProfileNode[];
  readonly samples: readonly number[];
  readonly timeDeltas: readonly number[];
}

interface ProfileWindow {
  clickAt: number | null;
  endAt: number | null;
  clickTarget: string | null;
  clicks: { readonly at: number; readonly target: string; processingMs?: number }[];
  longTasks: { readonly startTime: number; readonly duration: number }[];
  longAnimationFrames: {
    readonly startTime: number;
    readonly duration: number;
    readonly blockingDuration: number;
    readonly firstUIEventTimestamp: number | null;
    readonly paintTime: number | null;
    readonly presentationTime: number | null;
    readonly scripts: readonly {
      readonly invokerType: string;
      readonly invoker: string;
      readonly functionName: string;
      readonly sourceURL: string;
      readonly sourceCharPosition: number;
      readonly duration: number;
      readonly blockingDuration: number;
      readonly forcedStyleAndLayoutDuration: number;
    }[];
  }[];
}

function summarizeProfile(profile: CpuProfile, skipFirstMs = 0, takeMs = Number.POSITIVE_INFINITY) {
  const nodesById = new Map(profile.nodes.map((node) => [node.id, node]));
  const parentsById = new Map<number, number>();
  for (const node of profile.nodes) {
    for (const childId of node.children ?? []) parentsById.set(childId, node.id);
  }

  const totals = new Map<
    string,
    {
      functionName: string;
      url: string;
      line: number;
      selfMs: number;
      inclusiveMs: number;
      selfSamples: number;
      inclusiveSamples: number;
    }
  >();
  const getTotal = (node: CpuProfileNode) => {
    const frame = node.callFrame;
    const key = `${frame.url}:${frame.lineNumber + 1}:${frame.columnNumber + 1}:${frame.functionName}`;
    let total = totals.get(key);
    if (!total) {
      total = {
        functionName: frame.functionName || "(anonymous)",
        url: frame.url,
        line: frame.lineNumber + 1,
        selfMs: 0,
        inclusiveMs: 0,
        selfSamples: 0,
        inclusiveSamples: 0,
      };
      totals.set(key, total);
    }
    return total;
  };

  let skippedMs = 0;
  let sampledWindowMs = 0;
  let activeSampledMs = 0;
  let idleMs = 0;
  let includedSamples = 0;
  for (const [index, sampleId] of profile.samples.entries()) {
    let durationMs = (profile.timeDeltas[index] ?? 0) / 1000;
    if (skippedMs < skipFirstMs) {
      const skippedFromSample = Math.min(durationMs, skipFirstMs - skippedMs);
      durationMs -= skippedFromSample;
      skippedMs += skippedFromSample;
    }
    if (sampledWindowMs >= takeMs) break;
    durationMs = Math.min(durationMs, takeMs - sampledWindowMs);
    if (durationMs <= 0) continue;
    includedSamples += 1;
    sampledWindowMs += durationMs;
    const leaf = nodesById.get(sampleId);
    if (!leaf) continue;
    if (leaf.callFrame.functionName === "(idle)") idleMs += durationMs;
    else activeSampledMs += durationMs;
    const leafTotal = getTotal(leaf);
    leafTotal.selfMs += durationMs;
    leafTotal.selfSamples += 1;

    let currentId: number | undefined = sampleId;
    while (currentId !== undefined) {
      const node = nodesById.get(currentId);
      if (!node) break;
      const total = getTotal(node);
      total.inclusiveMs += durationMs;
      total.inclusiveSamples += 1;
      currentId = parentsById.get(currentId);
    }
  }

  const appFunctions = [...totals.values()]
    .filter((entry) => entry.url.includes("/src/"))
    .sort((left, right) => right.selfMs - left.selfMs)
    .slice(0, 30)
    .map((entry) => ({
      ...entry,
      selfMs: Number(entry.selfMs.toFixed(2)),
      inclusiveMs: Number(entry.inclusiveMs.toFixed(2)),
    }));
  const focusFunctionNames = new Set([
    "tick",
    "SettingsStatisticsPane",
    "GameSession",
    "hasExactEnumerableKeys",
    "isValidGameState",
    "exactKeys",
    "createEconomyTickPlan",
    "transitionRaw",
    "checkPreconditions",
    "selectEconomyAction",
    "formatCondensedNumber",
  ]);
  const focusFunctions = [...totals.values()]
    .filter((entry) => entry.url.includes("/src/") && focusFunctionNames.has(entry.functionName))
    .sort((left, right) => right.inclusiveMs - left.inclusiveMs)
    .map((entry) => ({
      ...entry,
      selfMs: Number(entry.selfMs.toFixed(2)),
      inclusiveMs: Number(entry.inclusiveMs.toFixed(2)),
    }));
  const nonAppFunctions = [...totals.values()]
    .filter((entry) => !entry.url.includes("/src/"))
    .sort((left, right) => right.selfMs - left.selfMs)
    .slice(0, 15)
    .map((entry) => ({
      ...entry,
      selfMs: Number(entry.selfMs.toFixed(2)),
      inclusiveMs: Number(entry.inclusiveMs.toFixed(2)),
    }));

  return {
    profileWallMs: Number(((profile.endTime - profile.startTime) / 1000).toFixed(2)),
    sampledWindowMs: Number(sampledWindowMs.toFixed(2)),
    activeSampledMs: Number(activeSampledMs.toFixed(2)),
    idleMs: Number(idleMs.toFixed(2)),
    activeSamplePercent: Number(((activeSampledMs / sampledWindowMs) * 100).toFixed(1)),
    sampleCount: includedSamples,
    appFunctions,
    focusFunctions,
    nonAppFunctions,
  };
}

test("profiles game-loop work for five seconds after the first Settings click @performance @settings-profile", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const appPrefix = "miaplacidus:v1:";
    const appKeys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(appPrefix) ?? false);
    for (const key of appKeys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Settings Loop Profile");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.evaluate(() => window.miaplacidusTest!.runScenario("late-game-navigation"));
  await expect(page.locator("#tab-settings")).toBeVisible();
  await expect(page.locator("#pane-settings")).toBeHidden();
  const availableTabs = await page
    .locator(".game-nav [role=tab]")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id.replace(/^tab-/, "")));
  for (const tabId of availableTabs.filter((id) => id !== "settings")) {
    await page.locator(`#tab-${tabId}`).click();
    await expect(page.locator(`#pane-${tabId}`)).toBeVisible();
  }
  await expect(page.locator("#pane-settings")).toBeHidden();
  await page.waitForTimeout(1_000);

  const session = await page.context().newCDPSession(page);
  await session.send("Profiler.enable");
  await session.send("Profiler.setSamplingInterval", { interval: 1_000 });
  await session.send("Profiler.start");
  await page.waitForTimeout(2_000);
  const baselineResponse = await session.send("Profiler.stop");
  const baseline = summarizeProfile(baselineResponse.profile as CpuProfile);

  await page.evaluate(() => {
    const targetWindow = window as Window & { __settingsProfileWindow?: ProfileWindow };
    const record: ProfileWindow = {
      clickAt: null,
      endAt: null,
      clickTarget: null,
      clicks: [],
      longTasks: [],
      longAnimationFrames: [],
    };
    targetWindow.__settingsProfileWindow = record;
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        record.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
      }
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((entries) => {
      for (const rawEntry of entries.getEntries()) {
        const entry = rawEntry as PerformanceEntry & {
          blockingDuration?: number;
          firstUIEventTimestamp?: number;
          paintTime?: number;
          presentationTime?: number;
          scripts?: readonly {
            invokerType?: string;
            invoker?: string;
            sourceFunctionName?: string;
            sourceURL?: string;
            sourceCharPosition?: number;
            duration?: number;
            blockingDuration?: number;
            forcedStyleAndLayoutDuration?: number;
          }[];
        };
        record.longAnimationFrames.push({
          startTime: entry.startTime,
          duration: entry.duration,
          blockingDuration: entry.blockingDuration ?? 0,
          firstUIEventTimestamp: entry.firstUIEventTimestamp ?? null,
          paintTime: entry.paintTime ?? null,
          presentationTime: entry.presentationTime ?? null,
          scripts: Array.from(entry.scripts ?? []).map((script) => ({
            invokerType: script.invokerType ?? "",
            invoker: script.invoker ?? "",
            functionName: script.sourceFunctionName ?? "",
            sourceURL: script.sourceURL ?? "",
            sourceCharPosition: script.sourceCharPosition ?? -1,
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
        const tab = target.closest<HTMLElement>("#tab-settings, #tab-miaplaedia");
        if (!tab) return;
        const click = { at: performance.now(), target: tab.id };
        record.clicks.push(click);
        queueMicrotask(() => {
          click.processingMs = performance.now() - click.at;
        });
        if (tab.id !== "tab-settings" || record.clickAt !== null) return;
        record.clickAt = click.at;
        record.clickTarget = tab.id;
        performance.mark("settings-profile-click");
        window.setTimeout(() => {
          record.endAt = performance.now();
          performance.mark("settings-profile-five-seconds");
        }, 5_000);
      },
      { capture: true },
    );
  });
  await session.send("Profiler.start");
  const profileStartAt = await page.evaluate(() => performance.now());
  await page.locator("#tab-settings").click();
  await expect(page.locator("#pane-settings")).toBeVisible();
  await page.waitForFunction(
    () =>
      (window as Window & { __settingsProfileWindow?: ProfileWindow }).__settingsProfileWindow
        ?.endAt !== null,
    null,
    { timeout: 12_000 },
  );
  const profileResponse = await session.send("Profiler.stop");
  const windowDetails = await page.evaluate(() => {
    const record = (window as Window & { __settingsProfileWindow?: ProfileWindow })
      .__settingsProfileWindow;
    return {
      clickAt: record?.clickAt ?? null,
      endAt: record?.endAt ?? null,
      clickTarget: record?.clickTarget ?? null,
      clickProcessingMs:
        record?.clicks.find((entry) => entry.target === "tab-settings")?.processingMs ?? null,
      clicks: record?.clicks ?? [],
      longTasks: record?.longTasks ?? [],
      longAnimationFrames: record?.longAnimationFrames ?? [],
      activePane: document.querySelector("#panel-settings-visual")?.hidden
        ? null
        : "Visual Options",
      settingsStatisticsMounted: document.querySelector("#panel-settings-statistics > *") !== null,
      artwork: document
        .querySelector("#pane-settings .page-artwork-row")
        ?.getBoundingClientRect()
        .toJSON(),
    };
  });
  const clickToEndMs =
    windowDetails.clickAt === null || windowDetails.endAt === null
      ? null
      : Number((windowDetails.endAt - windowDetails.clickAt).toFixed(2));
  const profileStartToClickMs =
    windowDetails.clickAt === null
      ? null
      : Number((windowDetails.clickAt - profileStartAt).toFixed(2));
  const profile = summarizeProfile(
    profileResponse.profile as CpuProfile,
    profileStartToClickMs ?? 0,
    clickToEndMs ?? undefined,
  );
  const clickHotWindow = summarizeProfile(
    profileResponse.profile as CpuProfile,
    profileStartToClickMs ?? 0,
    Math.min(250, clickToEndMs ?? 250),
  );
  const report = {
    browser: await page.evaluate(() => navigator.userAgent),
    fixture: "late-game-navigation",
    mode: "test",
    viewport: await page.evaluate(() => `${innerWidth}x${innerHeight}`),
    profileStartToClickMs,
    clickToEndMs,
    clickTarget: windowDetails.clickTarget,
    clickProcessingMs: windowDetails.clickProcessingMs,
    baseline,
    first250msAfterSettingsClick: clickHotWindow,
    firstFiveSecondsAfterSettingsClick: profile,
    longTasks:
      windowDetails.clickAt === null || windowDetails.endAt === null
        ? []
        : windowDetails.longTasks
            .filter(
              (entry) =>
                entry.startTime >= windowDetails.clickAt! &&
                entry.startTime <= windowDetails.endAt!,
            )
            .map((entry) => ({
              afterClickMs: Number((entry.startTime - windowDetails.clickAt!).toFixed(2)),
              durationMs: entry.duration,
            })),
    longAnimationFrames:
      windowDetails.clickAt === null || windowDetails.endAt === null
        ? []
        : windowDetails.longAnimationFrames
            .filter(
              (entry) =>
                entry.startTime <= windowDetails.endAt! &&
                entry.startTime + entry.duration >= windowDetails.clickAt!,
            )
            .map((entry) => ({
              afterClickMs: Number((entry.startTime - windowDetails.clickAt!).toFixed(2)),
              duration: entry.duration,
              blockingDuration: entry.blockingDuration,
              firstUIEventTimestamp: entry.firstUIEventTimestamp,
              paintTime: entry.paintTime,
              presentationTime: entry.presentationTime,
              scripts: entry.scripts,
            })),
    activeSettingsChild: windowDetails.activePane,
    settingsStatisticsMounted: windowDetails.settingsStatisticsMounted,
    artworkBounds: windowDetails.artwork,
  };
  await testInfo.attach("settings-first-five-seconds-cpu-profile.json", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
  console.log(`SETTINGS_FIRST_FIVE_SECONDS_PROFILE ${JSON.stringify(report)}`);
  const scripts = report.longAnimationFrames.flatMap((frame) => frame.scripts);
  const engineValidation = profile.focusFunctions.filter((entry) =>
    ["isValidGameState", "hasExactEnumerableKeys"].includes(entry.functionName),
  );
  console.log(
    `SETTINGS_PROFILE_SUMMARY ${JSON.stringify({
      clickTarget: report.clickTarget,
      clickProcessingMs: report.clickProcessingMs,
      maxLongAnimationFrameMs: Math.max(
        0,
        ...report.longAnimationFrames.map((frame) => frame.duration),
      ),
      maxClickDispatchMs: Math.max(
        0,
        ...scripts
          .filter((script) => script.invokerType === "event-listener")
          .map((script) => script.duration),
      ),
      tickCallbackDurationsMs: scripts
        .filter((script) => script.functionName === "tick")
        .map((script) => Number(script.duration.toFixed(2))),
      longTaskDurationsMs: report.longTasks.map((entry) => entry.durationMs),
      activeSamplePercent: profile.activeSamplePercent,
      reactElementFactorySelfMs: profile.nonAppFunctions
        .filter((entry) => entry.functionName === "exports.jsxDEV")
        .reduce((total, entry) => total + entry.selfMs, 0),
      gameSessionInclusiveMs: profile.focusFunctions
        .filter((entry) => entry.functionName === "GameSession")
        .reduce((total, entry) => total + entry.inclusiveMs, 0),
      clickWindowTopFunctions: clickHotWindow.appFunctions.slice(0, 10),
      clickWindowFocusFunctions: clickHotWindow.focusFunctions,
      engineValidation,
    })}`,
  );
  expect(report.clickToEndMs).toBeGreaterThanOrEqual(4_900);
  expect(report.clickTarget).toBe("tab-settings");
  expect(report.clickProcessingMs).toBeGreaterThanOrEqual(0);
  expect(report.settingsStatisticsMounted).toBe(false);
  expect(profile.sampleCount).toBeGreaterThan(0);
  await page.locator("#tab-settings-statistics").click();
  await expect(page.getByTestId("settings-statistics")).toBeVisible();

  await session.send("Profiler.start");
  const miaplaediaProfileStartAt = await page.evaluate(() => performance.now());
  await page.locator("#tab-miaplaedia").click();
  await expect(page.locator("#pane-miaplaedia")).toBeVisible();
  await page.waitForTimeout(1_000);
  const miaplaediaProfileResponse = await session.send("Profiler.stop");
  const miaplaediaWindow = await page.evaluate(() => {
    const record = (window as Window & { __settingsProfileWindow?: ProfileWindow })
      .__settingsProfileWindow;
    const click = record?.clicks.find((entry) => entry.target === "tab-miaplaedia");
    if (!record || !click) return null;
    return {
      clickAt: click.at,
      clickTarget: click.target,
      clickProcessingMs: click.processingMs ?? null,
      elapsedMs: Number((performance.now() - click.at).toFixed(2)),
      longTasks: record.longTasks.filter(
        (entry) => entry.startTime >= click.at && entry.startTime - click.at <= 1_000,
      ),
      longAnimationFrames: record.longAnimationFrames.filter(
        (entry) =>
          entry.startTime <= click.at + 1_000 && entry.startTime + entry.duration >= click.at,
      ),
    };
  });
  expect(miaplaediaWindow?.clickTarget).toBe("tab-miaplaedia");
  const miaplaediaProfile = summarizeProfile(
    miaplaediaProfileResponse.profile as CpuProfile,
    miaplaediaWindow ? miaplaediaWindow.clickAt - miaplaediaProfileStartAt : 0,
    Math.min(1_000, miaplaediaWindow?.elapsedMs ?? 1_000),
  );
  const miaplaediaScripts = (miaplaediaWindow?.longAnimationFrames ?? []).flatMap(
    (frame) => frame.scripts,
  );
  const miaplaediaReport = {
    fixture: "late-game-navigation",
    mode: "test",
    clickTarget: miaplaediaWindow?.clickTarget ?? null,
    clickProcessingMs: miaplaediaWindow?.clickProcessingMs ?? null,
    clickToSampleEndMs: miaplaediaWindow?.elapsedMs ?? null,
    maxLongAnimationFrameMs: Math.max(
      0,
      ...(miaplaediaWindow?.longAnimationFrames ?? []).map((frame) => frame.duration),
    ),
    clickDispatchDurationsMs: miaplaediaScripts
      .filter((script) => script.invokerType === "event-listener")
      .map((script) => Number(script.duration.toFixed(2))),
    tickCallbackDurationsMs: miaplaediaScripts
      .filter((script) => script.functionName === "tick")
      .map((script) => Number(script.duration.toFixed(2))),
    longTaskDurationsMs: (miaplaediaWindow?.longTasks ?? []).map((entry) => entry.duration),
    activeSamplePercent: miaplaediaProfile.activeSamplePercent,
    focusFunctions: miaplaediaProfile.focusFunctions,
  };
  await testInfo.attach("miaplaedia-tab-click-profile.json", {
    body: JSON.stringify(miaplaediaReport, null, 2),
    contentType: "application/json",
  });
  console.log(`MIAPLAEDIA_PROFILE_SUMMARY ${JSON.stringify(miaplaediaReport)}`);
  expect(miaplaediaReport.clickProcessingMs).toBeGreaterThanOrEqual(0);
  expect(miaplaediaProfile.sampleCount).toBeGreaterThan(0);
  await session.detach();
});
