# P-44 Cosmic Rip page copy audit

**Date:** 12 October 2026

## Source-to-renderer mapping

Cosmic Forge's `index.html:792` declares the Cosmic Rip top-level tab's `option3` child using `data-option-pane="cosmic rip"` and source key `headerMainCosmicRipTab`. The active target navigation crosswalk maps that source child to `cosmic-rip-rip`, rendered by `CosmicRipPane` after the scanner array is restored and the Rip is located. The source and target therefore retain the Cosmic Rip page as a distinct child page.

The source controls and headings are in `drawTab8Content.js`; the active target renderer reads `cosmicRipText(locale)` in `src/app/CosmicRipPane.tsx`:

| Cosmic Forge source UI/key | MIAPLACIDUS catalogue and renderer |
| --- | --- |
| `headerMainCosmicRipTab` (`index.html:792`) | `title` and `ripPaneTitle`; page heading and child label (`CosmicRipPane.tsx:204`; `App.tsx` child entry) |
| `buttonRestore` (`drawTab8Content.js:115`) | `restoreScanner` (`CosmicRipPane.tsx:289`) |
| `buttonCloseCosmicRip` (`drawTab8Content.js:244`) | `closeRip` (`CosmicRipPane.tsx:313`) |
| `tab8SensorBuoyRowLabel` and `tab8RipResearchOrbiterRowLabel` (`drawTab8Content.js:561-606`) | `upgradeNames.sensorBuoy` and `upgradeNames.ripResearchOrbiter`; each keeps its own upgrade row |
| `buttonDeploy` (`drawTab8Content.js:564, 606`) | `purchase` for the separate Sensor Buoy and Rip Research Orbiter actions (`CosmicRipPane.tsx:444`) |
| `cosmicRipTechNameStabilizerArray`, `cosmicRipTechNameQuantumContainmentField`, `cosmicRipTechNameDimensionalAnchorMatrix`, `cosmicRipTechNameSingularityStabilizer`, `cosmicRipTechNameRealityWeaveRegulator` | `technologyNames` for the five separate technology rows (`drawTab8Content.js:902-1074`; `CosmicRipPane.tsx:523-526`) |

The typed catalogue in `src/i18n/cosmicRipMessages.ts` now follows the source localized page labels, action labels, upgrade names, and technology names across `en`, `es`, `pt`, `de`, `it`, and `fr`, correcting the mismatched wording and capitalization found in those fields. The target's page and row layout remains intact; its headings do not include source trailing colons.

The child/source mapping is also recorded in the [presentation navigation contract](../../plans/presentation-navigation-contract.md). This copy slice does not change scanner gates, research or deployment behavior, result dialogs, notices, ending presentation, or navigation ownership.

Static source-to-renderer review only. No tests, builds, typechecks, formatting, or browser checks were run; P-44 remains open for the remaining catalogue and rendered-locale evidence.
