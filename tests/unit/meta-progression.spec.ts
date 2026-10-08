import { describe, expect, it } from "vitest";
import {
  ASCENDENCY_PERKS,
  ascendencyPerkCost,
  ascendencyPerkLevel,
} from "../../src/content/ascendency";
import { transition } from "../../src/engine/commands";
import { createEconomyTickPlan } from "../../src/engine/economySimulation";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import { COSMIC_RIP_TECHNOLOGIES } from "../../src/content/cosmicRip";
import { HOME_SYSTEM_NAME, createStarCatalogue } from "../../src/content/starCatalogue";
import { starTypeForSystem } from "../../src/content/starCatalogue";
import { bTypeAutoBuyerBonusPerSecond } from "../../src/content/starTypeRules";
import { permanentPerkPurchaseCount } from "../../src/content/economyRules";
import { advanceCosmicRip } from "../../src/engine/cosmicRip";
import { createTimer, createTimerId } from "../../src/engine/timers";
import { createInitialStarSystemBattleState } from "../../src/content/space";
import { generateStarSystemEncounter } from "../../src/engine/starSystemEncounters";
import {
  decodeLocal,
  decodePortable,
  encodeLocal,
  encodePortable,
} from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";
import {
  advanceGalacticMarket,
  marketLiquidationPreview,
  quoteGalacticTrade,
} from "../../src/engine/galacticMarket";

function rebirthReadyState(rebirthCount: number = 1) {
  const state = createInitialGameState({ pioneerName: "Ada", seed: 80, locale: "fr" });
  const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
  return {
    ...state,
    run: {
      ...state.run,
      cash: 500,
      researchPoints: 90_000,
      space: { ...state.run.space, ascendencyAwardedThisRun: true },
    },
    permanent: {
      ...state.permanent,
      rebirthCount,
      ascendencyPoints: 80,
      gloryPoints: 3,
      settledSystemIds: [...state.permanent.settledSystemIds, destination.id],
      acquiredPerks: ["efficientStorage", "efficientStorage", "quantumEngines"],
      philosophyId: "constructor" as const,
    },
    statistics: { ...state.statistics, lifetimeCashEarned: 500 },
  };
}

describe("meta progression content", () => {
  it("preserves navigation attention and visited history across local reload and rebirth", () => {
    const ready = rebirthReadyState(0);
    const navigationReady = {
      ...ready,
      run: {
        ...ready.run,
        navigationAttentionIds: ["miaplaedia-story"],
        navigationAttentionInitialized: true,
      },
      permanent: {
        ...ready.permanent,
        navigationVisitedIds: ["settings-game-options"],
      },
    };

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000036",
      pioneerName: navigationReady.run.pioneerName,
      createdAt: 1,
      savedAt: 2,
      revision: 1,
      state: navigationReady,
    });
    const reloaded = decodeLocal(encodeLocal(envelope)).state;

    expect(reloaded.run.navigationAttentionIds).toEqual(["miaplaedia-story"]);
    expect(reloaded.run.navigationAttentionInitialized).toBe(true);
    expect(reloaded.permanent.navigationVisitedIds).toEqual(["settings-game-options"]);

    const reborn = transition(reloaded, { type: "meta.rebirth" });

    expect(reborn.accepted).toBe(true);
    expect(reborn.state.run.navigationAttentionIds).toEqual(["miaplaedia-story"]);
    expect(reborn.state.run.navigationAttentionInitialized).toBe(true);
    expect(reborn.state.permanent.navigationVisitedIds).toEqual(["settings-game-options"]);

    const discovered = transition(reborn.state, {
      type: "navigation.attention.discover",
      pageIds: ["settings-game-options", "miaplaedia-story", "research-science-buildings"],
    });
    expect(discovered.state.run.navigationAttentionIds).toEqual([
      "miaplaedia-story",
      "research-science-buildings",
    ]);

    const revisited = transition(discovered.state, {
      type: "navigation.attention.clear",
      pageId: "settings-game-options",
    });
    expect(revisited.state.permanent.navigationVisitedIds).toEqual(["settings-game-options"]);

    const newlyVisited = transition(revisited.state, {
      type: "navigation.attention.clear",
      pageId: "research-science-buildings",
    });
    expect(newlyVisited.state.run.navigationAttentionIds).toEqual(["miaplaedia-story"]);
    expect(newlyVisited.state.permanent.navigationVisitedIds).toEqual([
      "settings-game-options",
      "research-science-buildings",
    ]);

    const rediscovered = transition(newlyVisited.state, {
      type: "navigation.attention.discover",
      pageIds: ["settings-game-options", "research-science-buildings"],
    });
    expect(rediscovered.state.run.navigationAttentionIds).toEqual(["miaplaedia-story"]);
  });

  it("counts each repeated ascendency perk purchase from saved duplicate IDs", () => {
    expect(
      permanentPerkPurchaseCount(
        ["quantumEngines", "quantumEngines", "quantumEngines"],
        "quantumEngines",
      ),
    ).toBe(3);
  });

  it("defines all sixteen source-backed ascendency perk IDs", () => {
    expect(ASCENDENCY_PERKS).toHaveLength(16);
    expect(ASCENDENCY_PERKS.map(({ id }) => id)).toEqual([
      "littleBagOfHydrogen",
      "nonExhaustiveResources",
      "efficientStorage",
      "smartAutoBuyers",
      "jumpstartResearch",
      "optimizedPowerGrids",
      "nanoBrokers",
      "roboticResearchAutomation",
      "fasterAsteroidScan",
      "deeperStarStudy",
      "asteroidScannerBoost",
      "rocketFuelOptimization",
      "enhancedMining",
      "quantumEngines",
      "autoSpaceTelescope",
      "bulkPurchasing",
    ]);
    expect(new Set(ASCENDENCY_PERKS.map(({ id }) => id)).size).toBe(16);
    expect(
      ASCENDENCY_PERKS.map(({ baseCost, priceMultiplier, priceLadder, maxPurchases }) => [
        baseCost,
        priceMultiplier ?? null,
        priceLadder ?? null,
        maxPurchases ?? null,
      ]),
    ).toEqual([
      [3, null, null, 1],
      [10, null, null, 1],
      [10, 2, null, 3],
      [15, 2, null, null],
      [30, null, null, 1],
      [15, 2, null, null],
      [15, null, [15, 30, 50], 3],
      [20, null, null, 1],
      [20, 1.2, null, 4],
      [50, 2, null, 3],
      [20, 1, null, 2],
      [40, null, null, 1],
      [15, 2, null, 4],
      [15, 2, null, 6],
      [40, null, null, 1],
      [3, null, null, 1],
    ]);
  });

  it("uses exponential repeatable pricing and explicit Nano Brokers prices", () => {
    expect(ascendencyPerkCost([], "efficientStorage")).toBe(10);
    expect(ascendencyPerkCost(["efficientStorage"], "efficientStorage")).toBe(20);
    expect(ascendencyPerkCost(["efficientStorage", "efficientStorage"], "efficientStorage")).toBe(
      40,
    );
    expect(ascendencyPerkCost(["nanoBrokers:1"], "nanoBrokers")).toBe(30);
    expect(ascendencyPerkCost(["nanoBrokers:1", "nanoBrokers:2"], "nanoBrokers")).toBe(50);
    expect(ascendencyPerkLevel(["nanoBrokers:1", "nanoBrokers:2"], "nanoBrokers")).toBe(2);
  });
});

describe("validated rebirth and ascendency purchases", () => {
  it("rejects rebirth before a settled destination and while a battle or journey is active", () => {
    const fresh = createInitialGameState();
    expect(transition(fresh, { type: "meta.rebirth" }).failure?.code).toBe("rebirth-not-awarded");

    const ready = rebirthReadyState();
    const catalogue = createStarCatalogue();
    const destination = catalogue.find(
      (star) => !ready.permanent.settledSystemIds.includes(star.id),
    )!;
    for (const domain of ["travel", "battle"] as const) {
      const timerId =
        domain === "travel"
          ? createTimerId("travel", "starship")
          : createTimerId("battle", "starship-combat");
      const timer = createTimer({
        id: timerId,
        domain,
        durationMs: 1_000,
        repeat: domain === "battle",
      });
      const encounter = generateStarSystemEncounter(destination, false);
      const blocked = {
        ...ready,
        run: {
          ...ready.run,
          timers: {
            ...ready.run.timers,
            [timerId]: timer,
          },
          space: {
            ...ready.run.space,
            starship:
              domain === "travel"
                ? {
                    destinationSystemId: destination.id,
                    phase: "travelling" as const,
                    timerId,
                    durationMs: 1_000,
                    antimatterSpent: 1,
                    travelDistanceLy: 0,
                  }
                : ready.run.space.starship,
            systemEncounters:
              domain === "battle"
                ? [
                    {
                      ...encounter,
                      battle: {
                        ...createInitialStarSystemBattleState(),
                        phase: "inProgress" as const,
                        round: 1,
                      },
                    },
                  ]
                : ready.run.space.systemEncounters,
          },
        },
      };
      expect(transition(blocked, { type: "meta.rebirth" }).failure?.code).toBe("rebirth-busy");
    }
  });

  it("rebirths atomically at the conquered destination while retaining permanent state and settings", () => {
    const ready = rebirthReadyState();
    const readyWithCasino = {
      ...ready,
      settings: {
        ...ready.settings,
        notation: "scientific" as const,
        soundEnabled: false,
        reducedMotion: true,
      },
      permanent: {
        ...ready.permanent,
        galacticCasino: {
          ...ready.permanent.galacticCasino,
          casinoPoints: 42,
          gamesWon: ["wheel"] as const,
          wheelSpecialPending: true,
          higherLower: {
            deck: [2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank, index) => ({
              rank,
              suit: (["clubs", "diamonds", "hearts", "spades"] as const)[index % 4]!,
            })),
            index: 2,
            prizeKey: "hilo_cp_5",
          },
          lifetimeStats: {
            ...ready.permanent.galacticCasino.lifetimeStats,
            cpSpent: 8,
          },
        },
      },
      statistics: {
        ...ready.statistics,
        lifetimeResearchPointsEarned: 98.5,
        lifetimeScienceKitsBuilt: 8,
        lifetimeScienceClubsBuilt: 5,
        lifetimeScienceLabsBuilt: 2,
        lifetimeAscendencyPointsGained: 7,
        lifetimeAsteroidsDiscovered: 3,
        lifetimeLegendaryAsteroidsDiscovered: 1,
        lifetimeAsteroidsMined: 6,
        lifetimeRocketsBuilt: 4,
        lifetimeRocketsLaunched: 2,
        lifetimeStarshipsLaunched: 4,
        lifetimeGoodsProducedByGood: {
          ...ready.statistics.lifetimeGoodsProducedByGood,
          hydrogen: 123,
          water: 45,
        },
      },
      run: {
        ...ready.run,
        researchPointsEarnedThisRun: 12.5,
        scienceKitsBuiltThisRun: 2,
        scienceClubsBuiltThisRun: 1,
        scienceLabsBuiltThisRun: 1,
        goodsProducedThisRun: {
          ...ready.run.goodsProducedThisRun,
          hydrogen: 12,
          water: 4,
        },
        space: { ...ready.run.space, asteroidsMinedThisRun: 2 },
      },
    };
    const destination = ready.permanent.settledSystemIds.at(-1);
    const result = transition(readyWithCasino, { type: "meta.rebirth" });
    expect(result.accepted).toBe(true);
    expect(result.state.permanent).toMatchObject({
      rebirthCount: 2,
      ascendencyPoints: 80,
      gloryPoints: 4,
      acquiredPerks: ["efficientStorage", "efficientStorage", "quantumEngines"],
      philosophyId: "constructor",
    });
    expect(result.state.run.space.currentSystemId).toBe(destination);
    expect(result.state.run.cash).toBe(10);
    expect(result.state.run.researchPoints).toBe(50);
    expect(result.state.run).toMatchObject({
      researchPointsEarnedThisRun: 0,
      scienceKitsBuiltThisRun: 0,
      scienceClubsBuiltThisRun: 0,
      scienceLabsBuiltThisRun: 0,
    });
    expect(result.state.run.space.ascendencyAwardedThisRun).toBe(false);
    expect(result.state.run.goods.hydrogen.quantity).toBe(0);
    expect(result.state.run.goods.hydrogen.storageCapacity).toBe(
      createInitialGameState().run.goods.hydrogen.storageCapacity,
    );
    expect(result.state.run.economy.researchedTechnologies).toEqual([]);
    expect(result.state.run.upgrades).toEqual(createInitialGameState().run.upgrades);
    expect(result.state.settings).toEqual(readyWithCasino.settings);
    expect(result.state.statistics.lifetimeCashEarned).toBe(500);
    expect(result.state.statistics).toMatchObject({
      lifetimeAscendencyPointsGained: 7,
      lifetimeResearchPointsEarned: 98.5,
      lifetimeScienceKitsBuilt: 8,
      lifetimeScienceClubsBuilt: 5,
      lifetimeScienceLabsBuilt: 2,
      lifetimeAsteroidsDiscovered: 3,
      lifetimeLegendaryAsteroidsDiscovered: 1,
      lifetimeAsteroidsMined: 6,
      lifetimeRocketsBuilt: 4,
      lifetimeRocketsLaunched: 2,
      lifetimeStarshipsLaunched: 4,
      lifetimeGoodsProducedByGood: { hydrogen: 123, water: 45 },
    });
    expect(result.state.run.goodsProducedThisRun).toEqual(
      createInitialGameState().run.goodsProducedThisRun,
    );
    expect(result.state.run.space.asteroidsMinedThisRun).toBe(0);
    expect(result.state.permanent.galacticCasino).toMatchObject({
      casinoPoints: 0,
      gamesWon: ["wheel"],
      wheelSpecialPending: false,
      higherLower: null,
      lifetimeStats: { cpSpent: 8 },
    });
    expect(result.events[0]).toMatchObject({ type: "meta.rebirth.completed", rebirthCount: 2 });
  });

  it("completes two consecutive rebirths at each newly settled destination and survives export/import", () => {
    const firstReady = rebirthReadyState(0);
    const firstDestination = firstReady.permanent.settledSystemIds.at(-1)!;
    const first = transition(firstReady, { type: "meta.rebirth" });
    expect(first.state.permanent.rebirthCount).toBe(1);
    expect(first.state.permanent.gloryPoints).toBe(4);
    expect(first.state.run.space.currentSystemId).toBe(firstDestination);

    const secondStar = createStarCatalogue().find(
      (star) => !star.initiallySettled && !first.state.permanent.settledSystemIds.includes(star.id),
    )!;
    const secondReady = {
      ...first.state,
      run: {
        ...first.state.run,
        space: { ...first.state.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...first.state.permanent,
        settledSystemIds: [...first.state.permanent.settledSystemIds, secondStar.id],
      },
    };
    const second = transition(secondReady, { type: "meta.rebirth" });
    expect(second.accepted).toBe(true);
    expect(second.state.permanent.rebirthCount).toBe(2);
    expect(second.state.permanent.gloryPoints).toBe(5);
    expect(second.state.run.space.currentSystemId).toBe(secondStar.id);

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000021",
      pioneerName: second.state.run.pioneerName,
      createdAt: 1,
      savedAt: 2,
      revision: 1,
      state: second.state,
    });
    const restored = decodePortable(encodePortable(envelope));
    expect(restored.state.permanent.rebirthCount).toBe(2);
    expect(restored.state.permanent.ascendencyPoints).toBe(second.state.permanent.ascendencyPoints);
    expect(restored.state.run.space.currentSystemId).toBe(secondStar.id);
  });

  it("settles AP spend and GP awards exactly across two rebirths", () => {
    const first = transition(rebirthReadyState(0), { type: "meta.rebirth" });
    expect(first.state.permanent).toMatchObject({ ascendencyPoints: 80, gloryPoints: 4 });
    const apSale = transition(first.state, { type: "meta.market.sell-ap", quantity: 10 });
    expect(apSale.accepted).toBe(true);
    expect(apSale.state.permanent.ascendencyPoints).toBe(75);
    expect(apSale.state.permanent.gloryPoints).toBe(4);
    const nextDestination = createStarCatalogue().find(
      (star) => !apSale.state.permanent.settledSystemIds.includes(star.id),
    )!;
    const nextReady = {
      ...apSale.state,
      run: {
        ...apSale.state.run,
        space: { ...apSale.state.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...apSale.state.permanent,
        settledSystemIds: [...apSale.state.permanent.settledSystemIds, nextDestination.id],
      },
    };
    const second = transition(nextReady, { type: "meta.rebirth" });
    expect(second.accepted).toBe(true);
    expect(second.state.permanent).toMatchObject({
      rebirthCount: 2,
      ascendencyPoints: 75,
      gloryPoints: 5,
    });
  });

  it("settles AP and GP sources and sinks once across two rebirths and Cosmic Rip closure", () => {
    const ready = rebirthReadyState(0);
    const homeId = createStarCatalogue().find((star) => star.name === HOME_SYSTEM_NAME)!.id;
    const firstRun = {
      ...ready,
      run: {
        ...ready.run,
        casinoStats: {
          ...ready.run.casinoStats,
          cpSpent: 1,
          doubleOrNothingPlayed: 1,
          doubleOrNothingWon: 1,
          wheelPlayed: 1,
          wheelWon: 1,
          higherLowerPlayed: 1,
          higherLowerWon: 1,
          voidSeerPlayed: 1,
          voidSeerWon: 1,
        },
        space: {
          ...ready.run.space,
          currentSystemId: homeId,
          ascendencyAwardedThisRun: true,
        },
      },
      permanent: {
        ...ready.permanent,
        gloryPoints: 30,
        settledSystemIds: [
          ...ready.permanent.settledSystemIds.filter(
            (id) => id !== homeId && id !== ready.permanent.settledSystemIds.at(-1),
          ),
          homeId,
          ready.permanent.settledSystemIds.at(-1)!,
        ],
      },
    };
    expect(firstRun.permanent.gloryPoints).toBe(30);
    const casinoReward = transition(firstRun, { type: "onboarding.complete" });
    expect(casinoReward.accepted).toBe(true);
    expect(casinoReward.state.permanent.gloryPoints).toBe(31);
    expect(casinoReward.state.permanent.achievements.unlockedIds).toContain("winAllCasinoGames");
    expect(
      transition(casinoReward.state, { type: "onboarding.complete" }).state.permanent.gloryPoints,
    ).toBe(31);

    const firstRebirth = transition(casinoReward.state, { type: "meta.rebirth" });
    expect(firstRebirth.accepted).toBe(true);
    expect(firstRebirth.state.permanent.gloryPoints).toBe(33);
    expect(firstRebirth.state.permanent.ascendencyPoints).toBe(80);
    expect(firstRebirth.state.permanent.achievements.unlockedIds).toContain(
      "completeRunOnMiaplacidus",
    );

    const marketReady = {
      ...firstRebirth.state,
      run: {
        ...firstRebirth.state.run,
        space: { ...firstRebirth.state.run.space, ascendencyAwardedThisRun: true },
      },
    };
    const apSale = transition(marketReady, { type: "meta.market.sell-ap", quantity: 10 });
    expect(apSale.accepted).toBe(true);
    expect(apSale.state.permanent.ascendencyPoints).toBe(75);
    expect(apSale.state.permanent.achievements.unlockedIds).toContain("trade10APForCash");

    const storyPending = {
      ...apSale.state,
      permanent: {
        ...apSale.state.permanent,
        megastructures: {
          ...apSale.state.permanent.megastructures,
          miaplacidusStoryPending: true,
        },
      },
    };
    const ripUnlocked = transition(storyPending, { type: "meta.miaplacidus-story.acknowledge" });
    expect(ripUnlocked.state.permanent.cosmicRip.unlocked).toBe(true);
    const scanner = transition(ripUnlocked.state, { type: "cosmic-rip.scanner.restore" });
    expect(scanner.accepted).toBe(true);
    expect(scanner.state.permanent.gloryPoints).toBe(23);
    let allSectorsScanned = scanner.state;
    for (let sectorIndex = 0; sectorIndex < 9; sectorIndex += 1) {
      const scan = transition(allSectorsScanned, {
        type: "cosmic-rip.sector.scan",
        sectorIndex,
      });
      expect(scan.accepted).toBe(true);
      allSectorsScanned = scan.state;
    }
    expect(allSectorsScanned.permanent.gloryPoints).toBe(14);
    expect(allSectorsScanned.permanent.cosmicRip.ripFound).toBe(true);

    let state = {
      ...allSectorsScanned,
      permanent: {
        ...allSectorsScanned.permanent,
        cosmicRip: { ...allSectorsScanned.permanent.cosmicRip, telemetryData: 200_000 },
      },
    };
    for (const technology of COSMIC_RIP_TECHNOLOGIES) {
      const started = transition(state, {
        type: "cosmic-rip.tech.start",
        technologyId: technology.id,
      });
      expect(started.accepted).toBe(true);
      expect(started.state.permanent.gloryPoints).toBe(state.permanent.gloryPoints - 1);
      state = advanceCosmicRip(started.state, technology.durationMs).state;
    }
    expect(state.permanent.gloryPoints).toBe(9);
    const closed = transition(state, { type: "cosmic-rip.close" });
    expect(closed.accepted).toBe(true);
    expect(closed.state.permanent.gloryPoints).toBe(8);
    expect(closed.state.permanent.achievements.unlockedIds).toContain("completeGame");
    expect(transition(closed.state, { type: "cosmic-rip.close" }).accepted).toBe(false);

    const nextDestination = createStarCatalogue().find(
      (star) =>
        !star.initiallySettled && !closed.state.permanent.settledSystemIds.includes(star.id),
    )!;
    const secondReady = {
      ...closed.state,
      run: {
        ...closed.state.run,
        space: { ...closed.state.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...closed.state.permanent,
        settledSystemIds: [...closed.state.permanent.settledSystemIds, nextDestination.id],
      },
    };
    const secondRebirth = transition(secondReady, { type: "meta.rebirth" });
    expect(secondRebirth.accepted).toBe(true);
    expect(secondRebirth.state.permanent).toMatchObject({
      ascendencyPoints: 75,
      gloryPoints: 9,
      rebirthCount: 2,
      cosmicRip: { closed: true },
    });
    expect(secondRebirth.state.permanent.achievements.unlockedIds).toContain("winAllCasinoGames");
    expect(secondRebirth.state.permanent.achievements.unlockedIds).toContain(
      "completeRunOnMiaplacidus",
    );
  });

  it("adds Expansionist extra settlements to GP once and never pays them again", () => {
    const ready = rebirthReadyState(0);
    const extraSystemIds = createStarCatalogue()
      .filter((star) => !ready.permanent.settledSystemIds.includes(star.id))
      .slice(0, 2)
      .map((star) => star.id);
    const expandedRun = {
      ...ready,
      run: { ...ready.run, expansionistExtraSystemIds: extraSystemIds },
      permanent: { ...ready.permanent, philosophyId: "expansionist" as const },
    };
    const first = transition(expandedRun, { type: "meta.rebirth" });
    expect(first.accepted).toBe(true);
    expect(first.state.permanent.gloryPoints).toBe(6);
    expect(first.state.permanent.settledSystemIds).toEqual(expect.arrayContaining(extraSystemIds));
    expect(first.state.run.expansionistExtraSystemIds).toEqual([]);

    const nextDestination = createStarCatalogue().find(
      (star) => !star.initiallySettled && !first.state.permanent.settledSystemIds.includes(star.id),
    )!;
    const nextRun = {
      ...first.state,
      run: {
        ...first.state.run,
        space: { ...first.state.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...first.state.permanent,
        settledSystemIds: [...first.state.permanent.settledSystemIds, nextDestination.id],
      },
    };
    const second = transition(nextRun, { type: "meta.rebirth" });
    expect(second.accepted).toBe(true);
    expect(second.state.permanent.rebirthCount).toBe(2);
    expect(second.state.permanent.gloryPoints).toBe(7);
  });

  it("retains market prices, commission, history, bias and cycle across rebirth", () => {
    const ready = rebirthReadyState();
    const market = {
      ...ready.permanent.galacticMarket,
      commissionPercent: 54,
      apBuyPrice: 1_250_000,
      apSellPrice: 125_000,
      nextTradeId: 2,
      history: [
        {
          id: 1,
          simulationMs: 1234,
          outgoingGoodId: "hydrogen" as const,
          outgoingQuantity: 10,
          commissionQuantity: 1,
          incomingGoodId: "helium" as const,
          incomingQuantity: 18,
        },
      ],
      goods: {
        ...ready.permanent.galacticMarket.goods,
        hydrogen: {
          ...ready.permanent.galacticMarket.goods.hydrogen,
          marketBias: -2.5,
        },
      },
    };
    const result = transition(
      {
        ...ready,
        run: { ...ready.run, marketLockdownRemainingMs: 60_000 },
        permanent: { ...ready.permanent, galacticMarket: market },
      },
      { type: "meta.rebirth" },
    );
    expect(result.accepted).toBe(true);
    expect(result.state.permanent.galacticMarket).toEqual(market);
    expect(result.state.run.marketLockdownRemainingMs).toBe(0);
  });

  it("preserves AP on purchase, charges the exact next price, and enforces the perk cap", () => {
    const state = {
      ...createInitialGameState(),
      permanent: { ...createInitialGameState().permanent, ascendencyPoints: 30 },
    };
    const first = transition(state, { type: "meta.perk.purchase", perkId: "efficientStorage" });
    expect(first.accepted).toBe(true);
    expect(first.state.permanent.ascendencyPoints).toBe(20);
    expect(first.state.permanent.acquiredPerks).toEqual(["efficientStorage"]);
    const second = transition(first.state, {
      type: "meta.perk.purchase",
      perkId: "efficientStorage",
    });
    expect(second.accepted).toBe(true);
    expect(second.state.permanent.ascendencyPoints).toBe(0);
    const third = transition(second.state, {
      type: "meta.perk.purchase",
      perkId: "efficientStorage",
    });
    expect(third.failure?.code).toBe("insufficient-ap");
    const maxed = {
      ...second.state,
      permanent: {
        ...second.state.permanent,
        ascendencyPoints: 100,
        acquiredPerks: ["efficientStorage", "efficientStorage", "efficientStorage"],
      },
    };
    expect(
      transition(maxed, { type: "meta.perk.purchase", perkId: "efficientStorage" }).failure?.code,
    ).toBe("perk-maxed");

    const singlePurchase = transition(state, {
      type: "meta.perk.purchase",
      perkId: "bulkPurchasing",
    });
    expect(singlePurchase.accepted).toBe(true);
    expect(
      transition(singlePurchase.state, { type: "meta.perk.purchase", perkId: "bulkPurchasing" })
        .failure?.code,
    ).toBe("perk-maxed");
  });

  it("applies the two starter perks and jumpstart research after a later rebirth", () => {
    const ready = rebirthReadyState();
    const state = {
      ...ready,
      permanent: {
        ...ready.permanent,
        acquiredPerks: ["littleBagOfHydrogen", "nonExhaustiveResources", "jumpstartResearch"],
      },
    };
    const result = transition(state, { type: "meta.rebirth" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.goods.hydrogen.quantity).toBe(50);
    expect(result.state.run.unlockedResources).toHaveLength(8);
    expect(result.state.run.goods.sodium.quantity).toBe(300);
    expect(result.state.run.goods.sodium.storageCapacity).toBeGreaterThanOrEqual(300);
    expect(result.state.run.economy.researchedTechnologies).toContain("basicPowerGeneration");
    expect(result.state.run.economy.researchedTechnologies).not.toContain("sodiumIonPowerStorage");
  });

  it("carries only the source-listed automation choices through the run reset", () => {
    const ready = rebirthReadyState();
    const state = {
      ...ready,
      run: {
        ...ready.run,
        hydrogenAutobuyerEnabled: true,
        hydrogenAutobuyerEnabled: false,
        economy: {
          ...ready.run.economy,
          autobuyerEnabled: {
            ...ready.run.economy.autobuyerEnabled,
            "autobuyer:hydrogen:tier:1": false,
          },
          buildingEnabled: { ...ready.run.economy.buildingEnabled, powerPlant1: true },
          resourceAllocation: {
            ...ready.run.economy.resourceAllocation,
            hydrogen: { enabled: true, cashShare: 25, compoundShare: 30 },
          },
          autoCreateEnabled: { ...ready.run.economy.autoCreateEnabled, diesel: true },
          researchAutobuyerEnabled: true,
          power: { ...ready.run.economy.power, gridEnabled: false },
        },
        space: {
          ...ready.run.space,
          autoTelescopeUnlocked: true,
          autoTelescopeEnabled: true,
          autoTelescopeMode: "stars" as const,
        },
      },
      permanent: {
        ...ready.permanent,
        acquiredPerks: [
          ...ready.permanent.acquiredPerks,
          "autoSpaceTelescope",
          "roboticResearchAutomation",
        ],
      },
    };
    const result = transition(state, { type: "meta.rebirth" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.economy.resourceAllocation.hydrogen).toEqual({
      enabled: true,
      cashShare: 25,
      compoundShare: 30,
    });
    expect(result.state.run.economy.autoCreateEnabled.diesel).toBe(true);
    expect(result.state.run.economy.researchAutobuyerEnabled).toBe(true);
    expect(result.state.run.space.autoTelescopeEnabled).toBe(true);
    expect(result.state.run.space.autoTelescopeMode).toBe("stars");
    expect(result.state.run.hydrogenAutobuyerEnabled).toBe(true);
    expect(result.state.run.economy.autobuyerEnabled["autobuyer:hydrogen:tier:1"]).toBe(true);
    expect(result.state.run.economy.buildingEnabled.powerPlant1).toBe(false);
    expect(result.state.run.economy.power.gridEnabled).toBe(true);

    const withoutAutomationPerk = transition(
      {
        ...state,
        permanent: {
          ...state.permanent,
          acquiredPerks: state.permanent.acquiredPerks.filter(
            (perk) => perk !== "roboticResearchAutomation",
          ),
        },
      },
      { type: "meta.rebirth" },
    );
    expect(withoutAutomationPerk.accepted).toBe(true);
    expect(withoutAutomationPerk.state.run.economy.researchAutobuyerEnabled).toBe(false);
  });

  it("applies permanent and run achievement rate bonuses once through reload and rebirth", () => {
    const base = rebirthReadyState();
    const enabledBuyer = {
      ...base.run,
      upgrades: { ...base.run.upgrades, "autobuyer:hydrogen:tier:1": 1 },
      space: { ...base.run.space, currentSystemId: "Sirius" },
      economy: {
        ...base.run.economy,
        autobuyerEnabled: {
          ...base.run.economy.autobuyerEnabled,
          "autobuyer:hydrogen:tier:1": true,
        },
      },
    };
    const withBonuses = {
      ...base,
      run: {
        ...enabledBuyer,
        achievements: {
          ...base.run.achievements,
          bonuses: { ...base.run.achievements.bonuses, resourceRateMultiplier: 1.1 },
        },
      },
      permanent: {
        ...base.permanent,
        achievements: {
          ...base.permanent.achievements,
          bonuses: { ...base.permanent.achievements.bonuses, resourceRateAdditive: 0.3 },
        },
      },
    };
    const baseRate = createEconomyTickPlan({ ...base, run: enabledBuyer }).netRatesPerSecond
      .hydrogen!;
    const boostedRate = createEconomyTickPlan(withBonuses).netRatesPerSecond.hydrogen!;
    expect(boostedRate).toBeCloseTo(baseRate * 1.43);

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000024",
      pioneerName: withBonuses.run.pioneerName,
      createdAt: 1,
      savedAt: 2,
      revision: 1,
      state: withBonuses,
    });
    const restored = decodePortable(encodePortable(envelope)).state;
    expect(createEconomyTickPlan(restored).netRatesPerSecond.hydrogen).toBeCloseTo(boostedRate);

    const reborn = transition(withBonuses, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(reborn.state.permanent.achievements.bonuses.resourceRateAdditive).toBe(0.6);
    expect(reborn.state.run.achievements.bonuses.resourceRateMultiplier).toBe(1);
    const newRunWithBuyer = {
      ...reborn.state,
      run: {
        ...reborn.state.run,
        space: { ...reborn.state.run.space, currentSystemId: "Sirius" },
        upgrades: { ...reborn.state.run.upgrades, "autobuyer:hydrogen:tier:1": 1 },
        economy: {
          ...reborn.state.run.economy,
          autobuyerEnabled: {
            ...reborn.state.run.economy.autobuyerEnabled,
            "autobuyer:hydrogen:tier:1": true,
          },
        },
      },
    };
    const newRunBaseRate = createEconomyTickPlan({
      ...reborn.state,
      permanent: {
        ...reborn.state.permanent,
        achievements: {
          ...reborn.state.permanent.achievements,
          bonuses: { ...reborn.state.permanent.achievements.bonuses, resourceRateAdditive: 0 },
        },
      },
      run: newRunWithBuyer.run,
    }).netRatesPerSecond.hydrogen!;
    expect(createEconomyTickPlan(newRunWithBuyer).netRatesPerSecond.hydrogen).toBeCloseTo(
      newRunBaseRate * 1.6,
    );
  });

  it("applies permanent ascendency perks once after save reload and rebirth", () => {
    const ready = rebirthReadyState();
    const enabled = {
      ...ready,
      run: {
        ...ready.run,
        upgrades: {
          ...ready.run.upgrades,
          "autobuyer:hydrogen:tier:1": 1,
          powerPlant2: 1,
        },
        economy: {
          ...ready.run.economy,
          researchedTechnologies: ["solarPowerGeneration" as const],
          revealedTechnologies: ["solarPowerGeneration" as const],
          autobuyerEnabled: {
            ...ready.run.economy.autobuyerEnabled,
            "autobuyer:hydrogen:tier:1": true,
          },
          buildingEnabled: { ...ready.run.economy.buildingEnabled, powerPlant2: true },
          power: { ...ready.run.economy.power, environmentalMultiplier: 0.5 },
        },
      },
      permanent: {
        ...ready.permanent,
        acquiredPerks: ["smartAutoBuyers:2", "optimizedPowerGrids"],
      },
    };
    const noPerks = {
      ...enabled,
      permanent: { ...enabled.permanent, acquiredPerks: [] },
    };
    const expected = createEconomyTickPlan(enabled);
    const baseline = createEconomyTickPlan(noPerks);
    const typeBonus =
      starTypeForSystem(enabled.run.space.currentSystemId) === "B"
        ? bTypeAutoBuyerBonusPerSecond(1)
        : 0;
    expect(expected.netRatesPerSecond.hydrogen).toBeCloseTo(
      (baseline.netRatesPerSecond.hydrogen! - typeBonus) * 2.25 + typeBonus,
    );
    expect(expected.generationPerSecond).toBeCloseTo(baseline.generationPerSecond * 1.35);

    const envelope = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000025",
      pioneerName: enabled.run.pioneerName,
      createdAt: 1,
      savedAt: 2,
      revision: 1,
      state: enabled,
    });
    const restored = decodePortable(encodePortable(envelope)).state;
    expect(createEconomyTickPlan(restored)).toEqual(expected);

    const reborn = transition(restored, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    const rebuilt = {
      ...reborn.state,
      run: {
        ...reborn.state.run,
        hydrogenAutobuyerEnabled: true,
        upgrades: { ...reborn.state.run.upgrades, "autobuyer:hydrogen:tier:1": 1, powerPlant2: 1 },
        economy: {
          ...reborn.state.run.economy,
          researchedTechnologies: ["solarPowerGeneration" as const],
          revealedTechnologies: ["solarPowerGeneration" as const],
          autobuyerEnabled: {
            ...reborn.state.run.economy.autobuyerEnabled,
            "autobuyer:hydrogen:tier:1": true,
          },
          buildingEnabled: { ...reborn.state.run.economy.buildingEnabled, powerPlant2: true },
          power: { ...reborn.state.run.economy.power, environmentalMultiplier: 0.5 },
        },
      },
    };
    const afterRebirth = createEconomyTickPlan(rebuilt);
    const rebuiltBaseline = createEconomyTickPlan({
      ...rebuilt,
      permanent: { ...rebuilt.permanent, acquiredPerks: [] },
    });
    const rebuiltTypeBonus =
      starTypeForSystem(rebuilt.run.space.currentSystemId) === "B"
        ? bTypeAutoBuyerBonusPerSecond(1)
        : 0;
    expect(afterRebirth.netRatesPerSecond.hydrogen).toBeCloseTo(
      (rebuiltBaseline.netRatesPerSecond.hydrogen! - rebuiltTypeBonus) * 2.25 + rebuiltTypeBonus,
    );
    expect(afterRebirth.generationPerSecond).toBeCloseTo(
      rebuiltBaseline.generationPerSecond * 1.35,
    );
    expect(rebuilt.permanent.acquiredPerks).toEqual(["smartAutoBuyers:2", "optimizedPowerGrids"]);
  });
});

function marketReadyState() {
  const base = createInitialGameState({ pioneerName: "Market Pioneer", seed: 96 });
  return {
    ...base,
    run: {
      ...base.run,
      cash: 10_000_000,
      unlockedResources: ["hydrogen", "helium"] as const,
      goods: {
        ...base.run.goods,
        hydrogen: { ...base.run.goods.hydrogen, quantity: 100 },
      },
      space: { ...base.run.space, ascendencyAwardedThisRun: true },
    },
    permanent: {
      ...base.permanent,
      ascendencyPoints: 100,
    },
  };
}

describe("Galactic Market", () => {
  it("stays disabled until the first AP award or rebirth", () => {
    const state = createInitialGameState({ pioneerName: "Before Ascendency", seed: 33 });
    expect(transition(state, { type: "meta.market.sell-ap", quantity: 1 }).failure?.code).toBe(
      "market-not-unlocked",
    );
  });

  it("quotes source base values, rounds the commission before the return amount, and settles stock once", () => {
    const state = marketReadyState();
    const quote = quoteGalacticTrade(state, "hydrogen", "helium", 10);
    expect(quote).toMatchObject({
      outgoingPrice: 0.02,
      incomingPrice: 0.01,
      grossIncoming: 20,
      commissionQuantity: 1,
      incomingQuantity: 18,
    });
    const traded = transition(state, {
      type: "meta.market.trade",
      outgoingGoodId: "hydrogen",
      incomingGoodId: "helium",
      quantity: 10,
    });
    expect(traded.accepted).toBe(true);
    expect(traded.state.run.goods.hydrogen.quantity).toBe(90);
    expect(traded.state.run.goods.helium.quantity).toBe(18);
    expect(traded.state.permanent.galacticMarket.history).toHaveLength(1);
    expect(traded.state.permanent.galacticMarket.goods.hydrogen.marketBias).toBeCloseTo(-0.01);
    expect(traded.state.permanent.galacticMarket.goods.helium.marketBias).toBeCloseTo(0.02);
    expect(traded.state.permanent.galacticMarket.commissionPercent).toBeGreaterThanOrEqual(16);
    expect(traded.state.permanent.galacticMarket.commissionPercent).toBeLessThanOrEqual(23);
  });

  it("rejects unavailable, same-good, insufficient-stock, capacity, and lockdown trades", () => {
    const state = marketReadyState();
    expect(
      transition(state, {
        type: "meta.market.trade",
        outgoingGoodId: "hydrogen",
        incomingGoodId: "carbon",
        quantity: 1,
      }).failure?.code,
    ).toBe("market-good-locked");
    expect(
      transition(state, {
        type: "meta.market.trade",
        outgoingGoodId: "hydrogen",
        incomingGoodId: "hydrogen",
        quantity: 1,
      }).failure?.code,
    ).toBe("market-invalid-trade");
    expect(
      transition(state, {
        type: "meta.market.trade",
        outgoingGoodId: "hydrogen",
        incomingGoodId: "helium",
        quantity: 101,
      }).failure?.code,
    ).toBe("market-insufficient-stock");
    const fullTarget = {
      ...state,
      run: {
        ...state.run,
        goods: { ...state.run.goods, helium: { ...state.run.goods.helium, quantity: 110 } },
      },
    };
    expect(
      transition(fullTarget, {
        type: "meta.market.trade",
        outgoingGoodId: "hydrogen",
        incomingGoodId: "helium",
        quantity: 10,
      }).failure?.code,
    ).toBe("market-capacity");
    const locked = { ...state, run: { ...state.run, marketLockdownRemainingMs: 1_000 } };
    expect(
      transition(locked, {
        type: "meta.market.trade",
        outgoingGoodId: "hydrogen",
        incomingGoodId: "helium",
        quantity: 1,
      }).failure?.code,
    ).toBe("market-locked");
  });

  it("sells AP at the live price and liquidates all assets once at the live purchase price", () => {
    const state = marketReadyState();
    const sold = transition(state, { type: "meta.market.sell-ap", quantity: 5 });
    expect(sold.accepted).toBe(true);
    expect(sold.state.permanent.ascendencyPoints).toBe(95);
    expect(sold.state.run.cash).toBe(10_500_010);

    const preview = marketLiquidationPreview(state);
    expect(preview.value).toBe(1_000_002);
    expect(preview.ap).toBe(1);
    const liquidated = transition(state, { type: "meta.market.liquidate" });
    expect(liquidated.accepted).toBe(true);
    expect(liquidated.state.permanent.ascendencyPoints).toBe(101);
    expect(liquidated.state.statistics.lifetimeAscendencyPointsGained).toBe(1);
    expect(liquidated.state.run.cash).toBe(0);
    expect(liquidated.state.run.goods.hydrogen.quantity).toBe(0);
    expect(liquidated.state.run.marketLiquidatedThisRun).toBe(true);
    expect(transition(liquidated.state, { type: "meta.market.liquidate" }).failure?.code).toBe(
      "market-liquidated",
    );
  });

  it("selects insufficient AP and below-one-AP liquidation reasons from current state", () => {
    const state = marketReadyState();
    const shortAp = {
      ...state,
      permanent: { ...state.permanent, ascendencyPoints: 3 },
    };
    expect(transition(shortAp, { type: "meta.market.sell-ap", quantity: 10 }).failure?.code).toBe(
      "market-insufficient-ap",
    );

    const noLiquidationValue = {
      ...state,
      run: {
        ...state.run,
        cash: 0,
        goods: {
          ...state.run.goods,
          hydrogen: { ...state.run.goods.hydrogen, quantity: 0 },
        },
      },
    };
    expect(transition(noLiquidationValue, { type: "meta.market.liquidate" }).failure?.code).toBe(
      "market-no-liquidation",
    );
  });

  it("decays bias every ten seconds and updates prices, commission, and volume on the seeded market cycle", () => {
    const state = marketReadyState();
    const biased = {
      ...state,
      permanent: {
        ...state.permanent,
        galacticMarket: {
          ...state.permanent.galacticMarket,
          commissionPercent: 30,
          cycleRemainingMs: 1,
          goods: {
            ...state.permanent.galacticMarket.goods,
            hydrogen: { ...state.permanent.galacticMarket.goods.hydrogen, marketBias: 2_000 },
          },
        },
      },
    };
    const biasOnly = {
      ...biased,
      permanent: {
        ...biased.permanent,
        galacticMarket: { ...biased.permanent.galacticMarket, cycleRemainingMs: 30_000 },
      },
    };
    const decayed = advanceGalacticMarket(biasOnly, 10_000);
    expect(decayed.permanent.galacticMarket.goods.hydrogen.marketBias).toBe(1_950);
    expect(decayed.permanent.galacticMarket.cycleRemainingMs).toBeGreaterThan(0);

    const cycled = advanceGalacticMarket(
      {
        ...biased,
        run: {
          ...biased.run,
          goods: { ...biased.run.goods, hydrogen: { ...biased.run.goods.hydrogen, quantity: 0 } },
        },
      },
      1,
    );
    expect(cycled.permanent.galacticMarket.commissionPercent).toBe(10);
    expect(cycled.permanent.galacticMarket.apSellPrice).toBeGreaterThanOrEqual(60_000);
    expect(cycled.permanent.galacticMarket.apSellPrice).toBeLessThanOrEqual(140_000);
    expect(cycled.permanent.galacticMarket.apBuyPrice).toBeGreaterThanOrEqual(1_000_000);
    expect(cycled.permanent.galacticMarket.apBuyPrice).toBeLessThanOrEqual(1_600_000);
    expect(cycled.permanent.galacticMarket.goods.hydrogen.tradeVolume).toBe(100_100);
  });

  it("keeps market trade volume within the saved-state bounds over long wall-clock advances", () => {
    const state = marketReadyState(20261003);
    const crowded = {
      ...state,
      run: {
        ...state.run,
        goods: {
          ...state.run.goods,
          titanium: {
            ...state.run.goods.titanium,
            quantity: 2_000_000,
            storageCapacity: 2_000_000,
          },
        },
      },
      permanent: {
        ...state.permanent,
        galacticMarket: {
          ...state.permanent.galacticMarket,
          goods: {
            ...state.permanent.galacticMarket.goods,
            titanium: { ...state.permanent.galacticMarket.goods.titanium, tradeVolume: 9_999_999 },
          },
        },
      },
    };
    const advanced = advanceGalacticMarket(crowded, 86_400_000);
    const titaniumVolume = advanced.permanent.galacticMarket.goods.titanium.tradeVolume;
    expect(titaniumVolume).toBeGreaterThanOrEqual(-1_000_000);
    expect(titaniumVolume).toBeLessThanOrEqual(10_000_000);
    expect(isValidGameState(advanced)).toBe(true);
  });
});

describe("Energy Statistics rebirth scope", () => {
  it("clears run energy counters while preserving lifetime totals", () => {
    const base = rebirthReadyState();
    const ready = {
      ...base,
      run: {
        ...base.run,
        energyTripsThisRun: 2,
        basicPowerPlantsBuiltThisRun: 3,
        advancedPowerPlantsBuiltThisRun: 4,
        solarPowerPlantsBuiltThisRun: 5,
        sodiumIonBatteriesBuiltThisRun: 6,
        battery2BuiltThisRun: 7,
        battery3BuiltThisRun: 8,
      },
      statistics: {
        ...base.statistics,
        lifetimeEnergyTrips: 12,
        lifetimeBasicPowerPlantsBuilt: 13,
        lifetimeAdvancedPowerPlantsBuilt: 14,
        lifetimeSolarPowerPlantsBuilt: 15,
        lifetimeSodiumIonBatteriesBuilt: 16,
        lifetimeBattery2Built: 17,
        lifetimeBattery3Built: 18,
      },
    };

    expect(isValidGameState(ready)).toBe(true);
    const result = transition(ready, { type: "meta.rebirth" });

    expect(result.accepted).toBe(true);
    expect(result.state.run).toMatchObject({
      energyTripsThisRun: 0,
      basicPowerPlantsBuiltThisRun: 0,
      advancedPowerPlantsBuiltThisRun: 0,
      solarPowerPlantsBuiltThisRun: 0,
      sodiumIonBatteriesBuiltThisRun: 0,
      battery2BuiltThisRun: 0,
      battery3BuiltThisRun: 0,
    });
    expect(result.state.statistics).toMatchObject({
      lifetimeEnergyTrips: 12,
      lifetimeBasicPowerPlantsBuilt: 13,
      lifetimeAdvancedPowerPlantsBuilt: 14,
      lifetimeSolarPowerPlantsBuilt: 15,
      lifetimeSodiumIonBatteriesBuilt: 16,
      lifetimeBattery2Built: 17,
      lifetimeBattery3Built: 18,
    });
    expect(isValidGameState(result.state)).toBe(true);
  });
});
