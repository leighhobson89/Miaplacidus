import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../src/engine/state";
import { formatCurrency } from "../../src/app/currencyFormatting";
import { formatNumber } from "../../src/app/numberFormatting";

describe("number formatting", () => {
  it("defaults to Condensed and follows the Cosmic Forge abbreviation ladder", () => {
    expect(createInitialGameState({ locale: "en" }).settings.notation).toBe("condensed");
    expect(formatNumber("en", 999)).toBe("999");
    expect(formatNumber("en", 999.9)).toBe("999");
    expect(formatNumber("en", 1_000)).toBe("1K");
    expect(formatNumber("en", 1_099)).toBe("1K");
    expect(formatNumber("en", 1_100)).toBe("1.1K");
    expect(formatNumber("en", 1_999)).toBe("1.9K");
    expect(formatNumber("en", 999_999)).toBe("999.9K");
    expect(formatNumber("en", 1_000_000)).toBe("1M");
    expect(formatNumber("en", 1_900_000)).toBe("1.9M");
    expect(formatNumber("en", 1_000_000_000)).toBe("1B");
    expect(formatNumber("en", 1_000_000_000_000)).toBe("1e12");
  });

  it("keeps small decimal readouts localized and negatives un-abbreviated", () => {
    expect(formatNumber("en", 0.42, 2)).toBe("0.42");
    expect(formatNumber("es", 1_100, 0, "condensed")).toBe("1,1K");
    expect(formatNumber("en", -1_000)).toBe("-1,000");
  });

  it("continues to support Standard and Scientific notation", () => {
    expect(formatNumber("en", 1_000, 0, "standard")).toBe("1,000");
    expect(formatNumber("en", 1_000, 0, "scientific")).toBe("1E3");
  });

  it("condenses large currency values without losing the locale symbol placement", () => {
    expect(formatCurrency("en", 1_000, "usd", 2, "condensed")).toBe("$1K");
    expect(formatCurrency("en", 1_100, "usd", 2, "condensed")).toBe("$1.1K");
    expect(formatCurrency("en", 1_000_000, "usd", 2, "condensed")).toBe("$1M");
    expect(formatCurrency("en", 1_000, "usd", 2, "standard")).toBe("$1,000.00");
  });
});
