import { useEffect, useRef, useState } from "react";
import type { AnimationEvent } from "react";
import type { NewsTickerEntry } from "../content/metaSignals";
import { checkNewsPrizeClaim, newsPrizeClaimAmount } from "../engine/newsTicker";
import type { GameState } from "../engine/state";
import type { GameStore } from "../engine/store";
import { economyLabel } from "../i18n/economyMessages";
import { metaSignalText, newsCategoryName, newsEntryText } from "../i18n/metaSignalMessages";
import type { LocaleNewsCopy } from "../i18n/sourceNewsCopy";

interface NewsTickerBarProps {
  readonly state: GameState;
  readonly store: GameStore;
}

function wackyEffectClass(id: number): string {
  return (
    ["wave", "disco", "bounce", "fade", "glitch", "wobble", "boo", "feedback"][id - 1000] ?? ""
  );
}

function tickerEntryKey(entry: NewsTickerEntry | null): string | null {
  return entry ? `${entry.id}-${entry.simulationMs}` : null;
}

export function NewsTickerBar({ state, store }: NewsTickerBarProps) {
  const locale = state.settings.locale;
  const latestEntry = state.run.newsTicker.entries.at(-1) ?? null;
  const latestKeyRef = useRef(tickerEntryKey(latestEntry));
  const [entry, setEntry] = useState<NewsTickerEntry | null>(latestEntry);
  const queuedEntriesRef = useRef<readonly NewsTickerEntry[]>([]);
  const [copy, setCopy] = useState<LocaleNewsCopy | null>(null);
  const [activatedMessage, setActivatedMessage] = useState("");
  const [wackyEffect, setWackyEffect] = useState("");
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const reducedMotion = state.settings.reducedMotion || systemReducedMotion;
  const currentEntry = entry
    ? ([...state.run.newsTicker.entries].reverse().find(
        (item) => tickerEntryKey(item) === tickerEntryKey(entry),
      ) ?? entry)
    : null;
  const availablePrizeAmount =
    currentEntry?.category === "prize" && !currentEntry.claimed
      ? newsPrizeClaimAmount(state, currentEntry)
      : null;
  const displayEntry =
    currentEntry?.category === "prize" && !currentEntry.claimed && availablePrizeAmount !== null
      ? { ...currentEntry, prizeAmount: availablePrizeAmount }
      : currentEntry;
  const text = displayEntry ? newsEntryText(locale, displayEntry, copy ?? undefined) : "";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setSystemReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      latestKeyRef.current = tickerEntryKey(latestEntry);
      setEntry(latestEntry);
      queuedEntriesRef.current = [];
      return;
    }
    const latestKey = tickerEntryKey(latestEntry);
    if (!latestEntry || latestKey === latestKeyRef.current) return;
    latestKeyRef.current = latestKey;
    if (!entry) {
      setEntry(latestEntry);
    } else {
      queuedEntriesRef.current = [...queuedEntriesRef.current, latestEntry];
    }
  }, [entry, latestEntry, reducedMotion]);

  function advanceMessage(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget || event.animationName !== "news-ticker-scroll")
      return;
    const [nextEntry, ...remainingEntries] = queuedEntriesRef.current;
    queuedEntriesRef.current = remainingEntries;
    setEntry(nextEntry ?? null);
  }

  useEffect(() => {
    if (!entry || state.settings.newsTickerEnabled === false) return;
    let current = true;
    void import("../i18n/sourceNewsCopy").then((module) => {
      if (current) setCopy(module.sourceNewsCopy(locale));
    });
    return () => {
      current = false;
    };
  }, [entry?.id, entry?.simulationMs, locale, state.settings.newsTickerEnabled]);

  if (state.settings.newsTickerEnabled === false) return null;

  const entryKey = displayEntry ? `${displayEntry.id}-${displayEntry.simulationMs}` : "idle";
  const canClaim = Boolean(
    displayEntry &&
    (displayEntry.category === "prize" || displayEntry.category === "oneOff") &&
    !displayEntry.claimed &&
    checkNewsPrizeClaim(state, displayEntry.id, displayEntry.simulationMs),
  );
  const isClaimed = Boolean(
    displayEntry?.claimed ||
    (displayEntry?.category === "oneOff" &&
      state.run.newsTicker.claimedPrizeIds.includes(displayEntry.id)),
  );
  const storageFull = Boolean(
    currentEntry?.category === "prize" &&
    !currentEntry.claimed &&
    availablePrizeAmount === null,
  );

  function claimNews(): void {
    if (displayEntry && canClaim)
      store.dispatch({
        type: "news.prize.claim",
        id: displayEntry.id,
        simulationMs: displayEntry.simulationMs,
      });
  }

  function activateWacky(effect = wackyEffectClass(displayEntry?.id ?? -1)): void {
    if (!displayEntry || displayEntry.category !== "wacky" || activatedMessage === entryKey) return;
    store.dispatch({ type: "news.wacky.activate", id: displayEntry.id });
    setActivatedMessage(entryKey);
    setWackyEffect(effect);
  }

  function renderMessage() {
    if (!displayEntry) return <span>{text}</span>;
    if (displayEntry.category === "wacky") {
      if (displayEntry.id === 1007) {
        const positiveMarks = /(?:👍(?:🏽)?)+/u.exec(text);
        const negativeMarks = /(?:👎(?:🏽)?)+/u.exec(text);
        if (positiveMarks?.index !== undefined && negativeMarks?.index !== undefined) {
          const positiveStart = positiveMarks.index;
          const positiveEnd = positiveStart + positiveMarks[0].length;
          const negativeStart = negativeMarks.index;
          const negativeEnd = negativeStart + negativeMarks[0].length;
          const isActivated = activatedMessage === entryKey;
          return (
            <span>
              {text.slice(0, positiveStart)}
              <button
                className="news-ticker-action news-ticker-wacky news-ticker-feedback-choice"
                type="button"
                disabled={isActivated}
                aria-label={`${metaSignalText(locale, "activate")}: ${text.slice(0, positiveStart)} ${positiveMarks[0]}`}
                onClick={() => activateWacky("feedback-good")}
              >
                {positiveMarks[0]}
              </button>
              {text.slice(positiveEnd, negativeStart)}
              <button
                className="news-ticker-action news-ticker-wacky news-ticker-feedback-choice"
                type="button"
                disabled={isActivated}
                aria-label={`${metaSignalText(locale, "activate")}: ${text.slice(negativeStart, negativeEnd)}`}
                onClick={() => activateWacky("feedback-bad")}
              >
                {negativeMarks[0]}
              </button>
              {text.slice(negativeEnd)}
            </span>
          );
        }
      }
      return (
        <button
          className="news-ticker-action news-ticker-wacky"
          type="button"
          disabled={activatedMessage === entryKey}
          aria-label={`${metaSignalText(locale, "activate")} ${text}`}
          onClick={() => activateWacky()}
        >
          {text}
        </button>
      );
    }

    if (displayEntry.category === "prize" || displayEntry.category === "oneOff") {
      const actionWord = copy?.here ?? metaSignalText(locale, "here");
      const actionAt = actionWord ? text.indexOf(actionWord) : -1;
      if (actionWord && actionAt >= 0) {
        return (
          <span>
            {text.slice(0, actionAt)}
            <button
              className="news-ticker-action news-ticker-claim"
              type="button"
              disabled={!canClaim}
              aria-label={`${metaSignalText(locale, isClaimed ? "claimed" : "claim")}: ${text}${storageFull ? `. ${economyLabel(locale, "collectStorageFull")}` : ""}`}
              onClick={claimNews}
            >
              {actionWord}
            </button>
            {text.slice(actionAt + actionWord.length)}
            {storageFull ? (
              <span className="news-ticker-claim-reason">
                {` (${economyLabel(locale, "collectStorageFull")})`}
              </span>
            ) : null}
          </span>
        );
      }
    }

    return (
      <span>
        {text}
        {displayEntry.category === "prize" || displayEntry.category === "oneOff" ? (
          <button
            className="news-ticker-action news-ticker-claim"
            type="button"
            disabled={!canClaim}
            aria-label={`${metaSignalText(locale, isClaimed ? "claimed" : "claim")}: ${text}${storageFull ? `. ${economyLabel(locale, "collectStorageFull")}` : ""}`}
            onClick={claimNews}
          >
            {isClaimed ? metaSignalText(locale, "claimed") : metaSignalText(locale, "claim")}
          </button>
        ) : null}
        {storageFull ? (
          <span className="news-ticker-claim-reason">
            {` (${economyLabel(locale, "collectStorageFull")})`}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <aside
      className={`news-ticker-bar${activatedMessage === entryKey && wackyEffect ? ` news-effect-${wackyEffect}` : ""}`}
      aria-label={metaSignalText(locale, "news")}
      data-testid="news-ticker"
      data-news-id={displayEntry?.id}
    >
      <div className="news-ticker-window">
        <div
          key={entryKey}
          className="news-ticker-message"
          aria-live="polite"
          aria-atomic="true"
          onAnimationEnd={advanceMessage}
        >
          <span className="news-ticker-copy">
            {displayEntry && (
              <span className="sr-only">{newsCategoryName(locale, displayEntry.category)}: </span>
            )}
            {displayEntry ? renderMessage() : <span aria-hidden="true" />}
          </span>
        </div>
      </div>
    </aside>
  );
}
