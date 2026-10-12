import type { LocaleId } from "../content/ids";
import type { CosmicRipTechnologyId, CosmicRipUpgradeId } from "../content/cosmicRip";
import type { CosmicRipFailure } from "../engine/cosmicRip";

export interface CosmicRipMessages {
  readonly title: string;
  readonly situationTitle: string;
  readonly scannerArrayTitle: string;
  readonly status: string;
  readonly stabilityLabel: string;
  readonly stabilityPercentage: string;
  readonly introduction: string;
  readonly headerHelp: string;
  readonly situationHelp: string;
  readonly scannerArrayHelp: string;
  readonly technologyHelp: string;
  readonly gp: string;
  readonly gpShort: string;
  readonly telemetry: string;
  readonly rate: string;
  readonly restoreScanner: string;
  readonly scannerRestored: string;
  readonly scannerRestoreFailedNotification: string;
  readonly scannerRestoredNotification: string;
  readonly sectorScanFoundNotification: string;
  readonly sectorScanEmptyNotification: string;
  readonly scanInstruction: string;
  readonly sector: string;
  readonly sectorScanned: string;
  readonly sectorFound: string;
  readonly ripFound: string;
  readonly ripMissing: string;
  readonly upgrades: string;
  readonly upgradeNames: Readonly<Record<CosmicRipUpgradeId, string>>;
  readonly purchase: string;
  readonly technologies: string;
  readonly technologyNames: Readonly<Record<CosmicRipTechnologyId, string>>;
  readonly technologyStatusMessages: Readonly<Record<CosmicRipTechnologyId, string>>;
  readonly fullyStabilised: string;
  readonly research: string;
  readonly researching: string;
  readonly remaining: string;
  readonly technologyResearchedNotification: string;
  readonly hidden: string;
  readonly requires: string;
  readonly closeRip: string;
  readonly closed: string;
  readonly errors: Readonly<Record<CosmicRipFailure["code"], string>>;
}

export type CosmicRipObjectiveId = "scan" | CosmicRipTechnologyId | "close";

export interface CosmicRipObjectiveMessages {
  readonly label: string;
  readonly objectives: Readonly<Record<CosmicRipObjectiveId, string>>;
}

const OBJECTIVES: Readonly<Record<LocaleId, CosmicRipObjectiveMessages>> = {
  en: {
    label: "Next Objective:",
    objectives: {
      scan: "Scan Local Sectors for the Cosmic Rip",
      stabilizerArray: "Build Stabilizer Array",
      quantumContainmentField: "Build Quantum Containment Field",
      dimensionalAnchorMatrix: "Build Dimensional Anchor Matrix",
      singularityStabilizer: "Build Singularity Stabilizer",
      realityWeaveRegulator: "Build Reality Weave Regulator",
      close: "Close the Cosmic Rip Forever and Secure your People!",
    },
  },
  es: {
    label: "Siguiente Objetivo:",
    objectives: {
      scan: "Escanear Sectores Locales para el Desgarro Cósmico",
      stabilizerArray: "Construir Matriz Estabilizadora",
      quantumContainmentField: "Construir Campo de Contención Cuántico",
      dimensionalAnchorMatrix: "Construir Matriz de Anclaje Dimensional",
      singularityStabilizer: "Construir Estabilizador de Singularidad",
      realityWeaveRegulator: "Construir Regulador de Tejido de Realidad",
      close: "¡Cierra el Desgarro Cósmico para Siempre y Asegura a tu Gente!",
    },
  },
  pt: {
    label: "Próximo Objetivo:",
    objectives: {
      scan: "Explorar os Setores Locais em Busca do Rasgo Cósmico",
      stabilizerArray: "Construir Matriz Estabilizadora",
      quantumContainmentField: "Construir Campo de Contenção Quântico",
      dimensionalAnchorMatrix: "Construir Matriz de Ancoragem Dimensional",
      singularityStabilizer: "Construir Estabilizador de Singularidade",
      realityWeaveRegulator: "Construir Regulador do Tecido da Realidade",
      close: "Fecha o Rasgo Cósmico para Sempre e Protege o Teu Povo!",
    },
  },
  de: {
    label: "Nächstes Ziel:",
    objectives: {
      scan: "Scanne Lokale Sektoren nach dem Kosmischen Riss",
      stabilizerArray: "Stabilisierungsarray Bauen",
      quantumContainmentField: "Quanten-Eindämmungsfeld Bauen",
      dimensionalAnchorMatrix: "Dimensionale Ankermatrix Bauen",
      singularityStabilizer: "Singularitätsstabilisator Bauen",
      realityWeaveRegulator: "Realitätsgewebe-Regler Bauen",
      close: "Schließe den Kosmischen Riss Für Immer und Sichere dein Volk!",
    },
  },
  it: {
    label: "Prossimo Obiettivo:",
    objectives: {
      scan: "Scansiona i Settori Locali per lo Squarcio Cosmico",
      stabilizerArray: "Costruisci Matrice Stabilizzatrice",
      quantumContainmentField: "Costruisci Campo di Contenimento Quantistico",
      dimensionalAnchorMatrix: "Costruisci Matrice di Ancoraggio Dimensionale",
      singularityStabilizer: "Costruisci Stabilizzatore di Singularità",
      realityWeaveRegulator: "Costruisci Regolatore di Tessuto di Realtà",
      close: "Chiudi lo Squarcio Cosmico per Sempre e Metti al Sicuro il tuo Popolo!",
    },
  },
  fr: {
    label: "Prochain Objectif:",
    objectives: {
      scan: "Scanner les Secteurs Locaux pour la Déchirure Cosmique",
      stabilizerArray: "Construire le Réseau de Stabilisateurs",
      quantumContainmentField: "Construire le Champ de Confinement Quantique",
      dimensionalAnchorMatrix: "Construire la Matrice d'Ancrage Dimensionnel",
      singularityStabilizer: "Construire le Stabilisateur de Singularité",
      realityWeaveRegulator: "Construire le Régulateur de Tissu de Réalité",
      close: "Fermez la Déchirure Cosmique Pour Toujours et Sécurisez votre Peuple!",
    },
  },
};

const ERRORS: Readonly<Record<LocaleId, Readonly<Record<CosmicRipFailure["code"], string>>>> = {
  en: {
    "cosmic-rip-locked": "The Cosmic Rip is still locked.",
    "cosmic-rip-home-required": "Settle Miaplacidus first.",
    "cosmic-rip-scanner-restored": "The scanner array is already restored.",
    "cosmic-rip-scanner-required": "Restore the Near Space Scanner Array first.",
    "cosmic-rip-sector-invalid": "That sector is unavailable.",
    "cosmic-rip-sector-scanned": "That sector has already been scanned.",
    "cosmic-rip-insufficient-gp": "You need more Galactic Points.",
    "cosmic-rip-insufficient-cost": "You do not have enough resources for that.",
    "cosmic-rip-not-found": "Scan the sectors to locate the rip.",
    "cosmic-rip-upgrade-invalid": "That telemetry upgrade is unavailable.",
    "cosmic-rip-research-running": "Finish the current research first.",
    "cosmic-rip-tech-locked": "Research the preceding technology first.",
    "cosmic-rip-tech-hidden": "This technology has not appeared yet.",
    "cosmic-rip-tech-researched": "This technology is already researched.",
    "cosmic-rip-close-incomplete": "Research all five technologies first.",
    "cosmic-rip-already-closed": "The Cosmic Rip is already closed.",
  },
  es: {
    "cosmic-rip-locked": "La Fisura Cósmica sigue bloqueada.",
    "cosmic-rip-home-required": "Asienta primero Miaplacidus.",
    "cosmic-rip-scanner-restored": "El conjunto de escáneres ya está restaurado.",
    "cosmic-rip-scanner-required": "Restaura primero el conjunto de escáneres del espacio cercano.",
    "cosmic-rip-sector-invalid": "Ese sector no está disponible.",
    "cosmic-rip-sector-scanned": "Ese sector ya se ha explorado.",
    "cosmic-rip-insufficient-gp": "Necesitas más puntos galácticos.",
    "cosmic-rip-insufficient-cost": "No tienes suficientes recursos.",
    "cosmic-rip-not-found": "Explora los sectores para localizar la fisura.",
    "cosmic-rip-upgrade-invalid": "Esa mejora de telemetría no está disponible.",
    "cosmic-rip-research-running": "Termina la investigación actual primero.",
    "cosmic-rip-tech-locked": "Investiga primero la tecnología anterior.",
    "cosmic-rip-tech-hidden": "Esta tecnología aún no ha aparecido.",
    "cosmic-rip-tech-researched": "Esta tecnología ya está investigada.",
    "cosmic-rip-close-incomplete": "Investiga primero las cinco tecnologías.",
    "cosmic-rip-already-closed": "La Fisura Cósmica ya está cerrada.",
  },
  pt: {
    "cosmic-rip-locked": "A Fenda Cósmica ainda está bloqueada.",
    "cosmic-rip-home-required": "Estabeleça Miaplacidus primeiro.",
    "cosmic-rip-scanner-restored": "O conjunto de scanners já foi restaurado.",
    "cosmic-rip-scanner-required": "Restaure primeiro o conjunto de scanners do espaço próximo.",
    "cosmic-rip-sector-invalid": "Esse setor não está disponível.",
    "cosmic-rip-sector-scanned": "Esse setor já foi examinado.",
    "cosmic-rip-insufficient-gp": "Você precisa de mais Pontos Galácticos.",
    "cosmic-rip-insufficient-cost": "Você não tem recursos suficientes.",
    "cosmic-rip-not-found": "Examine os setores para localizar a fenda.",
    "cosmic-rip-upgrade-invalid": "Essa melhoria de telemetria não está disponível.",
    "cosmic-rip-research-running": "Conclua a pesquisa atual primeiro.",
    "cosmic-rip-tech-locked": "Pesquise a tecnologia anterior primeiro.",
    "cosmic-rip-tech-hidden": "Essa tecnologia ainda não apareceu.",
    "cosmic-rip-tech-researched": "Essa tecnologia já foi pesquisada.",
    "cosmic-rip-close-incomplete": "Pesquise as cinco tecnologias primeiro.",
    "cosmic-rip-already-closed": "A Fenda Cósmica já está fechada.",
  },
  de: {
    "cosmic-rip-locked": "Der Kosmische Riss ist noch gesperrt.",
    "cosmic-rip-home-required": "Siedle zuerst Miaplacidus.",
    "cosmic-rip-scanner-restored": "Das Scannerarray ist bereits repariert.",
    "cosmic-rip-scanner-required": "Repariere zuerst das Nahraum-Scannerarray.",
    "cosmic-rip-sector-invalid": "Dieser Sektor ist nicht verfügbar.",
    "cosmic-rip-sector-scanned": "Dieser Sektor wurde bereits gescannt.",
    "cosmic-rip-insufficient-gp": "Du brauchst mehr Galaktische Punkte.",
    "cosmic-rip-insufficient-cost": "Du hast nicht genug Ressourcen.",
    "cosmic-rip-not-found": "Scanne die Sektoren, um den Riss zu finden.",
    "cosmic-rip-upgrade-invalid": "Dieses Telemetrieupgrade ist nicht verfügbar.",
    "cosmic-rip-research-running": "Schließe zuerst die laufende Forschung ab.",
    "cosmic-rip-tech-locked": "Erforsche zuerst die vorherige Technologie.",
    "cosmic-rip-tech-hidden": "Diese Technologie ist noch nicht aufgetaucht.",
    "cosmic-rip-tech-researched": "Diese Technologie ist bereits erforscht.",
    "cosmic-rip-close-incomplete": "Erforsche zuerst alle fünf Technologien.",
    "cosmic-rip-already-closed": "Der Kosmische Riss ist bereits geschlossen.",
  },
  it: {
    "cosmic-rip-locked": "Lo Strappo cosmico è ancora bloccato.",
    "cosmic-rip-home-required": "Insedia prima Miaplacidus.",
    "cosmic-rip-scanner-restored": "L'array di scanner è già stato ripristinato.",
    "cosmic-rip-scanner-required": "Ripristina prima l'array di scanner dello spazio vicino.",
    "cosmic-rip-sector-invalid": "Questo settore non è disponibile.",
    "cosmic-rip-sector-scanned": "Questo settore è già stato scansionato.",
    "cosmic-rip-insufficient-gp": "Servono più Punti Galattici.",
    "cosmic-rip-insufficient-cost": "Non hai risorse sufficienti.",
    "cosmic-rip-not-found": "Scansiona i settori per trovare lo strappo.",
    "cosmic-rip-upgrade-invalid": "Questo potenziamento telemetrico non è disponibile.",
    "cosmic-rip-research-running": "Completa prima la ricerca in corso.",
    "cosmic-rip-tech-locked": "Ricerca prima la tecnologia precedente.",
    "cosmic-rip-tech-hidden": "Questa tecnologia non è ancora comparsa.",
    "cosmic-rip-tech-researched": "Questa tecnologia è già stata studiata.",
    "cosmic-rip-close-incomplete": "Studia prima tutte e cinque le tecnologie.",
    "cosmic-rip-already-closed": "Lo Strappo cosmico è già chiuso.",
  },
  fr: {
    "cosmic-rip-locked": "La Déchirure cosmique est encore verrouillée.",
    "cosmic-rip-home-required": "Colonisez d'abord Miaplacidus.",
    "cosmic-rip-scanner-restored": "Le réseau de scanners est déjà réparé.",
    "cosmic-rip-scanner-required": "Réparez d'abord le réseau de scanners de l'espace proche.",
    "cosmic-rip-sector-invalid": "Ce secteur n'est pas disponible.",
    "cosmic-rip-sector-scanned": "Ce secteur a déjà été scanné.",
    "cosmic-rip-insufficient-gp": "Il vous faut plus de points galactiques.",
    "cosmic-rip-insufficient-cost": "Vous n'avez pas assez de ressources.",
    "cosmic-rip-not-found": "Scannez les secteurs pour localiser la déchirure.",
    "cosmic-rip-upgrade-invalid": "Cette amélioration de télémétrie est indisponible.",
    "cosmic-rip-research-running": "Terminez d'abord la recherche en cours.",
    "cosmic-rip-tech-locked": "Recherchez d'abord la technologie précédente.",
    "cosmic-rip-tech-hidden": "Cette technologie n'est pas encore apparue.",
    "cosmic-rip-tech-researched": "Cette technologie est déjà recherchée.",
    "cosmic-rip-close-incomplete": "Recherchez d'abord les cinq technologies.",
    "cosmic-rip-already-closed": "La Déchirure cosmique est déjà fermée.",
  },
};

type CosmicRipTechnologyDescriptions = Readonly<Record<CosmicRipTechnologyId, string>>;

const TECHNOLOGY_DESCRIPTIONS: Readonly<Record<LocaleId, CosmicRipTechnologyDescriptions>> = {
  en: {
    stabilizerArray: "Build a Stabilizer Array to reduce instability and permit further operations safely.",
    quantumContainmentField: "Generate quantum fields to contain the rip's dimensional bleed.",
    dimensionalAnchorMatrix: "Anchor local reality to prevent dimensional drift from the rip.",
    singularityStabilizer: "Stabilize the gravitational singularity at the rip's core.",
    realityWeaveRegulator: "Regulate the fabric of reality around the cosmic rip.",
  },
  es: {
    stabilizerArray: "Construye una Matriz Estabilizadora para reducir la inestabilidad y permitir operaciones adicionales de manera segura.",
    quantumContainmentField: "Genera campos cuánticos para contener la hemorragia dimensional del desgarro.",
    dimensionalAnchorMatrix: "Ancla la realidad local para prevenir la deriva dimensional del desgarro.",
    singularityStabilizer: "Estabiliza la singularidad gravitacional en el núcleo del desgarro.",
    realityWeaveRegulator: "Regula el tejido de la realidad alrededor del desgarro cósmico.",
  },
  pt: {
    stabilizerArray: "Construa uma Matriz Estabilizadora para reduzir a instabilidade e permitir operações adicionais com segurança.",
    quantumContainmentField: "Gere campos quânticos para conter o vazamento dimensional da ruptura.",
    dimensionalAnchorMatrix: "Ancore a realidade local para evitar a deriva dimensional da ruptura.",
    singularityStabilizer: "Estabilize a singularidade gravitacional no núcleo da ruptura.",
    realityWeaveRegulator: "Regule o tecido da realidade ao redor da ruptura cósmica.",
  },
  de: {
    stabilizerArray: "Baue ein Stabilisierungsarray, um die Instabilität zu reduzieren und weitere Operationen sicher zu ermöglichen.",
    quantumContainmentField: "Erzeuge Quantenfelder, um die dimensionale Blutung des Risses zu enthalten.",
    dimensionalAnchorMatrix: "Verankere die lokale Realität, um dimensionale Abdrift vom Riss zu verhindern.",
    singularityStabilizer: "Stabilisiere die Gravitationssingularität im Kern des Risses.",
    realityWeaveRegulator: "Reguliere den Stoff der Realität um den kosmischen Riss.",
  },
  it: {
    stabilizerArray: "Costruisci una Matrice Stabilizzatrice per ridurre l'instabilità e permettere ulteriori operazioni in sicurezza.",
    quantumContainmentField: "Genera campi quantistici per contenere la fuoriuscita dimensionale dello squarcio.",
    dimensionalAnchorMatrix: "Ancora la realtà locale per prevenire la deriva dimensionale dallo squarcio.",
    singularityStabilizer: "Stabilizza la singolarità gravitazionale al nucleo dello squarcio.",
    realityWeaveRegulator: "Regola il tessuto della realtà intorno allo squarcio cosmico.",
  },
  fr: {
    stabilizerArray: "Construit une Matrice Stabilisatrice pour réduire l'instabilité et permettre d'autres opérations en toute sécurité.",
    quantumContainmentField: "Génère des champs quantiques pour contenir le saignement dimensionnel de la déchirure.",
    dimensionalAnchorMatrix: "Ancre la réalité locale pour empêcher la dérive dimensionnelle de la déchirure.",
    singularityStabilizer: "Stabilise la singularité gravitationnelle au cœur de la déchirure.",
    realityWeaveRegulator: "Régule le tissu de la réalité autour de la déchirure cosmique.",
  },
};

export function cosmicRipTechnologyDescription(
  locale: LocaleId,
  technology: CosmicRipTechnologyId,
): string {
  return TECHNOLOGY_DESCRIPTIONS[locale][technology];
}

type CosmicRipUpgradeDescriptions = Readonly<Record<CosmicRipUpgradeId, string>>;

const UPGRADE_DESCRIPTIONS: Readonly<Record<LocaleId, CosmicRipUpgradeDescriptions>> = {
  en: {
    sensorBuoy: "Deploy a buoy to begin passively collecting rip telemetry.",
    ripResearchOrbiter: "Deploy an orbiter to conduct advanced rip research and unlock new technologies.",
  },
  es: {
    sensorBuoy: "Despliega una boya para comenzar a recolectar pasivamente telemetr\u00eda del desgarro.",
    ripResearchOrbiter: "Despliega un orbitador para realizar investigaci\u00f3n avanzada del desgarro y desbloquear nuevas tecnolog\u00edas.",
  },
  pt: {
    sensorBuoy: "Implante uma boia para come\u00e7ar a coletar passivamente dados de telemetria da ruptura.",
    ripResearchOrbiter: "Implante um orbitador para realizar pesquisas avan\u00e7adas sobre a ruptura e desbloquear novas tecnologias.",
  },
  de: {
    sensorBuoy: "Setze eine Boje ein, um passiv Riss-Telemetrie zu sammeln.",
    ripResearchOrbiter: "Setze einen Orbiter ein, um fortgeschrittene Rissforschung zu betreiben und neue Technologien freizuschalten.",
  },
  it: {
    sensorBuoy: "Distribuisci una boa per iniziare a raccogliere passivamente la telemetria dello squarcio.",
    ripResearchOrbiter: "Distribuisci un orbitatore per condurre ricerche avanzate sullo squarcio e sbloccare nuove tecnologie.",
  },
  fr: {
    sensorBuoy: "D\u00e9ploie une bou\u00e9e pour commencer \u00e0 collecter passivement la t\u00e9l\u00e9m\u00e9trie de la d\u00e9chirure.",
    ripResearchOrbiter: "D\u00e9ploie un orbiteur pour mener des recherches avanc\u00e9es sur la d\u00e9chirure et d\u00e9bloquer de nouvelles technologies.",
  },
};

export function cosmicRipUpgradeDescription(locale: LocaleId, upgrade: CosmicRipUpgradeId): string {
  return UPGRADE_DESCRIPTIONS[locale][upgrade];
}

const STATUS_DESCRIPTIONS: Record<LocaleId, string> = {
  en: "The Cosmic Rip has been discovered through our advanced scanning efforts, and now we must stabilise and secure it.",
  es: "El Desgarro C\u00f3smico ha sido descubierto mediante nuestros avanzados esfuerzos de escaneo, y ahora debemos estabilizarlo y asegurarlo.",
  pt: "A Ruptura C\u00f3smica foi descoberta por meio de nossos avan\u00e7ados esfor\u00e7os de varredura, e agora precisamos estabiliz\u00e1-la e proteg\u00ea-la.",
  de: "Der Kosmische Riss wurde durch unsere fortschrittlichen Scanbem\u00fchungen entdeckt, und jetzt m\u00fcssen wir ihn stabilisieren und sichern.",
  it: "Lo Squarcio Cosmico \u00e8 stato scoperto attraverso i nostri avanzati sforzi di scansione, e ora dobbiamo stabilizzarlo e proteggerlo.",
  fr: "La D\u00e9chirure Cosmique a \u00e9t\u00e9 d\u00e9couverte gr\u00e2ce \u00e0 nos efforts avanc\u00e9s de scan, et maintenant nous devons la stabiliser et la s\u00e9curiser.",
};

export function cosmicRipStatusDescription(locale: LocaleId): string {
  return STATUS_DESCRIPTIONS[locale];
}

const MESSAGES: Record<LocaleId, CosmicRipMessages> = {
  en: {
    title: "Cosmic Rip",
    situationTitle: "Situation",
    scannerArrayTitle: "Near Space Scanner Array",
    status: "Endgame",
    stabilityLabel: "Cosmic Rip",
    stabilityPercentage: "{percentage}% Stabilised",
    introduction: "The Miaplacidus transmission reveals a disturbance beyond known space.",
    headerHelp: "Once located, you undertake studies and construction around the Cosmic Rip to stabilise it for manipulation and closure, securing the future of your people. This is where you carry out those studies; they are costly and take time.",
    situationHelp: "Cosmic Rip operations and progression.",
    scannerArrayHelp:
      "Commission the Near Space Scanner Array, scan sectors to locate distortions, and pinpoint the Cosmic Rip.",
    technologyHelp:
      "Investigate and Research how to stabilise and secure the Cosmic Rip once located.",
    gp: "Galactic Points",
    gpShort: "GP",
    telemetry: "Rip telemetry",
    rate: "Telemetry rate",
    restoreScanner: "Restore Near Space Scanner Array",
    scannerRestored: "Near Space Scanner Array restored.",
    scannerRestoreFailedNotification: "Unable to restore Near Space Scanner Array.",
    scannerRestoredNotification: "Near Space Scanner Array restored.",
    sectorScanFoundNotification: "Scan complete! Cosmic Rip located in sector {sector}",
    sectorScanEmptyNotification: "Scan complete! Nothing significant found in sector {sector}",
    scanInstruction: "Scan each sector for 1 Galactic Point.",
    sector: "Sector",
    sectorScanned: "Scanned",
    sectorFound: "Rip located",
    ripFound: "The Cosmic Rip has been located. Build telemetry to research its five technologies.",
    ripMissing: "The signal is not in this sector.",
    upgrades: "Telemetry network",
    upgradeNames: { sensorBuoy: "Sensor Buoy", ripResearchOrbiter: "Rip Research Orbiter" },
    purchase: "Purchase",
    technologies: "Containment research",
    technologyNames: {
      stabilizerArray: "Stabilizer Array",
      quantumContainmentField: "Quantum Containment Field",
      dimensionalAnchorMatrix: "Dimensional Anchor Matrix",
      singularityStabilizer: "Singularity Stabilizer",
      realityWeaveRegulator: "Reality Weave Regulator",
    },
    technologyStatusMessages: {
      stabilizerArray: "Stabiliser Array Built",
      quantumContainmentField: "Quantum Containment Field Generated",
      dimensionalAnchorMatrix: "Dimensional Anchor Matrix Built",
      singularityStabilizer: "Singularity Stabilizer Constructed",
      realityWeaveRegulator: "Reality Weave Regulator Built",
    },
    fullyStabilised: "Cosmic Rip Fully Stabilised and Secured",
    research: "Research",
    researching: "Researching",
    remaining: "Time remaining: {time}",
    technologyResearchedNotification: "{technology} Researched!",
    hidden: "Appears at {amount} telemetry",
    requires: "Requires {name}",
    closeRip: "Close Cosmic Rip",
    closed:
      "Congratulations, Mia'Plac! The future of your people is secured forever. You have fulfilled your prophecy!",
    errors: ERRORS.en,
  },
  es: {
    title: "Fisura cósmica",
    situationTitle: "Situación",
    scannerArrayTitle: "Conjunto de escáneres del espacio cercano",
    status: "Final",
    stabilityLabel: "Desgarro Cósmico",
    stabilityPercentage: "{percentage}% Estabilizado",
    introduction:
      "La transmisión de Miaplacidus revela una anomalía más allá del espacio conocido.",
    headerHelp: "Una vez localizado, emprendes estudios y construcciones alrededor del Desgarro Cósmico para estabilizarlo antes de manipularlo y cerrarlo, y así asegurar el futuro de tu pueblo. Aquí realizas esos estudios; son costosos y requieren tiempo.",
    situationHelp: "Operaciones y progresión del Desgarro Cósmico.",
    scannerArrayHelp:
      "Encarga el Arreglo de Escáner de Espacio Cercano, escanea sectores para localizar distorsiones, y precisar el Desgarro Cósmico.",
    technologyHelp:
      "Investiga e investiga cómo estabilizar y asegurar el Desgarro Cósmico una vez localizado.",
    gp: "Puntos galácticos",
    gpShort: "PG",
    telemetry: "Telemetría de la fisura",
    rate: "Ritmo de telemetría",
    restoreScanner: "Restaurar el conjunto de escáneres",
    scannerRestored: "Conjunto de escáneres del espacio cercano restaurado.",
    scannerRestoreFailedNotification:
      "No se puede restaurar la Matriz de Escáner del Espacio Cercano.",
    scannerRestoredNotification: "Matriz de Escáner del Espacio Cercano restaurada.",
    sectorScanFoundNotification:
      "¡Escaneo completo! Desgarro Cósmico localizado en el sector {sector}",
    sectorScanEmptyNotification:
      "¡Escaneo completo! No se ha encontrado nada relevante en el sector {sector}",
    scanInstruction: "Explora cada sector por 1 Punto Galáctico.",
    sector: "Sector",
    sectorScanned: "Explorado",
    sectorFound: "Fisura localizada",
    ripFound:
      "La Fisura Cósmica está localizada. Genera telemetría para investigar sus cinco tecnologías.",
    ripMissing: "La señal no está en este sector.",
    upgrades: "Red de telemetría",
    upgradeNames: {
      sensorBuoy: "Boya sensora",
      ripResearchOrbiter: "Orbitador de investigación de la fisura",
    },
    purchase: "Comprar",
    technologies: "Investigación de contención",
    technologyNames: {
      stabilizerArray: "Matriz estabilizadora",
      quantumContainmentField: "Campo de contención cuántica",
      dimensionalAnchorMatrix: "Matriz de anclaje dimensional",
      singularityStabilizer: "Estabilizador de singularidad",
      realityWeaveRegulator: "Regulador de tejido de realidad",
    },
    technologyStatusMessages: {
      stabilizerArray: "Matriz Estabilizadora Construida",
      quantumContainmentField: "Campo de Contención Cuántico Generado",
      dimensionalAnchorMatrix: "Matriz de Anclaje Dimensional Construida",
      singularityStabilizer: "Estabilizador de Singularidad Construido",
      realityWeaveRegulator: "Regulador de Tejido de Realidad Construido",
    },
    fullyStabilised: "Desgarro Cósmico Completamente Estabilizado y Asegurado",
    research: "Investigar",
    researching: "Investigando",
    remaining: "Tiempo restante: {time}",
    technologyResearchedNotification: "¡{technology} investigado!",
    hidden: "Aparece con {amount} de telemetría",
    requires: "Requiere {name}",
    closeRip: "Cerrar la Fisura Cósmica",
    closed:
      "¡Felicidades, Mia'Plac! El futuro de tu pueblo está asegurado para siempre. ¡Has cumplido tu profecía!",
    errors: ERRORS.es,
  },
  pt: {
    title: "Fenda cósmica",
    situationTitle: "Situação",
    scannerArrayTitle: "Conjunto de scanners do espaço próximo",
    status: "Fim de jogo",
    stabilityLabel: "Rutura Cósmica",
    stabilityPercentage: "{percentage}% Estabilizado",
    introduction: "A transmissão de Miaplacidus revela uma anomalia além do espaço conhecido.",
    headerHelp: "Depois de localizada, iniciarás estudos e construções em torno da Fenda Cósmica para a estabilizar antes da manipulação e do encerramento, garantindo o futuro do teu povo. É aqui que conduzes esses estudos; são dispendiosos e levam tempo.",
    situationHelp: "Operações e progressão do Rasgo Cósmico.",
    scannerArrayHelp:
      "Encomenda o Conjunto de Scanners do Espaço Próximo, explora setores para localizar distorções e determinar a localização do Rasgo Cósmico.",
    technologyHelp:
      "Investiga e descobre como estabilizar e assegurar o Rasgo Cósmico depois de o localizar.",
    gp: "Pontos Galácticos",
    gpShort: "PG",
    telemetry: "Telemetria da fenda",
    rate: "Taxa de telemetria",
    restoreScanner: "Restaurar o conjunto de scanners",
    scannerRestored: "Conjunto de scanners do espaço próximo restaurado.",
    scannerRestoreFailedNotification:
      "Não é possível restaurar a Matriz de Scanners do Espaço Próximo.",
    scannerRestoredNotification: "Matriz de Scanners do Espaço Próximo restaurada.",
    sectorScanFoundNotification: "Análise concluída! Rutura Cósmica localizada no setor {sector}",
    sectorScanEmptyNotification:
      "Análise concluída! Não foi encontrado nada relevante no setor {sector}",
    scanInstruction: "Examine cada setor por 1 Ponto Galáctico.",
    sector: "Setor",
    sectorScanned: "Examinado",
    sectorFound: "Fenda localizada",
    ripFound:
      "A Fenda Cósmica foi localizada. Gere telemetria para pesquisar as cinco tecnologias.",
    ripMissing: "O sinal não está neste setor.",
    upgrades: "Rede de telemetria",
    upgradeNames: {
      sensorBuoy: "Boia de sensores",
      ripResearchOrbiter: "Orbitador de pesquisa da fenda",
    },
    purchase: "Comprar",
    technologies: "Pesquisa de contenção",
    technologyNames: {
      stabilizerArray: "Matriz estabilizadora",
      quantumContainmentField: "Campo de contenção quântica",
      dimensionalAnchorMatrix: "Matriz de ancoragem dimensional",
      singularityStabilizer: "Estabilizador de singularidade",
      realityWeaveRegulator: "Regulador de trama da realidade",
    },
    technologyStatusMessages: {
      stabilizerArray: "Matriz Estabilizadora Construída",
      quantumContainmentField: "Campo de Contenção Quântico Gerado",
      dimensionalAnchorMatrix: "Matriz de Ancoragem Dimensional Construída",
      singularityStabilizer: "Estabilizador de Singularidade Construído",
      realityWeaveRegulator: "Regulador do Tecido da Realidade Construído",
    },
    fullyStabilised: "Rasgo Cósmico Completamente Estabilizado e Assegurado",
    research: "Investigar",
    researching: "Pesquisando",
    remaining: "Tempo restante: {time}",
    technologyResearchedNotification: "{technology} investigado!",
    hidden: "Surge com {amount} de telemetria",
    requires: "Requer {name}",
    closeRip: "Fechar a Fenda Cósmica",
    closed: "Parabéns, Mia'Plac! O futuro do teu povo está assegurado para sempre. Cumpriste a tua profecia!",
    errors: ERRORS.pt,
  },
  de: {
    title: "Kosmischer Riss",
    situationTitle: "Lage",
    scannerArrayTitle: "Nahraum-Scannerarray",
    status: "Endspiel",
    stabilityLabel: "Kosmischer Riss",
    stabilityPercentage: "{percentage}% Stabilisiert",
    introduction:
      "Die Übertragung von Miaplacidus enthüllt eine Störung jenseits des bekannten Raums.",
    headerHelp: "Nach der Ortung führst du Studien und Bauarbeiten am Kosmischen Riss durch, um ihn für Manipulation und Schließung zu stabilisieren und die Zukunft deines Volkes zu sichern. Hier kannst du diese kostspieligen und zeitaufwendigen Studien durchführen.",
    situationHelp: "Kosmische Riss-Operationen und Fortschritt.",
    scannerArrayHelp:
      "Beauftrage das Nahraum-Scanner-Array, scanne Sektoren, um Verzerrungen zu lokalisieren und den Kosmischen Riss zu präzisieren.",
    technologyHelp:
      "Untersuche und erforsche, wie der Kosmische Riss einmal lokalisiert stabilisiert und gesichert werden kann.",
    gp: "Galaktische Punkte",
    gpShort: "GP",
    telemetry: "Riss-Telemetrie",
    rate: "Telemetrierate",
    restoreScanner: "Nahraum-Scannerarray reparieren",
    scannerRestored: "Nahraum-Scannerarray repariert.",
    scannerRestoreFailedNotification:
      "Das Nahbereichs-Scanner-Array kann nicht wiederhergestellt werden.",
    scannerRestoredNotification: "Nahbereichs-Scanner-Array wiederhergestellt.",
    sectorScanFoundNotification: "Scan abgeschlossen! Kosmischer Riss in Sektor {sector} geortet",
    sectorScanEmptyNotification:
      "Scan abgeschlossen! Nichts Bedeutendes in Sektor {sector} gefunden",
    scanInstruction: "Scanne jeden Sektor für 1 Galaktischen Punkt.",
    sector: "Sektor",
    sectorScanned: "Gescannte",
    sectorFound: "Riss gefunden",
    ripFound:
      "Der Kosmische Riss wurde lokalisiert. Erzeuge Telemetrie für die Erforschung seiner fünf Technologien.",
    ripMissing: "Das Signal ist nicht in diesem Sektor.",
    upgrades: "Telemetrienetz",
    upgradeNames: { sensorBuoy: "Sensorboje", ripResearchOrbiter: "Riss-Forschungsorbiter" },
    purchase: "Kaufen",
    technologies: "Eindämmungsforschung",
    technologyNames: {
      stabilizerArray: "Stabilisatorarray",
      quantumContainmentField: "Quanten-Eindämmungsfeld",
      dimensionalAnchorMatrix: "Dimensionsankermatrix",
      singularityStabilizer: "Singularitätsstabilisator",
      realityWeaveRegulator: "Realitätsgeweberegler",
    },
    technologyStatusMessages: {
      stabilizerArray: "Stabilisierungsarray Gebaut",
      quantumContainmentField: "Quanten-Eindämmungsfeld Generiert",
      dimensionalAnchorMatrix: "Dimensionale Ankermatrix Gebaut",
      singularityStabilizer: "Singularitätsstabilisator Konstruiert",
      realityWeaveRegulator: "Realitätsgewebe-Regler Gebaut",
    },
    fullyStabilised: "Kosmischer Riss Vollständig Stabilisiert und Gesichert",
    research: "Erforschen",
    researching: "Forschung läuft",
    remaining: "Verbleibend: {time}",
    technologyResearchedNotification: "{technology} erforscht!",
    hidden: "Erscheint bei {amount} Telemetrie",
    requires: "Benötigt {name}",
    closeRip: "Kosmischen Riss schließen",
    closed:
      "Herzlichen Glückwunsch, Mia'Plac! Die Zukunft deines Volkes ist für immer gesichert. Du hast deine Prophezeiung erfüllt!",
    errors: ERRORS.de,
  },
  it: {
    title: "Strappo cosmico",
    situationTitle: "Situazione",
    scannerArrayTitle: "Array di scanner dello spazio vicino",
    status: "Finale",
    stabilityLabel: "Strappo Cosmico",
    stabilityPercentage: "{percentage}% Stabilizzato",
    introduction: "La trasmissione di Miaplacidus rivela un'anomalia oltre lo spazio conosciuto.",
    headerHelp: "Una volta localizzato, intraprendi studi e costruzioni intorno allo Squarcio Cosmico per stabilizzarlo in vista della manipolazione e della chiusura, assicurando il futuro del tuo popolo. Qui svolgi questi studi, che sono costosi e richiedono tempo.",
    situationHelp: "Operazioni e progresso dello Squarcio Cosmico.",
    scannerArrayHelp:
      "Commissiona l'Array di Scanner Spazio Vicino, scansiona settori per localizzare distorsioni, e precisare lo Squarcio Cosmico.",
    technologyHelp:
      "Investiga e ricerca come stabilizzare e assicurare lo Squarcio Cosmico una volta localizzato.",
    gp: "Punti Galattici",
    gpShort: "PG",
    telemetry: "Telemetria dello strappo",
    rate: "Velocità telemetrica",
    restoreScanner: "Ripristina l'array di scanner",
    scannerRestored: "Array di scanner dello spazio vicino ripristinato.",
    scannerRestoreFailedNotification: "Impossibile ripristinare l'Array Scanner Spazio Vicino.",
    scannerRestoredNotification: "Array Scanner Spazio Vicino ripristinato.",
    sectorScanFoundNotification:
      "Scansione completata! Strappo Cosmico localizzato nel settore {sector}",
    sectorScanEmptyNotification:
      "Scansione completata! Nulla di rilevante trovato nel settore {sector}",
    scanInstruction: "Scansiona ogni settore per 1 Punto Galattico.",
    sector: "Settore",
    sectorScanned: "Scansionato",
    sectorFound: "Strappo localizzato",
    ripFound:
      "Lo Strappo cosmico è stato localizzato. Genera telemetria per studiare le sue cinque tecnologie.",
    ripMissing: "Il segnale non è in questo settore.",
    upgrades: "Rete telemetrica",
    upgradeNames: {
      sensorBuoy: "Boa sensore",
      ripResearchOrbiter: "Orbitale di ricerca dello strappo",
    },
    purchase: "Acquista",
    technologies: "Ricerca sul contenimento",
    technologyNames: {
      stabilizerArray: "Matrice stabilizzatrice",
      quantumContainmentField: "Campo di contenimento quantistico",
      dimensionalAnchorMatrix: "Matrice di ancoraggio dimensionale",
      singularityStabilizer: "Stabilizzatore di singolarità",
      realityWeaveRegulator: "Regolatore del tessuto della realtà",
    },
    technologyStatusMessages: {
      stabilizerArray: "Matrice Stabilizzatrice Costruita",
      quantumContainmentField: "Campo di Contenimento Quantistico Generato",
      dimensionalAnchorMatrix: "Matrice di Ancoraggio Dimensionale Costruita",
      singularityStabilizer: "Stabilizzatore di Singularità Costruito",
      realityWeaveRegulator: "Regolatore di Tessuto di Realtà Costruito",
    },
    fullyStabilised: "Squarcio Cosmico Completamente Stabilizzato e Sicuro",
    research: "Ricerca",
    researching: "Ricerca in corso",
    remaining: "Tempo rimanente: {time}",
    technologyResearchedNotification: "{technology} ricercato!",
    hidden: "Appare con {amount} di telemetria",
    requires: "Richiede {name}",
    closeRip: "Chiudi lo Strappo cosmico",
    closed:
      "Congratulazioni, Mia'Plac! Il futuro del tuo popolo è assicurato per sempre. Hai adempiuto alla tua profezia!",
    errors: ERRORS.it,
  },
  fr: {
    title: "Déchirure cosmique",
    situationTitle: "Situation",
    scannerArrayTitle: "Réseau de scanners de l'espace proche",
    status: "Fin de partie",
    stabilityLabel: "Déchirure Cosmique",
    stabilityPercentage: "{percentage}% Stabilisée",
    introduction: "La transmission de Miaplacidus révèle une anomalie au-delà de l'espace connu.",
    headerHelp: "Une fois la Déchirure cosmique localisée, vous menez des études et des travaux pour la stabiliser avant manipulation et fermeture, afin de garantir le futur de votre peuple. Les études ont lieu ici; elles sont coûteuses et prennent du temps.",
    situationHelp: "Opérations et progression de la Déchirure Cosmique.",
    scannerArrayHelp:
      "Commissionne le Réseau de Scanners de l'Espace Proche, scanne les secteurs pour localiser les distorsions, et préciser la Déchirure Cosmique.",
    technologyHelp:
      "Enquête et recherche comment stabiliser et sécuriser la Déchirure Cosmique une fois localisée.",
    gp: "Points galactiques",
    gpShort: "PG",
    telemetry: "Télémétrie de la déchirure",
    rate: "Débit de télémétrie",
    restoreScanner: "Réparer le réseau de scanners",
    scannerRestored: "Réseau de scanners de l'espace proche réparé.",
    scannerRestoreFailedNotification:
      "Impossible de restaurer le Réseau de Scanners du Secteur Proche.",
    scannerRestoredNotification: "Réseau de Scanners du Secteur Proche restauré.",
    sectorScanFoundNotification:
      "Scan terminé! Déchirure Cosmique localisée dans le secteur {sector}",
    sectorScanEmptyNotification:
      "Scan terminé! Rien de significatif trouvé dans le secteur {sector}",
    scanInstruction: "Scannez chaque secteur pour 1 point galactique.",
    sector: "Secteur",
    sectorScanned: "Scanné",
    sectorFound: "Déchirure localisée",
    ripFound:
      "La Déchirure cosmique est localisée. Produisez de la télémétrie pour rechercher ses cinq technologies.",
    ripMissing: "Le signal n'est pas dans ce secteur.",
    upgrades: "Réseau de télémétrie",
    upgradeNames: {
      sensorBuoy: "Balise sensorielle",
      ripResearchOrbiter: "Orbiteur de recherche de la déchirure",
    },
    purchase: "Acheter",
    technologies: "Recherche de confinement",
    technologyNames: {
      stabilizerArray: "Réseau stabilisateur",
      quantumContainmentField: "Champ de confinement quantique",
      dimensionalAnchorMatrix: "Matrice d'ancrage dimensionnel",
      singularityStabilizer: "Stabilisateur de singularité",
      realityWeaveRegulator: "Régulateur du tissu de la réalité",
    },
    technologyStatusMessages: {
      stabilizerArray: "Réseau de Stabilisateurs Construit",
      quantumContainmentField: "Champ de Confinement Quantique Généré",
      dimensionalAnchorMatrix: "Matrice d'Ancrage Dimensionnel Construit",
      singularityStabilizer: "Stabilisateur de Singularité Construit",
      realityWeaveRegulator: "Régulateur de Tissu de Réalité Construit",
    },
    fullyStabilised: "Déchirure Cosmique Entièrement Stabilisée et Sécurisée",
    research: "Rechercher",
    researching: "Recherche en cours",
    remaining: "Temps restant : {time}",
    technologyResearchedNotification: "{technology} recherché!",
    hidden: "Apparaît à {amount} de télémétrie",
    requires: "Nécessite {name}",
    closeRip: "Fermer la Déchirure cosmique",
    closed:
      "Félicitations, Mia'Plac ! L'avenir de ton peuple est assuré pour toujours. Tu as accompli ta prophétie !",
    errors: ERRORS.fr,
  },
};

export function cosmicRipText(locale: LocaleId): CosmicRipMessages {
  return MESSAGES[locale];
}

export function cosmicRipObjectiveText(locale: LocaleId): CosmicRipObjectiveMessages {
  return OBJECTIVES[locale];
}

export const LOCALIZATION_VALIDATION_DATA = {
  ERRORS,
  MESSAGES,
  OBJECTIVES,
  STATUS_DESCRIPTIONS,
  TECHNOLOGY_DESCRIPTIONS,
  UPGRADE_DESCRIPTIONS,
} as const;
