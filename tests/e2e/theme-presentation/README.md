# Theme presentation checks

The focused `@theme-dropdowns` browser area checks native select controls and
their option menus in all nine themes. It covers representative selectors used
by startup, Settings, Galactic Market, Galactic Casino, telescopes, economy
cards, Star Data, autosave, and upgrade cards. It also checks that Terminal
panels and the live Star Map canvas stay black, and that the startup scene uses
a black canvas with lime and white artwork.

The `@theme-matrix` browser area starts from the late-game Megastructure route
and checks the Tech Tree, Galactic Casino, and an invalid-import save error at
1280px and 390px in every theme for document-level horizontal overflow. It also
verifies that Galactic Casino is not a main tab, and checks the currently
available Galactic child order. Its fixture has no scanned destination this
run, so Rebirth is correctly hidden; the full child declaration order is
covered by the navigation tests.

The `@theme-settings-matrix` browser area checks Achievements, Events,
Statistics, Game Options, Visual Options, and Saving and Loading at 1280px,
390px, and 320px in all nine themes. It verifies localized page identity and
Hydrogen title scale. Achievements, Events, and Statistics must have no artwork
row or eyebrow; the preference and save pages retain the Settings cog artwork.
Every page is checked against viewport and document bounds. This matrix creates
no visual snapshot baselines.

For focused P-66 visual review, the matrix also attaches Terminal viewport
screenshots: all six pages at 320px, plus Achievements, Events, and Statistics
at 1280px and 390px. The 9 October review found the three special pages fit
without title, card, or content clipping at those widths. The Events capture
disables animation and therefore does not assess live ticker contents; ticker
behavior remains covered by its own browser area.

The `@settings-locale-matrix` area visits the same six pages at 320px in all
six locales. It verifies localized page identity, Hydrogen title scale, the
no-artwork/no-eyebrow rules for Achievements, Events, and Statistics, and page,
content, and document bounds. The German Visual Options heading also retains its
no-orphan check. This matrix creates no visual snapshot baselines.

The expanded Settings matrices passed in focused installed-Chrome runs: the
all-theme sweep passed 1/1 and the six-locale 320px sweep passed 1/1. The locale
sweep exposed the German Achievements count badge extending beyond its heading
at 320px; the narrow layout now wraps that badge below the heading. The German
Visual Options no-orphan check remains in the same locale sweep.

The `@theme-miaplaedia-matrix` browser area visits all seven Miaplaedia guide
documents at 1280px, 390px, and 320px in all nine themes. It checks that
Miaplaedia has no artwork row, each title and guide content are visible, the
pane and content stay within their parent bounds, guide content does not
overflow internally, and the document does not scroll horizontally. The
expanded Chrome check passed 1/1 in the 49.9-second two-test run. It creates no
visual snapshot baselines.

The `@phase6-tab-layout` Miaplaedia case also compares all seven guide headings
with Hydrogen's title font size at the same three widths. It passed 1/1 in the
same 49.9-second Chrome run. Both checks cover layout and title scale; they do
not replace broader visual review across locales and intermediate viewport
widths.

The `@miaplaedia-locale-matrix` case checks the localized child tab and guide
heading identity, shared Hydrogen title scale, and pane/content/document bounds
for all seven guides in all six locales at 1280px, 390px, and 320px. The
focused installed-Chrome run passed 1/1 in 10 seconds. This complements the
all-theme layout sweep, which covers all three widths in each theme using the
English locale.

The `@phase6-tab-layout` cases in `phase6-tab-layout.spec.ts` check page-specific
titles and artwork, including one visible cog illustration on the Settings
header when entering Settings, no artwork on Achievements/Events/Statistics,
and the inline save controls. The Saving and Loading check also guards against
duplicating the local-pioneer heading in the inline Save Manager. On 8 October,
the focused Chrome file passed 4/4 in 12.6 seconds with the duplicate-heading
assertion. At that point the durable desktop/phone review was still pending; the completed P-66 evidence sweep is recorded below. Cross-theme, locale, and 320px matrix breadth remains tracked under P-56/P-65.

8 October 2026 P-66 Interstellar follow-up: the `@phase6-tab-layout` cases now
check that an unlaunched Starship keeps its title, illustration, and framed
border; the orbiting Starship keeps the `Starship` heading ahead of its
`Orbiting Sirius` status, while hiding its illustration and border; and
Colonise shows the surface illustration with its flag. The focused installed-
Chrome file passed 5/5 in 11.7 seconds. The orbiting scan/report ownership path remains covered by the Starship browser area; the P-66 desktop/phone review was completed in the 9 October evidence sweep below.

9 October 2026 P-66 durable visual evidence: `phase6-tab-layout.spec.ts` now
keeps Terminal desktop screenshot baselines for Settings > Visual Options,
unlaunched Starship, launched Starship, and Colonise with the surface flag.
The capture hides only the global animated weather and pointer-trail overlays
so the page artwork and layout compare deterministically. All four snapshots
were visually reviewed. The focused installed-Chrome spec passed 5/5 in 15.1
seconds without snapshot updates after formatting; the preceding baseline
generation run passed 5/5 in 14.5 seconds. Files are in
`tests/e2e/theme-presentation/phase6-tab-layout.spec.ts-snapshots/`.

The `@p65 @p66` Interstellar presentation matrix exercises Star Map, Star Data,
Starship, Fleet Hangar, and Colonise at 1280px, 390px, and 320px across all
nine themes and six locales (810 page/theme/locale/viewport combinations). It
checks localized tab/title agreement, Hydrogen title scale, Star Map/Star Data
artwork, launched Starship's no-art/no-border rule, Fleet and Colonise artwork,
and page/artwork bounds. The focused installed-Chrome matrix passed 1/1 in 2.3
minutes. It exposed a narrow Star Data control overflow and a wrapped Spanish
Star Map header overflow; controls now fit their grid cells, and the study-range
readout wraps below the heading on small screens.

The `@theme-cosmic-rip` check renders a sector button on Cosmic Rip's Scanner
Array page and compares its computed background with the active theme's
`--panel-raised` surface in all nine themes. This guards against fixed-color
surfaces that break theme identity. The focused installed-Chrome check passed
1/1 on 8 October 2026.

Run it with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/theme-presentation/cosmic-rip-theme.spec.ts
```

Run it with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "Interstellar child page identity fits" tests/e2e/theme-presentation/interstellar-presentation-matrix.spec.ts
```

The `@p65-meta-identity` cases check Galactic Market, Galactic Casino, Ascendency
Perks, Megastructures, and Cosmic Rip at 1280px and 390px. Each page must have
one visible heading that matches its child-tab name, its expected illustration,
the Hydrogen title size, and no document-level horizontal overflow. On 8
October, this two-case Chrome run passed 2/2 in 10.0 seconds. Ten diagnostic
captures were visually reviewed. The review found that the Ascendency Perks
child tab said “Ascendency Perks” while the page heading said “Ascendency”; the
heading now uses the full tab name and shared page-title class. No further
title/artwork mismatch appeared in the reviewed pages. Broader P-65 theme and
locale review remains open.

The `@p65-cosmic-rip-matrix` case expands Cosmic Rip coverage to Situation, Near
Space Scanner Array, and Cosmic Rip at 1280px, 390px, and 320px across all nine
themes and six locales (486 child-page/theme/locale/viewport combinations). It
checks each localized child-tab label and selected panel heading, the shared
Cosmic Rip title/artwork row and Hydrogen title scale, and pane, child-page,
and document bounds. The focused installed-Chrome run passed 1/1 in 55.6
seconds after the global 320px status-tooltip sizing fix; a final rerun with the
document-width assertion enabled passed 1/1 in 55.4 seconds. No Cosmic Rip pane
or document overflow remained. An earlier pre-fix sweep found document-level
overflow from status-bar tooltips outside the Cosmic Rip pane. This matrix does
not capture visual snapshots.

Run the focused P-65 meta identity check with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --trace=off tests/e2e/theme-presentation/p65-meta-identity.spec.ts
```

Run only the Cosmic Rip child-page matrix with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line --grep "Cosmic Rip child pages keep localized identity" tests/e2e/theme-presentation/p65-meta-identity.spec.ts
```

The Settings check also compares the Achievements, Events, Statistics, Game
Options, Visual Options, and Saving and Loading title font sizes with the
Hydrogen title scale. The updated focused Chrome file passed 4/4 in 12.8
seconds with those assertions.

The `@theme-tab-matrix` browser area unlocks a deterministic late-game route,
then visits each of the ten visible top-level tabs through the real navigation
controls at 1280px, 768px, 390px, and 320px in Terminal. It checks panel and
document bounds on all 40 tab/viewport visits, and attaches four Miaplaedia
screenshots, one per width. The Tech Tree, Galactic Casino, and save-error
viewport checks separately cover all nine themes at wide and phone widths.

Run it with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA = "theme-dropdowns"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/theme-presentation/theme-presentation.spec.ts
```

Run the late-game viewport matrix with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA = "theme-matrix"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/theme-presentation/theme-presentation.spec.ts
```

Run the Miaplaedia theme matrix with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA = "theme-miaplaedia-matrix"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/theme-presentation/theme-presentation.spec.ts
```

Run the tab-specific layout checks with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA = "phase6-tab-layout"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/theme-presentation/phase6-tab-layout.spec.ts
```

Run the all-tabs responsive matrix with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_TEST_AREA = "theme-tab-matrix"
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/theme-presentation/theme-presentation.spec.ts
```

The selector checks assert computed browser colors and the economy text palette
checks rendered contrast for its selected labels against their actual
backgrounds in all nine themes. It attaches a
Hydrogen screen for every theme to support visual review. These focused
assertions are a coverage slice, not the full P-56 screenshot review: all major
tabs, locales, error states, and additional viewport sizes still need visual
review under P-34 and P-56.

4 October 2026: all three focused checks passed in installed Chrome. The
Hydrogen first-run visual test also passed 1/1 as its Terminal startup
screenshots were refreshed for the black scene and panel colors.

5 October 2026: all three focused checks again reported passing in installed
Chrome after the Star Map case was updated to use the current single-action
new-save flow. The runner hung during browser shutdown after reporting those
results and was interrupted; the case results passed, but process teardown did
not exit cleanly.

5 October 2026: the dropdown browser area passed 4/4 checks in Chrome. Its
computed-color checks cover native controls across all nine themes and economy
headings, stock, rates, and buttons against each theme's text palette. This
found and fixed a Light-theme native option override that used navy text instead
of the theme's black ink. Nine 1280px Hydrogen screenshots were reviewed; that
review found low-contrast text tokens in Frosty and Summer. Their blue and brown
text shades, status colors, and muted text were darkened while their background
and panel colors stayed the same. Expanded contrast checks now measure the
economy labels against their composited backgrounds in all nine themes; the
review also adjusted Dark's primary button fill and Light's warning text. The
same review caught mojibake in economy chemical symbols and separators; they
now render with proper subscripts and typographic separators, and the browser
check asserts `H₂`. The Terminal SVG and Star Map black surface checks also
passed. The late-game viewport and error-state matrix passed
1/1, checking the Tech Tree, Galactic Casino, and an invalid-import alert at
1280px and 390px under all nine themes with no document-level horizontal
overflow. It verified the four Galactic child tabs available before a current-run
destination scan stay in source order, with Casino between the Market and
Ascendency Perks; Rebirth remains hidden until that scan is recorded.

6 October 2026: the initial 360-visit matrix across all nine themes exceeded
its 180s timeout; the 120-visit Terminal/Light/Supernova attempt exceeded 120s,
and the 60-visit reduced-theme attempt exceeded 90s. Those attempts were
abandoned before producing valid results. The final 40-visit Chrome matrix
passed 1/1 in 81.9 seconds, visiting all ten main tabs at 1280px, 768px, 390px,
and 320px in Terminal. Every visit checked the active tab/pane and the pane,
frame, and document bounds. I reviewed all four Miaplaedia screenshots: the
article surface fills the available pane at every width; the narrow top-level
navigation scrolls horizontally without document-level overflow. The Tech
Tree, Galactic Casino, and save-error checks continue to cover all nine themes
separately.

8 October 2026: the Miaplaedia matrix first exposed mobile overflow from the
AP tooltip, then a focused diagnostic identified the hidden
`#top-stat-tooltip-gp` extending 1.94px past the right edge at 390px. Both
whole-game AP and GP tooltips now anchor to the full-width global bar with a
4px inset. The full Chrome matrix passed 1/1 test in 26.2 seconds, covering all
nine themes at 1280px and 390px with the no-overflow assertions enabled. This
is targeted layout coverage, not broad visual sign-off: additional tabs,
locales, states, and visual review remain open under P-56.

A later 390px Tech Tree diagnostic measured the AP tooltip at x=166 to 406 and the
document width at 420px. The global AP tooltip was the overflow source; the Tech
Tree itself was not. The matrix explicitly focuses AP and checks the tooltip's
left and right bounds at both viewport widths across all nine themes.

The same day, the existing `@theme-matrix` passed 1/1 in Chrome in 54.6 seconds.
It checked the Tech Tree, Galactic Casino, and save-error state at 1280px and
390px across all nine themes with no document overflow. The test explicitly
verified that Rebirth is absent while the fixture has no current-run scanned
destination and that the four available Galactic child tabs remain in order.

8 October 2026: a focused Settings layout sweep visited Game Options, Visual
Options, and Saving and Loading at 1280px and 390px in all nine themes (54
page/theme/viewport combinations). Its bounds checks passed in Chrome in 14.1
seconds. I reviewed six Terminal screenshots across the three pages and both
widths. The empty local-save state repeated “Choose a local pioneer” in
adjacent headings; the redundant inner heading was removed. The focused
`@phase6-tab-layout` Chrome run then passed 4/4 in 12.6 seconds, including the
single-heading regression. At that stage the other P-66 desktop/phone captures were still pending; the 9 October review below records their completion.

8 October 2026: the all-tabs Terminal viewport matrix exposed a hidden Energy
tooltip extending the document to 916px at a 768px viewport. The tooltip is now
right-anchored at tablet widths while retaining its mobile placement. The
focused Chrome matrix passed 1/1 in 14.4 seconds across ten top-level tabs at
1280px, 768px, 390px, and 320px; it also asserts the Energy tooltip stays within
the viewport. This adds Terminal responsive evidence, not all-theme or all-locale
sign-off.

8 October 2026: the Settings locale check visits Game Options, Visual Options,
and Saving and Loading in all six locales at 320px. Its first pass exposed the
German Visual Options heading leaving a one-letter orphan; a soft-hyphen
opportunity preserves the shared Hydrogen title size and renders
`Darstellungs-` / `optionen` cleanly at 320px. The focused installed-Chrome run
passed 5/5 in 27.5 seconds, including the six-locale Settings matrix and the
four P-65/P-66 title/layout cases; the latter still verify Miaplaedia heading
size against Hydrogen at 1280px, 390px, and 320px. The German 320px screenshot
was visually reviewed. Broader visual and cross-theme review remains open.

8 October 2026: the P-65 meta identity check now requires the shared
`game-page-title` treatment as well as matching title scale, one artwork row,
and the intended illustration. Galactic Market and Galactic Casino headings
now use that class, giving their titles the same line height and translation
wrapping rules as the other meta pages. The focused Chrome spec passed 2/2.

9 October 2026 P-66 visual review: `phase6-interstellar-visual-review.spec.ts` captures the unlaunched Starship with its illustration and frame, then the launched Starship, Fleet Hangar, and Colonise pages at 1280px Terminal and 390px Light. The selected launched Starship, Fleet Hangar, and Colonise headings align within 2px in both positions after the one-time scan notice clears. All eight captures were reviewed; the unlaunched Starship title remains inset with its frame, while the launched page has no illustration or border and Colonise shows its flag and scan report. The screenshot specs for Cosmic Rip, Galactic Rebirth, Star Map, and the six remaining Miaplaedia guides were reviewed in the same bounded slice. The five focused `@p66-visual-review` cases passed in installed Chrome without snapshot updates (24.4 seconds). This covers the selected desktop/phone P-66 states; the wider cross-theme, locale, and 320px matrix remains under P-56/P-65. Interstellar files are in `tests/e2e/theme-presentation/phase6-interstellar-visual-review.spec.ts-snapshots/`.

Run the bounded screenshot verification with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4190'; node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g '@p66-visual-review' tests/e2e/star-map/star-map.spec.ts tests/e2e/theme-presentation/phase6-interstellar-visual-review.spec.ts tests/e2e/cosmic-rip/cosmic-rip.spec.ts tests/e2e/miaplaedia/miaplaedia.spec.ts tests/e2e/galactic-market/p66-rebirth-visual.spec.ts
```

9 October 2026 P-66 durable Settings review: `phase6-tab-layout.spec.ts` now
captures Achievements, Events, Statistics, Game Options, Visual Options, and
Saving and Loading at 1280x900 Terminal and 390x844 Light. All twelve full-page
images were reviewed. The three special pages retain no artwork row or `META`
eyebrow; the other pages keep the cog artwork, and their page headings and
controls remain visible without clipping. Existing theme/locale matrices still
cover identity and bounds; these representative screenshots do not replace that
breadth. Files are in
`tests/e2e/theme-presentation/phase6-tab-layout.spec.ts-snapshots/` with the
`phase6-settings-{achievements,events,statistics,game-options,visual,saves}-{terminal-desktop,light-mobile}.png`
names.

9 October 2026 P-66 desktop/mobile evidence sweep: the focused review cases
cover the owner-directed page families at 1280px desktop and 390px phone,
including Settings, all seven Miaplaedia guides, Energy, Space Mining,
Interstellar, Star Map, Galactic Rebirth, and Cosmic Rip; Galactic Casino's
separate reviewed child-page captures remain in its own README. The clean
installed-Chrome no-update run passed 12/12 in 45.5 seconds. No P-66-specific
desktop/mobile visual gap was found. Cross-theme/locale and 320px matrix breadth
remains tracked separately under P-56/P-65.
