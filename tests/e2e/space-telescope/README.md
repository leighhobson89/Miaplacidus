# Space telescope, asteroids and rockets

## Rule matrix

| Rule                 | Normal path                                                                                                            | Boundary path                                                                                 | Evidence                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Telescope surveys    | Build the telescope, start asteroid/star surveys, and persist their timers. Voidborn Pillage uses the same timer path. | Power, technology, active-survey, scan-miss, philosophy and ability gates are engine-checked. | `space-telescope.spec.ts`, `space-rules.spec.ts` |
| Discovery records    | Use a saved seeded random stream for rarity, distance, stock, ease and commander-derived legendary names.              | Preserve interacted, reserved and depleted asteroids during safe pruning.                     | `space-rules.spec.ts`                            |
| Rocket assembly      | Pay launch-pad and compounded part costs, rename the four rocket records, and fuel through powered pumps.              | Reject incomplete builds, missing fuel technology, no power, and bad launch weather.          | `space-telescope.spec.ts`, `space-rules.spec.ts` |
| Rocket journey       | Reserve a distinct target, complete travel, mine into shared antimatter, return on depletion, and reset for retry.     | Ordinary timer completion and a large offline advance must not duplicate extraction.          | `space-rules.spec.ts`                            |
| Automation and boost | Unlock Auto Telescope through its perk; hold the antimatter boost control to double mining.                            | Stop boosts on pointer release, cancellation, focus loss or pane unmount.                     | `space-rules.spec.ts`                            |

Rules were compared with the locked Cosmic Forge snapshot and are summarized in [`space-mining-contract.md`](../../../docs/plans/space-mining-contract.md).

## Deterministic setup

The browser fixture `space-telescope` starts a named run with researched space technology, stock, power and a stable random seed. Browser tests use real controls and the test clock. Engine tests construct saved-state scenarios for weather holds, timer completion and four concurrent rockets.

Run later with `npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/space-telescope.spec.ts`; the pure rules file is `tests/unit/space-rules.spec.ts`.

## Current evidence

`tests/unit/space-rules.spec.ts` passed 14 tests. `tests/e2e/space-telescope/space-telescope.spec.ts` reported all four browser scenarios passing in system Chrome with Playwright video disabled. The full suite reported all 57 browser cases passing in Chrome with video capture disabled. Playwright remained alive after the final case and was stopped manually; its server had already exited.

On 2026-10-04, the focused Rocket assembly case passed in installed Google Chrome 154 (`MIAPLACIDUS_BROWSER_CHANNEL=chrome`): 1 passed, exit code 0. Running against an already-started test server avoids the Windows web-server shutdown hang.

The same date, the `@ui-navigation` group passed 4/4 cases in Chrome, including checks that all four Rocket child tabs are initially absent and that building Rocket 1 reveals only Rocket 1's page. Unbuilt rocket assembly cards remain available under Launch Pad.

On 2026-10-05, the focused Space Mining browser file passed 4/4 in Chrome. Coverage now reflects page ownership and unlock visibility: Mining is absent before antimatter unlock, telescope construction and auto-survey controls are tested on the Space Telescope child page, and each Rocket child page remains hidden until that rocket is complete.
