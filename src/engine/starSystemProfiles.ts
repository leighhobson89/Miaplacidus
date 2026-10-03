import { GALAXY_SEED_DEFAULT, type CompoundId } from "../content/ids";
import { STAR_WEATHER_TYPES, type StarSystemProfile, type StarWeatherType } from "../content/space";
import {
  createStarCatalogue,
  distanceBetweenStars,
  findStartingSystem,
  type StarCatalogueEntry,
} from "../content/starCatalogue";
import { createSystemRandom } from "./systemRandom";

const PRECIPITATION_WEIGHTS: readonly (readonly [CompoundId, number])[] = [
  ["titanium", 4],
  ["water", 40],
  ["glass", 19],
  ["diesel", 30],
  ["concrete", 0],
  ["steel", 7],
];

const SPICA_PROFILE_DATA = {
  weatherChances: { sunny: 30, cloudy: 47, rain: 20, volcano: 3 },
  precipitationGoodId: "water",
  ascendencyPoints: 1,
  ascendencyDistanceLy: 0,
} as const;

function ascendencyPoints(distanceLy: number, random: () => number): number {
  if (distanceLy >= 97.5) return 50;
  const normalizedDistance = Math.min(1, Math.max(0, (distanceLy - 1) / 99));
  const points = Math.min(49, Math.round(1 + 49 * normalizedDistance ** 2.5));
  if (points > 1 && random() < 0.2) {
    return Math.max(1, points - Math.ceil(random() * Math.max(1, points * 0.1)));
  }
  return points;
}

function weatherChances(random: () => number): Record<StarWeatherType, number> {
  const weights = Object.fromEntries(
    STAR_WEATHER_TYPES.map((type) => [type, Math.floor(random() * 25)]),
  ) as Record<StarWeatherType, number>;
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  if (total === 0) return { sunny: 25, cloudy: 25, rain: 25, volcano: 25 };

  const scaled = STAR_WEATHER_TYPES.map((type, index) => {
    const exact = (weights[type] / total) * 100;
    const whole = Math.floor(exact);
    return { type, index, whole, remainder: exact - whole };
  });
  let remaining = 100 - scaled.reduce((sum, entry) => sum + entry.whole, 0);
  const remainderOrder = [...scaled].sort(
    (first, second) => second.remainder - first.remainder || first.index - second.index,
  );
  for (const entry of remainderOrder) {
    if (remaining === 0) break;
    entry.whole += 1;
    remaining -= 1;
  }
  return Object.fromEntries(scaled.map(({ type, whole }) => [type, whole])) as Record<
    StarWeatherType,
    number
  >;
}

function precipitationGoodId(random: () => number): CompoundId {
  const roll = Math.floor(random() * 100);
  let cumulative = 0;
  for (const [goodId, weight] of PRECIPITATION_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return goodId;
  }
  return "water";
}

function generateProfile(star: StarCatalogueEntry, discoveryDistanceLy: number): StarSystemProfile {
  if (star.name === "Spica") {
    return { systemId: star.id, ...SPICA_PROFILE_DATA };
  }
  const random = createSystemRandom(star.id);
  const points = ascendencyPoints(discoveryDistanceLy, random);
  return {
    systemId: star.id,
    weatherChances: weatherChances(random),
    precipitationGoodId: precipitationGoodId(random),
    ascendencyPoints: points,
    ascendencyDistanceLy: discoveryDistanceLy,
  };
}

function resolveCurrentStar(
  catalogue: readonly StarCatalogueEntry[],
  currentSystemId: string,
): StarCatalogueEntry | undefined {
  const identity = currentSystemId.trim().toLocaleLowerCase("en");
  return (
    catalogue.find((star) => star.id === currentSystemId) ??
    catalogue.find((star) => star.name.toLocaleLowerCase("en") === identity) ??
    findStartingSystem(catalogue)
  );
}

/** The source game seeds Spica's weather and precipitation as fixed starting-system data. */
export function createInitialStarSystemProfiles(): readonly StarSystemProfile[] {
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const startingStar = findStartingSystem(catalogue);
  return startingStar ? [generateProfile(startingStar, 0)] : [];
}

/**
 * Materialize generated profiles once when a system is first studied. The profile
 * seed is derived from the stable system ID, so map rendering and profile creation
 * do not advance the player's simulation random stream.
 */
export function ensureDiscoveredStarSystemProfiles(
  existing: readonly StarSystemProfile[],
  currentSystemId: string,
  studyRange: number,
): readonly StarSystemProfile[] {
  if (!Number.isFinite(studyRange) || studyRange < 0) return existing;
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const current = resolveCurrentStar(catalogue, currentSystemId);
  if (!current) return existing;
  const known = new Set(existing.map((profile) => profile.systemId));
  const added = catalogue.flatMap((star) => {
    if (known.has(star.id)) return [];
    const distance = distanceBetweenStars(current, star);
    return star === current || star.initiallySettled || distance <= studyRange
      ? [generateProfile(star, distance)]
      : [];
  });
  return added.length === 0 ? existing : [...existing, ...added];
}

export function createStarSystemProfile(
  star: StarCatalogueEntry,
  discoveryDistanceLy: number,
): StarSystemProfile {
  if (!Number.isFinite(discoveryDistanceLy) || discoveryDistanceLy < 0) {
    throw new RangeError("Discovery distance must be a finite non-negative number.");
  }
  return generateProfile(star, discoveryDistanceLy);
}
