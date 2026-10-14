# P-44 Galactic Market bias terminology audit — 13 October 2026

## Scope

This is a targeted source-terminology correction for the Market bias help headings. It does not assess translation fluency or language quality, and it does not merge Galactic Casino into Market.

## Source and renderer evidence

- Cosmic Forge's `ui.js:8987-8995` renders `tooltipBiasLabel` in the Market trade details. The locale values use `Bias:` in English, `Sesgo:` in Spanish, `Tendência:` in Portuguese, `Tendenz:` in German, `Tendenza:` in Italian, and `Tendance:` in French (`localization.json:2538,5161,7784,10407,13030,15653`).
- MIAPLACIDUS renders the corresponding help titles in the Market pane through `GalacticMarketPane.tsx:187-190`; the six locale records live in `marketMessages.ts:14-90`.
- German, Italian, and French titles previously used the English loanword “Bias”. They now use localized source terminology while retaining the remake's separate outgoing and incoming explanations: `Ausgehende/Eingehende Tendenz`, `Tendenza in uscita/in entrata`, and `Tendance à la vente/à l'achat`.
- English, Spanish, and Portuguese values remain populated. All six entries remain connected to the selected-locale Market tooltip.

## Status

Static source-key, catalogue, and renderer comparison only; no tests or browser checks were run. This correction is evidence for one Market message family. P-44's source-key inventory and route-wide review remain open; no P-44 estimate subtask is closed by this slice.
