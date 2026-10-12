import type { LocaleId } from "../content/ids";
import { COSMIC_RIP_SECTOR_IDS, type CosmicRipTechnologyId } from "../content/cosmicRip";
import type { EngineEvent } from "../engine/commands";
import { cosmicRipText } from "../i18n/cosmicRipMessages";
import { cosmicRipMilestoneResultDialogCopy } from "../i18n/cosmicRipMilestoneResultDialogMessages";
import type { RandomEventDialogCopy } from "../i18n/randomEventDialogTypes";
import type { GameNotificationType } from "./NotificationStack";

export interface CosmicRipEventNotice {
  readonly message: string;
  readonly classification: "cosmicRip";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

function sectorName(sectorIndex: number): string {
  return COSMIC_RIP_SECTOR_IDS[sectorIndex] ?? `Sector ${sectorIndex + 1}`;
}

function cosmicRipClosureResultDialog(locale: LocaleId): RandomEventDialogCopy {
  const copy = cosmicRipText(locale);
  return {
    title: copy.closedTitle,
    summary: "",
    lines: [{ text: copy.closed }],
    confirmLabel: copy.closedDialogEndLabel,
  };
}

export function cosmicRipEventNotice(
  locale: LocaleId,
  event: EngineEvent,
): CosmicRipEventNotice | null {
  const messages = cosmicRipText(locale);
  switch (event.type) {
    case "cosmic-rip.scanner-restored":
      return {
        message: messages.scannerRestoredNotification,
        classification: "cosmicRip",
        type: "info",
        durationMs: 3000,
      };
    case "cosmic-rip.sector-scanned":
      return {
        message: (event.found
          ? messages.sectorScanFoundNotification
          : messages.sectorScanEmptyNotification
        ).replace("{sector}", sectorName(event.sectorIndex)),
        classification: "cosmicRip",
        type: "info",
        durationMs: event.found ? 4000 : 3500,
      };
    default:
      return null;
  }
}

export function cosmicRipScannerRestoreFailureNotice(locale: LocaleId): CosmicRipEventNotice {
  return {
    message: cosmicRipText(locale).scannerRestoreFailedNotification,
    classification: "cosmicRip",
    type: "warning",
    durationMs: 3000,
  };
}

export function cosmicRipTechnologyResearchedNotice(
  locale: LocaleId,
  technologyId: CosmicRipTechnologyId,
): CosmicRipEventNotice {
  const messages = cosmicRipText(locale);
  return {
    message: messages.technologyResearchedNotification.replace(
      "{technology}",
      messages.technologyNames[technologyId],
    ),
    classification: "cosmicRip",
    type: "info",
    durationMs: 3000,
  };
}

export function createCosmicRipEventNoticeHandler(
  getLocale: () => LocaleId,
  notify: (notice: CosmicRipEventNotice) => void,
  enqueueResultDialog: (dialog: RandomEventDialogCopy, onConfirm?: () => void) => void = () => {},
  onClosureConfirmed: () => void = () => {},
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    for (const event of events) {
      const locale = getLocale();
      const notice = cosmicRipEventNotice(locale, event);
      if (notice) notify(notice);

      if (event.type === "cosmic-rip.scanner-restored") {
        enqueueResultDialog(cosmicRipMilestoneResultDialogCopy(locale, "scannerRestored"));
      } else if (event.type === "cosmic-rip.sector-scanned" && event.found) {
        enqueueResultDialog(cosmicRipMilestoneResultDialogCopy(locale, "ripLocated"));
      } else if (event.type === "cosmic-rip.closed") {
        enqueueResultDialog(cosmicRipClosureResultDialog(locale), onClosureConfirmed);
      }
    }
  };
}
