import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import type { EngineEvent } from "../../src/engine/commands";
import {
  cosmicRipEventNotice,
  cosmicRipScannerRestoreFailureNotice,
  createCosmicRipEventNoticeHandler,
} from "../../src/app/cosmicRipEventNotifications";

const SOURCE_COPY = {
  en: {
    restoreFailed: "Unable to restore Near Space Scanner Array.",
    restored: "Near Space Scanner Array restored.",
    found: "Scan complete! Cosmic Rip located in sector MIAPLAC-7413",
    empty: "Scan complete! Nothing significant found in sector MIAPLAC-7424",
  },
  es: {
    restoreFailed: "No se puede restaurar la Matriz de Escáner del Espacio Cercano.",
    restored: "Matriz de Escáner del Espacio Cercano restaurada.",
    found: "¡Escaneo completo! Ras Cósmico localizado en el sector MIAPLAC-7413",
    empty: "¡Escaneo completo! No se ha encontrado nada relevante en el sector MIAPLAC-7424",
  },
  pt: {
    restoreFailed: "Não é possível restaurar a Matriz de Scanners do Espaço Próximo.",
    restored: "Matriz de Scanners do Espaço Próximo restaurada.",
    found: "Análise concluída! Rutura Cósmica localizada no setor MIAPLAC-7413",
    empty: "Análise concluída! Não foi encontrado nada relevante no setor MIAPLAC-7424",
  },
  de: {
    restoreFailed: "Das Nahbereichs-Scanner-Array kann nicht wiederhergestellt werden.",
    restored: "Nahbereichs-Scanner-Array wiederhergestellt.",
    found: "Scan abgeschlossen! Kosmischer Riss in Sektor MIAPLAC-7413 geortet",
    empty: "Scan abgeschlossen! Nichts Bedeutendes in Sektor MIAPLAC-7424 gefunden",
  },
  it: {
    restoreFailed: "Impossibile ripristinare l'Array Scanner Spazio Vicino.",
    restored: "Array Scanner Spazio Vicino ripristinato.",
    found: "Scansione completata! Strappo Cosmico localizzato nel settore MIAPLAC-7413",
    empty: "Scansione completata! Nulla di rilevante trovato nel settore MIAPLAC-7424",
  },
  fr: {
    restoreFailed: "Impossible de restaurer le Réseau de Scanners du Secteur Proche.",
    restored: "Réseau de Scanners du Secteur Proche restauré.",
    found: "Scan terminé! Déchirure Cosmique localisée dans le secteur MIAPLAC-7413",
    empty: "Scan terminé! Rien de significatif trouvé dans le secteur MIAPLAC-7424",
  },
} satisfies Record<LocaleId, {
  readonly restoreFailed: string;
  readonly restored: string;
  readonly found: string;
  readonly empty: string;
}>;

describe("Cosmic Rip event notifications", () => {
  it("routes scanner restoration and sector scan outcomes with source classification and lifetimes", () => {
    for (const locale of LOCALE_IDS) {
      expect(cosmicRipEventNotice(locale, { type: "cosmic-rip.scanner-restored" })).toEqual({
        message: SOURCE_COPY[locale].restored,
        classification: "cosmicRip",
        type: "info",
        durationMs: 3000,
      });
      expect(
        cosmicRipEventNotice(locale, {
          type: "cosmic-rip.sector-scanned",
          sectorIndex: 2,
          found: true,
        }),
      ).toEqual({
        message: SOURCE_COPY[locale].found,
        classification: "cosmicRip",
        type: "info",
        durationMs: 4000,
      });
      expect(
        cosmicRipEventNotice(locale, {
          type: "cosmic-rip.sector-scanned",
          sectorIndex: 5,
          found: false,
        }),
      ).toEqual({
        message: SOURCE_COPY[locale].empty,
        classification: "cosmicRip",
        type: "info",
        durationMs: 3500,
      });
    }
  });

  it("routes scanner restoration rejection as the source warning at the UI boundary", () => {
    for (const locale of LOCALE_IDS) {
      expect(cosmicRipScannerRestoreFailureNotice(locale)).toEqual({
        message: SOURCE_COPY[locale].restoreFailed,
        classification: "cosmicRip",
        type: "warning",
        durationMs: 3000,
      });
    }
  });

  it("ignores unrelated Cosmic Rip events and forwards only meaningful notices", () => {
    const notices: ReturnType<typeof cosmicRipEventNotice>[] = [];
    const route = createCosmicRipEventNoticeHandler(() => "en", (notice) => notices.push(notice));
    const events: EngineEvent[] = [
      { type: "cosmic-rip.unlocked" },
      { type: "cosmic-rip.scanner-restored" },
      { type: "cosmic-rip.sector-scanned", sectorIndex: 0, found: false },
      { type: "cosmic-rip.upgrade-purchased", upgradeId: "sensorBuoy" },
    ];

    route(events);

    expect(notices).toEqual([
      cosmicRipEventNotice("en", events[1]!),
      cosmicRipEventNotice("en", events[2]!),
    ]);
  });
});
