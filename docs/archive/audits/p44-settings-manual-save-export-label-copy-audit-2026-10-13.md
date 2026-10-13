# P-44 Settings manual-save export label copy audit — 13 October 2026

Cosmic Forge labels the manual save-file action with `buttonManualSave` in [`drawTab9Content.js`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L645). The six source values are `Manual Save`, `Guardado Manual`, `Guardar Manualmente`, `Manuell Speichern`, `Salvataggio Manuale`, and `Sauvegarde Manuelle` (`localization.json:1761, 4384, 7007, 9630, 12253, 14876`).

MIAPLACIDUS binds the Save Manager's download button to `t("download")` (`src/app/SaveManager.tsx:392-393`), with the six values now matching the source (`src/i18n/saveMessages.ts:126, 219, 319, 419, 521, 621`). The action still downloads the same local `.txt` save file; this label does not add cloud saving or change save behavior.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
