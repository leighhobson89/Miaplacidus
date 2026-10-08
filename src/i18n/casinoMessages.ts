import type { LocaleId } from "../content/ids";
import type { CasinoGameId, CasinoSpecialPrize } from "../content/galacticCasino";
import type { CasinoFailure } from "../engine/galacticCasino";

type CasinoCopy = {
  readonly title: string;
  readonly description: string;
  readonly balance: string;
  readonly buyTitle: string;
  readonly payment: string;
  readonly amount: string;
  readonly cost: string;
  readonly buy: string;
  readonly gamesTitle: string;
  readonly doubleOrNothing: string;
  readonly probability: string;
  readonly stake: string;
  readonly entryCostPreview: string;
  readonly currentStakePreview: string;
  readonly doubledWinPreview: string;
  readonly play: string;
  readonly wheel: string;
  readonly spin: string;
  readonly choosePrize: string;
  readonly claim: string;
  readonly higherLower: string;
  readonly start: string;
  readonly higher: string;
  readonly lower: string;
  readonly cashOut: string;
  readonly currentCard: string;
  readonly currentPrize: string;
  readonly voidSeer: string;
  readonly tier: string;
  readonly chance: string;
  readonly reveal: string;
  readonly history: string;
  readonly noHistory: string;
  readonly runStats: string;
  readonly allTimeStats: string;
  readonly plays: string;
  readonly wins: string;
  readonly locked: string;
  readonly purchaseResult: string;
  readonly doubleOrNothingWinNotification: string;
  readonly doubleOrNothingLossNotification: string;
  readonly win: string;
  readonly loss: string;
  readonly specialReady: string;
  readonly prizeClaimed: string;
  readonly cashOutResult: string;
  readonly cardCorrect: string;
  readonly cardWrong: string;
  readonly voidWin: string;
  readonly voidLoss: string;
  readonly failure: string;
  readonly reasonInvalidAmount: string;
  readonly reasonGoodLocked: string;
  readonly reasonInsufficientPayment: string;
  readonly reasonInsufficientCp: string;
  readonly reasonWheelPrizePending: string;
  readonly reasonWheelNoPrizePending: string;
  readonly reasonWheelPrizeUnavailable: string;
  readonly reasonWheelSpinning: string;
  readonly reasonRoundActive: string;
  readonly reasonRoundMissing: string;
  readonly reasonCashOutTooEarly: string;
  readonly reasonInvalidGuess: string;
  readonly reasonInvalidTier: string;
  readonly cash: string;
  readonly available: string;
  readonly cpIn: string;
  readonly cpOut: string;
  readonly doubleGood: string;
  readonly specialRocketWarp: string;
  readonly specialStarshipWarp: string;
  readonly specialAsteroid: string;
  readonly specialStarStudy: string;
  readonly specialVoidPillage: string;
  readonly prizeBoostCash: string;
  readonly prizeBoostResearch: string;
  readonly prizeTopUpResources: string;
  readonly prizeTopUpCompounds: string;
  readonly prizeResearch: string;
  readonly prizeCash: string;
  readonly prizeTimeWarp: string;
};

const COPY: Record<LocaleId, CasinoCopy> = {
  en: {
    title: "Galactic Casino",
    description: "Trade resources for casino points, then test your luck in four games.",
    balance: "Casino points",
    buyTitle: "Buy casino points",
    payment: "Pay with",
    amount: "Points to buy",
    cost: "Cost",
    buy: "Buy points",
    gamesTitle: "Casino games",
    doubleOrNothing: "Double or Nothing",
    probability: "Win chance",
    stake: "Stake in CP",
    entryCostPreview: "Entry cost: {amount} CP",
    currentStakePreview: "Current stake: {amount} CP",
    doubledWinPreview: "Win payout: {amount} CP",
    play: "Play",
    wheel: "Wheel of Fortune",
    spin: "Spin for 1 CP",
    choosePrize: "Choose special prize",
    claim: "Claim prize",
    higherLower: "Higher or Lower",
    start: "Start for 5 CP",
    higher: "Higher",
    lower: "Lower",
    cashOut: "Cash out",
    currentCard: "Current card",
    currentPrize: "Current cash-out prize",
    voidSeer: "Void Seer",
    tier: "Prize tier",
    chance: "Match chance",
    reveal: "Roll",
    history: "Recent game history",
    noHistory: "No casino games played yet.",
    runStats: "This run",
    allTimeStats: "All time",
    plays: "Plays",
    wins: "Wins",
    locked: "The Galactic Casino unlocks after you earn your first Ascendency Point.",
    purchaseResult: "Bought {amount} CP for {cost}.",
    doubleOrNothingWinNotification: "WIN! Stake doubled.",
    doubleOrNothingLossNotification: "LOSE! Better luck next time.",
    win: "Win",
    loss: "Loss",
    specialReady: "The wheel revealed a special prize. Choose and claim one below.",
    prizeClaimed: "Special prize claimed: {prize}.",
    cashOutResult: "Cashed out: {prize}.",
    cardCorrect: "Correct guess.",
    cardWrong: "Wrong guess. The round is over.",
    voidWin: "The rolls matched: {detail}.",
    voidLoss: "The rolls did not match.",
    failure: "That casino action is not available.",
    reasonInvalidAmount: "Enter a whole number of at least 1.",
    reasonGoodLocked: "Unlock that resource or compound before using it as payment.",
    reasonInsufficientPayment: "Requires {required} {payment}; available: {available}.",
    reasonInsufficientCp: "Requires {required} CP; available: {available} CP.",
    reasonWheelPrizePending: "Claim the pending special prize before spinning again.",
    reasonWheelNoPrizePending: "Spin the wheel and reveal a special prize first.",
    reasonWheelPrizeUnavailable: "That special prize is not currently available.",
    reasonWheelSpinning: "Wait for the current wheel spin to finish.",
    reasonRoundActive: "Finish or cash out the active round first.",
    reasonRoundMissing: "Start a round before using this action.",
    reasonCashOutTooEarly: "Make at least two correct guesses before cashing out.",
    reasonInvalidGuess: "No more guesses are available in this round.",
    reasonInvalidTier: "Choose a valid prize tier.",
    cash: "Cash",
    available: "available",
    cpIn: "CP spent",
    cpOut: "CP awarded",
    doubleGood: "Double {good}",
    specialRocketWarp: "Warp a rocket",
    specialStarshipWarp: "Warp the starship",
    specialAsteroid: "Finish asteroid scan",
    specialStarStudy: "Finish star study",
    specialVoidPillage: "Finish Void Pillage",
    prizeBoostCash: "Cash bonus",
    prizeBoostResearch: "Research bonus",
    prizeTopUpResources: "Resource top-up",
    prizeTopUpCompounds: "Compound top-up",
    prizeResearch: "Research grant",
    prizeCash: "Cash grant",
    prizeTimeWarp: "{multiplier}× time warp for {seconds}s",
  },
  es: {
    title: "Casino galáctico",
    description: "Cambia recursos por puntos de casino y prueba suerte en cuatro juegos.",
    balance: "Puntos de casino",
    buyTitle: "Comprar puntos de casino",
    payment: "Pagar con",
    amount: "Puntos a comprar",
    cost: "Coste",
    buy: "Comprar puntos",
    gamesTitle: "Juegos de casino",
    doubleOrNothing: "Todo o nada",
    probability: "Probabilidad de ganar",
    stake: "Apuesta en PC",
    entryCostPreview: "Coste de entrada: {amount} CP",
    currentStakePreview: "Apuesta actual: {amount} CP",
    doubledWinPreview: "Premio si ganas: {amount} CP",
    play: "Jugar",
    wheel: "Ruleta de la fortuna",
    spin: "Girar por 1 PC",
    choosePrize: "Elegir premio especial",
    claim: "Reclamar premio",
    higherLower: "Mayor o menor",
    start: "Empezar por 5 PC",
    higher: "Mayor",
    lower: "Menor",
    cashOut: "Retirar premio",
    currentCard: "Carta actual",
    currentPrize: "Premio para retirar",
    voidSeer: "Vidente del vacío",
    tier: "Nivel de premio",
    chance: "Probabilidad de coincidencia",
    reveal: "Lanzar",
    history: "Historial reciente",
    noHistory: "Aún no has jugado en el casino.",
    runStats: "Esta partida",
    allTimeStats: "Total",
    plays: "Jugadas",
    wins: "Victorias",
    locked: "El Casino galáctico se desbloquea al conseguir tu primer Punto de Ascendencia.",
    purchaseResult: "Has comprado {amount} PC por {cost}.",
    doubleOrNothingWinNotification: "¡GANASTE! Apuesta duplicada.",
    doubleOrNothingLossNotification: "¡PERDISTE! Mejor suerte la próxima vez.",
    win: "Victoria",
    loss: "Derrota",
    specialReady: "La ruleta ha revelado un premio especial. Elige uno y reclámalo.",
    prizeClaimed: "Premio especial reclamado: {prize}.",
    cashOutResult: "Premio retirado: {prize}.",
    cardCorrect: "Acierto.",
    cardWrong: "Fallo. La ronda ha terminado.",
    voidWin: "Los resultados coinciden: {detail}.",
    voidLoss: "Los resultados no coinciden.",
    failure: "Esa acción del casino no está disponible.",
    reasonInvalidAmount: "Introduce un número entero de al menos 1.",
    reasonGoodLocked: "Desbloquea ese recurso o compuesto antes de usarlo como pago.",
    reasonInsufficientPayment: "Se necesitan {required} {payment}; disponibles: {available}.",
    reasonInsufficientCp: "Se necesitan {required} PC; disponibles: {available} PC.",
    reasonWheelPrizePending: "Reclama el premio especial pendiente antes de volver a girar.",
    reasonWheelNoPrizePending: "Primero gira la ruleta y revela un premio especial.",
    reasonWheelPrizeUnavailable: "Ese premio especial no está disponible ahora.",
    reasonWheelSpinning: "Espera a que termine el giro actual.",
    reasonRoundActive: "Termina o retira el premio de la ronda activa primero.",
    reasonRoundMissing: "Empieza una ronda antes de usar esta acción.",
    reasonCashOutTooEarly: "Acierta al menos dos veces antes de retirar el premio.",
    reasonInvalidGuess: "No quedan más intentos en esta ronda.",
    reasonInvalidTier: "Elige un nivel de premio válido.",
    cash: "Dinero",
    available: "disponibles",
    cpIn: "PC gastados",
    cpOut: "PC otorgados",
    doubleGood: "Duplicar {good}",
    specialRocketWarp: "Acelerar un cohete",
    specialStarshipWarp: "Acelerar la nave",
    specialAsteroid: "Terminar el escaneo de asteroides",
    specialStarStudy: "Terminar el estudio estelar",
    specialVoidPillage: "Terminar el saqueo del vacío",
    prizeBoostCash: "Bonificación de dinero",
    prizeBoostResearch: "Bonificación de investigación",
    prizeTopUpResources: "Recarga de recursos",
    prizeTopUpCompounds: "Recarga de compuestos",
    prizeResearch: "Recompensa de investigación",
    prizeCash: "Recompensa de dinero",
    prizeTimeWarp: "Aceleración ×{multiplier} durante {seconds}s",
  },
  pt: {
    title: "Casino galáctico",
    description: "Troca recursos por pontos de casino e testa a sorte em quatro jogos.",
    balance: "Pontos de casino",
    buyTitle: "Comprar pontos de casino",
    payment: "Pagar com",
    amount: "Pontos a comprar",
    cost: "Custo",
    buy: "Comprar pontos",
    gamesTitle: "Jogos de casino",
    doubleOrNothing: "Dobrar ou perder",
    probability: "Probabilidade de ganhar",
    stake: "Aposta em PC",
    entryCostPreview: "Custo de entrada: {amount} CP",
    currentStakePreview: "Aposta atual: {amount} CP",
    doubledWinPreview: "Prémio se venceres: {amount} CP",
    play: "Jogar",
    wheel: "Roda da fortuna",
    spin: "Rodar por 1 PC",
    choosePrize: "Escolher prémio especial",
    claim: "Reclamar prémio",
    higherLower: "Maior ou menor",
    start: "Começar por 5 PC",
    higher: "Maior",
    lower: "Menor",
    cashOut: "Levantar prémio",
    currentCard: "Carta atual",
    currentPrize: "Prémio para levantar",
    voidSeer: "Vidente do vazio",
    tier: "Nível do prémio",
    chance: "Probabilidade de coincidência",
    reveal: "Lançar",
    history: "Histórico recente",
    noHistory: "Ainda não jogaste no casino.",
    runStats: "Esta partida",
    allTimeStats: "Total",
    plays: "Jogadas",
    wins: "Vitórias",
    locked: "O Casino galáctico desbloqueia após ganhares o primeiro Ponto de Ascendência.",
    purchaseResult: "Compraste {amount} PC por {cost}.",
    doubleOrNothingWinNotification: "GANHOU! Aposta duplicada.",
    doubleOrNothingLossNotification: "PERDEU! Mais sorte da próxima vez.",
    win: "Vitória",
    loss: "Derrota",
    specialReady: "A roda revelou um prémio especial. Escolhe e reclama um prémio abaixo.",
    prizeClaimed: "Prémio especial reclamado: {prize}.",
    cashOutResult: "Prémio levantado: {prize}.",
    cardCorrect: "Resposta certa.",
    cardWrong: "Resposta errada. A ronda terminou.",
    voidWin: "Os resultados coincidiram: {detail}.",
    voidLoss: "Os resultados não coincidiram.",
    failure: "Essa ação do casino não está disponível.",
    reasonInvalidAmount: "Introduz um número inteiro de pelo menos 1.",
    reasonGoodLocked: "Desbloqueia esse recurso ou composto antes de o usar como pagamento.",
    reasonInsufficientPayment: "Requer {required} {payment}; disponíveis: {available}.",
    reasonInsufficientCp: "Requer {required} PC; disponíveis: {available} PC.",
    reasonWheelPrizePending: "Reclama o prémio especial pendente antes de voltar a rodar.",
    reasonWheelNoPrizePending: "Roda primeiro para revelar um prémio especial.",
    reasonWheelPrizeUnavailable: "Esse prémio especial não está disponível agora.",
    reasonWheelSpinning: "Espera que termine a rotação atual.",
    reasonRoundActive: "Termina ou levanta primeiro o prémio da ronda ativa.",
    reasonRoundMissing: "Começa uma ronda antes de usar esta ação.",
    reasonCashOutTooEarly: "Adivinha corretamente pelo menos duas vezes antes de levantar.",
    reasonInvalidGuess: "Não há mais palpites disponíveis nesta ronda.",
    reasonInvalidTier: "Escolhe um nível de prémio válido.",
    cash: "Dinheiro",
    available: "disponíveis",
    cpIn: "PC gastos",
    cpOut: "PC atribuídos",
    doubleGood: "Duplicar {good}",
    specialRocketWarp: "Acelerar um foguetão",
    specialStarshipWarp: "Acelerar a nave",
    specialAsteroid: "Terminar a busca de asteroides",
    specialStarStudy: "Terminar o estudo estelar",
    specialVoidPillage: "Terminar o saque do vazio",
    prizeBoostCash: "Bónus de dinheiro",
    prizeBoostResearch: "Bónus de investigação",
    prizeTopUpResources: "Reposição de recursos",
    prizeTopUpCompounds: "Reposição de compostos",
    prizeResearch: "Prémio de investigação",
    prizeCash: "Prémio em dinheiro",
    prizeTimeWarp: "Distorção temporal ×{multiplier} por {seconds}s",
  },
  de: {
    title: "Galaktisches Kasino",
    description: "Tausche Vorräte gegen Casinopunkte und versuche dein Glück in vier Spielen.",
    balance: "Casinopunkte",
    buyTitle: "Casinopunkte kaufen",
    payment: "Bezahlen mit",
    amount: "Punkte zum Kaufen",
    cost: "Kosten",
    buy: "Punkte kaufen",
    gamesTitle: "Kasino-Spiele",
    doubleOrNothing: "Doppelt oder nichts",
    probability: "Gewinnchance",
    stake: "Einsatz in CP",
    entryCostPreview: "Einsatzkosten: {amount} CP",
    currentStakePreview: "Aktueller Einsatz: {amount} CP",
    doubledWinPreview: "Auszahlung bei Gewinn: {amount} CP",
    play: "Spielen",
    wheel: "Glücksrad",
    spin: "Drehen für 1 CP",
    choosePrize: "Sonderpreis wählen",
    claim: "Preis abholen",
    higherLower: "Höher oder niedriger",
    start: "Start für 5 CP",
    higher: "Höher",
    lower: "Niedriger",
    cashOut: "Auszahlen",
    currentCard: "Aktuelle Karte",
    currentPrize: "Aktueller Auszahlungsgewinn",
    voidSeer: "Leerseher",
    tier: "Preisstufe",
    chance: "Trefferchance",
    reveal: "Würfeln",
    history: "Letzte Spiele",
    noHistory: "Noch keine Casinospiele gespielt.",
    runStats: "Dieser Durchlauf",
    allTimeStats: "Gesamt",
    plays: "Spiele",
    wins: "Siege",
    locked: "Das galaktische Kasino wird nach dem ersten Aszendenzpunkt freigeschaltet.",
    purchaseResult: "{amount} CP für {cost} gekauft.",
    doubleOrNothingWinNotification: "GEWONNEN! Einsatz verdoppelt.",
    doubleOrNothingLossNotification: "VERLOREN! Viel Glück beim nächsten Mal.",
    win: "Gewonnen",
    loss: "Verloren",
    specialReady: "Das Rad zeigt einen Sonderpreis. Wähle unten einen Preis aus und hole ihn ab.",
    prizeClaimed: "Sonderpreis abgeholt: {prize}.",
    cashOutResult: "Ausgezahlt: {prize}.",
    cardCorrect: "Richtig geraten.",
    cardWrong: "Falsch geraten. Die Runde ist vorbei.",
    voidWin: "Die Zahlen stimmen überein: {detail}.",
    voidLoss: "Die Zahlen stimmen nicht überein.",
    failure: "Diese Kasinoaktion ist nicht verfügbar.",
    reasonInvalidAmount: "Gib eine ganze Zahl ab 1 ein.",
    reasonGoodLocked: "Schalte diese Ressource oder Verbindung frei, bevor du damit bezahlst.",
    reasonInsufficientPayment: "Benötigt {required} {payment}; verfügbar: {available}.",
    reasonInsufficientCp: "Benötigt {required} CP; verfügbar: {available} CP.",
    reasonWheelPrizePending: "Hole zuerst den ausstehenden Sonderpreis ab.",
    reasonWheelNoPrizePending: "Drehe zuerst am Rad, um einen Sonderpreis aufzudecken.",
    reasonWheelPrizeUnavailable: "Dieser Sonderpreis ist derzeit nicht verfügbar.",
    reasonWheelSpinning: "Warte, bis der aktuelle Dreh beendet ist.",
    reasonRoundActive: "Beende oder löse zuerst die laufende Runde ein.",
    reasonRoundMissing: "Starte zuerst eine Runde.",
    reasonCashOutTooEarly: "Rate mindestens zweimal richtig, bevor du den Gewinn abholst.",
    reasonInvalidGuess: "In dieser Runde sind keine weiteren Tipps möglich.",
    reasonInvalidTier: "Wähle eine gültige Gewinnstufe.",
    cash: "Geld",
    available: "verfügbar",
    cpIn: "CP eingesetzt",
    cpOut: "CP erhalten",
    doubleGood: "{good} verdoppeln",
    specialRocketWarp: "Eine Rakete beschleunigen",
    specialStarshipWarp: "Das Raumschiff beschleunigen",
    specialAsteroid: "Asteroidensuche beenden",
    specialStarStudy: "Sternenstudie beenden",
    specialVoidPillage: "Leerenplünderung beenden",
    prizeBoostCash: "Geldbonus",
    prizeBoostResearch: "Forschungsbonus",
    prizeTopUpResources: "Ressourcen auffüllen",
    prizeTopUpCompounds: "Verbindungen auffüllen",
    prizeResearch: "Forschungsgewinn",
    prizeCash: "Geldgewinn",
    prizeTimeWarp: "Zeitverzerrung ×{multiplier} für {seconds}s",
  },
  it: {
    title: "Casinò galattico",
    description: "Scambia risorse per punti casinò e tenta la sorte in quattro giochi.",
    balance: "Punti casinò",
    buyTitle: "Compra punti casinò",
    payment: "Paga con",
    amount: "Punti da comprare",
    cost: "Costo",
    buy: "Compra punti",
    gamesTitle: "Giochi del casinò",
    doubleOrNothing: "Raddoppia o perdi",
    probability: "Probabilità di vincita",
    stake: "Puntata in PC",
    entryCostPreview: "Costo d'ingresso: {amount} CP",
    currentStakePreview: "Puntata attuale: {amount} CP",
    doubledWinPreview: "Vincita: {amount} CP",
    play: "Gioca",
    wheel: "Ruota della fortuna",
    spin: "Gira per 1 PC",
    choosePrize: "Scegli premio speciale",
    claim: "Riscatta premio",
    higherLower: "Più alto o più basso",
    start: "Inizia per 5 PC",
    higher: "Più alto",
    lower: "Più basso",
    cashOut: "Ritira",
    currentCard: "Carta attuale",
    currentPrize: "Premio da ritirare",
    voidSeer: "Veggenza del vuoto",
    tier: "Livello del premio",
    chance: "Probabilità di corrispondenza",
    reveal: "Lancia",
    history: "Cronologia recente",
    noHistory: "Non hai ancora giocato al casinò.",
    runStats: "Questa partita",
    allTimeStats: "Totale",
    plays: "Partite",
    wins: "Vittorie",
    locked: "Il Casinò galattico si sblocca dopo il primo Punto di Ascendenza.",
    purchaseResult: "Hai comprato {amount} PC per {cost}.",
    doubleOrNothingWinNotification: "VITTORIA! Puntata raddoppiata.",
    doubleOrNothingLossNotification: "SCONFITTA! Più fortuna la prossima volta.",
    win: "Vittoria",
    loss: "Sconfitta",
    specialReady: "La ruota ha rivelato un premio speciale. Scegline uno e riscattalo.",
    prizeClaimed: "Premio speciale riscattato: {prize}.",
    cashOutResult: "Premio ritirato: {prize}.",
    cardCorrect: "Risposta corretta.",
    cardWrong: "Risposta sbagliata. Il turno è finito.",
    voidWin: "I risultati coincidono: {detail}.",
    voidLoss: "I risultati non coincidono.",
    failure: "Questa azione del casinò non è disponibile.",
    reasonInvalidAmount: "Inserisci un numero intero pari o superiore a 1.",
    reasonGoodLocked: "Sblocca questa risorsa o questo composto prima di usarlo come pagamento.",
    reasonInsufficientPayment: "Servono {required} {payment}; disponibili: {available}.",
    reasonInsufficientCp: "Servono {required} CP; disponibili: {available} CP.",
    reasonWheelPrizePending: "Riscatta il premio speciale in attesa prima di un altro giro.",
    reasonWheelNoPrizePending: "Gira prima la ruota per rivelare un premio speciale.",
    reasonWheelPrizeUnavailable: "Questo premio speciale non è disponibile al momento.",
    reasonWheelSpinning: "Attendi che il giro attuale sia terminato.",
    reasonRoundActive: "Completa o riscuoti prima il premio del turno attivo.",
    reasonRoundMissing: "Avvia un turno prima di usare questa azione.",
    reasonCashOutTooEarly: "Indovina correttamente almeno due volte prima di riscuotere.",
    reasonInvalidGuess: "Non ci sono altri tentativi disponibili in questo turno.",
    reasonInvalidTier: "Scegli un livello premio valido.",
    cash: "Denaro",
    available: "disponibili",
    cpIn: "PC spesi",
    cpOut: "PC assegnati",
    doubleGood: "Raddoppia {good}",
    specialRocketWarp: "Accelera un razzo",
    specialStarshipWarp: "Accelera l'astronave",
    specialAsteroid: "Termina la scansione degli asteroidi",
    specialStarStudy: "Termina lo studio stellare",
    specialVoidPillage: "Termina il saccheggio del vuoto",
    prizeBoostCash: "Bonus denaro",
    prizeBoostResearch: "Bonus ricerca",
    prizeTopUpResources: "Ricarica risorse",
    prizeTopUpCompounds: "Ricarica composti",
    prizeResearch: "Premio ricerca",
    prizeCash: "Premio in denaro",
    prizeTimeWarp: "Distorsione temporale ×{multiplier} per {seconds}s",
  },
  fr: {
    title: "Casino galactique",
    description:
      "Échangez des ressources contre des points de casino et tentez votre chance dans quatre jeux.",
    balance: "Points de casino",
    buyTitle: "Acheter des points de casino",
    payment: "Payer avec",
    amount: "Points à acheter",
    cost: "Coût",
    buy: "Acheter des points",
    gamesTitle: "Jeux du casino",
    doubleOrNothing: "Le double ou rien",
    probability: "Chance de gagner",
    stake: "Mise en PC",
    entryCostPreview: "Coût d'entrée : {amount} CP",
    currentStakePreview: "Mise actuelle : {amount} CP",
    doubledWinPreview: "Gain en cas de victoire : {amount} CP",
    play: "Jouer",
    wheel: "Roue de la fortune",
    spin: "Tourner pour 1 PC",
    choosePrize: "Choisir un prix spécial",
    claim: "Réclamer le prix",
    higherLower: "Plus haut ou plus bas",
    start: "Commencer pour 5 PC",
    higher: "Plus haut",
    lower: "Plus bas",
    cashOut: "Encaisser",
    currentCard: "Carte actuelle",
    currentPrize: "Prix à encaisser",
    voidSeer: "Voyant du vide",
    tier: "Niveau du prix",
    chance: "Chance de correspondance",
    reveal: "Lancer",
    history: "Historique récent",
    noHistory: "Aucune partie de casino pour le moment.",
    runStats: "Cette partie",
    allTimeStats: "Total",
    plays: "Parties",
    wins: "Victoires",
    locked: "Le Casino galactique se débloque après votre premier Point d'Ascendance.",
    purchaseResult: "{amount} PC achetés pour {cost}.",
    doubleOrNothingWinNotification: "GAGNÉ! Mise doublée.",
    doubleOrNothingLossNotification: "PERDU! Meilleure chance la prochaine fois.",
    win: "Victoire",
    loss: "Défaite",
    specialReady: "La roue a révélé un prix spécial. Choisissez-en un et réclamez-le.",
    prizeClaimed: "Prix spécial réclamé : {prize}.",
    cashOutResult: "Prix encaissé : {prize}.",
    cardCorrect: "Bonne réponse.",
    cardWrong: "Mauvaise réponse. La manche est terminée.",
    voidWin: "Les résultats correspondent : {detail}.",
    voidLoss: "Les résultats ne correspondent pas.",
    failure: "Cette action du casino n'est pas disponible.",
    reasonInvalidAmount: "Saisissez un nombre entier supérieur ou égal à 1.",
    reasonGoodLocked: "Débloquez cette ressource ou ce composé avant de l'utiliser comme paiement.",
    reasonInsufficientPayment: "Il faut {required} {payment} ; disponible : {available}.",
    reasonInsufficientCp: "Il faut {required} CP ; disponible : {available} CP.",
    reasonWheelPrizePending: "Réclamez le prix spécial en attente avant un nouveau tour.",
    reasonWheelNoPrizePending: "Lancez d'abord la roue pour révéler un prix spécial.",
    reasonWheelPrizeUnavailable: "Ce prix spécial n'est pas disponible actuellement.",
    reasonWheelSpinning: "Attendez la fin du tour en cours.",
    reasonRoundActive: "Terminez ou encaissez d'abord la manche en cours.",
    reasonRoundMissing: "Lancez une manche avant d'utiliser cette action.",
    reasonCashOutTooEarly: "Réussissez au moins deux devinettes avant d'encaisser.",
    reasonInvalidGuess: "Aucune autre devinette n'est disponible dans cette manche.",
    reasonInvalidTier: "Choisissez un niveau de prix valide.",
    cash: "Argent",
    available: "disponibles",
    cpIn: "PC dépensés",
    cpOut: "PC attribués",
    doubleGood: "Doubler {good}",
    specialRocketWarp: "Accélérer une fusée",
    specialStarshipWarp: "Accélérer le vaisseau",
    specialAsteroid: "Terminer le scan d'astéroïdes",
    specialStarStudy: "Terminer l'étude stellaire",
    specialVoidPillage: "Terminer le pillage du vide",
    prizeBoostCash: "Bonus d'argent",
    prizeBoostResearch: "Bonus de recherche",
    prizeTopUpResources: "Recharge des ressources",
    prizeTopUpCompounds: "Recharge des composés",
    prizeResearch: "Gain de recherche",
    prizeCash: "Gain d'argent",
    prizeTimeWarp: "Distorsion temporelle ×{multiplier} pendant {seconds}s",
  },
};

export function casinoText(locale: LocaleId, key: keyof CasinoCopy): string {
  return COPY[locale][key];
}

export function casinoGameName(locale: LocaleId, game: CasinoGameId): string {
  const key: Record<CasinoGameId, keyof CasinoCopy> = {
    doubleOrNothing: "doubleOrNothing",
    wheel: "wheel",
    higherLower: "higherLower",
    voidSeer: "voidSeer",
  };
  return casinoText(locale, key[game]);
}

export function casinoSpecialName(locale: LocaleId, prize: CasinoSpecialPrize): string {
  if (prize === "special_100cp") return "100 CP";
  if (prize === "special_100k_research")
    return `100.000 ${COPY[locale].prizeResearch.toLocaleLowerCase(locale)}`;
  if (prize === "special_rocket_warp") return COPY[locale].specialRocketWarp;
  if (prize === "special_starship_warp") return COPY[locale].specialStarshipWarp;
  if (prize === "special_telescope_finish_asteroid_search") return COPY[locale].specialAsteroid;
  if (prize === "special_telescope_finish_star_study") return COPY[locale].specialStarStudy;
  if (prize === "special_telescope_finish_void_pillage") return COPY[locale].specialVoidPillage;
  return `${COPY[locale].doubleGood.replace("{good}", prize.slice("special_double_".length))}`;
}

export function casinoFailureText(
  locale: LocaleId,
  code: CasinoFailure["code"] | string,
  details: Readonly<{ required?: string; available?: string; payment?: string }> = {},
): string {
  const key: Partial<Record<CasinoFailure["code"], keyof CasinoCopy>> = {
    "casino-locked": "locked",
    "casino-invalid-amount": "reasonInvalidAmount",
    "casino-insufficient-stock": "reasonInsufficientPayment",
    "casino-insufficient-cp": "reasonInsufficientCp",
    "casino-good-locked": "reasonGoodLocked",
    "casino-wheel-prize-pending": "reasonWheelPrizePending",
    "casino-wheel-no-prize-pending": "reasonWheelNoPrizePending",
    "casino-wheel-prize-unavailable": "reasonWheelPrizeUnavailable",
    "casino-round-active": "reasonRoundActive",
    "casino-round-missing": "reasonRoundMissing",
    "casino-cash-out-too-early": "reasonCashOutTooEarly",
    "casino-invalid-guess": "reasonInvalidGuess",
    "casino-invalid-tier": "reasonInvalidTier",
  };
  const selected = key[code as CasinoFailure["code"]];
  const text = selected ? casinoText(locale, selected) : casinoText(locale, "failure");
  return text
    .replace("{required}", details.required ?? "0")
    .replace("{available}", details.available ?? "0")
    .replace("{payment}", details.payment ?? casinoText(locale, "cash"));
}

export function casinoPrizeText(locale: LocaleId, prizeKey: string): string {
  const cp = /^hilo_cp_(\d+)$/.exec(prizeKey);
  if (cp) return `${cp[1]} CP`;
  if (prizeKey.startsWith("special_")) {
    if (prizeKey === "special_finish_rocket_journey") return COPY[locale].specialRocketWarp;
    if (prizeKey === "special_finish_starship_journey") return COPY[locale].specialStarshipWarp;
    return casinoSpecialName(locale, prizeKey as CasinoSpecialPrize);
  }
  if (prizeKey.includes("cash_boost")) return COPY[locale].prizeBoostCash;
  if (prizeKey.includes("research_boost")) return COPY[locale].prizeBoostResearch;
  if (prizeKey === "hilo_resource_topup") return COPY[locale].prizeTopUpResources;
  if (prizeKey === "hilo_compound_topup") return COPY[locale].prizeTopUpCompounds;
  if (prizeKey.includes("research")) return COPY[locale].prizeResearch;
  if (prizeKey.includes("cash")) return COPY[locale].prizeCash;
  const timeWarp = /^hilo_timewarp_(\d+)_(\d+)$/.exec(prizeKey);
  if (timeWarp)
    return COPY[locale].prizeTimeWarp
      .replace("{multiplier}", timeWarp[1]!)
      .replace("{seconds}", String(Number(timeWarp[2]) / 1000));
  return prizeKey.replaceAll("_", " ");
}

export const LOCALIZATION_VALIDATION_DATA = { COPY } as const;
