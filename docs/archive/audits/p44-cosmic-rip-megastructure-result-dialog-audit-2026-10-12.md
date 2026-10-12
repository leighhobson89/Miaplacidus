# P-44 Cosmic Rip and Megastructure research-result dialog audit

**Date:** 12 October 2026  
**Scope:** restore source result dialogs for two Cosmic Rip exploration milestones, five Cosmic Rip research timers, and twenty Megastructure research stages while retaining each source notice. Static source, target-catalogue, and renderer review only; P-44 remains open.

## Cosmic Rip exploration results

Cosmic Forge opens `modalNearSpaceScannerArrayRestoredHeader/Text` after the scanner-restored notice, then opens `modalCosmicRipLocatedHeader/Text` two seconds after the sector-found notice (`../../../cosmicForge/cosmicForge/drawTab8Content.js:117-141,463-492`). Both use the localized `buttonConfirm` label. The six source locale blocks preserve the highlighted scanner/Rip name and separate paragraphs (`../../../cosmicForge/cosmicForge/localization.json`).

MIAPLACIDUS keeps each notice and the persistent Scanner Array page status, then queues the matching localized dialog from `cosmicRipEventNotifications.ts`. `cosmicRipMilestoneResultDialogMessages.ts` preserves each source title, body, confirmation label, paragraph break, and green-ready name emphasis. Rip location opens after 2000 ms. Both results follow their one-time engine events and do not replay from initial page state.

## Cosmic Rip research results

Cosmic Forge emits the `notificationTechResearched` info notice for 3000 ms, then opens one confirm-only modal for the completed technology (`../../../cosmicForge/cosmicForge/game.js:11740-11831`). The five key pairs are `modalCosmicRipTech{StabilizerArray,QuantumContainmentField,DimensionalAnchorMatrix,SingularityStabilizer,RealityWeaveRegulator}{Header,Text}`; all six source locale blocks contain distinct narrative copy and cumulative stabilization milestones of 20%, 40%, 60%, 80%, and 100% (`../../../cosmicForge/cosmicForge/localization.json:217-226,2838-2847,5461-5470,8084-8093,10707-10716,13330-13339`). The source uses `buttonConfirmUpper`.

MIAPLACIDUS still sends its localized completion notice from `App.tsx` and now also queues the matching localized result copy from `cosmicRipResearchResultDialogMessages.ts`. Each dialog includes the source milestone narrative and percentage; the last includes the green-ready congratulations. The technology name and percentage use the shared semantic green-ready role. The research cards keep their persistent researched state and stability meter. The five destinations remain under Cosmic Rip, with each result tied to its source technology.

The modal uses the shared queued `RandomEventResultDialog`, which waits for another open modal to close and focuses/restores focus around dismissal. The result dialog is routed from newly researched state, so existing researched technologies do not replay the modal on startup or rebirth. Source notifications remain independent of the result dialog.

## Megastructure stage results

Cosmic Forge's four Megastructure tracks each have five separate research-result dialogs. `../../../cosmicForge/cosmicForge/drawTab3Content.js:1500-2606` opens the stage-specific `modalMegaStructureTech{Track}{1..5}Header/Text` after each successful stage research, while also showing the stage's technology notification. The 20 localized title/body pairs are present in all six source locale blocks; each modal uses the localized `buttonConfirm` label. These results belong to the Galactic > Megastructures child page, not Galactic Market or another Galactic destination.

MIAPLACIDUS keeps its existing technology notice and now also queues a stage-specific result from `megastructureResearchResultMessages.ts` when a new Megastructure technology enters the run's researched list. All 20 source result distinctions are preserved across the six target locales. Source line breaks are presented as readable paragraphs, and source green spans use the shared green-ready tone. Permanent Megastructure research remains saved independently of the result dialog.

## Evidence boundary

Source evidence was read from `../../../cosmicForge/cosmicForge/game.js`, `../../../cosmicForge/cosmicForge/drawTab8Content.js`, `../../../cosmicForge/cosmicForge/drawTab3Content.js`, and `../../../cosmicForge/cosmicForge/localization.json`. Target review covered `src/app/App.tsx`, `src/app/cosmicRipEventNotifications.ts`, `src/app/RandomEventResultDialog.tsx`, `src/app/presentationNavigation.ts`, `src/app/MegastructurePane.tsx`, and the Cosmic Rip and Megastructure result-copy modules under `src/i18n/`. No tests, builds, typechecks, formatters, or browser checks were run. Rendered dialog and six-locale layout review remain open; P-44 remains open.
