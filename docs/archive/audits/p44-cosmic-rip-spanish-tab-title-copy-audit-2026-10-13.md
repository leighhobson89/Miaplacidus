# P-44 Cosmic Rip Spanish child title copy audit

**Date:** 13 October 2026

Cosmic Forge source key `headerMainCosmicRipTab` in `localization.json` names the tab `Ras Cósmico` in Spanish; the English, Portuguese, German, Italian, and French values match the existing target. `src/app/presentationNavigation.ts:544` binds `copy.ripPaneTitle` to the Cosmic Rip child destination (`option3`).

The Spanish `ripPaneTitle` in `src/i18n/cosmicRipMessages.ts` now uses `Ras Cósmico`, replacing the mismatched `Desgarro Cósmico`. This corrects the navigation label only. Static source/catalogue/navigation comparison; no tests or browser checks were run. P-44 remains open.
