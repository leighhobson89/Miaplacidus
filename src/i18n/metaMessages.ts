import type { LocaleId } from "../content/ids";
import type { AscendencyPerkId } from "../content/ascendency";

interface MetaCopy {
  readonly title: string;
  readonly perksTitle: string;
  readonly perksOverview: string;
  readonly ap: string;
  readonly gp: string;
  readonly rebirths: string;
  readonly rebirthTitle: string;
  readonly rebirthBody: string;
  readonly rebirthOverview: string;
  readonly rebirthSourceHelp: string;
  readonly rebirthMegastructureWarning: string;
  readonly rebirthAction: string;
  readonly rebirthTabLabel: string;
  readonly confirm: string;
  readonly cancel: string;
  readonly locked: string;
  readonly buy: string;
  readonly maxed: string;
  readonly level: string;
  readonly cost: string;
  readonly rebuyable: string;
  readonly yes: string;
  readonly no: string;
  readonly perkInsufficient: string;
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
    perksTitle: "Ascendency Perks",
    perksOverview: "Here you can spend AP for permanent buffs to speed up your runs!",
    ap: "Ascendency Points",
    gp: "Galactic Points",
    rebirths: "Rebirths",
    rebirthTitle: "Begin a new run?",
    rebirthOverview: "Here you can reset the run at your new system, once settled!",
    rebirthSourceHelp:
      "Rebirth to start over at the new System. This will reset all progress, but you will keep unspent AP and any permanent buffs purchased with it",
    rebirthMegastructureWarning:
      "MEGASTRUCTURE STARS: It's Mandatory to Disconnect the MegaStructure before Rebirth!",
    rebirthBody:
      "Run resources, buildings, research and ships reset. AP, GP, ascendency perks, philosophy, settings and lifetime statistics remain. Your new system will be the one you just settled.",
    rebirthAction: "REBIRTH",
    rebirthTabLabel: "Rebirth",
    confirm: "Confirm rebirth",
    cancel: "Keep current run",
    locked: "Locked",
    buy: "Purchase",
    maxed: "Maxed",
    level: "Level",
    cost: "Cost",
    rebuyable: "Rebuyable:",
    yes: "Yes",
    no: "No",
    perkInsufficient: "Requires {required} AP; you have {available}.",
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
    perksTitle: "Beneficios de Ascendencia",
    perksOverview: "¡Aquí puedes gastar AP por mejoras permanentes para acelerar tus runs!",
    ap: "Puntos de Ascendencia",
    gp: "Puntos galácticos",
    rebirths: "Renacimientos",
    rebirthTitle: "¿Comenzar una nueva partida?",
    rebirthOverview: "¡Aquí puedes reiniciar la run en tu nuevo sistema, una vez establecido!",
    rebirthSourceHelp:
      "Renace para comenzar de nuevo en el nuevo Sistema. Esto reiniciará todo el progreso, pero conservarás los AP no gastados y cualquier mejora permanente comprada con ellos",
    rebirthMegastructureWarning:
      "ESTRELLAS MEGAESTRUCTURA: ¡Es obligatorio desconectar la MegaEstructura antes del Renacimiento!",
    rebirthBody:
      "Se reinician los recursos, edificios, investigaciones y naves de esta partida. Se conservan los PA, PG, ventajas, filosofía, ajustes y estadísticas de por vida. Tu nuevo sistema será el que acabas de colonizar.",
    rebirthAction: "RENACER",
    rebirthTabLabel: "Renacimiento",
    confirm: "Confirmar renacimiento",
    cancel: "Continuar partida",
    locked: "Bloqueado",
    buy: "Comprar",
    maxed: "Al máximo",
    level: "Nivel",
    cost: "Coste",
    rebuyable: "Recomprable:",
    yes: "Sí",
    no: "No",
    perkInsufficient: "Requiere {required} PA; tienes {available}.",
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
    perksTitle: "Benefícios de Ascendência",
    perksOverview: "Aqui podes gastar AP em melhorias permanentes para acelerar as tuas runs!",
    ap: "Pontos de Ascendência",
    gp: "Pontos galácticos",
    rebirths: "Renascimentos",
    rebirthTitle: "Começar uma nova jornada?",
    rebirthOverview: "Aqui podes reiniciar a run no teu novo sistema, uma vez estabelecido!",
    rebirthSourceHelp:
      "Renasça para começar de novo no novo Sistema. Isso reiniciará todo o progresso, mas você manterá os AP não gastos e quaisquer melhorias permanentes compradas com eles",
    rebirthMegastructureWarning:
      "ESTRELAS MEGAESTRUTURA: É obrigatório desligar a MegaEstrutura antes do Renascimento!",
    rebirthBody:
      "Os recursos, edifícios, pesquisas e naves desta jornada serão reiniciados. PA, PG, vantagens, filosofia, definições e estatísticas vitalícias permanecem. O novo sistema será aquele que acabou de colonizar.",
    rebirthAction: "RENASCER",
    rebirthTabLabel: "Renascimento",
    confirm: "Confirmar renascimento",
    cancel: "Manter jornada atual",
    locked: "Bloqueado",
    buy: "Comprar",
    maxed: "No máximo",
    level: "Nível",
    cost: "Custo",
    rebuyable: "Recomprável:",
    yes: "Sim",
    no: "Não",
    perkInsufficient: "Requer {required} PA; você tem {available}.",
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
    perksTitle: "Aufstiegsboni",
    perksOverview:
      "Hier kannst du AP für permanente Buffs ausgeben, um deine Runs zu beschleunigen!",
    ap: "Aszendenzpunkte",
    gp: "Galaktische Punkte",
    rebirths: "Wiedergeburten",
    rebirthTitle: "Einen neuen Durchlauf beginnen?",
    rebirthOverview:
      "Hier kannst du den Run in deinem neuen System zurücksetzen, sobald es besiedelt ist!",
    rebirthSourceHelp:
      "Wiedergeburt, um im neuen System neu zu beginnen. Dies setzt den gesamten Fortschritt zurück, aber du behältst unausgegebene AP und alle damit gekauften permanenten Verbesserungen",
    rebirthMegastructureWarning:
      "MEGASTRUKTUR-STERNE: Es ist zwingend erforderlich, die MegaStruktur vor der Wiedergeburt zu trennen!",
    rebirthBody:
      "Ressourcen, Gebäude, Forschung und Schiffe dieses Durchlaufs werden zurückgesetzt. AP, RP, Vorteile, Philosophie, Einstellungen und Lebenszeitstatistiken bleiben erhalten. Dein neues System ist das gerade besiedelte.",
    rebirthAction: "WIEDERGEBURT",
    rebirthTabLabel: "Wiedergeburt",
    confirm: "Wiedergeburt bestätigen",
    cancel: "Durchlauf fortsetzen",
    locked: "Gesperrt",
    buy: "Kaufen",
    maxed: "Maximum",
    level: "Stufe",
    cost: "Kosten",
    rebuyable: "Wiederkaufbar:",
    yes: "Ja",
    no: "Nein",
    perkInsufficient: "Benötigt {required} AP; du hast {available}.",
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
    perksTitle: "Vantaggi di Ascendenza",
    perksOverview: "Qui puoi spendere AP per potenziamenti permanenti per velocizzare le tue run!",
    ap: "Punti Ascendenza",
    gp: "Punti galattici",
    rebirths: "Rinascite",
    rebirthTitle: "Iniziare una nuova partita?",
    rebirthOverview: "Qui puoi resettare la run al tuo nuovo sistema, una volta stabilito!",
    rebirthSourceHelp:
      "Rinascere per ricominciare nel nuovo Sistema. Questo azzererà tutti i progressi, ma manterrai gli AP non spesi e qualsiasi potenziamento permanente acquistato con essi",
    rebirthMegastructureWarning:
      "STELLE MEGASTRUTTURA: È obbligatorio disconnettere la MegaStruttura prima della Rinascita!",
    rebirthBody:
      "Le risorse, gli edifici, le ricerche e le navi di questa partita verranno azzerati. PA, PG, vantaggi, filosofia, impostazioni e statistiche complessive restano. Il nuovo sistema sarà quello appena colonizzato.",
    rebirthAction: "RINASCI",
    rebirthTabLabel: "Rinascita",
    confirm: "Conferma rinascita",
    cancel: "Continua la partita",
    locked: "Bloccato",
    buy: "Acquista",
    maxed: "Massimo",
    level: "Livello",
    cost: "Costo",
    rebuyable: "Riacquistabile:",
    yes: "Sì",
    no: "No",
    perkInsufficient: "Richiede {required} PA; ne hai {available}.",
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
    perksTitle: "Avantages d'Ascendance",
    perksOverview: "Ici tu peux dépenser des AP pour des buffs permanents pour accélérer tes runs!",
    ap: "Points d’ascendance",
    gp: "Points galactiques",
    rebirths: "Renaissances",
    rebirthTitle: "Commencer une nouvelle partie ?",
    rebirthOverview: "Ici tu peux réinitialiser la run à ton nouveau système, une fois installé!",
    rebirthSourceHelp:
      "Renaître pour recommencer dans le nouveau Système. Cela réinitialisera toute la progression, mais vous conserverez les PA non dépensés et tous les buffs permanents achetés avec",
    rebirthMegastructureWarning:
      "ÉTOILES MÉGASTRUCTURE: Il est obligatoire de déconnecter la MégaStructure avant la Renaissance!",
    rebirthBody:
      "Les ressources, bâtiments, recherches et vaisseaux de cette partie seront réinitialisés. Les PA, PG, avantages, philosophie, paramètres et statistiques cumulées sont conservés. Votre nouveau système sera celui que vous venez de coloniser.",
    rebirthAction: "RENAÎTRE",
    rebirthTabLabel: "Renaissance",
    confirm: "Confirmer la renaissance",
    cancel: "Garder la partie",
    locked: "Verrouillé",
    buy: "Acheter",
    maxed: "Maximum",
    level: "Niveau",
    cost: "Coût",
    rebuyable: "Rachetable:",
    yes: "Oui",
    no: "Non",
    perkInsufficient: "Nécessite {required} PA ; vous en avez {available}.",
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

export function rebirthCarryText(locale: LocaleId, formattedPoints: string): string {
  return REBIRTH_TEXT[locale].carry.replace("{ap}", formattedPoints);
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
  | "tradeRow"
  | "confirmRowLabel"
  | "summaryOutgoing"
  | "summaryIncoming"
  | "outgoing"
  | "incoming"
  | "tradeFor"
  | "quantity"
  | "preview"
  | "commission"
  | "adjustedValue"
  | "marketBias"
  | "tradeVolume"
  | "trade"
  | "tradeCompleteNotification"
  | "history"
  | "noHistory"
  | "apPrice"
  | "cashGain"
  | "sellAp"
  | "sellApAction"
  | "selectQuantity"
  | "sellAp1"
  | "sellAp5"
  | "sellAp10"
  | "liquidation"
  | "liquidationHelpLabel"
  | "liquidationHelp"
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
    description: "Here you can make various trades in the Galactic Market.",
    tradeRow: "Trade:",
    confirmRowLabel: "Confirm:",
    summaryOutgoing: "Trade",
    summaryIncoming: "for",
    outgoing: "You give",
    incoming: "You receive",
    tradeFor: "For:",
    quantity: "Quantity:",
    preview: "Trade preview",
    commission: "Commission",
    adjustedValue: "Adjusted unit value",
    marketBias: "Market bias",
    tradeVolume: "Trade volume",
    trade: "CONFIRM",
    tradeCompleteNotification:
      "You have traded {outgoing} for {incoming} and paid {commission} commission!",
    history: "Recent trades",
    noHistory: "No trades yet.",
    apPrice: "Cash per AP",
    cashGain: "Cash Gain:",
    sellAp: "Sell AP:",
    sellApAction: "SELL",
    selectQuantity: "Select Quantity",
    sellAp1: "Sell 1 AP",
    sellAp5: "Sell 5 AP",
    sellAp10: "Sell 10 AP",
    liquidation: "Liquidate run assets for AP",
    liquidationHelpLabel: "Liquidation calculation help",
    liquidationHelp:
      "Goods and compounds are valued at their current sale value per unit; cash counts as one tenth of its face value. The total is divided by the current price to buy 1 AP, then rounded down.",
    liquidationValue: "Liquidation value",
    liquidationAp: "AP received",
    liquidate: "LIQUIDATE",
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
    insufficientStock: "You have {available} {good}, but this trade needs {required}.",
    capacity:
      "This trade would add {required} {good}, but only {available} storage is free (limit {capacity}).",
    insufficientAp: "This sale needs {required} AP; you have {available}.",
    liquidated: "Assets have already been liquidated this run.",
    noLiquidation:
      "Liquidation is worth {value}; at least {minimum} is needed for 1 AP at the current price.",
  },
  es: {
    heading: "Mercado Galáctico",
    description: "Aquí puedes hacer varios intercambios en el Mercado Galáctico.",
    tradeRow: "Intercambio:",
    confirmRowLabel: "Confirmar:",
    summaryOutgoing: "Intercambiar",
    summaryIncoming: "por",
    outgoing: "Entregas",
    incoming: "Recibes",
    tradeFor: "Por:",
    quantity: "Cantidad:",
    preview: "Resumen del intercambio",
    commission: "Comisión",
    adjustedValue: "Valor unitario ajustado",
    marketBias: "Tendencia del mercado",
    tradeVolume: "Volumen de comercio",
    trade: "CONFIRMAR",
    tradeCompleteNotification:
      "¡Has intercambiado {outgoing} por {incoming} y pagado {commission} de comisión!",
    history: "Intercambios recientes",
    noHistory: "Aún no hay intercambios.",
    apPrice: "Dinero por PA",
    cashGain: "Dinero Ganado:",
    sellAp: "Vender PA:",
    sellApAction: "VENDER",
    selectQuantity: "Selecciona la cantidad",
    sellAp1: "Vender 1 PA",
    sellAp5: "Vender 5 PA",
    sellAp10: "Vender 10 PA",
    liquidation: "Liquidar activos de la partida por PA",
    liquidationHelpLabel: "Ayuda sobre el cálculo de la liquidación",
    liquidationHelp:
      "Los recursos y compuestos se valoran al precio de venta actual por unidad; el dinero cuenta como una décima parte de su valor nominal. El total se divide entre el precio actual de compra de 1 PA y se redondea hacia abajo.",
    liquidationValue: "Valor de liquidación",
    liquidationAp: "PA recibidos",
    liquidate: "LIQUIDAR",
    liquidateTitle: "Confirmar liquidación de activos",
    liquidatePrompt:
      "Esto consume todo el dinero y las existencias de materiales y compuestos de esta partida. La conversión usa el precio actual de PA.",
    confirmLiquidation: "CONFIRMAR LIQUIDACIÓN",
    cancel: "CANCELAR",
    notUnlocked: "El Mercado galáctico se desbloquea al recibir tu primer Punto de Ascendencia.",
    locked: "El Mercado galáctico está cerrado. El comercio volverá cuando termine el evento.",
    lockedCountdown: "Tiempo hasta que reabra el Mercado galáctico: {minutes} min.",
    invalidTrade:
      "Elige dos bienes distintos y una cantidad entera positiva que produzca una ganancia.",
    goodLocked: "Debes desbloquear ambos bienes antes de intercambiarlos.",
    insufficientStock: "Tienes {available} {good}, pero este intercambio necesita {required}.",
    capacity:
      "Este intercambio añadiría {required} {good}, pero solo queda espacio para {available} (límite: {capacity}).",
    insufficientAp: "Esta venta necesita {required} PA; tienes {available}.",
    liquidated: "Los activos ya se liquidaron en esta partida.",
    noLiquidation:
      "La liquidación vale {value}; se necesitan al menos {minimum} para obtener 1 PA al precio actual.",
  },
  pt: {
    heading: "Mercado Galáctico",
    description: "Aqui podes fazer várias trocas no Mercado Galáctico.",
    tradeRow: "Troca:",
    confirmRowLabel: "Confirmar:",
    summaryOutgoing: "Trocar",
    summaryIncoming: "por",
    outgoing: "Entregas",
    incoming: "Recebes",
    tradeFor: "Por:",
    quantity: "Quantidade:",
    preview: "Resumo da troca",
    commission: "Comissão",
    adjustedValue: "Valor unitário ajustado",
    marketBias: "Tendência do mercado",
    tradeVolume: "Volume de trocas",
    trade: "CONFIRMAR",
    tradeCompleteNotification:
      "Trocaste {outgoing} por {incoming} e pagaste {commission} de comissão!",
    history: "Trocas recentes",
    noHistory: "Ainda não há trocas.",
    apPrice: "Dinheiro por PA",
    cashGain: "Dinheiro Ganho:",
    sellAp: "Vender PA:",
    sellApAction: "VENDER",
    selectQuantity: "Selecione a quantidade",
    sellAp1: "Vender 1 PA",
    sellAp5: "Vender 5 PA",
    sellAp10: "Vender 10 PA",
    liquidation: "Liquidar ativos da jornada por PA",
    liquidationHelpLabel: "Ajuda sobre o cálculo da liquidação",
    liquidationHelp:
      "Recursos e compostos são avaliados pelo preço de venda atual por unidade; o dinheiro conta como um décimo do seu valor nominal. O total é dividido pelo preço atual de compra de 1 PA e arredondado para baixo.",
    liquidationValue: "Valor de liquidação",
    liquidationAp: "PA recebidos",
    liquidate: "LIQUIDAR",
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
    insufficientStock: "Tens {available} {good}, mas esta troca precisa de {required}.",
    capacity:
      "Esta troca acrescentaria {required} {good}, mas só há espaço para {available} (limite: {capacity}).",
    insufficientAp: "Esta venda precisa de {required} PA; tens {available}.",
    liquidated: "Os ativos já foram liquidados nesta jornada.",
    noLiquidation:
      "A liquidação vale {value}; são necessários pelo menos {minimum} para obter 1 PA ao preço atual.",
  },
  de: {
    heading: "Galaktischer Markt",
    description: "Hier kannst du verschiedene Handelsgeschäfte im Galaktischen Markt tätigen.",
    tradeRow: "Handel:",
    confirmRowLabel: "Bestätigen:",
    summaryOutgoing: "Tausche",
    summaryIncoming: "gegen",
    outgoing: "Du gibst",
    incoming: "Du erhältst",
    tradeFor: "Für:",
    quantity: "Menge:",
    preview: "Handelsübersicht",
    commission: "Provision",
    adjustedValue: "Angepasster Stückwert",
    marketBias: "Markttendenz",
    tradeVolume: "Handelsvolumen",
    trade: "BESTÄTIGEN",
    tradeCompleteNotification:
      "Du hast {outgoing} gegen {incoming} getauscht und {commission} Provision gezahlt!",
    history: "Letzte Handelsgeschäfte",
    noHistory: "Noch keine Handelsgeschäfte.",
    apPrice: "Geld pro AP",
    cashGain: "Bargeldgewinn:",
    sellAp: "AP Verkaufen:",
    sellApAction: "VERKAUFEN",
    selectQuantity: "Menge wählen",
    sellAp1: "1 AP Verkaufen",
    sellAp5: "5 AP Verkaufen",
    sellAp10: "10 AP Verkaufen",
    liquidation: "Run-Vermögen für AP liquidieren",
    liquidationHelpLabel: "Hilfe zur Berechnung der Liquidation",
    liquidationHelp:
      "Ressourcen und Verbindungen werden mit ihrem aktuellen Verkaufspreis pro Einheit bewertet; Geld zählt zu einem Zehntel seines Nennwerts. Die Summe wird durch den aktuellen Kaufpreis für 1 AP geteilt und abgerundet.",
    liquidationValue: "Liquidationswert",
    liquidationAp: "Erhaltene AP",
    liquidate: "LIQUIDIEREN",
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
    insufficientStock:
      "Du hast {available} {good}, aber für diesen Handel werden {required} benötigt.",
    capacity:
      "Dieser Handel würde {required} {good} hinzufügen, aber es sind nur {available} Lagerplätze frei (Limit: {capacity}).",
    insufficientAp: "Für diesen Verkauf werden {required} AP benötigt; du hast {available}.",
    liquidated: "Das Vermögen wurde in diesem Durchlauf bereits liquidiert.",
    noLiquidation:
      "Die Liquidation ist {value} wert; für 1 AP werden zum aktuellen Kurs mindestens {minimum} benötigt.",
  },
  it: {
    heading: "Mercato Galattico",
    description: "Qui puoi fare varie operazioni di trading nel Mercato Galattico.",
    tradeRow: "Scambio:",
    confirmRowLabel: "Conferma:",
    summaryOutgoing: "Scambia",
    summaryIncoming: "per",
    outgoing: "Cedi",
    incoming: "Ricevi",
    tradeFor: "Per:",
    quantity: "Quantità:",
    preview: "Riepilogo dello scambio",
    commission: "Commissione",
    adjustedValue: "Valore unitario corretto",
    marketBias: "Tendenza del mercato",
    tradeVolume: "Volume degli scambi",
    trade: "CONFERMA",
    tradeCompleteNotification:
      "Hai scambiato {outgoing} con {incoming} e pagato {commission} di commissione!",
    history: "Scambi recenti",
    noHistory: "Nessuno scambio ancora.",
    apPrice: "Denaro per PA",
    cashGain: "Denaro Guadagnato:",
    sellAp: "Vendi PA:",
    sellApAction: "VENDI",
    selectQuantity: "Seleziona la quantità",
    sellAp1: "Vendi 1 PA",
    sellAp5: "Vendi 5 PA",
    sellAp10: "Vendi 10 PA",
    liquidation: "Liquida gli asset della partita per PA",
    liquidationHelpLabel: "Aiuto sul calcolo della liquidazione",
    liquidationHelp:
      "Risorse e composti sono valutati al prezzo di vendita attuale per unità; il denaro vale un decimo del suo valore nominale. Il totale viene diviso per il prezzo attuale di acquisto di 1 PA e arrotondato per difetto.",
    liquidationValue: "Valore di liquidazione",
    liquidationAp: "PA ricevuti",
    liquidate: "LIQUIDA",
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
    insufficientStock: "Hai {available} {good}, ma questo scambio richiede {required}.",
    capacity:
      "Questo scambio aggiungerebbe {required} {good}, ma resta spazio solo per {available} (limite: {capacity}).",
    insufficientAp: "Questa vendita richiede {required} PA; ne hai {available}.",
    liquidated: "Gli asset sono già stati liquidati in questa partita.",
    noLiquidation:
      "La liquidazione vale {value}; per 1 PA servono almeno {minimum} al prezzo attuale.",
  },
  fr: {
    heading: "Marché Galactique",
    description: "Ici tu peux faire divers échanges sur le Marché Galactique.",
    tradeRow: "Échange:",
    confirmRowLabel: "Confirmer:",
    summaryOutgoing: "Échanger",
    summaryIncoming: "contre",
    outgoing: "Vous cédez",
    incoming: "Vous recevez",
    tradeFor: "Contre:",
    quantity: "Quantité:",
    preview: "Aperçu de l'échange",
    commission: "Commission",
    adjustedValue: "Valeur unitaire ajustée",
    marketBias: "Tendance du marché",
    tradeVolume: "Volume des échanges",
    trade: "CONFIRMER",
    tradeCompleteNotification:
      "Vous avez échangé {outgoing} contre {incoming} et payé {commission} de commission!",
    history: "Échanges récents",
    noHistory: "Aucun échange pour le moment.",
    apPrice: "Argent par PA",
    cashGain: "Gain en Argent:",
    sellAp: "Vendre des PA:",
    sellApAction: "VENDRE",
    selectQuantity: "Choisir la quantité",
    sellAp1: "Vendre 1 PA",
    sellAp5: "Vendre 5 PA",
    sellAp10: "Vendre 10 PA",
    liquidation: "Liquider les actifs de la partie contre des PA",
    liquidationHelpLabel: "Aide au calcul de la liquidation",
    liquidationHelp:
      "Les ressources et les composés sont évalués à leur prix de vente actuel par unité ; l'argent compte pour un dixième de sa valeur nominale. Le total est divisé par le prix actuel d'achat d'un PA, puis arrondi à l'entier inférieur.",
    liquidationValue: "Valeur de liquidation",
    liquidationAp: "PA reçus",
    liquidate: "LIQUIDER",
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
    insufficientStock: "Vous avez {available} {good}, mais cet échange en demande {required}.",
    capacity:
      "Cet échange ajouterait {required} {good}, mais il ne reste que {available} places (limite : {capacity}).",
    insufficientAp: "Cette vente demande {required} PA ; vous en avez {available}.",
    liquidated: "Les actifs ont déjà été liquidés pendant cette partie.",
    noLiquidation:
      "La liquidation vaut {value} ; il faut au moins {minimum} au cours actuel pour obtenir 1 PA.",
  },
};

const MARKET_OFFLINE_NOTIFICATION_COPY: Record<LocaleId, string> = {
  en: "Galactic Market is currently offline.",
  es: "El Mercado Galáctico está fuera de servicio ahora mismo.",
  pt: "O Mercado Galáctico está fora de serviço neste momento.",
  de: "Der Galaktische Markt ist derzeit offline.",
  it: "Il Mercato Galattico è attualmente offline.",
  fr: "Le Marché Galactique est actuellement hors ligne.",
};

export function marketOfflineNotificationText(locale: LocaleId): string {
  return MARKET_OFFLINE_NOTIFICATION_COPY[locale];
}

export function marketText(locale: LocaleId, key: MarketMessageKey): string {
  return MARKET_COPY[locale][key];
}

export function marketLockCountdownText(
  locale: LocaleId,
  remainingMs: number,
  formatMinutes: (value: number) => string = (value) => new Intl.NumberFormat(locale).format(value),
): string {
  const minutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return marketText(locale, "lockedCountdown").replace("{minutes}", formatMinutes(minutes));
}

export function marketFailureText(
  locale: LocaleId,
  code: string,
  details: Readonly<
    Partial<Record<"required" | "available" | "good" | "capacity" | "value" | "minimum", string>>
  > = {},
): string {
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
  const text = key ? MARKET_COPY[locale][key] : MARKET_COPY[locale].locked;
  return text.replace(
    /\{(required|available|good|capacity|value|minimum)\}/g,
    (_match, name: string) => {
      return details[name as keyof typeof details] ?? "0";
    },
  );
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

export const LOCALIZATION_VALIDATION_DATA = {
  PACKS,
  REBIRTH_TEXT,
  MARKET_COPY,
  MARKET_OFFLINE_NOTIFICATION_COPY,
} as const;
