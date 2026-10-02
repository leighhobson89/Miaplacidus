# Foundation economy catalogue

**Coverage:** foundation tasks F-02 (Tabs 1–4 pane inventory), F-04 (resources, compounds and prices), F-05 (energy/research buildings and technologies), F-08 (owners, save fields, localization and old test areas), and economy examples for F-09. This is a source catalogue, not a remake implementation specification.

**Reference snapshot:** read-only Cosmic Forge `cosmicForge/cosmicForge`, Git HEAD `93e32669c3b35e76cdd4cf82725c14e7215b2fbc` (17 September 2026, matching the audit snapshot). The source working tree reported no changes. No tests were run for this extraction. Data values below are observed in `resourceDataObject.js`; behavior notes are checked against the named current functions. A displayed rate converts the stored per-10-ms rate by `TIMER_RATE_RATIO = 100`; modifier-dependent outcomes are identified as such.

## Evidence conventions and source map

- **Observed** means the field, branch, or handler exists at the cited source snapshot. **Derived** means arithmetic directly applied to observed values. **Inference** means a proposed ownership or interpretation rather than a declared source schema.
- Main data: [`resourceDataObject.js`](../../../cosmicForge/cosmicForge/resourceDataObject.js) — `resourceData.resources`, `.compounds`, `.buildings.energy`, `.research`, `.techs`, `REBIRTH_PERSISTED_AUTOMATION`, and the resource get/set helpers.
- Rules and purchase handling: [`game.js`](../../../cosmicForge/cosmicForge/game.js) — `gain`, `setNewItemPrice`, `sellResource`, `createCompound`, `sellCompound`, `fuseResource`, `increaseResourceStorage`, `calculateResearchRatePerTick`, `updateResearchDelta`, `updateEnergyDelta`, `updateResourceAutoBuyerDelta`, `updateCompoundAutoBuyerDelta`, `runProductionAllocation`, `runCompoundAutoCreation`, `setEnergyUse`, `setEnergyCapacity`, `checkAndRevealNewBuildings`.
- Technology purchase effects: [`drawTab3Content.js`](../../../cosmicForge/cosmicForge/drawTab3Content.js) — `handleTechnologyButtonClick` and the special handlers for the 20 megastructure stages; `game.js` — `applyMegaStructureBonuses`.
- Pane identities/labels: [`index.html`](../../../cosmicForge/cosmicForge/index.html), IDs `hydrogenOption` … `titaniumOption`, `energyOption` … `powerPlant3Option`, and `researchOption` … `philosophyOption`.
- Localization: [`localization.json`](../../../cosmicForge/cosmicForge/localization.json); language-neutral IDs are in source data and state.
- Reference test taxonomy/spec areas: [`tests/docs/functional-areas.json`](../../../cosmicForge/cosmicForge/tests/docs/functional-areas.json), `tests/e2e/{resources,autobuyers,autosell,energy,research,technology,compounds,precision,rounding}/`. These are matching old-game coverage areas, not remake evidence.

## F-02 — pane-level inventory, Tabs 1–4

The IDs below are stable DOM/menu identifiers from `index.html`; the accompanying `data-loc` key supplies the visible label. Rows share stock/rate/affordability feedback, so shared behavior is called out in the row instead of repeated verbatim. “Pane” here means the selectable menu item and its content renderer.

### Tab 1 — Resources

| Exact ID (`data-loc` label) | Primary action(s) | Visible values | Gate and modal/feedback surface |
|---|---|---|---|
| `hydrogenOption` (`resourceHydrogen`, Hydrogen) | Manual gain, sell, storage upgrade, four autobuyer tiers; fuse Hydrogen to Helium after `hydrogenFusion`. | Quantity/cap, net rate/s, sale value, each buyer’s price, quantity, rate and energy use. | Only resource unlocked in fresh state. Affordability uses red/green row/button state; storage-full notice; first successful fusion reveals the destination row and sends a discovery notice. |
| `heliumOption` (`resourceHelium`, Helium) | Same resource controls; fuse to Carbon after `heliumFusion`. | Same resource readouts. | Row begins hidden; first successful Hydrogen fusion adds Helium to `unlockedResourcesArray`. Tech/stock gates and fusion discovery feedback apply. |
| `carbonOption` (`resourceCarbon`, Carbon) | Same controls; Carbon fusion can produce Neon and Sodium after `carbonFusion`. | Same resource readouts, including fuel/net rate when Plant 1 consumes Carbon. | Row begins hidden; first fusion from Helium reveals Carbon. Fuel burn, cap and competing allocation affect displayed net rate. |
| `neonOption` (`resourceNeon`, Neon) | Same controls; fuse to Oxygen after `neonFusion`. | Same resource readouts. | Row begins hidden; first fusion from Carbon reveals Neon. Fusion/storage feedback as above. |
| `oxygenOption` (`resourceOxygen`, Oxygen) | Same controls; fuse to Silicon after `oxygenFusion`. | Same resource readouts. | Row begins hidden; first fusion from Neon reveals Oxygen. |
| `siliconOption` (`resourceSilicon`, Silicon) | Same controls; fuse to Iron after `siliconFusion`. | Same resource readouts. | Row begins hidden; first fusion from Oxygen reveals Silicon. |
| `ironOption` (`resourceIron`, Iron) | Manual gain, sell, storage upgrade and four autobuyer tiers. No `canFuseTech` is set. | Same resource readouts. | Row begins hidden; first fusion from Silicon reveals Iron. |
| `sodiumOption` (`resourceSodium`, Sodium) | Manual gain, sell, storage upgrade and four autobuyer tiers. No `canFuseTech` is set. | Same resource readouts. | Row begins hidden; discovered as the second output of first Carbon fusion. |

All resource panes render a per-second production figure and quantity/cap in the side menu. Sell, storage, fusion and tier controls are rebuilt in `drawTab1Content.js`; sell/fuse button coloring and deductions route through `game.js` and `precision.js`. The shared “Sell All” and “Increase All Storage” controls are in the Tab 1 header. Storage excludes Solar. Fusing an already discovered target uses the current randomized fusion-efficiency branch; see the fusion note below.

### Tab 2 — Energy

| Exact ID (`data-loc` label) | Primary action(s) | Visible values | Gate and modal/feedback surface |
|---|---|---|---|
| `energyOption` (`headerMainEnergyStorage`, Energy Storage) | Buy battery rows 1–3; turn the grid on/off. | Energy quantity/capacity, net kJ/s and grid generation/consumption presentation; battery quantities/capacity additions. | Energy tab opens with `basicPowerGeneration`. Battery 1 requires `sodiumIonPowerStorage`; battery 2 requires `advancedPowerGeneration`; battery 3 requires `orbitalConstruction`. Battery purchase adds capacity; it does not generate energy. Grid state, fuel and power use have status/color/tooltip feedback. |
| `powerPlant1Option` (`headerMainPowerPlant`, Power Plant) | Buy/sell Plant 1; activate/deactivate it. | Plant quantity, rate, cash/material price, fuel type/consumption, grid state. | `basicPowerGeneration`; first-run unlock shows Energy-tab modal. Burns Carbon; fuel depletion and grid trips affect operation. |
| `powerPlant2Option` (`headerMainSolarPowerPlant`, Solar Power Plant) | Buy/sell Plant 2; activate/deactivate it. | Plant quantity, weather-adjusted rate, price and fuel. | `solarPowerGeneration`; solar is its fuel and rate is weather affected. |
| `powerPlant3Option` (`headerMainAdvancedPowerPlant`, Advanced Power Plant) | Buy/sell Plant 3; activate/deactivate it. | Plant quantity, rate, price and fuel. | `advancedPowerGeneration`; burns Diesel. |

Plant and battery prices are shown as cash plus material costs. `drawTab2Content.js` marks unavailable purchases through `upgradeCheck`; plant toggle rows additionally check fuel/power. The center panel contains the power generation/consumption chart and Power On control. Battery purchase rows are content inside Energy Storage, not separate menu panes.

### Tab 3 — Research

| Exact ID (`data-loc` label) | Primary action(s) | Visible values | Gate and modal/feedback surface |
|---|---|---|---|
| `researchOption` (`headerMainResearch`, Research) | Buy Science Kit/Club/Lab; toggle each building; toggle research autobuyer when unlocked. | Research pool and rate/s; building quantities and active state; prices and Lab energy use. | Research pane/tab follows `knowledgeSharing`; Club row requires it; Lab row requires `scienceLaboratories`. Research autobuyer row is hidden until Robotic Research Automation perk ownership. Research/affordability uses status colors; first Knowledge Sharing/Science Laboratories can show first-run tab-unlock modals. |
| `technologyOption` (`headerMainTechnology`, Technology) | Spend research on any visible main or megastructure tech. | Research pool, static tech price, threshold/prerequisite text and researched state. | A tech becomes revealed after its `appearsAt[0]` research threshold and is purchasable only when all `appearsAt` tech IDs and its price pass. Purchase deducts research, sets the unlocked-tech ID and shows a tech notification; several unlocks show a tab modal. |
| `techTreeOption` (`headerMainTechTree`, Tech Tree) | Inspect the graph; hover/select nodes for their context. | Upcoming/revealed/researched nodes and dependency links. | Graph is refreshed when the research threshold reveals nodes or a tech is bought. It is a view, not a second purchase path. |
| `philosophyOption` (`headerMainPhilosophy`, Philosophy) | Buy the active philosophy’s repeatable research upgrades or activate its one-off ability. | Current-path upgrades, costs, purchased levels and ability state. | Menu row begins hidden; philosophy progression and purchased abilities/repeatables are cross-run systems outside F-04/F-05. Upgrade purchases use research through `gain(..., 'techUnlockPhilosophy', ...)`; see F-07 for full parity. |

### Tab 4 — Compounds

| Exact ID (`data-loc` label) | Primary action(s) | Visible values | Gate and modal/feedback surface |
|---|---|---|---|
| `dieselOption` (`compoundDiesel`, Diesel) | Create from recipe, sell, upgrade storage, buy four compound autobuyer tiers, enable auto-create when owned. | Quantity/cap, rate/s, sale value, recipe, tier costs/rates/power. | Compounds pane requires `compounds`; Diesel requires `hydroCarbons`. Auto-create/compound buyers require Nano Brokers levels 2/3. |
| `glassOption` (`compoundGlass`, Glass) | Same compound controls. | Same compound readouts. | Requires `glassManufacture` after Compounds is open. |
| `steelOption` (`compoundSteel`, Steel) | Same compound controls. | Same compound readouts. | Requires `steelFoundries`. |
| `concreteOption` (`compoundConcrete`, Concrete) | Same compound controls. | Same compound readouts. | Requires `aggregateMixing`. |
| `waterOption` (`compoundWater`, Water) | Same compound controls. | Same compound readouts. | Requires `neonFusion`. Water storage upgrade also consumes Concrete (30% of the current Water cap); it has special buyer progression (`normalProgression: false`). |
| `titaniumOption` (`compoundTitanium`, Titanium) | Same compound controls. | Same compound readouts. | Requires `neutronCapture`. |

Tab 4 header provides “Sell All” and “Increase All Storage”. First unlocks populate the matching row and can add an attention marker; stock full, create/sale, affordability and storage actions use notices/color states. `drawTab4Content.js` implements each recipe pane; `createCompound`, `sellCompound`, auto-create and storage deductions are in `game.js`.

## F-04 — starting resources, compounds and purchase ladders

### Eight ordinary resources

Quantities are the fresh `resourceData.resources[*].quantity` values; sale is cash per unit. Autobuyer starting costs are denominated in that same resource. Tier price advances after each purchase; see price rules below. Rate and energy columns are the data’s raw per-10-ms fields converted to displayed per-second units (`×100`), before star/permanent/supply-chain modifiers.

| Key | Start | Cap | Sale/unit | Tier prices T1/T2/T3/T4 | Buyer output/s T1/T2/T3/T4 | Energy use/s T1/T2/T3/T4 |
|---|---:|---:|---:|---:|---:|---:|
| `hydrogen` | 0 | 150 | $0.02 | 50 / 400 / 2,000 / 10,000 | 2 / 10 / 50 / 250 | 0 / 3 / 12 / 60 |
| `helium` | 0 | 120 | $0.03 | 75 / 600 / 3,000 / 15,000 | 2 / 7.5 / 37.5 / 187.5 | 0 / 3 / 9 / 45 |
| `carbon` | 0 | 130 | $0.10 | 80 / 640 / 3,200 / 16,000 | 2 / 10 / 50 / 250 | 0 / 3 / 12 / 60 |
| `neon` | 0 | 200 | $0.12 | 120 / 960 / 4,800 / 24,000 | 2 / 12.5 / 62.5 / 312.5 | 0 / 3 / 15 / 75 |
| `oxygen` | 0 | 170 | $0.05 | 140 / 1,120 / 5,600 / 28,000 | 2 / 15 / 75 / 375 | 0 / 3 / 18 / 90 |
| `silicon` | 0 | 150 | $0.08 | 200 / 1,600 / 8,000 / 40,000 | 2 / 17.5 / 87.5 / 437.5 | 0 / 3 / 21 / 105 |
| `iron` | 0 | 180 | $0.17 | 250 / 2,000 / 10,000 / 50,000 | 2 / 20 / 100 / 500 | 0 / 3 / 27 / 135 |
| `sodium` | 0 | 200 | $0.10 | 300 / 2,400 / 12,000 / 60,000 | 2 / 25 / 125 / 625 | 0 / 3 / 24 / 120 |

### Six compounds

Recipes are stored as input quantities per one compound output. Autobuyer starting costs are denominated in the compound itself. Rates/energy are converted from stored per-10-ms fields as above.

| Key | Start | Cap | Sale/unit | Recipe for 1 | Tier prices T1/T2/T3/T4 | Buyer output/s T1/T2/T3/T4 | Energy use/s T1/T2/T3/T4 |
|---|---:|---:|---:|---|---:|---:|---:|
| `diesel` | 0 | 500 | $0.30 | 26 Hydrogen + 12 Carbon | 1,000 / 400,000 / 2,000,000 / 10,000,000 | 2 / 10 / 50 / 250 | 0 / 3 / 12 / 60 |
| `glass` | 0 | 200 | $0.80 | 4 Silicon + 2 Oxygen + 1 Sodium | 70,000 / 600,000 / 1,250,000 / 2,500,000 | 2 / 8 / 40 / 150 | 0 / 8 / 31 / 150 |
| `steel` | 0 | 250 | $1.80 | 4 Iron + 1 Carbon | 80,000 / 700,000 / 1,500,000 / 3,000,000 | 2 / 10 / 50 / 200 | 0 / 10 / 35 / 180 |
| `concrete` | 0 | 50 | $0.80 | 5 Silicon + 2 Sodium + 3 Hydrogen | 95,000 / 800,000 / 1,800,000 / 4,200,000 | 1 / 8 / 50 / 200 | 0 / 20 / 70 / 360 |
| `water` | 0 | 100 | $1.60 | 20 Hydrogen + 10 Oxygen | 95,000 / 800,000 / 1,800,000 / 4,200,000 | 2 / 8 / 50 / 200 | 0 / 20 / 70 / 360 |
| `titanium` | 0 | 50 | $12.50 | 22 Iron + 18 Sodium + 40 Neon | 105,000 / 850,000 / 1,880,000 / 4,800,000 | 1 / 8 / 50 / 500 | 0 / 40 / 130 / 510 |

**Separate Solar entry:** `resourceData.resources.solar` starts at 10,000 with capacity 10,000 and sale value 0. It is an internal energy resource, has no normal Tab 1 pane, is explicitly excluded from storage upgrades and is not one of the eight ordinary materials above.

### Price, sale, cap and unlock rules

- **Observed:** `GAME_COST_MULTIPLIER = 1.13`; `setNewItemPrice` advances the current resource/compound autobuyer, science-building, energy-building or battery price to `ceil(currentPrice × 1.13)` after purchase. Each nonzero material component on an energy-building price follows the same ceil/multiplier rule. Do not replace this repeated-ceiling recurrence with a single floating exponent if exact prices matter.
- **Observed:** `setEnergyAndResearchBuildingPricesAfterRepeatables` applies a 0.95 reduction to current energy/research building cash/material prices per relevant repeatable effect. `setResourceAutobuyerPricesAfterRepeatables` applies 0.95 to resource autobuyer prices. `setCompoundRecipePricesAfterRepeatables` reduces each positive ingredient ratio to `max(1, ceil(ratio × 0.95))`; compound buyer prices are not changed by that named resource-buyer helper.
- **Observed:** each base resource/compound storage upgrade costs current capacity minus one unit of that material, then multiplies capacity by `increaseStorageFactor` (fresh default 2). The one-unit remainder is deliberate source behavior. The permanent Efficient Storage buff scales the factor by `(boughtYet + 1)`. Solar is excluded. Water additionally charges Concrete at 30% of current Water capacity; this is a second material cost, not a Concrete-capacity increase.
- **Observed:** storage/gain paths clamp quantity to capacity. Price and sale amounts remain mutable current fields when repeatables or state modifiers apply; tables above are fresh-template base values.
- **Observed:** `unlockedResourcesArray` starts as `['hydrogen']`; first fusion adds newly discovered target resources. Fusion UI is unlocked by each resource’s `canFuseTech`. Carbon has two targets (Neon and Sodium). Resource pane menu rows other than Hydrogen start hidden.
- **Observed:** `unlockedCompoundsArray` starts empty. `compounds` opens the compounds feature; each compound’s `revealedBy` field is its individual unlock. Auto-sell/auto-create/compound buyers currently gate on `ascendencyBuffs.nanoBrokers.boughtYet >= 1/2/3` respectively. A current helper also unlocks compatibility tech key `compoundMachining` when compound autobuyer access is granted.

## F-05 — energy buildings and research upgrades

### Energy upgrades

| Key | Fresh price | Base material costs | Added rate/capacity | Fuel / gate |
|---|---:|---|---:|---|
| `powerPlant1` | $300 | 100 Carbon | 5 kJ/s | Burns Carbon 3/s; revealed by `basicPowerGeneration`. |
| `powerPlant2` | $1,000 | 150 Glass + 200 Steel | 20 kJ/s before weather | Solar fuel at 0/s; weather affected; revealed by `solarPowerGeneration`. |
| `powerPlant3` | $700 | 800 Hydrogen + 500 Helium | 35 kJ/s | Burns Diesel 1/s; revealed by `advancedPowerGeneration`. |
| `battery1` | $5,000 | 500 Sodium + 1,000 Carbon | +15,000 kJ capacity | Requires `sodiumIonPowerStorage`. |
| `battery2` | $50,000 | 3,000 Steel + 1,500 Glass + 2,000 Sodium | +150,000 kJ capacity | Requires `advancedPowerGeneration`. |
| `battery3` | $500,000 | 25,000 Titanium + 12,000 Neon + 18,000 Silicon | +1,500,000 kJ capacity | Requires `orbitalConstruction`. |

Starting Energy quantity, rate, consumption and storage capacity are all 0; `batteryBoughtYet` is false. Battery capacities add to the Energy store via `setEnergyCapacity`; power plant rates are raw 0.05/0.2/0.35 per 10-ms simulation interval before ×100 display. Fuel rates similarly convert 0.03 Carbon and 0.01 Diesel per interval per plant to 3/s and 1/s. Plant 2’s `purchasedRate` is adjusted by current system weather.

### Research pool and buildings

| Key | Start quantity/rate | Fresh price and actual charge | Base research output | Energy draw / gate |
|---|---|---:|---:|---|
| `research.quantity` | 50 / 0 | — | — | No storage-capacity field is present in the fresh template. |
| `scienceKit` | Quantity 0 | $5 | 0.5 RP/s | 0; available on Research pane. |
| `scienceClub` | Quantity 0 | $200 | 8 RP/s | 0; `knowledgeSharing`. |
| `scienceLab` | Quantity 0 | $1,500 | 20 RP/s | 35 kJ/s; `scienceLaboratories`; produces only while grid is powered. |

`calculateResearchRatePerTick` sums `rate × quantity` for active buildings; when the grid is off, only Kit/Club remain in the unpowered rate. Values above use the 10-ms interval and 100× display/accrual conversion. `Robotic Research Automation` reveals a separate research autobuyer toggle; it is not a fourth building.

## F-05 — technology catalogue (all `resourceData.techs` keys)

For each row, `threshold` means the source `appearsAt[0]` research-pool threshold; the threshold reveal check is strictly `research > threshold`. `requires` is the `appearsAt` technology-ID list used by the UI purchase gate; the adjacent `prereqs` are the source’s player-facing prerequisite names. Cost is a fixed one-time research price in the fresh template. Mega rows are also flagged `special: 'megastructure'` in data.

| Tech key | Price (RP) | Threshold; requires | `prereqs` names | Observed unlock/effect |
|---|---:|---|---|---|
| `knowledgeSharing` | 150 | 0; — | — | Opens Research progression; enables Science Club; first-run Research-tab modal. |
| `fusionTheory` | 750 | 500; `knowledgeSharing` | Knowledge Sharing | Opens Hydrogen Fusion research path. |
| `hydrogenFusion` | 1,150 | 1,000; `fusionTheory` | Fusion Theory | Enables Hydrogen fusion; first discovered output is Helium. |
| `heliumFusion` | 2,300 | 2,000; `hydrogenFusion` | Hydrogen Fusion | Enables Helium fusion; path to Carbon. |
| `carbonFusion` | 4,300 | 4,100; `nobleGasCollection` | Noble Gas Collection | Enables Carbon fusion; Carbon has Neon and Sodium outputs. |
| `basicPowerGeneration` | 4,200 | 3,000; `heliumFusion` | Helium Fusion | Unlocks Energy tab and Plant 1. |
| `sodiumIonPowerStorage` | 7,000 | 5,000; `basicPowerGeneration` | Basic Power Generation | Unlocks Battery 1 and battery status information. |
| `solarPowerGeneration` | 15,000 | 12,000; `steelFoundries`, `glassManufacture` | Steel Foundries; Glass Manufacture | Unlocks Solar Power Plant. |
| `giganticTurbines` | 4,800 | 4,200; `hydroCarbons` | HydroCarbons | Prerequisite for Advanced Power Generation; no separate runtime mutation was found in its purchase switch. |
| `advancedPowerGeneration` | 8,000 | 6,000; `giganticTurbines`, `basicPowerGeneration` | Gigantic Turbines; Basic Power Generation | Unlocks Plant 3 and Battery 2. |
| `rocketComposites` | 34,000 | 28,000; `neutronCapture`, `nanoTubeTechnology`, `steelFoundries` | Neutron Capture; Nano Tube Technology; Steel Foundries | Reveals Launch Pad and sets normal-progression resource autobuyers to tier 4. |
| `advancedFuels` | 30,000 | 25,000; `hydroCarbons`, `neutronCapture`, `advancedPowerGeneration` | HydroCarbons; Neutron Capture; Advanced Power Generation | Enables rocket fueling. |
| `planetaryNavigation` | 29,000 | 27,000; `atmosphericTelescopes`, `rocketComposites`, `quantumComputing` | Atmospheric Telescopes; Rocket Composites; Quantum Computing | Enables travel to asteroids. |
| `neonFusion` | 5,750 | 5,000; `carbonFusion` | Carbon Fusion | Enables Neon fusion; unlocks Water compound. |
| `oxygenFusion` | 8,000 | 7,000; `neonFusion` | Neon Fusion | Enables Oxygen fusion; path to Silicon. |
| `compounds` | 9,000 | 8,000; `hydrogenFusion`, `carbonFusion` | Hydrogen Fusion; Carbon Fusion | Opens Compounds pane. |
| `siliconFusion` | 11,500 | 10,000; `oxygenFusion` | Oxygen Fusion | Enables Silicon fusion; path to Iron. |
| `aggregateMixing` | 13,000 | 12,000; `siliconFusion` | Silicon Fusion | Unlocks Concrete. |
| `steelFoundries` | 13,000 | 11,500; `siliconFusion` | Silicon Fusion | Unlocks Steel. |
| `nanoTubeTechnology` | 4,000 | 3,500; `heliumFusion` | Helium Fusion | Prerequisite for Noble Gas Collection, Quantum Computing and other later systems; no direct economy mutation in the purchase switch. |
| `hydroCarbons` | 3,800 | 3,200; `basicPowerGeneration` | Basic Power Generation | Unlocks Diesel. |
| `stellarCartography` | 800 | 700; — | — | Unlocks Star Map; first-run Interstellar-tab modal. |
| `quantumComputing` | 5,750 | 3,500; `nanoTubeTechnology` | Nano Tube Technology | Sets normal-progression resource autobuyers to tier 2; first-run unlock modal. |
| `scienceLaboratories` | 7,000 | 5,750; `quantumComputing` | Quantum Computing | Unlocks Science Lab; first-run Research-tab modal. |
| `nobleGasCollection` | 4,500 | 4,000; `nanoTubeTechnology` | Nano Tube Technology | Required before Carbon Fusion; no separate purchase-switch mutation. |
| `neutronCapture` | 23,000 | 20,000; `siliconFusion` | Silicon Fusion | Unlocks Titanium compound. |
| `glassManufacture` | 9,000 | 8,000; `oxygenFusion` | Oxygen Fusion | Unlocks Glass. |
| `atmosphericTelescopes` | 10,000 | 9,000; `glassManufacture`, `stellarCartography` | Glass Manufacture; Stellar Cartography | Reveals Space Telescope and first-run Space Mining-tab modal. |
| `fusionEfficiencyI` | 1,750 | 1,500; `fusionTheory` | Fusion Theory | Raises subsequent fusion yield range from 20–30% to 40–60%. |
| `fusionEfficiencyII` | 3,500 | 3,000; `fusionEfficiencyI` | Fusion Efficiency I | Raises yield range to 60–80%. |
| `fusionEfficiencyIII` | 10,000 | 9,000; `fusionEfficiencyII` | Fusion Efficiency II | Sets fusion yield to 100%. |
| `orbitalConstruction` | 50,000 | 45,000; `planetaryNavigation`, `rocketComposites` | Planetary Navigation; Rocket Composites | Reveals Star Ship pane; also gates Battery 3. |
| `antimatterEngines` | 78,000 | 65,000; `orbitalConstruction`, `neutronCapture`, `FTLTravelTheory` | Orbital Construction; Neutron Capture; FTL Travel Theory | Unlocks antimatter starship engine module. |
| `FTLTravelTheory` | 65,000 | 60,000; `neutronCapture`, `planetaryNavigation`, `advancedFuels` | Neutron Capture; Planetary Navigation; Advanced Fuels | Enables FTL travel. |
| `lifeSupportSystems` | 60,000 | 55,000; `orbitalConstruction`, `nanoTubeTechnology`, `quantumComputing` | Orbital Construction; Nano Tube Technology; Quantum Computing | Unlocks Life Support starship module. |
| `starshipFleets` | 100,000 | 80,000; `FTLTravelTheory`, `antimatterEngines`, `orbitalConstruction` | FTL Travel Theory; Antimatter Engines; Orbital Construction | Unlocks starship fleet hangar. |
| `stellarScanners` | 72,000 | 70,000; `FTLTravelTheory`, `orbitalConstruction` | FTL Travel Theory; Orbital Construction | Unlocks Stellar Scanners. |
| `dysonSphereUnderstanding` | 50,000 | 40,000; `advancedPowerGeneration` | Advanced Power Generation | Dyson stage 1: doubles each battery template capacity and current energy capacity. |
| `dysonSphereCapabilities` | 100,000 | 80,000; `dysonSphereUnderstanding` | Dyson Sphere Understanding | Dyson stage 2: ×1.25 to each power plant’s rate/max and purchased rate. |
| `dysonSphereDisconnect` | 150,000 | 120,000; `dysonSphereCapabilities` | Dyson Sphere Capabilities | Dyson stage 3: grants 0.15 antimatter milestone and permanent antimatter unlock. |
| `dysonSpherePower` | 200,000 | 160,000; `dysonSphereDisconnect` | Dyson Sphere Disconnect | Dyson stage 4: turns on Infinite Power and the grid. |
| `dysonSphereConnect` | 250,000 | 200,000; `dysonSpherePower` | Dyson Sphere Power | Dyson stage 5: megastructure capture; Infinite Power remains enabled. |
| `celestialProcessingCoreUnderstanding` | 50,000 | 40,000; `quantumComputing` | Quantum Computing | CPC stage 1: +0.5 research-rate field while at its factory star. |
| `celestialProcessingCoreCapabilities` | 100,000 | 80,000; `celestialProcessingCoreUnderstanding` | Celestial Processing Core Understanding | CPC stage 2: +1 research-rate field at its factory star. |
| `celestialProcessingCoreDisconnect` | 150,000 | 120,000; `celestialProcessingCoreCapabilities` | Celestial Processing Core Capabilities | CPC stage 3: grants 0.15 antimatter milestone and permanent antimatter unlock. |
| `celestialProcessingCorePower` | 200,000 | 160,000; `celestialProcessingCoreDisconnect` | Celestial Processing Core Disconnect | CPC stage 4: +1.5 research-rate field at its factory star. |
| `celestialProcessingCoreConnect` | 250,000 | 200,000; `celestialProcessingCorePower` | Celestial Processing Core Power | CPC stage 5: +2 at its factory star or +5 outside it; capture. |
| `plasmaForgeUnderstanding` | 50,000 | 40,000; `neutronCapture` | Neutron Capture | Forge stage 1: ×1.25 to all resource production rates. |
| `plasmaForgeCapabilities` | 100,000 | 80,000; `plasmaForgeUnderstanding` | Plasma Forge Understanding | Forge stage 2: ×1.5 to all resource production rates. |
| `plasmaForgeDisconnect` | 150,000 | 120,000; `plasmaForgeCapabilities` | Plasma Forge Capabilities | Forge stage 3: grants 0.15 antimatter milestone and permanent antimatter unlock. |
| `plasmaForgePower` | 200,000 | 160,000; `plasmaForgeDisconnect` | Plasma Forge Disconnect | Forge stage 4: ×1.75 to all resource production rates. |
| `plasmaForgeConnect` | 250,000 | 200,000; `plasmaForgePower` | Plasma Forge Power | Forge stage 5: ×2 to rates and sets permanent resource-rate bonus; stage multipliers combine to ×6.5625. |
| `galacticMemoryArchiveUnderstanding` | 50,000 | 50,000; `orbitalConstruction` | Orbital Construction | Archive stage 1: adds 100,000 capacity to all resources/compounds. |
| `galacticMemoryArchiveCapabilities` | 100,000 | 100,000; `galacticMemoryArchiveUnderstanding` | Galactic Memory Archive Understanding | Archive stage 2: adds 1,000,000 capacity to all resources/compounds. |
| `galacticMemoryArchiveDisconnect` | 150,000 | 150,000; `galacticMemoryArchiveCapabilities` | Galactic Memory Archive Capabilities | Archive stage 3: grants 0.15 antimatter milestone and permanent antimatter unlock. |
| `galacticMemoryArchivePower` | 200,000 | 200,000; `galacticMemoryArchiveDisconnect` | Galactic Memory Archive Disconnect | Archive stage 4: adds 1,000,000,000 capacity to all resources/compounds. |
| `galacticMemoryArchiveConnect` | 250,000 | 250,000; `galacticMemoryArchivePower` | Galactic Memory Archive Power | Archive stage 5: adds 10,000,000,000 capacity, sets permanent storage-adder bonus, and captures the structure. |

### Tech entry notes

- `resourceData.techs` contains **57** keys at this snapshot: 37 standard techs plus 20 megastructure-stage techs. `techName*` is the display-key family; `appearsAt` is the live threshold/gate used by `monitorTechTree` and `handleTechnologyScreenButtonAndDescriptionStates`. `prereqs` is the label list in the same data object. Keep stable IDs separate from those translated labels.
- Megastructure stages are credited in `applyMegaStructureBonuses` and restored through `resourceDataObject`’s mega-tech mapping after rebirth. Their three “Disconnect” stages grant antimatter and a Miaplacidus milestone; do not implement them as ordinary static resource prices only.
- Some keys (`fusionTheory`, `giganticTurbines`, `nanoTubeTechnology`, `nobleGasCollection`) primarily gate the following research chain. A no-op branch in `handleTechnologyButtonClick` is not evidence for a hidden numerical bonus.
- Effects on rockets/interstellar modules are included as unlock summaries to keep every technology row traceable; their complete system catalogues belong to later foundation/economy phases.

## F-08 — current rule owners, mutable fields and localization

### Rule/data module map

| Concern | Current data/rule source and representative identifiers |
|---|---|
| Resource/compound definitions, starting balances, prices, recipes, caps and tech definitions | `resourceDataObject.js`: `resourceData.resources`, `.compounds`, `.techs`, `getResourceDataObject`, `setResourceDataObject`. |
| Manual gain, sale, fusion, crafting and purchase-price changes | `game.js`: `gain`, `sellResource`, `sellCompound`, `fuseResource`, `createCompound`, `setNewItemPrice`, `checkAndDeductResources`. |
| Storage and saturation | `game.js`: `increaseResourceStorage`, `performIncreaseStorageForKey`, `getIncreasableStorageKeys`, `maybeNotifyStorageFull`, `increaseAllStorage`. |
| Autobuyer production and allocation | `game.js`: `updateResourceAutoBuyerDelta`, `updateCompoundAutoBuyerDelta`, `runProductionAllocation`, `getActiveCompoundConsumers`, `runCompoundAutoCreation`; current `timerManagerDelta` drives updates. |
| Energy balance/fuel/buildings | `game.js`: `updateEnergyDelta`, `setEnergyUse`, `setEnergyCapacity`, `toggleBuildingTypeOnOff`, `checkPowerBuildingsFuelLevels`, `checkAndRevealNewBuildings`. |
| Research/technology purchase | `game.js`: `calculateResearchRatePerTick`, `updateResearchDelta`, `gain`; `drawTab3Content.js`: `handleTechnologyButtonClick`, repeatable tech and mega-stage handlers. |
| Shared affordability/format policy | `precision.js` plus `game.js` purchase/display paths. Tech threshold reveal uses `research > appearsAt[0]` in `monitorTechTree`. |
| Saved global progression | `constantsAndGlobalVars.js`: `techUnlockedArray`, `revealedTechArray`, `upcomingTechArray`, `unlockedResourcesArray`, `unlockedCompoundsArray`, `buildingTypeOnOff`; save capture/restore is in the same module. |
| Old interaction surfaces | `index.html` IDs and `drawTab1Content.js` … `drawTab4Content.js`; menus are mapped by `tabN.optionM` classes in `ui.js`. |

### Representative mutable save fields and intended remake scope

Cosmic Forge has no single declared save-schema scope. The scope labels below are **remake ownership inference**, based on whether a value resets per run or is explicitly carried in current rebirth code.

| Representative field(s) | Current location | Suggested scope |
|---|---|---|
| `resources[*].quantity`, `storageCapacity`, rates, `usedForFuelPerSec`, buyer tier `quantity/price/active` | `resourceData.resources` | Run; rates/fuel are derived or transient where a stable recomputation is possible. |
| `compounds[*].quantity`, `storageCapacity`, buyer tiers, `autoCreate`, `autoCreateRate`, recipe ratios | `resourceData.compounds` | Quantities/capacities and buyer ownership: Run. Recipe definitions: immutable Content. `autoCreate` is explicitly copied across rebirth. |
| `allocationEnabled`, `cashShare`, `compoundShare` on resources/compounds | `resourceData` item fields | Settings-like automation choice. `REBIRTH_PERSISTED_AUTOMATION` explicitly preserves all three per item. |
| `buildings.energy.quantity`, `storageCapacity`, plant/battery `quantity/price/purchasedRate`, fuel and grid flags | `resourceData.buildings.energy`; some grid flags in `constantsAndGlobalVars.js` | Buildings/capacity: Run. Plant on/off and battery visibility are run automation/UI state; recompute rates from owned buildings. |
| `research.quantity`, science-building quantity/active/price; `research.upgrades.autoBuyer.enabled` | `resourceData.research` | Research and buildings: Run. Autobuyer enablement is a setting-like field explicitly listed in rebirth automation carryover. |
| `techUnlockedArray`, `revealedTechArray`, `upcomingTechArray`, unlocked-resource/compound arrays | `constantsAndGlobalVars.js` | Run progression; permanent perk/mega effects are reapplied from their permanent owner after rebirth. |
| `ascendencyBuffs.nanoBrokers.boughtYet`, Efficient Storage and other ascendency buffs | `resourceDataObject.js` store plus global accessors | Permanent progression. These affect autosell/compound auto-create/compound buyers and storage scaling. |
| resource/compound lifetime counters and research/building counts | stats fields updated via `addToResourceAllTimeStat` and the `constantsAndGlobalVars.js` statistics store | Statistics; distinguish lifetime from run totals. |

`resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack` starts from a cloned fresh template, then restores/reapplies selected values. `REBIRTH_PERSISTED_AUTOMATION` explicitly includes telescope settings, research autobuyer enablement, all resource/compound allocation shares and each compound’s auto-create flag. Do not infer that every current active/price/rate field survives.

### Translation-key patterns

Observed patterns in `localization.json` and the renderers:

- Resource names: `resource${PascalKey}` (`resourceHydrogen`, `resourceIron`); compound names: `compound${PascalKey}` (`compoundDiesel`, `compoundTitanium`). Seven `resourceShort${PascalKey}` keys are used where the recipe dropdown needs an abbreviated input name.
- Technology display names: `techName${PascalKey}` (`techNameHydrogenFusion`, `techNameFTLTravelTheory`); technology descriptions are commonly `optionDescTech${PascalKey}Content1/Content2` where such prose exists.
- Buyer names are data-driven via `nameUpgrade`, with keys such as `autoBuyerNameHydrogenCompressor` and `autoBuyerNameGlassWorkshop`. Energy/building names include `buildingNameBattery1` and row labels such as `tab2PowerPlant1RowLabel`; research rows use `tab3ScienceKitRowLabel`, `tab3ScienceClubRowLabel`, and `tab3ScienceLabRowLabel`.
- Recipe controls use `compoundCreate*`; rate and amount labels use shared keys with placeholders. Pane identity must remain the source ID, never a translated string.
- The audit snapshot has six catalogs (`en`, `es`, `pt`, `de`, `it`, `fr`) with 2,621 keys each, as recorded in `docs/audit/README.md`; this extraction did not rerun the localization validator.

### Matching original test areas

| Catalog/rule slice | Existing Cosmic Forge area(s) |
|---|---|
| Eight resources, reveal/fusion/sell/manual gain/storage | `resources`, `precision`, `rounding` |
| Resource/compound autobuyer tiers, rates and energy demand | `autobuyers`, `energy`, `precision`, `rounding` |
| Cash/compound allocation and production competition | `autosell`, `resources`, `compounds` |
| Plant/battery/fuel/grid/trip/recovery | `energy` |
| Research pool/buildings/automation | `research`, `technology`, `energy` |
| Tech IDs, thresholds, prerequisites, purchase/unlock feedback | `technology`, `research` |
| Compound recipes, sale, cap/storage and automation | `compounds`, `autobuyers`, `autosell`, `rounding` |

The old area README statuses are historical. The remake must create its own focused unit/E2E evidence before parity rows move from “not started”.

## F-09 — worked early and mid-game calculations

These are deterministic calculations from fresh-template fields with no star/permanent/repeatable modifiers unless called out.

1. **Fresh economy:** start with $10, 50 RP, zero in each of the eight ordinary materials, and 150 Hydrogen capacity. Hydrogen sells for $0.02/unit. One Hydrogen Tier 1 buyer costs 50 Hydrogen and produces 2 Hydrogen/s at base. Since the fresh Hydrogen stock is 0, this is a later purchase after manual gain.
2. **Price recurrence:** Hydrogen Tier 1 begins at 50 Hydrogen. Following purchases raise its next price `ceil(50×1.13)=57`, then `ceil(57×1.13)=65`. This illustrates repeated ceil, not `ceil(50×1.13²)` as a general replacement rule.
3. **First research building:** one Science Kit costs $5 cash and adds 0.5 RP/s (stored rate 0.005 every 10 ms); current pool begins at 50 RP. Knowledge Sharing costs 150 RP, so it needs another 100 RP beyond the start. The second Kit’s fresh repeated-price progression is `ceil(5×1.13)=$6`.
4. **Fusion path:** Knowledge Sharing (150 RP), Fusion Theory (750), then Hydrogen Fusion (1,150) totals 2,050 RP in one-time tech prices. Thresholds/prerequisites still apply individually; having enough total RP does not bypass them.
5. **Basic electricity:** one Plant 1 costs $300 + 100 Carbon, generates 5 kJ/s and burns 3 Carbon/s at base. A Science Lab uses 35 kJ/s, so seven unmodified Plant 1s are required to meet only that Lab draw (7×5 = 35); together they burn 21 Carbon/s. Other consumers, fuel shortage and star modifiers change the live result.
6. **Compound example:** 10 Glass requires 40 Silicon, 20 Oxygen and 10 Sodium; Glass starts with cap 200 and sells for $0.80/unit. This is recipe arithmetic, not a claim that the ingredients are already unlocked or available in that amount.
7. **Storage special case:** starting Water capacity is 100. A base storage purchase charges 99 Water and 30 Concrete, then raises Water cap to 200. The `increaseStorageFactor` and permanent Efficient Storage buff can change the cap multiplier.

## F-10 — observed quirks and decision points

- **Science Kit price label defect (observed):** `drawTab3Content.js` appends the Research Points suffix to the Science Kit’s price text (5 RP), while the purchase row uses `quantityArgument: 'cash'`, and the matching research-area source plan expects a cash charge. The observed rule is a $5 cash charge; the RP suffix is a display defect. The remake should show and charge $5 cash.
- **Solar vs. eight resources (observed):** Solar is present in `resourceData.resources` but is a non-sellable internal energy resource with its own full 10,000 cap, no ordinary menu pane and explicit storage-upgrade exclusion. Keep it separate from the eight extractable material IDs.
- **Water storage coupling (observed):** Water’s storage upgrade charges Concrete and stores `currentSecondaryIncreasePrice`; this is not a normal one-material upgrade.
- **Tech layout threshold (observed):** tree reveal checks use strict `research > appearsAt[0]`, while purchase gates also require tech IDs. Preserve the precise boundary in tests; do not assume `>=` from the display price alone.
- **Compound automation names (observed):** current access helpers gate autosell, compound auto-create and compound buyers on Nano Brokers levels 1, 2 and 3. `compoundMachining` is set as a compatibility tech when the relevant unlock is granted; do not treat that key as the single current gate without tracing the active helper.
- **Mutable-store coupling (observed):** rates/prices and some purchase state live beside definitions in `resourceData`; unlock arrays, power switches and stats live in `constantsAndGlobalVars.js`. The remake should split immutable catalogue data from typed, scoped state as required by `AGENTS.md`.
- **Fusion randomization (observed):** first discovery and subsequent fusions take different paths. Before Efficiency I, subsequent fusion uses random 20–30%; after I, 40–60%; after II, 60–80%; after III, 100%. Discovery amount is separately calculated by `fuseResource`; no random source should be hidden in UI code in the remake.
- **Potential save-field ambiguity (observed):** research autobuyer data includes both `active` and `enabled`, while the UI toggles `enabled` and rebirth capture/ownership checks mention both paths. Verify their exact distinction before normalizing to a single remake field.

## Extraction status

This document records source-backed catalogue values and an F-02 inventory for Tabs 1–4. It is not a live test result, and it does not mark unfinished remake features as implemented. Full-tab navigation inventory for Tabs 5–9 and the remaining F-06/F-07 catalogue remain outside this file’s coverage.
