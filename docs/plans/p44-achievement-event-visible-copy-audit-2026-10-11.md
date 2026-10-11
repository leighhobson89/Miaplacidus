# P-44 Achievements and Events visible-copy audit — 11 October 2026

Compared the Cosmic Forge Settings option 10 and option 14 renderers with MIAPLACIDUS `AchievementsPane`, `MetaJournalPane`, and their localized message catalogues. No tests, builds, typechecks, formatter, or browser checks were run.

- **Achievements:** the heading and overview tooltip use the source `headerMainAchievements` and `headerDescAchievements` copy. Each card's detail tooltip maps its achievement ID to the source `achievement<Name>` text in all six locales. Reward names/amounts and permanent-versus-run status are target presentation data; no incorrect source-copy mapping was found.
- **Events:** the heading and overview tooltip use `headerMainEvents` and `headerDescEvents`. The active/history headings, `Active Until` label, and both empty states correspond to the source `tab9Events*` and `textNo*TimedEvents` entries in all six locales. Active countdowns, event details, duration, and elapsed-time labels are wired to the intended event/status fields.
- **History display:** Cosmic Forge `getEventsHistorySnapshot()` returns its complete retained history and the renderer displays each entry. `MetaJournalPane.tsx` now renders all history present in the current game state, newest first. The engine itself retains up to 100 run events (`src/engine/randomEvents.ts`); this existing save/history boundary is unchanged, as requested.

No source-backed copy or localization correction was warranted in this slice. The verified eight-entry display cap is removed; no event recording, persistence, or news ticker behavior changed.
