import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import { saveErrorText, saveText, type SaveMessageKey } from "../../src/i18n/saveMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

const SOURCE_TO_REMAKE = [
  { source: "tab9AutoSaveRowLabel", targets: ["autoSave"], disposition: "adapted" },
  {
    source: "dropdownAutoSave2Minutes",
    targets: [],
    disposition: "the source interval set is replaced by owner-selected intervals",
  },
  {
    source: "dropdownAutoSave3Minutes",
    targets: [],
    disposition: "the source interval set is replaced by owner-selected intervals",
  },
  {
    source: "dropdownAutoSave5Minutes",
    targets: [],
    disposition: "the source interval set is replaced by owner-selected intervals",
  },
  {
    source: "dropdownAutoSave10Minutes",
    targets: [],
    disposition: "the source interval set is replaced by owner-selected intervals",
  },
  {
    source: "notificationAutoSaveOff",
    targets: ["autoSaveDisabledWarning"],
    disposition: "direct",
  },
  {
    source: "tab9ExportSaveRowLabel",
    targets: ["export"],
    disposition: "adapted to portable local code",
  },
  {
    source: "placeholderExportSaveArea",
    targets: [],
    disposition: "replaced by the prefilled read-only current save code",
  },
  { source: "buttonExport", targets: ["copy"], disposition: "adapted; this source button copies" },
  {
    source: "buttonManualSave",
    targets: ["download"],
    disposition: "adapted; this source button downloads a text file",
  },
  {
    source: "tab9ImportSaveRowLabel",
    targets: ["import"],
    disposition: "adapted to portable local code",
  },
  { source: "placeholderImportSaveArea", targets: ["importText"], disposition: "adapted" },
  {
    source: "buttonImport",
    targets: ["preview", "applyImport"],
    disposition: "adapted to preview then explicit import",
  },
  { source: "buttonManualLoad", targets: ["file"], disposition: "adapted file picker label" },
  {
    source: "notificationDataCopiedToClipboard",
    targets: ["clipboardCopied"],
    disposition: "direct",
  },
  {
    source: "notificationErrorCopyingData",
    targets: ["clipboardCopyError"],
    disposition: "direct",
  },
  {
    source: "notificationInvalidSaveString",
    targets: ["errEmpty", "errFormat", "errCode"],
    disposition: "split by empty, unmarked, and malformed portable input",
  },
  {
    source: "notificationErrorLoadingSaveString",
    targets: ["errCode", "errIntegrity", "errGeneric"],
    disposition: "split by decode, integrity, and unexpected loading failures",
  },
  {
    source: "notificationErrorInitializingGame",
    targets: ["errImport"],
    disposition: "adapted to the retryable local-import initialization error",
  },
  {
    source: "notificationGameLoadedSuccessfully",
    targets: ["loaded"],
    disposition: "direct for replacement of the active save; import into another/new slot has separate local feedback",
  },
  {
    source: "notificationNoSaveDataToExport",
    targets: [],
    disposition: "not applicable; the current playable run is always exportable",
  },
  {
    source: "notificationSaveCompressionUnavailable",
    targets: [],
    disposition: "not applicable; the portable codec is a bundled dependency",
  },
  {
    source: "notificationSavingDisabledInDemo",
    targets: [],
    disposition:
      "intentionally excluded: the local-save contract gives demo builds the same save behavior as full builds",
  },
  {
    source: "notificationCannotSaveDuringOnboarding",
    targets: [],
    disposition: "no source-style onboarding save lock exists in the remake",
  },
  {
    source: "gameSaveNameCollect",
    targets: ["choose"],
    disposition: "adapted to the searchable local-pioneer picker heading",
  },
  {
    source: "gameSaveNameLoadHint",
    targets: ["selectSavedPioneerHint"],
    disposition:
      "adapted to tell players to select a saved pioneer suggestion; typing a matching name alone does not resume it",
  },
  {
    source: "buttonCancel",
    targets: ["cancel"],
    disposition: "adapted shared cancel label on local recovery and import-cancel controls",
  },
  {
    source: "headerMainExitGame",
    targets: [],
    disposition: "source Electron exit page heading; the browser remake has no app-level exit page",
  },
  {
    source: "headerDescExitGame",
    targets: [],
    disposition: "source Electron exit page description; the browser owns tab closure",
  },
  {
    source: "tab9ExitGameRowLabel",
    targets: [],
    disposition: "source Electron exit surface; browser tab closure remains browser-managed",
  },
  {
    source: "modalExitGameText",
    targets: [],
    disposition:
      "source exit prompt is cloud-save-specific and the remake has no app-level exit action",
  },
  {
    source: "modalExitGameConfirmLabel",
    targets: [],
    disposition: "source Electron exit action is not rendered in the browser remake",
  },
  {
    source: "modalExitGameExtra1Label",
    targets: [],
    disposition: "source save-and-exit action depends on excluded cloud saving",
  },
  {
    source: "notificationSaveTooOldForPhilosophies",
    targets: [],
    disposition:
      "Cosmic Forge legacy-version warning; remake migrates its own supported schemas and rejects old Cosmic Forge codes",
  },
  {
    source: "tab9HardResetRowLabel",
    targets: ["delete"],
    disposition:
      "adapted to deleting the active pioneer slot; source reset is scoped to the current pioneer name, not every pioneer",
  },
  {
    source: "tab9HardResetRowDescription",
    targets: ["deletePrompt"],
    disposition: "adapted to the inline active-slot deletion warning and export-first safeguard",
  },
  {
    source: "hardResetWarningHeader",
    targets: ["confirmDelete"],
    disposition:
      "adapted to the inline destructive-confirmation legend; no separate modal is shown",
  },
  {
    source: "hardResetWarningText",
    targets: ["deletePrompt"],
    disposition:
      "adapted to the active-slot deletion warning; export is offered before removing that pioneer",
  },
  {
    source: "buttonHardResetAllProgress",
    targets: ["delete"],
    disposition:
      "adapted to deleting this pioneer slot; the player can then start a fresh run with the same name",
  },
  {
    source: "modalHardResetConfirmLabel",
    targets: ["confirmDelete"],
    disposition: "adapted to the explicit inline delete confirmation",
  },
  {
    source: "modalHardResetCancelLabel",
    targets: [],
    disposition:
      "intentionally omitted with the modal action: the remake uses an inline confirmation section without a cancel button",
  },
  {
    source: "notificationHardResetComplete",
    targets: [],
    disposition:
      "intentionally replaced by returning to pioneer selection after deletion; no hard-reset completion notice or browser refresh is needed",
  },
  {
    source: "tab9ExportCloudSaveRowLabel",
    targets: [],
    disposition: "intentionally excluded cloud-save UI",
  },
  {
    source: "buttonSaveToCloud",
    targets: [],
    disposition: "intentionally excluded cloud-save action",
  },
  {
    source: "tab9ImportCloudSaveRowLabel",
    targets: [],
    disposition: "intentionally excluded cloud-save UI",
  },
  {
    source: "labelPioneerName",
    targets: [],
    disposition: "cloud-row pioneer label is not rendered because cloud save controls are excluded",
  },
  {
    source: "buttonLoadFromCloud",
    targets: [],
    disposition: "intentionally excluded cloud-load action",
  },
  {
    source: "notificationErrorSavingToCloud",
    targets: [],
    disposition: "intentionally excluded cloud-save feedback",
  },
  {
    source: "notificationErrorSavingToCloudNoPioneerName",
    targets: [],
    disposition: "intentionally excluded cloud-save feedback",
  },
  {
    source: "notificationGameSavedToCloud",
    targets: [],
    disposition: "intentionally excluded cloud-save feedback",
  },
  {
    source: "notificationGameUpdatedInCloud",
    targets: [],
    disposition: "intentionally excluded cloud-save feedback",
  },
  {
    source: "notificationCloudSaveDeleted",
    targets: [],
    disposition: "intentionally excluded cloud-save feedback",
  },
  {
    source: "notificationCloudSaveDeleteFailed",
    targets: [],
    disposition: "intentionally excluded cloud-save feedback",
  },
  {
    source: "notificationErrorLoadingFromCloud",
    targets: [],
    disposition: "intentionally excluded cloud-load feedback",
  },
  {
    source: "notificationNoSavedGameDataFound",
    targets: ["errNotFound"],
    disposition: "direct copy reused for a missing local save or recovery generation",
  },
  {
    source: "notificationPioneerNameReused",
    targets: [],
    disposition: "intentionally excluded cloud-save lifecycle feedback",
  },
] as const satisfies readonly {
  source: string;
  targets: readonly SaveMessageKey[];
  disposition: string;
}[];

const DIRECT_SOURCE_PAIRS = [
  ["notificationDataCopiedToClipboard", "clipboardCopied"],
  ["notificationErrorCopyingData", "clipboardCopyError"],
  ["notificationAutoSaveOff", "autoSaveDisabledWarning"],
  ["notificationNoSavedGameDataFound", "errNotFound"],
] as const satisfies readonly (readonly [string, SaveMessageKey])[];

const ERROR_TARGETS = [
  ["invalid-name", "errName"],
  ["invalid-envelope", "errIntegrity"],
  ["quota", "errQuota"],
  ["conflict", "errConflict"],
  ["not-found", "errNotFound"],
] as const satisfies readonly (readonly [string, SaveMessageKey])[];

describe("save/export/import source-key crosswalk", () => {
  it.each(LOCALE_IDS)("has a source disposition and typed target coverage in %s", (locale) => {
    for (const entry of SOURCE_TO_REMAKE) {
      expect(sourceLocales[locale][entry.source], `${locale} source key ${entry.source}`).toEqual(
        expect.any(String),
      );
      expect(sourceLocales[locale][entry.source].trim()).not.toBe("");
      for (const target of entry.targets) {
        expect(saveText(locale, target), `${locale} target ${target}`).not.toBe("");
      }
    }
  });

  it.each(LOCALE_IDS)("preserves direct source copy in %s", (locale) => {
    for (const [source, target] of DIRECT_SOURCE_PAIRS) {
      expect(saveText(locale, target)).toBe(sourceLocales[locale][source]);
    }
  });

  it.each(LOCALE_IDS)("routes name, quota, conflict, and missing-save errors in %s", (locale) => {
    for (const [code, target] of ERROR_TARGETS) {
      expect(saveErrorText(locale, code)).toBe(saveText(locale, target));
    }
  });
});
