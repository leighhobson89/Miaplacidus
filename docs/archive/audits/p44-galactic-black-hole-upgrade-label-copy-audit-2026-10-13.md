# P-44 Galactic Black Hole upgrade-button labels audit

**Date:** 13 October 2026

**Scope:** the Power, Duration, and Recharge Black Hole upgrade-button labels in all six locales.

Cosmic Forge renders `buttonBlackHolePower`, `buttonBlackHoleDuration`, and `buttonBlackHoleRecharge` in [`drawTab7Content.js:2030`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L2030), [`drawTab7Content.js:2053`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L2053), and [`drawTab7Content.js:2080`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L2080). MIAPLACIDUS renders the corresponding `upgradeNames` in [`BlackHolePane.tsx:287`](../../../src/app/BlackHolePane.tsx#L287). Those labels in [`blackHoleMessages.ts`](../../../src/i18n/blackHoleMessages.ts) now use the source wording without the target's former `Upgrade`/`Mejorar` verb prefix.

| Locale | Power | Duration | Recharge |
| --- | --- | --- | --- |
| en | Power | Duration | Recharge |
| es | Potencia | Duración | Recarga |
| pt | Potência | Duração | Recarga |
| de | Leistung | Dauer | Aufladen |
| it | Potenza | Durata | Ricarica |
| fr | Puissance | Durée | Recharge |

The update changes button copy only. The Black Hole remains a separate Galactic child; upgrade costs, gates, and effects are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
