# P-44 Galactic Market copy audit — 11 October 2026

## Finding and change

The Spanish Market validation messages said the player must choose or unlock two "recursos" (resources), although the trade selectors accept both resources and compounds. Cosmic Forge's `drawTab7Content.js:241-271` populates both selectors from `tradeableMaterialOptions()`, and its source help key `galacticMarketItemSelectContent1` explicitly covers Recursos y Compuestos. Updated the Spanish `invalidTrade` and `goodLocked` copy in `src/i18n/metaMessages.ts` to say "bienes" (goods), which covers either category. Other locale messages already use category-neutral wording.

## Crosswalk reviewed

- Page heading and description use `headerMainGalacticMarket` and `headerDescGalacticMarket` in all six locales.
- Trade, AP sale, and liquidation help use `galacticMarketItemSelectContent1`, `galacticMarketSellApForCashContent1`, and `galacticMarketLiquidateForApContent1/2`, mapped through `descriptions.js:1681-1694`.
- Bias help maps the outgoing/incoming explanations and comparison branches from `descriptions.js:602-610` and `localization.json` to the trade preview tooltip.
- Trade completion uses the source `notificationTradedForCommission` flow in `game.js:9380-9460`; the target routes its accepted trade event through `src/app/galacticMarketEventNotifications.ts`. AP sale and liquidation have no source notification; the target provides localized inline feedback.
- Galactic Market remains its own Galactic child (`option2`), before the separate Casino child (`option6`) in the existing rendered order. No navigation changes were made.

No tests, builds, typechecks, formatters, or browser checks were run, per the implementation-first request.
