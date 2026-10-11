import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  autobuyerUpgradeId,
} from "../../content/ids";
import { COSMIC_RIP_TECHNOLOGIES } from "../../content/cosmicRip";
import { COMPOUND_CATALOG, MATERIAL_CATALOG } from "../../content/economy";
import { BLACK_HOLE_RESEARCH_PRICE } from "../../content/blackHole";
import {
  ROCKET_IDS,
  ROCKET_FUEL_CAPACITY,
  ROCKET_PART_REQUIREMENTS,
  TELESCOPE_COST,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  createInitialStarSystemBattleState,
  PLAYER_FLEET_IDS,
} from "../../content/space";
import { createStarCatalogue } from "../../content/starCatalogue";
import {
  MEGASTRUCTURE_TRACKS,
  TECHNOLOGY_CATALOG,
  type MegastructureId,
} from "../../content/technology";
import { createInitialGameState, type GameState } from "../../engine/state";
import { ensureDiscoveredStarSystemProfiles } from "../../engine/starSystemProfiles";
import { generateStarSystemEncounter } from "../../engine/starSystemEncounters";
import { createTimer, createTimerId } from "../../engine/timers";
import { nextRandomInteger } from "../../engine/random";

type EconomyFixtureKind =
  | "full"
  | "philosophy-notification-routes"
  | "hydrogen-sale-currency-tail"
  | "notation-coverage"
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
  | "storage-production"
  | "save"
  | "bulk-hydrogen"
  | "bulk-science"
  | "bulk-energy"
  | "power-buildings"
  | "buyer-tiers"
  | "compound-automation"
  | "multipliers"
  | "space-telescope"
  | "space-telescope-shortfall"
  | "space-telescope-before-launch-pad"
  | "space-asteroid-mining"
  | "space-rocket-part-shortfall"
  | "space-rocket-part-exact"
  | "space-rocket-fuel-pump"
  | "space-starship"
  | "space-starship-ready"
  | "space-starship-scanning"
  | "space-starship-scanning-blind"
  | "space-starship-o-arrival"
  | "space-starship-factory-arrival"
  | "space-diplomacy"
  | "space-battle-victory"
  | "space-rapid-expansion-victory"
  | "space-battle-defeat"
  | "space-diplomacy-power"
  | "space-diplomacy-power-fail"
  | "space-diplomacy-aggressive"
  | "space-bully-scared"
  | "space-bully-surrender"
  | "space-unoccupied"
  | "space-megastructure-attention"
  | "space-manuscript-hidden"
  | "meta-rebirth-ready"
  | "meta-market-ready"
  | "meta-market-rebirth-ready"
  | "meta-market-action-reasons"
  | "meta-market-action-reasons-rebirth-ready"
  | "meta-casino-ready"
  | "meta-casino-timewarp"
  | "meta-casino-finish-rocket-journey"
  | "meta-post-rebirth-casino-access"
  | "meta-black-hole-discovered"
  | "meta-black-hole-underfunded"
  | "meta-galactic-identity-matrix"
  | "meta-megastructure-route"
  | "meta-megastructure-audio"
  | `meta-megastructure-factory-${MegastructureId}`
  | `meta-megastructure-visual-${MegastructureId}`
  | "meta-megastructure-research-reasons"
  | "meta-cosmic-rip-route"
  | "meta-cosmic-rip-objective-scan"
  | "meta-cosmic-rip-restore-affordance"
  | "meta-cosmic-rip-action-affordances"
  | "meta-cosmic-rip-close-affordance"
  | "meta-cosmic-rip-ending-ready"
  | "space-late-game"
  | "space-returning-rocket"
  | "space-voidborn-pillage";

/** Test-only start states used by click-driven browser tests to reach later economy systems. */
export function createEconomyFixture(
  kind: EconomyFixtureKind,
  locale: GameState["settings"]["locale"],
): GameState {
  if (kind === "space-starship-o-arrival" || kind === "space-starship-factory-arrival") {
    const ready = createEconomyFixture("space-starship-ready", locale);
    const catalogue = createStarCatalogue();
    const destination =
      kind === "space-starship-o-arrival"
        ? catalogue.find((star) => star.starType === "O" && !star.initiallySettled)!
        : catalogue.find((star) => star.name === "Sirius")!;
    const timerId = createTimerId("travel", "arrival-narrative");
    const factorySystemId = destination.id;
    const manuscripts =
      kind === "space-starship-factory-arrival"
        ? [
            {
              position: 1 as const,
              manuscriptSystemId: catalogue.find((star) => star.name === "Canopus")!.id,
              factorySystemId,
              megastructureId: "dysonSphere" as const,
              reported: true,
            },
          ]
        : ready.permanent.megastructures.ancientManuscripts;
    return {
      ...ready,
      run: {
        ...ready.run,
        timers: {
          ...ready.run.timers,
          [timerId]: createTimer({ id: timerId, domain: "travel", durationMs: 1_000 }),
        },
        space: {
          ...ready.run.space,
          starStudyRange: 200,
          systemProfiles: ensureDiscoveredStarSystemProfiles(
            ready.run.space.systemProfiles,
            ready.run.space.currentSystemId,
            200,
          ),
          antimatter: 1_000_000,
          starship: {
            ...ready.run.space.starship,
            destinationSystemId: destination.id,
            phase: "travelling",
            timerId,
            durationMs: 1_000,
            antimatterSpent: 1,
            travelDistanceLy: 1,
          },
        },
      },
      permanent: {
        ...ready.permanent,
        megastructures: {
          ...ready.permanent.megastructures,
          ancientManuscripts: manuscripts,
        },
      },
    };
  }
  const spaceFixture = kind.startsWith("space-");
  const base = createInitialGameState({
    pioneerName: "Economy Test Pioneer",
    seed: 20261003,
    locale,
  });
  if (kind === "philosophy-notification-routes") {
    return {
      ...base,
      run: {
        ...base.run,
        philosophyChoicePending: false,
        researchPoints: 1_000_000,
      },
      permanent: { ...base.permanent, philosophyId: "constructor" },
    };
  }
  if (kind === "hydrogen-sale-currency-tail") {
    const hydrogen = base.run.goods.hydrogen;
    return {
      ...base,
      run: {
        ...base.run,
        goods: {
          ...base.run.goods,
          hydrogen: { ...hydrogen, quantity: 330, storageCapacity: 330 },
        },
      },
    };
  }
  if (kind === "space-telescope-shortfall") {
    const telescopeReady = createEconomyFixture("space-telescope", locale);
    const ironRequired = TELESCOPE_COST.materials.find(({ goodId }) => goodId === "iron")!.amount;
    return {
      ...telescopeReady,
      run: {
        ...telescopeReady.run,
        goods: {
          ...telescopeReady.run.goods,
          iron: { ...telescopeReady.run.goods.iron, quantity: ironRequired - 1 },
        },
      },
    };
  }
  if (kind === "space-asteroid-mining") {
    const lateGame = createEconomyFixture("space-late-game", locale);
    const activeRocket = lateGame.run.space.rockets.rocket1;
    const releasedRocket = lateGame.run.space.rockets.rocket4;
    const removedTimerIds = new Set(
      [activeRocket.timerId, releasedRocket.timerId].filter((id): id is string => id !== null),
    );
    const asteroidRarities = ["common", "uncommon", "rare", "legendary"] as const;
    const asteroids = lateGame.run.space.asteroids.map((asteroid, index) =>
      index === 3
        ? {
            ...asteroid,
            rarity: asteroidRarities[index]!,
            remainingAntimatter: 0,
            reservedBy: null,
            depleted: true,
          }
        : { ...asteroid, rarity: asteroidRarities[index]! },
    );
    return {
      ...lateGame,
      run: {
        ...lateGame.run,
        timers: Object.fromEntries(
          Object.entries(lateGame.run.timers).filter(([id]) => !removedTimerIds.has(id)),
        ),
        space: {
          ...lateGame.run.space,
          asteroids,
          selectedAsteroidId: asteroids[0]!.id,
          rockets: {
            ...lateGame.run.space.rockets,
            rocket1: { ...activeRocket, phase: "mining", timerId: null },
            rocket4: {
              ...releasedRocket,
              phase: "ready",
              targetAsteroidId: null,
              timerId: null,
            },
          },
        },
      },
    };
  }
  if (kind === "notation-coverage") {
    const complete = createEconomyFixture("full", locale);
    const hydrogenTier4 = autobuyerUpgradeId("hydrogen", 4);
    return {
      ...complete,
      statistics: {
        ...complete.statistics,
        lifetimeActiveMs: 1_999 * 86_400_000,
        lifetimeCashEarned: 987_654_321_098.76,
      },
      run: {
        ...complete.run,
        clock: { ...complete.run.clock, simulationMs: 1_999 * 86_400_000 },
        upgrades: { ...complete.run.upgrades, [hydrogenTier4]: 5 },
        economy: {
          ...complete.run.economy,
          autobuyerEnabled: {
            ...complete.run.economy.autobuyerEnabled,
            [hydrogenTier4]: true,
          },
        },
      },
    };
  }
  if (kind === "meta-galactic-identity-matrix") {
    const route = createEconomyFixture("meta-megastructure-route", locale);
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    return {
      ...route,
      run: {
        ...route.run,
        space: {
          ...route.run.space,
          systemEncounters: [generateStarSystemEncounter(destination, false)],
        },
      },
      permanent: {
        ...route.permanent,
        blackHole: {
          ...route.permanent.blackHole,
          discovered: true,
          discoveryProbability: 3,
        },
      },
    };
  }
  if (kind === "meta-rebirth-ready") {
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    return {
      ...base,
      run: {
        ...base.run,
        space: {
          ...base.run.space,
          ascendencyAwardedThisRun: true,
          systemEncounters: [generateStarSystemEncounter(destination, false)],
        },
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
  if (kind === "meta-market-rebirth-ready") {
    const market = createEconomyFixture("meta-market-ready", locale);
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    return {
      ...market,
      run: {
        ...market.run,
        space: {
          ...market.run.space,
          systemEncounters: [generateStarSystemEncounter(destination, false)],
        },
      },
    };
  }
  if (kind === "meta-market-action-reasons") {
    return {
      ...base,
      run: {
        ...base.run,
        unlockedResources: ["hydrogen", "helium"],
        marketLockdownRemainingMs: 3_000,
        goods: {
          ...base.run.goods,
          hydrogen: { ...base.run.goods.hydrogen, quantity: 100 },
          helium: { ...base.run.goods.helium, quantity: 119 },
        },
        space: { ...base.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        ascendencyPoints: 3,
        gloryPoints: 1,
      },
    };
  }
  if (kind === "meta-market-action-reasons-rebirth-ready") {
    const market = createEconomyFixture("meta-market-action-reasons", locale);
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    return {
      ...market,
      run: {
        ...market.run,
        space: {
          ...market.run.space,
          systemEncounters: [generateStarSystemEncounter(destination, false)],
        },
      },
    };
  }
  if (kind === "meta-casino-ready") {
    let casinoSeed = 0;
    while (nextRandomInteger({ seed: casinoSeed, draws: 0 }, 0, 15).value !== 0) casinoSeed += 1;
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
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
        space: {
          ...base.run.space,
          ascendencyAwardedThisRun: true,
          systemEncounters: [generateStarSystemEncounter(destination, false)],
        },
      },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        galacticCasino: { ...base.permanent.galacticCasino, casinoPoints: 0 },
      },
    };
  }
  if (kind === "meta-casino-timewarp") {
    const casinoReady = createEconomyFixture("meta-casino-ready", locale);
    const higherLowerPlayed = casinoReady.run.casinoStats.higherLowerPlayed + 1;
    return {
      ...casinoReady,
      run: {
        ...casinoReady.run,
        casinoStats: { ...casinoReady.run.casinoStats, higherLowerPlayed },
      },
      permanent: {
        ...casinoReady.permanent,
        galacticCasino: {
          ...casinoReady.permanent.galacticCasino,
          casinoPoints: 5,
          higherLower: {
            deck: [
              { rank: 8, suit: "diamonds" },
              { rank: 5, suit: "clubs" },
              { rank: 6, suit: "spades" },
              { rank: 13, suit: "hearts" },
              { rank: 9, suit: "clubs" },
              { rank: 3, suit: "hearts" },
              { rank: 5, suit: "hearts" },
              { rank: 4, suit: "spades" },
              { rank: 10, suit: "spades" },
            ],
            index: 7,
            prizeKey: "hilo_timewarp_100_12000",
          },
          lifetimeStats: {
            ...casinoReady.permanent.galacticCasino.lifetimeStats,
            higherLowerPlayed:
              casinoReady.permanent.galacticCasino.lifetimeStats.higherLowerPlayed + 1,
          },
        },
      },
    };
  }
  if (kind === "meta-casino-finish-rocket-journey") {
    const casinoReady = createEconomyFixture("meta-casino-ready", locale);
    const timerId = createTimerId("travel", "rocket1-asteroid-journey");
    const asteroidId = "asteroid-2";
    const asteroid = {
      id: asteroidId,
      name: "SPI-0002B",
      systemId: "spica",
      distance: 1_000,
      rarity: "common" as const,
      extractionEase: 1,
      remainingAntimatter: 700,
      totalAntimatter: 700,
      reservedBy: "rocket1" as const,
      depleted: false,
      interacted: true,
    };
    const higherLowerPlayed = casinoReady.run.casinoStats.higherLowerPlayed + 1;
    return {
      ...casinoReady,
      run: {
        ...casinoReady.run,
        casinoStats: { ...casinoReady.run.casinoStats, higherLowerPlayed },
        timers: {
          ...casinoReady.run.timers,
          [timerId]: createTimer({ id: timerId, domain: "travel", durationMs: 10_000 }),
        },
        space: {
          ...casinoReady.run.space,
          launchPadBuilt: true,
          antimatterUnlocked: true,
          asteroids: [asteroid],
          nextAsteroidSequence: 3,
          rockets: {
            ...casinoReady.run.space.rockets,
            rocket1: {
              ...casinoReady.run.space.rockets.rocket1,
              name: "Prospector",
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
              fuelQuantity: ROCKET_FUEL_CAPACITY.rocket1,
              phase: "outbound" as const,
              targetAsteroidId: asteroidId,
              journeyCount: 1,
              timerId,
            },
          },
        },
      },
      permanent: {
        ...casinoReady.permanent,
        galacticCasino: {
          ...casinoReady.permanent.galacticCasino,
          casinoPoints: 42,
          higherLower: {
            deck: [2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank, index) => ({
              rank,
              suit: (["clubs", "diamonds", "hearts", "spades"] as const)[index % 4]!,
            })),
            index: 7,
            prizeKey: "special_finish_rocket_journey",
          },
          lifetimeStats: {
            ...casinoReady.permanent.galacticCasino.lifetimeStats,
            higherLowerPlayed:
              casinoReady.permanent.galacticCasino.lifetimeStats.higherLowerPlayed + 1,
          },
        },
      },
    };
  }
  if (kind === "meta-post-rebirth-casino-access") {
    return {
      ...base,
      run: { ...base.run, cash: 100_000 },
      permanent: {
        ...base.permanent,
        rebirthCount: 1,
        ascendencyPoints: 100,
        gloryPoints: 1,
      },
    };
  }
  if (kind === "meta-black-hole-discovered" || kind === "meta-black-hole-underfunded") {
    return {
      ...base,
      run: {
        ...base.run,
        researchPoints:
          kind === "meta-black-hole-underfunded" ? BLACK_HOLE_RESEARCH_PRICE - 1 : 3_000_000,
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
  if (kind === "meta-megastructure-route" || kind === "meta-megastructure-research-reasons") {
    const researchReasonsFixture = kind === "meta-megastructure-research-reasons";
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
      ...(researchReasonsFixture
        ? []
        : [
            MEGASTRUCTURE_TRACKS.galacticMemoryArchive[0]!,
            MEGASTRUCTURE_TRACKS.galacticMemoryArchive[1]!,
          ]),
    ];
    const settledSystemIds = [
      ...base.permanent.settledSystemIds,
      ...factoryNames
        .filter((name) => !(researchReasonsFixture && name === "Deneb"))
        .map((name) => star(name).id),
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
      ...(!researchReasonsFixture ? ["orbitalConstruction" as const] : []),
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
  if (kind === "meta-megastructure-audio") {
    const route = createEconomyFixture("meta-megastructure-route", locale);
    const forceFieldTechnologies = Object.values(MEGASTRUCTURE_TRACKS).map((track) => track[2]!);
    return {
      ...route,
      run: { ...route.run, researchPoints: 1_000_000 },
      permanent: {
        ...route.permanent,
        megastructures: {
          ...route.permanent.megastructures,
          researchedTechnologyIds: route.permanent.megastructures.researchedTechnologyIds.filter(
            (technologyId) => !forceFieldTechnologies.includes(technologyId),
          ),
        },
      },
    };
  }
  if (kind.startsWith("meta-megastructure-factory-")) {
    const route = createEconomyFixture("meta-megastructure-route", locale);
    const structureId = kind.slice("meta-megastructure-factory-".length) as MegastructureId;
    const factory = route.permanent.megastructures.ancientManuscripts.find(
      (record) => record.megastructureId === structureId,
    );
    if (!factory) return route;
    return {
      ...route,
      run: {
        ...route.run,
        space: {
          ...route.run.space,
          currentSystemId: factory.factorySystemId,
          weatherSystemId: factory.factorySystemId,
        },
      },
    };
  }
  if (kind.startsWith("meta-megastructure-visual-")) {
    const route = createEconomyFixture("meta-megastructure-route", locale);
    const structureId = kind.slice("meta-megastructure-visual-".length) as MegastructureId;
    const factory = route.permanent.megastructures.ancientManuscripts.find(
      (record) => record.megastructureId === structureId,
    );
    if (!factory) return route;
    const allStages = Object.values(MEGASTRUCTURE_TRACKS).flat();
    const carriedStages = Object.values(MEGASTRUCTURE_TRACKS).flatMap((track) => track.slice(0, 3));
    const carriedStageSet = new Set(carriedStages);
    return {
      ...route,
      run: {
        ...route.run,
        space: {
          ...route.run.space,
          currentSystemId: factory.factorySystemId,
          weatherSystemId: factory.factorySystemId,
        },
        economy: {
          ...route.run.economy,
          researchedTechnologies: [
            ...route.run.economy.researchedTechnologies.filter((id) => !allStages.includes(id)),
            ...carriedStages,
          ],
        },
      },
      permanent: {
        ...route.permanent,
        megastructures: {
          ...route.permanent.megastructures,
          researchedTechnologyIds: Array.from(carriedStageSet),
        },
      },
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
        economy: {
          ...base.run.economy,
          researchedTechnologies: [...base.run.economy.researchedTechnologies, "compounds"],
          revealedTechnologies: [...base.run.economy.revealedTechnologies, "compounds"],
          unlockedCompounds: COMPOUND_IDS,
        },
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
  if (kind === "meta-cosmic-rip-objective-scan") {
    const route = createEconomyFixture("meta-cosmic-rip-route", locale);
    return {
      ...route,
      permanent: {
        ...route.permanent,
        gloryPoints: 20,
        cosmicRip: {
          ...route.permanent.cosmicRip,
          scannerRestored: false,
          ripLocationSectorIndex: 4,
          scannedSectorIndexes: [],
          ripFound: false,
          telemetryData: 200_000,
          activeResearchTechnologyId: null,
          researchElapsedMs: 0,
          researchedTechnologyIds: [],
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
  if (kind === "meta-cosmic-rip-ending-ready") {
    const route = createEconomyFixture("meta-cosmic-rip-route", locale);
    return {
      ...route,
      settings: { ...route.settings, notificationsEnabled: false },
      permanent: {
        ...route.permanent,
        gloryPoints: 1,
        cosmicRip: {
          ...route.permanent.cosmicRip,
          researchedTechnologyIds: COSMIC_RIP_TECHNOLOGIES.map(({ id }) => id),
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
  if (kind === "storage-production") {
    upgrades[autobuyerUpgradeId("hydrogen", 1)] = 1;
    upgrades[autobuyerUpgradeId("water", 1)] = 1;
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
          : kind === "storage-production" && ["hydrogen", "water"].includes(id)
            ? 100_000
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
  if (kind === "storage-production") {
    autobuyerEnabled[autobuyerUpgradeId("hydrogen", 1)] = true;
    autobuyerEnabled[autobuyerUpgradeId("water", 1)] = true;
  }
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
    COMPOUND_IDS.map((id) => [id, !["compound-automation", "storage-production"].includes(kind)]),
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
      hydrogenAutobuyerEnabled:
        kind === "storage-production" ? true : base.run.hydrogenAutobuyerEnabled,
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
    kind === "space-rocket-part-shortfall" ||
    kind === "space-rocket-part-exact" ||
    kind === "space-rocket-fuel-pump" ||
    kind === "space-starship-ready" ||
    kind === "space-starship-scanning" ||
    kind === "space-starship-scanning-blind" ||
    kind === "space-diplomacy" ||
    kind === "space-battle-victory" ||
    kind === "space-rapid-expansion-victory" ||
    kind === "space-battle-defeat" ||
    kind === "space-diplomacy-power" ||
    kind === "space-diplomacy-power-fail" ||
    kind === "space-diplomacy-aggressive" ||
    kind === "space-bully-scared" ||
    kind === "space-bully-surrender" ||
    kind === "space-unoccupied" ||
    kind === "space-megastructure-attention" ||
    kind === "space-late-game" ||
    kind === "space-returning-rocket" ||
    kind === "space-voidborn-pillage"
  ) {
    const scanningFixture =
      kind !== "space-starship-ready" &&
      kind !== "space-rocket-fuel-pump" &&
      kind !== "space-rocket-part-shortfall" &&
      kind !== "space-rocket-part-exact";
    const rapidExpansionFixture = kind === "space-rapid-expansion-victory";
    const battleVictoryFixture = kind === "space-battle-victory" || rapidExpansionFixture;
    const battleDefeatFixture = kind === "space-battle-defeat";
    const poweredDiplomacyFixture = [
      "space-diplomacy-power",
      "space-diplomacy-power-fail",
      "space-diplomacy-aggressive",
      "space-bully-scared",
      "space-bully-surrender",
    ].includes(kind);
    const aggressiveDiplomacyFixture = kind === "space-diplomacy-aggressive";
    const unoccupiedFixture =
      kind === "space-unoccupied" || kind === "space-megastructure-attention";
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
            (scanningFixture &&
              kind !== "space-starship-scanning-blind" &&
              moduleId === "stellarScanner")
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
        random: rapidExpansionFixture
          ? { seed: 1, draws: 0 }
          : poweredDiplomacyFixture
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
            kind !== "space-starship-scanning" &&
            kind !== "space-starship-scanning-blind" &&
            scanningFixture
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
                    attackPower: rapidExpansionFixture ? 1_000 : poweredDiplomacyFixture ? 20 : 6,
                    defensePower: rapidExpansionFixture ? 1_000 : poweredDiplomacyFixture ? 20 : 6,
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
                travelDistanceLy: null,
              }
            : state.run.space.starship,
        },
      },
      statistics: {
        ...state.statistics,
        lifetimeAntimatterMined: 1_000_000,
      },
    };
    if (rapidExpansionFixture) {
      return {
        ...fixtureState,
        run: { ...fixtureState.run, philosophyAbilityActive: true },
        permanent: { ...fixtureState.permanent, philosophyId: "expansionist" },
      };
    }
    if (kind === "space-megastructure-attention") {
      const manuscriptSystemId = createStarCatalogue().find((star) => star.name === "Canopus")!.id;
      return {
        ...fixtureState,
        permanent: {
          ...fixtureState.permanent,
          megastructures: {
            ...fixtureState.permanent.megastructures,
            ancientManuscripts: [
              {
                position: 1,
                manuscriptSystemId,
                factorySystemId: scanDestination.id,
                megastructureId: "dysonSphere",
                reported: true,
              },
            ],
          },
        },
      };
    }
    if (kind === "space-rocket-part-shortfall" || kind === "space-rocket-part-exact") {
      const steelQuantity = kind === "space-rocket-part-shortfall" ? 2_999 : 3_000;
      return {
        ...fixtureState,
        run: {
          ...fixtureState.run,
          goods: {
            ...fixtureState.run.goods,
            steel: { ...fixtureState.run.goods.steel, quantity: steelQuantity },
          },
          economy: {
            ...fixtureState.run.economy,
            resourceAllocation: Object.fromEntries(
              MATERIAL_IDS.map((goodId) => [
                goodId,
                {
                  ...fixtureState.run.economy.resourceAllocation[goodId],
                  enabled: false,
                  cashShare: 0,
                  compoundShare: 0,
                },
              ]),
            ) as GameState["run"]["economy"]["resourceAllocation"],
          },
          space: { ...fixtureState.run.space, launchPadBuilt: true },
        },
      };
    }
    if (kind === "space-rocket-fuel-pump") {
      return {
        ...fixtureState,
        run: {
          ...fixtureState.run,
          space: {
            ...fixtureState.run.space,
            launchPadBuilt: true,
            rockets: {
              ...fixtureState.run.space.rockets,
              rocket1: {
                ...fixtureState.run.space.rockets.rocket1,
                builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
                phase: "ready",
              },
            },
          },
        },
      };
    }
    if (kind === "space-voidborn-pillage") {
      return {
        ...fixtureState,
        run: {
          ...fixtureState.run,
          philosophyChoicePending: false,
          philosophyAbilityActive: true,
          space: { ...fixtureState.run.space, telescopeBuilt: true },
          economy: {
            ...fixtureState.run.economy,
            power: { ...fixtureState.run.economy.power, gridEnabled: true, infinitePower: true },
          },
        },
        permanent: {
          ...fixtureState.permanent,
          rebirthCount: 1,
          philosophyId: "voidborn",
        },
      };
    }
    if (kind !== "space-late-game" && kind !== "space-returning-rocket") return fixtureState;

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
    const lateGameFixture: GameState = {
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
    if (kind !== "space-returning-rocket") return lateGameFixture;
    return {
      ...lateGameFixture,
      run: {
        ...lateGameFixture.run,
        space: {
          ...lateGameFixture.run.space,
          rockets: {
            ...lateGameFixture.run.space.rockets,
            rocket1: { ...lateGameFixture.run.space.rockets.rocket1, phase: "returning" },
          },
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
