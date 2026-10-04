# Foundation meta-progression and endgame catalogue

**Coverage:** foundation checklist F-07–F-09, plus the Tab 7–8 pane inventory requested for F-02 and behavior-claim distinctions for F-10.  
**Source snapshot:** read-only `../cosmicForge/cosmicForge/`, commit `93e32669c3b35e76cdd4cf82725c14e7215b2fbc` (17 September 2026).  
**Method:** static trace of current source, localization data, current tests and older design/bug documents; this is not a runtime verification or a claim that old tests currently pass.

Use the current source as the behavior baseline. The reference has no formal run/permanent/settings/statistics state schema; “scope” below describes observed rebirth behavior and a recommended MIAPLACIDUS owner, not an existing type system. Definitions and mutable state are interleaved in `resourceDataObject.js` and `constantsAndGlobalVars.js`.

## F-02 — Tab 7–8 pane inventory

`index.html` supplies the menu element IDs; `ui.js` dispatches to `drawTab7Content.js` / `drawTab8Content.js` by the current pane heading. These DOM IDs are stable pane identities for this inventory. Tab 7's old menu mostly uses `tab7.optionN` classes rather than `data-option-pane`; only Black Hole has an explicit `data-option-pane`. Tab 8 uses explicit values. Display labels localize and must not become rule IDs.

| Pane ID / current English label | Main action | Visible values / feedback | Gate and confirmation surface |
|---|---|---|---|
| `#rebirthOption` — Rebirth | Confirm a rebirth; optionally authorize liquidation for AP in the same pane | AP balance/carry-over and liquidation AP preview | Tab 7 becomes available after AP is awarded. Rebirth button requires `rebirthPossible` plus a destination with `starCode`; rebirth confirmation has confirm/cancel. Liquidation has a separate yes/no authorization and confirm button. |
| `#galacticMarketOption` — Galactic Market | Select outgoing/incoming stock, quantity, confirm trade; buy/sell AP or liquidate assets | Outgoing/incoming quantities and items, commission, AP/cash previews, market values | Tab 7 gate; each trade is gated by valid selection, holdings and market affordability. Trade is summarized inline before confirm; action feedback uses notifications. |
| `#ascendencyOption` — Ascendency Perks | Buy a permanent AP perk | AP cost, purchased/not-purchased or bought count, rebuyable/maxed status | Tab 7 gate and enough AP; maxed perks cannot be purchased again. Feedback is in the row/status and notifications. |
| `#megastructuresOption` — Megastructures | Inspect four megastructure diagrams and tech-stage table; research techs | Per-structure state, researched stage, force-field illustration and unlock state | Megastructure pane unlocks when a factory/megastructure system is conquered; each tech follows its research threshold and previous-stage prerequisite. Research uses the normal confirmation/notification and timer surfaces where applicable. |
| `#blackholeOption` (`data-option-pane="black hole"`) — Black Hole | Research, charge, activate/time-warp; buy power, duration and recharge upgrades | Charge and warp progress, multiplier, duration/recharge, charge-ready state | Black-hole discovery and research gates; activation requires a ready charge. Research and upgrades require their listed resources/cash. Charge/time-warp progress rows and notifications provide feedback. |
| `#galacticCasinoOption` — Galactic Casino | Buy Casino Points (CP), play four games and claim eligible specials | CP balance and purchase cost preview; game stakes/results/prize previews; wheel claim state | Casino unlock flag; purchases and games require valid selection and sufficient currency/CP. Wheel special dropdown/claim is enabled only after the special segment, while not spinning, and the chosen prize is still eligible. Games report outcomes with notifications. |
| `#cosmicRipSituationOption` (`data-option-pane="situation"`) — Situation | Restore the Near Space Scanner Array; inspect rip status/objective; close the Rip when ready | GP balance, restored/not-located/found status, next objective and tech progress; close cost | Cosmic Rip tech/build flag. Restore requires Miaplacidus settled and 10 GP. Close row appears only after all five Rip techs; it costs 1 GP. Closing opens an ending modal and then the win cinematic. |
| `#cosmicRipNearSpaceScannerArrayOption` (`data-option-pane="near space scanner array"`) — Near Space Scanner Array | Scan one of nine sectors; deploy Sensor Buoys and Rip Research Orbiters | Sector map/scanned state, GP scan cost, upgrade quantities, telemetry rate and total | Pane is hidden until the scanner is restored; each unscanned sector requires 1 GP. Upgrade purchases require their cash/material costs. Finding the Rip exposes the Cosmic Rip pane. |
| `#cosmicRipCosmicRipOption` (`data-option-pane="cosmic rip"`) — Cosmic Rip | Research the five stabilization technologies | Telemetry amount, each tech's telemetry/GP cost, prerequisite, progress timer and overall stabilization percentage | Pane is hidden until the Rip is found. Every tech requires its telemetry threshold/price, 1 GP and the prior tech; research timer completion unlocks the next stage. The close action becomes available after all five. |

The Tab 7 gate itself is `apAwardedThisRun`; individual menu entries use additional flags/progression checks. Tab 8 requires the `cosmicRip` technology and is also controlled by the source build flag. The remake product decision keeps Cosmic Rip gameplay in scope.

## F-07 — meta-progression catalogue

### AP, rebirth and GP

| Rule | Current source behavior | Mutable state and rebirth scope |
|---|---|---|
| AP award | `calculateAscendencyPoints(distance)` uses a 1–100 LY range, exponent 2.5, rounded base 1–49 AP; distance `>=97.5` returns 50. For rounded awards strictly between 1 and 50, a 20% roll subtracts `ceil(AP × 0.1)` (minimum 1). `settleSystemAfterBattle(accessPoint)` multiplies a battle/surrender award by 2, and multiplies again by 2 for an O-type or factory star. `getAscendencyPointsWithRepeatableBonus` adds the VoidBorn repeatable rank as a flat AP amount on runs after the first. Award is once per run (`apAwardedThisRun`). | `resourceData.ascendencyPoints.quantity` is carried through `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack`; spend/purchase/other award paths also use it. `apAwardedThisRun` resets. |
| Rebirth eligibility/action | `rebirthPreconditionsMet()` requires `rebirthPossible` and a destination star code. `rebirth()` adopts the destination as the new system, records a rebirth, grants GP, runs global/resource/achievement resets, restores permanent progress, starts the next run and reinitializes weather/UI. | Run fields reset; current AP is saved before rebuilding resource data and restored afterward. Confirm modal shows AP carry-over and GP gain once Cosmic Rip is unlocked. |
| GP balance | `cosmicRip.js` defines 10 GP to restore the scanner and 1 GP per sector scan. `game.js` keeps the balance aligned to settled systems minus the starting system and GP spent (`settledStars.length - 1 - galacticPointsSpent`); a rebirth adds one for the conquered destination plus each extra Expansionist system settled. | `resourceData.cosmicRip` is snapshotted and restored across rebirth. `galacticPointsSpent` is a persistent balance-driving counter. Rebirth GP grant and later GP sinks are permanent progression. |
| Explicit carried meta | Resource reset restores the prior AP; black-hole research/power/duration/recharge; Cosmic Rip snapshot; megastructure research; permanent buff effects; philosophy repeatables from later runs; and selected automation settings from `REBIRTH_PERSISTED_AUTOMATION`. `resetAllVariablesOnRebirth()` restores base-run flags and optionally the unlocked Cosmic Rip tab. | Encode each field explicitly as permanent, run, settings or statistics in MIAPLACIDUS. The source's restore list is not a complete declarative schema. Casino CP is explicitly set to 0 after rebirth. |

### Permanent Ascendency perks

Source catalogue: `resourceDataObject.js` `ascendencyBuffs`; purchase/cost: `getAscendencyBuffCost`, `isAscendencyBuffMaxed`, `purchaseBuff` in `resourceDataObject.js` / `game.js`. One-off perks cost their base AP once; ordinary repeatables cost `baseCostAp × rebuyableIncreaseMultiple^boughtYet`; Nano Brokers uses its explicit `[15, 30, 50]` AP ladder. Non-Nano purchase caps are shown below. Effects follow the current English localization description and are behavior to extract, not GDD summaries.

| Stable key — displayed name | AP price / limit | Current effect |
|---|---:|---|
| `littleBagOfHydrogen` — Little Bag Of Hydrogen | 3; one-time | On rebirth, grants enough Hydrogen for one Tier 1 Hydrogen Auto Buyer. |
| `nonExhaustiveResources` — Non Exhaustive Resources | 10; one-time | On rebirth, grants enough of every resource for one Tier 1 Auto Buyer, expanding storage if needed. |
| `efficientStorage` — Efficient Storage | 10; ×2 price; 3 | Adds another doubling to storage increases, once per purchase. |
| `smartAutoBuyers` — Smart Auto Buyers | 15; ×2; effectively uncapped | Auto Buyer efficiency +50% per purchase. |
| `jumpstartResearch` — Jumpstart Research | 30; one-time | Grants technologies priced up to 4,200 research on rebirth. |
| `optimizedPowerGrids` — Optimized Power Grids | 15; ×2; effectively uncapped | Increases power-grid-upgrade effectiveness by 20% per purchase. |
| `nanoBrokers` — Nano Brokers | 15 / 30 / 50; 3 | Levels unlock auto-selling a production share, auto-create compounds, then compound Auto Buyers. |
| `roboticResearchAutomation` — Robotic Research Automation | 20; one-time | Enables automatic research when prerequisites are met. |
| `fasterAsteroidScan` — Faster Asteroid Scan | 20; ×1.2; 4 | Asteroid Search duration −25% per purchase. |
| `deeperStarStudy` — Deeper Star Study | 50; ×2; 3 | Doubles star-study reveal range per purchase. |
| `asteroidScannerBoost` — Asteroid Scanner Boost | 20; ×1; 2 | Raises minimum asteroid rarity by one step per purchase. |
| `rocketFuelOptimization` — Rocket Fuel Optimization | 40; one-time | Rocket fueling duration −50%. |
| `enhancedMining` — Enhanced Mining | 15; ×2; 4 | Antimatter extraction efficiency +25% per purchase. |
| `quantumEngines` — Quantum Engines | 15; ×2; 6 | Halves starship travel time per purchase. |
| `autoSpaceTelescope` — Auto Space Telescope | 40; one-time | Enables automatic star study. |
| `bulkPurchasing` — Bulk Purchasing | 3; one-time | Adds Max purchase controls to repeatable purchases (buyers, batteries/plants, research buildings, miners, starship/fleet parts and philosophy repeatables). |

### Four philosophy paths

Path selection is permanent for the save (selection dialogue occurs on the first run); each path has a 500,000-research special ability and four repeatable technologies. Repeatable tech data starts at 10,000 research apiece, with subsequent price changes handled by the named price setter; each repurchase advances the path's repeatable multiplier. The UI copy gives the per-purchase effects below.

| Path / ability key | Ability | Repeatables (each one purchase) |
|---|---|---|
| Constructor — `spaceStorageTankResearch` | Storage research; base storage increases ×5 instead of ×2. | `efficientAssembly`: space-building costs −1%; `laserMining`: resource Auto Buyer costs −5%; `massCompoundAssembly`: compound recipe costs −5%; `energyDrones`: energy/research building costs −5%. |
| Supremacist — `fleetHolograms` | May vassalize when fleet power is more than 3× enemy power, independent of leader traits. | `hangarAutomation`: fleet costs −5%; `syntheticPlating`: fleet health +5%; `antimatterEngineMinaturization`: fleet speed +5%; `laserIntensityResearch`: newly built ship attack +5%. |
| VoidBorn — `voidSeers` | Telescope can scan the Void for immediate resource/compound rewards. | `stellarWhispers`: initial alien impression +1%; `stellarInsightManifold`: star-study speed +1%; `asteroidDwellers`: asteroid-search speed +1%; `ascendencyPhilosophy`: base AP +1 (implemented as flat rank bonus after run 1). |
| Expansionist — `rapidExpansion` | Chance to settle up to three extra nearby systems after a conquest; peaceful/lifeless settlement does not trigger it. Extra systems increase that rebirth's GP award. | `spaceElevator`: starship part costs −5%; `launchPadMassProduction`: rocket part costs −5%; `asteroidAttractors`: rocket travel time −5%; `warpDrive`: starship travel time −5%. |

Source data: `resourceDataObject.js` `philosophyRepeatableTechs`; choices/UI: `game.js` and `drawTab3Content.js`; reset/preservation: `resourceDataObject.js` `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack()`. Representative state: `philosophy`, `philosophyAbilityActive`, `repeatableTechMultipliers`, and `philosophyRepeatableTechs[philosophy][tech].{multiplier,price}`. The four names and full effect text are localization keys, not save IDs.

### Achievement catalogue and rewards

Current `achievementsData` contains **70** entries. Conditions can be ordinary resource/unlock/tech/building/cash thresholds or named functions in `achievements.js`; success sets `active`, emits an achievement notification and applies `gives`. `resetAchievementsOnRebirth()` resets only definitions whose `resetOnRebirth` is true. Persistent reward types include AP, cash, antimatter, capped compound, multipliers, GP refunds and narrative-only `rewardString`s.

Compact inventory (`ID → current reward`; **run** means `resetOnRebirth:true`, **persistent** means false):

- **Resources, compounds and technology:** `collect50Hydrogen` → $10 (run); `collect1000Hydrogen` → $25 (run); `collect5000Carbon` → $150 (run); `collect50000Iron` → $1,800 (run); `collect100Precipitation` → $1,000 (run); `fuseElement` → $40 (run); `createSteel`, `createTitanium` → compound-creation recipe factor ×0.8 each (run); `unlockCompounds` → $200 (run); `researchTechnology` → $30 (run); `researchAllTechnologies` → 1 AP (persistent); `achieve100FusionEfficiency` → $500 (run); `collect100TitaniumAsPrecipitation` → 50 AP (persistent).
- **Energy, cash and ticker:** `buildPowerPlant` → resource-rate factor ×1.1 (run); `buildSolarPowerPlant` → resource-rate factor ×1.2 (run); `gain100Cash` → material/compound sale value ×1.1 (run); `gain10000Cash` → sale value ×1.2 (run); `gain100000Cash` → sale value ×1.2 (run); `gain1000000Cash` → sale value ×1.5 (run); `tripPower` → resource-rate factor ×1.1 (run); `seeAllNewsTickers` → permanent all-resource bonus +0.2 (persistent); `activateAllWackyNewsTickers` → permanent compound recipe factor ×0.8 (persistent).
- **Rockets, antimatter and star study:** `discoverLegendaryAsteroid` → $75,000 (run); `have4RocketsMiningAntimatter` → $100,000 (run); `discoverAsteroid` → compound recipe factor ×0.95 (run); `launchRocket` → resource-rate factor ×1.1 (run); `mineAllAntimatterAsteroid` → 150 antimatter (run); `studyStar` → recipe factor ×0.95 (run); `studyStarMoreThan5LYAway` → ×0.90 (run); `studyStarMoreThan20LYAway` → ×0.85 (run); `launchStarship` → $10,000 (run).
- **Interstellar, AP and rebirth:** `performGalacticMarketTransaction` → 1 AP (persistent); `trade10APForCash` → 5 AP (persistent); `initiateDiplomacyWithAlienRace` → resource-rate factor ×1.1 (run); `bullyEnemyIntoSubmission` / `vassalizeEnemy` / `conquerEnemy` → 1 AP each (persistent); `conquerHiveMindEnemy` → 2 AP; `conquerBelligerentEnemy` → 3 AP; `conquerEnemyWithoutScanning` → 2 AP (these four are persistent); `settleUnoccupiedSystem` → $50,000 (persistent); `discoverSystemWithNoLife` → $75,000 (persistent); `settleSystem` → no direct numeric reward (persistent); `spendAP` → resource-rate factor ×1.1 (run); `liquidateAllAssets` → no direct numeric reward (persistent); `rebirth` → permanent all-resource bonus +0.3 (persistent); `conquer10StarSystems` → 10 AP; `conquer50StarSystems` → 100 AP; `studyAllStarsInOneRun` → no direct numeric reward (all persistent); `adoptPhilosophy` → narrative Pride reward (persistent); `have50HoursWithOnePioneer` → 50 AP (persistent).
- **Black hole, manuscripts and megastructures:** `discoverBlackHole` → $1,000,000 (persistent); `activateBlackHoleOver10x` → double all resources up to caps (persistent); `findAncientManuscript` → double all compounds up to caps (persistent); `conquerMegastructureSystem` → $1,000,000 (persistent); `bringDownMiaplacideanForceField` → 100 AP (persistent); `completeGame` → narrative Pride reward (persistent); `completeRunOnMiaplacidus` → narrative “Glutton for Punishment” reward (persistent).
- **Fleet, casino and Cosmic Rip:** `haveFleetSizeOf50EachShipType` → 1,000,000 Titanium, capped at store capacity (run); `tryAllThemes`, `buyCasinoPoints`, `winAllCasinoGames`, `winWheelSpecialPrize`, `restoreNearSpaceScannerArray`, `findCosmicRip`, `gain1MTelemetryData`, `closeCosmicRip`, `suffer5NegativeEvents`, `enjoyEndlessSummer`, `completeOnboarding` → narrative Pride reward (persistent). `winAllCasinoGames` and `completeRunOnMiaplacidus` also refund 1 GP in their award handlers.

The `gives`/`resetOnRebirth` values are the definitions in `resourceDataObject.js`; actual effect dispatch is `addAchievementBonus()` in `achievements.js`. Do not infer that a multiplier category means free currency: e.g. `gain100Cash` changes sale values, and narrative rewards do not grant AP/cash. Achievements also have themed badge assets in the legacy source; MIAPLACIDUS remakes those assets.

## F-07 — random events, casino and Cosmic Rip

### Random events and effects

`events.js` currently defines 13 event IDs. `initialProbability` is each eligible event's trigger probability, not a weighted pick probability: at each checkpoint the code picks uniformly among eligible events, then rolls that event's current probability. Default is 0.30; halfway checkpoint multiplies the chance by 0.5; after a trigger the event's own chance decays to 90% of its previous value, floored at 0.01. Global cycles last a random 45–75 minutes and have halfway/expiry attempts. This distinction matters for balance extraction.

| Event ID | Initial probability | Eligibility / effect |
|---|---:|---|
| `powerPlantExplosion` | 0.30 default | If any plant exists, destroys one randomly selected available plant. |
| `batteryExplosion` | 0.30 default | If a battery exists, destroys one unit of the highest battery tier owned. |
| `scienceTheft` | 0.50 | With research >1, removes `ceil(current / 2)`. |
| `researchBreakthrough` | 0.50 | Doubles research, floored to an integer. |
| `rocketInstantArrival` | 0.20 | Forces one travelling rocket to its normal arrival/return completion. |
| `starshipLostInSpace` | 0.10 | If an unscanned starship is travelling, resets ship/modules/fleet and restores base prices. |
| `antimatterReaction` | 0.10 | For a mining rocket, loses the asteroid's already mined antimatter, destroys that asteroid and resets the rocket. |
| `stockLoss` | 0.50 | Selects a stocked resource/compound and removes a random 40–80% of its quantity. |
| `galacticMarketLockdown` | 0.15 | If Galactic is unlocked, disables market for 30 minutes. |
| `endlessSummer` | 0.50 | Starts 40–50 minutes of sunny weather and resets the weather cycle to 10 seconds. |
| `minerBrokeDown` | 0.30 | Selects one active mining rocket; zeroes its mining rate for 15 minutes. |
| `supplyChainDisruption` | 0.30 | Selects an unlocked autobuyer-backed stock; reduces its production 60–80% for 15 minutes. |
| `blackHoleInstability` | 0.30 | After black-hole research, applies random 0.5–1.5 power and (unless always-on) duration multipliers, then shifts again each elapsed minute for a random 15–25 minute effect. |

Instant/timed history, event-specific `timesTriggered/currentProbability`, and active timers live under `resourceData.randomEvents`; reset is through the resource reset path. Event IDs/eligibility/effects live in `randomEventDefinitions`; trigger and timers are `attemptTriggerAtCheckpoint()`, `startTimedEffect()` and `scheduleTimedEffectsTimer()`. Event modals, notifications and effects need a seeded random boundary in the remake.

### Galactic Casino and prizes

Current source has **four** games (the older GDD lists only three). CP defaults to 0, has a persistent balance/settings object, and uses `cpBaseCost=100000`; one CP is priced against the sale-value table for each supported resource/compound. `baseProbabilityCasino=0.4` is the default chance for probability outcomes.

| Game | Stake/cost and outcome | Prizes/state |
|---|---|---|
| `game1` Double or Nothing | Player stakes an integer CP amount; win adds 2× the stake after the stake was deducted, loss forfeits it. | Uses configured 0.4 default win probability; records games played/won. |
| `game2` Wheel of Fortune | 1 CP per spin. Of 16 equal segments, index 0 is special, 8 odd indices lose, and 7 nonzero even indices award a normal prize. | The normal pool is a uniform six-category draw followed by a category-specific eligible prize roll; unavailable categories fall back to 2 CP. A special result waits for explicit eligible prize selection + Claim. Full keys/formulas are in the appendix below. |
| `game3` Higher or Lower | 5 CP to start a nine-card run. Correct higher/lower guesses advance; a displayed tier can be cashed out once at least three cards have been revealed. | Two correct advances reveal tier 1. Each further correct advance changes the prize tier; final card automatically awards tier 7. A loss forfeits the 5 CP stake. Tier keys, cash-out semantics and formulas are in the appendix below. |
| `game4` Void Seer | Select a prize, then pay its catalog CP cost; two number reels must match. | `prize1`: 7 CP, reel 0–6, O-type star clue; `prize2`: 10 CP, reel 0–8, ancient-manuscript clue; `prize3`: 15 CP, reel 0–12, antimatter gain of 10–30% of current stock (at least 1). |

Wheel special stable keys: `special_100cp` (+100 CP); `special_100k_research` (+100,000 research); `special_double_titanium`, `special_double_steel`, `special_double_silicon`, `special_double_iron`, `special_double_sodium` (double current stock); `special_starship_warp`, `special_rocket_warp` (reduce eligible travel to a 2-second normal completion timer); `special_telescope_finish_asteroid_search`, `special_telescope_finish_star_study`, `special_telescope_finish_void_pillage` (finish an active task; Void pillage is VoidBorn-only). Higher-or-Lower tier-7 keys add `special_finish_rocket_journey` and `special_finish_starship_journey` and use the same telescope keys. Wheel special selection has 12 keys in total; only the selected key must still be eligible when claimed. The normal category pool and every Higher-or-Lower prize key are listed below.

#### Casino prize appendix: stable keys and exact award rules

**Wheel ordinary pool.** `awardRegularPrize(cost)` chooses each category key below with equal probability (one of six); there are no per-prize stable IDs inside the ordinary Wheel pool. The spin deducts 1 CP first. The `cp` category and all unavailable-category fallbacks therefore award `floor(cost × 2) = 2 CP` at the default one-CP cost.

| Category key | Exact candidate/quantity rule | Empty/ineligible outcome |
|---|---|---|
| `resources` | Uniformly choose an unlocked resource with `storageCapacity > quantity` (Hydrogen is added to the candidate list if absent from the unlocked list). Award a uniform integer from 1 through `min(storageCapacity − quantity, max(1, floor(quantity × 0.10)))`. | 2 CP. |
| `compounds` | Uniformly choose an unlocked compound with `storageCapacity > quantity`. Award a uniform integer from 1 through `min(storageCapacity − quantity, max(1, floor(quantity × 0.10)))`. | 2 CP. |
| `cash` | Award a uniform integer from 1 through `floor(currentCash × 0.05)`. | If the upper bound is 0 or less: 2 CP. |
| `research` | Award a uniform integer from 1 through `floor(currentResearch × 0.05)`. | If the upper bound is 0 or less: 2 CP. |
| `time` | Uniformly choose among active asteroid scan, star study, Void pillage, starship travel or rocket travel timers. Reduce the chosen timer by a uniform integer millisecond amount from 1 through `floor(remainingMs × 0.10)`, then restart it through its normal completion path. | If no eligible timer or the reduction upper bound is 0: 2 CP. |
| `cp` | `floor(cost × 2)` CP; for the current Wheel cost of 1 CP, this adds 2 CP after the 1 CP stake was deducted. | Not applicable. |

Special Wheel stable keys and award quantities: `special_100cp` = +100 CP; `special_100k_research` = +100,000 research; `special_double_titanium`, `special_double_steel`, `special_double_silicon`, `special_double_iron`, `special_double_sodium` = double the selected material's current quantity without regard to storage capacity; if the material is locked or cannot be doubled, +20 CP instead; `special_starship_warp` / `special_rocket_warp` = set eligible travel to a 2-second timer that follows normal completion; `special_finish_starship_journey` / `special_finish_rocket_journey` (Higher-or-Lower only) = run the normal journey completion immediately; `special_telescope_finish_asteroid_search`, `special_telescope_finish_star_study`, and `special_telescope_finish_void_pillage` = run the active telescope task's normal finish path immediately, with Void pillage restricted to VoidBorn. Wheel spin gives no special-prize choice unless index 0 is selected; its eligible selection list is the 12 Wheel keys from `drawTab7Content.js` (warps, three telescope finishes, +100 CP, five doubles, +100,000 research). The additional two journey-finish keys are Higher-or-Lower tier-7-only.

**Higher-or-Lower.** The game charges 5 CP once on start; cash-out returns only the selected prize and never refunds the stake. `revealedCount` maps to `tier = min(7, max(1, revealedCount − 2))`; cash-out first becomes available at 3 revealed cards (tier 1). There are five equally likely keys per tier. At the ninth card, the tier-7 prize is awarded automatically. A wrong guess ends the run without payout. Tier 7 utility prize keys that cannot complete an eligible journey/task award 150 CP.

| Tier | Stable prize key(s), equally selected within tier | Exact award |
|---:|---|---|
| 1 | `hilo_cp_5`; `hilo_cash_boost_small`; `hilo_research_boost_small`; `hilo_resource_topup`; `hilo_compound_topup` | +5 CP; +2% current cash; +2% current research; or a random unlocked resource/compound top-up using the same storage and 10%-of-stock cap as the Wheel. Percentage awards use `floor(current × rate)` and award nothing if that floors to 0; an unavailable top-up falls back to +5 CP. |
| 2 | `hilo_cp_10`; `hilo_cash_boost_medium`; `hilo_research_boost_medium`; `special_double_hydrogen`; `special_double_carbon` | +10 CP; +5% current cash/research (no award if `floor(current × 0.05) = 0`); or double current Hydrogen/Carbon. A locked/unavailable double uses the shared special handler's +20 CP fallback. |
| 3 | `hilo_cp_20`; `hilo_cash_boost_large`; `hilo_research_boost_large`; `special_double_iron`; `special_double_silicon` | +20 CP; +10% current cash/research (no award if `floor(current × 0.10) = 0`); or double current Iron/Silicon, with the shared +20 CP fallback if unavailable. |
| 4 | `hilo_cp_40`; `hilo_research_flat`; `hilo_cash_flat`; `special_double_steel`; `special_double_concrete` | +40 CP; +5,000 research; +5,000 cash; or double current Steel/Concrete, with the shared +20 CP fallback if unavailable. |
| 5 | `hilo_cp_70`; `hilo_research_big_flat`; `special_double_titanium`; `hilo_timewarp_25_20000`; `hilo_timewarp_50_15000` | +70 CP; +100,000 research; double current Titanium, with the shared +20 CP fallback if unavailable; or activate time warp at 25× for 20,000 ms / 50× for 15,000 ms. |
| 6 | `hilo_cp_100`; `hilo_research_mega`; `hilo_cash_mega`; `hilo_timewarp_75_15000`; `hilo_timewarp_100_12000` | +100 CP; +500,000 research; +250,000 cash; or activate time warp at 75× for 15,000 ms / 100× for 12,000 ms. |
| 7 | `special_finish_rocket_journey`; `special_finish_starship_journey`; `special_telescope_finish_asteroid_search`; `special_telescope_finish_star_study` (non-VoidBorn) **or** `special_telescope_finish_void_pillage` (VoidBorn); `hilo_timewarp_200_20000` | Finish one eligible rocket/starship journey or active telescope task through normal completion; unavailable journey/task prize → +150 CP. Time warp: 200× for 20,000 ms. |

Tier 1–6 key mappings and labels are assembled in `drawTab7Content.js`; awards are dispatched by `awardHiloPrize()`, with special keys delegated to `claimCasinoSpecialPrizeByKey()` in `casino.js`. The localization families include `hiloPrize*`, `casinoNotificationWheel*`, `casinoPrize*`, `casinoAward*`, `buttonCashOut`, and `notificationHilo*`. These are current-source observations; legacy casino specs are test-area pointers, not a claim that this source snapshot was run.

Timer prizes converge on normal completion handling through the shared timer finish/wrap helpers. The wheel revalidates its selected prize each tick; stale or ineligible timer prizes disable Claim/reset selection. Current mutable data: `galacticCasino.{settings.baseProbabilityCasino, casinoPoints.{quantity,cpBaseCost,valueOfOneCP}, casinoGamesWon}` plus run/lifetime counters in `constantsAndGlobalVars.js`. Rebirth explicitly resets CP quantity to zero. Source paths: `casino.js`, `drawTab7Content.js`, `constantsAndGlobalVars.js`, `resourceDataObject.js`.

### Cosmic Rip chapter

| Content | Current source data/rule |
|---|---|
| Unlock and scanner repair | Tab is behind the `cosmicRip` technology/build flag. Restore requires Miaplacidus in settled systems and 10 GP; `restoreNearSpaceScannerArray()` rejects repeat restore and not-enough-GP. |
| Sector search | Exactly 9 sectors; Rip location is seeded uniformly to one sector once. Each unscanned sector costs 1 GP; scanning the matching index marks the Rip found and sets achievement flags. |
| Telemetry upgrades | `sensorBuoy`: starts at $500,000 + 100,000 Titanium + 600,000 Silicon, telemetry rate +0.04/s each. `ripResearchOrbiter`: starts at $1,000,000 + 1,000,000 Helium + 1,000,000 Sodium + 500,000 Steel, +0.07/s each. Total rate is `0.04 × sensorBuoy.quantity + 0.07 × ripResearchOrbiter.quantity`. |
| Five techs | `stabilizerArray`: 5,000 appears threshold / 10,000 telemetry cost / 60s / no prior tech; `quantumContainmentField`: 12,000 / 15,000 / 120s / Stabilizer; `dimensionalAnchorMatrix`: 16,000 / 25,000 / 180s / Quantum Containment; `singularityStabilizer`: 30,000 / 40,000 / 240s / Dimensional Anchor; `realityWeaveRegulator`: 40,000 / 60,000 / 300s / Singularity Stabilizer. Every stage also costs 1 GP. “Appears at” is a reveal threshold; it is distinct from the listed research price. |
| Closure | Close row appears only when all five tech IDs are unlocked; close costs 1 GP, flags `closeCosmicRip` and `completeGame`, then opens modal/cinematic. Current achievement reward entries for both closure achievements are narrative-only Pride. |
| State | `resourceData.cosmicRip`: `galacticPoints`, `ripTelemetryData`, `nearSpaceScannerArrayRestored`, `ripLocationSectorIndex`, `ripFound`, `scanResultsBySectorIndex`, upgrades/techs. Full object snapshot is carried across rebirth. GP-spent count lives in `constantsAndGlobalVars.js`; research timers/progress also use the wider timer/global state. |

The five tech IDs, their appearance thresholds, research prices, durations and direct preconditions are in `resourceDataObject.js`; GP-sector operations are pure helpers in `cosmicRip.js`; cost/timer completion is split across `game.js` and `drawTab8Content.js`. Avoid confusing **in-game telemetry** with analytics collection: the former is gameplay currency; the product excludes the latter.

## F-08 — source ownership, save fields, localization and old test map

| Rule family | Current source functions/modules | Representative mutable fields (observed scope) | Localization key families | Matching old E2E area(s) |
|---|---|---|---|---|
| Rebirth/AP/GP | `game.js`: `calculateAscendencyPoints`, `settleSystemAfterBattle`, `rebirthPreconditionsMet`, `rebirth`; `resourceDataObject.js`: `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack` | AP quantity; `apAwardedThisRun`; `rebirthPossible`; philosophy path/ranks; Cosmic Rip GP; spent GP; destination/settled systems | `tab7Rebirth*`, `modalRebirth*`, `notificationRebirth*`, `labelAp*`, AP/GP currency labels | `rebirth`, `ascendency`, `galactic-market` |
| AP perks | `getAscendencyBuffCost`, `isAscendencyBuffMaxed`, `purchaseBuff`, `addPermanentBuffsBackInAfterRebirth` | `ascendencyBuffs[key].{boughtYet,...}`; effects distributed to resource/building/space fields; persistent | `buffName<Key>`, `buff<Key>Row`, `buff<Key>Content1`, `textBoughtTimes`, `textMaxed` | `ascendency` |
| Philosophy paths | `game.js` philosophy selection, `gain()`/price updates, `getAscendencyPointsWithRepeatableBonus`; `drawTab3Content.js`; `resourceDataObject.js` | `philosophy`; `philosophyAbilityActive`; `repeatableTechMultipliers`; philosophy tech `multiplier/price`; persisted across rebirth | `philosophyName*`, `techName*`, `techPhilosophy*Content1`, `notificationPhilosophy*`, special-ability copy | `philosophies`, `technology`, `rebirth` |
| Achievements | `achievements.js`: `checkForAchievements`, `genericAchievementChecker`, `grantAchievement`, `addAchievementBonus`, `resetAchievementsOnRebirth`; definitions in `resourceDataObject.js` | `achievementsData[id].active`; achievement-flag array; reward-specific counters/resource fields; per-definition `resetOnRebirth` | `achievement<Name/id>`, `achievementNotification<Name/id>`, dynamic achievement tooltip/description keys | `achievements`, `rebirth` |
| Random events | `events.js`: `randomEventDefinitions`, `attemptTriggerAtCheckpoint`, `startTimedEffect`, completion/history helpers | `resourceData.randomEvents.global`, `.events[id]`, `.timedEffects[id]`, histories; timer IDs; partly run-scoped | `eventName<Event>`, `eventDesc*`, `notificationRandomEvent*`, `notification<Event>*`, `stockLossReason*` | `random-events`, `news-ticker`, `black-hole`, plus affected areas (`energy`, `rockets`, `starship`, `resources`) |
| Casino | `casino.js` and `drawTab7Content.js`: CP buying, four game actions, `claimCasinoSpecialPrizeByKey`, timer finish helpers | `galacticCasino` object; CP resets on rebirth; `casinoGamesWon`; run/all-time stats and wheel claim state | `casino*`, `casinoPrize*`, `casinoAward*`, `notificationCasino*`, prize label templates | `galactic-casino`, `achievements`, `rebirth` |
| Megastructures/manuscripts | `game.js`: manuscript probability/roll, `applyMegaStructureBonuses`; definitions and tech paths in `resourceDataObject.js`; render in `drawTab7Content.js` | `starsWithAncientManuscripts`, factory-star assignments, researched `[structure,stage]` pairs, `miaplacidusMilestoneLevel`, permanent antimatter/infinite-power/storage/resource bonuses | `megastructure*`, `techName*`, `achievement*`, news manuscript clue templates | `megastructures`, `star-map`, `technology`, `achievements` |
| Cosmic Rip | `cosmicRip.js`: restore/scan; `game.js`: GP sync, cost checks, research timers/offline; `drawTab8Content.js`: panes/closure | `resourceData.cosmicRip.*`; GP-spent field; tech timer/progress; flags for unlock/animation | `tab8*`, `headerMainSituation`, `headerMainNearSpaceScannerArray`, `cosmicRipTechName*`, `textTelemetryData`, `notificationScannerArray*`, `notificationSectorScan*`, endgame modal keys | `cosmic-rip`, `achievements`, `offline-gains`, `rebirth` |
| Black-hole and tab gates | `game.js` charge/research/warp checks and `drawTab7Content.js`; gate dispatch in `ui.js` | `resourceData.blackHole.*`, research/unlock flags and charge/warp timer fields | `tab7BlackHole*`, `textBlackHole*`, `notificationBlackHole*`, `eventNameBlackHoleInstability` | `black-hole`, `random-events`, `offline-gains` |

Use old area specs/README as **test design and behavior leads**, not coverage credited to MIAPLACIDUS and not a fresh pass claim. The current source test taxonomy includes `tests/e2e/{rebirth,ascendency,philosophies,achievements,random-events,galactic-market,galactic-casino,megastructures,cosmic-rip,black-hole}`. No Cosmic Forge test suite was run for this catalogue.

## F-09 — reproducible source-number examples

1. **AP curve:** at 1 LY, `calculateAscendencyPoints(1) = 1`; at 50 LY the rounded base is 9, with an 80% result of 9 and 20% result of 8 (the reduction is `ceil(0.9)=1`); at 97.5 LY or farther it returns 50. On arrival, a battle/surrender doubles the star's stored AP; an O-type or factory star doubles again, so a 50 AP destination can present 100 or 200 base AP before the once-per-run guard (and before a VoidBorn flat repeatable bonus).
2. **One ordinary rebirth:** one conquered destination adds 1 GP; the expansionist ability can add one more per extra settled system. Rebirth carries the AP balance, resets CP to 0 and carries Cosmic Rip/black-hole/megastructure progression. This is not an AP-for-GP conversion: they are different currencies.
3. **Cosmic Rip minimum known sink:** restore scanner 10 GP, scan at least one of nine sectors 1 GP, five research stages 1 GP each, closure 1 GP: **17 GP** plus **150,000 telemetry** (10,000 + 15,000 + 25,000 + 40,000 + 60,000). Scanning all nine sectors before research instead makes this 25 GP. At one buoy plus one orbiter, telemetry is 0.11/s; 150,000 telemetry at a constant unwarped rate is about 1,363,636 seconds (15 days 18 hours 47 minutes), excluding offline/time modifiers and any additional upgrades.
4. **Manuscript thresholds:** current `game.js` gives each of the first four manuscript slots up to 20% per eligible study below vision thresholds 5, 20, 35 and 45 LY, and forces 100% when a study newly crosses the next threshold. Four is the `MAX_ANCIENT_MANUSCRIPTS` cap. So the first manuscript can arrive before 5 LY; crossing from below to 5 guarantees it if not already generated.
5. **Force-field milestone:** each of four mega-structure tracks grants its field-disconnect milestone on its third tech. Completing the third tech on three different structures yields milestone level 3; the fourth structure's third tech reaches 4, flags `bringDownMiaplacideanForceField`, and its achievement adds 100 AP. The fourth/fifth tech in a track may separately capture the structure and grant its long-term power/storage/resource bonus.

These examples intentionally expose where randomness, star traits, battle path, previous bonuses or time multipliers change the result. Use deterministic fixtures when turning them into remake tests.

## F-10 — evidence classes, stale claims and exclusions

| Claim / potential discrepancy | Evidence and classification | Handling |
|---|---|---|
| Old GDD says eight tabs and puts Menu/Settings at Tab 8. | **Stale GDD claim:** current `index.html` has nine tabs, Tab 8 Cosmic Rip and Tab 9 Settings. Current audit source contract/navigation inventory agrees. | Preserve the current nine-tab identity and Tab 8 gameplay. Do not use GDD's older tab count as a change request. |
| GDD lists Double or Nothing, Wheel and Higher or Lower. | **Incomplete GDD inventory:** current `drawTab7Content.js` includes a fourth game, Void Seer; prize catalog is `VOID_SEER_PRIZE_CATALOG` in `constantsAndGlobalVars.js`, with matching `galactic-casino` tests. | Carry all four current games. |
| GDD's force-field/Master AI prose implies a later battle and reclaim step. | **Documented narrative claim:** this file observes four field milestones from stage-three megastructure technologies and Cosmic Rip closure as the current complete-game flag/modal/cinematic. The GDD text alone does not establish a separate Master AI battle action. | Preserve observed actions and the shipped story/end routes; resolve any extra battle or narrative changes in an explicit feature decision. |
| “Manuscripts start at 5 LY” can be read as “none are possible before 5”. | **Current source + corrected test note:** `game.js` allows 20% before 5 and guarantees on crossing 5. `bugs.txt` (30 Aug 2026 resolution) says the old `megastructures-live.spec.js` assertion was inverted and should allow early discovery. This is test debt resolution, not a gameplay bug. | Implement the probability and crossing guarantee; don't encode a lower bound of 5 LY. |
| Old bug note/report says current behavior is broken or old green area indicates verified behavior. | **Historical evidence only:** `bugs.txt` marks past defects and test assertion corrections; audit README notes the suite wasn't rerun at the pinned source snapshot. | Check current code, keep genuine fixed behavior, and run remake area tests only when implemented. |
| Cloud saves, analytics, original-game saves, Electron/desktop packaging. | **Intentional product exclusions** in `docs/plans/open-decisions.md`. They do not remove CP, GP or telemetry as gameplay currencies. | Do not port collection endpoints or old save import. Keep Cosmic Rip telemetry as local game state. |
| Cosmic Forge's visual badge, structure, casino and other binary assets. | **Intentional product exclusion** in the owner decision: all visual/audio assets are remade. | Preserve the IDs, states and textual mechanics; create new licensed MIAPLACIDUS art/audio. |

Any proposed balance change to a number or rule in this catalogue requires an active feature plan with the source example, player effect and acceptance test. Current observed rules are the parity baseline; GDD statements remain separately labeled as documentation claims.
