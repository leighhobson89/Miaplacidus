# P-44 Research AutoBuyer label copy audit — 12 October 2026

The Research AutoBuyer control label now uses the source wording in all six locales. Cosmic Forge renders `tab3ResearchAutoBuyerRowLabel` as the row label before its toggle in `drawTab3Content.js`; MIAPLACIDUS renders the text inside the checkbox label in `EconomyPanes.tsx`. The source strings end in a colon, which the inline checkbox label omits to fit the target control structure. The existing explanatory help remains unchanged.

| Locale | Cosmic Forge source wording | MIAPLACIDUS checkbox label |
|---|---|---|
| English | `Research AutoBuyer:` | `Research AutoBuyer` |
| Spanish | `Autocomprador de Investigación:` | `Autocomprador de Investigación` |
| Portuguese | `AutoComprador de Investigação:` | `AutoComprador de Investigação` |
| German | `Forschungs-Autokäufer:` | `Forschungs-Autokäufer` |
| Italian | `Auto Acquirente di Ricerca:` | `Auto Acquirente di Ricerca` |
| French | `Auto-Acheteur de Recherche:` | `Auto-Acheteur de Recherche` |

Source evidence: `../../../../cosmicForge/cosmicForge/drawTab3Content.js` (`tab3ResearchAutoBuyerRowLabel`) and `../../../../cosmicForge/cosmicForge/localization.json` (locale entries at lines 2072, 4695, 7318, 9941, 12564, and 15187). Target evidence: `src/app/EconomyPanes.tsx` and `src/i18n/economyMessages.ts` (`researchAutobuyer`).

Only visible label copy changed; checkbox behavior and its separate explanatory help are unchanged. No tests, builds, typechecks, or browser checks were run. P-44 remains open for the broader catalogue and rendered-copy review.
