import type { LocaleId } from "../content/ids";
import type { RandomEventId } from "../content/metaSignals";
import type { EngineEvent } from "../engine/commands";
import {
  randomEventEndDialogText,
  type RandomEventEndDialogCopy,
} from "../i18n/randomEventEndDialogMessages";
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
  showResultDialog: (dialog: RandomEventEndDialogCopy) => void = () => {},
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    for (const event of events) {
      if (event.type !== "random-event.ended") continue;
      const locale = getLocale();
      const name = targetName(event.id, event.targetId);
      if (notificationsEnabled()) {
        const message = randomEventEndNotificationText(locale, event.id, name);
        if (message) {
          notify({
            message,
            classification: "default",
            type: "info",
            durationMs: 5000,
          });
        }
      }

      // Cosmic Forge displays the restoration toast before its expiry modal.
      const resultDialog = randomEventEndDialogText(locale, event.id, name);
      if (resultDialog) showResultDialog(resultDialog);
    }
  };
}
