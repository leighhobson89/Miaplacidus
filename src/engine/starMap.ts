import {
  distanceBetweenStars,
  findStarByName,
  type StarCatalogueEntry,
} from "../content/starCatalogue";

export interface StarMapNode {
  readonly id: StarCatalogueEntry["id"];
  readonly name: string;
  readonly starType: StarCatalogueEntry["starType"];
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly distanceLy: number;
  readonly current: boolean;
  readonly studied: boolean;
  readonly visible: boolean;
  readonly selectable: boolean;
}

/** Derive map discovery from the active system and telescope study radius. */
export function createStarMapModel(
  catalogue: readonly StarCatalogueEntry[],
  currentSystemIdentity: string,
  studyRange: number,
  miaplacidusMilestoneLevel = 0,
): readonly StarMapNode[] {
  if (!Number.isFinite(studyRange) || studyRange < 0) return [];
  const current =
    catalogue.find((star) => star.id === currentSystemIdentity) ??
    findStarByName(catalogue, currentSystemIdentity);
  if (!current) return [];

  return catalogue.map((star) => {
    const isCurrent = star.id === current.id;
    const distanceLy = distanceBetweenStars(current, star);
    const studied = isCurrent || star.initiallySettled || distanceLy <= studyRange;
    const visible = studied || star.specialRole === "home";
    const homeGateOpen =
      star.accessGate === null ||
      (star.accessGate === "miaplacidus-milestone-4" && miaplacidusMilestoneLevel === 4);
    const homeAccess = star.specialRole === "home" && homeGateOpen;
    return {
      id: star.id,
      name: star.name,
      starType: star.starType,
      x: star.x,
      y: star.y,
      size: star.size,
      distanceLy,
      current: isCurrent,
      studied,
      visible,
      selectable: homeAccess || (studied && homeGateOpen),
    };
  });
}

/** The source search waits for two characters and matches stable names without locale changes. */
export function searchStarCatalogue(
  catalogue: readonly StarCatalogueEntry[],
  query: string,
): readonly StarCatalogueEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  if (normalizedQuery.length < 2) return [];
  return catalogue.filter((star) => star.name.toLocaleLowerCase("en").includes(normalizedQuery));
}

export function selectStarMapNode(
  model: readonly StarMapNode[],
  systemId: string,
): StarMapNode | undefined {
  const node = model.find((entry) => entry.id === systemId);
  return node?.selectable ? node : undefined;
}
