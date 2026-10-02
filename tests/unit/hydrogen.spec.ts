import { describe, expect, it } from "vitest";
import {
  HYDROGEN_AUTOBUYER_INITIAL_PRICE,
  hydrogenAutobuyerPrice,
} from "../../src/content/hydrogen";
import { autobuyerUpgradeId } from "../../src/content/ids";
import { transition } from "../../src/engine/commands";
import {
  selectHydrogenAutobuyerPurchase,
  selectHydrogenCollection,
  selectHydrogenSale,
  selectHydrogenStoragePurchase,
} from "../../src/engine/selectors";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import { LOCALE_IDS } from "../../src/content/ids";
import { MESSAGES } from "../../src/i18n/messages";

function withHydrogen(quantity: number): GameState {
  const initial = createInitialGameState();
  return {
    ...initial,
    run: {
      ...initial.run,
      goods: {
        ...initial.run.goods,
        hydrogen: { ...initial.run.goods.hydrogen, quantity },
      },
    },
  };
}

describe("Hydrogen vertical slice rules", () => {
  it("starts with Hydrogen as the only unlocked material and source-backed values", () => {
    const state = createInitialGameState();
    expect(state.run.unlockedResources).toEqual(["hydrogen"]);
    expect(state.run.goods.hydrogen).toMatchObject({
      quantity: 0,
      storageCapacity: 150,
      saleValue: 0.02,
    });
    expect(state.run.cash).toBe(10);
    expect(state.run.researchPoints).toBe(50);
    expect(selectHydrogenCollection(state).enabled).toBe(true);
    expect(selectHydrogenAutobuyerPurchase(state)).toMatchObject({ enabled: false, cost: 50 });
  });

  it("collects one Hydrogen through the engine and refuses collection at capacity", () => {
    const collected = transition(createInitialGameState(), {
      type: "resource.collect",
      goodId: "hydrogen",
    });
    expect(collected.accepted).toBe(true);
    expect(collected.state.run.goods.hydrogen.quantity).toBe(1);
    expect(collected.state.statistics.lifetimeGoodsProduced).toBe(1);

    const full = withHydrogen(150);
    expect(selectHydrogenCollection(full).enabled).toBe(false);
    const rejected = transition(full, { type: "resource.collect", goodId: "hydrogen" });
    expect(rejected.accepted).toBe(false);
    expect(rejected.state).toBe(full);
  });

  it("sells stock for its catalogue value and preserves the source fractional remainder rule", () => {
    const state = withHydrogen(1.8);
    expect(selectHydrogenSale(state, "all")).toMatchObject({
      enabled: true,
      amount: 1,
      cash: 0.02,
    });
    const sold = transition(state, { type: "resource.sell", goodId: "hydrogen", amount: "all" });
    expect(sold.accepted).toBe(true);
    expect(sold.state.run.cash).toBe(10.02);
    expect(sold.state.run.goods.hydrogen.quantity).toBe(0);
    expect(sold.state.statistics.lifetimeCashEarned).toBe(0.02);
  });

  it("buys storage atomically at 149 Hydrogen and doubles the capacity", () => {
    const short = withHydrogen(148.99);
    expect(selectHydrogenStoragePurchase(short)).toMatchObject({ enabled: false, cost: 149 });
    expect(transition(short, { type: "storage.purchase", goodId: "hydrogen" }).state).toBe(short);

    const exact = withHydrogen(149);
    const result = transition(exact, { type: "storage.purchase", goodId: "hydrogen" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.goods.hydrogen).toMatchObject({ quantity: 0, storageCapacity: 300 });
    expect(result.events).toContainEqual({
      type: "storage.increased",
      goodId: "hydrogen",
      capacity: 300,
    });
  });

  it("buys the Hydrogen Compressor at 50, then follows repeated ceiling prices", () => {
    expect(HYDROGEN_AUTOBUYER_INITIAL_PRICE).toBe(50);
    expect([
      hydrogenAutobuyerPrice(0),
      hydrogenAutobuyerPrice(1),
      hydrogenAutobuyerPrice(2),
    ]).toEqual([50, 57, 65]);
    const result = transition(withHydrogen(50), { type: "hydrogen.autobuyer.purchase" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.goods.hydrogen.quantity).toBe(0);
    expect(result.state.run.upgrades[autobuyerUpgradeId("hydrogen", 1)]).toBe(1);
    expect(selectHydrogenAutobuyerPurchase(result.state)).toMatchObject({
      enabled: false,
      cost: 57,
    });
  });

  it("keeps all six first-slice locale catalogues on the same key set", () => {
    const englishKeys = Object.keys(MESSAGES.en).sort();
    for (const locale of LOCALE_IDS) {
      expect(Object.keys(MESSAGES[locale]).sort()).toEqual(englishKeys);
      expect(Object.values(MESSAGES[locale]).every((message) => message.trim().length > 0)).toBe(
        true,
      );
    }
  });
});
