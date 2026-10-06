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
export const ONE_OFF_NEWS_IDS = [
  3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013,
] as const;
export const PRIZE_NEWS_IDS = [
  2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
] as const;
export const MANUSCRIPT_CLUE_NEWS_IDS = [
  4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009,
] as const;
export type ManuscriptClueNewsId = (typeof MANUSCRIPT_CLUE_NEWS_IDS)[number];

export interface RandomEventHistoryEntry {
  readonly id: RandomEventId;
  readonly simulationMs: number;
  readonly negative: boolean;
}

export type RandomEventCounts = Readonly<Record<RandomEventId, number>>;

export function createRandomEventCounts(
  history: readonly unknown[] = [],
): Record<RandomEventId, number> {
  const counts = Object.fromEntries(RANDOM_EVENT_IDS.map((id) => [id, 0])) as Record<
    RandomEventId,
    number
  >;
  for (const entry of history) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const id = (entry as { readonly id?: unknown }).id;
    if (typeof id === "string" && RANDOM_EVENT_IDS.includes(id as RandomEventId))
      counts[id as RandomEventId] += 1;
  }
  return counts;
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
  readonly eventCountsThisRun: RandomEventCounts;
  readonly activeEffects: readonly ActiveRandomEvent[];
}

export interface NewsTickerEntry {
  readonly id: number;
  readonly category: NewsCategory;
  readonly textKey: string;
  readonly simulationMs: number;
  readonly prizeGoodId: string | null;
  /** Pre-rolled when the ticker is generated, matching the amount shown in the source ticker. */
  readonly prizeAmount?: number | null;
  /** The manuscript system named in a clue; absent on ticker entries from older saves. */
  readonly clueSystemId?: string | null;
  readonly claimed: boolean;
}

export interface NewsTickerProgress {
  readonly remainingMs: number;
  readonly entries: readonly NewsTickerEntry[];
  readonly seenIds: readonly number[];
  readonly activatedWackyIds: readonly number[];
  readonly claimedPrizeIds: readonly number[];
  /** One-off reward IDs already offered; independent of whether the reward was claimed. */
  readonly offeredOneOffIds: readonly number[];
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
    eventCountsThisRun: createRandomEventCounts(),
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
    offeredOneOffIds: [],
    resourceStorageMultiplier: 1,
    compoundStorageMultiplier: 1,
    powerCapacityMultiplier: 1,
    powerPlantRateMultiplier: 1,
    autoBuyerRateMultiplier: 1,
  };
}
