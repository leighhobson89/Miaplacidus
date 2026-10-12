# P-44 Settings page label and destination audit — 12 October 2026

Compared Cosmic Forge's Settings navigation and six retained child options with the current MIAPLACIDUS Settings rail and page renderers.

The source menu puts Achievements, Events, and Statistics under “Achievements & Stats,” followed by Visual, Game Options, and Saving / Loading under “Options” (`index.html:870-917`). The remake's `presentationNavigation.ts:353-379` keeps all six as separate destinations in source group order; the flat rail removes only the two category headings. Achievements and Events route to independent renderers in `SettingsPane.tsx:671-687`, and Statistics has its own `SettingsStatisticsPane` (`SettingsPane.tsx:797-800`). The seven source reference documents remain separate Miaplaedia child pages. Saving / Loading uses browser-local slots, export/import, and recovery as required by the remake's save contract.

Corrected page labels to match source keys `headerMainAchievements`, `headerMainEvents`, `headerMainStatistics`, `headerMainVisual`, `headerMainGameOptions`, and `headerMainSavingLoading` across `en`, `es`, `pt`, `de`, `it`, and `fr`. This removes the added “Options” suffix from Visual, restores source punctuation in the Saving / Loading label, matches source capitalization in the affected Game Options locales, and restores the German Statistics and Achievements forms. No destination was merged or moved.

The six destination help strings already match their source values. The parent Settings screen also retains its separate source overview help, while its visible introductory sentence is a localized remake summary. The source category headings are not currently repeated in the target rail; each destination remains individually selectable.

Source evidence: `../../../../cosmicForge/cosmicForge/index.html:870-917` and `../../../../cosmicForge/cosmicForge/localization.json` keys `headerMainVisual`, `headerMainGameOptions`, `headerMainSavingLoading`, `headerMainStatistics`, `headerMainAchievements`, and `headerMainEvents` (locale blocks at lines 1618-1623, 4241-4246, 6864-6869, 9487-9492, 12110-12115, 14733-14738). Target evidence: `src/app/presentationNavigation.ts:353-379`, `src/app/SettingsPane.tsx:671-800`, and `src/i18n/settingsMessages.ts`.

Existing title assertions were updated for the corrected English label. No tests, builds, typechecks, or browser checks were run. P-44 remains open for broad rendered-copy review.
