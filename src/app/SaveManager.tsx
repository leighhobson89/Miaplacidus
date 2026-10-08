import { useEffect, useMemo, useRef, useState } from "react";
import type { LocaleId } from "../content/ids";
import type { GameState } from "../engine/state";
import { decodePortable, encodeLocal, encodePortable } from "../persistence/codec";
import { createSlotId, type SaveIndexEntry, type SaveRepository } from "../persistence/repository";
import { makeEnvelope, SaveError, type SaveEnvelopeV1 } from "../persistence/schema";
import { saveErrorText, saveText, type SaveMessageKey } from "../i18n/saveMessages";
import { translate } from "../i18n/messages";
import { validatePioneerName } from "../persistence/validation";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";

interface Props {
  readonly locale: LocaleId;
  readonly repository: SaveRepository | null;
  readonly slots: readonly SaveIndexEntry[];
  readonly activeSlotId: string;
  readonly revision: number;
  readonly state: GameState;
  readonly lockHeld: (slotId: string) => boolean;
  readonly acquireLock: (slotId: string) => Promise<(() => void) | null>;
  readonly onSave: () => void;
  readonly onRename: (name: string) => void;
  readonly onReplaceActive: (envelope: SaveEnvelopeV1) => void;
  readonly onSaveAsNew: (name: string) => Promise<void>;
  readonly onSwitchTo: (name: string) => void;
  readonly onDeleted: () => void;
  readonly onClose: () => void;
}

export function SaveManager(props: Props) {
  const { locale, repository, slots, activeSlotId, revision, state } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = (key: SaveMessageKey) => saveText(locale, key);
  const [name, setName] = useState(state.run.pioneerName);
  const [copyName, setCopyName] = useState("");
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<SaveEnvelopeV1 | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newImportName, setNewImportName] = useState("");
  const [replaceConfirmed, setReplaceConfirmed] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  useEffect(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }, []);

  const activeEnvelope = useMemo(() => {
    let stored: SaveEnvelopeV1 | null = null;
    if (repository) {
      try {
        stored = repository.readSlot(activeSlotId);
      } catch {
        /* Current playable state remains exportable. */
      }
    }
    const savedAt = Math.max(stored?.savedAt ?? 0, state.run.clock.wallNowMs ?? 0);
    return makeEnvelope({
      slotId: activeSlotId,
      pioneerName: state.run.pioneerName,
      createdAt: stored?.createdAt ?? savedAt,
      savedAt,
      revision: Math.max(1, stored?.revision ?? revision),
      state,
    });
  }, [repository, activeSlotId, revision, state]);

  const currentCode = useMemo(() => encodePortable(activeEnvelope), [activeEnvelope]);
  const localPayloadBytes = useMemo(() => encodeLocal(activeEnvelope).length * 2, [activeEnvelope]);
  const matchingSlot =
    preview && repository
      ? (repository.findByName(preview.pioneerName).find((entry) => entry.status === "ready") ??
        null)
      : null;

  function showError(errorValue: unknown) {
    const codeValue = errorValue instanceof SaveError ? errorValue.code : "unknown";
    setError(saveErrorText(locale, codeValue));
    setNotice("");
  }

  async function previewImport() {
    setError("");
    setNotice("");
    try {
      const imported = decodePortable(code);
      setPreview(imported);
      const conflict = repository
        ?.findByName(imported.pioneerName)
        .find((entry) => entry.status === "ready");
      setNewImportName(conflict ? imported.pioneerName + " 2" : imported.pioneerName);
      setReplaceConfirmed(false);
    } catch (errorValue) {
      showError(errorValue);
      setPreview(null);
    }
  }

  async function importAsNew() {
    if (!repository || !preview) return;
    try {
      const newName = validatePioneerName(newImportName);
      const slotId = createSlotId();
      const release = await props.acquireLock(slotId);
      if (!release) throw new SaveError("conflict", "Another tab owns this slot.");
      try {
        repository.importNew(preview, slotId, newName.display, Date.now());
      } finally {
        release();
      }
      setNotice(t("imported"));
      setError("");
      setPreview(null);
      setCode("");
    } catch (errorValue) {
      showError(errorValue);
    }
  }

  async function replaceMatching() {
    if (!repository || !preview || !matchingSlot || !replaceConfirmed) return;
    try {
      const ownsCurrentLock = props.lockHeld(matchingSlot.slotId);
      const release = ownsCurrentLock ? null : await props.acquireLock(matchingSlot.slotId);
      if (!ownsCurrentLock && !release)
        throw new SaveError("conflict", "Another tab owns this slot.");
      let updated: SaveEnvelopeV1;
      try {
        updated = repository.commit(
          matchingSlot.slotId,
          preview.state,
          preview.pioneerName,
          Date.now(),
          matchingSlot.revision,
        );
      } finally {
        release?.();
      }
      if (matchingSlot.slotId === activeSlotId) props.onReplaceActive(updated);
      setNotice(t("imported"));
      setError("");
      setPreview(null);
      setCode("");
      setReplaceConfirmed(false);
    } catch (errorValue) {
      showError(errorValue);
    }
  }

  async function deleteActive() {
    if (!repository || !deleteConfirmed) return;
    try {
      if (!props.lockHeld(activeSlotId))
        throw new SaveError("conflict", "This tab does not own the active save.");
      repository.remove(activeSlotId);
      props.onDeleted();
    } catch (errorValue) {
      showError(errorValue);
    }
  }

  async function pasteCode() {
    try {
      setCode(await navigator.clipboard.readText());
      setError("");
    } catch {
      setError(saveErrorText(locale, "storage-unavailable"));
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(currentCode);
      setNotice(t("copy"));
      setError("");
    } catch {
      setError(saveErrorText(locale, "storage-unavailable"));
    }
  }

  function downloadCode() {
    const blob = new Blob([currentCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = state.run.pioneerName.replace(/[^\p{L}\p{N}._-]+/gu, "-") + ".txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function readFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 900_005) {
      showError(new SaveError("too-large", "The selected file exceeds the supported size."));
      return;
    }
    void file
      .text()
      .then((text) => {
        setCode(text);
        setPreview(null);
        setError("");
      })
      .catch(showError);
  }

  function rename() {
    try {
      const validated = validatePioneerName(name);
      props.onRename(validated.display);
    } catch (errorValue) {
      showError(errorValue);
    }
  }

  async function saveAsNew() {
    try {
      const validated = validatePioneerName(copyName);
      await props.onSaveAsNew(validated.display);
    } catch (errorValue) {
      showError(errorValue);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="save-manager"
      aria-labelledby="save-manager-title"
      onClose={props.onClose}
    >
      <header className="save-manager-header">
        <div>
          <p className="eyebrow">{t("manage")}</p>
          <h2 id="save-manager-title">{state.run.pioneerName}</h2>
        </div>
        <button className="text-button" type="button" onClick={() => dialogRef.current?.close()}>
          {t("cancel")}
        </button>
      </header>
      <section className="local-slot-list manager-slot-list" aria-label={t("choose")}>
        <h3>{t("choose")}</h3>
        {slots.filter((slot) => slot.status === "ready" && slot.slotId !== activeSlotId).length ===
        0 ? (
          <p>{t("empty")}</p>
        ) : (
          <ul>
            {slots
              .filter((slot) => slot.status === "ready" && slot.slotId !== activeSlotId)
              .map((slot) => (
                <li key={slot.slotId}>
                  <button
                    type="button"
                    className="slot-select"
                    onClick={() => props.onSwitchTo(slot.pioneerName)}
                  >
                    <strong>{slot.pioneerName}</strong>
                    <span>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(slot.savedAt)}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
      {error && (
        <p className="save-error" role="alert">
          {error}
        </p>
      )}
      {notice && <output className="save-notice">{notice}</output>}
      <div className="save-manager-grid">
        <section className="save-manager-card">
          <h3>{t("rename")}</h3>
          <label htmlFor="save-rename">{t("newName")}</label>
          <input
            id="save-rename"
            maxLength={32}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <button
            className="secondary-button"
            type="button"
            disabled={!repository || !props.lockHeld(activeSlotId)}
            onClick={rename}
          >
            {t("rename")}
          </button>
          <button
            className="text-button"
            type="button"
            disabled={!repository || !props.lockHeld(activeSlotId)}
            onClick={props.onSave}
          >
            {t("saveNow")}
          </button>
          <label htmlFor="save-copy-name">{t("newName")}</label>
          <input
            id="save-copy-name"
            maxLength={32}
            value={copyName}
            onChange={(event) => setCopyName(event.currentTarget.value)}
          />
          <button
            className="secondary-button"
            type="button"
            disabled={!repository}
            onClick={() => void saveAsNew()}
          >
            {t("saveAsNew")}
          </button>
          <button
            className="text-button danger-button"
            type="button"
            disabled={!repository || !props.lockHeld(activeSlotId)}
            onClick={() => setShowDelete(true)}
          >
            {t("delete")}
          </button>
          {showDelete && (
            <fieldset className="destructive-confirm">
              <legend>{t("confirmDelete")}</legend>
              <p>{t("deletePrompt")}</p>
              <label>
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(event) => setDeleteConfirmed(event.currentTarget.checked)}
                />
                {t("exportFirst")}
              </label>
              <button
                className="danger-button"
                type="button"
                disabled={!repository || !props.lockHeld(activeSlotId) || !deleteConfirmed}
                onClick={() => void deleteActive()}
              >
                {t("confirmDelete")}
              </button>
            </fieldset>
          )}
        </section>
        <section className="save-manager-card">
          <h3>{t("export")}</h3>
          <textarea aria-label={t("export")} readOnly value={currentCode} rows={5} />
          <div className="save-actions">
            <button className="secondary-button" type="button" onClick={() => void copyCode()}>
              {t("copy")}
            </button>
            <button className="secondary-button" type="button" onClick={downloadCode}>
              {t("download")}
            </button>
          </div>
          <p className="save-capacity">
            {t("portableSize")}: {Math.ceil(currentCode.length / 1024)} KB. {t("localSaveSize")}:{" "}
            {Math.ceil(localPayloadBytes / 1024)} KB.
          </p>
          {repository &&
            (() => {
              try {
                const estimate = repository.estimateStorage();
                const projected = estimate.appBytes + localPayloadBytes;
                const remaining = Math.floor(
                  Math.max(0, estimate.estimatedLimitBytes - projected) / 1024,
                );
                return (
                  <p
                    className={
                      projected >= estimate.estimatedLimitBytes * 0.8
                        ? "save-warning"
                        : "save-capacity"
                    }
                    role={projected >= estimate.estimatedLimitBytes * 0.8 ? "alert" : undefined}
                  >
                    {Math.ceil(estimate.appBytes / 1024)} KB app data. {t("remainingCapacity")}{" "}
                    {new Intl.NumberFormat(locale).format(remaining)} KB. {t("capacity")}
                  </p>
                );
              } catch {
                return <output className="save-warning">{t("capacity")}</output>;
              }
            })()}
        </section>
      </div>
      <section className="save-manager-card import-card">
        <h3>{t("import")}</h3>
        <label htmlFor="import-code">{t("importText")}</label>
        <textarea
          id="import-code"
          value={code}
          onChange={(event) => {
            setCode(event.currentTarget.value);
            setPreview(null);
          }}
          rows={5}
        />
        <div className="save-actions">
          <button className="secondary-button" type="button" onClick={() => void pasteCode()}>
            {t("paste")}
          </button>
          <label className="file-button">
            {t("file")}
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={(event) => readFile(event.currentTarget.files?.[0])}
            />
          </label>
          <button className="secondary-button" type="button" onClick={() => void previewImport()}>
            {t("preview")}
          </button>
        </div>
        {preview && (
          <div className="import-preview" data-testid="import-preview">
            <p>
              <strong>{t("previewName")}:</strong> {preview.pioneerName}
            </p>
            <p>
              <strong>{t("previewVersion")}:</strong> {preview.schemaVersion}
            </p>
            <p>
              <strong>{translate(locale, "hydrogen.title")}:</strong>{" "}
              {formatNumber(
                locale,
                preview.state.run.goods.hydrogen.quantity,
                0,
                preview.state.settings.notation,
              )}
            </p>
            <p>
              <strong>{translate(locale, "header.cash")}:</strong>{" "}
              {formatCurrency(
                locale,
                preview.state.run.cash,
                preview.state.settings.currencyId ?? "usd",
                2,
                preview.state.settings.notation,
              )}
            </p>
            {matchingSlot ? (
              <div className="import-conflict">
                <p role="alert">{t("conflict")}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={replaceConfirmed}
                    onChange={(event) => setReplaceConfirmed(event.currentTarget.checked)}
                  />
                  {t("exportFirst")}
                </label>
                <button
                  className="danger-button"
                  type="button"
                  disabled={
                    !repository ||
                    (matchingSlot.slotId === activeSlotId && !props.lockHeld(activeSlotId)) ||
                    !replaceConfirmed
                  }
                  onClick={() => void replaceMatching()}
                >
                  {t("replace")}
                </button>
              </div>
            ) : null}
            <label htmlFor="import-new-name">
              {t("newName")}
              <input
                id="import-new-name"
                maxLength={32}
                value={newImportName}
                onChange={(event) => setNewImportName(event.currentTarget.value)}
              />
            </label>
            <div className="save-actions">
              <button
                className="primary-button"
                type="button"
                disabled={!repository}
                onClick={() => void importAsNew()}
              >
                {t("importNew")}
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setPreview(null);
                  setError("");
                }}
              >
                {t("cancelImport")}
              </button>
            </div>
          </div>
        )}
      </section>
    </dialog>
  );
}
