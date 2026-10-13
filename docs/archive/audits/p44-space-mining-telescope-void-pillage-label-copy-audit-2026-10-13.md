# P-44 Space Mining Telescope Void Pillage option copy audit — 13 October 2026

Cosmic Forge adds the `pillageVoid` automation mode when its Voidborn ability gate is active and labels the option with `dropdownTelescopePillageVoid` ([`drawTab6Content.js:187-190`](../../../../cosmicForge/cosmicForge/drawTab6Content.js#L187); a second source control uses the same key at `:459-463`). The six source values are `Pillage The Void`, `Saquear el Vacío`, `Saquear o Vazio`, `Die Leere Plündern`, `Saccheggia il Vuoto`, and `Piller le Vide` (`localization.json:1821, 4444, 7067, 9690, 12313, 14936`).

MIAPLACIDUS shows the corresponding gated `<option value="pillageVoid">` in the Telescope automation selector through `spaceText(locale, "autoPillageVoid")` ([`SpaceMiningPane.tsx:964-967`](../../../src/app/SpaceMiningPane.tsx#L964); [`spaceMessages.ts`](../../../src/i18n/spaceMessages.ts)). Its six labels now match the source wording and capitalization. The gate and automation behavior are unchanged.

Static source-to-renderer comparison only. No tests or browser rendering were run; P-44 remains open for the broader source-key catalogue and rendered-locale review.
