import type { LocaleId } from "../content/ids";
import { LOCALE_IDS } from "../content/ids";
import type { SaveIndexEntry } from "../persistence/repository";
import type { SaveMessageKey } from "../i18n/saveMessages";
import { saveText } from "../i18n/saveMessages";
import { translate } from "../i18n/messages";
import { useState } from "react";

interface Props {
  readonly locale: LocaleId;
  readonly setLocale: (locale: LocaleId) => void;
  readonly name: string;
  readonly setName: (name: string) => void;
  readonly slots: readonly SaveIndexEntry[];
  readonly confirmed: boolean;
  readonly error: string;
  readonly notice: string;
  readonly storageAvailable: boolean;
  readonly onConfirm: () => void;
  readonly onStart: () => void;
  readonly onEdit: () => void;
  readonly onRecover: (reference: string) => void;
}

export function SaveStartScreen({
  locale,
  setLocale,
  name,
  setName,
  slots,
  confirmed,
  error,
  notice,
  storageAvailable,
  onConfirm,
  onStart,
  onEdit,
  onRecover,
}: Props) {
  const t = (key: SaveMessageKey) => saveText(locale, key);
  const [recoveryReview, setRecoveryReview] = useState("");
  return (
    <section className="welcome-panel save-start-panel" aria-labelledby="welcome-title">
      <div className="wordmark" aria-hidden="true">
        ✦
      </div>
      <p className="eyebrow">{t(confirmed ? "confirmed" : "choose")}</p>
      <h1 id="welcome-title">MIAPLACIDUS</h1>
      {!storageAvailable && <output className="save-warning">{t("unsaved")}</output>}
      {error && (
        <p className="save-error" role="alert">
          {error}
        </p>
      )}
      {notice && <output className="save-notice">{notice}</output>}
      {confirmed ? (
        <div className="confirmed-selection" data-testid="confirmed-selection">
          <span className="balance-label">{t("confirmedName")}</span>
          <strong>{name}</strong>
          <span className="balance-label">{locale.toUpperCase()}</span>
          <button className="secondary-button" type="button" onClick={onEdit}>
            {t("edit")}
          </button>
          <button className="primary-button start-button" type="button" onClick={onStart}>
            {t("start")}
          </button>
        </div>
      ) : (
        <form
          className="welcome-form"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          <label htmlFor="pioneer-name">{translate(locale, "app.pioneer")}</label>
          <input
            id="pioneer-name"
            maxLength={32}
            required
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
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
          <button className="primary-button start-button" type="submit">
            {t("confirm")}
          </button>
        </form>
      )}
      <section className="local-slot-list" aria-labelledby="local-slot-title">
        <h2 id="local-slot-title">{t("choose")}</h2>
        {slots.length === 0 ? (
          <p>{t("empty")}</p>
        ) : (
          <ul>
            {slots.map((slot) => (
              <li
                key={slot.slotId}
                className={slot.status === "ready" ? "slot-ready" : "slot-recovery"}
              >
                {slot.status === "ready" ? (
                  <button
                    type="button"
                    className="slot-select"
                    onClick={() => setName(slot.pioneerName)}
                  >
                    <strong>{slot.pioneerName}</strong>
                    <span>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(slot.savedAt)}
                    </span>
                  </button>
                ) : (
                  <span>
                    <strong>{slot.pioneerName}</strong>
                    <small>{t("corrupt")}</small>
                  </span>
                )}
                {slot.status === "ready" && (
                  <span className="slot-size">
                    {Math.ceil((slot.compressedChars * 2) / 1024)} KB
                  </span>
                )}
                {slot.status !== "ready" &&
                  (() => {
                    const reference =
                      slot.status === "orphan"
                        ? slot.slotId
                        : slots.find(
                            (candidate) =>
                              candidate.status === "orphan" &&
                              candidate.slotId.startsWith("orphan:" + slot.slotId + ":"),
                          )?.slotId;
                    if (!reference) return null;
                    return recoveryReview === reference ? (
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
                    );
                  })()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
