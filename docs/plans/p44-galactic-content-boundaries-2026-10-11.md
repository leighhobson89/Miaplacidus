# P-44 Galactic page-content boundaries — 11 October 2026

## Source and target evidence

Cosmic Forge's Tab 7 markup defines Rebirth as `option1`, Galactic Market as `option2`, Casino as `option6`, Ascendency Perks as `option3`, and Megastructures as `option4` (`cosmicForge/cosmicForge/index.html:683-727`). Its page builder assigns the Rebirth action and `galacticMarketLiquidateForAPRow` to `heading === 'Rebirth'` (`drawTab7Content.js:126-228`). It assigns resource/compound trade controls and AP sales to `heading === 'Galactic Market'` (`:233-382`); Casino point purchase and games are under `:385+`; Ascendency Perks are under `:1727+`; Megastructures are under `:1826+`.

MIAPLACIDUS preserves the source child identities in `src/app/presentationNavigation.ts` and mounts dedicated components in `src/app/App.tsx`. Philosophy remains Research option4, matching `cosmicForge/cosmicForge/drawTab3Content.js:85`.

## Finding and correction

The asset-liquidation card and its confirmation dialog were inside `GalacticMarketPane`, even though Cosmic Forge assigns the liquidation row to Rebirth. Moved that card into `RebirthPane` as `AssetLiquidationCard`; Galactic Market now contains only trading and AP-sale actions. The liquidation calculation, command, help, localized labels, lockdown reason, confirmation, and feedback were retained. Its card spans the Rebirth action row.

Casino remains a distinct child page under Galactic, per the owner's direction. Ascendency Perks and Megastructures remain their own Galactic children; Philosophy remains under Research. Navigation IDs, option IDs, ordering, gates, and gameplay rules were not changed. No test files were added or changed, and no tests, builds, typecheck, formatting, or browser checks were run.
