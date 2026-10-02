# Test harness plan and prepared folders

The new `tests/e2e/` tree has 50 functional-area folders based on Cosmic Forge: `save-slots` replaces the removed `save-load-cloud` area. Every area directory contains only a `.gitkeep` marker. `tests/e2e/_harness/`, `tests/unit/`, `tests/fixtures/`, and `tests/docs/` are also placeholders. **There are no game test specs, Playwright config, fixtures or local browser test server yet.** The [package manifest](../../package.json) wires the Vitest and Playwright commands; no-spec test runs are set to exit successfully and say when they ran no tests. The lockfile pins TypeScript, Vite/React, Vitest, Playwright, Oxlint, Oxfmt and LZString. Browser binaries are deferred until browser specs exist.

The F-01–F-10 [source-derived acceptance matrix](../audit/foundation-test-plan.md) is complete as planning documentation only. It does not add coverage or change any area from not started; focused specs begin with F-35–F-40 when the vertical slice exists.

## Current package commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local full-game Vite development server. |
| `npm run dev:test` | Start the explicit Vite test mode; deterministic scenario controls are added later through the engine boundary. |
| `npm run build` | Typecheck and build the complete browser game. |
| `npm run build:demo` | Opt in to a separate demo build; the normal build stays full. |
| `npm run typecheck` | Check strict TypeScript source without emitting files. |
| `npm run lint` | Run Oxlint with the checked-in lint rules. |
| `npm run format` / `npm run format:check` | Apply or check Oxfmt formatting. |
| `npm run check:boundaries` | Enforce the engine import restrictions. Temporary prohibited-import checks and their results are recorded in the [F-11–F-18 completion record](../archive/plans/2026-10-02-toolchain-project-structure.md). |
| `npm run test:unit` | Run unit specs under `tests/unit/`; currently reports that no specs ran. |
| `npm run test:unit:focused -- <file-or-pattern>` | Select focused Vitest specs. |
| `npm run test:e2e` | Run E2E specs under `tests/e2e/`; browser config arrives with F-35. |
| `npm run test:e2e:focused -- <area-or-spec>` | Select a focused Playwright area/spec once F-35 config and specs exist. |

The focused command patterns are prepared now. The engine-backed test fixtures and local browser server are F-35/F-36 work, and no result from an empty suite counts as feature coverage.

## Future harness contract

Source-derived scenarios and planned acceptance coverage for the F-01–F-10 catalogue are in the [foundation test plan](../audit/foundation-test-plan.md). These are plans only; the matching green Cosmic Forge areas are not MIAPLACIDUS passes.

1. Add `playwright.config.ts` when the first playable slice exists: Vite dev/preview `webServer`, base URL, Chromium first, area-filtered HTML/JSON reports, failure trace/screenshot/video, CI retry policy, and sensible timeouts.
2. Add a TypeScript fixture in `_harness` that creates a clean game per test, sets locale and seeded random before boot, captures page/console errors, and exposes stable scenario commands through a test-only gateway. Use role/label locators to drive normal controls.
3. Add a runner to discover folders containing `.spec.ts`, run one or selected areas, and aggregate current results. It should support `--list`, headed, slow, Playwright arguments and MIAPLACIDUS schema-version fixtures. Empty folders must be skipped.
4. Add unit tests for pure economy, precision, clock, migration, unlock, event and rebirth rules. Keep them fast and independent of DOM and browser storage.
5. Add sanitised fixtures representing start, mid, interstellar, rebirth and endgame, plus every shipped MIAPLACIDUS save version. Original Cosmic Forge save import is out of scope. Use an in-memory `Storage` fake for slot/quota/corruption tests; never reach Cosmic Forge production services.
6. Give every populated area a README with its rule matrix, deterministic setup, normal/failure tests, debug commands, and observed result. Generate aggregate coverage from actual runs, including commit and browser.

## Debug-tool plan

Recreate Cosmic Forge's scenario-menu strengths: grant resources/currency/tech, build infrastructure, choose star/event/weather, advance time, set casino outcome, and prepare a late-game run. Route commands through the engine's normal mutation boundary and validate state. Include a searchable variable inspector only in development/test builds; keep it read-only by default and require an explicit edit action. Use a test build flag, not `Test1981` in a player name. Log the seed, clock time and command sequence so failures replay. Assert production builds omit the gateway.

## Coverage order

Start with `app-boot`, `resources`, `precision`, `save-load-local`, `save-slots`, `localization`, `ui-navigation`, and `performance` during the first vertical slice. Fill each subsequent feature's area at the time the feature ships. Run the focused area during development. A full run is a release gate and follows the project's approval rule in [AGENTS.md](../../AGENTS.md).

The target taxonomy and acceptance details are in the [parity ledger](feature-parity-checklist.md). The [master checklist](master-checklist.md) controls implementation. The old fixture, navigation helper, reporter and area runner are documented in [the audit](../audit/testing-and-debug.md).
