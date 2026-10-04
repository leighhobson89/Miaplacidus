import { RANDOM_EVENT_IDS } from "../content/metaSignals";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import {
  journalLabel,
  metaSignalText,
  newsCategoryName,
  newsEntryText,
  randomEventName,
} from "../i18n/metaSignalMessages";

function timeLabel(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

export function MetaJournalPane({
  state,
  store,
}: {
  readonly state: GameState;
  readonly store: GameStore;
}) {
  const locale = state.settings.locale;
  const events = state.run.randomEvents;
  const news = state.run.newsTicker;
  const latestEvents = [...events.history].slice(-8).reverse();
  const latestNews = [...news.entries].slice(-12).reverse();
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
              {metaSignalText(locale, "remaining")} {timeLabel(news.remainingMs)}
            </small>
          </header>
          {latestNews.length === 0 ? (
            <p className="journal-empty">{metaSignalText(locale, "noNews")}</p>
          ) : (
            <ol className="journal-list">
              {latestNews.map((entry) => (
                <li key={`${entry.id}-${entry.simulationMs}`} data-news-id={entry.id}>
                  <div>
                    <p>{newsEntryText(locale, entry)}</p>
                    <small>
                      {newsCategoryName(locale, entry.category)} ·{" "}
                      {timeLabel(Math.max(0, state.run.clock.simulationMs - entry.simulationMs))}{" "}
                      {journalLabel(locale, "ago")}
                    </small>
                  </div>
                  {(entry.category === "prize" || entry.category === "oneOff") && (
                    <button
                      className="text-button"
                      type="button"
                      disabled={entry.claimed}
                      onClick={() => store.dispatch({ type: "news.prize.claim", id: entry.id })}
                    >
                      {entry.claimed
                        ? metaSignalText(locale, "claimed")
                        : metaSignalText(locale, "claim")}
                    </button>
                  )}
                </li>
              ))}
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
                  <strong>{timeLabel(effect.remainingMs)}</strong>
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
                  <span
                    className={entry.negative ? "journal-negative" : "journal-positive"}
                    aria-hidden="true"
                  >
                    {entry.negative ? "−" : "+"}
                  </span>
                  <div>
                    <p>{randomEventName(locale, entry.id)}</p>
                    <small>
                      {timeLabel(Math.max(0, state.run.clock.simulationMs - entry.simulationMs))}{" "}
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
