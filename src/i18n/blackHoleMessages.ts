import type { LocaleId } from "../content/ids";
import type { BlackHoleUpgradeId } from "../content/blackHole";
import type { BlackHoleFailure } from "../engine/blackHole";

export interface BlackHoleMessages {
  readonly title: string;
  readonly discoveredNotification: string;
  readonly chargedNotification: string;
  readonly introduction: string;
  readonly headerHelp: string;
  readonly undiscovered: string;
  readonly discoveryProgress: string;
  readonly researched: string;
  readonly researchAction: string;
  readonly researchHelp: string;
  readonly power: string;
  readonly duration: string;
  readonly recharge: string;
  readonly activate: string;
  readonly startCharge: string;
  readonly ready: string;
  readonly charging: string;
  readonly warping: string;
  readonly alwaysOn: string;
  readonly status: string;
  readonly researchPoints: string;
  readonly upgradeNames: Readonly<Record<BlackHoleUpgradeId, string>>;
  readonly errors: Readonly<Record<BlackHoleFailure["code"], string>>;
}

const MESSAGES: Record<LocaleId, BlackHoleMessages> = {
  en: {
    title: "Black Hole",
    discoveredNotification:
      "You have discovered a Black Hole - interact with it in the Galactic Tab!",
    chargedNotification: "The Black Hole is Charged and ready to Activate!",
    headerHelp:
      "This shows the Black Hole time warp feature, once unlocked. While a warp is running, every rate in the game moves faster at once. Power raises the multiplier, Duration lengthens each warp, and Recharge shortens the wait between them until charging becomes continuous.",
    introduction: "Complete star studies in later runs to reveal a black hole.",
    undiscovered: "No black hole signal has been found.",
    discoveryProgress: "Discovery chance: {percent}%",
    researched: "Research complete. The Black Hole charges automatically.",
    researchAction: "Research Black Hole",
    researchHelp:
      "Research the time warp as early as you can afford to, and keep upgrading recharge until charging becomes continuous.",
    power: "Power",
    duration: "Warp duration",
    recharge: "Recharge time",
    activate: "Activate time warp",
    startCharge: "Start charging",
    ready: "Charge ready",
    charging: "Charging",
    warping: "Time warp active",
    alwaysOn: "Time warp is always active.",
    status: "Status",
    researchPoints: "research points",
    upgradeNames: {
      power: "Upgrade power",
      duration: "Upgrade duration",
      recharge: "Upgrade recharge",
    },
    errors: {
      "black-hole-undiscovered": "The black hole has not been discovered.",
      "black-hole-already-researched": "Black Hole research is already complete.",
      "black-hole-not-researched": "Research the Black Hole first.",
      "black-hole-insufficient-research": "Not enough research points.",
      "black-hole-upgrade-maxed": "This upgrade is already at its maximum level.",
      "black-hole-charge-running": "The Black Hole is already charging.",
      "black-hole-warp-running": "A time warp is already active.",
    },
  },
  es: {
    title: "Agujero negro",
    discoveredNotification:
      "¡Has descubierto un Agujero Negro! Interactúa con él en la pestaña Galáctica.",
    chargedNotification: "¡El Agujero Negro está cargado y listo para activarse!",
    headerHelp:
      "Esto muestra la función de distorsión temporal del Agujero Negro, una vez desbloqueada. Mientras una distorsión está activa, todas las tasas del juego avanzan más rápido a la vez. Potencia aumenta el multiplicador, Duración alarga cada distorsión y Recarga acorta la espera entre ellas hasta que la carga sea continua.",
    introduction:
      "Completa estudios estelares en partidas posteriores para revelar un agujero negro.",
    undiscovered: "No se ha encontrado ninguna señal de agujero negro.",
    discoveryProgress: "Probabilidad de descubrimiento: {percent}%",
    researched: "Investigación completada. El agujero negro se carga automáticamente.",
    researchAction: "Investigar el agujero negro",
    researchHelp:
      "Investiga la distorsión temporal tan pronto como puedas permitírtela y sigue mejorando la recarga hasta que la carga sea continua.",
    power: "Potencia",
    duration: "Duración de la distorsión",
    recharge: "Tiempo de recarga",
    activate: "Activar distorsión temporal",
    startCharge: "Iniciar carga",
    ready: "Carga lista",
    charging: "Cargando",
    warping: "Distorsión temporal activa",
    alwaysOn: "La distorsión temporal está siempre activa.",
    status: "Estado",
    researchPoints: "puntos de investigación",
    upgradeNames: {
      power: "Mejorar potencia",
      duration: "Mejorar duración",
      recharge: "Mejorar recarga",
    },
    errors: {
      "black-hole-undiscovered": "El agujero negro aún no se ha descubierto.",
      "black-hole-already-researched": "La investigación del agujero negro ya está completa.",
      "black-hole-not-researched": "Investiga primero el agujero negro.",
      "black-hole-insufficient-research": "No hay suficientes puntos de investigación.",
      "black-hole-upgrade-maxed": "Esta mejora ya está en su nivel máximo.",
      "black-hole-charge-running": "El agujero negro ya se está cargando.",
      "black-hole-warp-running": "Ya hay una distorsión temporal activa.",
    },
  },
  pt: {
    title: "Buraco negro",
    discoveredNotification: "Descobriste um Buraco Negro! Interage com ele no separador Galáctico.",
    chargedNotification: "O Buraco Negro está carregado e pronto para ser ativado!",
    headerHelp:
      "Isto mostra a função de distorção temporal do Buraco Negro, depois de desbloqueada. Enquanto uma distorção está ativa, todas as taxas do jogo avançam mais depressa ao mesmo tempo. Potência aumenta o multiplicador, Duração alonga cada distorção e Recarga encurta a espera entre elas até o carregamento se tornar contínuo.",
    introduction: "Conclua estudos estelares em partidas posteriores para revelar um buraco negro.",
    undiscovered: "Nenhum sinal de buraco negro foi encontrado.",
    discoveryProgress: "Chance de descoberta: {percent}%",
    researched: "Pesquisa concluída. O buraco negro recarrega automaticamente.",
    researchAction: "Pesquisar buraco negro",
    researchHelp:
      "Pesquise a distorção temporal assim que puder pagá-la e continue a melhorar a recarga até que o carregamento se torne contínuo.",
    power: "Potência",
    duration: "Duração da distorção",
    recharge: "Tempo de recarga",
    activate: "Ativar distorção temporal",
    startCharge: "Iniciar recarga",
    ready: "Carga pronta",
    charging: "Recarregando",
    warping: "Distorção temporal ativa",
    alwaysOn: "A distorção temporal está sempre ativa.",
    status: "Estado",
    researchPoints: "pontos de pesquisa",
    upgradeNames: {
      power: "Melhorar potência",
      duration: "Melhorar duração",
      recharge: "Melhorar recarga",
    },
    errors: {
      "black-hole-undiscovered": "O buraco negro ainda não foi descoberto.",
      "black-hole-already-researched": "A pesquisa do buraco negro já foi concluída.",
      "black-hole-not-researched": "Pesquise o buraco negro primeiro.",
      "black-hole-insufficient-research": "Pontos de pesquisa insuficientes.",
      "black-hole-upgrade-maxed": "Esta melhoria já atingiu o nível máximo.",
      "black-hole-charge-running": "O buraco negro já está recarregando.",
      "black-hole-warp-running": "Já existe uma distorção temporal ativa.",
    },
  },
  de: {
    title: "Schwarzes Loch",
    discoveredNotification:
      "Du hast ein Schwarzes Loch entdeckt - interagiere damit im Galaktischen Tab!",
    chargedNotification: "Das Schwarze Loch ist aufgeladen und bereit zur Aktivierung!",
    headerHelp:
      "Dies zeigt die Schwarzloch-Zeitverzerrungsfunktion, sobald freigeschaltet. Während eine Verzerrung läuft, laufen alle Raten im Spiel gleichzeitig schneller. Leistung erhöht den Multiplikator, Dauer verlängert jede Verzerrung, und Aufladung verkürzt die Wartezeit dazwischen, bis das Aufladen durchgehend läuft.",
    introduction:
      "Schließe in späteren Durchläufen Sternstudien ab, um ein schwarzes Loch zu entdecken.",
    undiscovered: "Es wurde kein Signal eines schwarzen Lochs gefunden.",
    discoveryProgress: "Entdeckungswahrscheinlichkeit: {percent}%",
    researched: "Forschung abgeschlossen. Das schwarze Loch lädt sich automatisch auf.",
    researchAction: "Schwarzes Loch erforschen",
    researchHelp:
      "Erforsche die Zeitverzerrung, sobald du sie dir leisten kannst, und verbessere die Aufladung weiter, bis sie kontinuierlich läuft.",
    power: "Leistung",
    duration: "Warpdauer",
    recharge: "Aufladezeit",
    activate: "Zeitverzerrung aktivieren",
    startCharge: "Aufladung starten",
    ready: "Aufladung bereit",
    charging: "Lädt auf",
    warping: "Zeitverzerrung aktiv",
    alwaysOn: "Die Zeitverzerrung ist immer aktiv.",
    status: "Status",
    researchPoints: "Forschungspunkte",
    upgradeNames: {
      power: "Leistung verbessern",
      duration: "Dauer verbessern",
      recharge: "Aufladung verbessern",
    },
    errors: {
      "black-hole-undiscovered": "Das schwarze Loch wurde noch nicht entdeckt.",
      "black-hole-already-researched":
        "Die Erforschung des schwarzen Lochs ist bereits abgeschlossen.",
      "black-hole-not-researched": "Erforsche zuerst das schwarze Loch.",
      "black-hole-insufficient-research": "Nicht genügend Forschungspunkte.",
      "black-hole-upgrade-maxed": "Diese Verbesserung hat bereits ihre maximale Stufe erreicht.",
      "black-hole-charge-running": "Das schwarze Loch lädt sich bereits auf.",
      "black-hole-warp-running": "Eine Zeitverzerrung ist bereits aktiv.",
    },
  },
  it: {
    title: "Buco nero",
    discoveredNotification:
      "Hai scoperto un Buco Nero: interagisci con esso nella scheda Galattica!",
    chargedNotification: "Il Buco Nero è carico e pronto per essere attivato!",
    headerHelp:
      "Questo mostra la funzione di distorsione temporale del Buco Nero, una volta sbloccata. Mentre una distorsione è attiva, tutti i tassi del gioco avanzano più velocemente allo stesso tempo. Potenza aumenta il moltiplicatore, Durata allunga ogni distorsione e Ricarica riduce l'attesa tra una e l'altra finché la carica non diventa continua.",
    introduction: "Completa studi stellari nelle partite successive per rivelare un buco nero.",
    undiscovered: "Non è stato trovato alcun segnale di buco nero.",
    discoveryProgress: "Probabilità di scoperta: {percent}%",
    researched: "Ricerca completata. Il buco nero si carica automaticamente.",
    researchAction: "Ricerca il buco nero",
    researchHelp:
      "Ricerca la distorsione temporale appena puoi permettertela e continua a migliorare la ricarica finché la carica non diventa continua.",
    power: "Potenza",
    duration: "Durata della distorsione",
    recharge: "Tempo di ricarica",
    activate: "Attiva la distorsione temporale",
    startCharge: "Avvia la ricarica",
    ready: "Carica pronta",
    charging: "In carica",
    warping: "Distorsione temporale attiva",
    alwaysOn: "La distorsione temporale è sempre attiva.",
    status: "Stato",
    researchPoints: "punti ricerca",
    upgradeNames: {
      power: "Migliora potenza",
      duration: "Migliora durata",
      recharge: "Migliora ricarica",
    },
    errors: {
      "black-hole-undiscovered": "Il buco nero non è ancora stato scoperto.",
      "black-hole-already-researched": "La ricerca del buco nero è già completa.",
      "black-hole-not-researched": "Ricerca prima il buco nero.",
      "black-hole-insufficient-research": "Punti ricerca insufficienti.",
      "black-hole-upgrade-maxed": "Questo potenziamento ha già raggiunto il livello massimo.",
      "black-hole-charge-running": "Il buco nero è già in carica.",
      "black-hole-warp-running": "È già attiva una distorsione temporale.",
    },
  },
  fr: {
    title: "Trou noir",
    discoveredNotification:
      "Vous avez découvert un Trou Noir - interagissez avec lui dans l'onglet Galactique!",
    chargedNotification: "Le Trou Noir est chargé et prêt à être activé!",
    headerHelp:
      "Ceci montre la fonction de distorsion temporelle du Trou Noir, une fois débloquée. Pendant qu'une distorsion est active, tous les taux du jeu avancent plus vite en même temps. Puissance augmente le multiplicateur, Durée allonge chaque distorsion, et Recharge réduit l'attente entre elles jusqu'à ce que le chargement devienne continu.",
    introduction:
      "Terminez des études stellaires lors des parties suivantes pour révéler un trou noir.",
    undiscovered: "Aucun signal de trou noir n'a été détecté.",
    discoveryProgress: "Probabilité de découverte : {percent} %",
    researched: "Recherche terminée. Le trou noir se recharge automatiquement.",
    researchAction: "Étudier le trou noir",
    researchHelp:
      "Étudiez la distorsion temporelle dès que vous pouvez vous le permettre et continuez à améliorer la recharge jusqu'à ce que la charge devienne continue.",
    power: "Puissance",
    duration: "Durée de distorsion",
    recharge: "Temps de recharge",
    activate: "Activer la distorsion temporelle",
    startCharge: "Démarrer la charge",
    ready: "Charge prête",
    charging: "En charge",
    warping: "Distorsion temporelle active",
    alwaysOn: "La distorsion temporelle est toujours active.",
    status: "État",
    researchPoints: "points de recherche",
    upgradeNames: {
      power: "Améliorer la puissance",
      duration: "Améliorer la durée",
      recharge: "Améliorer la recharge",
    },
    errors: {
      "black-hole-undiscovered": "Le trou noir n'a pas encore été découvert.",
      "black-hole-already-researched": "La recherche du trou noir est déjà terminée.",
      "black-hole-not-researched": "Étudiez d'abord le trou noir.",
      "black-hole-insufficient-research": "Points de recherche insuffisants.",
      "black-hole-upgrade-maxed": "Cette amélioration a déjà atteint son niveau maximal.",
      "black-hole-charge-running": "Le trou noir est déjà en charge.",
      "black-hole-warp-running": "Une distorsion temporelle est déjà active.",
    },
  },
};

export function blackHoleText(locale: LocaleId): BlackHoleMessages {
  return MESSAGES[locale];
}

const WARP_END_MESSAGES: Record<LocaleId, string> = {
  en: "The Black Hole time warp has ended.",
  es: "La distorsi\u00f3n temporal del agujero negro ha terminado.",
  pt: "A distor\u00e7\u00e3o temporal do buraco negro terminou.",
  de: "Die Zeitverzerrung des Schwarzen Lochs ist beendet.",
  it: "La distorsione temporale del Buco Nero \u00e8 terminata.",
  fr: "La distorsion temporelle du Trou Noir est termin\u00e9e.",
};

export function blackHoleWarpEndedNotification(locale: LocaleId): string {
  return WARP_END_MESSAGES[locale];
}

export const LOCALIZATION_VALIDATION_DATA = { MESSAGES, WARP_END_MESSAGES } as const;
