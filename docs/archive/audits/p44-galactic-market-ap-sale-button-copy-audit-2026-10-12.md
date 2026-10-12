# P-44 Galactic Market AP sale button copy audit — 12 October 2026

Compared the Cosmic Forge Galactic Market AP-sale control with the MIAPLACIDUS renderer. The source creates the button with `buttonSellUpper` in `cosmicForge/cosmicForge/drawTab7Content.js` (near line 360); its locale values in `localization.json` are `SELL`, `VENDER`, `VENDER`, `VERKAUFEN`, `VENDI`, and `VENDRE`. MIAPLACIDUS uses `marketText(locale, "sellApAction")` on the AP-sale button in `src/app/GalacticMarketPane.tsx`; that catalogue key now matches the source values in all six locales. The target row heading supplies the sale context, so the action remains concise. Sale behavior and the distinct Galactic Casino destination are unchanged.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
