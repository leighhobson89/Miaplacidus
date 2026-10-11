# Achievements browser area

The tests in this folder exercise the player-visible achievement catalogue, stable badge IDs, theme selection, permanent theme history, the nine-tab navigation, and save/reload behavior. Deterministic meta fixtures are used so the tests do not depend on long simulation waits.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/achievements/achievements.spec.ts` passed 1 browser journey. The once-only G-51–G-60 unit suite passed 20 files / 213 tests.

5 October 2026: the focused Chrome journey passed 1/1 after checking the visible
main-tab and Settings-child ID order and the localized Collect 50 Hydrogen card
in all six locales. This sweep exposed 108 corrupted accented label lines in
`achievementNames.generated.ts`; they are repaired, and the focused
`meta-signals.spec.ts` run passed 10/10 with a six-locale text-integrity check.


**P-41 notation check (9 October 2026):** the visible unlocked-achievement total is verified in Condensed, Standard, and Scientific notation. The focused installed-Chrome regression passed 1/1 as part of a 3/3 P-41 count batch on port 4265.

**P-41 cash reward notation (9 October 2026):** the `discoverBlackHole`
achievement card's $1,000,000 reward is checked in Condensed, Standard, and
Scientific notation. The visible value matches the shared currency formatter,
and Scientific differs from Standard. This case passed in the focused 9/9
installed-Chrome P-41 currency batch on port 4320.

**P-41 Achievement notification cash notation (9 October 2026):** the focused
browser case selects each notation, collects 50 Hydrogen through the player
control, and checks the resulting `$10` Achievement reward notification against
`formatCurrency`. It confirms the achievement unlock and exact cash reward stay
in run state. The first run reproduced the static-copy defect (`10 Cash`); the
notification now uses the event-time locale, currency, and notation. Installed
Chrome passed **1/1 in 15.3s** on port 4442. The six-locale notification unit
file passed **2/2**, and `npm.cmd run typecheck` passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4442'; node .\node_modules\playwright\cli.js test tests/e2e/achievements/p41-achievement-cash-notification.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p41-achievement-cash-notification'
```

**P-44 achievement descriptions (9 October 2026):** unit coverage maps all 70
source tooltip descriptions directly in six locales. The focused installed
Chrome case verifies all 70 localized descriptions render, and checks keyboard
access plus viewport fit for the longest descriptions in each locale. The
source-map unit test and browser case both passed 1/1.

## P-28 achievement badge artwork (10 October 2026)

`p28-artwork-review.spec.ts` checks all 70 decorative achievement badges at
1280 x 900 and 390 x 844 across all nine themes. Every badge is present, has a
resolved visible stroke/fill, stays inside its card, and remains hidden from
assistive technology and keyboard focus; the pane has no horizontal overflow.
Terminal desktop plus Light and Supernova phone captures were visually
reviewed. The full five-family P-28 installed-Chrome batch passed 5/5 on port
4980.
Named captures are attached in the generated Playwright report at
`playwright-report/index.html`; this focused art matrix does not replace P-56's
broader screenshot review.

## P-29 achievement audio and notification expiry (10 October 2026)

Cosmic Forge `achievements.js:167` calls `showNotification` with a 4-second
achievement card and has no dedicated achievement sound callsite. The
triggering UI action retains its ordinary button sound. In the remake,
`achievement.unlocked` maps to no dedicated cue, so a Hydrogen Collect action
plays exactly one `clickButton` while its localized Achievement notification
appears. The focused Chrome case collects through the real button to unlock
Collect 50 Hydrogen, then verifies the notification auto-dismisses after four
seconds without another cue. It passed 1/1 as part of the 2/2 installed-Chrome
achievement/random-event audio batch on port 4174. The audio event mapping and
localized achievement-notice unit specs passed 28/28; typecheck passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/achievements/audio-cues.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:unit:focused -- tests/unit/audio-event-dispatch.spec.ts tests/unit/achievement-event-notifications.spec.ts
npm.cmd run typecheck
```

## P-45 achievement name locale review (10 October 2026)

The new focused installed-Chrome case checks the rendered name for every one
of the 70 stable achievement IDs against the active locale catalogue in
`en`, `es`, `pt`, `de`, `it`, and `fr`. It passed **1/1** as part of the
Settings/Statistics/Achievements locale matrix, which passed **9/9 in 59.3
seconds** on isolated port 5110. The same batch reran the six-locale P-44
description case, which verifies all 70 tooltip descriptions and keyboard
access for representative longest descriptions in each locale.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5110'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-settings-statistics-achievements-5110 --grep '@p45-.*locales|@p44-settings-copy|@p15-statistics-hierarchy|@energy-statistics|@cosmic-rip-locale|@p44-achievement-descriptions|labelled tabs and associated panels' tests/e2e/settings/settings-accessibility.spec.ts tests/e2e/settings/settings-statistics.spec.ts tests/e2e/settings/p45-statistics-event-labels-locales.spec.ts tests/e2e/settings/p45-settings-controls-locales.spec.ts tests/e2e/achievements/achievements.spec.ts tests/e2e/achievements/p45-achievement-names-locales.spec.ts
```

## P-51 narrow visual review (10 October 2026)

The existing [Settings P-51 case](../settings/README.md#p-51-settings-narrow-layout-review-10-october-2026)
already exercises Achievements at 320px and 390px in French with Terminal and
Light themes, including an open description tooltip and viewport geometry. To
keep this slice limited to Achievements and Events, I used a fresh test-mode
Chrome session to visually recheck only Achievements at 320 x 844 and 390 x
844 in French/Terminal and French/Light. The first description tooltip stayed
inside the viewport in all four combinations (x bounds 4.7–276.7px and
11.9–283.9px at 320px; 10.7–346.7px and 17.9–353.9px at 390px). The French
achievement heading, count, cards, badges, rewards, and tooltip remained
legible without visible clipping. The document width equaled each viewport.

I also opened `activateBlackHoleOver10x`, the longest French description used
by the existing P-44 review. Its full tooltip stayed inside the viewport in all
four combinations: x=4.7 to 276.7px at 320px and x=10.7 to 346.7px at 390px
for both Terminal and Light; its vertical bounds were within the 844px
viewport. This long-description check is visual evidence only; the existing
narrow automated case opens the first, shorter tooltip.

The same review exposed a separate French name-copy defect: the
`studyAllStarsInOneRun` card renders `Ã‰tudiez toutes les Ã‰toiles en une Partie`
at both widths in both themes. The generated catalogue also contains the same
encoding problem for `studyStar`. This was a P-45 localization issue rather
than a clipping or tooltip defect; both names are corrected in the source-name
parity follow-up below.

The one-off captures are in the ignored
`test-results/p51-achievements-events-visual/` folder. No P-51 clipping,
overflow, or tooltip defect was found, so this review adds no duplicate browser
regression and does not close P-51's broader app-wide coverage. The French name
issue is corrected in the P-45 source-parity follow-up below.

## P-45 achievement name source parity (10 October 2026)

Compared all 70 achievement IDs across `en`, `es`, `pt`, `de`, `it`, and `fr`
against the matching `achievement{PascalCaseId}` keys in the read-only
`../cosmicForge/cosmicForge/localization.json`. The audit found eight generated
values that did not match the source: French `buildPowerPlant`, `studyStar`,
and `studyAllStarsInOneRun`; German `completeGame`,
`completeRunOnMiaplacidus`, `closeCosmicRip`, `enjoyEndlessSummer`, and
`completeOnboarding`. These were corrected in
`src/content/achievementNames.generated.ts`. The other 412 of 420 locale
values matched exactly and were left unchanged, including any source values
that already contain odd encoding.

`tests/unit/achievement-names-source-parity.spec.ts` now compares every
generated name directly with the source JSON. It checks all 70 stable IDs,
all six locales, and source-key existence. The first red run reproduced the
French `buildPowerPlant` mismatch. After correction, the focused test passed
**1/1**, typechecks passed for the app and the new test, and targeted formatting
passed. The ordinary Vitest command could not load the Vite config because the
sandbox denied a child process (`spawn EPERM`); the isolated config command
below passed in 0.27s.

```powershell
$taskConfig = Join-Path $env:TEMP 'miaplacidus-vitest-achievement-names.config.mjs'
Set-Content -LiteralPath $taskConfig -Value 'export default {};' -Encoding utf8
node .\node_modules\vitest\vitest.mjs run --config $taskConfig --configLoader runner --pool=threads --maxWorkers=1 --no-file-parallelism tests/unit/achievement-names-source-parity.spec.ts
npm.cmd run typecheck
npm.cmd exec -- tsc --ignoreConfig --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --strict --skipLibCheck --types node --noUncheckedIndexedAccess --exactOptionalPropertyTypes --noPropertyAccessFromIndexSignature tests/unit/achievement-names-source-parity.spec.ts
npm.cmd exec -- oxfmt --check src/content/achievementNames.generated.ts tests/unit/achievement-names-source-parity.spec.ts
```

## P-56 Achievements visual matrix (10 October 2026)

P-28 covers badge artwork at nine themes and desktop/390px widths. P-44 covers
localized descriptions and representative longest tooltips, while P-51 only
reviews French at 320px and 390px in Terminal and Light. None combined all six
locales, nine themes, 1280/390/320px, an earned card, and the expanded longest
localized description.

`p56-achievements-visual-matrix.spec.ts` checks that combined matrix: 162
locale/theme/viewport combinations. It earns `tryAllThemes` by cycling the
visible theme selector, then checks all 70 cards, the earned state, localized
heading/count containment, card and text/control containment, text wrapping,
document/frame horizontal overflow, and page vertical scrolling. In each
combination it focuses the P-44 longest-description achievement for that
locale, verifies the complete localized tooltip, scrolls it into view, and
checks that both tooltip and help control stay in the viewport.

The first matrix run found a real German 390px header overflow: the unlocked
count and label ended at x=389.98px while the Achievements pane ended at
x=376.4px. The Achievements header now wraps at widths up to 520px and keeps
the count aligned to the pane's right edge. The full matrix passed afterward.

Installed Chrome passed **1/1 in 31.4 seconds** on port 5229. I reviewed the
German 390px header capture, Spanish Light and German Supernova phone captures,
Portuguese Space 320px capture, and French Terminal desktop capture. The
unlocked count now sits inside the German pane; long Spanish, German,
Portuguese, and French descriptions wrap in their tooltip, and scrolling to
the focused help control keeps the tooltip visible. Terminal, Light,
Supernova, and Space text remained legible against their backgrounds. The
full-page captures showed no card clipping or horizontal overflow. P-56's
broader visual review remains open.

Captures are in
`test-results-p56-achievements-visual-5229/achievements-p56-achieveme-e056b-ths-p56-achievements-visual-chrome/`:

- `p56-achievements-de-terminal-390-header.png`
- `p56-achievements-fr-terminal-1280-tooltip.png` and
  `p56-achievements-fr-terminal-1280-full.png`
- `p56-achievements-es-light-390-tooltip.png` and
  `p56-achievements-es-light-390-full.png`
- `p56-achievements-de-supernova-320-tooltip.png` and
  `p56-achievements-de-supernova-320-full.png`
- `p56-achievements-pt-space-320-tooltip.png` and
  `p56-achievements-pt-space-320-full.png`

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5229'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-achievements-visual-5229 tests/e2e/achievements/p56-achievements-visual-matrix.spec.ts
npm.cmd run typecheck
.\node_modules\.bin\oxfmt.cmd --check src\styles.css tests\e2e\achievements\p56-achievements-visual-matrix.spec.ts
```
