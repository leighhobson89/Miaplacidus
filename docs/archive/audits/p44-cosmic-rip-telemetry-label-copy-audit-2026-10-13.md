# P-44 Cosmic Rip telemetry label copy audit

**Date:** 13 October 2026

**Scope:** the Cosmic Rip telemetry resource label in all six locales.

Cosmic Forge uses `textTelemetryData` in its Cosmic Rip technology cost descriptions, for example in [`drawTab8Content.js:923`](../../../../cosmicForge/cosmicForge/drawTab8Content.js#L923). The localized source values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json).

MIAPLACIDUS displays `copy.telemetry` with the current telemetry balance at [`CosmicRipPane.tsx:225`](../../../src/app/CosmicRipPane.tsx#L225) and in technology-cost rows at [`CosmicRipPane.tsx:533`](../../../src/app/CosmicRipPane.tsx#L533). The six `telemetry` catalogue values in [`cosmicRipMessages.ts`](../../../src/i18n/cosmicRipMessages.ts) now match `textTelemetryData`.

| Locale | Cosmic Forge `textTelemetryData` | MIAPLACIDUS `telemetry` |
| --- | --- | --- |
| en | Telemetry Data | Telemetry Data |
| es | Datos de Telemetría | Datos de Telemetría |
| pt | Dados de Telemetria | Dados de Telemetria |
| de | Telemetriedaten | Telemetriedaten |
| it | Dati di Telemetria | Dati di Telemetria |
| fr | Données de Télémétrie | Données de Télémétrie |

This is a copy-only correction. Cosmic Rip page ownership and telemetry balances, costs, and research behavior are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
