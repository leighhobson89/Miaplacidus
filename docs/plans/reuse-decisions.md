# Reuse and replacement decisions

“Keep” below means preserve **behavior or content after review**. Existing visual and audio assets are references only; MIAPLACIDUS will remake them all. It does not imply copying a source file into the new runtime. The application now has a minimal F-11–F-18 scaffold; game rules and feature UI remain unimplemented.

The current-source validation for these choices is recorded in the [foundation source contract](../audit/foundation-source-contract.md) and the [economy](../audit/foundation-economy.md), [space/interstellar](../audit/foundation-space.md) and [meta/endgame](../audit/foundation-meta.md) catalogues.

| Source/area | Decision | What carries forward | What changes |
|---|---|---|---|
| `resourceDataObject.js` | **Port data, replace structure** | Keys, initial values, costs, rates, recipes, star/casino/perk/achievement catalogues after verification | Split immutable content from per-save state; schemas and typed IDs; no game imports from data. |
| `precision.js` | **Port policy** | Tolerance, affordability/settlement/display invariants and edge-case examples | Pure typed functions; decide numeric representation for very large values with comparative tests. |
| `timerManagerDelta.js`, `timerManager.js` | **Adapt semantics** | Named timer purposes, completion effects, time-warp/offline expectations | One clock abstraction, explicit wall/simulation scopes and deterministic tests. |
| `game.js` | **Replace implementation** | Every gameplay rule and formula, extracted domain by domain | Small pure modules, one ordered simulation step, no DOM reads or write-through UI. |
| `constantsAndGlobalVars.js` | **Replace implementation** | Constants and cross-run meanings | Typed state ownership, selectors, explicit reset/rebirth and save schema. |
| `ui.js`, `drawTab1..9Content.js` | **Replace implementation** | Screen coverage, information hierarchy, interactions, modals, progression gates | React components, semantic controls, responsive CSS, no translated display text as state key. |
| `descriptions.js`, `localization.json` | **Port and edit content** | Narrative/help and six-language translations; stable key intent | Extract typed message catalogue, placeholder validation, safe rich text, review quality and new copy. |
| `localization.js`, `validateLocalization.cjs` | **Adapt behavior** | Locale resolution/fallback/persistence; build gate | Typed API, cached load, pluralization and locale-aware numbers; no implicit HTML. |
| `saveLoadGame.js`, `patches.js` | **Replace core; no original-save import** | LZString code/file method, save controls and autosave intent as behavioral reference | Multiple local slots, confirmed-name selection at Start, versioned MIAPLACIDUS schema, atomic validation and future same-game migrations. Reject Cosmic Forge codes. |
| `events.js`, `casino.js`, `cosmicRip.js`, `achievements.js`, `onboarding.js` | **Port rules in slices** | All shipped branches, rewards, prerequisites and narrative beats | Deterministic commands/events, stable IDs, isolated effects and area tests. |
| `audioManager.js` | **Rebuild audio adapter** | Sound cue and ambience coverage | All new audio assets, fail-safe playback and user sound settings. |
| `analytics.js` | **Exclude** | Nothing | No analytics collector, endpoint or analytics preference in this project. Cosmic Rip gameplay telemetry remains in game rules. |
| `index.html`, `styles.css` | **Replace shell/styles** | Nine-tab reach, themes and critical information | Modern layout/tokens, mobile and keyboard paths, reduced-motion support. |
| `images/`, `sounds/` | **Remake every asset** | Coverage inventory and creative references only | New illustrations, icons, cinematics, sound effects and music with provenance, optimization and accessible alternatives. |
| `tests/e2e`, `tests/docs` | **Keep approach and taxonomy** | Area folders, clean fixture, scenario helpers, per-area reports, migration and performance coverage | TypeScript specs, semantic locators, pure engine tests, current result manifest. |
| `create_build.py`, `tools/build-*`, Electron `main.js` | **Web build only** | Browser packaging lessons and old demo gates as reference | Vite browser release for desktop/mobile; full by default, optional flagged demo. No Electron packaging. |

Directly copying `game.js`, `ui.js` or the global state modules would preserve their coupling and make the modernization goal much harder. Data and behaviors are valuable reference material. The [risk register](../audit/quality-and-risks.md) explains the specific seams to separate.
