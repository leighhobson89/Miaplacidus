import { describe, expect, it } from "vitest";
import { STARSHIP_MODULES, createInitialStarSystemBattleState } from "../../src/content/space";
import { findStarByName, createStarCatalogue } from "../../src/content/starCatalogue";
import { transition } from "../../src/engine/commands";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { createTimerId } from "../../src/engine/timers";

const catalogue = createStarCatalogue();
const battleTimerId = createTimerId("battle", "starship-combat");

function createEncounter(
  systemId: GameState["run"]["space"]["systemEncounters"][number]["systemId"],
  options: {
    readonly enemyFleets?: { readonly air: number; readonly land: number; readonly sea: number };
    readonly civilizationLevel?: "none" | "unsentient" | "industrial";
    readonly lifeformTraits?: readonly ["aggressive" | "diplomatic", "terrans", "armored"];
    readonly warMode?: boolean;
  } = {},
): GameState["run"]["space"]["systemEncounters"][number] {
  return {
    systemId,
    lifeDetected: options.civilizationLevel !== "none",
    civilizationLevel: options.civilizationLevel ?? "industrial",
    lifeformTraits: options.lifeformTraits ?? ["aggressive", "terrans", "armored"],
    raceName: "Battle Testers",
    populationEstimate: 2_000_000,
    threatLevel: "low",
    defenseRating: 0,
    enemyFleets: options.enemyFleets ?? { air: 1, land: 0, sea: 0 },
    anomalies: [],
    initialImpression: 20,
    currentImpression: 20,
    latestDifferenceInImpression: 0,
    attitude: options.civilizationLevel === "none" ? "none" : "belligerent",
    triedToBully: false,
    patience: 0,
    lastDiplomacyMessage: null,
    warReady: false,
    warMode: options.warMode ?? true,
    battle: createInitialStarSystemBattleState(),
  };
}

function scenario(options: Parameters<typeof createEncounter>[1] = {}): {
  state: GameState;
  destinationId: GameState["run"]["space"]["starship"]["destinationSystemId"] & string;
} {
  const state = createInitialGameState({ seed: 804 });
  const destinationId = findStarByName(catalogue, "Sirius")!.id;
  const encounter = createEncounter(destinationId, options);
  const updated: GameState = {
    ...state,
    run: {
      ...state.run,
      space: {
        ...state.run.space,
        starship: {
          destinationSystemId: destinationId,
          phase: "orbiting",
          timerId: null,
          durationMs: 1_000,
          antimatterSpent: 1,
        },
        playerFleets: { ...state.run.space.playerFleets, scout: 3 },
        playerFleetCombatTotals: {
          ...state.run.space.playerFleetCombatTotals,
          scout: { attackPower: 6, defensePower: 6 },
        },
        systemProfiles: [
          ...state.run.space.systemProfiles,
          {
            systemId: destinationId,
            weatherChances: { sunny: 25, cloudy: 25, rain: 25, volcano: 25 },
            precipitationGoodId: "water",
            ascendencyPoints: 3,
            ascendencyDistanceLy: 0,
          },
        ],
        systemEncounters: [encounter],
      },
    },
  };
  if (!isValidGameState(updated))
    throw new Error("Battle scenario must be a valid saved game state.");
  return { state: updated, destinationId };
}

function finishBattle(state: GameState): GameState {
  let current = state;
  for (let index = 0; index < 500; index += 1) {
    const result = transition(current, { type: "timer.complete", timerId: battleTimerId });
    if (!result.accepted) return current;
    current = result.state;
    const destination = current.run.space.starship.destinationSystemId;
    const encounter = current.run.space.systemEncounters.find(
      (entry) => entry.systemId === destination,
    );
    if (encounter?.battle.phase !== "inProgress") return current;
  }
  throw new Error("The battle did not reach a terminal result within 500 rounds.");
}

describe("space battle and settlement flow", () => {
  it("resolves class-level battle rounds, persists victory, and awards settlement currency once", () => {
    const { state, destinationId } = scenario();
    const engaged = transition(state, { type: "space.battle.engage" });
    expect(engaged.accepted).toBe(true);
    expect(engaged.state.run.timers[battleTimerId]?.domain).toBe("battle");

    const victory = finishBattle(engaged.state);
    const encounter = victory.run.space.systemEncounters[0]!;
    expect(encounter.battle.phase).toBe("victory");
    expect(encounter.enemyFleets).toEqual({ air: 0, land: 0, sea: 0 });
    expect(victory.run.space.starship.destinationSystemId).toBe(destinationId);
    expect(victory.run.timers[battleTimerId]).toBeUndefined();
    expect(isValidGameState(victory)).toBe(true);

    const settled = transition(victory, { type: "space.system.settle" });
    expect(settled.accepted).toBe(true);
    expect(settled.events).toContainEqual({
      type: "space.system.settled",
      systemId: destinationId,
      ascendencyPoints: 6,
      gloryPoints: 1,
    });
    expect(settled.state.permanent.settledSystemIds).toContain(destinationId);
    expect(settled.state.permanent.ascendencyPoints).toBe(6);
    expect(settled.state.permanent.gloryPoints).toBe(1);
    expect(settled.state.run.space.ascendencyAwardedThisRun).toBe(true);
    expect(transition(settled.state, { type: "space.system.settle" }).accepted).toBe(false);
  });

  it("keeps the starship and enemy survivors after defeat, then permits a rebuilt fleet to retry", () => {
    const { state, destinationId } = scenario({ enemyFleets: { air: 50, land: 0, sea: 0 } });
    const engaged = transition(state, { type: "space.battle.engage" });
    const defeat = transition(engaged.state, { type: "timer.complete", timerId: battleTimerId });

    expect(defeat.state.run.space.systemEncounters[0]?.battle.phase).toBe("defeat");
    expect(defeat.state.run.space.systemEncounters[0]?.enemyFleets.air).toBeGreaterThan(0);
    expect(defeat.state.run.space.playerFleets.scout).toBe(0);
    expect(defeat.state.run.space.starship).toMatchObject({
      phase: "orbiting",
      destinationSystemId: destinationId,
    });
    expect(isValidGameState(defeat.state)).toBe(true);

    const base = defeat.state;
    const goods = Object.fromEntries(
      Object.entries(base.run.goods).map(([goodId, good]) => [
        goodId,
        ["hydrogen", "silicon", "titanium"].includes(goodId)
          ? { ...good, quantity: 100_000, storageCapacity: 100_000 }
          : good,
      ]),
    ) as typeof base.run.goods;
    const rebuiltState: GameState = {
      ...base,
      run: {
        ...base.run,
        cash: 1_000_000,
        goods,
        economy: {
          ...base.run.economy,
          researchedTechnologies: [...base.run.economy.researchedTechnologies, "starshipFleets"],
          revealedTechnologies: [...base.run.economy.revealedTechnologies, "starshipFleets"],
        },
        space: {
          ...base.run.space,
          starshipModules: {
            ...base.run.space.starshipModules,
            fleetHangar: { builtParts: STARSHIP_MODULES.fleetHangar.parts },
          },
        },
      },
    };
    expect(isValidGameState(rebuiltState)).toBe(true);
    const rebuilt = transition(rebuiltState, { type: "space.fleet.build", fleetId: "scout" });
    expect(rebuilt.accepted).toBe(true);
    expect(rebuilt.state.run.space.systemEncounters[0]?.battle.playerHealthPool.scout).toBe(100);
    const reentered = transition(rebuilt.state, { type: "space.diplomacy.enter-war" });
    expect(reentered.accepted).toBe(true);
    const retry = transition(reentered.state, { type: "space.battle.engage" });
    expect(retry.accepted).toBe(true);
    expect(retry.state.run.space.starship.destinationSystemId).toBe(destinationId);
  });

  it("settles an unoccupied world without a battle and grants AP only once this run", () => {
    const { state, destinationId } = scenario({
      enemyFleets: { air: 0, land: 0, sea: 0 },
      civilizationLevel: "unsentient",
      warMode: false,
    });
    const settled = transition(state, { type: "space.system.settle" });

    expect(settled.accepted).toBe(true);
    expect(settled.state.permanent.ascendencyPoints).toBe(3);
    expect(settled.state.permanent.gloryPoints).toBe(1);
    expect(settled.state.permanent.settledSystemIds).toContain(destinationId);

    const anotherDestination = findStarByName(catalogue, "Canopus")!.id;
    const secondEncounter = createEncounter(anotherDestination, {
      enemyFleets: { air: 0, land: 0, sea: 0 },
      civilizationLevel: "none",
      warMode: false,
    });
    const nextState: GameState = {
      ...settled.state,
      run: {
        ...settled.state.run,
        space: {
          ...settled.state.run.space,
          starship: {
            ...settled.state.run.space.starship,
            destinationSystemId: anotherDestination,
          },
          systemEncounters: [...settled.state.run.space.systemEncounters, secondEncounter],
          systemProfiles: [
            ...settled.state.run.space.systemProfiles,
            {
              systemId: anotherDestination,
              weatherChances: { sunny: 25, cloudy: 25, rain: 25, volcano: 25 },
              precipitationGoodId: "water",
              ascendencyPoints: 9,
              ascendencyDistanceLy: 0,
            },
          ],
        },
      },
    };
    expect(isValidGameState(nextState)).toBe(true);
    const secondSettlement = transition(nextState, { type: "space.system.settle" });
    expect(secondSettlement.accepted).toBe(true);
    expect(secondSettlement.state.permanent.ascendencyPoints).toBe(3);
    expect(secondSettlement.state.permanent.gloryPoints).toBe(2);
  });

  it("assigns one persistent power-plant bonus when an O-type system is settled", () => {
    const oTypeSystemId = catalogue.find((star) => star.starType === "O")!.id;
    const base = createInitialGameState({ seed: 805 });
    const encounter = createEncounter(oTypeSystemId, {
      enemyFleets: { air: 0, land: 0, sea: 0 },
      civilizationLevel: "none",
      warMode: false,
    });
    const state: GameState = {
      ...base,
      run: {
        ...base.run,
        space: {
          ...base.run.space,
          starship: {
            ...base.run.space.starship,
            destinationSystemId: oTypeSystemId,
            phase: "orbiting",
            durationMs: 1_000,
            antimatterSpent: 1,
          },
          systemEncounters: [encounter],
          systemProfiles: [
            ...base.run.space.systemProfiles,
            {
              systemId: oTypeSystemId,
              weatherChances: { sunny: 25, cloudy: 25, rain: 25, volcano: 25 },
              precipitationGoodId: "water",
              ascendencyPoints: 4,
              ascendencyDistanceLy: 10,
            },
          ],
        },
      },
      permanent: {
        ...base.permanent,
        philosophyId: "voidborn",
        rebirthCount: 1,
        acquiredPerks: ["ascendencyPhilosophy:2"],
      },
    };

    const settled = transition(state, { type: "space.system.settle" });
    const assignments = settled.state.permanent.oTypePowerPlantAssignments;

    expect(settled.accepted).toBe(true);
    expect(Object.values(assignments)).toContain(oTypeSystemId);
    expect(settled.state.permanent.ascendencyPoints).toBe(10);
    expect(settled.events).toContainEqual(
      expect.objectContaining({ type: "space.system.settled", systemId: oTypeSystemId }),
    );
    expect(isValidGameState(settled.state)).toBe(true);
  });
});
