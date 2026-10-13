# P-44 Galactic Casino balance label copy audit — 13 October 2026

Cosmic Forge inserts the localized `textCpBalanceLabel` into the Galactic Casino header description before the CP balance value ([`ui.js:3571-3575`](../../../../cosmicForge/cosmicForge/ui.js#L3571)). Its six source values are `CP Balance:`, `Saldo de PC:`, `Saldo de PC:`, `CP-Guthaben:`, `Saldo PC:`, and `Solde de PC:` (`localization.json:2598, 5221, 7844, 10467, 13090, 15713`).

MIAPLACIDUS renders the balance label beside the casino wallet amount through `casinoText(locale, "balance")` ([`GalacticCasinoPane.tsx:430-434`](../../../src/app/GalacticCasinoPane.tsx#L430); [`casinoMessages.ts`](../../../src/i18n/casinoMessages.ts)). The six target values now match the source. This changes copy only; Galactic Casino remains its own Galactic child and its balance behavior is unchanged.

Static source-to-renderer comparison only. No tests or browser rendering were run; P-44 remains open for the broader source-key catalogue and rendered-locale review.
