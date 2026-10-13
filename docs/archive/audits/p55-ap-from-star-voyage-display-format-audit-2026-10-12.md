# P-55 AP From Star Voyage display-format audit (12 October 2026)

This slice verifies the AP From Star Voyage row in Settings > Statistics. AP Anticipated remains its separate Run row.

## Source behavior

Cosmic Forge maps both `stat_apFromStarVoyageThisRun` and `stat_apFromStarVoyage` to `getStatApFromStarVoyage`, which returns the run-only `apAnticipatedThisRun` value (`../../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js:1105,1115,5523-5525`). The separate Run row, AP Anticipated, reads the same field (`:977,5018-5019`).

Accepted Starship launch confirmation adds the destination's base Ascendency Points through `addToResourceAllTimeStat(..., 'apAnticipated')` (`../../../../cosmicForge/cosmicForge/ui.js:6606`). The helper calls the AP setter, which increments `apAnticipatedThisRun` (`constantsAndGlobalVars.js:1231,5684-5685; game.js:14979-14985`). On an accepted destination scan, `drawTab5Content.js:973-978` calls `generateDestinationStarData`; its Industrial and Spacefaring civilization branches add the same destination base AP, while other branches do not (`game.js:14218-14235,14326-14343`). Thus a qualifying voyage contributes once at launch and once more when its scan generates an eligible civilization.

The source save captures/restores the run counter and defaults missing history to zero (`constantsAndGlobalVars.js:1829,2196`). New-run and rebirth reset it (`:1560,1595`). Its localized row label is `statsInterstellarSubHeading14`, with matching English, Spanish, Portuguese, German, Italian, and French values (`localization.json:1033,3656,6279,8902,11525,14148`). The row has no unit suffix.

The Statistics table is created without an additional body class (`drawTab9Content.js:958-963`). Its notation-class list does not include `apFromStarVoyage`, and `getStats` writes the numeric value as-is after flooring a fractional value (`ui.js:5123-5150,12632-12637`). Therefore the source displays a whole number without grouping or notation abbreviation.

## MIAPLACIDUS correction

MIAPLACIDUS already reads the persisted run accumulator for this row through `selectInterstellarStatistics` (`src/engine/selectors.ts:106-111,174`) and presents it in both columns under the Interstellar > Star Map destination (`src/app/SettingsStatisticsPane.tsx`). Launch and eligible scan increments occur in `spaceMechanics.ts:1390-1410,1470-1497`; `createInitialSpaceState` starts the field at zero and rebirth constructs the next run from that fresh state (`content/space.ts:531-534,588-592`; `metaProgression.ts:123-145`). The run field is included in the save envelope and validated (`persistence/schema.ts:136-149`; `engine/state.ts:1715,1907-1908`); v49 saves initialize it to zero at the schema v50 migration (`state.ts:3985-4007`).

Before this correction, the row passed through the remake's configurable `statNumber`, so large values were abbreviated or grouped according to notation. It now renders `String(Math.floor(value))` in both columns, matching the source's raw whole-number display. The six localized labels and the absence of an AP suffix remain unchanged. The separate AP Anticipated Run row remains a distinct row.

No game-state or AP-accrual behavior changed. No tests, builds, typechecks, formatting, or browser checks were run for this audit.
