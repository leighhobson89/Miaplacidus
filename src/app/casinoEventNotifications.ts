import type { EconomicGoodId, LocaleId } from "../content/ids";
import { ECONOMIC_GOOD_IDS } from "../content/ids";
import { createStarCatalogue, STAR_NAME_CATALOGUE } from "../content/starCatalogue";
import { ROCKET_IDS, type RocketId } from "../content/space";
import type { EngineEvent } from "../engine/commands";
import type {
  HigherLowerAward,
  HigherLowerOutcome,
  WheelSpecialAward,
} from "../engine/galacticCasino";
import type { GameState } from "../engine/state";
import {
  casinoOTypeClue,
  casinoHiloText,
  casinoHistoryText,
  casinoPrizeText,
  casinoSpecialName,
  casinoText,
  casinoWheelNotificationText,
} from "../i18n/casinoMessages";
import { rocketText } from "../i18n/rocketMessages";
import { sourceNewsCopy } from "../i18n/sourceNewsCopy";
import { economyGoodName } from "./economyDisplay";
import { formatNumber } from "./numberFormatting";
import type { GameNotificationType } from "./NotificationStack";

export interface CasinoEventNotice {
  readonly message: string;
  readonly classification: "galacticCasino";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

const WHEEL_SPIN_NOTIFICATION_DELAY_MS = 2600;

function amountText(
  locale: LocaleId,
  value: number,
  state?: GameState,
  maximumFractionDigits = 0,
): string {
  return formatNumber(
    locale,
    value,
    maximumFractionDigits,
    state?.settings.notation ?? "condensed",
  );
}

function noticeQuantity(
  locale: LocaleId,
  value: number,
  state: GameState | undefined,
  maximumFractionDigits = 0,
): string {
  return state ? amountText(locale, value, state, maximumFractionDigits) : String(value);
}

function wheelWinPrefix(locale: LocaleId): string {
  return casinoText(locale, "wheelWinPrefix");
}

function wheelTimerLabel(locale: LocaleId, timerId: string, state: GameState): string {
  switch (timerId) {
    case "survey:asteroid-scan":
      return casinoText(locale, "wheelTimerAsteroidScanLabel");
    case "survey:star-study":
      return casinoText(locale, "wheelTimerStarStudyLabel");
    case "survey:void-pillage":
      return casinoText(locale, "wheelTimerVoidPillageLabel");
    case "travel:starship-journey":
      return casinoText(locale, "wheelTimerStarshipJourneyLabel");
    default: {
      const rocketMatch = /^travel:(rocket\d+)-asteroid-journey$/.exec(timerId);
      const rocketId = rocketMatch?.[1] as RocketId | undefined;
      if (rocketId && ROCKET_IDS.includes(rocketId)) {
        return state.run.space.rockets[rocketId].name;
      }
      return casinoText(locale, "wheelTimerGenericLabel");
    }
  }
}

function fillWheelTimeNotice(
  locale: LocaleId,
  label: string,
  fromSeconds: number,
  toSeconds: number,
  state?: GameState,
): string {
  return casinoText(locale, "wheelTimeReducedMessage")
    .replaceAll("{label}", label)
    .replaceAll("{from}", amountText(locale, fromSeconds, state))
    .replaceAll("{to}", amountText(locale, toSeconds, state));
}

export function starNameFromIdentity(identity: string): string {
  const systemMatch = /^system:(\d+):(\d+)$/.exec(identity);
  if (systemMatch) {
    const seed = Number(systemMatch[1]);
    const slot = Number(systemMatch[2]);
    if (Number.isSafeInteger(seed) && Number.isSafeInteger(slot) && seed >= 0 && slot >= 0) {
      const generatedName = createStarCatalogue(seed)[slot]?.name;
      if (generatedName) return generatedName;
    }
  }
  const canonicalName = STAR_NAME_CATALOGUE.find(
    ([name]) => name.toLocaleLowerCase("en") === identity.trim().toLocaleLowerCase("en"),
  )?.[0];
  if (canonicalName) return canonicalName;
  return identity
    .replaceAll(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase("en"));
}

function fallbackClueIndex(identity: string, length: number): number {
  let hash = 0;
  for (const character of identity) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash % length;
}

function clueIndex(
  event: Extract<EngineEvent, { type: "casino.void-seer.result" }>,
  length: number,
  identity: string,
): number {
  const index = event.clueTemplateIndex;
  return Number.isSafeInteger(index) && index !== undefined && index >= 0 && index < length
    ? index
    : fallbackClueIndex(identity, length);
}

function voidSeerNotice(
  locale: LocaleId,
  event: Extract<EngineEvent, { type: "casino.void-seer.result" }>,
  state?: GameState,
): CasinoEventNotice | null {
  if (!event.won) {
    if (event.detail !== "loss") return null;
    return {
      message: casinoText(locale, "voidLossNotification"),
      classification: "galacticCasino",
      type: "error",
      durationMs: 2000,
    };
  }

  const antimatterMatch = /^antimatter:(\d+(?:\.\d+)?)$/.exec(event.detail);
  if (antimatterMatch) {
    return {
      message: casinoText(locale, "voidAntimatterWinNotification").replace(
        "{amount}",
        noticeQuantity(locale, Number(antimatterMatch[1]), state, 2),
      ),
      classification: "galacticCasino",
      type: "info",
      durationMs: 3000,
    };
  }

  const clueMatch = /^(o-type-clue|manuscript-clue):(.+)$/.exec(event.detail);
  if (clueMatch) {
    const [, kind, identity] = clueMatch;
    const starName = starNameFromIdentity(identity!);
    const clue =
      kind === "o-type-clue"
        ? casinoOTypeClue(locale, clueIndex(event, 3, identity!)).replaceAll("{STAR}", starName)
        : sourceNewsCopy(locale).manuscriptClues[
            clueIndex(event, sourceNewsCopy(locale).manuscriptClues.length, identity!)
          ]?.replaceAll("{STAR}", starName);
    if (clue) {
      return {
        message: casinoText(locale, "voidWinWithClueNotification").replace("{clue}", clue),
        classification: "galacticCasino",
        type: "warning",
        durationMs: 15000,
      };
    }
  }

  return {
    message: casinoText(locale, "voidPlainWinNotification"),
    classification: "galacticCasino",
    type: "info",
    durationMs: 2500,
  };
}

function hiloPrizeName(locale: LocaleId, outcome: HigherLowerOutcome, state?: GameState): string {
  const formatQuantity = state
    ? (value: number, digits = 0) => amountText(locale, value, state, digits)
    : undefined;
  if (outcome.award?.type === "cp")
    return casinoPrizeText(
      locale,
      `hilo_cp_${Math.floor(outcome.award.amount)}`,
      undefined,
      formatQuantity,
    );
  const materialName = outcome.prizeKey.startsWith("special_double_")
    ? economyGoodName(locale, outcome.prizeKey.slice("special_double_".length) as EconomicGoodId)
    : undefined;
  return casinoPrizeText(locale, outcome.prizeKey, materialName, formatQuantity);
}

function hiloAwardDetail(
  locale: LocaleId,
  award: HigherLowerAward | null,
  state?: GameState,
): string | null {
  const amount = (value: number) => noticeQuantity(locale, Math.floor(value), state);
  if (!award || award.type === "cp" || award.type === "material-doubled") return null;
  if (award.type === "cash")
    return casinoHiloText(locale, "awardCash").replace("{amount}", amount(award.amount));
  if (award.type === "research")
    return casinoHiloText(locale, "awardResearch").replace("{amount}", amount(award.amount));
  if (award.type === "material")
    return casinoHiloText(locale, "awardMaterialAmount")
      .replace("{amount}", amount(award.amount))
      .replace("{material}", economyGoodName(locale, award.goodId));
  if (award.type === "timewarp")
    return casinoHiloText(locale, "awardTimeWarp")
      .replace("{multiplier}", noticeQuantity(locale, award.multiplier, state, 2))
      .replace(
        "{seconds}",
        noticeQuantity(locale, Math.max(0, Math.round(award.durationMs / 1000)), state),
      );
  if (award.type === "finished-journey") {
    if (award.vehicle === "rocket") {
      return casinoHiloText(locale, "awardFinishedRocketJourney").replace(
        "{suffix}",
        award.rocketName ? ` ${award.rocketName}` : "",
      );
    }
    return casinoHiloText(locale, "awardFinishedStarshipJourney").replace(
      "{star}",
      starNameFromIdentity(award.destinationSystemId),
    );
  }
  if (award.type !== "finished") return null;
  if (award.activity === "asteroid-search")
    return casinoHiloText(locale, "awardFinishedAsteroidSearch").replace(
      "{suffix}",
      award.asteroidName ? ` (${award.asteroidName})` : "",
    );
  if (award.activity === "star-study") return casinoHiloText(locale, "awardFinishedStarStudy");
  if (award.activity === "void-pillage") return casinoHiloText(locale, "awardFinishedVoidPillage");
  return null;
}

function hiloPrizeAndDetail(
  locale: LocaleId,
  outcome: HigherLowerOutcome,
  state?: GameState,
): string {
  const name = hiloPrizeName(locale, outcome, state);
  const detail = hiloAwardDetail(locale, outcome.award, state);
  return detail ? `${name} - ${detail}` : name;
}

function hiloNotice(
  locale: LocaleId,
  event: Extract<EngineEvent, { type: "casino.higher-lower.revealed" }>,
  state?: GameState,
): CasinoEventNotice | null {
  if (!event.correct) {
    return {
      message: casinoText(locale, "hiloLossNotification"),
      classification: "galacticCasino",
      type: "error",
      durationMs: 2500,
    };
  }
  if (event.index !== 8 || !event.outcome) return null;
  return {
    message: casinoText(locale, "hiloFullDeckNotification").replace(
      "{prize}",
      hiloPrizeAndDetail(locale, event.outcome, state),
    ),
    classification: "galacticCasino",
    type: "info",
    durationMs: 2500,
  };
}

function hiloCashOutNotice(
  locale: LocaleId,
  event: Extract<EngineEvent, { type: "casino.game.played" }>,
  state?: GameState,
): CasinoEventNotice | null {
  const outcome = event.higherLowerOutcome;
  if (!outcome || !Number.isSafeInteger(event.revealedCount) || event.revealedCount! < 1)
    return null;
  return {
    message: casinoText(locale, "hiloCashOutNotification")
      .replace("{count}", noticeQuantity(locale, event.revealedCount!, state))
      .replace("{prize}", hiloPrizeAndDetail(locale, outcome, state)),
    classification: "galacticCasino",
    type: "info",
    durationMs: 2500,
  };
}

function wheelResultNotice(locale: LocaleId, result: string, state?: GameState): CasinoEventNotice {
  const [kind, value] = result.split(":");
  const prefix = wheelWinPrefix(locale);
  if (kind && ECONOMIC_GOOD_IDS.includes(kind as EconomicGoodId) && value !== undefined) {
    return {
      message: `${prefix}${amountText(locale, Number(value), state)} ${economyGoodName(locale, kind as EconomicGoodId)}`,
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    };
  }
  if (kind === "cash" && value !== undefined) {
    return {
      message: `${prefix}${amountText(locale, Number(value), state)} ${casinoText(locale, "cash")}`,
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    };
  }
  if (kind === "research" && value !== undefined) {
    return {
      message: `${prefix}${amountText(locale, Number(value), state)} ${casinoText(locale, "researchPoints")}`,
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    };
  }
  if (kind === "cp" && value !== undefined) {
    return {
      message: `${prefix}${amountText(locale, Number(value), state)} ${casinoText(locale, "wheelCurrencyCp")}`,
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    };
  }
  const timeMatch = /^time:(.+):(\d+(?:\.\d+)?)$/.exec(result);
  if (timeMatch) {
    const timerId = timeMatch[1]!;
    const reductionMs = Number(timeMatch[2]);
    const timer = state?.run.timers[timerId];
    if (!state || !timer || !Number.isFinite(reductionMs) || reductionMs < 0) {
      return {
        message: casinoText(locale, "wheelGenericWinNotification"),
        classification: "galacticCasino",
        type: "info",
        durationMs: 2500,
      };
    }
    const afterMs = Math.max(0, timer.durationMs - timer.elapsedMs);
    const beforeSeconds = Math.ceil((afterMs + reductionMs) / 1000);
    const afterSeconds = Math.ceil(afterMs / 1000);
    return {
      message: fillWheelTimeNotice(
        locale,
        wheelTimerLabel(locale, timerId, state),
        beforeSeconds,
        afterSeconds,
        state,
      ),
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    };
  }
  return {
    message: casinoText(locale, "wheelGenericWinNotification"),
    classification: "galacticCasino",
    type: "info",
    durationMs: 2500,
  };
}

function specialPrizeName(
  locale: LocaleId,
  prize: Parameters<typeof casinoSpecialName>[1],
  state?: GameState,
): string {
  if (prize.startsWith("special_double_")) {
    return casinoText(locale, "doubleGood").replace(
      "{good}",
      economyGoodName(locale, prize.slice("special_double_".length) as EconomicGoodId),
    );
  }
  return casinoSpecialName(
    locale,
    prize,
    state ? (value, digits = 0) => amountText(locale, value, state, digits) : undefined,
  );
}

function specialPrizeClaimMessage(
  locale: LocaleId,
  prize: Parameters<typeof casinoSpecialName>[1],
  award: WheelSpecialAward,
  state?: GameState,
): string {
  if (award.type === "cp") {
    if (prize === "special_100cp" && award.amount === 100)
      return casinoText(locale, "wheelClaim100CpNotification").replace(
        "100",
        noticeQuantity(locale, award.amount, state),
      );
    return `${casinoText(locale, "wheelClaimDoublePrefix")}${amountText(locale, award.amount, state)}${casinoText(locale, "wheelCurrencyCp")}`;
  }
  if (award.type === "research" && prize === "special_100k_research" && award.amount === 100_000)
    return state
      ? casinoText(locale, "wheelClaimResearchNotification").replace(
          /100(?:[.,\s\u202f]?000)/,
          amountText(locale, award.amount, state),
        )
      : casinoText(locale, "wheelClaimResearchNotification");
  if (award.type === "double") {
    const good = economyGoodName(locale, award.goodId);
    return `${casinoText(locale, "wheelClaimDoublePrefix")}${good}${casinoText(locale, "wheelClaimDoubleSuffix")}`;
  }
  if (award.type === "starship-warp") {
    return casinoWheelNotificationText(locale, "claimStarshipWarp").replace(
      "{star}",
      starNameFromIdentity(award.destinationSystemId),
    );
  }
  if (award.type === "rocket-warp") {
    const rocketNumber = /^rocket(\d+)$/i.exec(award.rocketId)?.[1];
    const defaultRocketName = rocketNumber ? `Rocket ${rocketNumber}` : undefined;
    const rocketLabel =
      rocketNumber && award.rocketName === defaultRocketName
        ? rocketText(locale, "rocketLabel", { index: Number(rocketNumber) })
        : rocketNumber
          ? `Rocket ${rocketNumber} ${award.rocketName}`
          : award.rocketName;
    const destination =
      award.destination.type === "base"
        ? casinoHistoryText(locale, "baseDestination")
        : `${casinoHistoryText(locale, "asteroidDestinationPrefix")}${award.destination.name}`;
    return casinoWheelNotificationText(locale, "claimRocketWarp")
      .replace("{rocket}", rocketLabel)
      .replace("{destination}", destination);
  }
  if (award.type === "telescope-finished") {
    if (award.activity === "star-study")
      return casinoText(locale, "wheelClaimStarStudyNotification");
    if (award.activity === "asteroid-search")
      return casinoText(locale, "wheelClaimAsteroidSearchNotification");
    return casinoText(locale, "wheelClaimVoidPillageNotification");
  }
  return casinoText(locale, "prizeClaimed").replace(
    "{prize}",
    specialPrizeName(locale, prize, state),
  );
}

export function casinoWheelAttemptFailureNotice(
  locale: LocaleId,
  failureCode: string,
): CasinoEventNotice | null {
  const key =
    failureCode === "casino-wheel-prize-pending"
      ? "spinClaimBefore"
      : failureCode === "casino-insufficient-cp"
        ? "spinInsufficientCp"
        : null;
  if (!key) return null;
  return {
    message: casinoWheelNotificationText(locale, key),
    classification: "galacticCasino",
    type: "info",
    durationMs: 2500,
  };
}

/** Maps accepted casino outcomes to source-style notices without duplicating companion events. */
export function casinoEventNotice(
  locale: LocaleId,
  event: EngineEvent,
  state?: GameState,
): CasinoEventNotice | null {
  if (event.type === "casino.wheel.special-ready") {
    return {
      message: casinoText(locale, "wheelSpecialReadyNotification"),
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    };
  }
  if (event.type === "casino.wheel.special-claimed") {
    return {
      message: specialPrizeClaimMessage(locale, event.prize, event.award, state),
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    };
  }
  if (event.type === "casino.higher-lower.revealed") {
    return hiloNotice(locale, event, state);
  }
  if (event.type === "casino.void-seer.result") {
    return voidSeerNotice(locale, event, state);
  }
  if (event.type !== "casino.game.played") return null;
  if (event.gameId === "doubleOrNothing") {
    if (event.result !== "win" && event.result !== "loss") return null;
    const won = event.result === "win";
    return {
      message: casinoText(
        locale,
        won ? "doubleOrNothingWinNotification" : "doubleOrNothingLossNotification",
      ),
      classification: "galacticCasino",
      type: won ? "info" : "error",
      durationMs: 2500,
    };
  }
  if (event.gameId === "higherLower") return hiloCashOutNotice(locale, event, state);
  if (event.gameId !== "wheel" || event.result === "special-ready") return null;
  if (event.result === "loss") {
    return {
      message: casinoText(locale, "wheelLossNotification"),
      classification: "galacticCasino",
      type: "error",
      durationMs: 2000,
    };
  }
  return wheelResultNotice(locale, event.result, state);
}

function isWheelSpinNoticeEvent(event: EngineEvent): boolean {
  return (
    event.type === "casino.wheel.special-ready" ||
    (event.type === "casino.game.played" &&
      event.gameId === "wheel" &&
      event.result !== "special-ready")
  );
}

export function createCasinoEventNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: CasinoEventNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    if (getState().settings.notificationsEnabled === false) return;
    for (const event of events) {
      const state = getState();
      const notice = casinoEventNotice(getLocale(), event, state);
      if (!notice) continue;
      const deliver = () => {
        if (getState().settings.notificationsEnabled !== false) notify(notice);
      };
      if (isWheelSpinNoticeEvent(event)) {
        if (state.settings.reducedMotion) {
          deliver();
        } else {
          globalThis.setTimeout(deliver, WHEEL_SPIN_NOTIFICATION_DELAY_MS);
        }
      } else {
        deliver();
      }
    }
  };
}
