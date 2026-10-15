# Detailed work packages

The [single master checklist](../master-checklist.md) is the project control document. Its phase boxes link to these detailed work packages. Task IDs in the packages are stable references for directing a specific slice; checking a package task does not complete its master phase until the exit gate and evidence are met. The separate [bug run checklist](bug-checklist.md) supports the planned Phase 09 pass; reported defects are tracked in [docs/bugs.md](../../bugs.md).

| Phase | Detailed tasks | Outcome |
|---|---|---|
| 1 | [Foundation and extraction](01-foundation.md) | Source contracts, typed engine, first browser slice and harness |
| 2 | [Local saves and startup](02-local-saves.md) | Independent slots, confirmed-name loading, portable codes, new-game migrations |
| 3 | [Economy and research](03-economy.md) | Resources, automation, energy, research and compounds |
| 4 | [Space and interstellar](04-space-interstellar.md) | Telescopes, mining, stars, travel, battle and settlement |
| 5 | [Meta progression and endgame](05-meta-endgame.md) | Rebirth, AP/GP, casino, philosophies, megastructures and Cosmic Rip |
| 6 | [Presentation implementation (localization deferred)](06-presentation.md) | Non-localization source presentation, responsive behavior, art, audio and themes |
| 7 | [Localization audit and sweep](07-localization-audit-sweep.md) | Complete deferred P-44/P-45, locale-specific P-51, and P-56/E-57 fit review across all six locales |
| 8 | [Verification and release](08-verification-release.md) | Browser and responsive mobile quality, parity evidence, release and optional flagged demo |
| 9 | [Big fix pass](09-big-fix.md) | Reproduce, prioritize and resolve the tracked production and research autobuyer reports |

Focused PXX source and presentation audits, plus the dated Phase 6 handoff crosswalks, are archived under [docs/archive/audits](../../archive/audits/README.md) and remain linked from the relevant checklist and parity evidence. This directory contains the nine numbered phase checklists, Phase 6 estimate reference, bug checklist, and this index only.

MIAPLACIDUS retains Cosmic Forge gameplay breadth. Cloud saves, Electron, original-game save compatibility and analytics are excluded by the [decision record](../open-decisions.md). Visual assets are remade; the 30 Cosmic Forge MP3s are reused unchanged under the project owner's explicit 2026-10-04 authorization, as recorded in the [asset manifest](../miaplacidus-asset-manifest.md). The [parity ledger](../feature-parity-checklist.md) records coverage by functional area without creating a second work queue.

Phase 4 source and state contracts: [telescope, asteroids and rockets](../space-mining-contract.md) and [stable star catalogue](../star-catalogue-contract.md). Settings and Test Lab placement are recorded in the [Phase 6 checklist](06-presentation.md) for implementation with the presentation phase.

Phase 5 is complete. The archived [rebirth/AP](../../archive/plans/2026-10-04-meta-rebirth.md), [AP/GP and market](../../archive/plans/2026-10-04-meta-currency.md), [casino](../../archive/plans/2026-10-04-meta-casino.md), [philosophy](../../archive/plans/2026-10-04-philosophy-paths.md), [Black Hole and megastructure](../../archive/plans/2026-10-04-meta-endgame.md), [Cosmic Rip](../../archive/plans/2026-10-04-cosmic-rip.md), and [achievement/event/news](../../archive/plans/2026-10-04-meta-signals.md) contracts record G-01–G-60 rules and evidence. Phase 6/M-06 is complete; M-07/Phase 7 is active under the no-test-run owner direction.

Phase 7's active source-key work is tracked in the [localization crosswalk](../phase-7-localization-crosswalk.md); authored startup, Settings, Casino, Cosmic Rip milestone/research result, and Megastructure table-effect locale specs remain **NOT RUN** for Phase 8 V-59. Star Map mode/help and Star Data weather-help locale assertions were updated and remain **NOT RUN**; details are in the [Cosmic Rip](../../tests/e2e/cosmic-rip/README.md), [Megastructures](../../tests/e2e/megastructures/README.md), [Settings](../../tests/e2e/settings/README.md), [Star Map](../../tests/e2e/star-map/README.md), and [Localization](../../tests/e2e/localization/README.md) area records.

**Phase 1 status (2 October 2026; historical):** M-01 and F-01–F-42 are complete. The source contract and domain catalogues are linked from [the audit index](../../audit/README.md); the architecture and build checks are in the archived [toolchain plan](../../archive/plans/2026-10-02-toolchain-project-structure.md), the engine design is in the [F-19–F-30 completion plan](../../archive/plans/2026-10-02-engine-and-simulation-core.md), and the first player-facing slice is in the [Hydrogen completion record](../../archive/plans/2026-10-02-hydrogen-vertical-slice.md). M-06 was the active gate then; M-07 is current.
