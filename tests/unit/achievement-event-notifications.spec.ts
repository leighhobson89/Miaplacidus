import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATALOGUE, ACHIEVEMENT_IDS } from "../../src/content/achievements";
import { LOCALE_IDS } from "../../src/content/ids";
import { createInitialGameState } from "../../src/engine/state";
import type { EngineEvent } from "../../src/engine/commands";
import { formatCurrency } from "../../src/app/currencyFormatting";
import {
  achievementEventNotice,
  createAchievementEventNoticeHandler,
} from "../../src/app/achievementEventNotifications";
import { ACHIEVEMENT_NOTIFICATION_COPY } from "../../src/i18n/achievementNotificationCopy.generated";

describe("achievement unlock notifications", () => {
  it("fills localized cash reward templates for every cash achievement and locale", () => {
    const state = createInitialGameState();
    for (const locale of LOCALE_IDS) {
      for (const achievementId of ACHIEVEMENT_IDS) {
        expect(ACHIEVEMENT_NOTIFICATION_COPY[locale][achievementId]).not.toBe("");
      }
      const localizedState = {
        ...state,
        settings: { ...state.settings, locale },
      };
      for (const definition of ACHIEVEMENT_CATALOGUE) {
        const template = ACHIEVEMENT_NOTIFICATION_COPY[locale][definition.id];
        if (definition.reward.type !== "cash") {
          expect(template).not.toContain("{cashReward}");
          continue;
        }

        expect(template).toContain("{cashReward}");
        const formattedReward = formatCurrency(
          locale,
          definition.reward.amount,
          localizedState.settings.currencyId ?? "usd",
          0,
          localizedState.settings.notation,
        );
        const notice = achievementEventNotice(
          locale,
          { type: "achievement.unlocked", achievementId: definition.id },
          localizedState,
        );

        expect(notice).toMatchObject({
          message: template.replace("{cashReward}", formattedReward),
          classification: "achievement",
          type: "success",
          durationMs: 4000,
        });
        expect(notice?.message).not.toContain("{cashReward}");
      }
    }
  });

  it("routes achievement events once and stays silent for disabled or unrelated notices", () => {
    const state = createInitialGameState();
    const notices: unknown[] = [];
    const route = createAchievementEventNoticeHandler(
      () => "en",
      () => state,
      (notice) => notices.push(notice),
    );
    const events: readonly EngineEvent[] = [
      { type: "onboarding.completed" },
      { type: "achievement.unlocked", achievementId: "collect50Hydrogen" },
    ];

    route(events);
    expect(notices).toHaveLength(1);

    const mutedState = {
      ...state,
      settings: { ...state.settings, notificationsEnabled: false },
    };
    const mutedRoute = createAchievementEventNoticeHandler(
      () => "en",
      () => mutedState,
      (notice) => notices.push(notice),
    );
    mutedRoute([{ type: "achievement.unlocked", achievementId: "collect50Hydrogen" }]);

    expect(notices).toHaveLength(1);
  });
});
