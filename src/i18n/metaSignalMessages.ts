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
    events: string;
    active: string;
    history: string;
    claim: string;
    claimed: string;
    here: string;
    activate: string;
    noEvents: string;
    prize: string;
    oneOff: string;
    wacky: string;
    clue: string;
    headline: string;
    remaining: string;
  }
> = {
  en: {
    title: "News & Events",
    description: "The saved ticker, event effects, and recent history.",
    news: "News ticker",
    events: "Random events",
    active: "Active effects",
    history: "Event history",
    claim: "Claim",
    claimed: "Claimed",
    here: "here",
    activate: "Activate",
    noEvents: "No random events have occurred.",
    prize: "A news service has a resource grant for",
    oneOff: "A special bulletin offers a permanent run upgrade",
    wacky: "The ticker offers a visual effect",
    clue: "Astronomers report an ancient manuscript signal",
    headline: "A bulletin is circulating across the galaxy",
    remaining: "next report in",
  },
  es: {
    title: "Noticias y eventos",
    description: "El teletipo guardado, sus efectos y el historial reciente.",
    news: "Teletipo",
    events: "Eventos aleatorios",
    active: "Efectos activos",
    history: "Historial de eventos",
    claim: "Reclamar",
    claimed: "Reclamado",
    here: "aquí",
    activate: "Activar",
    noEvents: "Aún no han ocurrido eventos aleatorios.",
    prize: "Un servicio de noticias ofrece un recurso:",
    oneOff: "Un boletín especial ofrece una mejora para esta partida",
    wacky: "El teletipo ofrece un efecto visual",
    clue: "Astrónomos informan de una señal de manuscrito antiguo",
    headline: "Un boletín circula por la galaxia",
    remaining: "próxima noticia en",
  },
  pt: {
    title: "Notícias e eventos",
    description: "O ticker guardado, os seus efeitos e o histórico recente.",
    news: "Ticker de notícias",
    events: "Eventos aleatórios",
    active: "Efeitos ativos",
    history: "Histórico de eventos",
    claim: "Resgatar",
    claimed: "Resgatado",
    here: "aqui",
    activate: "Ativar",
    noEvents: "Ainda não ocorreram eventos aleatórios.",
    prize: "Um serviço de notícias oferece um recurso:",
    oneOff: "Um boletim especial oferece uma melhoria para esta partida",
    wacky: "O ticker oferece um efeito visual",
    clue: "Astrónomos relatam um sinal de manuscrito antigo",
    headline: "Um boletim circula pela galáxia",
    remaining: "próxima notícia em",
  },
  de: {
    title: "Nachrichten & Ereignisse",
    description: "Gespeicherter Ticker, Ereigniseffekte und Verlauf.",
    news: "Nachrichtenticker",
    events: "Zufallsereignisse",
    active: "Aktive Effekte",
    history: "Ereignisverlauf",
    claim: "Einlösen",
    claimed: "Eingelöst",
    here: "hier",
    activate: "Aktivieren",
    noEvents: "Es gab noch keine Zufallsereignisse.",
    prize: "Ein Nachrichtendienst bietet eine Ressource an:",
    oneOff: "Eine Sondermeldung bietet eine Verbesserung für diesen Durchlauf",
    wacky: "Der Ticker bietet einen visuellen Effekt",
    clue: "Astronomen melden ein Signal eines alten Manuskripts",
    headline: "Eine Meldung verbreitet sich in der Galaxis",
    remaining: "nächste Meldung in",
  },
  it: {
    title: "Notizie ed eventi",
    description: "Ticker salvato, effetti degli eventi e cronologia recente.",
    news: "Ticker delle notizie",
    events: "Eventi casuali",
    active: "Effetti attivi",
    history: "Cronologia eventi",
    claim: "Riscatta",
    claimed: "Riscattato",
    here: "qui",
    activate: "Attiva",
    noEvents: "Non si sono ancora verificati eventi casuali.",
    prize: "Un notiziario offre una risorsa:",
    oneOff: "Un bollettino speciale offre un potenziamento per questa partita",
    wacky: "Il ticker offre un effetto visivo",
    clue: "Gli astronomi segnalano un manoscritto antico",
    headline: "Una notizia si diffonde nella galassia",
    remaining: "prossima notizia tra",
  },
  fr: {
    title: "Actualités et événements",
    description: "Le fil enregistré, les effets et l’historique récent.",
    news: "Fil d’actualités",
    events: "Événements aléatoires",
    active: "Effets actifs",
    history: "Historique des événements",
    claim: "Récupérer",
    claimed: "Récupéré",
    here: "ici",
    activate: "Activer",
    noEvents: "Aucun événement aléatoire ne s’est encore produit.",
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
    powerPlantExplosion: "Power plant explosion",
    batteryExplosion: "Battery explosion",
    scienceTheft: "Science theft",
    researchBreakthrough: "Research breakthrough",
    rocketInstantArrival: "Instant rocket arrival",
    starshipLostInSpace: "Starship lost in space",
    antimatterReaction: "Antimatter reaction",
    stockLoss: "Stock loss",
    galacticMarketLockdown: "Galactic market lockdown",
    endlessSummer: "Endless summer",
    minerBrokeDown: "Miner breakdown",
    supplyChainDisruption: "Supply chain disruption",
    blackHoleInstability: "Black hole instability",
  },
  es: {
    powerPlantExplosion: "Explosión de planta eléctrica",
    batteryExplosion: "Explosión de batería",
    scienceTheft: "Robo de ciencia",
    researchBreakthrough: "Avance científico",
    rocketInstantArrival: "Llegada inmediata de cohete",
    starshipLostInSpace: "Nave perdida en el espacio",
    antimatterReaction: "Reacción de antimateria",
    stockLoss: "Pérdida de existencias",
    galacticMarketLockdown: "Cierre del mercado galáctico",
    endlessSummer: "Verano interminable",
    minerBrokeDown: "Avería minera",
    supplyChainDisruption: "Interrupción de suministros",
    blackHoleInstability: "Inestabilidad del agujero negro",
  },
  pt: {
    powerPlantExplosion: "Explosão de usina elétrica",
    batteryExplosion: "Explosão de bateria",
    scienceTheft: "Roubo científico",
    researchBreakthrough: "Avanço científico",
    rocketInstantArrival: "Chegada imediata de foguete",
    starshipLostInSpace: "Nave perdida no espaço",
    antimatterReaction: "Reação de antimatéria",
    stockLoss: "Perda de estoque",
    galacticMarketLockdown: "Bloqueio do mercado galáctico",
    endlessSummer: "Verão sem fim",
    minerBrokeDown: "Falha na mineração",
    supplyChainDisruption: "Interrupção da cadeia de suprimentos",
    blackHoleInstability: "Instabilidade do buraco negro",
  },
  de: {
    powerPlantExplosion: "Kraftwerksexplosion",
    batteryExplosion: "Batterieexplosion",
    scienceTheft: "Wissenschaftsdiebstahl",
    researchBreakthrough: "Forschungsdurchbruch",
    rocketInstantArrival: "Sofortige Raketenankunft",
    starshipLostInSpace: "Raumschiff im All verloren",
    antimatterReaction: "Antimateriereaktion",
    stockLoss: "Lagerverlust",
    galacticMarketLockdown: "Galaktische Marktsperre",
    endlessSummer: "Endloser Sommer",
    minerBrokeDown: "Bergbauausfall",
    supplyChainDisruption: "Lieferkettenstörung",
    blackHoleInstability: "Instabiles Schwarzes Loch",
  },
  it: {
    powerPlantExplosion: "Esplosione della centrale",
    batteryExplosion: "Esplosione della batteria",
    scienceTheft: "Furto di scienza",
    researchBreakthrough: "Scoperta scientifica",
    rocketInstantArrival: "Arrivo immediato del razzo",
    starshipLostInSpace: "Nave perduta nello spazio",
    antimatterReaction: "Reazione di antimateria",
    stockLoss: "Perdita di scorte",
    galacticMarketLockdown: "Blocco del mercato galattico",
    endlessSummer: "Estate infinita",
    minerBrokeDown: "Guasto minerario",
    supplyChainDisruption: "Interruzione della catena di fornitura",
    blackHoleInstability: "Instabilità del buco nero",
  },
  fr: {
    powerPlantExplosion: "Explosion de centrale",
    batteryExplosion: "Explosion de batterie",
    scienceTheft: "Vol de connaissances",
    researchBreakthrough: "Percée scientifique",
    rocketInstantArrival: "Arrivée immédiate d’une fusée",
    starshipLostInSpace: "Vaisseau perdu dans l’espace",
    antimatterReaction: "Réaction d’antimatière",
    stockLoss: "Perte de stock",
    galacticMarketLockdown: "Blocage du marché galactique",
    endlessSummer: "Été sans fin",
    minerBrokeDown: "Panne minière",
    supplyChainDisruption: "Rupture de la chaîne d’approvisionnement",
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
  { ago: string; eventProbabilities: string; categories: Record<NewsCategory, string> }
> = {
  en: {
    ago: "ago",
    eventProbabilities: "event probabilities",
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
    categories: {
      wacky: "Insolite",
      prize: "Prix",
      oneOff: "Bulletin spécial",
      manuscriptClue: "Indice de manuscrit",
      headline: "À la une",
    },
  },
};
export function journalLabel(locale: LocaleId, key: "ago" | "eventProbabilities"): string {
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
): string {
  if (!copy) {
    if (entry.category === "prize") {
      const amount =
        typeof entry.prizeAmount === "number"
          ? `${new Intl.NumberFormat(locale).format(entry.prizeAmount)} `
          : "";
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
      ? template
          .replace("{amount}", new Intl.NumberFormat(locale).format(entry.prizeAmount))
          .replace("{here}", copy.here)
      : `${messages[locale].prize} ${entry.prizeGoodId ?? ""}.`;
  }
  if (entry.category === "oneOff")
    return (copy.oneOffs[entry.id - 3000] ?? `${messages[locale].oneOff}.`)
      .replace("{here}", copy.here)
      .replace("{ap}", new Intl.NumberFormat(locale).format(1));
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
