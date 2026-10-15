import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import type { EngineEvent } from "../../src/engine/commands";
import {
  blackHoleEventNotice,
  createBlackHoleEventNoticeHandler,
} from "../../src/app/blackHoleEventNotifications";
import {
  blackHoleDiscoveryDialog,
  blackHoleWarpEndedNotification,
} from "../../src/i18n/blackHoleMessages";

const SOURCE_COPY: Record<LocaleId, { readonly discovered: string; readonly charged: string }> = {
  en: {
    discovered: "You have discovered a Black Hole - interact with it in the Galactic Tab!",
    charged: "The Black Hole is Charged and ready to Activate!",
  },
  es: {
    discovered: "¡Has descubierto un Agujero Negro! Interactúa con él en la pestaña Galáctica.",
    charged: "¡El Agujero Negro está cargado y listo para activarse!",
  },
  pt: {
    discovered: "Descobriste um Buraco Negro! Interage com ele no separador Galáctico.",
    charged: "O Buraco Negro está carregado e pronto para ser ativado!",
  },
  de: {
    discovered: "Du hast ein Schwarzes Loch entdeckt - interagiere damit im Galaktischen Tab!",
    charged: "Das Schwarze Loch ist aufgeladen und bereit zur Aktivierung!",
  },
  it: {
    discovered: "Hai scoperto un Buco Nero: interagisci con esso nella scheda Galattica!",
    charged: "Il Buco Nero è carico e pronto per essere attivato!",
  },
  fr: {
    discovered:
      "Vous avez découvert un Trou Noir - interagissez avec lui dans l'onglet Galactique!",
    charged: "Le Trou Noir est chargé et prêt à être activé!",
  },
};

const WARP_END_COPY: Record<LocaleId, string> = {
  en: "The Black Hole time warp has ended.",
  es: "La distorsi\u00f3n temporal del agujero negro ha terminado.",
  pt: "A distor\u00e7\u00e3o temporal do buraco negro terminou.",
  de: "Die Zeitverzerrung des Schwarzen Lochs ist beendet.",
  it: "La distorsione temporale del Buco Nero \u00e8 terminata.",
  fr: "La distorsion temporelle du Trou Noir est termin\u00e9e.",
};

describe("Black Hole event notifications", () => {
  it("matches source discovery and charge notices in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      for (const [event, message] of [
        [
          { type: "black-hole.discovery-checked", probability: 3, discovered: true },
          SOURCE_COPY[locale].discovered,
        ],
        [{ type: "black-hole.charge-completed" }, SOURCE_COPY[locale].charged],
      ] as const) {
        expect(blackHoleEventNotice(locale, event as EngineEvent)).toEqual({
          route: "notification",
          message,
          classification: "special",
          type: "info",
          durationMs: 3000,
          ...(event.type === "black-hole.discovery-checked"
            ? { resultDialog: blackHoleDiscoveryDialog(locale) }
            : {}),
        });
      }
    }
  });

  it("keeps failed discovery rolls and unrelated Black Hole milestones silent", () => {
    expect(
      blackHoleEventNotice("en", {
        type: "black-hole.discovery-checked",
        probability: 3,
        discovered: false,
      }),
    ).toBeNull();
    expect(blackHoleEventNotice("en", { type: "black-hole.researched" })).toBeNull();
    expect(
      blackHoleEventNotice("en", { type: "black-hole.charge-started", durationMs: 300_000 }),
    ).toBeNull();
  });

  it("announces warp timer completion in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      expect(blackHoleWarpEndedNotification(locale)).toBe(WARP_END_COPY[locale]);
      expect(blackHoleEventNotice(locale, { type: "black-hole.warp-ended" })).toEqual({
        route: "screen-reader",
        message: WARP_END_COPY[locale],
      });
    }
  });

  it("routes visible notices and the nonvisual warp-end announcement", () => {
    const notices: unknown[] = [];
    const route = createBlackHoleEventNoticeHandler(
      () => "en",
      (notice) => notices.push(notice),
    );
    route([
      { type: "black-hole.discovery-checked", probability: 3, discovered: false },
      { type: "black-hole.discovery-checked", probability: 6, discovered: true },
      { type: "black-hole.charge-started", durationMs: 300_000 },
      { type: "black-hole.charge-completed" },
      { type: "black-hole.warp-ended" },
    ]);

    expect(notices).toEqual([
      {
        route: "notification",
        message: SOURCE_COPY.en.discovered,
        classification: "special",
        type: "info",
        durationMs: 3000,
        resultDialog: blackHoleDiscoveryDialog("en"),
      },
      {
        route: "notification",
        message: SOURCE_COPY.en.charged,
        classification: "special",
        type: "info",
        durationMs: 3000,
      },
      {
        route: "screen-reader",
        message: WARP_END_COPY.en,
      },
    ]);
  });
});
