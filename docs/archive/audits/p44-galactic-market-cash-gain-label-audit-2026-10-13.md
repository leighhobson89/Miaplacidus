# P-44 Galactic Market Cash Gain label audit

**Date:** 13 October 2026

Cosmic Forge `drawTab7Content.js:370` renders localized `labelCashGain` before the Sell AP proceeds value. The source values are in `localization.json:1969, 4592, 7215, 9838, 12461, 15084` for English, Spanish, Portuguese, German, Italian, and French.

`src/app/GalacticMarketPane.tsx:329-330` now renders `marketText(locale, "cashGain")` before the same computed sale proceeds. `src/i18n/metaMessages.ts:650, 702, 755, 807, 861, 914` contains the six source values. The AP sale calculation and action are unchanged. Static source/catalogue/renderer comparison; no tests or browser checks were run. P-44 remains open.
