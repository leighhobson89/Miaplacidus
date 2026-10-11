# P-44 Statistics source-to-row crosswalk

Audit date: 11 October 2026. This inventory traces each of Cosmic Forge's 102 source Statistics labels through its target message-catalog ID to the `data-statistic-id` rendered by `SettingsStatisticsPane.tsx`. Source order is retained within each family. The shared Statistics help mapping and detailed Interstellar locale corrections are linked below.

The mapping follows `descriptions.js` `statisticsContent` and its `stats*SubHeading*` localization keys, the target row builders in `src/app/SettingsStatisticsPane.tsx`, and the corresponding target catalog functions. This is a label/render binding inventory; it does not certify value calculations or run/lifetime semantics.

## Statistics help

| Cosmic Forge source key | Target message ID | Rendered destination |
| --- | --- | --- |
| `headerDescStatistics` | `statisticsText(locale, "description")` (`statisticsMessages.description`) | Statistics intro paragraph below the page heading |

The source and target help text match in all six locales. The target heading uses `settingsSectionName(locale, "statistics")`.

## Source rows

### Overview (13)

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsOverviewSubHeading1` | `settingsStatisticLabel("activeTime")` | `activeTime` |
| `statsOverviewSubHeading2` | `settingsStatisticLabel("pioneer")` | `pioneer` |
| `statsOverviewSubHeading3` | `overviewStatisticLabel("currentAp")` | `ascendencyPoints` |
| `statsOverviewSubHeading4` | `overviewStatisticLabel("apGain")` | `apGain` |
| `statsOverviewSubHeading5` | `settingsStatisticLabel("runNumber")` | `runNumber` |
| `statsOverviewSubHeading6` | `overviewStatisticLabel("uniqueNewsTickers")` | `uniqueNewsTickers` |
| `statsOverviewSubHeading7` | `overviewStatisticLabel("tickerPrizes")` | `tickerPrizes` |
| `statsOverviewSubHeading8` | `settingsText("theme")` | `theme` |
| `statsOverviewSubHeading9` | `settingsStatisticLabel("lifetimeAntimatter")` | `lifetimeAntimatter` |
| `statsOverviewSubHeading10` | `overviewStatisticLabel("totalAsteroids")` | `totalAsteroids` |
| `statsOverviewSubHeading11` | `overviewStatisticLabel("legendaryAsteroids")` | `legendaryAsteroids` |
| `statsOverviewSubHeading12` | `overviewStatisticLabel("rocketsLaunched")` | `rocketsLaunched` |
| `statsOverviewSubHeading13` | `overviewStatisticLabel("starshipsLaunched")` | `starshipsLaunched` |

### Run (6)

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsRunSubHeading1` | `runStatisticLabel("runTime")` | `runTime` |
| `statsRunSubHeading2` | `runStatisticLabel("starSystem")` | `starSystem` |
| `statsRunSubHeading3` | `runStatisticLabel("currentWeather")` | `currentWeather` |
| `statsRunSubHeading4` | `runStatisticLabel("cash")` | `cash` |
| `statsRunSubHeading5` | `runStatisticLabel("apAnticipated")` | `apAnticipated` |
| `statsRunSubHeading6` | `runStatisticLabel("antimatter")` | `antimatter` |

### Events (13)

`statisticsEventLabel(locale, eventId)` supplies each localized label. The row ID is `event-${eventId}`.

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsEventsSubHeading1` | `statisticsEventLabel("powerPlantExplosion")` | `event-powerPlantExplosion` |
| `statsEventsSubHeading2` | `statisticsEventLabel("batteryExplosion")` | `event-batteryExplosion` |
| `statsEventsSubHeading3` | `statisticsEventLabel("scienceTheft")` | `event-scienceTheft` |
| `statsEventsSubHeading4` | `statisticsEventLabel("researchBreakthrough")` | `event-researchBreakthrough` |
| `statsEventsSubHeading5` | `statisticsEventLabel("rocketInstantArrival")` | `event-rocketInstantArrival` |
| `statsEventsSubHeading6` | `statisticsEventLabel("starshipLostInSpace")` | `event-starshipLostInSpace` |
| `statsEventsSubHeading7` | `statisticsEventLabel("antimatterReaction")` | `event-antimatterReaction` |
| `statsEventsSubHeading8` | `statisticsEventLabel("stockLoss")` | `event-stockLoss` |
| `statsEventsSubHeading9` | `statisticsEventLabel("galacticMarketLockdown")` | `event-galacticMarketLockdown` |
| `statsEventsSubHeading10` | `statisticsEventLabel("endlessSummer")` | `event-endlessSummer` |
| `statsEventsSubHeading11` | `statisticsEventLabel("minerBrokeDown")` | `event-minerBrokeDown` |
| `statsEventsSubHeading12` | `statisticsEventLabel("supplyChainDisruption")` | `event-supplyChainDisruption` |
| `statsEventsSubHeading13` | `statisticsEventLabel("blackHoleInstability")` | `event-blackHoleInstability` |

### Resources (8)

The target label uses `economyGoodName(locale, goodId)`; the target row ID uses `resourceProduction-${goodId}`.

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsResourcesSubHeading1` | `economyGoodName("hydrogen")` | `resourceProduction-hydrogen` |
| `statsResourcesSubHeading2` | `economyGoodName("helium")` | `resourceProduction-helium` |
| `statsResourcesSubHeading3` | `economyGoodName("carbon")` | `resourceProduction-carbon` |
| `statsResourcesSubHeading4` | `economyGoodName("neon")` | `resourceProduction-neon` |
| `statsResourcesSubHeading5` | `economyGoodName("oxygen")` | `resourceProduction-oxygen` |
| `statsResourcesSubHeading6` | `economyGoodName("sodium")` | `resourceProduction-sodium` |
| `statsResourcesSubHeading7` | `economyGoodName("silicon")` | `resourceProduction-silicon` |
| `statsResourcesSubHeading8` | `economyGoodName("iron")` | `resourceProduction-iron` |

### Compounds (6)

The target label uses `economyGoodName(locale, goodId)`; the target row ID uses `compoundProduction-${goodId}`.

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsCompoundsSubHeading1` | `economyGoodName("diesel")` | `compoundProduction-diesel` |
| `statsCompoundsSubHeading2` | `economyGoodName("glass")` | `compoundProduction-glass` |
| `statsCompoundsSubHeading3` | `economyGoodName("steel")` | `compoundProduction-steel` |
| `statsCompoundsSubHeading4` | `economyGoodName("concrete")` | `compoundProduction-concrete` |
| `statsCompoundsSubHeading5` | `economyGoodName("water")` | `compoundProduction-water` |
| `statsCompoundsSubHeading6` | `economyGoodName("titanium")` | `compoundProduction-titanium` |

### Research (5)

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsResearchSubHeading1` | `settingsStatisticLabel("researchPointsEarned")` | `researchPointsEarned` |
| `statsResearchSubHeading2` | `settingsStatisticLabel("scienceKitsBuilt")` | `scienceKitsBuilt` |
| `statsResearchSubHeading3` | `settingsStatisticLabel("scienceClubsBuilt")` | `scienceClubsBuilt` |
| `statsResearchSubHeading4` | `settingsStatisticLabel("scienceLabsBuilt")` | `scienceLabsBuilt` |
| `statsResearchSubHeading5` | `settingsStatisticLabel("techsUnlocked")` | `techsUnlocked` |

### Energy (12)

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsEnergySubHeading1` | `energyStatisticLabel("powerCurrent")` | `powerCurrent` |
| `statsEnergySubHeading2` | `energyStatisticLabel("totalEnergy")` | `totalEnergy` |
| `statsEnergySubHeading3` | `energyStatisticLabel("totalProduction")` | `totalProduction` |
| `statsEnergySubHeading4` | `energyStatisticLabel("totalConsumption")` | `totalConsumption` |
| `statsEnergySubHeading5` | `energyStatisticLabel("totalBatteryStorage")` | `totalBatteryStorage` |
| `statsEnergySubHeading6` | `energyStatisticLabel("energyTrips")` | `energyTrips` |
| `statsEnergySubHeading7` | `energyStatisticLabel("basicPowerPlants")` | `basicPowerPlants` |
| `statsEnergySubHeading8` | `energyStatisticLabel("advancedPowerPlants")` | `advancedPowerPlants` |
| `statsEnergySubHeading9` | `energyStatisticLabel("solarPowerPlants")` | `solarPowerPlants` |
| `statsEnergySubHeading10` | `energyStatisticLabel("sodiumIonBatteries")` | `sodiumIonBatteries` |
| `statsEnergySubHeading11` | `energyStatisticLabel("battery2")` | `battery2` |
| `statsEnergySubHeading12` | `energyStatisticLabel("battery3")` | `battery3` |

### Space Mining (5)

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsSpaceMiningSubHeading1` | `settingsStatisticLabel("spaceTelescopeBuilt")` | `spaceTelescopeBuilt` |
| `statsSpaceMiningSubHeading2` | `settingsStatisticLabel("launchPadBuilt")` | `launchPadBuilt` |
| `statsSpaceMiningSubHeading3` | `settingsStatisticLabel("rocketsBuilt")` | `rocketsBuilt` |
| `statsSpaceMiningSubHeading4` | `settingsStatisticLabel("asteroidsFound")` | `asteroidsFound` |
| `statsSpaceMiningSubHeading5` | `settingsStatisticLabel("asteroidsMined")` | `asteroidsMined` |

### Interstellar (17)

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsInterstellarSubHeading1` | `interstellarStatisticLabel("starStudyRange")` | `starStudyRange` |
| `statsInterstellarSubHeading2` | `interstellarStatisticLabel("starShipBuilt")` | `starShipBuilt` |
| `statsInterstellarSubHeading3` | `interstellarStatisticLabel("starshipDistanceTravelled")` | `starshipDistanceTravelled` |
| `statsInterstellarSubHeading4` | `interstellarStatisticLabel("systemScanned")` | `systemScanned` |
| `statsInterstellarSubHeading5` | `interstellarStatisticLabel("fleetAttackStrength")` | `fleetAttackStrength` |
| `statsInterstellarSubHeading6` | `interstellarStatisticLabel("envoy")` | `envoy` |
| `statsInterstellarSubHeading7` | `interstellarStatisticLabel("scout")` | `scout` |
| `statsInterstellarSubHeading8` | `interstellarStatisticLabel("marauder")` | `marauder` |
| `statsInterstellarSubHeading9` | `interstellarStatisticLabel("landStalker")` | `landStalker` |
| `statsInterstellarSubHeading10` | `interstellarStatisticLabel("navalStrafer")` | `navalStrafer` |
| `statsInterstellarSubHeading11` | `interstellarStatisticLabel("enemy")` | `enemy` |
| `statsInterstellarSubHeading12` | `interstellarStatisticLabel("enemyDefenceOvercome")` | `enemyDefenceOvercome` |
| `statsInterstellarSubHeading13` | `interstellarStatisticLabel("enemyDefenceRemaining")` | `enemyDefenceRemaining` |
| `statsInterstellarSubHeading14` | `interstellarStatisticLabel("apFromStarVoyage")` | `apFromStarVoyage` |
| `statsInterstellarSubHeading15` | `interstellarStatisticLabel("blackHoleDiscovered")` | `blackHoleDiscovered` |
| `statsInterstellarSubHeading16` | `interstellarStatisticLabel("blackHoleAlwaysActive")` | `blackHoleAlwaysActive` |
| `statsInterstellarSubHeading17` | `interstellarStatisticLabel("blackHoleStrength")` | `blackHoleStrength` |

The extra target row `systemsSettled` is remake-only and is outside the 102 source rows. The [Interstellar source-label audit](p44-statistics-interstellar-label-audit-2026-10-11.md) records the six-locale correction list.

### Galactic Casino (10)

Each row uses `settingsStatisticLabel(locale, id)` with the same ID as its rendered row.

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsGalacticcasinoSubHeading1` | `settingsStatisticLabel("casinoPointsSpent")` | `casinoPointsSpent` |
| `statsGalacticcasinoSubHeading2` | `settingsStatisticLabel("doubleOrNothingPlayed")` | `doubleOrNothingPlayed` |
| `statsGalacticcasinoSubHeading3` | `settingsStatisticLabel("doubleOrNothingWon")` | `doubleOrNothingWon` |
| `statsGalacticcasinoSubHeading4` | `settingsStatisticLabel("wheelPlayed")` | `wheelPlayed` |
| `statsGalacticcasinoSubHeading5` | `settingsStatisticLabel("wheelWon")` | `wheelWon` |
| `statsGalacticcasinoSubHeading6` | `settingsStatisticLabel("wheelSpecialWon")` | `wheelSpecialWon` |
| `statsGalacticcasinoSubHeading7` | `settingsStatisticLabel("higherLowerPlayed")` | `higherLowerPlayed` |
| `statsGalacticcasinoSubHeading8` | `settingsStatisticLabel("higherLowerWon")` | `higherLowerWon` |
| `statsGalacticcasinoSubHeading9` | `settingsStatisticLabel("voidSeerPlayed")` | `voidSeerPlayed` |
| `statsGalacticcasinoSubHeading10` | `settingsStatisticLabel("voidSeerWon")` | `voidSeerWon` |

### Cosmic Rip Chapter (7)

Each row uses `settingsStatisticLabel(locale, id)` with the same ID as its rendered row.

| Cosmic Forge source key | Target message ID | Rendered `data-statistic-id` |
| --- | --- | --- |
| `statsCosmicripchapterSubHeading1` | `settingsStatisticLabel("cosmicRipGalacticPointsEarned")` | `cosmicRipGalacticPointsEarned` |
| `statsCosmicripchapterSubHeading2` | `settingsStatisticLabel("cosmicRipGpSpent")` | `cosmicRipGpSpent` |
| `statsCosmicripchapterSubHeading3` | `settingsStatisticLabel("cosmicRipTelemetryEarned")` | `cosmicRipTelemetryEarned` |
| `statsCosmicripchapterSubHeading4` | `settingsStatisticLabel("cosmicRipChapterUnlocked")` | `cosmicRipChapterUnlocked` |
| `statsCosmicripchapterSubHeading5` | `settingsStatisticLabel("cosmicRipScannerRestored")` | `cosmicRipScannerRestored` |
| `statsCosmicripchapterSubHeading6` | `settingsStatisticLabel("cosmicRipLocated")` | `cosmicRipLocated` |
| `statsCosmicripchapterSubHeading7` | `settingsStatisticLabel("cosmicRipStabilised")` | `cosmicRipStabilised` |

## Audit result and boundaries

The crosswalk covers all 102 source rows across 11 source families. The target adds 18 rows outside that source set: `systemsSettled` (1), Current Snapshot (8), Cosmic Rip Live Status (5), and Lifetime (4), for 120 rendered target cards. Existing event, Overview Run, Research, Energy, and Interstellar source-label corrections are recorded in [Statistics presentation parity](statistics-presentation-parity.md) and the linked Interstellar audit. This pass found no additional confirmed message-ID-to-row binding or label mismatch among the Overview, Run, resource/compound, Space Mining, Galactic Casino, or Cosmic Rip families. The row IDs and rendered bindings remain unchanged.

No tests, assertions, browser runs, builds, typechecks, or formatting were run.
