import type { LocaleId } from "../content/ids";
import type { RandomEventHistoryEntry, RandomEventId } from "../content/metaSignals";
import { randomEventName } from "./metaSignalMessages";
import { localizedRocketUserName } from "./rocketMessages";

type RandomEventTriggerMessageKey =
  | "generic"
  | "starshipLost"
  | "marketOffline"
  | "endlessSummer"
  | "minerBrokeDown"
  | "supplyChainDisruption"
  | "blackHoleInstability";

const messages: Record<LocaleId, Record<RandomEventTriggerMessageKey, string>> = {
  en: {
    generic: "Random Event: {eventName}",
    starshipLost: "Random Event: Starship lost in space",
    marketOffline: "Random Event: Galactic Market offline (30 minutes)",
    endlessSummer: "Random Event: Endless Summer ({minutes} minutes)",
    minerBrokeDown: "Random Event: Miner broke down ({rocketName})",
    supplyChainDisruption: "Random Event: Supply Chain Disruption ({itemName})",
    blackHoleInstability: "Random Event: Black Hole Instability ({minutes} minutes)",
  },
  es: {
    generic: "Evento aleatorio: {eventName}",
    starshipLost: "Evento aleatorio: nave estelar perdida en el espacio",
    marketOffline: "Evento aleatorio: Mercado Galáctico fuera de servicio (30 minutos)",
    endlessSummer: "Evento aleatorio: Verano Eterno ({minutes} minutos)",
    minerBrokeDown: "Evento aleatorio: minero averiado ({rocketName})",
    supplyChainDisruption: "Evento aleatorio: interrupción de la cadena de suministro ({itemName})",
    blackHoleInstability: "Evento aleatorio: inestabilidad del Agujero Negro ({minutes} minutos)",
  },
  pt: {
    generic: "Evento aleatório: {eventName}",
    starshipLost: "Evento aleatório: nave estelar perdida no espaço",
    marketOffline: "Evento aleatório: Mercado Galáctico indisponível (30 minutos)",
    endlessSummer: "Evento aleatório: Verão Eterno ({minutes} minutos)",
    minerBrokeDown: "Evento aleatório: minerador avariado ({rocketName})",
    supplyChainDisruption: "Evento aleatório: interrupção da cadeia de abastecimento ({itemName})",
    blackHoleInstability: "Evento aleatório: instabilidade do Buraco Negro ({minutes} minutos)",
  },
  de: {
    generic: "Zufallsereignis: {eventName}",
    starshipLost: "Zufallsereignis: Raumschiff im All verloren",
    marketOffline: "Zufallsereignis: Galaktischer Markt offline (30 Minuten)",
    endlessSummer: "Zufallsereignis: Endloser Sommer ({minutes} Minuten)",
    minerBrokeDown: "Zufallsereignis: Bergbauschiff ausgefallen ({rocketName})",
    supplyChainDisruption: "Zufallsereignis: Störung der Lieferkette ({itemName})",
    blackHoleInstability: "Zufallsereignis: Instabilität des Schwarzen Lochs ({minutes} Minuten)",
  },
  it: {
    generic: "Evento casuale: {eventName}",
    starshipLost: "Evento casuale: astronave perduta nello spazio",
    marketOffline: "Evento casuale: Mercato Galattico offline (30 minuti)",
    endlessSummer: "Evento casuale: Estate Infinita ({minutes} minuti)",
    minerBrokeDown: "Evento casuale: minatore guasto ({rocketName})",
    supplyChainDisruption:
      "Evento casuale: interruzione della catena di approvvigionamento ({itemName})",
    blackHoleInstability: "Evento casuale: instabilità del Buco Nero ({minutes} minuti)",
  },
  fr: {
    generic: "Événement aléatoire: {eventName}",
    starshipLost: "Événement aléatoire: vaisseau perdu dans l'espace",
    marketOffline: "Événement aléatoire: Marché Galactique hors ligne (30 minutes)",
    endlessSummer: "Événement aléatoire: Été Sans Fin ({minutes} minutes)",
    minerBrokeDown: "Événement aléatoire: mineur en panne ({rocketName})",
    supplyChainDisruption:
      "Événement aléatoire: rupture de la chaîne d'approvisionnement ({itemName})",
    blackHoleInstability: "Événement aléatoire: instabilité du Trou Noir ({minutes} minutes)",
  },
};

function formatMessage(
  locale: LocaleId,
  key: RandomEventTriggerMessageKey,
  values: Readonly<Record<string, string>> = {},
): string {
  return messages[locale][key].replace(
    /\{([^{}]+)\}/g,
    (placeholder, name: string) => values[name] ?? placeholder,
  );
}

function genericMessage(locale: LocaleId, id: RandomEventId): string {
  return formatMessage(locale, "generic", { eventName: randomEventName(locale, id) });
}

export function randomEventTriggerNotificationText(
  locale: LocaleId,
  id: RandomEventId,
  entry?: RandomEventHistoryEntry,
  itemName?: string,
): string {
  switch (id) {
    case "starshipLostInSpace":
      return formatMessage(locale, "starshipLost");
    case "galacticMarketLockdown":
      return formatMessage(locale, "marketOffline");
    case "endlessSummer":
      return entry?.durationMs && entry.durationMs > 0
        ? formatMessage(locale, "endlessSummer", {
            minutes: String(Math.round(entry.durationMs / 60_000)),
          })
        : genericMessage(locale, id);
    case "minerBrokeDown":
      return entry?.details?.kind === "minerBrokeDown"
        ? formatMessage(locale, "minerBrokeDown", {
            rocketName: localizedRocketUserName(locale, entry.details.rocketName),
          })
        : genericMessage(locale, id);
    case "supplyChainDisruption":
      return entry?.details?.kind === "supplyChainDisruption" && itemName
        ? formatMessage(locale, "supplyChainDisruption", {
            itemName,
          })
        : genericMessage(locale, id);
    case "blackHoleInstability":
      return entry?.durationMs && entry.durationMs > 0
        ? formatMessage(locale, "blackHoleInstability", {
            minutes: String(Math.round(entry.durationMs / 60_000)),
          })
        : genericMessage(locale, id);
    default:
      return genericMessage(locale, id);
  }
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
