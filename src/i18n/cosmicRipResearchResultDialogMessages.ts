import type { CosmicRipTechnologyId } from "../content/cosmicRip";
import type { LocaleId } from "../content/ids";
import type { RandomEventDialogCopy, RandomEventDialogLine } from "./randomEventDialogTypes";
import { cosmicRipText } from "./cosmicRipMessages";

interface CosmicRipResearchResultCopy {
  readonly title: string;
  readonly confirmLabel: string;
  readonly progressLabel: string;
  readonly technologies: Readonly<
    Record<
      CosmicRipTechnologyId,
      {
        readonly researchedPrefix: string;
        readonly researchedSuffix?: string;
        readonly name: string;
        readonly explanation: string;
        readonly percentage: string;
        readonly congratulations?: string;
      }
    >
  >;
}

const messages: Readonly<Record<LocaleId, CosmicRipResearchResultCopy>> = {
  en: {
    title: "Cosmic Rip Progress!",
    confirmLabel: "CONFIRM",
    progressLabel: "Overall progress toward full stabilisation: ",
    technologies: {
      stabilizerArray: {
        researchedPrefix: "You have successfully researched the ",
        name: "Stabilizer Array",
        explanation:
          "This foundational technology reduces initial instability around the Cosmic Rip, allowing for safer operations and further research.",
        percentage: "20%",
      },
      quantumContainmentField: {
        researchedPrefix: "You have successfully researched the ",
        name: "Quantum Containment Field",
        explanation:
          "Advanced quantum barriers now prevent energy leakage from the Cosmic Rip, significantly reducing volatility in the surrounding space-time.",
        percentage: "40%",
      },
      dimensionalAnchorMatrix: {
        researchedPrefix: "You have successfully researched the ",
        name: "Dimensional Anchor Matrix",
        explanation:
          "The dimensional fabric around the Cosmic Rip is now reinforced, preventing unwanted dimensional shifts and securing the breach.",
        percentage: "60%",
      },
      singularityStabilizer: {
        researchedPrefix: "You have successfully researched the ",
        name: "Singularity Stabilizer",
        explanation:
          "The gravitational singularity at the heart of the Cosmic Rip is now under control, dramatically reducing its destabilising effects.",
        percentage: "80%",
      },
      realityWeaveRegulator: {
        researchedPrefix: "You have successfully researched the ",
        name: "Reality Weave Regulator",
        explanation:
          "The final layer of stabilisation is now in place. The Cosmic Rip has been transformed from a dangerous anomaly into a controlled phenomenon.",
        percentage: "100%",
        congratulations:
          "Congratulations! The Cosmic Rip is now fully stabilised and secure!",
      },
    },
  },
  es: {
    title: "¡Progreso del Desgarro Cósmico!",
    confirmLabel: "CONFIRMAR",
    progressLabel: "Progreso general hacia la estabilización completa: ",
    technologies: {
      stabilizerArray: {
        researchedPrefix: "Has investigado exitosamente la ",
        name: "Matriz Estabilizadora",
        explanation:
          "Esta tecnología fundamental reduce la inestabilidad inicial alrededor del Desgarro Cósmico, permitiendo operaciones más seguras y más investigación.",
        percentage: "20%",
      },
      quantumContainmentField: {
        researchedPrefix: "Has investigado exitosamente el ",
        name: "Campo de Contención Cuántico",
        explanation:
          "Las barreras cuánticas avanzadas ahora previenen la fuga de energía del Desgarro Cósmico, reduciendo significativamente la volatilidad en el espacio-tiempo circundante.",
        percentage: "40%",
      },
      dimensionalAnchorMatrix: {
        researchedPrefix: "Has investigado exitosamente la ",
        name: "Matriz de Anclaje Dimensional",
        explanation:
          "El tejido dimensional alrededor del Desgarro Cósmico ahora está reforzado, previniendo cambios dimensionales no deseados y asegurando la brecha.",
        percentage: "60%",
      },
      singularityStabilizer: {
        researchedPrefix: "Has investigado exitosamente el ",
        name: "Estabilizador de Singularidad",
        explanation:
          "La singularidad gravitacional en el corazón del Desgarro Cósmico ahora está bajo control, reduciendo dramáticamente sus efectos desestabilizadores.",
        percentage: "80%",
      },
      realityWeaveRegulator: {
        researchedPrefix: "Has investigado exitosamente el ",
        name: "Regulador de Tejido de Realidad",
        explanation:
          "La capa final de estabilización ahora está en su lugar. El Desgarro Cósmico ha sido transformado de una anomalía peligrosa en un fenómeno controlado.",
        percentage: "100%",
        congratulations:
          "¡Felicidades! El Desgarro Cósmico ahora está completamente estabilizado y asegurado.",
      },
    },
  },
  pt: {
    title: "PROGRESSO DO RASGO CÓSMICO!",
    confirmLabel: "CONFIRMAR",
    progressLabel: "Progresso geral rumo à estabilização completa: ",
    technologies: {
      stabilizerArray: {
        researchedPrefix: "Investigaste com sucesso a ",
        name: "Matriz Estabilizadora",
        explanation:
          "Esta tecnologia fundamental reduz a instabilidade inicial em torno do Rasgo Cósmico, permitindo operações mais seguras e mais investigação.",
        percentage: "20%",
      },
      quantumContainmentField: {
        researchedPrefix: "Investigaste com sucesso o ",
        name: "Campo de Contenção Quântico",
        explanation:
          "Barreiras quânticas avançadas impedem agora a fuga de energia do Rasgo Cósmico, reduzindo significativamente a volatilidade no espaço-tempo circundante.",
        percentage: "40%",
      },
      dimensionalAnchorMatrix: {
        researchedPrefix: "Investigaste com sucesso a ",
        name: "Matriz de Ancoragem Dimensional",
        explanation:
          "O tecido dimensional em torno do Rasgo Cósmico está agora reforçado, impedindo alterações dimensionais indesejadas e assegurando a brecha.",
        percentage: "60%",
      },
      singularityStabilizer: {
        researchedPrefix: "Investigaste com sucesso o ",
        name: "Estabilizador de Singularidade",
        explanation:
          "A singularidade gravitacional no coração do Rasgo Cósmico está agora sob controlo, reduzindo drasticamente os seus efeitos desestabilizadores.",
        percentage: "80%",
      },
      realityWeaveRegulator: {
        researchedPrefix: "Investigaste com sucesso o ",
        name: "Regulador do Tecido da Realidade",
        explanation:
          "A camada final de estabilização está agora instalada. O Rasgo Cósmico foi transformado de uma anomalia perigosa num fenómeno controlado.",
        percentage: "100%",
        congratulations:
          "Parabéns! O Rasgo Cósmico está agora completamente estabilizado e assegurado.",
      },
    },
  },
  de: {
    title: "Kosmischer Riss Fortschritt!",
    confirmLabel: "BESTÄTIGEN",
    progressLabel: "Gesamtfortschritt zur vollen Stabilisierung: ",
    technologies: {
      stabilizerArray: {
        researchedPrefix: "Du hast erfolgreich das ",
        researchedSuffix: " erforscht",
        name: "Stabilisierungs-Array",
        explanation:
          "Diese grundlegende Technologie reduziert die anfängliche Instabilität um den Kosmischen Riss, was sicherere Operationen und weitere Forschung ermöglicht.",
        percentage: "20%",
      },
      quantumContainmentField: {
        researchedPrefix: "Du hast erfolgreich das ",
        researchedSuffix: " erforscht",
        name: "Quanten-Eindämmungsfeld",
        explanation:
          "Fortschrittliche Quantenbarrieren verhindern nun Energielecks aus dem Kosmischen Riss, was die Volatilität in der umgebenden Raumzeit erheblich reduziert.",
        percentage: "40%",
      },
      dimensionalAnchorMatrix: {
        researchedPrefix: "Du hast erfolgreich die ",
        researchedSuffix: " erforscht",
        name: "Dimensionale Anker-Matrix",
        explanation:
          "Der dimensionale Stoff um den Kosmischen Riss ist nun verstärkt, was unerwünschte Dimensionsverschiebungen verhindert und die Bresche sichert.",
        percentage: "60%",
      },
      singularityStabilizer: {
        researchedPrefix: "Du hast erfolgreich den ",
        researchedSuffix: " erforscht",
        name: "Singularitäts-Stabilisierer",
        explanation:
          "Die gravitationale Singularität im Herzen des Kosmischen Risses ist nun unter Kontrolle, was seine destabilisierenden Effekte dramatisch reduziert.",
        percentage: "80%",
      },
      realityWeaveRegulator: {
        researchedPrefix: "Du hast erfolgreich den ",
        researchedSuffix: " erforscht",
        name: "Realitätsgewebe-Regler",
        explanation:
          "Die letzte Stabilisierungsschicht ist nun an ihrem Platz. Der Kosmische Riss wurde von einer gefährlichen Anomalie in ein kontrolliertes Phänomen transformiert.",
        percentage: "100%",
        congratulations:
          "Herzlichen Glückwunsch! Der Kosmische Riss ist nun vollständig stabilisiert und gesichert!",
      },
    },
  },
  it: {
    title: "Progresso Squarcio Cosmico!",
    confirmLabel: "CONFERMA",
    progressLabel: "Progresso complessivo verso la piena stabilizzazione: ",
    technologies: {
      stabilizerArray: {
        researchedPrefix: "Hai ricercato con successo la ",
        name: "Matrice Stabilizzatrice",
        explanation:
          "Questa tecnologia fondamentale riduce l'instabilità iniziale attorno allo Squarcio Cosmico, permettendo operazioni più sicure e ulteriori ricerche.",
        percentage: "20%",
      },
      quantumContainmentField: {
        researchedPrefix: "Hai ricercato con successo il ",
        name: "Campo di Contenimento Quantico",
        explanation:
          "Le barriere quantistiche avanzate ora prevengono la perdita di energia dallo Squarcio Cosmico, riducendo significativamente la volatilità nello spazio-tempo circostante.",
        percentage: "40%",
      },
      dimensionalAnchorMatrix: {
        researchedPrefix: "Hai ricercato con successo la ",
        name: "Matrice Ancoraggio Dimensionale",
        explanation:
          "Il tessuto dimensionale attorno allo Squarcio Cosmico è ora rinforzato, prevenendo spostamenti dimensionali indesiderati e assicurando la breccia.",
        percentage: "60%",
      },
      singularityStabilizer: {
        researchedPrefix: "Hai ricercato con successo lo ",
        name: "Stabilizzatore di Singolarità",
        explanation:
          "La singolarità gravitazionale nel cuore dello Squarcio Cosmico è ora sotto controllo, riducendo drasticamente i suoi effetti destabilizzanti.",
        percentage: "80%",
      },
      realityWeaveRegulator: {
        researchedPrefix: "Hai ricercato con successo il ",
        name: "Regolatore del Tessuto della Realtà",
        explanation:
          "L'ultimo strato di stabilizzazione è ora in posizione. Lo Squarcio Cosmico è stato trasformato da una pericolosa anomalia in un fenomeno controllato.",
        percentage: "100%",
        congratulations:
          "Congratulazioni! Lo Squarcio Cosmico è ora completamente stabilizzato e sicuro!",
      },
    },
  },
  fr: {
    title: "Progrès de la Déchirure Cosmique!",
    confirmLabel: "CONFIRMER",
    progressLabel: "Progrès global vers la stabilisation complète: ",
    technologies: {
      stabilizerArray: {
        researchedPrefix: "Tu as recherché avec succès la ",
        name: "Matrice Stabilisatrice",
        explanation:
          "Cette technologie fondamentale réduit l'instabilité initiale autour de la Déchirure Cosmique, permettant des opérations plus sûres et davantage de recherches.",
        percentage: "20%",
      },
      quantumContainmentField: {
        researchedPrefix: "Tu as recherché avec succès le ",
        name: "Champ de Confinement Quantique",
        explanation:
          "Les barrières quantiques avancées empêchent désormais les fuites d'énergie de la Déchirure Cosmique, réduisant considérablement la volatilité dans l'espace-temps environnant.",
        percentage: "40%",
      },
      dimensionalAnchorMatrix: {
        researchedPrefix: "Tu as recherché avec succès la ",
        name: "Matrice d'Ancrage Dimensionnel",
        explanation:
          "Le tissu dimensionnel autour de la Déchirure Cosmique est maintenant renforcé, empêchant les déplacements dimensionnels indésirables et sécurisant la brèche.",
        percentage: "60%",
      },
      singularityStabilizer: {
        researchedPrefix: "Tu as recherché avec succès le ",
        name: "Stabilisateur de Singularité",
        explanation:
          "La singularité gravitationnelle au cœur de la Déchirure Cosmique est maintenant sous contrôle, réduisant considérablement ses effets déstabilisants.",
        percentage: "80%",
      },
      realityWeaveRegulator: {
        researchedPrefix: "Tu as recherché avec succès le ",
        name: "Régulateur du Tissu de Réalité",
        explanation:
          "La couche finale de stabilisation est maintenant en place. La Déchirure Cosmique a été transformée d'une anomalie dangereuse en un phénomène contrôlé.",
        percentage: "100%",
        congratulations:
          "Félicitations! La Déchirure Cosmique est maintenant complètement stabilisée et sécurisée!",
      },
    },
  },
};

export function cosmicRipResearchResultDialog(
  locale: LocaleId,
  technologyId: CosmicRipTechnologyId,
): RandomEventDialogCopy {
  const localized = messages[locale];
  const technology = localized.technologies[technologyId];
  const remakeName = cosmicRipText(locale).technologyNames[technologyId];
  const technologyName = remakeName === technology.name ? remakeName : technology.name;
  const researchedLine: RandomEventDialogLine = {
    text: `${technology.researchedPrefix}${technologyName}${technology.researchedSuffix ?? ""}.`,
    parts: [
      { text: technology.researchedPrefix },
      { text: technologyName, tone: "green-ready-text" },
      { text: `${technology.researchedSuffix ?? ""}.` },
    ],
  };
  const progressLine: RandomEventDialogLine = {
    text: `${localized.progressLabel}${technology.percentage}`,
    parts: [
      { text: localized.progressLabel },
      { text: technology.percentage, tone: "green-ready-text" },
    ],
  };

  return {
    title: localized.title,
    // The source's first sentence is the first formatted line below. The shared
    // dialog copy shape requires a summary string, so leave its extra slot empty.
    summary: "",
    lines: [
      researchedLine,
      { text: technology.explanation },
      progressLine,
      ...(technology.congratulations
        ? [{ text: technology.congratulations, tone: "green-ready-text" as const }]
        : []),
    ],
    confirmLabel: localized.confirmLabel,
  };
}
