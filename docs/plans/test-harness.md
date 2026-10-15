# Test harness plan

The F-35/F-36 harness is implemented for the M-01 Hydrogen slice. Playwright runs against the local Vite test server with deterministic seed/locale, fresh per-test browser state, page/console errors, external-request capture, failure screenshots/traces, and checked-in visual baselines around the real player click flows. Vitest covers pure engine rules. The HTML entry includes a dark startup fallback with Vite instructions when a static server cannot compile the TypeScript app. The focused run and area evidence are recorded in the populated [E2E area READMEs](../../tests/e2e/README.md) and [M-01 completion record](../archive/plans/2026-10-02-hydrogen-vertical-slice.md).

The wider F-01–F-10 [source-derived acceptance matrix](../audit/foundation-test-plan.md) remains planning input for later phases. Current Hydrogen evidence does not close the full `resources`, `autobuyers`, `precision`, `localization`, or `ui-navigation` areas. Save behavior starts in M-02.

The completed suite-wide functional-area ownership, missing-area coverage, catch-all folder split, and per-area regression work are recorded in the [archived E2E functional-area plan](../archive/plans/2026-10-15-e2e-functional-area-coverage-and-refactor.md). Its starting inventory is historical; the final structure and single full-run/focused-recovery evidence are recorded there. Keep future failures tied to source or owner-approved behavior; do not revise assertions only to get a green run.

`tests/e2e/functional-areas.json` is the canonical area manifest. `scripts/run-e2e-areas.mjs` runs each area folder in a separate Playwright process, records an aggregate JSON report, and places reports, traces, and failure output in a timestamped directory under the OS Temp folder. Direct focused Playwright runs also use a fresh Temp directory by default. `--populated` is useful during the refactor; the full `test:e2e` command fails if an in-scope area has no runnable specs.

## Current package commands

| Command                                          | Purpose                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `npm run dev`                                    | Start the local full-game Vite development server.                                     |
| `npm run dev:test`                               | Start Vite test mode with deterministic test controls.                                 |
| `npm run build`                                  | Typecheck and build the production browser game.                                       |
| `npm run build:demo`                             | Opt in to a separate demo build; the normal build stays full.                          |
| `npm run typecheck`                              | Check strict TypeScript source without emitting files.                                 |
| `npm run lint`                                   | Run Oxlint with the checked-in lint rules.                                             |
| `npm run format` / `npm run format:check`        | Apply or check Oxfmt formatting.                                                       |
| `npm run check:boundaries`                       | Enforce engine import restrictions.                                                    |
| `npm run test:unit`                              | Run pure Vitest specs in `tests/unit/`.                                                |
| `npm run test:unit:focused -- <file-or-pattern>` | Select focused Vitest specs.                                                           |
| `npm run test:e2e`                               | Run every canonical E2E area in isolation and write reports under the OS Temp folder. |
| `npm run test:e2e:area -- <area>`                | Run one canonical folder, such as `npm run test:e2e:area -- resources`.               |
| `npm run test:e2e:populated`                     | Run populated areas and list areas that still have no spec files.                     |
| `npm run test:e2e:focused -- <area-or-spec>`     | Select focused specs directly with Playwright.                                       |

The default browser project is Playwright Chromium. Set `MIAPLACIDUS_BROWSER_CHANNEL=chrome` to use an installed Chrome channel. Set `MIAPLACIDUS_DISABLE_VIDEO=1` only when the local machine lacks Playwright's video/ffmpeg support; screenshots and traces remain enabled on failure.

Playwright defaults to one worker locally and two workers in CI. Set `MIAPLACIDUS_E2E_WORKERS` to a positive integer to override either default; invalid values stop config loading. Snapshot updates are disabled by default (`updateSnapshots: "none"`); refresh a reviewed baseline only with an explicit focused update run.

For the recorded Windows run, Vite was started in a separate terminal with `npm run dev:test -- --host 127.0.0.1 --port 4173 --strictPort`; Playwright reused `http://127.0.0.1:4173` and exited cleanly after the focused run. The current Playwright config defaults to port 4174 and starts its own test server; set `MIAPLACIDUS_TEST_PORT=4173` when reproducing the recorded run.

## Implemented M-01 fixture and scenario controls

`tests/e2e/_harness/fixtures.ts` starts a new browser context, clears local/session storage before navigation, fixes seed `314159` and locale `en`, starts a named run through the form, waits for the Hydrogen pane and captures page, console and external-request errors. The `window.miaplacidusTest` gateway exists only in development/test builds.

The Test Lab prepares deterministic fixtures through the engine store, advances the injected clock with normal `clock.advance` commands, and reports seed, clock and replayable command log. Its variable inspector is searchable and read-only. It is a dedicated closable dialog, outside page flow and normal navigation, opened or closed by NumpadAdd (`+`) only in development/test builds; the scenario cheat menu uses NumpadSubtract (`-`). Production builds exclude both tools.

Initial focused M-01 results on 2 October 2026:

- 11/11 unit tests passed across the Hydrogen and foundation-engine specs.
- 8/8 browser tests passed across `app-boot`, `resources`, `autobuyers`, and `performance`.
- Production build output contained one app JS bundle and no `DebugTools` chunk, `miaplacidusTest` identifier or scenario installer.

The visual-test follow-up passed all 8 selected UI tests across `app-boot` (5), `resources` (2), and `autobuyers` (1). Eleven screenshot states are stored beside their specs and compared on each run; the screenshots are also attached to Playwright reports. The separate performance baseline remains the earlier focused result.

See the individual area READMEs for rule matrices, test commands, and the performance record. The full test suite was not run.

## Later harness work

As additional areas ship, add an area README with its rule matrix, deterministic setup, normal/failure tests, debug commands, and observed result. Add sanitized typed start, mid-game, interstellar, rebirth, and endgame fixtures as their state models exist. Use an in-memory `Storage` fake for save-slot/quota/corruption tests; original Cosmic Forge save import and production-service calls stay excluded. The M-01 late-game target fixture design is in [`tests/fixtures/README.md`](../../tests/fixtures/README.md).

Expand the debug menu only as feature contracts require it. Route scenario setup through normal engine commands, preserve replay logs, and keep edit/cheat access out of production. A full run remains a release gate and follows the approval rule in [AGENTS.md](../../AGENTS.md).

The [parity ledger](feature-parity-checklist.md) controls area evidence; the [master checklist](master-checklist.md) controls implementation order. The old Cosmic Forge fixture, navigation helper, reporter and area runner are documented in [the audit](../audit/testing-and-debug.md).
