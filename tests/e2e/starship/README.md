# Starship

Coverage for starship module cost display and payment, required-module readiness, the optional stellar scanner, diplomacy, and Fleet Hangar controls. The Cosmic Forge Fleet Hangar is a separate Interstellar page with a build button for each fleet class; the remake keeps that one-button-per-class flow while using native buttons with visible keyboard focus and full-width touch targets. `space-starship` and `space-diplomacy` are test-only fixtures with ample stock so the UI and engine can exercise real purchases.

Run all cases with `npm.cmd run test:e2e:focused -- tests/e2e/starship/starship.spec.ts`. Fleet keyboard and touch cases only: `npm.cmd run test:e2e:focused -- tests/e2e/starship/starship.spec.ts --grep @fleet-controls`.

## Current evidence

The `@fleet-controls` cases passed in Chrome (2/2) with `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, `MIAPLACIDUS_DISABLE_VIDEO=1`, and one worker. The keyboard case verified Tab reachability, `:focus-visible`, Enter activation, and the 44px target. The mobile emulation case verified touch activation at 390px, the same target height, and no horizontal overflow. The default Chromium launch was unavailable in this environment, so the passing run used the installed Chrome channel.

5 October 2026 P-06 affordance follow-up: module parts, Envoy, fleet ships, starship launch, scan, diplomacy, battle and settlement controls now expose localized selector/precondition reasons through `aria-describedby` when disabled; existing engine-computed purchase/travel costs remain visible. The `builds an Envoy and records message and harmony effects @starship` case now asserts that a locked diplomacy button references its localized reason. Focused unit coverage for the Casino purchase selector lives in `tests/unit/action-affordance-selectors.spec.ts`. Browser verification is queued with the root agent; no browser was run for this slice.
