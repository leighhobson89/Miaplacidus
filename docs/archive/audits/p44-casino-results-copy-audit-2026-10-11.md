# P-44 Casino result-copy audit - 11 October 2026

Compared the Galactic Casino page's purchase row, four game sections, selector labels/help, and owned result notifications against Cosmic Forge's Casino renderer and `en`, `es`, `pt`, `de`, `it`, and `fr` localization blocks. The existing Galactic > Galactic Casino ownership/order was preserved.

## Source mapping

- Cosmic Forge builds the Casino child page and its purchase/game controls in `../../cosmicForge/cosmicForge/drawTab7Content.js:385-389`, with the four game sections later in that renderer. The heading, info tooltip, row descriptions, and row labels are keyed by `headerMainGalacticCasino`, `infoTooltipGalacticCasinoHeader`, `galacticCasinoPurchaseCpContent1`, `galacticCasinoGame1Content1` through `galacticCasinoGame4Content1`, and `tab7*RowLabel`. MIAPLACIDUS renders the corresponding page and per-game help in `src/app/GalacticCasinoPane.tsx`; its six-locale copy is in `src/i18n/casinoMessages.ts`.
- The Casino source's Higher or Lower prize catalogue constructs CP entries from `hiloPrizeCp` (`drawTab7Content.js:957`), whose six locale values include the localized `+{amount} CP` or `+{amount} PC` suffix. Wheel CP win notifications use `casinoCurrencyCp` (`casino.js:1170`). Target notifications are assembled in `src/app/casinoEventNotifications.ts` and use the typed six-locale Casino catalogue.

## Finding and correction

The Higher or Lower final-prize notification bypassed the localized `hiloPrizeCp` mapping for CP awards and appended hardcoded `CP` after the amount. That produced the wrong currency label in Spanish, Portuguese, Italian, and French and omitted the source `+` prefix in every locale. `hiloPrizeName` now formats CP outcomes through `casinoPrizeText(locale, "hilo_cp_<amount>", ...)`, reusing the existing six-locale `HILO_COPY.cpPrize` mapping and the game's quantity formatter. Wheel CP notifications already used the localized `casinoCurrencyCp` equivalent.

The source help/selector mappings and the remaining Casino outcome routes reviewed had no additional concrete copy or placement discrepancy. No tests, builds, typechecks, formatters, or browser checks were run, per the implementation-pass instruction.
