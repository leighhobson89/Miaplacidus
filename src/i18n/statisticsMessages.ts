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

export type RunStatisticLabelId =
  | "runTime"
  | "starSystem"
  | "currentWeather"
  | "cash"
  | "apAnticipated"
  | "antimatter"
  | "currentSnapshotSection"
  | "notTracked";

const runStatisticLabels: Record<LocaleId, Record<RunStatisticLabelId, string>> = {
  en: {
    runTime: "Run time",
    starSystem: "Star system",
    currentWeather: "Current weather",
    cash: "Cash",
    apAnticipated: "AP anticipated",
    antimatter: "Antimatter",
    currentSnapshotSection: "Current snapshot",
    notTracked: "Not tracked",
  },
  es: {
    runTime: "Tiempo de partida",
    starSystem: "Sistema estelar",
    currentWeather: "Clima actual",
    cash: "Dinero",
    apAnticipated: "AP previstos",
    antimatter: "Antimateria",
    currentSnapshotSection: "Estado actual",
    notTracked: "No registrado",
  },
  pt: {
    runTime: "Tempo da partida",
    starSystem: "Sistema estelar",
    currentWeather: "Clima atual",
    cash: "Dinheiro",
    apAnticipated: "AP previstos",
    antimatter: "Antimat\u00e9ria",
    currentSnapshotSection: "Estado atual",
    notTracked: "N\u00e3o acompanhado",
  },
  de: {
    runTime: "Laufzeit",
    starSystem: "Sternsystem",
    currentWeather: "Aktuelles Wetter",
    cash: "Bargeld",
    apAnticipated: "Erwartete AP",
    antimatter: "Antimaterie",
    currentSnapshotSection: "Momentaufnahme",
    notTracked: "Nicht erfasst",
  },
  it: {
    runTime: "Durata della partita",
    starSystem: "Sistema stellare",
    currentWeather: "Meteo attuale",
    cash: "Denaro",
    apAnticipated: "AP previsti",
    antimatter: "Antimateria",
    currentSnapshotSection: "Situazione attuale",
    notTracked: "Non registrato",
  },
  fr: {
    runTime: "Dur\u00e9e de la partie",
    starSystem: "Syst\u00e8me stellaire",
    currentWeather: "M\u00e9t\u00e9o actuelle",
    cash: "Argent",
    apAnticipated: "AP anticip\u00e9s",
    antimatter: "Antimati\u00e8re",
    currentSnapshotSection: "\u00c9tat actuel",
    notTracked: "Non suivi",
  },
};

const runApTrackingNotes: Record<LocaleId, string> = {
  en: "AP anticipated is not tracked separately in the current run data.",
  es: "Los AP previstos no se registran por separado en los datos de la partida actual.",
  pt: "Os AP previstos n\u00e3o s\u00e3o registados separadamente nos dados da partida atual.",
  de: "Erwartete AP werden in den Daten des aktuellen Durchlaufs nicht getrennt erfasst.",
  it: "Gli AP previsti non sono registrati separatamente nei dati della partita attuale.",
  fr: "Les AP anticip\u00e9s ne sont pas enregistr\u00e9s s\u00e9par\u00e9ment dans les donn\u00e9es de la partie actuelle.",
};

export function runStatisticLabel(locale: LocaleId, id: RunStatisticLabelId): string {
  return runStatisticLabels[locale][id];
}

export function runApTrackingNote(locale: LocaleId): string {
  return runApTrackingNotes[locale];
}

export type OverviewStatisticLabelId =
  | "apGain"
  | "uniqueNewsTickers"
  | "tickerPrizes"
  | "totalAsteroids"
  | "legendaryAsteroids"
  | "rocketsLaunched"
  | "starshipsLaunched";

const overviewStatisticLabels: Record<LocaleId, Record<OverviewStatisticLabelId, string>> = {
  en: {
    apGain: "AP Gain",
    uniqueNewsTickers: "Unique News Tickers Seen",
    tickerPrizes: "News Ticker Prizes Collected",
    totalAsteroids: "Total Asteroids Discovered",
    legendaryAsteroids: "Legendary Asteroids Discovered",
    rocketsLaunched: "Rockets Launched",
    starshipsLaunched: "Star Ships Launched",
  },
  es: {
    apGain: "Ganancia de AP",
    uniqueNewsTickers: "Noticias \u00fanicas vistas",
    tickerPrizes: "Premios de noticias recogidos",
    totalAsteroids: "Asteroides totales descubiertos",
    legendaryAsteroids: "Asteroides legendarios descubiertos",
    rocketsLaunched: "Cohetes lanzados",
    starshipsLaunched: "Naves estelares lanzadas",
  },
  pt: {
    apGain: "Ganho de AP",
    uniqueNewsTickers: "Not\u00edcias \u00fanicas vistas",
    tickerPrizes: "Pr\u00eamios de not\u00edcias coletados",
    totalAsteroids: "Total de asteroides descobertos",
    legendaryAsteroids: "Asteroides lend\u00e1rios descobertos",
    rocketsLaunched: "Foguetes lan\u00e7ados",
    starshipsLaunched: "Naves estelares lan\u00e7adas",
  },
  de: {
    apGain: "AP-Zuwachs",
    uniqueNewsTickers: "Einzigartige News-Ticker gesehen",
    tickerPrizes: "News-Ticker-Belohnungen gesammelt",
    totalAsteroids: "Asteroiden insgesamt entdeckt",
    legendaryAsteroids: "Legend\u00e4re Asteroiden entdeckt",
    rocketsLaunched: "Raketen gestartet",
    starshipsLaunched: "Raumschiffe gestartet",
  },
  it: {
    apGain: "Guadagno di AP",
    uniqueNewsTickers: "Ticker di notizie unici visti",
    tickerPrizes: "Premi dei ticker di notizie raccolti",
    totalAsteroids: "Asteroidi totali scoperti",
    legendaryAsteroids: "Asteroidi leggendari scoperti",
    rocketsLaunched: "Razzi lanciati",
    starshipsLaunched: "Astronavi lanciate",
  },
  fr: {
    apGain: "Gain d\u2019AP",
    uniqueNewsTickers: "Bandeaux d\u2019actualit\u00e9s uniques vus",
    tickerPrizes: "R\u00e9compenses de bandeaux d\u2019actualit\u00e9s collect\u00e9es",
    totalAsteroids: "Ast\u00e9ro\u00efdes d\u00e9couverts au total",
    legendaryAsteroids: "Ast\u00e9ro\u00efdes l\u00e9gendaires d\u00e9couverts",
    rocketsLaunched: "Fus\u00e9es lanc\u00e9es",
    starshipsLaunched: "Vaisseaux stellaires lanc\u00e9s",
  },
};

export function overviewStatisticLabel(locale: LocaleId, id: OverviewStatisticLabelId): string {
  return overviewStatisticLabels[locale][id];
}
