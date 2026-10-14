# P-44 Galactic Market AP sale selection audit - 13 October 2026

## Source behavior

Cosmic Forge drawTab7Content.js:352-366 initializes the AP sale dropdown to select, offers the localized dropdownSelectQuantity placeholder followed by 1, 5, and 10 AP, and starts the cash-gain preview at zero. game.js:9252-9265 keeps the sale action in its disabled styling until a quantity is selected and enough AP is available. localization.json:1958,4581,7204,9827,12450,15073 supplies the placeholder for all six locales.

## Current remake mapping

GalacticMarketPane.tsx:65,318-350 starts with no selected amount, renders the localized placeholder, keeps the preview at zero, and blocks dispatch until an amount is selected and the command precondition passes. metaMessages.ts provides a non-empty selectQuantity value for en, es, pt, de, it, and fr. The Market remains its own Galactic child page; Galactic Casino remains a separate child and renderer.

## Status

This is a static source, catalogue, and active-renderer comparison. No tests, builds, or rendered checks were run. Translation quality was not assessed and is not a closure gate. P-44's full source-key inventory and route/state review remain open; this slice does not complete an estimate subtask.