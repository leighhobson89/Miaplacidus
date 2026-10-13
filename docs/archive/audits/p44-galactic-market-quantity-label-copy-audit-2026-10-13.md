# P-44 Galactic Market quantity label copy audit — 13 October 2026

Cosmic Forge uses `tab7QuantityRowLabel` for the Market quantity input in [`drawTab7Content.js`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L279). The six source values are `Quantity:`, `Cantidad:`, `Quantidade:`, `Menge:`, `Quantità:`, and `Quantité:` (`localization.json:1957, 4580, 7203, 9826, 12449, 15072`).

MIAPLACIDUS's Market quantity control uses its `quantity` message both as the visible label and accessible name (`src/app/GalacticMarketPane.tsx:251-252`). The six `MARKET_COPY` values now match the source (`src/i18n/metaMessages.ts:628, 673, 719, 764, 811, 857`). The adjacent outgoing/incoming trade summary remains separate; no transaction or page ownership behavior changed.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
