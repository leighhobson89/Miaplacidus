# P-44 Energy Batteries Buy Max label audit

**Date:** 13 October 2026

**Scope:** the Energy > Batteries bulk-purchase button label in all six locales.

Cosmic Forge creates the Battery rows in [`drawTab2Content.js:29-116`](../../../../cosmicForge/cosmicForge/drawTab2Content.js#L29) and labels their bulk-purchase control with `buttonBuyMax` in [`ui.js:3652`](../../../../cosmicForge/cosmicForge/ui.js#L3652). The source value is `Max` in all six locale blocks of [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json).

MIAPLACIDUS renders the Batteries bulk-purchase button in [`EconomyPanes.tsx:2988`](../../../src/app/EconomyPanes.tsx#L2988). It now uses the dedicated `energyBatteryBuyMax` value from [`economyMessages.ts`](../../../src/i18n/economyMessages.ts) instead of the generic purchase label.

| Locale | Cosmic Forge `buttonBuyMax` | MIAPLACIDUS `energyBatteryBuyMax` |
| --- | --- | --- |
| en | Max | Max |
| es | Max | Max |
| pt | Max | Max |
| de | Max | Max |
| it | Max | Max |
| fr | Max | Max |

The correction is limited to the Battery bulk-purchase label. Purchase behavior and the Energy Summary, Batteries, and Power destination structure are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
