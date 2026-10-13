# P-44 Space Mining Launch Pad Rocket Miner label audit

**Date:** 13 October 2026

**Scope:** the four Rocket Miner labels on the Launch Pad's rocket assembly cards, across all six locales.

Cosmic Forge constructs four Launch Pad build rows from `rocketMinerName1..4` and appends a colon ([`drawTab6Content.js:721-747`](../../../../cosmicForge/cosmicForge/drawTab6Content.js)); the localized names are [`localization.json:1832-1835`](../../../../cosmicForge/cosmicForge/localization.json#L1832), [`4455-4458`](../../../../cosmicForge/cosmicForge/localization.json#L4455), [`7078-7081`](../../../../cosmicForge/cosmicForge/localization.json#L7078), [`9701-9704`](../../../../cosmicForge/cosmicForge/localization.json#L9701), [`12324-12327`](../../../../cosmicForge/cosmicForge/localization.json#L12324), and [`14947-14950`](../../../../cosmicForge/cosmicForge/localization.json#L14947). MIAPLACIDUS now uses localized `rocketMinerLabel` on default-named assembly cards and adds the source colon in [`SpaceMiningPane.tsx:154-174`](../../../src/app/SpaceMiningPane.tsx), with values in [`rocketMessages.ts`](../../../src/i18n/rocketMessages.ts).

| Locale | Cosmic Forge `rocketMinerName` | MIAPLACIDUS `rocketMinerLabel` |
| --- | --- | --- |
| en | Rocket Miner {index} | Rocket Miner {index} |
| es | Minero Cohete {index} | Minero Cohete {index} |
| pt | Mineiro Foguete {index} | Mineiro Foguete {index} |
| de | Raketenschürfer {index} | Raketenschürfer {index} |
| it | Razzo Minerario {index} | Razzo Minerario {index} |
| fr | Fusée Minière {index} | Fusée Minière {index} |

Custom rocket names retain their entered name; completed Rocket child headings continue to use their existing Rocket labels. The child destinations, build rows, and mechanics are unchanged.

Static source-catalogue and renderer comparison only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
