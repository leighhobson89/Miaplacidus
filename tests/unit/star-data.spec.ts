import { describe, expect, it } from "vitest";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import {
  antimatterRequiredForDistance,
  createStarDataRows,
  filterStarDataRows,
  sortStarDataRows,
} from "../../src/engine/starData";
import {
  createInitialStarSystemProfiles,
  ensureDiscoveredStarSystemProfiles,
} from "../../src/engine/starSystemProfiles";

describe("star data table model", () => {
  const catalogue = createStarCatalogue();
  const profiles = ensureDiscoveredStarSystemProfiles(
    createInitialStarSystemProfiles(),
    "spica",
    100,
  );
  const rows = createStarDataRows(catalogue, profiles, "spica");

  it("shows generated systems only and recalculates fuel from the current star", () => {
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.name !== "Spica")).toBe(true);
    for (const row of rows) {
      expect(row.antimatterRequired).toBe(antimatterRequiredForDistance(row.distanceLy));
    }
  });

  it("sorts the source table fields in either direction", () => {
    const byDistance = sortStarDataRows(rows, "distance");
    expect(byDistance.map((row) => row.distanceLy)).toEqual(
      [...rows.map((row) => row.distanceLy)].sort((first, second) => first - second),
    );
    const descendingAp = sortStarDataRows(rows, "ascendency", "descending");
    expect(descendingAp.map((row) => row.ascendencyPoints)).toEqual(
      [...rows.map((row) => row.ascendencyPoints)].sort((first, second) => second - first),
    );
    expect(sortStarDataRows(rows, "weather").every((row) => row.weatherChance >= 0)).toBe(true);
  });

  it("filters rows by a name fragment and spectral type", () => {
    const chosen = rows[0]!;
    expect(
      filterStarDataRows(rows, chosen.name.slice(0, 2)).every((row) =>
        row.name.toLocaleLowerCase("en").includes(chosen.name.slice(0, 2).toLocaleLowerCase("en")),
      ),
    ).toBe(true);
    expect(
      filterStarDataRows(rows, "", chosen.starType).every(
        (row) => row.starType === chosen.starType,
      ),
    ).toBe(true);
  });

  it("uses the original fuel curve bounds", () => {
    expect(antimatterRequiredForDistance(1)).toBe(5_000);
    expect(antimatterRequiredForDistance(100)).toBe(155_000);
    expect(antimatterRequiredForDistance(200)).toBe(155_000);
  });

  it("hides factory systems until their manuscript has been reported", () => {
    const row = rows[0]!;
    const hidden = createStarDataRows(catalogue, profiles, "spica", [
      {
        position: 1,
        manuscriptSystemId: "system:80:1",
        factorySystemId: row.systemId,
        reported: false,
      },
    ]);
    const revealed = createStarDataRows(catalogue, profiles, "spica", [
      {
        position: 1,
        manuscriptSystemId: "system:80:1",
        factorySystemId: row.systemId,
        reported: true,
      },
    ]);

    expect(hidden.find((entry) => entry.systemId === row.systemId)).toBeUndefined();
    expect(revealed.find((entry) => entry.systemId === row.systemId)?.revealedFactory).toBe(true);
  });
});
