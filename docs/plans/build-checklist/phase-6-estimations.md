# Phase 6 completion estimates

Estimates last reviewed 11 October 2026. Phase 6 closed on 14 October 2026 at **0 open / 66 closed / 66 total**. P-31 closed with its original **60% complete** and **90-150 mins** estimate retained; no estimate or percentage was recalculated. The 1,665-2,410 minute aggregate for the eleven previously estimated tickets is unchanged; the P-28 follow-up is unestimated and excluded from that total. Earlier 13 October status notes below are historical and superseded by the current closeout.

Owner scheduling update (13 October 2026; before manual-review closeout): Phase 7 localization coverage work is active after the same-day handoff, while M-06 remains open. P-44/P-45 and the locale-specific P-51/P-56 subtasks are now tracked in Phase 7; translation quality and linguistic sign-off are not gates. The original non-localization-first scheduling instruction is retained in the Phase 6 checklist history; no estimate or percentage changed.

Pre-owner-review subtask reconciliation (13 October 2026): the completed P-20 inactive-page and P-45 Star Map value-correction bullets had been removed. Static P-45 review confirmed the mapped random-event catalog values are non-empty in all six locales and the active journal/notice routes select the current locale. The remaining locale route/state scope is carried by Phase 7. The manual-review gates listed in this earlier checkpoint were subsequently accepted by the owner, as recorded below. Percentages and time estimates are unchanged.

Pre-owner-review localization acceptance checkpoint (13 October 2026): no open Phase 6 or Phase 7 subtask uses translation fluency, grammar, or linguistic sign-off as acceptance evidence. P-45's confirmed Star Map value correction and bounded random-event catalog/value plus selected-locale routing review are complete; dynamic event-state routes and the remaining page/action families still require evidence. Other outstanding localization bullets require source-key disposition, non-empty six-locale values, intended-route availability, or reproduced layout evidence. Estimates, percentages, ticket states, and the then-current 12 open / 54 closed count remained unchanged.

Pre-owner-review technical/evidence checkpoint (13 October): P-22 assumes access to a physical device for the soft-keyboard check; device wait time is excluded. P-20 still needs spoken assistive-technology verification. P-29 renderer crossings reserve the same fleet-tail slot used by confirmed pooled-health death events. Audio matches exact system/round/side/fleet/slot first, then permits one-to-one pairing only when remaining events and candidates match within the same group and each event confirms one loss; every attempt uses a captured crossing time. Unmatched confirmed visuals may use receipt time, never for audio. Single-round playback waits for aggregate confirmation; a multi-round dispatch/batch advances cooldown without late playback. Pooled and transient per-unit health can disagree, leaving unmatched confirmed losses silent in audio; a matched synthetic visual slot may still animate at event-receipt time. Normal/catch-up cadence, audio-state, and source-timing evidence remain open. The visible-shot `<= 0.2` threshold and roll-before-goal order match Cosmic Forge. Reached hunt points receive a new no-target point immediately in the same frame (game.js:15048-15058,15226-15229; SpaceBattlePresentation.tsx:605-695). The earlier feasibility review estimated at least four hours for a richer battle model; no estimate or percentage changed. P-31 had remained parked until the non-performance Phase 6 work closed; that condition is now met and P-31 is unparked. P-56 estimates the presentation matrix only; the performance work is tracked separately under P-31, now unparked. P-10 includes natural unlock progression that seeded journeys cannot establish.

Pre-owner-review P-55 technical note: P-55 follow-up on 13 October: numeric Energy rate values now use Cosmic Forge's `kJ / s` suffix in six locales, and the v52→v53 migration no longer restores Dyson's run-only plant-rate effect for saves with a prior rebirth. The relevant source/code comparisons are recorded in archived audits; matched values, migration fixtures, and rendered review remain open. No estimate, percentage, or ticket time range changed.

Pre-owner-review P-29 implementation checkpoint: P-29 implementation update (13 October 2026): a shared battleDeathUnitIndex helper assigns fleet-tail slots, and a shared battleFleetCountAtHealth helper applies the resolver survivor formula ceil(max(0, healthPool) / max(1, unitHealth)), capped by fleet size. The renderer reserves crossing candidates against that same count; crossings beyond the pool-confirmable count get no audio candidate. Global audio first matches exact system/round/side/fleet/slot events, then pairs remaining candidates only one-to-one within the same system/round/side/fleet group when counts match and each event confirms one loss. Attempts use captured crossing times, never receipt time; unmatched confirmed visuals may use receipt time. Single-round playback follows aggregate confirmation; multi-round catch-up consumes exact and safely paired matches through cooldown without playback. This reduces partial-health slot drift but cannot make pooled health authoritative per ship, so unmatched losses remain silent. No estimate bullet is removed: cadence, audio-state, and source-timing evidence has not been run. No tests, builds, typechecks, formatting, or browser checks were run. P-29 remains open and its estimate is unchanged.

P-45 Star Map value correction (13 October 2026): a static English-fallback scan found `starMap.unidentifiedStar` missing from es/pt/de/it/fr; those five locale entries now contain non-empty values. The registered-catalogue scan found no other locale-root, key, or empty-value issue in its scope; six additional player-facing modules were checked and had populated six-locale values. This completes the confirmed P-45 value-correction subtask removed from the estimate list; source-key inventory and route/state coverage remain open. No tests, builds, or typechecks were run; estimates and percentages are unchanged.

P-36 source-action count crosscheck (13 October 2026): static review maps all 48 source spotlight/condition/timed entries to 28 persisted target steps, grouping navigation clicks with page-read prompts. No source action gap was found; the remaining P-36 estimate bullets are still needed for live flow, timing, save/resume, keyboard, Skip/completion, and spoken assistive-technology evidence. No sub-bullet was removed because none of those bounded live acceptance tasks is complete. Translation quality remains outside the acceptance criteria, and estimates and percentages are unchanged.

P-44 Resources/Compounds bulk-sale implementation (13 October 2026): both source-owned Sell All actions now map to separate target controls, the existing sale command, and aggregate results with non-empty values in six locales. The bounded action/value mapping is recorded in the archived audit; P-44's source-wide inventory and interactive route review remain open. The separate source compound-overflow warning depends on mechanics the remake currently rejects, so it remains for mechanics review. No broad estimate sub-bullet, estimate, percentage, or ticket status changed.

P-44 Resources/Compounds bulk-storage implementation (13 October 2026): separate source-owned Increase All Storage controls now dispatch category-scoped commands with source-ordered eligibility, shared-input reservations, Water/Concrete costs, one-second fuel allowances, and one aggregate result route. The label and result map to their source keys and have populated values in all six locales. See the [bulk-storage audit](../../archive/audits/p44-economy-bulk-storage-action-audit-2026-10-13.md). This completes only the bounded control/command/value mapping; the existing P-44 estimate bullets cover a wider source inventory and runtime route/state evidence, so none is wholly complete and no sub-bullet is removed. Estimates, percentages, and ticket status are unchanged.

P-29 navigation implementation note (13 October): the active battle route is now locked against top-level and child-page changes, matching the source UI. Remaining P-29 acceptance is source-timing and cadence evidence across normal and browser-background catch-up, including the pooled-health and mixed-time-warp limits. No estimate or percentage changed.

## Open Phase 6 items

Every estimate subtask marked `MANUAL REVIEW REQUIRED` was checked and passed by the owner on 13 October 2026. P-31's 14 October production-build and asset-inventory evidence is recorded in the [P-31 audit](../../archive/audits/p31-asset-optimization-audit-2026-10-14.md). Test-failure fixes and focused assertions remain deferred to Phase 9; localization coverage and locale-fit work remain tracked in Phase 7.

**No open Phase 6 items remain.**

## Deferred work tracked outside Phase 6

These Phase 6 tickets are closed as transferred scope. Their original estimates and percentages are retained unchanged; the destination phases still own their remaining work.

- P-44 - Source message catalog mapping - **70% complete** - **240-360 mins** - Phase 7 L-01 through L-06 owns the remaining source-key disposition, required-value coverage, and intended-route sweep.

- P-45 - Six-language playthrough completeness - **85% complete** - **180-240 mins** - Phase 7 L-01 through L-06 owns the remaining six-locale route and state coverage.

- P-51 - Responsive layout and locale-fit review - **70% complete** - **150-240 mins** - Phase 7 L-07 owns the deferred longest-locale and E-57 economy layout cases; the owner passed the non-locale manual review.

- P-55 - Source screen coverage parity - **75% complete** - **180-270 mins** - Phase 9 owns the deferred focused selector/render assertions and any test-failure fixes; the owner passed the manual source/remake comparison.

- P-56 - Presentation screenshot matrix - **70% complete** - **180-300 mins** - Phase 7 L-07 owns translated-label and locale-fit captures; the owner passed the non-locale matrix review and the performance follow-up is separate under P-31.

## Closed items

Names only, for reference.

- P-01 — Source screen inventory
- P-02 — Stable navigation and action IDs
- P-03 — Ten-tab navigation
- P-04 — Tab order and unlock history
- P-05 — Keyboard and touch action access
- P-06 — Action costs and disabled-state guidance
- P-07 — Visible task and timer progress
- P-08 — Notification and modal layering
- P-09 — Save controls in Settings
- P-10 — Representative unlock playthrough
- P-11 — Responsive design targets
- P-12 — Responsive layout and overflow
- P-13 — Narrow-panel information visibility
- P-14 — Touch and keyboard navigation controls
- P-15 — Semantic accessibility and focus order
- P-16 — Focus restoration and dialog dismissal
- P-17 — Theme contrast and status cues
- P-18 — Reduced-motion support
- P-19 — Image alternatives
- P-20 — Assistive notification coverage
- P-21 — Keyboard and touch journey testing
- P-22 — Startup and import accessibility
- P-23 — Visual identity board
- P-24 — Asset inventory
- P-25 — Startup logo and artwork
- P-26 — Core game illustrations and icons
- P-27 — Space and endgame artwork
- P-28 — Remaining visual assets
- P-29 — Sound and music coverage
- P-30 — Asset provenance manifest
- P-31 — Asset loading optimization
- P-32 — Release asset audit
- P-33 — Nine-theme rebuild
- P-34 — Theme layout review
- P-35 — Save-aware start screen
- P-36 — Onboarding tutorial flow
- P-37 — Miaplaedia guide documents
- P-38 — Objective and next-unlock guidance
- P-39 — Statistics views
- P-40 — Settings structure
- P-41 — Number notation coverage
- P-42 — Audio controls
- P-43 — Settings persistence scope
- P-44 — Source message catalog mapping (transferred to Phase 7)
- P-45 — Six-language playthrough completeness (transferred to Phase 7)
- P-46 — Save-flow localization
- P-47 — Dynamic localized values and labels
- P-48 — Localization validation
- P-49 — Live locale-switch stability
- P-50 — Locale-aware display formatting
- P-51 — Responsive layout and locale-fit review (locale-fit scope transferred to Phase 7)
- P-52 — Six-language review sample
- P-53 — Historical six-language sample review
- P-54 — Focused presentation verification
- P-55 — Source screen coverage parity (focused assertions transferred to Phase 9)
- P-56 — Presentation screenshot matrix (locale-fit scope transferred to Phase 7)
- P-57 — Deliberate UX change record
- P-58 — News Ticker presentation
- P-59 — Status row presentation
- P-60 — Research and Tech Tree separation
- P-61 — Live simulation display
- P-62 — Debug scenario menu
- P-63 — Resource and Compound layout parity
- P-64 — Interstellar presentation follow-up
- P-65 — Consistent page titles and artwork
- P-66 — Owner-directed page identity and layout

## Historical implementation notes (written before the 13 October owner-review closeout)

P-29 catch-up implementation note (13 October 2026): matched renderer candidates in a system that settles multiple distinct rounds within one dispatch or batch now advance the explosion cooldown without playing late catch-up audio; single-round playback remains enabled. This is static implementation evidence only. The remaining P-29 bullets still require cadence, normal/terminal, audio-state, and source-timing evidence. No test was run, and estimates, percentages, and ticket status remain unchanged.

P-36 source-step implementation update (13 October 2026): compared Cosmic Forge onboarding.js:1088-1091 with the current tutorial sequence and added the missing open-theme-selector interaction before the separate Dark selection step. Pointer and keyboard interaction advance the new step, and both new message keys have non-empty entries in all six locale records. Tutorial announcement dedupe now includes locale, so changing locale re-announces the active step with the selected-locale value. This is static implementation evidence only; no tests, build, typecheck, or spoken screen-reader review was run. No estimate bullet or ticket status changed.


P-29/P-44 implementation evidence (13 October 2026): the shared laser callback timestamp now feeds both the laser visual and source-threshold audio guard; the Casino Void Seer displays reducer outcomes through the source-timed staggered reels; and Rocket orbit status follows destination selection while travel eligibility stays on the action precondition. Audits are linked from the Phase 6 checklist. The source outcome timing remains immediate in the remake, P-29 death/cadence evidence remains open, and P-44 source inventory/interactive route evidence remains open. No estimate subtask is wholly complete from these slices, so no sub-bullet was removed; estimates, percentages, and the 12 open / 54 closed count are unchanged. Translation quality is not a closure gate; these new values were checked for presence in all six locales only. No tests or builds were run.


P-44 Market/Starship implementation update (13 October 2026): the Galactic Market AP-sale selector now matches the source initial selection and disabled state, and accepted Interstellar Starship scans now produce the source-style named notice. The placeholder and notice have non-empty values in all six locales; source and renderer evidence is recorded in the linked Phase 6 and Phase 7 audits. These implementation slices do not complete the broad P-44 source inventory or route/state review. No estimate sub-bullet was removed, and estimates, percentages, and the 12 open / 54 closed ticket count remain unchanged. Translation quality is not a closure gate. No tests or builds were run.
