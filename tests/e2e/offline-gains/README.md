# Offline Gains browser tests

This area covers time and timer progress during a saved pioneer's absence. Its focused case creates a durable Research timer, saves through Settings, advances the browser wall clock while the game is away, then resumes through the startup picker. It checks the owner-approved 33.4% rate, unchanged active-play time, the Run Time display, the three-second notification, and that the same interval is not credited again after another reload.

`offline-gain-floor.spec.ts` imports a deterministic save with active Hydrogen and Research production, advances the saved wall clock by one second, and checks both gains are floored after the 33.4% rate. Its seeded B-type system raises Hydrogen production to 4/s, so the raw offline gain is 1.336 and the save credits 1; Research yields 1.002 and credits 1. The unit case checks a base 2/s Hydrogen rate (0.668 floored to 0). On 14 October 2026, the focused Chrome browser case passed 1/1 and `tests/unit/economy.spec.ts` passed 31/31 after the engine was aligned. The unit file retains fractional foreground production coverage.

This floor change covers passive economic production and Research only. Energy, Cosmic Rip telemetry, Rocket fuel, and input-budgeted compound crafting still need separate source-matched review and coverage.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/offline-gains/offline-gains.spec.ts --workers=1
```

The focused installed-Chrome run passed **1/1 in 8.0s** on port 6521. General save-slot actions stay in [`save-slots`](../save-slots/README.md).
