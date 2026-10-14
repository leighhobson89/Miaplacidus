# Space Mining browser tests

This area owns browser specs for Asteroids, Mining, and Launch Pad. Telescope-specific coverage remains in `../space-telescope/`. Rocket-only assembly, fueling, and travel coverage lives in `../rockets/`; cross-page cases that combine those areas remain with their current owner until they can be split without changing coverage.

## Current specs

- `p06-launch-pad-affordance.spec.ts` checks the localized Iron shortfall, its accessible reason, recovery after collecting the missing amount, and exact payment through the visible Build action.
- `e57-launch-pad-cost-locale-context.spec.ts` checks the Launch Pad quote and action at 390px and 320px in all six locales. Its reviewed French capture is `e57-launch-pad-cost-fr-320.png`.
- `e57-space-mining-content-locale-context.spec.ts` checks localized Asteroid rarity, reservation and depletion rows, asteroid selection, Mining balances and rates, and the boost control at 390px and 320px. Reviewed French captures are `e57-asteroids-fr-320.png` and `e57-mining-fr-320.png`.

## Recorded focused evidence

The Launch Pad affordability case passed 1/1 in installed Chrome on port 4835; the paired selector unit case passed 1/1. The Launch Pad locale case passed 1/1 in 6.2 seconds on port 4817. Its French 320px capture was reviewed and showed no clipping.

The Asteroids and Mining content case passed 1/1 in installed Chrome in 10.7 seconds on port 4825. The two French 320px captures were reviewed and showed the visible rows and actions inside the page bounds without horizontal overflow.

These are prior focused results recorded before the folder move. No tests were run during this structural reorganization.

## Run

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/space-mining/p06-launch-pad-affordance.spec.ts tests/e2e/space-mining/e57-launch-pad-cost-locale-context.spec.ts tests/e2e/space-mining/e57-space-mining-content-locale-context.spec.ts
```