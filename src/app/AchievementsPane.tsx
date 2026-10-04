import { ACHIEVEMENT_CATALOGUE, achievementName } from "../content/achievements";
import type { LocaleId } from "../content/ids";
import type { GameState } from "../engine/state";
import { achievementText } from "../i18n/achievementMessages";
import { achievementRewardText } from "../i18n/achievementRewardMessages";
import { AchievementBadge } from "./AchievementBadge";
import { economyGoodName } from "./EconomyPanes";

function rewardText(
  locale: LocaleId,
  reward: (typeof ACHIEVEMENT_CATALOGUE)[number]["reward"],
): string {
  const amount = new Intl.NumberFormat(locale).format("amount" in reward ? reward.amount : 0);
  switch (reward.type) {
    case "none":
      return achievementText(locale, "noReward");
    case "cash":
      return `$${amount}`;
    case "ascendency-points":
      return achievementRewardText(locale, "ap", { amount });
    case "glory-points":
      return achievementRewardText(locale, "gp", { amount });
    case "antimatter":
      return achievementRewardText(locale, "antimatter", { amount });
    case "good":
      return achievementRewardText(locale, "good", {
        amount,
        good: economyGoodName(locale, reward.goodId),
      });
    case "double-resources":
      return achievementRewardText(locale, "resources");
    case "double-compounds":
      return achievementRewardText(locale, "compounds");
    case "resource-rate":
      return reward.permanentBonus
        ? achievementRewardText(locale, "rateBonus", {
            value: Math.round(reward.permanentBonus * 100),
          })
        : achievementRewardText(locale, "rate", { value: reward.multiplier });
    case "sale-value":
      return achievementRewardText(locale, "sale", { value: reward.multiplier });
    case "compound-recipe-cost":
      return achievementRewardText(locale, "recipe", { value: reward.multiplier });
  }
}

export function AchievementsPane({ state }: { readonly state: GameState }) {
  const locale = state.settings.locale;
  const unlocked = new Set([
    ...state.run.achievements.unlockedIds,
    ...state.permanent.achievements.unlockedIds,
  ]);
  const count = unlocked.size;
  return (
    <section
      className="feature-pane achievements-pane"
      aria-labelledby="achievements-title"
      data-testid="achievements-pane"
    >
      <div className="pane-heading">
        <div>
          <p className="eyebrow">
            META / {count} / {ACHIEVEMENT_CATALOGUE.length}
          </p>
          <h2 id="achievements-title">{achievementText(locale, "title")}</h2>
          <p className="pane-intro">{achievementText(locale, "description")}</p>
        </div>
        <div className="achievement-total" aria-live="polite">
          <strong>{count}</strong>
          <span>{achievementText(locale, "unlocked")}</span>
        </div>
      </div>
      <div className="achievement-grid">
        {ACHIEVEMENT_CATALOGUE.map((definition) => {
          const earned = unlocked.has(definition.id);
          const permanent = !definition.resetOnRebirth;
          return (
            <article
              className={`achievement-card${earned ? " is-earned" : " is-locked"}`}
              key={definition.id}
              data-achievement-id={definition.id}
            >
              <AchievementBadge id={definition.id} locked={!earned} />
              <div className="achievement-copy">
                <h3>{achievementName(definition.id, locale)}</h3>
                <p>
                  <span>{achievementText(locale, "reward")}:</span>{" "}
                  {rewardText(locale, definition.reward)}
                </p>
                <small>
                  {permanent
                    ? achievementText(locale, "permanent")
                    : achievementText(locale, "thisRun")}
                </small>
              </div>
              <span
                className="achievement-status"
                aria-label={
                  earned ? achievementText(locale, "unlocked") : achievementText(locale, "progress")
                }
              >
                {earned ? "✓" : "·"}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
