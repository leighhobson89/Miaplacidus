# Debug scenario menu

P-62 coverage uses the real scenario menu controls in the deterministic test build. `NumpadSubtract` opens and closes the scenario menu; `NumpadAdd` opens and closes the existing Test Lab. If one is open, pressing the other shortcut switches to the other menu. Shortcut handling must leave focused editable controls alone.

`debug-menu.spec.ts` checks all 25 scenario action rows in Cosmic Forge source order, disabled cinematic placeholders and their visible reasons, the unsupported feedback news option and reason, Spanish language selection, a visible research grant, selected timewarp values, all 13 source event options and their live eligibility, clear weather, and future wacky ticker scheduling. Ineligible events must remain blocked when called through the debug gateway. Set News must leave the current ticker entries and countdown unchanged; the selected category and interval apply when a later ticker is scheduled. A direct gateway call also rejects adding fleets before the Starship exists. The legacy `Test1981` pioneer name must start an ordinary game without opening the menu or granting progression.

The browser harness checks JavaScript errors and rejects external requests. Each test gets isolated browser storage. Scenario actions normally go through visible controls; direct gateway calls are limited to proving that unavailable events and unmet fleet prerequisites are rejected. State reads and the deterministic clock provide secondary outcome checks.

Run only this area from the project folder:

```sh
npm run test:e2e:focused -- tests/e2e/debug-menu/debug-menu.spec.ts
```

Pure scenario coverage is in `tests/unit/debug-scenario-actions.spec.ts`. It checks locale choices, allowed/rejected warp options, additive and fixed grants, all economic goods, technology exclusions and idempotence, weather, event history, news scheduling without an immediate ticker plus future category/interval application, deterministic launch preparation and direct asteroid grants, direct starship construction, fleet prerequisites, rocket counters, permanent grants/refunds, input immutability and explicit cinematic placeholders. The browser suite exercises Hold Enter by repeating a hovered scenario action until Enter is released.

```sh
npm run test:unit:focused -- tests/unit/debug-scenario-actions.spec.ts
```

The browser tests run in the development/test build and do not themselves prove production omission. Production omission is checked by building the release bundle and scanning its emitted assets.

Focused helper verification on 6 October 2026 passed: one unit file, 15 tests. On Windows PowerShell, use `npm.cmd` if the local execution policy blocks the `npm.ps1` shim.

Focused browser verification passed in system Chrome: all seven cases in `debug-menu.spec.ts` (14.9 seconds), including both shortcut-switch directions, editable-control guards, six-locale menu and immediate confirmation copy, and narrow-width event controls. The separate Test Lab shortcut case passed 1/1 (2.5 seconds). Runs used `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, `MIAPLACIDUS_DISABLE_VIDEO=1`, one worker, and an existing `dev:test` server on port 4173. Playwright exited cleanly. The production build passed, and a search of the emitted JavaScript found none of the scenario-menu labels, gateway, action IDs, keypad shortcut strings, or `Test1981`. No full suite was run.

8 October 2026 follow-up: tests/unit/debug-scenario-actions.spec.ts passed 17/17, typecheck passed, and the production build passed after the audio-wrapper gating change. A fresh emitted-bundle scan found no debug UI, gateway, action/scenario/reducer symbols, keypad hooks or shortcut strings, `.debug-*` selectors, or debug chunks. The prior focused Chrome browser results remain the latest browser evidence; no new Chrome run is claimed here.

9 October 2026 P-62 follow-up:

```powershell
npm.cmd run test:unit:focused -- tests/unit/debug-scenario-actions.spec.ts
npm.cmd run test:e2e:focused -- tests/e2e/debug-menu/debug-menu.spec.ts --workers=1
npm.cmd run build
```

The focused unit spec passed **19/19**. The focused Chromium browser spec passed **9/9** in 35.1 seconds. It now verifies all 13 source event IDs in order, matches each menu status to `randomEventEligible`, and confirms every ineligible event is rejected through the gateway without changing history. It also verifies direct Add 10 Asteroids and Build Starship actions in unit coverage, and confirms Hold Enter repeatedly applies the hovered action until release.

The browser run includes a 390×844 row-copy/geometry matrix for **all six locales × all nine themes** (54 combinations). Every combination retained 25 nonempty scenario labels; the dialog and page had no horizontal overflow, and every row control stayed inside the dialog. The earlier four representative screenshots remain the visual spot checks; the matrix is an automated layout check rather than a screenshot review of every combination.

`npm.cmd run build` passed TypeScript checking and the production build. The fresh `dist` output had no debug-named chunks and no matches for `DEBUG_ENABLED`, `DebugTools`, `installDebugGateway`, `miaplacidusTest`, debug scenario/action/reducer symbols, keypad shortcuts, `Test1981`, `.debug-*` selectors, or the dedicated asteroid/starship/hold action IDs. The full suite was not run.

## P-62 visual and behavior review

The review used the documented deterministic startup (`testSeed=314159`, `testLocale=en`, disposable `Hydrogen Pioneer`) in isolated Playwright Chrome contexts. No owner save was opened or changed. The initial shared-browser attempt was rejected by automatic review because it interpreted the action as the canonical User Tester role; the development assignment was clarified, that tab was closed, and the review used only disposable harness storage.

Representative screenshots were inspected at 1366×900 Terminal/English, 390×844 Dark/German, 320×740 Light/French and 768×800 Terminal/Spanish. The menu scrolls vertically to all 25 action rows, the header/Close control remains available, long button labels and prerequisite/placeholder reasons wrap, and the unavailable event's Apply control uses red-disabled text. The Test Lab was also inspected at 320 and 390 pixels: its ordinary controls fit and its state list scrolls. `NumpadSubtract` opens the scenario menu; pressing `NumpadAdd` while it is open closes it and opens only the Test Lab. The existing shortcut and editable-control regressions cover the keyboard guards. No page errors or external requests occurred during the visual review.

Two concrete defects were found and fixed by the implementation agent:

- The event selector used the longest option's intrinsic width. It overlapped the adjacent Resources column at desktop and extended outside the dialog at narrow widths. Before the fix, 390-pixel dialog `clientWidth/scrollWidth` was `372/754`, and at 320 pixels it was `302/804`. Updated screenshots show the selector contained in its control column; dialog `clientWidth` now equals `scrollWidth` at all four reviewed widths (`1086`, `372`, `302`, `734`). The added geometry regression covers desktop Terminal/English, narrow Dark/German and narrow Light/French and passed (one test, 6.0 seconds).
- Set Language initially showed its confirmation in the preceding language even though the menu had switched. The extended existing locale test failed with English `Scenario applied.` after selecting Spanish. After the fix, that focused case passed (one test, 3.2 seconds), and inspected German/French screenshots show `Szenario angewendet.` / `Scénario appliqué.` immediately after language selection.

The review screenshots are temporary local artifacts under `C:/Users/Leigh/AppData/Local/Temp/p62-review-Wea9ep/`; `*-fixed-top.png` and `*-final-top.png` show contained controls, and `*-final-bottom.png` shows the localized confirmation and wrapped placeholder reasons. They are not committed baselines.

The initial Light-theme Test Lab screenshot also showed pale state labels/values against its light surface. The implementation agent changed them to normal text; `320-light-en-final-lab.png` was inspected after that change and shows readable dark names and values.

Scope limits: the six-locale/nine-theme matrix checks row copy presence and geometry at 390px; it does not inspect a screenshot for each combination or cover every viewport/theme pair. Screen-reader review is not established here. No full suite was run.

## P-16 modal focus restoration (9 October 2026)

The scenario menu and Test Lab use native modal dialogs opened by Numpad shortcuts. The focused P-16 case starts with the Hydrogen tab focused, opens each dialog, confirms focus enters its Close control, closes with Escape, and confirms focus returns to Hydrogen. The first run exposed that programmatically closed debug dialogs left focus inactive. `DebugTools` now records the element focused before the first debug dialog opens, retains that target when switching between the scenario menu and Test Lab, and restores it when the final dialog closes. The focused installed-Chrome case passed 1/1 in 5.1 seconds.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4267'; npm.cmd run test:e2e:focused -- tests/e2e/debug-menu/debug-menu.spec.ts -g '@p16-focus' --workers=1 --retries=0 --trace=off --reporter=line
```
