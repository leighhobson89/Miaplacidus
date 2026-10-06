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

Also on 2026-10-05, the focused P-07 countdown run passed 5/5 in installed Chrome. The owning Space Telescope page shows decreasing weather and survey timers; each Rocket page shows outbound or return time remaining, and fuel pumping shows a live time-to-full that pauses without production when paused and resumes after restarting. The focused test command also checked the Starship route; see the [Starship evidence](../starship/README.md).

The deterministic Rocket assembly journey captures a full-page visual checkpoint named `space-rocket-1-ready` after Rocket 1 is assembled and its page is selected, before fuel pumping begins. The focused Chrome journey passed 1/1 both during snapshot generation and without snapshot updates. The 1280px Terminal screenshot was reviewed: it shows Rocket 1 under Space Mining, the built-only child tab, weather context and the locked-until-fueled launch control.

The same journey switches to 390×844 after the desktop capture, asserts no document horizontal overflow and that Rocket 1 stays within the Space Mining content pane, and captures `space-rocket-1-mobile`. It restores the 1280px viewport before continuing to fuel-pump actions. The focused Chrome journey passed 1/1 during snapshot generation and again without snapshot updates. The mobile screenshot was reviewed: the Rocket 1 card fits the Space Mining pane, the launch action and fuel requirement remain visible, and the page has no horizontal overflow.

On 2026-10-06, the focused space-telescope browser file passed 7/7 in installed Chrome. The new Rocket journey uses the deterministic fixture and asteroid scenario setup, then builds, fuels and launches two rockets through the UI. With no asteroid selected, Travel is disabled and points to the localized reason via `aria-describedby`; selecting a free asteroid enables travel and reserves it for Rocket 1, while Rocket 2 receives the disabled reason for that reserved target.

The same area now covers the rocket-part cost boundary: one Steel below the first part price disables Build one part and points to the visible localized requirement through `aria-describedby`; exact stock enables it and the browser journey confirms the quoted cash, Glass, Titanium and Steel costs are all deducted. Focused Chrome results are recorded under P-06 in the Phase 6 checklist.

On 2026-10-06, both cost journeys passed independently in installed Chrome (1/1 each): the shortfall check and the exact-stock purchase. The purchase case also confirms the next displayed quote applies the 13% escalation to each cost, then verifies the second part is disabled with its updated 3,390 Steel requirement connected through `aria-describedby`. The extended exact-stock journey reran after that assertion was added and passed 1/1 in 3.5 seconds with a clean Playwright exit.

The same date, the Rocket fueling case passed 1/1 after adding a real Power grid toggle. Grid loss keeps pump automation enabled, displays “Turn on the power grid before fueling.”, and leaves the fuel quantity unchanged; restoring power resumes the ETA, while a user pause still displays “Fueling is paused.”

After these additions, the complete focused space-telescope Chrome spec passed 8/8 with `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, video disabled and one worker.

The zero-rate Mining boost affordance also passed a focused 1/1 Chrome check using the deterministic late-game fixture. The button is disabled, its visible reason is connected with `aria-describedby`, and its boost state remains inactive.
