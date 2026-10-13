# P-44 Interstellar Star Data Type sort copy audit — 13 October 2026

Cosmic Forge labels the Star Data Type column with `textStarType` in [`drawTab5Content.js`](../../../../cosmicForge/cosmicForge/drawTab5Content.js#L658). Its localized values are `Type`, `Tipo`, `Tipo`, `Typ`, `Tipo`, and `Type` (`localization.json:1875, 4498, 7121, 9744, 12367, 14990`).

MIAPLACIDUS's Star Data table heading already uses the same localized `dataType` value. The Type item in the table's sort menu now uses the same source wording through `sortType` (`src/app/StarMapPane.tsx:134`; `src/i18n/starMapMessages.ts:36, 263, 308, 354, 399, 445`), replacing longer labels such as “Star type” and “Type d'étoile.” Star Data remains a separate Interstellar child, and the map remains on its own child.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
