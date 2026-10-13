# P-44 Cosmic Rip Situation title copy audit — 13 October 2026

Cosmic Forge renders `headerMainSituation` as the Cosmic Rip section heading in [`drawTab8Content.js`](../../../../cosmicForge/cosmicForge/drawTab8Content.js#L101). Its six localized values are Situation, Situación, Situação, Situation, Situazione, and Situation (`localization.json:1607, 4230, 6853, 9476, 12099, 14722`).

MIAPLACIDUS renders `copy.situationTitle` as the section heading and as part of the scan-information control's accessible label (`src/app/CosmicRipPane.tsx:240-243`). The German value changed from `Lage` to `Situation`; the other five locale values already matched the source. The key is present in all six target locale catalogues (`src/i18n/cosmicRipMessages.ts:359, 426, 499, 570, 640, 712`).

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
