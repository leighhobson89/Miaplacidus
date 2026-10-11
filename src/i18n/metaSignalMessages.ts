import type { LocaleId } from "../content/ids";
import type { NewsCategory, NewsTickerEntry, RandomEventId } from "../content/metaSignals";
import { GALAXY_SEED_DEFAULT } from "../content/ids";
import { createStarCatalogue } from "../content/starCatalogue";
import type { LocaleNewsCopy } from "./sourceNewsCopy";

const messages: Record<
  LocaleId,
  {
    title: string;
    description: string;
    news: string;
    activeTitle: string;
    active: string;
    activeUntil: string;
    history: string;
    claim: string;
    claimed: string;
    here: string;
    activate: string;
    noCompletedEvents: string;
    noActiveEvents: string;
    prize: string;
    oneOff: string;
    wacky: string;
    clue: string;
    headline: string;
    remaining: string;
  }
> = {
  en: {
    title: "Events",
    description: "The saved ticker, event effects, and recent history.",
    news: "News ticker",
    activeTitle: "Active Events",
    active: "Active effects",
    activeUntil: "Active Until",
    history: "Event History",
    claim: "Claim",
    claimed: "Claimed",
    here: "here",
    activate: "Activate",
    noCompletedEvents: "No completed timed events yet.",
    noActiveEvents: "No active timed events.",
    prize: "A news service has a resource grant for",
    oneOff: "A special bulletin offers a permanent run upgrade",
    wacky: "The ticker offers a visual effect",
    clue: "Astronomers report an ancient manuscript signal",
    headline: "A bulletin is circulating across the galaxy",
    remaining: "next report in",
  },
  es: {
    title: "Eventos",
    description: "El teletipo guardado, sus efectos y el historial reciente.",
    news: "Teletipo",
    activeTitle: "Eventos Activos",
    active: "Efectos activos",
    activeUntil: "Activo Hasta",
    history: "Historial de Eventos",
    claim: "Reclamar",
    claimed: "Reclamado",
    here: "aquí",
    activate: "Activar",
    noActiveEvents: "No hay eventos temporales activos.",
    noCompletedEvents: "Todavía no hay eventos temporales completados.",
    prize: "Un servicio de noticias ofrece un recurso:",
    oneOff: "Un boletín especial ofrece una mejora para esta partida",
    wacky: "El teletipo ofrece un efecto visual",
    clue: "Astrónomos informan de una señal de manuscrito antiguo",
    headline: "Un boletín circula por la galaxia",
    remaining: "próxima noticia en",
  },
  pt: {
    title: "Eventos",
    description: "O ticker guardado, os seus efeitos e o histórico recente.",
    news: "Ticker de notícias",
    activeTitle: "Eventos Ativos",
    active: "Efeitos ativos",
    activeUntil: "Ativo Até",
    history: "Histórico de Eventos",
    claim: "Resgatar",
    claimed: "Resgatado",
    here: "aqui",
    activate: "Ativar",
    noActiveEvents: "Não existem eventos temporários ativos.",
    noCompletedEvents: "Ainda não existem eventos temporários concluídos.",
    prize: "Um serviço de notícias oferece um recurso:",
    oneOff: "Um boletim especial oferece uma melhoria para esta partida",
    wacky: "O ticker oferece um efeito visual",
    clue: "Astrónomos relatam um sinal de manuscrito antigo",
    headline: "Um boletim circula pela galáxia",
    remaining: "próxima notícia em",
  },
  de: {
    title: "Ereignisse",
    description: "Gespeicherter Ticker, Ereigniseffekte und Verlauf.",
    news: "Nachrichtenticker",
    activeTitle: "Aktive Ereignisse",
    active: "Aktive Effekte",
    activeUntil: "Aktiv Bis",
    history: "Ereignisverlauf",
    claim: "Einlösen",
    claimed: "Eingelöst",
    here: "hier",
    activate: "Aktivieren",
    noActiveEvents: "Keine aktiven zeitlich begrenzten Ereignisse.",
    noCompletedEvents: "Noch keine abgeschlossenen zeitlich begrenzten Ereignisse.",
    prize: "Ein Nachrichtendienst bietet eine Ressource an:",
    oneOff: "Eine Sondermeldung bietet eine Verbesserung für diesen Durchlauf",
    wacky: "Der Ticker bietet einen visuellen Effekt",
    clue: "Astronomen melden ein Signal eines alten Manuskripts",
    headline: "Eine Meldung verbreitet sich in der Galaxis",
    remaining: "nächste Meldung in",
  },
  it: {
    title: "Eventi",
    description: "Ticker salvato, effetti degli eventi e cronologia recente.",
    news: "Ticker delle notizie",
    activeTitle: "Eventi Attivi",
    active: "Effetti attivi",
    activeUntil: "Attivo Fino A",
    history: "Cronologia Eventi",
    claim: "Riscatta",
    claimed: "Riscattato",
    here: "qui",
    activate: "Attiva",
    noActiveEvents: "Nessun evento a tempo attivo.",
    noCompletedEvents: "Nessun evento a tempo completato finora.",
    prize: "Un notiziario offre una risorsa:",
    oneOff: "Un bollettino speciale offre un potenziamento per questa partita",
    wacky: "Il ticker offre un effetto visivo",
    clue: "Gli astronomi segnalano un manoscritto antico",
    headline: "Una notizia si diffonde nella galassia",
    remaining: "prossima notizia tra",
  },
  fr: {
    title: "Événements",
    description: "Le fil enregistré, les effets et l’historique récent.",
    news: "Fil d’actualités",
    activeTitle: "Événements Actifs",
    active: "Effets actifs",
    activeUntil: "Actif Jusqu'à",
    history: "Historique des Événements",
    claim: "Récupérer",
    claimed: "Récupéré",
    here: "ici",
    activate: "Activer",
    noActiveEvents: "Aucun événement temporaire actif.",
    noCompletedEvents: "Aucun événement temporaire terminé pour l'instant.",
    prize: "Un service d’actualités offre une ressource :",
    oneOff: "Une annonce spéciale offre une amélioration pour cette partie",
    wacky: "Le fil propose un effet visuel",
    clue: "Des astronomes signalent un manuscrit ancien",
    headline: "Une annonce circule dans la galaxie",
    remaining: "prochaine actualité dans",
  },
};

const eventNames: Record<LocaleId, Record<RandomEventId, string>> = {
  en: {
    powerPlantExplosion: "Power Plant Explosion",
    batteryExplosion: "Battery Explosion",
    scienceTheft: "Science Theft",
    researchBreakthrough: "Research Breakthrough",
    rocketInstantArrival: "Rocket Instant Arrival",
    starshipLostInSpace: "Starship Lost In Space",
    antimatterReaction: "Antimatter Reaction",
    stockLoss: "Stock Loss",
    galacticMarketLockdown: "Galactic Market Lockdown",
    endlessSummer: "Endless Summer",
    minerBrokeDown: "Miner Broke Down",
    supplyChainDisruption: "Supply Chain Disruption",
    blackHoleInstability: "Black Hole Instability",
  },
  es: {
    powerPlantExplosion: "Explosión de planta de energía",
    batteryExplosion: "Explosión de batería",
    scienceTheft: "Robo de ciencia",
    researchBreakthrough: "Avance en investigación",
    rocketInstantArrival: "Llegada instantánea de cohete",
    starshipLostInSpace: "Nave estelar perdida en el espacio",
    antimatterReaction: "Reacción de antimateria",
    stockLoss: "Pérdida en bolsa",
    galacticMarketLockdown: "Confinamiento del mercado galáctico",
    endlessSummer: "Verano eterno",
    minerBrokeDown: "Minero averiado",
    supplyChainDisruption: "Interrupción de la cadena de suministro",
    blackHoleInstability: "Inestabilidad del agujero negro",
  },
  pt: {
    powerPlantExplosion: "Explosão de central elétrica",
    batteryExplosion: "Explosão de bateria",
    scienceTheft: "Roubo de ciência",
    researchBreakthrough: "Avanço na investigação",
    rocketInstantArrival: "Chegada instantânea do foguetão",
    starshipLostInSpace: "Nave estelar perdida no espaço",
    antimatterReaction: "Reação de antimatéria",
    stockLoss: "Perda de stock",
    galacticMarketLockdown: "Encerramento do Mercado Galáctico",
    endlessSummer: "Verão Eterno",
    minerBrokeDown: "Minerador avariado",
    supplyChainDisruption: "Interrupção da cadeia de abastecimento",
    blackHoleInstability: "Instabilidade do buraco negro",
  },
  de: {
    powerPlantExplosion: "Kraftwerks­explosion",
    batteryExplosion: "Batterieexplosion",
    scienceTheft: "Wissenschaftsdiebstahl",
    researchBreakthrough: "Forschungsdurchbruch",
    rocketInstantArrival: "Sofortige Raketenankunft",
    starshipLostInSpace: "Raumschiff im Weltraum verloren",
    antimatterReaction: "Antimateriereaktion",
    stockLoss: "Börsenverlust",
    galacticMarketLockdown: "Galaktischer Markt-Lockdown",
    endlessSummer: "Endloser Sommer",
    minerBrokeDown: "Miner ausgefallen",
    supplyChainDisruption: "Lieferkettenstörung",
    blackHoleInstability: "Schwarzes-Loch-Instabilität",
  },
  it: {
    powerPlantExplosion: "Esplosione della centrale elettrica",
    batteryExplosion: "Esplosione della batteria",
    scienceTheft: "Furto scientifico",
    researchBreakthrough: "Svolta nella ricerca",
    rocketInstantArrival: "Arrivo istantaneo del razzo",
    starshipLostInSpace: "Astronave persa nello spazio",
    antimatterReaction: "Reazione di antimateria",
    stockLoss: "Perdita in borsa",
    galacticMarketLockdown: "Blocco del mercato galattico",
    endlessSummer: "Estate infinita",
    minerBrokeDown: "Minatore guasto",
    supplyChainDisruption: "Interruzione della catena di approvvigionamento",
    blackHoleInstability: "Instabilità del buco nero",
  },
  fr: {
    powerPlantExplosion: "Explosion de centrale électrique",
    batteryExplosion: "Explosion de batterie",
    scienceTheft: "Vol scientifique",
    researchBreakthrough: "Percée de recherche",
    rocketInstantArrival: "Arrivée instantanée de fusée",
    starshipLostInSpace: "Vaisseau stellaire perdu dans l’espace",
    antimatterReaction: "Réaction d’antimatière",
    stockLoss: "Perte en bourse",
    galacticMarketLockdown: "Confinement du marché galactique",
    endlessSummer: "Été sans fin",
    minerBrokeDown: "Mineur en panne",
    supplyChainDisruption: "Perturbation de la chaîne d’approvisionnement",
    blackHoleInstability: "Instabilité du trou noir",
  },
};
export type MetaSignalMessageKey = keyof (typeof messages)["en"];
export function metaSignalText(locale: LocaleId, key: MetaSignalMessageKey): string {
  return messages[locale][key];
}
export function randomEventName(locale: LocaleId, id: RandomEventId): string {
  return eventNames[locale][id];
}
const journalLabels: Record<
  LocaleId,
  {
    ago: string;
    eventProbabilities: string;
    totalDuration: string;
    instantDuration: string;
    categories: Record<NewsCategory, string>;
  }
> = {
  en: {
    ago: "ago",
    eventProbabilities: "event probabilities",
    totalDuration: "Total Duration",
    instantDuration: "Instant",
    categories: {
      wacky: "Wacky",
      prize: "Prize",
      oneOff: "Special bulletin",
      manuscriptClue: "Manuscript clue",
      headline: "Headline",
    },
  },
  es: {
    ago: "hace",
    eventProbabilities: "probabilidades de eventos",
    totalDuration: "Duración Total",
    instantDuration: "Instantáneo",
    categories: {
      wacky: "Insólita",
      prize: "Premio",
      oneOff: "Boletín especial",
      manuscriptClue: "Pista de manuscrito",
      headline: "Titular",
    },
  },
  pt: {
    ago: "atrás",
    eventProbabilities: "probabilidades de eventos",
    totalDuration: "Duração Total",
    instantDuration: "Instantâneo",
    categories: {
      wacky: "Insólita",
      prize: "Prêmio",
      oneOff: "Boletim especial",
      manuscriptClue: "Pista de manuscrito",
      headline: "Manchete",
    },
  },
  de: {
    ago: "zuvor",
    eventProbabilities: "Ereigniswahrscheinlichkeiten",
    totalDuration: "Gesamtdauer",
    instantDuration: "Sofort",
    categories: {
      wacky: "Verrückt",
      prize: "Preis",
      oneOff: "Sondermeldung",
      manuscriptClue: "Manuskripthinweis",
      headline: "Schlagzeile",
    },
  },
  it: {
    ago: "fa",
    eventProbabilities: "probabilità degli eventi",
    totalDuration: "Durata Totale",
    instantDuration: "Istantaneo",
    categories: {
      wacky: "Bizzarra",
      prize: "Premio",
      oneOff: "Bollettino speciale",
      manuscriptClue: "Indizio sul manoscritto",
      headline: "Titolo",
    },
  },
  fr: {
    ago: "auparavant",
    eventProbabilities: "probabilités des événements",
    totalDuration: "Durée Totale",
    instantDuration: "Instantané",
    categories: {
      wacky: "Insolite",
      prize: "Prix",
      oneOff: "Bulletin spécial",
      manuscriptClue: "Indice de manuscrit",
      headline: "À la une",
    },
  },
};
export function journalLabel(
  locale: LocaleId,
  key: "ago" | "eventProbabilities" | "totalDuration" | "instantDuration",
): string {
  return journalLabels[locale][key];
}
export function newsCategoryName(locale: LocaleId, category: NewsCategory): string {
  return journalLabels[locale].categories[category];
}
let starNames: Map<string, string> | null = null;

function starNameForSystem(systemId: string | null | undefined): string | undefined {
  if (!systemId) return undefined;
  starNames ??= new Map(
    createStarCatalogue(GALAXY_SEED_DEFAULT).map((star) => [star.id, star.name] as const),
  );
  return starNames.get(systemId);
}

export function newsEntryText(
  locale: LocaleId,
  entry: NewsTickerEntry,
  copy?: LocaleNewsCopy,
  formatQuantity: (value: number) => string = (value) =>
    new Intl.NumberFormat(locale).format(value),
): string {
  if (!copy) {
    if (entry.category === "prize") {
      const amount =
        typeof entry.prizeAmount === "number" ? `${formatQuantity(entry.prizeAmount)} ` : "";
      return `${messages[locale].prize} ${amount}${entry.prizeGoodId ?? ""} ${messages[locale].here}.`;
    }
    if (entry.category === "oneOff") return `${messages[locale].oneOff} ${messages[locale].here}.`;
    if (entry.category === "wacky") return messages[locale].wacky;
    if (entry.category === "manuscriptClue") return messages[locale].clue;
    return messages[locale].headline;
  }
  if (entry.category === "prize") {
    if (typeof entry.prizeAmount !== "number")
      return `${messages[locale].prize} ${entry.prizeGoodId ?? ""}.`;
    const template = copy.prizes[entry.id - 2000];
    return template
      ? template.replace("{amount}", formatQuantity(entry.prizeAmount)).replace("{here}", copy.here)
      : `${messages[locale].prize} ${entry.prizeGoodId ?? ""}.`;
  }
  if (entry.category === "oneOff")
    return (copy.oneOffs[entry.id - 3000] ?? `${messages[locale].oneOff}.`)
      .replace("{here}", copy.here)
      .replace("{ap}", formatQuantity(entry.prizeAmount ?? 1));
  if (entry.category === "wacky")
    return copy.wackyEffects[entry.id - 1000] ?? messages[locale].wacky;
  if (entry.category === "manuscriptClue") {
    const template = copy.manuscriptClues[entry.id - 4000];
    const starName = starNameForSystem(entry.clueSystemId);
    return template && starName ? template.replaceAll("{STAR}", starName) : messages[locale].clue;
  }
  return copy.headlines[entry.id] ?? messages[locale].headline;
}

export const LOCALIZATION_VALIDATION_DATA = { messages, eventNames, journalLabels } as const;
