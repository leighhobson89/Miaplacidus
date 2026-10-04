import type { EconomicGoodId } from "./ids";

export const CASINO_CP_BASE_COST = 100_000;
export const CASINO_BASE_WIN_PROBABILITY = 0.4;
export const CASINO_GAME_IDS = ["doubleOrNothing", "wheel", "higherLower", "voidSeer"] as const;
export type CasinoGameId = (typeof CASINO_GAME_IDS)[number];
export const CASINO_HISTORY_LIMIT = 30;

/** Exchange values are copied from Cosmic Forge's galacticCasino valueOfOneCP table. */
export const CASINO_CP_VALUES: Readonly<Record<EconomicGoodId | "cash", number>> = {
  hydrogen: 0.02,
  helium: 0.03,
  carbon: 0.1,
  neon: 0.12,
  oxygen: 0.05,
  silicon: 0.08,
  iron: 0.17,
  sodium: 0.1,
  water: 1.6,
  diesel: 0.3,
  glass: 0.8,
  steel: 1.8,
  concrete: 0.8,
  titanium: 12.5,
  cash: 1,
};

export type CasinoSpecialPrize =
  | "special_100cp"
  | "special_100k_research"
  | `special_double_${EconomicGoodId}`
  | "special_rocket_warp"
  | "special_starship_warp"
  | "special_telescope_finish_asteroid_search"
  | "special_telescope_finish_star_study"
  | "special_telescope_finish_void_pillage";

export type CasinoCardSuit = "clubs" | "diamonds" | "hearts" | "spades";
export interface CasinoCard {
  readonly rank: number;
  readonly suit: CasinoCardSuit;
}

export interface HigherLowerState {
  readonly deck: readonly CasinoCard[];
  /** Index of the currently visible card, from zero to eight. */
  readonly index: number;
  /** The tier's seeded prize is held until the player advances to another tier. */
  readonly prizeKey: string | null;
}

export interface CasinoHistoryEntry {
  readonly id: number;
  readonly gameId: CasinoGameId;
  readonly result: string;
  readonly cpSpent: number;
  readonly cpAwarded: number;
}

export interface CasinoLifetimeStats {
  readonly cpSpent: number;
  readonly doubleOrNothingPlayed: number;
  readonly doubleOrNothingWon: number;
  readonly wheelPlayed: number;
  readonly wheelWon: number;
  readonly wheelSpecialWon: number;
  readonly higherLowerPlayed: number;
  readonly higherLowerWon: number;
  readonly voidSeerPlayed: number;
  readonly voidSeerWon: number;
}

export interface CasinoState {
  /** The original wallet lives outside the run tree, but its quantity resets on rebirth. */
  readonly casinoPoints: number;
  readonly gamesWon: readonly CasinoGameId[];
  readonly baseWinProbability: number;
  readonly wheelSpecialPending: boolean;
  readonly higherLower: HigherLowerState | null;
  readonly nextHistoryId: number;
  readonly history: readonly CasinoHistoryEntry[];
  readonly lifetimeStats: CasinoLifetimeStats;
}

export interface CasinoRunStats extends Omit<CasinoLifetimeStats, "cpSpent"> {
  readonly cpSpent: number;
}

export function createEmptyCasinoStats(): CasinoLifetimeStats {
  return {
    cpSpent: 0,
    doubleOrNothingPlayed: 0,
    doubleOrNothingWon: 0,
    wheelPlayed: 0,
    wheelWon: 0,
    wheelSpecialWon: 0,
    higherLowerPlayed: 0,
    higherLowerWon: 0,
    voidSeerPlayed: 0,
    voidSeerWon: 0,
  };
}

export function createInitialCasinoRunStats(): CasinoRunStats {
  return createEmptyCasinoStats();
}

export function createInitialCasinoState(): CasinoState {
  return {
    casinoPoints: 0,
    gamesWon: [],
    baseWinProbability: CASINO_BASE_WIN_PROBABILITY,
    wheelSpecialPending: false,
    higherLower: null,
    nextHistoryId: 1,
    history: [],
    lifetimeStats: createEmptyCasinoStats(),
  };
}

export const HIGHER_LOWER_PRIZE_TIERS: Readonly<Record<number, readonly string[]>> = {
  1: [
    "hilo_cp_5",
    "hilo_cash_boost_small",
    "hilo_research_boost_small",
    "hilo_resource_topup",
    "hilo_compound_topup",
  ],
  2: [
    "hilo_cp_10",
    "hilo_cash_boost_medium",
    "hilo_research_boost_medium",
    "special_double_hydrogen",
    "special_double_carbon",
  ],
  3: [
    "hilo_cp_20",
    "hilo_cash_boost_large",
    "hilo_research_boost_large",
    "special_double_iron",
    "special_double_silicon",
  ],
  4: [
    "hilo_cp_40",
    "hilo_research_flat",
    "hilo_cash_flat",
    "special_double_steel",
    "special_double_concrete",
  ],
  5: [
    "hilo_cp_70",
    "hilo_research_big_flat",
    "special_double_titanium",
    "hilo_timewarp_25_20000",
    "hilo_timewarp_50_15000",
  ],
  6: [
    "hilo_cp_100",
    "hilo_research_mega",
    "hilo_cash_mega",
    "hilo_timewarp_75_15000",
    "hilo_timewarp_100_12000",
  ],
  7: [
    "special_finish_rocket_journey",
    "special_finish_starship_journey",
    "special_telescope_finish_asteroid_search",
    "special_telescope_finish_star_study",
    "hilo_timewarp_200_20000",
  ],
};
