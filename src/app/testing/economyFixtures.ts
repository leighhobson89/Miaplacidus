import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  autobuyerUpgradeId,
} from "../../content/ids";
import { COMPOUND_CATALOG, MATERIAL_CATALOG } from "../../content/economy";
import {
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  createInitialStarSystemBattleState,
  PLAYER_FLEET_IDS,
} from "../../content/space";
import { createStarCatalogue } from "../../content/starCatalogue";
import { MEGASTRUCTURE_TRACKS, TECHNOLOGY_CATALOG } from "../../content/technology";
import { createInitialGameState, type GameState } from "../../engine/state";
import { ensureDiscoveredStarSystemProfiles } from "../../engine/starSystemProfiles";
import { createTimer, createTimerId } from "../../engine/timers";
import { nextRandomInteger } from "../../engine/random";

type EconomyFixtureKind =
  | "full"
  | "research"
  | "infinite-power"
  | "power-deficit"
  | "battery-cycle"
  | "storage"
  | "storage-efficient"
  | "storage-each"
  | "storage-compounds"
  | "storage-all"
  | "water-storage"
  | "water-storage-short"
  | "save"
  | "bulk-hydrogen"
  | "bulk-science"
  | "bulk-energy"
  | "power-buildings"
  | "buyer-tiers"
  | "compound-automation"
  | "multipliers"
  | "space-telescope"
  | "space-telescope-before-launch-pad"
  | "space-starship"
  | "space-starship-ready"
  | "space-starship-scanning"
  | "space-diplomacy"
  | "space-battle-victory"
  | "space-battle-defeat"
  | "space-diplomacy-power"
  | "space-diplomacy-power-fail"
  | "space-diplomacy-aggressive"
  | "space-bully-scared"
  | "space-bully-surrender"
  | "space-unoccupied"
  | "space-manuscript-hidden"
  | "meta-rebirth-ready"
  | "meta-market-ready"
  | "meta-casino-ready"
  | "meta-rebirth-before-casino-unlock"
  | "meta-black-hole-discovered"
  | "meta-megastructure-route"
  | "meta-cosmic-rip-route"
  | "meta-cosmic-rip-restore-affordance"
  | "meta-cosmic-rip-action-affordances"
  | "meta-cosmic-rip-close-affordance"
  | "space-late-game";

/** Test-only start states used by click-driven browser tests to reach later economy systems. */
export function createEconomyFixture(
  kind: EconomyFixtureKind,
  locale: GameState["settings"]["locale"],
): GameState {
  const spaceFixture = kind.startsWith("space-");
  const base = createInitialGameState({
    pioneerName: "Economy Test Pioneer",
    seed: 20261003,
    locale,
  });
  if (kind === "meta-rebirth-ready") {
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    return {
      ...base,
      run: {
        ...base.run,
        space: { ...base.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        ascendencyPoints: 100,
        gloryPoints: 1,
        settledSystemIds: [...base.permanent.settledSystemIds, destination.id],
        galacticCasino: { ...base.permanent.galacticCasino, casinoPoints: 12 },
      },
    };
  }
  if (kind === "meta-market-ready") {
    return {
      ...base,
      run: {
        ...base.run,
        cash: 10_000_000,
        unlockedResources: ["hydrogen", "helium"],
        goods: {
          ...base.run.goods,
          hydrogen: { ...base.run.goods.hydrogen, quantity: 100 },
        },
        space: { ...base.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        ascendencyPoints: 100,
        gloryPoints: 1,
      },
    };
  }
  if (kind === "meta-casino-ready") {
    let casinoSeed = 0;
    while (nextRandomInteger({ seed: casinoSeed, draws: 0 }, 0, 15).value !== 0) casinoSeed += 1;
    return {
      ...base,
      run: {
        ...base.run,
        cash: 10_000_000,
        researchPoints: 1_000_000,
        random: { seed: casinoSeed, draws: 0 },
        goods: Object.fromEntries(
          ECONOMIC_GOOD_IDS.map((goodId) => [
            goodId,
            { ...base.run.goods[goodId], quantity: 1_000_000, storageCapacity: 2_000_000 },
          ]),
        ) as typeof base.run.goods,
        unlockedResources: MATERIAL_IDS,
        economy: { ...base.run.economy, unlockedCompounds: COMPOUND_IDS },
        space: { ...base.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        galacticCasino: { ...base.permanent.galacticCasino, casinoPoints: 0 },
      },
    };
  }
  if (kind === "meta-rebirth-before-casino-unlock") {
    return {
      ...base,
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        ascendencyPoints: 100,
        gloryPoints: 1,
      },
    };
  }
  if (kind === "meta-black-hole-discovered") {
    return {
      ...base,
      run: {
        ...base.run,
        researchPoints: 3_000_000,
        space: { ...base.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        blackHole: {
          ...base.permanent.blackHole,
          discovered: true,
          discoveryProbability: 3,
        },
      },
    };
  }
  if (kind === "meta-megastructure-route") {
    const star = (name: string) => createStarCatalogue().find((entry) => entry.name === name)!;
    const manuscriptNames = ["Sirius", "Procyon", "Betelgeuse", "Altair"] as const;
    const factoryNames = ["Canopus", "Vega", "Rigel", "Deneb"] as const;
    const structures = [
      "celestialProcessingCore",
      "plasmaForge",
      "galacticMemoryArchive",
      "dysonSphere",
    ] as const;
    const manuscripts = structures.map((megastructureId, index) => ({
      position: (index + 1) as 1 | 2 | 3 | 4,
      manuscriptSystemId: star(manuscriptNames[index]!).id,
      factorySystemId: star(factoryNames[index]!).id,
      megastructureId,
      reported: true,
    }));
    const currentFactoryId = star("Rigel").id;
    const carriedStages = [
      MEGASTRUCTURE_TRACKS.celestialProcessingCore[2]!,
      MEGASTRUCTURE_TRACKS.plasmaForge[2]!,
      MEGASTRUCTURE_TRACKS.dysonSphere[2]!,
      MEGASTRUCTURE_TRACKS.galacticMemoryArchive[0]!,
      MEGASTRUCTURE_TRACKS.galacticMemoryArchive[1]!,
    ];
    const settledSystemIds = [
      ...base.permanent.settledSystemIds,
      ...factoryNames.map((name) => star(name).id),
    ];
    const starshipModules = Object.fromEntries(
      STARSHIP_MODULE_IDS.map((moduleId) => [
        moduleId,
        { builtParts: STARSHIP_MODULES[moduleId].parts },
      ]),
    ) as GameState["run"]["space"]["starshipModules"];
    const playerFleets = Object.fromEntries(
      PLAYER_FLEET_IDS.map((id) => [id, 1_000]),
    ) as GameState["run"]["space"]["playerFleets"];
    const playerFleetCombatTotals: GameState["run"]["space"]["playerFleetCombatTotals"] = {
      scout: { attackPower: 2_000, defensePower: 2_000 },
      marauder: { attackPower: 4_000, defensePower: 3_000 },
      landStalker: { attackPower: 4_000, defensePower: 0 },
      navalStrafer: { attackPower: 6_000, defensePower: 0 },
    };
    const requiredTechnologies = [
      "advancedPowerGeneration",
      "quantumComputing",
      "neutronCapture",
      "orbitalConstruction",
      "stellarCartography",
      "stellarScanners",
      "FTLTravelTheory",
    ] as const;
    const researchedTechnologies = [...requiredTechnologies, ...carriedStages];
    const goods = Object.fromEntries(
      ECONOMIC_GOOD_IDS.map((goodId) => [
        goodId,
        {
          ...base.run.goods[goodId],
          storageCapacity: Math.max(1_000_000, base.run.goods[goodId].storageCapacity),
        },
      ]),
    ) as GameState["run"]["goods"];
    return {
      ...base,
      run: {
        ...base.run,
        cash: 1_000_000_000,
        researchPoints: 300_000,
        goods,
        unlockedResources: MATERIAL_IDS,
        space: {
          ...base.run.space,
          currentSystemId: currentFactoryId,
          weatherSystemId: currentFactoryId,
          starStudyRange: 200,
          systemProfiles: ensureDiscoveredStarSystemProfiles(
            base.run.space.systemProfiles,
            currentFactoryId,
            200,
          ),
          antimatter: 1_000_000,
          antimatterUnlocked: true,
          antimatterMinedThisRun: 1_000_000,
          ascendencyAwardedThisRun: true,
          starshipModules,
          playerFleets,
          playerFleetCombatTotals,
        },
        economy: {
          ...base.run.economy,
          unlockedCompounds: COMPOUND_IDS,
          researchedTechnologies,
          revealedTechnologies: TECHNOLOGY_CATALOG.map((technology) => technology.id),
          power: {
            ...base.run.economy.power,
            gridEnabled: true,
            infinitePower: true,
          },
        },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        // The homecoming route is a full browser journey; use the source's
        // six Quantum Engine ranks so the real travel timer fits the test clock.
        acquiredPerks: [
          ...base.permanent.acquiredPerks,
          ...Array.from({ length: 6 }, () => "quantumEngines"),
        ],
        settledSystemIds,
        megastructures: {
          ...base.permanent.megastructures,
          ancientManuscripts: manuscripts,
          researchedTechnologyIds: carriedStages,
          manuscriptRewardClaimed: true,
          conquestRewardClaimed: true,
        },
      },
      statistics: { ...base.statistics, lifetimeAntimatterMined: 1_000_000 },
    };
  }
  if (kind === "meta-cosmic-rip-route") {
    return {
      ...base,
      run: {
        ...base.run,
        cash: 10_000_000,
        goods: Object.fromEntries(
          ECONOMIC_GOOD_IDS.map((goodId) => [
            goodId,
            { ...base.run.goods[goodId], quantity: 5_000_000, storageCapacity: 10_000_000 },
          ]),
        ) as GameState["run"]["goods"],
        unlockedResources: MATERIAL_IDS,
        economy: { ...base.run.economy, unlockedCompounds: COMPOUND_IDS },
        space: { ...base.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 2,
        gloryPoints: 20,
        settledSystemIds: [
          ...base.permanent.settledSystemIds,
          createStarCatalogue().find((star) => star.name === "Miaplacidus")!.id,
        ],
        cosmicRip: {
          ...base.permanent.cosmicRip,
          unlocked: true,
          scannerRestored: true,
          ripLocationSectorIndex: 4,
          scannedSectorIndexes: [4],
          ripFound: true,
          telemetryData: 200_000,
        },
      },
    };
  }
  if (kind === "meta-cosmic-rip-restore-affordance") {
    const route = createEconomyFixture("meta-cosmic-rip-route", locale);
    return {
      ...route,
      permanent: {
        ...route.permanent,
        gloryPoints: 0,
        cosmicRip: {
          ...route.permanent.cosmicRip,
          scannerRestored: false,
          ripLocationSectorIndex: null,
          scannedSectorIndexes: [],
          ripFound: false,
          telemetryData: 0,
        },
      },
    };
  }
  if (kind === "meta-cosmic-rip-action-affordances") {
    const route = createEconomyFixture("meta-cosmic-rip-route", locale);
    return {
      ...route,
      run: {
        ...route.run,
        cash: 0,
        goods: Object.fromEntries(
          ECONOMIC_GOOD_IDS.map((goodId) => [goodId, { ...route.run.goods[goodId], quantity: 0 }]),
        ) as GameState["run"]["goods"],
      },
      permanent: {
        ...route.permanent,
        gloryPoints: 0,
        cosmicRip: { ...route.permanent.cosmicRip, telemetryData: 200_000 },
      },
    };
  }
  if (kind === "meta-cosmic-rip-close-affordance") {
    const route = createEconomyFixture("meta-cosmic-rip-route", locale);
    return {
      ...route,
      permanent: {
        ...route.permanent,
        gloryPoints: 0,
        cosmicRip: {
          ...route.permanent.cosmicRip,
          researchedTechnologyIds: [
            "stabilizerArray",
            "quantumContainmentField",
            "dimensionalAnchorMatrix",
            "singularityStabilizer",
            "realityWeaveRegulator",
          ],
        },
      },
    };
  }
  if (kind === "storage") {
    return {
      ...base,
      run: {
        ...base.run,
        goods: { ...base.run.goods, hydrogen: { ...base.run.goods.hydrogen, quantity: 149 } },
      },
    };
  }
  const upgrades: Record<string, number> = { ...base.run.upgrades };
  for (const id of ECONOMIC_GOOD_IDS)
    for (const tier of [1, 2, 3, 4] as const) upgrades[autobuyerUpgradeId(id, tier)] = 0;
  if (kind === "power-deficit") {
    upgrades[autobuyerUpgradeId("hydrogen", 2)] = 1;
    upgrades["powerPlant1"] = 0;
    upgrades["powerPlant2"] = 0;
    upgrades["powerPlant3"] = 0;
  }
  if (kind === "compound-automation")
    for (const id of MATERIAL_IDS) upgrades[autobuyerUpgradeId(id, 1)] = 1;

  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((id) => [
      id,
      {
        ...base.run.goods[id],
        quantity: spaceFixture
          ? 1_000_000
          : kind === "compound-automation"
            ? MATERIAL_IDS.includes(id as (typeof MATERIAL_IDS)[number])
              ? 10_000
              : 0
            : kind === "storage-each"
              ? Math.max(0, base.run.goods[id].storageCapacity - 1)
              : kind === "storage-compounds"
                ? id === "hydrogen"
                  ? 250
                  : id === "silicon"
                    ? 150
                    : id === "water"
                      ? 99
                      : id === "concrete"
                        ? 49
                        : Math.max(0, base.run.goods[id].storageCapacity - 1)
                : kind === "buyer-tiers"
                  ? 100_000_000
                  : kind === "power-buildings"
                    ? 50_000
                    : kind === "storage-all"
                      ? id === "concrete"
                        ? 30_000
                        : 99_999
                      : ["water-storage", "water-storage-short"].includes(kind) && id === "water"
                        ? 99
                        : kind === "water-storage" && id === "concrete"
                          ? 30
                          : kind === "water-storage-short" && id === "concrete"
                            ? 29
                            : kind === "save" && id === "iron"
                              ? 1_500
                              : id === "hydrogen"
                                ? kind === "bulk-hydrogen"
                                  ? 150
                                  : 2_000
                                : id === "carbon"
                                  ? 2_000
                                  : 1_500,
        storageCapacity: spaceFixture
          ? 1_000_000
          : kind === "save" && id === "iron"
            ? 1_501
            : kind === "compound-automation"
              ? 100_000
              : kind === "storage-each"
                ? base.run.goods[id].storageCapacity
                : kind === "storage-compounds"
                  ? id === "hydrogen"
                    ? 300
                    : base.run.goods[id].storageCapacity
                  : kind === "buyer-tiers"
                    ? 100_000_000
                    : 100_000,
      },
    ]),
  ) as GameState["run"]["goods"];
  const completeResearch = kind !== "research";
  const researchedTechnologies = completeResearch
    ? TECHNOLOGY_CATALOG.filter(
        (tech) =>
          !(kind === "space-telescope-before-launch-pad" && tech.id === "rocketComposites") &&
          !(kind === "save" && tech.id === "fusionEfficiencyIII") &&
          !(kind === "infinite-power" && tech.id === "dysonSpherePower"),
      ).map((tech) => tech.id)
    : [];
  const revealedTechnologies = completeResearch
    ? TECHNOLOGY_CATALOG.map((tech) => tech.id)
    : (["knowledgeSharing"] as const);
  const unlockedResources = completeResearch ? [...MATERIAL_IDS] : (["hydrogen"] as const);
  const unlockedCompounds = completeResearch ? [...COMPOUND_IDS] : [];
  const storageCapacity = 1_665_000;
  const initialPoints = kind === "research" ? 150 : kind === "infinite-power" ? 200_000 : 1_000_000;
  const cash =
    kind === "research"
      ? 10
      : kind === "bulk-science"
        ? 11
        : kind === "bulk-energy"
          ? 639
          : 1_000_000_000;
  const power =
    kind === "power-deficit"
      ? {
          quantity: 0,
          capacity: 15_000,
          gridEnabled: true,
          deficitMs: 0,
          tripped: false,
          infinitePower: false,
          environmentalMultiplier: 1,
        }
      : kind === "battery-cycle"
        ? {
            quantity: 100,
            capacity: 100,
            gridEnabled: true,
            deficitMs: 0,
            tripped: false,
            infinitePower: false,
            environmentalMultiplier: 1,
          }
        : {
            quantity: kind === "infinite-power" ? 0 : storageCapacity,
            capacity: storageCapacity,
            gridEnabled: true,
            deficitMs: 0,
            tripped: false,
            infinitePower: false,
            environmentalMultiplier: kind === "multipliers" ? 0.5 : 1,
          };
  const autobuyerEnabled = { ...base.run.economy.autobuyerEnabled };
  if (kind === "multipliers") autobuyerEnabled[autobuyerUpgradeId("hydrogen", 1)] = true;
  const researchReadyRun =
    kind === "research"
      ? {
          ...base.run,
          cash,
          researchPoints: initialPoints,
          upgrades: { ...base.run.upgrades, scienceKit: 1 },
          economy: { ...base.run.economy, revealedTechnologies: ["knowledgeSharing"] as const },
        }
      : null;
  if (researchReadyRun)
    return {
      ...base,
      run: researchReadyRun,
      permanent: { ...base.permanent, acquiredPerks: ["roboticResearchAutomation"] },
    };
  const resourceAllocation = Object.fromEntries(
    MATERIAL_IDS.map((id) => [
      id,
      kind === "compound-automation"
        ? base.run.economy.resourceAllocation[id]
        : { enabled: true, cashShare: 25, compoundShare: 25 },
    ]),
  ) as GameState["run"]["economy"]["resourceAllocation"];
  const autoCreateEnabled = Object.fromEntries(
    COMPOUND_IDS.map((id) => [id, kind !== "compound-automation"]),
  ) as GameState["run"]["economy"]["autoCreateEnabled"];
  const buildingEnabled = Object.fromEntries(
    [
      "scienceKit",
      "scienceClub",
      "scienceLab",
      "powerPlant1",
      "powerPlant2",
      "powerPlant3",
      "battery1",
      "battery2",
      "battery3",
    ].map((id) => [id, kind === "multipliers" && id === "powerPlant2"]),
  ) as GameState["run"]["economy"]["buildingEnabled"];
  if (kind === "multipliers") {
    upgrades[autobuyerUpgradeId("hydrogen", 1)] = 1;
    upgrades["powerPlant2"] = 1;
  }
  const state: GameState = {
    ...base,
    run: {
      ...base.run,
      cash,
      researchPoints: initialPoints,
      goods,
      unlockedResources,
      upgrades,
      space: {
        ...base.run.space,
        ...(kind === "battery-cycle"
          ? {
              currentSystemWeather: "clear" as const,
              weatherSystemId: base.run.space.currentSystemId,
            }
          : {}),
      },
      economy: {
        ...base.run.economy,
        unlockedCompounds,
        researchedTechnologies,
        revealedTechnologies,
        autobuyerEnabled,
        buildingEnabled,
        resourceAllocation,
        autoCreateEnabled,
        power,
      },
    },
    permanent: {
      ...base.permanent,
      acquiredPerks:
        kind === "multipliers"
          ? ["nanoBrokers:3", "bulkPurchasing", "smartAutoBuyers:2", "optimizedPowerGrids"]
          : kind === "space-telescope"
            ? ["nanoBrokers:3", "bulkPurchasing", "autoSpaceTelescope"]
            : spaceFixture
              ? ["nanoBrokers:3", "bulkPurchasing", "spaceElevator:2"]
              : ["nanoBrokers:3", "bulkPurchasing"],
    },
  };
  if (
    kind === "space-starship-ready" ||
    kind === "space-starship-scanning" ||
    kind === "space-diplomacy" ||
    kind === "space-battle-victory" ||
    kind === "space-battle-defeat" ||
    kind === "space-diplomacy-power" ||
    kind === "space-diplomacy-power-fail" ||
    kind === "space-diplomacy-aggressive" ||
    kind === "space-bully-scared" ||
    kind === "space-bully-surrender" ||
    kind === "space-unoccupied" ||
    kind === "space-late-game"
  ) {
    const scanningFixture = kind !== "space-starship-ready";
    const battleVictoryFixture = kind === "space-battle-victory";
    const battleDefeatFixture = kind === "space-battle-defeat";
    const poweredDiplomacyFixture = [
      "space-diplomacy-power",
      "space-diplomacy-power-fail",
      "space-diplomacy-aggressive",
      "space-bully-scared",
      "space-bully-surrender",
    ].includes(kind);
    const aggressiveDiplomacyFixture = kind === "space-diplomacy-aggressive";
    const unoccupiedFixture = kind === "space-unoccupied";
    const battleFixture = battleVictoryFixture || battleDefeatFixture;
    const diplomacyEncounter: GameState["run"]["space"]["systemEncounters"][number] = {
      systemId: createStarCatalogue().find((star) => star.name === "Sirius")!.id,
      lifeDetected: true,
      civilizationLevel: unoccupiedFixture ? "unsentient" : "industrial",
      lifeformTraits: battleFixture
        ? ["aggressive", "terrans", "armored"]
        : aggressiveDiplomacyFixture
          ? ["aggressive", "terrans", "powerSiphon"]
          : ["diplomatic", "terrans", "powerSiphon"],
      raceName: unoccupiedFixture ? "Sirius Microbes" : "Sirius Envoys",
      populationEstimate: unoccupiedFixture ? 500_000 : 2_000_000,
      threatLevel: unoccupiedFixture ? "none" : "low",
      defenseRating: battleFixture || poweredDiplomacyFixture ? 0 : 30,
      enemyFleets:
        battleVictoryFixture || poweredDiplomacyFixture
          ? { air: 1, land: 0, sea: 0 }
          : battleDefeatFixture
            ? { air: 50, land: 0, sea: 0 }
            : unoccupiedFixture
              ? { air: 0, land: 0, sea: 0 }
              : { air: 2, land: 3, sea: 1 },
      anomalies: [],
      initialImpression: poweredDiplomacyFixture ? 95 : 60,
      currentImpression: poweredDiplomacyFixture ? 95 : 60,
      latestDifferenceInImpression: 0,
      attitude: unoccupiedFixture ? "none" : battleFixture ? "belligerent" : "receptive",
      triedToBully: false,
      patience: 5,
      lastDiplomacyMessage: null,
      warReady: battleFixture,
      warMode: false,
      battle: createInitialStarSystemBattleState(),
    };
    const starshipModules = Object.fromEntries(
      STARSHIP_MODULE_IDS.map((moduleId) => [
        moduleId,
        {
          builtParts:
            STARSHIP_MODULES[moduleId].requiredForTravel ||
            (scanningFixture && moduleId === "stellarScanner")
              ? STARSHIP_MODULES[moduleId].parts
              : 0,
        },
      ]),
    ) as GameState["run"]["space"]["starshipModules"];
    const scanDestination = createStarCatalogue().find((star) => star.name === "Sirius")!;
    const fixtureState: GameState = {
      ...state,
      run: {
        ...state.run,
        random: poweredDiplomacyFixture
          ? {
              seed:
                kind === "space-diplomacy-power-fail" ? 5 : kind === "space-bully-scared" ? 2 : 1,
              draws: 0,
            }
          : state.run.random,
        space: {
          ...state.run.space,
          starStudyRange: 200,
          systemProfiles: ensureDiscoveredStarSystemProfiles(
            state.run.space.systemProfiles,
            state.run.space.currentSystemId,
            200,
          ),
          antimatter: 1_000_000,
          antimatterUnlocked: true,
          antimatterMinedThisRun: 1_000_000,
          starshipModules,
          fleetEnvoyBuilt: poweredDiplomacyFixture,
          systemEncounters:
            kind !== "space-starship-scanning" && scanningFixture
              ? [diplomacyEncounter]
              : state.run.space.systemEncounters,
          playerFleets:
            battleFixture || poweredDiplomacyFixture || unoccupiedFixture
              ? {
                  ...state.run.space.playerFleets,
                  scout: battleFixture ? 3 : poweredDiplomacyFixture ? 10 : 0,
                }
              : state.run.space.playerFleets,
          playerFleetCombatTotals:
            battleFixture || poweredDiplomacyFixture
              ? {
                  ...state.run.space.playerFleetCombatTotals,
                  scout: {
                    attackPower: poweredDiplomacyFixture ? 20 : 6,
                    defensePower: poweredDiplomacyFixture ? 20 : 6,
                  },
                }
              : state.run.space.playerFleetCombatTotals,
          starship: scanningFixture
            ? {
                destinationSystemId: scanDestination.id,
                phase: "orbiting",
                timerId: null,
                durationMs: 1,
                antimatterSpent: 1,
              }
            : state.run.space.starship,
        },
      },
      statistics: {
        ...state.statistics,
        lifetimeAntimatterMined: 1_000_000,
      },
    };
    if (kind !== "space-late-game") return fixtureState;

    const asteroids = ROCKET_IDS.map((rocketId, index) => ({
      id: `asteroid-${index + 1}`,
      name: `SPI-LATE-${index + 1}`,
      systemId: fixtureState.run.space.currentSystemId,
      distance: 35_000 + index * 5_000,
      rarity: "common" as const,
      extractionEase: 1,
      remainingAntimatter: 1_000_000,
      totalAntimatter: 1_000_000,
      reservedBy: rocketId,
      depleted: false,
      interacted: true,
    }));
    const rockets = Object.fromEntries(
      ROCKET_IDS.map((rocketId, index) => {
        const timerId = createTimerId("travel", `late-game-${rocketId}`);
        return [
          rocketId,
          {
            ...fixtureState.run.space.rockets[rocketId],
            builtParts: ROCKET_PART_REQUIREMENTS[rocketId],
            phase: "outbound" as const,
            targetAsteroidId: asteroids[index]!.id,
            journeyCount: 1,
            timerId,
          },
        ];
      }),
    ) as unknown as GameState["run"]["space"]["rockets"];
    const travelTimers = Object.fromEntries(
      ROCKET_IDS.map((rocketId, index) => {
        const timerId = createTimerId("travel", `late-game-${rocketId}`);
        return [
          timerId,
          {
            ...createTimer({ id: timerId, domain: "travel", durationMs: 90_000 + index * 5_000 }),
            elapsedMs: 15_000,
          },
        ];
      }),
    );
    return {
      ...fixtureState,
      run: {
        ...fixtureState.run,
        timers: { ...fixtureState.run.timers, ...travelTimers },
        space: {
          ...fixtureState.run.space,
          launchPadBuilt: true,
          telescopeBuilt: true,
          asteroids,
          selectedAsteroidId: asteroids[0]!.id,
          nextAsteroidSequence: asteroids.length + 1,
          rockets,
        },
      },
    };
  }
  if (kind === "space-manuscript-hidden") {
    const catalogue = createStarCatalogue();
    const manuscriptStar = catalogue.find((star) => star.name === "Sirius")!;
    const factoryStar = catalogue.find((star) => star.name === "Canopus")!;
    return {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          starStudyRange: 200,
          systemProfiles: ensureDiscoveredStarSystemProfiles(
            state.run.space.systemProfiles,
            state.run.space.currentSystemId,
            200,
          ),
        },
      },
      permanent: {
        ...state.permanent,
        megastructures: {
          ...state.permanent.megastructures,
          ancientManuscripts: [
            {
              position: 1,
              manuscriptSystemId: manuscriptStar.id,
              factorySystemId: factoryStar.id,
              megastructureId: "dysonSphere",
              reported: false,
            },
          ],
        },
      },
    };
  }
  if (kind === "water-storage" || kind === "water-storage-short") {
    return {
      ...state,
      run: {
        ...state.run,
        goods: {
          ...state.run.goods,
          water: {
            ...state.run.goods.water,
            storageCapacity: base.run.goods.water.storageCapacity,
          },
          concrete: {
            ...state.run.goods.concrete,
            storageCapacity: base.run.goods.concrete.storageCapacity,
          },
        },
      },
    };
  }
  if (kind === "storage-efficient") {
    return {
      ...base,
      run: {
        ...base.run,
        goods: { ...base.run.goods, hydrogen: { ...base.run.goods.hydrogen, quantity: 149 } },
      },
      permanent: { ...base.permanent, acquiredPerks: ["efficientStorage"] },
    };
  }
  // Keep fixture literals tied to the catalogue so a source row omission fails during editing.
  void MATERIAL_CATALOG;
  void COMPOUND_CATALOG;
  return state;
}
