import type { LocaleId } from "../content/ids";
import type { AscendencyPerkId } from "../content/ascendency";

interface MetaCopy {
  readonly title: string;
  readonly ap: string;
  readonly gp: string;
  readonly rebirths: string;
  readonly rebirthTitle: string;
  readonly rebirthBody: string;
  readonly rebirthAction: string;
  readonly confirm: string;
  readonly cancel: string;
  readonly locked: string;
  readonly buy: string;
  readonly maxed: string;
  readonly level: string;
  readonly cost: string;
  readonly perks: Readonly<Record<AscendencyPerkId, readonly [string, string]>>;
}

const PERK_IDS: readonly AscendencyPerkId[] = [
  "littleBagOfHydrogen",
  "nonExhaustiveResources",
  "efficientStorage",
  "smartAutoBuyers",
  "jumpstartResearch",
  "optimizedPowerGrids",
  "nanoBrokers",
  "roboticResearchAutomation",
  "fasterAsteroidScan",
  "deeperStarStudy",
  "asteroidScannerBoost",
  "rocketFuelOptimization",
  "enhancedMining",
  "quantumEngines",
  "autoSpaceTelescope",
  "bulkPurchasing",
];

const PACKS: Record<
  LocaleId,
  Omit<MetaCopy, "perks"> & {
    readonly perkNames: readonly string[];
    readonly perkEffects: readonly string[];
  }
> = {
  en: {
    title: "Ascendency",
    ap: "Ascendency Points",
    gp: "Glory Points",
    rebirths: "Rebirths",
    rebirthTitle: "Begin a new run?",
    rebirthBody:
      "Run resources, buildings, research and ships reset. AP, GP, ascendency perks, philosophy, settings and lifetime statistics remain. Your new system will be the one you just settled.",
    rebirthAction: "Rebirth",
    confirm: "Confirm rebirth",
    cancel: "Keep current run",
    locked: "Locked",
    buy: "Purchase",
    maxed: "Maxed",
    level: "Level",
    cost: "Cost",
    perkNames: [
      "Little Bag of Hydrogen",
      "Non-Exhaustive Resources",
      "Efficient Storage",
      "Smart Auto Buyers",
      "Jumpstart Research",
      "Optimized Power Grids",
      "Nano Brokers",
      "Robotic Research Automation",
      "Faster Asteroid Scan",
      "Deeper Star Study",
      "Asteroid Scanner Boost",
      "Rocket Fuel Optimization",
      "Enhanced Mining",
      "Quantum Engines",
      "Auto Space Telescope",
      "Bulk Purchasing",
    ],
    perkEffects: [
      "Rebirth with enough Hydrogen for one Tier 1 buyer.",
      "Rebirth with starter stock for each material and unlock them all.",
      "Increase storage gained per storage purchase.",
      "Increase Auto Buyer efficiency by 50% per level.",
      "Start rebirths with technologies priced up to 4,200 research.",
      "Increase power-grid upgrade strength by 20% per level.",
      "Unlock auto-selling, compound creation and compound buyers in order.",
      "Automatically research eligible technologies.",
      "Reduce asteroid-search time by 25% per level.",
      "Double star-study reveal range per level.",
      "Increase minimum asteroid rarity per level.",
      "Halve rocket-fueling time.",
      "Increase antimatter mining efficiency by 25% per level.",
      "Halve starship travel time per level.",
      "Unlock automatic star study.",
      "Unlock maximum-quantity purchase controls.",
    ],
  },
  es: {
    title: "Ascendencia",
    ap: "Puntos de Ascendencia",
    gp: "Puntos de Gloria",
    rebirths: "Renacimientos",
    rebirthTitle: "¿Comenzar una nueva partida?",
    rebirthBody:
      "Se reinician los recursos, edificios, investigaciones y naves de esta partida. Se conservan los PA, PG, ventajas, filosofía, ajustes y estadísticas de por vida. Tu nuevo sistema será el que acabas de colonizar.",
    rebirthAction: "Renacer",
    confirm: "Confirmar renacimiento",
    cancel: "Continuar partida",
    locked: "Bloqueado",
    buy: "Comprar",
    maxed: "Al máximo",
    level: "Nivel",
    cost: "Coste",
    perkNames: [
      "Pequeña bolsa de hidrógeno",
      "Recursos inagotables",
      "Almacenamiento eficiente",
      "Recolectores inteligentes",
      "Investigación inicial",
      "Redes eléctricas optimizadas",
      "Corredores nano",
      "Automatización robótica de investigación",
      "Búsqueda rápida de asteroides",
      "Estudio estelar profundo",
      "Mejora del escáner de asteroides",
      "Optimización de combustible de cohetes",
      "Minería mejorada",
      "Motores cuánticos",
      "Telescopio espacial automático",
      "Compras al por mayor",
    ],
    perkEffects: [
      "Renace con hidrógeno suficiente para un recolector de nivel 1.",
      "Renace con recursos iniciales para cada material y desbloquéalos.",
      "Aumenta el almacenamiento obtenido en cada compra.",
      "Aumenta la eficiencia de los recolectores un 50 % por nivel.",
      "Empieza los renacimientos con tecnologías de hasta 4.200 de investigación.",
      "Aumenta un 20 % la potencia de las redes por nivel.",
      "Desbloquea venta, creación de compuestos y recolectores de compuestos en orden.",
      "Investiga automáticamente tecnologías disponibles.",
      "Reduce un 25 % el tiempo de búsqueda de asteroides por nivel.",
      "Duplica el alcance del estudio estelar por nivel.",
      "Aumenta la rareza mínima de asteroides por nivel.",
      "Reduce a la mitad el repostaje de cohetes.",
      "Aumenta un 25 % la minería de antimateria por nivel.",
      "Reduce a la mitad el viaje estelar por nivel.",
      "Desbloquea el estudio estelar automático.",
      "Desbloquea los controles de compra máxima.",
    ],
  },
  pt: {
    title: "Ascendência",
    ap: "Pontos de Ascendência",
    gp: "Pontos de Glória",
    rebirths: "Renascimentos",
    rebirthTitle: "Começar uma nova jornada?",
    rebirthBody:
      "Os recursos, edifícios, pesquisas e naves desta jornada serão reiniciados. PA, PG, vantagens, filosofia, definições e estatísticas vitalícias permanecem. O novo sistema será aquele que acabou de colonizar.",
    rebirthAction: "Renascença",
    confirm: "Confirmar renascimento",
    cancel: "Manter jornada atual",
    locked: "Bloqueado",
    buy: "Comprar",
    maxed: "No máximo",
    level: "Nível",
    cost: "Custo",
    perkNames: [
      "Pequena bolsa de hidrogénio",
      "Recursos não exaustivos",
      "Armazenamento eficiente",
      "Compradores inteligentes",
      "Pesquisa inicial",
      "Redes elétricas otimizadas",
      "Corretores nano",
      "Automação robótica de pesquisa",
      "Busca rápida de asteroides",
      "Estudo estelar profundo",
      "Impulso do scanner de asteroides",
      "Otimização do combustível de foguete",
      "Mineração aprimorada",
      "Motores quânticos",
      "Telescópio espacial automático",
      "Compras em volume",
    ],
    perkEffects: [
      "Renascença com hidrogénio para um comprador de nível 1.",
      "Renascença com recursos iniciais para cada material e desbloqueie-os.",
      "Aumenta o armazenamento obtido em cada compra.",
      "Aumenta a eficiência dos compradores em 50% por nível.",
      "Começa renascenças com tecnologias até 4.200 de pesquisa.",
      "Aumenta em 20% a força da rede por nível.",
      "Desbloqueia venda automática, criação de compostos e compradores por ordem.",
      "Pesquisa automaticamente tecnologias disponíveis.",
      "Reduz em 25% o tempo de busca por nível.",
      "Duplica o alcance do estudo estelar por nível.",
      "Aumenta a raridade mínima dos asteroides por nível.",
      "Reduz pela metade o abastecimento de foguetes.",
      "Aumenta em 25% a mineração de antimatéria por nível.",
      "Reduz pela metade a viagem estelar por nível.",
      "Desbloqueia o estudo estelar automático.",
      "Desbloqueia controlos de compra máxima.",
    ],
  },
  de: {
    title: "Aszendenz",
    ap: "Aszendenzpunkte",
    gp: "Ruhmpunkte",
    rebirths: "Wiedergeburten",
    rebirthTitle: "Einen neuen Durchlauf beginnen?",
    rebirthBody:
      "Ressourcen, Gebäude, Forschung und Schiffe dieses Durchlaufs werden zurückgesetzt. AP, RP, Vorteile, Philosophie, Einstellungen und Lebenszeitstatistiken bleiben erhalten. Dein neues System ist das gerade besiedelte.",
    rebirthAction: "Wiedergeburt",
    confirm: "Wiedergeburt bestätigen",
    cancel: "Durchlauf fortsetzen",
    locked: "Gesperrt",
    buy: "Kaufen",
    maxed: "Maximum",
    level: "Stufe",
    cost: "Kosten",
    perkNames: [
      "Kleine Wasserstofftasche",
      "Unerschöpfliche Ressourcen",
      "Effizienter Speicher",
      "Smarte Auto-Käufer",
      "Forschungsstart",
      "Optimierte Stromnetze",
      "Nano-Broker",
      "Robotische Forschungsautomatisierung",
      "Schnellere Asteroidensuche",
      "Tiefere Sternenstudie",
      "Asteroidenscanner-Boost",
      "Raketen-Tankoptimierung",
      "Verbesserter Abbau",
      "Quantenantriebe",
      "Automatisches Weltraumteleskop",
      "Mengenkauf",
    ],
    perkEffects: [
      "Bei der Wiedergeburt genug Wasserstoff für einen Käufer der Stufe 1.",
      "Startvorräte für jedes Material erhalten und alle freischalten.",
      "Mehr Speicherplatz pro Speicherkauf erhalten.",
      "Auto-Käufer werden pro Stufe 50 % effizienter.",
      "Neue Durchläufe mit Forschungstechnologien bis 4.200 starten.",
      "Stromnetze werden pro Stufe 20 % stärker.",
      "Auto-Verkauf, Verbindungssynthese und Compound-Käufer der Reihe nach freischalten.",
      "Verfügbare Technologien automatisch erforschen.",
      "Asteroidensuche pro Stufe um 25 % verkürzen.",
      "Reichweite der Sternenstudie pro Stufe verdoppeln.",
      "Mindestseltenheit von Asteroiden pro Stufe erhöhen.",
      "Raketenbetankung halbieren.",
      "Antimaterieabbau pro Stufe um 25 % steigern.",
      "Sternenschiffreise pro Stufe halbieren.",
      "Automatische Sternenstudie freischalten.",
      "Kaufsteuerung für maximale Mengen freischalten.",
    ],
  },
  it: {
    title: "Ascendenza",
    ap: "Punti Ascendenza",
    gp: "Punti Gloria",
    rebirths: "Rinascite",
    rebirthTitle: "Iniziare una nuova partita?",
    rebirthBody:
      "Le risorse, gli edifici, le ricerche e le navi di questa partita verranno azzerati. PA, PG, vantaggi, filosofia, impostazioni e statistiche complessive restano. Il nuovo sistema sarà quello appena colonizzato.",
    rebirthAction: "Rinascita",
    confirm: "Conferma rinascita",
    cancel: "Continua la partita",
    locked: "Bloccato",
    buy: "Acquista",
    maxed: "Massimo",
    level: "Livello",
    cost: "Costo",
    perkNames: [
      "Piccola scorta di idrogeno",
      "Risorse inesauribili",
      "Deposito efficiente",
      "Acquirenti automatici intelligenti",
      "Ricerca iniziale",
      "Reti elettriche ottimizzate",
      "Nano broker",
      "Automazione robotica della ricerca",
      "Scansione asteroidi rapida",
      "Studio stellare approfondito",
      "Potenziamento scanner asteroidi",
      "Ottimizzazione carburante razzi",
      "Estrazione potenziata",
      "Motori quantistici",
      "Telescopio spaziale automatico",
      "Acquisto in blocco",
    ],
    perkEffects: [
      "Rinasci con idrogeno sufficiente per un acquirente di livello 1.",
      "Risorse iniziali per ogni materiale e sblocco di tutti i materiali.",
      "Aumenta lo spazio ottenuto da ogni acquisto di deposito.",
      "Efficienza degli acquirenti +50% per livello.",
      "Avvia le rinascite con tecnologie fino a 4.200 punti ricerca.",
      "Potenza della rete +20% per livello.",
      "Sblocca vendita automatica, creazione composti e acquirenti composti in ordine.",
      "Ricerca automaticamente le tecnologie disponibili.",
      "Riduce del 25% il tempo di ricerca asteroidi per livello.",
      "Raddoppia il raggio dello studio stellare per livello.",
      "Aumenta la rarità minima degli asteroidi per livello.",
      "Dimezza il rifornimento dei razzi.",
      "Estrazione di antimateria +25% per livello.",
      "Dimezza il viaggio stellare per livello.",
      "Sblocca lo studio stellare automatico.",
      "Sblocca i comandi di acquisto massimo.",
    ],
  },
  fr: {
    title: "Ascendance",
    ap: "Points d’ascendance",
    gp: "Points de gloire",
    rebirths: "Renaissances",
    rebirthTitle: "Commencer une nouvelle partie ?",
    rebirthBody:
      "Les ressources, bâtiments, recherches et vaisseaux de cette partie seront réinitialisés. Les PA, PG, avantages, philosophie, paramètres et statistiques cumulées sont conservés. Votre nouveau système sera celui que vous venez de coloniser.",
    rebirthAction: "Renaissance",
    confirm: "Confirmer la renaissance",
    cancel: "Garder la partie",
    locked: "Verrouillé",
    buy: "Acheter",
    maxed: "Maximum",
    level: "Niveau",
    cost: "Coût",
    perkNames: [
      "Petite réserve d’hydrogène",
      "Ressources inépuisables",
      "Stockage efficace",
      "Acheteurs automatiques futés",
      "Recherche accélérée",
      "Réseaux électriques optimisés",
      "Nano-courtiers",
      "Automatisation robotique de la recherche",
      "Analyse rapide des astéroïdes",
      "Étude stellaire approfondie",
      "Amélioration du scanner d’astéroïdes",
      "Optimisation du carburant des fusées",
      "Extraction améliorée",
      "Moteurs quantiques",
      "Télescope spatial automatique",
      "Achats en gros",
    ],
    perkEffects: [
      "Renaître avec assez d’hydrogène pour un acheteur de niveau 1.",
      "Obtenir des réserves initiales pour chaque matériau et les débloquer.",
      "Augmenter le stockage obtenu à chaque achat.",
      "Efficacité des acheteurs +50 % par niveau.",
      "Commencer les renaissances avec les technologies coûtant jusqu’à 4 200 recherches.",
      "Puissance du réseau +20 % par niveau.",
      "Débloquer dans l’ordre vente, création de composés et leurs acheteurs.",
      "Rechercher automatiquement les technologies disponibles.",
      "Réduire de 25 % la durée des recherches d’astéroïdes par niveau.",
      "Doubler la portée de l’étude stellaire par niveau.",
      "Augmenter la rareté minimale des astéroïdes par niveau.",
      "Réduire de moitié le ravitaillement des fusées.",
      "Extraction d’antimatière +25 % par niveau.",
      "Réduire de moitié les voyages stellaires par niveau.",
      "Débloquer l’étude stellaire automatique.",
      "Débloquer l’achat de la quantité maximale.",
    ],
  },
};

const REBIRTH_TEXT: Record<
  LocaleId,
  {
    readonly title: string;
    readonly prompt: string;
    readonly carry: string;
    readonly gp: string;
    readonly confirm: string;
    readonly cancel: string;
    readonly lock: {
      readonly notAwarded: string;
      readonly noDestination: string;
      readonly currentDestination: string;
      readonly busy: string;
    };
  }
> = {
  en: {
    title: "WARNING: REBIRTH!",
    prompt:
      "You are about to reset your progress and start again at the new System.\n\nAre you sure you want to do this?",
    carry: "You will carry over {ap} AP!",
    gp: "You will gain 1GP!",
    confirm: "RESET ALL PROGRESS AND KEEP AP",
    cancel: "CANCEL",
    lock: {
      notAwarded: "Rebirth is available after settling a system and receiving its AP.",
      noDestination: "Settle a new system before rebirthing.",
      currentDestination: "Settle a different system before rebirthing.",
      busy: "Finish the current battle or starship journey before rebirthing.",
    },
  },
  es: {
    title: "¡ADVERTENCIA: RENACIMIENTO!",
    prompt:
      "Estás a punto de reiniciar tu progreso y comenzar de nuevo en el nuevo Sistema.\n\n¿Estás seguro de que quieres hacer esto?",
    carry: "¡Conservarás {ap} PA!",
    gp: "¡Ganarás 1PG!",
    confirm: "BORRAR TODO EL PROGRESO Y CONSERVAR LOS PA",
    cancel: "CANCELAR",
    lock: {
      notAwarded: "El renacimiento estará disponible cuando colonices un sistema y recibas sus PA.",
      noDestination: "Coloniza un nuevo sistema antes de renacer.",
      currentDestination: "Coloniza un sistema diferente antes de renacer.",
      busy: "Termina la batalla o el viaje estelar actual antes de renacer.",
    },
  },
  pt: {
    title: "AVISO: RENASCIMENTO!",
    prompt:
      "Estás prestes a reiniciar o teu progresso e começar de novo no novo Sistema.\n\nTens a certeza de que queres fazer isto?",
    carry: "Conservará {ap} PA!",
    gp: "Ganhará 1 PG!",
    confirm: "APAGAR TODO O PROGRESSO E CONSERVAR OS PA",
    cancel: "CANCELAR",
    lock: {
      notAwarded:
        "A renascença fica disponível depois de colonizares um sistema e receberes os PA.",
      noDestination: "Coloniza um novo sistema antes de renasceres.",
      currentDestination: "Coloniza um sistema diferente antes de renasceres.",
      busy: "Termina a batalha ou a viagem estelar atual antes de renasceres.",
    },
  },
  de: {
    title: "WARNUNG: WIEDERGEBURT!",
    prompt:
      "Du bist dabei, deinen Fortschritt zurückzusetzen und am neuen System neu zu beginnen.\n\nBist du sicher, dass du das tun möchtest?",
    carry: "Du nimmst {ap} AP mit!",
    gp: "Du erhältst 1GP!",
    confirm: "GESAMTEN FORTSCHRITT ZURÜCKSETZEN UND AP BEHALTEN",
    cancel: "ABBRECHEN",
    lock: {
      notAwarded:
        "Die Wiedergeburt ist nach der Besiedlung eines Systems und dem Erhalt seiner AP verfügbar.",
      noDestination: "Besiedle vor der Wiedergeburt ein neues System.",
      currentDestination: "Besiedle vor der Wiedergeburt ein anderes System.",
      busy: "Beende vor der Wiedergeburt die laufende Schlacht oder Sternenschiffreise.",
    },
  },
  it: {
    title: "AVVERTENZA: RINASCITA!",
    prompt:
      "Stai per azzerare il tuo progresso e ricominciare al nuovo Sistema.\n\nSei sicuro di volerlo fare?",
    carry: "Manterrai {ap} PA!",
    gp: "Otterrai 1PG!",
    confirm: "AZZERA TUTTI I PROGRESSI E MANTIENI I PA",
    cancel: "ANNULLA",
    lock: {
      notAwarded: "La rinascita è disponibile dopo aver colonizzato un sistema e ricevuto i PA.",
      noDestination: "Colonizza un nuovo sistema prima di rinascere.",
      currentDestination: "Colonizza un sistema diverso prima di rinascere.",
      busy: "Termina la battaglia o il viaggio stellare in corso prima di rinascere.",
    },
  },
  fr: {
    title: "AVERTISSEMENT: RENAISSANCE!",
    prompt:
      "Tu es sur le point de réinitialiser ta progression et recommencer au nouveau Système.\n\nEs-tu sûr de vouloir faire cela?",
    carry: "Vous conserverez {ap} PA!",
    gp: "Vous gagnerez 1PG!",
    confirm: "RÉINITIALISER TOUTE LA PROGRESSION ET CONSERVER LES PA",
    cancel: "ANNULER",
    lock: {
      notAwarded: "La renaissance est disponible après avoir colonisé un système et reçu ses PA.",
      noDestination: "Colonisez un nouveau système avant la renaissance.",
      currentDestination: "Colonisez un autre système avant la renaissance.",
      busy: "Terminez le combat ou le voyage stellaire en cours avant la renaissance.",
    },
  },
};

export type RebirthLockReason =
  | "rebirth-not-awarded"
  | "rebirth-no-destination"
  | "rebirth-current-destination"
  | "rebirth-busy";

export function rebirthText(
  locale: LocaleId,
  key: "title" | "prompt" | "gp" | "confirm" | "cancel",
): string {
  return REBIRTH_TEXT[locale][key];
}

export function rebirthCarryText(locale: LocaleId, points: number): string {
  return REBIRTH_TEXT[locale].carry.replace("{ap}", new Intl.NumberFormat(locale).format(points));
}

export function rebirthLockText(locale: LocaleId, reason: RebirthLockReason | undefined): string {
  if (!reason) return "";
  const lockKeys: Record<
    RebirthLockReason,
    "notAwarded" | "noDestination" | "currentDestination" | "busy"
  > = {
    "rebirth-not-awarded": "notAwarded",
    "rebirth-no-destination": "noDestination",
    "rebirth-current-destination": "currentDestination",
    "rebirth-busy": "busy",
  };
  return REBIRTH_TEXT[locale].lock[lockKeys[reason]];
}

export type MarketMessageKey =
  | "heading"
  | "description"
  | "outgoing"
  | "incoming"
  | "quantity"
  | "preview"
  | "commission"
  | "adjustedValue"
  | "marketBias"
  | "tradeVolume"
  | "trade"
  | "history"
  | "noHistory"
  | "apPrice"
  | "sellAp"
  | "sellApAction"
  | "liquidation"
  | "liquidationValue"
  | "liquidationAp"
  | "liquidate"
  | "liquidateTitle"
  | "liquidatePrompt"
  | "confirmLiquidation"
  | "cancel"
  | "notUnlocked"
  | "locked"
  | "lockedCountdown"
  | "invalidTrade"
  | "goodLocked"
  | "insufficientStock"
  | "capacity"
  | "insufficientAp"
  | "liquidated"
  | "noLiquidation";

const MARKET_COPY: Record<LocaleId, Record<MarketMessageKey, string>> = {
  en: {
    heading: "Galactic Market",
    description:
      "Trade unlocked stock at current market values. The market takes a percentage commission.",
    outgoing: "You give",
    incoming: "You receive",
    quantity: "Quantity to trade",
    preview: "Trade preview",
    commission: "Commission",
    adjustedValue: "Adjusted unit value",
    marketBias: "Market bias",
    tradeVolume: "Trade volume",
    trade: "Confirm trade",
    history: "Recent trades",
    noHistory: "No trades yet.",
    apPrice: "Cash per AP",
    sellAp: "AP to sell",
    sellApAction: "Sell AP for cash",
    liquidation: "Liquidate run assets for AP",
    liquidationValue: "Liquidation value",
    liquidationAp: "AP received",
    liquidate: "Liquidate all assets",
    liquidateTitle: "Confirm asset liquidation",
    liquidatePrompt:
      "This consumes all current cash and unlocked or locked material and compound stock in this run. The conversion uses the current AP price.",
    confirmLiquidation: "CONFIRM LIQUIDATION",
    cancel: "CANCEL",
    notUnlocked: "The Galactic Market unlocks after your first Ascendency Point award.",
    locked: "The Galactic Market is in lockdown. Trading will resume when the event ends.",
    lockedCountdown: "Time until the Galactic Market reopens: {minutes} min.",
    invalidTrade: "Choose two different goods and a positive whole quantity with a nonzero return.",
    goodLocked: "Both goods must be unlocked before they can be traded.",
    insufficientStock: "You do not have enough stock for this trade.",
    capacity: "Increase storage before receiving this amount.",
    insufficientAp: "You do not have enough AP for that sale.",
    liquidated: "Assets have already been liquidated this run.",
    noLiquidation: "Current assets are worth less than one AP at the current price.",
  },
  es: {
    heading: "Mercado galáctico",
    description:
      "Intercambia existencias desbloqueadas al valor actual. El mercado cobra una comisión porcentual.",
    outgoing: "Entregas",
    incoming: "Recibes",
    quantity: "Cantidad a intercambiar",
    preview: "Resumen del intercambio",
    commission: "Comisión",
    adjustedValue: "Valor unitario ajustado",
    marketBias: "Tendencia del mercado",
    tradeVolume: "Volumen de comercio",
    trade: "Confirmar intercambio",
    history: "Intercambios recientes",
    noHistory: "Aún no hay intercambios.",
    apPrice: "Dinero por PA",
    sellAp: "PA para vender",
    sellApAction: "Vender PA por dinero",
    liquidation: "Liquidar activos de la partida por PA",
    liquidationValue: "Valor de liquidación",
    liquidationAp: "PA recibidos",
    liquidate: "Liquidar todos los activos",
    liquidateTitle: "Confirmar liquidación de activos",
    liquidatePrompt:
      "Esto consume todo el dinero y las existencias de materiales y compuestos de esta partida. La conversión usa el precio actual de PA.",
    confirmLiquidation: "CONFIRMAR LIQUIDACIÓN",
    cancel: "CANCELAR",
    notUnlocked: "El Mercado galáctico se desbloquea al recibir tu primer Punto de Ascendencia.",
    locked: "El Mercado galáctico está cerrado. El comercio volverá cuando termine el evento.",
    lockedCountdown: "Tiempo hasta que reabra el Mercado galáctico: {minutes} min.",
    invalidTrade:
      "Elige dos recursos distintos y una cantidad entera positiva que produzca una ganancia.",
    goodLocked: "Debes desbloquear ambos recursos antes de intercambiarlos.",
    insufficientStock: "No tienes existencias suficientes para este intercambio.",
    capacity: "Aumenta el almacenamiento antes de recibir esta cantidad.",
    insufficientAp: "No tienes suficientes PA para esa venta.",
    liquidated: "Los activos ya se liquidaron en esta partida.",
    noLiquidation: "Al precio actual, los activos valen menos de un PA.",
  },
  pt: {
    heading: "Mercado galáctico",
    description:
      "Troca stock desbloqueado pelo valor atual. O mercado cobra uma comissão percentual.",
    outgoing: "Entregas",
    incoming: "Recebes",
    quantity: "Quantidade a trocar",
    preview: "Resumo da troca",
    commission: "Comissão",
    adjustedValue: "Valor unitário ajustado",
    marketBias: "Tendência do mercado",
    tradeVolume: "Volume de trocas",
    trade: "Confirmar troca",
    history: "Trocas recentes",
    noHistory: "Ainda não há trocas.",
    apPrice: "Dinheiro por PA",
    sellAp: "PA a vender",
    sellApAction: "Vender PA por dinheiro",
    liquidation: "Liquidar ativos da jornada por PA",
    liquidationValue: "Valor de liquidação",
    liquidationAp: "PA recebidos",
    liquidate: "Liquidar todos os ativos",
    liquidateTitle: "Confirmar liquidação de ativos",
    liquidatePrompt:
      "Isto consome todo o dinheiro e o stock de materiais e compostos desta jornada. A conversão usa o preço atual de PA.",
    confirmLiquidation: "CONFIRMAR LIQUIDAÇÃO",
    cancel: "CANCELAR",
    notUnlocked: "O Mercado galáctico desbloqueia após o primeiro ganho de Pontos de Ascendência.",
    locked: "O Mercado galáctico está fechado. As trocas recomeçam quando o evento terminar.",
    lockedCountdown: "Tempo até o Mercado galáctico reabrir: {minutes} min.",
    invalidTrade: "Escolhe dois bens diferentes e uma quantidade inteira positiva que dê retorno.",
    goodLocked: "Desbloqueia ambos os bens antes de os trocar.",
    insufficientStock: "Não tens stock suficiente para esta troca.",
    capacity: "Aumenta o armazenamento antes de receber esta quantidade.",
    insufficientAp: "Não tens PA suficientes para essa venda.",
    liquidated: "Os ativos já foram liquidados nesta jornada.",
    noLiquidation: "Ao preço atual, os ativos valem menos de um PA.",
  },
  de: {
    heading: "Galaktischer Markt",
    description:
      "Handle freigeschaltete Vorräte zum aktuellen Marktwert. Der Markt verlangt eine prozentuale Gebühr.",
    outgoing: "Du gibst",
    incoming: "Du erhältst",
    quantity: "Handelsmenge",
    preview: "Handelsübersicht",
    commission: "Gebühr",
    adjustedValue: "Angepasster Stückwert",
    marketBias: "Markttendenz",
    tradeVolume: "Handelsvolumen",
    trade: "Handel bestätigen",
    history: "Letzte Handelsgeschäfte",
    noHistory: "Noch keine Handelsgeschäfte.",
    apPrice: "Geld pro AP",
    sellAp: "Zu verkaufende AP",
    sellApAction: "AP gegen Geld verkaufen",
    liquidation: "Run-Vermögen für AP liquidieren",
    liquidationValue: "Liquidationswert",
    liquidationAp: "Erhaltene AP",
    liquidate: "Vermögen liquidieren",
    liquidateTitle: "Liquidation bestätigen",
    liquidatePrompt:
      "Dabei werden sämtliches Geld und alle Material- und Verbindungsvorräte dieses Durchlaufs verbraucht. Die Umrechnung nutzt den aktuellen AP-Preis.",
    confirmLiquidation: "LIQUIDATION BESTÄTIGEN",
    cancel: "ABBRECHEN",
    notUnlocked: "Der Galaktische Markt wird nach dem ersten Aszendenzpunkt freigeschaltet.",
    locked: "Der Galaktische Markt ist gesperrt. Der Handel beginnt nach dem Ereignis wieder.",
    lockedCountdown: "Zeit bis zur Wiedereröffnung des Galaktischen Markts: {minutes} Min.",
    invalidTrade:
      "Wähle zwei verschiedene Güter und eine positive ganze Menge mit einem Ergebnis größer null.",
    goodLocked: "Beide Güter müssen vor dem Handel freigeschaltet sein.",
    insufficientStock: "Dein Vorrat reicht für diesen Handel nicht aus.",
    capacity: "Erhöhe den Speicherplatz, bevor du diese Menge erhältst.",
    insufficientAp: "Du hast nicht genug AP für diesen Verkauf.",
    liquidated: "Das Vermögen wurde in diesem Durchlauf bereits liquidiert.",
    noLiquidation: "Das aktuelle Vermögen ist beim derzeitigen Preis weniger als einen AP wert.",
  },
  it: {
    heading: "Mercato galattico",
    description:
      "Scambia le scorte sbloccate al valore di mercato attuale. Il mercato applica una commissione percentuale.",
    outgoing: "Cedi",
    incoming: "Ricevi",
    quantity: "Quantità da scambiare",
    preview: "Riepilogo dello scambio",
    commission: "Commissione",
    adjustedValue: "Valore unitario corretto",
    marketBias: "Tendenza del mercato",
    tradeVolume: "Volume degli scambi",
    trade: "Conferma scambio",
    history: "Scambi recenti",
    noHistory: "Nessuno scambio ancora.",
    apPrice: "Denaro per PA",
    sellAp: "PA da vendere",
    sellApAction: "Vendi PA per denaro",
    liquidation: "Liquida gli asset della partita per PA",
    liquidationValue: "Valore di liquidazione",
    liquidationAp: "PA ricevuti",
    liquidate: "Liquida tutti gli asset",
    liquidateTitle: "Conferma la liquidazione degli asset",
    liquidatePrompt:
      "Questo consuma tutto il denaro e le scorte di materiali e composti della partita. La conversione usa il prezzo attuale dei PA.",
    confirmLiquidation: "CONFERMA LIQUIDAZIONE",
    cancel: "ANNULLA",
    notUnlocked: "Il Mercato galattico si sblocca dopo il primo guadagno di Punti Ascendenza.",
    locked: "Il Mercato galattico è in blocco. Gli scambi riprenderanno al termine dell'evento.",
    lockedCountdown: "Tempo alla riapertura del Mercato galattico: {minutes} min.",
    invalidTrade:
      "Scegli due beni diversi e una quantità intera positiva con un ricavo maggiore di zero.",
    goodLocked: "Sblocca entrambi i beni prima di scambiarli.",
    insufficientStock: "Le scorte non bastano per questo scambio.",
    capacity: "Aumenta il deposito prima di ricevere questa quantità.",
    insufficientAp: "Non hai abbastanza PA per questa vendita.",
    liquidated: "Gli asset sono già stati liquidati in questa partita.",
    noLiquidation: "Al prezzo attuale gli asset valgono meno di un PA.",
  },
  fr: {
    heading: "Marché galactique",
    description:
      "Échangez les stocks débloqués au cours actuel. Le marché prélève une commission en pourcentage.",
    outgoing: "Vous cédez",
    incoming: "Vous recevez",
    quantity: "Quantité à échanger",
    preview: "Aperçu de l'échange",
    commission: "Commission",
    adjustedValue: "Valeur unitaire ajustée",
    marketBias: "Tendance du marché",
    tradeVolume: "Volume des échanges",
    trade: "Confirmer l'échange",
    history: "Échanges récents",
    noHistory: "Aucun échange pour le moment.",
    apPrice: "Argent par PA",
    sellAp: "PA à vendre",
    sellApAction: "Vendre des PA contre de l'argent",
    liquidation: "Liquider les actifs de la partie contre des PA",
    liquidationValue: "Valeur de liquidation",
    liquidationAp: "PA reçus",
    liquidate: "Liquider tous les actifs",
    liquidateTitle: "Confirmer la liquidation des actifs",
    liquidatePrompt:
      "Cette action consomme tout l'argent et tous les stocks de matériaux et composés de cette partie. La conversion utilise le cours actuel des PA.",
    confirmLiquidation: "CONFIRMER LA LIQUIDATION",
    cancel: "ANNULER",
    notUnlocked: "Le Marché galactique se débloque après le premier gain de Points d'ascendance.",
    locked: "Le Marché galactique est fermé. Les échanges reprendront à la fin de l'événement.",
    lockedCountdown: "Réouverture du Marché galactique dans {minutes} min.",
    invalidTrade:
      "Choisissez deux biens différents et une quantité entière positive donnant un résultat supérieur à zéro.",
    goodLocked: "Les deux biens doivent être débloqués avant l'échange.",
    insufficientStock: "Votre stock est insuffisant pour cet échange.",
    capacity: "Augmentez le stockage avant de recevoir cette quantité.",
    insufficientAp: "Vous n'avez pas assez de PA pour cette vente.",
    liquidated: "Les actifs ont déjà été liquidés pendant cette partie.",
    noLiquidation: "Au cours actuel, les actifs valent moins d'un PA.",
  },
};

export function marketText(locale: LocaleId, key: MarketMessageKey): string {
  return MARKET_COPY[locale][key];
}

export function marketLockCountdownText(locale: LocaleId, remainingMs: number): string {
  const minutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return marketText(locale, "lockedCountdown").replace(
    "{minutes}",
    new Intl.NumberFormat(locale).format(minutes),
  );
}

export function marketFailureText(locale: LocaleId, code: string): string {
  const keys: Record<string, MarketMessageKey> = {
    "market-not-unlocked": "notUnlocked",
    "market-locked": "locked",
    "market-invalid-trade": "invalidTrade",
    "market-good-locked": "goodLocked",
    "market-insufficient-stock": "insufficientStock",
    "market-capacity": "capacity",
    "market-insufficient-ap": "insufficientAp",
    "market-liquidated": "liquidated",
    "market-no-liquidation": "noLiquidation",
  };
  const key = keys[code];
  return key ? MARKET_COPY[locale][key] : MARKET_COPY[locale].locked;
}

export function metaText(locale: LocaleId, key: Exclude<keyof MetaCopy, "perks">): string {
  return PACKS[locale][key];
}

export function metaPerkCopy(
  locale: LocaleId,
  perkId: AscendencyPerkId,
): readonly [string, string] {
  const index = PERK_IDS.indexOf(perkId);
  const pack = PACKS[locale];
  return [pack.perkNames[index] ?? perkId, pack.perkEffects[index] ?? ""];
}
