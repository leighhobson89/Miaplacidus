# Source inventory and extraction order

Snapshot path: `../../../cosmicForge/cosmicForge/`. This inventory is meant to keep later agents from overlooking a module or copying its implementation without understanding its ownership. File sizes are approximate bytes from the 2 October 2026 inventory; binary assets are counted separately. See [architecture](architecture.md) for the data flow and [reuse decisions](../plans/reuse-decisions.md) for porting policy.

The reviewed F-03 responsibility crosswalk is in the [foundation source contract](foundation-source-contract.md). Exact gameplay data, rule functions, save-field candidates, localization families and source test-area leads are indexed in the [economy](foundation-economy.md), [space/interstellar](foundation-space.md) and [meta/endgame](foundation-meta.md) catalogues.

## Root runtime modules

| Module(s) | Approximate size | Role and audit note |
|---|---:|---|
| `game.js` | 736 KB | Core simulation, actions, progression and frame loop. Extract by functional area; highest coupling risk. |
| `ui.js` | 586 KB | Boot wiring, pane navigation, dynamic UI, notifications, debug tools and language redraw. Extract interactions and view contracts. |
| `constantsAndGlobalVars.js` | 314 KB | Mutable globals/constants, save capture/restore and multiple cross-run flags. Audit ownership field by field. |
| `resourceDataObject.js` | 181 KB | Mutable data plus starting catalogue for economy, technology, stars, market, casino, perks, achievements and Cosmic Rip. Extract immutable definition and save field separately. |
| `descriptions.js` | 239 KB | Dynamic help, labels, star descriptions and other display assembly. Move copy into localization/content. |
| `drawTab1Content.js` … `drawTab9Content.js` | 25–242 KB each | Nine pane builders. Use them as UI/interaction inventories; preserve visible information but rebuild layout. |
| `events.js` | 70 KB | Random and timed event state, effects and debug triggers. Requires seeded randomness. |
| `casino.js` | 50 KB | CP games, prizes and shared timer-completion behavior. Requires deterministic outcome tests. |
| `onboarding.js` | 43 KB | Tutorial and first-run state. Test accepted, declined and interrupted flows. |
| `patches.js` | 40 KB | Historical data migrations and orphan repair. Reference for save failure modes; no original-game import is planned. |
| `achievements.js` | 34 KB | Achievement conditions and rewards. Compare with catalogue/images and rebirth. |
| `saveLoadGame.js` | 19 KB | Original local/cloud saves, import/export, autosave and compression. Port local and portable behavior; exclude cloud saves. |
| `analytics.js` | 10 KB | Original analytics telemetry/queue. Excluded from MIAPLACIDUS. |
| `precision.js` | 8 KB | Shared floating-point/display policy; suitable for pure-function port. |
| `audioManager.js` | 7 KB | Effects/background/weather audio. Keep optional. |
| `localization.js` | 6 KB | Language selection, fallback and reverse material lookup. Port behavior with typed APIs. |
| `cosmicRip.js` | 4 KB | Cosmic Rip helper rules; the wider feature spans `game.js`, data and tab 8. |
| `timerManagerDelta.js` / `timerManager.js` | 5 KB / 2 KB | Simulation delta and wall-clock timer implementations. Audit clock scope by timer. |
| `utilityFunctions.js` | 1 KB | String/number helpers; migrate only used pure functions. |
| `main.js` / `buildFlags.js` / `server.js` | under 1 KB each | Original Electron entry, build flags and tiny server entry. Only browser build/flag lessons apply. |

That is 32 root `.js` files, including `playwright.config.js` (test config). Two more root test/tool files are `validateLocalization.cjs` (catalogue checker) and `tests/run-e2e.mjs` (area runner). Four root Python scripts support old localization editing, building, graphing and watch/run workflows. `tools/` also contains build scripts, mechanics map, analytics dashboard and save inspector. These are useful reference/debug surfaces but are not part of the new runtime by default.

## Static UI and assets

`index.html` is about 70 KB and `styles.css` about 108 KB. The former defines menu options, dialogs, script dependencies and both debug windows. The latter contains the current theme/layout system. `localization.json` is about 1.60 MB. `images/` contains 809 files and `sounds/` 30 files; `resources/` contains 20 files, including source artwork and unlock data. `icons/`, `builds/`, `dist/`, screenshots, reports and `node_modules/` are packaging or generated material and should not be used as an authoritative gameplay source.

The root `package.json` declares version `1.0.6`, whereas the checked-in `package-lock.json` root metadata declares `1.0.0`. This is a reproducibility warning for the old project, not a proposed game mechanic. The new project has its own pinned dependency manifest and lockfile.

## Recommended extraction sequence per domain

1. Read the corresponding `drawTabNContent.js` and current `index.html` menu rows to list controls, text, locked states and feedback.
2. Trace the action handler into `game.js`, `casino.js`, `events.js`, `cosmicRip.js` or `ui.js`; record preconditions, cost deduction, state mutation, timer and completion path.
3. Record catalogue values and save fields from `resourceDataObject.js` and `constantsAndGlobalVars.js`. Mark run/permanent/settings/statistics ownership.
4. Trace translations through `descriptions.js` and `localization.json`, including constructed key families.
5. Read the matching `tests/e2e/<area>/` specs and README for normal, failure, rebirth and offline cases. They are a baseline, not proof of the remake.
6. Write a small feature contract and focused tests before porting it. Update the [parity ledger](../plans/feature-parity-checklist.md) only after the new tests pass.
