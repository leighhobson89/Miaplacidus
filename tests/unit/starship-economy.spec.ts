import { describe, expect, it } from "vitest";
import { STARSHIP_MODULES, STARSHIP_MODULE_IDS } from "../../src/content/space";
import {
  createStarCatalogue,
  findStarByName,
  findStartingSystem,
} from "../../src/content/starCatalogue";
import { transition } from "../../src/engine/commands";
import { generateStarSystemEncounter } from "../../src/engine/starSystemEncounters";
import { starshipTravelPlan } from "../../src/engine/spaceMechanics";
import { starshipModulePartCost, starshipTravelDurationMs } from "../../src/engine/spaceRules";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import type { GameState } from "../../src/engine/state";
import { decodePortable, encodePortable } from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";

describe("starship antimatter spending", () => {
  it("generates stable encounter, impression, and anomaly data by system identity", () => {
    const catalogue = createStarCatalogue();
    const regular = catalogue.find((star) => star.name === "Sirius")!;
    const first = generateStarSystemEncounter(regular, false);
    const repeated = generateStarSystemEncounter(regular, false);
    expect(first).toEqual(repeated);
    expect(first.raceName.length).toBeGreaterThan(0);
    expect(first.currentImpression).toBe(first.initialImpression);
    expect(first.latestDifferenceInImpression).toBe(0);
    expect(first.triedToBully).toBe(false);
    expect(first.patience).toBeGreaterThanOrEqual(0);
    expect(first.patience).toBeLessThanOrEqual(6);

    const oTypeStar = catalogue.find((star) => star.starType === "O")!;
    const hardMode = generateStarSystemEncounter(oTypeStar, false);
    expect(hardMode).toMatchObject({
      civilizationLevel: "robotic",
      lifeDetected: true,
      lifeformTraits: ["aggressive", "mechanized", "armored"],
      threatLevel: "extreme",
      attitude: "belligerent",
      anomalies: ["stalwart"],
    });

    const home = catalogue.find((star) => star.name === "Miaplacidus")!;
    expect(generateStarSystemEncounter(home, false)).toMatchObject({
      raceName: "Miaplacidus Wardens",
      civilizationLevel: "robotic",
      populationEstimate: 95_000_000,
      defenseRating: 100,
      enemyFleets: { air: 100, land: 100, sea: 100 },
      anomalies: ["brokenForceField", "aiMasterRace"],
      patience: 0,
    });
  });

  it("locks every module behind its own research", () => {
    const initial = createInitialGameState({ seed: 78 });
    for (const moduleId of STARSHIP_MODULE_IDS) {
      const result = transition(initial, {
        type: "space.starship.module.build",
        moduleId,
      });
      expect(result.accepted).toBe(false);
      expect(result.failure?.code).toBe("space-starship-module-locked");
      expect(result.state).toBe(initial);
    }
  });

  it("quotes, checks and charges a discounted starship module part once", () => {
    const initial = createInitialGameState({ seed: 79 });
    const cost = starshipModulePartCost("structural", 0, 2);
    const goods = { ...initial.run.goods };
    for (const material of cost.materials) {
      goods[material.goodId] = {
        ...goods[material.goodId],
        storageCapacity: Math.max(goods[material.goodId].storageCapacity, material.amount),
        quantity: material.amount,
      };
    }
    const funded: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: cost.cash,
        goods,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["orbitalConstruction"],
          revealedTechnologies: ["knowledgeSharing", "orbitalConstruction"],
        },
      },
      permanent: {
        ...initial.permanent,
        acquiredPerks: ["spaceElevator:2"],
      },
    };
    expect(isValidGameState(funded)).toBe(true);

    const built = transition(funded, {
      type: "space.starship.module.build",
      moduleId: "structural",
    });
    expect(built.accepted).toBe(true);
    expect(built.state.run.cash).toBe(0);
    for (const material of cost.materials) {
      expect(built.state.run.goods[material.goodId].quantity).toBeCloseTo(0);
    }
    expect(built.state.run.space.starshipModules.structural.builtParts).toBe(1);
    expect(isValidGameState(built.state)).toBe(true);
  });

  it("blocks a one-unit shortfall and spends the exact distance quote on launch", () => {
    const initial = createInitialGameState({ seed: 80 });
    const catalogue = createStarCatalogue();
    const start = findStartingSystem(catalogue)!;
    const destination = catalogue.find((star) => star.name === "Sirius")!;
    const modules = Object.fromEntries(
      STARSHIP_MODULE_IDS.map((moduleId) => [
        moduleId,
        {
          builtParts: STARSHIP_MODULES[moduleId].requiredForTravel
            ? STARSHIP_MODULES[moduleId].parts
            : 0,
        },
      ]),
    ) as GameState["run"]["space"]["starshipModules"];
    const ready: GameState = {
      ...initial,
      run: {
        ...initial.run,
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["FTLTravelTheory"],
          revealedTechnologies: ["knowledgeSharing", "FTLTravelTheory"],
        },
        space: {
          ...initial.run.space,
          currentSystemId: start.id,
          starStudyRange: 200,
          antimatterUnlocked: true,
          starshipModules: modules,
        },
      },
    };
    expect(isValidGameState(ready)).toBe(true);

    const incompleteModules = {
      ...modules,
      structural: { builtParts: STARSHIP_MODULES.structural.parts - 1 },
    };
    const incomplete: GameState = {
      ...ready,
      run: {
        ...ready.run,
        space: { ...ready.run.space, starshipModules: incompleteModules },
      },
    };
    expect(isValidGameState(incomplete)).toBe(true);
    const incompleteSelection = transition(incomplete, {
      type: "space.starship.destination.select",
      systemId: destination.id,
    });
    expect(incompleteSelection.accepted).toBe(true);
    const incompleteLaunch = transition(incompleteSelection.state, {
      type: "space.starship.launch",
    });
    expect(incompleteLaunch.accepted).toBe(false);
    expect(incompleteLaunch.failure?.code).toBe("space-starship-incomplete");
    expect(incompleteLaunch.state.run.space.antimatter).toBe(incomplete.run.space.antimatter);

    const quote = starshipTravelPlan(ready, destination.id);
    expect(quote).not.toBeNull();
    const quantumEnginesState: GameState = {
      ...ready,
      permanent: { ...ready.permanent, acquiredPerks: ["quantumEngines:2"] },
    };
    const fasterQuote = starshipTravelPlan(quantumEnginesState, destination.id);
    expect(fasterQuote).toMatchObject({
      durationMs: Math.floor(quote!.durationMs / 4),
      antimatter: quote!.antimatter,
    });
    const overPurchasedQuantumEngines: GameState = {
      ...ready,
      permanent: { ...ready.permanent, acquiredPerks: ["quantumEngines:99"] },
    };
    expect(starshipTravelPlan(overPurchasedQuantumEngines, destination.id)).toMatchObject({
      durationMs: Math.floor(quote!.durationMs / 64),
      antimatter: quote!.antimatter,
    });
    const expansionistTravel = starshipTravelPlan(
      {
        ...ready,
        permanent: { ...ready.permanent, acquiredPerks: ["warpDrive:2"] },
      },
      destination.id,
    );
    expect(expansionistTravel).toMatchObject({
      distanceLy: quote!.distanceLy,
      durationMs: starshipTravelDurationMs(quote!.distanceLy, 0, 2),
      antimatter: quote!.antimatter,
    });
    const selected = transition(ready, {
      type: "space.starship.destination.select",
      systemId: destination.id,
    });
    expect(selected.accepted).toBe(true);
    const required = quote!.antimatter;
    const insufficient: GameState = {
      ...selected.state,
      run: {
        ...selected.state.run,
        space: { ...selected.state.run.space, antimatter: required - 1 },
      },
    };
    const blocked = transition(insufficient, { type: "space.starship.launch" });
    expect(blocked.accepted).toBe(false);
    expect(blocked.failure).toMatchObject({ code: "insufficient-antimatter", required });
    expect(blocked.state.run.space.antimatter).toBe(required - 1);

    const exact: GameState = {
      ...selected.state,
      run: {
        ...selected.state.run,
        space: { ...selected.state.run.space, antimatter: required },
      },
    };
    const launched = transition(exact, { type: "space.starship.launch" });
    expect(launched.accepted).toBe(true);
    expect(launched.state.run.space.antimatter).toBe(0);
    expect(launched.state.run.space.starship).toMatchObject({
      phase: "travelling",
      antimatterSpent: required,
    });
    expect(launched.events).toContainEqual({
      type: "space.starship.launched",
      systemId: destination.id,
      durationMs: quote!.durationMs,
      antimatterSpent: required,
    });
    expect(isValidGameState(launched.state)).toBe(true);
    const voyageTimerId = launched.state.run.space.starship.timerId!;

    const warped = transition(launched.state, { type: "space.starship.travel.warp" });
    expect(warped.accepted).toBe(true);
    expect(warped.events).toContainEqual({
      type: "space.starship.travel.shortened",
      systemId: destination.id,
      remainingMs: 2_000,
    });
    const warpedTimer = warped.state.run.timers[voyageTimerId]!;
    expect(warpedTimer.durationMs - warpedTimer.elapsedMs).toBe(2_000);

    const clockBaseline = transition(warped.state, {
      type: "clock.advance",
      input: { wallNowMs: 1_000, foreground: true },
    });
    const blackHoleAccelerated = transition(clockBaseline.state, {
      type: "clock.advance",
      input: { wallNowMs: 1_500, foreground: true, timeWarpMultiplier: 4 },
    });
    expect(blackHoleAccelerated.state.run.space.starship.phase).toBe("orbiting");
    expect(
      blackHoleAccelerated.events.filter((event) => event.type === "space.starship.arrived"),
    ).toHaveLength(1);
    expect(blackHoleAccelerated.state.run.timers[voyageTimerId]?.status).toBe("complete");
    const repeatedCompletion = transition(blackHoleAccelerated.state, {
      type: "timer.complete",
      timerId: voyageTimerId,
    });
    expect(repeatedCompletion.events).not.toContainEqual({
      type: "space.starship.arrived",
      systemId: destination.id,
    });

    const changedDestination = transition(launched.state, {
      type: "space.starship.destination.select",
      systemId: findStarByName(catalogue, "Canopus")!.id,
    });
    expect(changedDestination.accepted).toBe(false);
    expect(changedDestination.failure?.code).toBe("space-starship-already-launched");
    expect(changedDestination.state.run.space.starship.destinationSystemId).toBe(destination.id);

    const resumed = decodePortable(
      encodePortable(
        makeEnvelope({
          slotId: "11111111-1111-4111-8111-111111111111",
          pioneerName: launched.state.run.pioneerName,
          createdAt: 1,
          savedAt: 1,
          revision: 1,
          state: launched.state,
        }),
      ),
    ).state;
    expect(resumed.run.space.starship.timerId).toBe(voyageTimerId);
    expect(resumed.run.timers[voyageTimerId]).toMatchObject({
      durationMs: quote!.durationMs,
      elapsedMs: 0,
      status: "running",
    });
    const offlineArrival = transition(resumed, {
      type: "clock.advance",
      input: {
        wallNowMs: 100_000,
        foreground: true,
        offlineElapsedMs: Math.ceil(quote!.durationMs / 0.334),
      },
    });
    expect(offlineArrival.accepted).toBe(true);
    expect(offlineArrival.state.run.timers[voyageTimerId]?.status).toBe("complete");
    expect(offlineArrival.state.run.space.currentSystemId).toBe(start.id);
    expect(offlineArrival.state.run.space.starship.destinationSystemId).toBe(destination.id);
    expect(offlineArrival.state.run.space.starship.phase).toBe("orbiting");
    expect(
      offlineArrival.events.filter((event) => event.type === "space.starship.arrived"),
    ).toHaveLength(1);
    const duplicateArrival = transition(offlineArrival.state, {
      type: "timer.complete",
      timerId: voyageTimerId,
    });
    expect(duplicateArrival.events).not.toContainEqual({
      type: "space.starship.arrived",
      systemId: destination.id,
    });

    const duplicate = transition(launched.state, { type: "space.starship.launch" });
    expect(duplicate.accepted).toBe(false);
    expect(duplicate.failure?.code).toBe("space-starship-already-launched");
    expect(duplicate.state.run.space.antimatter).toBe(0);
  });
});
