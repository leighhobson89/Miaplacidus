import { describe, expect, it } from "vitest";
import {
  applyScheduledDebugNewsTicker,
  applyDebugScenario,
  DEBUG_TIMEWARP_DURATIONS_MS,
  DEBUG_TIMEWARP_MULTIPLIERS,
  type DebugScenarioOptions,
} from "../../src/app/testing/debugScenarioActions";
import { COMPOUND_IDS, ECONOMIC_GOOD_IDS, LOCALE_IDS, MATERIAL_IDS } from "../../src/content/ids";
import {
  PLAYER_FLEET_IDS,
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULE_IDS,
  STARSHIP_MODULES,
} from "../../src/content/space";
import { TECHNOLOGY_CATALOG } from "../../src/content/technology";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import { createGameStore } from "../../src/engine/store";
import { interstellarPaneItems } from "../../src/app/presentationNavigation";
import { advanceNewsTicker } from "../../src/engine/newsTicker";
import { reduceDebugScenarioCommand } from "../../src/app/testing/debugScenarioActions";

function initialState() {
  return createInitialGameState({ pioneerName: "Debug Scenario", seed: 314159 });
}

describe("development scenario actions", () => {
  it("publishes typed debug reductions through the existing store", () => {
    const state = initialState();
    const store = createGameStore(state, { clock: { now: () => 0 } });
    const existingStore = store;
    const previousSnapshot = store.getSnapshot();
    let publications = 0;
    store.subscribe(() => {
      publications += 1;
    });

    expect(store.dispatchReducer).toBeDefined();
    const result = store.dispatchReducer!((current) =>
      reduceDebugScenarioCommand(current, {
        type: "debug.scenario.apply",
        action: "give-1b",
      }),
    );

    expect(result.accepted).toBe(true);
    expect(store).toBe(existingStore);
    expect(store.getState()).toBe(result.state);
    expect(store.getState().run.cash).toBe(state.run.cash + 1_000_000_000);
    expect(store.getSnapshot().cash).toBe(state.run.cash + 1_000_000_000);
    expect(store.getSnapshot()).not.toBe(previousSnapshot);
    expect(publications).toBe(1);

    const committedState = store.getState();
    const invalidIdentity = store.dispatchReducer!((current) => ({
      accepted: true,
      state: {
        ...current,
        run: { ...current.run, pioneerName: "Different Pioneer" },
      },
      events: [],
    }));
    expect(invalidIdentity.accepted).toBe(false);
    expect(store.getState()).toBe(committedState);
    expect(publications).toBe(1);
  });

  it("keeps the homecoming continuation before settlement and Cosmic Rip unlock", () => {
    const state = initialState();
    const result = reduceDebugScenarioCommand(state, {
      type: "debug.scenario.homecoming-continuation",
    });

    expect(result.accepted).toBe(true);
    expect(isValidGameState(result.state)).toBe(true);
    expect(result.state.run.pioneerName).toBe(state.run.pioneerName);
    expect(result.state.run.space.ascendencyAwardedThisRun).toBe(false);
    expect(result.state.permanent.rebirthCount).toBeGreaterThan(0);
    expect(result.state.permanent.cosmicRip.unlocked).toBe(false);
    expect(result.state.permanent.cosmicRip.ripFound).toBe(false);
    expect(result.state.run.space.starship.phase).toBe("unlaunched");
    expect(interstellarPaneItems("en", result.state).map((item) => item.id)).not.toContain(
      "interstellar-colonise",
    );
  });

  it("changes only the selected locale and rejects an absent selection", () => {
    const state = initialState();
    for (const locale of LOCALE_IDS) {
      const next = applyDebugScenario(state, "set-language", { locale })!;
      expect(next.settings.locale).toBe(locale);
      expect(next.run).toBe(state.run);
      expect(next.permanent).toBe(state.permanent);
      expect(next.statistics).toBe(state.statistics);
    }
    expect(applyDebugScenario(state, "set-language")).toBeNull();
    expect(state.settings.locale).toBe("en");
  });

  it("sets the default warp and accepts each supported duration and multiplier", () => {
    const state = initialState();
    expect(applyDebugScenario(state, "timewarp")!.run.timeWarp).toEqual({
      multiplier: 50,
      remainingMs: 5_000,
    });
    for (const timewarpDurationMs of DEBUG_TIMEWARP_DURATIONS_MS) {
      for (const timewarpMultiplier of DEBUG_TIMEWARP_MULTIPLIERS) {
        expect(
          applyDebugScenario(state, "timewarp", { timewarpDurationMs, timewarpMultiplier })!.run
            .timeWarp,
        ).toEqual({ multiplier: timewarpMultiplier, remainingMs: timewarpDurationMs });
      }
    }
    for (const invalid of [{ timewarpDurationMs: 99 }, { timewarpMultiplier: 3 }]) {
      expect(applyDebugScenario(state, "timewarp", invalid as DebugScenarioOptions)).toBeNull();
    }
    expect(state.run.timeWarp).toEqual({ multiplier: 1, remainingMs: 0 });
  });

  it("distinguishes additive cash and research grants from the fixed cash reset", () => {
    const start = initialState();
    const state = { ...start, run: { ...start.run, cash: 375, researchPoints: 80 } };
    expect(applyDebugScenario(state, "give-1b")!.run.cash).toBe(1_000_000_375);
    expect(applyDebugScenario(state, "give-100")!.run.cash).toBe(100);
    expect(applyDebugScenario(state, "give-1m-research")!.run.researchPoints).toBe(1_000_080);
    expect(state.run.cash).toBe(375);
    expect(state.run.researchPoints).toBe(80);
  });

  it.each([
    ["give-1b-all-resources-compounds", 1_000_000_000],
    ["give-1m-all-resources-compounds", 1_000_000],
  ] as const)(
    "%s fills and reveals every economic good without mutating the input",
    (action, quantity) => {
      const state = initialState();
      const before = structuredClone(state);
      const next = applyDebugScenario(state, action)!;
      for (const id of ECONOMIC_GOOD_IDS) {
        expect(next.run.goods[id]).toMatchObject({ quantity, storageCapacity: quantity });
      }
      expect(next.run.unlockedResources).toEqual([...MATERIAL_IDS]);
      expect(next.run.economy.unlockedCompounds).toEqual([...COMPOUND_IDS]);
      expect(isValidGameState(next)).toBe(true);
      expect(state).toEqual(before);
    },
  );

  it("grants ordinary technologies once while preserving megastructure prerequisites", () => {
    const state = initialState();
    const next = applyDebugScenario(state, "grant-all-techs")!;
    for (const technology of TECHNOLOGY_CATALOG) {
      if (technology.special === "megastructure") {
        expect(next.run.economy.researchedTechnologies).not.toContain(technology.id);
      } else {
        expect(next.run.economy.researchedTechnologies).toContain(technology.id);
        expect(next.run.economy.revealedTechnologies).toContain(technology.id);
      }
    }
    const repeated = applyDebugScenario(next, "grant-all-techs")!;
    expect(repeated.run.economy.researchedTechnologies).toEqual(
      next.run.economy.researchedTechnologies,
    );
    expect(repeated.run.researchPoints).toBe(state.run.researchPoints + 2_000_000);
    expect(isValidGameState(next)).toBe(true);
  });

  it("clears weather severity and precipitation without changing the star", () => {
    const start = initialState();
    const state = {
      ...start,
      run: {
        ...start.run,
        space: {
          ...start.run.space,
          currentSystemWeather: "rain" as const,
          severeWeatherPeriodCount: 4,
          currentPrecipitationRate: 2,
        },
      },
    };
    const next = applyDebugScenario(state, "clear-weather")!;
    expect(next.run.space).toMatchObject({
      currentSystemWeather: "clear",
      severeWeatherPeriodCount: 0,
      currentPrecipitationRate: 0,
      currentSystemId: state.run.space.currentSystemId,
    });
    expect(state.run.space.currentPrecipitationRate).toBe(2);
  });

  it("records a selected event through normal event history and rejects missing event selection", () => {
    const state = initialState();
    expect(applyDebugScenario(state, "trigger-event")).toBeNull();
    const next = applyDebugScenario(state, "trigger-event", { eventId: "scienceTheft" })!;
    expect(next.run.randomEvents.history.at(-1)).toMatchObject({
      id: "scienceTheft",
      negative: true,
    });
    expect(next.statistics.lifetimeRandomEventCounts.scienceTheft).toBe(
      state.statistics.lifetimeRandomEventCounts.scienceTheft + 1,
    );
    expect(state.run.randomEvents.history).toHaveLength(0);
  });

  it("configures future news scheduling without forcing a ticker or changing its countdown", () => {
    const state = initialState();
    const options = {
      newsCategory: "wackyEffects",
      newsInterval: 20_000,
    } as const;
    const initialEntries = state.run.newsTicker.entries;
    const initialRemainingMs = state.run.newsTicker.remainingMs;
    expect(applyDebugScenario(state, "set-news-ticker", options)).toBe(state);
    expect(state.run.newsTicker.entries).toBe(initialEntries);
    expect(state.run.newsTicker.remainingMs).toBe(initialRemainingMs);
    expect(applyDebugScenario(state, "set-news-ticker", { newsCategory: "feedback" })).toBeNull();
    expect(applyDebugScenario(state, "set-news-ticker", { newsInterval: 5_000 })).toBeNull();

    const ordinarySchedule = advanceNewsTicker(state, initialRemainingMs).state;
    const configuredSchedule = applyScheduledDebugNewsTicker(state, ordinarySchedule, options);
    expect(configuredSchedule?.run.newsTicker.entries.at(-1)?.category).toBe("wacky");
    expect(configuredSchedule?.run.newsTicker.remainingMs).toBe(60_000);
    expect(applyScheduledDebugNewsTicker(state, state, options)).toBeNull();
  });

  it("prepares a valid starship launch state and generates reproducible asteroid discoveries", () => {
    const state = initialState();
    const before = structuredClone(state);
    const next = applyDebugScenario(state, "prepare-run-starship-launch")!;
    expect(next).toEqual(applyDebugScenario(state, "prepare-run-starship-launch"));
    expect(isValidGameState(next)).toBe(true);
    expect(next.run.space.launchPadBuilt).toBe(true);
    expect(next.run.space.telescopeBuilt).toBe(true);
    for (const id of ROCKET_IDS)
      expect(next.run.space.rockets[id].builtParts).toBe(ROCKET_PART_REQUIREMENTS[id]);
    for (const id of STARSHIP_MODULE_IDS)
      expect(next.run.space.starshipModules[id].builtParts).toBe(STARSHIP_MODULES[id].parts);
    for (const id of PLAYER_FLEET_IDS) expect(next.run.space.playerFleets[id]).toBeGreaterThan(0);
    expect(next.run.space.fleetEnvoyBuilt).toBe(true);
    expect(next.run.space.antimatter).toBe(state.run.space.antimatter + 80_000);
    expect(next.statistics.lifetimeAsteroidsDiscovered).toBe(
      state.statistics.lifetimeAsteroidsDiscovered + 10,
    );
    expect(next.run.space.asteroids).toHaveLength(10);
    expect(new Set(next.run.space.asteroids.map((asteroid) => asteroid.name)).size).toBe(10);
    expect(next.run.space.starStudyRange).toBeGreaterThan(state.run.space.starStudyRange);
    let fiveStarStudies = state;
    for (let count = 0; count < 5; count += 1)
      fiveStarStudies = applyDebugScenario(fiveStarStudies, "study-star")!;
    expect(next.run.space.starStudyRange).toBe(fiveStarStudies.run.space.starStudyRange);
    expect(next.run.space.systemProfiles).toEqual(fiveStarStudies.run.space.systemProfiles);
    expect(state).toEqual(before);
  });

  it("adds ten reproducible asteroids through the dedicated action", () => {
    const state = initialState();
    const before = structuredClone(state);
    const next = applyDebugScenario(state, "add-10-asteroids")!;

    expect(next).toEqual(applyDebugScenario(state, "add-10-asteroids"));
    expect(next.run.space.asteroids).toHaveLength(10);
    expect(new Set(next.run.space.asteroids.map((asteroid) => asteroid.name)).size).toBe(10);
    expect(next.statistics.lifetimeAsteroidsDiscovered).toBe(
      state.statistics.lifetimeAsteroidsDiscovered + 10,
    );
    expect(next.run.random).not.toEqual(state.run.random);
    expect(isValidGameState(next)).toBe(true);
    expect(state).toEqual(before);
  });

  it("builds the starship and researches its module technologies through the dedicated action", () => {
    const state = initialState();
    const before = structuredClone(state);
    const next = applyDebugScenario(state, "build-starship")!;

    for (const id of STARSHIP_MODULE_IDS) {
      expect(next.run.space.starshipModules[id].builtParts).toBe(STARSHIP_MODULES[id].parts);
      expect(next.run.economy.researchedTechnologies).toContain(STARSHIP_MODULES[id].technology);
    }
    expect(next.run.space.telescopeBuilt).toBe(true);
    expect(next.run.space.starship.phase).toBe(state.run.space.starship.phase);
    expect(isValidGameState(next)).toBe(true);
    expect(state).toEqual(before);
  });

  it("guards fleet grants until required starship modules are complete, regardless of the optional scanner", () => {
    const state = initialState();
    expect(applyDebugScenario(state, "add-fleets-envoy")).toBeNull();

    const requiredModulesComplete = {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          starshipModules: Object.fromEntries(
            STARSHIP_MODULE_IDS.map((id) => [
              id,
              {
                builtParts: STARSHIP_MODULES[id].requiredForTravel ? STARSHIP_MODULES[id].parts : 0,
              },
            ]),
          ) as typeof state.run.space.starshipModules,
        },
      },
    };
    expect(isValidGameState(requiredModulesComplete)).toBe(true);
    expect(requiredModulesComplete.run.space.starshipModules.stellarScanner.builtParts).toBe(0);

    const fleetGrant = applyDebugScenario(requiredModulesComplete, "add-fleets-envoy");
    expect(fleetGrant).not.toBeNull();
    expect(fleetGrant!.run.space.fleetEnvoyBuilt).toBe(true);
    for (const fleetId of PLAYER_FLEET_IDS) {
      expect(fleetGrant!.run.space.playerFleets[fleetId]).toBe(30);
    }

    const next = applyDebugScenario(state, "build-launch-pad-scanner-rockets")!;
    const repeated = applyDebugScenario(next, "build-launch-pad-scanner-rockets")!;
    expect(repeated.statistics.lifetimeRocketsBuilt).toBe(next.statistics.lifetimeRocketsBuilt);
  });

  it("unlocks all navigation prerequisites without granting every technology", () => {
    const state = initialState();
    const next = applyDebugScenario(state, "unlock-all-tabs")!;
    for (const id of [
      "basicPowerGeneration",
      "compounds",
      "stellarCartography",
      "atmosphericTelescopes",
    ]) {
      expect(next.run.economy.researchedTechnologies).toContain(id);
    }
    expect(next.run.economy.researchedTechnologies).not.toContain("rocketComposites");
    expect(next.run.space.ascendencyAwardedThisRun).toBe(true);
    expect(next.permanent.cosmicRip.unlocked).toBe(true);
    expect(isValidGameState(next)).toBe(true);
  });

  it("adds antimatter and studies five stars while choosing the first-run philosophy", () => {
    const state = initialState();
    const antimatter = applyDebugScenario(state, "gain-10000-antimatter")!;
    expect(antimatter.run.space.antimatter).toBe(state.run.space.antimatter + 10_000);
    expect(antimatter.run.space.antimatterUnlocked).toBe(true);
    const studied = applyDebugScenario(state, "study-star")!;
    expect(studied.run.space.starStudyRange).toBe(state.run.space.starStudyRange + 5);
    expect(studied.permanent.philosophyId).toBe("voidborn");
    expect(studied.run.philosophyChoicePending).toBe(false);
    const existingChoice = {
      ...state,
      permanent: { ...state.permanent, philosophyId: "voidborn" as const },
    };
    expect(applyDebugScenario(existingChoice, "study-star")!.permanent).toBe(
      existingChoice.permanent,
    );
  });

  it("adds permanent balances and refunds only tracked glory-point spending", () => {
    const start = initialState();
    const state = {
      ...start,
      permanent: { ...start.permanent, gloryPoints: 12 },
      statistics: { ...start.statistics, lifetimeGalacticPointsSpent: 45 },
    };
    const refunded = applyDebugScenario(state, "reset-gp-spent")!;
    expect(refunded.permanent.gloryPoints).toBe(57);
    expect(refunded.statistics.lifetimeGalacticPointsSpent).toBe(0);
    expect(applyDebugScenario(refunded, "reset-gp-spent")!.permanent.gloryPoints).toBe(57);
    expect(applyDebugScenario(state, "add-100-ap")!.permanent.ascendencyPoints).toBe(
      state.permanent.ascendencyPoints + 100,
    );
    expect(applyDebugScenario(state, "add-10000-cp")!.permanent.galacticCasino.casinoPoints).toBe(
      state.permanent.galacticCasino.casinoPoints + 10_000,
    );
  });

  it("leaves hold-to-gain state unchanged and explicitly rejects unfinished cinematics", () => {
    const state = initialState();
    expect(applyDebugScenario(state, "hold-enter-to-gain")).toBe(state);
    expect(applyDebugScenario(state, "play-miaplacidus-cinematic")).toBeNull();
    expect(applyDebugScenario(state, "play-end-game-cinematic")).toBeNull();
  });
});
