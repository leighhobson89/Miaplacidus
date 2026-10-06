import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  isEconomicGoodId,
  isSystemId,
  type EconomicGoodId,
  type SystemId,
} from "../content/ids";
import {
  MANUSCRIPT_CLUE_NEWS_IDS,
  NEWS_CATEGORIES,
  ONE_OFF_NEWS_IDS,
  PRIZE_NEWS_IDS,
  WACKY_NEWS_IDS,
  type NewsCategory,
} from "../content/metaSignals";
import { MEGASTRUCTURE_IDS } from "../content/technology";
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
const MANUSCRIPT_CLUE_CHANCE = 0.25;
const TICKER_SCROLL_DURATION_MS = 40_000;
const TICKER_INTERVAL_MIN_MS = 20_000;
const TICKER_INTERVAL_MAX_MS = 35_000;

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

interface EligibleManuscriptClue {
  readonly manuscriptSystemId: SystemId;
  readonly usedCount: number;
  readonly availableTemplateIds: readonly number[];
}

function eligibleManuscriptClues(state: GameState): readonly EligibleManuscriptClue[] {
  const history = state.permanent.megastructures.manuscriptCluesShown;
  const seenManuscripts = new Set<SystemId>();
  const eligible: EligibleManuscriptClue[] = [];
  for (const record of state.permanent.megastructures.ancientManuscripts) {
    if (
      !record ||
      typeof record !== "object" ||
      record.reported !== false ||
      !isSystemId(record.manuscriptSystemId) ||
      !isSystemId(record.factorySystemId) ||
      record.manuscriptSystemId === record.factorySystemId ||
      !Number.isSafeInteger(record.position) ||
      record.position < 1 ||
      record.position > 4 ||
      !MEGASTRUCTURE_IDS.includes(record.megastructureId) ||
      seenManuscripts.has(record.manuscriptSystemId)
    )
      continue;
    seenManuscripts.add(record.manuscriptSystemId);
    const rawShownIds = history[record.manuscriptSystemId];
    const shownIds = Array.isArray(rawShownIds)
      ? Array.from(
          new Set(
            rawShownIds.filter(
              (id) =>
                Number.isSafeInteger(id) &&
                MANUSCRIPT_CLUE_NEWS_IDS.includes(id as (typeof MANUSCRIPT_CLUE_NEWS_IDS)[number]),
            ),
          ),
        )
      : [];
    const availableTemplateIds = MANUSCRIPT_CLUE_NEWS_IDS.filter((id) => !shownIds.includes(id));
    if (availableTemplateIds.length > 0)
      eligible.push({
        manuscriptSystemId: record.manuscriptSystemId,
        usedCount: shownIds.length,
        availableTemplateIds,
      });
  }
  return eligible;
}

function selectManuscriptClue(
  state: GameState,
  requestedId?: number,
): {
  readonly state: GameState;
  readonly id: number;
  readonly manuscriptSystemId: SystemId;
} | null {
  const eligible = eligibleManuscriptClues(state);
  if (eligible.length === 0) return null;
  const leastUsedCount = Math.min(...eligible.map((candidate) => candidate.usedCount));
  const leastUsed = eligible.filter((candidate) => candidate.usedCount === leastUsedCount);
  const manuscriptDraw = randomIndex(state, leastUsed.length);
  const manuscript = leastUsed[manuscriptDraw.index]!;
  if (requestedId !== undefined) {
    if (!manuscript.availableTemplateIds.includes(requestedId)) return null;
    return {
      state: manuscriptDraw.state,
      id: requestedId,
      manuscriptSystemId: manuscript.manuscriptSystemId,
    };
  }
  const templateDraw = randomIndex(manuscriptDraw.state, manuscript.availableTemplateIds.length);
  return {
    state: templateDraw.state,
    id: manuscript.availableTemplateIds[templateDraw.index]!,
    manuscriptSystemId: manuscript.manuscriptSystemId,
  };
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
    return ONE_OFF_NEWS_IDS.filter((id) => !state.run.newsTicker.offeredOneOffIds.includes(id));
  if (category === "manuscriptClue")
    return Array.from(
      new Set(
        eligibleManuscriptClues(state).flatMap((candidate) => candidate.availableTemplateIds),
      ),
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
  let chosenId: number;
  let clueSystemId: SystemId | null = null;
  if (selectedCategory === "manuscriptClue") {
    const selection = selectManuscriptClue(next, requestedId);
    if (!selection) return null;
    next = selection.state;
    chosenId = selection.id;
    clueSystemId = selection.manuscriptSystemId;
  } else {
    const available = availableFor(next, selectedCategory);
    if (available.length === 0) return null;
    if (requestedId !== undefined) {
      if (!available.includes(requestedId)) return null;
      chosenId = requestedId;
    } else {
      const draw = randomIndex(next, available.length);
      next = draw.state;
      chosenId = available[draw.index]!;
    }
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
  if (clueSystemId) {
    const megastructures = next.permanent.megastructures;
    const previouslyShown = megastructures.manuscriptCluesShown[clueSystemId] ?? [];
    next = {
      ...next,
      permanent: {
        ...next.permanent,
        megastructures: {
          ...megastructures,
          manuscriptCluesShown: {
            ...megastructures.manuscriptCluesShown,
            [clueSystemId]: [...previouslyShown, chosenId],
          },
        },
      },
    };
  }
  const interval = nextRandomInteger(
    next.run.random,
    TICKER_INTERVAL_MIN_MS,
    TICKER_INTERVAL_MAX_MS,
  );
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
  const offeredOneOffIds =
    selectedCategory === "oneOff" && !ticker.offeredOneOffIds.includes(chosenId)
      ? [...ticker.offeredOneOffIds, chosenId]
      : ticker.offeredOneOffIds;
  next = {
    ...next,
    run: {
      ...next.run,
      newsTicker: {
        ...ticker,
        remainingMs: TICKER_SCROLL_DURATION_MS + interval.value,
        entries: [...ticker.entries, entry].slice(-50),
        seenIds,
        offeredOneOffIds,
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
  const remaining = stateValue.run.newsTicker.remainingMs - elapsedMs;
  if (remaining > 0)
    return {
      state: {
        ...stateValue,
        run: {
          ...stateValue.run,
          newsTicker: { ...stateValue.run.newsTicker, remainingMs: remaining },
        },
      },
      events: [] as readonly NewsTickerEvent[],
    };

  // A long simulation step can cross multiple intervals. Generate only one
  // message at a time and start a fresh scroll-plus-wait interval from here.
  const next = forceNewsTicker(stateValue);
  if (next) return next;
  return {
    state: {
      ...stateValue,
      run: {
        ...stateValue.run,
        newsTicker: { ...stateValue.run.newsTicker, remainingMs: 0 },
      },
    },
    events: [] as readonly NewsTickerEvent[],
  };
}
