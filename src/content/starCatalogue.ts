import {
  GALAXY_SEED_DEFAULT,
  GALAXY_STAR_COUNT,
  isSystemId,
  systemIdForStar,
  type SystemId,
} from "./ids";

/** Nominal geometry used by Cosmic Forge's generated star map. */
export const STAR_FIELD_NOMINAL_WIDTH = 1200;
export const STAR_FIELD_NOMINAL_HEIGHT = 450;
const STAR_FIELD_SEED_MULTIPLIER = 53;
const STAR_SIZE_MIN = 2;
const STAR_SIZE_MAX = 6;
export const STARTING_SYSTEM_NAME = "Spica";
export const HOME_SYSTEM_NAME = "Miaplacidus";

export type StarSpecialRole = "starting" | "home";
export type StarAccessGate = "miaplacidus-milestone-4";
export const STAR_TYPE_IDS = ["A", "B", "F", "G", "K", "M", "O"] as const;
export type StarType = (typeof STAR_TYPE_IDS)[number];

/** Names and spectral classes from Cosmic Forge's fixed star-name table. */
export const STAR_NAME_CATALOGUE = [
  ["Sirius", "A"],
  ["Canopus", "F"],
  ["Arcturus", "K"],
  ["Sadalmelik", "G"],
  ["Capella", "G"],
  ["Rigel", "B"],
  ["Procyon", "F"],
  ["Betelgeuse", "M"],
  ["Altair", "A"],
  ["Aldebaran", "K"],
  ["Sterope", "B"],
  ["Antares", "M"],
  ["Pollux", "K"],
  ["Fomalhaut", "A"],
  ["Deneb", "A"],
  ["Mimosa", "B"],
  ["Regulus", "O"],
  ["Adhara", "B"],
  ["Castor", "A"],
  ["Shaula", "B"],
  ["Bellatrix", "B"],
  ["Elnath", "B"],
  ["Miaplacidus", "A"],
  ["Alnilam", "B"],
  ["Alnair", "B"],
  ["Alioth", "A"],
  ["Alnitak", "K"],
  ["Dubhe", "K"],
  ["Mirfak", "F"],
  ["Wezen", "F"],
  ["Sargas", "F"],
  ["Kaus Australis", "B"],
  ["Avior", "K"],
  ["Alkaid", "B"],
  ["Menkalinan", "O"],
  ["Atria", "K"],
  ["Alhena", "A"],
  ["Peacock", "B"],
  ["Tureis", "B"],
  ["Nunki", "B"],
  ["Mirzam", "B"],
  ["Alphard", "K"],
  ["Rasalhague", "A"],
  ["Caph", "F"],
  ["Zubenelgenubi", "A"],
  ["Electra", "B"],
  ["Hamal", "K"],
  ["Mintaka", "O"],
  ["Alsephina", "A"],
  ["Menkent", "K"],
  ["Enif", "K"],
  ["Tiaki", "K"],
  ["Ascella", "A"],
  ["Algol", "B"],
  ["Markab", "B"],
  ["Suhail", "K"],
  ["Zeta Ophiuchi", "M"],
  ["Kochab", "K"],
  ["Ankaa", "K"],
  ["Denebola", "A"],
  ["Vega", "A"],
  ["Azelfafage", "F"],
  ["Maia", "B"],
  ["Arkab Prior", "A"],
  ["Thuban", "A"],
  ["Izar", "K"],
  ["Ruchbah", "A"],
  ["Albireo", "K"],
  ["Almaaz", "F"],
  ["Dschubba", "B"],
  ["Algieba", "K"],
  ["Gomeisa", "B"],
  ["Hoedus II", "G"],
  ["Cebalrai", "K"],
  ["Nashira", "F"],
  ["Muscida", "A"],
  ["Kitalpha", "F"],
  ["Hyadum I", "K"],
  ["Eltanin", "K"],
  ["Yildun", "A"],
  ["Biham", "A"],
  ["Zubeneschamali", "B"],
  ["Alpherg", "K"],
  ["Alcor", "A"],
  ["Polaris", "F"],
  ["Pleione", "B"],
  ["Spica", "B"],
  ["Chara", "G"],
  ["Sadachbia", "F"],
  ["Rasalgethi", "M"],
  ["Barnards Star", "M"],
  ["Saiph", "B"],
  ["Hassaleh", "K"],
  ["Furud", "F"],
  ["Atik", "F"],
  ["Sadalsuud", "G"],
  ["Propus", "M"],
  ["Botein", "K"],
  ["Acamar", "A"],
  ["Anser", "G"],
] as const satisfies readonly (readonly [string, StarType])[];

export interface StarCatalogueEntry {
  readonly id: SystemId;
  readonly slot: number;
  readonly name: string;
  readonly starType: StarType;
  readonly specialRole: StarSpecialRole | null;
  readonly initiallySettled: boolean;
  readonly accessGate: StarAccessGate | null;
  /** Position within the stable, nominal map plane. */
  readonly x: number;
  readonly y: number;
  /** Depth participates in distance and is not affected by map scaling. */
  readonly z: number;
  readonly size: number;
  readonly width: number;
  readonly height: number;
}

function sourceSeededRandom(seed: number): number {
  const x = Math.sin(seed) * STAR_FIELD_SEED_MULTIPLIER;
  return x - Math.floor(x);
}

function sourceRange(seed: number, min: number, max: number): number {
  return sourceSeededRandom(seed) * (max - min) + min;
}

const catalogueCache = new Map<number, readonly StarCatalogueEntry[]>();
const starTypesByName = new Map(
  STAR_NAME_CATALOGUE.map(([name, starType]) => [name.toLocaleLowerCase("en"), starType]),
);

/**
 * Generate the stable 100-star catalogue using the source game's seeded
 * formulas. A map renderer can project x/y to any viewport, while these
 * nominal coordinates and z continue to determine distances.
 */
export function createStarCatalogue(
  galaxySeed = GALAXY_SEED_DEFAULT,
): readonly StarCatalogueEntry[] {
  if (!Number.isSafeInteger(galaxySeed) || galaxySeed < 0) {
    throw new RangeError("Galaxy seed must be a non-negative safe integer.");
  }

  const names = STAR_NAME_CATALOGUE.map(([name, starType]) => [name, starType] as const);
  const entries: StarCatalogueEntry[] = [];
  for (let slot = 0; slot < GALAXY_STAR_COUNT; slot += 1) {
    const nameIndex = Math.floor(sourceSeededRandom(galaxySeed - slot * 1.2) * names.length);
    const [name, starType] = names.splice(nameIndex, 1)[0] ?? [`Star${slot}`, "A"];
    const size = sourceRange(galaxySeed + slot, STAR_SIZE_MIN, STAR_SIZE_MAX);
    entries.push({
      id: systemIdForStar(galaxySeed, slot),
      slot,
      name,
      starType,
      specialRole:
        name === STARTING_SYSTEM_NAME ? "starting" : name === HOME_SYSTEM_NAME ? "home" : null,
      initiallySettled: name === STARTING_SYSTEM_NAME,
      accessGate: name === HOME_SYSTEM_NAME ? "miaplacidus-milestone-4" : null,
      x: sourceRange(galaxySeed + slot + GALAXY_STAR_COUNT, 0, STAR_FIELD_NOMINAL_WIDTH - 30),
      y: sourceRange(galaxySeed + slot + GALAXY_STAR_COUNT * 2, 0, STAR_FIELD_NOMINAL_HEIGHT),
      z: sourceRange(galaxySeed + slot + GALAXY_STAR_COUNT * 3, 10, 100_000),
      size,
      width: size * 1.1,
      height: size * 1.1,
    });
  }
  const catalogue = entries;
  catalogueCache.set(galaxySeed, catalogue);
  return catalogue;
}

/** Resolve either a canonical star name or a stable generated system ID. */
export function starTypeForSystem(systemIdentity: string): StarType {
  const normalizedName = systemIdentity.trim().toLocaleLowerCase("en");
  if (isSystemId(normalizedName)) {
    const match = /^system:(\d+):(\d+)$/.exec(normalizedName);
    if (!match) return "A";
    const galaxySeed = Number(match[1]);
    const slot = Number(match[2]);
    const catalogue = catalogueCache.get(galaxySeed) ?? createStarCatalogue(galaxySeed);
    return catalogue[slot]?.starType ?? "A";
  }
  return starTypesByName.get(normalizedName) ?? "A";
}

/** Find a catalogue entry by its fixed English source name, case-insensitively. */
export function findStarByName(
  catalogue: readonly StarCatalogueEntry[],
  name: string,
): StarCatalogueEntry | undefined {
  const normalizedName = name.trim().toLocaleLowerCase("en");
  return catalogue.find((star) => star.name.toLocaleLowerCase("en") === normalizedName);
}

export function findStartingSystem(
  catalogue: readonly StarCatalogueEntry[],
): StarCatalogueEntry | undefined {
  return catalogue.find((star) => star.specialRole === "starting");
}

export function findHomeSystem(
  catalogue: readonly StarCatalogueEntry[],
): StarCatalogueEntry | undefined {
  return catalogue.find((star) => star.specialRole === "home");
}

/** Match Cosmic Forge's rounded three-dimensional light-year distance. */
export function distanceBetweenStars(
  first: StarCatalogueEntry,
  second: StarCatalogueEntry,
): number {
  const dx = first.x + first.width / 2 - (second.x + second.width / 2);
  const dy = first.y + first.height / 2 - (second.y + second.height / 2);
  const dz = first.z - second.z;
  return Number((Math.sqrt(dx * dx + dy * dy + dz * dz) / 1000).toFixed(2));
}
