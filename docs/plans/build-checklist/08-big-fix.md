# Phase 08 — Big Fix

**Status:** planned for a later bug run. Do not treat user-reported symptoms as confirmed causes before reproducing them.

This phase is a dedicated pass over the tracked autobuyer reports. Use the [bug run checklist](bug-checklist.md) for triage, controlled reproduction, implementation, and evidence; keep the authoritative issue status in [the bug tracker](../../bugs.md).

## Scope

- [ ] Reproduce and resolve **BUG-001**, resource autobuyer production not appearing in the matching resource quantity.
- [ ] Reproduce and resolve **BUG-002**, research automation not adding points or advancing eligible technology.
- [ ] Determine whether either report involves the simulation timer, tick plan, resource transaction, power allocation, storage cap, save/reload, or more than one of these boundaries.
- [ ] Add focused coverage for the observed cause and acceptance conditions before changing its implementation.
- [ ] Verify the expected behavior through focused unit/browser checks, including relevant powered/unpowered, storage, progression, and save/reload paths.
- [ ] Record commands, results, and any remaining limitations in both the issue record and the affected feature parity row.

## Exit gate

Both reports have a documented reproduction outcome, a confirmed cause or an evidence-backed `Not reproduced` result, and focused verification. No status is closed on the basis of a suspected timer cause alone.
