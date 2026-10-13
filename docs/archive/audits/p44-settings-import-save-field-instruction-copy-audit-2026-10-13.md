# P-44 Settings Import Save field-instruction copy audit

**Date:** 13 October 2026  
**Scope:** Six-locale copy and target field association for the Settings > Save & Loading import textarea.

## Source mapping

Cosmic Forge `drawTab9Content.js:672–675` creates the Import Save textarea with `placeholderImportSaveArea`. The six source values in `localization.json:1763, 4386, 7009, 9632, 12255, 14878` instruct the player to paste saved game data.

## Remake mapping

MIAPLACIDUS associates `saveText("importText")` with the import textarea as its visible label in `src/app/SaveManager.tsx:427–435`. The six catalogue values in `src/i18n/saveMessages.ts:128, 221, 321, 421, 523, 623` now use the matching source instruction. The remake presents it as a persistent label rather than source placeholder text, keeping the instruction visible after the field has content.

Import preview and save behavior are unchanged, and Save & Loading remains within the owner-directed Settings structure. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
