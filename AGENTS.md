# MIAPLACIDUS development instructions

## Scope and reference

This folder is the only writable project for the remake. `../cosmicForge/cosmicForge/` is a read-only behavioral reference. Never change files there while working on MIAPLACIDUS. Read [docs/README.md](docs/README.md), the [audit](docs/audit/README.md), [decision record](docs/plans/open-decisions.md), [master checklist](docs/plans/master-checklist.md) and [parity ledger](docs/plans/feature-parity-checklist.md) before implementing a feature.

The target is a from-scratch HTML/CSS/TypeScript browser remake called MIAPLACIDUS, with Cosmic Forge's current mechanics, desktop and responsive mobile layouts, and six languages. Remake all visual assets. By the project owner's explicit authorization on 2026-10-04, reuse Cosmic Forge's 30 sound files unchanged, record each source and usage in the asset manifest, and keep the audio playback adapter in the remake architecture. The full game is the default; a demo is optional behind an explicit flag. Cloud saving, Electron, original Cosmic Forge save import and analytics are excluded. Use multiple `localStorage` slots, LZString text/file exchange and versioned migrations for MIAPLACIDUS saves. The working architecture is a framework-independent deterministic engine rendered by React. An agent may recommend a different library only with a concrete migration reason and a documented decision. Do not copy the old giant modules into the new runtime as a shortcut.

## Handoff workflow

The files in `agents/` describe **roles and review lenses**. Agents are a standard part of this workflow and must be actively used, not avoided. For every multi-part request, inspect the available role definitions and delegate independent architecture, documentation, implementation, test, and review slices in parallel as capacity allows. Do not default to doing all work in the primary agent when parallel work can make useful progress. Keep assignments concrete and non-overlapping, then integrate and review their results. If no available role fits or the work is strictly dependent, proceed directly and state the reason.

For an unfinished checklist phase that spans turns, delegation is an ongoing requirement: at the start of each continuation, check active-agent capacity and assign the next independent open slices. Earlier delegation does not satisfy this requirement for later work. Keep using available agents until the phase is complete or the owner asks to stop; if every available slot is occupied or the remaining work is dependent, explain that constraint in the progress update and delegate again when capacity opens.

One agent may perform several roles. For each implementation slice:

1. **Architect:** inspect relevant Cosmic Forge repository code and current remake state; define rule contract, data ownership, affected areas, failure modes and acceptance tests. Check the [master build checklist](docs/plans/master-checklist.md), linked work package and [local save contract](docs/plans/local-save-contract.md).
2. **Documentation specialist:** record an actionable feature plan in `docs/plans/` and update the parity ledger. Cite source paths and distinguish observed behavior from an intentional redesign.
3. **Test engineer:** add focused failing tests for changed game rules, UI behavior, save behavior and localization where the implementation exists. For the initial audit/harness skeleton, no spec scripts are requested; document the planned tests instead.
4. **Implementation specialist:** build a vertical slice through content, pure engine, UI and persistence without changing unrelated behavior.
5. Run focused checks, fix failures, review accessibility and six-language text/layout, and record commands/results.
6. Update the feature docs, archive the final plan with a dated name in `docs/archive/plans/`, and leave `docs/plans/` for active or not-yet-executed plans only. The master checklist, roadmap, parity ledger, harness plan and decision record remain active until the project is complete.

For a small, reviewable change, a concise plan in the response or commit is enough; keep the parity ledger accurate. Prefer patch-based edits.

No edits may be made to the codebase outside the IncrementalGame project folder, but reading is fine.

## Browser/game rules

- Keep simulation rules in typed, testable modules with one authoritative state tree and explicit commands/selectors. UI text and DOM nodes must never be the source of numeric rules or identity.
- Keep immutable content definitions separate from mutable save state. Assign every field a run, permanent, settings or statistics scope. Future MIAPLACIDUS save migrations and rebirth need focused tests; do not implement original-game import.
- Inject clock and randomness; scenario/debug commands should use the normal engine boundary. The production build must omit edit/cheat access. Never reproduce the old pioneer-name debug backdoor.
- Use stable IDs, semantic HTML, keyboard interaction, responsive CSS and reduced-motion behavior. React renders derived view state; it must not advance the game clock.
- Localize every player-facing string for `en`, `es`, `pt`, `de`, `it`, `fr`. Keep identifiers and save fields language-independent. Validate key/placeholder parity and check long translations in the browser.
- At startup, prefill and select the most recently started ready local save so the primary action immediately reads `RESUME GAME <Pioneer Name>`. Editing the name clears that selection; the player must choose a matching saved pioneer from the filtered suggestions to resume it. Otherwise Start creates a new game. Never overwrite another slot silently. Use versioned, validated, compressed local saves and portable exports.
- Do not implement cloud-save reads, writes, accounts, sync or analytics. Cosmic Rip telemetry is an in-game resource and stays. No test may call Cosmic Forge production services.

## Tests and documentation

The `tests/e2e/<area>/` taxonomy mirrors Cosmic Forge. New specs should drive real browser controls, use deterministic fixtures, and assert player-observable outcomes. Pure calculations belong in `tests/unit/`. Do not claim old green coverage as remake coverage. Record deliberate gameplay differences in the relevant feature plan and reflect any scope change in the [decision record](docs/plans/open-decisions.md).

Run focused tests for the requested area without additional approval. **Ask the user before a full test-suite run** as required by this project's inherited workflow; explain that this rule comes from `IncrementalGame/AGENTS.md`. Audit and planning work do not require a suite run.

When a full suite is run for a requested work section, run it once for that section. If test fixes are needed based on that run, rerun only the affected test areas; do not repeat the full suite solely to verify those fixes. This supplements the focused-check rule above and preserves the user-approval requirement for full-suite runs.

## Quick mode

If the user writes the exact code word `QMODE`, a clearly minor change may skip the formal handoff and new tests. Document any behavior or data-format change and keep the parity ledger current.
