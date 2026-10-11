import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { autobuyerUpgradeId, systemIdForStar } from "../../src/content/ids";
import { RANDOM_EVENT_IDS, type RandomEventId } from "../../src/content/metaSignals";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { SettingsStatisticsPane } from "../../src/app/SettingsStatisticsPane";
import { transition } from "../../src/engine/commands";
import { createTimer, createTimerId } from "../../src/engine/timers";
import { forceRandomEvent } from "../../src/engine/randomEvents";
import { createInitialGameState, type GameState } from "../../src/engine/state";

function eligibleEventState(eventId: RandomEventId): GameState {
  const initial = createInitialGameState({ pioneerName: "Event Statistics", seed: 551 });
  let state = initial;
  const setUpgrade = (upgradeId: keyof GameState["run"]["upgrades"]) => {
    state = {
      ...state,
      run: { ...state.run, upgrades: { ...state.run.upgrades, [upgradeId]: 1 } },
    };
  };
  const setRocket = (phase: "outbound" | "mining", timerId: string | null = null) => {
    const rocket = state.run.space.rockets.rocket1!;
    state = {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          rockets: {
            ...state.run.space.rockets,
            rocket1: {
              ...rocket,
              phase,
              timerId,
              targetAsteroidId: phase === "mining" ? "event-statistics-asteroid" : null,
            },
          },
        },
      },
    };
  };

  switch (eventId) {
    case "powerPlantExplosion":
      setUpgrade("powerPlant1");
      break;
    case "batteryExplosion":
      setUpgrade("battery1");
      break;
    case "scienceTheft":
      state = { ...state, run: { ...state.run, researchPoints: 10 } };
      break;
    case "researchBreakthrough":
      break;
    case "rocketInstantArrival": {
      const timerId = createTimerId("travel", "random-event-statistics");
      setRocket("outbound", timerId);
      state = {
        ...state,
        run: {
          ...state.run,
          timers: {
            ...state.run.timers,
            [timerId]: createTimer({ id: timerId, durationMs: 1_000 }),
          },
        },
      };
      break;
    }
    case "starshipLostInSpace":
      state = {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            starship: {
              ...state.run.space.starship,
              phase: "travelling",
              destinationSystemId: systemIdForStar(551, 1),
            },
          },
        },
      };
      break;
    case "antimatterReaction":
    case "minerBrokeDown":
      setRocket("mining");
      break;
    case "stockLoss":
      state = {
        ...state,
        run: {
          ...state.run,
          unlockedResources: ["hydrogen"],
          goods: {
            ...state.run.goods,
            hydrogen: { ...state.run.goods.hydrogen, quantity: 50, storageCapacity: 100 },
          },
        },
      };
      break;
    case "galacticMarketLockdown":
      state = { ...state, permanent: { ...state.permanent, rebirthCount: 1 } };
      break;
    case "endlessSummer":
      break;
    case "supplyChainDisruption":
      setUpgrade(autobuyerUpgradeId("hydrogen", 1));
      state = { ...state, run: { ...state.run, unlockedResources: ["hydrogen"] } };
      break;
    case "blackHoleInstability":
      state = {
        ...state,
        permanent: {
          ...state.permanent,
          blackHole: { ...state.permanent.blackHole, discovered: true, researched: true },
        },
      };
      break;
  }

  return state;
}

describe("Random Events Statistics counters", () => {
  it.each(RANDOM_EVENT_IDS)(
    "increments both scopes once for %s after a successful trigger",
    (id) => {
      const before = eligibleEventState(id);
      const triggered = forceRandomEvent(before, id);

      expect(triggered).not.toBeNull();
      expect(triggered?.events).toContainEqual({
        type: "random-event.triggered",
        id,
        negative: expect.any(Boolean),
      });
      for (const eventId of RANDOM_EVENT_IDS) {
        const expected = eventId === id ? 1 : 0;
        expect(triggered?.state.run.randomEvents.eventCountsThisRun[eventId]).toBe(expected);
        expect(triggered?.state.statistics.lifetimeRandomEventCounts[eventId]).toBe(expected);
      }
    },
  );

  it("renders every source event row with its own current-run and lifetime values", () => {
    const initial = createInitialGameState({ pioneerName: "Event Statistics", seed: 551 });
    const currentRun = Object.fromEntries(
      RANDOM_EVENT_IDS.map((id, index) => [id, index + 1]),
    ) as GameState["run"]["randomEvents"]["eventCountsThisRun"];
    const lifetime = Object.fromEntries(
      RANDOM_EVENT_IDS.map((id, index) => [id, index + 21]),
    ) as GameState["statistics"]["lifetimeRandomEventCounts"];
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        randomEvents: { ...initial.run.randomEvents, eventCountsThisRun: currentRun },
      },
      statistics: { ...initial.statistics, lifetimeRandomEventCounts: lifetime },
    };
    const markup = renderToStaticMarkup(<SettingsStatisticsPane state={state} />);

    for (const [index, id] of RANDOM_EVENT_IDS.entries()) {
      const rowStart = markup.indexOf(`data-statistic-id="event-${id}"`);
      expect(rowStart).toBeGreaterThanOrEqual(0);
      const nextRowStart = markup.indexOf('data-statistic-id="event-', rowStart + 1);
      const row = markup.slice(rowStart, nextRowStart < 0 ? undefined : nextRowStart);
      expect(row).toContain(`<strong>${index + 1}</strong>`);
      expect(row).toContain(`<strong>${index + 21}</strong>`);
    }
  });

  it("resets every run counter on rebirth while retaining every lifetime counter", () => {
    const initial = createInitialGameState({ pioneerName: "Event Statistics", seed: 551 });
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    const currentRun = Object.fromEntries(
      RANDOM_EVENT_IDS.map((id, index) => [id, index + 1]),
    ) as GameState["run"]["randomEvents"]["eventCountsThisRun"];
    const lifetime = Object.fromEntries(
      RANDOM_EVENT_IDS.map((id, index) => [id, index + 31]),
    ) as GameState["statistics"]["lifetimeRandomEventCounts"];
    const readyToRebirth: GameState = {
      ...initial,
      run: {
        ...initial.run,
        randomEvents: { ...initial.run.randomEvents, eventCountsThisRun: currentRun },
        space: { ...initial.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...initial.permanent,
        settledSystemIds: [...initial.permanent.settledSystemIds, destination.id],
      },
      statistics: { ...initial.statistics, lifetimeRandomEventCounts: lifetime },
    };

    const reborn = transition(readyToRebirth, { type: "meta.rebirth" });

    expect(reborn.accepted).toBe(true);
    for (const id of RANDOM_EVENT_IDS) {
      expect(reborn.state.run.randomEvents.eventCountsThisRun[id]).toBe(0);
      expect(reborn.state.statistics.lifetimeRandomEventCounts[id]).toBe(lifetime[id]);
    }
  });
});
