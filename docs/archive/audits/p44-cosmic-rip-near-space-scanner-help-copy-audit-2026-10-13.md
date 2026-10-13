# P-44 Cosmic Rip scanner help copy audit

**Date:** 13 October 2026  
**Scope:** Near Space Scanner Array help in the Cosmic Rip tab.

Cosmic Forge renders the `Near Space Scanner Array` heading and its info control in `../../../../cosmicForge/cosmicForge/drawTab8Content.js:307-312`. The active description binding in `../../../../cosmicForge/cosmicForge/descriptions.js:530` maps that control to `infoTooltipNearSpaceScannerArrayHeader`. Its six locale values in `../../../../cosmicForge/cosmicForge/localization.json:314,2937,5560,8183,10806,13429` explain scanning local sectors around Miaplacidus to locate the Cosmic Rip, the Galactic Point scan cost, and building science vessels to collect telemetry after locating it.

MIAPLACIDUS renders the help through `../../../src/app/CosmicRipPane.tsx:337-343`, binding `copy.scannerArrayHelp` from `../../../src/i18n/cosmicRipMessages.ts:371,441,517,592,664,740`. The six locale strings now preserve those three source details while retaining the remake's established translated Cosmic Rip names. No placeholders are used. The scanner action, notices, result dialogs, and Cosmic Rip page ownership are unchanged.

This is a static source-to-renderer copy comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
