# Phase 09 — Big Fix

**Status:** planned for a later bug run. Do not treat user-reported symptoms as confirmed causes before reproducing them.

This phase handles the tracked autobuyer reports and implementation fixes from later regression failures. Use the [bug run checklist](bug-checklist.md) for triage, controlled reproduction, implementation, and evidence; keep the authoritative issue status in [the bug tracker](../../bugs.md).

## Scope

- [ ] Reproduce and resolve **BUG-001**, resource autobuyer production not appearing in the matching resource quantity.
- [ ] Reproduce and resolve **BUG-002**, research automation not adding points or advancing eligible technology.
- [ ] Determine whether either report involves the simulation timer, tick plan, resource transaction, power allocation, storage cap, save/reload, or more than one of these boundaries.
- [ ] Add focused coverage for the observed cause and acceptance conditions before changing its implementation.
- [ ] Verify the expected behavior through focused unit/browser checks, including relevant powered/unpowered, storage, progression, and save/reload paths.
- [ ] Record commands, results, and any remaining limitations in both the issue record and the affected feature parity row.

- [ ] Triage failures found in later regression runs, reproduce the cause, and implement required fixes here with linked evidence.
- [ ] Carry the Phase 6 P-55 focused Statistics selector/render assertions into the planned regression pass; implement any confirmed test-failure fixes here. The owner's source/remake value review passed on 13 October 2026; no assertions were run during that review closeout.

## Exit gate

Both reports have a documented reproduction outcome, a confirmed cause or an evidence-backed `Not reproduced` result, and focused verification. No status is closed on the basis of a suspected timer cause alone.
