# Cosmic Forge audit: scope and method

**Audit date:** 2 October 2026. **Reference:** `../../../cosmicForge/cosmicForge/`, Git HEAD `93e3266` dated 17 September 2026. The parent `../../../cosmicForge/` also contains migration and prompt notes; the playable application and its `.git` directory are in the nested folder.

## What was inspected

- The current application entry point, all major root modules, the nine tab render modules, data stores, save/migration code, localization catalogue and validator, build tooling, and assets by category.
- The GDD and project docs, localization status, build guide, UI refactor and player feedback plans.
- The Playwright configuration, area runner, fixtures, debug helpers, 50-area taxonomy, spec inventory, and generated coverage/known-issues documents.
- Static searches for state access, browser storage, cloud calls, DOM HTML insertion, animation/timer paths, and current tab markup.

The F-01–F-10 source extraction is complete in the [foundation source contract](foundation-source-contract.md) and the [economy](foundation-economy.md), [space/interstellar](foundation-space.md), and [meta/endgame](foundation-meta.md) catalogues. The [foundation test plan](foundation-test-plan.md) records future remake tests without treating old Cosmic Forge areas as new-game results. F-11–F-18 provide the local app/toolchain scaffold and F-19–F-30 now provide the engine/simulation substrate; F-31–F-42 and the M-01 exit gate remain open.

This is a **static code and documentation audit**, not a claim that every branch was executed or that every old test still passes. No full Cosmic Forge suite was run. Counts below describe this snapshot and will change as the source changes. Old docs were used as leads and cross-checked against current source where possible. For example, [the older GDD](../../../cosmicForge/cosmicForge/docs/GDD.md) calls tab 8 Menu/Settings, but current [index.html](../../../cosmicForge/cosmicForge/index.html) has tab 8 Cosmic Rip and tab 9 Settings.

One focused read-only check was run: `node validateLocalization.cjs` in the Cosmic Forge app exited 0 and reported 2,621 keys in each of the six languages, three sanctioned empty values, and no missing or unreachable keys. This does not verify translation quality or in-browser layout.

## Scale at the snapshot

| Item | Observed size | Evidence |
|---|---:|---|
| Root JavaScript files | 32 | Root file inventory |
| `game.js` / `ui.js` | about 736 KB / 586 KB | Source files |
| `constantsAndGlobalVars.js` / `resourceDataObject.js` | about 314 KB / 181 KB | Source files |
| `localization.json` | about 1.60 MB | Source file |
| Localization entries | 2,621 keys in each of `en`, `es`, `pt`, `de`, `it`, `fr` | Parsed JSON on audit date |
| Functional test areas | 50 | [taxonomy](../../../cosmicForge/cosmicForge/tests/docs/functional-areas.json) and area folders |
| Playwright spec files | 103 | `tests/e2e/**/*.spec.js` inventory |
| Image / sound files | 809 / 30 | Recursive asset inventory |

The generated [coverage report](../../../cosmicForge/cosmicForge/tests/docs/coverage-report.md) says 50 green areas. That is a historical status recorded by its generator, **not** a fresh verification of this snapshot. Its explanatory counts are not uniformly reliable (for example one area displays an undefined spec count), so the remake should track actual run results separately.

## Audit reading rules

- **Observed** means visible in current source or file inventory.
- **Documented** means described in old project docs but may still need a live verification.
- **Risk** means a plausible failure mode supported by a code pattern; it is not automatically a reproduced defect.
- A proposed remake design in `docs/plans/` is a recommendation, not a claim that Cosmic Forge already implements it.

The source reference is locked to full commit `93e32669c3b35e76cdd4cf82725c14e7215b2fbc`; no source changes after this audit snapshot were found during F-01 verification.

The detailed code risks are in [quality and risks](quality-and-risks.md). The feature inventory in [mechanics and content](mechanics-and-content.md) is the practical parity boundary. A later implementation phase should build a machine-readable rules catalogue from the source data and validate every item, tech, perk, achievement, event, and star modifier against play.
