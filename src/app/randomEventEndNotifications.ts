import type { LocaleId } from "../content/ids";
import type { RandomEventId } from "../content/metaSignals";
import type { EngineEvent } from "../engine/commands";
import { randomEventEndNotificationText } from "../i18n/randomEventEndNotificationMessages";
import type { GameNotificationType } from "./NotificationStack";

export interface RandomEventEndNotice {
  readonly message: string;
  readonly classification: "default";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

export function createRandomEventEndNoticeHandler(
  getLocale: () => LocaleId,
  notificationsEnabled: () => boolean,
  notify: (notice: RandomEventEndNotice) => void,
  targetName: (eventId: RandomEventId, targetId: string | null) => string | null = () => null,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    if (!notificationsEnabled()) return;
    for (const event of events) {
      if (event.type !== "random-event.ended") continue;
      const message = randomEventEndNotificationText(
        getLocale(),
        event.id,
        targetName(event.id, event.targetId),
      );
      if (!message) continue;
      notify({ message, classification: "default", type: "info", durationMs: 5000 });
    }
  };
}
