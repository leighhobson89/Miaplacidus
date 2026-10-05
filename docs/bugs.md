# Bug tracker

This file tracks player-reported bugs for a later focused bug pass. Reports below have not yet been independently reproduced; suspected causes are leads, not confirmed diagnoses. Track each issue through reproduction, fix, and focused verification, then keep the status and evidence current here.

| ID | Status | Report | Reproduction focus | Acceptance |
| --- | --- | --- | --- | --- |
| BUG-001 | Open — reproduce in Phase 08 | Resource autobuyers appear to run without adding their production to the matching resource quantity. | Enable a resource autobuyer with sufficient power and free storage, advance the game clock, and compare the displayed quantity against the engine state and expected production. Repeat with a powered and an unpowered buyer. | Enabled buyers add the expected output to the correct resource quantity at the configured rate, subject to power, storage, allocation, and other documented rules. |
| BUG-002 | Open — reproduce in Phase 08 | Research automation appears not to add research points or advance eligible technology while time passes. | Enable research automation, provide the required science buildings and power, advance the game clock, and compare research points and technology state before and after. Repeat with the grid disabled and enabled. | Research production and eligible automated research advance at their configured rates when requirements are met, and remain correctly blocked when they are not. |

The actionable reproduction and fix workflow is in the [build bug checklist](plans/build-checklist/bug-checklist.md); the planned later work package is [Phase 08 — Big Fix](plans/build-checklist/08-big-fix.md).
