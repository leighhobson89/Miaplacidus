# Rocket browser tests

This area owns browser specs that focus on Rocket assembly, travel, fueling, or progress. Telescope-specific cases stay in `../space-telescope/`; combined Telescope and Rocket journeys stay there until they can be split without changing their coverage.

## Current specs

- `e57-fuel-pump-locale-context.spec.ts` checks the localized Rocket 1 pump price, purchase action, and card bounds at 320px and 390px in all six locales. Its Playwright captures are in `e57-fuel-pump-locale-context.spec.ts-snapshots/`.
- `p13-space-mining-rocket-travel.spec.ts` checks outbound Rocket route identity, balances, ETA, and progress at 390px and 320px.

## Recorded focused evidence

The fuel-pump locale case passed at both widths as part of the 6-case economy and Space Mining batch: 6/6 in 2.1 minutes on port 4828. French captures at both widths were reviewed; the translated heading and purchase label wrap inside the Rocket card without page overflow.

The narrow Rocket travel case passed 1/1 in installed Chrome in 5.6 seconds on port 4484. It checked the Rocket task identity, Cash and Antimatter balances, ETA, progress, and page bounds at both widths, then confirmed ETA and progress advance.

These are prior focused results recorded before the folder move. No tests were run during this structural reorganization.

## Run

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/rockets/e57-fuel-pump-locale-context.spec.ts tests/e2e/rockets/p13-space-mining-rocket-travel.spec.ts
```