import { describe, expect, it, vi } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import type { GameState } from "../../src/engine/state";
import { createEconomyFixture } from "../../src/app/testing/economyFixtures";
import { createGameStore } from "../../src/engine/store";
import { philosophyCompoundRecipe } from "../../src/engine/philosophy";
import { economyGoodName } from "../../src/app/economyDisplay";
import { formatNumber } from "../../src/app/numberFormatting";
import {
  compoundCreatedNotice,
  dispatchManualCompoundCreation,
} from "../../src/app/compoundCreatedNotifications";
import { formatEconomyMessage } from "../../src/i18n/economyMessages";

function stateFor(locale: LocaleId, notation: GameState["settings"]["notation"]): GameState {
  const base = createEconomyFixture("full", locale);
  return {
    ...base,
    settings: { ...base.settings, notation },
    run: {
      ...base.run,
      goods: {
        ...base.run.goods,
        hydrogen: { ...base.run.goods.hydrogen, quantity: 100_000 },
        carbon: { ...base.run.goods.carbon, quantity: 100_000 },
        diesel: { ...base.run.goods.diesel, quantity: 0 },
      },
    },
  };
}

describe("manual compound-created notifications", () => {
  it.each(LOCALE_IDS)("uses localized copy and ingredient names for %s", (locale) => {
    const state = stateFor(locale, "standard");
    const event = { type: "compound.created", goodId: "diesel", amount: 2 } as const;
    const notice = compoundCreatedNotice(locale, event, state);
    const parts = new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(
      philosophyCompoundRecipe(state, "diesel").map(
        ({ goodId, amount }) =>
          `${formatNumber(locale, amount * event.amount, 0, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
      ),
    );

    expect(notice).toEqual({
      message: formatEconomyMessage(locale, "compoundCreatedNotice", {
        amount: "2",
        compound: economyGoodName(locale, "diesel"),
        parts,
      }),
      classification: "create",
      type: "info",
      durationMs: 3000,
    });
  });

  it("formats large output and ingredient quantities with the active notation", () => {
    const state = stateFor("en", "condensed");
    const notice = compoundCreatedNotice("en", {
      type: "compound.created",
      goodId: "diesel",
      amount: 1_000,
    }, state);

    expect(notice?.message).toContain("1K");
    expect(notice?.message).toContain("26K Hydrogen");
    expect(notice?.message).toContain("12K Carbon");
  });

  it("routes only an accepted manual create result and respects notification preferences", () => {
    const state = stateFor("en", "standard");
    const store = createGameStore(state, { clock: { now: () => 0 } });
    const notify = vi.fn();

    dispatchManualCompoundCreation(store, "diesel", 2, notify);

    expect(store.getState().run.goods.diesel.quantity).toBe(2);
    expect(store.getState().run.goods.hydrogen.quantity).toBe(100_000 - 52);
    expect(store.getState().run.goods.carbon.quantity).toBe(100_000 - 24);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(
      expect.stringContaining("You created 2 Diesel"),
      { classification: "create", type: "info", durationMs: 3000 },
    );

    const mutedBase = stateFor("en", "standard");
    const muted = {
      ...mutedBase,
      settings: { ...mutedBase.settings, notificationsEnabled: false },
    };
    const mutedStore = createGameStore(muted, { clock: { now: () => 0 } });
    const mutedNotify = vi.fn();
    dispatchManualCompoundCreation(mutedStore, "diesel", 1, mutedNotify);
    expect(mutedStore.getState().run.goods.diesel.quantity).toBe(1);
    expect(mutedNotify).not.toHaveBeenCalled();
  });

  it("does not emit a notice for a rejected manual create", () => {
    const state = stateFor("en", "standard");
    const store = createGameStore(
      {
        ...state,
        run: {
          ...state.run,
          goods: {
            ...state.run.goods,
            hydrogen: { ...state.run.goods.hydrogen, quantity: 0 },
          },
        },
      },
      { clock: { now: () => 0 } },
    );
    const notify = vi.fn();

    dispatchManualCompoundCreation(store, "diesel", 1, notify);

    expect(store.getState().run.goods.diesel.quantity).toBe(0);
    expect(notify).not.toHaveBeenCalled();
  });
});
