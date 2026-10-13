# P-44 Cosmic Rip restoration status copy audit — 13 October 2026

The Cosmic Forge Near Space Scanner Array displays `textRequiresRestoration` until it is restored ([`drawTab8Content.js:170-173`](../../../../cosmicForge/cosmicForge/drawTab8Content.js#L170)). The six source values are `Requires Restoration`, `Requiere Restauración`, `Requer Restauração`, `Wiederherstellung Erforderlich`, `Richiede Ripristino`, and `Restauration Requise` (`localization.json:1792, 4415, 7038, 9661, 12284, 14907`).

MIAPLACIDUS now uses `requiresRestoration` for the un-restored situation status ([`CosmicRipPane.tsx:260-270`](../../../src/app/CosmicRipPane.tsx#L260); [`cosmicRipMessages.ts`](../../../src/i18n/cosmicRipMessages.ts)). The Scanner Array remains the section heading, with a separate status beneath it. Scanner restoration mechanics and Cosmic Rip ownership are unchanged.

Static source-to-renderer comparison only. No tests or browser rendering were run; P-44 remains open for the broader source-key catalogue and rendered-locale review.
