import type { RandomEventId } from "../content/metaSignals";
import type { LocaleId } from "../content/ids";
import type {
  RandomEventDialogCopy,
  RandomEventDialogLine,
  RandomEventDialogTone,
  RandomEventDialogPart,
} from "./randomEventDialogTypes";

// Source modal copy from Cosmic Forge localization.json, split into plain text and lines.
type RandomEventStartDialogId = RandomEventId;

interface RandomEventStartDialogDefinition {
  readonly title: string;
  readonly summary: string;
  readonly lines: readonly RandomEventStartDialogLine[];
}

interface RandomEventStartDialogLine extends RandomEventDialogLine {
  readonly placeholderTones?: Readonly<Record<string, RandomEventDialogTone>>;
}

const messages: Record<LocaleId, Record<RandomEventStartDialogId, RandomEventStartDialogDefinition>> = {
  en: {
    powerPlantExplosion: {
      title: "POWER PLANT EXPLOSION!",
      summary: "A catastrophic failure rocked your energy grid.",
      lines: [
        { text: "{destroyedBuilding} destroyed!", tone: "red-disabled-text" },
      ],
    },
    batteryExplosion: {
      title: "BATTERY EXPLOSION!",
      summary: "A battery containment breach caused a violent explosion.",
      lines: [
        { text: "{destroyedBuilding} destroyed!", tone: "red-disabled-text" },
      ],
    },
    scienceTheft: {
      title: "SCIENCE THEFT!",
      summary: "A clandestine raid struck your research labs.",
      lines: [
        { text: "-{amountStolen} Research", tone: "red-disabled-text" },
      ],
    },
    researchBreakthrough: {
      title: "RESEARCH BREAKTHROUGH!",
      summary: "A sudden insight unlocks new understanding.",
      lines: [
        { text: "+{amountGained} Research", tone: "green-ready-text" },
      ],
    },
    rocketInstantArrival: {
      title: "WARP ANOMALY!",
      summary: "A space-time distortion accelerates one of your rockets.",
      lines: [
        { text: "{rocketName} instantly arrives!", placeholderTones: { rocketName: "green-ready-text" } },
      ],
    },
    starshipLostInSpace: {
      title: "STARSHIP LOST IN SPACE!",
      summary: "You lose communications with the Starship while en route.",
      lines: [
        { text: "Starship lost", tone: "red-disabled-text" },
        { text: "Destination cleared", tone: "red-disabled-text" },
        { text: "All fleet units lost", tone: "red-disabled-text" },
      ],
    },
    antimatterReaction: {
      title: "ANTIMATTER REACTION!",
      summary: "A catastrophic reaction annihilates a mining operation.",
      lines: [
        { text: "{rocketName} lost", tone: "red-disabled-text" },
        { text: "{asteroidName} destroyed", tone: "red-disabled-text" },
        { text: "-{antimatterLost} Antimatter", tone: "red-disabled-text" },
      ],
    },
    stockLoss: {
      title: "STOCK LOSS!",
      summary: "A major incident has struck your stores.",
      lines: [
        { text: "-{lostPercent}% {itemName}", tone: "red-disabled-text" },
        { text: "Lost due to {reason}." },
      ],
    },
    galacticMarketLockdown: {
      title: "GALACTIC MARKET OFFLINE!",
      summary: "A network disruption has shut down access to the Galactic Market.",
      lines: [
        { text: "Trading is unavailable for 30 minutes.", tone: "red-disabled-text" },
      ],
    },
    endlessSummer: {
      title: "ENDLESS SUMMER!",
      summary: "The skies are clearing and sunny weather is on the way.",
      lines: [
        { text: "Sunny weather for {minutes} minutes.", tone: "green-ready-text" },
      ],
    },
    minerBrokeDown: {
      title: "MINER BROKE DOWN!",
      summary: "A critical failure has halted one of your mining rockets.",
      lines: [
        { text: "{rocketName} mining rate is 0 for 15 minutes.", tone: "red-disabled-text" },
      ],
    },
    supplyChainDisruption: {
      title: "SUPPLY CHAIN DISRUPTION!",
      summary: "A major logistics disruption has hit your operations.",
      lines: [
        { text: "{itemName} production reduced by -{percentDown}% for 15 minutes.", tone: "orange-warning-text" },
      ],
    },
    blackHoleInstability: {
      title: "BLACK HOLE INSTABILITY!",
      summary: "A violent fluctuation ripples through the singularity.",
      lines: [
        { text: "Strength and duration will shift every minute for {minutes} minutes.", tone: "orange-warning-text" },
      ],
    },
  },
  es: {
    powerPlantExplosion: {
      title: "¡EXPLOSIÓN DE PLANTA DE ENERGÍA!",
      summary: "Un fallo catastrófico sacudió tu red de energía.",
      lines: [
        { text: "{destroyedBuilding} destruido!", tone: "red-disabled-text" },
      ],
    },
    batteryExplosion: {
      title: "¡EXPLOSIÓN DE BATERÍA!",
      summary: "Una brecha en el contención de la batería causó una violenta explosión.",
      lines: [
        { text: "{destroyedBuilding} destruido!", tone: "red-disabled-text" },
      ],
    },
    scienceTheft: {
      title: "¡ROBO DE CIENCIA!",
      summary: "Una incursión clandestina golpeó tus laboratorios de investigación.",
      lines: [
        { text: "-{amountStolen} Investigación", tone: "red-disabled-text" },
      ],
    },
    researchBreakthrough: {
      title: "¡AVANCE EN LA INVESTIGACIÓN!",
      summary: "Una repentina intuición desbloquea nuevo entendimiento.",
      lines: [
        { text: "+{amountGained} Investigación", tone: "green-ready-text" },
      ],
    },
    rocketInstantArrival: {
      title: "¡ANOMALÍA DE CURVATURA!",
      summary: "Una distorsión del espacio-tiempo acelera uno de tus cohetes.",
      lines: [
        { text: "{rocketName} llega instantáneamente!", placeholderTones: { rocketName: "green-ready-text" } },
      ],
    },
    starshipLostInSpace: {
      title: "¡NAVE ESTELAR PERDIDA EN EL ESPACIO!",
      summary: "Pierdes comunicaciones con la Nave Estelar mientras estás en ruta.",
      lines: [
        { text: "Nave Estelar perdida", tone: "red-disabled-text" },
        { text: "Destino borrado", tone: "red-disabled-text" },
        { text: "Todas las unidades de flota perdidas", tone: "red-disabled-text" },
      ],
    },
    antimatterReaction: {
      title: "¡REACCIÓN DE ANTIMATERIA!",
      summary: "Una reacción catastrófica aniquila una operación minera.",
      lines: [
        { text: "{rocketName} perdido", tone: "red-disabled-text" },
        { text: "{asteroidName} destruido", tone: "red-disabled-text" },
        { text: "-{antimatterLost} Antimateria", tone: "red-disabled-text" },
      ],
    },
    stockLoss: {
      title: "¡PÉRDIDA DE STOCK!",
      summary: "Un incidente mayor ha golpeado tus almacenes.",
      lines: [
        { text: "-{lostPercent}% {itemName}", tone: "red-disabled-text" },
        { text: "Perdido debido a {reason}." },
      ],
    },
    galacticMarketLockdown: {
      title: "¡MERCADO GALÁCTICO FUERA DE LÍNEA!",
      summary: "Una interrupción de red ha cerrado el acceso al Mercado Galáctico.",
      lines: [
        { text: "El comercio no está disponible por 30 minutos.", tone: "red-disabled-text" },
      ],
    },
    endlessSummer: {
      title: "¡VERANO ETERNO!",
      summary: "Los cielos se están despejando y el clima soleado está en camino.",
      lines: [
        { text: "Clima soleado por {minutes} minutos.", tone: "green-ready-text" },
      ],
    },
    minerBrokeDown: {
      title: "¡MINERO AVERIADO!",
      summary: "Un fallo crítico ha detenido uno de tus cohetes mineros.",
      lines: [
        { text: "{rocketName} tasa de minería es 0 por 15 minutos.", tone: "red-disabled-text" },
      ],
    },
    supplyChainDisruption: {
      title: "¡DISRUPCIÓN DE CADENA DE SUMINISTRO!",
      summary: "Una gran disrupción logística ha golpeado tus operaciones.",
      lines: [
        { text: "Producción de {itemName} reducida en un -{percentDown}% por 15 minutos.", tone: "orange-warning-text" },
      ],
    },
    blackHoleInstability: {
      title: "¡INESTABILIDAD DEL AGUJERO NEGRO!",
      summary: "Una violenta fluctuación ondula a través de la singularidad.",
      lines: [
        { text: "La fuerza y duración cambiarán cada minuto durante {minutes} minutos.", tone: "orange-warning-text" },
      ],
    },
  },
  pt: {
    powerPlantExplosion: {
      title: "EXPLOSÃO DA CENTRAL ELÉTRICA!",
      summary: "Uma falha catastrófica abalou a tua rede de energia.",
      lines: [
        { text: "{destroyedBuilding} destruído!", tone: "red-disabled-text" },
      ],
    },
    batteryExplosion: {
      title: "EXPLOSÃO DA BATERIA!",
      summary: "Uma falha catastrófica abalou a tua bateria.",
      lines: [
        { text: "{destroyedBuilding} destruído!", tone: "red-disabled-text" },
      ],
    },
    scienceTheft: {
      title: "ROUBO DE CIÊNCIA!",
      summary: "Uma incursão clandestina atingiu os teus laboratórios de investigação.",
      lines: [
        { text: "-{amountStolen} Investigação", tone: "red-disabled-text" },
      ],
    },
    researchBreakthrough: {
      title: "AVANÇO NA INVESTIGAÇÃO!",
      summary: "Uma súbita intuição desbloqueia novo entendimento.",
      lines: [
        { text: "+{amountGained} Investigação", tone: "green-ready-text" },
      ],
    },
    rocketInstantArrival: {
      title: "ANOMALIA DE DOBRA!",
      summary: "Uma distorção do espaço-tempo acelera um dos teus foguetões.",
      lines: [
        { text: "{rocketName} chega instantaneamente!", placeholderTones: { rocketName: "green-ready-text" } },
      ],
    },
    starshipLostInSpace: {
      title: "NAVE ESTELAR PERDIDA NO ESPAÇO!",
      summary: "Perdeste a comunicação com a Nave Estelar enquanto estava a caminho.",
      lines: [
        { text: "Nave Estelar perdida", tone: "red-disabled-text" },
        { text: "Destino apagado", tone: "red-disabled-text" },
        { text: "Todas as unidades da frota perdidas", tone: "red-disabled-text" },
      ],
    },
    antimatterReaction: {
      title: "REAÇÃO DE ANTIMATÉRIA!",
      summary: "Uma reação catastrófica aniquila uma operação de mineração.",
      lines: [
        { text: "{rocketName} perdido", tone: "red-disabled-text" },
        { text: "{asteroidName} destruído", tone: "red-disabled-text" },
        { text: "-{antimatterLost} Antimatéria", tone: "red-disabled-text" },
      ],
    },
    stockLoss: {
      title: "PERDA DE STOCK!",
      summary: "Um incidente grave atingiu os teus armazéns.",
      lines: [
        { text: "-{lostPercent}% {itemName}", tone: "red-disabled-text" },
        { text: "Perdido devido a {reason}." },
      ],
    },
    galacticMarketLockdown: {
      title: "MERCADO GALÁCTICO OFFLINE!",
      summary: "Uma interrupção da rede encerrou o acesso ao Mercado Galáctico.",
      lines: [
        { text: "O comércio não está disponível durante 30 minutos.", tone: "red-disabled-text" },
      ],
    },
    endlessSummer: {
      title: "VERÃO ETERNO!",
      summary: "Os céus estão a limpar-se e o tempo soalheiro está a caminho.",
      lines: [
        { text: "Tempo soalheiro durante {minutes} minutos.", tone: "green-ready-text" },
      ],
    },
    minerBrokeDown: {
      title: "MINERADOR AVARIADO!",
      summary: "Uma falha crítica parou um dos teus foguetões de mineração.",
      lines: [
        { text: "{rocketName} tem uma taxa de mineração de 0 durante 15 minutos.", tone: "red-disabled-text" },
      ],
    },
    supplyChainDisruption: {
      title: "PERTURBAÇÃO DA CADEIA DE ABASTECIMENTO!",
      summary: "Uma grande perturbação logística atingiu as tuas operações.",
      lines: [
        { text: "A produção de {itemName} foi reduzida em -{percentDown}% durante 15 minutos.", tone: "orange-warning-text" },
      ],
    },
    blackHoleInstability: {
      title: "INSTABILIDADE DO BURACO NEGRO!",
      summary: "Uma violenta flutuação percorre a singularidade.",
      lines: [
        { text: "A força e a duração mudarão a cada minuto durante {minutes} minutos.", tone: "orange-warning-text" },
      ],
    },
  },
  de: {
    powerPlantExplosion: {
      title: "KRAFTWERKSEXPLOSION!",
      summary: "Ein katastrophaler Ausfall hat dein Energienetz erschüttert.",
      lines: [
        { text: "{destroyedBuilding} zerstört!", tone: "red-disabled-text" },
      ],
    },
    batteryExplosion: {
      title: "BATTERIEEXPLOSION!",
      summary: "Ein Eindämmungsbruch der Batterie verursachte eine heftige Explosion.",
      lines: [
        { text: "{destroyedBuilding} zerstört!", tone: "red-disabled-text" },
      ],
    },
    scienceTheft: {
      title: "WISSENSCHAFTSDIEBSTAHL!",
      summary: "Ein heimlicher Überfall traf deine Forschungslabore.",
      lines: [
        { text: "-{amountStolen} Forschung", tone: "red-disabled-text" },
      ],
    },
    researchBreakthrough: {
      title: "FORSCHUNGSDURCHBRUCH!",
      summary: "Ein plötzlicher Einblick enthüllt neues Verständnis.",
      lines: [
        { text: "+{amountGained} Forschung", tone: "green-ready-text" },
      ],
    },
    rocketInstantArrival: {
      title: "WARP-ANOMALIE!",
      summary: "Eine Raumzeit-Verzerrung beschleunigt eine deiner Raketen.",
      lines: [
        { text: "{rocketName} kommt sofort an!", placeholderTones: { rocketName: "green-ready-text" } },
      ],
    },
    starshipLostInSpace: {
      title: "RAUMSCHIFF IM WELTRAUM VERLOREN!",
      summary: "Du verlierst die Kommunikation mit dem Raumschiff unterwegs.",
      lines: [
        { text: "Raumschiff verloren", tone: "red-disabled-text" },
        { text: "Ziel gelöscht", tone: "red-disabled-text" },
        { text: "Alle Flotteneinheiten verloren", tone: "red-disabled-text" },
      ],
    },
    antimatterReaction: {
      title: "ANTIMATERIE-REAKTION!",
      summary: "Eine katastrophale Reaktion vernichtet einen Minenbetrieb.",
      lines: [
        { text: "{rocketName} verloren", tone: "red-disabled-text" },
        { text: "{asteroidName} zerstört", tone: "red-disabled-text" },
        { text: "-{antimatterLost} Antimaterie", tone: "red-disabled-text" },
      ],
    },
    stockLoss: {
      title: "BESTANDSVERLUST!",
      summary: "Ein schwerer Vorfall hat deine Lager getroffen.",
      lines: [
        { text: "-{lostPercent}% {itemName}", tone: "red-disabled-text" },
        { text: "Verloren durch {reason}." },
      ],
    },
    galacticMarketLockdown: {
      title: "GALAKTISCHER MARKT OFFLINE!",
      summary: "Eine Netzwerkstörung hat den Zugang zum Galaktischen Markt unterbrochen.",
      lines: [
        { text: "Handel ist für 30 Minuten nicht verfügbar.", tone: "red-disabled-text" },
      ],
    },
    endlessSummer: {
      title: "ENDLOSER SOMMER!",
      summary: "Die Himmel klaren auf und sonniges Wetter ist unterwegs.",
      lines: [
        { text: "Sonniges Wetter für {minutes} Minuten.", tone: "green-ready-text" },
      ],
    },
    minerBrokeDown: {
      title: "BERGWERK AUSGEFALLEN!",
      summary: "Ein kritischer Ausfall hat eine deiner Minenraketen gestoppt.",
      lines: [
        { text: "{rocketName} Minenrate ist 0 für 15 Minuten.", tone: "red-disabled-text" },
      ],
    },
    supplyChainDisruption: {
      title: "LIEFERKETTENSTÖRUNG!",
      summary: "Eine große Logistikstörung hat deine Operationen getroffen.",
      lines: [
        { text: "{itemName}-Produktion um -{percentDown}% für 15 Minuten reduziert.", tone: "orange-warning-text" },
      ],
    },
    blackHoleInstability: {
      title: "SCHWARZLOCH-INSTABILITÄT!",
      summary: "Eine heftige Fluktuation durchzieht die Singularität.",
      lines: [
        { text: "Stärke und Dauer werden sich jede Minute für {minutes} Minuten ändern.", tone: "orange-warning-text" },
      ],
    },
  },
  it: {
    powerPlantExplosion: {
      title: "ESPLOSIONE CENTRALE ELETTRICA!",
      summary: "Un guasto catastrofico ha scosso la tua rete energetica.",
      lines: [
        { text: "{destroyedBuilding} distrutto!", tone: "red-disabled-text" },
      ],
    },
    batteryExplosion: {
      title: "ESPLOSIONE BATTERIA!",
      summary: "Una breccia nel contenimento della batteria ha causato una violenta esplosione.",
      lines: [
        { text: "{destroyedBuilding} distrutto!", tone: "red-disabled-text" },
      ],
    },
    scienceTheft: {
      title: "FURTO DI SCIENZA!",
      summary: "Un raid clandestino ha colpito i tuoi laboratori di ricerca.",
      lines: [
        { text: "-{amountStolen} Ricerca", tone: "red-disabled-text" },
      ],
    },
    researchBreakthrough: {
      title: "SCOPERTA NELLA RICERCA!",
      summary: "Un'intuizione improvvisa sblocca nuova comprensione.",
      lines: [
        { text: "+{amountGained} Ricerca", tone: "green-ready-text" },
      ],
    },
    rocketInstantArrival: {
      title: "ANOMALIA WARP!",
      summary: "Una distorsione dello spazio-tempo accelera uno dei tuoi razzi.",
      lines: [
        { text: "{rocketName} arriva istantaneamente!", placeholderTones: { rocketName: "green-ready-text" } },
      ],
    },
    starshipLostInSpace: {
      title: "ASTRONAVE PERSA NELLO SPAZIO!",
      summary: "Perdi le comunicazioni con l'Astronave mentre sei in rotta.",
      lines: [
        { text: "Astronave persa", tone: "red-disabled-text" },
        { text: "Destinazione cancellata", tone: "red-disabled-text" },
        { text: "Tutte le unità di flotta perse", tone: "red-disabled-text" },
      ],
    },
    antimatterReaction: {
      title: "REAZIONE ANTIMATERIA!",
      summary: "Una reazione catastrofica annienta un'operazione mineraria.",
      lines: [
        { text: "{rocketName} perso", tone: "red-disabled-text" },
        { text: "{asteroidName} distrutto", tone: "red-disabled-text" },
        { text: "-{antimatterLost} Antimateria", tone: "red-disabled-text" },
      ],
    },
    stockLoss: {
      title: "PERDITA SCORTE!",
      summary: "Un grave incidente ha colpito i tuoi magazzini.",
      lines: [
        { text: "-{lostPercent}% {itemName}", tone: "red-disabled-text" },
        { text: "Perso a causa di {reason}." },
      ],
    },
    galacticMarketLockdown: {
      title: "MERCATO GALATTICO OFFLINE!",
      summary: "Un'interruzione di rete ha chiuso l'accesso al Mercato Galattico.",
      lines: [
        { text: "Il commercio non è disponibile per 30 minuti.", tone: "red-disabled-text" },
      ],
    },
    endlessSummer: {
      title: "ESTATE INFINITA!",
      summary: "I cieli si stanno scharendo e il tempo soleggiato è in arrivo.",
      lines: [
        { text: "Tempo soleggiato per {minutes} minuti.", tone: "green-ready-text" },
      ],
    },
    minerBrokeDown: {
      title: "MINATORE GUASTO!",
      summary: "Un guasto critico ha fermato uno dei tuoi razzi minerari.",
      lines: [
        { text: "{rocketName} tasso di estrazione è 0 per 15 minuti.", tone: "red-disabled-text" },
      ],
    },
    supplyChainDisruption: {
      title: "DISTURBO DELLA CATENA DI APPROVVIGIONAMENTO!",
      summary: "Una grande perturbazione logistica ha colpito le tue operazioni.",
      lines: [
        { text: "Produzione di {itemName} ridotta del -{percentDown}% per 15 minuti.", tone: "orange-warning-text" },
      ],
    },
    blackHoleInstability: {
      title: "INSTABILITÀ DEL BUCO NERO!",
      summary: "Una violenta fluttuazione si propaga attraverso la singolarità.",
      lines: [
        { text: "Forza e durata cambieranno ogni minuto per {minutes} minuti.", tone: "orange-warning-text" },
      ],
    },
  },
  fr: {
    powerPlantExplosion: {
      title: "EXPLOSION DE CENTRALE ÉLECTRIQUE!",
      summary: "Une défaillance catastrophique a secoué ton réseau énergétique.",
      lines: [
        { text: "{destroyedBuilding} détruit!", tone: "red-disabled-text" },
      ],
    },
    batteryExplosion: {
      title: "EXPLOSION DE BATTERIE!",
      summary: "Une brèche de confinement de batterie a causé une violente explosion.",
      lines: [
        { text: "{destroyedBuilding} détruit!", tone: "red-disabled-text" },
      ],
    },
    scienceTheft: {
      title: "VOL DE SCIENCE!",
      summary: "Un raid clandestin a frappé tes laboratoires de recherche.",
      lines: [
        { text: "-{amountStolen} Recherche", tone: "red-disabled-text" },
      ],
    },
    researchBreakthrough: {
      title: "PERCÉE DE RECHERCHE!",
      summary: "Une soudaine intuition débloque une nouvelle compréhension.",
      lines: [
        { text: "+{amountGained} Recherche", tone: "green-ready-text" },
      ],
    },
    rocketInstantArrival: {
      title: "ANOMALIE DE DISTORSION!",
      summary: "Une distorsion spatio-temporelle accélère l'une de tes fusées.",
      lines: [
        { text: "{rocketName} arrive instantanément!", placeholderTones: { rocketName: "green-ready-text" } },
      ],
    },
    starshipLostInSpace: {
      title: "VAISSEAU STELLAIRE PERDU DANS L'ESPACE!",
      summary: "Tu perds les communications avec le Vaisseau Stellaire en route.",
      lines: [
        { text: "Vaisseau Stellaire perdu", tone: "red-disabled-text" },
        { text: "Destination effacée", tone: "red-disabled-text" },
        { text: "Toutes les unités de flotte perdues", tone: "red-disabled-text" },
      ],
    },
    antimatterReaction: {
      title: "RÉACTION D'ANTIMATIÈRE!",
      summary: "Une réaction catastrophique anéantit une opération minière.",
      lines: [
        { text: "{rocketName} perdu", tone: "red-disabled-text" },
        { text: "{asteroidName} détruit", tone: "red-disabled-text" },
        { text: "-{antimatterLost} Antimatière", tone: "red-disabled-text" },
      ],
    },
    stockLoss: {
      title: "PERTE DE STOCK!",
      summary: "Un incident majeur a frappé tes entrepôts.",
      lines: [
        { text: "-{lostPercent}% {itemName}", tone: "red-disabled-text" },
        { text: "Perdu à cause de {reason}." },
      ],
    },
    galacticMarketLockdown: {
      title: "MARCHÉ GALACTIQUE HORS LIGNE!",
      summary: "Une interruption réseau a fermé l'accès au Marché Galactique.",
      lines: [
        { text: "Le commerce n'est pas disponible pendant 30 minutes.", tone: "red-disabled-text" },
      ],
    },
    endlessSummer: {
      title: "ÉTÉ ÉTERNEL!",
      summary: "Les cieux se dégagent et le temps ensoleillé arrive.",
      lines: [
        { text: "Temps ensoleillé pendant {minutes} minutes.", tone: "green-ready-text" },
      ],
    },
    minerBrokeDown: {
      title: "MINEUR EN PANNE!",
      summary: "Une défaillance critique a arrêté l'une de tes fusées minières.",
      lines: [
        { text: "{rocketName} taux d'extraction est 0 pendant 15 minutes.", tone: "red-disabled-text" },
      ],
    },
    supplyChainDisruption: {
      title: "PERTURBATION DE LA CHAÎNE D'APPROVISIONNEMENT!",
      summary: "Une grande perturbation logistique a frappé tes opérations.",
      lines: [
        { text: "Production de {itemName} réduite de -{percentDown}% pendant 15 minutes.", tone: "orange-warning-text" },
      ],
    },
    blackHoleInstability: {
      title: "INSTABILITÉ DU TROU NOIR!",
      summary: "Une violente fluctuation traverse la singularité.",
      lines: [
        { text: "La force et la durée changeront chaque minute pendant {minutes} minutes.", tone: "orange-warning-text" },
      ],
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

// The source selects one of these reasons for its modal. This remains a
// presentation-only choice and does not consume the simulation PRNG.
const stockLossReasons: Record<LocaleId, readonly [string, string, string, string]> = {
  en: [
    "poor storage conditions",
    "theft",
    "a containment failure",
    "a supply chain accident",
  ],
  es: [
    "malas condiciones de almacenamiento",
    "un robo",
    "un fallo de contención",
    "un accidente en la cadena de suministro",
  ],
  pt: [
    "más condições de armazenamento",
    "um roubo",
    "uma falha de contenção",
    "um acidente na cadeia de abastecimento",
  ],
  de: [
    "schlechte Lagerbedingungen",
    "Diebstahl",
    "ein Versagen der Eindämmung",
    "einen Unfall in der Lieferkette",
  ],
  it: [
    "cattive condizioni di stoccaggio",
    "un furto",
    "un guasto al contenimento",
    "un incidente nella catena di approvvigionamento",
  ],
  fr: [
    "de mauvaises conditions de stockage",
    "un vol",
    "une défaillance du confinement",
    "un accident de la chaîne d'approvisionnement",
  ],
};

export function randomEventStartDialogStockLossReason(locale: LocaleId): string {
  const reasons = stockLossReasons[locale];
  return reasons[Math.floor(Math.random() * reasons.length)]!;
}

function interpolate(
  text: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return text.replace(/\{([^{}]+)\}/g, (placeholder, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : placeholder,
  );
}

function interpolateLine(
  line: RandomEventStartDialogLine,
  values: Readonly<Record<string, string | number>>,
): RandomEventDialogLine {
  if (!line.placeholderTones) {
    return { ...line, text: interpolate(line.text, values) };
  }

  const parts: RandomEventDialogPart[] = [];
  const placeholderPattern = /\{([^{}]+)\}/g;
  let cursor = 0;
  for (const match of line.text.matchAll(placeholderPattern)) {
    const fullPlaceholder = match[0];
    const name = match[1]!;
    const start = match.index!;
    const precedingText = line.text.slice(cursor, start);
    if (precedingText) parts.push({ text: interpolate(precedingText, values) });
    const replacement = Object.hasOwn(values, name) ? String(values[name]) : fullPlaceholder;
    const tone = line.placeholderTones[name];
    parts.push({ text: replacement, ...(tone ? { tone } : {}) });
    cursor = start + fullPlaceholder.length;
  }
  const trailingText = line.text.slice(cursor);
  if (trailingText) parts.push({ text: interpolate(trailingText, values) });

  return {
    text: interpolate(line.text, values),
    ...(line.tone ? { tone: line.tone } : {}),
    parts,
  };
}

export function randomEventStartDialogText(
  locale: LocaleId,
  eventId: RandomEventId,
  values: Readonly<Record<string, string | number>> = {},
): RandomEventDialogCopy | null {
  const definition = messages[locale][eventId as RandomEventStartDialogId];
  if (!definition) return null;

  return {
    title: interpolate(definition.title, values),
    summary: interpolate(definition.summary, values),
    lines: definition.lines.map((line) => interpolateLine(line, values)),
    confirmLabel: confirmLabels[locale],
  };
}

export const LOCALIZATION_VALIDATION_DATA = {
  messages,
  confirmLabels,
  stockLossReasons,
} as const;
