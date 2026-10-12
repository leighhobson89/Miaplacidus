import type { LocaleId } from "../content/ids";
import type { EngineEvent } from "../engine/commands";
import { randomEventInstabilityNotificationText } from "../i18n/randomEventInstabilityNotificationMessages";
import type { GameNotificationType } from "./NotificationStack";

export interface RandomEventInstabilityNotice {
  readonly message: string;
  readonly classification: "default";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

export function createRandomEventInstabilityNoticeHandler(
  getLocale: () => LocaleId,
  notificationsEnabled: () => boolean,
  notify: (notice: RandomEventInstabilityNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    if (!notificationsEnabled()) return;
    for (const event of events) {
      if (event.type !== "random-event.black-hole-instability-shifted") continue;
      notify({
        message: randomEventInstabilityNotificationText(
          getLocale(),
          event.powerMultiplier,
          event.durationMultiplier,
          event.durationAffected,
        ),
        classification: "default",
        type: "info",
        durationMs: 5000,
      });
    }
  };
}
