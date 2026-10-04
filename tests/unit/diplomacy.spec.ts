import { describe, expect, it } from "vitest";
import {
  FLEET_ENVOY_COST,
  PLAYER_FLEETS,
  STARSHIP_MODULES,
  createInitialStarSystemBattleState,
} from "../../src/content/space";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { transition } from "../../src/engine/commands";
import { resolveDiplomacyChoice } from "../../src/engine/diplomacy";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import type { GameState } from "../../src/engine/state";

function createEncounter(): GameState["run"]["space"]["systemEncounters"][number] {
  return {
    systemId: createStarCatalogue().find((star) => star.name === "Sirius")!.id,
    lifeDetected: true,
    civilizationLevel: "industrial",
    lifeformTraits: ["diplomatic", "terrans", "powerSiphon"],
    raceName: "Sirius Envoys",
    populationEstimate: 2_000_000,
    threatLevel: "low",
    defenseRating: 30,
    enemyFleets: { air: 2, land: 3, sea: 1 },
    anomalies: [],
    initialImpression: 60,
    currentImpression: 60,
    latestDifferenceInImpression: 0,
    attitude: "receptive",
    triedToBully: false,
    patience: 5,
    lastDiplomacyMessage: null,
    warReady: false,
    warMode: false,
    battle: createInitialStarSystemBattleState(),
  };
}

function diplomacyState(): GameState {
  const initial = createInitialGameState({ seed: 503 });
  const destination = createEncounter().systemId;
  const goods = Object.fromEntries(
    Object.entries(initial.run.goods).map(([goodId, good]) => [
      goodId,
      { ...good, quantity: 20_000, storageCapacity: 100_000 },
    ]),
  ) as GameState["run"]["goods"];
  const state: GameState = {
    ...initial,
    run: {
      ...initial.run,
      cash: Math.max(initial.run.cash, FLEET_ENVOY_COST.cash),
      goods,
      economy: {
        ...initial.run.economy,
        researchedTechnologies: ["starshipFleets"],
        revealedTechnologies: ["knowledgeSharing", "starshipFleets"],
      },
      space: {
        ...initial.run.space,
        starshipModules: {
          ...initial.run.space.starshipModules,
          fleetHangar: { builtParts: STARSHIP_MODULES.fleetHangar.parts },
        },
        starship: {
          destinationSystemId: destination,
          phase: "orbiting",
          timerId: null,
          durationMs: 1,
          antimatterSpent: 1,
        },
        systemEncounters: [createEncounter()],
      },
    },
  };
  return state;
}

describe("interstellar diplomacy", () => {
  it("resolves a diplomatic message into saved impression, attitude, and patience changes", () => {
    const result = resolveDiplomacyChoice(createEncounter(), "message", () => 0.1);
    expect(result).toMatchObject({
      outcome: "receptive",
      encounter: {
        currentImpression: 68,
        latestDifferenceInImpression: 8,
        attitude: "receptive",
        patience: 4,
        lastDiplomacyMessage: "messageReceptive",
      },
    });
  });

  it("turns a failed harmony appeal into a belligerent response", () => {
    const result = resolveDiplomacyChoice(createEncounter(), "harmony", () => 0.8);
    expect(result).toMatchObject({
      outcome: "belligerent",
      encounter: {
        currentImpression: 0,
        latestDifferenceInImpression: -60,
        attitude: "belligerent",
        defenseRating: 30,
        patience: 0,
        lastDiplomacyMessage: "harmonyBelligerent",
      },
    });
  });

  it("applies the original bully power ratios and fleet outcomes", () => {
    const surrendered = resolveDiplomacyChoice(createEncounter(), "bully", () => 0.5, {
      playerAttackPower: 100,
    });
    expect(surrendered.outcome).toBe("surrendered");
    expect(surrendered.encounter.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });
    expect(surrendered.encounter.attitude).toBe("surrendered");

    const scared = resolveDiplomacyChoice(createEncounter(), "bully", () => 0.5, {
      playerAttackPower: 50,
    });
    expect(scared.outcome).toBe("scared");
    expect(scared.encounter.enemyFleets).toEqual({ air: 1, land: 1, sea: 0 });
    expect(scared.encounter.warReady).toBe(true);
  });

  it("allows vassalization by ability and records refusal as war-ready", () => {
    const forcedSuccess = resolveDiplomacyChoice(createEncounter(), "vassalize", () => 0.99, {
      supremacistAbilityActive: true,
    });
    expect(forcedSuccess.outcome).toBe("vassalized");
    expect(forcedSuccess.encounter.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });

    const refusal = resolveDiplomacyChoice(createEncounter(), "vassalize", () => 0.99);
    expect(refusal.outcome).toBe("vassalizationFailed");
    expect(refusal.encounter.warReady).toBe(true);
  });

  it("requires Supremacist fleet power to exceed three times enemy power", () => {
    const initial = diplomacyState();
    const exactThreshold: GameState = {
      ...initial,
      run: {
        ...initial.run,
        philosophyAbilityActive: true,
        space: {
          ...initial.run.space,
          fleetEnvoyBuilt: true,
          playerFleetCombatTotals: {
            ...initial.run.space.playerFleetCombatTotals,
            scout: { attackPower: 18, defensePower: 18 },
          },
        },
      },
      permanent: {
        ...initial.permanent,
        philosophyId: "supremacist",
        rebirthCount: 1,
      },
    };
    expect(
      transition(exactThreshold, { type: "space.diplomacy.choose", choice: "vassalize" }).accepted,
    ).toBe(false);

    const aboveThreshold: GameState = {
      ...exactThreshold,
      run: {
        ...exactThreshold.run,
        space: {
          ...exactThreshold.run.space,
          playerFleetCombatTotals: {
            ...exactThreshold.run.space.playerFleetCombatTotals,
            scout: { attackPower: 18.01, defensePower: 18.01 },
          },
        },
      },
    };
    expect(
      transition(aboveThreshold, { type: "space.diplomacy.choose", choice: "vassalize" }).accepted,
    ).toBe(true);
  });

  it("enters war only after the saved encounter is war-ready", () => {
    const initial = diplomacyState();
    const blocked = transition(initial, { type: "space.diplomacy.enter-war" });
    expect(blocked.accepted).toBe(false);

    const readyState: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          systemEncounters: [{ ...createEncounter(), warReady: true }],
        },
      },
    };
    const entered = transition(readyState, { type: "space.diplomacy.enter-war" });
    expect(entered.accepted).toBe(true);
    expect(entered.state.run.space.systemEncounters[0]).toMatchObject({
      warReady: false,
      warMode: true,
    });
  });

  it("charges the single Envoy once and gates diplomacy until it is built", () => {
    const initial = diplomacyState();
    expect(isValidGameState(initial)).toBe(true);
    expect(
      transition(initial, { type: "space.diplomacy.choose", choice: "message" }).accepted,
    ).toBe(false);

    const built = transition(initial, { type: "space.envoy.build" });
    expect(built.accepted).toBe(true);
    expect(built.state.run.space.fleetEnvoyBuilt).toBe(true);
    // This fixture also earns the Hydrogen, Carbon and research achievement rewards ($215).
    expect(built.state.run.cash).toBe(initial.run.cash - FLEET_ENVOY_COST.cash + 215);
    for (const material of FLEET_ENVOY_COST.materials) {
      expect(built.state.run.goods[material.goodId].quantity).toBe(
        initial.run.goods[material.goodId].quantity - material.amount,
      );
    }

    const contacted = transition(built.state, {
      type: "space.diplomacy.choose",
      choice: "message",
    });
    expect(contacted.accepted).toBe(true);
    const encounter = contacted.state.run.space.systemEncounters[0]!;
    expect(encounter.lastDiplomacyMessage).not.toBeNull();
    expect(encounter.patience).toBe(4);
    expect(encounter.currentImpression).not.toBe(60);
    expect(isValidGameState(contacted.state)).toBe(true);
  });

  it("does not enable diplomacy for an unoccupied encounter", () => {
    const initial = diplomacyState();
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          fleetEnvoyBuilt: true,
          systemEncounters: [
            {
              ...createEncounter(),
              civilizationLevel: "unsentient",
              lifeformTraits: ["notApplicable", "notApplicable", "notApplicable"],
            },
          ],
        },
      },
    };
    expect(transition(state, { type: "space.diplomacy.choose", choice: "harmony" }).accepted).toBe(
      false,
    );
  });

  it("builds fleet ships at the source price and enforces the quantity cap", () => {
    const initial = diplomacyState();
    const funded: GameState = {
      ...initial,
      run: { ...initial.run, cash: PLAYER_FLEETS.scout.baseCost.cash },
    };
    const built = transition(funded, { type: "space.fleet.build", fleetId: "scout" });
    expect(built.accepted).toBe(true);
    expect(built.state.run.space.playerFleets.scout).toBe(1);
    // The accepted build pays its exact cost, then unlocks $215 of threshold rewards.
    expect(built.state.run.cash).toBe(215);
    for (const material of PLAYER_FLEETS.scout.baseCost.materials) {
      expect(built.state.run.goods[material.goodId].quantity).toBe(
        funded.run.goods[material.goodId].quantity - material.amount,
      );
    }

    const atCapacity: GameState = {
      ...funded,
      run: {
        ...funded.run,
        space: {
          ...funded.run.space,
          playerFleets: {
            ...funded.run.space.playerFleets,
            scout: PLAYER_FLEETS.scout.maxQuantity,
          },
        },
      },
    };
    expect(isValidGameState(atCapacity)).toBe(true);
    const capped = transition(atCapacity, { type: "space.fleet.build", fleetId: "scout" });
    expect(capped.accepted).toBe(false);
    expect(capped.failure?.code).toBe("space-fleet-at-capacity");
  });
});
