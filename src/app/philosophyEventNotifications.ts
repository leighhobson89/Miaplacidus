import type { LocaleId, PhilosophyId } from "../content/ids";
import type { EngineEvent } from "../engine/commands";
import {
  philosophyText,
  philosophyUpgradeNoticeText,
  rapidExpansionActivatedText,
  type PhilosophyUpgradeNoticeId,
} from "../i18n/philosophyMessages";
import type { GameNotificationType } from "./NotificationStack";

export interface PhilosophyEventNotice {
  readonly message: string;
  readonly classification: "special" | "tech";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

const NON_EXPANSIONIST_ABILITY_NOTICE_ID: Record<
  Exclude<PhilosophyId, "expansionist">,
  PhilosophyUpgradeNoticeId
> = {
  constructor: "spaceStorageTankResearch",
  supremacist: "fleetHolograms",
  voidborn: "voidSeers",
};

export function philosophyEventNotice(
  locale: LocaleId,
  event: EngineEvent,
): PhilosophyEventNotice | null {
  if (event.type === "philosophy.ability.activated") {
    const message =
      event.philosophyId === "expansionist"
        ? rapidExpansionActivatedText(locale)
        : philosophyUpgradeNoticeText(locale, NON_EXPANSIONIST_ABILITY_NOTICE_ID[event.philosophyId]);
    return {
      message,
      classification: "tech",
      type: "info",
      durationMs: 3000,
    };
  }
  if (event.type === "philosophy.repeatable.purchased") {
    return {
      message: philosophyUpgradeNoticeText(locale, event.repeatableId),
      classification: "tech",
      type: "info",
      durationMs: 3000,
    };
  }
  if (event.type !== "philosophy.selected") return null;

  return {
    message: philosophyText(locale).selectionNotifications[event.philosophyId],
    classification: "special",
    type: "warning",
    durationMs: 3000,
  };
}

export function createPhilosophyEventNoticeHandler(
  getLocale: () => LocaleId,
  notify: (notice: PhilosophyEventNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    for (const event of events) {
      const notice = philosophyEventNotice(getLocale(), event);
      if (notice) notify(notice);
    }
  };
}
