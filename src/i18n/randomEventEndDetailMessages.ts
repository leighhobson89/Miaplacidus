import type { LocaleId } from "../content/ids";
import type { RandomEventId } from "../content/metaSignals";

const details: Record<LocaleId, Partial<Record<RandomEventId, string>>> = {
  en: {
    blackHoleInstability:
      "The singularity calms and returns to equilibrium. Black Hole strength and duration are restored to standard.",
  },
  es: {
    blackHoleInstability:
      "La singularidad se calma y vuelve al equilibrio. La fuerza y la duración del Agujero Negro se restauran al estándar.",
  },
  pt: {
    blackHoleInstability:
      "A singularidade acalma-se e regressa ao equilíbrio. A força e a duração do Buraco Negro são restauradas ao padrão.",
  },
  de: {
    blackHoleInstability:
      "Die Singularität beruhigt sich und kehrt ins Gleichgewicht zurück. Schwarzloch-Stärke und -Dauer sind wieder auf dem Standardwert.",
  },
  it: {
    blackHoleInstability:
      "La singolarità si calma e ritorna in equilibrio. Forza e durata del Buco Nero sono ripristinate allo standard.",
  },
  fr: {
    blackHoleInstability:
      "La singularité se calme et retourne à l’équilibre. Force et durée du Trou Noir sont restaurées à la normale.",
  },
};

export function randomEventEndDetailText(
  locale: LocaleId,
  eventId: RandomEventId,
): string | null {
  return details[locale][eventId] ?? null;
}

export const LOCALIZATION_VALIDATION_DATA = { details } as const;
