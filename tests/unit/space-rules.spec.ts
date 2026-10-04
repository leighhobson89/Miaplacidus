import { describe, expect, it } from "vitest";
import { MATERIAL_IDS } from "../../src/content/ids";
import {
  INITIAL_ASTEROID_SEARCH_MS,
  ASTEROID_SCAN_TIMER_ID,
  ROCKET_PART_BASE_COST,
  ROCKET_FUEL_CAPACITY,
  ROCKET_PART_REQUIREMENTS,
  ROCKET_IDS,
  STAR_STUDY_DURATION_MS,
  STAR_STUDY_TIMER_ID,
  VOID_PILLAGE_DURATION_MS,
  VOID_PILLAGE_TIMER_ID,
  type AsteroidState,
} from "../../src/content/space";
import { createRandomState } from "../../src/engine/random";
import { transition } from "../../src/engine/commands";
import { createTimerId } from "../../src/engine/timers";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import type { GameState } from "../../src/engine/state";
import { decodePortable, encodePortable } from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";
import {
  advanceSpaceMining,
  antimatterMiningRatePerSecond,
  applySpacePurchaseCost,
  checkSpacePurchaseCost,
} from "../../src/engine/spaceMechanics";
import {
  asteroidExtractionRatePerSecond,
  asteroidSearchDuration,
  generateAsteroid,
  pruneAsteroids,
  rocketPartCost,
  starStudyDuration,
  starshipModulePartCost,
  starshipTravelDurationMs,
  rocketTravelDurationMs,
  voidPillageDuration,
} from "../../src/engine/spaceRules";

describe("space content rules", () => {
  it("rejects blank, oversized and control-character rocket names", () => {
    const state = createInitialGameState({ seed: 19 });
    const blank = transition(state, {
      type: "space.rocket.rename",
      rocketId: "rocket1",
      name: "   ",
    });
    const oversized = transition(state, {
      type: "space.rocket.rename",
      rocketId: "rocket1",
      name: "🚀".repeat(13),
    });
    const controlCharacter = transition(state, {
      type: "space.rocket.rename",
      rocketId: "rocket1",
      name: "Orbit\nOne",
    });

    expect(blank.failure?.code).toBe("space-invalid-rocket-name");
    expect(oversized.failure?.code).toBe("space-invalid-rocket-name");
    expect(controlCharacter.failure?.code).toBe("space-invalid-rocket-name");
  });

  it("checks and spends exact antimatter purchase costs", () => {
    const initial = createInitialGameState({ seed: 20 });
    const funded: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, antimatter: 120 },
      },
    };
    const cost = { cash: 0, antimatter: 120, materials: [] } as const;
    expect(checkSpacePurchaseCost(funded, cost)).toEqual({ ok: true });
    expect(applySpacePurchaseCost(funded, cost).space.antimatter).toBe(0);

    const insufficient: GameState = {
      ...funded,
      run: { ...funded.run, space: { ...funded.run.space, antimatter: 119.99 } },
    };
    expect(checkSpacePurchaseCost(insufficient, cost)).toMatchObject({
      ok: false,
      failure: { code: "insufficient-antimatter", required: 120 },
    });
    expect(
      checkSpacePurchaseCost(funded, { cash: 0, antimatter: -1, materials: [] }),
    ).toMatchObject({ ok: false, failure: { code: "invalid-cost" } });
  });

  it("keeps asteroid and star survey time variation inside the source ±20% window", () => {
    for (let seed = 0; seed < 64; seed += 1) {
      const asteroid = asteroidSearchDuration(INITIAL_ASTEROID_SEARCH_MS, createRandomState(seed));
      expect(asteroid.durationMs).toBeGreaterThanOrEqual(INITIAL_ASTEROID_SEARCH_MS * 0.8);
      expect(asteroid.durationMs).toBeLessThanOrEqual(INITIAL_ASTEROID_SEARCH_MS * 1.2);
      expect(asteroid.random.draws).toBe(1);

      const stars = starStudyDuration(createRandomState(seed));
      expect(stars.durationMs).toBeGreaterThanOrEqual(STAR_STUDY_DURATION_MS * 0.8);
      expect(stars.durationMs).toBeLessThanOrEqual(STAR_STUDY_DURATION_MS * 1.2);
      expect(stars.random.draws).toBe(1);

      const pillage = voidPillageDuration(createRandomState(seed));
      expect(pillage.durationMs).toBeGreaterThanOrEqual(VOID_PILLAGE_DURATION_MS * 0.8);
      expect(pillage.durationMs).toBeLessThanOrEqual(VOID_PILLAGE_DURATION_MS * 1.2);
      expect(pillage.random.draws).toBe(1);
    }
  });

  it("blocks telescope surveys when the power grid has no available energy", () => {
    const initial = createInitialGameState({ seed: 21 });
    const unpowered: GameState = {
      ...initial,
      run: {
        ...initial.run,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["atmosphericTelescopes"],
          revealedTechnologies: ["knowledgeSharing", "atmosphericTelescopes"],
          power: {
            ...initial.run.economy.power,
            quantity: 0,
            capacity: 0,
            gridEnabled: false,
          },
        },
        space: { ...initial.run.space, telescopeBuilt: true },
      },
    };
    const scan = transition(unpowered, { type: "space.telescope.scan.start" });
    expect(scan.accepted).toBe(false);
    expect(scan.failure?.code).toBe("space-no-power");
    expect(scan.state.run.space.activeSurvey).toBeNull();
  });

  it("gates Voidborn pillaging and completes it through the persisted survey timer", () => {
    const initial = createInitialGameState({ seed: 771 });
    const locked = transition(initial, { type: "space.telescope.pillage.start" });
    expect(locked.accepted).toBe(false);
    expect(locked.failure?.code).toBe("space-pillage-locked");

    const voidbornState: GameState = {
      ...initial,
      run: {
        ...initial.run,
        philosophyAbilityActive: true,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["atmosphericTelescopes"],
          revealedTechnologies: ["knowledgeSharing", "atmosphericTelescopes"],
          power: {
            ...initial.run.economy.power,
            quantity: 100,
            capacity: 100,
            infinitePower: false,
          },
        },
        space: {
          ...initial.run.space,
          telescopeBuilt: true,
          autoTelescopeUnlocked: true,
        },
      },
      permanent: { ...initial.permanent, rebirthCount: 1, philosophyId: "voidborn" },
    };
    expect(isValidGameState(voidbornState)).toBe(true);

    const unavailableAutoMode = transition(
      { ...voidbornState, run: { ...voidbornState.run, philosophyAbilityActive: false } },
      { type: "space.telescope.auto.set-mode", mode: "pillageVoid" },
    );
    expect(unavailableAutoMode.failure?.code).toBe("space-automation-unavailable");

    const selectedAutoMode = transition(voidbornState, {
      type: "space.telescope.auto.set-mode",
      mode: "pillageVoid",
    });
    expect(selectedAutoMode.accepted).toBe(true);

    const started = transition(voidbornState, { type: "space.telescope.pillage.start" });
    expect(started.accepted).toBe(true);
    expect(started.state.run.space.activeSurvey).toBe("pillageVoid");
    expect(started.state.run.timers[VOID_PILLAGE_TIMER_ID]?.durationMs).toBeGreaterThanOrEqual(
      VOID_PILLAGE_DURATION_MS * 0.8,
    );
    expect(started.state.run.timers[VOID_PILLAGE_TIMER_ID]?.durationMs).toBeLessThanOrEqual(
      VOID_PILLAGE_DURATION_MS * 1.2,
    );
    expect(isValidGameState(started.state)).toBe(true);

    const resumed = decodePortable(
      encodePortable(
        makeEnvelope({
          slotId: "11111111-1111-4111-8111-111111111111",
          pioneerName: started.state.run.pioneerName,
          createdAt: 1,
          savedAt: 1,
          revision: 1,
          state: started.state,
        }),
      ),
    ).state;
    expect(resumed.run.space.activeSurvey).toBe("pillageVoid");
    expect(resumed.run.timers[VOID_PILLAGE_TIMER_ID]?.status).toBe("running");

    const completed = transition(resumed, {
      type: "timer.complete",
      timerId: createTimerId("survey", "void-pillage"),
    });
    const pillageEvent = completed.events.find(
      (event) => event.type === "space.void-pillage.completed",
    );
    expect(completed.accepted).toBe(true);
    expect(pillageEvent?.type).toBe("space.void-pillage.completed");
    expect(completed.state.run.space).toMatchObject({
      activeSurvey: null,
      voidPillageCompletions: 1,
    });
    expect(isValidGameState(completed.state)).toBe(true);
    for (const good of Object.values(completed.state.run.goods)) {
      expect(good.quantity).toBeLessThanOrEqual(good.storageCapacity);
    }
    for (const [rawGoodId, amount] of Object.entries(pillageEvent?.gains ?? {})) {
      if (amount === undefined) continue;
      const goodId = rawGoodId as keyof typeof initial.run.goods;
      const isMaterial = MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number]);
      const maxGain = Math.floor(
        initial.run.goods[goodId].storageCapacity * (isMaterial ? 0.3 : 0.2),
      );
      expect(amount).toBeLessThanOrEqual(maxGain);
      expect(completed.state.run.goods[goodId].quantity).toBe(amount);
    }
  });

  it("resumes a telescope search and rocket fueling from saved in-progress state", () => {
    const initial = createInitialGameState({ seed: 881 });
    const base: GameState = {
      ...initial,
      run: {
        ...initial.run,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["atmosphericTelescopes", "advancedFuels"],
          revealedTechnologies: ["knowledgeSharing", "atmosphericTelescopes", "advancedFuels"],
          power: {
            ...initial.run.economy.power,
            quantity: 100,
            capacity: 100,
            infinitePower: false,
          },
        },
        space: {
          ...initial.run.space,
          telescopeBuilt: true,
          rockets: {
            ...initial.run.space.rockets,
            rocket1: {
              ...initial.run.space.rockets.rocket1,
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
              fuelQuantity: 42,
              fuelPumpPurchased: true,
              fuelPumpEnabled: true,
              phase: "ready",
            },
          },
        },
      },
    };
    const search = transition(base, { type: "space.telescope.scan.start" });
    expect(search.accepted).toBe(true);
    const slot = "11111111-1111-4111-8111-111111111111";
    const resumed = decodePortable(
      encodePortable(
        makeEnvelope({
          slotId: slot,
          pioneerName: search.state.run.pioneerName,
          createdAt: 1,
          savedAt: 1,
          revision: 1,
          state: search.state,
        }),
      ),
    ).state;
    expect(resumed.run.space.activeSurvey).toBe("asteroids");
    expect(resumed.run.space.rockets.rocket1.fuelQuantity).toBe(42);
    expect(resumed.run.space.rockets.rocket1.fuelPumpEnabled).toBe(true);

    const completedSearch = transition(resumed, {
      type: "timer.complete",
      timerId: createTimerId("survey", "asteroid-scan"),
    });
    const asteroidCountAfterCompletion = completedSearch.state.run.space.asteroids.length;
    const repeatedCompletion = transition(completedSearch.state, {
      type: "timer.complete",
      timerId: createTimerId("survey", "asteroid-scan"),
    });
    expect(completedSearch.state.run.space.activeSurvey).toBeNull();
    expect(repeatedCompletion.state.run.space.asteroids).toHaveLength(asteroidCountAfterCompletion);
    expect(repeatedCompletion.state.statistics.completedTimers).toBe(1);

    const fueled = transition(resumed, {
      type: "clock.advance",
      input: { wallNowMs: 1, foreground: true, offlineElapsedMs: 30_000 },
    });
    expect(fueled.state.run.space.rockets.rocket1.fuelQuantity).toBeCloseTo(62.04, 2);

    const optimized = transition(
      {
        ...resumed,
        permanent: {
          ...resumed.permanent,
          acquiredPerks: ["rocketFuelOptimization:2"],
        },
      },
      {
        type: "clock.advance",
        input: { wallNowMs: 1, foreground: true, offlineElapsedMs: 30_000 },
      },
    );
    expect(optimized.state.run.space.rockets.rocket1.fuelQuantity).toBeCloseTo(102.12, 2);
  });

  it("uses the four source rocket part counts and compounded 13% step prices", () => {
    expect(ROCKET_IDS.map((id) => ROCKET_PART_REQUIREMENTS[id])).toEqual([12, 17, 22, 27]);
    expect(rocketPartCost(0)).toEqual(ROCKET_PART_BASE_COST);
    expect(rocketPartCost(1)).toEqual({
      cash: 1_130,
      materials: [
        { goodId: "glass", amount: 1_130 },
        { goodId: "titanium", amount: 791 },
        { goodId: "steel", amount: 3_390 },
      ],
    });
  });

  it("applies Expansionist part discounts and travel speeds from saved purchase counts", () => {
    const discountedRocket = rocketPartCost(0, 2);
    expect(discountedRocket.cash).toBeCloseTo(ROCKET_PART_BASE_COST.cash * 0.95 ** 2);
    expect(discountedRocket.materials[0]?.amount).toBeCloseTo(1_000 * 0.95 ** 2);

    const discountedStarship = starshipModulePartCost("structural", 0, 2);
    expect(discountedStarship.cash).toBeCloseTo(3_000 * 0.95 ** 2);
    expect(discountedStarship.materials[0]?.amount).toBeCloseTo(4_000 * 0.95 ** 2);

    expect(rocketTravelDurationMs(20_000, 5, 2)).toBe(Math.floor(100_000 * 0.95 ** 2));
    expect(starshipTravelDurationMs(10, 2, 2)).toBe(Math.floor(((10 * 360_000) / 4) * 0.95 ** 2));
  });

  it("applies Voidborn survey repeatables once while preserving each random roll", () => {
    const initial = createInitialGameState({ seed: 23 });
    const surveyReady: GameState = {
      ...initial,
      run: {
        ...initial.run,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["atmosphericTelescopes"],
          revealedTechnologies: ["knowledgeSharing", "atmosphericTelescopes"],
          power: { ...initial.run.economy.power, infinitePower: true },
        },
        space: { ...initial.run.space, telescopeBuilt: true },
      },
    };
    const improved: GameState = {
      ...surveyReady,
      permanent: {
        ...surveyReady.permanent,
        acquiredPerks: ["asteroidDwellers:3", "stellarInsightManifold:2"],
      },
    };

    const baselineStarStudy = transition(surveyReady, { type: "space.telescope.study.start" });
    const improvedStarStudy = transition(improved, { type: "space.telescope.study.start" });
    const baseStudyTimer = baselineStarStudy.state.run.timers[STAR_STUDY_TIMER_ID];
    const improvedStudyTimer = improvedStarStudy.state.run.timers[STAR_STUDY_TIMER_ID];
    expect(improvedStudyTimer?.durationMs).toBeCloseTo(baseStudyTimer!.durationMs * 0.99 ** 2);
    expect(improvedStarStudy.state.run.random).toEqual(baselineStarStudy.state.run.random);

    const baselineScan = transition(surveyReady, { type: "space.telescope.scan.start" });
    const improvedScan = transition(improved, { type: "space.telescope.scan.start" });
    const baseScanTimer = baselineScan.state.run.timers[ASTEROID_SCAN_TIMER_ID];
    const improvedScanTimer = improvedScan.state.run.timers[ASTEROID_SCAN_TIMER_ID];
    expect(improvedScanTimer?.durationMs).toBeCloseTo(baseScanTimer!.durationMs * 0.99 ** 3);
    expect(improvedScan.state.run.random).toEqual(baselineScan.state.run.random);
  });

  it("credits the source megastructure antimatter stream only once", () => {
    const initial = createInitialGameState({ seed: 24 });
    const oneLink: GameState = {
      ...initial,
      permanent: {
        ...initial.permanent,
        megastructures: {
          ...initial.permanent.megastructures,
          researchedTechnologyIds: ["dysonSphereDisconnect"],
        },
      },
    };
    const fourLinks: GameState = {
      ...oneLink,
      permanent: {
        ...oneLink.permanent,
        megastructures: {
          ...oneLink.permanent.megastructures,
          researchedTechnologyIds: [
            "dysonSphereDisconnect",
            "celestialProcessingCoreDisconnect",
            "plasmaForgeDisconnect",
            "galacticMemoryArchiveDisconnect",
          ],
        },
      },
    };

    expect(antimatterMiningRatePerSecond(oneLink)).toBe(0.15);
    expect(antimatterMiningRatePerSecond(fourLinks)).toBe(0.6);
    const generated = advanceSpaceMining(fourLinks, {}, 10_000).state;
    expect(generated.run.space.antimatter).toBeCloseTo(6);
    expect(generated.run.space.antimatterMinedThisRun).toBeCloseTo(6);
    expect(generated.statistics.lifetimeAntimatterMined).toBeCloseTo(6);
    expect(generated.run.space.antimatterUnlocked).toBe(true);
  });

  it("generates the same named asteroid from the same saved random state", () => {
    const options = {
      sequence: 7,
      systemId: "Spica",
      commanderName: "Ada 17 Lovelace",
      existingNames: new Set<string>(),
    };
    const successfulSeed = Array.from({ length: 256 }, (_, index) => index).find(
      (seed) => generateAsteroid(options, createRandomState(seed)).asteroid !== null,
    );
    expect(successfulSeed).toBeDefined();
    const result = generateAsteroid(options, createRandomState(successfulSeed!));
    expect(result.asteroid).not.toBeNull();
    expect(generateAsteroid(options, createRandomState(successfulSeed!))).toEqual(result);
    const selected = result.asteroid!;
    expect(selected.id).toBe("asteroid-7");
    expect(selected.distance).toBeGreaterThanOrEqual(30_000);
    expect(selected.distance).toBeLessThanOrEqual(570_000);
    expect(selected.extractionEase).toBeGreaterThanOrEqual(1);
    expect(selected.extractionEase).toBeLessThanOrEqual(6);
    expect(selected.remainingAntimatter).toBeGreaterThan(0);
    const stockRanges: Readonly<Record<AsteroidState["rarity"], readonly [number, number]>> = {
      common: [700, 1_200],
      uncommon: [1_200, 2_000],
      rare: [2_000, 4_000],
      legendary: [4_000, 10_000],
    };
    const stockBounds = stockRanges[selected.rarity];
    expect(selected.remainingAntimatter).toBeGreaterThanOrEqual(stockBounds[0]);
    expect(selected.remainingAntimatter).toBeLessThanOrEqual(stockBounds[1]);
  });

  it("prunes only safe unclaimed asteroids and preserves depleted and rocket-reserved records", () => {
    const make = (
      sequence: number,
      reservedBy: AsteroidState["reservedBy"] = null,
      remaining = 10,
    ) =>
      ({
        id: `asteroid-${sequence}`,
        name: `Rock ${sequence}`,
        systemId: "Spica",
        distance: 1_000 + sequence,
        rarity: "common",
        extractionEase: 1,
        remainingAntimatter: remaining,
        totalAntimatter: 10,
        reservedBy,
        depleted: remaining === 0,
        interacted: sequence === 6,
      }) satisfies AsteroidState;
    const source = [make(1), make(2, "rocket1"), make(3, null, 0), make(4), make(5), make(6)];
    const retained = pruneAsteroids(source, 1);
    expect(retained.map((asteroid) => asteroid.id)).toEqual([
      "asteroid-2",
      "asteroid-3",
      "asteroid-5",
      "asteroid-6",
    ]);
    expect(asteroidExtractionRatePerSecond(1)).toBeCloseTo(0.4);
    expect(asteroidExtractionRatePerSecond(6)).toBeCloseTo(0.1833333333);
  });

  it("marks a selected asteroid as interacted so it survives safe pruning", () => {
    const asteroid: AsteroidState = {
      id: "asteroid-1",
      name: "SPI-0001A",
      systemId: "spica",
      distance: 30_000,
      rarity: "common",
      extractionEase: 1,
      remainingAntimatter: 700,
      totalAntimatter: 700,
      reservedBy: null,
      depleted: false,
      interacted: false,
    };
    const initial = createInitialGameState({ seed: 12 });
    const state = {
      ...initial,
      run: {
        ...initial.run,
        space: { ...initial.run.space, asteroids: [asteroid], nextAsteroidSequence: 2 },
      },
    };
    const result = transition(state, { type: "space.asteroid.select", asteroidId: asteroid.id });
    expect(result.accepted).toBe(true);
    expect(result.state.run.space.asteroids[0]?.interacted).toBe(true);
    expect(result.state.run.space.selectedAsteroidId).toBe(asteroid.id);
    expect(isValidGameState(result.state)).toBe(true);
    expect(pruneAsteroids(result.state.run.space.asteroids, 0)).toHaveLength(1);
  });

  it("charges the launch pad and each rocket part, then opens fuel and launch gates", () => {
    const initial = createInitialGameState({ seed: 56 });
    expect(transition(initial, { type: "space.launch-pad.build" }).failure?.code).toBe(
      "space-launch-pad-tech-locked",
    );
    const materials = Object.fromEntries(
      Object.entries(initial.run.goods).map(([id, good]) => [
        id,
        { ...good, quantity: 1_000_000, storageCapacity: 1_000_000 },
      ]),
    ) as typeof initial.run.goods;
    let state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: 1_000_000_000,
        goods: materials,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: [
            "atmosphericTelescopes",
            "advancedFuels",
            "rocketComposites",
          ] as const,
          revealedTechnologies: [
            "knowledgeSharing",
            "atmosphericTelescopes",
            "advancedFuels",
            "rocketComposites",
          ] as const,
          power: {
            ...initial.run.economy.power,
            gridEnabled: true,
            quantity: 1_000_000,
            capacity: 1_000_000,
          },
        },
      },
    };
    const launchPad = transition(state, { type: "space.launch-pad.build" });
    expect(launchPad.accepted).toBe(true);
    // Initial stock and research also satisfy achievement thresholds worth $2,015.
    expect(launchPad.state.run.cash).toBe(state.run.cash - 40_000 + 2_015);
    state = launchPad.state;
    for (let part = 0; part < ROCKET_PART_REQUIREMENTS.rocket1; part += 1) {
      const result = transition(state, { type: "space.rocket.part.build", rocketId: "rocket1" });
      expect(result.accepted).toBe(true);
      state = result.state;
    }
    expect(state.run.space.rockets.rocket1.phase).toBe("ready");
    expect(state.run.space.rockets.rocket1.builtParts).toBe(12);
    const pump = transition(state, { type: "space.rocket.pump.purchase", rocketId: "rocket1" });
    expect(pump.accepted).toBe(true);
    expect(pump.state.run.space.rockets.rocket1).toMatchObject({
      fuelPumpPurchased: true,
      fuelPumpEnabled: true,
    });
    const notFuelled = transition(pump.state, { type: "space.rocket.launch", rocketId: "rocket1" });
    expect(notFuelled.accepted).toBe(false);
    expect(notFuelled.failure?.code).toBe("space-rocket-fuel-empty");
    const fullRocketState = {
      ...pump.state,
      run: {
        ...pump.state.run,
        space: {
          ...pump.state.run.space,
          rockets: {
            ...pump.state.run.space.rockets,
            rocket1: {
              ...pump.state.run.space.rockets.rocket1,
              fuelQuantity: 10_000,
              fuelPumpEnabled: false,
            },
          },
        },
      },
    };
    const launch = transition(fullRocketState, {
      type: "space.rocket.launch",
      rocketId: "rocket1",
    });
    expect(launch.accepted).toBe(true);
    expect(launch.state.run.space.rockets.rocket1.phase).toBe("orbit");
    expect(isValidGameState(launch.state)).toBe(true);
    const stormState = {
      ...fullRocketState,
      run: {
        ...fullRocketState.run,
        space: { ...fullRocketState.run.space, currentSystemWeather: "heavyRain" as const },
      },
    };
    const stormLaunch = transition(stormState, {
      type: "space.rocket.launch",
      rocketId: "rocket1",
    });
    expect(stormLaunch.accepted).toBe(false);
    expect(stormLaunch.failure?.code).toBe("space-weather-blocked");
    expect(isValidGameState(stormState)).toBe(true);
    const volcanoState: GameState = {
      ...fullRocketState,
      run: {
        ...fullRocketState.run,
        space: { ...fullRocketState.run.space, currentSystemWeather: "volcano" },
      },
    };
    const volcanoLaunch = transition(volcanoState, {
      type: "space.rocket.launch",
      rocketId: "rocket1",
    });
    expect(volcanoLaunch.accepted).toBe(false);
    expect(volcanoLaunch.failure?.code).toBe("space-weather-blocked");
    const rainState = {
      ...fullRocketState,
      run: {
        ...fullRocketState.run,
        space: { ...fullRocketState.run.space, currentSystemWeather: "rain" as const },
      },
    };
    const rainLaunch = transition(rainState, {
      type: "space.rocket.launch",
      rocketId: "rocket1",
    });
    expect(rainLaunch.accepted).toBe(false);
    expect(rainLaunch.failure?.code).toBe("space-weather-blocked");
  });

  it("completes outbound and return timers through the ordinary journey path", () => {
    const initial = createInitialGameState({ seed: 91 });
    const asteroid: AsteroidState = {
      id: "asteroid-1",
      name: "SPI-0001A",
      systemId: "spica",
      distance: 1_000,
      rarity: "common",
      extractionEase: 1,
      remainingAntimatter: 0.4,
      totalAntimatter: 0.4,
      reservedBy: null,
      depleted: false,
      interacted: true,
    };
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 1 },
        space: {
          ...initial.run.space,
          launchPadBuilt: true,
          asteroids: [asteroid],
          selectedAsteroidId: asteroid.id,
          nextAsteroidSequence: 2,
          rockets: {
            ...initial.run.space.rockets,
            rocket1: {
              ...initial.run.space.rockets.rocket1,
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
              fuelQuantity: 10_000,
              phase: "orbit",
            },
          },
        },
      },
    };
    expect(isValidGameState(state)).toBe(true);
    const reload = (savedState: GameState) =>
      decodePortable(
        encodePortable(
          makeEnvelope({
            slotId: "11111111-1111-4111-8111-111111111111",
            pioneerName: savedState.run.pioneerName,
            createdAt: 1,
            savedAt: 1,
            revision: 1,
            state: savedState,
          }),
        ),
      ).state;

    const outbound = transition(state, {
      type: "space.rocket.travel",
      rocketId: "rocket1",
      asteroidId: asteroid.id,
    });
    expect(outbound.accepted).toBe(true);
    expect(outbound.state.run.space.asteroids[0]?.reservedBy).toBe("rocket1");
    const resumedOutbound = reload(outbound.state);
    expect(resumedOutbound.run.space.rockets.rocket1.phase).toBe("outbound");
    const outboundTimerId = createTimerId("travel", "rocket1-asteroid-journey");
    expect(resumedOutbound.run.space.rockets.rocket1.timerId).toBe(outboundTimerId);
    const arrived = transition(resumedOutbound, {
      type: "timer.complete",
      timerId: outboundTimerId,
    });
    expect(arrived.state.run.space.rockets.rocket1.phase).toBe("mining");
    expect(arrived.state.run.space.antimatterUnlocked).toBe(true);

    const resumedMining = reload(arrived.state);
    expect(resumedMining.run.space.rockets.rocket1.phase).toBe("mining");
    expect(antimatterMiningRatePerSecond(resumedMining)).toBeCloseTo(0.4, 10);
    const boosted = transition(resumedMining, {
      type: "space.antimatter-boost.set-active",
      active: true,
    });
    expect(antimatterMiningRatePerSecond(boosted.state)).toBeCloseTo(0.8, 10);
    const returning = transition(boosted.state, {
      type: "clock.advance",
      input: { wallNowMs: 1, foreground: true, offlineElapsedMs: 3_000 },
    });
    expect(returning.accepted).toBe(true);
    expect(returning.state.run.space.antimatter).toBeCloseTo(150.4, 10);
    expect(returning.state.run.space.antimatterMinedThisRun).toBeCloseTo(0.4, 10);
    expect(returning.state.statistics.lifetimeAntimatterMined).toBeCloseTo(0.4, 10);
    expect(returning.state.run.space.antimatterBoostActive).toBe(false);
    expect(returning.state.run.space.asteroids[0]).toMatchObject({
      remainingAntimatter: 0,
      depleted: true,
      reservedBy: "rocket1",
    });
    expect(returning.state.run.space.rockets.rocket1).toMatchObject({
      phase: "returning",
      targetAsteroidId: asteroid.id,
      timerId: "travel:rocket1-asteroid-journey",
    });
    expect(isValidGameState(returning.state)).toBe(true);

    const resumedReturn = reload(returning.state);
    expect(resumedReturn.run.space.rockets.rocket1.phase).toBe("returning");
    const returnTimerId = createTimerId("travel", "rocket1-asteroid-journey");
    expect(resumedReturn.run.space.rockets.rocket1.timerId).toBe(returnTimerId);
    const returned = transition(resumedReturn, {
      type: "timer.complete",
      timerId: returnTimerId,
    });
    expect(returned.accepted).toBe(true);
    expect(returned.state.run.space.antimatter).toBeCloseTo(150.4, 10);
    expect(returned.state.run.space.rockets.rocket1).toMatchObject({
      phase: "ready",
      fuelQuantity: 0,
      fuelPumpEnabled: false,
      targetAsteroidId: null,
      journeyCount: 1,
    });
    expect(isValidGameState(returned.state)).toBe(true);
    expect(returned.state.statistics.completedTimers).toBe(2);
    const repeatedReturn = transition(returned.state, {
      type: "timer.complete",
      timerId: returnTimerId,
    });
    expect(repeatedReturn.state.run.space.antimatter).toBeCloseTo(150.4, 10);
    expect(repeatedReturn.state.run.space.rockets.rocket1.journeyCount).toBe(1);
    expect(repeatedReturn.state.statistics.completedTimers).toBe(2);
  });

  it("sends a rocket home from an empty asteroid without crediting antimatter", () => {
    const initial = createInitialGameState({ seed: 93 });
    const asteroid: AsteroidState = {
      id: "asteroid-2",
      name: "SPI-0002B",
      systemId: "spica",
      distance: 1_000,
      rarity: "common",
      extractionEase: 1,
      remainingAntimatter: 0,
      totalAntimatter: 700,
      reservedBy: "rocket1",
      depleted: true,
      interacted: true,
    };
    const miningState: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 1 },
        space: {
          ...initial.run.space,
          antimatterUnlocked: true,
          launchPadBuilt: true,
          asteroids: [asteroid],
          nextAsteroidSequence: 3,
          rockets: {
            ...initial.run.space.rockets,
            rocket1: {
              ...initial.run.space.rockets.rocket1,
              builtParts: ROCKET_PART_REQUIREMENTS.rocket1,
              fuelQuantity: ROCKET_FUEL_CAPACITY.rocket1,
              phase: "mining",
              targetAsteroidId: asteroid.id,
              timerId: null,
            },
          },
        },
      },
    };
    expect(isValidGameState(miningState)).toBe(true);
    const advanced = transition(miningState, {
      type: "clock.advance",
      input: { wallNowMs: 1, foreground: true, offlineElapsedMs: 1_000 },
    });
    expect(advanced.state.run.space.antimatter).toBe(0);
    expect(advanced.state.run.space.antimatterMinedThisRun).toBe(0);
    expect(advanced.state.statistics.lifetimeAntimatterMined).toBe(0);
    expect(advanced.state.run.space.rockets.rocket1.phase).toBe("returning");
    expect(isValidGameState(advanced.state)).toBe(true);
  });

  it("keeps four rocket destinations separate while mining into shared antimatter", () => {
    const initial = createInitialGameState({ seed: 92 });
    const asteroids: AsteroidState[] = ROCKET_IDS.map((rocketId, index) => ({
      id: `asteroid-${index + 1}`,
      name: `SPI-${String(index + 1).padStart(4, "0")}A`,
      systemId: "spica",
      distance: 1,
      rarity: "common",
      extractionEase: 1,
      remainingAntimatter: 1_000,
      totalAntimatter: 1_000,
      reservedBy: null,
      depleted: false,
      interacted: true,
    }));
    const rockets = { ...initial.run.space.rockets };
    ROCKET_IDS.forEach((rocketId) => {
      rockets[rocketId] = {
        ...rockets[rocketId],
        builtParts: ROCKET_PART_REQUIREMENTS[rocketId],
        fuelQuantity: ROCKET_FUEL_CAPACITY[rocketId],
        phase: "orbit",
      };
    });
    let state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 1 },
        space: {
          ...initial.run.space,
          launchPadBuilt: true,
          asteroids,
          nextAsteroidSequence: 5,
          rockets,
        },
      },
    };
    expect(isValidGameState(state)).toBe(true);

    ROCKET_IDS.forEach((rocketId, index) => {
      const result = transition(state, {
        type: "space.rocket.travel",
        rocketId,
        asteroidId: asteroids[index]!.id,
      });
      expect(result.accepted).toBe(true);
      state = result.state;
    });
    const boost = transition(state, {
      type: "space.antimatter-boost.set-active",
      active: true,
    });
    expect(boost.accepted).toBe(true);
    const boostedSave = makeEnvelope({
      slotId: "11111111-1111-4111-8111-111111111111",
      pioneerName: boost.state.run.pioneerName,
      createdAt: 1,
      savedAt: 1,
      revision: 1,
      state: boost.state,
    });
    expect(boost.state.run.space.antimatterBoostActive).toBe(true);
    expect(boostedSave.state.run.space.antimatterBoostActive).toBe(false);
    expect(decodePortable(encodePortable(boostedSave)).state.run.space.antimatterBoostActive).toBe(
      false,
    );
    const advanced = transition(boost.state, {
      type: "clock.advance",
      input: { wallNowMs: 1, foreground: true, offlineElapsedMs: 1_000 },
    });
    expect(advanced.state.run.space.antimatter).toBeCloseTo(151.0528, 8);
    expect(advanced.state.run.space.antimatterMinedThisRun).toBeCloseTo(1.0528, 8);
    expect(advanced.state.statistics.lifetimeAntimatterMined).toBeCloseTo(1.0528, 8);
    expect(
      ROCKET_IDS.map((rocketId) => advanced.state.run.space.rockets[rocketId].targetAsteroidId),
    ).toEqual(asteroids.map((asteroid) => asteroid.id));
    expect(
      ROCKET_IDS.every((rocketId) => advanced.state.run.space.rockets[rocketId].phase === "mining"),
    ).toBe(true);
    expect(advanced.state.run.space.asteroids.map((asteroid) => asteroid.reservedBy)).toEqual(
      ROCKET_IDS,
    );
    expect(isValidGameState(advanced.state)).toBe(true);
    const released = transition(advanced.state, {
      type: "space.antimatter-boost.set-active",
      active: false,
    });
    expect(released.state.run.space.antimatterBoostActive).toBe(false);
  });
});
