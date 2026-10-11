import { describe, expect, it } from "vitest";
import { STARSHIP_MODULES, STARSHIP_MODULE_IDS } from "../../src/content/space";
import { createStarCatalogue, findStarByName } from "../../src/content/starCatalogue";
import { OFFLINE_GAINS_RATE } from "../../src/engine/clock";
import { enemyFleetPower } from "../../src/engine/fleetMechanics";
import { generateStarSystemEncounter } from "../../src/engine/starSystemEncounters";
import { selectInterstellarStatistics } from "../../src/engine/selectors";
import { transition } from "../../src/engine/commands";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { starshipTravelPlan } from "../../src/engine/spaceMechanics";
import {
  makeEnvelope,
  canonicalJson,
  checksumFor,
  SAVE_SCHEMA_VERSION,
} from "../../src/persistence/schema";
import { decodePortable, encodePortable, PORTABLE_PREFIX } from "../../src/persistence/codec";
import { compressToEncodedURIComponent } from "lz-string";

function interstellarFixture(): GameState {
  const initial = createInitialGameState({ pioneerName: "Interstellar Selector", seed: 821 });
  const destination = findStarByName(createStarCatalogue(), "Sirius")!;
  const encounter = {
    ...generateStarSystemEncounter(destination, false),
    civilizationLevel: "industrial" as const,
  };
  const modules = Object.fromEntries(
    STARSHIP_MODULE_IDS.map((id) => [id, { builtParts: STARSHIP_MODULES[id].parts }]),
  ) as GameState["run"]["space"]["starshipModules"];
  const profile = {
    ...initial.run.space.systemProfiles[0]!,
    systemId: destination.id,
    ascendencyPoints: 19,
    ascendencyDistanceLy: 10,
  };
  return {
    ...initial,
    run: {
      ...initial.run,
      space: {
        ...initial.run.space,
        starStudyRange: 123.45,
        starshipDistanceTravelledThisRun: 42.75,
        systemProfiles: [
          ...initial.run.space.systemProfiles.filter(({ systemId }) => systemId !== destination.id),
          profile,
        ],
        systemEncounters: [encounter],
        fleetEnvoyBuilt: true,
        playerFleets: { scout: 2, marauder: 3, landStalker: 4, navalStrafer: 5 },
        playerFleetCombatTotals: {
          scout: { attackPower: 10, defensePower: 4 },
          marauder: { attackPower: 20, defensePower: 6 },
          landStalker: { attackPower: 30, defensePower: 0 },
          navalStrafer: { attackPower: 40, defensePower: 0 },
        },
        starshipModules: modules,
        starship: {
          ...initial.run.space.starship,
          destinationSystemId: destination.id,
          phase: "orbiting",
          durationMs: 1_000,
          antimatterSpent: 1,
          travelDistanceLy: null,
        },
      },
    },
    permanent: {
      ...initial.permanent,
      blackHole: {
        ...initial.permanent.blackHole,
        discovered: true,
        researched: true,
        alwaysOn: true,
        power: 17,
        rechargeMultiplier: 0.1,
      },
    },
    statistics: { ...initial.statistics, lifetimeStarshipDistanceTravelled: 91.5 },
  };
}

function travelReadyState(): GameState {
  const initial = createInitialGameState({ pioneerName: "Starship Distance", seed: 822 });
  const modules = Object.fromEntries(
    STARSHIP_MODULE_IDS.map((id) => [id, { builtParts: STARSHIP_MODULES[id].parts }]),
  ) as GameState["run"]["space"]["starshipModules"];
  return {
    ...initial,
    run: {
      ...initial.run,
      clock: { ...initial.run.clock, wallNowMs: 0 },
      economy: {
        ...initial.run.economy,
        researchedTechnologies: [
          ...STARSHIP_MODULE_IDS.map((id) => STARSHIP_MODULES[id].technology),
          "FTLTravelTheory",
        ],
        revealedTechnologies: [
          ...STARSHIP_MODULE_IDS.map((id) => STARSHIP_MODULES[id].technology),
          "FTLTravelTheory",
        ],
      },
      space: {
        ...initial.run.space,
        starStudyRange: 200,
        antimatter: 1_000_000,
        antimatterUnlocked: true,
        starshipModules: modules,
      },
    },
  };
}

function encodeAsV42PortableSave(state: GameState): string {
  const current = makeEnvelope({
    slotId: "11111111-1111-4111-8111-111111111111",
    pioneerName: state.run.pioneerName,
    createdAt: 1,
    savedAt: 1,
    revision: 1,
    state,
  });
  const { checksum: _checksum, ...currentBody } = current;
  const { starshipDistanceTravelledThisRun: _runDistance, ...v42Space } = current.state.run.space;
  const { travelDistanceLy: _travelDistance, ...v42Starship } = current.state.run.space.starship;
  const { lifetimeStarshipDistanceTravelled: _lifetimeDistance, ...v42Statistics } =
    current.state.statistics;
  const v42State = {
    ...current.state,
    schemaVersion: 42,
    run: {
      ...current.state.run,
      space: { ...v42Space, starship: v42Starship },
    },
    statistics: v42Statistics,
  };
  const v42Body = { ...currentBody, schemaVersion: 42, state: v42State };
  return (
    PORTABLE_PREFIX +
    compressToEncodedURIComponent(
      canonicalJson({
        ...v42Body,
        checksum: checksumFor(v42Body as unknown as Parameters<typeof checksumFor>[0]),
      }),
    )
  );
}

function roundTripCurrentPortableSave(state: GameState): GameState {
  return decodePortable(
    encodePortable(
      makeEnvelope({
        slotId: "11111111-1111-4111-8111-111111111111",
        pioneerName: state.run.pioneerName,
        createdAt: 1,
        savedAt: 2,
        revision: 1,
        state,
      }),
    ),
  ).state;
}

describe("Interstellar Statistics selector", () => {
  it("returns safe empty values when no starship destination or encounter exists", () => {
    const initial = createInitialGameState({ pioneerName: "Empty Interstellar", seed: 820 });
    expect(selectInterstellarStatistics(initial)).toMatchObject({
      starStudyRange: 0,
      starshipBuilt: false,
      distanceTravelledThisRun: 0,
      distanceTravelledLifetime: 0,
      systemScanned: false,
      fleetAttackStrength: 0,
      envoy: 0,
      scout: 0,
      marauder: 0,
      landStalker: 0,
      navalStrafer: 0,
      enemyName: null,
      enemyDefenceRemaining: 0,
      blackHoleDiscovered: false,
      blackHoleAlwaysActive: false,
      blackHoleStrength: 5,
      apFromStarVoyage: 0,
    });
  });

  it("maps study, ship, fleet, encounter, Black Hole, distance scopes, and voyage AP", () => {
    const state = interstellarFixture();
    const encounter = state.run.space.systemEncounters[0]!;
    expect(isValidGameState(state)).toBe(true);
    expect(selectInterstellarStatistics(state)).toMatchObject({
      starStudyRange: 123.45,
      starshipBuilt: true,
      distanceTravelledThisRun: 42.75,
      distanceTravelledLifetime: 91.5,
      systemScanned: true,
      fleetAttackStrength: 100,
      envoy: 1,
      scout: 2,
      marauder: 3,
      landStalker: 4,
      navalStrafer: 5,
      enemyName: encounter.raceName,
      enemyDefenceRemaining: enemyFleetPower(encounter.enemyFleets),
      blackHoleDiscovered: true,
      blackHoleAlwaysActive: true,
      blackHoleStrength: 17,
      apFromStarVoyage: 19,
    });
  });

  it("tracks required Starship completion through launch and save, then resets on rebirth", () => {
    const fresh = createInitialGameState({ pioneerName: "Starship Built Scope", seed: 825 });
    expect(selectInterstellarStatistics(fresh).starshipBuilt).toBe(false);

    const fullyBuilt = travelReadyState();
    const ready: GameState = {
      ...fullyBuilt,
      run: {
        ...fullyBuilt.run,
        space: {
          ...fullyBuilt.run.space,
          starshipModules: {
            ...fullyBuilt.run.space.starshipModules,
            stellarScanner: { builtParts: 0 },
          },
        },
      },
    };
    expect(ready.run.space.starshipModules.stellarScanner.builtParts).toBe(0);
    expect(selectInterstellarStatistics(ready).starshipBuilt).toBe(true);

    const saved = decodePortable(
      encodePortable(
        makeEnvelope({
          slotId: "11111111-1111-4111-8111-111111111111",
          pioneerName: ready.run.pioneerName,
          createdAt: 1,
          savedAt: 1,
          revision: 1,
          state: ready,
        }),
      ),
    ).state;
    expect(selectInterstellarStatistics(saved).starshipBuilt).toBe(true);

    const destination = findStarByName(createStarCatalogue(), "Sirius")!;
    const selected = transition(saved, {
      type: "space.starship.destination.select",
      systemId: destination.id,
    });
    expect(selected.accepted).toBe(true);
    const launched = transition(selected.state, { type: "space.starship.launch" });
    expect(launched.accepted).toBe(true);
    expect(selectInterstellarStatistics(launched.state).starshipBuilt).toBe(true);

    const rebirthDestination = createStarCatalogue().find(
      (star) =>
        !star.initiallySettled &&
        star.id !== ready.run.space.currentSystemId &&
        !ready.permanent.settledSystemIds.includes(star.id),
    )!;
    const rebirthReady: GameState = {
      ...ready,
      run: {
        ...ready.run,
        space: { ...ready.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...ready.permanent,
        rebirthCount: 1,
        settledSystemIds: [...ready.permanent.settledSystemIds, rebirthDestination.id],
      },
    };
    const reborn = transition(rebirthReady, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(selectInterstellarStatistics(reborn.state).starshipBuilt).toBe(false);
  });

  it("credits the accepted route once after a shortened arrival and ignores duplicate completion", () => {
    const ready = travelReadyState();
    const destination = findStarByName(createStarCatalogue(), "Sirius")!;
    const plan = starshipTravelPlan(ready, destination.id);
    expect(plan).not.toBeNull();

    const selected = transition(ready, {
      type: "space.starship.destination.select",
      systemId: destination.id,
    });
    expect(selected.accepted).toBe(true);
    const launched = transition(selected.state, { type: "space.starship.launch" });
    expect(launched.accepted).toBe(true);
    expect(launched.state.run.space.starship.travelDistanceLy).toBe(plan!.distanceLy);
    expect(launched.state.run.space.starshipDistanceTravelledThisRun).toBe(0);
    expect(launched.state.statistics.lifetimeStarshipDistanceTravelled).toBe(0);
    const timerId = launched.state.run.space.starship.timerId!;

    const shortened = transition(launched.state, { type: "space.starship.travel.warp" });
    expect(shortened.accepted).toBe(true);
    expect(shortened.state.run.space.starship.travelDistanceLy).toBe(plan!.distanceLy);
    const baseline = transition(shortened.state, {
      type: "clock.advance",
      input: { wallNowMs: 1_000, foreground: true },
    });
    const arrived = transition(baseline.state, {
      type: "clock.advance",
      input: { wallNowMs: 1_500, foreground: true, timeWarpMultiplier: 4 },
    });
    const expectedDistance = Number(plan!.distanceLy.toFixed(2));
    expect(arrived.accepted).toBe(true);
    expect(arrived.state.run.space.starship.phase).toBe("orbiting");
    expect(arrived.state.run.space.starship.travelDistanceLy).toBeNull();
    expect(arrived.state.run.space.starshipDistanceTravelledThisRun).toBe(expectedDistance);
    expect(arrived.state.statistics.lifetimeStarshipDistanceTravelled).toBe(expectedDistance);
    expect(arrived.events.filter((event) => event.type === "space.starship.arrived")).toHaveLength(
      1,
    );

    const repeatedCompletion = transition(arrived.state, { type: "timer.complete", timerId });
    expect(repeatedCompletion.state.run.space.starshipDistanceTravelledThisRun).toBe(
      expectedDistance,
    );
    expect(repeatedCompletion.state.statistics.lifetimeStarshipDistanceTravelled).toBe(
      expectedDistance,
    );
    expect(repeatedCompletion.events).not.toContainEqual({
      type: "space.starship.arrived",
      systemId: destination.id,
    });
  });

  it("resets run distance at rebirth and retains lifetime distance", () => {
    const initial = createInitialGameState({ pioneerName: "Distance Rebirth", seed: 823 });
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    const ready: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: 500,
        researchPoints: 90_000,
        space: {
          ...initial.run.space,
          ascendencyAwardedThisRun: true,
          starshipDistanceTravelledThisRun: 12.5,
        },
      },
      permanent: {
        ...initial.permanent,
        rebirthCount: 1,
        ascendencyPoints: 80,
        settledSystemIds: [...initial.permanent.settledSystemIds, destination.id],
      },
      statistics: { ...initial.statistics, lifetimeStarshipDistanceTravelled: 62.5 },
    };

    expect(isValidGameState(ready)).toBe(true);
    const reborn = transition(ready, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(reborn.state.run.space.starshipDistanceTravelledThisRun).toBe(0);
    expect(reborn.state.statistics.lifetimeStarshipDistanceTravelled).toBe(62.5);
    expect(isValidGameState(reborn.state)).toBe(true);
  });

  it("round-trips current distance scopes in flight and after arrival before rebirth resets the run value", () => {
    const ready = travelReadyState();
    const destination = findStarByName(createStarCatalogue(), "Sirius")!;
    const plan = starshipTravelPlan(ready, destination.id);
    expect(plan).not.toBeNull();

    const selected = transition(ready, {
      type: "space.starship.destination.select",
      systemId: destination.id,
    });
    const launched = transition(selected.state, { type: "space.starship.launch" });
    expect(launched.accepted).toBe(true);
    const timerId = launched.state.run.space.starship.timerId!;
    const partialProgress = transition(launched.state, {
      type: "clock.advance",
      input: {
        wallNowMs: 1,
        foreground: true,
        offlineElapsedMs: Math.ceil((plan!.durationMs * 0.4) / OFFLINE_GAINS_RATE),
      },
    });
    const partialTimer = partialProgress.state.run.timers[timerId]!;
    expect(partialProgress.accepted).toBe(true);
    expect(partialTimer.elapsedMs).toBeGreaterThan(0);
    expect(partialTimer.elapsedMs).toBeLessThan(partialTimer.durationMs);

    // Cosmic Forge displays a positive partial distance in both columns here;
    // the remake's Statistics counters intentionally credit completed voyages only.
    const sourceStylePartialDistance = Number(
      ((plan!.distanceLy * partialTimer.elapsedMs) / partialTimer.durationMs).toFixed(2),
    );
    expect(sourceStylePartialDistance).toBeGreaterThan(0);
    expect(selectInterstellarStatistics(partialProgress.state)).toMatchObject({
      distanceTravelledThisRun: 0,
      distanceTravelledLifetime: 0,
    });

    const restoredInFlight = roundTripCurrentPortableSave(partialProgress.state);
    expect(restoredInFlight.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(restoredInFlight.run.space.starship.phase).toBe("travelling");
    expect(restoredInFlight.run.timers[timerId]?.elapsedMs).toBe(partialTimer.elapsedMs);
    expect(restoredInFlight.run.space.starship.travelDistanceLy).toBe(plan!.distanceLy);
    expect(selectInterstellarStatistics(restoredInFlight)).toMatchObject({
      distanceTravelledThisRun: 0,
      distanceTravelledLifetime: 0,
    });

    const arrived = transition(restoredInFlight, { type: "timer.complete", timerId });
    const expectedDistance = Number(plan!.distanceLy.toFixed(2));
    expect(arrived.accepted).toBe(true);
    expect(arrived.state.run.space.starship.phase).toBe("orbiting");
    expect(selectInterstellarStatistics(arrived.state)).toMatchObject({
      distanceTravelledThisRun: expectedDistance,
      distanceTravelledLifetime: expectedDistance,
    });
    const restoredArrival = roundTripCurrentPortableSave(arrived.state);
    expect(restoredArrival.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(selectInterstellarStatistics(restoredArrival)).toMatchObject({
      distanceTravelledThisRun: expectedDistance,
      distanceTravelledLifetime: expectedDistance,
    });

    const rebirthDestination = createStarCatalogue().find(
      (star) =>
        !star.initiallySettled &&
        star.id !== restoredArrival.run.space.currentSystemId &&
        !restoredArrival.permanent.settledSystemIds.includes(star.id),
    )!;
    const rebirthReady: GameState = {
      ...restoredArrival,
      run: {
        ...restoredArrival.run,
        space: { ...restoredArrival.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...restoredArrival.permanent,
        rebirthCount: 1,
        ascendencyPoints: 80,
        settledSystemIds: [...restoredArrival.permanent.settledSystemIds, rebirthDestination.id],
      },
    };
    expect(isValidGameState(rebirthReady)).toBe(true);
    const reborn = transition(rebirthReady, { type: "meta.rebirth" });
    expect(reborn.accepted).toBe(true);
    expect(selectInterstellarStatistics(reborn.state)).toMatchObject({
      distanceTravelledThisRun: 0,
      distanceTravelledLifetime: expectedDistance,
    });
  });
});

describe("Interstellar Statistics save migration", () => {
  it("initializes v42 route-distance history to zero without changing other saved state", () => {
    const initial = createInitialGameState({ pioneerName: "Distance Migration", seed: 824 });
    const migrated = decodePortable(
      encodeAsV42PortableSave({
        ...initial,
        run: {
          ...initial.run,
          cash: 765,
          researchPoints: 123,
          space: {
            ...initial.run.space,
            starStudyRange: 75,
            starshipDistanceTravelledThisRun: 18,
          },
        },
        statistics: { ...initial.statistics, lifetimeStarshipDistanceTravelled: 54 },
      }),
    );
    expect(migrated.schemaVersion).toBe(45);
    expect(migrated.state.schemaVersion).toBe(45);
    expect(migrated.state.run).toMatchObject({ cash: 765, researchPoints: 123 });
    expect(migrated.state.run.space).toMatchObject({
      starStudyRange: 75,
      starshipDistanceTravelledThisRun: 0,
      starship: { travelDistanceLy: null },
    });
    expect(migrated.state.statistics.lifetimeStarshipDistanceTravelled).toBe(0);
    expect(isValidGameState(migrated.state)).toBe(true);
  });

  it("restores a v42 in-flight route and credits its accepted distance once on arrival", () => {
    const ready = travelReadyState();
    const destination = findStarByName(createStarCatalogue(), "Sirius")!;
    const plan = starshipTravelPlan(ready, destination.id);
    expect(plan).not.toBeNull();

    const selected = transition(ready, {
      type: "space.starship.destination.select",
      systemId: destination.id,
    });
    expect(selected.accepted).toBe(true);
    const launched = transition(selected.state, { type: "space.starship.launch" });
    expect(launched.accepted).toBe(true);
    expect(launched.state.run.space.starship.travelDistanceLy).toBe(plan!.distanceLy);
    const timerId = launched.state.run.space.starship.timerId!;

    const migrated = decodePortable(encodeAsV42PortableSave(launched.state));
    expect(migrated.schemaVersion).toBe(45);
    expect(migrated.state.run.space.starship).toMatchObject({
      phase: "travelling",
      destinationSystemId: destination.id,
      timerId,
      travelDistanceLy: plan!.distanceLy,
    });
    expect(migrated.state.run.space.starshipDistanceTravelledThisRun).toBe(0);
    expect(migrated.state.statistics.lifetimeStarshipDistanceTravelled).toBe(0);
    expect(migrated.state.run.timers[timerId]).toMatchObject({
      status: "running",
      durationMs: plan!.durationMs,
      elapsedMs: 0,
    });
    expect(isValidGameState(migrated.state)).toBe(true);

    const arrived = transition(migrated.state, { type: "timer.complete", timerId });
    const expectedDistance = Number(plan!.distanceLy.toFixed(2));
    expect(arrived.accepted).toBe(true);
    expect(arrived.state.run.space.starship.phase).toBe("orbiting");
    expect(arrived.state.run.space.starshipDistanceTravelledThisRun).toBe(expectedDistance);
    expect(arrived.state.statistics.lifetimeStarshipDistanceTravelled).toBe(expectedDistance);
    expect(arrived.events.filter((event) => event.type === "space.starship.arrived")).toHaveLength(
      1,
    );

    const duplicateCompletion = transition(arrived.state, { type: "timer.complete", timerId });
    expect(duplicateCompletion.state.run.space.starshipDistanceTravelledThisRun).toBe(
      expectedDistance,
    );
    expect(duplicateCompletion.state.statistics.lifetimeStarshipDistanceTravelled).toBe(
      expectedDistance,
    );
    expect(duplicateCompletion.events).not.toContainEqual({
      type: "space.starship.arrived",
      systemId: destination.id,
    });
  });
});
