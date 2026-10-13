# P-44 Cosmic Rip Situation help copy audit — 13 October 2026

Cosmic Forge binds its Situation information tooltip to `infoTooltipSituationHeader` in [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L531); source translations are in `localization.json:315, 2938, 5561, 8184, 10807, 13430`.

MIAPLACIDUS displays the `situationHelp` message in the Situation InfoTooltip (`src/app/CosmicRipPane.tsx`, near line 244). The six target translations now use the corresponding source tooltip copy instead of shorter remake summaries (`src/i18n/cosmicRipMessages.ts`). The separate Situation heading, page ownership, and modal/toast behavior are unchanged.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
