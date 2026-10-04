# Achievements browser area

The tests in this folder exercise the player-visible achievement catalogue, stable badge IDs, theme selection, permanent theme history, the nine-tab navigation, and save/reload behavior. Deterministic meta fixtures are used so the tests do not depend on long simulation waits.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/achievements/achievements.spec.ts` passed 1 browser journey. The once-only G-51–G-60 unit suite passed 20 files / 213 tests.
