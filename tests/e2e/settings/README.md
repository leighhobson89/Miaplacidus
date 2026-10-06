# Settings browser checks

The statistics case also pins the Run source fields to live values, verifies
Overview ticker totals, confirms AP Anticipated is `0` on a fresh run, and
checks that the obsolete “not tracked separately” message is absent. It keeps
remake-specific Current Snapshot cards in their separate group and checks all
eight Resource and six Compound production cards, including their current-run
and all-time columns.

`settings-statistics.spec.ts` verifies that the source's Events, Galactic
Casino, and Cosmic Rip Chapter summaries remain separate groups inside the
Settings → Statistics destination. It checks representative translated event
rows and the saved-history migration note. The full event history stays in
Settings → Events, the Casino remains a Galactic child page, and Cosmic Rip
gameplay remains under the Cosmic Rip main tab.

The same case checks all five source Space Mining cards. Telescope and Launch
Pad show current-run status; built rockets, discovered asteroids and asteroid
arrivals show current-run and lifetime totals. In the source, “Asteroids
Mined” increments when a rocket reaches an asteroid, and telescope/Launch Pad
all-time values are not applicable.

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

The `@casino-statistics` case plays Double or Nothing and the Wheel through
their browser controls, then checks current-run and lifetime CP-spent and play
counters. It performs a real rebirth and confirms that current-run counts reset
while the lifetime counts remain. The check intentionally avoids casino “Won”
counters whose Higher or Lower semantics still need review.

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

6 October 2026: Energy Statistics renders all twelve source rows in source order. All twelve remain visible and unlinked before Energy unlock, then link to resolved owner pages afterward. Solar and Advanced links fall back to Energy Storage until their respective technologies are researched, then navigate to their specialized pages. Five live rows show localized All Time Not Applicable; Total Battery Storage uses `floor(capacity / 1000)` MJ, and Total Production uses effective tick-plan output. The plan records why this intentionally differs from Cosmic Forge's nominal plant-rate times timer-ratio getter. Seven counters (trips and six building types) show current-run/lifetime totals; accepted building quantities include buyMax, selling/loss preserves history, trips count once per on-to-tripped transition, and rebirth resets run values while retaining lifetime totals. Schema v42 initializes unavailable v41 Energy history to zero, with the six-locale note marking the boundary. Five focused unit files passed 93/93; typecheck after the source fix and the test-file diff check passed. Updated installed-Chrome Settings `@energy-statistics` passed 2/2, covering locked-state/no-link, unlocked hrefs, and navigation to Power Plant, Solar, Advanced, and Storage. The initial E2E attempt failed because localStorage setup ran on `about:blank`; the fixture now navigates to `/` before setup, and the final retry passed. Port 4173 was free after the run.

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
Array Restored, Cosmic Rip Located, and Cosmic Rip Stabilised. Their remake
meaning/scope remains unresolved pending the owner's async choice. Current GP
and telemetry balances, sector/research progress, and Rip Closed are remake-only
snapshots/status. Translation-quality approval remains pending.

```powershell
$env:MIAPLACIDUS_TEST_AREA = "statistics"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --grep @cosmic-rip --workers=1 --reporter=line tests/e2e/settings/settings-statistics.spec.ts
```
