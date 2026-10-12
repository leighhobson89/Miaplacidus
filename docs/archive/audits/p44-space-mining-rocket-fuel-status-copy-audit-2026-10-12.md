# P-44 Space Mining Rocket fuel-status copy audit

**Date:** 12 October 2026  
**Scope:** Ready-rocket status shown on the Rocket child page. Cosmic Forge was read only.

Cosmic Forge's visible Rocket status logic distinguishes three fuel states using `textReadyForRefuel`, `textFuellingShort`, and `textReadyForLaunchShort` (`ui.js:8812-8831`). The source values are present in all six locale blocks (`localization.json:2512-2513,2592; 5135-5136,5215; 7758-7759,7838; 10381-10382,10461; 13004-13005,13084; 15627-15628,15707`).

MIAPLACIDUS now derives its ready-rocket status from the existing fuel quantity, fuel capacity, and pump-enabled state in `SpaceMiningPane.tsx:136-150`. The localized `rocketMessages` keys are used for the Rocket status pill and its accessible label. The six source-matched label triples are:

| Locale | Ready for refuel | Fuelling | Ready for launch |
|---|---|---|---|
| en | `Ready For Refuel` | `Fuelling` | `Ready For Launch` |
| es | `Listo para repostar` | `Repostando` | `Listo para el lanzamiento` |
| pt | `Pronto para abastecer` | `A abastecer` | `Pronto para o lançamento` |
| de | `Bereit zum Betanken` | `Betankung` | `Startbereit` |
| it | `Pronto per il rifornimento` | `Rifornimento` | `Pronto al lancio` |
| fr | `Prêt au ravitaillement` | `Ravitaillement` | `Prêt au lancement` |

This corrects the target's prior single “Ready” label for all completed rockets on the pad. No simulation state or pump behavior changed. The launch button, build-part button, and remake-specific pump purchase/pause controls remain separate. Galactic ownership and Rocket child routing are unchanged.

Static source, catalogue, and renderer comparison only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for the broader source catalogue and rendered-locale acceptance evidence.
