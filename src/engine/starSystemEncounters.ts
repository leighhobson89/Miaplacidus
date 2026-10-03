import {
  STAR_ANOMALY_IDS,
  createInitialStarSystemBattleState,
  type StarAnomalyId,
  type StarCivilizationLevel,
  type StarLifeformTrait,
  type StarSystemEncounter,
  type StarThreatLevel,
} from "../content/space";
import type { StarCatalogueEntry } from "../content/starCatalogue";
import { createSystemRandom } from "./systemRandom";

type FleetCounts = { air: number; land: number; sea: number };

interface AnomalyDefinition {
  readonly id: StarAnomalyId;
  readonly type: string;
  readonly counter: string;
  readonly value: number;
}

const ANOMALIES: readonly AnomalyDefinition[] = [
  {
    id: "electromagneticSurge",
    type: "enemy-defense-debuff",
    counter: "enemy-defense-buff",
    value: -20,
  },
  {
    id: "fortifiedMagneticField",
    type: "enemy-defense-buff",
    counter: "enemy-defense-debuff",
    value: 20,
  },
  {
    id: "plasmaInstability",
    type: "player-attack-buff",
    counter: "player-attack-debuff",
    value: 15,
  },
  {
    id: "energyDampeningField",
    type: "player-attack-debuff",
    counter: "player-attack-buff",
    value: -15,
  },
  { id: "atmosphericDisturbance", type: "air-debuff", counter: "air-buff", value: -30 },
  { id: "highAltitudeJetStreams", type: "air-buff", counter: "air-debuff", value: 20 },
  { id: "seismicInstability", type: "land-debuff", counter: "land-buff", value: -30 },
  { id: "tectonicShift", type: "land-buff", counter: "land-debuff", value: 20 },
  { id: "deepOceanCurrents", type: "sea-debuff", counter: "sea-buff", value: -30 },
  { id: "darkMatterFlux", type: "sea-buff", counter: "sea-debuff", value: 20 },
];

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

function pick<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)]!;
}

function createTraits(
  civilization: StarCivilizationLevel,
  hardMode: boolean,
  random: () => number,
): readonly [StarLifeformTrait, StarLifeformTrait, StarLifeformTrait] {
  if (hardMode) return ["aggressive", "mechanized", "armored"];
  if (civilization === "unsentient" || civilization === "none") {
    return ["notApplicable", "notApplicable", "notApplicable"];
  }
  return [
    pick(["aggressive", "diplomatic"] as const, random),
    pick(["terrans", "aquatic", "aerialians"] as const, random),
    pick(["armored", "hiveMind", "powerSiphon", "hypercharge"] as const, random),
  ];
}

function createThreatLevel(
  civilization: StarCivilizationLevel,
  population: number,
  traits: readonly StarLifeformTrait[],
): StarThreatLevel {
  if (civilization === "none" || civilization === "unsentient") return "none";
  let threat: StarThreatLevel = "none";
  if (civilization === "industrial") threat = population >= 10_000_000 ? "moderate" : "low";
  if (civilization === "spacefaring" || civilization === "robotic") {
    threat = population >= 50_000_000 ? "extreme" : population >= 10_000_000 ? "high" : "moderate";
  }
  if (traits.includes("diplomatic")) {
    const levels: readonly StarThreatLevel[] = ["none", "low", "moderate", "high", "extreme"];
    const index = levels.indexOf(threat);
    return levels[Math.max(0, index - 1)]!;
  }
  return threat;
}

function createDefenseRating(
  civilization: StarCivilizationLevel,
  threat: StarThreatLevel,
  traits: readonly StarLifeformTrait[],
  random: () => number,
): number {
  if (civilization === "none" || civilization === "unsentient") return 0;
  const threatMultiplier: Readonly<Record<StarThreatLevel, number>> = {
    none: 0,
    low: 0.2,
    moderate: 0.4,
    high: 0.7,
    extreme: 1,
  };
  const civilizationMultiplier = civilization === "spacefaring" ? 1 : 0.5;
  let rating = Math.round(100 * threatMultiplier[threat] * civilizationMultiplier);
  if (traits.includes("armored")) rating = Math.min(100, rating + 25);
  return randomInteger(random, Math.max(1, rating - 10), Math.min(100, rating + 10));
}

function createEnemyFleets(
  threat: StarThreatLevel,
  population: number,
  traits: readonly StarLifeformTrait[],
  random: () => number,
): FleetCounts {
  const fleetMultipliers: Readonly<Record<StarThreatLevel, number>> = {
    none: 0,
    low: 0.00000001,
    moderate: 0.000000013,
    high: 0.0000000169,
    extreme: 0.00000002197,
  };
  let totalFleets = Math.floor(population * fleetMultipliers[threat] * 100);
  if (traits.includes("diplomatic")) totalFleets = Math.floor(totalFleets * 0.5);
  if (totalFleets === 0) return { air: 0, land: 0, sea: 0 };

  const primaryType =
    traits.includes("terrans") || traits.includes("mechanized")
      ? "land"
      : traits.includes("aerialians")
        ? "air"
        : traits.includes("aquatic")
          ? "sea"
          : pick(["land", "air", "sea"] as const, random);
  const primaryFleets = Math.floor(totalFleets * 0.6);
  const remainingFleets = totalFleets - primaryFleets;
  const secondaryFleets = randomInteger(random, 0, remainingFleets);
  const counts: FleetCounts = { air: 0, land: 0, sea: 0 };
  counts[primaryType] = primaryFleets;
  const otherTypes = (["land", "air", "sea"] as const).filter((type) => type !== primaryType);
  counts[otherTypes[0]!] = secondaryFleets;
  counts[otherTypes[1]!] = remainingFleets - secondaryFleets;
  return counts;
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  return shuffled;
}

function selectAnomalies(
  fleets: FleetCounts,
  hardMode: boolean,
  random: () => number,
): readonly StarAnomalyId[] {
  if (hardMode) return ["stalwart"];
  if (fleets.air + fleets.land + fleets.sea === 0) return [];
  const selected: AnomalyDefinition[] = [];
  for (const candidate of shuffle(ANOMALIES, random)) {
    if (selected.some((anomaly) => anomaly.type === candidate.counter)) continue;
    selected.push(candidate);
    if (selected.length === 2) break;
  }
  return selected.map((anomaly) => anomaly.id);
}

function applyAnomalyEffects(
  anomalyIds: readonly StarAnomalyId[],
  defenseRating: number,
  sourceFleets: FleetCounts,
): { defenseRating: number; enemyFleets: FleetCounts } {
  let defense = defenseRating;
  const fleets = { ...sourceFleets };
  for (const anomalyId of anomalyIds) {
    const anomaly = ANOMALIES.find((candidate) => candidate.id === anomalyId);
    if (!anomaly) continue;
    if (anomaly.type.includes("enemy-defense")) {
      defense += (anomaly.value / 100) * defense;
    } else if (!anomaly.type.includes("player")) {
      const fleetType = anomaly.type.split("-")[0] as keyof FleetCounts;
      const change = Math.floor((anomaly.value / 100) * fleets[fleetType]);
      fleets[fleetType] = Math.max(0, Math.floor(fleets[fleetType] + change));
    }
  }
  return { defenseRating: defense, enemyFleets: fleets };
}

function raceName(
  star: StarCatalogueEntry,
  civilization: StarCivilizationLevel,
  isFactorySystem: boolean,
  random: () => number,
): string {
  if (isFactorySystem) {
    const suffixes = [
      "Sentinels",
      "Wardens",
      "Guardians",
      "Protectors",
      "Custodians",
      "Overseers",
      "Aegis",
    ];
    return `Megastructure ${pick(suffixes, random)}`;
  }
  if (civilization === "none") return "None";
  if (civilization === "unsentient") {
    return pick(
      ["Floral", "Bacterial", "Cellular", "Fungal", "Mossy", "Lichenous", "Microbial", "Protozoan"],
      random,
    );
  }

  const prefixes = [
    "Xy",
    "Za",
    "Vo",
    "Thra",
    "Kro",
    "Mora",
    "Dra",
    "Nexa",
    "Vex",
    "Zy",
    "Tero",
    "Qua",
    "Joro",
    "Phy",
    "Uro",
    "Grex",
    "Sylo",
    "Fero",
    "Wex",
    "Dexo",
    "Byra",
    "Tarn",
    "Oza",
    "Kly",
    "Mexo",
    "Pha",
    "Voro",
    "Dren",
    "Sora",
    "Lumo",
    "Xero",
    "Trilo",
    "Bry",
    "Nyth",
    "Quen",
    "Kyra",
    "Drano",
    "Luth",
    "Zylo",
    "Omex",
  ];
  const middles = [
    "vi",
    "lor",
    "thar",
    "quon",
    "zar",
    "mion",
    "rax",
    "drel",
    "vex",
    "nex",
    "phy",
    "ryn",
    "sol",
    "tarn",
    "bex",
    "thyl",
    "zor",
    "phel",
    "kyn",
    "threx",
    "lyx",
    "vor",
    "drix",
    "quar",
    "meth",
    "syl",
    "tor",
    "zarn",
    "lex",
    "dyn",
  ];
  const suffixes = [
    "ites",
    "ians",
    "nths",
    "oids",
    "ari",
    "ans",
    "eths",
    "ors",
    "ex",
    "ar",
    "oth",
    "orn",
    "yx",
    "eth",
    "al",
    "os",
    "ith",
    "une",
    "yn",
    "um",
    "orax",
    "eron",
    "ara",
    "oza",
    "exo",
    "yss",
    "ithil",
    "onis",
    "uva",
    "quix",
  ];
  let generated: string;
  if (random() < 0.5) {
    const prefix = random() < 0.5 ? pick(prefixes, random) : "";
    const starName = star.name.split(" ")[0]!.toLocaleLowerCase("en");
    const middle = random() < 0.5 ? pick(middles, random) : "";
    generated = `${prefix}${starName}${middle}${pick(suffixes, random)}`;
  } else {
    generated = `${pick(prefixes, random)}${pick(middles, random)}${pick(suffixes, random)}`;
  }
  const truncated = generated.slice(0, 14);
  return truncated.charAt(0).toLocaleUpperCase("en") + truncated.slice(1);
}

function initialImpression(
  civilization: StarCivilizationLevel,
  traits: readonly StarLifeformTrait[],
  threat: StarThreatLevel,
  fleets: FleetCounts,
  population: number,
  isFactorySystem: boolean,
): number {
  if (isFactorySystem) return 0;
  if (civilization === "unsentient" || civilization === "none") return 100;

  let impression = 35;
  if (traits.includes("diplomatic")) impression = 50;
  else if (traits.includes("aggressive")) impression = 20;
  if (traits.includes("armored")) impression -= 5;
  if (traits.includes("hiveMind")) impression -= 10;
  if (traits.includes("powerSiphon")) impression += 3;
  if (traits.includes("hypercharge")) impression += 3;
  if (civilization === "industrial") impression += 5;
  else if (civilization === "spacefaring") impression -= 5;
  const threatImpact: Readonly<Record<StarThreatLevel, number>> = {
    none: 5,
    low: 3,
    moderate: -5,
    high: -10,
    extreme: -15,
  };
  impression += threatImpact[threat];
  impression -= Math.floor((fleets.air + fleets.land + fleets.sea) / 20);
  if (population < 5_000_000) impression += 5;
  else if (population > 50_000_000) impression -= 5;
  return Math.max(0, Math.min(80, impression));
}

function starAttitude(
  civilization: StarCivilizationLevel,
  impression: number,
  hardMode: boolean,
): StarSystemEncounter["attitude"] {
  if (hardMode) return "belligerent";
  if (civilization === "none" || civilization === "unsentient") return "none";
  if (impression >= 60) return "receptive";
  if (impression >= 45) return "neutral";
  if (impression >= 10) return "reserved";
  return "belligerent";
}

function homeSystemEncounter(star: StarCatalogueEntry): StarSystemEncounter {
  return {
    systemId: star.id,
    lifeDetected: true,
    civilizationLevel: "robotic",
    lifeformTraits: ["aggressive", "mechanized", "armored"],
    raceName: "Miaplacidus Wardens",
    populationEstimate: 95_000_000,
    threatLevel: "extreme",
    defenseRating: 100,
    enemyFleets: { air: 100, land: 100, sea: 100 },
    anomalies: ["brokenForceField", "aiMasterRace"],
    initialImpression: 0,
    currentImpression: 0,
    latestDifferenceInImpression: 0,
    attitude: "belligerent",
    triedToBully: false,
    patience: 0,
    lastDiplomacyMessage: null,
    warReady: false,
    warMode: false,
    battle: createInitialStarSystemBattleState(),
  };
}

/** Generate and freeze encounter facts on the explicit Stellar Scanner action. */
export function generateStarSystemEncounter(
  star: StarCatalogueEntry,
  isFactorySystem: boolean,
): StarSystemEncounter {
  if (star.name === "Miaplacidus") return homeSystemEncounter(star);
  const hardMode = isFactorySystem || star.starType === "O";
  const random = createSystemRandom(`${star.id}:encounter`);
  const lifeDetected = hardMode || random() < 0.97;
  let civilizationLevel: StarCivilizationLevel = "none";
  if (lifeDetected) {
    if (hardMode) {
      civilizationLevel = "robotic";
    } else {
      const civilizationRoll = random();
      civilizationLevel =
        civilizationRoll < 0.1
          ? "unsentient"
          : civilizationRoll < 0.55
            ? "industrial"
            : "spacefaring";
    }
  }
  const lifeformTraits = createTraits(civilizationLevel, hardMode, random);
  let populationEstimate = !lifeDetected
    ? 0
    : hardMode
      ? randomInteger(random, 50_000_000, 100_000_000)
      : randomInteger(random, 1_000_000, 50_000_000);
  if (lifeformTraits.includes("hiveMind")) populationEstimate *= 4;
  const generatedRaceName = raceName(star, civilizationLevel, isFactorySystem, random);
  const threatLevel = hardMode
    ? "extreme"
    : createThreatLevel(civilizationLevel, populationEstimate, lifeformTraits);
  const baseDefenseRating = lifeDetected
    ? createDefenseRating(civilizationLevel, threatLevel, lifeformTraits, random)
    : 0;
  const baseEnemyFleets = lifeDetected
    ? createEnemyFleets(threatLevel, populationEstimate, lifeformTraits, random)
    : { air: 0, land: 0, sea: 0 };
  const anomalies = selectAnomalies(baseEnemyFleets, hardMode, random);
  const modified = applyAnomalyEffects(anomalies, baseDefenseRating, baseEnemyFleets);
  const generatedImpression = initialImpression(
    civilizationLevel,
    lifeformTraits,
    threatLevel,
    modified.enemyFleets,
    populationEstimate,
    isFactorySystem,
  );
  const patienceAdjustment =
    lifeformTraits[0] === "diplomatic" ? 1 : lifeformTraits[0] === "aggressive" ? -1 : 0;
  const patience = randomInteger(random, 3, 5) + patienceAdjustment;

  return {
    systemId: star.id,
    lifeDetected,
    civilizationLevel,
    lifeformTraits,
    raceName: generatedRaceName,
    populationEstimate,
    threatLevel,
    defenseRating: modified.defenseRating,
    enemyFleets: modified.enemyFleets,
    anomalies,
    initialImpression: generatedImpression,
    currentImpression: generatedImpression,
    latestDifferenceInImpression: 0,
    attitude: starAttitude(civilizationLevel, generatedImpression, hardMode),
    triedToBully: false,
    patience: isFactorySystem ? Math.max(0, patience) : patience,
    lastDiplomacyMessage: null,
    warReady: false,
    warMode: false,
    battle: createInitialStarSystemBattleState(),
  };
}

export function isValidStarAnomalyId(value: unknown): value is StarAnomalyId {
  return typeof value === "string" && STAR_ANOMALY_IDS.includes(value as StarAnomalyId);
}
