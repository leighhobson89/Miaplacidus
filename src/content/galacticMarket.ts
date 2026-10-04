import { ECONOMIC_GOOD_IDS, type EconomicGoodId } from "./ids";

export interface MarketGoodDefinition {
  readonly baseValue: number;
}

export const GALACTIC_MARKET_CATALOG: Readonly<Record<EconomicGoodId, MarketGoodDefinition>> = {
  hydrogen: { baseValue: 0.02 },
  helium: { baseValue: 0.01 },
  carbon: { baseValue: 0.1 },
  neon: { baseValue: 0.06 },
  oxygen: { baseValue: 0.05 },
  sodium: { baseValue: 0.1 },
  silicon: { baseValue: 0.08 },
  iron: { baseValue: 0.12 },
  diesel: { baseValue: 0.2 },
  glass: { baseValue: 0.8 },
  steel: { baseValue: 1.2 },
  concrete: { baseValue: 0.8 },
  water: { baseValue: 0.08 },
  titanium: { baseValue: 6 },
};

export interface GalacticMarketGoodState {
  readonly marketBias: number;
  readonly tradeVolume: number;
  readonly eventModifier: number;
}

export interface GalacticMarketHistoryEntry {
  readonly id: number;
  readonly simulationMs: number;
  readonly outgoingGoodId: EconomicGoodId;
  readonly outgoingQuantity: number;
  readonly commissionQuantity: number;
  readonly incomingGoodId: EconomicGoodId;
  readonly incomingQuantity: number;
}

export interface GalacticMarketState {
  readonly goods: Readonly<Record<EconomicGoodId, GalacticMarketGoodState>>;
  readonly commissionPercent: number;
  readonly apBuyPrice: number;
  readonly apSellPrice: number;
  readonly cycleRemainingMs: number;
  readonly biasTickRemainingMs: number;
  readonly nextTradeId: number;
  readonly history: readonly GalacticMarketHistoryEntry[];
}

export function createInitialGalacticMarketState(seed = 0): GalacticMarketState {
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((goodId) => [
      goodId,
      { marketBias: 0, tradeVolume: 100_000, eventModifier: 0 },
    ]),
  ) as Record<EconomicGoodId, GalacticMarketGoodState>;
  return {
    goods,
    commissionPercent: 10,
    apBuyPrice: 1_000_000,
    apSellPrice: 100_000,
    cycleRemainingMs: (2 + (Math.abs(seed) % 3)) * 60_000,
    biasTickRemainingMs: 10_000,
    nextTradeId: 1,
    history: [],
  };
}

export function resetMarketCyclePrices(market: GalacticMarketState): GalacticMarketState {
  return {
    ...market,
    commissionPercent: 10,
    apBuyPrice: 1_000_000,
    apSellPrice: 100_000,
  };
}
