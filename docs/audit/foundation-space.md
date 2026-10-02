# Foundation extraction: space and interstellar

**Status:** source-backed documentation for F-06, the Tabs 5–6 portion of F-02, and the space/interstellar portion of F-08–F-09. **Observed reference:** Cosmic Forge `93e32669c3b35e76cdd4cf82725c14e7215b2fbc` (2026-09-17). No source or tests were changed or run for this extraction.

This catalogue describes behavior visible in that source snapshot. “Target scope” is a proposed MIAPLACIDUS save-schema mapping, not a claim that the legacy game separates saves into those scopes: Cosmic Forge serializes these values together in `captureGameStatusForSaving()`. Random outcomes use `Math.random()` in the reference and are not deterministic from the fixed star-map seed.

Source root for links below: [`../../../cosmicForge/cosmicForge/`](../../../cosmicForge/cosmicForge/). Primary sources are [index.html](../../../cosmicForge/cosmicForge/index.html), [descriptions.js](../../../cosmicForge/cosmicForge/descriptions.js), [constantsAndGlobalVars.js](../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js), [resourceDataObject.js](../../../cosmicForge/cosmicForge/resourceDataObject.js), [ui.js](../../../cosmicForge/cosmicForge/ui.js), [drawTab5Content.js](../../../cosmicForge/cosmicForge/drawTab5Content.js), [drawTab6Content.js](../../../cosmicForge/cosmicForge/drawTab6Content.js), and [game.js](../../../cosmicForge/cosmicForge/game.js).

## Tabs 5–6 pane inventory (F-02)

Pane IDs and labels are the source sidebar IDs/labels in `index.html`; planet/system diplomacy, settlement, and battle are modes inside **Colonise**, not separate sidebar panes. Values in the right columns are the primary player-facing readouts; transient notifications, warnings, and confirmations are noted in the feedback column.

| Tab / exact pane ID — label | Primary actions and visible values | Gate | Modal / feedback surface |
|---|---|---|---|
| 5 `starMapOption` — Star Map | Choose Normal, Distance, Studied, or In Range mode; search/select a system; map shows up to 100 named stars, current/settled/factory markers, studied range, and connection/ping feedback. Selecting a discovered target shows distance and antimatter fuel with Travel. Search works only in Normal/Distance modes. | Interstellar tab is keyed by `stellarCartography`; visibility of ordinary systems depends on `starVisionDistance`, current/settled/factory state; Miaplacidus target remains locked until milestone level 4. | Selecting a target redraws the shared description/target strip. Travel opens the irreversible launch warning with target and estimated real-time flight; confirm spends fuel and starts the timer, cancel spends nothing. Notifications announce departure/arrival. |
| 5 `starDataOption` — Star Data | Sortable rows for discovered/settled systems: Distance, Type, Weather tendency (%), Precipitation, Fuel, Ascendency Points; row controls can ping/show a system on the map. | Revealed after star-map data is available; table omits undiscovered data and displays settled systems separately. | No dedicated modal; map ping and row status colors are the feedback. |
| 5 `starShipOption` — Star Ship | Build module parts with cost and built/required count; optional Stellar Scanner; choose target via map; launch; follow travel bar; scan on arrival. Scanned result includes system name/AP, life/civilization, population, threat/defense, air/land/sea fleets, anomalies, weather and precipitation. Scanner-less result intentionally hides several values as `???`. | Pane appears at `orbitalConstruction`. Required modules each have their own tech gate (`orbitalConstruction`, `lifeSupportSystems`, `antimatterEngines`, `starshipFleets`); scanner is optional and gated by `stellarScanners`. Travel needs a complete ship and destination fuel. | Confirm/cancel launch warning (includes hard-mode/home-star warning and flight-time estimate); travel notifications; system-scan notification; star-arrival O-type modal/notification and AP award on applicable arrival path. |
| 5 `fleetHangarOption` — Fleet Hangar | Build Envoy, Scout, Marauder, Land Stalker, Naval Strafer. Show unit quantities (Envoy `n/1`), costs, and aggregate attack power in pane/sidebar. Build updates player attack/defense and invalidates the current battle formation. | Hangar module must be finished and starship built; hangar module itself is gated by `starshipFleets`. Envoy max is 1; combat ships max 100,000 each. | Build feedback is row/cost state; battle outcome is reported from Colonise's battle mode. |
| 5 `coloniseOption` — Colonise | Interact through Bully, Passive, Harmony, Vassalize, Conquest; choose settlement/conquest outcomes; enter battle and select formation. Show relationship/opinion bar, attitude, threat, civilization/traits, defense, enemy fleet counts and anomalies; unavailable scanner intelligence is `???`. | Revealed after a starship arrives and system is scanned, with at least one fleet and before AP is awarded for that run. Diplomatic actions require a suitable alien civilization and Envoy; battle/settlement gates depend on destination state and fleet. | Patience/attitude can open the enter-war confirmation; branch messages include insult/scared/surrender/rebuff; battle uses win/loss modal and retry/recovery feedback; settlement/conquest notifications update the system. `warMode` is an in-pane state, not another pane ID. |
| 6 `spaceTelescopeOption` — Space Telescope | Build telescope; Scan Asteroids, Study Stars, and (when available) Pillage the Void; select automated telescope action and toggle it when automation is unlocked. Read timer/progress/status and telescope costs. | Space Mining tab is reached through `atmosphericTelescopes`; telescope pane is initially visible once the tab is open. Scan/study actions require the telescope bought and appropriate power/energy. Auto row requires its stored row-enabled unlock. | Completion notifications and progress/status text; no confirmation modal in the ordinary survey flow. |
| 6 `asteroidsOption` — Asteroids | Sort discovered rocks by rarity, distance, complexity (ease of extraction), or remaining antimatter. Rows show rock name, each value and mining/exhausted/destroyed status. | Appears after at least one successful telescope asteroid scan. | Scan success/failure and legendary-find notifications; status colors/dimming are in-row feedback. |
| 6 `launchPadOption` — Launch Pad | Build the pad; then build parts for Rocket 1–4. The pane shows base pad price and each rocket's cash/material price and part count. | `rocketComposites` reveals Launch Pad/rocket workbench. Building the pad reveals all four part rows; each rocket gets its own pane only when completed. | Pad-built notification; each row's affordability and completion state provide feedback. |
| 6 `rocket1` — Rocket X (runtime user name) | Rename (12-character cap); Fuel/Power Off; Launch; choose a discovered asteroid and Travel. Shows fuel tank/progress, launch readiness/weather hold, destination, countdown and mining/return state. Own tank, destination, direction, timer. | Rocket must be fully assembled. Fuel pump requires `advancedFuels`, power, and cash for its fuel-pump upgrade; launching requires a full rocket-specific tank and weather other than rain/volcano; Travel needs a discovered unclaimed, nonempty asteroid. | Rename feedback is the header/sidebar redraw; ready, launch, arrival, mining, and return use notifications. Rain/volcano shows `textBadWeather` and disables launch. |
| 6 `rocket2` — Rocket X (runtime user name) | Same rocket controls and readouts as `rocket1`, bound to Rocket 2's own tank, destination, direction, and timer. | Rocket must be fully assembled. Fuel pump requires `advancedFuels`, power, and cash for its fuel-pump upgrade; launching requires a full rocket-specific tank and weather other than rain/volcano; Travel needs a discovered unclaimed, nonempty asteroid. | Rename feedback is the header/sidebar redraw; ready, launch, arrival, mining, and return use notifications. Rain/volcano shows `textBadWeather` and disables launch. |
| 6 `rocket3` — Rocket X (runtime user name) | Same rocket controls and readouts as `rocket1`, bound to Rocket 3's own tank, destination, direction, and timer. | Rocket must be fully assembled. Fuel pump requires `advancedFuels`, power, and cash for its fuel-pump upgrade; launching requires a full rocket-specific tank and weather other than rain/volcano; Travel needs a discovered unclaimed, nonempty asteroid. | Rename feedback is the header/sidebar redraw; ready, launch, arrival, mining, and return use notifications. Rain/volcano shows `textBadWeather` and disables launch. |
| 6 `rocket4` — Rocket X (runtime user name) | Same rocket controls and readouts as `rocket1`, bound to Rocket 4's own tank, destination, direction, and timer. | Rocket must be fully assembled. Fuel pump requires `advancedFuels`, power, and cash for its fuel-pump upgrade; launching requires a full rocket-specific tank and weather other than rain/volcano; Travel needs a discovered unclaimed, nonempty asteroid. | Rename feedback is the header/sidebar redraw; ready, launch, arrival, mining, and return use notifications. Rain/volcano shows `textBadWeather` and disables launch. |
| 6 `miningOption` — Mining | SVG flow diagram per actively mining rocket; side-menu readouts show total antimatter rate and stock. Holding the rate bar boosts extraction while held. | Appears after antimatter has been unlocked by a rocket reaching an asteroid (or another explicit source such as debug/megastructure progression). | Live rate/quantity, bar/diagram and boost gesture/audio; depletion automatically turns the rocket home and notifies. |

Evidence: sidebar IDs/labels and tab grouping in [index.html#L486](../../../cosmicForge/cosmicForge/index.html#L486) and [index.html#L565](../../../cosmicForge/cosmicForge/index.html#L565); pane render branches in [drawTab5Content.js](../../../cosmicForge/cosmicForge/drawTab5Content.js) (`Star Map`, `Star Data`, `Star Ship`, `Fleet Hangar`, `Colonise`) and [drawTab6Content.js](../../../cosmicForge/cosmicForge/drawTab6Content.js) (`Space Telescope`, `Launch Pad`, four rocket names, `Asteroids`, `Mining`). Progression checks are in `checkAndRevealNewBuildings()` in [game.js](../../../cosmicForge/cosmicForge/game.js); destination confirmation is `createStarDestinationRow()` in [ui.js](../../../cosmicForge/cosmicForge/ui.js).

## Star map, seed, spectral types, system traits

### Fixed galaxy name/type catalogue

Observed: `NUMBER_OF_STARS = 100`, `STAR_FIELD_SEED = 80`; the `starNames` source table contains exactly 100 name/type pairs. `generateStarfield()` removes one name from the remaining list per index, using `seededRandom(seed - i * 1.2)`, and uses `getSeededRandomInRange()` with the seed offsets `i`, `i + 100`, `i + 200`, and `i + 300` for size, x, y, z. Nominal map frame is 1200×450; z spans 10–100,000. It calculates 3D distances from the current/origin star. This fixes galaxy identities/positions, but does **not** seed each system's weather, precipitation, asteroid data, or alien encounter rolls.

Complete observed name → type key/value catalogue (`descriptions.js`, `starNames`):

```text
Sirius A; Canopus F; Arcturus K; Sadalmelik G; Capella G
Rigel B; Procyon F; Betelgeuse M; Altair A; Aldebaran K
Sterope B; Antares M; Pollux K; Fomalhaut A; Deneb A
Mimosa B; Regulus O; Adhara B; Castor A; Shaula B
Bellatrix B; Elnath B; Miaplacidus A; Alnilam B; Alnair B
Alioth A; Alnitak K; Dubhe K; Mirfak F; Wezen F
Sargas F; Kaus Australis B; Avior K; Alkaid B; Menkalinan O
Atria K; Alhena A; Peacock B; Tureis B; Nunki B
Mirzam B; Alphard K; Rasalhague A; Caph F; Zubenelgenubi A
Electra B; Hamal K; Mintaka O; Alsephina A; Menkent K
Enif K; Tiaki K; Ascella A; Algol B; Markab B
Suhail K; Zeta Ophiuchi M; Kochab K; Ankaa K; Denebola A
Vega A; Azelfafage F; Maia B; Arkab Prior A; Thuban A
Izar K; Ruchbah A; Albireo K; Almaaz F; Dschubba B
Algieba K; Gomeisa B; Hoedus II G; Cebalrai K; Nashira F
Muscida A; Kitalpha F; Hyadum I K; Eltanin K; Yildun A
Biham A; Zubeneschamali B; Alpherg K; Alcor A; Polaris F
Pleione B; Spica B; Chara G; Sadachbia F; Rasalgethi M
Barnards Star M; Saiph B; Hassaleh K; Furud F; Atik F
Sadalsuud G; Propus M; Botein K; Acamar A; Anser G
```

Class counts are A 22, B 25, F 14, G 6, K 24, M 6, O 3. Unknown/empty names resolve to A (`getStarTypeByName()`). `starSystems.stars.spica` is the initial persisted system (`STARTING_STAR_SYSTEM = 'spica'`); it has `startingStar: true`, code `SPC`, water precipitation, and the starting weather table below.

| Type | Observed mechanical effect | Rule/source |
|---|---|---|
| A, G, K, M | No spectral-type bonus. | `getStarTypeByName()` plus neutral measurements described by `star-types.spec.js`. |
| B | Add 0.02, 0.08, 0.25, or 0.8 per owned resource autobuyer at tiers 1–4 (rate ratio 100 ⇒ +2/+8/+25/+80 per displayed second). Applies in the current B-type system; does not apply to compound autobuyers. | `getBTypeAutoBuyerBoostForTier()`, `getTotalAutoBuyerRateWithBTypeBoost()`, values in `constantsAndGlobalVars.js`. |
| F | Asteroid antimatter extraction ×1.5 (`1 + 0.5` multiplier); does not boost ordinary resource production. | `getFTypeAntimatterMiningBoostMultiplier()` and the mining tick in `game.js`. |
| O | Settling an O-type system can assign one of three plant-specific records; that chosen power plant is ×8 while the mechanic is active. Merely standing in an O system does not grant the bonus; the recorded O star must be settled. | `oTypePowerPlantStrengthBoost = 8`; `getOTypePowerPlantBoostMultiplierForCurrentSystem()` and `oTypePowerPlantBuffs`. |

O-type destinations are hard mode: life is forced present, civilization is Robotic, traits are Aggressive/Mechanized/Armored, population is 50–100 million, and threat is Extreme. The ordinary destination generator uses 97% life detection; non-hard-mode civilization/population/traits/threat are rolled. O stars are excluded as manuscript/factory or extra-settlement candidates. The distinct endgame target Miaplacidus also has fixed data (95 million population, 100 each of air/land/sea fleets, defense 100, Extreme threat) in `resourceDataObject.js`.

### System traits and encounter generation (F-06 addendum)

**Observed source behavior.** `generateDestinationStarData()` composes the encounter from `generateLifeDetection()`, `generateCivilizationLevel()`, `generateLifeformTraits()`, `generatePopulationEstimate()`, `generateThreatLevel()`, `generateDefenseRating()`, and `generateEnemyFleets()` in `game.js`. `isHardModeDestinationStar()` returns true for O-type destinations **and factory stars**. The separate home-star branch copies the fixed `miaplacidus` record and returns before those generators; that record is Robotic with Aggressive/Mechanized/Armored, 95,000,000 population, Extreme threat, and fixed fleet/defense data.

| Trait slot | Ordinary destination choices | Hard-mode generated choice | Translation key ID | Gameplay effect found in source |
|---|---|---|---|---|
| Primary | Aggressive (1/2); Diplomatic (1/2) | Aggressive | `traitNameAggressive`; `traitNameDiplomatic` | Aggressive sets initial-impression base to 20, reduces patience by 1, applies half-strength fleet-power-difference impression changes, makes Bully resolve to attack, and blocks the ordinary Vassalize-button gate (the separate Supremacist ability path can bypass it). Diplomatic sets initial-impression base to 50, adds 1 patience, lowers non-None threat by one level, halves generated enemy fleet count, and applies full-strength fleet-power-difference impression changes. Bully yields 70% surrender / 30% scared above a 2× power ratio; at ≥1.2× it yields 70% scared / 30% attack; below 1.2× it yields an even attack/laugh roll. |
| Habitat | Terrans (1/3); Aquatic (1/3); Aerialians (1/3) | Mechanized | `traitNameTerrans`; `traitNameAquatic`; `traitNameAerialians`; `traitNameMechanized` | Terrans make land the 60% primary fleet type and cancel the Land Stalker's bonus against land. Aquatic makes sea the primary type and cancels the Naval Strafer's bonus against sea. Aerialians make air the primary type and cancel the Scout/Marauder bonus against air. Mechanized also forces land primary; no additional direct trait rule was found. |
| Extra | Armored (1/4); Hive Mind (1/4); Power Siphon (1/4); Hypercharge (1/4) | Armored | `traitNameArmored`; `traitNameHiveMind`; `traitNamePowerSiphon`; `traitNameHypercharge` | Armored adds 25 to base defense (capped at 100, before the final ±10 roll) and subtracts 5 from initial impression. Hive Mind multiplies population by 4, subtracts 10 impression, gives enemy battle units 50 rather than 100 starting health, and triggers a conquest achievement. Power Siphon adds 3 impression and lets enemy units heal 25% of each target-health decrement they cause (capped at 100 health). Hypercharge adds 3 impression and doubles enemy battle-unit speed and acceleration. |
| Not applicable | N/A in all three slots when civilization is None or Unsentient | Not used in hard mode | `textNotApplicable` | No trait-specific gameplay effect found; generation returns the same N/A tuple for each slot. These civilization branches have no generated enemy fleets. |

Each ordinary choice uses its own `Math.floor(Math.random() * family.length)` index, so under uniform random draws the 2×3×4 families yield 24 nominally equiprobable tuples. Trait rows render through `TRAIT_NAME_KEYS`/`localizeTraitName()` in `drawTab5Content.js`; the civilization and threat labels render through `CIVILIZATION_LEVEL_KEYS` and `THREAT_LEVEL_KEYS` there. The concrete translation IDs are in `localization.json`.

Encounter context needed to interpret those effects: ordinary destinations detect life with probability 0.97. Conditional on detected life, civilization is Unsentient for a 0.10 roll, Industrial for the next 0.45, or Spacefaring for the remaining 0.45. No detected life instead has civilization None, population 0, N/A traits, and threat None; the generator skips enemy-fleet generation in this branch. A detected Unsentient system still receives the ordinary 1,000,000–50,000,000 inclusive population roll because the population function does not special-case civilization; Hive Mind multiplies that result by 4. Hard mode forces life and Robotic civilization, samples 50,000,000–100,000,000 inclusive population, and forces Extreme threat.

For ordinary sentient systems, Industrial threat is Low below 10,000,000 population and Moderate at or above it. Spacefaring threat is Moderate below 10,000,000, High from 10,000,000 to below 50,000,000, and Extreme at or above 50,000,000. Diplomatic lowers any non-None threat by one step. Base defense is `round(100 × threat multiplier × civilization multiplier)`, with threat multipliers None/Low/Moderate/High/Extreme = 0/0.2/0.4/0.7/1 and civilization multiplier 1 for Spacefaring, 0.5 otherwise; Armored is applied next, then the stored defense is uniformly rolled from max(1, base−10) through min(100, base+10), inclusive. Base total fleets are `floor(population × threat fleet multiplier × 100)`, with None/Low/Moderate/High/Extreme multipliers = 0/0.00000001/0.000000013/0.0000000169/0.00000002197. Diplomatic halves that count with floor. Habitat determines the primary type receiving floor(60% of total); the remainder is randomly split between the other two types.

Source identifiers: `game.js` functions named above plus `calculateInitialImpression()`, `calculateAttitude()`, `calculateModifiedAttitude()`, `bullyEnemy()`, and `tryToVassalizeEnemy()`; fleet counters are declared in `resourceDataObject.js` (`bonusRemovedBy`). Battle effects are in `ui.js` (`generateFleetUnits()`, `createUnit()`, `trackEnemyAndAdjustHealth()`). Localization IDs are mapped in `drawTab5Content.js` (`TRAIT_NAME_KEYS`, `CIVILIZATION_LEVEL_KEYS`, `THREAT_LEVEL_KEYS`) and defined in `localization.json`.

### Per-system data written on first map reveal

`generateStarDataAndAddToDataObject()` writes a mutable `starSystems.stars[lowercaseName]` record with `name`, map-derived `distance`, `fuel`, `ascendencyPoints`, uppercase `starCode`, `starType`, `precipitationResourceCategory: 'compounds'`, `precipitationType`, four-state `weather`, `weatherTendency`, and `factoryStar` marker. A per-system record is retained after reveal/save; it is not re-rolled on an ordinary redraw. The destination is copied into mutable `stars.destinationStar` before encounter/scanning branches.

F-10 discrepancy observed: the starting `spica` seed record has no `starType`, although `getStarTypeByName('spica')` says B. The runtime B bonus uses the lookup and therefore applies; the Star Data renderer uses `star?.starType ?? 'A'`, so a missing type displays A. The existing star-type assertion filters records whose `starType` is absent, so it does not catch this mismatch. Preserve the lookup rule and decide whether the display/default seed-data omission is a bug before porting.

## Weather and precipitation

Each state's tuple is `[weightPercent, symbol, solarEfficiency, severityClass]`. Starting Spica has weights `[30, 47, 20, 3]` for sunny/cloudy/rain/volcano and precipitation `water`:

| State | Solar factor | Generated-star weight construction | Effects |
|---|---:|---|---|
| Sunny | 1.0 | One of four initial independent integer weights, normalized to total 100. | Solar plant at full output; rockets may launch. |
| Cloudy | 0.6 | Same. | Solar plant at 60%; rockets may launch. |
| Rain | 0.4 | Same. | Solar plant at 40%; precipitation accrues; rocket launch blocked. |
| Volcano | 0.05 | Same. | Solar plant at 5%; rocket launch blocked. |

For each generated system the initial raw weather weights are `floor(random * 25)` (0–24). If all are zero, each becomes 25; otherwise largest-remainder scaling produces integer percentages summing to 100, ties retaining the original state order. The tendency is the first maximum weight. Runtime draws a state weighted by that system's persisted table. `changeWeather()` chooses a 1–3 minute window. After three consecutive rain/volcano windows in the same system, another severe draw is forced to cloudy for a one-minute relief window. Endless Summer forces sunny. Rain selects a precipitation rate of 0.01–0.04 per second; the generated compound type uses weights titanium 4, water 40, glass 19, diesel 30, concrete 0, steel 7 (out of 100).

The current live `[system, efficiency, state]`, precipitation rate, and weather visual/audio toggles are runtime fields; `captureGameStatusForSaving()` saves each system's weather table and the severe-streak count/system, but not the live weather tuple/rate. Target mapping: system weather table and current system are **run** state; severe-streak count is run state; weather particle/audio preference is **settings**. Recreate an explicit resume policy instead of treating UI effect flags as durable climate state.

## Asteroid classes and mining

`discoverAsteroid()` generates names `<starCode>-<0000–9999><A–Z>`; a legendary instead uses a commander-derived name from the 20-word component list in `generateLegendaryAsteroidName()`. Ordinary failed scan chance is 7%; successful finds increase base search duration by 7% multiplicatively. The asteroid list caps at 100 uninteracted entries; currently mined, reserved, and travelling-to entries are protected.

| Rarity class | Base roll (`floor(random * 101)`) | Remaining antimatter quantity | Scanner Boost purchase 1 | Scanner Boost purchase 2 |
|---|---:|---:|---:|---:|
| Common | 0–50 | 700–1,200 | 0% | 0% |
| Uncommon | 51–70 | 1,200–2,000 | 0–50 | 0% |
| Rare | 71–98 | 2,000–4,000 | 51–90 | 0–85 |
| Legendary | 99–100 | 4,000–10,000 | 91–100 | 86–100 |

The scanner table uses inclusive integer endpoints among 101 possible roll values; the source's `boughtYet === 1/2` branches put all rolls on Uncommon/Rare/Legendary or Rare/Legendary respectively. Distance is an integer 30,000–570,000. Its color class uses the percentile of that interval (≥76% red, ≥51% orange, ≥26% neutral, else green). Ease-of-extraction is an integer 1–6. Quantity coloring uses percentile within that rarity's own band (≥76% green, ≥51% neutral, ≥26% orange, else red), with Common green capped to orange and Uncommon green capped to neutral.

Extraction rate per tick is `0.004 - ((ease - 1) / 9) * (0.004 - 0.0001)`; source retains the legacy `minEase = 10` although generated ease only reaches 6. At ease 1/6 this is 0.004/0.001833333 per tick. Mining multiplies that rate by `1 + 0.25 * enhancedMiningBuys`, then by 1.5 on an F star and ×2 while the manual boost is held; each tick is clamped to remaining quantity. Empty rocks automatically turn their rocket home.

## Telescope, launch pad, and four asteroid rockets

Starting purchase data in `resourceData.space.upgrades`:

| Item | Base cash | Material costs (quantity, category) | Counts / operation data | Unlock |
|---|---:|---|---|---|
| Space Telescope | 10,000 | Iron 20,000 (resource); Glass 12,000 (compound); Silicon 20,000 (resource) | `spaceTelescopeBoughtYet`; asteroid search energy 0.4, star study energy 0.7; base search timer 60,000ms. | Space Mining / atmospheric telescopes progression; build once. |
| Launch Pad | 40,000 | Iron 1,000 (resource); Titanium 700 (compound); Concrete 12,000 (compound) | `launchPadBoughtYet`; opens rocket part rows. | `rocketComposites` research unlock. |
| Rocket 1 | 1,000 per part | Glass 1,000; Titanium 700; Steel 3,000 (all compounds) | 12 parts; 10,000 fuel to launch; tier-1 pump price 5,000, data rate 0.02, energy use 0.7. | Launch Pad built. |
| Rocket 2 | 1,000 per part | Same three costs as Rocket 1. | 17 parts; 12,000 fuel; pump 6,000, rate 0.02, energy 0.8. | Launch Pad built. |
| Rocket 3 | 1,000 per part | Same three costs as Rocket 1. | 22 parts; 14,000 fuel; pump 7,000, rate 0.02, energy 0.9. | Launch Pad built. |
| Rocket 4 | 1,000 per part | Same three costs as Rocket 1. | 27 parts; 16,000 fuel; pump 8,000, rate 0.02, energy 1.0. | Launch Pad built. |

Each part/unit purchase multiplies the next cash and three material prices by `GAME_COST_MULTIPLIER = 1.13` (rounded up by `setNewItemPrice()`). Repeatable Expansionist `launchPadMassProduction` applies a further 5% discount to current rocket part prices per repeatable level; `asteroidAttractors` increases rocket travel speed by dividing the stored travel time by 0.95 per level. Fuel pump rate is `tier1.rate * (1 + Rocket Fuel Optimization purchases)`; pumping needs power and `advancedFuels`. Weather rain/volcano blocks a full-tank launch, independent of fuel readiness. Launch names can be edited up to 12 characters and are persisted per rocket.

## Starship parts and interstellar fleet units

Part/build data is the starting catalogue. Component costs escalate by the same 1.13 multiplier per part; expansionist `spaceElevator` reduces current starship part prices by 5% per repeatable purchase. Mandatory ship components are the first four rows; Stellar Scanner is optional.

| Component | Cash / part | Three material costs / part | Parts | Tech gate |
|---|---:|---|---:|---|
| Structural (`ssStructural`) | 3,000 | Steel 4,000 (compound); Titanium 1,500 (compound); Silicon 4,500 (resource) | 20 | Orbital Construction |
| Life Support (`ssLifeSupport`) | 7,500 | Glass 5,000 (compound); Oxygen 20,000 (resource); Water 15,000 (compound) | 10 | Life Support Systems |
| Antimatter Engine (`ssAntimatterEngine`) | 6,000 | Steel 3,500 (compound); Titanium 2,000 (compound); Neon 10,000 (resource) | 16 | Antimatter Engines |
| Fleet Hangar (`ssFleetHangar`) | 50,000 | Glass 40,000 (compound); Titanium 20,000 (compound); Steel 80,000 (compound) | 1 | Starship Fleets |
| Stellar Scanner (`ssStellarScanner`) | 2,500 | Glass 1,500 (compound); Silicon 2,000 (resource); Neon 3,000 (resource) | 8 | Stellar Scanners; optional |

| Fleet unit | Base cash | Material costs | Limit / combat data |
|---|---:|---|---|
| Envoy (`fleetEnvoy`) | 2,000 | Hydrogen 8,000 (resource); Silicon 300 (resource); Titanium 120 (compound) | Maximum 1; joins neither attack nor defense. `envoyBuiltYet` enables diplomacy. |
| Scout (`fleetScout`) | 5,000 | Hydrogen 14,000 (resource); Silicon 1,000 (resource); Titanium 300 (compound) | Max 100,000; attack 2, defense 2, speed 5; +10% against air, countered by Aerialians. |
| Marauder (`fleetMarauder`) | 7,500 | Helium 14,000 (resource); Silicon 2,000 (resource); Titanium 600 (compound) | Max 100,000; attack 4, defense 3, speed 4; +15% against air, countered by Aerialians. |
| Land Stalker (`fleetLandStalker`) | 9,000 | Helium 22,000 (resource); Silicon 3,000 (resource); Titanium 900 (compound) | Max 100,000; attack 4, defense 0, speed 2; +20% against land, countered by Terrans. |
| Naval Strafer (`fleetNavalStrafer`) | 8,000 | Hydrogen 26,000 (resource); Silicon 4,000 (resource); Titanium 1,200 (compound) | Max 100,000; attack 6, defense 0, speed 1; +15% against sea, countered by Aquatic. |

Every fleet purchase multiplies that class's next cash/material prices by 1.13. Attack and defense aggregates are stored in `resourceData.fleets`; building a combat unit increments them by the data values and marks fleet composition changed since diplomacy. Supremacist `hangarAutomation` discounts fleet prices 5% per repeatable purchase; `syntheticPlating`, `antimatterEngineMiniaturization`, and `laserIntensityResearch` each change health, speed, and attack by their repeatable rules.

## Unlock and gate crosswalk

Research values below are `(appearsAt research points, research purchase price)`; source prerequisite names are included. They are visibility/progression rules, not purchase values for a part.

| Tech | Appears / price | Prerequisites | Space/interstellar effect |
|---|---:|---|---|
| Stellar Cartography | 700 / 800 | none | Interstellar tab/map foundation. |
| Atmospheric Telescopes | 9,000 / 10,000 | Glass Manufacture; Stellar Cartography | Space Mining tab/telescope progression. |
| Rocket Composites | 28,000 / 34,000 | Neutron Capture; Nano Tube Technology; Steel Foundries | Launch Pad/rocket workbench becomes visible. |
| Advanced Fuels | 25,000 / 30,000 | HydroCarbons; Neutron Capture; Advanced Power Generation | Enables rocket fuelling. |
| Planetary Navigation | 27,000 / 29,000 | Atmospheric Telescopes; Rocket Composites; Quantum Computing | Interstellar progression. |
| Orbital Construction | 45,000 / 50,000 | Planetary Navigation; Rocket Composites | Star Ship pane and Structural module. |
| Life Support Systems | 55,000 / 60,000 | Orbital Construction; Nano Tube Technology; Quantum Computing | Life Support module. |
| FTL Travel Theory | 60,000 / 65,000 | Neutron Capture; Planetary Navigation; Advanced Fuels | Travel progression. |
| Antimatter Engines | 65,000 / 78,000 | Orbital Construction; Neutron Capture; FTL Travel Theory | Antimatter Engine module. |
| Stellar Scanners | 70,000 / 72,000 | FTL Travel Theory; Orbital Construction | Optional scanner module. |
| Starship Fleets | 80,000 / 100,000 | FTL Travel Theory; Antimatter Engines; Orbital Construction | Hangar module and fleet section. |

Source data is `resourceDataObject.js` → `resourceData.techs`; visibility/application is `monitorTechTree()` and `checkAndRevealNewBuildings()` in `game.js`, and row gates in the two draw modules.

## Numerical reference scenarios (F-09)

All values below are direct evaluations of the observed formulas/data. Encounter, AP downgrade, star positions and weather remain random where noted.

| Scenario | Calculation | Result |
|---|---|---:|
| 1 light-year starship trip, default speed | `distance * starShipTravelSpeed`; default is 360,000ms/ly. | 360,000ms = 6 min; base fuel 5,000 antimatter; base AP 1. |
| 10 light-year trip | Fuel `round(5,000 + 150,000 * ((10−1)/99)^2.5)`; time `10 * 360,000`. | 5,374 antimatter; 3,600,000ms = 1 hour; 1 AP. |
| 50 light-year trip | Same distance formulas. AP's rounded pre-penalty result is 9; 20% branch can lower it by 1. | 30,852 antimatter; 18,000,000ms = 5 hours; 8 or 9 AP. |
| 100 light-year trip | Clamped maximum distance; AP has explicit `distance >= 97.5` maximum branch. | 155,000 antimatter; 36,000,000ms = 10 hours; 50 AP. |
| Travel modifiers at 10 ly | One Quantum Engines purchase divides duration by 2; one Expansionist Warp Drive purchase multiplies stored duration by 0.95. | 30 min with Quantum Engine; 57 min with Warp Drive (separate examples). |
| Rocket asteroid leg | `floor(asteroidDistance / 0.2)` ms. | At distance 100,000: 500,000ms = 8m20s. Generator range 30,000–570,000 yields 150,000–2,850,000ms (2m30s–47m30s). |
| Easiest rock, plain/F star | Ease 1 extraction is 0.004/tick; rate ratio is 100. | 0.4 antimatter/s plain; 0.6/s in F system; held boost doubles whichever rate applies. |
| Full Rocket 1 assembly from opening prices | For each of 12 parts, charge current cost then set next price to `ceil(cost * 1.13)` independently for all four lines. | Cash 25,694; Glass 25,694; Titanium 17,990; Steel 76,994 (before discounts). |
| First three consecutive asteroid surveys | Base 60s, then each later duration ×1.07. | 60s; 64.2s; 68.694s. |
| B-type production | Tier-2 10 autobuyers ×0.08/tick ×100 ticks/display-second. | +80/s resource output in a B system; zero B bonus after changing system. |
| Generated Extreme encounter example | `floor(population * 0.00000002197 * 100)`; with 100,000,000 population, split 60% primary then random remainder. | 219 total enemy ships before anomaly adjustments; mechanized hard-mode O star makes land primary; power uses air×2 + land×4 + sea×6. |

Source uses `starShipTravelSpeed = 360000` (six minutes per light-year); an adjacent old inline comment says `3600000` and “one real hour per light year.” The executable value and `calculateStarTravelDuration()` win for current behavior. The 20% AP reduction only runs when rounded AP is between 2 and 49; endpoints 1 and 50 are not reduced.

## F-08 source, save-scope, localization, and old-test map

Recommended scopes name the intended MIAPLACIDUS ownership; all legacy fields are currently restored from the single `gameState` object.

| Rule area | Source identifiers | Representative persisted fields → target scope | Translation key families / examples | Matching legacy test areas |
|---|---|---|---|---|
| Fixed star names/types; map and star reveal | `descriptions.js: starNames/getStarTypeByName`; `constantsAndGlobalVars.js: STAR_FIELD_SEED/NUMBER_OF_STARS`; `ui.js: generateStarfield`; `game.js: generateStarDataAndAddToDataObject/calculateAntimatterRequired/calculateAscendencyPoints` | Immutable 100-pair list, seed 80 and geometry are **content/constants** (not save). Revealed `starSystems.stars[star]` records, `currentStarSystem`, `starVisionDistance`, `starStudyRange`, `destinationStar` → **run**. `settledStars`, selected legacy meta/star assignments need explicit persistence decision. | `headerMainStarMap`, `headerMainStarData`, `textStarName/Type/Weather/Precipitation/Fuel/AscendencyPoints`, `starMapMode*`, `placeholderSearchStar`, `buttonTravel`. | `star-map`: `star-map-live.spec.js`, `star-list.spec.js`, `star-data-table.spec.js`; `star-types`: `star-types.spec.js`. |
| Weather tables, transition, launch gate | `resourceDataObject.js: starSystems/getStarSystemWeather`; `game.js: changeWeather/forceClearWeather`; `drawTab6Content.js: setFuellingVisibility` | Per-star `weather`, `weatherTendency`, `precipitationType`, `precipitationResourceCategory` and run current-system association → **run**; severe-period count/system → **run**; effect setting → **settings**. Live `currentStarSystemWeatherEfficiency` and `currentPrecipitationRate` are not saved in current legacy capture. | `weatherHeavyRain*`, `weatherVolcano*`, `textBadWeather`, `textReadyForLaunch`, weather notification keys; source data IDs `sunny/cloudy/rain/volcano` remain nonlocalized. | `star-map`: `star-data-weather.spec.js`; `weather`: `weather-live.spec.js`; `rockets`: `rockets-live.spec.js`. |
| Asteroid scan/class/mining | `game.js: discoverAsteroid/generateAsteroidData/getSpecificAsteroidExtractionRate/startTravelToAndFromAsteroidTimer`; `drawTab6Content.js: Asteroids/Mining` | `asteroidArray` (each name, distance, rarity, ease, quantity, originalQuantity, destroyed/beingMined), `miningObject`, `destinationAsteroid`, `rocketDirection`, search timer/remaining time → **run**; discovery/mined totals → **statistics**; Ascendency scanner/mining buffs → **permanent**. | `asteroidRarityCommon/Uncommon/Rare/Legendary`, `textAsteroid*`, `buttonScanAsteroids`, `notificationAsteroid*`, `{asteroid}`. | `space-mining`: `space-mining-live.spec.js`; `rockets`: `rockets-live.spec.js`; `antimatter`: area specs. |
| Rocket construction, fuel, travel | `resourceDataObject.js: space.upgrades.rocket1..4`; `game.js: gain/checkAndIncreasePrices/fuelRockets/launchRocket/startTravelToAndFromAsteroidTimer/resetRocketForNextJourney`; UI `createRocketUI` | `resourceData.space.upgrades.rocket*.builtParts/fuelQuantity`; `rocketsBuilt`, `rocketsFuellerStartedArray`, `launchedRockets`, `rocketUserName`, `destinationAsteroid`, `rocketDirection`, `rocketTravelDuration`, per-rocket remaining timers/readiness → **run**. `allTimeTotalRocketsBuilt/Launched` → **statistics**. | `rocketMinerName1..4`, `rocketDefaultName {index}`, `buttonBuildRocketPart/FuelRocket/Launch/Travel`, `textReadyForLaunch/textBadWeather`, `notificationRocket* {rocketName,destination}`. | `rockets`: `rockets-live.spec.js`, `rockets.spec.js`; `weather`: `weather-live.spec.js`. |
| Starship parts, interstellar travel, scan result | `resourceDataObject.js: space.upgrades.ss*`; `game.js: calculateStarTravelDuration/WithModifiers/startTravelToDestinationStarTimer/generateDestinationStarData`; `drawTab5Content.js: Star Ship` | Part completion in `resourceData.space.upgrades.ss*.builtParts`; `starShipModulesBuilt`, `starShipStatus`, destination/from/to/current star objects, `starShipTravelDistance`, timer remaining, `destinationStarScanned`, destination encounter record inside `starSystems.stars.destinationStar` → **run**; `allTimeTotalStarShipsBuilt/Launched` and travel totals → **statistics**; permanent AP/technology/buffs → **permanent**. | `starShipModule*`, `buttonBuildModule/ScanSystem/Travel`, `launchStarShipWarning*`, `textTravellingToStar {star}`, `notificationSystemScanned {star}`, scan labels `tab5*`/`label*`. | `starship`: `starship.spec.js`; `star-map`: `star-data-table.spec.js`; `offline-gains` covers timer recovery. |
| Fleet, diplomacy, battle, settlement | `resourceDataObject.js: fleetEnvoy/fleetScout/fleetMarauder/fleetLandStalker/fleetNavalStrafer/fleets`; `game.js: increaseAttackAndDefensePower/generateDestinationStarData/generateEnemyFleets/setEnemyFleetPower`; `drawTab5Content.js: Fleet Hangar/Colonise`; `ui.js: showEnterWarModeModal` | Fleet quantities/prices/aggregates, destination `enemyFleets`, `attitude/currentImpression/patience`, `battleUnits/battleResolved/warMode`, `destinationStarScanned`, `settledStars` → **run**; all-time conquest/battle/settlement counters → **statistics**; Envoy/settlement meta carryover requires explicit rebirth decision. | `fleetShip*`, `buttonBuild/Bully/Passive/Harmony/Vassalize/Conquest`, `labelFleet*`, `tab5*`, `battle*`, `enterWarMode*`, `modalBattle*`. | `fleet-hangar`: `fleet-hangar-live.spec.js`; `diplomacy`: `diplomacy-journey.spec.js`/`diplomacy.spec.js`; `battle`: `battle-live.spec.js`; `colonise`: `colonise-live.spec.js`/`settled-stars.spec.js`. |

Relevant persisted fields were verified in `captureGameStatusForSaving()`/`restoreGameStatus()` in `constantsAndGlobalVars.js`; notably the whole `resourceData`, `starSystems`, and `achievementsData` objects are copied, along with explicit rocket, telescope timer, starship, destination, fleet, battle, weather-streak, and lifetime-counter properties. Use the [local save contract](../plans/local-save-contract.md) for the remake's required run/permanent/settings/statistics split; do not mirror a monolithic legacy state tree.

## Observed gaps and decisions before parity changes

- The B/F/O effects and the neutral A/G/K/M set are executable rules. The old `tests/e2e/star-types/README.md` says “six types” are neutral, but its actual spec and current name/type table identify four (`A`, `G`, `K`, `M`); treat the README statement as stale.
- The initial Spica record omits `starType` while the catalog maps it to B; simulation uses B and the Star Data pane falls back to A. This is an observed source inconsistency, not an intentional redesign.
- The starship speed's assigned value (360,000 ms/ly) contradicts its nearby 3,600,000 comment. Keep the example anchored to executable value and obtain a product decision before changing it.
- Weather state's current per-run selection is transient on save/load even though its source table/streak persist. The remake needs a deliberate restore/advance rule and timer ownership.
- The rarity roll is 101 integer outcomes (`floor(random * 101)`), not a textbook 100%; percentages in the table are exact roll bands. The classes' endpoints overlap in resource quantity by design (e.g. 1,200 belongs to either neighboring rarity).
- Old area READMEs report green coverage, but these are existing test areas only; this task did not run them and they are not MIAPLACIDUS coverage.
