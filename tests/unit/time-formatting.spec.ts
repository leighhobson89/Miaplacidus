import { describe, expect, it } from "vitest";
import { formatCountdown, formatDuration } from "../../src/app/timeFormatting";

describe("duration formatting", () => {
  const oneThousandDays = 1_000 * 24 * 60 * 60 * 1_000;

  it("uses the selected number notation for duration components", () => {
    expect(formatDuration("en", oneThousandDays, "condensed")).toContain("1Kd");
    expect(formatDuration("en", oneThousandDays, "standard")).toContain("1,000d");
    expect(formatDuration("en", oneThousandDays, "scientific")).toContain("1E3d");
  });

  it("localizes abbreviated decimals and rounds countdowns up to a second", () => {
    expect(formatDuration("es", 1_100 * 24 * 60 * 60 * 1_000, "condensed")).toContain("1,1Kd");
    expect(formatCountdown("en", 1_001, "standard")).toBe("2s");
  });
});
