import { describe, expect, it } from "vitest";
import { CASINO_CP_BASE_COST, CASINO_CP_VALUES } from "../../src/content/galacticCasino";
import { LOCALE_IDS } from "../../src/content/ids";
import { casinoFailureText } from "../../src/i18n/casinoMessages";
import { createInitialGameState } from "../../src/engine/state";
import { selectCasinoEntryCost, selectCasinoPointPurchase } from "../../src/engine/selectors";

function casinoReadyState(cash: number) {
  const initial = createInitialGameState({ pioneerName: "Affordance", seed: 101 });
  return {
    ...initial,
    run: {
      ...initial.run,
      cash,
      space: { ...initial.run.space, ascendencyAwardedThisRun: true },
    },
  };
}

describe("selector-backed Casino action affordances", () => {
  it("previews the same exact payment cost that the purchase precondition checks", () => {
    const expectedCost = Math.ceil(CASINO_CP_BASE_COST / CASINO_CP_VALUES.cash);
    const enough = selectCasinoPointPurchase(casinoReadyState(expectedCost), "cash", 1);
    const short = selectCasinoPointPurchase(casinoReadyState(expectedCost - 1), "cash", 1);

    expect(enough).toMatchObject({ enabled: true, cost: expectedCost, available: expectedCost });
    expect(short).toMatchObject({
      enabled: false,
      cost: expectedCost,
      available: expectedCost - 1,
      failure: { code: "casino-insufficient-stock" },
    });
  });

  it("returns the selected CP entry fee for each paid game", () => {
    expect(selectCasinoEntryCost({ type: "casino.double-or-nothing.play", stake: 23 })).toBe(23);
    expect(selectCasinoEntryCost({ type: "casino.wheel.spin" })).toBe(1);
    expect(selectCasinoEntryCost({ type: "casino.higher-lower.start" })).toBe(5);
    expect(selectCasinoEntryCost({ type: "casino.void-seer.play", tier: 3 })).toBe(15);
    expect(selectCasinoEntryCost({ type: "casino.higher-lower.cash-out" })).toBeNull();
  });

  it("localizes disabled Casino reasons in all supported locales without leaving placeholders", () => {
    for (const locale of LOCALE_IDS) {
      const cpReason = casinoFailureText(locale, "casino-insufficient-cp", {
        required: "5",
        available: "3",
      });
      const paymentReason = casinoFailureText(locale, "casino-insufficient-stock", {
        required: "20",
        available: "10",
        payment: "Hydrogen",
      });
      expect(cpReason).toContain("5");
      expect(cpReason).toContain("3");
      expect(cpReason).not.toMatch(/\{(?:required|available|payment)\}/);
      expect(paymentReason).toContain("20");
      expect(paymentReason).toContain("10");
      expect(paymentReason).toContain("Hydrogen");
      expect(paymentReason).not.toMatch(/\{(?:required|available|payment)\}/);
    }
  });
});
