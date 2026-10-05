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
verifies that Galactic Casino is not a main tab and that the Galactic child
tabs remain in source order: Rebirth, Galactic Market, Galactic Casino,
Ascendency Perks, and Megastructures.

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
overflow. It also verified the five Galactic child tabs stay in source order
with Casino between the Market and Ascendency Perks.
