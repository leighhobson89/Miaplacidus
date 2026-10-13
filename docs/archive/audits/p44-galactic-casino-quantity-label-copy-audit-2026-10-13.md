# P-44 Galactic Casino purchase quantity label copy audit — 13 October 2026

Cosmic Forge supplies the purchase quantity field's placeholder from `placeholderBuyCpQuantity` in [`drawTab7Content.js`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L403). The six source values are `Buy CP Quantity`, `Cantidad de PC a comprar`, `Quantidade de PC a comprar`, `Zu kaufende CP-Menge`, `Quantità di PC da acquistare`, and `Quantité de PC à acheter` (`localization.json:1973, 4596, 7219, 9842, 12465, 15088`).

MIAPLACIDUS uses the same six localized strings as the visible and accessible label for the purchase quantity input (`src/app/GalacticCasinoPane.tsx:468-475`; `src/i18n/casinoMessages.ts:141, 272, 404, 536, 668, 800`). The target presents the wording as an explicit label rather than an input placeholder. Casino remains its own Galactic child, and purchase behavior is unchanged.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
