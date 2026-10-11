import type { LocaleId } from "../content/ids";
import type { RandomEventId } from "../content/metaSignals";

const messages: Record<LocaleId, Partial<Record<RandomEventId, string>>> = {
  en: {
    galacticMarketLockdown: "Galactic Market access restored.",
    endlessSummer: "Endless Summer has ended.",
    minerBrokeDown: "Mining operations restored.",
    supplyChainDisruption: "Supply chains restored.",
    blackHoleInstability: "Black Hole Instability stabilised.",
  },
  es: {
    galacticMarketLockdown: "Acceso al Mercado Galáctico restaurado.",
    endlessSummer: "El Verano Eterno ha terminado.",
    minerBrokeDown: "Operaciones de minería restauradas.",
    supplyChainDisruption: "Cadenas de suministro restauradas.",
    blackHoleInstability: "Inestabilidad del Agujero Negro estabilizada.",
  },
  pt: {
    galacticMarketLockdown: "Acesso ao Mercado Galáctico restaurado.",
    endlessSummer: "O Verão Eterno terminou.",
    minerBrokeDown: "Operações de mineração restauradas.",
    supplyChainDisruption: "Cadeias de abastecimento restauradas.",
    blackHoleInstability: "Instabilidade do Buraco Negro estabilizada.",
  },
  de: {
    galacticMarketLockdown: "Zugang zum Galaktischen Markt wiederhergestellt.",
    endlessSummer: "Der Endlose Sommer ist vorbei.",
    minerBrokeDown: "Bergbaubetrieb wiederhergestellt.",
    supplyChainDisruption: "Lieferketten wiederhergestellt.",
    blackHoleInstability: "Instabilität des Schwarzen Lochs stabilisiert.",
  },
  it: {
    galacticMarketLockdown: "Accesso al Mercato Galattico ripristinato.",
    endlessSummer: "L'Estate Infinita è finita.",
    minerBrokeDown: "Operazioni di estrazione ripristinate.",
    supplyChainDisruption: "Catene di approvvigionamento ripristinate.",
    blackHoleInstability: "Instabilità del Buco Nero stabilizzata.",
  },
  fr: {
    galacticMarketLockdown: "Accès au Marché Galactique rétabli.",
    endlessSummer: "L'Été Sans Fin est terminé.",
    minerBrokeDown: "Opérations minières rétablies.",
    supplyChainDisruption: "Chaînes d'approvisionnement rétablies.",
    blackHoleInstability: "Instabilité du Trou Noir stabilisée.",
  },
};

const namedMessages: Record<LocaleId, Partial<Record<RandomEventId, string>>> = {
  en: {
    minerBrokeDown: "Mining operations restored, {name} has been repaired.",
    supplyChainDisruption: "Supply chains restored ({name}).",
  },
  es: {
    minerBrokeDown: "Operaciones de minería restauradas, {name} ha sido reparado.",
    supplyChainDisruption: "Cadenas de suministro restauradas ({name}).",
  },
  pt: {
    minerBrokeDown: "Operações de mineração restauradas, {name} foi reparado.",
    supplyChainDisruption: "Cadeias de abastecimento restauradas ({name}).",
  },
  de: {
    minerBrokeDown: "Bergbaubetrieb wiederhergestellt, {name} wurde repariert.",
    supplyChainDisruption: "Lieferketten wiederhergestellt ({name}).",
  },
  it: {
    minerBrokeDown: "Operazioni di estrazione ripristinate, {name} è stato riparato.",
    supplyChainDisruption: "Catene di approvvigionamento ripristinate ({name}).",
  },
  fr: {
    minerBrokeDown: "Opérations minières rétablies, {name} a été réparé.",
    supplyChainDisruption: "Chaînes d'approvisionnement rétablies ({name}).",
  },
};

export function randomEventEndNotificationText(
  locale: LocaleId,
  eventId: RandomEventId,
  targetName: string | null = null,
): string | null {
  if (targetName) {
    const named = namedMessages[locale][eventId];
    if (named) return named.replace("{name}", targetName);
  }
  return messages[locale][eventId] ?? null;
}

export const LOCALIZATION_VALIDATION_DATA = { messages, namedMessages } as const;
