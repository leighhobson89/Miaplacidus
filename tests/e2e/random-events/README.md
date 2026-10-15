# Random events and news browser area

These tests exercise event and ticker outcomes through the test-mode engine command boundary, then check that the event journal, its event-specific artwork, prize claim control, locale changes, and reload behavior match the saved state. The journal artwork checkpoint verifies the science-theft event glyph while retaining its explicit negative sign cue.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/random-events/random-events.spec.ts` passed 1 browser journey. The once-only G-51–G-60 unit suite passed 20 files / 213 tests.

Verification record (5 October 2026): the focused Chrome journey printed a passing result for 1 browser journey and updated the event artwork checkpoint. The runner then hung during browser shutdown and was interrupted.


**P-41 notation check (9 October 2026):** the active-event count in the Meta Journal follows Condensed, Standard, and Scientific notation. A focused installed-Chrome regression passed 1/1 as part of the 3/3 P-41 count batch on port 4265.

**P-41 active-event duration notation and live update (9 October 2026):** the
focused browser case forces the normal 30-minute Galactic Market Lockdown
event, checks its visible journal countdown against the game state in all three
notation modes, and confirms Scientific differs from Standard. A ten-minute
test-clock advance lowers the game-state duration to 20 minutes and updates the
visible Scientific value. Installed Chrome passed 1/1 in 7.1 seconds on port
4307.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4307'; npm.cmd run test:e2e:focused -- tests/e2e/random-events/p41-journal-duration.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 journal News interval and history-age notation (9 October 2026):** a
focused browser case forces a normal prize entry and Galactic Market Lockdown,
then checks the remaining News interval plus the News and event-history ages
against the simulation state in Condensed, Standard, and Scientific notation.
Scientific differs from Standard for all three readouts. A ten-second clock
advance updates each visible value; installed Chrome passed 1/1 in 6.8 seconds
on port 4309.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4309'; npm.cmd run test:e2e:focused -- tests/e2e/random-events/p41-journal-duration.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 formats live News interval and journal history ages'
```

**P-44 source event descriptions (9 October 2026):** event-history records now
retain typed event-time IDs and numeric outcomes under save schema v47. The
journal resolves goods/buildings in the active locale and preserves variable
rocket/asteroid display names alongside stable IDs. The focused unit coverage
checks all 26 source templates across six locales, all 13 supported event
families and legacy-context fallback; the save coverage checks event detail
round-trip plus v46 migration without fabricated details. The browser journey
checks the visible Research Halved description after save/reload in all six
locales, and the active-effects notation case checks the source Galactic
Market description. A legacy supply-chain row without a stored percentage uses
the source generic production-reduced template with `?` in that missing value.

`npm.cmd run typecheck` passed. Focused unit verification passed 4 files / 82
tests, including description mapping, localization validation, event-detail
round-trip, and v46 migration. A minimal temporary Vite config plus Vitest's
thread pool avoided the sandbox's denied child-process fork. The first
installed-Chrome retry reached the browser but found the saved checkpoint was
stale: expected 1280x828, actual 1280x819. Visual review confirmed the current
capture shows the intended Settings/status row and new event description; both
journal cards are aligned with no clipping. The checkpoint was regenerated at
the current 1280x819 size. The snapshot-update run passed **1/1 in 8.3s** on
port 4445, and the no-update rerun passed **1/1 in 7.0s** on port 4446,
including save/reload and all six locale assertions.

```powershell
$taskConfig = Join-Path ([System.IO.Path]::GetTempPath()) 'miaplacidus-vitest-minimal.config.mjs'
Set-Content -LiteralPath $taskConfig -Value 'export default {};' -Encoding utf8
node .\node_modules\vitest\vitest.mjs run --config $taskConfig --configLoader runner --pool=threads --maxWorkers=1 --no-file-parallelism tests/unit/random-event-descriptions.spec.ts tests/unit/meta-signals.spec.ts tests/unit/localization-validation.spec.ts tests/unit/local-saves.spec.ts
```

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4445'; node .\node_modules\playwright\cli.js test tests/e2e/random-events/random-events.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'records an event and guarded news prize' --update-snapshots
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4446'; node .\node_modules\playwright\cli.js test tests/e2e/random-events/random-events.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'records an event and guarded news prize'
```

## P-28 random-event glyph artwork (10 October 2026)

`p28-artwork-review.spec.ts` renders all 13 shipped `RandomEventArtwork`
components in an isolated test gallery and checks visibility, accessible
decoration semantics, card bounds, no horizontal page overflow, and resolved
theme colors at 1280 x 900 and 390 x 844 across all nine themes. Representative
Terminal desktop and Light/Supernova phone gallery captures show every glyph
clearly and inside its frame. The event-gallery capture is test-only; it does
not change the in-game journal. The five-family installed-Chrome P-28 batch
passed 5/5 on port 4980.
Named captures are attached in the generated Playwright report at
`playwright-report/index.html`; this focused art matrix does not replace P-56's
broader screenshot review.

## P-29 random-event alarm audio (10 October 2026)

Cosmic Forge `events.js:1430` enqueues its five-second random-event notice,
plays `eventAlarm` once, then opens the event modal. The remake maps
`random-event.triggered` to `eventAlarm`; `random-event.ended` has no audio
cue. The focused Chrome test forces Research Breakthrough through the test
gateway, checks its event history and exactly one `eventAlarm.mp3`, then
advances the simulation and confirms no replay. It passed 1/1 as part of the
2/2 installed-Chrome achievement/random-event audio batch on port 4174.
Focused audio/achievement notice units passed 28/28; typecheck passed.

The remake currently has no `random-event.triggered` subscriber that creates a
`GameNotification`; therefore there is no random-event toast whose dismissal
can be verified in this slice. The source event alarm is still verified, and
achievement-notification auto-dismiss is covered in the
[Achievements README](../achievements/README.md). Notification copy and flow
were left unchanged here.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/random-events/audio-cues.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:unit:focused -- tests/unit/audio-event-dispatch.spec.ts tests/unit/achievement-event-notifications.spec.ts
npm.cmd run typecheck
```

## P-45 rendered Events locale slice (10 October 2026)

The focused browser route renders the saved News & Events journal in all six
locales. It checks the localized pane/section headings, Science Theft's
history name, all 13 event names in the probability list, the event-probability
label, and a prize row's localized source copy, category, and Claim control.
The installed-Chrome check passed **1/1** as part of the combined 2/2 P-45
Events/Miaplaedia run in 17.6 seconds on isolated port 5105. Existing focused
tests continue to cover the six-locale event-effect description and live
duration/notation behavior.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5105'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-events-miaplaedia-5105 tests/e2e/random-events/p45-event-catalogue-locale.spec.ts tests/e2e/miaplaedia/p45-guide-navigation-locales.spec.ts
```

## P-51 narrow visual review (10 October 2026)

The existing [Settings P-51 case](../settings/README.md#p-51-settings-narrow-layout-review-10-october-2026)
already checks Events at 320px and 390px in French with Terminal and Light
themes, including the open event-probability disclosure and viewport geometry.
For this isolated Achievements/Events slice, a fresh test-mode Chrome session
visually rechecked only Events at 320 x 844 and 390 x 844 in French/Terminal
and French/Light. I opened the 13-event probability disclosure in each view.
The Events panel stayed within x=13.6–306.4px at 320px and x=13.6–376.4px at
390px; the document width equaled the viewport in every combination. The long
French page heading wraps at 320px and fits at 390px, and the probability rows
remain inside the panel without visible clipping.

The one-off captures are in the ignored
`test-results/p51-achievements-events-visual/` folder. No defect was found, so
this review adds no duplicate browser regression and does not close P-51's
broader app-wide coverage.

## P-56 Events visual matrix (10 October 2026)

Existing Settings coverage checks Events at 1280px, 390px, and 320px across
nine themes in English, and at 320px across six locales. P-45 checks all 13
localized event names in the open probability disclosure, while the P-51
French review checks the disclosure at 320px and 390px in Terminal and Light.
This focused P-56 case combines those concerns for the Events page: it opens
the 13-entry probability list and checks the Events page in six locales, nine
themes, and all three widths (162 combinations). It verifies localized page
and journal headings, a visible Science Theft history row, every probability
name, journal and page bounds, and the long labels' horizontal containment.

The source-label scan selects Spanish for the longest single page label and
French for the longest individual event name. Installed Chrome passed **1/1 in
52.7 seconds** on port 5225. I reviewed Spanish full-page captures at Terminal
1280px, Light 390px, and Space 320px, plus the French Space 320px capture. The
French “Rupture de la chaîne d’approvisionnement” probability name wraps within
its row; all four captures show the journal and open disclosure contained in
the Events page without visible clipping or horizontal overflow. Files are in
`test-results-p56-random-events-visual-5225/random-events-p56-events-v-d601d--random-events-presentation-chrome/`:
`p56-events-longest-page-label-es-terminal-1280.png`,
`p56-events-longest-page-label-es-light-390.png`,
`p56-events-longest-page-label-es-space-320.png`, and
`p56-events-longest-event-fr-space-320.png`.

An initial port 5223 run did not reach the layout assertions because the meta
fixture did not produce the forced Supply Chain Disruption row. The focused
case now seeds the already verified Science Theft journal row; the probability
disclosure still renders all 13 names, including the longest labels. No Events
presentation defect was demonstrated, so no page source was changed. Broader
P-56 coverage remains open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5225'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-random-events-visual-5225 tests/e2e/random-events/p56-events-visual-matrix.spec.ts
npm.cmd run typecheck
.\node_modules\.bin\oxfmt.cmd --check tests\e2e\random-events\p56-events-visual-matrix.spec.ts
```

## Saved 14 October full-run failure recovery

Both saved Random Events failures with error contexts are recovered by the current tree. The P-45 locale test previously used a non-exact accessible-name match for the Events heading, which also matched Active Events; the assertion now uses exact heading names. It checks the event names, journal labels, and prize row in all six locales. The saved artwork failure was a stale screenshot size: its expected image was 1280 by 819 while the current captured page was 1280 by 810. The current checkpoint is 1280 by 810. Visual review confirms the event artwork and journal content fit without clipping; the no-update rerun confirms this baseline.

Focused installed-Chrome reruns passed **2/2 total**, with no retries and no snapshot updates:

| Saved case | Result | Output |
| --- | --- | --- |
| P-45 event names, journal labels, and prize notice in every locale | 1/1 passed in 9.8 seconds | `%TEMP%\miaplacidus-random-events-p45-6507` |
| Event journal artwork, prize claim, save/reload, and six locale changes | 1/1 passed in 7.7 seconds | `%TEMP%\miaplacidus-random-events-journal-6508` |

No app behavior or locale values were changed for these recoveries.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6507'; npm.cmd run test:e2e:focused -- tests/e2e/random-events/p45-event-catalogue-locale.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-random-events-p45-6507"
$env:MIAPLACIDUS_TEST_PORT='6508'; npm.cmd run test:e2e:focused -- tests/e2e/random-events/random-events.spec.ts --project=chrome --grep 'records an event and guarded news prize across locale changes and reload' --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-random-events-journal-6508"
```
