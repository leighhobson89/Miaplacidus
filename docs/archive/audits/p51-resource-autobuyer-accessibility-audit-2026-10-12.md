# P-51 Resource autobuyer purchase context audit — 12 October 2026

## Cosmic Forge source UI

`cosmicForge/cosmicForge/drawTab1Content.js` builds each Resource autobuyer row. The button itself is localized as “Add {rate} {resource} per second” (for example, Hydrogen Tier 1 at lines 167–204); the row description displays the current price and full localized resource name. Hydrogen Tier 1's enable/disable switch is in that row (`drawTab1Content.js:167-194`). `game.js:6095-6101` binds dynamic Resource descriptions to the current autobuyer price. This gives the source button an accessible action label while the row carries the price.

## MIAPLACIDUS target UI

`src/app/EconomyPanes.tsx` renders Resource autobuyer controls in `ResourceAutobuyerTiers`. The single-purchase button is visibly named “Buy · {price} {symbol}”; the tier/rate summary and localized action help are separate adjacent text. Buy Max similarly has a separate total-cost/rate preview. Before this change, neither button referenced those descriptions, so its accessible name exposed the price but omitted the tier's effect and the Buy Max preview was not associated with its control.

## Correction

The target now gives the tier/rate summary, existing localized autobuyer help, and any affordability reason stable IDs and references them through `aria-describedby` on both purchase controls. Buy Max also references its total-cost/rate preview. This reuses the existing six-locale help copy. Visible prices, cost calculations, purchase behavior, and source files were not changed.

This was a static source/target review. No tests, builds, typechecks, formatting checks, or browser review were run. Broader E-57 locale, tooltip, cost-preview, and layout evidence remains open under P-51.

## Resource autobuyer toggle context

Each owned Resource autobuyer tier also has a Pause/Resume control. When multiple tiers were owned, each button had the same accessible name. The active `ResourceAutobuyerTiers` renderer now uses a localized good-and-tier name (`Autobuyer for {good}, tier {tier}` in English), retains `aria-pressed` for the active state, and links the tier/count/rate summary and localized autobuyer help through `aria-describedby`. Hydrogen Tier 1 is rendered separately in `App.tsx`; its toggle now uses the same localized name pattern and references its heading, help, owned count, and rate. The visible Pause/Resume text still states the next action. Commands, toggle state, visible copy, and production are unchanged.

This is a static accessibility correction in `src/app/EconomyPanes.tsx`; no tests, builds, typechecks, formatting checks, or browser review were run. P-51/E-57 remains open for rendered and assistive-technology review.
