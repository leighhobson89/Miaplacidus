import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  isEconomicGoodId,
  type EconomicGoodId,
} from "../content/ids";
import {
  MANUSCRIPT_CLUE_NEWS_IDS,
  NEWS_CATEGORIES,
  PRIZE_NEWS_IDS,
  WACKY_NEWS_IDS,
  type NewsCategory,
} from "../content/metaSignals";
import { nextRandom, nextRandomInteger } from "./random";
import { addLifetimeCount } from "./statistics";
import type { GameState } from "./state";

const NEWS_GOODS: readonly EconomicGoodId[] = [
  "hydrogen",
  "helium",
  "carbon",
  "neon",
  "oxygen",
  "sodium",
  "silicon",
  "iron",
  "diesel",
  "glass",
  "steel",
  "concrete",
  "titanium",
  "water",
];
const ONE_OFF_IDS = Array.from({ length: 14 }, (_, index) => 3000 + index);
const MANUSCRIPT_CLUE_CHANCE = 0.25;

export type NewsTickerEvent =
  | { readonly type: "news.ticker.created"; readonly id: number; readonly category: NewsCategory }
  | { readonly type: "news.wacky.activated"; readonly id: number }
  | {
      readonly type: "news.prize.claimed";
      readonly id: number;
      readonly goodId: EconomicGoodId;
      readonly amount: number;
    }
  | { readonly type: "news.one-off.claimed"; readonly id: number };

function isUnlocked(state: GameState, goodId: EconomicGoodId): boolean {
  return MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number])
    ? state.run.unlockedResources.includes(goodId as (typeof MATERIAL_IDS)[number])
    : state.run.economy.unlockedCompounds.includes(goodId as (typeof COMPOUND_IDS)[number]);
}

function randomIndex(
  state: GameState,
  length: number,
): { readonly state: GameState; readonly index: number } {
  const draw = nextRandomInteger(state.run.random, 0, length - 1);
  return { state: { ...state, run: { ...state.run, random: draw.state } }, index: draw.value };
}

function availableFor(state: GameState, category: NewsCategory): readonly number[] {
  if (category === "wacky") return WACKY_NEWS_IDS;
  if (category === "prize")
    return PRIZE_NEWS_IDS.filter((id) => {
      const goodId = NEWS_GOODS[id - 2000];
      return (
        !!goodId &&
        isUnlocked(state, goodId) &&
        state.run.goods[goodId].quantity < state.run.goods[goodId].storageCapacity
      );
    });
  if (category === "oneOff")
    return ONE_OFF_IDS.filter((id) => !state.run.newsTicker.claimedPrizeIds.includes(id));
  if (category === "manuscriptClue")
    return MANUSCRIPT_CLUE_NEWS_IDS.filter(
      (id) =>
        !state.run.newsTicker.seenIds.includes(id) &&
        state.permanent.megastructures.ancientManuscripts.some((record) => !record.reported),
    );
  return Array.from({ length: 200 }, (_, index) => index).filter(
    (id) => !state.run.newsTicker.seenIds.includes(id),
  );
}

function selectCategory(state: GameState): {
  readonly state: GameState;
  readonly category: NewsCategory;
} {
  const categoryRoll = nextRandom(state.run.random);
  let next = { ...state, run: { ...state.run, random: categoryRoll.state } };
  let category: NewsCategory =
    categoryRoll.value < 0.03
      ? "oneOff"
      : categoryRoll.value < 0.13
        ? "prize"
        : categoryRoll.value < 0.28
          ? "wacky"
          : "headline";
  if (category === "headline") {
    const clueRoll = nextRandom(next.run.random);
    next = { ...next, run: { ...next.run, random: clueRoll.state } };
    if (clueRoll.value < MANUSCRIPT_CLUE_CHANCE && availableFor(next, "manuscriptClue").length > 0)
      category = "manuscriptClue";
  }
  if (availableFor(next, category).length === 0) category = "headline";
  return { state: next, category };
}

export function forceNewsTicker(state: GameState, category?: NewsCategory, requestedId?: number) {
  if (category !== undefined && !NEWS_CATEGORIES.includes(category)) return null;
  let next = state;
  let selectedCategory = category;
  if (!selectedCategory) {
    const picked = selectCategory(next);
    next = picked.state;
    selectedCategory = picked.category;
  }
  const available = availableFor(next, selectedCategory);
  if (available.length === 0) return null;
  let chosenId: number;
  if (requestedId !== undefined) {
    if (!available.includes(requestedId)) return null;
    chosenId = requestedId;
  } else {
    const draw = randomIndex(next, available.length);
    next = draw.state;
    chosenId = available[draw.index]!;
  }
  const goodId = selectedCategory === "prize" ? NEWS_GOODS[chosenId - 2000]! : null;
  let prizeAmount: number | null = null;
  if (goodId) {
    const good = next.run.goods[goodId];
    const room = good.storageCapacity - good.quantity;
    const amountLimit = Math.max(
      1,
      Math.min(Math.floor(good.storageCapacity / 10), Math.floor(room)),
    );
    const amountRoll = nextRandomInteger(next.run.random, 1, amountLimit);
    next = { ...next, run: { ...next.run, random: amountRoll.state } };
    prizeAmount = amountRoll.value;
  }
  let clueSystemId: string | null = null;
  if (selectedCategory === "manuscriptClue") {
    const eligibleManuscripts = next.permanent.megastructures.ancientManuscripts.filter(
      (record) => !record.reported,
    );
    if (eligibleManuscripts.length > 0) {
      const draw = randomIndex(next, eligibleManuscripts.length);
      next = draw.state;
      clueSystemId = eligibleManuscripts[draw.index]!.manuscriptSystemId;
    }
  }
  const interval = nextRandomInteger(next.run.random, 20_000, 35_000);
  next = { ...next, run: { ...next.run, random: interval.state } };
  const entry = {
    id: chosenId,
    category: selectedCategory,
    textKey: `${selectedCategory}.${chosenId}`,
    simulationMs: next.run.clock.simulationMs,
    prizeGoodId: goodId,
    prizeAmount,
    clueSystemId,
    claimed: selectedCategory === "wacky",
  } as const;
  const ticker = next.run.newsTicker;
  const seenIds = ticker.seenIds.includes(chosenId)
    ? ticker.seenIds
    : [...ticker.seenIds, chosenId];
  next = {
    ...next,
    run: {
      ...next.run,
      newsTicker: {
        ...ticker,
        remainingMs: interval.value,
        entries: [...ticker.entries, entry].slice(-50),
        seenIds,
      },
    },
  };
  return {
    state: next,
    events: [{ type: "news.ticker.created", id: chosenId, category: selectedCategory } as const],
  };
}

export function checkNewsWackyActivation(state: GameState, id: number): boolean {
  const current = state.run.newsTicker.entries.at(-1);
  return current?.id === id && current.category === "wacky";
}

export function activateNewsWacky(state: GameState, id: number) {
  if (!checkNewsWackyActivation(state, id)) return null;
  const activatedWackyIds = state.run.newsTicker.activatedWackyIds.includes(id)
    ? state.run.newsTicker.activatedWackyIds
    : [...state.run.newsTicker.activatedWackyIds, id];
  return {
    state: {
      ...state,
      run: { ...state.run, newsTicker: { ...state.run.newsTicker, activatedWackyIds } },
    },
    events: [{ type: "news.wacky.activated", id } as const],
  };
}

function applyOneOff(state: GameState, id: number): GameState {
  const news = state.run.newsTicker;
  const multiplyGoodsCapacity = (materials: boolean, compounds: boolean) => {
    const goods = { ...state.run.goods };
    for (const goodId of ECONOMIC_GOOD_IDS) {
      const isMaterial = MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number]);
      if ((isMaterial && !materials) || (!isMaterial && !compounds)) continue;
      goods[goodId] = {
        ...goods[goodId],
        storageCapacity: Math.min(1_000_000_000_000, goods[goodId].storageCapacity * 2),
      };
    }
    return goods;
  };
  if (id === 3000 || id === 3002)
    return {
      ...state,
      run: {
        ...state.run,
        goods: multiplyGoodsCapacity(true, id === 3002),
        newsTicker: {
          ...news,
          resourceStorageMultiplier: news.resourceStorageMultiplier * 2,
          ...(id === 3002 ? { compoundStorageMultiplier: news.compoundStorageMultiplier * 2 } : {}),
        },
      },
    };
  if (id === 3001)
    return {
      ...state,
      run: {
        ...state.run,
        goods: multiplyGoodsCapacity(false, true),
        newsTicker: { ...news, compoundStorageMultiplier: news.compoundStorageMultiplier * 2 },
      },
    };
  if (id >= 3003 && id <= 3005)
    return {
      ...state,
      run: {
        ...state.run,
        economy: {
          ...state.run.economy,
          power: {
            ...state.run.economy.power,
            capacity: Math.min(1_000_000_000_000, state.run.economy.power.capacity * 2),
            quantity: Math.min(1_000_000_000_000, state.run.economy.power.quantity * 2),
          },
        },
        newsTicker: { ...news, powerCapacityMultiplier: news.powerCapacityMultiplier * 2 },
      },
    };
  if (id >= 3006 && id <= 3008)
    return {
      ...state,
      run: {
        ...state.run,
        newsTicker: { ...news, powerPlantRateMultiplier: news.powerPlantRateMultiplier * 2 },
      },
    };
  if (id >= 3009 && id <= 3011)
    return {
      ...state,
      run: {
        ...state.run,
        newsTicker: { ...news, autoBuyerRateMultiplier: news.autoBuyerRateMultiplier * 2 },
      },
    };
  if (id === 3012)
    return {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          antimatter: state.run.space.antimatter + 100,
          antimatterUnlocked: true,
        },
      },
    };
  if (id === 3013)
    return {
      ...state,
      permanent: { ...state.permanent, ascendencyPoints: state.permanent.ascendencyPoints + 1 },
      statistics: {
        ...state.statistics,
        lifetimeAscendencyPointsGained: addLifetimeCount(
          state.statistics.lifetimeAscendencyPointsGained,
          1,
        ),
      },
    };
  return state;
}

export function checkNewsPrizeClaim(state: GameState, id: number): boolean {
  const entry = state.run.newsTicker.entries.find((item) => item.id === id && !item.claimed);
  return (
    !!entry &&
    (entry.category === "prize" || entry.category === "oneOff") &&
    !state.run.newsTicker.claimedPrizeIds.includes(id)
  );
}

export function claimNewsPrize(state: GameState, id: number) {
  if (!checkNewsPrizeClaim(state, id)) return null;
  const entryIndex = state.run.newsTicker.entries.findIndex((item) => item.id === id);
  const entry = state.run.newsTicker.entries[entryIndex]!;
  let next = state;
  let event: NewsTickerEvent;
  if (entry.category === "prize") {
    if (!entry.prizeGoodId || !isEconomicGoodId(entry.prizeGoodId)) return null;
    const goodId = entry.prizeGoodId;
    const good = state.run.goods[goodId];
    const room = good.storageCapacity - good.quantity;
    if (room <= 0) return null;
    const amountLimit = Math.max(
      1,
      Math.min(Math.floor(good.storageCapacity / 10), Math.floor(room)),
    );
    const amountRoll =
      typeof entry.prizeAmount === "number"
        ? { state: state.run.random, value: Math.min(amountLimit, entry.prizeAmount) }
        : nextRandomInteger(state.run.random, 1, amountLimit);
    next = {
      ...state,
      run: {
        ...state.run,
        random: amountRoll.state,
        goods: {
          ...state.run.goods,
          [goodId]: {
            ...good,
            quantity: Math.min(good.storageCapacity, good.quantity + amountRoll.value),
          },
        },
      },
    };
    event = { type: "news.prize.claimed", id, goodId, amount: amountRoll.value };
  } else {
    next = applyOneOff(state, id);
    event = { type: "news.one-off.claimed", id };
  }
  const entries = [...next.run.newsTicker.entries];
  entries[entryIndex] = { ...entries[entryIndex]!, claimed: true };
  const claimedPrizeIds = [...next.run.newsTicker.claimedPrizeIds, id];
  next = {
    ...next,
    run: { ...next.run, newsTicker: { ...next.run.newsTicker, entries, claimedPrizeIds } },
  };
  return { state: next, events: [event] as readonly NewsTickerEvent[] };
}

export function advanceNewsTicker(stateValue: GameState, elapsedMs: number) {
  if (elapsedMs <= 0) return { state: stateValue, events: [] as readonly NewsTickerEvent[] };
  let state = stateValue;
  let remaining = state.run.newsTicker.remainingMs - elapsedMs;
  const events: NewsTickerEvent[] = [];
  let iterations = 0;
  while (remaining <= 0 && iterations < 20) {
    const next = forceNewsTicker(state);
    if (!next) break;
    state = next.state;
    events.push(...next.events);
    remaining += state.run.newsTicker.remainingMs;
    iterations += 1;
  }
  state = {
    ...state,
    run: {
      ...state.run,
      newsTicker: { ...state.run.newsTicker, remainingMs: Math.max(0, remaining) },
    },
  };
  return { state, events };
}
