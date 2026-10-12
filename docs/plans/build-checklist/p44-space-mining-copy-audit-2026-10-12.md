# P-44 Space Mining visible-copy audit (12 October 2026)

Compared the actual Cosmic Forge Rocket renderer and locale entries with the current MIAPLACIDUS Rocket page renderer.

- Cosmic Forge renders the build action in Space Mining's Rocket pages through `localize('buttonBuildRocketPart', getLanguage())` (`cosmicForge/cosmicForge/drawTab6Content.js:753`). In `en/es/pt/de/it/fr` order, the source locale values are `Build Rocket Part`, `Construir Pieza de Cohete`, `Construir Peça de Foguete`, `Raketenteil Bauen`, `Costruisci Pezzo di Razzo`, and `Construire une Pièce de Fusée` (`cosmicForge/cosmicForge/localization.json:1836,4459,7082,9705,12328,14951`). The message has no placeholders.
- MIAPLACIDUS keeps each built Rocket as a child page under Space Mining (`src/app/presentationNavigation.ts:454-513`); the action is owned by those Rocket page controls. `SpaceMiningPane.tsx:284` renders it through `rocketMessages.buildPart`.
- The prior target wording (“Build one part” and localized equivalents) omitted the source object. Updated the existing `buildPart` string in all six locales to the source wording above. This is a label-only correction; the action and page routing are unchanged.

This was a static source-renderer and locale comparison. Existing English Rocket button selectors and test guidance were updated to the corrected label but not exercised. No tests, builds, or browser checks were run, and no files in the read-only Cosmic Forge source checkout were edited. P-44 remains open for the wider source catalogue, copy, and rendered-locale review.
