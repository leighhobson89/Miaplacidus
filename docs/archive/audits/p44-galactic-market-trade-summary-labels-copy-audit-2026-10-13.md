# P-44 Galactic Market trade summary label copy audit — 13 October 2026

Cosmic Forge renders distinct `labelTradeSummaryOutgoing` and `labelTradeSummaryIncoming` strings on the trade confirmation rows ([`drawTab7Content.js:319-321`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L319)). Across `en`, `es`, `pt`, `de`, `it`, and `fr`, the source pairs are `Trade` / `for`, `Intercambiar` / `por`, `Trocar` / `por`, `Tausche` / `gegen`, `Scambia` / `per`, and `Échanger` / `contre` (`localization.json:1961-1962, 4584-4585, 7207-7208, 9830-9831, 12453-12454, 15076-15077`).

MIAPLACIDUS now uses separate `summaryOutgoing` and `summaryIncoming` catalogue entries for the two visible trade-summary rows ([`GalacticMarketPane.tsx:262-269`](../../../src/app/GalacticMarketPane.tsx#L262); [`metaMessages.ts`](../../../src/i18n/metaMessages.ts)). The selector labels and notification copy remain separate. Trade behavior and the distinct Galactic Casino child destination are unchanged.

Static source-to-renderer comparison only. No tests or browser rendering were run; P-44 remains open for the broader source-key catalogue and rendered-locale review.
