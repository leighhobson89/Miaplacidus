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
