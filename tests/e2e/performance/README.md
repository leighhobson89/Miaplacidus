# Performance baseline: first Hydrogen screen

## Measurement matrix

| Target                      | Deterministic setup                                                                                                                                        | Metric/source                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Fresh playable screen       | Seed `314159`, English, 1280×720 viewport, named run on the Hydrogen pane; sample for about 5 seconds.                                                     | App frame counter plus Chrome DevTools heap, DOM-node and event-listener metrics.          |
| Late-game comparison target | See the planned pre-Cosmic-Rip fixture in [`tests/fixtures/README.md`](../../fixtures/README.md). It is a design only until those systems are implemented. | Reuse the same browser, viewport, sample duration and metric names for a later comparison. |

Run with `npm run test:e2e:focused -- tests/e2e/performance/hydrogen-baseline.spec.ts`. The test attaches `hydrogen-baseline.json` and prints a `HYDROGEN_BASELINE` record. Add `MIAPLACIDUS_BROWSER_CHANNEL=chrome` when needed.

## Observed result

2 October 2026, Chrome 153.0.8010.12, seed `314159`, English, 1280×720, 5.067 seconds: 306 frames (60.40 FPS), 9.24 MiB JavaScript heap used / 13.35 MiB total, 1,270 DOM nodes, 210 event listeners. This is a local baseline, not a performance acceptance threshold or a late-game measurement.

## 8 October 2026: inactive-tab scripting investigation

The requested report of 1.8–2.2 second paint delays was not reproduced in the isolated Chrome DevTools Protocol captures. The profiles used temporary Chrome profiles against `127.0.0.1:5173`; they did not read or alter the owner's save or existing browser session.

| Scenario | Main-thread evidence | Rendering evidence |
| --- | --- | --- |
| Clean idle, 12 seconds | No main-thread task exceeded 50 ms. | Paint max 0.063 ms; RasterTask max 0.135 ms; compositor cadence stayed near 16.67 ms. |
| Star Map selected, 15 seconds | 72 tasks exceeded 50 ms; longest was 116.8 ms. The 8.066-second CPU profile sampled React reconciliation through `GameSession` into hidden `StarMapPane` and `ResourceAutobuyerTiers`; autobuyer selectors repeatedly ran precondition/state validation. | Paint max 0.134 ms; RasterTask max 0.146 ms; no compositor gap exceeded 20 ms. |
| Cosmic Rip transition | 32 tasks exceeded 50 ms; longest was 259 ms, with a 157 ms FunctionCall. The Rip child was visible and its click completed in 241 ms. | Paint max 0.523 ms; RasterTask max 0.329 ms; Layout max 4.254 ms. |

The measured bottleneck was recurring JavaScript work in visited top-level tabs that remained mounted inside hidden panels and still reconciled on each 250 ms store publication. The CPU profile recorded 317/313 samples in the two development hook passes of `ResourceAutobuyerTiers`, reaching `selectEconomyAction` → `checkPreconditions` → `isValidGameState`/`exactKeys`. This supports an inactive-pane render boundary; it does **not** establish a multi-second paint or raster cause.

`src/app/App.tsx` now wraps each top-level pane's existing content in a memoized boundary. It skips React updates only while that tab is inactive, keeps the mounted pane and its local UI state, and reconciles with the latest store snapshot when the tab is selected again. The central 250 ms presentation store cadence, engine clock, accrual, events, autosave and persistence are unchanged. The focused `inactive-tab-rendering.spec.ts` Chrome regression passed 1/1: Hydrogen production continued while Resources was hidden, its hidden text stayed stable, the always-visible Run Time changed, and selecting Resources refreshed it to the latest amount.

The post-fix Cosmic Rip profile measured zero calls to hidden `StarMapPane`, `EconomyPanes`, and `ResourceAutobuyerTiers` over 8.068 seconds (the before profile recorded 76 calls to the first two and 32 to autobuyer tiers). React scheduling samples fell from 1,847/5,227 to 1,468/5,249, about 20.5%. More precisely, the V8 profiles measured 2.848s React / 0.343s tick / 3.375s total non-idle before and 2.274s React / 0.819s tick / 3.330s total non-idle after; these are sampled call-tree shares, not OS CPU time. The lower React work is offset by a heavier tick sample in the later run, leaving total non-idle sample time nearly flat (−45ms / −1.3%).

The after trace had 63 tasks over 50 ms with a maximum of 158.1 ms, but it was a stable interval rather than the earlier transition trace, so those task counts are not a direct before/after comparison. Paint max was 0.131 ms, RasterTask max 0.037 ms, Layout max 0.234 ms; 901 compositor frames had 16.665 ms median and no gap over 20 ms. No 1.8–2.2 second Paint or Raster event was reproduced. Remaining sampled work includes `tick` → audio dispatch → store dispatch → command transition → repeated `isValidGameState`/`exactKeys` validation (0.819s sampled over 8.148s); leave this simulation/validation path and its cadence unchanged. Hydrogen-only selectors still run in `GameSession` while another tab is active, but together account for only a small slice (roughly 10–13 samples per selector in this profile); no further selector optimization is included. `TopStatusBar` accounted for about 43ms over 8.15s, so it is not a measured bottleneck.

The baseline game renderer was PID 34196 on `CrRendererMain` TID 25572; the post-fix renderer was PID 3452 on `CrRendererMain` TID 33712. In a separate post-fix 12-second OS sample, renderer PID 3452 used 4.078 CPU seconds (about 34% of one logical core) and the Chrome browser process PID 20308 used 0 CPU seconds. These are isolated-profile processes and cannot be mapped to the original owner-session Chrome PIDs (including the initial hot lead PID 32872); that original PID remains unassigned to a tab.

Trace artifacts from the isolated run: `%TEMP%\miaplacidus-idle-clean-rain-trace.json`, `%TEMP%\miaplacidus-heavy-starmap-trace.json`, `%TEMP%\miaplacidus-cosmicrip-transition-trace.json`, `%TEMP%\miaplacidus-starmap-cpu-profile.json`, `%TEMP%\miaplacidus-postmemo-cosmicrip-trace.json`, and `%TEMP%\miaplacidus-postmemo-starmap-cpu-profile.json`. The results describe these measured runs and may vary with machine load and browser build.

## 8 October 2026: active rain and volcano overlay

To check the reported frame-by-frame redraw concern, rain and volcano were activated through the test gateway in a temporary Chrome profile. The page was visible, reduced motion was off, the canvas was active at 1038×788, and there were nine SVG elements with zero SVG animation elements. The measured renderer was PID 11884 (`CrRendererMain`, TID 20580); compositor TID 32132.

| Scenario | Canvas draw evidence | Paint / Raster maxima | Long tasks |
| --- | --- | --- | --- |
| Rain, first 8 seconds | 432 callbacks; one `WeatherEffectsOverlay.draw` outlier at 128.463 ms. | 0.059 ms / 0.126 ms | 2; max 129.674 ms |
| Rain, repeat 8 seconds | 430 callbacks; max 0.183 ms (15.39 ms total). | 0.356 ms / 0.102 ms | 8; max 82.281 ms |
| Volcano, 8 seconds | 432 callbacks; max 0.127 ms. | 0.313 ms / 0.138 ms | 2; max 79.541 ms |

The first rain draw outlier did not recur in the repeat or controlled comparison. Other long tasks came from React DOM work. None of the captures reproduced a multi-second Paint or Raster delay.

A same-save 8-second A/B held rain constant, with the weather timer above 90 seconds in both samples. With effects disabled there were 438 `FireAnimationFrame` events, zero overlay draws and 18 dropped-frame events. With effects enabled there were 878 animation-frame callbacks and 439 overlay draws totaling 13.82 ms (max 0.160 ms); dropped-frame events rose to 42. BeginFrame cadence stayed near 16.7 ms, and Paint/Raster maxima stayed below 0.33 ms. The changed dropped-frame count suggests compositor cost, but the short sample is noisy and DrawFrame counts differed by only five; this does not demonstrate a costly per-frame draw or multi-second stall.

Artifacts: `%TEMP%\miaplacidus-weather-rain-trace.json`, `%TEMP%\miaplacidus-weather-rain-repeat-trace.json`, `%TEMP%\miaplacidus-weather-volcano-trace.json`, `%TEMP%\miaplacidus-weather-rain-off-controlled-trace.json`, and `%TEMP%\miaplacidus-weather-rain-on-controlled-trace.json`. These were isolated from the owner's browser and save. No further overlay change is supported by these traces.

## 8 October 2026: full active-tab navigation trace

A follow-up Chrome DevTools Protocol capture traversed 55 visible main and child tabs in a temporary Chrome profile: all unlocked Resources and Compounds panes, Research and Tech Tree, Energy, Space Mining, Interstellar (including Star Map and Star Data), Galactic, Cosmic Rip, Settings, and Miaplaedia. The locked Galactic Megastructures child was unavailable in the late-game navigation fixture and was skipped. The trace contains 1.81 seconds of idle before navigation, 19.56 seconds of pane switches, and 0.91 seconds after navigation. It ran against the isolated Vite server at `127.0.0.1:9339`, with a temporary pioneer named `Tab Redraw Perf`; it did not use the owner's browser or save.

Chrome was 154.0.8037.98. The page renderer was PID 11524 (`CrRendererMain`, TID 16876); its compositor thread was TID 32260 and the GPU process was PID 3008. The isolated browser process was PID 2240, with no other pages in that profile. A separate 3-second OS sample after navigation measured renderer CPU at 0.859 seconds (28.6% of one logical core) and browser-process CPU at 0 seconds. Other Chrome processes on the host were outside this profile and are not included in the DevTools evidence.

| Signal | Idle, 1.81 seconds | Navigation, 19.56 seconds | Full measured interval |
| --- | ---: | ---: | ---: |
| Paint events / maximum | 5 / 0.102 ms | 279 / 6.726 ms | 286 / 6.726 ms |
| Layout maximum | 0.231 ms | 19.613 ms | 19.613 ms |
| UpdateLayoutTree maximum | 0.095 ms | 12.293 ms | 12.293 ms |
| RasterTask maximum | 0.054 ms | 0.326 ms | 0.326 ms |
| Main-thread tasks over 50 ms | 6 (max 58.33 ms) | 86 (max 219.94 ms) | 92 (max 219.94 ms) |
| Compositor BeginFrame gaps over 20 ms | n/a | n/a | 0; median 16.666 ms, p95 16.707 ms, max 16.795 ms |

The 219.94 ms longest task occurred during the Star Map child selection. It was a `FireAnimationFrame` containing a 217.31 ms React DOM `FunctionCall`; the enclosing app `tick` callback took about 2 ms. The largest tab-click task was 202.38 ms while opening Interstellar, with a 191.97 ms click dispatch and a 189.25 ms React DOM `FunctionCall`. A 172.24 ms task occurred on Star Data selection. The sampled React work includes JSX creation from `src/app/StarMapPane.tsx` and repeated state-shape validation in `src/engine/state.ts`; across the measured interval, the V8 profile's top sampled leaf frames were React `jsxDEV` (122 ms), `exactKeys` in `state.ts` (89 ms), React `ReactElement` (74 ms), and `formatNumber` (59 ms). These are development-server profiles, and the sample totals are V8 sampling estimates rather than wall time.

This capture did **not** reproduce the reported 1.8 to 2.2 second Paint or Raster delay. It recorded 1,345 compositor BeginFrames but only 236 DrawFrames, with 321 dropped-frame markers during active navigation; those markers show missed frame work during this scripted, high-churn sequence, while the measured BeginFrame gaps remained below 20 ms. Paint and Raster work remained short. The DOM had 115 inline SVG elements and no SVG `animate`, `animateTransform`, or `animateMotion` elements. Thus there is no evidence here of an SVG being painted every frame or of a multi-second compositor/paint stall.

A separate, smaller scripting candidate remains: `FreezeInactiveTabContent` surrounds the main pane stack in `src/app/App.tsx`, while the hidden resource and compound `EconomyRail` sidebars are rendered outside that boundary with updated state props. The React component trace contains 1,407 `EconomicGoodEmblem` spans over 22.29 seconds, including 26 during the Miaplaedia root switch while both rails were hidden. This is consistent with SVG emblem components in those hidden rails being revisited as snapshots publish; the trace does not attribute every emblem sample to a particular rail. Freezing each rail while its root tab is inactive is a bounded follow-up optimization to consider, but this evidence does not connect it to the reported multi-second Paint delay.

This capture did not take paired before/after heap samples, so it cannot establish heap growth. The trace artifact is `%TEMP%\miaplacidus-active-tab-redraw-full-trace.json` (about 105 MiB). No code change is supported as a fix for the reported 1.8 to 2.2 second Paint delay by this profile.

### Follow-up: hidden economy rails and visible paint

Reusing the same trace avoids another browser run during concurrent UI verification. In the 391.8 ms Miaplaedia root-switch interval, where both economy rails were hidden, the component track recorded 26 `EconomicGoodEmblem` spans and two `GameSession` spans. The renderer recorded only two Paint events: `#document` at 0.373 ms and the visible Miaplaedia section at 0.154 ms. Layout peaked at 0.606 ms; the six RasterTasks in that interval peaked at 0.081 ms. No Paint event named either hidden rail. Across the full trace, compositor BeginFrame gaps peaked at 16.795 ms.

This ties the candidate to recurring React-side component work, but does not show measurable visible frame, Paint, or Raster cost from hidden rails. In `src/app/App.tsx`, each `EconomyRail` uses an `aside` with the `hidden` attribute and appears before the `FreezeInactiveTabContent` wrappers; its rail buttons render `EconomicGoodEmblem` components. Freezing those inactive rails could reduce React work, but it is not supported as a fix for the reported paint delay. No source change is warranted from this follow-up.

## 8 October 2026: Settings artwork row A/B

I captured two headed Chrome 154.0.8037.98 DevTools traces using a disposable profile on a separate test-mode Vite server at `127.0.0.1:9341` (CDP 9343). The browser used the deterministic seed `20261008` and `late-game-navigation` test fixture with a temporary pioneer; no owner browser or save was opened. Each condition ran eight alternating root-tab visits to Settings and Miaplaedia, with the same child pages selected: **Settings > Visual Options** and **Miaplaedia > Early Concepts**. The first condition showed the Settings artwork row (1173 × 145 CSS px); the second used a CDP stylesheet override, `display:none`, on that row. The row remained mounted in the DOM and React tree, so this A/B tests layout/paint only, not component rendering. I did not remove a React-owned DOM subtree because that would leave React's fiber tree out of sync.

Each cell below has 8 clicks. `rAF1` is the click-to-next-animation-frame timing; `2×rAF` is the click-to-double-animation-frame timing. The final column is a fixed 120 ms follow-up check after the double-rAF callback, not a claim that all asynchronous work had stopped. The root Settings and Miaplaedia panes were selected and visible by the first rAF in all 8 root-tab clicks. Visual Options and Early Concepts were already the selected child panes throughout; the child-tab samples reselected those same tabs and do not measure a child-pane switch. The final DOM check confirmed both expected child panels were visible in each condition.

| Destination | Artwork row | rAF1 median (range) | 2×rAF median (range) | 120 ms follow-up median (range) |
| --- | --- | ---: | ---: | ---: |
| Settings root | Shown | 45.4 ms (39.2–144.6) | 75.7 ms (41.6–185.3) | 219.4 ms (162.7–306.2) |
| Settings root | `display:none` | 67.2 ms (36.5–147.0) | 78.2 ms (38.7–226.6) | 198.9 ms (159.5–346.9) |
| Settings > Visual Options | Shown | 36.2 ms (35.3–177.1) | 40.1 ms (37.7–179.8) | 160.7 ms (158.2–364.3) |
| Settings > Visual Options | `display:none` | 36.7 ms (35.2–132.8) | 39.0 ms (37.4–214.3) | 160.6 ms (158.5–335.2) |
| Miaplaedia root | Shown | 51.4 ms (20.1–142.8) | 53.8 ms (30.1–194.7) | 174.7 ms (151.1–315.7) |
| Miaplaedia root | `display:none` | 44.8 ms (21.5–86.9) | 48.3 ms (29.7–105.8) | 173.0 ms (164.1–226.5) |
| Miaplaedia > Early Concepts | Shown | 22.4 ms (18.9–53.3) | 45.4 ms (26.5–102.2) | 167.1 ms (147.5–223.5) |
| Miaplaedia > Early Concepts | `display:none` | 19.0 ms (18.4–53.6) | 45.9 ms (29.4–101.5) | 166.0 ms (150.1–222.7) |

The artwork-row change did not consistently improve either Settings or Miaplaedia navigation. In both traces, the renderer was PID 668 (`Renderer`), with main thread `CrRendererMain` TID 18360 and compositor TID 22552; the GPU process was PID 31924. Renderer CPU time was 7.76 seconds over the 12.22-second visible-row trace and 7.50 seconds over the 12.59-second hidden-row trace. The main-thread `RunTask` maxima were 143.4 ms and 145.8 ms; 31 and 24 tasks, respectively, exceeded 50 ms. The longest `FunctionCall` was 139.7 ms with the row shown and 140.2 ms with it hidden. `Paint` maxima were 0.922/0.916 ms; `RasterTask` maxima were 0.078/0.061 ms; `Layout` maxima were 0.694/1.155 ms; `UpdateLayoutTree` maxima were 1.071/1.133 ms. Compositor BeginFrame cadence remained at a 16.67 ms median (p95 16.71 ms; maximum 17.13/16.86 ms); dropped-frame markers were 94/86. These captures show no 1.8–2.2 second Paint, Raster, or tab-navigation delay. The occasional ~140 ms scripting stalls are real in this test build, but are far below the reported delay and did not produce comparable compositor gaps.

The row had no source-owned hot stack in the trace. The sampled JavaScript path was recurring app work: `App.tsx` `tick` → `audio.ts` dispatch → `engine/store.ts` dispatch → `engine/commands.ts` transition and `transitionRaw`, followed by React reconciliation (`performWorkOnRoot` → `renderRootSync` → `workLoopSync` → `updateFunctionComponent`). The V8 samples included `GameSession` plus hidden `SettingsStatisticsPane` calls (about 340 ms/310 ms inclusive sampled time) and test-only `DebugTools` calls (about 234 ms/237 ms). These are sampled call-tree estimates, not wall-clock costs of the tab click. The hidden Settings statistics subpane is a scripting lead to examine separately; it does not explain the artwork-row A/B or establish the reported multi-second paint delay. Test mode also adds `DebugTools`, so its scripting profile is not a direct production-build CPU estimate.

Artifacts: `%TEMP%\miaplacidus-settings-row-visible.json`, `%TEMP%\miaplacidus-settings-row-display-none.json`, and the matching `*-metrics.json` files. Heap was not measured in this comparison. The CSS A/B is sufficient to reject the artwork row as the measured paint-delay cause; a separate component-level profiling run would be needed before drawing conclusions about hidden Settings subtree rendering.

## 8 October 2026: Settings click and five-second game-loop profile

I profiled the first click on Settings in isolated Chrome 153.0.8010.12 using the `late-game-navigation` fixture, a temporary Pioneer, and the test-mode Vite server at `127.0.0.1:4173`. This does not open the owner's browser or save. The profile started 48.5 ms before the click and sampled 5,031.5 ms after it. The test now records the actual click target, long tasks, Long Animation Frame script attribution, and a CPU profile trimmed to the click-to-five-second interval; it also checks that Statistics is absent while Visual Options is selected and mounts when selected.

The traces supplied by the owner identify main-thread script work, not paint: the 1,276 ms `DIV#root.onsubmit` event is the start-screen submit path, while the 2,032 ms root click includes `dispatchDiscreteEvent` and two `tick` callbacks but does not identify the clicked tab. In this repeat Settings capture, the largest Long Animation Frame was 137.0 ms: React's click dispatch took 126.5 ms and forced style/layout was 0.1 ms. The 19 `tick` frames ranged from about 51 to 86.9 ms, with at most 37 ms blocking; the longest Long Task was 87 ms. The reported two-second stall was not reproduced.

The sampled hot path and code changes are:

The five-second post-change CPU profile sampled these app call-tree totals:

| Function | Self time | Inclusive time |
| --- | ---: | ---: |
| `GameSession` | 2.7 ms | 410.3 ms |
| `isValidGameState` | 60.5 ms | 209.9 ms |
| `tick` | 1.7 ms | 174.2 ms |
| `formatCondensedNumber` | 116.1 ms | 116.1 ms |
| `checkPreconditions` | 1.5 ms | 98.9 ms |
| `transitionRaw` | 3.2 ms | 84.5 ms |
| `createEconomyTickPlan` | 21.7 ms | 60.1 ms |
| `selectEconomyAction` | 0 ms | 55.2 ms |
| `hasExactEnumerableKeys` | 64.0 ms | 64.0 ms |
| remaining `exactKeys` helper | 11.1 ms | 14.3 ms |

Inclusive times overlap and must not be added together. A comparison of the measured hot paths is:

| Measurement | Before change | After change |
| --- | ---: | ---: |
| Exact-key helper self time | 254.9 ms | 64.0 ms |
| `isValidGameState` inclusive time | 532.8 ms | 209.9 ms |
| `formatCondensedNumber` self time | 243.9 ms | 116.1 ms |
| Click dispatch script duration | 137.1 ms | 126.5 ms |
| Maximum `tick` Long Animation Frame | 158.4 ms | 86.9 ms |

These are CPU-sampling totals, not wall time per invocation. The pre-change Settings profile included roughly 200 ms after the five-second marker before the profiler stopped, so the comparison is directional rather than a strict A/B. The after-change sample used 1,609.6 ms of active samples across 5,031.5 ms (32.0%), versus 2,509.4 ms across 5,265.3 ms (47.7%) in that earlier, slightly overlong sample. In a separate navigation trace, hidden `SettingsStatisticsPane` work had accounted for about 310–340 ms inclusive sampled time; it is now not mounted while Visual Options is selected.

The targeted changes are in `src/app/SettingsPane.tsx` (mount only the active Settings subpane) and `src/engine/state.ts` (check exact enumerable keys by count and own-property membership instead of sorting both key arrays). The latter preserves strict shape rejection; `tests/unit/foundation-engine.spec.ts` checks both unexpected root and nested keys. The focused Settings profile and Statistics browser check passed 2/2, the focused engine unit file passed 7/7, and TypeScript passed. The measured click and tick frames are now under 140 ms in this test run, but the owner's original two-second interaction remains unreproduced; this test-mode profile includes React development checks and `DebugTools`, so it is not a production-build CPU estimate. No heap growth claim is made.

Reproduce with `playwright test tests/e2e/performance/settings-click-profile.spec.ts --project=chromium --workers=1 --reporter=line`. The full captured console report for this run was saved as `%TEMP%\miaplacidus-settings-profile-final-pass.log`.

## 8 October 2026: measured Settings click follow-up

I repeated the same isolated Chromium/CDP test against `tab-settings` after the earlier profile and used the 250 ms CPU window after the click to separate navigation work from the five-second game loop. The profile now also identifies the actual click target and reports the narrow click window separately. It again used a disposable test-mode Pioneer, the seeded late-game navigation fixture, and the local test Vite server; it did not read or change the owner's save.

The owner's supplied 1,276 ms submit event points to starting the run, and the 2,032 ms root-click LoAF identifies `dispatchDiscreteEvent` plus two clock callbacks but does not carry a tab ID. The isolated Settings click remains much shorter and contains very little forced layout. Before these follow-up changes, the Settings click LoAF was 137.3 ms (126.5 ms in React's dispatch script, 0.1 ms forced style/layout); the longest sampled `tick` LoAF in the five seconds was 68.5 ms. After the changes, the latest run recorded a 107.0 ms click LoAF (97.2 ms dispatch, 0.2 ms forced style/layout), a 53.8 ms maximum tick LoAF, and no Long Task entries at or above 50 ms. A repeat after adding click-window attribution measured 110.4 ms, 100.1 ms dispatch, 0.1 ms forced style/layout, and a 55.4 ms tick LoAF. These short local captures show a modest scripting improvement; they do not reproduce or prove a fix for the owner's two-second event.

The profile and source inspection identified three bounded costs:

- `transitionRaw` validated the input state and then called exported `checkPreconditions`, which repeated the same full state validation. The exported function still validates direct callers; `transitionRaw` now uses a private helper after its existing input validation. State validation on transition output and in the store remains in place, as does the store's pioneer-identity check.
- The closed `DebugTools` component repeatedly built its hidden action tree and recursively flattened the whole save for the closed Test Lab. It now returns before building visual content while both dialogs are closed, builds the full state listing only while the Test Lab is open, and renders each dialog only while requested. The component stays mounted, so its state, global hold-Enter listener and Numpad toggle remain available. The focused debug-menu browser file passed 7/7.
- `formatCondensedNumber` created `Intl.NumberFormat` objects for every displayed value. A small cache keyed by locale and options preserves the formatter output. In the same test-mode profile, its five-second sampled self time fell from 68.79 ms before the cache to 4.63 ms after; this is a V8 sampling estimate, not wall time per call.

The test still shows state validation and economy tick-plan work as the main recurring engine costs. The initial `checkPreconditions` state validation is no longer duplicated inside `transitionRaw`; the separate output validations were intentionally preserved. Paint and forced layout remain small, so the current evidence supports JavaScript work rather than a repeated SVG or CSS paint as the cause. The focused Settings profile passed 1/1 after the changes; the focused foundation-engine and number-formatting unit tests passed 12/12; debug-menu browser tests passed 7/7; and TypeScript passed. No heap-growth result is claimed. The test-mode profile includes React development checks and is not a production-build benchmark.

The original two-second Settings interaction remains unreproduced. If it persists in the owner's browser, the next useful capture is a Long Animation Frame sample that records the clicked element's ID alongside its script list, so a multi-second frame can be attributed to the exact tab and call path. P-56 remains open for broader performance review.

## 8 October 2026: Settings and Miaplaedia click-work follow-up

The user's copied LoAF data points to main-thread scripting, not a two-second Paint or Raster operation. The 1,276 ms `DIV#root.onsubmit` event is the start-screen submit path. The 2,032 ms `DIV#root.onclick` entry does not include the clicked element; it lists a React event dispatch and two `tick` callbacks as separate scripts on the single main thread. That trace cannot establish which tab was clicked or what each tick was doing internally.

I profiled explicit clicks on `#tab-settings` and `#tab-miaplaedia` in isolated Chrome 153 using the deterministic `late-game-navigation` fixture at 1280×720. The test used a disposable run and the local test server; it did not load or modify the owner's save. The updated browser profile records the clicked tab, click-handler processing window, LoAF scripts, Long Tasks, and sampled CPU functions for both destinations.

The click-only sample located unnecessary Hydrogen work on root navigation: `GameSession` called the Hydrogen collection, sale, storage, and autobuyer affordability selectors even when the selected page was Settings or Miaplaedia. Their call tree includes `selectEconomyAction` and state validation. Navigation also cleared the top tab and child page in separate immediate store dispatches, and previously visited pages could publish unchanged snapshots. On leaving a tab, its subtree rendered once more before becoming frozen.

The targeted changes are:

- `src/app/App.tsx` computes Hydrogen action selectors only while the Hydrogen page is selected. The inactive tab wrapper freezes the previous child tree as soon as its tab becomes hidden, then refreshes it on return. Top-tab plus child-page visit changes are batched, already-visited entries are skipped, and duplicate child-page clears were removed.
- `src/engine/store.ts` trusts `transition()`'s already validated output instead of scanning it a second time in the store; the store still checks pioneer identity, and test/debug reducers retain full state validation. Eventless commits that return the same state no longer publish a snapshot.
- The animation-frame loop, `clock.advance` cadence, engine input/output validation, resource accrual, timers, events, autosave, and persistence logic are unchanged.

In directional same-fixture captures before and after these changes, the Settings click dispatch decreased from 80.8 ms to 25.8 ms, the largest LoAF from 86.4 ms to 53.2 ms, and sampled `isValidGameState` inclusive time in the first 250 ms from 40.36 ms to 9.95 ms. `selectEconomyAction` had 35.13 ms inclusive sampled time in the earlier click window and no samples in the final click window. The latest trace found no 50 ms Long Tasks. Miaplaedia produced no LoAF entry or Long Task in its one-second sample. These V8 values are sampling estimates and the before/after runs can vary with machine load.

The focused Chrome profile and inactive-tab production/refresh regression passed 2/2. The focused store and engine tests passed 11/11, and TypeScript passed. The exact owner-reported two-second root click and its nearly one-second tick callback remain unreproduced; the supplied LoAF lacks the target and expanded tick call stacks. P-56 remains open until that trace is attributable or the owner confirms the interaction is resolved. No heap-growth claim is made.

## 8 October 2026: static Settings and Miaplaedia render follow-up

The code audit found that Visual Options and Game Options depend on saved settings and navigation attention, not the changing run state. Their component was rebuilding on every published simulation snapshot. Previously visited Miaplaedia articles also repeated localization lookup and paragraph splitting on those snapshots. `SettingsPane` now memoizes only those two static Settings pages and refreshes them when settings or navigation-attention state changes; dynamic achievements, events, statistics, and save pages continue to receive current game state. `MiaplaediaPane` now memoizes by locale and document ID. The game loop, clock cadence, accrual, events, and persistence are unchanged.

The repeated isolated Chrome profile on the `late-game-navigation` test fixture (1280×720) recorded the Settings click target, a 51.4 ms maximum Long Animation Frame in the five-second window, a 30.2 ms `tick` callback, and no Long Tasks of 50 ms or more. The one-second Miaplaedia sample recorded no Long Animation Frame or Long Task. These are single-run test-mode measurements with CPU sampling noise; they do not establish a before/after speedup or explain the owner's 2,032 ms report. The owner trace still lacks the clicked element and expanded tick call stacks, and the installed Chrome control runtime could not attach to the owner's existing browser session. To attribute the remaining stall, capture that same interaction with the tab element ID and expanded `tick` stacks, especially `createEconomyTickPlan`, `store.dispatch`/`transition`, and subscriber/render work.

Focused validation passed: Settings/Miaplaedia profile 1/1, Settings/Miaplaedia layout checks 5/5, the six-locale Miaplaedia page matrix 1/1, the Settings preference save/resume journey 1/1, TypeScript, formatting, and scoped diff checks. The profile assertion checks the recorded Settings target and allows a measured click duration of 0 ms, which can occur at browser timer precision. No heap-growth result is claimed.

## 8 October 2026: foreground catch-up budget

The supplied 2,032 ms LoAF attributes its main-thread work to a root click dispatch and two animation-frame `tick` callbacks; it does not identify a Paint/Raster bottleneck or the clicked tab. The live loop recalculated `createEconomyTickPlan` on every animation frame. After a long frame, `advanceClock` could process four queued 250 ms slices in one synchronous callback, preserving elapsed time but allowing a catch-up burst to monopolize the UI thread.

`App.tsx` now recalculates the game tick plan on the existing 250 ms publication cadence during normal play. When time is queued after a long frame, each animation frame processes one 250 ms slice and leaves the rest in `pendingForegroundMs` for later frames. The same one-slice budget applies to visibility-change advances. The default clock API still supports its original four-slice budget for non-render-loop callers and deterministic test-clock advancement. A focused unit case verifies that one-slice callers retain and continue draining the full elapsed interval. `App.tsx` also sends parent-tab and child-page visit markers in one `navigation.attention.clear-many` transition, avoiding separate engine passes when entering Settings or another section.

The same isolated Settings CPU/LoAF profile passed 1/1 after the change. Two repeat captures measured maximum LoAFs of 53.7 ms and 58.2 ms; their longest reported `tick` scripts were 29.6 ms and 58.1 ms. One capture recorded no Long Tasks; the other recorded one 58 ms task. Neither reproduced the owner's 2,032 ms interaction. The maximum frame time is not lower than the earlier 51.4 ms sample, so the current evidence does not establish an end-to-end reduction in maximum LoAF. The five-second CPU sample attributed 4.56 ms inclusive sampled time to `tick` across three CPU samples, consistent with the reduced normal-loop cadence. Paint and forced layout were not attributed as hot scripts; no heap-growth claim is made.

Focused validation: the Settings/Miaplaedia Chrome profile passed 1/1, the clock/navigation unit files passed 27/27, and TypeScript passed. P-56 remains open until the owner’s interaction is confirmed resolved or an attributable trace provides the exact target and expanded tick call stacks. The browser profile uses an isolated disposable Pioneer and does not read or modify the owner’s save.

## 8 October 2026: repeated Settings click profile

I reran the existing focused CDP profile in isolated Chrome 153 against `#tab-settings` on the `late-game-navigation` fixture at 1280x720. The recorded click target was `tab-settings`; the click-to-microtask measurement was 0.1ms. No Long Animation Frame, Long Task, or `tick` LoAF script was recorded during the five-second Settings window. The first 250ms CPU sample still included engine validation and tick-plan work, but no long interaction frame. This confirms the current isolated Settings path is responsive in this run. It does not reproduce the owner’s two-second root click, and the supplied trace still lacks the clicked element and expanded `tick` stacks, so P-56 remains open. The focused profile passed 1/1. This test-mode CPU sample is not a production benchmark and makes no heap-growth claim.

## Queued foreground correctness

The one-slice animation-frame budget now carries pending foreground time as ordered segments with the multiplier assigned when each interval entered the queue. A delayed catch-up slice therefore keeps a finite time warp or always-on Black Hole rate even if the live timer expires before the queue drains. The queue merges adjacent segments with equal rates and remains bounded by the existing maximum elapsed-time representation.

Pause preserves accrued queued time; paused clock advances update the wall sample without adding paused time. Local save and save-as-new retain queued segments and record `wallNowMs` at the same instant as the envelope `savedAt`, so the pre-save queue resumes at foreground rate while time after the save uses the existing offline policy. Schema 45 migrates v44 pending time as normal-rate time because v44 did not persist its multiplier.

Focused verification passed 63/63 tests in `foundation-engine.spec.ts` and `local-saves.spec.ts`, including time-warp expiry during one-slice catch-up, pause with a nonzero queue, local/portable queue roundtrip, and v44 migration. TypeScript passed. The repeated Settings profile passed 1/1 with the click target recorded, 0.1 ms to the next microtask, and no Long Animation Frame, Long Task, or `tick` LoAF script in the five-second window. The owner-reported ~2 s click remains unreproduced; these isolated test-mode results do not establish that the owner’s browser stall is resolved.

## 8 October 2026: hidden economy rail render follow-up

The active-tab navigation trace showed that the hidden Resources and Compounds EconomyRail sidebars sit outside the inactive-pane memo boundary. Their children include EconomicGoodEmblem SVGs and formatted live quantities. The component trace recorded 26 emblem spans during a Miaplaedia root switch while both rails were hidden, indicating avoidable React work on a path that should be idle.

src/app/App.tsx now wraps each rail in FreezeInactiveEconomyRail. It still renders when a visible rail becomes hidden so the hidden attribute takes effect, then skips subsequent state-driven renders while the rail remains hidden. Returning to Resources or Compounds refreshes it using the latest game state, locale, and settings. Simulation ticks, snapshot cadence, accrual, events, and save behavior are unchanged.

The focused inactive-tab browser regression now checks the hidden Hydrogen rail value stays stable during a 300,000ms deterministic simulation advance and refreshes after returning to Hydrogen, while the underlying quantity increases and Run Time continues updating. The focused Chrome run passed 2/2 with the Settings profile. In that profile, #tab-settings took 0.1ms to the next microtask; the following five seconds recorded no Long Animation Frame or Long Task, and the sampled active CPU share was 8.5%. An earlier single capture before this rail change recorded two 50.8/59.1ms LoAFs, with tick scripts of 28.2/46.0ms; these runs are not a strict A/B and neither reproduces the owner's two-second event.

The owner's first 1,276ms LoAF is the start-form submit, while the 2,032ms root-click frame still does not identify its target or expand the two tick stacks. This change removes measured hidden-rail React work but does not establish the cause or resolution of that separate multi-second frame. P-56 remains open for an attributable owner-session trace or confirmation that the stall is gone. TypeScript and git diff --check passed; the focused browser files passed 2/2. No heap-growth or production-build performance claim is made.

## 8 October 2026: economy-plan reuse and transition validation

Source review found repeated derivation of `createEconomyTickPlan` for the same immutable state in the tick loop, snapshot selection, and status-bar rendering. It also found three full `isValidGameState` scans for each accepted transition: input validation, an intermediate `success()` result, and final validation after achievements. The final boundary validation already checks the result after both the command and achievements, so the intermediate scan was redundant.

`economySimulation.ts` now caches the derived economy plan in a `WeakMap` keyed by `GameState` identity. New immutable state objects always receive a fresh plan; unchanged states share the same read-only result. `commands.ts` keeps full input validation and final post-achievement validation, but removes the intermediate scan. The focused engine and economy tests passed 41/41, including strict invalid-input rejection and a new cache reuse/invalidation regression. TypeScript passed.

The same isolated Chrome 153 Settings profile against `late-game-navigation` at 1280x720 showed, before the validation change, 48.05ms sampled inclusive time in `isValidGameState`, 32.64ms in `tick`, 14.43ms in `transitionRaw`, two LoAFs (99.6ms maximum, with 75.2ms and 51.3ms `tick` scripts), and two 50ms+ Long Tasks. Two repeats after both changes recorded 15.06ms/15.02ms in `isValidGameState`; their sampled `tick` totals were 17.17ms and 27.53ms. Neither repeat recorded a LoAF or Long Task in the five-second window. CPU values are V8 sampling estimates from individual runs; the LoAF difference is not a direct reproduction of the owner's ~2s frame. The supplied trace still lacks a clicked element and expanded `tick` stacks, so P-56 remains open pending owner confirmation or an attributable capture. This test-mode profile does not establish production performance or heap growth.

## 8 October 2026: repeated save-index rebuild on the start form

The owner's 1,276ms `DIV#root.onsubmit` frame is the Pioneer start form, not a Settings-tab event: `SaveStartScreen` is the app's only form. Its `startSelectedRun` handler queried the repository twice (`list()` for a selected save and `findByName()` for a new name). Both paths previously rebuilt the save index every time, scanning local-storage keys and decompressing every current and older save generation. This work ran synchronously in the submit handler and could grow with the save history.

`src/persistence/repository.ts` now keeps a per-repository index snapshot after a rebuild. Repeated listings reuse it while the storage key count and index value remain unchanged; browser storage events invalidate it for other-tab writes. Successful commits update the cached index incrementally and retain prior generations as recovery entries. A detected concurrent or interrupted write falls back to the full rebuild. Full decoding and envelope validation remain on explicit save reads and on cache refresh. This removes repeated full scans from `findByName` and the start form's second listing without changing save identity, validation, or conflict behavior.

The focused local-save tests passed 53/53, including a new regression that verifies repeated lookup performs no storage-key scan and that another repository's committed save invalidates the warm cache. TypeScript passed. Repeating the isolated Settings/Miaplaedia Chrome profile passed 1/1; the Settings tab click measured 0.1ms to the next microtask, with no Long Animation Frame, Long Task, or `tick` LoAF script during the following five seconds. That profile clears local storage and does not stress a large save history, so the cache regression is the direct evidence for the start-form hot path rather than a measured before/after form duration.

The owner's separate 2,032ms root-click frame still omits the clicked element and expanded `tick` call stacks. The repeated isolated Settings route did not reproduce it, so this change addresses the demonstrated start-form cost but does not establish the cause or resolution of that separate click. P-56 remains open for an attributable capture or owner confirmation. No Paint/Raster bottleneck, heap-growth result, or production-build speedup is claimed.

## 9 October 2026: repeat against the supplied Settings-click report

I reran the focused Chrome DevTools Protocol profile on the same `late-game-navigation` fixture at 1280x720. It recorded the actual `#tab-settings` target, a 0.1ms click-to-microtask interval, no Long Animation Frame or Long Task in the following five seconds, and no `tick` script in a LoAF. The sampled active CPU share over that window was 8.4%. In the first 250ms after the click, sampled inclusive time was 25.83ms in `isValidGameState` and 23.03ms in `selectEconomyAction`; these are sampling estimates across the window, not per-call wall durations. The 2.1-second pre-click sample included 204.01ms of `isValidGameState` inclusive samples and 55.12ms in exact-key checks.

This repeat supports that the current isolated Settings route is responsive and that the existing validation, selector, hidden-pane, and bounded-catch-up changes remain active. It does not reproduce the reported 2,032ms root-click frame. The supplied LoAF still does not include the clicked element ID or an expanded call tree for its two `tick` entries, and the 1,276ms `onsubmit` entry belongs to the Pioneer start form. No new hot path was demonstrated in this repeat, so no additional simulation or timing code was changed. The next needed evidence for the remaining report is a trace from the slow interaction that includes its target element and expanded `tick` stacks; P-56 remains open. The focused profile passed 1/1. This is an isolated test-mode sample, not a production benchmark or a heap-growth result.

## 9 October 2026: repeat after the owner supplied LoAF details

I reran `settings-click-profile.spec.ts` in installed Chrome 153 with the same deterministic `late-game-navigation` fixture and 1280x720 viewport. The test recorded `#tab-settings` as the target, no Long Animation Frame or Long Task during the five seconds after the click, and no `tick` LoAF script. The click-to-microtask interval rounded to 0ms. The CPU sample contained about 2ms inclusive in `tick` across two samples; the first 250ms window contained 23.95ms inclusive in `isValidGameState` and 24.32ms in `selectEconomyAction`. These are sampling estimates, not per-call durations. The five-second active-sample share was 7.9%.

This repeat again does not reproduce the owner-reported 2,032ms frame. The live Chrome control bridge could not start in this environment, and the reported `DIV#root.onclick` record still omits the actual clicked element and the internal `tick` call trees. The focused test passed 1/1. No further code change is justified by this isolated profile; P-56 stays open for a trace that identifies the target and expands both `tick` stacks, or confirmation that the live interaction is resolved. This is not a production benchmark or a heap-growth measurement.

## 9 October 2026: defer hidden tab element construction

I strengthened the Settings profile to visit every unlocked top-level tab before measuring the first Settings click, so the hidden-pane case includes all previously opened page trees. The profile still recorded no Long Animation Frame or Long Task in the five-second Settings window, and did not reproduce the owner's two-second event. Its pre-change CPU sample did show avoidable React element construction in the hidden panes: `exports.jsxDEV` sampled 313.46ms self time and `GameSession` 267.52ms inclusive time across the five-second window.

`src/app/App.tsx` now gives `FreezeInactiveTabContent` a render callback. The memoized wrapper invokes that callback only when its tab is active; while inactive it retains the already-rendered subtree without rebuilding its React elements on each parent render. Returning to a tab still calls the renderer with current game state. This changes presentation work only; simulation cadence, accrual, events, and save behavior are unchanged.

Repeating the same all-tabs-mounted Chrome profile after the change sampled 182.53ms in `exports.jsxDEV` (42% lower) and 121.12ms inclusive in `GameSession` (55% lower). It recorded a 0.2ms click-to-microtask interval and no Long Animation Frame, Long Task, or `tick` LoAF script over five seconds. The focused profile passed 1/1 and TypeScript passed. These are single-run test-mode CPU sampling estimates, not production benchmarks; the owner's exact two-second event remains unreproduced and P-56 remains open for its clicked element and expanded `tick` stacks or confirmation that the live stall is resolved.

## 9 October 2026: reuse the generated star catalogue during status renders

The pre-click sample in the isolated Settings profile sampled `createStarCatalogue` at 1.54ms. `TopStatusBar.LocationStatus` calls it on each status render, and the function's cache was only read by `starTypeForSystem`, so each call rebuilt all 100 entries. `createStarCatalogue` now checks the seed-keyed cache after validating the seed and returns the existing readonly catalogue. The catalogue unit case asserts repeated calls share the same result; no in-repository consumer mutates it.

The focused star-catalogue unit tests passed 6/6. Repeating the same Chrome 153 Settings profile passed 1/1: `#tab-settings` took 0.1ms to the next microtask; no Long Animation Frame, Long Task, or `tick` LoAF script occurred in the next five seconds. `createStarCatalogue` was not sampled in this repeat's pre-click top-function list. Sampling results vary between runs, so this confirms removal of repeated catalogue generation but does not quantify a reliable end-to-end percentage or explain the owner's 2,032ms event. The supplied root-click entry still lacks a clicked element and expanded `tick` stacks; P-56 remains open. This isolated test-mode run is not a production benchmark and makes no heap-growth claim.

## 9 October 2026: repeat on the reported development server

To match the reported `http://localhost:5173/` development build, I opened it in a fresh isolated headless Chrome context (Chrome 153, 1280×720), started a disposable run, applied the deterministic late-game navigation scenario, visited every unlocked top-level tab, then clicked Settings. This did not use the owner's browser profile or save. The captured target was `#tab-settings` (the click originated on its nested `SPAN`); the five-second window had zero Long Tasks and zero Long Animation Frames. The CPU profile's largest app entry was `GameSession` at 101.34ms inclusive across the sampled five-second window. No browser errors occurred.

The same focused Chrome performance spec on the test server then passed 1/1 with zero Long Tasks and zero Long Animation Frames over the Settings window. These runs confirm the current Settings route is responsive in isolated late-game sessions; they do not reproduce the supplied 2,032ms owner-session click. The owner trace still lacks the clicked element and expanded `tick` call trees, so it does not support another code change. The profile did not measure heap growth or produce a Paint/Raster bottleneck.

## 9 October 2026: repeat after the supplied LoAF details

The focused Chrome 153 profile was rerun against the current test build with the same `late-game-navigation` fixture and 1280×720 viewport. It captured `#tab-settings` as the exact click target, measured 0.1ms to the next microtask, and recorded no Long Animation Frame or Long Task in the following five seconds. V8 sampling showed `tick` at 13.78ms inclusive across two samples and `GameSession` at 86.62ms inclusive in that five-second window; these are sampling estimates, not wall time per call. The focused profile passed 1/1.

This repeat still does not reproduce the owner's reported 2,032ms frame. The separate 1,276ms `DIV#root.onsubmit` record is the Pioneer start form, not the Settings tab; the `DIV#root.onclick` record identifies only React's event dispatcher and omits the clicked element and expanded `tick` stacks. No new source-level hot path was demonstrated, so this run does not justify another simulation or rendering change. P-56 remains open for a trace from the slow live interaction that includes the target element and expanded call trees. The isolated test-mode profile does not measure heap growth or production performance.

## 9 October 2026: latest installed-Chrome Settings repeat

I reran the focused profile against the current branch in installed Chrome 153 using the disposable `late-game-navigation` fixture at 1280x720. It recorded `#tab-settings`, 0ms to the next microtask, no Long Animation Frame or Long Task in five seconds, and 5.6% sampled active CPU. `GameSession` accounted for 92.75ms inclusive across that five-second sample; the `tick` function was not sampled in the click window, and no `tick` LoAF script occurred. The focused profile passed 1/1. This test-mode run does not use the owner's save or reproduce the reported 2,032ms event. No new source hot path was demonstrated, so no speculative simulation change was made. The owner trace still needs its clicked element and expanded `tick` stacks to identify the cause; P-56 remains open.

## 9 October 2026: repeat after the 1,276/2,032ms DevTools captures

The focused installed-Chrome profile was rerun against the current branch in the deterministic `late-game-navigation` fixture at 1280x720. It captured `#tab-settings` and measured 0.1ms to the next microtask. The following five seconds contained no Long Animation Frame or Long Task; the CPU profile sampled `GameSession` at 94.09ms inclusive and the React JSX factory at 143.95ms self time across the full interval. The subsequent `#tab-miaplaedia` click measured 0ms to the next microtask and also had no Long Animation Frame or Long Task in its 1.04-second sample. The focused profile passed 1/1. These CPU numbers are sampling estimates, not wall time for a single call.

The owner's 1,276ms LoAF is the Pioneer start-form submit (`SaveStartScreen` calls `startSelectedRun`); it is not a Settings click. The separate 2,032ms LoAF does show main-thread JavaScript around a React click and two `App.tsx` `tick` callbacks, with rendering only starting after that script work, but it does not report the clicked element or expand the callbacks' internal stacks. The live Chrome control bridge could not attach to the owner's tab, and the isolated profile does not reproduce the stall. Existing changes already cache the local save index and bound foreground catch-up to one simulation slice per frame. No further source change is supported by this capture; P-56 remains open until the live event's target and expanded `tick` call trees identify a hot path, or the owner confirms the stall is gone. No 2-second Paint/Raster delay was measured, and this sample makes no heap-growth or production-performance claim.

## 9 October 2026: remove repeated input validation from store-owned ticks

Source review found that each `GameStore.dispatch` called the public `transition()` function, which fully validated the previous state before the command and fully validated the resulting state after achievements. The store already validates its initial state and every accepted output, so the input scan repeated work on every 250 ms clock update. `transitionFromKnownValidState()` now skips only that redundant input scan for store-owned transitions; it still validates every result. The public `transition()` entry point retains strict input validation for standalone callers, and development reducer results remain fully validated. Simulation timing, resource accrual, events, and persistence are unchanged.

TypeScript passed, and the focused engine/store unit specs passed 15/15. The same installed-Chrome Settings profile passed 1/1 against the late-game navigation fixture: it selected `#tab-settings`, reported no Long Animation Frame or Long Task during the following five seconds, and sampled `tick` at 12.3 ms inclusive across eight samples in that interval. The five-second CPU profile sampled `isValidGameState` at 3.32 ms inclusive. This confirms a small recurring validation reduction in the isolated fixture; it does not reproduce or prove resolution of the owner-session ~2 s interaction, whose supplied click event still lacks its target and expanded `tick` stacks. The live Chrome attachment remained unavailable, so P-56 stays open for that specific attribution or owner confirmation.

## 9 October 2026: cold Settings visit and start-submit profiles in development mode

To avoid warming Settings before measuring, I ran installed Chrome against an isolated Vite **development** server on port 4173. The disposable run used the `late-game-navigation` state at 1280x720; it did not attach to the owner's browser profile or save. The first Settings visit was measured without visiting any other top-level tab first. Two runs reported 93.4ms and 109.5ms from click capture until the Settings pane appeared, with no Long Task or Long Animation Frame in the following five seconds. Settings module requests took 1.3–11.2ms. The clicked element was `#tab-settings` (the nested `SPAN`).

The matching development-mode start-form profile recorded `FORM.welcome-form`, with the first Hydrogen tab present 67.4ms after submit. It captured two shorter Long Animation Frames (103.8ms and 51.4ms), no Long Task, and at most 0.5ms forced style/layout. The longer frame listed React scheduler work (33.4ms and 19.6ms scripts) plus a 14.7ms `tick`; it does not reproduce the supplied 1,276ms submit.

One cold Settings CPU sample included `tick` → audio-store dispatch → game-store transition → `isValidGameState`, at 3.04ms of V8 sampled time within the five-second interval; the repeat did not sample a tick. This is a sampled call-tree share, not wall time per tick. Neither the cold Settings visit nor the submit profile reproduced a multi-second event. The supplied 2,032ms root-click record still has no clicked element ID or expanded `tick` stacks, so it does not establish that Settings was clicked or that the validation frame caused the stall. I did not skip engine validation or change simulation timing based on this evidence. P-56 stays open for a capture of the slow interaction with its tab ID and expanded `tick` call trees. The focused development-mode profiles passed 1/1 each; these samples make no production-performance, heap-growth, or Paint/Raster-duration claim.
