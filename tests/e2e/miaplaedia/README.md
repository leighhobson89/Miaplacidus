# Miaplaedia browser tests

`miaplaedia.spec.ts` checks that Settings keeps its six preference/save/statistics/achievement/event destinations and that the seven source guide documents appear under Miaplaedia in source order. It opens every option and checks the section heading, first article heading, correct Mia'Plac player naming, and removal of the old Cosmic Forge game/player names. It captures the full Early Concepts page as a visual checkpoint.

The same browser area sweeps all seven stable Miaplaedia document IDs in all six locales at 1280px, 390px, and 320px. It checks each locale's section and first article heading against the matching source document, checks the old game/player names stay absent, verifies each document container fills its available game content width and stays inside the viewport, and asserts that neither the article nor page overflows horizontally.

Run the focused area with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/miaplaedia/miaplaedia.spec.ts
```

At the time, on 5 October 2026, the focused Chrome journey reported 1/1
passing, but its runner hung during browser shutdown and was interrupted after
reporting the result. A clean isolated rerun is recorded below.

5 October 2026: the six-locale Miaplaedia phone/desktop sweep passed 1/1 in
Chrome. All seven documents stayed mapped to their localized headings, with no
article or document-level horizontal overflow at either width.

5 October 2026 responsive follow-up: the focused Chrome area passed 2/2. The
seven-document sweep now also checks the guide bounds and document width at
320px across all six locales; the guide remains full-width within its parent,
and neither article nor document overflows horizontally at 320px, 390px, or
1280px.
8 October 2026: guide headings now use the same title class as the Resource pages. The Early Concepts screenshot was refreshed after visual review of that title-size update; the source-document mapping test passed 1/1 and the six-locale, three-viewport guide matrix passed 1/1.

9 October 2026: localized Miaplaedia navigation labels and page headings were compared against the seven Cosmic Forge `headerMain*` guide titles. The source option IDs still map in source order, and the focused `miaplaedia-title-parity.spec.ts` unit check covers both the child-tab label and its page heading in all six locales (42/42 passed). `npm.cmd run typecheck` passed. This closes title assignment parity; the seven-guide P-66 desktop/phone visual review is recorded below. The wider cross-theme, locale, and 320px matrix remains under P-56/P-65.

9 October 2026 P-66 visual review: the six remaining no-artwork guides - Get Started, Story, Concepts - Mid, Concepts - Late, Concepts - End Goal, and Philosophies - now have 1280x900 Terminal and 390x844 Light full-page captures. I reviewed all twelve: headings and article cards remain visible, long content scrolls vertically, and the phone navigation wraps without page-level clipping. The focused `@p66-visual-review` run passed without snapshot updates. Files are in `tests/e2e/miaplaedia/miaplaedia.spec.ts-snapshots/` as `phase6-guide-{get-started,story,concepts-mid,concepts-late,end-goal,philosophies}-{terminal-desktop,light-mobile}.png`.

9 October 2026 P-66 follow-up: Early Concepts now also has durable 1280x900
Terminal and 390x844 Light full-page captures. Both were reviewed; the guide
title, article cards, and vertical flow remain clear, with no artwork row or
page-level clipping. These pair with the earlier `miaplaedia-early-concepts.png`
baseline and close the missing phone-view sample. Files are
`phase6-guide-concepts-early-{terminal-desktop,light-mobile}.png` beside the
spec.

9 October 2026 P-65 read-only visual spot review: all fourteen `phase6-guide-*.png`
captures were inspected across the seven guide pages at Terminal desktop and
Light phone sizes. Each page heading matches the selected Miaplaedia child tab;
these guides have no artwork row, and article cards/text remain within the page
at both captured sizes. The guide submenu wraps across rows on phone. The
separate top-level tab strip does not: in each 390px capture, the `Miaplaedia`
label is cut off at the right edge (for example,
`phase6-guide-concepts-early-light-mobile.png` and
`phase6-guide-philosophies-light-mobile.png`). These static captures do not show
whether horizontal scrolling exposes the full tab, so live interaction review
is still needed for that control. This one-theme/one-locale pair of viewports
does not close the wider P-65 theme/locale matrix tracked in the checklist.

9 October 2026 P-65 selected-tab follow-up: the focused progressive-unlock
Chrome route now selects Miaplaedia at 390px, verifies its full tab bounds and
that the main rail scrolls, and captures the selected state in
`navigation-miaplaedia-selected-phone.png`. The title and NEW badge are fully
visible, with no page-level horizontal overflow. The route passed 1/1 in 18.8
seconds after waiting for transient achievement notices to clear before the
navigation screenshots. This resolves the selected-tab clipping concern from
the static guide captures; cross-theme, locale, and broader viewport review
remains open under P-65.

## P-44 Miaplaedia guide source descriptions (9 October 2026)

Cosmic Forge places each `headerDesc*` value after its selected guide page
title and before its body content. MIAPLACIDUS renders all seven source guide
descriptions in that position. The copy is present in `en`, `es`, `pt`, `de`,
`it`, and `fr`; the Get Started sentence uses the owner's required
`Miaplacidus` name in place of the old game's name. The focused
`@p44-description` Chrome case checks each localized page heading, description,
first article heading, and heading → description → articles order for all 42
page/locale combinations. It passed **1/1 in 11.6 seconds** on port 4337. The
original Early Concepts-only run passed 1/1 in 10.4 seconds; the expanded case
retains its order assertion and covers all seven description keys. Other P-44
source guide body/heading keys and catalogues remain open.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4337'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p44-description'
```

## P-44 Get Started article copy (9 October 2026)

The source `helpGetStartedSubHeading1`/`helpGetStartedSubBody1` pair supplies
one article. MIAPLACIDUS now uses the source copy in all six locales, with the
owner-required game and guide names (`Miaplacidus` and `Miaplaedia`). The 18
source `<br/>` markers now render as line breaks instead of visible markup.
The focused `@p44-get-started-copy` installed-Chrome case checks the localized
title, single-article order, full visible body, name corrections, and all 18
breaks in each locale. It passed **1/1 in 10.2 seconds**. See the [P-44
crosswalk](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-miaplaedia-get-started-article-key-crosswalk-9-october-2026)
for source IDs and disposition.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4337'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p44-get-started-copy'
```

## P-44 Story article copy (9 October 2026)

Cosmic Forge wires `helpStorySubHeading1`/`helpStorySubBody1` through suffix 3
to the Story guide's three articles. The focused `@p44-story-copy` installed-
Chrome case checks all three rendered headings and paragraph text against the
typed catalogue in all six locales, including their paragraph breaks. It also
checks the owner's Mia'Plac/Miaplacidus naming in each locale. The final case
passed **1/1 in 10.3 seconds** after the shared line-break renderer update. The
final source article's obsolete player/game
signature is intentionally adapted; the other Story article copy follows the
source. The [P-44 crosswalk](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-miaplaedia-story-article-key-crosswalk-9-october-2026)
records all six source keys and their target IDs.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4337'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p44-story-copy'
```

## P-44 Concepts - End Goal article copy (9 October 2026)

Cosmic Forge maps five ordered heading/body pairs to Concepts - End Goal.
Direct comparison found all 60 localized values match the typed `endGoal`
catalogue exactly. The focused `@p44-end-goal-copy` installed-Chrome case
checks the page heading and description, all five rendered headings and bodies,
their source order, and line-break counts in all six locales. It passed
**1/1 in 10.5 seconds**. The [P-44 crosswalk](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-miaplaedia-concepts---end-goal-article-key-crosswalk-9-october-2026)
records the ten source-key mappings.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4337'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p44-end-goal-copy'
```

## P-44 Philosophies article copy (9 October 2026)

Cosmic Forge wires seven ordered Philosophies heading/body pairs. Direct
comparison found all 84 localized values match the target catalogue exactly.
The focused `@p44-philosophies-copy` installed-Chrome case checks the localized
page title and description, each rendered article heading and body in source
order, paragraph-break rendering, and absence of the obsolete game/player names
across all six locales. It passed **1/1 in 10.9 seconds**. See the [P-44
crosswalk](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-miaplaedia-philosophies-article-key-crosswalk-9-october-2026)
for source IDs and disposition.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4337'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p44-philosophies-copy'
```

## P-44 Concepts - Mid article copy (9 October 2026)

Cosmic Forge wires twelve ordered Concepts - Mid heading/body pairs. Direct
comparison found all 144 localized values match the target catalogue exactly;
the source copy has no obsolete game/player names or explicit HTML breaks. The
focused `@p44-concepts-mid-copy` installed-Chrome case checks the localized
page title and description, each rendered article heading and body in source
order, paragraph-break rendering, and absence of the obsolete game/player names
across all six locales. It passed **1/1 in 9.9 seconds**. See the [P-44
crosswalk](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-miaplaedia-concepts---mid-article-key-crosswalk-9-october-2026)
for source IDs and disposition.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4337'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p44-concepts-mid-copy'
```

## P-44 Concepts - Late article copy (9 October 2026)

The read-only source comparison confirmed that all 16 ordered heading/body
pairs match MIAPLACIDUS exactly in all six locales (192 localized values);
the six localized page descriptions also match. This guide contains neither
the old game name nor the old player name, so no owner-name replacement was
needed. The focused `@p44-concepts-late-copy` installed-Chrome case checks the
localized title and description, every article heading and body in source
order, and exact paragraph-break placement for all 16 articles in each locale.
It passed **1/1 in 10.3 seconds** on port 4381.

See the [P-44 crosswalk](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-miaplaedia-concepts---late-article-key-crosswalk-9-october-2026)
for source keys and target mappings.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4381'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p44-concepts-late-copy'
```

## P-15 Miaplaedia heading hierarchy (9 October 2026)

Miaplaedia now uses the shell `h1`, an `h2` for each selected guide, and `h3`
for its article headings. The page-title class and article-heading styles
preserve their existing visual scale and color, including the Light theme. The
focused installed-Chrome `@p15` case checks the named `h2`, its
`aria-labelledby` relationship, all article `h3` headings, and absence of
skipped `h4` headings on all seven guides; it passed **1/1 in 6.2 seconds** on
port 4579. Typecheck and Oxfmt checks for the three touched source/test files
passed. At the time of this guide-specific entry, cross-screen P-15 review and
the Statistics heading gap remained open; both are addressed in the completed
P-15 record in the app-boot README. Manual screen-reader announcements remain
tracked under P-20.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_AREA='cosmicopedia'
$env:MIAPLACIDUS_TEST_PORT='4579'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@p15'
npm.cmd run typecheck
.\node_modules\.bin\oxfmt.cmd --check src/app/MiaplaediaPane.tsx src/styles.css tests/e2e/miaplaedia/miaplaedia.spec.ts
```

## P-54 Cosmicopedia clean rerun (10 October 2026)

The earlier shutdown hang did not reproduce on a fresh isolated port. The
focused `@cosmicopedia` Chrome area passed **10/10 in 59.1 seconds** on port
4812 and Playwright exited cleanly. The first run found only a stale Early
Concepts screenshot baseline: the current guide includes its localized
description row, increasing the full-page capture height from 1941px to
2003px. I reviewed the actual and expected captures, confirmed the added row
accounts for the height difference without clipping or content loss, and
refreshed that baseline with the focused mapping test, which passed **1/1 in
7.5 seconds** on port 4811.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4812'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p54-cosmicopedia-4812 tests/e2e/miaplaedia/miaplaedia.spec.ts --grep '@cosmicopedia'
```

## P-45 rendered guide-navigation locale slice (10 October 2026)

The focused six-locale route checks each guide tab's rendered/accessibility
name, selects all seven stable guide IDs, and verifies each resulting section
heading matches its localized label. The selected guide may omit the `New`
attention suffix after it has been opened; any visible suffix is checked
against the localized navigation message. Installed Chrome passed **1/1** as
part of the combined 2/2 P-45 Events/Miaplaedia run in 17.6 seconds on isolated
port 5105. Existing tests separately check the localized guide descriptions,
article copy, selection-to-document mapping, and article/page bounds across
six locales at 320px, 390px, and desktop width.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5105'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-events-miaplaedia-5105 tests/e2e/random-events/p45-event-catalogue-locale.spec.ts tests/e2e/miaplaedia/p45-guide-navigation-locales.spec.ts
```

## P-56 Miaplaedia long-copy visual matrix (10 October 2026)

The existing P-12 guide sweep checks all seven pages across six locales at
1280px, 390px, and 320px. P-66's reviewed captures cover all seven guides at
1280px Terminal and 390px Light. This focused P-56 extension selects Get
Started because its Spanish source article is the longest individual guide
article (2,859 heading-plus-body characters). It checks that page in all six
locales, all nine themes (`terminal`, `dark`, `misty`, `light`, `frosty`,
`summer`, `supernova`, `galaxy`, and `space`), and all three widths: 162
combinations. The browser case verifies the localized page title, description,
article heading and body; article, heading, and content containment; hidden or
clipped text; and document horizontal overflow.

Installed Chrome passed **1/1 in 26.5 seconds** on port 5217. I reviewed three
Spanish full-page captures: Terminal at 1280px, Light at 390px, and Space at
320px. The guide heading, description, article heading, and long body remain
inside the guide in each image, with no visible clipping or horizontal
overflow. Files are in
`test-results-p56-miaplaedia-visual-5217/miaplaedia-p56-miaplaedia--8d11c-ual-miaplaedia-presentation-chrome/`:
`p56-miaplaedia-get-started-es-terminal-1280.png`,
`p56-miaplaedia-get-started-es-light-390.png`, and
`p56-miaplaedia-get-started-es-space-320.png`. The initial check used a strict
line-box height comparison and flagged a two-pixel English heading metric
difference under Light; its screenshot showed the heading intact. The final
check identifies clipping only where computed overflow hides or clips content.
No Miaplaedia presentation defect was demonstrated, so this slice changes only
the focused regression and this README. Broader P-56 page/theme/locale coverage
remains open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5217'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-miaplaedia-visual-5217 tests/e2e/miaplaedia/p56-miaplaedia-visual.spec.ts
npm.cmd run typecheck
.\node_modules\.bin\oxfmt.cmd --check tests\e2e\miaplaedia\p56-miaplaedia-visual.spec.ts
```

14 October 2026 P-66 visual refresh: after reviewing the current failure
captures, I refreshed `miaplaedia-early-concepts.png` and the fourteen
`phase6-guide-*.png` desktop/phone captures for the seven individual source
documents. The differences were stale screenshots after guide descriptions
were added and a one-pixel full-page height change; the current pages show the
description, heading, and article content without clipping. The focused Chrome
run passed **4/4 in 25.0 seconds** on port 6401 without snapshot update mode:
the source-option ownership route, all remaining-guide captures, Early
Concepts captures, and the App Boot progression case. The ownership assertions
still map all seven Miaplaedia tabs to their own source document and rendered
heading. No renderer or navigation defect was found. The broader P-56/P-65
theme, locale, and viewport matrices remain open.

```powershell
$env:MIAPLACIDUS_TEST_PORT='6401'; $env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/miaplaedia/miaplaedia.spec.ts tests/e2e/app-boot/navigation-progression.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-miaplaedia-focused-6401" --grep 'Miaplaedia maps each guide option|Remaining Miaplaedia guides|Early Concepts has durable|progressive unlock states keep main tabs in source order'
```
