import { useEffect, useState } from "react";
import { RANDOM_EVENT_IDS } from "../content/metaSignals";
import {
  checkNewsPrizeClaim,
  newsPrizeClaimAmount,
  oneOffApPrizeAmount,
} from "../engine/newsTicker";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyLabel } from "../i18n/economyMessages";
import { starshipText } from "../i18n/starshipMessages";
import { formatDuration } from "./timeFormatting";
import { formatNumber } from "./numberFormatting";
import {
  journalLabel,
  metaSignalText,
  newsCategoryName,
  newsEntryText,
  randomEventName,
} from "../i18n/metaSignalMessages";
import type { LocaleNewsCopy } from "../i18n/sourceNewsCopy";
import { InfoTooltip } from "./InfoTooltip";
import { RandomEventArtwork } from "./RandomEventArtwork";
import {
  randomEventActiveEffectDescription,
  randomEventHistoryDescription,
} from "./randomEventDescription";

function eventTotalDuration(
  locale: GameState["settings"]["locale"],
  durationMs: number | undefined,
) {
  if (durationMs === undefined) return "--";
  if (durationMs === 0) return journalLabel(locale, "instantDuration");
  return `${Math.round(durationMs / 60_000)}m`;
}

export function MetaJournalPane({
  state,
  store,
  active,
}: {
  readonly state: GameState;
  readonly store: GameStore;
  readonly active: boolean;
}) {
  const locale = state.settings.locale;
  const events = state.run.randomEvents;
  const news = state.run.newsTicker;
  const [newsCopy, setNewsCopy] = useState<LocaleNewsCopy | null>(null);
  const latestEvents = [...events.history].reverse();
  const latestNews = [...news.entries].slice(-12).reverse();
  const latestHistoryByEvent = new Map(events.history.map((entry) => [entry.id, entry]));

  useEffect(() => {
    if (!active) return;
    let current = true;
    void import("../i18n/sourceNewsCopy").then((module) => {
      if (current) setNewsCopy(module.sourceNewsCopy(locale));
    });
    return () => {
      current = false;
    };
  }, [active, locale]);
  return (
    <section
      className="feature-pane meta-journal-pane"
      aria-labelledby="meta-journal-title"
      data-testid="meta-journal-pane"
    >
      <div className="pane-heading">
        <div>
          <div className="economy-page-title-row">
            <h2 id="meta-journal-title" className="game-page-title">
              {metaSignalText(locale, "title")}
            </h2>
            <InfoTooltip
              id="settings-events-overview-help"
              label={`${metaSignalText(locale, "title")} — ${starshipText(locale, "scanMoreInfoLabel")}`}
              content={economyLabel(locale, "eventsOverviewHelp")}
              testId="settings-events-overview-help"
            />
          </div>
        </div>
      </div>
      <div className="journal-grid">
        <section className="journal-section" aria-labelledby="journal-news-heading">
          <header className="journal-section-heading">
            <h3 id="journal-news-heading">{metaSignalText(locale, "news")}</h3>
            <small>
              {metaSignalText(locale, "remaining")}{" "}
              {formatDuration(locale, news.remainingMs, state.settings.notation)}
            </small>
          </header>
          {latestNews.length > 0 && (
            <ol className="journal-list">
              {latestNews.map((entry) => {
                const availablePrizeAmount =
                  entry.category === "prize" && !entry.claimed
                    ? newsPrizeClaimAmount(state, entry)
                    : null;
                const displayEntry =
                  entry.category === "prize" && !entry.claimed && availablePrizeAmount !== null
                    ? { ...entry, prizeAmount: availablePrizeAmount }
                    : entry.category === "oneOff" &&
                        entry.id === 3013 &&
                        typeof entry.prizeAmount !== "number"
                      ? {
                          ...entry,
                          prizeAmount:
                            entry.claimed || news.claimedPrizeIds.includes(3013)
                              ? 1
                              : oneOffApPrizeAmount(state),
                        }
                      : entry;
                const canClaim = checkNewsPrizeClaim(state, entry.id, entry.simulationMs);
                const storageFull =
                  entry.category === "prize" && !entry.claimed && availablePrizeAmount === null;
                const claimReasonId = `news-claim-reason-${entry.id}-${entry.simulationMs}`;
                return (
                  <li key={`${entry.id}-${entry.simulationMs}`} data-news-id={entry.id}>
                    <div>
                      <p>
                        {newsEntryText(locale, displayEntry, newsCopy ?? undefined, (value) =>
                          formatNumber(locale, value, 0, state.settings.notation),
                        )}
                      </p>
                      <small>
                        {newsCategoryName(locale, entry.category)} ·{" "}
                        {formatDuration(
                          locale,
                          Math.max(0, state.run.clock.simulationMs - entry.simulationMs),
                          state.settings.notation,
                        )}{" "}
                        {journalLabel(locale, "ago")}
                      </small>
                      {storageFull && (
                        <small className="news-ticker-claim-reason" id={claimReasonId}>
                          {economyLabel(locale, "collectStorageFull")}
                        </small>
                      )}
                    </div>
                    {(entry.category === "prize" || entry.category === "oneOff") && (
                      <button
                        className="text-button"
                        type="button"
                        disabled={!canClaim}
                        aria-describedby={storageFull ? claimReasonId : undefined}
                        onClick={() =>
                          store.dispatch({
                            type: "news.prize.claim",
                            id: entry.id,
                            simulationMs: entry.simulationMs,
                          })
                        }
                      >
                        {entry.claimed
                          ? metaSignalText(locale, "claimed")
                          : metaSignalText(locale, "claim")}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
        <section className="journal-section" aria-labelledby="journal-events-heading">
          <header className="journal-section-heading">
            <h3 id="journal-events-heading">{metaSignalText(locale, "activeTitle")}</h3>
            <small data-testid="journal-active-effect-count">
              {metaSignalText(locale, "active")}:{" "}
              {formatNumber(locale, events.activeEffects.length, 0, state.settings.notation)}
            </small>
          </header>
          {events.activeEffects.length === 0 && (
            <p className="journal-empty">{metaSignalText(locale, "noActiveEvents")}</p>
          )}
          {events.activeEffects.length > 0 && (
            <ul className="journal-active-effects">
              {events.activeEffects.map((effect) => {
                const historyEntry = latestHistoryByEvent.get(effect.id) ?? {
                  id: effect.id,
                  simulationMs: 0,
                  negative: false,
                };
                return (
                  <li key={effect.id}>
                    <div>
                      <span>{randomEventName(locale, effect.id)}</span>
                      <small data-testid="active-event-description">
                        {randomEventActiveEffectDescription(
                          locale,
                          historyEntry,
                          effect,
                          state.run.space.rockets,
                          state.settings.notation,
                        )}
                      </small>
                    </div>
                    <div className="journal-active-duration">
                      <small>{metaSignalText(locale, "activeUntil")}</small>
                      <strong>
                        {formatDuration(locale, effect.remainingMs, state.settings.notation)}
                      </strong>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <h4 className="journal-subheading">{metaSignalText(locale, "history")}</h4>
          {latestEvents.length === 0 ? (
            <p className="journal-empty">{metaSignalText(locale, "noCompletedEvents")}</p>
          ) : (
            <ol className="journal-list journal-event-list">
              {latestEvents.map((entry, index) => (
                <li key={`${entry.id}-${entry.simulationMs}-${index}`} data-event-id={entry.id}>
                  <RandomEventArtwork id={entry.id} negative={entry.negative} />
                  <span
                    className={entry.negative ? "journal-negative" : "journal-positive"}
                    aria-hidden="true"
                  >
                    {entry.negative ? "−" : "+"}
                  </span>
                  <div>
                    <p>{randomEventName(locale, entry.id)}</p>
                    <p data-testid="event-description" className="journal-event-description">
                      {randomEventHistoryDescription(locale, entry, state.settings.notation)}
                    </p>
                    <small className="journal-event-meta">
                      <span>
                        {journalLabel(locale, "totalDuration")}:{" "}
                        {eventTotalDuration(locale, entry.durationMs)}
                      </span>
                      <span>
                        {formatDuration(
                          locale,
                          Math.max(0, state.run.clock.simulationMs - entry.simulationMs),
                          state.settings.notation,
                        )}{" "}
                        {journalLabel(locale, "ago")}
                      </span>
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <details className="journal-event-odds">
            <summary>
              {RANDOM_EVENT_IDS.length} {journalLabel(locale, "eventProbabilities")}
            </summary>
            <ul>
              {RANDOM_EVENT_IDS.map((id) => (
                <li key={id}>
                  <span>{randomEventName(locale, id)}</span>
                  <strong>{Math.round(events.probabilities[id] * 100)}%</strong>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </div>
    </section>
  );
}
