# Status bar browser coverage

`status-bar.spec.ts` checks the event stat's static label and `None`, active,
and last-recorded values and tooltips in all six locales. A deterministic
Science Kit purchase verifies the `RP` tooltip names Research Points and shows
per-second production by source. It verifies AP is always available, CP appears
with the Galactic progression fixture, and GP appears with the Cosmic Rip
fixture. Each balance exposes its full localized points name on keyboard focus;
the whole-game row orders GP before AP, while the current-run row orders system
and weather, Run Time, Cash, RP, CP, and event. A 320px viewport checks that the
status cards and page remain within the viewport.

On 5 October 2026, the focused system-Chrome run passed all three cases (3/3),
including six-locale event labels and AP/CP/GP tooltip names.

On 8 October 2026, the focused system-Chrome localized-label check passed 1/1
in 23.3 seconds. It checked every rendered whole-game and current-run stat
label for wrapping without clipping and verified no horizontal document
overflow at 1280px, 390px, and 320px in all six locales. The responsive run
also exposed two narrow-screen overflow causes: the Hydrogen allocation slider
handle extending past its 100% endpoint, and the left-anchored AP tooltip
exceeding the right edge in German at 320px. The mobile slider track is now
inset by half the handle size, and global-context tooltips use a narrower
responsive width; their existing flex bases are unchanged. The focused case
uses the Cosmic Rip route fixture in the default Terminal theme; screenshot
review and the wider locale/theme matrix remain open under P-56/P-59.

On 8 October 2026, a focused system-Chrome Run Time label geometry case passed
1/1 in 16.0 seconds. It selected Diesel Compound at 1280px and iterated all six
locales, asserting the full localized label text, every rendered text-line box
inside the label, and the value below the label and inside its stat card. The
refreshed Diesel screenshots were also reviewed at crop scale: Spanish, Italian,
and French labels wrap to two lines and remain fully visible; English, German,
and Portuguese fit on one line. This did not confirm a layout defect, so no CSS
change was needed and the 50% Runtime flex ratio remains unchanged. The broader
theme and viewport screenshot matrix remains open under P-56/P-59.

Run only this browser area in system Chrome with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/status-bar/status-bar.spec.ts --workers=1
```

## Diesel Compound Run Time label geometry (8 October 2026)

The focused installed-Chrome case checks the Run Time label's rendered line boxes and height, verifies the value stays below the label, and confirms the label fits inside its stat card at 1280px across all six locales. French, Spanish, and Italian wrap to two lines; the other three locales fit on one line. All lines fit, no text is clipped, and the value remains below the label, so no CSS change was needed. This does not close broader theme or viewport review.

Start the test server separately so Playwright reuses it:

```powershell
npm.cmd run dev:test -- --host 127.0.0.1 --port 4173 --strictPort
```

Then run the focused case in another terminal:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/status-bar/status-bar.spec.ts -g "shows each translated Runtime label in full on Diesel Compound at 1280px" --reporter=line --workers=1 --retries=0 --trace=off
```

Result: `1 passed (16.0s)` using the manually started server.

The Runtime geometry follow-up used a manually started `dev:test` server so
Playwright could reuse it. Its focused command was:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/status-bar/status-bar.spec.ts -g "shows each translated Runtime label in full on Diesel Compound at 1280px" --reporter=line --workers=1 --retries=0 --timeout=60000 --trace=off
```

## Mobile AP and GP tooltip bounds (8 October 2026)

Focused system-Chrome regressions passed 2/2 for AP and GP tooltip hover bounds
at 390px. A hidden GP tooltip had added 2px to the document width; both
whole-game tooltips now anchor to the full-width global bar with a 4px inset.
The all-nine-theme Miaplaedia matrix also checks these bounds at 1280px and
390px (see the P-56 theme-presentation evidence).

## P-59 sign-off verification (8 October 2026)

The full installed-Chrome status-bar area passed **11/11** in 1.2 minutes with one worker, retries disabled, and clean process exit. It verifies the current-run and whole-game rows, progression gates, localized labels and tooltips across all six locales, keyboard focus, relative widths, and viewport bounds at 1280px, 390px, and 320px.

The run exposed two narrow-tooltip issues. At 390px, the location and Run Time tooltips were aligned against the wrong edge; their mobile anchors now keep the full tooltip in view. At 320px, the default 240px tooltips caused page overflow; tooltips now cap at 200px and wrap long content. The focused geometry case and all 11 status tests pass after these changes. Cross-theme screenshot review remains in P-56.

Command (with `MIAPLACIDUS_BROWSER_CHANNEL=chrome` and `MIAPLACIDUS_DISABLE_VIDEO=1`):

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/status-bar/status-bar.spec.ts --workers=1 --reporter=line --retries=0 --trace=off
```

## P-51 Standard Cash visibility (9 October 2026)

The large Standard Cash balance was clipped in the desktop status row. The Cash
card keeps the owner's same 50% flex basis and growth as Run Time. A desktop-only
142px minimum and 12.48px Cash value size let the full text fit while keeping
the status row compact; the phone-width flex and value rules and Cash tooltip
placement remain unchanged. The focused browser case checks the full formatted
live balance (over $1 billion) against the value's measured text width in
Terminal and Light themes at 1280px. It also verifies both stats keep their
shared flex sizing, all status cards stay on one desktop row, the tooltip
contains the full current amount, and the 390px tooltip stays within the phone
viewport without document overflow.

The focused installed-Chrome check passed **1/1** during snapshot generation
(port 4273, `--update-snapshots=all`) and again without updates after formatting.
The final no-update check used port 4278; run it with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "4278"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/status-bar/status-bar.spec.ts -g "shows the full Standard cash balance"
```

The refreshed 1280px captures were visually reviewed in both themes. Cash is
fully visible and the status cards remain on one row; Event retains its full
label/value, and the compact RP, GP, and AP cards remain readable. Run Time
measures 102.6/103.0px and Cash 142px (Terminal/Light); Event measures
307.9/309.1px, RP 123.2/123.6px, GP 22.9/24.5px, and AP 22.9/24.2px. The
separate header RUN/GP/AP indicators also remain visible. The reviewed
images are `status-bar.spec.ts-snapshots/p51-cash-standard-terminal-desktop.png`
and `status-bar.spec.ts-snapshots/p51-cash-standard-light-desktop.png`.

This closes the specific desktop Cash ellipsis finding. P-51 remains open for
the broader app-wide clipping and responsive review.

**P-41 Power battery countdown notation (9 October 2026):** the existing
`battery-cycle` fixture builds a battery and solar plant, charges the battery,
then runs a Science Lab to drain it. The focused browser case checks the Power
status countdown against the current energy rate and stored amount in
Condensed, Standard, and Scientific, then advances the test clock by one
second and verifies the visible estimate updates. Installed Chrome passed 1/1
in 8.0 seconds on port 4308.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4308'; npm.cmd run test:e2e:focused -- tests/e2e/status-bar/p41-battery-duration.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```


**P-41 top-row timer notation check (9 October 2026):** the live Last/Ongoing Event and Time Warp values are checked against the shared selected-notation duration format while switching Condensed, Standard, and Scientific. The focused installed-Chrome test passed 1/1 on port 4266.

**P-41 top-row Cash notation check (9 October 2026):** the deterministic
`notation-coverage` fixture provides a balance above $999,999,999. The focused
browser case checks the visible Cash row against `formatCurrency` in Condensed,
Standard, and Scientific notation, confirms Standard and Scientific render
differently, and verifies the live balance and every setting other than the
selected notation remain unchanged. Installed Chrome passed **1/1 in 6.4s** on
port 4439.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4439'; node .\node_modules\playwright\cli.js test tests/e2e/status-bar/p41-status-cash-notation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p41-status-cash-notation'
```

## P-56 Status Bar visual matrix (10 October 2026)

The supplemental top-level metadata matrix checks the whole-game and
current-run status rows in all six locales, nine themes, and at 1280px, 390px,
and 320px (162 layout combinations). A deterministic Cosmic Rip fixture keeps
GP, AP, and CP visible; every case also verifies the Run, location, Run Time,
Cash, RP, and Event rows. Assertions cover each card, label, value, Power
control when present, both status-group edges, and document width. The
localized location and Event tooltips are focused at both phone widths across
all locales and themes, with viewport bounds checked. Fixture-only achievement
notices are disabled after game start so the captures show the status layout.

The clean installed-Chrome run passed **1/1 in 44.2 seconds** on port 6204.
I reviewed the English Terminal 1280px, German Light 390px, Spanish Summer
320px, and French Space 320px captures. Labels wrap within their cards, status
values and controls remain contained, and none of the sampled pages has
horizontal overflow. The focused tooltip captures stay within the viewport;
the location tooltip overlays the lower status content while focused, as an
anchored popup, without clipping. No product layout defect was found and no
CSS change was needed. The P-56 screenshot files are in the ignored
`test-results-p56-status-bar-visual-6204/status-bar-p56-status-bar--b01a2-ual-status-bar-presentation-chrome/`
folder: `p56-status-en-terminal-1280.png`,
`p56-status-de-light-390.png`, `p56-status-es-summer-320.png`, and
`p56-status-fr-space-320.png`.

Focused verification also passed `npm.cmd run typecheck` and
`oxfmt --check tests/e2e/status-bar/p56-status-bar-visual-matrix.spec.ts`.
This contributes cross-theme evidence to P-56; it does not change the closed
P-59 status or close P-51/P-56 broader review.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6204'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-status-bar-visual-6204 tests/e2e/status-bar/p56-status-bar-visual-matrix.spec.ts
npm.cmd run typecheck
.\node_modules\.bin\oxfmt.cmd --check tests\e2e\status-bar\p56-status-bar-visual-matrix.spec.ts
```
