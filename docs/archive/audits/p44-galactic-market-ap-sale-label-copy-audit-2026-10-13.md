# P-44 Galactic Market AP-sale label copy audit (13 October 2026)

Cosmic Forge's Galactic Market Sell AP row uses `tab7SellApRowLabel`, `dropdownSell1Ap`, `dropdownSell5Ap`, `dropdownSell10Ap`, and `buttonSellUpper` in [`drawTab7Content.js:348-363`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L348). MIAPLACIDUS binds the six-locale row label to the card heading and selector label and gives each amount its matching localized option in [`GalacticMarketPane.tsx:294-336`](../../../src/app/GalacticMarketPane.tsx), backed by [`metaMessages.ts`](../../../src/i18n/metaMessages.ts).

| Locale | Row label | Options 1 / 5 / 10 AP | Action |
| --- | --- | --- | --- |
| en | Sell AP: | Sell 1 AP / Sell 5 AP / Sell 10 AP | SELL |
| es | Vender PA: | Vender 1 PA / Vender 5 PA / Vender 10 PA | VENDER |
| pt | Vender PA: | Vender 1 PA / Vender 5 PA / Vender 10 PA | VENDER |
| de | AP Verkaufen: | 1 AP Verkaufen / 5 AP Verkaufen / 10 AP Verkaufen | VERKAUFEN |
| it | Vendi PA: | Vendi 1 PA / Vendi 5 PA / Vendi 10 PA | VENDI |
| fr | Vendre des PA: | Vendre 1 PA / Vendre 5 PA / Vendre 10 PA | VENDRE |

The target's prior generic `AP to sell` row label and numeric-only options are now source-aligned. The action caption already matched `buttonSellUpper`. Selector values, AP sale calculations, and behavior are unchanged; Galactic Market remains separate from the Galactic Casino child page.

Static source-to-renderer comparison only. No tests, builds, typechecks, formatting, or browser review were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
