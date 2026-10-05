# Bug run checklist

Use this list during the later Phase 08 pass. The current reports are observations from the project owner, not reproduced defects; establish a minimal reproduction and a confirmed cause before choosing a fix.

## Intake and reproduction

- [ ] Read the current reports in [the bug tracker](../../bugs.md) and preserve each issue ID in code review notes and test names.
- [ ] Record the exact save state, unlocked technologies, building/buyer counts, power state, storage capacity, locale, and game version needed to reproduce.
- [ ] Capture the relevant UI values and engine state before and after advancing a controlled amount of simulation time.
- [ ] Check whether the issue depends on power, storage, production allocation, research prerequisites, offline catch-up, or save/reload.
- [ ] Mark a report `Not reproduced` with the attempted conditions if the documented scenario does not show it; do not infer a root cause from the initial report.

## Fix and verification

- [ ] Identify the responsible state transition or tick-planning boundary before changing implementation.
- [ ] Add focused coverage for the reproduced player-observable failure and its blocking conditions.
- [ ] Fix only after the acceptance conditions in the bug record are concrete.
- [ ] Run the focused unit/browser areas for the changed behavior and record exact commands/results in the bug tracker.
- [ ] Check save/reload, time advancement, and relevant powered/unpowered paths for regressions.
- [ ] Update the matching bug status and close it only when its acceptance checks pass.

## Tracked reports

- [ ] **BUG-001:** resource autobuyer output and displayed/stored quantity.
- [ ] **BUG-002:** research autobuyer output and automated technology progress.
