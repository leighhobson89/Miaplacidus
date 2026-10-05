import type { LocaleId } from "../content/ids";

const en = {
  starshipLaunched: "Starship launched toward {system}.",
  starshipArrived: "Starship arrived at {system}.",
  rocketLaunched: "{rocket} launched.",
  rocketOutbound: "{rocket} is travelling to {asteroid}.",
  rocketReturning: "{rocket} is returning from {asteroid}.",
  rocketArrived: "{rocket} arrived at {asteroid}.",
  rocketReturned: "{rocket} returned from {asteroid}.",
  rain: "Rain in {system} is blocking rocket launches.",
  heavyRain: "Heavy rain in {system} is blocking rocket launches.",
  volcano: "Volcanic conditions at {system} are blocking rocket launches.",
  battleVictory: "Victory in {system}: the enemy fleet was defeated.",
  battleDefeat: "Defeat at {system}: your fleet was defeated.",
} as const;

export type SpaceNotificationMessageKey = keyof typeof en;

export const SPACE_NOTIFICATION_MESSAGES: Record<LocaleId, Record<SpaceNotificationMessageKey, string>> = {
  en,
  es: {
    starshipLaunched: "La nave estelar partió hacia {system}.",
    starshipArrived: "La nave estelar llegó a {system}.",
    rocketLaunched: "Se lanzó {rocket}.",
    rocketOutbound: "{rocket} viaja hacia {asteroid}.",
    rocketReturning: "{rocket} regresa desde {asteroid}.",
    rocketArrived: "{rocket} llegó a {asteroid}.",
    rocketReturned: "{rocket} regresó de {asteroid}.",
    rain: "La lluvia en {system} impide los lanzamientos de cohetes.",
    heavyRain: "La lluvia intensa en {system} impide los lanzamientos de cohetes.",
    volcano: "La actividad volcánica en {system} impide los lanzamientos de cohetes.",
    battleVictory: "Victoria en {system}: la flota enemiga ha sido derrotada.",
    battleDefeat: "Derrota en {system}: tu flota ha sido vencida.",
  },
  pt: {
    starshipLaunched: "A nave estelar partiu em direção a {system}.",
    starshipArrived: "A nave estelar chegou a {system}.",
    rocketLaunched: "{rocket} foi lançado.",
    rocketOutbound: "{rocket} está a caminho de {asteroid}.",
    rocketReturning: "{rocket} está voltando de {asteroid}.",
    rocketArrived: "{rocket} chegou a {asteroid}.",
    rocketReturned: "{rocket} voltou de {asteroid}.",
    rain: "A chuva em {system} está impedindo lançamentos de foguetes.",
    heavyRain: "A chuva forte em {system} está impedindo lançamentos de foguetes.",
    volcano: "As condições vulcânicas em {system} estão impedindo lançamentos de foguetes.",
    battleVictory: "Vitória em {system}: a frota inimiga foi derrotada.",
    battleDefeat: "Derrota em {system}: sua frota foi derrotada.",
  },
  de: {
    starshipLaunched: "Das Sternenschiff ist nach {system} gestartet.",
    starshipArrived: "Das Sternenschiff hat {system} erreicht.",
    rocketLaunched: "{rocket} wurde gestartet.",
    rocketOutbound: "{rocket} fliegt zu {asteroid}.",
    rocketReturning: "{rocket} kehrt von {asteroid} zurück.",
    rocketArrived: "{rocket} hat {asteroid} erreicht.",
    rocketReturned: "{rocket} kehrte von {asteroid} zurück.",
    rain: "Regen auf {system} verhindert Raketenstarts.",
    heavyRain: "Starker Regen auf {system} verhindert Raketenstarts.",
    volcano: "Vulkanische Bedingungen auf {system} verhindern Raketenstarts.",
    battleVictory: "Sieg bei {system}: Die feindliche Flotte wurde besiegt.",
    battleDefeat: "Niederlage bei {system}: Deine Flotte wurde besiegt.",
  },
  it: {
    starshipLaunched: "L'astronave è partita verso {system}.",
    starshipArrived: "L'astronave è arrivata a {system}.",
    rocketLaunched: "{rocket} è stato lanciato.",
    rocketOutbound: "{rocket} sta viaggiando verso {asteroid}.",
    rocketReturning: "{rocket} sta tornando da {asteroid}.",
    rocketArrived: "{rocket} è arrivato su {asteroid}.",
    rocketReturned: "{rocket} è rientrato da {asteroid}.",
    rain: "La pioggia su {system} impedisce i lanci dei razzi.",
    heavyRain: "La pioggia intensa su {system} impedisce i lanci dei razzi.",
    volcano: "Le condizioni vulcaniche su {system} impediscono i lanci dei razzi.",
    battleVictory: "Vittoria su {system}: la flotta nemica è stata sconfitta.",
    battleDefeat: "Sconfitta su {system}: la tua flotta è stata sconfitta.",
  },
  fr: {
    starshipLaunched: "Le vaisseau spatial est parti vers {system}.",
    starshipArrived: "Le vaisseau spatial est arrivé à {system}.",
    rocketLaunched: "{rocket} a été lancé.",
    rocketOutbound: "{rocket} se dirige vers {asteroid}.",
    rocketReturning: "{rocket} revient de {asteroid}.",
    rocketArrived: "{rocket} est arrivé sur {asteroid}.",
    rocketReturned: "{rocket} est revenu de {asteroid}.",
    rain: "La pluie sur {system} empêche les lancements de fusées.",
    heavyRain: "Les fortes pluies sur {system} empêchent les lancements de fusées.",
    volcano: "Les conditions volcaniques sur {system} empêchent les lancements de fusées.",
    battleVictory: "Victoire sur {system} : la flotte ennemie a été vaincue.",
    battleDefeat: "Défaite sur {system} : votre flotte a été vaincue.",
  },
};

export function spaceNotificationText(
  locale: LocaleId,
  key: SpaceNotificationMessageKey,
  values: Readonly<Record<string, string | number>> = {},
): string {
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    SPACE_NOTIFICATION_MESSAGES[locale][key] ?? en[key],
  );
}
