import type { LocaleId } from "../content/ids";
import type { EngineEvent } from "../engine/commands";
import {
  blackHoleDiscoveryDialog,
  blackHoleText,
  blackHoleWarpEndedNotification,
} from "../i18n/blackHoleMessages";
import type { RandomEventDialogCopy } from "../i18n/randomEventDialogTypes";
import type { GameNotificationType } from "./NotificationStack";

export type BlackHoleEventNotice =
  | {
      readonly route: "notification";
      readonly message: string;
      readonly classification: "special";
      readonly type: GameNotificationType;
      readonly durationMs: number;
      readonly resultDialog?: RandomEventDialogCopy;
    }
  | { readonly route: "screen-reader"; readonly message: string };

export function blackHoleEventNotice(
  locale: LocaleId,
  event: EngineEvent,
): BlackHoleEventNotice | null {
  const messages = blackHoleText(locale);
  switch (event.type) {
    case "black-hole.discovery-checked":
      return event.discovered
        ? {
            route: "notification",
            message: messages.discoveredNotification,
            classification: "special",
            type: "info",
            durationMs: 3000,
            resultDialog: blackHoleDiscoveryDialog(locale),
          }
        : null;
    case "black-hole.charge-completed":
      return {
        route: "notification",
        message: messages.chargedNotification,
        classification: "special",
        type: "info",
        durationMs: 3000,
      };
    case "black-hole.warp-ended":
      return {
        route: "screen-reader",
        message: blackHoleWarpEndedNotification(locale),
      };
    default:
      return null;
  }
}

export function createBlackHoleEventNoticeHandler(
  getLocale: () => LocaleId,
  notify: (notice: BlackHoleEventNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    for (const event of events) {
      const notice = blackHoleEventNotice(getLocale(), event);
      if (notice) notify(notice);
    }
  };
}
