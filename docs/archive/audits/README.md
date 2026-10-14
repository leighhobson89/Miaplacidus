# Archived PXX audits and Phase 6 handoffs

These dated source-to-remake audits were moved here from docs/plans/ and docs/plans/build-checklist/ so the active build-checklist directory contains no audit records. The 5 and 7 October Phase 6 handoff crosswalks are archived here as well. The records remain linked from the relevant checklist and parity-ledger entries.

Use the ticket prefix in each filename to browse by work area (`p20`, `p29`, `p31`, `p36`, `p44`, `p45`, `p51`, `p55`, or `p56`). The active scope and acceptance evidence are maintained in the [Phase 6 presentation checklist](../../plans/build-checklist/06-presentation.md) and its [estimate reference](../../plans/build-checklist/phase-6-estimations.md).

The [P-44 Starship scan notice audit](p44-interstellar-starship-scan-result-notice-audit-2026-10-13.md) records notification ownership: `StarshipPane` dispatches the scan, then the engine event is routed by `App.tsx` through `spaceEventNotifications.ts` to the shared stack. The pane must not emit a second scan toast. Earlier notices can hold the scan notice in the shared two-card FIFO queue until a slot opens.
