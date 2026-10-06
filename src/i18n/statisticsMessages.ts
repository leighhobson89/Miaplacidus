import type { LocaleId } from "../content/ids";

const eventTrackingNotes: Record<LocaleId, string> = {
  en: "Saved runs restore up to 100 recent event records. All-time counts start from this update.",
  es: "Las partidas guardadas recuperan hasta 100 eventos recientes. El total histórico empieza con esta actualización.",
  pt: "As partidas guardadas recuperam até 100 eventos recentes. O total histórico começa com esta atualização.",
  de: "Gespeicherte Spielstände stellen bis zu 100 letzte Ereignisse wieder her. Gesamtzähler beginnen mit diesem Update.",
  it: "I salvataggi ripristinano fino a 100 eventi recenti. I totali complessivi partono da questo aggiornamento.",
  fr: "Les sauvegardes restaurent jusqu’à 100 événements récents. Les totaux cumulés commencent avec cette mise à jour.",
};

export function eventTrackingNote(locale: LocaleId): string {
  return eventTrackingNotes[locale];
}

const cosmicRipTrackingNotes: Record<LocaleId, string> = {
  en: "Lifetime GP spent and telemetry earned start tracking with this update; earlier history is unavailable.",
  es: "El seguimiento de los GP gastados y los datos de telemetría obtenidos empieza con esta actualización; no hay datos anteriores.",
  pt: "O registo dos GP gastos e dos dados de telemetria obtidos começa com esta atualização; não há histórico anterior.",
  de: "Die Erfassung ausgegebener GP und verdienter Telemetriedaten beginnt mit diesem Update; frühere Verlaufsdaten sind nicht verfügbar.",
  it: "Il conteggio dei GP spesi e dei dati telemetrici ottenuti inizia con questo aggiornamento; lo storico precedente non è disponibile.",
  fr: "Le suivi des GP dépensés et des données de télémétrie gagnées commence avec cette mise à jour ; l’historique antérieur est indisponible.",
};

const energyTrackingNotes: Record<LocaleId, string> = {
  en: "Energy trip and building totals start tracking with this update; earlier history is unavailable.",
  es: "El recuento de cortes eléctricos y construcciones empieza con esta actualización; no hay datos anteriores.",
  pt: "O registo de cortes de energia e construções começa com esta atualização; não há dados anteriores.",
  de: "Die Erfassung von Stromausfällen und Gebäuden beginnt mit diesem Update; frühere Verlaufsdaten sind nicht verfügbar.",
  it: "Il conteggio delle interruzioni e degli edifici inizia con questo aggiornamento; lo storico precedente non è disponibile.",
  fr: "Le suivi des coupures et des bâtiments commence avec cette mise à jour ; l’historique antérieur est indisponible.",
};

export function energyTrackingNote(locale: LocaleId): string {
  return energyTrackingNotes[locale];
}

export function cosmicRipTrackingNote(locale: LocaleId): string {
  return cosmicRipTrackingNotes[locale];
}

export type RunStatisticLabelId =
  | "runTime"
  | "starSystem"
  | "currentWeather"
  | "cash"
  | "apAnticipated"
  | "antimatter"
  | "currentSnapshotSection";

const runStatisticLabels: Record<LocaleId, Record<RunStatisticLabelId, string>> = {
  en: {
    runTime: "Run time",
    starSystem: "Star system",
    currentWeather: "Current weather",
    cash: "Cash",
    apAnticipated: "AP anticipated",
    antimatter: "Antimatter",
    currentSnapshotSection: "Current snapshot",
  },
  es: {
    runTime: "Tiempo de partida",
    starSystem: "Sistema estelar",
    currentWeather: "Clima actual",
    cash: "Dinero",
    apAnticipated: "AP previstos",
    antimatter: "Antimateria",
    currentSnapshotSection: "Estado actual",
  },
  pt: {
    runTime: "Tempo da partida",
    starSystem: "Sistema estelar",
    currentWeather: "Clima atual",
    cash: "Dinheiro",
    apAnticipated: "AP previstos",
    antimatter: "Antimat\u00e9ria",
    currentSnapshotSection: "Estado atual",
  },
  de: {
    runTime: "Laufzeit",
    starSystem: "Sternsystem",
    currentWeather: "Aktuelles Wetter",
    cash: "Bargeld",
    apAnticipated: "Erwartete AP",
    antimatter: "Antimaterie",
    currentSnapshotSection: "Momentaufnahme",
  },
  it: {
    runTime: "Durata della partita",
    starSystem: "Sistema stellare",
    currentWeather: "Meteo attuale",
    cash: "Denaro",
    apAnticipated: "AP previsti",
    antimatter: "Antimateria",
    currentSnapshotSection: "Situazione attuale",
  },
  fr: {
    runTime: "Dur\u00e9e de la partie",
    starSystem: "Syst\u00e8me stellaire",
    currentWeather: "M\u00e9t\u00e9o actuelle",
    cash: "Argent",
    apAnticipated: "AP anticip\u00e9s",
    antimatter: "Antimati\u00e8re",
    currentSnapshotSection: "\u00c9tat actuel",
  },
};

export function runStatisticLabel(locale: LocaleId, id: RunStatisticLabelId): string {
  return runStatisticLabels[locale][id];
}

export type OverviewStatisticLabelId =
  | "apGain"
  | "uniqueNewsTickers"
  | "tickerPrizes"
  | "totalAsteroids"
  | "legendaryAsteroids"
  | "rocketsLaunched"
  | "starshipsLaunched"
  | "cosmicRipGpSpent"
  | "cosmicRipTelemetryEarned";

const overviewStatisticLabels: Record<LocaleId, Record<OverviewStatisticLabelId, string>> = {
  en: {
    apGain: "AP Gain",
    uniqueNewsTickers: "Unique News Tickers Seen",
    tickerPrizes: "News Ticker Prizes Collected",
    totalAsteroids: "Total Asteroids Discovered",
    legendaryAsteroids: "Legendary Asteroids Discovered",
    rocketsLaunched: "Rockets Launched",
    starshipsLaunched: "Star Ships Launched",
    cosmicRipGpSpent: "Lifetime GP Spent in Cosmic Rip",
    cosmicRipTelemetryEarned: "Lifetime Cosmic Rip Telemetry Data Earned",
  },
  es: {
    apGain: "Ganancia de AP",
    uniqueNewsTickers: "Noticias \u00fanicas vistas",
    tickerPrizes: "Premios de noticias recogidos",
    totalAsteroids: "Asteroides totales descubiertos",
    legendaryAsteroids: "Asteroides legendarios descubiertos",
    rocketsLaunched: "Cohetes lanzados",
    starshipsLaunched: "Naves estelares lanzadas",
    cosmicRipGpSpent: "GP gastados en Cosmic Rip (total)",
    cosmicRipTelemetryEarned: "Datos de telemetría del Cosmic Rip obtenidos (total)",
  },
  pt: {
    apGain: "Ganho de AP",
    uniqueNewsTickers: "Not\u00edcias \u00fanicas vistas",
    tickerPrizes: "Pr\u00eamios de not\u00edcias coletados",
    totalAsteroids: "Total de asteroides descobertos",
    legendaryAsteroids: "Asteroides lend\u00e1rios descobertos",
    rocketsLaunched: "Foguetes lan\u00e7ados",
    starshipsLaunched: "Naves estelares lan\u00e7adas",
    cosmicRipGpSpent: "GP gastos no Cosmic Rip (total)",
    cosmicRipTelemetryEarned: "Dados de telemetria do Cosmic Rip obtidos (total)",
  },
  de: {
    apGain: "AP-Zuwachs",
    uniqueNewsTickers: "Einzigartige News-Ticker gesehen",
    tickerPrizes: "News-Ticker-Belohnungen gesammelt",
    totalAsteroids: "Asteroiden insgesamt entdeckt",
    legendaryAsteroids: "Legend\u00e4re Asteroiden entdeckt",
    rocketsLaunched: "Raketen gestartet",
    starshipsLaunched: "Raumschiffe gestartet",
    cosmicRipGpSpent: "Insgesamt für Cosmic Rip ausgegebene GP",
    cosmicRipTelemetryEarned: "Insgesamt verdiente Cosmic-Rip-Telemetriedaten",
  },
  it: {
    apGain: "Guadagno di AP",
    uniqueNewsTickers: "Ticker di notizie unici visti",
    tickerPrizes: "Premi dei ticker di notizie raccolti",
    totalAsteroids: "Asteroidi totali scoperti",
    legendaryAsteroids: "Asteroidi leggendari scoperti",
    rocketsLaunched: "Razzi lanciati",
    starshipsLaunched: "Astronavi lanciate",
    cosmicRipGpSpent: "GP totali spesi nel Cosmic Rip",
    cosmicRipTelemetryEarned: "Dati telemetrici totali ottenuti dal Cosmic Rip",
  },
  fr: {
    apGain: "Gain d\u2019AP",
    uniqueNewsTickers: "Bandeaux d\u2019actualit\u00e9s uniques vus",
    tickerPrizes: "R\u00e9compenses de bandeaux d\u2019actualit\u00e9s collect\u00e9es",
    totalAsteroids: "Ast\u00e9ro\u00efdes d\u00e9couverts au total",
    legendaryAsteroids: "Ast\u00e9ro\u00efdes l\u00e9gendaires d\u00e9couverts",
    rocketsLaunched: "Fus\u00e9es lanc\u00e9es",
    starshipsLaunched: "Vaisseaux stellaires lanc\u00e9s",
    cosmicRipGpSpent: "Total des GP dépensés dans la Cosmic Rip",
    cosmicRipTelemetryEarned: "Total des données de télémétrie gagnées dans la Cosmic Rip",
  },
};

export function overviewStatisticLabel(locale: LocaleId, id: OverviewStatisticLabelId): string {
  return overviewStatisticLabels[locale][id];
}
