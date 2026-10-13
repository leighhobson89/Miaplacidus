# Phase 6 completion estimates

Estimates last reviewed 11 October 2026. Checklist status reconciled 13 October: 12 open / 54 closed after P-28 was reopened for source-triggered ending review; all 66 Phase 6 checkboxes were counted, including the anchored P-55 item. Existing percentages, ticket time ranges, and the 1,665-2,410 minute aggregate for the eleven previously estimated tickets are unchanged; the P-28 follow-up is unestimated and excluded from that total.

Owner direction (13 October 2026): P-44/P-45 localization work and locale-specific P-51 review are on hold for Phase 7, [Localization audit and sweep](07-localization-audit-sweep.md). Their open sub-tasks remain listed here with their existing estimates and percentages; do not work them until the non-localization Phase 6 implementation is complete. P-56 remains active for its non-locale theme/viewport matrix; translated-text and locale-fit cases, including E-57, are held for Phase 7 L-07 without recalculating P-56 estimates or percentages.

P-22 assumes access to a physical device for the soft-keyboard check; device wait time is excluded. P-20 still needs spoken assistive-technology verification. P-29 has a transient unit-level presentation that derives source-shaped visible-shot candidates and per-frame health crossings without changing combat damage or outcomes. After the owner's 13 October direction to match Cosmic Forge callbacks, explosion audio is attempted synchronously at each modeled zero-health crossing through the shared strict `>140 ms` cooldown; aggregate engine events continue to govern confirmed death visuals. The presentation model can diverge from pooled engine casualties, so a modeled crossing can sound without a corresponding confirmed loss, and a confirmed loss can lack a modeled cue. The inclusive `<= 0.2` shot threshold and roll-before-goal order match Cosmic Forge. Reached hunt points now receive a new no-target hunt point immediately in the same frame (game.js:15048-15058,15226-15229; SpaceBattlePresentation.tsx:605-695). Source/model correspondence and focused cadence evidence remain open; the earlier feasibility review found this would add at least four hours and may need a richer battle model. The existing percentage and ticket estimate are retained. P-31 remains parked until other non-performance Phase 6 work is complete. P-56 estimates the presentation matrix only; its performance follow-up remains parked. P-10 includes the natural unlock progression that seeded journeys cannot establish.

P-55 follow-up on 13 October: numeric Energy rate values now use Cosmic Forge's `kJ / s` suffix in six locales, and the v52→v53 migration no longer restores Dyson's run-only plant-rate effect for saves with a prior rebirth. The relevant source/code comparisons are recorded in archived audits; matched values, migration fixtures, and rendered review remain open. No estimate, percentage, or ticket time range changed.

P-29 implementation update on 13 October: the interim confirmed-only mapping that waited for aggregate engine receipts was superseded after the owner selected Cosmic Forge's source-timed behavior. Audio now attempts at modeled per-unit zero-health crossings without waiting for casualty confirmation. The callback timing and cooldown are source-shaped, but the renderer's presentation simulation can diverge from pooled engine casualties; source/model correspondence and catch-up cadence remain open. P-29 remains open, and its estimate remains unchanged.

## Open items

Each ticket keeps its existing completion and time estimates; the bullets below break the remaining work into sign-off tasks.

- P-28 — Remaining visual assets — **reopened; unestimated**.
  - Review the confirm-triggered ending animation, skip path, and reduced-motion end card across the P-28 theme and desktop/phone matrix; attach rendered screenshots and record any fixes.
- P-22 — Startup and import accessibility — **85% complete** — **15-25 mins**.
  - On a physical Android device, open the new-game and save-import screens with the native keyboard and inspect the name field, preview, and primary action.
  - Repeat on a physical iOS device and check the same controls with its native keyboard.
  - At each device's narrowest practical viewport, verify the active field and primary action remain visible as the keyboard opens and closes.
  - Verify keyboard focus follows the intended name-entry, filtered-save selection, import preview, and confirmation order.
  - Import a save while the keyboard is open and confirm the preview, success/error feedback, and next action remain reachable.
  - Fix only reproduced device-specific clipping, focus, scroll, or viewport-resize defects, then repeat the affected device journey and record device/browser/outcome.
- P-29 — Sound and music coverage — **85% complete** — **45-60 mins**.
  - Finish the per-unit battle presentation callback model. Visible-shot eligibility now comes from transient unit positions, visibility, and current goals; the renderer tracks source-style per-frame health crossings but can map them to confirmed engine deaths only when counts match per round and fleet. Make source-timed callbacks authoritative for every confirmed death without changing combat damage or outcomes. Event-receipt fallback and speculative presentation damage are not acceptance evidence.
  - Exercise normal and catch-up battle ticks; verify one 20% roll per source-visible enemy candidate, and only a candidate matching the shooter's current goal invokes the laser callback; cooldown-suppressed attempts are dropped and no terminal shot is inferred.
  - Verify laser attempts at the exact 80 ms boundary are suppressed, attempts after 80 ms are admitted, and no delayed cue plays after synchronous catch-up.
  - Exercise casualties in normal and terminal rounds; verify each confirmed death makes an explosion attempt, the 140 ms boundary suppresses it, and no casualty cue is deferred after the result.
  - With sound muted, at zero volume, unfocused, or audio locked, verify battle attempts still advance cooldown without playback; after restoring audio, verify source timing is preserved and no delayed cue plays. Dispose around battle events and confirm no callback remains.
  - Run the focused battle cadence checks, fix missed or duplicated event-boundary attempts, and record evidence for the source-timed behavior and any remaining model limits.
- P-20 — Assistive notification coverage — **85% complete** — **45-75 mins**.
  - With a screen reader, trigger an unaffordable purchase and verify its localized reason is spoken once without moving focus.
  - With a screen reader, trigger a save conflict and verify the conflict and available resolution are announced while the controls remain usable.
  - With a screen reader, finish a timer after navigating away and verify its global completion announcement is still spoken at the correct time.
  - Check Save Manager lock loss and other cross-tab status changes while their owning page is inactive.
  - Correct any reproduced role, politeness, atomicity, focus, duplication, or wording defect; record screen reader/browser versions and spoken results.
- P-36 — Onboarding tutorial flow — **85% complete** — **60-90 mins**.
  - Start one fresh save and complete every tutorial step through the final Miaplaedia step using the visible game controls.
  - At each step, verify its action, read-time gate, destination, unlock condition, and Continue availability against the intended sequence.
  - Save and reload during an active gated step; verify the same step resumes and completed actions are not replayed.
  - Exercise Skip and normal completion; verify the completion achievement is issued once and subsequent loads do not repeat it.
  - Load a pre-existing save and verify the tutorial is not introduced retroactively.
  - Review every tutorial announcement with a screen reader, fix unclear/missing/repeated guidance, and record journey, resume, skip, and accessibility evidence.
- P-45 — Six-language playthrough completeness — **85% complete** — **180-240 mins**.
  - Complete the remaining startup and core-game route review in en, es, pt, de, it, and fr, recording each page/action family checked.
  - Review Settings, notifications, Save & Loading/import, and error outcomes in all six locales, including success, conflict, and unavailable states.
  - Review remaining gameplay action results, dynamic event text, and both ending routes in all six locales.
  - For each reviewed route, verify placeholders, names, formatted values, grammatical variants, punctuation, apostrophes, and character encoding.
  - Correct confirmed missing, wrong-locale, malformed, or misleading strings in the typed six-locale catalogues without changing mechanics.
  - Add focused locale assertions for each correction and inspect the rendered result in all six locales, including long-text cases.
  - Update the localization audit with route coverage, corrections, and source copy intentionally adapted or excluded.
- P-55 — Source screen coverage parity — **75% complete** — **180-270 mins**.
  - Prepare matched source/remake states for each remaining row group and compare initial, triggered, saved/reloaded, and rebirth values.
  - Verify each counter changes only on its accepted source-equivalent event and resets or persists at the same run boundary.
  - Correct only confirmed value, label, unit, grouping, or scope mismatches; preserve rows already shown to match.
  - Add focused selector/render assertions for each correction, covering Current Run and All Time where applicable.
  - Update the parity audit with source references, comparison states, and any corrections for the remaining row groups.
- P-51 — Translation and layout fit review — **70% complete** — **150-240 mins**.
  - Review remaining menus and page families at 320, 390, 768, and 1280 CSS-pixel widths, including tables, tooltips, dialogs, and dynamic result cards.
  - Repeat representative pages with enlarged text and the longest translations across en/es/pt/de/it/fr and all nine themes.
  - Finish E-57 for every Resource and Compound price row, tooltip, purchase modal, and dynamic-cost state in all six locales.
  - For each reviewed view, inspect focus visibility, wrapping, clipping, contrast, panel bounds, and horizontal overflow.
  - Fix only defects reproduced with a recorded locale, theme, viewport, text size, and page state.
  - Recapture each corrected case and check the adjacent target widths for regressions in clipping or overflow.
  - Record tested combinations and unresolved findings separately from the P-56 screenshot inventory.
- P-56 — Presentation screenshot matrix — **70% complete** — **180-300 mins**.
  - List every major tab and child page, then track capture coverage across nine themes and desktop/narrow viewports; defer six-locale capture coverage to Phase 7 L-07.
  - Inspect captures for title scale, artwork row, spacing, alignment, responsive stacking, clipping, and theme contrast.
  - Defer comparison of long translated labels and page titles at narrow and desktop widths across representative locales to Phase 7 L-07.
  - Fix only presentation defects demonstrated in the matrix, preserving page ownership, tab order, and unlock visibility.
  - Recapture every affected matrix cell and compare the corrected result against the same viewport/theme/locale state.
  - Record coverage and sign-off gaps; keep the separately parked performance follow-up out of P-56.
- P-44 — Cosmicopedia message mapping — **70% complete** — **240-360 mins**.
  - Finish the source catalogue inventory and give every remaining Cosmic Forge text key a mapped, intentionally replaced, or excluded disposition.
  - For each mapped message, record its source key, target catalogue/key, placeholders, locale set, and page or control owner.
  - Add missing typed strings in all six locales and preserve source placeholders, grammatical variants, and result distinctions.
  - Inspect each changed family for correct rendered placement, substitution, active locale, and navigation ownership.
  - Document every deliberate replacement/exclusion with its reason and update source/target references in the crosswalk.
- P-31 — Asset loading optimization — **60% complete** — **90-150 mins**.
  - Keep implementation parked until all other non-performance Phase 6 tickets are closed.
  - Once unparked, measure production entry/chunk transfer sizes and inventory image/font formats and dimensions against the recorded baseline.
  - Identify oversized assets and convert or resize only when the approved appearance is preserved.
  - Preload only assets needed for startup and the first visible page; defer late-game-only assets until needed.
  - Verify deferred artwork does not delay the active page, discard visited-pane state, or create a visible loading defect.
  - Rebuild and compare entry and route transfer sizes, then inspect each changed asset in its owning page.
  - Record before/after sizes, affected routes, visual result, and any remaining large asset.
- P-10 — Representative unlock playthrough — **45% complete** — **480-600 mins**.
  - Start one fresh canonical save and progress only through normal visible controls, with no debug commands or seeded late-game state.
  - Follow natural research, manuscript/star study, starship construction, travel, scanning, and settlement until Galactic unlocks.
  - At Galactic unlock, verify Galactic appears in order and its child pages—including Casino—remain gated until their actual prerequisites are met.
  - Continue the same save through natural homecoming and story acknowledgement until Cosmic Rip unlocks.
  - Verify Cosmic Rip and each child page appears only at its intended milestone and remains hidden beforehand.
  - At each milestone, check locked top-level and child tabs are omitted while the relative order of visible pages remains stable.
  - Check navigation attention markers appear for new destinations, clear when visited, and survive save/reload as specified.
  - Record the canonical save, checkpoint after each unlock, any progression blocker, and evidence for the full natural progression route.

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
- P-11 — Responsive design targets
- P-12 — Responsive layout and overflow
- P-13 — Narrow-panel information visibility
- P-14 — Touch and keyboard navigation controls
- P-15 — Semantic accessibility and focus order
- P-16 — Focus restoration and dialog dismissal
- P-17 — Theme contrast and status cues
- P-18 — Reduced-motion support
- P-19 — Image alternatives
- P-21 — Keyboard and touch journey testing
- P-23 — Visual identity board
- P-24 — Asset inventory
- P-25 — Startup logo and artwork
- P-26 — Core game illustrations and icons
- P-27 — Space and endgame artwork
- P-30 — Asset provenance manifest
- P-32 — Release asset audit
- P-33 — Nine-theme rebuild
- P-34 — Theme layout review
- P-35 — Save-aware start screen
- P-37 — Miaplaedia guide documents
- P-38 — Objective and next-unlock guidance
- P-39 — Statistics views
- P-40 — Settings structure
- P-41 — Number notation coverage
- P-42 — Audio controls
- P-43 — Settings persistence scope
- P-46 — Save-flow localization
- P-47 — Dynamic localized values and labels
- P-48 — Localization validation
- P-49 — Live locale-switch stability
- P-50 — Locale-aware display formatting
- P-52 — Six-language review sample
- P-53 — Translation review sign-off
- P-54 — Focused presentation verification
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
