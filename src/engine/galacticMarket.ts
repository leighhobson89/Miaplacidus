import {
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  isEconomicGoodId,
  type EconomicGoodId,
  type MaterialId,
} from "../content/ids";
import { GALACTIC_MARKET_CATALOG, type GalacticMarketState } from "../content/galacticMarket";
import { addLifetimeCount } from "./statistics";
import type { GameState } from "./state";
import { nextRandomInteger } from "./random";

export type GalacticMarketCommand =
  | {
      readonly type: "meta.market.trade";
      readonly outgoingGoodId: EconomicGoodId;
      readonly incomingGoodId: EconomicGoodId;
      readonly quantity: number;
    }
  | { readonly type: "meta.market.sell-ap"; readonly quantity: 1 | 5 | 10 }
  | { readonly type: "meta.market.liquidate" };

export type GalacticMarketFailure =
  | { readonly code: "market-not-unlocked"; readonly messageKey: "meta.market.not-unlocked" }
  | { readonly code: "market-locked"; readonly messageKey: "meta.market.locked" }
  | { readonly code: "market-invalid-trade"; readonly messageKey: "meta.market.invalid-trade" }
  | { readonly code: "market-good-locked"; readonly messageKey: "meta.market.good-locked" }
  | {
      readonly code: "market-insufficient-stock";
      readonly messageKey: "meta.market.insufficient-stock";
    }
  | { readonly code: "market-capacity"; readonly messageKey: "meta.market.capacity" }
  | { readonly code: "market-insufficient-ap"; readonly messageKey: "meta.market.insufficient-ap" }
  | { readonly code: "market-liquidated"; readonly messageKey: "meta.market.liquidated" }
  | { readonly code: "market-no-liquidation"; readonly messageKey: "meta.market.no-liquidation" };

export type GalacticMarketEvent =
  | {
      readonly type: "meta.market.traded";
      readonly outgoingGoodId: EconomicGoodId;
      readonly outgoingQuantity: number;
      readonly commissionQuantity: number;
      readonly incomingGoodId: EconomicGoodId;
      readonly incomingQuantity: number;
    }
  | { readonly type: "meta.market.ap-sold"; readonly quantity: number; readonly cashGained: number }
  | { readonly type: "meta.market.liquidated"; readonly value: number; readonly apGained: number };

export interface GalacticMarketQuote {
  readonly outgoingPrice: number;
  readonly incomingPrice: number;
  readonly grossIncoming: number;
  readonly commissionQuantity: number;
  readonly incomingQuantity: number;
}

export function isGalacticMarketCommand(value: {
  readonly type: string;
}): value is GalacticMarketCommand {
  return (
    value.type === "meta.market.trade" ||
    value.type === "meta.market.sell-ap" ||
    value.type === "meta.market.liquidate"
  );
}

function isUnlockedGood(state: GameState, goodId: EconomicGoodId): boolean {
  return (
    goodId in GALACTIC_MARKET_CATALOG &&
    (state.run.unlockedResources.includes(goodId as (typeof state.run.unlockedResources)[number]) ||
      state.run.economy.unlockedCompounds.includes(
        goodId as (typeof state.run.economy.unlockedCompounds)[number],
      ))
  );
}

function adjustedPrice(market: GalacticMarketState, goodId: EconomicGoodId): number {
  const profile = market.goods[goodId];
  return Math.max(0, GALACTIC_MARKET_CATALOG[goodId].baseValue * (1 + profile.marketBias / 100));
}

export function galacticMarketUnitPrice(state: GameState, goodId: EconomicGoodId): number {
  return adjustedPrice(state.permanent.galacticMarket, goodId);
}

export function quoteGalacticTrade(
  state: GameState,
  outgoingGoodId: EconomicGoodId,
  incomingGoodId: EconomicGoodId,
  quantity: number,
): GalacticMarketQuote | null {
  if (
    !isEconomicGoodId(outgoingGoodId) ||
    !isEconomicGoodId(incomingGoodId) ||
    outgoingGoodId === incomingGoodId ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0
  ) {
    return null;
  }
  const outgoingPrice = adjustedPrice(state.permanent.galacticMarket, outgoingGoodId);
  const incomingPrice = adjustedPrice(state.permanent.galacticMarket, incomingGoodId);
  if (outgoingPrice <= 0 || incomingPrice <= 0) return null;
  const grossIncoming = Math.floor((quantity * outgoingPrice) / incomingPrice);
  const commissionQuantity = Math.floor(
    (state.permanent.galacticMarket.commissionPercent / 100) * quantity,
  );
  const incomingQuantity = Math.max(
    0,
    Math.floor(grossIncoming - commissionQuantity * (grossIncoming / quantity)),
  );
  if (!Number.isSafeInteger(grossIncoming) || !Number.isSafeInteger(incomingQuantity)) return null;
  return { outgoingPrice, incomingPrice, grossIncoming, commissionQuantity, incomingQuantity };
}

export function marketLiquidationPreview(state: GameState): {
  readonly value: number;
  readonly ap: number;
} {
  const goodsValue = ECONOMIC_GOOD_IDS.reduce(
    (total, goodId) => total + state.run.goods[goodId].quantity * state.run.goods[goodId].saleValue,
    0,
  );
  const value = goodsValue + state.run.cash / 10;
  return {
    value,
    ap: Math.floor(value / state.permanent.galacticMarket.apBuyPrice),
  };
}

function tradeFailure(
  state: GameState,
  command: Extract<GalacticMarketCommand, { type: "meta.market.trade" }>,
): GalacticMarketFailure | null {
  if (state.run.marketLockdownRemainingMs > 0)
    return { code: "market-locked", messageKey: "meta.market.locked" };
  if (
    !isEconomicGoodId(command.outgoingGoodId) ||
    !isEconomicGoodId(command.incomingGoodId) ||
    command.outgoingGoodId === command.incomingGoodId ||
    !Number.isSafeInteger(command.quantity) ||
    command.quantity <= 0
  ) {
    return { code: "market-invalid-trade", messageKey: "meta.market.invalid-trade" };
  }
  if (
    !isUnlockedGood(state, command.outgoingGoodId) ||
    !isUnlockedGood(state, command.incomingGoodId)
  )
    return { code: "market-good-locked", messageKey: "meta.market.good-locked" };
  if (state.run.goods[command.outgoingGoodId].quantity < command.quantity)
    return { code: "market-insufficient-stock", messageKey: "meta.market.insufficient-stock" };
  const quote = quoteGalacticTrade(
    state,
    command.outgoingGoodId,
    command.incomingGoodId,
    command.quantity,
  );
  if (!quote || quote.incomingQuantity <= 0)
    return { code: "market-invalid-trade", messageKey: "meta.market.invalid-trade" };
  const incomingGood = state.run.goods[command.incomingGoodId];
  if (incomingGood.quantity + quote.incomingQuantity > incomingGood.storageCapacity)
    return { code: "market-capacity", messageKey: "meta.market.capacity" };
  return null;
}

export function checkGalacticMarketCommand(
  state: GameState,
  command: GalacticMarketCommand,
): GalacticMarketFailure | null {
  if (!state.run.space.ascendencyAwardedThisRun && state.permanent.rebirthCount === 0)
    return { code: "market-not-unlocked", messageKey: "meta.market.not-unlocked" };
  if (command.type === "meta.market.trade") return tradeFailure(state, command);
  if (state.run.marketLockdownRemainingMs > 0)
    return { code: "market-locked", messageKey: "meta.market.locked" };
  if (command.type === "meta.market.sell-ap") {
    if (![1, 5, 10].includes(command.quantity))
      return { code: "market-invalid-trade", messageKey: "meta.market.invalid-trade" };
    return state.permanent.ascendencyPoints >= command.quantity
      ? null
      : { code: "market-insufficient-ap", messageKey: "meta.market.insufficient-ap" };
  }
  if (state.run.marketLiquidatedThisRun)
    return { code: "market-liquidated", messageKey: "meta.market.liquidated" };
  return marketLiquidationPreview(state).ap > 0
    ? null
    : { code: "market-no-liquidation", messageKey: "meta.market.no-liquidation" };
}

function updateBias(
  market: GalacticMarketState,
  goodId: EconomicGoodId,
  delta: number,
): GalacticMarketState {
  const profile = market.goods[goodId];
  return {
    ...market,
    goods: {
      ...market.goods,
      [goodId]: { ...profile, marketBias: profile.marketBias + delta },
    },
  };
}

export function applyGalacticMarketCommand(
  state: GameState,
  command: GalacticMarketCommand,
): { readonly state: GameState; readonly events: readonly GalacticMarketEvent[] } {
  if (command.type === "meta.market.trade") {
    const quote = quoteGalacticTrade(
      state,
      command.outgoingGoodId,
      command.incomingGoodId,
      command.quantity,
    )!;
    let market = state.permanent.galacticMarket;
    const outgoingProfile = market.goods[command.outgoingGoodId];
    const incomingProfile = market.goods[command.incomingGoodId];
    if (outgoingProfile.tradeVolume !== 0) {
      market = updateBias(
        market,
        command.outgoingGoodId,
        -((command.quantity / outgoingProfile.tradeVolume) * 100),
      );
    }
    if (incomingProfile.tradeVolume !== 0) {
      market = updateBias(
        market,
        command.incomingGoodId,
        (quote.grossIncoming / incomingProfile.tradeVolume) * 100,
      );
    }
    const commissionRoll = nextRandomInteger(state.run.random, 6, 13);
    market = {
      ...market,
      commissionPercent: Math.min(80, market.commissionPercent + commissionRoll.value),
      history: [
        ...market.history,
        {
          id: market.nextTradeId,
          simulationMs: state.run.clock.simulationMs,
          outgoingGoodId: command.outgoingGoodId,
          outgoingQuantity: command.quantity,
          commissionQuantity: quote.commissionQuantity,
          incomingGoodId: command.incomingGoodId,
          incomingQuantity: quote.incomingQuantity,
        },
      ].slice(-30),
      nextTradeId: market.nextTradeId + 1,
    };
    const outgoing = state.run.goods[command.outgoingGoodId];
    const incoming = state.run.goods[command.incomingGoodId];
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          random: commissionRoll.state,
          goods: {
            ...state.run.goods,
            [command.outgoingGoodId]: {
              ...outgoing,
              quantity: outgoing.quantity - command.quantity,
            },
            [command.incomingGoodId]: {
              ...incoming,
              quantity: incoming.quantity + quote.incomingQuantity,
            },
          },
        },
        permanent: { ...state.permanent, galacticMarket: market },
      },
      events: [
        {
          type: "meta.market.traded",
          outgoingGoodId: command.outgoingGoodId,
          outgoingQuantity: command.quantity,
          commissionQuantity: quote.commissionQuantity,
          incomingGoodId: command.incomingGoodId,
          incomingQuantity: quote.incomingQuantity,
        },
      ],
    };
  }
  if (command.type === "meta.market.sell-ap") {
    const cashGained = command.quantity * state.permanent.galacticMarket.apSellPrice;
    return {
      state: {
        ...state,
        run: { ...state.run, cash: state.run.cash + cashGained },
        permanent: {
          ...state.permanent,
          ascendencyPoints: state.permanent.ascendencyPoints - command.quantity,
        },
      },
      events: [{ type: "meta.market.ap-sold", quantity: command.quantity, cashGained }],
    };
  }
  const preview = marketLiquidationPreview(state);
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((goodId) => [goodId, { ...state.run.goods[goodId], quantity: 0 }]),
  ) as GameState["run"]["goods"];
  return {
    state: {
      ...state,
      run: { ...state.run, cash: 0, goods, marketLiquidatedThisRun: true },
      permanent: {
        ...state.permanent,
        ascendencyPoints: state.permanent.ascendencyPoints + preview.ap,
      },
      statistics: {
        ...state.statistics,
        lifetimeAscendencyPointsGained: addLifetimeCount(
          state.statistics.lifetimeAscendencyPointsGained,
          preview.ap,
        ),
      },
    },
    events: [{ type: "meta.market.liquidated", value: preview.value, apGained: preview.ap }],
  };
}

function decayBias(bias: number, ticks: number): number {
  let magnitude = Math.abs(bias);
  let remaining = ticks;
  for (const [threshold, step] of [
    [1_000, 50],
    [100, 5],
    [10, 0.5],
    [0, 0.05],
  ] as const) {
    if (remaining <= 0 || magnitude <= threshold) continue;
    const ticksToThreshold = Math.ceil((magnitude - threshold) / step);
    const used = Math.min(remaining, ticksToThreshold);
    magnitude = Math.max(0, magnitude - used * step);
    remaining -= used;
  }
  return magnitude < 1e-10 ? 0 : Math.sign(bias) * magnitude;
}

function marketVolumeChange(quantity: number, randomValue: number): number {
  if (quantity === 0) return 100;
  const lowerBound = Math.max(quantity * -10, -1_000_000);
  const upperBound = Math.min(quantity * 10, 10_000_000);
  let change = Math.floor(randomValue * (upperBound - lowerBound + 1)) + lowerBound;
  if (quantity + change > 10_000_000) change = 10_000_000 - quantity;
  else if (quantity + change < -1_000_000) change = -1_000_000 - quantity;
  return change;
}

function boundedTradeVolume(value: number): number {
  return Math.max(-1_000_000, Math.min(10_000_000, value));
}

export function advanceGalacticMarket(state: GameState, wallElapsedMs: number): GameState {
  if (!Number.isFinite(wallElapsedMs) || wallElapsedMs <= 0) return state;
  let market = state.permanent.galacticMarket;
  let random = state.run.random;
  const elapsedMs = Math.min(wallElapsedMs, 86_400_000);
  const elapsedAfterNextBiasTick = elapsedMs - market.biasTickRemainingMs;
  const biasTicks =
    elapsedAfterNextBiasTick < 0 ? 0 : 1 + Math.floor(elapsedAfterNextBiasTick / 10_000);
  const biasRemainder =
    elapsedAfterNextBiasTick < 0 ? -elapsedAfterNextBiasTick : elapsedAfterNextBiasTick % 10_000;
  const biasTickRemainingMs =
    elapsedAfterNextBiasTick < 0
      ? biasRemainder
      : biasRemainder === 0
        ? 10_000
        : 10_000 - biasRemainder;
  if (biasTicks > 0) {
    const goods = { ...market.goods };
    for (const goodId of ECONOMIC_GOOD_IDS) {
      const profile = goods[goodId];
      goods[goodId] = { ...profile, marketBias: decayBias(profile.marketBias, biasTicks) };
    }
    market = { ...market, goods };
  }
  let cycleElapsedMs = elapsedMs;
  let cycleRemainingMs = market.cycleRemainingMs;
  let cycleEvents = 0;
  while (cycleElapsedMs >= cycleRemainingMs) {
    cycleElapsedMs -= cycleRemainingMs;
    cycleEvents += 1;
    if (cycleEvents > 500) {
      cycleRemainingMs = 180_000;
      cycleElapsedMs = 0;
      break;
    }
    const sellPrice = nextRandomInteger(random, 60_000, 140_000);
    const buyPrice = nextRandomInteger(sellPrice.state, 1_000_000, 1_600_000);
    const duration = nextRandomInteger(buyPrice.state, 2, 4);
    random = duration.state;
    market = {
      ...market,
      commissionPercent: Math.max(10, market.commissionPercent - 20),
      apSellPrice: sellPrice.value,
      apBuyPrice: buyPrice.value,
    };
    cycleRemainingMs = duration.value * 60_000;
    for (const goodId of ECONOMIC_GOOD_IDS) {
      const changeRoll = nextRandomInteger(random, 0, 0xffff_ffff);
      random = changeRoll.state;
      const quantity = state.run.goods[goodId].quantity;
      const change = marketVolumeChange(quantity, changeRoll.value / 0x1_0000_0000);
      const profile = market.goods[goodId];
      const isMaterial = MATERIAL_IDS.includes(goodId as MaterialId);
      const biasAdjustment =
        profile.tradeVolume === 0
          ? 0
          : (Math.abs(change / profile.tradeVolume) * Math.abs(profile.marketBias)) /
            (isMaterial ? 100 : 1);
      market = {
        ...market,
        goods: {
          ...market.goods,
          [goodId]: {
            ...profile,
            tradeVolume: boundedTradeVolume(profile.tradeVolume + change),
            marketBias: profile.marketBias - Math.sign(change) * biasAdjustment,
          },
        },
      };
    }
  }
  cycleRemainingMs -= cycleElapsedMs;
  const marketLockdownRemainingMs = Math.max(
    0,
    state.run.marketLockdownRemainingMs - wallElapsedMs,
  );
  if (
    market === state.permanent.galacticMarket &&
    random === state.run.random &&
    marketLockdownRemainingMs === state.run.marketLockdownRemainingMs
  ) {
    return state;
  }
  return {
    ...state,
    run: { ...state.run, random, marketLockdownRemainingMs },
    permanent: {
      ...state.permanent,
      galacticMarket: { ...market, cycleRemainingMs, biasTickRemainingMs },
    },
  };
}
