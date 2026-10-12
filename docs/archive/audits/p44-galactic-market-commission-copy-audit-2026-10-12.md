# P-44 Galactic Market commission copy audit — 12 October 2026

Cosmic Forge uses the localized `labelCommission` in its trade summary (`drawTab7Content.js:321`). Its German value is `Provision:` (`localization.json:9832`); MIAPLACIDUS had `Gebühr`, although the other five locale values already matched the source wording. Changed the German `marketMessages.commission` value in `src/i18n/metaMessages.ts` to `Provision`.

The Market renderer appends the colon when it shows the commission label in the summary, trade preview, and history (`src/app/GalacticMarketPane.tsx:196,272,356`), so the visible German label now reads `Provision:` like the source. This is a copy-only change; trade mechanics and the separate Galactic Casino destination are unchanged.

Source locale values for `labelCommission` (`en`, `es`, `pt`, `de`, `it`, `fr`) are `Commission:`, `Comisión:`, `Comissão:`, `Provision:`, `Commissione:`, and `Commission:` at `localization.json:1963,4586,7209,9832,12455,15078`. No tests, builds, typechecks, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
