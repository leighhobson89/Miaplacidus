# MIAPLACIDUS

Planning workspace and browser-app foundation for **MIAPLACIDUS**, a from-scratch remake of Cosmic Forge. Preserve its gameplay breadth, nine tabs and six languages while making the browser game smoother on desktop and responsive mobile. All visual/audio assets will be remade. Multiple local save slots and LZString text/file export replace cloud saving; only MIAPLACIDUS saves will be migrated across future versions. There is no Electron app or analytics. Full gameplay is the default; a demo is optional behind an explicit build flag. F-01–F-18 establish the source contract and local toolchain; gameplay implementation and test specs have not started.

Start with [the master build checklist](docs/plans/master-checklist.md). The [documentation index](docs/README.md) links the [source audit](docs/audit/README.md), [detailed work packages](docs/plans/build-checklist/README.md), [parity ledger](docs/plans/feature-parity-checklist.md), [local save contract](docs/plans/local-save-contract.md) and [test harness plan](docs/plans/test-harness.md).

The reference project is read-only for this remake: `../cosmicForge/cosmicForge/`.

## Local commands

Use Node.js 22.12+, 24, or 26+ and `npm ci` to install the locked dependencies. The complete list and purpose of development, validation and focused test commands is in the [toolchain plan](docs/archive/plans/2026-10-02-toolchain-project-structure.md) and [test harness plan](docs/plans/test-harness.md).
