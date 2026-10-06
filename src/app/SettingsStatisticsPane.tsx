import { COMPOUND_IDS, GALAXY_SEED_DEFAULT, MATERIAL_IDS } from "../content/ids";
import { ROCKET_IDS, ROCKET_PART_REQUIREMENTS } from "../content/space";
import { RANDOM_EVENT_IDS } from "../content/metaSignals";
import { COSMIC_RIP_SECTOR_COUNT, COSMIC_RIP_TECHNOLOGIES } from "../content/cosmicRip";
import { createStarCatalogue } from "../content/starCatalogue";
import type { GameState } from "../engine/state";
import { createEconomyTickPlan } from "../engine/economySimulation";
import { currentWeatherForSystem } from "../engine/weather";
import { economyGoodName } from "./economyDisplay";
import {
  settingsSectionName,
  settingsStatisticLabel,
  settingsText,
  themeName,
  type SettingsStatisticId,
} from "../i18n/settingsMessages";
import { randomEventName } from "../i18n/metaSignalMessages";
import { energyStatisticLabel, type EnergyStatisticId } from "../i18n/energyStatisticsMessages";
import {
  cosmicRipTrackingNote,
  energyTrackingNote,
  eventTrackingNote,
  overviewStatisticLabel,
  runStatisticLabel,
} from "../i18n/statisticsMessages";
import { topStatusText } from "../i18n/topStatusMessages";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { formatDuration } from "./timeFormatting";
import { selectInterstellarStatistics, selectRunApAnticipated } from "../engine/selectors";
import {
  compoundPaneItems,
  cosmicRipPaneItems,
  energyPaneItems,
  galacticPaneItems,
  interstellarPaneItems,
  researchPaneItems,
  resourcePaneItems,
  settingsPaneItems,
  spaceMiningPaneItems,
} from "./presentationNavigation";
import {
  interstellarStatisticLabel,
  interstellarStatisticsTrackingNote,
  type InterstellarStatisticId,
} from "../i18n/interstellarStatisticsMessages";

type StatisticsDisplayRow =
  | {
      readonly id?: string;
      readonly label: string;
      readonly value: string;
      readonly ownerPaneId?: string;
    }
  | {
      readonly id?: string;
      readonly label: string;
      readonly currentRun: string;
      readonly lifetime: string;
      readonly ownerPaneId?: string;
    };

export function SettingsStatisticsPane({
  state,
  onNavigateToPane,
}: {
  readonly state: GameState;
  readonly onNavigateToPane?: (paneId: string) => void;
}) {
  const locale = state.settings.locale;
  const statNumber = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
  const money = (value: number) =>
    formatCurrency(locale, value, state.settings.currencyId ?? "usd", 2, state.settings.notation);
  const totalResources = MATERIAL_IDS.reduce(
    (total, id) => total + state.run.goods[id].quantity,
    0,
  );
  const totalCompounds = COMPOUND_IDS.reduce(
    (total, id) => total + state.run.goods[id].quantity,
    0,
  );
  const casino = state.run.casinoStats;
  const lifetimeCasino = state.permanent.galacticCasino.lifetimeStats;
  const cosmicRip = state.permanent.cosmicRip;
  const energyPlan = createEconomyTickPlan(state);
  const interstellar = selectInterstellarStatistics(state);
  const technologies = state.run.economy.researchedTechnologies;
  const energyUnlocked = technologies.includes("basicPowerGeneration");
  const compoundsUnlocked = technologies.includes("compounds");
  const spaceMiningUnlocked = technologies.includes("atmosphericTelescopes");
  const interstellarAvailable = technologies.includes("stellarCartography");
  const galacticAvailable =
    state.run.space.ascendencyAwardedThisRun || state.permanent.rebirthCount > 0;
  const availableOwnerPaneIds = new Set([
    ...resourcePaneItems(locale, state.run.unlockedResources).map((item) => item.id),
    ...researchPaneItems(locale, false).map((item) => item.id),
    ...(energyUnlocked ? energyPaneItems(locale, technologies).map((item) => item.id) : []),
    ...(compoundsUnlocked
      ? compoundPaneItems(locale, state.run.economy.unlockedCompounds).map((item) => item.id)
      : []),
    ...(spaceMiningUnlocked ? spaceMiningPaneItems(locale, state).map((item) => item.id) : []),
    ...(interstellarAvailable ? interstellarPaneItems(locale, state).map((item) => item.id) : []),
    ...(galacticAvailable ? galacticPaneItems(locale, state).map((item) => item.id) : []),
    ...(cosmicRip.unlocked ? cosmicRipPaneItems(locale, state).map((item) => item.id) : []),
    ...settingsPaneItems(locale).map((item) => item.id),
  ]);
  const valueRow = (
    id: string,
    label: string,
    value: string,
    ownerPaneId?: string,
  ): StatisticsDisplayRow => ({
    id,
    label,
    value,
    ...(ownerPaneId && availableOwnerPaneIds.has(ownerPaneId) ? { ownerPaneId } : {}),
  });
  const statRow = (
    id: SettingsStatisticId,
    value: string,
    ownerPaneId?: string,
  ): StatisticsDisplayRow => valueRow(id, settingsStatisticLabel(locale, id), value, ownerPaneId);
  const casinoRow = (id: SettingsStatisticId, key: keyof typeof casino): StatisticsDisplayRow => ({
    id,
    label: settingsStatisticLabel(locale, id),
    currentRun: statNumber(casino[key]),
    lifetime: statNumber(lifetimeCasino[key]),
    ...(availableOwnerPaneIds.has("galactic-casino") ? { ownerPaneId: "galactic-casino" } : {}),
  });

  const currentSystem = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (star) =>
      star.id === state.run.space.currentSystemId ||
      star.name.toLocaleLowerCase("en") === state.run.space.currentSystemId.toLocaleLowerCase("en"),
  );
  const currentWeather = currentWeatherForSystem(state.run.space);
  const weatherLabel = {
    clear: topStatusText(locale, "weatherClear"),
    cloudy: topStatusText(locale, "weatherCloudy"),
    rain: topStatusText(locale, "weatherRain"),
    heavyRain: topStatusText(locale, "weatherHeavyRain"),
    volcano: topStatusText(locale, "weatherVolcano"),
  }[currentWeather];
  const rocketsBuiltThisRun = ROCKET_IDS.filter(
    (id) => state.run.space.rockets[id].builtParts >= ROCKET_PART_REQUIREMENTS[id],
  ).length;
  const runRows: readonly StatisticsDisplayRow[] = [
    valueRow(
      "runTime",
      runStatisticLabel(locale, "runTime"),
      formatDuration(locale, state.run.clock.simulationMs),
    ),
    valueRow(
      "starSystem",
      runStatisticLabel(locale, "starSystem"),
      currentSystem?.name ?? state.run.space.currentSystemId,
      "interstellar-star-map",
    ),
    valueRow(
      "currentWeather",
      runStatisticLabel(locale, "currentWeather"),
      weatherLabel,
      "interstellar-star-map",
    ),
    valueRow("cash", runStatisticLabel(locale, "cash"), money(state.run.cash), "galactic-market"),
    valueRow(
      "apAnticipated",
      runStatisticLabel(locale, "apAnticipated"),
      statNumber(selectRunApAnticipated(state)),
      "interstellar-star-map",
    ),
    valueRow(
      "antimatter",
      runStatisticLabel(locale, "antimatter"),
      statNumber(state.run.space.antimatter),
      "space-mining-mining",
    ),
  ];
  const snapshotRows: readonly StatisticsDisplayRow[] = [
    statRow(
      "antimatterThisRun",
      statNumber(state.run.space.antimatterMinedThisRun),
      "space-mining-mining",
    ),
    statRow("researchPool", statNumber(state.run.researchPoints), "research-science-buildings"),
    statRow("resourceStock", statNumber(totalResources)),
    statRow("compoundStock", statNumber(totalCompounds)),
    statRow("energyStored", statNumber(state.run.economy.power.quantity), "energy-storage"),
    statRow("recordedEvents", statNumber(state.run.randomEvents.history.length), "settings-events"),
    statRow(
      "unlockedAchievements",
      statNumber(
        new Set([
          ...state.run.achievements.unlockedIds,
          ...state.permanent.achievements.unlockedIds,
        ]).size,
      ),
      "settings-achievements",
    ),
    statRow("rebirths", statNumber(state.permanent.rebirthCount), "galactic-rebirth"),
  ];
  const overviewRows: readonly StatisticsDisplayRow[] = [
    statRow("activeTime", formatDuration(locale, state.statistics.lifetimeActiveMs)),
    statRow("pioneer", state.run.pioneerName),
    statRow(
      "ascendencyPoints",
      statNumber(state.permanent.ascendencyPoints),
      "galactic-ascendency-perks",
    ),
    valueRow(
      "apGain",
      overviewStatisticLabel(locale, "apGain"),
      statNumber(state.statistics.lifetimeAscendencyPointsGained),
      "galactic-ascendency-perks",
    ),
    statRow("runNumber", statNumber(state.permanent.rebirthCount + 1), "galactic-rebirth"),
    valueRow(
      "uniqueNewsTickers",
      overviewStatisticLabel(locale, "uniqueNewsTickers"),
      statNumber(state.run.newsTicker.seenIds.length),
      "settings-events",
    ),
    valueRow(
      "tickerPrizes",
      overviewStatisticLabel(locale, "tickerPrizes"),
      statNumber(state.run.newsTicker.claimedPrizeIds.length),
      "settings-events",
    ),
    valueRow(
      "theme",
      settingsText(locale, "theme"),
      themeName(locale, state.settings.themeId),
      "settings-visual",
    ),
    statRow(
      "lifetimeAntimatter",
      statNumber(state.statistics.lifetimeAntimatterMined),
      "space-mining-mining",
    ),
    valueRow(
      "totalAsteroids",
      overviewStatisticLabel(locale, "totalAsteroids"),
      statNumber(state.statistics.lifetimeAsteroidsDiscovered),
      "space-mining-asteroids",
    ),
    valueRow(
      "legendaryAsteroids",
      overviewStatisticLabel(locale, "legendaryAsteroids"),
      statNumber(state.statistics.lifetimeLegendaryAsteroidsDiscovered),
      "space-mining-asteroids",
    ),
    valueRow(
      "rocketsLaunched",
      overviewStatisticLabel(locale, "rocketsLaunched"),
      statNumber(state.statistics.lifetimeRocketsLaunched),
      "space-mining-launch-pad",
    ),
    valueRow(
      "starshipsLaunched",
      overviewStatisticLabel(locale, "starshipsLaunched"),
      statNumber(state.statistics.lifetimeStarshipsLaunched),
      "interstellar-starship",
    ),
  ];
  const spaceMiningRows: readonly StatisticsDisplayRow[] = [
    statRow(
      "spaceTelescopeBuilt",
      settingsStatisticLabel(locale, state.run.space.telescopeBuilt ? "yes" : "no"),
      "space-mining-telescope",
    ),
    statRow(
      "launchPadBuilt",
      settingsStatisticLabel(locale, state.run.space.launchPadBuilt ? "yes" : "no"),
      "space-mining-launch-pad",
    ),
    {
      id: "rocketsBuilt",
      label: settingsStatisticLabel(locale, "rocketsBuilt"),
      currentRun: statNumber(rocketsBuiltThisRun),
      lifetime: statNumber(state.statistics.lifetimeRocketsBuilt),
      ...(availableOwnerPaneIds.has("space-mining-launch-pad")
        ? { ownerPaneId: "space-mining-launch-pad" }
        : {}),
    },
    {
      id: "asteroidsFound",
      label: settingsStatisticLabel(locale, "asteroidsFound"),
      currentRun: statNumber(state.run.space.nextAsteroidSequence - 1),
      lifetime: statNumber(state.statistics.lifetimeAsteroidsDiscovered),
      ...(availableOwnerPaneIds.has("space-mining-asteroids")
        ? { ownerPaneId: "space-mining-asteroids" }
        : {}),
    },
    {
      id: "asteroidsMined",
      label: settingsStatisticLabel(locale, "asteroidsMined"),
      currentRun: statNumber(state.run.space.asteroidsMinedThisRun),
      lifetime: statNumber(state.statistics.lifetimeAsteroidsMined),
      ...(availableOwnerPaneIds.has("space-mining-asteroids")
        ? { ownerPaneId: "space-mining-asteroids" }
        : {}),
    },
  ];
  const researchRows: readonly StatisticsDisplayRow[] = [
    {
      id: "researchPointsEarned",
      label: settingsStatisticLabel(locale, "researchPointsEarned"),
      currentRun: statNumber(state.run.researchPointsEarnedThisRun),
      lifetime: statNumber(state.statistics.lifetimeResearchPointsEarned),
      ownerPaneId: "research-science-buildings",
    },
    {
      id: "scienceKitsBuilt",
      label: settingsStatisticLabel(locale, "scienceKitsBuilt"),
      currentRun: statNumber(state.run.scienceKitsBuiltThisRun),
      lifetime: statNumber(state.statistics.lifetimeScienceKitsBuilt),
      ownerPaneId: "research-science-buildings",
    },
    {
      id: "scienceClubsBuilt",
      label: settingsStatisticLabel(locale, "scienceClubsBuilt"),
      currentRun: statNumber(state.run.scienceClubsBuiltThisRun),
      lifetime: statNumber(state.statistics.lifetimeScienceClubsBuilt),
      ownerPaneId: "research-science-buildings",
    },
    {
      id: "scienceLabsBuilt",
      label: settingsStatisticLabel(locale, "scienceLabsBuilt"),
      currentRun: statNumber(state.run.scienceLabsBuiltThisRun),
      lifetime: statNumber(state.statistics.lifetimeScienceLabsBuilt),
      ownerPaneId: "research-science-buildings",
    },
    statRow(
      "techsUnlocked",
      statNumber(state.run.economy.researchedTechnologies.length),
      "research-tech-tree",
    ),
  ];
  const energyUnavailable = energyStatisticLabel(locale, "notApplicable");
  const energyCurrentRow = (
    id: EnergyStatisticId,
    value: string,
    ownerPaneId = "energy-storage",
  ): StatisticsDisplayRow => ({
    id,
    label: energyStatisticLabel(locale, id),
    currentRun: value,
    lifetime: energyUnavailable,
    ...(availableOwnerPaneIds.has(ownerPaneId) ? { ownerPaneId } : {}),
  });
  const energyCounterRow = (
    id: EnergyStatisticId,
    currentRun: number,
    lifetime: number,
    ownerPaneId = "energy-storage",
  ): StatisticsDisplayRow => ({
    id,
    label: energyStatisticLabel(locale, id),
    currentRun: statNumber(currentRun),
    lifetime: statNumber(lifetime),
    ...(availableOwnerPaneIds.has(ownerPaneId) ? { ownerPaneId } : {}),
  });
  const power = state.run.economy.power;
  const energyRows: readonly StatisticsDisplayRow[] = [
    energyCurrentRow(
      "powerCurrent",
      topStatusText(locale, power.tripped ? "trippedShort" : power.gridEnabled ? "on" : "off"),
    ),
    energyCurrentRow("totalEnergy", `${statNumber(power.quantity)} kJ`),
    energyCurrentRow(
      "totalProduction",
      `${statNumber(Math.floor(energyPlan.generationPerSecond))} kJ/s`,
      "energy-power-plant",
    ),
    energyCurrentRow(
      "totalConsumption",
      `${statNumber(Math.floor(energyPlan.demandPerSecond))} kJ/s`,
      "energy-power-plant",
    ),
    energyCurrentRow("totalBatteryStorage", `${statNumber(Math.floor(power.capacity / 1000))} MJ`),
    energyCounterRow(
      "energyTrips",
      state.run.energyTripsThisRun,
      state.statistics.lifetimeEnergyTrips,
    ),
    energyCounterRow(
      "basicPowerPlants",
      state.run.basicPowerPlantsBuiltThisRun,
      state.statistics.lifetimeBasicPowerPlantsBuilt,
      "energy-power-plant",
    ),
    energyCounterRow(
      "advancedPowerPlants",
      state.run.advancedPowerPlantsBuiltThisRun,
      state.statistics.lifetimeAdvancedPowerPlantsBuilt,
      state.run.economy.researchedTechnologies.includes("advancedPowerGeneration")
        ? "energy-advanced-power-plant"
        : "energy-storage",
    ),
    energyCounterRow(
      "solarPowerPlants",
      state.run.solarPowerPlantsBuiltThisRun,
      state.statistics.lifetimeSolarPowerPlantsBuilt,
      state.run.economy.researchedTechnologies.includes("solarPowerGeneration")
        ? "energy-solar-power-plant"
        : "energy-storage",
    ),
    energyCounterRow(
      "sodiumIonBatteries",
      state.run.sodiumIonBatteriesBuiltThisRun,
      state.statistics.lifetimeSodiumIonBatteriesBuilt,
    ),
    energyCounterRow(
      "battery2",
      state.run.battery2BuiltThisRun,
      state.statistics.lifetimeBattery2Built,
    ),
    energyCounterRow(
      "battery3",
      state.run.battery3BuiltThisRun,
      state.statistics.lifetimeBattery3Built,
    ),
  ];
  const interstellarRow = (
    id: InterstellarStatisticId,
    currentRun: string,
    lifetime: string,
    ownerPaneId?: string,
  ): StatisticsDisplayRow => ({
    id,
    label: interstellarStatisticLabel(locale, id),
    currentRun,
    lifetime,
    ...(ownerPaneId && availableOwnerPaneIds.has(ownerPaneId) ? { ownerPaneId } : {}),
  });
  const lightYears = (value: number) =>
    `${formatNumber(locale, value, 2, state.settings.notation)} ${interstellarStatisticLabel(locale, "lightYearUnit")}`;
  const unavailableInterstellar = interstellarStatisticLabel(locale, "notApplicable");
  const interstellarRows: readonly StatisticsDisplayRow[] = [
    interstellarRow(
      "starStudyRange",
      lightYears(interstellar.starStudyRange),
      unavailableInterstellar,
      "interstellar-star-map",
    ),
    interstellarRow(
      "starShipBuilt",
      settingsStatisticLabel(locale, interstellar.starshipBuilt ? "yes" : "no"),
      unavailableInterstellar,
      "interstellar-starship",
    ),
    interstellarRow(
      "starshipDistanceTravelled",
      lightYears(interstellar.distanceTravelledThisRun),
      lightYears(interstellar.distanceTravelledLifetime),
      "interstellar-starship",
    ),
    interstellarRow(
      "systemScanned",
      settingsStatisticLabel(locale, interstellar.systemScanned ? "yes" : "no"),
      unavailableInterstellar,
      "interstellar-colonise",
    ),
    interstellarRow(
      "fleetAttackStrength",
      statNumber(interstellar.fleetAttackStrength),
      unavailableInterstellar,
      "interstellar-fleet-hangar",
    ),
    interstellarRow(
      "envoy",
      statNumber(interstellar.envoy),
      unavailableInterstellar,
      "interstellar-fleet-hangar",
    ),
    interstellarRow(
      "scout",
      statNumber(interstellar.scout),
      unavailableInterstellar,
      "interstellar-fleet-hangar",
    ),
    interstellarRow(
      "marauder",
      statNumber(interstellar.marauder),
      unavailableInterstellar,
      "interstellar-fleet-hangar",
    ),
    interstellarRow(
      "landStalker",
      statNumber(interstellar.landStalker),
      unavailableInterstellar,
      "interstellar-fleet-hangar",
    ),
    interstellarRow(
      "navalStrafer",
      statNumber(interstellar.navalStrafer),
      unavailableInterstellar,
      "interstellar-fleet-hangar",
    ),
    interstellarRow(
      "enemy",
      interstellar.enemyName ?? unavailableInterstellar,
      unavailableInterstellar,
      "interstellar-colonise",
    ),
    interstellarRow(
      "enemyDefenceOvercome",
      unavailableInterstellar,
      unavailableInterstellar,
      "interstellar-colonise",
    ),
    interstellarRow(
      "enemyDefenceRemaining",
      interstellar.enemyDefenceRemaining === null
        ? unavailableInterstellar
        : statNumber(interstellar.enemyDefenceRemaining),
      unavailableInterstellar,
      "interstellar-colonise",
    ),
    interstellarRow(
      "apFromStarVoyage",
      statNumber(interstellar.apFromStarVoyage),
      unavailableInterstellar,
      "interstellar-star-map",
    ),
    interstellarRow(
      "blackHoleDiscovered",
      unavailableInterstellar,
      settingsStatisticLabel(locale, interstellar.blackHoleDiscovered ? "yes" : "no"),
      "galactic-black-hole",
    ),
    interstellarRow(
      "blackHoleAlwaysActive",
      unavailableInterstellar,
      settingsStatisticLabel(locale, interstellar.blackHoleAlwaysActive ? "yes" : "no"),
      "galactic-black-hole",
    ),
    interstellarRow(
      "blackHoleStrength",
      unavailableInterstellar,
      statNumber(interstellar.blackHoleStrength),
      "galactic-black-hole",
    ),
    statRow(
      "systemsSettled",
      statNumber(state.permanent.settledSystemIds.length),
      "interstellar-star-map",
    ),
  ];
  const galacticCasinoRows: readonly StatisticsDisplayRow[] = [
    casinoRow("casinoPointsSpent", "cpSpent"),
    casinoRow("doubleOrNothingPlayed", "doubleOrNothingPlayed"),
    casinoRow("doubleOrNothingWon", "doubleOrNothingWon"),
    casinoRow("wheelPlayed", "wheelPlayed"),
    casinoRow("wheelWon", "wheelWon"),
    casinoRow("wheelSpecialWon", "wheelSpecialWon"),
    casinoRow("higherLowerPlayed", "higherLowerPlayed"),
    casinoRow("higherLowerWon", "higherLowerWon"),
    casinoRow("voidSeerPlayed", "voidSeerPlayed"),
    casinoRow("voidSeerWon", "voidSeerWon"),
  ];
  const cosmicRipRows: readonly StatisticsDisplayRow[] = [
    statRow("cosmicRipTelemetry", statNumber(cosmicRip.telemetryData), "cosmic-rip-situation"),
    statRow("gloryPoints", statNumber(state.permanent.gloryPoints), "cosmic-rip-situation"),
    valueRow(
      "cosmicRipGpSpent",
      overviewStatisticLabel(locale, "cosmicRipGpSpent"),
      statNumber(state.statistics.lifetimeGalacticPointsSpent),
      "cosmic-rip-situation",
    ),
    valueRow(
      "cosmicRipTelemetryEarned",
      overviewStatisticLabel(locale, "cosmicRipTelemetryEarned"),
      statNumber(state.statistics.lifetimeCosmicRipTelemetryDataEarned),
      "cosmic-rip-situation",
    ),
    statRow(
      "cosmicRipSectors",
      `${statNumber(cosmicRip.scannedSectorIndexes.length)} / ${statNumber(COSMIC_RIP_SECTOR_COUNT)}`,
      "cosmic-rip-scanner-array",
    ),
    statRow(
      "cosmicRipResearch",
      `${statNumber(cosmicRip.researchedTechnologyIds.length)} / ${statNumber(COSMIC_RIP_TECHNOLOGIES.length)}`,
      "cosmic-rip-rip",
    ),
    statRow(
      "cosmicRipChapterUnlocked",
      settingsStatisticLabel(locale, cosmicRip.unlocked ? "yes" : "no"),
      "cosmic-rip-situation",
    ),
    statRow(
      "cosmicRipScannerRestored",
      settingsStatisticLabel(locale, cosmicRip.scannerRestored ? "yes" : "no"),
      "cosmic-rip-situation",
    ),
    statRow(
      "cosmicRipLocated",
      settingsStatisticLabel(locale, cosmicRip.ripFound ? "yes" : "no"),
      "cosmic-rip-scanner-array",
    ),
    statRow(
      "cosmicRipStabilised",
      settingsStatisticLabel(
        locale,
        cosmicRip.researchedTechnologyIds.length === COSMIC_RIP_TECHNOLOGIES.length ? "yes" : "no",
      ),
      "cosmic-rip-rip",
    ),
    statRow(
      "cosmicRipClosed",
      settingsStatisticLabel(locale, cosmicRip.closed ? "yes" : "no"),
      "cosmic-rip-rip",
    ),
  ];
  const lifetimeRows: readonly StatisticsDisplayRow[] = [
    statRow("lifetimeCash", money(state.statistics.lifetimeCashEarned), "galactic-market"),
    statRow("lifetimeProduction", statNumber(state.statistics.lifetimeGoodsProduced)),
    statRow("acceptedCommands", statNumber(state.statistics.acceptedCommands)),
    statRow("completedTimers", statNumber(state.statistics.completedTimers)),
  ];
  const eventRows: readonly StatisticsDisplayRow[] = RANDOM_EVENT_IDS.map((id) => ({
    id: `event-${id}`,
    label: randomEventName(locale, id),
    currentRun: statNumber(state.run.randomEvents.eventCountsThisRun[id]),
    lifetime: statNumber(state.statistics.lifetimeRandomEventCounts[id]),
    ownerPaneId: "settings-events",
  }));
  const resourceProductionRows: readonly StatisticsDisplayRow[] = MATERIAL_IDS.map((id) => ({
    id: `resourceProduction-${id}`,
    label: economyGoodName(locale, id),
    currentRun: statNumber(state.run.goodsProducedThisRun[id]),
    lifetime: statNumber(state.statistics.lifetimeGoodsProducedByGood[id]),
    ...(availableOwnerPaneIds.has(`resources-${id}`) ? { ownerPaneId: `resources-${id}` } : {}),
  }));
  const compoundProductionRows: readonly StatisticsDisplayRow[] = COMPOUND_IDS.map((id) => ({
    id: `compoundProduction-${id}`,
    label: economyGoodName(locale, id),
    currentRun: statNumber(state.run.goodsProducedThisRun[id]),
    lifetime: statNumber(state.statistics.lifetimeGoodsProducedByGood[id]),
    ...(availableOwnerPaneIds.has(`compounds-${id}`) ? { ownerPaneId: `compounds-${id}` } : {}),
  }));
  const sections: readonly {
    readonly heading: string;
    readonly rows: readonly StatisticsDisplayRow[];
    readonly note?: string;
  }[] = [
    { heading: settingsStatisticLabel(locale, "overviewSection"), rows: overviewRows },
    {
      heading: settingsStatisticLabel(locale, "runSection"),
      rows: runRows,
    },
    {
      heading: runStatisticLabel(locale, "currentSnapshotSection"),
      rows: snapshotRows,
    },
    {
      heading: settingsSectionName(locale, "events"),
      rows: eventRows,
      note: eventTrackingNote(locale),
    },
    {
      heading: settingsStatisticLabel(locale, "resourcesSection"),
      rows: resourceProductionRows,
    },
    {
      heading: settingsStatisticLabel(locale, "compoundsSection"),
      rows: compoundProductionRows,
    },
    {
      heading: settingsStatisticLabel(locale, "researchSection"),
      rows: researchRows,
    },
    {
      heading: energyStatisticLabel(locale, "energySection"),
      rows: energyRows,
      note: energyTrackingNote(locale),
    },
    { heading: settingsStatisticLabel(locale, "spaceMiningSection"), rows: spaceMiningRows },
    {
      heading: settingsStatisticLabel(locale, "interstellarSection"),
      rows: interstellarRows,
      note: interstellarStatisticsTrackingNote(locale),
    },
    {
      heading: settingsStatisticLabel(locale, "galacticCasinoSection"),
      rows: galacticCasinoRows,
    },
    {
      heading: settingsStatisticLabel(locale, "cosmicRipChapterSection"),
      rows: cosmicRipRows,
      note: cosmicRipTrackingNote(locale),
    },
    { heading: settingsStatisticLabel(locale, "lifetime"), rows: lifetimeRows },
  ];

  return (
    <section
      className="settings-library-section"
      aria-labelledby="settings-statistics-heading"
      data-testid="settings-statistics"
    >
      <h3 id="settings-statistics-heading">{settingsSectionName(locale, "statistics")}</h3>
      {sections.map(({ heading, rows, note }) => (
        <section className="settings-stat-section" key={heading}>
          <h4>{heading}</h4>
          {note ? <p className="settings-stat-note">{note}</p> : null}
          <dl className="settings-stat-grid">
            {rows.map((row) => (
              <div
                className="settings-stat-card"
                key={row.id ?? row.label}
                data-statistic-id={row.id}
              >
                <dt>
                  {"ownerPaneId" in row && row.ownerPaneId ? (
                    <a
                      href={`#tab-${row.ownerPaneId}`}
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigateToPane?.(row.ownerPaneId!);
                      }}
                    >
                      {row.label}
                    </a>
                  ) : (
                    row.label
                  )}
                </dt>
                {"value" in row ? (
                  <dd>{row.value}</dd>
                ) : (
                  <dd className="settings-stat-pair-values">
                    <span>
                      <small>{settingsStatisticLabel(locale, "run")}</small>
                      <strong>{row.currentRun}</strong>
                    </span>
                    <span>
                      <small>{settingsStatisticLabel(locale, "lifetime")}</small>
                      <strong>{row.lifetime}</strong>
                    </span>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      ))}
    </section>
  );
}
