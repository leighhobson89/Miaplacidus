export const RANDOM_EVENT_IDS = [
  "powerPlantExplosion",
  "batteryExplosion",
  "scienceTheft",
  "researchBreakthrough",
  "rocketInstantArrival",
  "starshipLostInSpace",
  "antimatterReaction",
  "stockLoss",
  "galacticMarketLockdown",
  "endlessSummer",
  "minerBrokeDown",
  "supplyChainDisruption",
  "blackHoleInstability",
] as const;
export type RandomEventId = (typeof RANDOM_EVENT_IDS)[number];

export const NEWS_CATEGORIES = ["wacky", "prize", "oneOff", "manuscriptClue", "headline"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const WACKY_NEWS_IDS = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007] as const;
export const PRIZE_NEWS_IDS = [
  2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
] as const;
export const MANUSCRIPT_CLUE_NEWS_IDS = [
  4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009,
] as const;

export interface RandomEventHistoryEntry {
  readonly id: RandomEventId;
  readonly simulationMs: number;
  readonly negative: boolean;
}

export interface ActiveRandomEvent {
  readonly id: RandomEventId;
  readonly remainingMs: number;
  readonly multiplier: number;
  /** Identifies the single production source affected by targeted events. */
  readonly targetId: string | null;
  readonly powerMultiplier: number;
  readonly durationMultiplier: number;
  /** Milliseconds until the next one-minute instability multiplier change. */
  readonly nextShiftInMs: number;
}

export interface RandomEventProgress {
  readonly elapsedMs: number;
  readonly intervalMs: number;
  readonly halfwayAttempted: boolean;
  readonly probabilities: Readonly<Record<RandomEventId, number>>;
  readonly history: readonly RandomEventHistoryEntry[];
  readonly activeEffects: readonly ActiveRandomEvent[];
}

export interface NewsTickerEntry {
  readonly id: number;
  readonly category: NewsCategory;
  readonly textKey: string;
  readonly simulationMs: number;
  readonly prizeGoodId: string | null;
  readonly claimed: boolean;
}

export interface NewsTickerProgress {
  readonly remainingMs: number;
  readonly entries: readonly NewsTickerEntry[];
  readonly seenIds: readonly number[];
  readonly activatedWackyIds: readonly number[];
  readonly claimedPrizeIds: readonly number[];
  readonly resourceStorageMultiplier: number;
  readonly compoundStorageMultiplier: number;
  readonly powerCapacityMultiplier: number;
  readonly powerPlantRateMultiplier: number;
  readonly autoBuyerRateMultiplier: number;
}

export function createInitialRandomEventProgress(): RandomEventProgress {
  const probabilities = Object.fromEntries(
    RANDOM_EVENT_IDS.map((id) => [
      id,
      id === "scienceTheft" ||
      id === "researchBreakthrough" ||
      id === "stockLoss" ||
      id === "endlessSummer"
        ? 0.5
        : id === "rocketInstantArrival"
          ? 0.2
          : id === "starshipLostInSpace" || id === "antimatterReaction"
            ? 0.1
            : id === "galacticMarketLockdown"
              ? 0.15
              : 0.3,
    ]),
  ) as Record<RandomEventId, number>;
  return {
    elapsedMs: 0,
    intervalMs: 60 * 60_000,
    halfwayAttempted: false,
    probabilities,
    history: [],
    activeEffects: [],
  };
}

export function createInitialNewsTickerProgress(): NewsTickerProgress {
  return {
    remainingMs: 27_500,
    entries: [],
    seenIds: [],
    activatedWackyIds: [],
    claimedPrizeIds: [],
    resourceStorageMultiplier: 1,
    compoundStorageMultiplier: 1,
    powerCapacityMultiplier: 1,
    powerPlantRateMultiplier: 1,
    autoBuyerRateMultiplier: 1,
  };
}
