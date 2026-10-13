# P-55 Interstellar Enemy Total Defence Remaining audit — 13 October 2026

Cosmic Forge maps `stat_enemyTotalDefenceRemainingThisRun` to `getStatEnemyTotalDefenceRemaining()` and the All Time column to Not Applicable (`constantsAndGlobalVars.js:1104,1114,5515-5521`). The current-run getter reads `destinationStar.enemyFleets.fleetPower`. Source enemy fleet power uses air×2 + land×4 + sea×6 (`game.js:14466` and the source fleet initialization path).

MIAPLACIDUS selects the encounter for the current starship destination and calculates its remaining enemy fleet power in `selectInterstellarStatistics()` (`src/engine/selectors.ts:154-180`; `src/engine/fleetMechanics.ts:85-89`). `SettingsStatisticsPane.tsx:591-596` renders that value as a raw Current Run value with Not Applicable for All Time. The row's source calculation and scope match; no code change was indicated by this static comparison.

Live comparisons across enemy-fleet changes and save/reload remain open under P-55. No tests, builds, typechecks, formatting, or browser checks were run.
