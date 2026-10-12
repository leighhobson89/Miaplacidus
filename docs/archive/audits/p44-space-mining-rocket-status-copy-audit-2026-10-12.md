# P-44 Space Mining Rocket assembly and status copy audit — 12 October 2026

Compared the source Rocket parts counter and visible build/travel states with the Rocket child renderer. Cosmic Forge uses `textBuilt` for the part counter, `textNotBuilt` for an incomplete rocket, `textTravellingShort` for outbound travel, `headerMainMining` for asteroid mining, and `textReturning` for the return leg. The target now uses these labels through `rocketMessages.ts`; the Rocket child remains under Space Mining and player-customized Rocket names are untouched.

| Locale | Parts counter | Incomplete assembly | Outbound | Mining | Returning |
|---|---|---|---|---|---|
| English | `Built:` | `Not Built` | `Travelling` | `Mining` | `Returning` |
| Spanish | `Construido:` | `No construido` | `Viajando` | `Minería` | `Regresando` |
| Portuguese | `Construído:` | `Não construído` | `A viajar` | `Mineração` | `A regressar` |
| German | `Gebaut:` | `Nicht gebaut` | `Unterwegs` | `Bergbau` | `Rückkehr` |
| Italian | `Costruito:` | `Non costruito` | `In viaggio` | `Estrazione` | `In rientro` |
| French | `Construit:` | `Non construit` | `En route` | `Extraction` | `Retour` |

The part counter now follows the source's `Built: n / total` presentation. The source has no corresponding `Parts built` wording there; that target key remains available for the build-action feedback. Existing ready-for-launch, orbit, custom Rocket naming, costs, and mechanics were not changed.

Source evidence: `../../../../cosmicForge/cosmicForge/drawTab6Content.js:791` and `ui.js:8752, 8786, 8795`; the six-locale entries for `textBuilt`, `textNotBuilt`, `headerMainMining`, `textTravellingShort`, and `textReturning` are in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: `src/app/SpaceMiningPane.tsx` and the corresponding six-locale entries in `src/i18n/rocketMessages.ts`.

Static source/catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
