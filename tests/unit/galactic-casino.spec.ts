import { describe, expect, it } from "vitest";
import { ECONOMIC_GOOD_IDS, MATERIAL_IDS } from "../../src/content/ids";
import { createInitialCasinoState } from "../../src/content/galacticCasino";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import { transition } from "../../src/engine/commands";
import { createTimer, createTimerId } from "../../src/engine/timers";
import { nextRandom, nextRandomInteger } from "../../src/engine/random";
import { decodePortable, encodePortable } from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";

function casinoReadyState(seed = 45) {
  const base = createInitialGameState({ pioneerName: "Casino Pioneer", seed });
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((goodId) => [
      goodId,
      { ...base.run.goods[goodId], quantity: 1_000_000, storageCapacity: 2_000_000 },
    ]),
  ) as typeof base.run.goods;
  return {
    ...base,
    run: {
      ...base.run,
      cash: 1_000_000,
      researchPoints: 20_000,
      goods,
      unlockedResources: MATERIAL_IDS,
      economy: {
        ...base.run.economy,
        unlockedCompounds: ["water", "diesel", "glass", "steel", "concrete", "titanium"] as const,
      },
      space: { ...base.run.space, ascendencyAwardedThisRun: true, antimatter: 10 },
    },
    permanent: {
      ...base.permanent,
      rebirthCount: 1,
      galacticCasino: {
        ...createInitialCasinoState(),
        casinoPoints: 1_000,
        baseWinProbability: 0.4,
      },
    },
  };
}

function seedForWheelIndex(target: number): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    if (nextRandomInteger({ seed, draws: 0 }, 0, 15).value === target) return seed;
  }
  throw new Error("No matching wheel seed was found.");
}

function seedForFirstDrawMatch(max: number): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    const first = nextRandomInteger({ seed, draws: 0 }, 0, max);
    const second = nextRandomInteger(first.state, 0, max);
    if (first.value === second.value) return seed;
  }
  throw new Error("No matching Void Seer seed was found.");
}

function seedForDrawIndex(index: number, max: number): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    if (nextRandomInteger({ seed, draws: 0 }, 0, max).value === index) return seed;
  }
  throw new Error("No matching prize seed was found.");
}

function seedForDoubleOrNothingOutcome(won: boolean): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    if (nextRandom({ seed, draws: 0 }).value < 0.4 === won) return seed;
  }
  throw new Error("No matching Double or Nothing seed was found.");
}

function hiloDeck() {
  return [2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank, index) => ({
    rank,
    suit: (["clubs", "diamonds", "hearts", "spades"] as const)[index % 4]!,
  }));
}

describe("Galactic Casino economy and games", () => {
  it("requires the first AP award or an earlier rebirth to unlock casino actions", () => {
    const state = createInitialGameState({ seed: 5 });
    const blocked = transition(state, { type: "casino.wheel.spin" });
    expect(blocked.accepted).toBe(false);
    expect(blocked.failure?.code).toBe("casino-locked");
  });

  it("uses the source exchange values and exact-cost CP purchase settlement", () => {
    const base = casinoReadyState();
    const state = {
      ...base,
      run: { ...base.run, cash: 100_000 },
      permanent: {
        ...base.permanent,
        galacticCasino: { ...base.permanent.galacticCasino, casinoPoints: 0 },
      },
    };
    const result = transition(state, { type: "casino.points.buy", goodId: "cash", amount: 1 });
    expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
    // The fully stocked fixture earns $2,185 in resource and unlock achievements.
    expect(result.state.run.cash).toBe(2_185);
    expect(result.state.permanent.galacticCasino.casinoPoints).toBe(1);
    expect(
      transition(state, { type: "casino.points.buy", goodId: "cash", amount: 2 }).failure?.code,
    ).toBe("casino-insufficient-stock");
    expect(isValidGameState(result.state)).toBe(true);
  });

  it("settles Double or Nothing stakes atomically with the source 40% default", () => {
    const state = casinoReadyState(33);
    const replay = transition(state, { type: "casino.double-or-nothing.play", stake: 25 });
    const replayAgain = transition(state, { type: "casino.double-or-nothing.play", stake: 25 });
    expect(replay.accepted).toBe(true);
    expect(replay.state).toEqual(replayAgain.state);
    expect(replay.state.permanent.galacticCasino.baseWinProbability).toBe(0.4);
    expect(replay.state.run.casinoStats.doubleOrNothingPlayed).toBe(1);
    expect(replay.state.permanent.galacticCasino.lifetimeStats.cpSpent).toBe(25);
    const event = replay.events.find((entry) => entry.type === "casino.game.played");
    expect(event?.type).toBe("casino.game.played");
    if (event?.type === "casino.game.played" && event.result === "win")
      expect(replay.state.permanent.galacticCasino.casinoPoints).toBe(1_025);
    else expect(replay.state.permanent.galacticCasino.casinoPoints).toBe(975);
    expect(replay.state.permanent.galacticCasino.history.at(-1)?.result).toMatch(/^(win|loss)$/);
    const win = transition(casinoReadyState(seedForDoubleOrNothingOutcome(true)), {
      type: "casino.double-or-nothing.play",
      stake: 25,
    });
    const loss = transition(casinoReadyState(seedForDoubleOrNothingOutcome(false)), {
      type: "casino.double-or-nothing.play",
      stake: 25,
    });
    expect(win.events).toContainEqual(
      expect.objectContaining({ type: "casino.game.played", result: "win" }),
    );
    expect(loss.events).toContainEqual(
      expect.objectContaining({ type: "casino.game.played", result: "loss" }),
    );
  });

  it("rejects each paid game when the CP wallet cannot cover its entry cost", () => {
    const base = casinoReadyState();
    const state = {
      ...base,
      permanent: {
        ...base.permanent,
        galacticCasino: { ...base.permanent.galacticCasino, casinoPoints: 0 },
      },
    };
    const actions = [
      { type: "casino.double-or-nothing.play", stake: 1 },
      { type: "casino.wheel.spin" },
      { type: "casino.higher-lower.start" },
      { type: "casino.void-seer.play", tier: 1 },
    ] as const;
    for (const action of actions) {
      const result = transition(state, action);
      expect(result.accepted).toBe(false);
      expect(result.failure?.code).toBe("casino-insufficient-cp");
    }
  });

  it("persists a special Wheel result, blocks another spin and claims a selected award once", () => {
    const state = casinoReadyState(seedForWheelIndex(0));
    const spun = transition(state, { type: "casino.wheel.spin" });
    expect(spun.accepted).toBe(true);
    expect(spun.state.permanent.galacticCasino.wheelSpecialPending).toBe(true);
    expect(transition(spun.state, { type: "casino.wheel.spin" }).failure?.code).toBe(
      "casino-wheel-prize-pending",
    );
    const claimed = transition(spun.state, { type: "casino.wheel.claim", prize: "special_100cp" });
    expect(claimed.accepted).toBe(true);
    expect(claimed.state.permanent.galacticCasino.casinoPoints).toBe(1_099);
    expect(claimed.state.permanent.galacticCasino.wheelSpecialPending).toBe(false);
    expect(claimed.state.run.casinoStats.wheelSpecialWon).toBe(1);
    expect(claimed.state.permanent.galacticCasino.history.at(-1)?.result).toBe(
      "special:special_100cp",
    );
    const duplicate = transition(claimed.state, {
      type: "casino.wheel.claim",
      prize: "special_100cp",
    });
    expect(duplicate.accepted).toBe(false);
    expect(duplicate.failure?.code).toBe("casino-wheel-no-prize-pending");
    expect(duplicate.state.permanent.galacticCasino.casinoPoints).toBe(1_099);
  });

  it("matches the 16 Wheel sectors: one special, eight losses and seven ordinary prizes", () => {
    const results = Array.from({ length: 16 }, (_, sector) => {
      const state = casinoReadyState(seedForWheelIndex(sector));
      const result = transition(state, { type: "casino.wheel.spin" });
      const event = result.events.find((entry) => entry.type === "casino.game.played");
      return event?.type === "casino.game.played" ? event.result : "missing";
    });
    expect(results.filter((result) => result === "special-ready")).toHaveLength(1);
    expect(results.filter((result) => result === "loss")).toHaveLength(8);
    expect(
      results.filter((result) => result !== "special-ready" && result !== "loss"),
    ).toHaveLength(7);
  });

  it("saves the Higher or Lower deck, charges once and settles a three-card cash-out", () => {
    const state = casinoReadyState(90);
    const started = transition(state, { type: "casino.higher-lower.start" });
    expect(started.accepted).toBe(true);
    expect(started.state.permanent.galacticCasino.casinoPoints).toBe(995);
    const round = started.state.permanent.galacticCasino.higherLower!;
    expect(round.deck).toHaveLength(9);
    expect(
      round.deck.every((card, index) => index === 0 || card.rank !== round.deck[index - 1]!.rank),
    ).toBe(true);
    const envelope = makeEnvelope({
      slotId: "c0000000-0000-4000-8000-000000000001",
      pioneerName: "Casino Pioneer",
      createdAt: 1,
      savedAt: 1,
      revision: 1,
      state: started.state,
    });
    const restored = decodePortable(encodePortable(envelope));
    expect(restored.state.permanent.galacticCasino.higherLower).toEqual(round);
    let current = restored.state;
    for (let guesses = 0; guesses < 2; guesses += 1) {
      const active = current.permanent.galacticCasino.higherLower!;
      const from = active.deck[active.index]!.rank;
      const to = active.deck[active.index + 1]!.rank;
      const direction = to > from ? "higher" : "lower";
      const result = transition(current, { type: "casino.higher-lower.guess", direction });
      expect(result.accepted).toBe(true);
      current = result.state;
    }
    expect(current.permanent.galacticCasino.higherLower?.index).toBe(2);
    expect(current.permanent.galacticCasino.higherLower?.prizeKey).toBeTruthy();
    const cashedOut = transition(current, { type: "casino.higher-lower.cash-out" });
    expect(cashedOut.accepted).toBe(true);
    expect(cashedOut.state.permanent.galacticCasino.higherLower).toBeNull();
    expect(cashedOut.state.run.casinoStats.higherLowerPlayed).toBe(1);
    expect(cashedOut.state.permanent.galacticCasino.history.at(-1)?.gameId).toBe("higherLower");
    expect(isValidGameState(cashedOut.state)).toBe(true);
  });

  it("ends Higher or Lower on a wrong guess and forfeits the single entry stake", () => {
    const state = casinoReadyState(90);
    const started = transition(state, { type: "casino.higher-lower.start" });
    const round = started.state.permanent.galacticCasino.higherLower!;
    const current = round.deck[0]!.rank;
    const next = round.deck[1]!.rank;
    const wrongDirection = next > current ? "lower" : "higher";
    const lost = transition(started.state, {
      type: "casino.higher-lower.guess",
      direction: wrongDirection,
    });
    expect(lost.accepted).toBe(true);
    expect(lost.state.permanent.galacticCasino.casinoPoints).toBe(995);
    expect(lost.state.permanent.galacticCasino.higherLower).toBeNull();
    expect(lost.state.permanent.galacticCasino.history.at(-1)).toMatchObject({
      result: "loss",
      cpSpent: 5,
    });
    expect(lost.state.run.casinoStats.higherLowerWon).toBe(0);
  });

  it("uses the source 20 CP fallback for a locked Higher or Lower double-stock prize", () => {
    const base = casinoReadyState();
    const state = {
      ...base,
      run: {
        ...base.run,
        unlockedResources: MATERIAL_IDS.filter((id) => id !== "helium"),
        casinoStats: { ...base.run.casinoStats, higherLowerPlayed: 1 },
      },
      permanent: {
        ...base.permanent,
        galacticCasino: {
          ...base.permanent.galacticCasino,
          casinoPoints: 42,
          higherLower: { deck: hiloDeck(), index: 2, prizeKey: "special_double_helium" },
          lifetimeStats: { ...base.permanent.galacticCasino.lifetimeStats, higherLowerPlayed: 1 },
        },
      },
    };
    const result = transition(state, { type: "casino.higher-lower.cash-out" });
    expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
    expect(result.state.permanent.galacticCasino.casinoPoints).toBe(62);
    expect(result.state.permanent.galacticCasino.history.at(-1)).toMatchObject({ cpAwarded: 20 });
  });

  it("awards the tier-seven 150 CP fallback when a telescope finish is no longer available", () => {
    const base = casinoReadyState(seedForDrawIndex(2, 4));
    const state = {
      ...base,
      run: { ...base.run, casinoStats: { ...base.run.casinoStats, higherLowerPlayed: 1 } },
      permanent: {
        ...base.permanent,
        galacticCasino: {
          ...base.permanent.galacticCasino,
          casinoPoints: 42,
          higherLower: { deck: hiloDeck(), index: 7, prizeKey: "hilo_cp_100" },
          lifetimeStats: { ...base.permanent.galacticCasino.lifetimeStats, higherLowerPlayed: 1 },
        },
      },
    };
    const result = transition(state, { type: "casino.higher-lower.guess", direction: "higher" });
    expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
    expect(result.state.permanent.galacticCasino.casinoPoints).toBe(192);
    expect(result.state.permanent.galacticCasino.history.at(-1)).toMatchObject({ cpAwarded: 150 });
    expect(result.state.run.casinoStats.higherLowerWon).toBe(1);
  });

  it("records a deterministic Void Seer match and applies its long-run antimatter award", () => {
    const state = casinoReadyState(seedForFirstDrawMatch(12));
    const result = transition(state, { type: "casino.void-seer.play", tier: 3 });
    expect(result.accepted).toBe(true);
    const event = result.events.find((entry) => entry.type === "casino.void-seer.result");
    expect(event?.type).toBe("casino.void-seer.result");
    if (event?.type === "casino.void-seer.result") expect(event.won).toBe(true);
    expect(result.state.run.space.antimatter).toBeGreaterThan(10);
    expect(result.state.permanent.galacticCasino.casinoPoints).toBe(985);
    expect(result.state.run.casinoStats.voidSeerWon).toBe(1);
  });

  it("routes special telescope finishes through the ordinary timer completion effects", () => {
    const base = casinoReadyState(seedForWheelIndex(0));
    const timerId = createTimerId("survey", "asteroid-scan");
    const ready = {
      ...base,
      run: {
        ...base.run,
        timers: {
          ...base.run.timers,
          [timerId]: createTimer({ id: timerId, domain: "survey", durationMs: 10_000 }),
        },
        space: { ...base.run.space, telescopeBuilt: true, activeSurvey: "asteroids" as const },
      },
    };
    expect(isValidGameState(ready)).toBe(true);
    const spun = transition(ready, { type: "casino.wheel.spin" });
    expect(spun.accepted).toBe(true);
    expect(spun.state.permanent.galacticCasino.wheelSpecialPending).toBe(true);
    const result = transition(spun.state, {
      type: "casino.wheel.claim",
      prize: "special_telescope_finish_asteroid_search",
    });
    expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
    expect(result.state.run.timers[timerId]?.status).toBe("complete");
    expect(result.state.run.space.activeSurvey).toBeNull();
    expect(result.state.statistics.completedTimers).toBe(1);
    expect(isValidGameState(result.state)).toBe(true);
  });
});
