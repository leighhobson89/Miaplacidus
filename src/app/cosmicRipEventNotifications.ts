import type { LocaleId } from "../content/ids";
import type { CosmicRipTechnologyId } from "../content/cosmicRip";
import type { EngineEvent } from "../engine/commands";
import { cosmicRipText } from "../i18n/cosmicRipMessages";
import type { GameNotificationType } from "./NotificationStack";

export interface CosmicRipEventNotice {
  readonly message: string;
  readonly classification: "cosmicRip";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

const SECTOR_NAMES = [
  "MIAPLAC-7411",
  "MIAPLAC-7412",
  "MIAPLAC-7413",
  "MIAPLAC-7422",
  "MIAPLAC-7423",
  "MIAPLAC-7424",
  "MIAPLAC-7432",
  "MIAPLAC-7433",
  "MIAPLAC-7434",
] as const;

function sectorName(sectorIndex: number): string {
  return SECTOR_NAMES[sectorIndex] ?? `Sector ${sectorIndex + 1}`;
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
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    for (const event of events) {
      const notice = cosmicRipEventNotice(getLocale(), event);
      if (notice) notify(notice);
    }
  };
}
