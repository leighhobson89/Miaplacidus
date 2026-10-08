import { useEffect, useState } from "react";
import { RANDOM_EVENT_IDS } from "../content/metaSignals";
import { checkNewsPrizeClaim, newsPrizeClaimAmount } from "../engine/newsTicker";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyLabel } from "../i18n/economyMessages";
import { formatDuration } from "./timeFormatting";
import {
  journalLabel,
  metaSignalText,
  newsCategoryName,
  newsEntryText,
  randomEventName,
} from "../i18n/metaSignalMessages";
import type { LocaleNewsCopy } from "../i18n/sourceNewsCopy";
import { RandomEventArtwork } from "./RandomEventArtwork";

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
  const latestEvents = [...events.history].slice(-8).reverse();
  const latestNews = [...news.entries].slice(-12).reverse();

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
          <p className="eyebrow">META / SIGNALS</p>
          <h2 id="meta-journal-title">{metaSignalText(locale, "title")}</h2>
          <p className="pane-intro">{metaSignalText(locale, "description")}</p>
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
                  entry.category === "prize" &&
                  !entry.claimed &&
                  availablePrizeAmount !== null
                    ? { ...entry, prizeAmount: availablePrizeAmount }
                    : entry;
                const canClaim = checkNewsPrizeClaim(state, entry.id, entry.simulationMs);
                const storageFull =
                  entry.category === "prize" && !entry.claimed && availablePrizeAmount === null;
                return (
                <li key={`${entry.id}-${entry.simulationMs}`} data-news-id={entry.id}>
                  <div>
                    <p>{newsEntryText(locale, displayEntry, newsCopy ?? undefined)}</p>
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
                      <small className="news-ticker-claim-reason">
                        {economyLabel(locale, "collectStorageFull")}
                      </small>
                    )}
                  </div>
                  {(entry.category === "prize" || entry.category === "oneOff") && (
                    <button
                      className="text-button"
                      type="button"
                      disabled={!canClaim}
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
            <h3 id="journal-events-heading">{metaSignalText(locale, "events")}</h3>
            <small>
              {metaSignalText(locale, "active")}: {events.activeEffects.length}
            </small>
          </header>
          {events.activeEffects.length > 0 && (
            <ul className="journal-active-effects">
              {events.activeEffects.map((effect) => (
                <li key={effect.id}>
                  <span>{randomEventName(locale, effect.id)}</span>
                  <strong>
                    {formatDuration(locale, effect.remainingMs, state.settings.notation)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
          <h4 className="journal-subheading">{metaSignalText(locale, "history")}</h4>
          {latestEvents.length === 0 ? (
            <p className="journal-empty">{metaSignalText(locale, "noEvents")}</p>
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
                    <small>
                      {formatDuration(
                        locale,
                        Math.max(0, state.run.clock.simulationMs - entry.simulationMs),
                        state.settings.notation,
                      )}{" "}
                      {journalLabel(locale, "ago")}
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
