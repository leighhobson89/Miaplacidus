# Settings browser checks

The statistics case also pins the Run source fields to live values, verifies
Overview ticker totals, confirms AP Anticipated is `0` on a fresh run, and
checks that the obsolete “not tracked separately” message is absent. It keeps
remake-specific Current Snapshot cards in their separate group and checks all
eight Resource and six Compound production cards, including their current-run
and all-time columns.

AP Anticipated source audit (10 October): the existing unit case verifies the
remake's current selector definition: distinct scanned Industrial/Spacefaring
systems contribute their base AP once; ineligible encounters and missing
profiles contribute zero. The Statistics browser case only proves the fresh-run
zero value. Cosmic Forge instead reads a run-local accumulator: it adds the
destination base AP at each confirmed launch and adds it again on scan only for
Industrial/Spacefaring civilizations with a numeric profile value; rebirth
resets this counter and save/load preserves it. The source-to-remake difference
is documented in `docs/plans/statistics-presentation-parity.md`; no selector or
gameplay change was made pending a product decision on the intended meaning.
The focused `npx.cmd vitest run tests/unit/statistics-display.spec.tsx
--reporter=dot` run passed 10/10. This is code-path comparison only, not a
controlled value comparison against a running Cosmic Forge save.

`settings-statistics.spec.ts` verifies that the source's Events, Galactic
Casino, and Cosmic Rip Chapter summaries remain separate groups inside the
Settings → Statistics destination. It checks representative translated event
rows and the saved-history migration note. The full event history stays in
Settings → Events, the Casino remains a Galactic child page, and Cosmic Rip
gameplay remains under the Cosmic Rip main tab.

The same case checks all five source Space Mining cards. Telescope and Launch
Pad show current-run status; built rockets, discovered asteroids and asteroid
arrivals show current-run and lifetime totals. In the source, “Asteroids
Mined” counts completed outbound arrivals when a rocket reaches an asteroid,
before extraction begins. The run count resets at rebirth while the all-time
count persists; telescope/Launch Pad all-time values are not applicable.

**P-55 Space Mining status scopes (10 October 2026):** Telescope Built and
Launch Pad Built now display This Run Yes/No plus Lifetime N/A, matching the
source's run getters and explicit Not Applicable All Time getters. The
`statistics-display.spec.tsx` unit case checks fresh No/N/A and built Yes/N/A
for both rows across all six locales. The existing visible Space Mining build
journey checks both Yes/N/A rows after constructing the Telescope and Launch
Pad through their UI controls in each locale. This adds rendered nonzero-value
and scope evidence; no gameplay rule changed. The focused Statistics display
unit file passed 18/18. Installed Chrome passed the all-card Statistics check
and six-locale visible-build journey 2/2 in 52.3 seconds on port 5764. Typecheck,
focused Oxfmt, and `git diff --check` passed. Command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5764'
npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-statistics.spec.ts tests/e2e/space-telescope/p45-space-mining-copy.spec.ts -g "maps source Statistics groups|Telescope and Launch Pad actions" --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p55-space-status-5764
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx --reporter=dot
npm.cmd run typecheck
.\node_modules\.bin\oxfmt.cmd --check src/app/SettingsStatisticsPane.tsx tests/e2e/settings/settings-statistics.spec.ts tests/e2e/space-telescope/p45-space-mining-copy.spec.ts tests/unit/statistics-display.spec.tsx
git diff --check
```

The shared browser fixture starts a fresh named run and reports browser errors
and external requests.

Run the focused area with:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "statistics"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/settings/settings-statistics.spec.ts
```

4 October 2026: the focused `@statistics` Chrome case passed 1/1 for Casino and
Cosmic Rip group placement. 5 October 2026: it also passed 1/1 with checks for
the 13-event group and its historical-data note. Playwright hung after reporting
the passing case during browser shutdown, so the runner was interrupted and did
not exit cleanly. A later 5 October run passed 1/1 and exited cleanly after
adding the source-ordered sections, Overview ticker counts, live Run values,
and the separate Current Snapshot assertion.

The latest 5 October Chrome run also checks all five source-mapped Space Mining
cards and their current-run/lifetime scopes. Typecheck passed; three focused
unit files passed 78/78 for run and all-time counters, v35-to-v36 migration,
save/reload, and rebirth persistence.

The earlier 5 October production-statistics run checked 84 cards before the
Cosmic Rip lifetime counters were added; the all-card view at that stage had 86
cards. That historical result predates the Research and Energy slices recorded
below. The latest focused Chrome Statistics run passed both the all-card and
six-locale Cosmic Rip cases (2/2); the locale case checks both new values and
the tracking note in all six languages. After stopping the test-owned Vite
server, Playwright exited cleanly with code 0. Focused Cosmic Rip and local-save
unit coverage passed 59/59, including v37-to-v38 migration, save roundtrips,
and rebirth retention; typecheck passed.

At the time of this 5 October run, the `@casino-statistics` case played Double or Nothing and the Wheel through
their browser controls, then checks current-run and lifetime CP-spent and play
counters. It performs a real rebirth and confirms that current-run counts reset
while the lifetime counts remain. The check intentionally avoids casino “Won”
counters; subsequent remake-side unit evidence is recorded in the P-55 Casino
counter review below. Higher or Lower source comparison remains open.

5 October 2026: the focused Statistics case passed in Chrome (1/1, exit code 0).
The Playwright process remained open after the passing case until its
test-owned Vite server was stopped; the runner then exited successfully.
Focused command:

```powershell
$env:MIAPLACIDUS_TEST_AREA = "statistics"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --grep @casino-statistics --workers=1 --reporter=list tests/e2e/settings/settings-statistics.spec.ts
```

`settings-preferences.spec.ts` exercises the source-mapped visual controls and
split background-audio/SFX controls. It checks that pointer, trail and weather
toggles affect the rendered game, volume controls store bounded values, and the
selected preferences survive a manual save and resume of the same local slot.
It also verifies a playing sound effect is not stopped when only background
audio is disabled, and checks that two pioneers keep distinct audio and visual
preferences when the player switches between local saves. All new option names
are supplied by the six-locale Settings catalogue.

5 October 2026: the Settings preferences and Settings child-order journeys
passed 4/4 in system Chrome with video disabled. The slot-isolation path saves
opposite audio and visual choices to two pioneers, resumes each, and verifies
both state and rendered controls. The achievement journey also confirms the
source-rendered Settings order: Achievements, Events, Statistics, Visual, Game
Options, Saving / Loading.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-preferences.spec.ts tests/e2e/achievements/achievements.spec.ts --workers=1
```

`tests/unit/audio-event-dispatch.spec.ts` verifies that window blur and hidden-document transitions pause background and weather ambience, stop and rewind active one-shot effects, and resume only the currently enabled ambience after focus returns. It also confirms that the repeating antimatter boost sound keeps its separate lifecycle while unfocused. The focused audio adapter unit file passed 8/8 after these checks were added.

6 October 2026: the Research history slice adds four cards (Research Points earned and Science Kits, Science Clubs, and Science Labs built), each with current-run and lifetime values. Research Points count production before autobuyer spending; building totals count accepted purchase/buyMax quantities. Schema v39-to-v40 initializes unavailable history to zero while preserving the RP pool; rebirth resets run values and retains lifetime totals. The six locale labels are present. The focused run verified the card count increased from 86 to 90. On 6 October, typecheck passed; focused units passed 115/115 across economy.spec.ts, local-saves.spec.ts, cosmic-rip.spec.ts, statistics-display.spec.tsx, and meta-progression.spec.ts. The installed-Chrome all-card and fresh Hydrogen Research journeys passed 2/2 in 11.1 seconds and verified 90 cards, zeroed fresh history, 100 RP earned after spending on Knowledge Sharing, Science Kit run/lifetime 1, Clubs/Labs 0, and all six locale labels. Unit coverage verifies accepted buys/buyMax, RP before autobuyer spending, v39-to-v40 migration preserving the 50 RP pool, local/portable roundtrips, and rebirth reset/retention. The test-owned dev server stopped, port 4173 was confirmed closed, and Playwright exited 0.

6 October 2026: Energy Statistics renders all twelve source rows in source order. All twelve remain visible and unlinked before Energy unlock, then link to resolved owner pages afterward. Solar and Advanced links fall back to Energy Storage until their respective technologies are researched, then navigate to their specialized pages. Five live rows show localized All Time Not Applicable; Total Battery Storage uses `floor(capacity / 1000)` MJ. At this verification point, Total Production used effective tick-plan output; the 9 October P-55 follow-up below corrects it to the source nameplate calculation. Seven counters (trips and six building types) show current-run/lifetime totals; accepted building quantities include buyMax, selling/loss preserves history, trips count once per on-to-tripped transition, and rebirth resets run values while retaining lifetime totals. Schema v42 initializes unavailable v41 Energy history to zero, with the six-locale note marking the boundary. Five focused unit files passed 93/93; typecheck after the source fix and the test-file diff check passed. Updated installed-Chrome Settings `@energy-statistics` passed 2/2, covering locked-state/no-link, unlocked hrefs, and navigation to Power Plant, Solar, Advanced, and Storage. The initial E2E attempt failed because localStorage setup ran on `about:blank`; the fixture now navigates to `/` before setup, and the final retry passed. Port 4173 was free after the run.

**9 October 2026 P-55 Energy Statistics parity correction:** Cosmic Forge's Total Production getter sums owned plant quantity × base plant rate × `TIMER_RATE_RATIO` (100), regardless of the grid or plant toggles, fuel, and environmental modifiers. The remake stores the converted per-second rates in `ENERGY_BUILDINGS`, so the Statistics value now sums owned count × those rates; the Energy page continues to show effective output. Focused coverage passed: the `energy-statistics-display.spec.tsx` unit file passed 2/2, including three disabled plant types (2 basic, 1 solar, 3 advanced; six units total) with grid off displaying the source-derived 135 kJ/s while the live tick plan is zero; the Settings `shows live Energy values, source counters, links, and six localized labels` Chrome case passed 1/1 on port 4220 and checks the parity value across all six locales. Typecheck and targeted formatting checks passed. The Energy metric is now source-aligned; complete source-value comparison across other Statistics rows remains open.

6 October 2026: Interstellar Statistics adds 17 stable rows in source order for
star study range, starship build and travel, scanned systems, fleet power and
units, encounter details, star-voyage AP, and Black Hole state. Focused unit
coverage checks selector values, missing encounter values, all six locale labels
and scopes, owner links when unlocked, parent gates for Stellar Cartography and
Galactic access, exact route-distance credit on shortened arrival, duplicate
completion protection, rebirth reset with lifetime retention, and v42-to-v43
migration preserving existing state while initializing the new counters to zero.
The default fresh-run browser view checks all 17 row IDs and order, initial
values/scopes, unavailable Enemy fallback, hidden links while both parent systems
are gated, and 320px fit. Browser navigation verifies unlocked Star Map,
Starship, Fleet Hangar, Colonise, and Black Hole owner pages. The existing
un-IDed Systems settled card follows the 17 identified Interstellar rows.

Focused validation passed: the two Interstellar Statistics unit files passed
9/9 tests, and `npm.cmd run typecheck` passed. The first installed-Chrome E2E
attempt reported all 3 tagged cases passing but hung during cleanup. The clean
line-reporter rerun passed `@interstellar-statistics` 3/3 in 16.8 seconds with
Playwright exit 0; the test Vite server was stopped and port 4173 was free. The
first E2E attempt exposed the existing extra Systems settled card (18 cards in
the section, including the 17 stable IDs); the assertions now check the 17 ID
order and retain that existing card after them.

```powershell
$env:MIAPLACIDUS_TEST_AREA = "statistics"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --grep @interstellar-statistics --workers=1 --reporter=list tests/e2e/settings/settings-statistics.spec.ts
```

6 October 2026: the Cosmic Rip Statistics owner-link implementation adds links
to all eleven remake cards only when their child owner panes are available.
`App.tsx` routes from Settings to the Cosmic Rip tab and selected child pane.
The focused installed-Chrome `@cosmic-rip` Statistics area passed 3/3,
covering the source completion flags separately from Rip Closed, navigation to
available owner panes, and the lifetime labels/tracking note in all six locales. The Vite
server was stopped after the run. Focused display and Interstellar-migration
unit coverage passed 9/9, and typecheck passed.

The source audit records seven Cosmic Rip rows in source order, all with Run
Not Applicable: Galactic Points Earned is `max(0, settled systems - 1)`;
Galactic Points Spent uses the all-time spent value; Rip Telemetry Data Gained
uses all-time earned; then come Cosmic Rip Chapter Unlock, Near Space Scanner
Array Restored, Cosmic Rip Located, and Cosmic Rip Stabilised. MIAPLACIDUS now
shows these source rows with Run=N/A and their mapped All Time values; controlled
nonzero source-value comparison remains open. Current GP and telemetry balances,
sector/research progress, and Rip Closed are remake-only snapshots/status.
Translation-quality approval remains pending.

8 October 2026: the Statistics display adds Galactic Points Earned first in the
source group, with localized Run=N/A and Lifetime=`max(0, settledSystemIds.length - 1)`;
the initial settled-system entry is the starting system. The five live
Cosmic Rip balances/progress/status cards are under a separate MIAPLACIDUS
live-status heading. Focused unit and localization validation passed 8/8 across
two files; typecheck and targeted formatting passed. The first installed-Chrome
attempt started all three `@interstellar-statistics` cases but returned no test
summary after more than three minutes. It was interrupted at the request of the
parent agent to free the browser for status-row checks; the runner exited 1 and
port 4173 was confirmed free. No browser pass is claimed for this attempt.

```powershell
$env:MIAPLACIDUS_TEST_AREA = "statistics"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --grep @interstellar-statistics --workers=1 --reporter=line tests/e2e/settings/settings-statistics.spec.ts
```

```powershell
$env:MIAPLACIDUS_TEST_AREA = "statistics"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --grep @cosmic-rip --workers=1 --reporter=line tests/e2e/settings/settings-statistics.spec.ts
```

8 October 2026 focused Cosmic Rip browser attempts (default Chromium project; no browser-channel environment override):

- `npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-statistics.spec.ts --grep "@cosmic-rip-gp-earned"` printed the dedicated test as passed (1/1, 3.7s), covering the source-row order, N/A current-run value, all-time values at one and two settled systems, and live-status separation. Playwright did not exit after the passing assertion; it was interrupted after about 60 seconds. Exit code was 1 after interruption; port 4173 was confirmed free. Treat the assertion as observed passing but the browser command as not cleanly completed.
- `npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-statistics.spec.ts --grep "@cosmic-rip-locale"` printed the six-locale case as failed at 1ms, then hung without the failure details. It was interrupted after about 60 seconds; exit code was 1 after interruption; port 4173 had zero listeners afterward. Six-locale unit coverage passes, but six-locale browser coverage is not established. Investigate the test failure/runner hang before claiming P-55 evidence.
8 October 2026 focused Settings regression: the visual/audio preference save-and-resume journey passed 1/1 in installed Chrome. After resuming, it waits for the test-only DebugTools gateway to finish loading before reading the restored settings; the visible settings controls and save behavior are unchanged.

8 October 2026 audio follow-up: the source audio registry and its call sites in
`audioManager.js`, `game.js`, `ui.js`, and `drawTab6Content.js` were compared
with the remake's event routes. Changing SFX volume now updates one-shot and
active boost sounds immediately when the saved volume changes. Direct source
comparison confirmed that ordinary and one-off News claims use `goodPrize`,
while Casino uses generic clicks; the remake now follows that distinction. The
focused audio event-dispatch unit file passed 17/17, covering News/Casino,
battle, and force-field/megastructure cue routes plus live SFX-volume changes;
typecheck passed.

9 October 2026 P-29 audio parity follow-up: Cosmic Forge's `ui.js:13515-13518`
chooses `laserGun1` or `laserGun2` with equal probability and permits a new
battle laser sound only when more than 80ms has passed since the previous one.
The remake's audio adapter now applies that same random choice and cooldown to
battle-round events, using an injectable audio clock/random source for a
deterministic regression. `audio-event-dispatch.spec.ts` passed 20/20 and
`npm.cmd run typecheck` passed. The focused installed-Chrome main/child
navigation cue journey passed 1/1 with clean exit. Generic click layering beyond
the tested navigation path, full source cue-by-cue coverage, and broader
browser review remain open.

9 October 2026 battle explosion cue follow-up: Cosmic Forge's
`ui.js:13450-13455` randomly chooses `shipBattleExplode1` or
`shipBattleExplode2`, and only plays another explosion after more than 140ms.
The remake now applies that random choice and separate cooldown to its available
`space.battle.finished` event. The expanded unit case verifies both variants,
the exact 140ms boundary, and playback at 141ms; the focused audio file passed
20/20, and TypeScript passed. Cosmic Forge emits explosion sounds from ship
impact rendering, while the remake currently exposes a battle-finished event;
this matches choice and rate-limiting for the available event but does not
provide per-impact sound timing.

Focused verification:

```powershell
npm.cmd run test:unit:focused -- tests/unit/audio-event-dispatch.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-preferences.spec.ts -g 'main and child navigation play the source click cue' --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

9 October 2026 source swipe-cue follow-up: Cosmic Forge plays `clickSwitch` when
collapsible headers are toggled and when its custom dropdown is opened
(`ui.js:3211-3216,3989-4005`). MIAPLACIDUS now plays the same cue when a
`summary` disclosure is activated and when an enabled native `select` is opened
with pointer or keyboard input. The focused installed-Chrome regression passed
1/1, covering the Hydrogen Autobuyers disclosure and Settings notation select.
The current native selects handle value selection through their normal change
handlers; this test concerns opening the control. Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-preferences.spec.ts -g 'collapsibles and native selects play the source swipe cue' --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

8 October 2026 focused P-42 Settings audio checks: installed Chrome passed the
`@audio-output` and `@audio-silent-fallback` cases (2/2 across two focused
invocations). Each installs a local `Audio` mock with `page.addInitScript`
before the application loads, so the cases emit no sound. The output case
enables Sound Effects, records a `clickSwitch.mp3` play attempt at volume 0.5,
then moves the real Settings range control to 0.25 and records the next cue at
0.25. The rejection case makes `Audio.play()` return a rejected promise and
confirms there are no browser errors or unhandled rejections, the toggle stays
enabled, and the game remains usable. This verifies the volume value reaching
the playback boundary and rejected-promise fallback; it does not measure actual
speaker output or cover an unavailable `Audio` constructor.

Focused command (set the three environment variables as shown for each run):

```powershell
$env:MIAPLACIDUS_TEST_AREA = "settings"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --grep audio-output --workers=1 --reporter=line tests/e2e/settings/settings-preferences.spec.ts
npm.cmd run test:e2e:focused -- --grep audio-silent-fallback --workers=1 --reporter=line tests/e2e/settings/settings-preferences.spec.ts
```


9 October 2026 P-42 native playback regression: installed Chrome passed 1/1.
The test used the real `Audio` constructor and bundled `clickSwitch.mp3`, while
muting the media element to prevent sound. It verified that no audio object is
created while the player types the pioneer name, then enabled Sound Effects and
used the Hydrogen tab as a trusted in-game action; Chrome loaded and played the
cue without a rejected promise or page error. This covers app-side activation
gating and the browser media path without requiring speaker output. The focused
`audio-event-dispatch.spec.ts` passed 21/21, including a new synchronous
`Audio.play()` exception case; `npm.cmd run typecheck` passed. The playback
helper now catches both synchronous errors and rejected promises for effects,
ambience, and boost cues.
**10 October 2026 P-55 Statistics time semantics:** Cosmic Forge's `Time Played`
and `Run Time` are wall-clock durations from separate persisted
timestamps. The remake instead displays foreground-active elapsed time for
`Time Played` and simulation elapsed time for `Run Time` (which includes warped
foreground time and offline gains). The remake's `wallNowMs` is only the latest
sample; it does not preserve either start timestamp. Exact source parity would
require persisted game/run start anchors, with the game anchor retained across
rebirth and the run anchor reset, plus a schema migration. Existing saves lack
the original anchors, so a migration needs an explicit fallback/tracking
boundary. Focused remake tests now cover the current meanings: 1 second of
foreground at 4x yields 1 second active time and 4 seconds simulation time;
10 seconds hidden/offline leaves active time unchanged and adds 3.34 seconds to
simulation time; local and portable save/restore preserve both values; and
rebirth retains lifetime active time while resetting run simulation time. A
render test verifies Overview `Time Played` reads the active-time field and Run
`Run Time` reads the simulation-time field. The focused four-case run passed
(`foundation-engine`, `local-saves`, `meta-progression`, and
`statistics-display`; 4 passed, 98 skipped). Command:
`npm.cmd run test:unit:focused -- tests/unit/foundation-engine.spec.ts tests/unit/local-saves.spec.ts tests/unit/meta-progression.spec.ts tests/unit/statistics-display.spec.tsx -t "keeps active duration unwarped|preserves active and simulated duration values|rebirths atomically at the conquered destination|renders Time Played from active time and Run Time from simulation time" --reporter=verbose`.
These tests do not establish source parity. No code or schema changes were
made; the time-row semantics remain open for an owner decision.

The Galactic Points Earned source getter counts `max(0, settledStars.length -
1)`. Cosmic Forge appends the current destination to `settledStars` during
rebirth, while MIAPLACIDUS records settlement immediately. Statistics now
subtracts that destination when `ascendencyAwardedThisRun` is true and the
starship destination ID is already in `settledSystemIds`; it includes the
destination after rebirth clears the flag. The focused unit case passed
1/1 (the full `statistics-display.spec.tsx` file had 3 passing and 1 unrelated
Research-link expectation failure). The installed-Chrome regression
passed 1/1 in 7.7 seconds: source value 0 on a fresh save, 0 after settlement,
and 1 after rebirth. TypeScript passed. The browser test reaches settlement and
rebirth through their visible controls; it does not claim a direct comparison
with a running Cosmic Forge save.

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "shows source Galactic Points Earned"
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-statistics.spec.ts --grep @cosmic-rip-gp-earned --workers=1 --retries=0 --trace=off --reporter=line
```

10 October 2026 P-55 Galactic Points Earned source-getter comparison: Cosmic
Forge's `getStatCosmicRipChapterGalacticPointsEarnedAllTime()` returns
`max(0, settledStars.length - 1)` (`constantsAndGlobalVars.js:5431-5434`). The
list begins with the starting star (`:429`); the current destination and any
Expansionist bonus systems are appended during rebirth (`game.js:15690,
15751`). MIAPLACIDUS stores a newly settled system before rebirth, so its
Statistics selector excludes that pending destination only while the run flag
and destination ID both identify it as current. After rebirth clears the flag,
the same system contributes to the lifetime proxy. This matches the source
getter and commit boundary; the metric remains a settled-system proxy, not an
awarded-GP ledger.

The six-locale unit case covers five states with expected lifetime values
0 (starting system), 0 (newly settled/pending), 1 (committed), 2 (three systems
with the last pending), and 3 (all committed). Its section-boundary check was
stale (`<h4>`); it now matches the component's `<h3>` headings. The focused
rerun passed **1/1**. The dedicated installed-Chrome journey passed **1/1 in
11.2 seconds** on isolated port 5940, verifying 0 on a fresh save, 0 after
visible settlement, and 1 after visible rebirth, with Run=N/A and the source
row order. No controlled value comparison against a running Cosmic Forge save
was made; that direct runtime comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "shows source Galactic Points Earned" --reporter=verbose
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5940'
npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-statistics.spec.ts --grep @cosmic-rip-gp-earned --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p55-cosmic-rip-gp-5940
```

## P-55 Overview AP Gain source comparison (10 October 2026)

Both games expose AP Gain as a single all-time Overview value, separate from
the currently held AP balance. Cosmic Forge reads `allTimeTotalApGain` and
serializes/restores it; the current `resetAllVariablesOnRebirth()` does not
clear it. However, the source's only live `totalApGain` increment is the AP
`adder` news prize path (offer 3013). Source battle and achievement rewards
change the AP balance without updating this statistic. MIAPLACIDUS instead
counts accepted AP from settlements, achievement rewards, the AP ticker claim,
and Galactic Market liquidation. It carries the lifetime count through
rebirth. This is a concrete source producer-coverage difference; no runtime
change was made because imitating the source's narrower counter would hide
ordinary AP awards. No controlled source runtime value comparison was run.

Coverage verifies the remake's visible AP Gain is lifetime-earned AP rather
than the available balance (127 versus 19); battle plus settlement each add
their accepted AP once; one-off AP claim increments once and duplicate claim
is rejected; market liquidation increments its AP award; rebirth retains the
counter; a portable save/reload preserves a nonzero value; and a v34 save
migrates unavailable history to zero. These focused tests passed **7/7** across
the two commands below. The source/remake count-flow difference remains open
for owner review.

Source paths: `constantsAndGlobalVars.js:962, 4938-4940, 1233, 5692-5694,
1384-1676, 1825, 2192`; `ui.js:11981-11990`; `descriptions.js:2021-2027`;
`game.js:15306-15310`; `achievements.js:200-207`. Remake paths:
`src/app/SettingsStatisticsPane.tsx:234-236`,
`src/engine/spaceMechanics.ts:1651-1668`, `src/engine/achievements.ts:350-365`,
`src/engine/newsTicker.ts:401-406`, `src/engine/galacticMarket.ts:309-315`,
and `src/engine/metaProgression.ts:220` (rebirth carries the statistics object).

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx tests/unit/meta-progression.spec.ts tests/unit/local-saves.spec.ts -t "Overview AP Gain|rebirths atomically at the conquered destination while retaining permanent state and settings|preserves source Overview totals through save and reload|adds source Overview counters to version 34 saves" --reporter=verbose
npm.cmd run test:unit:focused -- tests/unit/battle.spec.ts tests/unit/meta-signals.spec.ts tests/unit/meta-progression.spec.ts -t "resolves class-level battle rounds, persists victory, and awards settlement currency once|applies a one-off bulletin exactly once and tracks distinct visual effects|sells AP at the live price and liquidates all assets once at the live purchase price" --reporter=dot
```

9 October 2026 P-55 Galactic Points Spent source comparison: Cosmic Forge's
`getStatCosmicRipChapterGalacticPointsSpentAllTime` reads its spent counter,
and `refundGalacticPoint()` decrements it (clamped at zero) when the
`completeRunOnMiaplacidus` and `winAllCasinoGames` achievements return one GP.
MIAPLACIDUS now applies the same one-point decrement when either matching
permanent achievement pays its GP reward. The focused
`meta-progression.spec.ts` scenario verifies both refunds, the zero floor, and
that a later rebirth does not repeat an already-earned refund. The source
comparison and test are documented in the [Statistics parity plan](../../../docs/plans/statistics-presentation-parity.md).
P-55 remains open for the other Statistics rows and controlled source-value
comparisons.

9 October 2026 P-55 Rip Telemetry Data Gained comparison: Cosmic Forge adds
each positive raw telemetry production delta directly to both its balance and
`allTimeRipTelemetryDataEarned` (`cosmicForge/cosmicForge/game.js:2786-2800`);
the offline-gain path credits it too (`game.js:12762`). Spending telemetry on
research does not reduce the total.
MIAPLACIDUS now records the raw `telemetryRate * elapsedSeconds` in its
all-time statistic, independently from its existing eight-decimal balance
normalization. The focused `cosmic-rip.spec.ts` case covers 0.04 fractional
production, a representationally unchanged 1e15 balance with the 0.04 gain
still credited, research spending, and save/rebirth persistence. This closes
the displayed-row accounting mismatch; full P-55 source comparison remains
open.

9 October 2026 P-55 Cosmic Rip Chapter Unlock timing review: the source getter
checks `techUnlockedArray.includes("cosmicRip")`; `ui.js:14395-14399` sets that
flag inside `playWinCinematic`, called from the endgame story at `game.js:15525`.
MIAPLACIDUS sets page access after the blocking story dialog is acknowledged.
The internal flags change at different moments inside the story, but Settings
is unavailable during both overlays; at the first accessible Statistics view,
both show Run=N/A and Lifetime=Yes. Focused `statistics-display.spec.tsx`
coverage passed for No/no-link before the story and Yes/link after acknowledgment.
No player-visible correction was needed.

9 October 2026 P-55 Cosmic Rip Stabilised threshold review: Cosmic Forge says
No for an empty technology map and otherwise compares the number of completed
Cosmic Rip technologies with the map's total keys. Normal research completion
adds one technology ID when its timer finishes; offline completion follows the
same result. The source live E2E enumerates five stabilization technologies,
matching MIAPLACIDUS's five `COSMIC_RIP_TECHNOLOGIES`. The remake's save
validation also guarantees the researched IDs are known and unique, so source
`completed >= total` and remake `completed === total` match for valid player
states. Both use Run=N/A; the All Time row is No at four of five and Yes at five
of five. Focused display coverage passed for both values. No correction was
needed; direct controlled source-save comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "Cosmic Rip Stabilised"
```

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "Cosmic Rip Chapter Unlock"
```

```powershell
npm.cmd run test:unit:focused -- tests/unit/cosmic-rip.spec.ts -t "raw telemetry production"
```

9 October 2026 P-55 Cosmic Rip Located scan-timing review: the source
`getStatCosmicRipLocatedAllTime` returns Yes only when `cosmicRip.ripFound` is
true. `cosmicRip.js:scanCosmicRipSector` sets that flag during the matching
sector scan and leaves it false on a miss; scanner restoration initializes it
to false and is accepted only once. The remake updates its permanent `ripFound`
flag on the same matching-scan command and keeps it true afterward. Both display
Run=N/A and the sticky All Time flag. Focused display coverage passed for No
before scanning, No after a wrong sector, and Yes immediately after finding the
Rip. No correction was needed; controlled source-save comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "Cosmic Rip Located"
```

9 October 2026 P-55 Near Space Scanner Array Restored timing review: the source
Run value is Not Applicable and its All Time value reads the persistent
`nearSpaceScannerArrayRestored` flag. `restoreNearSpaceScannerArray` sets the
flag immediately after checking and charging the required GP; its one-time
guard prevents a second restoration. MIAPLACIDUS sets the corresponding
permanent flag on the accepted restore command after validating unlock, restore
state, and GP. Both Statistics rows show No before restoration and Yes
immediately afterward, with Run=N/A. Focused display coverage passed for this
transition. No correction was needed; controlled source-save comparison remains
open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "Near Space Scanner Array Restored"
```

9 October 2026 P-55 Star Ship Distance Travelled source timing review: source
maps both Statistics columns to `getStatStarShipDistanceTravelled`, backed by
`starShipTravelDistance`. The travel timer sets this to in-flight route progress
and replaces it with the full route distance at arrival; rebirth resets the
field. Therefore the source's All Time column is the same current-trip value,
not a lifetime sum. MIAPLACIDUS records completed routes at arrival and shows
separate This Run and Lifetime totals; the current Statistics display does not
include partial in-flight distance. Existing display coverage checks distinct
12.5/32.25 ly run/lifetime values, and the rebirth case checks reset/retention.
Both focused cases passed 1/1. The first combined run also found three stale
v42 migration schema expectations in `interstellar-statistics.spec.ts`: the
current save schema is 45 and the v42 migration path now lands at 45. Only those
three expected-version values were updated; the distance, in-flight route,
saved-state, and migration behavior assertions remain intact. Rerunning both
focused Interstellar Statistics files passed 10/10. No runtime behavior was
changed pending the intended in-flight and All Time semantics; this mismatch
keeps P-55 open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/interstellar-statistics-display.spec.tsx -t "renders live Interstellar state"
```

```powershell
npm.cmd run test:unit:focused -- tests/unit/interstellar-statistics.spec.ts -t "resets run distance at rebirth"
```

9 October 2026 P-55 Asteroids Mined source-timing review: Cosmic Forge maps
the current-run and all-time columns to their respective counters. It increments
both when the outbound travel timer completes at an asteroid, before extraction
starts; rebirth resets only the run counter. MIAPLACIDUS uses the same arrival
boundary. The focused space journey unit case now explicitly checks both values
remain zero while the rocket is outbound, then verifies one at arrival and after
save/reload; it passed 1/1. The existing rebirth case verifies the run count
resets while the lifetime total remains six. No behavior correction was needed;
the controlled source-save comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-rules.spec.ts -t "completes outbound and return timers"
```

9 October 2026 P-55 Rockets Launched source-timing review: Cosmic Forge keeps
one all-time counter and increments it immediately after the Launch button
calls `launchRocket()`. It counts launch rather than travel or arrival, persists
the total, and has no separate current-run counter. MIAPLACIDUS increments its
lifetime-only Overview value on the accepted launch command. The focused rocket
launch-gate unit case now explicitly checks zero before launch, one after an
accepted launch, and zero for rejected fuel/weather launches; it passed 1/1.
Existing rebirth coverage confirms the lifetime count is retained. No behavior
change was needed; controlled source-save comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-rules.spec.ts -t "charges the launch pad and each rocket part, then opens fuel and launch gates"
```

10 October 2026 P-55 Total Asteroids Discovered source-timing/cap review:
Cosmic Forge's Overview value is all-time only. Successful completed telescope
searches increment it only after random-miss and cap exits. The cap protects
destroyed, exhausted, currently mined, selected mining-target, and in-transit
asteroids; pruning does not decrement the history counter. Rebirth clears the
run asteroid list but retains the counter, and save/load persists it.
MIAPLACIDUS likewise increments only its lifetime Overview value after a
successful completed survey; Space Mining's run count is separate. The new
100-eligible-uninteracted cap boundary regression verifies the missed-search
event does not add an asteroid or lifetime count. `npx.cmd vitest run tests/unit/space-rules.spec.ts --reporter=dot` passed 20/20. Existing telescope
journey, save roundtrip, and rebirth cases cover successful increment and
persistence. The cap eligibility policy differs: MIAPLACIDUS also excludes
interacted records, while the source uses mining/depletion/destruction/travel
status. This may change cap-block availability; no counter-boundary mismatch
or runtime change was found. No controlled source-save comparison was made.

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-rules.spec.ts -t "resumes a telescope search and rocket fueling from saved in-progress state"
```

9 October 2026 P-55 Rockets Built source-timing review: Cosmic Forge adds a
rocket to its run list and all-time count only when the final part completes;
rebirth clears the run list and retains lifetime, and save/load stores both.
MIAPLACIDUS counts fully assembled rockets for This Run and increments Lifetime
on that same accepted final-part action. The build test now checks zero at one
part short and one at completion. The rebirth fixture starts with a completed
rocket, then checks it is reset while lifetime remains four. The save roundtrip
preserves both a completed rocket in the run and the lifetime total. The three
focused unit files passed 96/96; no behavior change was needed. Controlled
source-save comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-rules.spec.ts tests/unit/meta-progression.spec.ts tests/unit/local-saves.spec.ts
```

9 October 2026 P-55 Legendary Asteroids Discovered source-timing review:
Cosmic Forge's Overview getter reads one all-time counter. A successful normal
telescope discovery increments it only when the generated asteroid has
`specialName`, which the source generator sets for Legendary rarity; rebirth
does not clear the counter and save/load preserves it. MIAPLACIDUS increments
its lifetime-only Overview value when a completed survey generates a Legendary
asteroid. The focused telescope-resume unit case now selects a Legendary result
and checks zero before timer completion, one at discovery, and no duplicate
increment; it passed 1/1. Existing local-save and rebirth assertions verify
lifetime retention. No normal-play mismatch was found; a controlled nonzero
source-save comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-rules.spec.ts -t "resumes a telescope search and rocket fueling from saved in-progress state"
```

10 October 2026 P-55 Star Ships Launched source comparison: Cosmic Forge's
Overview row reads an all-time-only counter. Its confirmed launch callback
increments after travel starts and antimatter is spent; save/load preserves it,
and rebirth does not reset it. MIAPLACIDUS exposes the lifetime-only counter and
increments it on the accepted launch command. The focused `starship-economy`
case now seeds the prior count at 7: an incomplete-module rejection leaves it
at 7, an insufficient-antimatter rejection leaves it at 7, and an exactly
funded accepted launch increments it to 8. The existing fresh Statistics card
check reads 0; rebirth and local-save fixtures preserve lifetime history. The
focused command was `npm.cmd run test:unit:focused -- tests/unit/starship-economy.spec.ts -t "blocks a one-unit shortfall and spends the exact distance quote on launch" --reporter=verbose`; it passed 1/1. Typecheck, format check, and diff check passed. No source/remake mismatch was found and no production changes were made; controlled source-save comparison remains open.

10 October 2026 P-55 Unique News Tickers Seen: Cosmic Forge counts distinct IDs
in its saved `alreadySeenNewsTickerArray`; its ticker creation path checks for
an existing ID before append, and rebirth leaves the list intact. MIAPLACIDUS
likewise appends only unseen IDs, renders the list length in the Overview card,
and carries ticker progress through rebirth. The focused unit cases verify
duplicate wacky ID 1000 remains a single entry, a rendered two-ID sample shows
2, local and portable save/restore preserve three IDs, and rebirth retains the
seen-ID list. The Statistics Chrome case forced the same standard ticker ID
twice and a one-off ticker with a different ID, then verified the visible
Overview count is 2 (1/1 passed). Focused unit command:
`npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx tests/unit/local-saves.spec.ts tests/unit/meta-progression.spec.ts tests/unit/meta-signals.spec.ts -t "renders Unique News Tickers Seen|preserves unique seen ticker IDs|rebirths atomically at the conquered destination|applies a one-off bulletin exactly once and tracks distinct visual effects" --reporter=verbose`
(4 passed, 109 skipped). Focused browser command used port 4518 and installed
Chrome: `npm.cmd run test:e2e:focused -- --grep @p55-news-claims --workers=1 --reporter=list tests/e2e/settings/settings-statistics.spec.ts` (1/1 passed). These checks support per-save distinct-ID behavior; a controlled value comparison with a live Cosmic Forge save remains open. No runtime change was made.

9 October 2026 P-55 News Ticker Prizes Collected correction: Statistics now
reads `statistics.lifetimeNewsTickerPrizeClaims`, incremented once per accepted
standard or one-off claim; the distinct `claimedPrizeIds` remains the claim
deduplication list. The focused installed-Chrome case claims two standard
entries with the same ID plus a one-off entry, then verifies the visible
Overview count is 3 (1/1 passed). Unit cases verify repeated occurrences,
one-off claims, rejected duplicates, and rebirth retention; local-save tests
verify v45 migration. Because the previous schema retained only distinct IDs
and the last 50 ticker entries, it cannot reconstruct an exact old lifetime
total. The v45 migration starts the new counter at 0 and counts exactly from
that point. This closes the News Ticker claim-count mismatch; P-55 remains open
for the other Statistics counters and value checks.

At the time of the 9 October 2026 P-55 Antimatter Mined source comparison, Cosmic Forge's Overview
getter returns its all-time mined counter; normal mining credits both run and
all-time setters, rebirth resets only the run value, and save/load preserves
both (`constantsAndGlobalVars.js:968`, `:4986-4987`, `:1555-1558`,
`:1823-1824`, `:2190-2191`; `game.js:7001-7012`, `:14979-14986`). Its offline
restoration credits only floored active-asteroid extraction to those counters
(`game.js:12957-12976`). MIAPLACIDUS maps Overview to the lifetime counter and
the Mining page to run/lifetime values; its offline clock steps use
`advanceSpaceMining`, counting fractional asteroid and megastructure gains
(`SettingsStatisticsPane.tsx:255-261`, `SpaceMiningPane.tsx:941-948`,
`commands.ts:2324-2385`, `spaceMechanics.ts:2073-2177`). Existing unit cases
assert fractional mining during an offline-containing clock advance and
megastructure gains for both counters (`space-rules.spec.ts:525-558`,
`:1090-1113`); the Statistics E2E verifies only a fresh zero (`settings-statistics.spec.ts:292-300`).
The source/remake offline difference is documented for review; no controlled
source-save comparison or nonzero Overview-card assertion was inspected. No
tests were run for this read-only audit.

10 October 2026 follow-up: `statistics-display.spec.tsx` now seeds lifetime
mined at 1,234, current-run mined at 500, and current stock at 4,321, then
verifies the Overview Antimatter Mined card renders the formatted lifetime
value (1.2K), not stock or the run total (1/1 passed). Command:
`npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "renders Overview Antimatter Mined from the lifetime total" --reporter=verbose`.
The source/remake offline accounting difference and controlled source-save
comparison remain open; no gameplay code changed.

10 October 2026 offline-stat follow-up: `advanceSpaceMining` now receives the
clock-step phase and keeps offline resource gains and asteroid/timer behavior
unchanged while matching Cosmic Forge's mined-stat rule. It aggregates the
actual asteroid extraction amounts across the offline step, floors once, and
adds that integer to both current-run and lifetime mined counters; offline
megastructure production remains a resource gain but is excluded from these
statistics. Foreground mining still counts exact asteroid and megastructure
production. Typecheck passed; no tests or browser checks were run. The wider
controlled source-value comparison remains open.

10 October 2026 P-55 Theme source comparison: Cosmic Forge's `getStatTheme`
capitalizes the selected theme ID (`constantsAndGlobalVars.js:967,
:4982-4984`), and save capture/load preserve that same preference (`:1702,
:2042`). MIAPLACIDUS localizes the selected `settings.themeId` for display and
links the Overview card to Visual Options. The focused installed-Chrome case
changes themes through that control and checks the card value and owner link in
all six locales; it passed **1/1 on isolated port 5938**. Existing
`meta-signals.spec.ts:667-696` coverage cycles all nine theme IDs and verifies
the final selected ID survives local-save roundtrip. The two games intentionally
format the same preference differently (capitalized source ID versus
localized remake name); no semantic mismatch was found.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5938'
npm.cmd run test:e2e:focused -- tests/e2e/settings/p55-theme-statistic.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

9 October 2026 P-41 Statistics duration notation: the test-only
`notation-coverage` fixture supplies a 1,999-day run and lifetime active time.
The visible Statistics Run time and Overview's Time played now have focused
Chrome assertions for all three setting choices: Condensed begins `1.9Kd`,
Standard `1,999d`, and Scientific `2E3d`. The test changes notation through
Visual Options and returns to Statistics for each assertion; it exercises the
existing live duration formatter without changing runtime behavior. The
updated focused installed-Chrome case passed 1/1 in 7.7 seconds on port 4306.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4306'; npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-statistics.spec.ts -g 'P-41 formats the visible Statistics Run time in every notation' --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

9 October 2026 P-41 Statistics Cash notation: the deterministic
`notation-coverage` fixture supplies $1B in current-run Cash and
$987,654,321,098.76 in lifetime Cash earned. The focused case checks both
visible Statistics cards against `formatCurrency` in Condensed, Standard, and
Scientific notation, and confirms the rendered values change between Standard
and Scientific. Installed Chrome passed **1/1 in 7.7 seconds** on port 4421.
This covers the Statistics Cash rows; broad P-41 timer and currency-precision
visual review remains open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4421'
node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line -g '@p41-statistics-cash-notation' tests/e2e/settings/settings-statistics.spec.ts
```

9 October 2026 P-15 Settings accessibility: the focused installed-Chrome case
checks the Settings landmark and heading, the six localized child tabs, each
tab-to-panel `aria-controls`/`aria-labelledby` relationship, a visible panel
heading, and ArrowRight roving focus between Visual Options and Game Options.
The checks pass in all six locales (1/1 test, 10.9 seconds, port 4340).

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4340'; npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/settings/settings-accessibility.spec.ts
```

9 October 2026 P-44 Settings copy: Visual Options, Game Options, and Saving and
Loading now show their source-matched localized introductions. The currency
symbol control explains that it is visual-only, and the fullscreen button
describes the F11 shortcut; each helper is connected to its control with
`aria-describedby`. The `@p44-settings-copy` browser case checks these five
strings in all six locales. Installed Chrome passed **1/1 in 8.4 seconds** on
port 4422. The sandboxed npm wrapper had previously returned `spawn EPERM`; the
direct installed Playwright CLI completed the focused case.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4422'
node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line -g '@p44-settings-copy' tests/e2e/settings/settings-accessibility.spec.ts
```

P-44 Events subtab source-description parity, typed history context, schema-v47
migration, and the six-locale journal browser case are tracked in the
[random-events README](../random-events/README.md). The new visible copy is
rendered by the Events journal; focused browser execution for this addition
was blocked by `spawn EPERM` on 9 October 2026.

## P-54 Statistics browser follow-up (9 October 2026)

The full installed-Chrome `settings-statistics.spec.ts` area passed **16/16 in
55.0 seconds** on port 4496. The run verifies the Statistics data and
localization assertions after updating the expected status-row live region and
placing `cosmicRipClosed` with the MIAPLACIDUS live-status group, where it is
rendered. The desktop/mobile status-header snapshots now include the complete
game header and current-run row; both captures were visually reviewed with
weather effects disabled for a stable baseline. P-54 remains open for the
broader E-57 review of all-screen translated rows, tooltips, modals, and
dynamic costs.

## P-15 Statistics heading hierarchy (9 October 2026)

The Statistics page heading is h2 and its 14 content groups now use h3,
preserving their previous visual styling. The focused installed-Chrome case
checks all 14 localized group labels, the page h2, and absence of skipped h4–h6
headings in all six locales. It passed **1/1 in 9.6 seconds** on port 4591.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4591'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/settings/settings-statistics.spec.ts --grep '@p15-statistics-hierarchy'
```

At the time of this Statistics-specific entry, broader named-control,
landmark, screen-reader, and cross-screen focus review remained open; the
completed semantic navigation and focus acceptance is recorded in the app-boot
README. Manual screen-reader announcements remain tracked under P-20.

## P-29 audio route browser checks (10 October 2026)

The focused installed-Chrome route spec covers successful Galactic Market trade,
AP sale, and liquidation (`kaching.mp3` once per action); an individual Power
Plant toggle (`powerOn.mp3`); and successful system settlement from the visible
Colonise page (`buildTelescope.mp3` once). It uses deterministic in-app fixtures
and a local Audio mock. Stack tracing showed the extra `clickButton.mp3` came
from App's automatic `navigation.attention.discover` dispatch after settlement
unlocked a destination. This bookkeeping command is not a user click, so the
audio adapter now suppresses generic fallback cues for automatic attention
initialization/discovery. The settlement browser case asserts exactly one
`buildTelescope.mp3` and no extra cue. The UI route requires the Colonise child
page because diplomacy and battle controls are intentionally hidden on
Starship.

The native-select regression now verifies both source behaviors: opening the
notation select plays `clickSwitch.mp3`, and choosing a different value plays
`clickButton.mp3`. `settings.update` patches for locale, theme, currency, or
notation now use the option-selection cue; other settings patches retain the
switch cue. `spaceMechanics.ts` emits one aggregate `space.battle.round` per
simulation round and one `space.battle.finished` outcome event; it does not
expose per-ship impact events or timing. Matching Cosmic Forge's exact
per-impact explosion cadence would require new combat event/timing granularity,
so that remains outside this presentation-only fix. Remaining P-29 work is the
broader source-callsite-to-remake cue crosswalk and visible route checks for
antimatter boost, Black Hole, News and Casino claims, power-trip/weather alarms,
and force-field/megastructure and battle outcomes. The Telescope/Rocket visible
routes are documented in the [Space Telescope README](../space-telescope/README.md);
Resource/Compound visible routes are documented in the
[Economy README](../economy/README.md). Per-impact battle audio remains
unrepresentable with the current aggregate engine events.

**Resource and Compound action crosswalk:** Cosmic Forge's
`drawTab1Content.js` routes ordinary collect and autobuyer buttons through
`createButton`; `ui.js:4641-4647` plays `clickButton` for those buttons and
`increaseStorage` when the button is a storage action. `game.js:5219-5248` and
`5365-5396` explicitly play `kaching` for individual Resource and Compound
sales. `game.js:5299-5362` creates Compounds and displays the result notice;
its UI button gets the ordinary `clickButton` cue. The remake follows that
split: accepted collect/autobuyer/create commands use the generic click
fallback, `storage.increased` maps to `increaseStorage`, and `resource.sold`
maps to `kaching` for either category. Clock-driven Resource sales and
automatic Compound creation remain silent.

The focused Chrome case `tests/e2e/economy/audio-cues.spec.ts` verifies the
visible Hydrogen collect/sell and Diesel create/sell routes, with exactly one
cue per action and the expected resulting stocks. It passed **1/1 in 6.4
seconds** on port 4932. The expanded installed-Chrome run of that spec now
passes **3/3 in 9.1 seconds** on port 4934, adding a Hydrogen storage upgrade
(`increaseStorage.mp3`) and Hydrogen autobuyer purchase (`clickButton.mp3`),
each with exactly one expected cue and the resulting capacity/count change.
`audio-event-dispatch.spec.ts` passes **25/25**, and TypeScript passes.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_AREA='settings'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- tests/e2e/settings/audio-cue-routes.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:e2e:focused -- tests/e2e/settings/settings-preferences.spec.ts -g 'collapsibles and native selects play the source swipe cue' --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
$env:MIAPLACIDUS_TEST_AREA='p29-economy-audio'
$env:MIAPLACIDUS_TEST_PORT='4934'
npm.cmd run test:e2e:focused -- tests/e2e/economy/audio-cues.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:unit:focused -- tests/unit/audio-event-dispatch.spec.ts
npm.cmd run typecheck
```

## P-29 power and weather audio crosswalk (10 October 2026)

Cosmic Forge's `game.js` trips the grid with `powerOff` followed by
`powerTripped`; its manual master switch plays `powerOff` or `powerOn` according
to the requested state. Its individual plant control resolves to `powerOn`
after either toggle, which the existing browser case preserves. The focused
installed-Chrome route verifies a real simulated trip and the manual off/on
recovery controls, including exactly one cue per accepted action. It passed
**2/2 in 8.4 seconds** on port 4941.
The complete `audio-cue-routes.spec.ts` file also passed **4/4 in 12.6
seconds** on port 4942.

Weather has no player control: `audioManager.js` loops rain or eruption
ambience from the current system's weather and pauses the opposite track when
the condition changes. The unit test checks rain -> volcano -> clear transitions.
Automatic battery charge and discharge have no source sound callsite; a focused
unit case confirms changing quantities remain silent. The audio dispatch unit
file passed **26/26**. No Energy UI code was changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_AREA='settings'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4941'
npm.cmd run test:e2e:focused -- tests/e2e/settings/audio-cue-routes.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --grep 'grid trip and manual power recovery|individual power plant toggle'
$env:MIAPLACIDUS_TEST_PORT='4942'
npm.cmd run test:e2e:focused -- tests/e2e/settings/audio-cue-routes.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:unit:focused -- tests/unit/audio-event-dispatch.spec.ts
```

## P-29 generic interaction cue matrix (10 October 2026)

The source interaction contract in Cosmic Forge `ui.js` is: `createButton`
plays `clickButton` for an enabled button; `createToggleSwitch` plays
`clickSwitch` before applying its change; disclosure headers and dropdown
openers play `clickSwitch`; tab changes and dropdown option selection play
`clickButton`. A disabled `createButton` has no user activation because
`setButtonState` disables the native control. `callPopupModal` binds confirm and
cancel callbacks directly and adds no generic cue itself; the action behind a
confirmed dialog may play its dedicated cue.

The focused Chrome checks cover keyboard activation for an ordinary collect
button, a disclosure, main and child tabs, and a native select; the disabled
Hydrogen sale button receives no cue. A `hasTouch` Chrome context verifies a
main-tab tap plays exactly one `clickButton`. The pre-existing native select
case verifies pointer opening (`clickSwitch`) and option selection
(`clickButton`); the Galactic Market route verifies its dialog's accepted
liquidation plays exactly one dedicated `kaching` cue. These checks are in
`tests/e2e/settings/audio-cue-routes.spec.ts` and
`tests/e2e/settings/settings-preferences.spec.ts`.

The browser matrix exposed a mute-order defect: when the Sound Effects control
was turned off, the remake dispatched the preference first, so the audio
adapter correctly suppressed the generic cue using the newly muted state. The
Settings control now plays the source-matched switch cue immediately before
dispatching the off preference. Turning it back on continues to use the normal
accepted settings dispatch. The preference still saves as disabled, and both
directions produce exactly one `clickSwitch`. Focused Chrome checks passed
**3/3** (mute on/off, keyboard category matrix, and touch tab); the focused
audio dispatch unit file passed **26/26**, and TypeScript passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_AREA='settings'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- tests/e2e/settings/audio-cue-routes.spec.ts -g "sound effects toggle|generic UI categories|touch activation" --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:unit:focused -- tests/unit/audio-event-dispatch.spec.ts
npm.cmd run typecheck
```

The broad per-feature source cue crosswalk remains ongoing. This slice does not
claim every game action or every dialog path has been checked.

## P-29 ambient audio lifecycle browser evidence (10 October 2026)

Cosmic Forge `audioManager.js` keeps looping background audio and weather tracks
separate. `backgroundAudio.update()` resumes or pauses the background track
from the saved Background Audio preference; `weatherAmbienceManager.update()`
pauses every noncurrent weather track, then loops `rainLoop.mp3` or
`eruptionLoop.mp3` at 0.3 volume when Background Audio is enabled. Both updates
are called from the game loop (`game.js:2360-2361`). The remake's `audio.ts`
creates the same three loop types, applies background volume 0.5 and weather
volume at 60% of it (0.3 at the default), pauses the old weather loop on a
weather transition, and pauses all ambient loops when Background Audio is
disabled.

The focused visible Chrome case in `audio-cue-routes.spec.ts` starts with both
audio preferences off, enables Background Audio through the Settings checkbox,
then selects rain, volcano, and clear through the deterministic test weather
command. It observes the background loop start after the user interaction,
each weather loop start at the source volume, the previous weather loop pause
on transition, and all loops pause when Background Audio is switched off. It
also confirms the saved Background Audio and Sound Effects preferences. The
installed-Chrome case passed **1/1 in 5.9 seconds** on port 5017. No audio
preference or simulation logic was changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5017'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/settings/audio-cue-routes.spec.ts --grep 'background audio gesture starts'
```

## P-51 Settings narrow-layout review (10 October 2026)

`p51-settings-layout.spec.ts` reviews Game Options, Visual Options, Saving and
Loading, Achievements, Events, and Statistics in installed Chrome at 320px and
390px, in French with Terminal and Light themes. Across all 24 page/width/theme
combinations it asserts there is no document-level horizontal overflow, no
visible Settings descendant extends beyond the viewport, and no visible button,
select, input, or textarea clips its contents. It also opens the achievement
description tooltip, the Events probability disclosure, and the Saving and
Loading delete-confirmation fieldset; geometry is checked with each open. The
confirmation is only opened for inspection: the save is neither deleted nor
changed. These Settings pages expose no modal dialog.

The focused test passed **1/1 in 10.1 seconds** in installed Chrome on port
5025. Representative attached captures were visually inspected; the geometry
assertions cover all 24 combinations. No clipped labels or controls, horizontal
overflow, or out-of-bounds tooltip was found, so no presentation defect was
confirmed. This slice changed only the browser test and this evidence record.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_AREA='settings'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5025'
npm.cmd run test:e2e:focused -- tests/e2e/settings/p51-settings-layout.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-45 Settings and Statistics locale copy (10 October 2026)

The focused six-locale browser matrix checks Settings tab names, heading and
preference labels/options in Visual and Game Options, the source-mapped
intro/helper copy, and Statistics section headings. It also checks all 13
localized event-name rows and their Run/Lifetime labels, all Energy row labels
and tracking copy, and the Cosmic Rip lifetime labels and tracking note. The
installed-Chrome matrix passed **9/9 in 59.3 seconds** on isolated port 5110.
It does not claim a complete source-value audit of every Statistics number or
complete P-45 review of all gameplay routes and both ending routes.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5110'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-settings-statistics-achievements-5110 --grep '@p45-.*locales|@p44-settings-copy|@p15-statistics-hierarchy|@energy-statistics|@cosmic-rip-locale|@p44-achievement-descriptions|labelled tabs and associated panels' tests/e2e/settings/settings-accessibility.spec.ts tests/e2e/settings/settings-statistics.spec.ts tests/e2e/settings/p45-statistics-event-labels-locales.spec.ts tests/e2e/settings/p45-settings-controls-locales.spec.ts tests/e2e/achievements/achievements.spec.ts tests/e2e/achievements/p45-achievement-names-locales.spec.ts
```

## P-55 Random Events current-run/lifetime counters (10 October 2026)

Cosmic Forge maps each of its 13 event IDs to one This Run and one All Time
getter. Both read dedicated maps; successful `def.trigger()` completion invokes
the counter callback once, and rebirth clears only the run map. MIAPLACIDUS
increments its dedicated run and lifetime maps after successful event
application, and each Statistics card reads those exact ID-keyed values. The
source-to-remake comparison found no mismatch and required no gameplay change.

The focused unit file checks all 13 successful trigger paths increment exactly
their matching run/lifetime pair, verifies rebirth clears run values while
retaining lifetime values, and checks every rendered card with unique values so
rows cannot accidentally display a neighboring event's counters. It passed
**15/15**. The installed-Chrome case forces `researchBreakthrough`
twice, reads all 13 expected values from live game state, and compares both
values in every Statistics row; it passed **1/1 in 6.6 seconds** on isolated
port 5920. Typecheck and targeted formatting checks passed. Broader P-55
Statistics source-row validation remains open.

Source paths checked: Cosmic Forge `constantsAndGlobalVars.js:981-1006`
(getter map), `:5488-5513` (all event getter pairs), `:6223-6251` (increment
and getter functions), `:1462` (run reset), `:2298-2299` (save restore),
`events.js:1357-1398` (successful trigger order), and `ui.js:15341-15342`
(record callback). Remake paths: `src/content/metaSignals.ts:4-18`,
`src/engine/randomEvents.ts:440-466`, and
`src/app/SettingsStatisticsPane.tsx:675-684`.

```powershell
npx.cmd vitest run tests/unit/random-event-statistics.spec.tsx --reporter=verbose
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5920'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p55-random-event-stats-5920 tests/e2e/settings/p55-random-event-stat-values.spec.ts
npm.cmd run typecheck
npx.cmd oxfmt --check tests/unit/random-event-statistics.spec.tsx tests/e2e/settings/p55-random-event-stat-values.spec.ts
```

## P-55 Galactic Casino current-run/lifetime counters (10 October 2026)

Cosmic Forge exposes ten Casino Statistics getter pairs backed by dedicated
current-run and all-time counters. The read-only source audit mapped those
getters to the accepted play, outcome, and claim paths; rebirth resets the run
fields and save/load preserves both scopes. MIAPLACIDUS's `updateStats` adds
the same delta to both its run and lifetime fields, and Statistics maps each
of the ten Casino rows directly to those values.

The new unit file verifies exact paired deltas for accepted Double or Nothing
wins/losses, Wheel loss/win/special claim, Higher or Lower entry/loss/cash-out,
all five legal tier-seven prize keys, and Void Seer match/miss. It also verifies
that rejected games and converting goods into Casino Points do not change
Casino counters, and that local/portable save roundtrips preserve both maps
while rebirth resets only the run map. It passed **7/7**. No implementation
code changed, and this unit evidence is not a controlled source/remake action
comparison. The source's unconditional Higher-or-Lower last-card increment
versus the remake's `prize.won` guard remains owner-gated; all five tested legal
remake tier-seven outcomes award prizes. The source's pre-validation increments
for some invalid direct function calls were observed in code, but no ordinary
UI mismatch was established.

Relevant source paths: `cosmicForge/cosmicForge/constantsAndGlobalVars.js:85-142`
(paired increment helper), `:1158-1186` (Statistics getter pairs), `:1450-1459`
(rebirth reset), `:1795-1820` and `:2162-2187` (save/restore); `casino.js:455-470`,
`:956-1031`, `:1073-1129`; and `drawTab7Content.js:740-784`, `:1529-1596`.
Remake paths: `src/engine/galacticCasino.ts:301-314`,
`src/engine/metaProgression.ts:133-215`, and
`src/app/SettingsStatisticsPane.tsx:584-593`.

```powershell
npm.cmd run test:unit:focused -- tests/unit/casino-statistics.spec.ts --reporter=verbose
npm.cmd run typecheck
npx.cmd oxfmt --check tests/unit/casino-statistics.spec.ts
```

P-55 remains open for controlled source-value comparisons and the other
Statistics rows.

## P-55 Overview Run number source comparison (10 October 2026)

Cosmic Forge's `stat_run` reads `runNumber`: fresh state is 1, each rebirth
increments it once, and save/load preserves it (legacy saves default to 1).
The separate `currentRunNumber` field is not the getter used by the Overview
row. MIAPLACIDUS renders `permanent.rebirthCount + 1`, with rebirth count
starting at zero and increasing on an accepted rebirth. The focused
`statistics-display.spec.tsx` test verifies Overview Run is 1 fresh, 2 after
rebirth, and still 2 after portable save restore; it passed **1/1**. Existing
meta-progression and local-save tests cover rebirth and persistence of the
underlying count. The row matches the source; no gameplay change or controlled
source-save comparison was needed.

## P-55 Overview Legendary Asteroids Discovered source follow-up (10 October 2026)

The source increments its all-time Legendary value only after a normal
discovery passes the miss/cap checks, stores the generated asteroid, and sees
its `specialName` flag. MIAPLACIDUS generates only at completed survey time;
it returns without counting a null result, otherwise appends the asteroid and
updates lifetime when its rarity is Legendary. Neither normal flow has a
generated-but-hidden candidate stage. The focused deterministic
telescope-resume test proves zero during the active timer, one after the
Legendary result is in the asteroid list, and no duplicate increment (**1/1**).
Existing local-save and rebirth coverage confirms lifetime retention. The cap
eligibility difference above can change search availability, but not the
counter boundary. No runtime change or controlled source-save comparison was
made.

The focused `statistics-display.spec.tsx` case seeds three current-run
asteroids (`nextAsteroidSequence - 1` = 3), Total Asteroids Discovered at
8,765, and Legendary Asteroids Discovered at 1,234. With the default
Condensed notation, it verifies the Overview Total card displays `8.7K`, the
Legendary card displays `1.2K`, and the separate Space Mining Run/Lifetime
pair displays `3` / `8.7K`. This confirms the Overview value comes from the
lifetime total, distinct from both the run count and Legendary counter. The
focused test passed 1/1; typecheck, formatter, and diff checks passed. No
production change was made.

Command:
`npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "renders Overview Total Asteroids Discovered from its lifetime counter, apart from run and legendary counts" --reporter=verbose`

## P-55 Overview Rockets Launched rendered-card binding (10 October 2026)

Cosmic Forge's Overview Rockets Launched value is its all-time launch counter,
incremented when launch begins; MIAPLACIDUS exposes only the lifetime counter
for this Overview card. The focused Statistics render case seeds lifetime
launches to 1,234 while Rocket 1 is outbound on its first journey, then checks
the rendered card displays `1.2K`. The unit case passed 1/1; typecheck,
formatter, and diff checks passed. No production change was made. Controlled
source-save comparison remains open.

```powershell
npm.cmd run test:unit:focused -- tests/unit/statistics-display.spec.tsx -t "renders Overview Rockets Launched from the lifetime counter independently of current rocket state" --reporter=verbose
```

The source-to-remake contract for this row is also recorded in the
[Statistics parity plan](../../../docs/plans/statistics-presentation-parity.md).

## P-55 Star Ship Distance Travelled decision review (10 October 2026)

Cosmic Forge's Run and All Time columns call the same getter: both show the
current trip's progress while travelling, the full route on arrival, and zero
after rebirth. Saving/loading preserves that same field. MIAPLACIDUS instead
shows separately accumulated completed-route This Run and Lifetime totals,
updated on arrival; partial distance is not in the Statistics row. The source
comparison and choice are recorded in the [parity plan](../../docs/plans/statistics-presentation-parity.md)
and [open decisions](../../docs/plans/open-decisions.md#open-owner-decision-star-ship-distance-travelled-statistics).

The focused display/arrival/rebirth cases passed **4/4** across the two
Interstellar Statistics unit files. This later rerun supersedes the historical
10/10 migration pass recorded above: the schema has advanced since that run.
The v42 in-flight migration case was
attempted but currently fails before its behavior assertions because it expects
schema 45 while the current schema is 47. No pair-specific current-schema
save roundtrip for nonzero distance values was found. Owner choice remains:
keep the remake's completed-route run/lifetime totals with partial progress on
Starship, or show source-style current-trip distance in both columns with a
rebirth reset. No gameplay change was made.

## P-55 System Scanned Statistics source comparison (10 October 2026)

System Scanned is Interstellar row 4, not an Overview statistic. Cosmic Forge
shows its run flag as Yes/No and its All Time value as Not Applicable; scanning
sets the flag, rebirth resets it, and save/load preserve it. MIAPLACIDUS derives
the same This Run Yes/No value from a saved encounter for the selected
destination and uses Not Applicable for Lifetime. The scan transition, selector
and rendered row agree. Focused selector/display cases passed **3/3**; the
accepted 70% scan case now also asserts the statistic changes from false to true
and passed **1/1**. No separate scope choice appears in
[`open-decisions.md`](../../docs/plans/open-decisions.md); the owner's Colonise
page-placement decision does not specify a different Statistics scope. See the
[source comparison](../../docs/plans/statistics-presentation-parity.md#interstellar-system-scanned-scope-comparison-10-october-2026).

## P-55 Star Ship Built Statistics source comparison (10 October 2026)

Cosmic Forge reports its per-run `starShipBuilt` flag as Yes/No, leaves its
All Time value Not Applicable, sets the flag when all mandatory modules are
finished (Scanner excluded), persists it through save/load, and clears it at
rebirth. MIAPLACIDUS derives the same row from required module completion. The
focused Statistics lifecycle unit passed **1/1**: optional Scanner unbuilt,
portable save roundtrip, launched ship, and false again after rebirth. The
Statistics display test maps the row to This Run Yes / Lifetime Not Applicable.
See the [source and selector comparison](../../docs/plans/statistics-presentation-parity.md#p-55-star-ship-built-statistics-source-comparison-10-october-2026).

## P-55 Energy Times Tripped source comparison (10 October 2026)

Cosmic Forge counts a powered-grid transition to automatically off in both
run and All Time scopes; recovery does not count, and a later trip counts
again. Rebirth resets only the run count, and save/load retains both. The
remake follows that boundary. The deterministic regression checks trip,
repeated tripped tick, recovery, retrip, portable save/load, then rebirth:
counts reach 3/5, persist while tripped, then reset to 0/5. The six-locale
Statistics display assertion checks the 3/5 scope values. The focused run
passed **4/4** across Energy, display, Local Saves, and Meta Progression unit
files. See the [source comparison and test command](../../docs/plans/statistics-presentation-parity.md#p-55-energy-times-tripped-source-comparison-10-october-2026).

## P-56 Settings Statistics and Save & Loading visual matrix (10 October 2026)

`p56-statistics-save-visual-matrix.spec.ts` checks Statistics and Save &
Loading in installed Chrome across six locales, nine themes, and 1280/390/320px
viewports: 162 states per page, 324 total. The deterministic Cosmic Rip
Statistics fixture checks all 14 groups, the longest localized group heading,
visible cards, labels/values, and owner links for containment and text wrapping;
it also focuses the global Research Points breakdown tooltip in every state
and checks its viewport bounds. Save & Loading reuses a fresh local save's
portable export in a conflict preview; it checks the preview, disabled Replace,
Import New and Cancel controls, control/text/panel containment, text wrapping,
horizontal overflow, and vertical scrolling. No import or save change is
committed.

The review found the disabled “replace matching save” control hard to read:
its generic 0.45 opacity faded the red-disabled label in Terminal and washed it
out in Light. The import-conflict button now uses the active theme's
`--disabled-text` color, a matching tinted background/border, and full text
opacity. The matrix asserts the semantic theme color and opacity for all 162
Save states. No clipping, horizontal overflow, out-of-bounds tooltip, or other
control containment issue was found. Representative captures were reviewed at
320px Terminal, 390px Light, 390px Supernova, and 1280px Space for Save &
Loading; Statistics captures included 320px Terminal/Light/Supernova groups,
390px Light group, 1280px Space full page, and 1280px Terminal plus 320px Light
Research tooltips. The full-page review showed wrapping and vertical scroll
through all groups without horizontal overflow.

Captures are in
`test-results-p56-settings-statistics-save-5236/`:

- Statistics: `p56-statistics-de-terminal-320-long-group.png`,
  `p56-statistics-es-light-390-long-group.png`,
  `p56-statistics-fr-supernova-320-long-group.png`,
  `p56-statistics-pt-space-1280-long-group.png`,
  `p56-statistics-es-space-1280-full.png`,
  `p56-statistics-fr-terminal-1280-research-tooltip.png`, and
  `p56-statistics-fr-light-320-research-tooltip.png`.
- Save & Loading: `p56-save-de-terminal-320-import-preview.png`,
  `p56-save-es-light-390-import-preview.png`,
  `p56-save-pt-supernova-390-import-preview.png`, and
  `p56-save-fr-space-1280-import-preview.png`.

The final installed-Chrome run passed **2/2 in 1.5 minutes** on port 5236.
Typecheck and targeted formatting passed. This is a bounded P-56 slice and
does not close the full presentation checklist.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5236'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-settings-statistics-save-5236 tests/e2e/settings/p56-statistics-save-visual-matrix.spec.ts
npm.cmd run typecheck
.\node_modules\.bin\oxfmt.cmd --check src\styles.css tests\e2e\settings\p56-statistics-save-visual-matrix.spec.ts
```
