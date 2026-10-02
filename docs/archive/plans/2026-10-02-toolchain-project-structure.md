# Toolchain and project structure (F-11-F-18)

**Status: complete (2 October 2026).** This slice establishes the local browser toolchain, module boundaries and stable content identifiers. It is infrastructure work; completing it does not implement gameplay or provide parity evidence for any functional area. The [Phase 1 checklist](../../plans/build-checklist/01-foundation.md) remains the implementation authority.

## Goal and constraints

Create a repeatable, locally bundled TypeScript/React/Vite browser project that can grow into the deterministic engine and full game. Keep the runtime browser-only and the engine independent of React, DOM APIs and audio. Use the pinned dependencies and lockfile in the [package manifest](../../../package.json) as the initial dependency baseline. Do not import or copy Cosmic Forge runtime modules. Do not add game rules, a playable feature, scenario cheats or test specs as part of this slice.

The [architecture audit](../../audit/architecture.md), [reuse decisions](../../plans/reuse-decisions.md), [open decisions](../../plans/open-decisions.md), [local-save contract](../../plans/local-save-contract.md) and [test harness plan](../../plans/test-harness.md) describe the target seams. Source behavior remains governed by the [foundation source contract](../../audit/foundation-source-contract.md) and the domain catalogues linked there.

## Decisions to implement

1. **Browser application and composition root:** use Vite, React and strict TypeScript 7. Put the browser entry point and dependency wiring in a small `app` composition root; keep state transitions and rules out of React components. Do not add Electron or a second application runtime.
2. **Layer ownership:** immutable game definitions belong in `content`; pure rules and domain types belong in `engine`; future local save adapters belong in `persistence`; messages and locale data belong in `i18n`; React rendering belongs in `ui`; optional sound effects belong behind `audio`; static files belong in `assets`. Test fixtures/helpers belong under `tests`. Add only minimal entry-point or placeholder files needed to make the boundaries real.
3. **Dependency direction:** `engine` may depend on typed content definitions, but cannot import React, React DOM, Vite, browser DOM globals, UI, persistence or audio. `content` cannot import runtime layers. `ui` consumes engine selectors/commands and localized view text. The app composition root wires adapters. Persistence and audio remain outward adapters and cannot become rule authorities.
4. **Commands and checks:** provide `dev`, `dev:test`, `build`, `build:demo`, `typecheck`, `lint`, `format`, `format:check`, `check:boundaries`, `test:unit`, `test:unit:focused`, `test:e2e` and `test:e2e:focused` package scripts. Document each command and how to select one test area. Focused scripts pass arguments through to Vitest/Playwright. Test specs, Playwright config and browser fixtures remain later F-35–F-40 work.
5. **Code quality and boundary enforcement:** use Oxlint for linting (selected for TypeScript 7 support) and Oxfmt for formatting. Enforce engine import and browser-global restrictions with Oxlint's parser-backed rules; keep a small `check:boundaries` command and no extra boundary package. Run typecheck, lint, format-check, boundary check and production build in `.github/workflows/ci.yml`. Keep formatting separate from checking so CI does not rewrite files.
6. **Local runtime bundles:** Vite must bundle runtime dependencies from the lockfile. The production HTML and built JavaScript must not depend on runtime CDN scripts or remote module imports. This does not prohibit ordinary network access by the browser; the game boot and core runtime must not need it.
7. **Build modes:** development mode supports normal local iteration; test mode is a controlled test configuration, with deterministic test controls added later through the engine boundary; the default `build` is the complete game. `build:demo` is the dedicated explicit opt-in demo build; never make the normal build demo-restricted. Do not expose a debug/cheat gateway in a production build.
8. **Stable identifiers:** use language-independent, stable string IDs for resource, upgrade, technology, system, action and event definitions. Derive narrow TypeScript ID types from authoritative catalogues (or their checked-in ID lists), and use those types in cross-references. IDs must not be translated labels, array positions, DOM text or save-dependent display names. A translated display key is separate from an entity ID.

## Task decisions and acceptance criteria

| Task | Implementation decision | Acceptance evidence |
|---|---|---|
| **F-11** | Scaffold the browser app with Vite, React and strict TypeScript 7. Keep the Cosmic Forge project out of the import graph. | A clean dependency install succeeds from the lockfile; the minimal app type-checks and builds; no Cosmic Forge source path is imported or copied into the runtime. |
| **F-12** | Add the command names above; use Vitest for unit tests and Playwright for E2E. Focused and general commands pass runner arguments through and tolerate the current empty spec folders. | `npm run` lists the documented commands; `npm run test:unit:focused -- <file-or-pattern>` and `npm run test:e2e:focused -- <area-or-spec>` selection syntax is documented. No gameplay specs, Playwright config or test fixtures are added in this task. |
| **F-13** | Create clear ownership roots for `engine`, `content`, `persistence`, `i18n`, `ui`, `audio`, `assets` and test helpers, plus the minimal app composition root. | A short tree/README or the source entry points make ownership discoverable; each future feature has an obvious home; no legacy giant module is copied as the shell. |
| **F-14** | Encode the dependency direction in source layout and parser-backed import/global restrictions, with the engine isolated from React/browser/audio concerns. | The boundary command rejects a temporary forbidden React import, a UI-layer import and a DOM global; current project imports pass. The engine contract module imports from pure content definitions. |
| **F-15** | Configure strict TypeScript 7 options, Oxlint, Oxfmt and `.github/workflows/ci.yml`; add no extra boundary package. | Local scripts and that CI workflow run typecheck, lint, format-check, build and boundary check; a clean run is recorded. Oxlint reports prohibited imports/globals with file and location. |
| **F-16** | Bundle all runtime package imports locally through Vite. | Production build succeeds; built HTML/app graph contains no external runtime script or module dependency; app source has no CDN package imports. |
| **F-17** | Make development, test and complete production modes explicit. `build` is always the full build; `build:demo` is the dedicated explicit opt-in demo build. | Default `npm run build` selects full-game mode; only `npm run build:demo` selects demo mode; no demo restriction is applied by default; production output excludes test/debug-only access. This infrastructure check does not claim a playable game exists. |
| **F-18** | Establish stable ID definitions and typed references for the six required catalogue families. Keep IDs independent of localized labels and mutable save state. | TypeScript rejects an invalid cross-reference in a temporary check; each catalogue family has an authoritative ID source; changing a display translation cannot change an ID. No gameplay catalogue needs to be fully ported here. |

## Suggested verification sequence

Run `npm ci`, then `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run check:boundaries` and `npm run build`. Exercise the boundary rules with a temporary prohibited import and remove it afterward. Run the full and demo builds, checking that the normal build is full and runtime assets are local. Test-runner configs and specs belong to F-35–F-40, so no test specs run in this scaffold slice. Record exact command lines and results in the completion/archive copy of this plan. Do not mark a functional-area parity row from a successful scaffold check.

## Out of scope

- Gameplay rules, state transitions, resource/content balancing, save behavior, localization text, or a player-ready screen.
- Full Playwright configuration, browser fixtures and gameplay specs that belong to F-35-F-40. F-12 provides the test command entry points with pass-on-empty options; no specs exist or were run in this scaffold slice.
- Scenario/debug commands and variable inspection; later tasks must keep these behind the test/development boundary.
- Original Cosmic Forge runtime/data imports, cloud saves, analytics, Electron packaging or CDN-hosted dependencies.

## Completion record

**Outcome:** F-11–F-18 are complete. The scaffold has a React/Vite app entry, strict TypeScript configuration, ownership directories, compile-time build modes, locally bundled runtime dependencies, Oxlint/Oxfmt rules, engine boundary restrictions enforced in CI, and typed catalogue IDs. The Cosmic Forge source was not imported or changed. No gameplay rules or test specs were added.

**Validation completed:** `npm ci --cache .npm-cache --offline`; `npm run typecheck`; `npm run lint`; `npm run format:check`; `npm run check:boundaries`; `npm run build`; `npm run build:demo`. The default bundle contains `mode: "production"` and `isDemo: false`; the demo bundle contains `mode: "demo"` and `isDemo: true`. Both HTML outputs use local assets and the app source has no remote runtime imports. Temporary forbidden React, UI-layer and DOM-global imports were rejected by the boundary command and removed. A temporary invalid technology reference was rejected by TypeScript and removed. The 57 tech IDs and 13 event IDs match the extracted source catalogues with no duplicates. No unit or E2E suite was run because no specs exist yet.

All feature rows in the [parity ledger](../../plans/feature-parity-checklist.md) remain **Not started**. F-19–F-42 and the M-01 exit gate remain open.
