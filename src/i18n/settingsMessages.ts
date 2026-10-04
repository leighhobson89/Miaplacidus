import type { LocaleId } from "../content/ids";
import type { ThemeId } from "../content/themes";

const messages: Record<
  LocaleId,
  {
    title: string;
    description: string;
    theme: string;
    notation: string;
    standard: string;
    scientific: string;
    sound: string;
    reducedMotion: string;
    achievements: string;
    themes: Record<ThemeId, string>;
  }
> = {
  en: {
    title: "Settings",
    description: "Language, display, and accessibility preferences.",
    theme: "Theme",
    notation: "Number notation",
    standard: "Standard",
    scientific: "Scientific",
    sound: "Sound effects",
    reducedMotion: "Reduce motion",
    achievements: "Achievements",
    themes: {
      terminal: "Terminal",
      dark: "Dark",
      misty: "Misty",
      light: "Light",
      frosty: "Frosty",
      summer: "Summer",
      supernova: "Supernova",
      galaxy: "Galaxy",
      space: "Space",
    },
  },
  es: {
    title: "Ajustes",
    description: "Idioma, pantalla y preferencias de accesibilidad.",
    theme: "Tema",
    notation: "Notación numérica",
    standard: "Estándar",
    scientific: "Científica",
    sound: "Efectos de sonido",
    reducedMotion: "Reducir movimiento",
    achievements: "Logros",
    themes: {
      terminal: "Terminal",
      dark: "Oscuro",
      misty: "Brumoso",
      light: "Claro",
      frosty: "Helado",
      summer: "Verano",
      supernova: "Supernova",
      galaxy: "Galaxia",
      space: "Espacio",
    },
  },
  pt: {
    title: "Configurações",
    description: "Idioma, visual e preferências de acessibilidade.",
    theme: "Tema",
    notation: "Notação numérica",
    standard: "Padrão",
    scientific: "Científica",
    sound: "Efeitos sonoros",
    reducedMotion: "Reduzir movimento",
    achievements: "Conquistas",
    themes: {
      terminal: "Terminal",
      dark: "Escuro",
      misty: "Nebuloso",
      light: "Claro",
      frosty: "Gelado",
      summer: "Verão",
      supernova: "Supernova",
      galaxy: "Galáxia",
      space: "Espaço",
    },
  },
  de: {
    title: "Einstellungen",
    description: "Sprache, Anzeige und Barrierefreiheit.",
    theme: "Design",
    notation: "Zahlennotation",
    standard: "Standard",
    scientific: "Wissenschaftlich",
    sound: "Soundeffekte",
    reducedMotion: "Bewegung reduzieren",
    achievements: "Errungenschaften",
    themes: {
      terminal: "Terminal",
      dark: "Dunkel",
      misty: "Neblig",
      light: "Hell",
      frosty: "Frostig",
      summer: "Sommer",
      supernova: "Supernova",
      galaxy: "Galaxie",
      space: "Weltraum",
    },
  },
  it: {
    title: "Impostazioni",
    description: "Lingua, visualizzazione e accessibilità.",
    theme: "Tema",
    notation: "Notazione numerica",
    standard: "Standard",
    scientific: "Scientifica",
    sound: "Effetti sonori",
    reducedMotion: "Riduci animazioni",
    achievements: "Obiettivi",
    themes: {
      terminal: "Terminale",
      dark: "Scuro",
      misty: "Nebbia",
      light: "Chiaro",
      frosty: "Gelido",
      summer: "Estate",
      supernova: "Supernova",
      galaxy: "Galassia",
      space: "Spazio",
    },
  },
  fr: {
    title: "Paramètres",
    description: "Langue, affichage et accessibilité.",
    theme: "Thème",
    notation: "Notation des nombres",
    standard: "Standard",
    scientific: "Scientifique",
    sound: "Effets sonores",
    reducedMotion: "Réduire les animations",
    achievements: "Succès",
    themes: {
      terminal: "Terminal",
      dark: "Sombre",
      misty: "Brumeux",
      light: "Clair",
      frosty: "Givré",
      summer: "Été",
      supernova: "Supernova",
      galaxy: "Galaxie",
      space: "Espace",
    },
  },
};

export function settingsText(
  locale: LocaleId,
  key: Exclude<keyof (typeof messages)["en"], "themes">,
): string {
  return messages[locale][key];
}

export function themeName(locale: LocaleId, id: ThemeId): string {
  return messages[locale].themes[id];
}

const extra: Record<LocaleId, { language: string; profile: string }> = {
  en: { language: "Language", profile: "PREFERENCES / PROFILE" },
  es: { language: "Idioma", profile: "PREFERENCIAS / PERFIL" },
  pt: { language: "Idioma", profile: "PREFERÊNCIAS / PERFIL" },
  de: { language: "Sprache", profile: "EINSTELLUNGEN / PROFIL" },
  it: { language: "Lingua", profile: "PREFERENZE / PROFILO" },
  fr: { language: "Langue", profile: "PRÉFÉRENCES / PROFIL" },
};

export function settingsLabel(locale: LocaleId, key: keyof (typeof extra)["en"]): string {
  return extra[locale][key];
}
