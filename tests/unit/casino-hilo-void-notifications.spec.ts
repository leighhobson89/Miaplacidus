import { describe, expect, it } from "vitest";
import type { LocaleId } from "../../src/content/ids";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { createInitialGameState, type GameState } from "../../src/engine/state";
import type { EngineEvent } from "../../src/engine/commands";
import { applyCasinoCommand, type HigherLowerOutcome } from "../../src/engine/galacticCasino";
import { createRandomState } from "../../src/engine/random";
import { casinoEventNotice } from "../../src/app/casinoEventNotifications";
import { formatNumber } from "../../src/app/numberFormatting";
import { casinoHiloText, casinoPrizeText } from "../../src/i18n/casinoMessages";
import { economyGoodName } from "../../src/app/economyDisplay";

/**
 * Notification copy observed in Cosmic Forge's localization.json. Hilo
 * callsites are in drawTab7Content.js; Void Seer result callsites are in the
 * same file. These are deliberately expectations, not remake message imports.
 */
const SOURCE_COPY: Record<
  LocaleId,
  {
    readonly hiloLoss: string;
    readonly hiloFullDeck: string;
    readonly hiloCashOut: string;
    readonly voidWin: string;
    readonly voidLoss: string;
    readonly voidAntimatter: string;
    readonly voidWinWithClue: string;
    readonly oTypeClues: readonly [string, string, string];
  }
> = {
  en: {
    hiloLoss: "LOSE! Better luck next time.",
    hiloFullDeck: "WON! Well done you guessed all Cards! {prize}",
    hiloCashOut: "You cashed out at {count} cards - {prize}",
    voidWin: "WIN!",
    voidLoss: "LOSE! Better luck next time",
    voidAntimatter: "WIN! +{amount} Antimatter",
    voidWinWithClue: "WIN! {clue}",
    oTypeClues: [
      "Regulus is giving off very high energy signals, it could be a type O star!",
      "Your instruments spike whenever they point toward Regulus. All signs suggest an O-type star.",
      "Long-range scans detect extreme radiation from Regulus. This could be an O-type system.",
    ],
  },
  es: {
    hiloLoss: "\u00a1PERDISTE! Mejor suerte la pr\u00f3xima vez.",
    hiloFullDeck: "\u00a1GANASTE! \u00a1Bien hecho, acertaste todas las cartas! {prize}",
    hiloCashOut: "Te retiraste con {count} cartas - {prize}",
    voidWin: "\u00a1GANASTE!",
    voidLoss: "\u00a1PERDISTE! Mejor suerte la pr\u00f3xima vez",
    voidAntimatter: "\u00a1GANASTE! +{amount} de antimateria",
    voidWinWithClue: "\u00a1GANASTE! {clue}",
    oTypeClues: [
      "\u00a1Regulus emite se\u00f1ales de energ\u00eda muy altas, podr\u00eda ser una estrella de tipo O!",
      "Tus instrumentos se disparan cada vez que apuntan a Regulus. Todo indica una estrella de tipo O.",
      "Los escaneos de largo alcance detectan radiaci\u00f3n extrema en Regulus. Podr\u00eda ser un sistema de tipo O.",
    ],
  },
  pt: {
    hiloLoss: "PERDEU! Mais sorte da pr\u00f3xima vez.",
    hiloFullDeck: "GANHOU! Muito bem, acertou em todas as cartas! {prize}",
    hiloCashOut: "Saiu com {count} cartas - {prize}",
    voidWin: "GANHOU!",
    voidLoss: "PERDEU! Mais sorte da pr\u00f3xima vez",
    voidAntimatter: "GANHOU! +{amount} de antimat\u00e9ria",
    voidWinWithClue: "GANHOU! {clue}",
    oTypeClues: [
      "Regulus emite sinais de energia muito elevados, pode ser uma estrela de tipo O!",
      "Os seus instrumentos disparam sempre que apontam para Regulus. Tudo indica uma estrela de tipo O.",
      "Os scans de longo alcance detetam radia\u00e7\u00e3o extrema em Regulus. Pode ser um sistema de tipo O.",
    ],
  },
  de: {
    hiloLoss: "VERLOREN! Mehr Gl\u00fcck beim n\u00e4chsten Mal.",
    hiloFullDeck: "GEWONNEN! Gut gemacht, du hast alle Karten erraten! {prize}",
    hiloCashOut: "Du hast bei {count} Karten ausgezahlt - {prize}",
    voidWin: "GEWONNEN!",
    voidLoss: "VERLOREN! Mehr Gl\u00fcck beim n\u00e4chsten Mal",
    voidAntimatter: "GEWONNEN! +{amount} Antimaterie",
    voidWinWithClue: "GEWONNEN! {clue}",
    oTypeClues: [
      "Regulus sendet sehr energiereiche Signale aus \u2014 vielleicht ein Stern vom Typ O!",
      "Deine Instrumente schlagen aus, sobald sie auf Regulus zeigen. Alles deutet auf einen O-Stern hin.",
      "Fernscans messen extreme Strahlung von Regulus. Das k\u00f6nnte ein System vom Typ O sein.",
    ],
  },
  it: {
    hiloLoss: "HAI PERSO! Sar\u00e0 per la prossima volta.",
    hiloFullDeck: "VINTO! Bravo, hai indovinato tutte le carte! {prize}",
    hiloCashOut: "Hai incassato a {count} carte - {prize}",
    voidWin: "VINTO!",
    voidLoss: "HAI PERSO! Sar\u00e0 per la prossima volta",
    voidAntimatter: "VINTO! +{amount} di antimateria",
    voidWinWithClue: "VINTO! {clue}",
    oTypeClues: [
      "Regulus emette segnali ad altissima energia: potrebbe essere una stella di tipo O!",
      "I tuoi strumenti impazziscono ogni volta che puntano verso Regulus. Tutto indica una stella di tipo O.",
      "Le scansioni a lungo raggio rilevano radiazioni estreme da Regulus. Potrebbe essere un sistema di tipo O.",
    ],
  },
  fr: {
    hiloLoss: "PERDU! Plus de chance la prochaine fois.",
    hiloFullDeck: "GAGN\u00c9! Bravo, vous avez devin\u00e9 toutes les cartes! {prize}",
    hiloCashOut: "Vous avez encaiss\u00e9 \u00e0 {count} cartes - {prize}",
    voidWin: "GAGN\u00c9!",
    voidLoss: "PERDU! Plus de chance la prochaine fois",
    voidAntimatter: "GAGN\u00c9! +{amount} d'antimati\u00e8re",
    voidWinWithClue: "GAGN\u00c9! {clue}",
    oTypeClues: [
      "Regulus \u00e9met des signaux de tr\u00e8s haute \u00e9nergie, ce pourrait \u00eatre une \u00e9toile de type O!",
      "Vos instruments s'affolent d\u00e8s qu'ils pointent vers Regulus. Tout indique une \u00e9toile de type O.",
      "Les scans longue port\u00e9e d\u00e9tectent un rayonnement extr\u00eame venant de Regulus. Ce pourrait \u00eatre un syst\u00e8me de type O.",
    ],
  },
};

const LOCALES = Object.keys(SOURCE_COPY) as LocaleId[];
const sourcePrizeName = "20CP";
const SOURCE_HILO_COPY: Record<LocaleId, readonly string[]> = {
  en: [
    "+{amount} CP",
    "Cash Boost",
    "Research Boost",
    "Resource Top-Up",
    "Compound Top-Up",
    "Double {material}",
    "Research Grant",
    "Cash Grant",
    "Research Grant+",
    "Research Mega",
    "Cash Mega",
    "TimeWarp x{multiplier}",
    "Finish Rocket",
    "Finish Starship",
    "Finish Asteroid",
    "Finish Star Study",
    "Finish Void",
    "{amount} Cash",
    "{amount} Research Points",
    "{amount} {material}",
    "{material} doubled",
    "TimeWarp x{multiplier} for {seconds}s",
    "Finished Asteroid Search{suffix}",
    "Finished Star Study",
    "Finished Void Pillage",
    "Finished Rocket Journey{suffix}",
    "Finished Starship Journey ({star})",
  ],
  es: [
    "+{amount} PC",
    "Impulso de Dinero",
    "Impulso de Investigación",
    "Recarga de Recursos",
    "Recarga de Compuestos",
    "Duplicar {material}",
    "Subvención de Investigación",
    "Subvención de Dinero",
    "Subvención de Investigación+",
    "Mega Investigación",
    "Mega Dinero",
    "Distorsión Temporal x{multiplier}",
    "Terminar Cohete",
    "Terminar Nave Estelar",
    "Terminar Asteroide",
    "Terminar Estudio Estelar",
    "Terminar Vacío",
    "{amount} de dinero",
    "{amount} puntos de investigación",
    "{amount} de {material}",
    "{material} duplicado",
    "Distorsión Temporal x{multiplier} durante {seconds}s",
    "Búsqueda de asteroides terminada{suffix}",
    "Estudio estelar terminado",
    "Saqueo del vacío terminado",
    "Viaje del cohete terminado{suffix}",
    "Viaje de la nave estelar terminado ({star})",
  ],
  pt: [
    "+{amount} PC",
    "Impulso de Dinheiro",
    "Impulso de Investigação",
    "Reposição de Recursos",
    "Reposição de Compostos",
    "Duplicar {material}",
    "Subsídio de Investigação",
    "Subsídio de Dinheiro",
    "Subsídio de Investigação+",
    "Mega Investigação",
    "Mega Dinheiro",
    "Distorção Temporal x{multiplier}",
    "Terminar Foguetão",
    "Terminar Nave Estelar",
    "Terminar Asteroide",
    "Terminar Estudo Estelar",
    "Terminar Vazio",
    "{amount} de dinheiro",
    "{amount} pontos de investigação",
    "{amount} de {material}",
    "{material} duplicado",
    "Distorção Temporal x{multiplier} durante {seconds}s",
    "Busca por asteroides concluída{suffix}",
    "Estudo estelar concluído",
    "Saque do vazio concluído",
    "Viagem do foguetão concluída{suffix}",
    "Viagem da nave estelar concluída ({star})",
  ],
  de: [
    "+{amount} CP",
    "Bargeld-Boost",
    "Forschungs-Boost",
    "Ressourcen-Auffüllung",
    "Verbindungs-Auffüllung",
    "{material} verdoppeln",
    "Forschungszuschuss",
    "Bargeldzuschuss",
    "Forschungszuschuss+",
    "Mega-Forschung",
    "Mega-Bargeld",
    "Zeitsprung x{multiplier}",
    "Rakete Abschließen",
    "Sternenschiff Abschließen",
    "Asteroid Abschließen",
    "Sternenstudie Abschließen",
    "Leere Abschließen",
    "{amount} Bargeld",
    "{amount} Forschungspunkte",
    "{amount} {material}",
    "{material} verdoppelt",
    "Zeitsprung x{multiplier} für {seconds}s",
    "Asteroidensuche abgeschlossen{suffix}",
    "Sternenstudie abgeschlossen",
    "Plünderung der Leere abgeschlossen",
    "Raketenreise abgeschlossen{suffix}",
    "Sternenschiffreise abgeschlossen ({star})",
  ],
  it: [
    "+{amount} PC",
    "Bonus Denaro",
    "Bonus Ricerca",
    "Ricarica Risorse",
    "Ricarica Composti",
    "Raddoppia {material}",
    "Sovvenzione Ricerca",
    "Sovvenzione Denaro",
    "Sovvenzione Ricerca+",
    "Mega Ricerca",
    "Mega Denaro",
    "Salto Temporale x{multiplier}",
    "Completa Razzo",
    "Completa Astronave",
    "Completa Asteroide",
    "Completa Studio Stellare",
    "Completa Vuoto",
    "{amount} di denaro",
    "{amount} punti ricerca",
    "{amount} di {material}",
    "{material} raddoppiato",
    "Salto Temporale x{multiplier} per {seconds}s",
    "Ricerca di asteroidi completata{suffix}",
    "Studio stellare completato",
    "Saccheggio del vuoto completato",
    "Viaggio del razzo completato{suffix}",
    "Viaggio dell'astronave completato ({star})",
  ],
  fr: [
    "+{amount} PC",
    "Bonus d'Argent",
    "Bonus de Recherche",
    "Recharge de Ressources",
    "Recharge de Composés",
    "Doubler {material}",
    "Subvention de Recherche",
    "Subvention en Argent",
    "Subvention de Recherche+",
    "Méga Recherche",
    "Méga Argent",
    "Distorsion Temporelle x{multiplier}",
    "Terminer la Fusée",
    "Terminer le Vaisseau",
    "Terminer l'Astéroïde",
    "Terminer l'Étude Stellaire",
    "Terminer le Vide",
    "{amount} en argent",
    "{amount} points de recherche",
    "{amount} de {material}",
    "{material} doublé",
    "Distorsion Temporelle x{multiplier} pendant {seconds}s",
    "Recherche d'astéroïdes terminée{suffix}",
    "Étude stellaire terminée",
    "Pillage du vide terminé",
    "Voyage de la fusée terminé{suffix}",
    "Voyage du vaisseau terminé ({star})",
  ],
};

const HILO_COPY_KEYS = [
  "cpPrize",
  "cashBoost",
  "researchBoost",
  "resourceTopUp",
  "compoundTopUp",
  "doubleMaterial",
  "researchGrant",
  "cashGrant",
  "researchGrantPlus",
  "researchMega",
  "cashMega",
  "timeWarp",
  "finishRocket",
  "finishStarship",
  "finishAsteroid",
  "finishStarStudy",
  "finishVoid",
  "awardCash",
  "awardResearch",
  "awardMaterialAmount",
  "awardMaterialDoubled",
  "awardTimeWarp",
  "awardFinishedAsteroidSearch",
  "awardFinishedStarStudy",
  "awardFinishedVoidPillage",
  "awardFinishedRocketJourney",
  "awardFinishedStarshipJourney",
] as const;

function hiloReveal(index: number, correct: boolean, outcome?: HigherLowerOutcome): EngineEvent {
  return {
    type: "casino.higher-lower.revealed",
    index,
    card: { rank: 8, suit: "hearts" },
    correct,
    ...(outcome === undefined ? {} : { outcome }),
  };
}

function stateWithHiloRound(prizeKey: string, index: number, seed = 5): GameState {
  const state = createInitialGameState({ seed });
  const casino = state.permanent.galacticCasino;
  const deck = Array.from({ length: 9 }, (_, cardIndex) => ({
    rank: cardIndex + 2,
    suit: (["clubs", "diamonds", "hearts", "spades"] as const)[cardIndex % 4]!,
  }));
  return {
    ...state,
    run: {
      ...state.run,
      cash: 1_000_000,
      researchPoints: 250_000,
      random: createRandomState(seed),
    },
    permanent: {
      ...state.permanent,
      galacticCasino: {
        ...casino,
        casinoPoints: 50,
        higherLower: { deck, index, prizeKey },
      },
    },
  };
}

function voidResult(detail: string, won: boolean, tier: 1 | 2 | 3 = 1): EngineEvent {
  return {
    type: "casino.void-seer.result",
    tier,
    first: won ? 4 : 2,
    second: won ? 4 : 5,
    won,
    detail,
  };
}

function expectNotice(
  notice: ReturnType<typeof casinoEventNotice>,
  message: string,
  type: "info" | "error" | "warning",
  durationMs: number,
): void {
  expect(notice).toEqual({
    message,
    classification: "galacticCasino",
    type,
    durationMs,
  });
}

describe("Higher or Lower and Void Seer source-style notifications", () => {
  it("matches every source Hilo prize label and award-detail template in all six locales", () => {
    for (const locale of LOCALES) {
      expect(HILO_COPY_KEYS.map((key) => casinoHiloText(locale, key))).toEqual(
        SOURCE_HILO_COPY[locale],
      );
      expect(casinoPrizeText(locale, "hilo_cp_20")).toBe(
        SOURCE_HILO_COPY[locale][0]!.replace("{amount}", "20"),
      );
      expect(casinoPrizeText(locale, "hilo_cash_boost_small")).toBe(SOURCE_HILO_COPY[locale][1]);
      expect(casinoPrizeText(locale, "hilo_research_boost_medium")).toBe(
        SOURCE_HILO_COPY[locale][2],
      );
      expect(casinoPrizeText(locale, "special_double_hydrogen", "Hydrogen")).toBe(
        SOURCE_HILO_COPY[locale][5]!.replace("{material}", "Hydrogen"),
      );
      expect(casinoPrizeText(locale, "hilo_research_flat")).toBe(SOURCE_HILO_COPY[locale][6]);
      expect(casinoPrizeText(locale, "hilo_cash_flat")).toBe(SOURCE_HILO_COPY[locale][7]);
      expect(casinoPrizeText(locale, "hilo_research_big_flat")).toBe(SOURCE_HILO_COPY[locale][8]);
      expect(casinoPrizeText(locale, "hilo_research_mega")).toBe(SOURCE_HILO_COPY[locale][9]);
      expect(casinoPrizeText(locale, "hilo_cash_mega")).toBe(SOURCE_HILO_COPY[locale][10]);
      expect(casinoPrizeText(locale, "hilo_timewarp_25_20000")).toBe(
        SOURCE_HILO_COPY[locale][11]!.replace("{multiplier}", "25"),
      );
      expect(casinoPrizeText(locale, "special_finish_rocket_journey")).toBe(
        SOURCE_HILO_COPY[locale][12],
      );
      expect(casinoPrizeText(locale, "special_finish_starship_journey")).toBe(
        SOURCE_HILO_COPY[locale][13],
      );
      expect(casinoPrizeText(locale, "special_telescope_finish_asteroid_search")).toBe(
        SOURCE_HILO_COPY[locale][14],
      );
      expect(casinoPrizeText(locale, "special_telescope_finish_star_study")).toBe(
        SOURCE_HILO_COPY[locale][15],
      );
      expect(casinoPrizeText(locale, "special_telescope_finish_void_pillage")).toBe(
        SOURCE_HILO_COPY[locale][16],
      );
    }
  });

  it("reports a failed Hilo guess with source loss copy in every locale", () => {
    for (const locale of LOCALES) {
      expectNotice(
        casinoEventNotice(locale, hiloReveal(1, false)),
        SOURCE_COPY[locale].hiloLoss,
        "error",
        2500,
      );
    }
  });

  it("keeps intermediate correct Hilo guesses silent, then reports the full-deck win", () => {
    for (const locale of LOCALES) {
      expect(casinoEventNotice(locale, hiloReveal(1, true))).toBeNull();
      expect(casinoEventNotice(locale, hiloReveal(5, true))).toBeNull();
      expectNotice(
        casinoEventNotice(
          locale,
          hiloReveal(8, true, {
            prizeKey: "hilo_cp_20",
            won: true,
            award: { type: "cp", amount: 20 },
          }),
        ),
        SOURCE_COPY[locale].hiloFullDeck.replace("{prize}", sourcePrizeName),
        "info",
        2500,
      );
    }
  });

  it("reports the actual rocket or starship journey award in every locale", () => {
    const destinationSystemId = "system:5:0";
    const destinationStar = createStarCatalogue(5)[0]!.name;
    for (const locale of LOCALES) {
      const rocketDetail = casinoHiloText(locale, "awardFinishedRocketJourney").replace(
        "{suffix}",
        " Prospector",
      );
      expectNotice(
        casinoEventNotice(
          locale,
          hiloReveal(8, true, {
            prizeKey: "special_finish_rocket_journey",
            won: true,
            award: { type: "finished-journey", vehicle: "rocket", rocketName: "Prospector" },
          }),
        ),
        SOURCE_COPY[locale].hiloFullDeck.replace(
          "{prize}",
          `${SOURCE_HILO_COPY[locale][12]} - ${rocketDetail}`,
        ),
        "info",
        2500,
      );

      const starshipDetail = casinoHiloText(locale, "awardFinishedStarshipJourney").replace(
        "{star}",
        destinationStar,
      );
      expectNotice(
        casinoEventNotice(
          locale,
          hiloReveal(8, true, {
            prizeKey: "special_finish_starship_journey",
            won: true,
            award: { type: "finished-journey", vehicle: "starship", destinationSystemId },
          }),
        ),
        SOURCE_COPY[locale].hiloFullDeck.replace(
          "{prize}",
          `${SOURCE_HILO_COPY[locale][13]} - ${starshipDetail}`,
        ),
        "info",
        2500,
      );
    }
  });

  it("reports a Hilo cash-out with the revealed-card count and source prize copy", () => {
    for (const locale of LOCALES) {
      // The source notice includes the accepted round's reveal count.
      const eventWithCount = {
        type: "casino.game.played",
        gameId: "higherLower",
        result: "cash-out:hilo_cp_20",
        cpSpent: 5,
        cpAwarded: 20,
        revealedCount: 4,
        higherLowerOutcome: {
          prizeKey: "hilo_cp_20",
          won: true,
          award: { type: "cp", amount: 20 },
        },
      } as EngineEvent;
      expectNotice(
        casinoEventNotice(locale, eventWithCount),
        SOURCE_COPY[locale].hiloCashOut.replace("{count}", "4").replace("{prize}", sourcePrizeName),
        "info",
        2500,
      );
    }
  });

  it("carries actual reducer award data in cashout and final-deck events", () => {
    const cashout = applyCasinoCommand(stateWithHiloRound("hilo_cash_boost_small", 2), {
      type: "casino.higher-lower.cash-out",
    });
    const cashoutEvent = cashout.events[0];
    expect(cashoutEvent).toMatchObject({
      type: "casino.game.played",
      revealedCount: 3,
      higherLowerOutcome: {
        prizeKey: "hilo_cash_boost_small",
        won: true,
        award: { type: "cash", amount: 20_000 },
      },
    });
    expect(cashout.state.run.cash).toBe(1_020_000);

    const researchCashout = applyCasinoCommand(stateWithHiloRound("hilo_research_boost_small", 2), {
      type: "casino.higher-lower.cash-out",
    });
    expect(researchCashout.events[0]).toMatchObject({
      type: "casino.game.played",
      higherLowerOutcome: {
        prizeKey: "hilo_research_boost_small",
        won: true,
        award: { type: "research", amount: 5_000 },
      },
    });

    const materialCashout = applyCasinoCommand(stateWithHiloRound("hilo_resource_topup", 2), {
      type: "casino.higher-lower.cash-out",
    });
    const materialEvent = materialCashout.events[0];
    expect(materialEvent).toMatchObject({
      type: "casino.game.played",
      higherLowerOutcome: {
        prizeKey: "hilo_resource_topup",
        won: true,
        award: { type: "material", goodId: "hydrogen", amount: 1 },
      },
    });

    let finalDeck: ReturnType<typeof applyCasinoCommand> | undefined;
    for (let seed = 0; seed < 64 && !finalDeck; seed += 1) {
      const applied = applyCasinoCommand(stateWithHiloRound("hilo_cp_100", 7, seed), {
        type: "casino.higher-lower.guess",
        direction: "higher",
      });
      const revealed = applied.events[0];
      if (
        revealed?.type === "casino.higher-lower.revealed" &&
        revealed.outcome?.prizeKey === "hilo_timewarp_200_20000"
      ) {
        finalDeck = applied;
      }
    }
    const finalReveal = finalDeck?.events[0];
    expect(finalReveal).toMatchObject({
      type: "casino.higher-lower.revealed",
      index: 8,
      correct: true,
      outcome: {
        prizeKey: "hilo_timewarp_200_20000",
        won: true,
        award: { type: "timewarp", multiplier: 200, durationMs: 20_000 },
      },
    });
    expect(finalDeck?.state.run.timeWarp).toEqual({ multiplier: 200, remainingMs: 20_000 });
  });

  it("uses source prize names and award suffixes from captured outcomes in every locale", () => {
    for (const locale of LOCALES) {
      const notices = [
        {
          outcome: {
            prizeKey: "hilo_cash_boost_medium",
            won: true,
            award: { type: "cash" as const, amount: 1_250 },
          },
          prizeName: SOURCE_HILO_COPY[locale][1]!,
          detail: SOURCE_HILO_COPY[locale][17]!.replace("{amount}", "1250"),
        },
        {
          outcome: {
            prizeKey: "hilo_research_flat",
            won: true,
            award: { type: "research" as const, amount: 5_000 },
          },
          prizeName: SOURCE_HILO_COPY[locale][6]!,
          detail: SOURCE_HILO_COPY[locale][18]!.replace("{amount}", "5000"),
        },
        {
          outcome: {
            prizeKey: "hilo_resource_topup",
            won: true,
            award: { type: "material" as const, goodId: "hydrogen" as const, amount: 3 },
          },
          prizeName: SOURCE_HILO_COPY[locale][3]!,
          detail: SOURCE_HILO_COPY[locale]
            [19]!.replace("{amount}", "3")
            .replace("{material}", economyGoodName(locale, "hydrogen")),
        },
        {
          outcome: {
            prizeKey: "hilo_timewarp_25_20000",
            won: true,
            award: { type: "timewarp" as const, multiplier: 25, durationMs: 20_000 },
          },
          prizeName: SOURCE_HILO_COPY[locale][11]!.replace("{multiplier}", "25"),
          detail: SOURCE_HILO_COPY[locale]
            [21]!.replace("{multiplier}", "25")
            .replace("{seconds}", "20"),
        },
        {
          outcome: {
            prizeKey: "special_telescope_finish_asteroid_search",
            won: true,
            award: {
              type: "finished" as const,
              activity: "asteroid-search" as const,
              asteroidName: "Cinder-7",
            },
          },
          prizeName: SOURCE_HILO_COPY[locale][14]!,
          detail: SOURCE_HILO_COPY[locale][22]!.replace("{suffix}", " (Cinder-7)"),
        },
        {
          outcome: {
            prizeKey: "special_telescope_finish_star_study",
            won: true,
            award: { type: "finished" as const, activity: "star-study" as const },
          },
          prizeName: SOURCE_HILO_COPY[locale][15]!,
          detail: SOURCE_HILO_COPY[locale][23]!,
        },
        {
          outcome: {
            prizeKey: "special_telescope_finish_void_pillage",
            won: true,
            award: { type: "finished" as const, activity: "void-pillage" as const },
          },
          prizeName: SOURCE_HILO_COPY[locale][16]!,
          detail: SOURCE_HILO_COPY[locale][24]!,
        },
      ];
      for (const { outcome, prizeName, detail } of notices) {
        expectNotice(
          casinoEventNotice(locale, hiloReveal(8, true, outcome)),
          SOURCE_COPY[locale].hiloFullDeck.replace("{prize}", `${prizeName} - ${detail}`),
          "info",
          2500,
        );
      }
      const doubled = casinoEventNotice(
        locale,
        hiloReveal(8, true, {
          prizeKey: "special_double_hydrogen",
          won: true,
          award: {
            type: "material-doubled",
            goodId: "hydrogen",
            oldQuantity: 20,
            newQuantity: 40,
          },
        }),
      );
      expectNotice(
        doubled,
        SOURCE_COPY[locale].hiloFullDeck.replace(
          "{prize}",
          SOURCE_HILO_COPY[locale][5]!.replace("{material}", economyGoodName(locale, "hydrogen")),
        ),
        "info",
        2500,
      );
    }
  });

  it("uses the source Void Seer loss copy and error severity in every locale", () => {
    for (const locale of LOCALES) {
      expectNotice(
        casinoEventNotice(locale, voidResult("loss", false)),
        SOURCE_COPY[locale].voidLoss,
        "error",
        2000,
      );
    }
  });

  it("uses the Void Seer antimatter-win variant, informational severity, and source lifetime", () => {
    for (const locale of LOCALES) {
      expectNotice(
        casinoEventNotice(locale, voidResult("antimatter:1234", true, 3)),
        SOURCE_COPY[locale].voidAntimatter.replace("{amount}", "1234"),
        "info",
        3000,
      );
    }
  });

  it("uses the event-selected O-type clue and resolves the generated target star name", () => {
    const targetName = createStarCatalogue(314159)[0]!.name;
    for (const locale of LOCALES) {
      const event = {
        ...voidResult("o-type-clue:system:314159:0", true),
        clueTemplateIndex: 1,
      } satisfies EngineEvent;
      const expectedClue = SOURCE_COPY[locale].oTypeClues[1]!.replaceAll("Regulus", targetName);
      expectNotice(
        casinoEventNotice(locale, event),
        SOURCE_COPY[locale].voidWinWithClue.replace("{clue}", expectedClue),
        "warning",
        15000,
      );
    }
  });

  it("uses source clue-win variants for O-type and manuscript clues in every locale", () => {
    for (const locale of LOCALES) {
      const oType = casinoEventNotice(locale, voidResult("o-type-clue:regulus", true));
      expect(oType).toMatchObject({
        classification: "galacticCasino",
        type: "warning",
        durationMs: 15000,
      });
      expect(SOURCE_COPY[locale].oTypeClues).toContain(
        oType?.message.replace(SOURCE_COPY[locale].voidWinWithClue.split("{clue}")[0], ""),
      );

      const manuscript = casinoEventNotice(locale, voidResult("manuscript-clue:regulus", true, 2));
      expect(manuscript).toMatchObject({
        classification: "galacticCasino",
        type: "warning",
        durationMs: 15000,
      });
      expect(
        manuscript?.message.startsWith(SOURCE_COPY[locale].voidWinWithClue.split("{clue}")[0]!),
      ).toBe(true);
      expect(manuscript?.message).not.toContain("manuscript-clue");
    }
  });

  it("uses the plain Void Seer win variant when no clue target is available", () => {
    for (const locale of LOCALES) {
      expectNotice(
        casinoEventNotice(locale, voidResult("o-type-clue", true)),
        SOURCE_COPY[locale].voidWin,
        "info",
        2500,
      );
      expectNotice(
        casinoEventNotice(locale, voidResult("manuscript-clue", true, 2)),
        SOURCE_COPY[locale].voidWin,
        "info",
        2500,
      );
    }
  });

  it("formats Hilo and Void Seer reward amounts with the saved notation in every locale", () => {
    const amount = 1_234_567;
    const outcome: HigherLowerOutcome = {
      prizeKey: "hilo_cash_boost_medium",
      won: true,
      award: { type: "cash", amount },
    };

    for (const locale of LOCALES) {
      for (const notation of ["condensed", "standard", "scientific"] as const) {
        const initial = createInitialGameState({ seed: 782 });
        const state = {
          ...initial,
          settings: { ...initial.settings, locale, notation },
        };
        const displayedAmount = formatNumber(locale, amount, 0, notation);
        const hilo = casinoEventNotice(locale, hiloReveal(8, true, outcome), state);
        const voidSeer = casinoEventNotice(locale, voidResult(`antimatter:${amount}`, true), state);

        expect(hilo?.message).toContain(displayedAmount);
        expect(voidSeer?.message).toContain(formatNumber(locale, amount, 2, notation));
      }
    }
  });
});
