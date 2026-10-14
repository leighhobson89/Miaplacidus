import { COMPOUND_IDS, ECONOMIC_GOOD_IDS, MATERIAL_IDS, type EconomicGoodId } from "../content/ids";
import {
  CASINO_CP_BASE_COST,
  CASINO_CP_VALUES,
  HIGHER_LOWER_PRIZE_TIERS,
  type CasinoCard,
  type CasinoCardSuit,
  type CasinoGameId,
  type CasinoHistoryEntry,
  type CasinoRunStats,
  type CasinoSpecialPrize,
} from "../content/galacticCasino";
import { starTypeForSystem } from "../content/starCatalogue";
import {
  ASTEROID_SCAN_TIMER_ID,
  type RocketId,
  STAR_STUDY_TIMER_ID,
  VOID_PILLAGE_TIMER_ID,
} from "../content/space";
import { completeTimer, type TimerEvent } from "./timers";
import type { GameTimer, TimerId } from "./runtimeTypes";
import {
  completeSpaceBattles,
  completeSpaceJourneys,
  completeSpaceSurveys,
  completeSpaceWeatherCycle,
} from "./spaceMechanics";
import { nextRandom, nextRandomInteger } from "./random";
import type { GameState } from "./state";
import type { SpaceEvent } from "./spaceCommands";
import { galacticTabUnlocked } from "./galacticProgression";

export interface VoidSeerOutcome {
  readonly playId: number;
  readonly tier: 1 | 2 | 3;
  readonly first: number;
  readonly second: number;
  readonly won: boolean;
  readonly detail: string;
  readonly clueTemplateIndex?: number;
}

export type CasinoCommand =
  | {
      readonly type: "casino.points.buy";
      readonly goodId: EconomicGoodId | "cash";
      readonly amount: number;
    }
  | { readonly type: "casino.double-or-nothing.play"; readonly stake: number }
  | { readonly type: "casino.wheel.spin" }
  | { readonly type: "casino.wheel.claim"; readonly prize: CasinoSpecialPrize }
  | { readonly type: "casino.higher-lower.start" }
  | { readonly type: "casino.higher-lower.guess"; readonly direction: "higher" | "lower" }
  | { readonly type: "casino.higher-lower.cash-out" }
  | { readonly type: "casino.void-seer.play"; readonly tier: 1 | 2 | 3 }
  | { readonly type: "casino.void-seer.resolve"; readonly outcome: VoidSeerOutcome };

export type CasinoFailure = {
  readonly code:
    | "casino-locked"
    | "casino-invalid-amount"
    | "casino-insufficient-cp"
    | "casino-good-locked"
    | "casino-insufficient-stock"
    | "casino-wheel-prize-pending"
    | "casino-wheel-no-prize-pending"
    | "casino-wheel-prize-unavailable"
    | "casino-round-active"
    | "casino-round-missing"
    | "casino-cash-out-too-early"
    | "casino-invalid-guess"
    | "casino-invalid-tier"
    | "casino-invalid-void-seer-result";
  readonly messageKey: `casino.reason.${string}`;
};

/** Actual outcome payload used by Hilo notifications; values are captured at award time. */
export type HigherLowerAward =
  | { readonly type: "cp"; readonly amount: number }
  | { readonly type: "cash" | "research"; readonly amount: number }
  | { readonly type: "material"; readonly goodId: EconomicGoodId; readonly amount: number }
  | {
      readonly type: "material-doubled";
      readonly goodId: EconomicGoodId;
      readonly oldQuantity: number;
      readonly newQuantity: number;
    }
  | { readonly type: "timewarp"; readonly multiplier: number; readonly durationMs: number }
  | {
      readonly type: "finished";
      readonly activity: "asteroid-search" | "star-study" | "void-pillage";
      readonly asteroidName?: string;
    }
  | {
      readonly type: "finished-journey";
      readonly vehicle: "rocket";
      readonly rocketName: string;
    }
  | {
      readonly type: "finished-journey";
      readonly vehicle: "starship";
      readonly destinationSystemId: string;
    };

export interface HigherLowerOutcome {
  readonly prizeKey: string;
  readonly won: boolean;
  readonly award: HigherLowerAward | null;
}

/** Actual result of claiming a Wheel special prize, captured by the reducer. */
export type WheelSpecialAward =
  | { readonly type: "cp"; readonly amount: number }
  | { readonly type: "research"; readonly amount: number }
  | {
      readonly type: "double";
      readonly goodId: EconomicGoodId;
      readonly oldQuantity: number;
      readonly newQuantity: number;
    }
  | {
      readonly type: "rocket-warp";
      readonly rocketId: RocketId;
      readonly rocketName: string;
      readonly destination:
        | { readonly type: "base" }
        | { readonly type: "asteroid"; readonly name: string };
    }
  | { readonly type: "starship-warp"; readonly destinationSystemId: string }
  | {
      readonly type: "telescope-finished";
      readonly activity: "asteroid-search" | "star-study" | "void-pillage";
    };

export type CasinoEvent =
  | {
      readonly type: "casino.points.purchased";
      readonly goodId: EconomicGoodId | "cash";
      readonly amount: number;
      readonly cost: number;
    }
  | {
      readonly type: "casino.game.played";
      readonly gameId: CasinoGameId;
      readonly result: string;
      readonly cpSpent: number;
      readonly cpAwarded: number;
      /** Number of cards already revealed when a Hilo cashout was accepted. */
      readonly revealedCount?: number;
      /** Actual Hilo prize and award details captured by the reducer. */
      readonly higherLowerOutcome?: HigherLowerOutcome;
    }
  | { readonly type: "casino.wheel.special-ready" }
  | {
      readonly type: "casino.wheel.special-claimed";
      readonly prize: CasinoSpecialPrize;
      readonly detail: string;
      /** Typed actual award details captured at claim time for source-style notices. */
      readonly award: WheelSpecialAward;
    }
  | {
      readonly type: "casino.higher-lower.revealed";
      readonly index: number;
      readonly card: CasinoCard;
      readonly correct: boolean;
      /** Present only when the final card completes the round. */
      readonly outcome?: HigherLowerOutcome;
    }
  | {
      readonly type: "casino.void-seer.started";
      readonly outcome: VoidSeerOutcome;
    }
  | {
      readonly type: "casino.void-seer.result";
      readonly playId: number;
      readonly tier: 1 | 2 | 3;
      readonly first: number;
      readonly second: number;
      readonly won: boolean;
      readonly detail: string;
      /** Selected localized clue-template index, drawn from the game RNG. */
      readonly clueTemplateIndex?: number;
    };

const SUITS: readonly CasinoCardSuit[] = ["clubs", "diamonds", "hearts", "spades"];
const VOID_SEER_CP_COST: Readonly<Record<1 | 2 | 3, number>> = { 1: 7, 2: 10, 3: 15 };
const VOID_SEER_MAX: Readonly<Record<1 | 2 | 3, number>> = { 1: 6, 2: 8, 3: 12 };
type CasinoCompletionEvent = TimerEvent | SpaceEvent;

function validVoidSeerOutcome(value: unknown): value is VoidSeerOutcome {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const outcome = value as Partial<VoidSeerOutcome>;
  const expected = ["playId", "tier", "first", "second", "won", "detail"];
  if (outcome.clueTemplateIndex !== undefined) expected.push("clueTemplateIndex");
  if (
    Object.keys(value).sort().join("|") !== [...expected].sort().join("|") ||
    !Number.isSafeInteger(outcome.playId) ||
    outcome.playId! < 1 ||
    (outcome.tier !== 1 && outcome.tier !== 2 && outcome.tier !== 3) ||
    !Number.isSafeInteger(outcome.first) ||
    outcome.first! < 0 ||
    outcome.first! > VOID_SEER_MAX[outcome.tier] ||
    !Number.isSafeInteger(outcome.second) ||
    outcome.second! < 0 ||
    outcome.second! > VOID_SEER_MAX[outcome.tier] ||
    typeof outcome.won !== "boolean" ||
    outcome.won !== (outcome.first === outcome.second) ||
    typeof outcome.detail !== "string" ||
    outcome.detail.length > 160 ||
    (outcome.clueTemplateIndex !== undefined &&
      (!Number.isSafeInteger(outcome.clueTemplateIndex) || outcome.clueTemplateIndex! < 0))
  )
    return false;

  if (!outcome.won) return outcome.detail === "loss";
  if (outcome.tier === 3) return /^antimatter:[1-9]\d*$/.test(outcome.detail);
  if (outcome.tier === 1) {
    return (
      (outcome.detail === "o-type-clue" || outcome.detail.startsWith("o-type-clue:")) &&
      (outcome.clueTemplateIndex === undefined || outcome.clueTemplateIndex <= 2)
    );
  }
  return (
    (outcome.detail === "manuscript-clue" || outcome.detail.startsWith("manuscript-clue:")) &&
    (outcome.clueTemplateIndex === undefined || outcome.clueTemplateIndex <= 9)
  );
}

export function isCasinoCommand(value: { readonly type: string }): value is CasinoCommand {
  return value.type.startsWith("casino.");
}

export function casinoUnlocked(state: GameState): boolean {
  return galacticTabUnlocked(state);
}

function isGoodUnlocked(state: GameState, goodId: EconomicGoodId): boolean {
  return MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number])
    ? state.run.unlockedResources.includes(goodId as (typeof MATERIAL_IDS)[number])
    : state.run.economy.unlockedCompounds.includes(goodId as (typeof COMPOUND_IDS)[number]);
}

function isFiniteInteger(value: number, min = 1): boolean {
  return Number.isSafeInteger(value) && value >= min;
}

function fail(code: CasinoFailure["code"]): CasinoFailure {
  return { code, messageKey: `casino.reason.${code.replaceAll("-", ".")}` };
}

function activeTimer(state: GameState, timerId: string | null | undefined): GameTimer | null {
  if (!timerId) return null;
  const timer = state.run.timers[timerId];
  return timer?.status === "running" ? timer : null;
}

function wheelSpecialAvailable(state: GameState, prize: CasinoSpecialPrize): boolean {
  if (prize === "special_100cp" || prize === "special_100k_research") return true;
  if (prize.startsWith("special_double_")) {
    const goodId = prize.slice("special_double_".length) as EconomicGoodId;
    return ECONOMIC_GOOD_IDS.includes(goodId) && isGoodUnlocked(state, goodId);
  }
  if (prize === "special_starship_warp")
    return activeTimer(state, state.run.space.starship.timerId) !== null;
  if (prize === "special_rocket_warp")
    return Object.values(state.run.space.rockets).some((rocket) =>
      activeTimer(state, rocket.timerId),
    );
  if (prize === "special_telescope_finish_asteroid_search")
    return activeTimer(state, ASTEROID_SCAN_TIMER_ID) !== null;
  if (prize === "special_telescope_finish_star_study")
    return activeTimer(state, STAR_STUDY_TIMER_ID) !== null;
  if (prize === "special_telescope_finish_void_pillage")
    return (
      state.permanent.philosophyId === "voidborn" &&
      activeTimer(state, VOID_PILLAGE_TIMER_ID) !== null
    );
  return false;
}

export function availableWheelSpecialPrizes(state: GameState): readonly CasinoSpecialPrize[] {
  const staticPrizes: CasinoSpecialPrize[] = ["special_100cp", "special_100k_research"];
  for (const goodId of ECONOMIC_GOOD_IDS) staticPrizes.push(`special_double_${goodId}`);
  staticPrizes.push(
    "special_rocket_warp",
    "special_starship_warp",
    "special_telescope_finish_asteroid_search",
    "special_telescope_finish_star_study",
  );
  if (state.permanent.philosophyId === "voidborn")
    staticPrizes.push("special_telescope_finish_void_pillage");
  return staticPrizes.filter((prize) => wheelSpecialAvailable(state, prize));
}

export function checkCasinoCommand(state: GameState, command: CasinoCommand): CasinoFailure | null {
  if (!casinoUnlocked(state)) return fail("casino-locked");
  const casino = state.permanent.galacticCasino;
  switch (command.type) {
    case "casino.points.buy": {
      if (!isFiniteInteger(command.amount)) return fail("casino-invalid-amount");
      if (command.goodId !== "cash" && !isGoodUnlocked(state, command.goodId))
        return fail("casino-good-locked");
      const cost = Math.ceil(
        (command.amount * CASINO_CP_BASE_COST) / CASINO_CP_VALUES[command.goodId],
      );
      const available =
        command.goodId === "cash" ? state.run.cash : state.run.goods[command.goodId].quantity;
      return Number.isSafeInteger(cost) && available >= cost
        ? null
        : fail("casino-insufficient-stock");
    }
    case "casino.double-or-nothing.play":
      return !isFiniteInteger(command.stake)
        ? fail("casino-invalid-amount")
        : command.stake > casino.casinoPoints
          ? fail("casino-insufficient-cp")
          : null;
    case "casino.wheel.spin":
      return casino.wheelSpecialPending
        ? fail("casino-wheel-prize-pending")
        : casino.casinoPoints < 1
          ? fail("casino-insufficient-cp")
          : null;
    case "casino.wheel.claim":
      return !casino.wheelSpecialPending
        ? fail("casino-wheel-no-prize-pending")
        : !availableWheelSpecialPrizes(state).includes(command.prize)
          ? fail("casino-wheel-prize-unavailable")
          : null;
    case "casino.higher-lower.start":
      return casino.higherLower !== null
        ? fail("casino-round-active")
        : casino.casinoPoints < 5
          ? fail("casino-insufficient-cp")
          : null;
    case "casino.higher-lower.guess":
      return casino.higherLower === null
        ? fail("casino-round-missing")
        : (command.direction !== "higher" && command.direction !== "lower") ||
            casino.higherLower.index >= 8
          ? fail("casino-invalid-guess")
          : null;
    case "casino.higher-lower.cash-out":
      return casino.higherLower === null
        ? fail("casino-round-missing")
        : casino.higherLower.index < 2 || casino.higherLower.prizeKey === null
          ? fail("casino-cash-out-too-early")
          : null;
    case "casino.void-seer.play":
      return !([1, 2, 3] as const).includes(command.tier)
        ? fail("casino-invalid-tier")
        : casino.casinoPoints < VOID_SEER_CP_COST[command.tier]
          ? fail("casino-insufficient-cp")
          : null;
    case "casino.void-seer.resolve":
      return validVoidSeerOutcome(command.outcome) &&
        command.outcome.playId <= state.statistics.acceptedCommands
        ? null
        : fail("casino-invalid-void-seer-result");
  }
}

function updateStats(state: GameState, key: keyof CasinoRunStats, amount: number): GameState {
  const run = { ...state.run.casinoStats, [key]: state.run.casinoStats[key] + amount };
  const lifetimeStats = {
    ...state.permanent.galacticCasino.lifetimeStats,
    [key]: state.permanent.galacticCasino.lifetimeStats[key] + amount,
  };
  return {
    ...state,
    run: { ...state.run, casinoStats: run },
    permanent: {
      ...state.permanent,
      galacticCasino: { ...state.permanent.galacticCasino, lifetimeStats },
    },
  };
}

function markGameWon(state: GameState, gameId: CasinoGameId): GameState {
  const gamesWon = state.permanent.galacticCasino.gamesWon.includes(gameId)
    ? state.permanent.galacticCasino.gamesWon
    : [...state.permanent.galacticCasino.gamesWon, gameId];
  return {
    ...state,
    permanent: {
      ...state.permanent,
      galacticCasino: { ...state.permanent.galacticCasino, gamesWon },
    },
  };
}

function recordHistory(state: GameState, entry: Omit<CasinoHistoryEntry, "id">): GameState {
  const casino = state.permanent.galacticCasino;
  const history = [...casino.history, { ...entry, id: casino.nextHistoryId }].slice(-30);
  return {
    ...state,
    permanent: {
      ...state.permanent,
      galacticCasino: { ...casino, history, nextHistoryId: casino.nextHistoryId + 1 },
    },
  };
}

function updateWallet(state: GameState, delta: number): GameState {
  const casino = state.permanent.galacticCasino;
  return {
    ...state,
    permanent: {
      ...state.permanent,
      galacticCasino: { ...casino, casinoPoints: Math.max(0, casino.casinoPoints + delta) },
    },
  };
}

function drawInteger(
  state: GameState,
  min: number,
  max: number,
): { value: number; state: GameState } {
  const drawn = nextRandomInteger(state.run.random, min, max);
  return { value: drawn.value, state: { ...state, run: { ...state.run, random: drawn.state } } };
}

function drawUnit(state: GameState): { value: number; state: GameState } {
  const drawn = nextRandom(state.run.random);
  return { value: drawn.value, state: { ...state, run: { ...state.run, random: drawn.state } } };
}

function drawHigherLowerDeck(state: GameState): { deck: readonly CasinoCard[]; state: GameState } {
  const pool: CasinoCard[] = SUITS.flatMap((suit) =>
    Array.from({ length: 13 }, (_, index) => ({ rank: index + 2, suit })),
  );
  const deck: CasinoCard[] = [];
  let next = state;
  while (deck.length < 9) {
    const previousRank = deck.at(-1)?.rank;
    const eligible = pool.filter((card) => card.rank !== previousRank);
    const choice = drawInteger(next, 0, eligible.length - 1);
    next = choice.state;
    const selected = eligible[choice.value]!;
    deck.push(selected);
    pool.splice(
      pool.findIndex((card) => card.rank === selected.rank && card.suit === selected.suit),
      1,
    );
  }
  return { deck, state: next };
}

function choosePrize(state: GameState, tier: number): { key: string; state: GameState } {
  const prizes = [...(HIGHER_LOWER_PRIZE_TIERS[tier] ?? HIGHER_LOWER_PRIZE_TIERS[1]!)];
  if (tier === 7 && state.permanent.philosophyId === "voidborn")
    prizes[3] = "special_telescope_finish_void_pillage";
  const draw = drawInteger(state, 0, prizes.length - 1);
  return { key: prizes[draw.value]!, state: draw.state };
}

function incrementCpSpent(state: GameState, amount: number): GameState {
  return updateStats(state, "cpSpent", amount);
}

function timerForSpecial(state: GameState, prize: CasinoSpecialPrize | string): string | null {
  if (prize === "special_telescope_finish_asteroid_search")
    return activeTimer(state, ASTEROID_SCAN_TIMER_ID)?.id ?? null;
  if (prize === "special_telescope_finish_star_study")
    return activeTimer(state, STAR_STUDY_TIMER_ID)?.id ?? null;
  if (prize === "special_telescope_finish_void_pillage")
    return activeTimer(state, VOID_PILLAGE_TIMER_ID)?.id ?? null;
  if (prize === "special_starship_warp" || prize === "special_finish_starship_journey")
    return activeTimer(state, state.run.space.starship.timerId)?.id ?? null;
  if (prize === "special_rocket_warp" || prize === "special_finish_rocket_journey") {
    const rocket = Object.values(state.run.space.rockets).find((entry) =>
      activeTimer(state, entry.timerId),
    );
    return rocket?.timerId ?? null;
  }
  return null;
}

function shortenTimer(state: GameState, timerId: string, remainingMs: number): GameState {
  const timer = activeTimer(state, timerId);
  if (!timer) return state;
  return {
    ...state,
    run: {
      ...state.run,
      timers: {
        ...state.run.timers,
        [timerId]: { ...timer, durationMs: timer.elapsedMs + Math.max(1, remainingMs) },
      },
    },
  };
}

function completeTimerThroughNormalRules(
  state: GameState,
  timerId: string,
): { state: GameState; events: readonly CasinoCompletionEvent[] } {
  const completed = completeTimer(state.run.timers, timerId as TimerId);
  if (!completed.completed) return { state, events: [] };
  let next: GameState = { ...state, run: { ...state.run, timers: completed.timers } };
  const survey = completeSpaceSurveys(next, completed.events);
  next = survey.state;
  const journey = completeSpaceJourneys(next, completed.events);
  next = journey.state;
  const weather = completeSpaceWeatherCycle(next, completed.events);
  next = weather.state;
  const battle = completeSpaceBattles(weather.state, completed.events);
  next = {
    ...battle.state,
    statistics: {
      ...battle.state.statistics,
      completedTimers: Math.min(
        Number.MAX_SAFE_INTEGER,
        battle.state.statistics.completedTimers + 1,
      ),
    },
  };
  return {
    state: next,
    events: [
      ...completed.events,
      ...survey.events,
      ...journey.events,
      ...weather.events,
      ...battle.events,
    ],
  };
}

function applySpecialPrize(
  state: GameState,
  prize: CasinoSpecialPrize | string,
): {
  state: GameState;
  amount: number;
  detail: string;
  hiloAward: HigherLowerAward | null;
  wheelAward: WheelSpecialAward | null;
  completedEvents: readonly CasinoCompletionEvent[];
} {
  let next = state;
  let amount = 0;
  let detail = prize;
  let hiloAward: HigherLowerAward | null = null;
  let wheelAward: WheelSpecialAward | null = null;
  let completedEvents: readonly CasinoCompletionEvent[] = [];
  if (prize === "special_100cp") {
    amount = 100;
    hiloAward = { type: "cp", amount };
    wheelAward = { type: "cp", amount };
    next = updateWallet(next, amount);
  } else if (prize === "special_100k_research") {
    next = { ...next, run: { ...next.run, researchPoints: next.run.researchPoints + 100_000 } };
    amount = 100_000;
    hiloAward = { type: "research", amount };
    wheelAward = { type: "research", amount };
  } else if (prize.startsWith("special_double_")) {
    const goodId = prize.slice("special_double_".length) as EconomicGoodId;
    if (ECONOMIC_GOOD_IDS.includes(goodId) && isGoodUnlocked(next, goodId)) {
      const previous = next.run.goods[goodId].quantity;
      next = {
        ...next,
        run: {
          ...next.run,
          goods: {
            ...next.run.goods,
            [goodId]: { ...next.run.goods[goodId], quantity: previous * 2 },
          },
        },
      };
      amount = previous;
      hiloAward = {
        type: "material-doubled",
        goodId,
        oldQuantity: previous,
        newQuantity: previous * 2,
      };
      wheelAward = {
        type: "double",
        goodId,
        oldQuantity: previous,
        newQuantity: previous * 2,
      };
    } else {
      amount = 20;
      hiloAward = { type: "cp", amount };
      wheelAward = { type: "cp", amount };
      next = updateWallet(next, amount);
    }
  } else if (prize === "special_rocket_warp" || prize === "special_starship_warp") {
    const timerId = timerForSpecial(next, prize);
    if (timerId) {
      const completed = completeTimerThroughNormalRules(next, timerId);
      next = completed.state;
      completedEvents = completed.events;
      if (prize === "special_starship_warp") {
        const destinationSystemId = state.run.space.starship.destinationSystemId;
        if (destinationSystemId) wheelAward = { type: "starship-warp", destinationSystemId };
      } else {
        const rocketEntry = Object.entries(state.run.space.rockets).find(
          ([, entry]) => entry.timerId === timerId,
        );
        if (rocketEntry) {
          const [rocketIdValue, rocket] = rocketEntry;
          const rocketId = rocketIdValue as RocketId;
          const asteroid = rocket.targetAsteroidId
            ? state.run.space.asteroids.find((entry) => entry.id === rocket.targetAsteroidId)
            : undefined;
          wheelAward = {
            type: "rocket-warp",
            rocketId,
            rocketName: rocket.name,
            destination:
              rocket.phase === "returning"
                ? { type: "base" }
                : { type: "asteroid", name: asteroid?.name ?? "Destination" },
          };
        }
      }
    } else if (prize.startsWith("special_finish_")) {
      amount = 150;
      next = updateWallet(next, amount);
    }
  } else if (
    prize === "special_telescope_finish_asteroid_search" ||
    prize === "special_telescope_finish_star_study" ||
    prize === "special_telescope_finish_void_pillage"
  ) {
    const timerId = timerForSpecial(next, prize);
    if (timerId) {
      const completed = completeTimerThroughNormalRules(next, timerId);
      next = completed.state;
      completedEvents = completed.events;
      if (prize === "special_telescope_finish_asteroid_search") {
        const discovered = completed.events.find(
          (event) => event.type === "space.asteroid.discovered",
        );
        hiloAward = {
          type: "finished",
          activity: "asteroid-search",
          ...(discovered?.type === "space.asteroid.discovered"
            ? { asteroidName: discovered.name }
            : {}),
        };
        wheelAward = { type: "telescope-finished", activity: "asteroid-search" };
      } else {
        const activity =
          prize === "special_telescope_finish_star_study" ? "star-study" : "void-pillage";
        hiloAward = {
          type: "finished",
          activity,
        };
        wheelAward = { type: "telescope-finished", activity };
      }
    }
  } else if (
    prize === "special_finish_rocket_journey" ||
    prize === "special_finish_starship_journey"
  ) {
    const timerId = timerForSpecial(next, prize);
    if (timerId) {
      next = shortenTimer(next, timerId, 2_000);
      if (prize === "special_finish_rocket_journey") {
        const rocket = Object.values(state.run.space.rockets).find(
          (entry) => entry.timerId === timerId,
        );
        if (rocket) {
          hiloAward = {
            type: "finished-journey",
            vehicle: "rocket",
            rocketName: rocket.name,
          };
        }
      } else {
        const destinationSystemId = state.run.space.starship.destinationSystemId;
        if (destinationSystemId) {
          hiloAward = {
            type: "finished-journey",
            vehicle: "starship",
            destinationSystemId,
          };
        }
      }
    } else {
      amount = 150;
      hiloAward = { type: "cp", amount };
      detail = "cp:150";
      next = updateWallet(next, amount);
    }
  }
  return { state: next, amount, detail, hiloAward, wheelAward, completedEvents };
}

function randomTopUp(
  state: GameState,
  category: "resources" | "compounds",
): { state: GameState; goodId: EconomicGoodId; amount: number } | null {
  const ids =
    category === "resources" ? state.run.unlockedResources : state.run.economy.unlockedCompounds;
  const choices = ids.filter(
    (id) => state.run.goods[id].quantity < state.run.goods[id].storageCapacity,
  );
  if (!choices.length) return null;
  const selected = drawInteger(state, 0, choices.length - 1);
  const goodId = choices[selected.value]!;
  const good = selected.state.run.goods[goodId];
  const max = Math.min(
    good.storageCapacity - good.quantity,
    Math.max(1, Math.floor(good.quantity * 0.1)),
  );
  const grant = drawInteger(selected.state, 1, Math.max(1, max));
  const amount = Math.min(max, grant.value);
  return {
    state: {
      ...grant.state,
      run: {
        ...grant.state.run,
        goods: {
          ...grant.state.run.goods,
          [goodId]: { ...good, quantity: good.quantity + amount },
        },
      },
    },
    goodId,
    amount,
  };
}

function applyHigherLowerPrize(
  state: GameState,
  prizeKey: string,
): {
  state: GameState;
  cpAwarded: number;
  won: boolean;
  detail: string;
  award: HigherLowerAward | null;
  completedEvents: readonly CasinoCompletionEvent[];
} {
  let next = state;
  let cpAwarded = 0;
  let won = true;
  let detail = prizeKey;
  let award: HigherLowerAward | null = null;
  let completedEvents: readonly CasinoCompletionEvent[] = [];
  const cpMatch = /^hilo_cp_(\d+)$/.exec(prizeKey);
  if (cpMatch) {
    cpAwarded = Number(cpMatch[1]);
    award = { type: "cp", amount: cpAwarded };
    next = updateWallet(next, cpAwarded);
  } else if (prizeKey.endsWith("_topup")) {
    const topUp = randomTopUp(next, prizeKey === "hilo_resource_topup" ? "resources" : "compounds");
    if (topUp) {
      next = topUp.state;
      detail = `${topUp.goodId}:${topUp.amount}`;
      award = { type: "material", goodId: topUp.goodId, amount: topUp.amount };
    } else {
      cpAwarded = 5;
      award = { type: "cp", amount: cpAwarded };
      next = updateWallet(next, cpAwarded);
      detail = "hilo_cp_5";
    }
  } else if (/^hilo_(cash|research)_boost_(small|medium|large)$/.test(prizeKey)) {
    const [, resource, scale] = prizeKey.match(
      /^hilo_(cash|research)_boost_(small|medium|large)$/,
    )!;
    const pct = scale === "small" ? 0.02 : scale === "medium" ? 0.05 : 0.1;
    if (resource === "cash") {
      const amount = Math.floor(next.run.cash * pct);
      if (amount > 0) {
        next = { ...next, run: { ...next.run, cash: next.run.cash + amount } };
        award = { type: "cash", amount };
      } else won = false;
    } else {
      const amount = Math.floor(next.run.researchPoints * pct);
      if (amount > 0) {
        next = { ...next, run: { ...next.run, researchPoints: next.run.researchPoints + amount } };
        award = { type: "research", amount };
      } else won = false;
    }
  } else if (
    ["hilo_research_flat", "hilo_research_big_flat", "hilo_research_mega"].includes(prizeKey)
  ) {
    const amount =
      prizeKey === "hilo_research_flat"
        ? 5_000
        : prizeKey === "hilo_research_big_flat"
          ? 100_000
          : 500_000;
    next = { ...next, run: { ...next.run, researchPoints: next.run.researchPoints + amount } };
    award = { type: "research", amount };
  } else if (prizeKey === "hilo_cash_flat" || prizeKey === "hilo_cash_mega") {
    const amount = prizeKey === "hilo_cash_flat" ? 5_000 : 250_000;
    next = { ...next, run: { ...next.run, cash: next.run.cash + amount } };
    award = { type: "cash", amount };
  } else if (prizeKey.startsWith("hilo_timewarp_")) {
    const [, , multiplier, durationMs] = prizeKey.split("_");
    next = {
      ...next,
      run: {
        ...next.run,
        timeWarp: { multiplier: Number(multiplier), remainingMs: Number(durationMs) },
      },
    };
    award = { type: "timewarp", multiplier: Number(multiplier), durationMs: Number(durationMs) };
  } else if (prizeKey.startsWith("special_")) {
    const special = applySpecialPrize(next, prizeKey);
    next = special.state;
    completedEvents = special.completedEvents;
    cpAwarded = special.amount;
    award = special.hiloAward;
    if (special.amount === 0 && !completedEvents.length && !special.hiloAward) {
      const tierSevenFinish = [
        "special_finish_rocket_journey",
        "special_finish_starship_journey",
        "special_telescope_finish_asteroid_search",
        "special_telescope_finish_star_study",
        "special_telescope_finish_void_pillage",
      ].includes(prizeKey);
      if (tierSevenFinish) {
        cpAwarded = 150;
        award = { type: "cp", amount: cpAwarded };
        next = updateWallet(next, cpAwarded);
        detail = "cp:150";
      } else {
        won = false;
        cpAwarded = 5;
        award = { type: "cp", amount: cpAwarded };
        next = updateWallet(next, cpAwarded);
        detail = "hilo_cp_5";
      }
    }
  }
  return { state: next, cpAwarded, won, detail, award, completedEvents };
}

function addPlayedStats(state: GameState, gameId: CasinoGameId, spent: number): GameState {
  let next = incrementCpSpent(state, spent);
  const key = (
    {
      doubleOrNothing: "doubleOrNothingPlayed",
      wheel: "wheelPlayed",
      higherLower: "higherLowerPlayed",
      voidSeer: "voidSeerPlayed",
    } as const
  )[gameId];
  return updateStats(next, key, 1);
}

function awardWheelRegularPrize(state: GameState): {
  state: GameState;
  cpAwarded: number;
  result: string;
} {
  const category = drawInteger(state, 0, 5);
  let next = category.state;
  let cpAwarded = 0;
  let result = "loss";
  if (category.value === 0 || category.value === 1) {
    const topUp = randomTopUp(next, category.value === 0 ? "resources" : "compounds");
    if (topUp) {
      next = topUp.state;
      result = `${topUp.goodId}:${topUp.amount}`;
    } else {
      cpAwarded = 2;
      next = updateWallet(next, cpAwarded);
      result = "cp:2";
    }
  } else if (category.value === 2 || category.value === 3) {
    const quantity = category.value === 2 ? next.run.cash : next.run.researchPoints;
    const maxAdd = Math.floor(quantity * 0.05);
    if (maxAdd > 0) {
      const draw = drawInteger(next, 1, maxAdd);
      next = draw.state;
      if (category.value === 2)
        next = { ...next, run: { ...next.run, cash: next.run.cash + draw.value } };
      else
        next = {
          ...next,
          run: { ...next.run, researchPoints: next.run.researchPoints + draw.value },
        };
      result = `${category.value === 2 ? "cash" : "research"}:${draw.value}`;
    } else {
      cpAwarded = 2;
      next = updateWallet(next, cpAwarded);
      result = "cp:2";
    }
  } else if (category.value === 4) {
    const candidates = Object.values(next.run.timers).filter(
      (timer) =>
        timer.status === "running" && (timer.domain === "travel" || timer.domain === "survey"),
    );
    if (candidates.length) {
      const selected = drawInteger(next, 0, candidates.length - 1);
      next = selected.state;
      const timer = candidates[selected.value]!;
      const remaining = timer.durationMs - timer.elapsedMs;
      const reduction = drawInteger(next, 1, Math.max(1, Math.floor(remaining * 0.1)));
      next = reduction.state;
      next = shortenTimer(next, timer.id, Math.max(1, remaining - reduction.value));
      result = `time:${timer.id}:${reduction.value}`;
    } else {
      cpAwarded = 2;
      next = updateWallet(next, cpAwarded);
      result = "cp:2";
    }
  } else {
    cpAwarded = 2;
    next = updateWallet(next, cpAwarded);
    result = "cp:2";
  }
  return { state: next, cpAwarded, result };
}

export function applyCasinoCommand(
  state: GameState,
  command: CasinoCommand,
): {
  readonly state: GameState;
  readonly events: readonly CasinoEvent[];
  readonly otherEvents?: readonly CasinoCompletionEvent[];
} {
  const casino = state.permanent.galacticCasino;
  if (command.type === "casino.points.buy") {
    const cost = Math.ceil(
      (command.amount * CASINO_CP_BASE_COST) / CASINO_CP_VALUES[command.goodId],
    );
    const next =
      command.goodId === "cash"
        ? { ...state, run: { ...state.run, cash: state.run.cash - cost } }
        : {
            ...state,
            run: {
              ...state.run,
              goods: {
                ...state.run.goods,
                [command.goodId]: {
                  ...state.run.goods[command.goodId],
                  quantity: state.run.goods[command.goodId].quantity - cost,
                },
              },
            },
          };
    return {
      state: updateWallet(next, command.amount),
      events: [
        { type: "casino.points.purchased", goodId: command.goodId, amount: command.amount, cost },
      ],
    };
  }
  if (command.type === "casino.double-or-nothing.play") {
    const draw = drawUnit(state);
    const won = draw.value < casino.baseWinProbability;
    let next = updateWallet(draw.state, -command.stake);
    next = addPlayedStats(next, "doubleOrNothing", command.stake);
    if (won) {
      next = updateWallet(next, command.stake * 2);
      next = markGameWon(next, "doubleOrNothing");
      next = updateStats(next, "doubleOrNothingWon", 1);
    }
    next = recordHistory(next, {
      gameId: "doubleOrNothing",
      result: won ? "win" : "loss",
      cpSpent: command.stake,
      cpAwarded: won ? command.stake * 2 : 0,
    });
    return {
      state: next,
      events: [
        {
          type: "casino.game.played",
          gameId: "doubleOrNothing",
          result: won ? "win" : "loss",
          cpSpent: command.stake,
          cpAwarded: won ? command.stake * 2 : 0,
        },
      ],
    };
  }
  if (command.type === "casino.wheel.spin") {
    let next = updateWallet(state, -1);
    next = addPlayedStats(next, "wheel", 1);
    const selected = drawInteger(next, 0, 15);
    next = selected.state;
    if (selected.value === 0) {
      next = {
        ...next,
        permanent: {
          ...next.permanent,
          galacticCasino: { ...next.permanent.galacticCasino, wheelSpecialPending: true },
        },
      };
      next = updateStats(next, "wheelWon", 1);
      next = recordHistory(next, {
        gameId: "wheel",
        result: "special-ready",
        cpSpent: 1,
        cpAwarded: 0,
      });
      return {
        state: next,
        events: [
          { type: "casino.wheel.special-ready" },
          {
            type: "casino.game.played",
            gameId: "wheel",
            result: "special-ready",
            cpSpent: 1,
            cpAwarded: 0,
          },
        ],
      };
    }
    if (selected.value % 2 === 1) {
      next = recordHistory(next, { gameId: "wheel", result: "loss", cpSpent: 1, cpAwarded: 0 });
      return {
        state: next,
        events: [
          { type: "casino.game.played", gameId: "wheel", result: "loss", cpSpent: 1, cpAwarded: 0 },
        ],
      };
    }
    const prize = awardWheelRegularPrize(next);
    next = prize.state;
    next = updateStats(next, "wheelWon", 1);
    next = markGameWon(next, "wheel");
    next = recordHistory(next, {
      gameId: "wheel",
      result: prize.result,
      cpSpent: 1,
      cpAwarded: prize.cpAwarded,
    });
    return {
      state: next,
      events: [
        {
          type: "casino.game.played",
          gameId: "wheel",
          result: prize.result,
          cpSpent: 1,
          cpAwarded: prize.cpAwarded,
        },
      ],
    };
  }
  if (command.type === "casino.wheel.claim") {
    const special = applySpecialPrize(state, command.prize);
    let next = {
      ...special.state,
      permanent: {
        ...special.state.permanent,
        galacticCasino: { ...special.state.permanent.galacticCasino, wheelSpecialPending: false },
      },
    };
    next = markGameWon(next, "wheel");
    next = updateStats(next, "wheelSpecialWon", 1);
    next = recordHistory(next, {
      gameId: "wheel",
      result: `special:${command.prize}`,
      cpSpent: 0,
      cpAwarded: special.amount,
    });
    return {
      state: next,
      events: [
        {
          type: "casino.wheel.special-claimed",
          prize: command.prize,
          detail: special.detail,
          award: special.wheelAward!,
        },
      ],
      otherEvents: special.completedEvents,
    };
  }
  if (command.type === "casino.higher-lower.start") {
    let next = updateWallet(state, -5);
    next = addPlayedStats(next, "higherLower", 5);
    const generated = drawHigherLowerDeck(next);
    next = generated.state;
    next = {
      ...next,
      permanent: {
        ...next.permanent,
        galacticCasino: {
          ...next.permanent.galacticCasino,
          higherLower: { deck: generated.deck, index: 0, prizeKey: null },
        },
      },
    };
    return {
      state: next,
      events: [
        {
          type: "casino.game.played",
          gameId: "higherLower",
          result: "started",
          cpSpent: 5,
          cpAwarded: 0,
        },
      ],
    };
  }
  if (command.type === "casino.higher-lower.guess") {
    const round = casino.higherLower!;
    const nextIndex = round.index + 1;
    const card = round.deck[nextIndex]!;
    const previous = round.deck[round.index]!;
    const correct =
      command.direction === "higher" ? card.rank > previous.rank : card.rank < previous.rank;
    const replacement = correct
      ? nextIndex >= 2
        ? choosePrize(state, nextIndex - 1)
        : null
      : null;
    let next = replacement?.state ?? state;
    let otherEvents: readonly CasinoCompletionEvent[] = [];
    let outcome: HigherLowerOutcome | undefined;
    if (!correct) {
      next = {
        ...next,
        permanent: {
          ...next.permanent,
          galacticCasino: { ...next.permanent.galacticCasino, higherLower: null },
        },
      };
      next = recordHistory(next, {
        gameId: "higherLower",
        result: "loss",
        cpSpent: 5,
        cpAwarded: 0,
      });
    } else if (nextIndex === 8) {
      const prize = applyHigherLowerPrize(next, replacement!.key);
      outcome = { prizeKey: replacement!.key, won: prize.won, award: prize.award };
      next = prize.state;
      otherEvents = prize.completedEvents;
      next = recordHistory(next, {
        gameId: "higherLower",
        result: prize.won ? `win:${prize.detail}` : `no-award:${prize.detail}`,
        cpSpent: 5,
        cpAwarded: prize.cpAwarded,
      });
      if (prize.won) {
        next = updateStats(next, "higherLowerWon", 1);
        next = markGameWon(next, "higherLower");
      }
      next = {
        ...next,
        permanent: {
          ...next.permanent,
          galacticCasino: { ...next.permanent.galacticCasino, higherLower: null },
        },
      };
    } else {
      next = {
        ...next,
        permanent: {
          ...next.permanent,
          galacticCasino: {
            ...next.permanent.galacticCasino,
            higherLower: { ...round, index: nextIndex, prizeKey: replacement?.key ?? null },
          },
        },
      };
    }
    return {
      state: next,
      events: [
        {
          type: "casino.higher-lower.revealed",
          index: nextIndex,
          card,
          correct,
          ...(outcome === undefined ? {} : { outcome }),
        },
      ],
      otherEvents,
    };
  }
  if (command.type === "casino.higher-lower.cash-out") {
    const round = casino.higherLower!;
    const prize = applyHigherLowerPrize(state, round.prizeKey!);
    let next = prize.state;
    if (prize.won) {
      next = recordHistory(next, {
        gameId: "higherLower",
        result: `cash-out:${prize.detail}`,
        cpSpent: 5,
        cpAwarded: prize.cpAwarded,
      });
      next = updateStats(next, "higherLowerWon", 1);
      next = markGameWon(next, "higherLower");
    } else {
      next = recordHistory(next, {
        gameId: "higherLower",
        result: `no-award:${prize.detail}`,
        cpSpent: 5,
        cpAwarded: prize.cpAwarded,
      });
    }
    next = {
      ...next,
      permanent: {
        ...next.permanent,
        galacticCasino: { ...next.permanent.galacticCasino, higherLower: null },
      },
    };
    return {
      state: next,
      events: [
        {
          type: "casino.game.played",
          gameId: "higherLower",
          result: prize.won ? `cash-out:${prize.detail}` : `no-award:${prize.detail}`,
          cpSpent: 5,
          cpAwarded: prize.cpAwarded,
          revealedCount: round.index + 1,
          higherLowerOutcome: {
            prizeKey: round.prizeKey!,
            won: prize.won,
            award: prize.award,
          },
        },
      ],
      otherEvents: prize.completedEvents,
    };
  }
  if (command.type === "casino.void-seer.resolve") {
    const { outcome } = command;
    let next = state;
    if (outcome.won) {
      next = markGameWon(next, "voidSeer");
      next = updateStats(next, "voidSeerWon", 1);
      if (outcome.tier === 3) {
        const amount = Number(outcome.detail.slice("antimatter:".length));
        next = {
          ...next,
          run: {
            ...next.run,
            space: { ...next.run.space, antimatter: next.run.space.antimatter + amount },
          },
        };
      }
    }
    next = recordHistory(next, {
      gameId: "voidSeer",
      result: outcome.detail,
      cpSpent: VOID_SEER_CP_COST[outcome.tier],
      cpAwarded: 0,
    });
    return {
      state: next,
      events: [
        {
          type: "casino.void-seer.result",
          playId: outcome.playId,
          tier: outcome.tier,
          first: outcome.first,
          second: outcome.second,
          won: outcome.won,
          detail: outcome.detail,
          ...(outcome.clueTemplateIndex === undefined
            ? {}
            : { clueTemplateIndex: outcome.clueTemplateIndex }),
        },
      ],
    };
  }

  const cost = VOID_SEER_CP_COST[command.tier];
  let next = updateWallet(state, -cost);
  next = addPlayedStats(next, "voidSeer", cost);
  const firstDraw = drawInteger(next, 0, VOID_SEER_MAX[command.tier]);
  const secondDraw = drawInteger(firstDraw.state, 0, VOID_SEER_MAX[command.tier]);
  next = secondDraw.state;
  const won = firstDraw.value === secondDraw.value;
  let detail = "loss";
  let clueTemplateIndex: number | undefined;
  if (won) {
    if (command.tier === 3) {
      const draw = drawUnit(next);
      next = draw.state;
      const amount = Math.max(1, Math.floor(next.run.space.antimatter * (0.1 + draw.value * 0.2)));
      detail = `antimatter:${amount}`;
    } else if (command.tier === 1) {
      const eligible = next.run.space.systemProfiles
        .map((profile) => profile.systemId)
        .filter(
          (systemId) =>
            !next.permanent.settledSystemIds.includes(systemId) &&
            !isStarshipOccupyingSystem(next, systemId) &&
            starTypeForSystemSafe(systemId) === "O",
        );
      if (eligible.length) {
        const draw = drawInteger(next, 0, eligible.length - 1);
        next = draw.state;
        detail = `o-type-clue:${eligible[draw.value]}`;
        const templateDraw = drawInteger(next, 0, 2);
        next = templateDraw.state;
        clueTemplateIndex = templateDraw.value;
      } else detail = "o-type-clue";
    } else {
      const eligible = next.permanent.megastructures.ancientManuscripts
        .map((record) => record.manuscriptSystemId)
        .filter(
          (systemId) =>
            !next.permanent.settledSystemIds.includes(systemId) &&
            !isStarshipOccupyingSystem(next, systemId),
        );
      if (eligible.length) {
        const draw = drawInteger(next, 0, eligible.length - 1);
        next = draw.state;
        detail = `manuscript-clue:${eligible[draw.value]}`;
        const templateDraw = drawInteger(next, 0, 9);
        next = templateDraw.state;
        clueTemplateIndex = templateDraw.value;
      } else detail = "manuscript-clue";
    }
  }

  const outcome: VoidSeerOutcome = {
    playId: state.statistics.acceptedCommands + 1,
    tier: command.tier,
    first: firstDraw.value,
    second: secondDraw.value,
    won,
    detail,
    ...(clueTemplateIndex === undefined ? {} : { clueTemplateIndex }),
  };
  return { state: next, events: [{ type: "casino.void-seer.started", outcome }] };
}

function isStarshipOccupyingSystem(state: GameState, systemId: string): boolean {
  const ship = state.run.space.starship;
  return (
    ship.destinationSystemId === systemId &&
    (ship.phase === "travelling" || ship.phase === "orbiting")
  );
}

function starTypeForSystemSafe(systemId: string): string | null {
  return starTypeForSystem(systemId);
}
