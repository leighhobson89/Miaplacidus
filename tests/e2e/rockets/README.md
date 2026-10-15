# Rocket browser tests

This area owns browser specs that focus on Rocket assembly, travel, fueling, or progress. Telescope-specific cases stay in `../space-telescope/`; combined Telescope and Rocket journeys stay there until they can be split without changing their coverage.

## Current specs

- `e57-fuel-pump-locale-context.spec.ts` checks the localized Rocket 1 pump price, purchase action, and card bounds at 320px and 390px in all six locales. Its Playwright captures are in `e57-fuel-pump-locale-context.spec.ts-snapshots/`.
- `p13-space-mining-rocket-travel.spec.ts` checks outbound Rocket route identity, balances, ETA, and progress at 390px and 320px.
- `weather-rocket-launch-gates.spec.ts` fills Rocket 1 through its player controls, verifies Rain and Volcano block launch, then verifies Clear weather enables launch and sends the rocket into orbit.

## Recorded focused evidence

The fuel-pump locale case passed at both widths as part of the 6-case economy and Space Mining batch: 6/6 in 2.1 minutes on port 4828. French captures at both widths were reviewed; the translated heading and purchase label wrap inside the Rocket card without page overflow.

The narrow Rocket travel case passed 1/1 in installed Chrome in 5.6 seconds on port 4484. It checked the Rocket task identity, Cash and Antimatter balances, ETA, progress, and page bounds at both widths, then confirmed ETA and progress advance.

The source-owned launch/weather case passed 1/1 in installed Chrome on 14 October 2026 (port 5205). It compared the full-fuel launch state under Rain and Volcano, then confirmed the Clear-weather control enables launch and changes the rocket phase to orbit. Cosmic Forge keeps this behavior in its `rockets/rockets-live.spec.js` area.

**Post-move focused Chrome verification (14 October 2026):** the current
`rockets/` path and its relocated snapshots passed both fuel-pump locale-width
cases (320px and 390px, each covering all six locales) as part of a 3-case
focused run. This was a no-update run, so the moved baselines were checked
without refreshing them. The same run checked the moved Launch Pad P-06 case;
its result is recorded in the [Space Mining README](../space-mining/README.md).
All 3 cases passed in 19.6 seconds on port 6490.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6490'; npm.cmd run test:e2e:focused -- tests/e2e/rockets/e57-fuel-pump-locale-context.spec.ts tests/e2e/space-mining/p06-launch-pad-affordance.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-moved-mining-rocket-focused-6490"
```

## Run

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/rockets/e57-fuel-pump-locale-context.spec.ts tests/e2e/rockets/p13-space-mining-rocket-travel.spec.ts
```

## Complete area rerun (14 October 2026)

The canonical Rockets folder passed **4/4** in installed Chrome on port 6858
with snapshot updates disabled. It contains no screenshot assertions, so no
visual baselines were compared. No test or gameplay changes were needed.
Artifacts are under `%TEMP%\miaplacidus-rockets-full-area-20261014`.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6858'; playwright.cmd test tests/e2e/rockets --workers=1 --project=chrome --retries=0
```
