# P-55 Statistics Run-row copy and ownership audit — 12 October 2026

Rechecked the source's rendered Run group and the target Settings → Statistics renderer after the owner selected the documented remake behavior for the clock rows.

Cosmic Forge registers Run Time, Star System, Current Weather, Cash, AP Anticipated, and Antimatter (`constantsAndGlobalVars.js:964-978`), orders them in `descriptions.js:3930`, and renders a single current value rather than Current Run / All Time pairs (`ui.js:5093-5149,5179-5185`). Its getters select the current run's time, system, weather, cash, AP accumulator, and antimatter (`constantsAndGlobalVars.js:4951-5024`). The remake preserves the same single-value grouping and source-relative row order (`SettingsStatisticsPane.tsx:186-215`).

The source and target state bindings match for the five non-clock rows: current system, current weather, cash balance, run AP accumulator, and current antimatter stock. Their save/reload and rebirth behavior follows the run state; a controlled source/remake value comparison was not performed. Cash renders through the remake's locale, currency, and notation formatting settings, so its displayed number format can differ from Cosmic Forge's fixed two-decimal display. Run Time and Time Played retain the owner's documented remake clock semantics.

Corrected source label drift in `statisticsMessages.ts`: English capitalization for Star System, Current Weather, and AP Anticipated; German Star System (`Sternensystem`) and Cash (`Geld`). Remaining checked locale labels already match the source `statsRunSubHeading2`–`statsRunSubHeading6` values in `localization.json:966-970,3589-3593,6212-6216,8835-8839,11458-11462,14081-14085`.

Updated the existing exact-label assertions in `tests/e2e/settings/settings-statistics.spec.ts`, but did not run them. The Run-row label and state audit is documented; controlled saved/reloaded/rebirth comparisons and broader P-55 acceptance remain open. No estimate sub-bullet was fully satisfied by this static review. No tests, builds, typechecks, or browser checks were run.
