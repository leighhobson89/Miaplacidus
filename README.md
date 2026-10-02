# MIAPLACIDUS

**MIAPLACIDUS** is a from-scratch browser remake of Cosmic Forge, with nine tabs and six languages. The M-01 Hydrogen-only vertical slice is playable and covered by click-driven end-to-end browser tests; the next phase adds local saves. The full game is the default, with an optional demo build. Multiple local save slots and LZString text/file export replace cloud saving. There is no Electron app or analytics.

Start with the [Vite run and deployment guide](docs/run-and-deploy.md) to launch the game locally or build the static site. The [master build checklist](docs/plans/master-checklist.md) tracks implementation. The [documentation index](docs/README.md) links the [source audit](docs/audit/README.md), [detailed work packages](docs/plans/build-checklist/README.md), [parity ledger](docs/plans/feature-parity-checklist.md), [local save contract](docs/plans/local-save-contract.md) and [test harness plan](docs/plans/test-harness.md).

The reference project is read-only for this remake: `../cosmicForge/cosmicForge/`.

## Local commands

Use Node.js 22.12+, 24, or 26+ and `npm ci` to install the locked dependencies. The complete list and purpose of development, validation and focused test commands is in the [toolchain plan](docs/archive/plans/2026-10-02-toolchain-project-structure.md) and [test harness plan](docs/plans/test-harness.md).
