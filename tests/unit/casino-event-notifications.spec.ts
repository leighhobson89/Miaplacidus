import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import { transition, type EngineEvent } from "../../src/engine/commands";
import { createInitialGameState } from "../../src/engine/state";
import { createTimer, createTimerId } from "../../src/engine/timers";
import {
  casinoWheelAttemptFailureNotice,
  casinoEventNotice,
  createCasinoEventNoticeHandler,
} from "../../src/app/casinoEventNotifications";
import { economyGoodName } from "../../src/app/economyDisplay";
import { formatNumber } from "../../src/app/numberFormatting";
import { casinoText } from "../../src/i18n/casinoMessages";

const donWin: EngineEvent = {
  type: "casino.game.played",
  gameId: "doubleOrNothing",
  result: "win",
  cpSpent: 7,
  cpAwarded: 14,
};

const donLoss: EngineEvent = {
  type: "casino.game.played",
  gameId: "doubleOrNothing",
  result: "loss",
  cpSpent: 7,
  cpAwarded: 0,
};

const SOURCE_WHEEL_COPY = {
  en: {
    special: "WIN! Special Prize! - Select a Prize from the dropdown to continue.",
    winPrefix: "WON! ",
    cash: "Cash",
    research: "Research Points",
    cp: "CP",
    claimed100Cp: "Special Prize Claimed! 100CP",
  },
  es: {
    special: "¡GANASTE! ¡Premio especial! - Selecciona un premio del menú para continuar.",
    winPrefix: "¡GANASTE! ",
    cash: "Efectivo",
    research: "Puntos de Investigación",
    cp: "CP",
    claimed100Cp: "¡Premio especial reclamado! 100CP",
  },
  pt: {
    special: "GANHOU! Prémio especial! - Selecione um prémio no menu para continuar.",
    winPrefix: "GANHOU! ",
    cash: "Dinheiro",
    research: "Pontos de Investigação",
    cp: "CP",
    claimed100Cp: "Prémio especial reclamado! 100CP",
  },
  de: {
    special: "GEWONNEN! Sonderpreis! - Wähle einen Preis aus der Liste, um fortzufahren.",
    winPrefix: "GEWONNEN! ",
    cash: "Bargeld",
    research: "Forschungspunkte",
    cp: "CP",
    claimed100Cp: "Sonderpreis beansprucht! 100CP",
  },
  it: {
    special: "VITTORIA! Premio speciale! - Seleziona un premio dal menu per continuare.",
    winPrefix: "VITTORIA! ",
    cash: "Contanti",
    research: "Punti Ricerca",
    cp: "CP",
    claimed100Cp: "Premio speciale reclamato! 100CP",
  },
  fr: {
    special: "GAGNÉ! Prix spécial! - Sélectionnez un prix dans la liste pour continuer.",
    winPrefix: "GAGNÉ! ",
    cash: "Argent",
    research: "Points de Recherche",
    cp: "PC",
    claimed100Cp: "Prix spécial réclamé! 100CP",
  },
} as const;

const SOURCE_DOUBLE_OR_NOTHING_COPY = {
  en: { win: "WIN! Stake doubled.", loss: "LOSE! Better luck next time." },
  es: { win: "\u00a1GANASTE! Apuesta duplicada.", loss: "\u00a1PERDISTE! Mejor suerte la pr\u00f3xima." },
  pt: { win: "GANHOU! Aposta duplicada.", loss: "PERDEU! Mais sorte da pr\u00f3xima vez." },
  de: { win: "GEWONNEN! Einsatz verdoppelt.", loss: "VERLOREN! Viel Gl\u00fcck beim n\u00e4chsten Mal." },
  it: { win: "VITTORIA! Puntata raddoppiata.", loss: "SCONFITTA! Pi\u00f9 fortuna la prossima volta." },
  fr: { win: "GAGN\u00c9! Mise doubl\u00e9e.", loss: "PERDU! Meilleure chance la prochaine fois." },
} as const;

const SOURCE_WHEEL_SPECIAL_CONTEXT_COPY = {
  en: {
    research: "Special Prize Claimed! 100,000 Research Points",
    fallbackCp: "Special Prize Claimed! 20CP",
    doubleHydrogen: "Special Prize Claimed! Hydrogen doubled",
    starship: "Special Prize Claimed! Starship warped instantly to Sirius",
    rocket: "Special Prize Claimed! Rocket 1 Prospector warped to Asteroid SPI-0002B",
    rocketBase: "Special Prize Claimed! Rocket 1 Prospector warped to Base",
    pending: "Claim your prize before spinning again.",
    insufficient: "Not enough CP to spin the wheel.",
  },
  es: {
    research: "\u00a1Premio especial reclamado! 100.000 puntos de investigaci\u00f3n",
    fallbackCp: "\u00a1Premio especial reclamado! 20CP",
    doubleHydrogen: "\u00a1Premio especial reclamado! Hydrogen duplicado",
    starship:
      "\u00a1Premio especial reclamado! Nave estelar teletransportada instant\u00e1neamente a Sirius",
    rocket:
      "\u00a1Premio especial reclamado! Rocket 1 Prospector teletransportado a Asteroid SPI-0002B",
    rocketBase: "\u00a1Premio especial reclamado! Rocket 1 Prospector teletransportado a Base",
    pending: "Reclama tu premio antes de girar de nuevo.",
    insufficient: "No hay suficientes CP para girar la rueda.",
  },
  pt: {
    research: "Pr\u00e9mio especial reclamado! 100.000 pontos de investiga\u00e7\u00e3o",
    fallbackCp: "Pr\u00e9mio especial reclamado! 20CP",
    doubleHydrogen: "Pr\u00e9mio especial reclamado! Hydrogen duplicado",
    starship:
      "Pr\u00e9mio especial reclamado! Nave estelar teletransportada instantaneamente para Sirius",
    rocket:
      "Pr\u00e9mio especial reclamado! Rocket 1 Prospector teletransportado para Asteroid SPI-0002B",
    rocketBase: "Pr\u00e9mio especial reclamado! Rocket 1 Prospector teletransportado para Base",
    pending: "Reclame o seu pr\u00e9mio antes de girar novamente.",
    insufficient: "N\u00e3o h\u00e1 CP suficientes para girar a roda.",
  },
  de: {
    research: "Sonderpreis beansprucht! 100.000 Forschungspunkte",
    fallbackCp: "Sonderpreis beansprucht! 20CP",
    doubleHydrogen: "Sonderpreis beansprucht! Hydrogen verdoppelt",
    starship: "Sonderpreis beansprucht! Sternenschiff sofort zu teleportiert Sirius",
    rocket: "Sonderpreis beansprucht! Rocket 1 Prospector teleportiert zu Asteroid SPI-0002B",
    rocketBase: "Sonderpreis beansprucht! Rocket 1 Prospector teleportiert zu Base",
    pending: "Beanspruche deinen Preis, bevor du erneut drehst.",
    insufficient: "Nicht genug CP, um das Rad zu drehen.",
  },
  it: {
    research: "Premio speciale reclamato! 100.000 punti ricerca",
    fallbackCp: "Premio speciale reclamato! 20CP",
    doubleHydrogen: "Premio speciale reclamato! Hydrogen raddoppiato",
    starship: "Premio speciale reclamato! Astronave curvata istantaneamente verso Sirius",
    rocket: "Premio speciale reclamato! Rocket 1 Prospector curvato verso Asteroid SPI-0002B",
    rocketBase: "Premio speciale reclamato! Rocket 1 Prospector curvato verso Base",
    pending: "Reclama il tuo premio prima di girare di nuovo.",
    insufficient: "Non abbastanza CP per girare la ruota.",
  },
  fr: {
    research: "Prix sp\u00e9cial r\u00e9clam\u00e9! 100 000 points de recherche",
    fallbackCp: "Prix sp\u00e9cial r\u00e9clam\u00e9! 20CP",
    doubleHydrogen: "Prix sp\u00e9cial r\u00e9clam\u00e9! Hydrogen doubl\u00e9",
    starship:
      "Prix sp\u00e9cial r\u00e9clam\u00e9! Vaisseau stellaire t\u00e9l\u00e9port\u00e9 instantan\u00e9ment vers Sirius",
    rocket:
      "Prix sp\u00e9cial r\u00e9clam\u00e9! Rocket 1 Prospector t\u00e9l\u00e9port\u00e9 vers Asteroid SPI-0002B",
    rocketBase:
      "Prix sp\u00e9cial r\u00e9clam\u00e9! Rocket 1 Prospector t\u00e9l\u00e9port\u00e9 vers Base",
    pending: "R\u00e9clamez votre prix avant de tourner \u00e0 nouveau.",
    insufficient: "Pas assez de PC pour tourner la roue.",
  },
} as const;

const SOURCE_WHEEL_LOSS_COPY = {
  en: "LOSE! Better luck next time.",
  es: "\u00a1PERDISTE! Mejor suerte la pr\u00f3xima.",
  pt: "PERDEU! Mais sorte da pr\u00f3xima vez.",
  de: "VERLOREN! Viel Gl\u00fcck beim n\u00e4chsten Mal.",
  it: "SCONFITTA! Pi\u00f9 fortuna la prossima volta.",
  fr: "PERDU! Meilleure chance la prochaine fois.",
} as const;

const wheelSpecialReady: EngineEvent = { type: "casino.wheel.special-ready" };

const wheelSpecialReadyCompanion: EngineEvent = {
  type: "casino.game.played",
  gameId: "wheel",
  result: "special-ready",
  cpSpent: 1,
  cpAwarded: 0,
};

function wheelResult(result: string, cpAwarded = 0): EngineEvent {
  return { type: "casino.game.played", gameId: "wheel", result, cpSpent: 1, cpAwarded };
}

const wheelClaim100Cp: EngineEvent = {
  type: "casino.wheel.special-claimed",
  prize: "special_100cp",
  detail: "special_100cp",
  award: { type: "cp", amount: 100 },
};

afterEach(() => vi.useRealTimers());

describe("Casino event notifications", () => {
  it("uses the source-localized Double-or-Nothing win/loss copy and severity", () => {
    for (const locale of LOCALE_IDS) {
      const source = SOURCE_DOUBLE_OR_NOTHING_COPY[locale];
      const win = casinoEventNotice(locale, donWin);
      const loss = casinoEventNotice(locale, donLoss);

      expect(win).toEqual({
        message: source.win,
        classification: "galacticCasino",
        type: "info",
        durationMs: 2500,
      });
      expect(loss).toEqual({
        message: source.loss,
        classification: "galacticCasino",
        type: "error",
        durationMs: 2500,
      });
      expect(casinoText(locale, "doubleOrNothingWinNotification")).toBe(source.win);
      expect(casinoText(locale, "doubleOrNothingLossNotification")).toBe(source.loss);
    }
  });

  it("uses the generic Wheel fallback and ignores companion, other-game, and unrelated Casino events", () => {
    const ignored: readonly EngineEvent[] = [
      wheelSpecialReadyCompanion,
      wheelResult("unrecognized-wheel-result"),
      {
        type: "casino.higher-lower.revealed",
        index: 1,
        card: { suit: "clubs", rank: 2 },
        correct: true,
      },
      {
        type: "casino.game.played",
        gameId: "higherLower",
        result: "cashout:hilo_cp_10",
        cpSpent: 5,
        cpAwarded: 10,
      },
      {
        type: "casino.void-seer.result",
        tier: 1,
        first: 2,
        second: 3,
        won: false,
        detail: "2 and 3",
      },
    ];

    expect(ignored.map((event) => casinoEventNotice("en", event))).toEqual([
      null,
      {
        message: "WON!",
        classification: "galacticCasino",
        type: "info",
        durationMs: 2500,
      },
      null,
      null,
      null,
    ]);
  });

  it("maps Wheel special-ready and loss notifications to exact source copy in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      expect(casinoEventNotice(locale, wheelSpecialReady)).toEqual({
        message: SOURCE_WHEEL_COPY[locale].special,
        classification: "galacticCasino",
        type: "info",
        durationMs: 3500,
      });
      expect(casinoEventNotice(locale, wheelResult("loss"))).toEqual({
        message: SOURCE_WHEEL_LOSS_COPY[locale],
        classification: "galacticCasino",
        type: "error",
        durationMs: 2000,
      });
    }
  });

  it("emits one Wheel special-ready toast despite the companion game result", () => {
    vi.useFakeTimers();
    const state = createInitialGameState();
    const notify = vi.fn();
    const handler = createCasinoEventNoticeHandler(
      () => "en",
      () => state,
      notify,
    );

    handler([wheelSpecialReady, wheelSpecialReadyCompanion]);

    expect(notify).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2600);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith({
      message: SOURCE_WHEEL_COPY.en.special,
      classification: "galacticCasino",
      type: "info",
      durationMs: 3500,
    });
  });

  it("formats Wheel resource, Cash, Research Points, CP, and time rewards from the result payload", () => {
    for (const locale of LOCALE_IDS) {
      const source = SOURCE_WHEEL_COPY[locale];
      const cases = [
        [wheelResult("hydrogen:3"), `${source.winPrefix}3 ${economyGoodName(locale, "hydrogen")}`],
        [wheelResult("cash:25"), `${source.winPrefix}25 ${casinoText(locale, "cash")}`],
        [
          wheelResult("research:125"),
          `${source.winPrefix}125 ${casinoText(locale, "researchPoints")}`,
        ],
        [wheelResult("cp:2", 2), `${source.winPrefix}2 ${source.cp}`],
      ] as const;

      for (const [event, message] of cases) {
        expect(casinoEventNotice(locale, event)).toEqual({
          message,
          classification: "galacticCasino",
          type: "info",
          durationMs: 3500,
        });
      }
    }

    const initialState = createInitialGameState();
    const starshipTimerId = createTimerId("travel", "starship-journey");
    const initialTimer = createTimer({
      id: starshipTimerId,
      domain: "travel",
      durationMs: 100_000,
    });
    const stateWithTimer = {
      ...initialState,
      run: {
        ...initialState.run,
        timers: {
          ...initialState.run.timers,
          [starshipTimerId]: { ...initialTimer, durationMs: 93_000 },
        },
      },
    };
    for (const locale of LOCALE_IDS) {
      const timeNotice = casinoEventNotice(
        locale,
        wheelResult("time:travel:starship-journey:7000"),
        stateWithTimer,
      );
      const expectedMessage = casinoText(locale, "wheelTimeReducedMessage")
        .replaceAll("{label}", casinoText(locale, "wheelTimerStarshipJourneyLabel"))
        .replaceAll("{from}", "100")
        .replaceAll("{to}", "93");
      expect(timeNotice).toEqual({
        message: expectedMessage,
        classification: "galacticCasino",
        type: "info",
        durationMs: 3500,
      });
      expect(timeNotice?.message).not.toContain("time:travel:starship-journey:7000");
    }

    const rocketTimerId = createTimerId("travel", "rocket1-asteroid-journey");
    const rocketTimer = createTimer({ id: rocketTimerId, domain: "travel", durationMs: 100_000 });
    const rocketState = {
      ...initialState,
      run: {
        ...initialState.run,
        timers: {
          ...initialState.run.timers,
          [rocketTimerId]: { ...rocketTimer, durationMs: 90_000 },
        },
        space: {
          ...initialState.run.space,
          rockets: {
            ...initialState.run.space.rockets,
            rocket1: { ...initialState.run.space.rockets.rocket1, name: "Prospector" },
          },
        },
      },
    };
    expect(
      casinoEventNotice(
        "en",
        wheelResult("time:travel:rocket1-asteroid-journey:10000"),
        rocketState,
      )?.message,
    ).toBe("WON! Prospector: Time reduced from 100s to 90s");
  });

  it("maps an accepted Wheel special-prize claim to the source claim notification", () => {
    for (const locale of LOCALE_IDS) {
      expect(casinoEventNotice(locale, wheelClaim100Cp)).toEqual({
        message: SOURCE_WHEEL_COPY[locale].claimed100Cp,
        classification: "galacticCasino",
        type: "info",
        durationMs: 3500,
      });

      const claim = (
        prize: Extract<EngineEvent, { type: "casino.wheel.special-claimed" }>["prize"],
        award: Extract<EngineEvent, { type: "casino.wheel.special-claimed" }>["award"],
      ): EngineEvent => ({
        type: "casino.wheel.special-claimed",
        prize,
        detail: prize,
        award,
      });
      expect(
        casinoEventNotice(
          locale,
          claim("special_100k_research", { type: "research", amount: 100_000 }),
        )?.message,
      ).toBe(SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].research);
      expect(
        casinoEventNotice(locale, claim("special_double_hydrogen", { type: "cp", amount: 20 }))
          ?.message,
      ).toBe(SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].fallbackCp);
      expect(
        casinoEventNotice(
          locale,
          claim("special_double_hydrogen", {
            type: "double",
            goodId: "hydrogen",
            oldQuantity: 2,
            newQuantity: 4,
          }),
        )?.message,
      ).toBe(SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].doubleHydrogen);
      expect(
        casinoEventNotice(
          locale,
          claim("special_starship_warp", { type: "starship-warp", destinationSystemId: "Sirius" }),
        )?.message,
      ).toBe(SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].starship);
      expect(
        casinoEventNotice(
          locale,
          claim("special_rocket_warp", {
            type: "rocket-warp",
            rocketId: "rocket1",
            rocketName: "Prospector",
            destination: { type: "asteroid", name: "SPI-0002B" },
          }),
        )?.message,
      ).toBe(SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].rocket);
      expect(
        casinoEventNotice(
          locale,
          claim("special_rocket_warp", {
            type: "rocket-warp",
            rocketId: "rocket1",
            rocketName: "Prospector",
            destination: { type: "base" },
          }),
        )?.message,
      ).toBe(SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].rocketBase);
      expect(casinoWheelAttemptFailureNotice(locale, "casino-wheel-prize-pending")).toEqual({
        message: SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].pending,
        classification: "galacticCasino",
        type: "info",
        durationMs: 2500,
      });
      expect(casinoWheelAttemptFailureNotice(locale, "casino-insufficient-cp")).toEqual({
        message: SOURCE_WHEEL_SPECIAL_CONTEXT_COPY[locale].insufficient,
        classification: "galacticCasino",
        type: "info",
        durationMs: 2500,
      });
    }
    expect(casinoWheelAttemptFailureNotice("en", "casino-wheel-spinning")).toBeNull();
  });

  it("uses the selected notation for Wheel countdowns and numeric special-prize claims", () => {
    const initial = createInitialGameState();
    const timerId = createTimerId("travel", "starship-journey");
    const timer = createTimer({ id: timerId, domain: "travel", durationMs: 20_000_000 });
    const researchClaim: EngineEvent = {
      type: "casino.wheel.special-claimed",
      prize: "special_100k_research",
      detail: "special_100k_research",
      award: { type: "research", amount: 100_000 },
    };

    for (const locale of LOCALE_IDS) {
      for (const notation of ["condensed", "standard", "scientific"] as const) {
        const state = {
          ...initial,
          settings: { ...initial.settings, locale, notation },
          run: {
            ...initial.run,
            timers: {
              ...initial.run.timers,
              [timerId]: { ...timer, durationMs: 13_000_000 },
            },
          },
        };
        const timerNotice = casinoEventNotice(
          locale,
          wheelResult("time:travel:starship-journey:7000000"),
          state,
        );
        const expectedTimerMessage = casinoText(locale, "wheelTimeReducedMessage")
          .replaceAll("{label}", casinoText(locale, "wheelTimerStarshipJourneyLabel"))
          .replaceAll("{from}", formatNumber(locale, 20_000, 0, notation))
          .replaceAll("{to}", formatNumber(locale, 13_000, 0, notation));
        expect(timerNotice?.message).toBe(expectedTimerMessage);

        expect(casinoEventNotice(locale, wheelClaim100Cp, state)?.message).toContain(
          formatNumber(locale, 100, 0, notation),
        );
        expect(casinoEventNotice(locale, researchClaim, state)?.message).toContain(
          formatNumber(locale, 100_000, 0, notation),
        );
      }
    }
  });

  it("does not route notices for rejected Casino commands", () => {
    const state = createInitialGameState();
    const rejectedSpin = transition(state, { type: "casino.wheel.spin" });
    const rejectedClaim = transition(state, {
      type: "casino.wheel.claim",
      prize: "special_100cp",
    });
    expect(rejectedSpin.accepted).toBe(false);
    expect(rejectedClaim.accepted).toBe(false);
    expect(rejectedSpin.events).toEqual([]);
    expect(rejectedClaim.events).toEqual([]);

    const notify = vi.fn();
    const handler = createCasinoEventNoticeHandler(
      () => "en",
      () => state,
      notify,
    );
    handler([...rejectedSpin.events, ...rejectedClaim.events]);
    expect(notify).not.toHaveBeenCalled();
  });

  it("keeps Wheel spin notices source-timed, delivers immediately with reduced motion, and suppresses notices when disabled", () => {
    vi.useFakeTimers();
    const state = createInitialGameState();
    const notify = vi.fn();
    const handler = createCasinoEventNoticeHandler(
      () => "en",
      () => state,
      notify,
    );

    handler([donWin, wheelSpecialReady, wheelResult("loss"), wheelClaim100Cp]);
    expect(notify).toHaveBeenCalledTimes(2);
    expect(notify).toHaveBeenCalledWith(casinoEventNotice("en", donWin));
    expect(notify).toHaveBeenCalledWith(casinoEventNotice("en", wheelClaim100Cp));
    vi.advanceTimersByTime(2599);
    expect(notify).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(notify).toHaveBeenCalledTimes(4);
    expect(notify).toHaveBeenCalledWith(casinoEventNotice("en", wheelResult("loss")));

    const reducedMotionState = {
      ...state,
      settings: { ...state.settings, reducedMotion: true },
    };
    const reducedMotionNotify = vi.fn();
    const reducedMotionHandler = createCasinoEventNoticeHandler(
      () => "en",
      () => reducedMotionState,
      reducedMotionNotify,
    );
    reducedMotionHandler([wheelSpecialReady]);
    expect(reducedMotionNotify).toHaveBeenCalledTimes(1);

    const disabledState = {
      ...state,
      settings: { ...state.settings, notificationsEnabled: false },
    };
    const disabledNotify = vi.fn();
    const disabledHandler = createCasinoEventNoticeHandler(
      () => "en",
      () => disabledState,
      disabledNotify,
    );

    disabledHandler([donWin, donLoss, wheelSpecialReady, wheelResult("cash:3"), wheelClaim100Cp]);
    expect(disabledNotify).not.toHaveBeenCalled();
  });
});
