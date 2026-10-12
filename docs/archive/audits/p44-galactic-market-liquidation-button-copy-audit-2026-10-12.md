# P-44 Galactic Market liquidation button copy audit — 12 October 2026

Compared the Cosmic Forge Galactic Market liquidation action with the MIAPLACIDUS trigger button. The source uses `buttonLiquidate` at `drawTab7Content.js:199`; its six locale values in `localization.json` are `LIQUIDATE`, `LIQUIDAR`, `LIQUIDAR`, `LIQUIDIEREN`, `LIQUIDA`, and `LIQUIDER`. MIAPLACIDUS renders `marketText(locale, "liquidate")` only on the trigger button in `src/app/AssetLiquidationCard.tsx:121`; the key now matches the source values. The card heading and separate confirmation modal use their own text keys and remain unchanged. Liquidation behavior and its Rebirth destination are unchanged.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
