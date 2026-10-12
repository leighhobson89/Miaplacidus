# P-45 Random-event history number-format audit

**Date:** 12 October 2026  
**Scope:** Numeric results in the Events Journal's random-event descriptions, with focus on Normal notation.

Cosmic Forge `ui.js:749-797` formats event-history amounts through `formatHistoryAmount`. In Normal notation that function returns `String(Math.floor(num))`; its Research Breakthrough history path supplies the gained amount from `events.js:342-354` to `eventDescResearchDoubledAmount`.

MIAPLACIDUS uses the matching saved result detail and localized description template through `MetaJournalPane.tsx` and `randomEventDescription.ts`. Before this correction, the shared amount helper passed Normal values through `Intl.NumberFormat` with zero fraction digits, which rounds rather than floors. For example, a 2.5 RP breakthrough result is displayed as `+2` in the source and would display as `+3` in the remake. The helper now floors amounts before passing them through the shared locale-aware formatter, so integral values retain the remake's locale grouping while matching the source's floor rule; condensed and scientific notation keep the existing remake formatting. This applies to event descriptions that display research or Antimatter amounts.

The six-locale `eventDesc*` copy and placeholders were already source-mapped; no translation strings or gameplay values changed. This was a static source-to-renderer comparison. No tests, builds, typechecks, formatting, or browser checks were run. P-45 remains open for the wider locale and rendered-copy review.
