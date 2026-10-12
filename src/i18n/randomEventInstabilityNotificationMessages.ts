import type { LocaleId } from "../content/ids";

const messages: Record<
  LocaleId,
  {
    withDuration: string;
    powerOnly: string;
    unknown: string;
    stable: string;
    weaker: string;
    stronger: string;
  }
> = {
  en: {
    withDuration:
      "Black Hole Instability: Strength {powerText} than standard. Duration {durationText} than standard.",
    powerOnly: "Black Hole Instability: Strength {powerText} than standard.",
    unknown: "unknown",
    stable: "stable",
    weaker: "{percent}% weaker",
    stronger: "{percent}% stronger",
  },
  es: {
    withDuration:
      "Inestabilidad del Agujero Negro: potencia {powerText} de lo normal. Duración {durationText} de lo normal.",
    powerOnly: "Inestabilidad del Agujero Negro: potencia {powerText} de lo normal.",
    unknown: "desconocida",
    stable: "estable",
    weaker: "un {percent}% menor",
    stronger: "un {percent}% mayor",
  },
  pt: {
    withDuration:
      "Instabilidade do Buraco Negro: potência {powerText} do normal. Duração {durationText} do normal.",
    powerOnly: "Instabilidade do Buraco Negro: potência {powerText} do normal.",
    unknown: "desconhecida",
    stable: "estável",
    weaker: "{percent}% menor",
    stronger: "{percent}% maior",
  },
  de: {
    withDuration:
      "Instabilität des Schwarzen Lochs: Stärke {powerText} als üblich. Dauer {durationText} als üblich.",
    powerOnly: "Instabilität des Schwarzen Lochs: Stärke {powerText} als üblich.",
    unknown: "unbekannt",
    stable: "stabil",
    weaker: "{percent}% schwächer",
    stronger: "{percent}% stärker",
  },
  it: {
    withDuration:
      "Instabilità del Buco Nero: potenza {powerText} del normale. Durata {durationText} del normale.",
    powerOnly: "Instabilità del Buco Nero: potenza {powerText} del normale.",
    unknown: "sconosciuta",
    stable: "stabile",
    weaker: "del {percent}% inferiore",
    stronger: "del {percent}% superiore",
  },
  fr: {
    withDuration:
      "Instabilité du Trou Noir: puissance {powerText} que la normale. Durée {durationText} que la normale.",
    powerOnly: "Instabilité du Trou Noir: puissance {powerText} que la normale.",
    unknown: "inconnue",
    stable: "stable",
    weaker: "inférieure de {percent}%",
    stronger: "supérieure de {percent}%",
  },
};

function deltaText(locale: LocaleId, multiplier: number): string {
  if (!Number.isFinite(multiplier) || multiplier <= 0) return messages[locale].unknown;
  const delta = (multiplier - 1) * 100;
  const percent = Math.round(Math.abs(delta));
  if (percent === 0) return messages[locale].stable;
  return messages[locale][delta < 0 ? "weaker" : "stronger"].replace(
    "{percent}",
    String(percent),
  );
}

export function randomEventInstabilityNotificationText(
  locale: LocaleId,
  powerMultiplier: number,
  durationMultiplier: number,
  durationAffected: boolean,
): string {
  const message = messages[locale];
  const template = durationAffected ? message.withDuration : message.powerOnly;
  return template
    .replace("{powerText}", deltaText(locale, powerMultiplier))
    .replace("{durationText}", deltaText(locale, durationMultiplier));
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
