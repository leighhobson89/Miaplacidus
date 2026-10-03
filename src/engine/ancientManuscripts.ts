import { type AncientManuscriptRecord } from "../content/space";
import { GALAXY_SEED_DEFAULT, type SystemId } from "../content/ids";
import {
  createStarCatalogue,
  distanceBetweenStars,
  findStartingSystem,
  type StarCatalogueEntry,
} from "../content/starCatalogue";
import { createSystemRandom } from "./systemRandom";

const MANUSCRIPT_THRESHOLDS = [5, 20, 35, 45] as const;
const FACTORY_DISTANCE_BANDS = [
  [5, 15],
  [16, 25],
  [26, 40],
  [41, 60],
] as const;

function generationChance(count: number, previousRangeLy: number, nextRangeLy: number): number {
  const guaranteedThreshold = MANUSCRIPT_THRESHOLDS[count];
  if (
    guaranteedThreshold !== undefined &&
    previousRangeLy < guaranteedThreshold &&
    nextRangeLy >= guaranteedThreshold
  ) {
    return 100;
  }
  if (count === 0 && nextRangeLy < 5) return 20;
  if (count < 2 && nextRangeLy >= 6 && nextRangeLy < 20) return 20;
  if (count < 3 && nextRangeLy >= 21 && nextRangeLy < 35) return 20;
  if (count < 4 && nextRangeLy >= 36 && nextRangeLy < 45) return 20;
  return 0;
}

function resolveCurrentStar(
  catalogue: readonly StarCatalogueEntry[],
  currentSystemId: string,
): StarCatalogueEntry | undefined {
  return (
    catalogue.find((star) => star.id === currentSystemId) ??
    catalogue.find(
      (star) => star.name.toLocaleLowerCase("en") === currentSystemId.toLocaleLowerCase("en"),
    ) ??
    findStartingSystem(catalogue)
  );
}

function choose<T>(items: readonly T[], random: () => number): T | undefined {
  return items[Math.floor(random() * items.length)];
}

/**
 * Generates at most one hidden factory clue per study, using the source game's
 * 20% between-milestone chance and guaranteed 5/20/35/45 light-year milestones.
 * Selection uses per-study seeds, so saves and map rendering never consume run RNG.
 */
export function generateAncientManuscriptAtStudyMilestone(
  existing: readonly AncientManuscriptRecord[],
  currentSystemId: string,
  previousRangeLy: number,
  nextRangeLy: number,
  settledSystemIds: ReadonlySet<string> = new Set(),
): readonly AncientManuscriptRecord[] {
  if (
    existing.length >= MANUSCRIPT_THRESHOLDS.length ||
    !Number.isFinite(previousRangeLy) ||
    !Number.isFinite(nextRangeLy) ||
    nextRangeLy <= previousRangeLy
  ) {
    return existing;
  }
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const current = resolveCurrentStar(catalogue, currentSystemId);
  if (!current) return existing;
  const position = existing.length + 1;
  const chance = generationChance(existing.length, previousRangeLy, nextRangeLy);
  if (
    chance === 0 ||
    createSystemRandom(
      `${current.id}:manuscript-roll:${previousRangeLy}:${nextRangeLy}:${existing.length}`,
    )() >=
      chance / 100
  ) {
    return existing;
  }

  const usedIds = new Set(
    existing.flatMap((record) => [record.manuscriptSystemId, record.factorySystemId]),
  );
  const eligible = catalogue.filter((star) => {
    if (
      star.name === "Miaplacidus" ||
      star.id === current.id ||
      star.initiallySettled ||
      star.starType === "O" ||
      settledSystemIds.has(star.id) ||
      usedIds.has(star.id)
    ) {
      return false;
    }
    const distance = distanceBetweenStars(current, star);
    return distance > previousRangeLy && distance <= nextRangeLy;
  });
  if (eligible.length === 0) return existing;

  const [minimumFactoryDistance, maximumFactoryDistance] = FACTORY_DISTANCE_BANDS[position - 1]!;
  const manuscriptStar = choose(
    eligible,
    createSystemRandom(`${current.id}:manuscript:${position}`),
  );
  if (!manuscriptStar) return existing;
  const factoryCandidates = catalogue.filter((star) => {
    if (
      star.name === "Miaplacidus" ||
      star.id === current.id ||
      star.initiallySettled ||
      star.id === manuscriptStar.id ||
      star.starType === "O" ||
      settledSystemIds.has(star.id) ||
      usedIds.has(star.id)
    ) {
      return false;
    }
    const distance = distanceBetweenStars(current, star);
    return distance >= minimumFactoryDistance && distance <= maximumFactoryDistance;
  });
  const factoryStar = choose(
    factoryCandidates,
    createSystemRandom(`${current.id}:factory:${position}`),
  );
  if (!factoryStar) return existing;

  return [
    ...existing,
    {
      position: position as 1 | 2 | 3 | 4,
      manuscriptSystemId: manuscriptStar.id,
      factorySystemId: factoryStar.id,
      reported: false,
    },
  ];
}

/** Mark a clue as reported exactly once when its manuscript system is settled. */
export function reportAncientManuscriptsAtSystem(
  records: readonly AncientManuscriptRecord[],
  settledSystemId: SystemId,
): readonly AncientManuscriptRecord[] {
  let changed = false;
  const updated = records.map((record) => {
    if (record.manuscriptSystemId !== settledSystemId || record.reported) return record;
    changed = true;
    return { ...record, reported: true };
  });
  return changed ? updated : records;
}
