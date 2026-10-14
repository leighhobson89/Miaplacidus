import { useMemo, useState } from "react";
import type { LocaleId } from "../content/ids";
import type { GameState } from "../engine/state";
import { decodePortable, encodeLocal, encodePortable } from "../persistence/codec";
import { createSlotId, type SaveIndexEntry, type SaveRepository } from "../persistence/repository";
import {
  makeEnvelope,
  SaveError,
  type SaveEnvelopeV1,
  type SaveErrorCode,
} from "../persistence/schema";
import { saveErrorText, saveText, type SaveMessageKey } from "../i18n/saveMessages";
import { translate } from "../i18n/messages";
import { validatePioneerName } from "../persistence/validation";
import { formatCurrency } from "./currencyFormatting";
import { formatNumber } from "./numberFormatting";
import { useGameNotifications } from "./NotificationStack";

export interface SaveManagerProps {
  readonly locale: LocaleId;
  readonly repository: SaveRepository | null;
  readonly slots: readonly SaveIndexEntry[];
  readonly activeSlotId: string;
  readonly revision: number;
  readonly state: GameState;
  readonly readOnlyReasonCode: SaveErrorCode | null;
  readonly lockHeld: (slotId: string) => boolean;
  readonly acquireLock: (slotId: string) => Promise<(() => void) | null>;
  readonly onRename: (name: string) => void;
  readonly onReplaceActive: (envelope: SaveEnvelopeV1) => void;
  readonly onSaveAsNew: (name: string) => Promise<void>;
  readonly onSwitchTo: (name: string) => void;
  readonly onDeleted: () => void;
}

export function SaveManager(props: SaveManagerProps) {
  const { locale, repository, slots, activeSlotId, revision, state } = props;
  const t = (key: SaveMessageKey) => saveText(locale, key);
  const notify = useGameNotifications();
  const formatInteger = (value: number) => new Intl.NumberFormat(locale).format(value);
  const formatKilobytes = (bytes: number) => formatInteger(Math.ceil(bytes / 1024));
  const [name, setName] = useState(state.run.pioneerName);
  const [copyName, setCopyName] = useState("");
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<SaveEnvelopeV1 | null>(null);
  const [newImportName, setNewImportName] = useState("");
  const [replaceConfirmed, setReplaceConfirmed] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
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
  const activeSlotReadOnlyReason = !repository
    ? t("errStorage")
    : !props.lockHeld(activeSlotId)
      ? props.readOnlyReasonCode === "storage-unavailable"
        ? t("errStorage")
        : props.readOnlyReasonCode === "corrupt-slot"
          ? t("errCorrupt")
          : t("readOnlyLock")
      : null;
  const replaceReadOnlyReason =
    matchingSlot?.slotId === activeSlotId ? activeSlotReadOnlyReason : null;

  function showError(errorValue: unknown) {
    const codeValue = errorValue instanceof SaveError ? errorValue.code : "unknown";
    notify(saveErrorText(locale, codeValue), { classification: "save", type: "error" });
  }

  function showImportError(errorValue: unknown) {
    if (errorValue instanceof SaveError) {
      showError(errorValue);
      return;
    }
    notify(t("errImport"), { classification: "save", type: "error" });
  }

  async function previewImport() {
    try {
      const imported = decodePortable(code);
      setPreview(imported);
      const conflict = repository
        ?.findByName(imported.pioneerName)
        .find((entry) => entry.status === "ready");
      setNewImportName(conflict ? imported.pioneerName + " 2" : imported.pioneerName);
      setReplaceConfirmed(false);
    } catch (errorValue) {
      if (
        errorValue instanceof SaveError &&
        (errorValue.code === "empty" ||
          errorValue.code === "unknown-format" ||
          errorValue.code === "invalid-code" ||
          errorValue.code === "invalid-json")
      ) {
        notify(t("errInvalidSaveString"), { classification: "save", type: "error" });
      } else {
        showError(errorValue);
      }
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
      notify(t("importedAsNew"), { classification: "save", type: "success" });
      setPreview(null);
      setCode("");
    } catch (errorValue) {
      showImportError(errorValue);
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
      const replacesActiveSave = matchingSlot.slotId === activeSlotId;
      if (replacesActiveSave) props.onReplaceActive(updated);
      notify(t(replacesActiveSave ? "loaded" : "imported"), {
        classification: "save",
        type: "success",
      });
      setPreview(null);
      setCode("");
      setReplaceConfirmed(false);
    } catch (errorValue) {
      showImportError(errorValue);
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
    } catch {
      notify(t("clipboardReadError"), { classification: "save", type: "error" });
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(currentCode);
      notify(t("clipboardCopied"), { classification: "save", type: "success" });
    } catch {
      notify(t("clipboardCopyError"), { classification: "save", type: "error" });
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
    <section
      className="save-manager-inline"
      aria-labelledby="save-manager-title"
      data-testid="save-manager-inline"
    >
      <header className="save-manager-header">
        <h3 id="save-manager-title">{t("otherPioneers")}</h3>
      </header>
      <section className="local-slot-list manager-slot-list" aria-label={t("otherPioneers")}>
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
      <div className="save-manager-grid">
        <section className="save-manager-card">
          <h3>{t("rename")}</h3>
          {activeSlotReadOnlyReason && (
            <p
              id="save-active-slot-readonly-reason"
              className="save-warning"
              data-testid="save-readonly-reason"
            >
              {activeSlotReadOnlyReason}
            </p>
          )}
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
            aria-describedby={
              activeSlotReadOnlyReason ? "save-active-slot-readonly-reason" : undefined
            }
            onClick={rename}
          >
            {t("rename")}
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
            aria-describedby={
              activeSlotReadOnlyReason ? "save-active-slot-readonly-reason" : undefined
            }
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
                aria-describedby={
                  activeSlotReadOnlyReason ? "save-active-slot-readonly-reason" : undefined
                }
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
            {t("portableSize")}: {formatKilobytes(currentCode.length)} KB. {t("localSaveSize")}:{" "}
            {formatKilobytes(localPayloadBytes)} KB.
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
                    {t("appData")}: {formatKilobytes(estimate.appBytes)} KB.{" "}
                    {t("remainingCapacity")} {formatInteger(remaining)} KB. {t("capacity")}
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
          autoCapitalize="none"
          autoCorrect="off"
          enterKeyHint="done"
          spellCheck={false}
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
                {replaceReadOnlyReason && (
                  <p
                    id="save-replace-readonly-reason"
                    className="save-warning"
                    data-testid="save-replace-readonly-reason"
                  >
                    {replaceReadOnlyReason}
                  </p>
                )}
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
                  aria-describedby={
                    replaceReadOnlyReason ? "save-replace-readonly-reason" : undefined
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
                }}
              >
                {t("cancelImport")}
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
