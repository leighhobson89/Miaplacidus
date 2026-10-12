import type { LocaleId } from "../content/ids";
import type { RandomEventId } from "../content/metaSignals";
import type { RandomEventDialogCopy } from "./randomEventDialogTypes";

type RandomEventEndDialogId = Extract<
  RandomEventId,
  | "galacticMarketLockdown"
  | "endlessSummer"
  | "minerBrokeDown"
  | "supplyChainDisruption"
  | "blackHoleInstability"
>;

interface RandomEventEndDialogDefinition {
  readonly title: string;
  readonly summary: string;
  readonly result: string;
  readonly namedResult?: string;
}

export type RandomEventEndDialogCopy = RandomEventDialogCopy;

const messages: Record<LocaleId, Record<RandomEventEndDialogId, RandomEventEndDialogDefinition>> = {
  en: {
    galacticMarketLockdown: {
      title: "GALACTIC MARKET RESTORED!",
      summary: "The disruption has cleared.",
      result: "Galactic Market access has been restored.",
    },
    endlessSummer: {
      title: "ENDLESS SUMMER ENDED!",
      summary: "The climate returns to normal variability.",
      result: "Weather patterns restored.",
    },
    minerBrokeDown: {
      title: "MINER REPAIRED!",
      summary: "Field repairs complete.",
      result: "The mining rocket has been repaired and is ready to resume mining.",
      namedResult: "{name} has been repaired and is ready to resume mining.",
    },
    supplyChainDisruption: {
      title: "SUPPLY CHAINS RESTORED!",
      summary: "Shipments are flowing again.",
      result: "Production has returned to normal.",
      namedResult: "{name} production has returned to normal.",
    },
    blackHoleInstability: {
      title: "BLACK HOLE STABILISED!",
      summary: "The singularity calms and returns to equilibrium.",
      result: "Black Hole strength and duration restored to standard.",
    },
  },
  es: {
    galacticMarketLockdown: {
      title: "¡MERCADO GALÁCTICO RESTAURADO!",
      summary: "La interrupción se ha despejado.",
      result: "El acceso al Mercado Galáctico ha sido restaurado.",
    },
    endlessSummer: {
      title: "¡VERANO ETERNO TERMINADO!",
      summary: "El clima vuelve a la variabilidad normal.",
      result: "Patrones climáticos restaurados.",
    },
    minerBrokeDown: {
      title: "¡MINERO REPARADO!",
      summary: "Reparaciones de campo completadas.",
      result: "El cohete minero ha sido reparado y está listo para reanudar la minería.",
      namedResult: "{name} ha sido reparado y está listo para reanudar la minería.",
    },
    supplyChainDisruption: {
      title: "¡CADENAS DE SUMINISTRO RESTAURADAS!",
      summary: "Los envíos están fluyendo de nuevo.",
      result: "La producción ha vuelto a la normalidad.",
      namedResult: "La producción de {name} ha vuelto a la normalidad.",
    },
    blackHoleInstability: {
      title: "¡AGUJERO NEGRO ESTABILIZADO!",
      summary: "La singularidad se calma y vuelve al equilibrio.",
      result: "Fuerza y duración del Agujero Negro restauradas al estándar.",
    },
  },
  pt: {
    galacticMarketLockdown: {
      title: "MERCADO GALÁCTICO RESTAURADO!",
      summary: "A interrupção foi resolvida.",
      result: "O acesso ao Mercado Galáctico foi restaurado.",
    },
    endlessSummer: {
      title: "VERÃO ETERNO TERMINADO!",
      summary: "O tempo regressa à variabilidade normal.",
      result: "Padrões meteorológicos restaurados.",
    },
    minerBrokeDown: {
      title: "MINERADOR REPARADO!",
      summary: "Reparações de campo concluídas.",
      result: "O foguetão de mineração foi reparado e está pronto para retomar a mineração.",
      namedResult: "{name} foi reparado e está pronto para retomar a mineração.",
    },
    supplyChainDisruption: {
      title: "CADEIAS DE ABASTECIMENTO RESTAURADAS!",
      summary: "Os envios estão novamente a fluir.",
      result: "A produção voltou ao normal.",
      namedResult: "A produção de {name} voltou ao normal.",
    },
    blackHoleInstability: {
      title: "BURACO NEGRO ESTABILIZADO!",
      summary: "A singularidade acalma-se e regressa ao equilíbrio.",
      result: "A força e a duração do Buraco Negro foram restauradas ao padrão.",
    },
  },
  de: {
    galacticMarketLockdown: {
      title: "GALAKTISCHER MARKT WIEDERHERGESTELLT!",
      summary: "Die Störung hat sich aufgelöst.",
      result: "Der Zugang zum Galaktischen Markt wurde wiederhergestellt.",
    },
    endlessSummer: {
      title: "ENDLOSER SOMMER BEENDET!",
      summary: "Das Klima kehrt zur normalen Variabilität zurück.",
      result: "Wettermuster wiederhergestellt.",
    },
    minerBrokeDown: {
      title: "BERGWERK REPARIERT!",
      summary: "Feldreparaturen abgeschlossen.",
      result: "Die Minenrakete wurde repariert und kann den Abbau wieder aufnehmen.",
      namedResult: "{name} wurde repariert und ist bereit, den Abbau fortzusetzen.",
    },
    supplyChainDisruption: {
      title: "LIEFERKETTEN WIEDERHERGESTELLT!",
      summary: "Sendungen fließen wieder.",
      result: "Produktion ist auf Normal zurückgekehrt.",
      namedResult: "{name}-Produktion ist auf Normal zurückgekehrt.",
    },
    blackHoleInstability: {
      title: "SCHWARZLOCH STABILISIERT!",
      summary: "Die Singularität beruhigt sich und kehrt ins Gleichgewicht zurück.",
      result: "Schwarzloch-Stärke und -Dauer auf Standard zurückgesetzt.",
    },
  },
  it: {
    galacticMarketLockdown: {
      title: "MERCATO GALATTICO RIPRISTINATO!",
      summary: "L'interruzione si è risolta.",
      result: "L'accesso al Mercato Galattico è stato ripristinato.",
    },
    endlessSummer: {
      title: "ESTATE INFINITA TERMINATA!",
      summary: "Il clima torna alla variabilità normale.",
      result: "Modelli meteorologici ripristinati.",
    },
    minerBrokeDown: {
      title: "MINATORE RIPARATO!",
      summary: "Riparazioni sul campo completate.",
      result: "Il razzo minerario è stato riparato ed è pronto a riprendere l'estrazione.",
      namedResult: "{name} è stato riparato ed è pronto a riprendere l'estrazione.",
    },
    supplyChainDisruption: {
      title: "CATENE DI APPROVVIGIONAMENTO RESTAURATE!",
      summary: "Le spedizioni stanno fluendo di nuovo.",
      result: "La produzione è tornata alla normalità.",
      namedResult: "La produzione di {name} è tornata alla normalità.",
    },
    blackHoleInstability: {
      title: "BUCO NERO STABILIZZATO!",
      summary: "La singolarità si calma e ritorna in equilibrio.",
      result: "Forza e durata del Buco Nero ripristinate allo standard.",
    },
  },
  fr: {
    galacticMarketLockdown: {
      title: "MARCHÉ GALACTIQUE RESTAURÉ!",
      summary: "L'interruption s'est dissipée.",
      result: "L'accès au Marché Galactique a été restauré.",
    },
    endlessSummer: {
      title: "ÉTÉ ÉTERNEL TERMINÉ!",
      summary: "Le climat revient à sa variabilité normale.",
      result: "Modèles météorologiques restaurés.",
    },
    minerBrokeDown: {
      title: "MINEUR RÉPARÉ!",
      summary: "Réparations sur le terrain terminées.",
      result: "La fusée minière a été réparée et peut reprendre l'extraction.",
      namedResult: "{name} a été réparé et est prêt à reprendre l'extraction.",
    },
    supplyChainDisruption: {
      title: "CHAÎNES D'APPROVISIONNEMENT RÉTABLIES!",
      summary: "Les envois coulent de nouveau.",
      result: "La production a retrouvé son niveau normal.",
      namedResult: "La production de {name} est revenue à la normale.",
    },
    blackHoleInstability: {
      title: "TROU NOIR STABILISÉ!",
      summary: "La singularité se calme et retourne à l'équilibre.",
      result: "Force et durée du Trou Noir restaurées à la normale.",
    },
  },
};

const confirmLabels: Record<LocaleId, string> = {
  en: "OK",
  es: "OK",
  pt: "OK",
  de: "OK",
  it: "OK",
  fr: "OK",
};

export function randomEventEndDialogText(
  locale: LocaleId,
  eventId: RandomEventId,
  targetName: string | null = null,
): RandomEventEndDialogCopy | null {
  const definition = messages[locale][eventId as RandomEventEndDialogId];
  if (!definition) return null;
  const result =
    targetName && definition.namedResult
      ? definition.namedResult.replace("{name}", targetName)
      : definition.result;
  return {
    title: definition.title,
    summary: definition.summary,
    lines: [{ text: result, tone: "green-ready-text" }],
    confirmLabel: confirmLabels[locale],
  };
}

export const LOCALIZATION_VALIDATION_DATA = { messages, confirmLabels } as const;
