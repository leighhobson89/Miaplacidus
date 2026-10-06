# Test harness plan

The F-35/F-36 harness is implemented for the M-01 Hydrogen slice. Playwright runs against the local Vite test server with deterministic seed/locale, fresh per-test browser state, page/console errors, external-request capture, failure screenshots/traces, and checked-in visual baselines around the real player click flows. Vitest covers pure engine rules. The HTML entry includes a dark startup fallback with Vite instructions when a static server cannot compile the TypeScript app. The focused run and area evidence are recorded in the populated [E2E area READMEs](../../tests/e2e/README.md) and [M-01 completion record](../archive/plans/2026-10-02-hydrogen-vertical-slice.md).

The wider F-01–F-10 [source-derived acceptance matrix](../audit/foundation-test-plan.md) remains planning input for later phases. Current Hydrogen evidence does not close the full `resources`, `autobuyers`, `precision`, `localization`, or `ui-navigation` areas. Save behavior starts in M-02.

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
| `npm run test:e2e`                               | Run the Playwright specs under `tests/e2e/`.                                           |
| `npm run test:e2e:focused -- <area-or-spec>`     | Select focused specs. `MIAPLACIDUS_TEST_AREA=<area>` filters to a functional-area tag. |

The default browser project is Playwright Chromium. Set `MIAPLACIDUS_BROWSER_CHANNEL=chrome` to use an installed Chrome channel. Set `MIAPLACIDUS_DISABLE_VIDEO=1` only when the local machine lacks Playwright's video/ffmpeg support; screenshots and traces remain enabled on failure.

For the recorded Windows run, Vite was started in a separate terminal with `npm run dev:test -- --host 127.0.0.1 --port 4173 --strictPort`; Playwright reused `http://127.0.0.1:4173` and exited cleanly after the focused run. When port 4173 is free, the checked-in Playwright config starts the same local server automatically.

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
