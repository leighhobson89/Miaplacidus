import { describe, expect, it } from "vitest";
import { COMPOUND_IDS, ECONOMIC_GOOD_IDS, MATERIAL_IDS } from "../../src/content/ids";
import {
  createInitialCasinoRunStats,
  createInitialCasinoState,
  HIGHER_LOWER_PRIZE_TIERS,
  type CasinoLifetimeStats,
  type CasinoRunStats,
} from "../../src/content/galacticCasino";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { transition } from "../../src/engine/commands";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { nextRandom, nextRandomInteger } from "../../src/engine/random";
import {
  decodeLocal,
  decodePortable,
  encodeLocal,
  encodePortable,
} from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";

const COUNTER_KEYS = [
  "cpSpent",
  "doubleOrNothingPlayed",
  "doubleOrNothingWon",
  "wheelPlayed",
  "wheelWon",
  "wheelSpecialWon",
  "higherLowerPlayed",
  "higherLowerWon",
  "voidSeerPlayed",
  "voidSeerWon",
] as const satisfies readonly (keyof CasinoLifetimeStats)[];

type CounterKey = (typeof COUNTER_KEYS)[number];
type CounterDeltas = Partial<Record<CounterKey, number>>;

function casinoReadyState(seed = 45): GameState {
  const base = createInitialGameState({ pioneerName: "Casino Statistics", seed });
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
      economy: { ...base.run.economy, unlockedCompounds: COMPOUND_IDS },
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

function statsAt(offset: number): CasinoLifetimeStats {
  return {
    cpSpent: offset,
    doubleOrNothingPlayed: offset + 1,
    doubleOrNothingWon: offset,
    wheelPlayed: offset + 2,
    wheelWon: offset + 1,
    wheelSpecialWon: offset,
    higherLowerPlayed: offset + 3,
    higherLowerWon: offset + 2,
    voidSeerPlayed: offset + 4,
    voidSeerWon: offset + 1,
  };
}

function withCounterBaselines(state: GameState): GameState {
  const runStats = statsAt(1);
  const lifetimeStats = statsAt(101);
  return {
    ...state,
    run: { ...state.run, casinoStats: runStats },
    permanent: {
      ...state.permanent,
      galacticCasino: { ...state.permanent.galacticCasino, lifetimeStats },
    },
  };
}

function expectCounterDeltas(before: GameState, after: GameState, deltas: CounterDeltas): void {
  const expectedRun: CasinoRunStats = { ...before.run.casinoStats };
  const expectedLifetime: CasinoLifetimeStats = {
    ...before.permanent.galacticCasino.lifetimeStats,
  };
  for (const key of COUNTER_KEYS) {
    const delta = deltas[key] ?? 0;
    expectedRun[key] += delta;
    expectedLifetime[key] += delta;
  }
  expect(after.run.casinoStats).toEqual(expectedRun);
  expect(after.permanent.galacticCasino.lifetimeStats).toEqual(expectedLifetime);
}

function seedForWheelSector(sector: number): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    if (nextRandomInteger({ seed, draws: 0 }, 0, 15).value === sector) return seed;
  }
  throw new Error(`No matching Wheel sector was found: ${sector}`);
}

function seedForDoubleOrNothingOutcome(won: boolean): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    if (nextRandom({ seed, draws: 0 }).value < 0.4 === won) return seed;
  }
  throw new Error(`No matching Double or Nothing result was found: ${won}`);
}

function seedForPrizeIndex(index: number, max: number): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    if (nextRandomInteger({ seed, draws: 0 }, 0, max).value === index) return seed;
  }
  throw new Error(`No matching prize index was found: ${index}`);
}

function seedForVoidSeerOutcome(won: boolean): number {
  for (let seed = 0; seed < 100_000; seed += 1) {
    const first = nextRandomInteger({ seed, draws: 0 }, 0, 6);
    const second = nextRandomInteger(first.state, 0, 6);
    if ((first.value === second.value) === won) return seed;
  }
  throw new Error(`No matching Void Seer result was found: ${won}`);
}

function hiloDeck() {
  return [2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank, index) => ({
    rank,
    suit: (["clubs", "diamonds", "hearts", "spades"] as const)[index % 4]!,
  }));
}

function hiloDirection(state: GameState): "higher" | "lower" {
  const round = state.permanent.galacticCasino.higherLower!;
  return round.deck[round.index + 1]!.rank > round.deck[round.index]!.rank ? "higher" : "lower";
}

describe("Galactic Casino current-run and lifetime counters", () => {
  it("adds exact paired deltas for accepted Double or Nothing wins and losses", () => {
    for (const won of [true, false]) {
      const before = withCounterBaselines(casinoReadyState(seedForDoubleOrNothingOutcome(won)));
      const result = transition(before, { type: "casino.double-or-nothing.play", stake: 7 });
      expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
      expectCounterDeltas(before, result.state, {
        cpSpent: 7,
        doubleOrNothingPlayed: 1,
        ...(won ? { doubleOrNothingWon: 1 } : {}),
      });
    }
  });

  it("counts Wheel entry, outcome, and claimed special as separate exact deltas", () => {
    const lossBefore = withCounterBaselines(casinoReadyState(seedForWheelSector(1)));
    const loss = transition(lossBefore, { type: "casino.wheel.spin" });
    expect(loss.accepted, JSON.stringify(loss.failure)).toBe(true);
    expectCounterDeltas(lossBefore, loss.state, { cpSpent: 1, wheelPlayed: 1 });

    const regularBefore = withCounterBaselines(casinoReadyState(seedForWheelSector(2)));
    const regular = transition(regularBefore, { type: "casino.wheel.spin" });
    expect(regular.accepted, JSON.stringify(regular.failure)).toBe(true);
    expectCounterDeltas(regularBefore, regular.state, {
      cpSpent: 1,
      wheelPlayed: 1,
      wheelWon: 1,
    });

    const specialBefore = withCounterBaselines(casinoReadyState(seedForWheelSector(0)));
    const specialReady = transition(specialBefore, { type: "casino.wheel.spin" });
    expect(specialReady.accepted, JSON.stringify(specialReady.failure)).toBe(true);
    expectCounterDeltas(specialBefore, specialReady.state, {
      cpSpent: 1,
      wheelPlayed: 1,
      wheelWon: 1,
    });
    const claimed = transition(specialReady.state, {
      type: "casino.wheel.claim",
      prize: "special_100cp",
    });
    expect(claimed.accepted, JSON.stringify(claimed.failure)).toBe(true);
    expectCounterDeltas(specialReady.state, claimed.state, { wheelSpecialWon: 1 });
  });

  it("records Higher or Lower entry once and counts only paid winning exits", () => {
    const lossBefore = withCounterBaselines(casinoReadyState(93));
    const started = transition(lossBefore, { type: "casino.higher-lower.start" });
    expect(started.accepted, JSON.stringify(started.failure)).toBe(true);
    expectCounterDeltas(lossBefore, started.state, { cpSpent: 5, higherLowerPlayed: 1 });
    const correct = hiloDirection(started.state);
    const lost = transition(started.state, {
      type: "casino.higher-lower.guess",
      direction: correct === "higher" ? "lower" : "higher",
    });
    expect(lost.accepted, JSON.stringify(lost.failure)).toBe(true);
    expectCounterDeltas(started.state, lost.state, {});

    const cashOutBefore = withCounterBaselines(casinoReadyState(137));
    let round = transition(cashOutBefore, { type: "casino.higher-lower.start" });
    expect(round.accepted, JSON.stringify(round.failure)).toBe(true);
    for (let guess = 0; guess < 2; guess += 1) {
      round = transition(round.state, {
        type: "casino.higher-lower.guess",
        direction: hiloDirection(round.state),
      });
      expect(round.accepted, JSON.stringify(round.failure)).toBe(true);
    }
    expect(round.state.permanent.galacticCasino.higherLower?.index).toBe(2);
    const cashOut = transition(round.state, { type: "casino.higher-lower.cash-out" });
    expect(cashOut.accepted, JSON.stringify(cashOut.failure)).toBe(true);
    expectCounterDeltas(cashOutBefore, cashOut.state, {
      cpSpent: 5,
      higherLowerPlayed: 1,
      higherLowerWon: 1,
    });
  });

  it("counts one Higher or Lower win for each accepted tier-seven prize or fallback", () => {
    for (const [prizeIndex, prizeKey] of HIGHER_LOWER_PRIZE_TIERS[7]!.entries()) {
      const seed = seedForPrizeIndex(prizeIndex, HIGHER_LOWER_PRIZE_TIERS[7]!.length - 1);
      const before = withCounterBaselines(casinoReadyState(seed));
      const active = {
        ...before,
        run: { ...before.run, random: { ...before.run.random, seed, draws: 0 } },
        permanent: {
          ...before.permanent,
          galacticCasino: {
            ...before.permanent.galacticCasino,
            higherLower: { deck: hiloDeck(), index: 7, prizeKey: "hilo_cp_100" },
          },
        },
      };
      expect(isValidGameState(active), prizeKey).toBe(true);
      const result = transition(active, {
        type: "casino.higher-lower.guess",
        direction: "higher",
      });
      expect(result.accepted, `${prizeKey}: ${JSON.stringify(result.failure)}`).toBe(true);
      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: "casino.higher-lower.revealed",
          outcome: expect.objectContaining({ prizeKey, won: true }),
        }),
      );
      expectCounterDeltas(active, result.state, { higherLowerWon: 1 });
    }
  });

  it("adds exact paired Void Seer deltas for accepted matches and misses", () => {
    for (const won of [true, false]) {
      const before = withCounterBaselines(casinoReadyState(seedForVoidSeerOutcome(won)));
      const result = transition(before, { type: "casino.void-seer.play", tier: 2 });
      expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
      expectCounterDeltas(before, result.state, {
        cpSpent: 10,
        voidSeerPlayed: 1,
        ...(won ? { voidSeerWon: 1 } : {}),
      });
    }
  });

  it("does not count unaccepted games or CP conversion as Casino spending", () => {
    const before = withCounterBaselines(casinoReadyState());
    const bought = transition(before, { type: "casino.points.buy", goodId: "cash", amount: 1 });
    expect(bought.accepted, JSON.stringify(bought.failure)).toBe(true);
    expectCounterDeltas(before, bought.state, {});

    const emptyWallet = {
      ...before,
      permanent: {
        ...before.permanent,
        galacticCasino: { ...before.permanent.galacticCasino, casinoPoints: 0 },
      },
    };
    for (const command of [
      { type: "casino.double-or-nothing.play", stake: 1 },
      { type: "casino.wheel.spin" },
      { type: "casino.higher-lower.start" },
      { type: "casino.void-seer.play", tier: 1 },
    ] as const) {
      const rejected = transition(emptyWallet, command);
      expect(rejected.accepted).toBe(false);
      expectCounterDeltas(emptyWallet, rejected.state, {});
    }
  });

  it("roundtrips every counter and resets only the current-run map on rebirth", () => {
    const counters = withCounterBaselines(casinoReadyState(181));
    const destination = createStarCatalogue().find((star) => !star.initiallySettled)!;
    const ready = {
      ...counters,
      run: {
        ...counters.run,
        cash: 500,
        researchPoints: 90_000,
        space: { ...counters.run.space, ascendencyAwardedThisRun: true },
      },
      permanent: {
        ...counters.permanent,
        rebirthCount: 1,
        settledSystemIds: [...counters.permanent.settledSystemIds, destination.id],
      },
    };
    expect(isValidGameState(ready)).toBe(true);
    const envelope = makeEnvelope({
      slotId: "c0000000-0000-4000-8000-000000000055",
      pioneerName: ready.run.pioneerName,
      createdAt: 1,
      savedAt: 2,
      revision: 1,
      state: ready,
    });
    const local = decodeLocal(encodeLocal(envelope)).state;
    const portable = decodePortable(encodePortable(envelope)).state;
    for (const restored of [local, portable]) {
      expect(restored.run.casinoStats).toEqual(ready.run.casinoStats);
      expect(restored.permanent.galacticCasino.lifetimeStats).toEqual(
        ready.permanent.galacticCasino.lifetimeStats,
      );
    }

    const reborn = transition(local, { type: "meta.rebirth" });
    expect(reborn.accepted, JSON.stringify(reborn.failure)).toBe(true);
    expect(reborn.state.run.casinoStats).toEqual(createInitialCasinoRunStats());
    expect(reborn.state.permanent.galacticCasino.lifetimeStats).toEqual(
      ready.permanent.galacticCasino.lifetimeStats,
    );
  });
});
