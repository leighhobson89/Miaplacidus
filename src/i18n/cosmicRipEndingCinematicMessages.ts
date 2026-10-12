import type { LocaleId } from "../content/ids";

export interface CosmicRipEndingCinematicCopy {
  readonly ariaLabel: string;
  readonly creditsHeading: string;
  readonly credits: readonly string[];
  readonly victory: string;
  readonly securedFuture: string;
  readonly playerIdentity: string;
  readonly gameName: string;
  readonly theEnd: string;
  readonly skip: string;
  readonly continue: string;
}

const MESSAGES: Readonly<Record<LocaleId, CosmicRipEndingCinematicCopy>> = {
  en: {
    ariaLabel: "MIAPLACIDUS ending",
    creditsHeading: "CREDITS",
    credits: [
      "Game Design",
      "Development",
      "Graphics and UI Design",
      "Quality Assurance",
      "Story",
    ],
    victory: "VICTORY",
    securedFuture: "Mia'Plac, your people's future is secure.",
    playerIdentity: "You are Mia'Plac.",
    gameName: "MIAPLACIDUS",
    theEnd: "THE END",
    skip: "Skip ending",
    continue: "Continue",
  },
  es: {
    ariaLabel: "Final de MIAPLACIDUS",
    creditsHeading: "CRÉDITOS",
    credits: [
      "Diseño del juego",
      "Desarrollo",
      "Gráficos y diseño de interfaz",
      "Control de calidad",
      "Historia",
    ],
    victory: "VICTORIA",
    securedFuture: "Mia'Plac, el futuro de tu pueblo está asegurado.",
    playerIdentity: "Tú eres Mia'Plac.",
    gameName: "MIAPLACIDUS",
    theEnd: "FIN",
    skip: "Saltar final",
    continue: "Continuar",
  },
  pt: {
    ariaLabel: "Final de MIAPLACIDUS",
    creditsHeading: "CRÉDITOS",
    credits: [
      "Design do jogo",
      "Desenvolvimento",
      "Gráficos e design de interface",
      "Controlo de qualidade",
      "História",
    ],
    victory: "VITÓRIA",
    securedFuture: "Mia'Plac, o futuro do teu povo está assegurado.",
    playerIdentity: "Tu és Mia'Plac.",
    gameName: "MIAPLACIDUS",
    theEnd: "FIM",
    skip: "Saltar final",
    continue: "Continuar",
  },
  de: {
    ariaLabel: "Ende von MIAPLACIDUS",
    creditsHeading: "MITWIRKENDE",
    credits: [
      "Spieldesign",
      "Entwicklung",
      "Grafik und UI-Design",
      "Qualitätssicherung",
      "Story",
    ],
    victory: "SIEG",
    securedFuture: "Mia'Plac, die Zukunft deines Volkes ist gesichert.",
    playerIdentity: "Du bist Mia'Plac.",
    gameName: "MIAPLACIDUS",
    theEnd: "ENDE",
    skip: "Endsequenz überspringen",
    continue: "Weiter",
  },
  it: {
    ariaLabel: "Finale di MIAPLACIDUS",
    creditsHeading: "CREDITI",
    credits: [
      "Game design",
      "Sviluppo",
      "Grafica e design dell'interfaccia",
      "Controllo qualità",
      "Storia",
    ],
    victory: "VITTORIA",
    securedFuture: "Mia'Plac, il futuro del tuo popolo è al sicuro.",
    playerIdentity: "Tu sei Mia'Plac.",
    gameName: "MIAPLACIDUS",
    theEnd: "FINE",
    skip: "Salta il finale",
    continue: "Continua",
  },
  fr: {
    ariaLabel: "Fin de MIAPLACIDUS",
    creditsHeading: "CRÉDITS",
    credits: [
      "Conception du jeu",
      "Développement",
      "Graphismes et design d'interface",
      "Assurance qualité",
      "Histoire",
    ],
    victory: "VICTOIRE",
    securedFuture: "Mia'Plac, l'avenir de ton peuple est assuré.",
    playerIdentity: "Tu es Mia'Plac.",
    gameName: "MIAPLACIDUS",
    theEnd: "FIN",
    skip: "Passer la séquence",
    continue: "Continuer",
  },
};

export function cosmicRipEndingCinematicText(locale: LocaleId): CosmicRipEndingCinematicCopy {
  return MESSAGES[locale];
}
