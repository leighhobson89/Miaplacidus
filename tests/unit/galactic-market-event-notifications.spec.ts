import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import type { EngineEvent } from "../../src/engine/commands";
import { createInitialGameState } from "../../src/engine/state";
import {
  createGalacticMarketEventNoticeHandler,
  galacticMarketEventNotice,
  galacticMarketLockdownEntryNotice,
} from "../../src/app/galacticMarketEventNotifications";

const EXPECTED_MESSAGES = {
  en: "You have traded 18 Hydrogen for 9 Helium and paid 2 Hydrogen commission!",
  es: "¡Has intercambiado 18 Hidrógeno por 9 Helio y pagado 2 Hidrógeno de comisión!",
  pt: "Trocaste 18 Hidrogénio por 9 Hélio e pagaste 2 Hidrogénio de comissão!",
  de: "Du hast 18 Wasserstoff gegen 9 Helium getauscht und 2 Wasserstoff Provision gezahlt!",
  it: "Hai scambiato 18 Idrogeno con 9 Elio e pagato 2 Idrogeno di commissione!",
  fr: "Vous avez échangé 18 Hydrogène contre 9 Hélium et payé 2 Hydrogène de commission!",
} satisfies Record<LocaleId, string>;

const state = createInitialGameState({ pioneerName: "Market Notice Test", seed: 412 });
const tradeEvent: EngineEvent = {
  type: "meta.market.traded",
  outgoingGoodId: "hydrogen",
  outgoingQuantity: 20,
  commissionQuantity: 2,
  incomingGoodId: "helium",
  incomingQuantity: 9,
};

describe("Galactic Market trade notifications", () => {
  it("uses the source trade and commission notice in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      const localizedState = {
        ...state,
        settings: { ...state.settings, locale, notation: "standard" as const },
      };
      expect(galacticMarketEventNotice(locale, tradeEvent, localizedState)).toEqual({
        message: EXPECTED_MESSAGES[locale],
        classification: "special",
        type: "info",
        durationMs: 5000,
      });
    }
  });

  it("routes only completed trade events", () => {
    const localizedState = { ...state, settings: { ...state.settings, locale: "en" as const } };
    const notices: unknown[] = [];
    const route = createGalacticMarketEventNoticeHandler(
      () => "en",
      () => localizedState,
      (notice) => notices.push(notice),
    );
    const events: EngineEvent[] = [
      { type: "meta.market.ap-sold", quantity: 1, cashGained: 1000 },
      tradeEvent,
      { type: "meta.market.liquidated", value: 1_000_000, apGained: 1 },
    ];

    route(events);

    expect(notices).toEqual([galacticMarketEventNotice("en", tradeEvent, localizedState)]);
  });

  it("matches the source lockdown-entry notice in all six locales", () => {
    const expected = {
      en: "Galactic Market is currently offline.",
      es: "El Mercado Galáctico está fuera de servicio ahora mismo.",
      pt: "O Mercado Galáctico está fora de serviço neste momento.",
      de: "Der Galaktische Markt ist derzeit offline.",
      it: "Il Mercato Galattico è attualmente offline.",
      fr: "Le Marché Galactique est actuellement hors ligne.",
    } satisfies Record<LocaleId, string>;
    const lockedState = {
      ...state,
      run: { ...state.run, marketLockdownRemainingMs: 60_000 },
    };

    for (const locale of LOCALE_IDS) {
      expect(galacticMarketLockdownEntryNotice(locale, lockedState)).toEqual({
        message: expected[locale],
        classification: "special",
        type: "warning",
        durationMs: 3000,
      });
    }
  });

  it("stays silent outside a Market lockdown", () => {
    expect(galacticMarketLockdownEntryNotice("en", state)).toBeNull();
  });
});
