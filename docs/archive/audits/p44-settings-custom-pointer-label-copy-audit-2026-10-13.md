# P-44 Settings Custom Pointer label audit

**Date:** 13 October 2026  
**Scope:** the Custom Pointer toggle label in Settings > Game Options.

Cosmic Forge renders the row through `createOptionRow` in `../../../../cosmicForge/cosmicForge/drawTab9Content.js:258-263`, binding its visible label to `tab9CustomPointerRowLabel`. The six source labels are `Custom Pointer:`, `Puntero Personalizado:`, `Ponteiro Personalizado:`, `Eigener Mauszeiger:`, `Puntatore Personalizzato:`, and `Curseur Personnalisé:` (`../../../../cosmicForge/cosmicForge/localization.json:1726,4349,6972,9595,12218,14841`).

MIAPLACIDUS binds the toggle caption in `../../../src/app/SettingsPane.tsx:363` to `settingsText(locale, "customPointer")`. The six typed values in `../../../src/i18n/settingsMessages.ts:104,169,234,299,364,429` now include the source colon and match the source labels. The toggle behavior and six Settings destinations are unchanged.

This is a static source-to-renderer copy comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
