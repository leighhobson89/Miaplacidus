# P-44 Research Philosophy cost suffix copy audit — 13 October 2026

Cosmic Forge appends localized `textResearchPointsSuffix` to Philosophy repeatable-tech prices in [`drawTab3Content.js:2742-3571`](../../../../cosmicForge/cosmicForge/drawTab3Content.js#L2742). Its values are `Research`, `de Investigación`, `de Investigação`, `Forschung`, `di Ricerca`, and `de Recherche` (`localization.json:2077, 4700, 7323, 9946, 12569, 15192`).

MIAPLACIDUS uses the `researchShort` entry in the six-locale Philosophy catalogue for the visible ability and repeatable next-cost lines ([`PhilosophyPane.tsx:176-179, 215-219`](../../../src/app/PhilosophyPane.tsx#L176); [`philosophyMessages.ts`](../../../src/i18n/philosophyMessages.ts)). The displayed suffix now matches the source key in all six locales. Research and Tech Tree remain separate source/target destinations as documented; the correction changes only Philosophy cost copy and does not change cost calculations or purchase actions.

Static source-to-renderer comparison only. No tests or browser rendering were run; P-44 remains open for the broader source-key catalogue and rendered-locale review.
