import { COMPOUND_IDS, MATERIAL_IDS, type EconomicGoodId } from "../content/ids";
import type { RandomState } from "./runtimeTypes";
import { nextRandom } from "./random";
import {
  ANTIMATTER_BASE_MAX_RATE_PER_SECOND,
  ASTEROID_UNSUCCESSFUL_SCAN_CHANCE,
  ROCKET_PART_BASE_COST,
  ROCKET_TRAVEL_DISTANCE_MAX,
  ROCKET_TRAVEL_DISTANCE_MIN,
  STAR_STUDY_DURATION_MS,
  STARSHIP_TRAVEL_MS_PER_LIGHT_YEAR,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  VOID_PILLAGE_DURATION_MS,
  type AsteroidState,
  type SpacePurchaseCost,
  type SpaceState,
  type StarshipModuleId,
} from "../content/space";
import { ECONOMY_PRICE_MULTIPLIER } from "../content/economy";

function drawInteger(random: RandomState, minimum: number, maximum: number) {
  const next = nextRandom(random);
  return {
    value: minimum + Math.floor(next.value * (maximum - minimum + 1)),
    random: next.state,
  };
}

export function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0)!;
    return codePoint <= 0x1f || codePoint === 0x7f;
  });
}

export function asteroidSearchDuration(
  baseDurationMs: number,
  random: RandomState,
): { readonly durationMs: number; readonly random: RandomState } {
  const next = nextRandom(random);
  return {
    durationMs: baseDurationMs * (0.8 + next.value * 0.4),
    random: next.state,
  };
}

export function starStudyDuration(random: RandomState): {
  readonly durationMs: number;
  readonly random: RandomState;
} {
  const next = nextRandom(random);
  return {
    durationMs: STAR_STUDY_DURATION_MS * (0.8 + next.value * 0.4),
    random: next.state,
  };
}

export function voidPillageDuration(random: RandomState): {
  readonly durationMs: number;
  readonly random: RandomState;
} {
  const next = nextRandom(random);
  return {
    durationMs: VOID_PILLAGE_DURATION_MS * (0.8 + next.value * 0.4),
    random: next.state,
  };
}

function pillageItemCount(random: RandomState): {
  readonly count: number;
  readonly random: RandomState;
} {
  const next = nextRandom(random);
  return {
    count: next.value < 0.6 ? 1 : next.value < 0.85 ? 2 : 3,
    random: next.state,
  };
}

export function voidPillageRewards(
  goods: Readonly<
    Record<EconomicGoodId, { readonly quantity: number; readonly storageCapacity: number }>
  >,
  random: RandomState,
): {
  readonly gains: Readonly<Partial<Record<EconomicGoodId, number>>>;
  readonly random: RandomState;
} {
  let state = random;
  const resourceCount = pillageItemCount(state);
  state = resourceCount.random;
  const compoundCount = pillageItemCount(state);
  state = compoundCount.random;

  const resources = [...MATERIAL_IDS];
  const selectedResources: EconomicGoodId[] = [];
  for (let index = 0; index < resourceCount.count; index += 1) {
    const selection = drawInteger(state, index, resources.length - 1);
    state = selection.random;
    [resources[index], resources[selection.value]] = [
      resources[selection.value]!,
      resources[index]!,
    ];
    selectedResources.push(resources[index]!);
  }

  const compoundWeights: Readonly<Record<(typeof COMPOUND_IDS)[number], number>> = {
    diesel: 2,
    glass: 2,
    steel: 1,
    concrete: 2,
    water: 2,
    titanium: 1,
  };
  const weightedCompounds = COMPOUND_IDS.flatMap((id) =>
    Array.from({ length: compoundWeights[id] }, () => id),
  );
  const selectedCompounds = new Set<(typeof COMPOUND_IDS)[number]>();
  while (selectedCompounds.size < compoundCount.count) {
    const selection = drawInteger(state, 0, weightedCompounds.length - 1);
    state = selection.random;
    selectedCompounds.add(weightedCompounds[selection.value]!);
  }

  const gains: Partial<Record<EconomicGoodId, number>> = {};
  for (const goodId of [...selectedResources, ...selectedCompounds]) {
    const maxGain = Math.floor(
      Math.max(0, goods[goodId].storageCapacity - goods[goodId].quantity) *
        (MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number]) ? 0.3 : 0.2),
    );
    const amount = drawInteger(state, 0, maxGain);
    state = amount.random;
    gains[goodId] = amount.value;
  }
  return { gains, random: state };
}

export function rocketPartCost(
  builtParts: number,
  launchPadMassProductionPurchases = 0,
): SpacePurchaseCost {
  if (
    !Number.isSafeInteger(builtParts) ||
    builtParts < 0 ||
    !Number.isSafeInteger(launchPadMassProductionPurchases) ||
    launchPadMassProductionPurchases < 0
  ) {
    throw new RangeError("Rocket part cost requires valid part and discount purchase counts.");
  }
  let cash = ROCKET_PART_BASE_COST.cash;
  let materials = ROCKET_PART_BASE_COST.materials.map((entry) => ({ ...entry }));
  for (let index = 0; index < builtParts; index += 1) {
    cash = Math.ceil(cash * 1.13);
    materials = materials.map((entry) => ({
      ...entry,
      amount: Math.ceil(entry.amount * 1.13),
    }));
  }
  const discount = 0.95 ** launchPadMassProductionPurchases;
  return {
    cash: cash * discount,
    materials: materials.map((entry) => ({ ...entry, amount: entry.amount * discount })),
  };
}

/** Source starship parts use the standard 13% escalating purchase multiplier. */
export function starshipModulePartCost(
  moduleId: StarshipModuleId,
  builtParts: number,
  spaceElevatorPurchases = 0,
): SpacePurchaseCost {
  if (
    !Number.isSafeInteger(builtParts) ||
    builtParts < 0 ||
    !Number.isSafeInteger(spaceElevatorPurchases) ||
    spaceElevatorPurchases < 0
  ) {
    throw new RangeError("Starship part cost requires valid part and discount purchase counts.");
  }
  const base = STARSHIP_MODULES[moduleId].cost;
  let cash = base.cash;
  let materials = base.materials.map((entry) => ({ ...entry }));
  for (let index = 0; index < builtParts; index += 1) {
    cash = Math.ceil(cash * ECONOMY_PRICE_MULTIPLIER);
    materials = materials.map((entry) => ({
      ...entry,
      amount: Math.ceil(entry.amount * ECONOMY_PRICE_MULTIPLIER),
    }));
  }
  const discount = 0.95 ** spaceElevatorPurchases;
  return {
    cash: cash * discount,
    materials: materials.map((entry) => ({ ...entry, amount: entry.amount * discount })),
  };
}

export function isStarshipReady(space: Pick<SpaceState, "starshipModules">): boolean {
  return STARSHIP_MODULE_IDS.every((moduleId) => {
    const definition = STARSHIP_MODULES[moduleId];
    return (
      !definition.requiredForTravel ||
      space.starshipModules[moduleId].builtParts >= definition.parts
    );
  });
}

/** Applies the repeatable starship travel upgrades to one quoted journey. */
export function starshipTravelDurationMs(
  distanceLy: number,
  quantumEnginePurchases = 0,
  warpDrivePurchases = 0,
): number {
  if (
    !Number.isFinite(distanceLy) ||
    distanceLy < 0 ||
    !Number.isSafeInteger(quantumEnginePurchases) ||
    quantumEnginePurchases < 0 ||
    !Number.isSafeInteger(warpDrivePurchases) ||
    warpDrivePurchases < 0
  ) {
    throw new RangeError("Starship travel duration requires a valid distance and purchase count.");
  }
  const cappedPurchases = Math.min(6, quantumEnginePurchases);
  return Math.max(
    1,
    Math.floor(
      ((distanceLy * STARSHIP_TRAVEL_MS_PER_LIGHT_YEAR) / 2 ** cappedPurchases) *
        0.95 ** warpDrivePurchases,
    ),
  );
}

/** Asteroid Attractors increase rocket speed by 1 / 0.95 per purchase. */
export function rocketTravelDurationMs(
  distance: number,
  travelMsPerDistanceUnit: number,
  asteroidAttractorPurchases = 0,
): number {
  if (
    !Number.isFinite(distance) ||
    distance < 0 ||
    !Number.isFinite(travelMsPerDistanceUnit) ||
    travelMsPerDistanceUnit <= 0 ||
    !Number.isSafeInteger(asteroidAttractorPurchases) ||
    asteroidAttractorPurchases < 0
  ) {
    throw new RangeError("Rocket travel duration requires a valid distance and purchase count.");
  }
  return Math.max(
    1,
    Math.floor(distance * travelMsPerDistanceUnit * 0.95 ** asteroidAttractorPurchases),
  );
}

function starCode(systemId: string): string {
  const words = systemId.toUpperCase().split(/\s+/);
  let code =
    words.length > 1
      ? words
          .map((word) => word[0])
          .join("")
          .slice(0, 3)
      : "";
  const consonants = (words[0] ?? "").replace(/[AEIOU]/g, "");
  for (const character of consonants) {
    if (code.length >= 3) break;
    code += character;
  }
  return (code || systemId.toUpperCase().slice(0, 3)).padEnd(3, "X");
}

function legendaryName(
  commanderName: string,
  existingNames: ReadonlySet<string>,
  random: RandomState,
): { readonly name: string; readonly random: RandomState } {
  const parts = [
    "Eternal",
    "Dominion",
    "Celestara",
    "Hyperion",
    "Zenith",
    "Titanis",
    "Astralis",
    "Nebularis",
    "Excalis",
    "Oblivion",
    "Infinity",
    "Nova",
    "Sentinel",
    "Aetheris",
    "Solstice",
    "Zephyrus",
    "Valhalla",
    "Eon",
    "Omicron",
    "Vanguard",
  ];
  const commander = commanderName.replace(/[0-9]/g, "").trim();
  const cleanedCommander = commander ? commander[0]!.toUpperCase() + commander.slice(1) : "Pioneer";
  let state = random;
  let candidate = "";
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const part = drawInteger(state, 0, parts.length - 1);
    state = part.random;
    const side = nextRandom(state);
    state = side.state;
    candidate =
      side.value > 0.5
        ? `${parts[part.value]} ${cleanedCommander}`
        : `${cleanedCommander} ${parts[part.value]}`;
    if (!existingNames.has(candidate)) return { name: candidate, random: state };
  }
  return { name: `${candidate} ${existingNames.size + 1}`, random: state };
}

export function generateAsteroid(
  options: {
    readonly sequence: number;
    readonly systemId: string;
    readonly commanderName: string;
    readonly existingNames: ReadonlySet<string>;
    readonly scannerBoostLevel?: number;
  },
  random: RandomState,
): { readonly asteroid: AsteroidState | null; readonly random: RandomState } {
  const miss = nextRandom(random);
  if (miss.value < ASTEROID_UNSUCCESSFUL_SCAN_CHANCE) {
    return { asteroid: null, random: miss.state };
  }
  let state = miss.state;
  const distance = drawInteger(state, ROCKET_TRAVEL_DISTANCE_MIN, ROCKET_TRAVEL_DISTANCE_MAX);
  state = distance.random;
  const rarityRoll = drawInteger(state, 0, 100);
  state = rarityRoll.random;
  const boost = options.scannerBoostLevel ?? 0;
  let rarity: AsteroidState["rarity"];
  if (boost === 1)
    rarity = rarityRoll.value <= 50 ? "uncommon" : rarityRoll.value <= 90 ? "rare" : "legendary";
  else if (boost >= 2) rarity = rarityRoll.value <= 85 ? "rare" : "legendary";
  else
    rarity =
      rarityRoll.value <= 50
        ? "common"
        : rarityRoll.value <= 70
          ? "uncommon"
          : rarityRoll.value <= 98
            ? "rare"
            : "legendary";

  const ease = drawInteger(state, 1, 6);
  state = ease.random;
  const stockRange: Readonly<Record<AsteroidState["rarity"], readonly [number, number]>> = {
    common: [700, 1_200],
    uncommon: [1_200, 2_000],
    rare: [2_000, 4_000],
    legendary: [4_000, 10_000],
  };
  const [minimumStock, maximumStock] = stockRange[rarity];
  const stock = drawInteger(state, minimumStock, maximumStock);
  state = stock.random;
  let name: string;
  if (rarity === "legendary") {
    const generatedName = legendaryName(options.commanderName, options.existingNames, state);
    name = generatedName.name;
    state = generatedName.random;
  } else {
    const suffix = drawInteger(state, 0, 9_999);
    state = suffix.random;
    const letter = drawInteger(state, 0, 25);
    state = letter.random;
    name = `${starCode(options.systemId)}-${String(suffix.value).padStart(4, "0")}${String.fromCharCode(65 + letter.value)}`;
  }
  return {
    asteroid: {
      id: `asteroid-${options.sequence}`,
      name,
      systemId: options.systemId,
      distance: distance.value,
      rarity,
      extractionEase: ease.value,
      remainingAntimatter: stock.value,
      totalAntimatter: stock.value,
      reservedBy: null,
      depleted: false,
      interacted: false,
    },
    random: state,
  };
}

export function asteroidExtractionRatePerSecond(extractionEase: number): number {
  const legacyMinimumEase = 10;
  const minimumRatePerSecond = 0.01;
  return Math.max(
    0,
    ANTIMATTER_BASE_MAX_RATE_PER_SECOND -
      ((extractionEase - 1) / (legacyMinimumEase - 1)) *
        (ANTIMATTER_BASE_MAX_RATE_PER_SECOND - minimumRatePerSecond),
  );
}

export function pruneAsteroids(
  asteroids: readonly AsteroidState[],
  maximum: number,
): readonly AsteroidState[] {
  const result = [...asteroids];
  let removable = result.filter(
    (asteroid) => asteroid.reservedBy === null && !asteroid.depleted && !asteroid.interacted,
  ).length;
  if (removable <= maximum) return result;
  for (let index = 0; index < result.length && removable > maximum;) {
    const asteroid = result[index]!;
    if (asteroid.reservedBy === null && !asteroid.depleted && !asteroid.interacted) {
      result.splice(index, 1);
      removable -= 1;
    } else {
      index += 1;
    }
  }
  return result;
}
