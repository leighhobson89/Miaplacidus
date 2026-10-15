# Research browser coverage

Research-only browser cases live here. Use visible Research controls for
building purchases, generated Research Points, and technology unlock behavior.
Shared deterministic setup for early Research and Energy fixtures lives in
[`_harness/economyNarrowContext.ts`](../_harness/economyNarrowContext.ts).

The area now covers Research buildings, Tech Tree prerequisites and purchases,
Philosophy identity/help, responsive cost context, and locale/theme presentation.
Installed Chrome passed the complete area **12/12 in 3.8 minutes** on 14
October 2026 (port 6441), with snapshot updates disabled. The Tech Tree renderer
measures its graph asynchronously; visual specs wait for fonts and stable graph
bounds before capture. The focused P-65 visual case passed 1/1 after adding that
wait, and the complete area passed without changing its baselines.

- `p13-research-narrow-context.spec.ts` checks live balances, the Science Kit
  price and purchase, Research Point production, and overflow at 390px and
  320px.

- `economy-research.spec.ts` covers fresh progression, research demand,
  prerequisite gates, purchase outcomes, and the active Research panel.
- `technology.spec.ts` covers atomic technology purchase, affordable
  prerequisite reveal, graph navigation, zoom, and dependency edges.
- `research-presentation-matrix.spec.ts` covers Research, Tech Tree, and
  Philosophy identity and layout across all locales, themes, and three widths.

Run this area with:

```powershell
npm.cmd run test:e2e:area -- research
```

The narrow-context check shares presentation setup with Energy but asserts only
Research behavior. Earlier follow-up notes about missing building-demand,
prerequisite, and unlock coverage are superseded by the cases listed above.

## P-13 Science Kit context (14 October 2026)

The focused case checks the visible Science Kit cost, purchases through the
Research pane, verifies Research Point production after advancing the fixture,
and checks balances/layout at 390px and 320px. Its two original screenshots
were moved unchanged from the former mixed Research/Energy spec. Installed
Chrome passed **1/1 in 5.9s** on port 6530 with no snapshot update:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6530'
npm.cmd run test:e2e:focused -- tests/e2e/research/p13-research-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-44 Philosophy help and P-65 Research visual review (14 October 2026)

The relocated P-44 case checks Philosophy names, summaries, ability text, and repeatable upgrades in all six locales at 320px. The P-65 case captures Science Buildings, Tech Tree, and Expansionist Philosophy at desktop and phone widths across the reviewed theme/locale samples; its six screenshot baselines moved unchanged into this area. The two moved cases passed **2/2 in 11.7s** in installed Chrome on port 6571 with snapshot updates disabled. No product or assertion changes were needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6571'
$testOutput = Join-Path $env:TEMP 'miaplacidus-research-move-20261014'
npm.cmd run test:e2e:focused -- tests/e2e/research/p44-research-philosophy-help.spec.ts tests/e2e/research/p65-research-visual-review.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$testOutput"
```

P-65's six checked-in images are under `p65-research-visual-review.spec.ts-snapshots/`. Their contents were moved without refresh; the focused run confirmed them at the new path.

## Tech Tree capture stabilization (14 October 2026)

The P-65 locale/theme capture initially saw the Tech Tree viewport before its
`ResizeObserver` layout had settled, producing a taller blank graph viewport.
The visual output stabilized when the test waited for loaded fonts and two
animation frames with unchanged nonzero graph bounds. The shared
[`technologyTree.ts`](../_harness/technologyTree.ts) helper now guards the
Tech Tree screenshots in both Research and Technology specs. Installed Chrome
passed the focused P-65 case 1/1 on port 6440 and then all Research cases 12/12
on port 6441; no snapshot update was required.

## Economy catchall migration (14 October 2026)
Research-owned cases from the retired Economy catchall now live in [`economy-research.spec.ts`](economy-research.spec.ts), [`p05-research-energy-actions.spec.ts`](p05-research-energy-actions.spec.ts), [`p45-research-copy.spec.ts`](p45-research-copy.spec.ts), [`p51-research-energy-narrow-visual.spec.ts`](p51-research-energy-narrow-visual.spec.ts), and [`research-presentation-matrix.spec.ts`](research-presentation-matrix.spec.ts).

## Phase 7 selected-locale Research result (AUTHORED; NOT RUN)

[`p7-research-notification-locales.spec.ts`](p7-research-notification-locales.spec.ts)
researches Knowledge Sharing through the standard Research tab's Science
Buildings and Tech Tree child pages, then checks the dynamic result notification
in all six selected locales. This preserves the separate Research and Tech Tree
destinations. The source string is Cosmic Forge's `techNotifyKnowledgeSharing`
key, assembled in `descriptions.js` and emitted for the `knowledgeSharing` node
by `drawTab3Content.js`. MIAPLACIDUS routes the standard economy research event
through `App.tsx` using `technologyNotificationText(snapshot.locale, id, name)`;
the localized result values live under the `knowledgeSharing` key in
`src/i18n/technologyNotificationMessages.ts`.
After checking the notification, the spec acknowledges the separately routed
first-run Knowledge Sharing result dialog so later locale iterations start with
an unobstructed page.

This is authored coverage for Phase 8 V-59 and has **NOT RUN**. Existing
`p45-research-copy.spec.ts` checks the localized Tech Tree status in six locales;
the new case covers the dynamic completion notification that was previously
asserted only in English.

## Phase 7 Research and Tech Tree copy audit (15 October 2026; static, NOT RUN)

Compared Cosmic Forge `index.html`, `drawTab3Content.js`, and
`descriptions.js` with the active MIAPLACIDUS Research renderer. The source
Research option uses `headerMainResearch` and `headerDescResearchUpgrades`; its
Science Kit/Club/Lab and AutoBuyer action copy comes from
`tab3ScienceKitRowLabel`, `tab3ScienceClubRowLabel`,
`tab3ScienceLabRowLabel`, and `tab3ResearchAutoBuyerRowLabel`. MIAPLACIDUS
renders those actions in `EconomyPanes.tsx` with `researchActionHelp()` and
the `researchSectionHelp`/`scienceBuildingsHelp` economy messages.

Cosmic Forge's separate Technology and Tech Tree options use
`headerMainTechnology`/`headerDescTechnology` and
`headerMainTechTree`/`headerDescTechTree`; the Tech Tree page also localizes
technology names through the `techName*` keys. The active destination is the
`research-tech-tree` route rendered by `EconomyPanes.tsx`: it uses
`technologyTree` and `technologyTreePanHelp`, with node names and descriptions
from `TECHNOLOGY_NAMES` and `TECHNOLOGY_DESCRIPTIONS`. Existing route mapping
and presentation coverage keeps the Research child (`option1`) separate from
the Tech Tree child (`option2,option3`). The Knowledge Sharing completion key
`techNotifyKnowledgeSharing` is rendered through `App.tsx` and
`technologyNotificationMessages.ts`.

Static review found nonempty target values for the Research action/help,
Tech Tree label/help, technology name/description, and Knowledge Sharing
notification catalogs in all six selected locales (`en`, `es`, `pt`, `de`,
`it`, `fr`). The catalogs are keyed by the same six `LOCALE_IDS`; no missing
value or selected-locale routing defect was identified, so no application
change was required in that static review. Existing `research-presentation-matrix.spec.ts`
and `p45-research-copy.spec.ts` cover the selected-locale Research/Tech Tree
routes and visible copy; `p7-research-notification-locales.spec.ts` adds
selected-locale notification coverage. This static audit and all listed
Phase 7 coverage remain **NOT RUN** in this task.

## Phase 7 Research source-row copy follow-up (15 October 2026; NOT RUN)

Extended `p45-research-copy.spec.ts` to check the visible Science Buildings
heading and description plus the Science Kit, Science Club, and Science Lab
row labels in all six selected locales. Cosmic Forge's `headerDescResearchUpgrades`
maps to the target `economyLabel(locale, "scienceBuildingsHelp")`. Its
`tab3ScienceKitRowLabel`, `tab3ScienceClubRowLabel`, and
`tab3ScienceLabRowLabel` map to `ECONOMY_BUILDING_NAMES.scienceKit`,
`scienceClub`, and `scienceLab` in `EconomyPanes.tsx`. The test checks that each
target label is non-empty before comparing the rendered card heading.

The source's `tab3ResearchAutoBuyerRowLabel` is added to a row that
`drawTab3Content.js` initially marks invisible; `game.js` reveals it when the
autobuyer becomes active. MIAPLACIDUS maps this row to
`economyLabel(locale, "researchAutobuyer")` in `economyMessages.ts` and renders
it as the checkbox label in `EconomyPanes.tsx`. The `research` fixture supplies
the permanent `roboticResearchAutomation` perk, so the six-locale assertion
checks the real unlocked control: the perk is present, the localized target
copy is non-empty, and the visible, enabled checkbox has that exact accessible
name. The disabled-until-unlocked presentation remains covered by the separate
unlock-help route.

The Research route remains `option1` (`headerMainResearch`) and the separate
Tech Tree route receives source options `option2` and `option3`
(`headerMainTechnology` and `headerMainTechTree`). Philosophy remains its own
`option4` route. `research-presentation-matrix.spec.ts` checks those selected
routes and labels across all locales; `p7-research-notification-locales.spec.ts`
covers the Knowledge Sharing completion notice. The target locale values and
routing were present, so no application or catalogue correction was needed.
The source's Technology list and visual Tech Tree are combined in the single
owner-directed `research-tech-tree` target page; there is no standalone target
Technology route. The Science row and Research AutoBuyer source-key assertions
are **AUTHORED; NOT RUN** for Phase 8. Prior P-45 execution evidence predates
these assertions.

## Phase 7 standard Tech Tree node copy (15 October 2026; AUTHORED, NOT RUN)

[`p7-technology-node-copy-locales.spec.ts`](p7-technology-node-copy-locales.spec.ts)
checks each standard Technology node name and description in all six locales on
the distinct `research-tech-tree` route. It exposes all standard nodes with the
existing `grant-all-techs` test scenario, then compares rendered headings and
tooltip descriptions with the target locale catalogues. Values must be present
for `en`, `es`, `pt`, `de`, `it`, and `fr`. The test deliberately excludes the
20 Megastructure research stages; their source rows and target presentation
belong to the separate Megastructures destination.

| Source visible key in Cosmic Forge | MIAPLACIDUS target field | Route/render location |
| --- | --- | --- |
| `techNameKnowledgeSharing` | `TECHNOLOGY_NAMES.knowledgeSharing[locale]` | `research-tech-tree` → `[data-technology-id="knowledgeSharing"] .technology-map-node-heading strong` |
| `techNameFusionTheory` | `TECHNOLOGY_NAMES.fusionTheory[locale]` | `research-tech-tree` → Fusion Theory node heading |
| `techNameHydrogenFusion` | `TECHNOLOGY_NAMES.hydrogenFusion[locale]` | `research-tech-tree` → Hydrogen Fusion node heading |
| `techNameHeliumFusion` | `TECHNOLOGY_NAMES.heliumFusion[locale]` | `research-tech-tree` → Helium Fusion node heading |
| `techNameCarbonFusion` | `TECHNOLOGY_NAMES.carbonFusion[locale]` | `research-tech-tree` → Carbon Fusion node heading |
| `techNameBasicPowerGeneration` | `TECHNOLOGY_NAMES.basicPowerGeneration[locale]` | `research-tech-tree` → Basic Power Generation node heading |
| `techNameSodiumIonPowerStorage` | `TECHNOLOGY_NAMES.sodiumIonPowerStorage[locale]` | `research-tech-tree` → Sodium Ion Power Storage node heading |
| `techNameSolarPowerGeneration` | `TECHNOLOGY_NAMES.solarPowerGeneration[locale]` | `research-tech-tree` → Solar Power Generation node heading |
| `techNameGiganticTurbines` | `TECHNOLOGY_NAMES.giganticTurbines[locale]` | `research-tech-tree` → Gigantic Turbines node heading |
| `techNameAdvancedPowerGeneration` | `TECHNOLOGY_NAMES.advancedPowerGeneration[locale]` | `research-tech-tree` → Advanced Power Generation node heading |
| `techNameRocketComposites` | `TECHNOLOGY_NAMES.rocketComposites[locale]` | `research-tech-tree` → Rocket Composites node heading |
| `techNameAdvancedFuels` | `TECHNOLOGY_NAMES.advancedFuels[locale]` | `research-tech-tree` → Advanced Fuels node heading |
| `techNamePlanetaryNavigation` | `TECHNOLOGY_NAMES.planetaryNavigation[locale]` | `research-tech-tree` → Planetary Navigation node heading |
| `techNameNeonFusion` | `TECHNOLOGY_NAMES.neonFusion[locale]` | `research-tech-tree` → Neon Fusion node heading |
| `techNameOxygenFusion` | `TECHNOLOGY_NAMES.oxygenFusion[locale]` | `research-tech-tree` → Oxygen Fusion node heading |
| `techNameCompounds` | `TECHNOLOGY_NAMES.compounds[locale]` | `research-tech-tree` → Compounds node heading |
| `techNameSiliconFusion` | `TECHNOLOGY_NAMES.siliconFusion[locale]` | `research-tech-tree` → Silicon Fusion node heading |
| `techNameAggregateMixing` | `TECHNOLOGY_NAMES.aggregateMixing[locale]` | `research-tech-tree` → Aggregate Mixing node heading |
| `techNameSteelFoundries` | `TECHNOLOGY_NAMES.steelFoundries[locale]` | `research-tech-tree` → Steel Foundries node heading |
| `techNameNanoTubeTechnology` | `TECHNOLOGY_NAMES.nanoTubeTechnology[locale]` | `research-tech-tree` → Nano Tube Technology node heading |
| `techNameHydroCarbons` | `TECHNOLOGY_NAMES.hydroCarbons[locale]` | `research-tech-tree` → HydroCarbons node heading |
| `techNameStellarCartography` | `TECHNOLOGY_NAMES.stellarCartography[locale]` | `research-tech-tree` → Stellar Cartography node heading |
| `techNameQuantumComputing` | `TECHNOLOGY_NAMES.quantumComputing[locale]` | `research-tech-tree` → Quantum Computing node heading |
| `techNameScienceLaboratories` | `TECHNOLOGY_NAMES.scienceLaboratories[locale]` | `research-tech-tree` → Science Laboratories node heading |
| `techNameNobleGasCollection` | `TECHNOLOGY_NAMES.nobleGasCollection[locale]` | `research-tech-tree` → Noble Gas Collection node heading |
| `techNameNeutronCapture` | `TECHNOLOGY_NAMES.neutronCapture[locale]` | `research-tech-tree` → Neutron Capture node heading |
| `techNameGlassManufacture` | `TECHNOLOGY_NAMES.glassManufacture[locale]` | `research-tech-tree` → Glass Manufacture node heading |
| `techNameAtmosphericTelescopes` | `TECHNOLOGY_NAMES.atmosphericTelescopes[locale]` | `research-tech-tree` → Atmospheric Telescopes node heading |
| `techNameFusionEfficiencyI` | `TECHNOLOGY_NAMES.fusionEfficiencyI[locale]` | `research-tech-tree` → Fusion Efficiency I node heading |
| `techNameFusionEfficiencyII` | `TECHNOLOGY_NAMES.fusionEfficiencyII[locale]` | `research-tech-tree` → Fusion Efficiency II node heading |
| `techNameFusionEfficiencyIII` | `TECHNOLOGY_NAMES.fusionEfficiencyIII[locale]` | `research-tech-tree` → Fusion Efficiency III node heading |
| `techNameOrbitalConstruction` | `TECHNOLOGY_NAMES.orbitalConstruction[locale]` | `research-tech-tree` → Orbital Construction node heading |
| `techNameAntimatterEngines` | `TECHNOLOGY_NAMES.antimatterEngines[locale]` | `research-tech-tree` → Antimatter Engines node heading |
| `techNameFTLTravelTheory` | `TECHNOLOGY_NAMES.FTLTravelTheory[locale]` | `research-tech-tree` → FTL Travel Theory node heading |
| `techNameLifeSupportSystems` | `TECHNOLOGY_NAMES.lifeSupportSystems[locale]` | `research-tech-tree` → Life Support Systems node heading |
| `techNameStarshipFleets` | `TECHNOLOGY_NAMES.starshipFleets[locale]` | `research-tech-tree` → Starship Fleets node heading |
| `techNameStellarScanners` | `TECHNOLOGY_NAMES.stellarScanners[locale]` | `research-tech-tree` → Stellar Scanners node heading |

The exact source description key and destination catalogue field for each
standard technology are:

| Technology ID | Source `descriptions.js` content2 key | Destination field |
| --- | --- | --- |
| `knowledgeSharing` | `optionDescTechKnowledgeSharingContent2` | `TECHNOLOGY_DESCRIPTIONS.knowledgeSharing[locale]` |
| `fusionTheory` | `optionDescTechFusionTheoryContent2` | `TECHNOLOGY_DESCRIPTIONS.fusionTheory[locale]` |
| `hydrogenFusion` | `optionDescTechHydrogenFusionContent2` | `TECHNOLOGY_DESCRIPTIONS.hydrogenFusion[locale]` |
| `heliumFusion` | `optionDescTechHeliumFusionContent2` | `TECHNOLOGY_DESCRIPTIONS.heliumFusion[locale]` |
| `carbonFusion` | `optionDescTechCarbonFusionContent2` | `TECHNOLOGY_DESCRIPTIONS.carbonFusion[locale]` |
| `basicPowerGeneration` | `techBasicPowerGenerationContent2` | `TECHNOLOGY_DESCRIPTIONS.basicPowerGeneration[locale]` |
| `sodiumIonPowerStorage` | `techSodiumIonPowerStorageContent2` | `TECHNOLOGY_DESCRIPTIONS.sodiumIonPowerStorage[locale]` |
| `solarPowerGeneration` | `techSolarPowerGenerationContent2` | `TECHNOLOGY_DESCRIPTIONS.solarPowerGeneration[locale]` |
| `giganticTurbines` | `techGiganticTurbinesContent2` | `TECHNOLOGY_DESCRIPTIONS.giganticTurbines[locale]` |
| `advancedPowerGeneration` | `techAdvancedPowerGenerationContent2` | `TECHNOLOGY_DESCRIPTIONS.advancedPowerGeneration[locale]` |
| `rocketComposites` | `techRocketCompositesContent2` | `TECHNOLOGY_DESCRIPTIONS.rocketComposites[locale]` |
| `advancedFuels` | `techAdvancedFuelsContent2` | `TECHNOLOGY_DESCRIPTIONS.advancedFuels[locale]` |
| `planetaryNavigation` | `techPlanetaryNavigationContent2` | `TECHNOLOGY_DESCRIPTIONS.planetaryNavigation[locale]` |
| `neonFusion` | `optionDescTechNeonFusionContent2` | `TECHNOLOGY_DESCRIPTIONS.neonFusion[locale]` |
| `oxygenFusion` | `optionDescTechOxygenFusionContent2` | `TECHNOLOGY_DESCRIPTIONS.oxygenFusion[locale]` |
| `compounds` | `techCompoundsContent2` | `TECHNOLOGY_DESCRIPTIONS.compounds[locale]` |
| `siliconFusion` | `optionDescTechSiliconFusionContent2` | `TECHNOLOGY_DESCRIPTIONS.siliconFusion[locale]` |
| `aggregateMixing` | `optionDescTechAggregateMixingContent2` | `TECHNOLOGY_DESCRIPTIONS.aggregateMixing[locale]` |
| `steelFoundries` | `techSteelFoundriesContent2` | `TECHNOLOGY_DESCRIPTIONS.steelFoundries[locale]` |
| `nanoTubeTechnology` | `optionDescTechNanoTubeTechnologyContent2` | `TECHNOLOGY_DESCRIPTIONS.nanoTubeTechnology[locale]` |
| `hydroCarbons` | `optionDescTechHydroCarbonsContent2` | `TECHNOLOGY_DESCRIPTIONS.hydroCarbons[locale]` |
| `stellarCartography` | `optionDescTechStellarCartographyContent2` | `TECHNOLOGY_DESCRIPTIONS.stellarCartography[locale]` |
| `quantumComputing` | `optionDescTechQuantumComputingContent2` | `TECHNOLOGY_DESCRIPTIONS.quantumComputing[locale]` |
| `scienceLaboratories` | `techScienceLaboratoriesContent2` | `TECHNOLOGY_DESCRIPTIONS.scienceLaboratories[locale]` |
| `nobleGasCollection` | `techNobleGasCollectionContent2` | `TECHNOLOGY_DESCRIPTIONS.nobleGasCollection[locale]` |
| `neutronCapture` | `optionDescTechNeutronCaptureContent2` | `TECHNOLOGY_DESCRIPTIONS.neutronCapture[locale]` |
| `glassManufacture` | `optionDescTechGlassManufactureContent2` | `TECHNOLOGY_DESCRIPTIONS.glassManufacture[locale]` |
| `atmosphericTelescopes` | `techAtmosphericTelescopesContent2` | `TECHNOLOGY_DESCRIPTIONS.atmosphericTelescopes[locale]` |
| `fusionEfficiencyI` | `techFusionEfficiencyIContent2` | `TECHNOLOGY_DESCRIPTIONS.fusionEfficiencyI[locale]` |
| `fusionEfficiencyII` | `techFusionEfficiencyIIContent2` | `TECHNOLOGY_DESCRIPTIONS.fusionEfficiencyII[locale]` |
| `fusionEfficiencyIII` | `techFusionEfficiencyIIIContent2` | `TECHNOLOGY_DESCRIPTIONS.fusionEfficiencyIII[locale]` |
| `orbitalConstruction` | `techOrbitalConstructionContent2` | `TECHNOLOGY_DESCRIPTIONS.orbitalConstruction[locale]` |
| `antimatterEngines` | `techAntimatterEnginesContent2` | `TECHNOLOGY_DESCRIPTIONS.antimatterEngines[locale]` |
| `FTLTravelTheory` | `techFTLTravelTheoryContent2` | `TECHNOLOGY_DESCRIPTIONS.FTLTravelTheory[locale]` |
| `lifeSupportSystems` | `techLifeSupportSystemsContent2` | `TECHNOLOGY_DESCRIPTIONS.lifeSupportSystems[locale]` |
| `starshipFleets` | `techStarshipFleetsContent2` | `TECHNOLOGY_DESCRIPTIONS.starshipFleets[locale]` |
| `stellarScanners` | `techStellarScannersContent2` | `TECHNOLOGY_DESCRIPTIONS.stellarScanners[locale]` |

Cosmic Forge's `descriptions.js` maps its `tech*Row` `content2` field to the
listed source localization key. The target values render as
`.technology-map-tooltip-description` inside each same-route node. The source
translation keys are preserved verbatim in the mapping table.

For each row above, Cosmic Forge's `descriptions.js` maps its `tech*Row`
`content2` field to the corresponding `tech…Content2` or
`optionDescTech…Content2` localization key. Those descriptions map to
`TECHNOLOGY_DESCRIPTIONS.{technologyId}[locale]` and render as
`.technology-map-tooltip-description` inside the same node. The precise source
suffix key uses the same technology stem as the listed name key; the original
`optionDescTech` prefix is retained for Knowledge Sharing, Fusion Theory,
Hydrogen Fusion, Stellar Cartography, Quantum Computing, Helium Fusion,
HydroCarbons, Nano Tube Technology, Carbon Fusion, Neon Fusion, Oxygen Fusion,
Silicon Fusion, Neutron Capture, Glass Manufacture, and Aggregate Mixing.
Remaining standard technology descriptions use `tech{TechnologyStem}Content2`.
This selected-locale node-copy coverage is authored for Phase 8 execution and
has **NOT RUN**.

The same six-locale spec also checks the visible help on the distinct
`research-tech-tree` destination against
`economyLabel(locale, "technologyTreePanHelp")`. This target combines source
`headerDescTechnology` (unlock technologies with Research Points) and
`headerDescTechTree` (the visual technology map) with the owner-directed zoom
and keyboard-navigation guidance. It renders as `#technology-tree-pan-help` on
the Tech Tree route, keeping the source Technology and Tech Tree descriptions
together on the owner-directed Tech Tree destination. The locale assertion is
**AUTHORED; NOT RUN** for Phase 8.

## Phase 7 source progression unlock dialogs (16 October 2026; AUTHORED, NOT RUN)

[`p7-progression-unlock-dialog-locales.spec.ts`](p7-progression-unlock-dialog-locales.spec.ts)
checks the eight first-run Research result dialogs and the Compound Machining
dialog in each selected locale. It starts the deterministic `research`
economy fixture, adds Research Points through the existing debug action, then
dispatches real `economy.research` commands in prerequisite order. Each result
dialog must appear in the intended sequence, contain non-empty copy from the
selected locale, and be confirmed before the next technology is researched.
After the Research sequence, the spec adds Ascendency Points through the
existing debug action and dispatches two Nano Brokers purchases; level I must
not open the Compound Machining dialog, while level II must.

The source result keys are `modalKnowledgeSharingTabUnlockHeader/Text`,
`modalQuantumComputingTabUnlockHeader/Text`,
`modalScienceLabsTabUnlockHeader/Text`,
`modalInterstellarTabUnlockHeader/Text`, `modalEnergyTabUnlockHeader/Text`,
`modalRocketCompositesTabUnlockHeader/Text`,
`modalCompoundsTabUnlockHeader/Text`, and
`modalSpaceMiningTabUnlockHeader/Text`, emitted by Cosmic Forge's
`drawTab3Content.js`. Nano Brokers level II emits
`modalCompoundMachiningTabUnlockHeader/Text` from `game.js`. MIAPLACIDUS
routes those outcomes through
`src/i18n/researchUnlockResultDialogMessages.ts` and the shared
`random-event-result-dialog` presentation. The spec covers the Research
sequence `knowledgeSharing`, `stellarCartography`, `basicPowerGeneration`,
`compounds`, `quantumComputing`, `scienceLaboratories`, `rocketComposites`,
`atmosphericTelescopes`, followed by `compoundMachining`.

This coverage is **AUTHORED; NOT RUN** and is deferred to the Phase 8 regression
work.

## Phase 7 technology row summaries (16 October 2026; AUTHORED, NOT RUN)

Cosmic Forge `descriptions.js` keeps each Technology row's `content1` summary
separate from its `content2` detail. `ui.js` renders `content1` directly on the
row, while the target previously showed only the longer `content2` description
inside the Tech Tree node tooltip. MIAPLACIDUS now stores the 36 standard
technology summaries in `src/content/technologySummaries.ts` and renders each
selected-locale value in the same node tooltip before its existing detail copy.
The source `optionDescTech…Content1` and `tech…Content1` keys map by technology
ID to `TECHNOLOGY_SUMMARIES.<id>[locale]` on `Research → Tech Tree`.

[`p7-technology-node-copy-locales.spec.ts`](p7-technology-node-copy-locales.spec.ts)
now checks each standard node's localized name, short summary, and existing
long description in all six locales. This adds selected-locale coverage for
the source `content1` route. It is **AUTHORED; NOT RUN** for Phase 8.

## Phase 7 Science building help routes (16 October 2026; AUTHORED, NOT RUN)

[`p7-research-building-help-locales.spec.ts`](p7-research-building-help-locales.spec.ts)
checks the visible Science Kit, Science Club, and Science Lab row descriptions
on `Research → Science Buildings` in each selected locale. Cosmic Forge
`descriptions.js` maps these rows to
`optionDescResearchScienceKitContent1`,
`optionDescResearchScienceClubContent1`, and
`optionDescResearchScienceLabContent1`; `drawTab3Content.js` renders each as
the corresponding Research building row's `content1` copy. MIAPLACIDUS routes
the localized base text through `researchActionHelpMessages.ts` and renders it
in `.economy-action-description` in `EconomyPanes.tsx`.

The source Science Lab description appends its current power demand from
`scienceLab.energyUse * getTimerRateRatio()`. The remake appends the live
`SCIENCE_BUILDINGS.scienceLab.energyPerSecond` value using the selected locale's
number format and `kJ / s` unit. The spec compares the complete rendered value,
including that rate suffix, in all six locales. This coverage is
**AUTHORED; NOT RUN** for Phase 8.
