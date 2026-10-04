import { describe, expect, it } from "vitest";
import {
  createStarCatalogue,
  distanceBetweenStars,
  findStartingSystem,
} from "../../src/content/starCatalogue";
import type { SystemId } from "../../src/content/ids";
import { createInitialGameState, isValidGameState } from "../../src/engine/state";
import {
  generateAncientManuscriptAtStudyMilestone,
  reportAncientManuscriptsAtSystem,
} from "../../src/engine/ancientManuscripts";
import {
  createInitialStarSystemProfiles,
  createStarSystemProfile,
  ensureDiscoveredStarSystemProfiles,
} from "../../src/engine/starSystemProfiles";

describe("persistent star-system profiles", () => {
  it("keeps Spica's fixed source weather and precipitation record", () => {
    const star = findStartingSystem(createStarCatalogue())!;
    const [profile] = createInitialStarSystemProfiles();

    expect(profile).toMatchObject({
      systemId: star.id,
      weatherChances: { sunny: 30, cloudy: 47, rain: 20, volcano: 3 },
      precipitationGoodId: "water",
      ascendencyPoints: 1,
    });
    expect(isValidGameState(createInitialGameState())).toBe(true);
  });

  it("generates stable normalized weather and weighted precipitation per system", () => {
    const star = createStarCatalogue().find((entry) => entry.name === "Sirius")!;
    const first = createStarSystemProfile(star, 43.25);
    const second = createStarSystemProfile(star, 43.25);

    expect(first).toEqual(second);
    expect(Object.values(first.weatherChances).reduce((sum, chance) => sum + chance, 0)).toBe(100);
    expect(first.ascendencyDistanceLy).toBe(43.25);
    expect(["titanium", "water", "glass", "diesel", "concrete", "steel"]).toContain(
      first.precipitationGoodId,
    );
  });

  it("adds profiles once for stars newly inside the study radius", () => {
    const initial = createInitialStarSystemProfiles();
    const firstSurvey = ensureDiscoveredStarSystemProfiles(initial, "spica", 20);
    const repeatedSurvey = ensureDiscoveredStarSystemProfiles(firstSurvey, "spica", 20);
    const widerSurvey = ensureDiscoveredStarSystemProfiles(firstSurvey, "spica", 100);

    expect(firstSurvey.length).toBeGreaterThan(initial.length);
    expect(repeatedSurvey).toBe(firstSurvey);
    expect(widerSurvey.length).toBeGreaterThan(firstSurvey.length);
    expect(new Set(widerSurvey.map((profile) => profile.systemId)).size).toBe(widerSurvey.length);
  });

  it("rejects profiles with incomplete weather totals", () => {
    const initial = createInitialGameState();
    const [profile] = initial.run.space.systemProfiles;
    const invalid = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          systemProfiles: [
            {
              ...profile,
              weatherChances: { ...profile.weatherChances, sunny: 29 },
            },
          ],
        },
      },
    };

    expect(isValidGameState(invalid)).toBe(false);
  });

  it("creates one hidden factory clue per guaranteed study milestone and reports it once", () => {
    const generated = generateAncientManuscriptAtStudyMilestone([], "spica", 0, 100);
    expect(generated).toHaveLength(1);
    expect(generated[0]).toMatchObject({ position: 1, reported: false });
    expect(generated[0]?.manuscriptSystemId).not.toBe(generated[0]?.factorySystemId);
    expect(generateAncientManuscriptAtStudyMilestone(generated, "spica", 100, 100)).toBe(generated);

    const manuscriptSystemId = generated[0]!.manuscriptSystemId;
    const reported = reportAncientManuscriptsAtSystem(generated, manuscriptSystemId);
    expect(reported[0]?.reported).toBe(true);
    expect(reportAncientManuscriptsAtSystem(reported, manuscriptSystemId)).toBe(reported);
    const initial = createInitialGameState();
    expect(
      isValidGameState({
        ...initial,
        permanent: {
          ...initial.permanent,
          megastructures: {
            ...initial.permanent.megastructures,
            ancientManuscripts: generated,
          },
        },
      }),
    ).toBe(true);
  });

  it("assigns manuscript positions in milestone order with their source factory distance bands", () => {
    const catalogue = createStarCatalogue();
    const current = catalogue.find((star) => star.name === "Spica")!;
    const thresholds = [5, 20, 35, 45] as const;
    const factoryBands = [
      [5, 15],
      [16, 25],
      [26, 40],
      [41, 60],
    ] as const;
    const structures = [
      "celestialProcessingCore",
      "plasmaForge",
      "galacticMemoryArchive",
      "dysonSphere",
    ] as const;

    for (let index = 0; index < thresholds.length; index += 1) {
      const existing = structures.slice(0, index).map((megastructureId, priorIndex) => ({
        position: (priorIndex + 1) as 1 | 2 | 3 | 4,
        manuscriptSystemId: `unused:manuscript:${priorIndex}` as SystemId,
        factorySystemId: `unused:factory:${priorIndex}` as SystemId,
        megastructureId,
        reported: false,
      }));
      const generated = generateAncientManuscriptAtStudyMilestone(
        existing,
        current.id,
        0,
        thresholds[index]! + 1,
      );
      const record = generated[index];
      const manuscriptStar = catalogue.find((star) => star.id === record?.manuscriptSystemId);
      const factoryStar = catalogue.find((star) => star.id === record?.factorySystemId);
      const [minimumFactoryDistance, maximumFactoryDistance] = factoryBands[index]!;

      expect(generated).toHaveLength(index + 1);
      expect(record).toMatchObject({
        position: index + 1,
        megastructureId: structures[index],
        reported: false,
      });
      expect(manuscriptStar).toBeDefined();
      expect(factoryStar).toBeDefined();
      expect(manuscriptStar?.id).not.toBe(factoryStar?.id);
      expect(manuscriptStar?.starType).not.toBe("O");
      expect(factoryStar?.starType).not.toBe("O");
      const factoryDistance = factoryStar ? distanceBetweenStars(current, factoryStar) : 0;
      expect(factoryDistance).toBeGreaterThanOrEqual(minimumFactoryDistance);
      expect(factoryDistance).toBeLessThanOrEqual(maximumFactoryDistance);
    }
  });
});
