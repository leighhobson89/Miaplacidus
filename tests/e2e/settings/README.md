# Settings browser checks

The statistics case also pins the Run source fields to live values, verifies
Overview ticker totals, confirms unavailable AP Anticipated is disclosed, and
keeps remake-specific current snapshot cards in their separate group. It also
checks all eight Resource and six Compound production cards, including their
current-run and all-time columns.

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

The 5 October production-statistics run also checks all 81 Statistics cards,
the source ordering of all eight Resources and six Compounds, and both
zero-valued run/lifetime columns. Focused unit coverage passed for manual
collection, fusion, crafting, precipitation, automated and offline production,
storage caps, local/portable save roundtrips, v36-to-v37 migration, and rebirth
persistence/reset. Typecheck passed, the three focused unit files passed
83/83, and the Chrome case passed
1/1 with clean shutdown.

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
