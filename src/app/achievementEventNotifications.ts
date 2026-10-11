import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import type { LocaleId } from "../content/ids";
import { ACHIEVEMENT_CATALOGUE } from "../content/achievements";
import { ACHIEVEMENT_NOTIFICATION_COPY } from "../i18n/achievementNotificationCopy.generated";
import { formatCurrency } from "./currencyFormatting";
import type { GameNotificationType } from "./NotificationStack";

export interface AchievementEventNotice {
  readonly message: string;
  readonly classification: "achievement";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

export function achievementEventNotice(
  locale: LocaleId,
  event: EngineEvent,
  state: GameState,
): AchievementEventNotice | null {
  if (event.type !== "achievement.unlocked" || state.settings.notificationsEnabled === false)
    return null;

  let message: string = ACHIEVEMENT_NOTIFICATION_COPY[locale][event.achievementId];
  const definition = ACHIEVEMENT_CATALOGUE.find(({ id }) => id === event.achievementId);
  if (definition?.reward.type === "cash") {
    const formattedReward = formatCurrency(
      locale,
      definition.reward.amount,
      state.settings.currencyId ?? "usd",
      0,
      state.settings.notation,
    );
    message = message.replace("{cashReward}", formattedReward);
  }

  return {
    message,
    classification: "achievement",
    type: "success",
    durationMs: 4000,
  };
}

export function createAchievementEventNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: AchievementEventNotice) => void,
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    for (const event of events) {
      const notice = achievementEventNotice(getLocale(), event, getState());
      if (notice) notify(notice);
    }
  };
}
