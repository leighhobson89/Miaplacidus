# Debug scenario menu

P-62 coverage uses the real scenario menu controls in the deterministic test build. `NumpadSubtract` opens and closes the scenario menu; `NumpadAdd` opens and closes the existing Test Lab. If one is open, pressing the other shortcut switches to the other menu. Shortcut handling must leave focused editable controls alone.

`debug-menu.spec.ts` checks all 25 scenario action rows, disabled cinematic placeholders and their visible reasons, the unsupported feedback news option and reason, Spanish language selection, a visible research grant, selected timewarp values, a research breakthrough event, clear weather, and a selected wacky news interval. Selecting an unavailable travelling-starship event disables Apply and shows a prerequisite reason. The legacy `Test1981` pioneer name must start an ordinary game without opening the menu or granting progression.

The browser harness checks JavaScript errors and rejects external requests. Each test gets isolated browser storage; deterministic clock/state reads verify the effect of browser actions and do not invoke those scenarios directly.

Run only this area from the project folder:

```sh
npm run test:e2e:focused -- tests/e2e/debug-menu/debug-menu.spec.ts
```

Pure scenario coverage is in `tests/unit/debug-scenario-actions.spec.ts`. It checks locale choices, allowed/rejected warp options, additive and fixed grants, all economic goods, technology exclusions and idempotence, weather, event history, news mapping/rejections, deterministic launch preparation, fleet prerequisites, rocket counters, permanent grants/refunds, input immutability and explicit cinematic placeholders.

```sh
npm run test:unit:focused -- tests/unit/debug-scenario-actions.spec.ts
```

Production debug omission belongs to build verification; this development/test browser area does not claim production bundle evidence.

Focused helper verification on 6 October 2026 passed: one unit file, 15 tests. On Windows PowerShell, use `npm.cmd` if the local execution policy blocks the `npm.ps1` shim.

Focused browser verification passed in system Chrome: all seven cases in `debug-menu.spec.ts` (14.9 seconds), including both shortcut-switch directions, editable-control guards, six-locale menu and immediate confirmation copy, and narrow-width event controls. The separate Test Lab shortcut case passed 1/1 (2.5 seconds). Runs used `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, `MIAPLACIDUS_DISABLE_VIDEO=1`, one worker, and an existing `dev:test` server on port 4173. Playwright exited cleanly. The production build passed, and a search of the emitted JavaScript found none of the scenario-menu labels, gateway, action IDs, keypad shortcut strings, or `Test1981`. No full suite was run.

## P-62 visual and behavior review

The review used the documented deterministic startup (`testSeed=314159`, `testLocale=en`, disposable `Hydrogen Pioneer`) in isolated Playwright Chrome contexts. No owner save was opened or changed. The initial shared-browser attempt was rejected by automatic review because it interpreted the action as the canonical User Tester role; the development assignment was clarified, that tab was closed, and the review used only disposable harness storage.

Representative screenshots were inspected at 1366×900 Terminal/English, 390×844 Dark/German, 320×740 Light/French and 768×800 Terminal/Spanish. The menu scrolls vertically to all 25 action rows, the header/Close control remains available, long button labels and prerequisite/placeholder reasons wrap, and the unavailable event's Apply control uses red-disabled text. The Test Lab was also inspected at 320 and 390 pixels: its ordinary controls fit and its state list scrolls. `NumpadSubtract` opens the scenario menu; pressing `NumpadAdd` while it is open closes it and opens only the Test Lab. The existing shortcut and editable-control regressions cover the keyboard guards. No page errors or external requests occurred during the visual review.

Two concrete defects were found and fixed by the implementation agent:

- The event selector used the longest option's intrinsic width. It overlapped the adjacent Resources column at desktop and extended outside the dialog at narrow widths. Before the fix, 390-pixel dialog `clientWidth/scrollWidth` was `372/754`, and at 320 pixels it was `302/804`. Updated screenshots show the selector contained in its control column; dialog `clientWidth` now equals `scrollWidth` at all four reviewed widths (`1086`, `372`, `302`, `734`). The added geometry regression covers desktop Terminal/English, narrow Dark/German and narrow Light/French and passed (one test, 6.0 seconds).
- Set Language initially showed its confirmation in the preceding language even though the menu had switched. The extended existing locale test failed with English `Scenario applied.` after selecting Spanish. After the fix, that focused case passed (one test, 3.2 seconds), and inspected German/French screenshots show `Szenario angewendet.` / `Scénario appliqué.` immediately after language selection.

The review screenshots are temporary local artifacts under `C:/Users/Leigh/AppData/Local/Temp/p62-review-Wea9ep/`; `*-fixed-top.png` and `*-final-top.png` show contained controls, and `*-final-bottom.png` shows the localized confirmation and wrapped placeholder reasons. They are not committed baselines.

The initial Light-theme Test Lab screenshot also showed pale state labels/values against its light surface. The implementation agent changed them to normal text; `320-light-en-final-lab.png` was inspected after that change and shows readable dark names and values.

Scope limits: this is a representative Chrome review, not all six locales or all nine themes. Production omission, screen-reader behavior and exhaustive layout coverage are not established here. No full suite was run.
