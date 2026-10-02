import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../src/engine/state";
import { transition } from "../../src/engine/commands";
import { canAfford, displayCost, displayQuantity } from "../../src/engine/precision";
import { transactResources } from "../../src/engine/transactions";

describe("foundation engine contracts used by the Hydrogen slice", () => {
  it("shares the precision tolerance across affordability and displayed quantities", () => {
    expect(canAfford(1 - 1e-10, 1)).toBe(true);
    expect(canAfford(1 - 1e-6, 1)).toBe(false);
    expect(displayQuantity(2.99999999995)).toBe(3);
    expect(displayCost(2.00000000001)).toBe(2);
  });

  it("settles production, sales, and the storage clamp in the declared order", () => {
    const state = createInitialGameState();
    const hydrogen = {
      ...state.run.goods.hydrogen,
      storageCapacity: 5,
      quantity: 0,
    };
    const goods = { ...state.run.goods, hydrogen };
    const result = transactResources(goods, 0, 1000, {
      productionPerSecond: { hydrogen: 10 },
      salesPerSecond: { hydrogen: 3 },
    });
    expect(result.cash).toBe(0.06);
    expect(result.goods.hydrogen.quantity).toBe(5);
    expect(result.events.map((event) => event.type)).toEqual([
      "resource.produced",
      "resource.sold",
      "storage.clamped",
    ]);
  });

  it("rejects a cash-and-material purchase without a partial charge", () => {
    const initial = createInitialGameState();
    const command = {
      type: "upgrade.purchase" as const,
      upgradeId: "battery1" as const,
      cost: { cash: 5, materials: [{ goodId: "hydrogen" as const, amount: 3 }] },
    };
    const rejected = transition(initial, command);
    expect(rejected.accepted).toBe(false);
    expect(rejected.state).toBe(initial);
    expect(rejected.events).toEqual([]);

    const funded = {
      ...initial,
      run: {
        ...initial.run,
        goods: {
          ...initial.run.goods,
          hydrogen: { ...initial.run.goods.hydrogen, quantity: 3 },
        },
      },
    };
    const accepted = transition(funded, command);
    expect(accepted.accepted).toBe(true);
    expect(accepted.state.run.cash).toBe(5);
    expect(accepted.state.run.goods.hydrogen.quantity).toBe(0);
  });

  it("advances a one-shot timer once and treats later completion as an idempotent no-op", () => {
    let state = createInitialGameState();
    state = transition(state, {
      type: "timer.add",
      timerId: "research:hydrogen-intro",
      domain: "research",
      durationMs: 1000,
    }).state;
    state = transition(state, {
      type: "clock.advance",
      input: { wallNowMs: 0, foreground: true },
    }).state;
    const advanced = transition(state, {
      type: "clock.advance",
      input: { wallNowMs: 1000, foreground: true },
    });
    expect(advanced.state.run.timers["research:hydrogen-intro"]?.status).toBe("complete");
    expect(advanced.events.filter((event) => event.type === "timer.completed")).toHaveLength(1);
    const repeated = transition(advanced.state, {
      type: "timer.complete",
      timerId: "research:hydrogen-intro",
    });
    expect(repeated.events).toEqual([]);
    expect(repeated.state.statistics.completedTimers).toBe(1);
  });

  it("drains a long foreground interval in bounded catch-up batches", () => {
    const initial = createInitialGameState();
    const plan = { productionPerSecond: { hydrogen: 2 } } as const;
    let state = transition(initial, {
      type: "clock.advance",
      input: { wallNowMs: 0, foreground: true },
      tickPlan: plan,
    }).state;
    state = transition(state, {
      type: "clock.advance",
      input: { wallNowMs: 3000, foreground: true },
      tickPlan: plan,
    }).state;
    expect(state.run.goods.hydrogen.quantity).toBe(2);
    expect(state.run.clock.pendingForegroundMs).toBe(2000);
    for (let batch = 0; batch < 2; batch += 1) {
      state = transition(state, {
        type: "clock.advance",
        input: { wallNowMs: 3000, foreground: true },
        tickPlan: plan,
      }).state;
    }
    expect(state.run.goods.hydrogen.quantity).toBe(6);
    expect(state.run.clock.pendingForegroundMs).toBe(0);
  });
});
