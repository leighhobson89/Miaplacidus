# P-44 Research and Energy copy ownership audit

Audited Cosmic Forge's `descriptions.js` header registry and six-locale
`localization.json` entries for Research, Energy, Batteries, and Power against
MIAPLACIDUS's typed `economyMessages.ts` catalogs and current renderers.

| Cosmic Forge source key | MIAPLACIDUS message key | Rendered owner |
| --- | --- | --- |
| `headerDescResearch` | `researchOverviewHelp` | Research main navigation tab's localized `title` and `aria-description` in `App.tsx` (`GAME_TABS`). |
| `headerDescResearch` | `researchSectionHelp` | Accessible tooltip beside the `Research` page title when Science Buildings is selected in `EconomyPanes.tsx`. The title is the Research section, so this broad description is correctly attached here; it is not the Science Buildings intro. |
| `headerDescResearchUpgrades` | `scienceBuildingsHelp` | Visible intro paragraph below the `Science buildings` subheading in Research > Science Buildings (`EconomyPanes.tsx`). |
| `headerDescTechnology` + `headerDescTechTree` | `technologyTreePanHelp` | Descriptive help for the consolidated Tech Tree viewport in `EconomyPanes.tsx`; source text is combined in source order with target-specific keyboard-pan guidance. |
| `headerDescEnergy` | `energyOverviewHelp` | Energy main navigation tab's localized `title` and `aria-description` in `App.tsx` (`GAME_TABS`). |
| `headerDescEnergy` | `energyPowerHelp` | Visible intro for Energy > Power in `EconomyPanes.tsx`, where generator upgrades are managed. |
| `headerDescEnergyStorage` | `batteryStorageHelp` | Visible intro for Energy > Batteries in `EconomyPanes.tsx`; the exact source guidance is followed by the remake-specific surplus-storage explanation. |
| `headerDescPowerPlant` | `powerPlantSupplyHelp` | Visible description on the Power Plant card (`powerPlant1`) in `EconomyPanes.tsx`. |
| `headerDescSolarPowerPlant` | `solarPowerPlantRenewable` | Visible description on the Solar Power Plant card (`powerPlant2`) in `EconomyPanes.tsx`. |
| `headerDescAdvancedPowerPlant` | `advancedPowerPlantHelp` | Visible description on the Advanced Power Plant card (`powerPlant3`) in `EconomyPanes.tsx`. |

## Findings

- These message keys are present in all six target locale records (`en`, `es`,
  `pt`, `de`, `it`, and `fr`). The source header descriptions are also present
  in all six Cosmic Forge locale records.
- Cosmic Forge's `descriptions.js` registers the corresponding source labels as
  `Research`, `Energy`, `energy storage`, `power plant`, `advanced power plant`,
  `solar power plant`, `research`, `technology`, and `tech tree`; source UI
  descriptions are retrieved through `getHeaderDescriptions` in `ui.js`.
- No matching Cosmic Forge `infoTooltip*` localization keys were found for
  these Research/Energy/Battery/Power groups. The remake's power-plant
  `InfoTooltip` controls use target-specific `powerPlant1Help` through
  `powerPlant3Help` copy alongside the source-mapped visible card descriptions.
- Energy Summary is a remake-only summary/chart surface: it has no corresponding
  Cosmic Forge header-description key. Its lack of a separate source intro is
  not a missing mapping.
- The current mappings are correctly owned and localized; this audit found no
  source-proven copy or destination defect to change. No code was changed.

Evidence paths: `../../../cosmicForge/cosmicForge/descriptions.js`,
`../../../cosmicForge/cosmicForge/localization.json`,
`../../../cosmicForge/cosmicForge/ui.js`, `src/i18n/economyMessages.ts`,
`src/app/App.tsx`, and `src/app/EconomyPanes.tsx`.
