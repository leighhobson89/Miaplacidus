# Achievements browser area

The tests in this folder exercise the player-visible achievement catalogue, stable badge IDs, theme selection, permanent theme history, the nine-tab navigation, and save/reload behavior. Deterministic meta fixtures are used so the tests do not depend on long simulation waits.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/achievements/achievements.spec.ts` passed 1 browser journey. The once-only G-51–G-60 unit suite passed 20 files / 213 tests.

5 October 2026: the focused Chrome journey passed 1/1 after checking the visible
main-tab and Settings-child ID order and the localized Collect 50 Hydrogen card
in all six locales. This sweep exposed 108 corrupted accented label lines in
`achievementNames.generated.ts`; they are repaired, and the focused
`meta-signals.spec.ts` run passed 10/10 with a six-locale text-integrity check.
