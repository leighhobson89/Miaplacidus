# P-44 Research and Technology Notification Audit — 12 October 2026

## Scope

Compared Cosmic Forge's Research technology, philosophy action-result, and philosophy-selection notification callsites and locale values with the current MIAPLACIDUS notification catalogues and renderer routes. The source is read-only at `../../../cosmicForge/cosmicForge/`.

## Research technology completion

Cosmic Forge initializes `techNotificationMessages` from the `techNotify*` keys in `descriptions.js` and emits the matching entry from `handleTechnologyButtonClick` in `drawTab3Content.js` as an `info` notice in the `tech` class for 3000 ms. MIAPLACIDUS maps newly researched technology IDs through `technologyNotificationText` in `src/i18n/technologyNotificationMessages.ts`; the `App.tsx` research-state observer sends the notice with the same classification, type, and duration. The catalog has all 57 source technology IDs, so its generic fallback is not used for this source family.

Compared each source value from `localization.json` with its target value in en, es, pt, de, it, and fr (342 locale/message pairs). 340 pairs match exactly. The two Spanish differences are corrections of source data defects already present in the target: `techNotifyCarbonFusion` has a stray `º` and a missing blank-line separator in the source, and `techNotifySodiumIonPowerStorage` says `Energión` in the source. MIAPLACIDUS renders the intended Spanish wording for both. These notices contain no dynamic placeholders.

## Philosophy action results and selection

Cosmic Forge's Research Philosophy controls emit the 19 `notificationPhilosophy*` ability and repeatable-upgrade results as `info` / `tech` notices for 3000 ms. Its four path-selection results are `warning` / `special` notices for 3000 ms. MIAPLACIDUS routes the corresponding typed `philosophy.ability.activated`, `philosophy.repeatable.purchased`, and `philosophy.selected` events through `philosophyEventNotifications.ts` with the same classifications, types, and duration.

Compared the 19 upgrade/ability messages and four selection messages in all six locales (144 locale/message pairs). All match the corresponding Cosmic Forge `localization.json` values exactly, including the Rapid Expansion action notice. These messages contain no dynamic placeholders.

## Outcome

No missing Research or Philosophy notice route, locale-copy mismatch, or placeholder mismatch was found. No code change was needed. Cosmic Rip's timed research completion uses a separate event route and localized technology-name placeholder; it remains covered by its existing P-44/P-45 notes. The one-time Megastructure availability cue is handled by the previously audited persistent page-attention indicator.

This was a static source/catalogue/renderer comparison. No tests, builds, typechecks, browser checks, or save interactions were run. P-44 remains open for the remaining presentation evidence.
