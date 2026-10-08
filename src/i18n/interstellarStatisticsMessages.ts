import type { LocaleId } from "../content/ids";

export type InterstellarStatisticId =
  | "starStudyRange"
  | "starShipBuilt"
  | "starshipDistanceTravelled"
  | "systemScanned"
  | "fleetAttackStrength"
  | "envoy"
  | "scout"
  | "marauder"
  | "landStalker"
  | "navalStrafer"
  | "enemy"
  | "enemyDefenceOvercome"
  | "enemyDefenceRemaining"
  | "apFromStarVoyage"
  | "blackHoleDiscovered"
  | "blackHoleAlwaysActive"
  | "blackHoleStrength"
  | "notApplicable"
  | "lightYearUnit";

const labels: Record<LocaleId, Record<InterstellarStatisticId, string>> = {
  en: {
    starStudyRange: "Star Study Range",
    starShipBuilt: "Star Ship Built",
    starshipDistanceTravelled: "Star Ship Distance Travelled",
    systemScanned: "System Scanned",
    fleetAttackStrength: "Fleet Attack Strength",
    envoy: "Envoy",
    scout: "Scout",
    marauder: "Marauder",
    landStalker: "Land Stalker",
    navalStrafer: "Naval Strafer",
    enemy: "Enemy",
    enemyDefenceOvercome: "Enemy Total Defence Overcome",
    enemyDefenceRemaining: "Enemy Total Defence Remaining",
    apFromStarVoyage: "AP From Star Voyage",
    blackHoleDiscovered: "Black Hole Discovered",
    blackHoleAlwaysActive: "Black Hole Always Active",
    blackHoleStrength: "Black Hole Strength",
    notApplicable: "Not applicable",
    lightYearUnit: "ly",
  },
  es: {
    starStudyRange: "Alcance de estudio estelar",
    starShipBuilt: "Nave estelar construida",
    starshipDistanceTravelled: "Distancia recorrida por la nave estelar",
    systemScanned: "Sistema escaneado",
    fleetAttackStrength: "Fuerza de ataque de la flota",
    envoy: "Enviado",
    scout: "Explorador",
    marauder: "Merodeador",
    landStalker: "Acechador terrestre",
    navalStrafer: "Atacante naval",
    enemy: "Enemigo",
    enemyDefenceOvercome: "Defensa total del enemigo superada",
    enemyDefenceRemaining: "Defensa total del enemigo restante",
    apFromStarVoyage: "AP obtenidos del viaje estelar",
    blackHoleDiscovered: "Agujero negro descubierto",
    blackHoleAlwaysActive: "Agujero negro siempre activo",
    blackHoleStrength: "Intensidad del agujero negro",
    notApplicable: "No disponible",
    lightYearUnit: "al",
  },
  pt: {
    starStudyRange: "Alcance de estudo estelar",
    starShipBuilt: "Nave estelar construída",
    starshipDistanceTravelled: "Distância percorrida pela nave estelar",
    systemScanned: "Sistema analisado",
    fleetAttackStrength: "Poder de ataque da frota",
    envoy: "Enviado",
    scout: "Explorador",
    marauder: "Saqueador",
    landStalker: "Perseguidor terrestre",
    navalStrafer: "Atacante naval",
    enemy: "Inimigo",
    enemyDefenceOvercome: "Defesa total do inimigo superada",
    enemyDefenceRemaining: "Defesa total do inimigo restante",
    apFromStarVoyage: "AP obtidos da viagem estelar",
    blackHoleDiscovered: "Buraco negro descoberto",
    blackHoleAlwaysActive: "Buraco negro sempre ativo",
    blackHoleStrength: "Força do buraco negro",
    notApplicable: "Não aplicável",
    lightYearUnit: "al",
  },
  de: {
    starStudyRange: "Reichweite der Sternenforschung",
    starShipBuilt: "Raumschiff gebaut",
    starshipDistanceTravelled: "Zurückgelegte Raumschiffentfernung",
    systemScanned: "System gescannt",
    fleetAttackStrength: "Flottenangriffsstärke",
    envoy: "Gesandter",
    scout: "Späher",
    marauder: "Plünderer",
    landStalker: "Landjäger",
    navalStrafer: "Marinejäger",
    enemy: "Gegner",
    enemyDefenceOvercome: "Überwundene Gesamtverteidigung des Gegners",
    enemyDefenceRemaining: "Verbleibende Gesamtverteidigung des Gegners",
    apFromStarVoyage: "AP aus der Sternenreise",
    blackHoleDiscovered: "Schwarzes Loch entdeckt",
    blackHoleAlwaysActive: "Schwarzes Loch immer aktiv",
    blackHoleStrength: "Stärke des Schwarzen Lochs",
    notApplicable: "Nicht zutreffend",
    lightYearUnit: "Lj",
  },
  it: {
    starStudyRange: "Raggio di studio stellare",
    starShipBuilt: "Nave stellare costruita",
    starshipDistanceTravelled: "Distanza percorsa dalla nave stellare",
    systemScanned: "Sistema scansionato",
    fleetAttackStrength: "Forza d'attacco della flotta",
    envoy: "Inviato",
    scout: "Esploratore",
    marauder: "Predone",
    landStalker: "Predatore terrestre",
    navalStrafer: "Attaccante navale",
    enemy: "Nemico",
    enemyDefenceOvercome: "Difesa totale del nemico superata",
    enemyDefenceRemaining: "Difesa totale del nemico rimanente",
    apFromStarVoyage: "AP ottenuti dal viaggio stellare",
    blackHoleDiscovered: "Buco nero scoperto",
    blackHoleAlwaysActive: "Buco nero sempre attivo",
    blackHoleStrength: "Potenza del buco nero",
    notApplicable: "Non applicabile",
    lightYearUnit: "al",
  },
  fr: {
    starStudyRange: "Portée d'étude stellaire",
    starShipBuilt: "Vaisseau stellaire construit",
    starshipDistanceTravelled: "Distance parcourue par le vaisseau stellaire",
    systemScanned: "Système scanné",
    fleetAttackStrength: "Puissance d'attaque de la flotte",
    envoy: "Émissaire",
    scout: "Éclaireur",
    marauder: "Pillard",
    landStalker: "Traqueur terrestre",
    navalStrafer: "Attaquant naval",
    enemy: "Ennemi",
    enemyDefenceOvercome: "Défense totale de l'ennemi surmontée",
    enemyDefenceRemaining: "Défense totale de l'ennemi restante",
    apFromStarVoyage: "AP obtenus du voyage stellaire",
    blackHoleDiscovered: "Trou noir découvert",
    blackHoleAlwaysActive: "Trou noir toujours actif",
    blackHoleStrength: "Puissance du trou noir",
    notApplicable: "Sans objet",
    lightYearUnit: "al",
  },
};

const trackingNotes: Record<LocaleId, string> = {
  en: "Enemy Total Defence Overcome is not tracked: the source's all-time value is a single-battle defence delta, not a cumulative total.",
  es: "No se registra la defensa total del enemigo superada: el valor histórico de referencia es la diferencia de defensa de una sola batalla, no un total acumulado.",
  pt: "A defesa total do inimigo superada não é registada: o valor histórico da fonte é a diferença de defesa de uma única batalha, não um total acumulado.",
  de: "Die überwundene Gesamtverteidigung des Gegners wird nicht erfasst: Der Gesamtwert der Vorlage ist eine Verteidigungsdifferenz aus einem einzelnen Kampf und kein kumulierter Wert.",
  it: "La difesa totale del nemico superata non viene registrata: il valore storico della fonte è la differenza di difesa di una singola battaglia, non un totale cumulativo.",
  fr: "La défense totale de l'ennemi surmontée n'est pas suivie : la valeur cumulée de la source correspond à l'écart de défense d'un seul combat, et non à un total cumulé.",
};

export function interstellarStatisticLabel(locale: LocaleId, id: InterstellarStatisticId): string {
  return labels[locale][id];
}

export function interstellarStatisticsTrackingNote(locale: LocaleId): string {
  return trackingNotes[locale];
}

export const LOCALIZATION_VALIDATION_DATA = { labels, trackingNotes } as const;
