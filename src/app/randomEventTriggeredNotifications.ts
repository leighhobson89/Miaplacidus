import type { LocaleId } from "../content/ids";
import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import { randomEventTriggerNotificationText } from "../i18n/randomEventTriggerNotificationMessages";
import type { GameNotificationType } from "./NotificationStack";
import { economyGoodName } from "./economyDisplay";

export interface RandomEventTriggeredNotice {
  readonly message: string;
  readonly classification: "default";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

export function createRandomEventTriggeredNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: RandomEventTriggeredNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    const triggered = events.filter(
      (event): event is Extract<EngineEvent, { readonly type: "random-event.triggered" }> =>
        event.type === "random-event.triggered",
    );
    if (triggered.length === 0) return;

    const state = getState();
    if (state.settings.notificationsEnabled === false) return;
    const locale = getLocale();
    const history = state.run.randomEvents.history.slice(-triggered.length);

    triggered.forEach((event, index) => {
      const entry = history[index];
      notify({
        message: randomEventTriggerNotificationText(
          locale,
          event.id,
          entry?.id === event.id ? entry : undefined,
          entry?.id === "supplyChainDisruption" && entry.details?.kind === "supplyChainDisruption"
            ? economyGoodName(locale, entry.details.goodId)
            : undefined,
        ),
        classification: "default",
        type: "info",
        durationMs: 5000,
      });
    });
  };
}
