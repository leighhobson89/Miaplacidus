import { useMemo, useState, type KeyboardEvent } from "react";
import type { LocaleId } from "../content/ids";
import { LOCALE_IDS } from "../content/ids";
import type { SaveIndexEntry } from "../persistence/repository";
import type { SaveMessageKey } from "../i18n/saveMessages";
import { saveText } from "../i18n/saveMessages";
import { translate } from "../i18n/messages";
import startupScene from "../assets/miaplacidus-startup-scene.svg";

interface Props {
  readonly locale: LocaleId;
  readonly setLocale: (locale: LocaleId) => void;
  readonly name: string;
  readonly setName: (name: string) => void;
  readonly slots: readonly SaveIndexEntry[];
  readonly selectedSlotId: string | null;
  readonly error: string;
  readonly notice: string;
  readonly storageAvailable: boolean;
  readonly starting: boolean;
  readonly onSelectSlot: (slotId: string, name: string) => void;
  readonly onStart: () => void;
  readonly onRecover: (reference: string) => void;
}

export function SaveStartScreen({
  locale,
  setLocale,
  name,
  setName,
  slots,
  selectedSlotId,
  error,
  notice,
  storageAvailable,
  starting,
  onSelectSlot,
  onStart,
  onRecover,
}: Props) {
  const t = (key: SaveMessageKey) => saveText(locale, key);
  const [recoveryReview, setRecoveryReview] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const selectedSlot = slots.find(
    (slot) => slot.slotId === selectedSlotId && slot.status === "ready",
  );
  const suggestions = useMemo(() => {
    const query = name.trim().toLocaleLowerCase(locale);
    return slots.filter(
      (slot) =>
        slot.status === "ready" &&
        (!query || slot.pioneerName.toLocaleLowerCase(locale).includes(query)),
    );
  }, [locale, name, slots]);
  const recoverySlots = slots.filter((slot) => slot.status !== "ready");

  function selectSuggestion(slot: SaveIndexEntry): void {
    if (slot.status !== "ready") return;
    onSelectSlot(slot.slotId, slot.pioneerName);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  }

  function handlePickerKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setShowSuggestions(true);
      setActiveSuggestion((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setShowSuggestions(true);
      setActiveSuggestion((index) => (index < 0 ? suggestions.length - 1 : Math.max(index - 1, 0)));
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    } else if (event.key === "Enter" && showSuggestions && activeSuggestion >= 0) {
      event.preventDefault();
      const slot = suggestions[activeSuggestion];
      if (slot) selectSuggestion(slot);
    }
  }

  function recoveryReference(slot: SaveIndexEntry): string | undefined {
    if (slot.status === "orphan") return slot.slotId;
    return slots.find(
      (candidate) =>
        candidate.status === "orphan" && candidate.slotId.startsWith(`orphan:${slot.slotId}:`),
    )?.slotId;
  }

  return (
    <section className="welcome-panel save-start-panel" aria-labelledby="welcome-title">
      <img className="startup-scene" src={startupScene} alt="" aria-hidden="true" />
      <div className="wordmark" aria-hidden="true">
        ✦
      </div>
      <p className="eyebrow">{t("choose")}</p>
      <h1 id="welcome-title">MIAPLACIDUS</h1>
      {!storageAvailable && <output className="save-warning">{t("unsaved")}</output>}
      {error && (
        <p className="save-error" role="alert">
          {error}
        </p>
      )}
      {notice && <output className="save-notice">{notice}</output>}
      <form
        className="welcome-form"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        <label htmlFor="pioneer-name">{translate(locale, "app.pioneer")}</label>
        <div className="pioneer-combobox">
          <input
            id="pioneer-name"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls="pioneer-save-suggestions"
            aria-activedescendant={
              showSuggestions && activeSuggestion >= 0
                ? `pioneer-save-option-${activeSuggestion}`
                : undefined
            }
            autoComplete="off"
            maxLength={32}
            required
            value={name}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handlePickerKeyDown}
            onChange={(event) => {
              setName(event.currentTarget.value);
              setShowSuggestions(true);
              setActiveSuggestion(-1);
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="pioneer-save-suggestions"
              id="pioneer-save-suggestions"
              role="listbox"
              aria-label={t("choose")}
            >
              {suggestions.map((slot, index) => (
                <li key={slot.slotId}>
                  <button
                    className="pioneer-save-option"
                    id={`pioneer-save-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={slot.slotId === selectedSlotId || activeSuggestion === index}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(slot)}
                  >
                    <span>{slot.pioneerName}</span>
                    <small>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(slot.savedAt)}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label htmlFor="start-locale">{translate(locale, "app.locale")}</label>
        <select
          id="start-locale"
          value={locale}
          onChange={(event) => setLocale(event.currentTarget.value as LocaleId)}
        >
          {LOCALE_IDS.map((id) => (
            <option key={id} value={id}>
              {id.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          className="primary-button start-button"
          data-testid="start-game"
          type="submit"
          disabled={!name.trim() || starting}
        >
          {starting
            ? t("starting")
            : selectedSlot
              ? `${t("resumeGame")} ${selectedSlot.pioneerName}`
              : t("startNewGame")}
        </button>
      </form>
      {recoverySlots.length > 0 && (
        <details className="local-save-recovery">
          <summary>{t("recover")}</summary>
          <ul>
            {recoverySlots.map((slot) => {
              const reference = recoveryReference(slot);
              return (
                <li key={slot.slotId}>
                  <span>
                    <strong>{slot.pioneerName}</strong>
                    <small>{t("corrupt")}</small>
                  </span>
                  {reference &&
                    (recoveryReview === reference ? (
                      <div className="slot-recovery-actions">
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => onRecover(reference)}
                        >
                          {t("recoverConfirm")}
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => setRecoveryReview("")}
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => setRecoveryReview(reference)}
                      >
                        {t("recover")}
                      </button>
                    ))}
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
