# P-44 Galactic Black Hole research action copy audit

**Date:** 12 October 2026

**Scope:** the research action on the Black Hole child page, across `en`, `es`, `pt`, `de`, `it`, and `fr`.

Cosmic Forge renders the research action from `buttonResearchBlackHole` in `drawTab7Content.js:1993`. Its six localized values are in `localization.json:2064, 4687, 7310, 9933, 12556, 15179`. MIAPLACIDUS renders `researchAction` on the research button and its accessible label in `src/app/BlackHolePane.tsx:184, 188`; the catalogue is `src/i18n/blackHoleMessages.ts`.

The Spanish, Portuguese, and German target strings had sentence-style capitalization that did not match the source action. They now use the source values. English, Italian, and French already matched.

| Locale | Cosmic Forge `buttonResearchBlackHole` | MIAPLACIDUS `researchAction` |
| --- | --- | --- |
| en | Research Black Hole | Research Black Hole |
| es | Investigar el Agujero Negro | Investigar el Agujero Negro |
| pt | Investigar o Buraco Negro | Investigar o Buraco Negro |
| de | Schwarzes Loch Erforschen | Schwarzes Loch Erforschen |
| it | Ricerca il Buco Nero | Ricerca il Buco Nero |
| fr | Étudier le Trou Noir | Étudier le Trou Noir |

This changes only the visible action wording. The Research Point cost, action behavior, and owner-directed Galactic > Black Hole child destination remain unchanged. The source-to-target child mapping is recorded in the [presentation navigation contract](../../plans/presentation-navigation-contract.md).

Static source-to-renderer review only. No tests, builds, typechecks, formatting, or browser checks were run; P-44 remains open for the remaining catalogue and rendered-locale evidence.
