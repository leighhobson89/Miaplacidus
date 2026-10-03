import type { AncientManuscriptRecord, StarSystemProfile } from "../content/space";
import {
  distanceBetweenStars,
  findStarByName,
  type StarCatalogueEntry,
  type StarType,
} from "../content/starCatalogue";

export const STAR_DATA_SORT_KEYS = [
  "name",
  "distance",
  "type",
  "weather",
  "precipitation",
  "fuel",
  "ascendency",
] as const;
export type StarDataSortKey = (typeof STAR_DATA_SORT_KEYS)[number];
export type StarDataSortDirection = "ascending" | "descending";

export interface StarDataRow {
  readonly systemId: StarCatalogueEntry["id"];
  readonly name: string;
  readonly starType: StarType;
  readonly distanceLy: number;
  readonly weatherType: "sunny" | "cloudy" | "rain" | "volcano";
  readonly weatherChance: number;
  readonly precipitationGoodId: StarSystemProfile["precipitationGoodId"];
  readonly antimatterRequired: number;
  readonly ascendencyPoints: number;
  readonly revealedFactory: boolean;
}

const WEATHER_SORT_PRIORITY = { sunny: 0, cloudy: 1, rain: 2, volcano: 3 } as const;

/** Source-compatible starship fuel cost, recalculated from the current system. */
export function antimatterRequiredForDistance(distanceLy: number): number {
  if (!Number.isFinite(distanceLy) || distanceLy < 0) return 5_000;
  const normalizedDistance = Math.min(1, Math.max(0, (distanceLy - 1) / 99));
  return Math.round(5_000 + 150_000 * normalizedDistance ** 2.5);
}

function weatherTendency(profile: StarSystemProfile): {
  readonly type: StarDataRow["weatherType"];
  readonly chance: number;
} {
  let type: StarDataRow["weatherType"] = "sunny";
  let chance = -1;
  for (const candidate of ["sunny", "cloudy", "rain", "volcano"] as const) {
    if (profile.weatherChances[candidate] > chance) {
      type = candidate;
      chance = profile.weatherChances[candidate];
    }
  }
  return { type, chance };
}

/** Build rows only for systems with a persisted, already generated profile. */
export function createStarDataRows(
  catalogue: readonly StarCatalogueEntry[],
  profiles: readonly StarSystemProfile[],
  currentSystemIdentity: string,
  ancientManuscripts: readonly AncientManuscriptRecord[] = [],
): readonly StarDataRow[] {
  const current =
    catalogue.find((star) => star.id === currentSystemIdentity) ??
    findStarByName(catalogue, currentSystemIdentity);
  if (!current) return [];
  const profileById = new Map(profiles.map((profile) => [profile.systemId, profile]));
  const revealedFactoryIds = new Set(
    ancientManuscripts.filter((record) => record.reported).map((record) => record.factorySystemId),
  );
  return catalogue.flatMap((star) => {
    if (star.id === current.id) return [];
    const profile = profileById.get(star.id);
    if (!profile) return [];
    const tendency = weatherTendency(profile);
    const distanceLy = distanceBetweenStars(current, star);
    return [
      {
        systemId: star.id,
        name: star.name,
        starType: star.starType,
        distanceLy,
        weatherType: tendency.type,
        weatherChance: tendency.chance,
        precipitationGoodId: profile.precipitationGoodId,
        antimatterRequired: antimatterRequiredForDistance(distanceLy),
        ascendencyPoints: profile.ascendencyPoints,
        revealedFactory: revealedFactoryIds.has(star.id),
      },
    ];
  });
}

export function sortStarDataRows(
  rows: readonly StarDataRow[],
  sortBy: StarDataSortKey,
  direction: StarDataSortDirection = "ascending",
): readonly StarDataRow[] {
  const sign = direction === "ascending" ? 1 : -1;
  return [...rows].sort((first, second) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = first.name.localeCompare(second.name, "en");
        break;
      case "distance":
        comparison = first.distanceLy - second.distanceLy;
        break;
      case "type":
        comparison = first.starType.localeCompare(second.starType, "en");
        break;
      case "weather":
        comparison =
          WEATHER_SORT_PRIORITY[first.weatherType] - WEATHER_SORT_PRIORITY[second.weatherType] ||
          second.weatherChance - first.weatherChance;
        break;
      case "precipitation":
        comparison = first.precipitationGoodId.localeCompare(second.precipitationGoodId, "en");
        break;
      case "fuel":
        comparison = first.antimatterRequired - second.antimatterRequired;
        break;
      case "ascendency":
        comparison = first.ascendencyPoints - second.ascendencyPoints;
        break;
    }
    return comparison === 0 ? first.name.localeCompare(second.name, "en") : comparison * sign;
  });
}

export function filterStarDataRows(
  rows: readonly StarDataRow[],
  query: string,
  starType: StarType | "all" = "all",
): readonly StarDataRow[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  return rows.filter(
    (row) =>
      (starType === "all" || row.starType === starType) &&
      (normalizedQuery.length === 0 || row.name.toLocaleLowerCase("en").includes(normalizedQuery)),
  );
}
