# P-44 Tech Tree research-action accessible-label audit

**Date:** 13 October 2026  
**Scope:** Source-to-remake action wording for technology nodes in the Research > Tech Tree view.

## Source mapping

Cosmic Forge `drawTab3Content.js:268–274` renders a technology action button with localized `buttonResearch` text. Its six values appear in `localization.json:1640, 4263, 6886, 9509, 12132, 14755`: `Research`, `Investigar`, `Investigar`, `Erforschen`, `Ricerca`, and `Rechercher`.

## Remake mapping

MIAPLACIDUS's node action is a single technology-card button, with its action and technology name supplied through `aria-label` in `src/app/EconomyPanes.tsx:2240`. The six-locale `researchTech` catalogue values in `src/i18n/economyMessages.ts:319, 522, 723, 930, 1132, 1337` now use the source action wording. The rendered card retains its separate status and price; the Research and Tech Tree page structure is unchanged.

This changes accessible action copy only; research eligibility and mechanics are unchanged. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
