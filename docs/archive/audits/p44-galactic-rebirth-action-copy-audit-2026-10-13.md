# P-44 Galactic Rebirth action copy audit

**Date:** 13 October 2026

**Scope:** the Rebirth action button in all six locales.

Cosmic Forge renders localized `buttonRebirth` text for the Rebirth action in [`drawTab7Content.js:133`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L133). Its values in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json) are uppercase.

MIAPLACIDUS renders `rebirthAction` on the action button in [`AscendencyPane.tsx:130`](../../../src/app/AscendencyPane.tsx#L130). The six `rebirthAction` values in [`metaMessages.ts`](../../../src/i18n/metaMessages.ts) now match `buttonRebirth`.

| Locale | Cosmic Forge `buttonRebirth` | MIAPLACIDUS `rebirthAction` |
| --- | --- | --- |
| en | REBIRTH | REBIRTH |
| es | RENACER | RENACER |
| pt | RENASCER | RENASCER |
| de | WIEDERGEBURT | WIEDERGEBURT |
| it | RINASCI | RINASCI |
| fr | RENAÎTRE | RENAÎTRE |

The navigation tab title remains a separate source-mapped label (`rebirthTabLabel`); this change applies to the action button only. Galactic child ownership, gating, and rebirth behavior are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
