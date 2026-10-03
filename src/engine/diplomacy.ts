import type {
  DiplomacyChoice,
  StarDiplomacyMessageId,
  StarDiplomacyOutcome,
  StarSystemEncounter,
} from "../content/space";

export type DiplomacyOutcome = StarDiplomacyOutcome;

export interface DiplomacyResolution {
  readonly encounter: StarSystemEncounter;
  readonly outcome: DiplomacyOutcome;
}

export interface DiplomacyResolutionOptions {
  readonly playerAttackPower?: number;
  readonly supremacistAbilityActive?: boolean;
}

function randomInteger(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function attitudeFor(outcome: DiplomacyOutcome, current: StarAttitude): StarAttitude {
  if (
    outcome === "rebuff" ||
    outcome === "attack" ||
    outcome === "laugh" ||
    outcome === "vassalizationFailed"
  )
    return current;
  if (outcome === "vassalized" || outcome === "surrendered") return "surrendered";
  if (outcome === "scared") return "scared";
  return outcome;
}

type StarAttitude = StarSystemEncounter["attitude"];

/** Resolve the original envoy message and harmony choices against saved encounter state. */
export function resolveDiplomacyChoice(
  encounter: StarSystemEncounter,
  choice: DiplomacyChoice,
  random: () => number,
  options: DiplomacyResolutionOptions = {},
): DiplomacyResolution {
  const oldImpression = encounter.currentImpression;
  let currentImpression = oldImpression;
  let patience = encounter.patience;
  let outcome: DiplomacyOutcome;
  let message: StarDiplomacyMessageId;

  let enemyFleets = encounter.enemyFleets;
  let defenseRating = encounter.defenseRating;
  let triedToBully = encounter.triedToBully;
  let warReady = encounter.warReady;

  if (choice === "message") {
    const diplomatic = encounter.lifeformTraits[0] === "diplomatic";
    if (diplomatic) {
      if (encounter.triedToBully && random() < 0.5) {
        outcome = "belligerent";
      } else if (currentImpression >= 45) {
        outcome = random() < 0.6 ? "receptive" : "neutral";
      } else {
        outcome = random() < 0.5 ? "neutral" : "reserved";
      }
    } else if (currentImpression >= 30) {
      outcome = encounter.triedToBully && random() < 0.5 ? "belligerent" : "neutral";
    } else {
      outcome = random() < 0.5 ? "reserved" : "belligerent";
      if (encounter.triedToBully) outcome = "belligerent";
    }

    patience = Math.max(0, patience - 1);
    if (outcome === "receptive") currentImpression = randomInteger(random, 65, 100);
    else if (outcome === "neutral") currentImpression = randomInteger(random, 45, 59);
    else if (outcome === "reserved") currentImpression = randomInteger(random, 10, 44);
    else {
      currentImpression = 0;
      patience = 0;
    }
    message =
      outcome === "receptive"
        ? "messageReceptive"
        : outcome === "neutral"
          ? "messageNeutral"
          : outcome === "reserved"
            ? "messageReserved"
            : "messageBelligerent";
    warReady = outcome === "belligerent" || patience === 0;
  } else if (choice === "harmony") {
    const remainingPatience = patience - 2;
    const roll = random();
    if (roll < 0.5 && remainingPatience >= 0) {
      outcome = "receptive";
      currentImpression = randomInteger(random, 85, 100);
    } else if (roll < 0.75 || remainingPatience < 0) {
      outcome = "rebuff";
      currentImpression = Math.max(0, oldImpression - 10);
    } else {
      outcome = "belligerent";
      currentImpression = 0;
      patience = 0;
    }
    if (outcome !== "belligerent") patience = Math.max(0, remainingPatience);
    message =
      outcome === "receptive"
        ? "harmonyReceptive"
        : outcome === "rebuff"
          ? "harmonyRebuff"
          : "harmonyBelligerent";
    warReady = outcome === "belligerent" || remainingPatience < 0 || patience === 0;
  } else if (choice === "bully") {
    triedToBully = true;
    const fleetCount =
      encounter.enemyFleets.air + encounter.enemyFleets.land + encounter.enemyFleets.sea;
    const powerRatio =
      (options.playerAttackPower ?? 0) / Math.max(1, fleetCount + encounter.defenseRating);
    const mainTrait = encounter.lifeformTraits[0];
    if (powerRatio > 2 && mainTrait === "diplomatic") {
      outcome = random() < 0.3 ? "scared" : "surrendered";
    } else if (powerRatio >= 1.2 && mainTrait !== "aggressive") {
      outcome = random() < 0.3 ? "attack" : "scared";
    } else if (powerRatio < 1.2 || mainTrait === "aggressive") {
      outcome = mainTrait === "diplomatic" ? (random() < 0.5 ? "attack" : "laugh") : "attack";
    } else {
      outcome = "laugh";
    }
    if (outcome === "surrendered") {
      enemyFleets = { air: 0, land: 0, sea: 0 };
      patience = 0;
      warReady = false;
      message = "bullySurrendered";
    } else if (outcome === "scared") {
      enemyFleets = {
        air: Math.floor(encounter.enemyFleets.air / 2),
        land: Math.floor(encounter.enemyFleets.land / 2),
        sea: Math.floor(encounter.enemyFleets.sea / 2),
      };
      warReady = true;
      message = "bullyScared";
    } else if (outcome === "attack") {
      defenseRating = Math.min(120, Math.ceil(encounter.defenseRating * 1.1));
      patience = 0;
      warReady = true;
      message = "bullyAttack";
    } else {
      currentImpression = Math.max(0, oldImpression - 10);
      warReady = currentImpression < 10;
      message = "bullyLaugh";
    }
  } else {
    const abilityActive = options.supremacistAbilityActive === true;
    const succeeded = abilityActive || random() < 0.75;
    if (succeeded) {
      outcome = "vassalized";
      enemyFleets = { air: 0, land: 0, sea: 0 };
      patience = 0;
      warReady = false;
      message = "vassalized";
    } else {
      outcome = "vassalizationFailed";
      warReady = true;
      message = "vassalizationFailed";
    }
  }

  const difference = currentImpression - oldImpression;
  return {
    outcome,
    encounter: {
      ...encounter,
      currentImpression,
      latestDifferenceInImpression: difference,
      attitude: attitudeFor(outcome, encounter.attitude),
      triedToBully,
      patience,
      defenseRating,
      enemyFleets,
      lastDiplomacyMessage: message,
      warReady,
    },
  };
}
