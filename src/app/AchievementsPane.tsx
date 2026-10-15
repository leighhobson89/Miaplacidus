import { ACHIEVEMENT_CATALOGUE, achievementName } from "../content/achievements";
import { ACHIEVEMENT_DESCRIPTIONS } from "../content/achievementDescriptions.generated";
import type { GameState } from "../engine/state";
import { achievementText } from "../i18n/achievementMessages";
import { achievementRewardText } from "../i18n/achievementRewardMessages";
import { AchievementBadge } from "./AchievementBadge";
import { economyGoodName } from "./economyDisplay";
import { formatCurrency } from "./currencyFormatting";
import { InfoTooltip } from "./InfoTooltip";
import { formatNumber } from "./numberFormatting";
import { formatDuration } from "./timeFormatting";

function rewardText(
  state: GameState,
  reward: (typeof ACHIEVEMENT_CATALOGUE)[number]["reward"],
): string {
  const { locale, notation, currencyId } = state.settings;
  const amount = formatNumber(locale, "amount" in reward ? reward.amount : 0, 0, notation);
  switch (reward.type) {
    case "none":
      return achievementText(locale, "noReward");
    case "cash":
      return formatCurrency(locale, reward.amount, currencyId ?? "usd", 0, notation);
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
          <div className="achievements-title-row">
            <h2 id="achievements-title">{achievementText(locale, "title")}</h2>
            <InfoTooltip
              id="achievements-header-help"
              label={`${achievementText(locale, "title")} — ${achievementText(locale, "showOverview")}`}
              content={achievementText(locale, "overview")}
              testId="achievements-header-help"
            />
          </div>
          <p className="pane-intro">{achievementText(locale, "description")}</p>
        </div>
        <div className="achievement-total" aria-live="polite">
          <strong>{formatNumber(locale, count, 0, state.settings.notation)}</strong>
          <span>{achievementText(locale, "unlocked")}</span>
        </div>
      </div>
      <div className="achievement-grid">
        {ACHIEVEMENT_CATALOGUE.map((definition) => {
          const earned = unlocked.has(definition.id);
          return (
            <article
              className={`achievement-card${earned ? " is-earned" : " is-locked"}`}
              key={definition.id}
              data-achievement-id={definition.id}
            >
              <AchievementBadge id={definition.id} locked={!earned} />
              <div className="achievement-copy">
                <div className="achievement-name-row">
                  <h3>{achievementName(definition.id, locale)}</h3>
                  <span className="achievement-description-help">
                    <button
                      type="button"
                      aria-label={`${achievementText(locale, "showDescription")}: ${achievementName(definition.id, locale)}`}
                      aria-describedby={`achievement-description-${definition.id}`}
                      title={achievementText(locale, "showDescription")}
                    >
                      <span aria-hidden="true">i</span>
                    </button>
                    <span
                      id={`achievement-description-${definition.id}`}
                      className="achievement-description-tooltip"
                      role="tooltip"
                    >
                      {ACHIEVEMENT_DESCRIPTIONS[definition.id][locale]}
                    </span>
                  </span>
                </div>
                <p>
                  <span>{achievementText(locale, "reward")}:</span>{" "}
                  {rewardText(state, definition.reward)}
                </p>
                <small>
                  {achievementText(locale, "resetOnRebirth")}: {" "}
                  {achievementText(locale, definition.resetOnRebirth ? "yes" : "no")} · {" "}
                  {achievementText(locale, "status")}: {" "}
                  {achievementText(locale, earned ? "achieved" : "notAchieved")}
                </small>
                {definition.id === "have50HoursWithOnePioneer" && (
                  <small className="achievement-logged-time">
                    {achievementText(locale, "logged")}: {" "}
                    {formatDuration(
                      locale,
                      state.statistics.lifetimeActiveMs,
                      state.settings.notation,
                    )}
                  </small>
                )}
              </div>
              <span
                className="achievement-status"
                aria-label={`${achievementText(locale, "status")}: ${achievementText(
                  locale,
                  earned ? "achieved" : "notAchieved",
                )}`}
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
