# P-44 Interstellar Starship launch warning copy audit

**Date:** 13 October 2026  
**Scope:** the launch confirmation body and the conditional warning for a destination containing a Megastructure.

Cosmic Forge's `../../../../cosmicForge/cosmicForge/ui.js:6563-6565` opens the launch confirmation with `launchStarShipWarningText` and appends `warningMegaStructureSystemHard` when the selected destination appears in `getFactoryStarsArray()`. Factory-system IDs are populated from manuscript data in `../../../../cosmicForge/cosmicForge/game.js:13570-13577`. The six source warning-body values use `launchStarShipWarningText` (`../../../../cosmicForge/cosmicForge/localization.json:126,2749,5372,7995,10618,13241`); the six conditional warning values use `warningMegaStructureSystemHard` (`../../../../cosmicForge/cosmicForge/localization.json:2451,5074,7697,10320,12943,15566`).

MIAPLACIDUS renders the warning in `../../../src/app/StarshipPane.tsx:1373-1392`. `pointOfNoReturn` now tells the player that launch is irreversible and to review Star Data and confirm the destination; the existing destination and fuel summary remain separate. The modal condition `destinationIsFactorySystem` checks whether any permanent manuscript record has the selected `factorySystemId`, the target equivalent of the source factory-star membership check. When true, it shows the separate orange `factorySystemWarning`. The two typed target messages, `pointOfNoReturn` and `factorySystemWarning`, are present in all six locale records in `../../../src/i18n/starshipMessages.ts` at lines 46-48, 222-225, 398-401, 573-576, 754-757, and 930-933.

The change restores source warning content while retaining MIAPLACIDUS's Cancel/Confirm controls and existing launch/travel behavior. Starship remains its own Interstellar destination, separate from Star Data and Fleet Hangar.

This is a static source-to-renderer comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
