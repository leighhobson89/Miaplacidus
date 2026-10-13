# Phase 7 — localization audit and sweep

**Status:** deferred until the remaining non-localization Phase 6 implementation is complete. The owner directed on 13 October 2026 that translation and localization work be held for this phase. Phase 6 implementation should continue on non-localization behavior and presentation while this package remains queued.

**Outcome:** every player-facing message and locale-specific layout is checked against Cosmic Forge's source intent, mapped to its active MIAPLACIDUS catalogue and renderer, and reviewed in all six supported locales: `en`, `es`, `pt`, `de`, `it`, and `fr`.

This phase resumes the held localization scope already tracked under **P-44**, **P-45**, and the locale-specific parts of **P-51** in the [Phase 6 checklist](06-presentation.md) and [Phase 6 estimates](phase-6-estimations.md). Existing completed source comparisons, locale checks, and dated audits remain valid evidence; do not repeat them without a concrete reason. Keep the P-ticket estimates and percentages unchanged unless the owner revises them.

## Source and catalogue coverage

- [ ] **L-01** Inventory remaining player-facing Cosmic Forge source keys, including visible labels, help, notices, dialogs, dynamic results, errors, and accessibility names. Record a mapped, intentionally adapted/replaced, or excluded disposition for every applicable source key.
- [ ] **L-02** For each mapped or adapted message, record its source key, target catalogue/key, placeholders, locale coverage, and active page/control owner in the crosswalk. Preserve separate source outcomes and distinct destination ownership.
- [ ] **L-03** Review typed catalogue shape and runtime fallback paths across all six locales. Correct missing keys, placeholder mismatches, invalid locale selection, accidental English fallback, malformed markup, and character-encoding defects.
- [ ] **L-04** Review grammar, register, names, number/date/unit formatting, plural/gender variants, punctuation, apostrophes, and meaning in context for every changed or outstanding message family. Record deliberate source adaptations and their reasons.

## Player-facing route sweep

- [ ] **L-05** Complete the remaining visible-copy route review in each locale from startup through ordinary play, Settings/save/import, notifications and dialogs, gameplay action results, achievements/events/news, and both ending routes. Record the route and states covered for each locale.
- [ ] **L-06** Exercise dynamic and state-dependent copy with representative values and outcomes, including zero/maximum values, named entities, unavailable actions, success/failure, expiry, save conflict, rebirth, and ending states where applicable. Verify the correct placeholders and locale are rendered.
- [ ] **L-07** Review locale-sensitive layout at 320, 390, 768, and 1280 CSS-pixel widths with enlarged text, long translations, dialogs, tooltips, tables, and dynamic result cards across the nine themes. Fix only reproduced clipping, overflow, overlap, focus, or readability defects and record the affected locale/theme/viewport/state.

## Corrections and acceptance evidence

- [ ] **L-08** Add or update focused validation for each confirmed catalogue, placeholder, route, or rendering correction. Inspect the affected result in all six locales and recapture the relevant visual state where layout changed.
- [ ] **L-09** Update the source-to-target crosswalk and parity ledger with coverage, corrections, intentional adaptations/exclusions, commands/results, and remaining owner decisions. Link dated audits from the relevant work packages.

## Exit gate

Phase 7 closes when all applicable source messages have a documented disposition; all six locales pass the catalogue and placeholder checks; every planned route and dynamic outcome has recorded review; locale-sensitive layouts have no unresolved reproduced defects in the reviewed matrix; and the crosswalk, parity ledger, and focused evidence agree. Source files under `../cosmicForge/cosmicForge/` remain read-only.
