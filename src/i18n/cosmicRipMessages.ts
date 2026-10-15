import type { LocaleId } from "../content/ids";
import type { CosmicRipTechnologyId, CosmicRipUpgradeId } from "../content/cosmicRip";
import type { CosmicRipFailure } from "../engine/cosmicRip";

export interface CosmicRipMessages {
  readonly title: string;
  readonly ripPaneTitle: string;
  readonly situationTitle: string;
  readonly scannerArrayTitle: string;
  readonly sectorsMapTitle: string;
  readonly requiresRestoration: string;
  readonly status: string;
  readonly statusRowLabel: string;
  readonly stabilityLabel: string;
  readonly stabilityPercentage: string;
  readonly introduction: string;
  readonly situationIntroduction: string;
  readonly scannerArrayIntroduction: string;
  readonly ripIntroduction: string;
  readonly headerHelp: string;
  readonly situationHelp: string;
  readonly scannerArrayHelp: string;
  readonly technologyHelp: string;
  readonly gp: string;
  readonly gpShort: string;
  readonly telemetry: string;
  readonly rate: string;
  readonly restoreScanner: string;
  readonly scannerRestoredTitle: string;
  readonly scannerRestored: string;
  readonly scannerRestoreFailedNotification: string;
  readonly scannerRestoredNotification: string;
  readonly sectorScanFoundNotification: string;
  readonly sectorScanEmptyNotification: string;
  readonly scanInstruction: string;
  readonly sectorScanCost: string;
  readonly sectorScanned: string;
  readonly sectorFound: string;
  readonly ripFoundTitle: string;
  readonly ripFound: string;
  readonly locatedInSector: string;
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
  readonly closedTitle: string;
  readonly closed: string;
  readonly closedDialogEndLabel: string;
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
    "cosmic-rip-already-located": "The Cosmic Rip has already been located.",
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
    "cosmic-rip-already-located": "La Fisura Cósmica ya está localizada.",
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
    "cosmic-rip-already-located": "A Fenda Cósmica já foi localizada.",
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
    "cosmic-rip-already-located": "Der Kosmische Riss wurde bereits geortet.",
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
    "cosmic-rip-already-located": "Lo Strappo cosmico è già stato localizzato.",
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
    "cosmic-rip-already-located": "La Déchirure cosmique a déjà été localisée.",
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
    ripPaneTitle: "Cosmic Rip",
    situationTitle: "Situation",
    scannerArrayTitle: "Near Space Scanner Array",
    sectorsMapTitle: "Miaplacidus Sectors Map:",
    requiresRestoration: "Requires Restoration",
    status: "Endgame",
    statusRowLabel: "Cosmic Rip Status:",
    stabilityLabel: "Cosmic Rip:",
    stabilityPercentage: "{percentage}% Stabilised",
    introduction: "I don't know how you got here, Mia'Plac, but we are going to settle this...",
    situationIntroduction: "Cosmic Rip operations and progression",
    scannerArrayIntroduction:
      "Commission the Near Space Scanner Array, scan sectors to locate distortions, and pinpoint the Cosmic Rip.",
    ripIntroduction:
      "Investigate and Research how to stabilise and secure the Cosmic Rip once located.",
    headerHelp: "Once located, you undertake a set of studies, and constructions around the Cosmic Rip to Stabilise it ready for Manipulation and Closure, to secure the future for your people.  Here is where you do those studies, and they are costly, and take time.",
    situationHelp:
      "This is where you gain current insight in to the progress of Stabilising and Securing the Cosmic Rip.  Also when the time is right, this is where you will end the game!",
    scannerArrayHelp:
      "Scan the local space sectors around Miaplacidus to try to locate the Cosmic Rip.  Each scan costs a Galactic Point and once located, you can build science vessels to collect Telemetry Data around the Cosmic Rip",
    technologyHelp:
      "Investigate and Research how to stabilise and secure the Cosmic Rip once located.",
    gp: "Galactic Points",
    gpShort: "GP",
    telemetry: "Telemetry Data",
    rate: "Telemetry rate",
    restoreScanner: "RESTORE",
    scannerRestoredTitle: "Near Space Scanner Array Restored!",
    scannerRestored:
      "We have restored the strange Near Space Scanner Array orbiting Miaplacidus inside the ruined force field. With Galactic Points (GP), we can bring it fully online and scan Miaplacidus' local space to locate the source of the AI invasion!",
    scannerRestoreFailedNotification: "Unable to restore Near Space Scanner Array.",
    scannerRestoredNotification: "Near Space Scanner Array restored.",
    sectorScanFoundNotification: "Scan complete! Cosmic Rip located in sector {sector}",
    sectorScanEmptyNotification: "Scan complete! Nothing significant found in sector {sector}",
    scanInstruction: "Scan each sector for 1 Galactic Point.",
    sectorScanCost: "Scan {cost} GP",
    sectorScanned: "SCANNED!",
    sectorFound: "Rip located",
    ripFoundTitle: "Cosmic Rip Located!",
    ripFound:
      "The Cosmic Rip opened by the scientist, through which the evil AI race travelled has been located. We will dispatch science teams to investigate at once!",
    locatedInSector: "Located in Sector {sector}",
    ripMissing: "The signal is not in this sector.",
    upgrades: "Telemetry network",
    upgradeNames: { sensorBuoy: "Sensor Buoy", ripResearchOrbiter: "Rip Research Orbiter" },
    purchase: "DEPLOY",
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
    closeRip: "CLOSE COSMIC RIP",
    closedTitle: "COSMIC RIP CLOSED!",
    closed:
      "Congratulations, Mia'Plac! The future of your people is secured forever. You have fulfilled your prophecy!",
    closedDialogEndLabel: "END GAME MIA'PLAC",
    errors: ERRORS.en,
  },
  es: {
    title: "Ras Cósmico",
    ripPaneTitle: "Ras Cósmico",
    situationTitle: "Situación",
    scannerArrayTitle: "Matriz de Escáner del Espacio Cercano",
    sectorsMapTitle: "Mapa de Sectores de Miaplacidus:",
    requiresRestoration: "Requiere Restauración",
    status: "Final",
    statusRowLabel: "Estado del Ras Cósmico:",
    stabilityLabel: "Ras Cósmico:",
    stabilityPercentage: "{percentage}% Estabilizado",
    introduction: "No sé cómo llegaste aquí, Mia'Plac, pero vamos a resolver esto...",
    situationIntroduction: "Operaciones y progresión del Desgarro Cósmico",
    scannerArrayIntroduction:
      "Encarga el Arreglo de Escáner de Espacio Cercano, escanea sectores para localizar distorsiones, y precisar el Desgarro Cósmico.",
    ripIntroduction:
      "Investiga e investiga cómo estabilizar y asegurar el Desgarro Cósmico una vez localizado.",
    headerHelp: "Una vez localizado, emprendes un conjunto de estudios y construcciones alrededor del Desgarro Cósmico para Estabilizarlo listo para Manipulación y Cierre, para asegurar el futuro de tu pueblo. Aquí es donde haces esos estudios, y son costosos, y toman tiempo.",
    situationHelp:
      "Aquí es donde obtienes una visión actual del progreso de Estabilizar y Asegurar el Desgarro Cósmico. También cuando llegue el momento, ¡aquí es donde terminarás el juego!",
    scannerArrayHelp:
      "Escanea los sectores de espacio local alrededor de Miaplacidus para intentar localizar el Ras Cósmico. Cada escaneo cuesta un Punto Galáctico y una vez localizado, puedes construir naves científicas para recolectar Datos de Telemetría alrededor del Ras Cósmico",
    technologyHelp:
      "Investiga e investiga cómo estabilizar y asegurar el Desgarro Cósmico una vez localizado.",
    gp: "Puntos galácticos",
    gpShort: "PG",
    telemetry: "Datos de Telemetría",
    rate: "Ritmo de telemetría",
    restoreScanner: "RESTAURAR",
    scannerRestoredTitle: "¡Matriz de Escáner de Espacio Cercano Restaurada!",
    scannerRestored:
      "Hemos restaurado la extraña Matriz de Escáner de Espacio Cercano orbitando Miaplacidus dentro del campo de fuerza en ruinas. ¡Con Puntos Galácticos (PG), podemos ponerla completamente en línea y escanear el espacio local de Miaplacidus para localizar la fuente de la invasión de IA!",
    scannerRestoreFailedNotification:
      "No se puede restaurar la Matriz de Escáner del Espacio Cercano.",
    scannerRestoredNotification: "Matriz de Escáner del Espacio Cercano restaurada.",
    sectorScanFoundNotification:
      "¡Escaneo completo! Ras Cósmico localizado en el sector {sector}",
    sectorScanEmptyNotification:
      "¡Escaneo completo! No se ha encontrado nada relevante en el sector {sector}",
    scanInstruction: "Explora cada sector por 1 Punto Galáctico.",
    sectorScanCost: "Escanear {cost} GP",
    sectorScanned: "¡ESCANEADO!",
    sectorFound: "Fisura localizada",
    ripFoundTitle: "¡Desgarro Cósmico Localizado!",
    ripFound:
      "¡El Desgarro Cósmico abierto por el científico, a través del cual viajó la raza malvada de IA ha sido localizado! ¡Despacharemos equipos de ciencia para investigar de inmediato!",
    locatedInSector: "Localizado en el sector {sector}",
    ripMissing: "La señal no está en este sector.",
    upgrades: "Red de telemetría",
    upgradeNames: {
      sensorBuoy: "Boya Sensora",
      ripResearchOrbiter: "Orbitador de Estudio del Ras",
    },
    purchase: "DESPLEGAR",
    technologies: "Investigación de contención",
    technologyNames: {
      stabilizerArray: "Matriz Estabilizadora",
      quantumContainmentField: "Campo de Contención Cuántica",
      dimensionalAnchorMatrix: "Matriz de Anclaje Dimensional",
      singularityStabilizer: "Estabilizador de Singularidad",
      realityWeaveRegulator: "Regulador del Tejido de la Realidad",
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
    closeRip: "CERRAR EL RAS CÓSMICO",
    closedTitle: "¡DESGARRO CÓSMICO CERRADO!",
    closed:
      "¡Felicidades, Mia'Plac! El futuro de tu pueblo está asegurado para siempre. ¡Has cumplido tu profecía!",
    closedDialogEndLabel: "TERMINAR LA PARTIDA, MIA'PLAC",
    errors: ERRORS.es,
  },
  pt: {
    title: "Rutura Cósmica",
    ripPaneTitle: "Rutura Cósmica",
    situationTitle: "Situação",
    scannerArrayTitle: "Matriz de Scanners do Espaço Próximo",
    sectorsMapTitle: "Mapa de Setores de Miaplacidus:",
    requiresRestoration: "Requer Restauração",
    status: "Fim de jogo",
    statusRowLabel: "Estado da Rutura Cósmica:",
    stabilityLabel: "Rutura Cósmica:",
    stabilityPercentage: "{percentage}% Estabilizado",
    introduction: "Não sei como chegaste aqui, Mia'Plac, mas vamos resolver isto...",
    situationIntroduction: "Operações e progressão do Rasgo Cósmico",
    scannerArrayIntroduction:
      "Encomenda o Conjunto de Scanners do Espaço Próximo, explora setores para localizar distorções e determinar a localização do Rasgo Cósmico.",
    ripIntroduction:
      "Investiga e descobre como estabilizar e assegurar o Rasgo Cósmico depois de o localizar.",
    headerHelp: "Uma vez localizado, você inicia uma série de estudos e construções ao redor do Desgarro Cósmico para Estabilizá-lo, preparando-o para Manipulação e Fechamento, a fim de garantir o futuro do seu povo. É aqui que você realiza esses estudos, que são caros e levam tempo.",
    situationHelp:
      "É aqui que você obtém uma visão atual do progresso para Estabilizar e Assegurar o Desgarro Cósmico. E, quando chegar a hora, é aqui que você terminará o jogo!",
    scannerArrayHelp:
      "Escaneie os setores do espaço local ao redor de Miaplacidus para tentar localizar a Rutura Cósmica. Cada escaneamento custa um Ponto Galáctico e, uma vez localizada, você pode construir naves científicas para coletar Dados de Telemetria ao redor da Rutura Cósmica.",
    technologyHelp:
      "Investiga e descobre como estabilizar e assegurar o Rasgo Cósmico depois de o localizar.",
    gp: "Pontos Galácticos",
    gpShort: "PG",
    telemetry: "Dados de Telemetria",
    rate: "Taxa de telemetria",
    restoreScanner: "RESTAURAR",
    scannerRestoredTitle: "MATRIZ DE SCANNER DO ESPAÇO PRÓXIMO RESTAURADA!",
    scannerRestored:
      "Restaurámos a estranha Matriz de Scanner do Espaço Próximo que orbita Miaplacidus dentro do campo de força em ruínas. Com Pontos Galácticos (PG), podemos colocá-la totalmente online e explorar o espaço local de Miaplacidus para localizar a fonte da invasão da IA!",
    scannerRestoreFailedNotification:
      "Não é possível restaurar a Matriz de Scanners do Espaço Próximo.",
    scannerRestoredNotification: "Matriz de Scanners do Espaço Próximo restaurada.",
    sectorScanFoundNotification: "Análise concluída! Rutura Cósmica localizada no setor {sector}",
    sectorScanEmptyNotification:
      "Análise concluída! Não foi encontrado nada relevante no setor {sector}",
    scanInstruction: "Examine cada setor por 1 Ponto Galáctico.",
    sectorScanCost: "Analisar {cost} GP",
    sectorScanned: "ANALISADO!",
    sectorFound: "Fenda localizada",
    ripFoundTitle: "RASGO CÓSMICO LOCALIZADO!",
    ripFound:
      "O Rasgo Cósmico aberto pelo cientista, através do qual viajou a raça maléfica de IA, foi localizado! Enviaremos imediatamente equipas de ciência para investigar!",
    locatedInSector: "Localizado no setor {sector}",
    ripMissing: "O sinal não está neste setor.",
    upgrades: "Rede de telemetria",
    upgradeNames: {
      sensorBuoy: "Boia Sensorial",
      ripResearchOrbiter: "Orbitador de Estudo da Rutura",
    },
    purchase: "DESPLEGAR",
    technologies: "Pesquisa de contenção",
    technologyNames: {
      stabilizerArray: "Matriz Estabilizadora",
      quantumContainmentField: "Campo de Contenção Quântica",
      dimensionalAnchorMatrix: "Matriz de Ancoragem Dimensional",
      singularityStabilizer: "Estabilizador de Singularidade",
      realityWeaveRegulator: "Regulador do Tecido da Realidade",
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
    closeRip: "FECHAR A RUTURA CÓSMICA",
    closedTitle: "RASGO CÓSMICO FECHADO!",
    closed: "Parabéns, Mia'Plac! O futuro do teu povo está assegurado para sempre. Cumpriste a tua profecia!",
    closedDialogEndLabel: "TERMINAR A PARTIDA, MIA'PLAC",
    errors: ERRORS.pt,
  },
  de: {
    title: "Kosmischer Riss",
    ripPaneTitle: "Kosmischer Riss",
    situationTitle: "Situation",
    scannerArrayTitle: "Nahbereichs-Scanner-Array",
    sectorsMapTitle: "Sektorkarte von Miaplacidus:",
    requiresRestoration: "Wiederherstellung Erforderlich",
    status: "Endspiel",
    statusRowLabel: "Status des Kosmischen Risses:",
    stabilityLabel: "Kosmischer Riss:",
    stabilityPercentage: "{percentage}% Stabilisiert",
    introduction:
      "Ich weiß nicht, wie du hierher gekommen bist, Mia'Plac, aber wir werden das klären...",
    situationIntroduction: "Kosmische Riss-Operationen und Fortschritt",
    scannerArrayIntroduction:
      "Beauftrage das Nahraum-Scanner-Array, scanne Sektoren, um Verzerrungen zu lokalisieren und den Kosmischen Riss zu präzisieren.",
    ripIntroduction:
      "Untersuche und erforsche, wie der Kosmische Riss einmal lokalisiert stabilisiert und gesichert werden kann.",
    headerHelp: "Einmal lokalisiert, unternimmst du eine Reihe von Studien und Konstruktionen um den Kosmischen Riss herum, um ihn zu Stabilisieren, bereit für Manipulation und Schließung, um die Zukunft deines Volkes zu sichern. Hier ist, wo du diese Studien durchführst, und sie sind kostspielig und brauchen Zeit.",
    situationHelp:
      "Hier erhältst du aktuelle Einblicke in den Fortschritt des Stabilisierens und Sicherns des Kosmischen Risses. Außerdem ist hier, wenn die Zeit reif ist, wo du das Spiel beenden wirst!",
    scannerArrayHelp:
      "Scanne die lokalen Raumsektoren um Miaplacidus, um zu versuchen, den Kosmischen Riss zu lokalisieren. Jeder Scan kostet einen Galaktischen Punkt und sobald lokalisiert, kannst du Wissenschaftsschiffe bauen, um Telemetriedaten um den Kosmischen Riss zu sammeln",
    technologyHelp:
      "Untersuche und erforsche, wie der Kosmische Riss einmal lokalisiert stabilisiert und gesichert werden kann.",
    gp: "Galaktische Punkte",
    gpShort: "GP",
    telemetry: "Telemetriedaten",
    rate: "Telemetrierate",
    restoreScanner: "WIEDERHERSTELLEN",
    scannerRestoredTitle: "Nahraum-Scanner-Array Wiederhergestellt!",
    scannerRestored:
      "Wir haben das seltsame Nahraum-Scanner-Array wiederhergestellt, das Miaplacidus im zerstörten Kraftfeld umkreist. Mit Galaktischen Punkten (GP) können wir es vollständig online bringen und Miaplacidus' lokalen Raum scannen, um die Quelle der KI-Invasion zu lokalisieren!",
    scannerRestoreFailedNotification:
      "Das Nahbereichs-Scanner-Array kann nicht wiederhergestellt werden.",
    scannerRestoredNotification: "Nahbereichs-Scanner-Array wiederhergestellt.",
    sectorScanFoundNotification: "Scan abgeschlossen! Kosmischer Riss in Sektor {sector} geortet",
    sectorScanEmptyNotification:
      "Scan abgeschlossen! Nichts Bedeutendes in Sektor {sector} gefunden",
    scanInstruction: "Scanne jeden Sektor für 1 Galaktischen Punkt.",
    sectorScanCost: "Scannen {cost} GP",
    sectorScanned: "GESCANNT!",
    sectorFound: "Riss gefunden",
    ripFoundTitle: "Kosmischer Riss Lokalisiert!",
    ripFound:
      "Der vom Wissenschaftler geöffnete Kosmische Riss, durch den das böse KI-Volk gereist ist, wurde lokalisiert. Wir werden sofort Wissenschaftsteams entsenden, um zu untersuchen!",
    locatedInSector: "Im Sektor {sector} lokalisiert",
    ripMissing: "Das Signal ist nicht in diesem Sektor.",
    upgrades: "Telemetrienetz",
    upgradeNames: { sensorBuoy: "Sensorboje", ripResearchOrbiter: "Riss-Forschungsorbiter" },
    purchase: "AUSSETZEN",
    technologies: "Eindämmungsforschung",
    technologyNames: {
      stabilizerArray: "Stabilisator-Array",
      quantumContainmentField: "Quanten-Eindämmungsfeld",
      dimensionalAnchorMatrix: "Dimensionsanker-Matrix",
      singularityStabilizer: "Singularitätsstabilisator",
      realityWeaveRegulator: "Realitätsgewebe-Regulator",
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
    closeRip: "KOSMISCHEN RISS SCHLIESSEN",
    closedTitle: "KOSMISCHER RISS GESCHLOSSEN!",
    closed:
      "Herzlichen Glückwunsch, Mia'Plac! Die Zukunft deines Volkes ist für immer gesichert. Du hast deine Prophezeiung erfüllt!",
    closedDialogEndLabel: "SPIEL BEENDEN, MIA'PLAC",
    errors: ERRORS.de,
  },
  it: {
    title: "Strappo Cosmico",
    ripPaneTitle: "Strappo Cosmico",
    situationTitle: "Situazione",
    scannerArrayTitle: "Array Scanner Spazio Vicino",
    sectorsMapTitle: "Mappa dei Settori di Miaplacidus:",
    requiresRestoration: "Richiede Ripristino",
    status: "Finale",
    statusRowLabel: "Stato dello Strappo Cosmico:",
    stabilityLabel: "Strappo Cosmico:",
    stabilityPercentage: "{percentage}% Stabilizzato",
    introduction: "Non so come sei arrivato qui, Mia'Plac, ma risolveremo questa faccenda...",
    situationIntroduction: "Operazioni e progresso dello Squarcio Cosmico",
    scannerArrayIntroduction:
      "Commissiona l'Array di Scanner Spazio Vicino, scansiona settori per localizzare distorsioni, e precisare lo Squarcio Cosmico.",
    ripIntroduction:
      "Investiga e ricerca come stabilizzare e assicurare lo Squarcio Cosmico una volta localizzato.",
    headerHelp: "Una volta localizzato, intraprendi una serie di studi e costruzioni intorno allo Squarcio Cosmico per Stabilizzarlo pronto per Manipolazione e Chiusura, per assicurare il futuro del tuo popolo. Qui è dove fai quegli studi, e sono costosi, e richiedono tempo.",
    situationHelp:
      "Qui è dove ottieni informazioni attuali sul progresso dello Stabilizzare e Assicurare lo Squarcio Cosmico. Anche quando è il momento giusto, qui è dove finirai il gioco!",
    scannerArrayHelp:
      "Scansiona i settori spaziali locali attorno a Miaplacidus per cercare di localizzare lo Squarcio Cosmico. Ogni scansione costa un Punto Galattico e una volta localizzato, puoi costruire navi scientifiche per raccogliere Dati di Telemetria intorno allo Squarcio Cosmico",
    technologyHelp:
      "Investiga e ricerca come stabilizzare e assicurare lo Squarcio Cosmico una volta localizzato.",
    gp: "Punti Galattici",
    gpShort: "PG",
    telemetry: "Dati di Telemetria",
    rate: "Velocità telemetrica",
    restoreScanner: "RIPRISTINA",
    scannerRestoredTitle: "Matrice Scanner Spazio Vicino Ripristinata!",
    scannerRestored:
      "Abbiamo ripristinato la strana Matrice Scanner Spazio Vicino che orbita attorno a Miaplacidus all'interno del campo di forza in rovina. Con i Punti Galattici (PG), possiamo portarla completamente online e scansionare lo spazio locale di Miaplacidus per localizzare la fonte dell'invasione IA!",
    scannerRestoreFailedNotification: "Impossibile ripristinare l'Array Scanner Spazio Vicino.",
    scannerRestoredNotification: "Array Scanner Spazio Vicino ripristinato.",
    sectorScanFoundNotification:
      "Scansione completata! Strappo Cosmico localizzato nel settore {sector}",
    sectorScanEmptyNotification:
      "Scansione completata! Nulla di rilevante trovato nel settore {sector}",
    scanInstruction: "Scansiona ogni settore per 1 Punto Galattico.",
    sectorScanCost: "Scansiona {cost} GP",
    sectorScanned: "SCANSIONATO!",
    sectorFound: "Strappo localizzato",
    ripFoundTitle: "Squarcio Cosmico Localizzato!",
    ripFound:
      "Lo Squarcio Cosmico aperto dallo scienziato, attraverso il quale ha viaggiato la malvagia razza IA, è stato localizzato! Invieremo immediatamente squadre scientifiche per indagare!",
    locatedInSector: "Localizzato nel settore {sector}",
    ripMissing: "Il segnale non è in questo settore.",
    upgrades: "Rete telemetrica",
    upgradeNames: {
      sensorBuoy: "Boa Sensore",
      ripResearchOrbiter: "Orbiter di Ricerca sullo Strappo",
    },
    purchase: "SCHIERA",
    technologies: "Ricerca sul contenimento",
    technologyNames: {
      stabilizerArray: "Matrice Stabilizzatrice",
      quantumContainmentField: "Campo di Contenimento Quantistico",
      dimensionalAnchorMatrix: "Matrice di Ancoraggio Dimensionale",
      singularityStabilizer: "Stabilizzatore di Singolarità",
      realityWeaveRegulator: "Regolatore della Trama della Realtà",
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
    closeRip: "CHIUDI LO STRAPPO COSMICO",
    closedTitle: "SQUARCIO COSMICO CHIUSO!",
    closed:
      "Congratulazioni, Mia'Plac! Il futuro del tuo popolo è assicurato per sempre. Hai adempiuto alla tua profezia!",
    closedDialogEndLabel: "TERMINA LA PARTITA, MIA'PLAC",
    errors: ERRORS.it,
  },
  fr: {
    title: "Déchirure Cosmique",
    ripPaneTitle: "Déchirure Cosmique",
    situationTitle: "Situation",
    scannerArrayTitle: "Réseau de Scanners du Secteur Proche",
    sectorsMapTitle: "Carte des Secteurs de Miaplacidus:",
    requiresRestoration: "Restauration Requise",
    status: "Fin de partie",
    statusRowLabel: "État de la Déchirure Cosmique:",
    stabilityLabel: "Déchirure Cosmique:",
    stabilityPercentage: "{percentage}% Stabilisée",
    introduction:
      "Je ne sais pas comment tu es arrivé ici, Mia'Plac, mais nous allons régler ça...",
    situationIntroduction: "Opérations et progression de la Déchirure Cosmique",
    scannerArrayIntroduction:
      "Commissionne le Réseau de Scanners de l'Espace Proche, scanne les secteurs pour localiser les distorsions, et préciser la Déchirure Cosmique.",
    ripIntroduction:
      "Enquête et recherche comment stabiliser et sécuriser la Déchirure Cosmique une fois localisée.",
    headerHelp: "Une fois localisé, tu entreprends un ensemble d'études et de constructions autour du Déchirure Cosmique pour la Stabiliser prête pour Manipulation et Fermeture, pour sécuriser l'avenir de ton peuple. C'est ici que tu fais ces études, et elles sont coûteuses, et prennent du temps.",
    situationHelp:
      "C'est ici que tu obtiens des informations actuelles sur le progrès de Stabiliser et Sécuriser le Déchirure Cosmique. Aussi quand le moment est venu, c'est ici que tu finiras le jeu!",
    scannerArrayHelp:
      "Scanne les secteurs spatiaux locaux autour de Miaplacidus pour essayer de localiser la Déchirure Cosmique. Chaque scan coûte un Point Galactique et une fois localisée, tu peux construire des vaisseaux scientifiques pour collecter des Données de Télémétrie autour de la Déchirure Cosmique",
    technologyHelp:
      "Enquête et recherche comment stabiliser et sécuriser la Déchirure Cosmique une fois localisée.",
    gp: "Points galactiques",
    gpShort: "PG",
    telemetry: "Données de Télémétrie",
    rate: "Débit de télémétrie",
    restoreScanner: "RESTAURER",
    scannerRestoredTitle: "Matrice de Scanner de l'Espace Proche Restaurée!",
    scannerRestored:
      "Nous avons restauré l'étrange Matrice de Scanner de l'Espace Proche orbitant Miaplacidus à l'intérieur du champ de force en ruines. Avec des Points Galactiques (PG), nous pouvons la mettre complètement en ligne et scanner l'espace local de Miaplacidus pour localiser la source de l'invasion IA!",
    scannerRestoreFailedNotification:
      "Impossible de restaurer le Réseau de Scanners du Secteur Proche.",
    scannerRestoredNotification: "Réseau de Scanners du Secteur Proche restauré.",
    sectorScanFoundNotification:
      "Scan terminé! Déchirure Cosmique localisée dans le secteur {sector}",
    sectorScanEmptyNotification:
      "Scan terminé! Rien de significatif trouvé dans le secteur {sector}",
    scanInstruction: "Scannez chaque secteur pour 1 point galactique.",
    sectorScanCost: "Scanner {cost} GP",
    sectorScanned: "SCANNÉ!",
    sectorFound: "Déchirure localisée",
    ripFoundTitle: "Déchirure Cosmique Localisée!",
    ripFound:
      "La Déchirure cosmique ouverte par le scientifique, à travers laquelle la race maléfique d'IA a voyagé, a été localisée. Nous enverrons immédiatement des équipes scientifiques pour enquêter!",
    locatedInSector: "Localisé dans le secteur {sector}",
    ripMissing: "Le signal n'est pas dans ce secteur.",
    upgrades: "Réseau de télémétrie",
    upgradeNames: {
      sensorBuoy: "Bouée Capteur",
      ripResearchOrbiter: "Orbiteur d'Étude de la Déchirure",
    },
    purchase: "DÉPLOYER",
    technologies: "Recherche de confinement",
    technologyNames: {
      stabilizerArray: "Réseau Stabilisateur",
      quantumContainmentField: "Champ de Confinement Quantique",
      dimensionalAnchorMatrix: "Matrice d'Ancrage Dimensionnel",
      singularityStabilizer: "Stabilisateur de Singularité",
      realityWeaveRegulator: "Régulateur de la Trame du Réel",
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
    closeRip: "FERMER LA DÉCHIRURE COSMIQUE",
    closedTitle: "DÉCHIRURE COSMIQUE FERMÉE!",
    closed:
      "Félicitations, Mia'Plac ! L'avenir de ton peuple est assuré pour toujours. Tu as accompli ta prophétie !",
    closedDialogEndLabel: "TERMINER LA PARTIE, MIA'PLAC",
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
