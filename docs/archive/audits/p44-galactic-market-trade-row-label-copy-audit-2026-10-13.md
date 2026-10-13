# P-44 Galactic Market trade-row label copy audit

**Date:** 13 October 2026

Cosmic Forge creates the outgoing/incoming selector row with `tab7TradeRowLabel` in [`drawTab7Content.js:241-245`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L241). Its six localized values are `Trade:`, `Intercambio:`, `Troca:`, `Handel:`, `Scambio:`, and `Échange:` in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1954).

MIAPLACIDUS now uses the typed `tradeRow` message as the visible label and accessible name of the outgoing selector in [`GalacticMarketPane.tsx`](../../../src/app/GalacticMarketPane.tsx#L211). The six values in [`metaMessages.ts`](../../../src/i18n/metaMessages.ts#L628) match the source. The incoming selector retains its separate `For:` label, and the trade summary retains its distinct give/receive values.

This changes only the outgoing selector label. Trade options, calculations, confirmation, and the separate Galactic Casino child page are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open for the broader catalogue and rendered-locale evidence.
