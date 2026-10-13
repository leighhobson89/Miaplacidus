# P-44 Galactic Black Hole research help copy audit — 13 October 2026

Cosmic Forge's Black Hole research view renders `blackHoleValueHint` (`drawTab7Content.js:2218-2222`). Its six localized values are recorded in `localization.json:2308, 4931, 7554, 10177, 12800, 15423`.

MIAPLACIDUS binds the `researchHelp` message to the Black Hole research InfoTooltip (`src/app/BlackHolePane.tsx:186-190`). The six target values now match the source wording in `src/i18n/blackHoleMessages.ts:46, 92, 136, 182, 228, 274`. The separate Black Hole child page, research action, and mechanics are unchanged.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
