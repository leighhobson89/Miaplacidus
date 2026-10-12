import type { LocaleId } from "../content/ids";
import type { CasinoGameId, CasinoSpecialPrize } from "../content/galacticCasino";
import type { CasinoFailure } from "../engine/galacticCasino";

type CasinoCopy = {
  readonly title: string;
  readonly headerHelpLabel: string;
  readonly headerHelp: string;
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
  readonly selectPrizePlaceholder: string;
  readonly wheelHelp: string;
  readonly claim: string;
  readonly higherLower: string;
  readonly start: string;
  readonly higher: string;
  readonly lower: string;
  readonly cashOut: string;
  readonly currentCard: string;
  readonly cardAccessibleName: string;
  readonly cardJack: string;
  readonly cardQueen: string;
  readonly cardKing: string;
  readonly cardAce: string;
  readonly cardSuitClubs: string;
  readonly cardSuitDiamonds: string;
  readonly cardSuitHearts: string;
  readonly cardSuitSpades: string;
  readonly currentPrize: string;
  readonly voidSeer: string;
  readonly voidPrizeOType: string;
  readonly voidPrizeManuscript: string;
  readonly voidPrizeAntimatter: string;
  readonly tier: string;
  readonly chance: string;
  readonly reveal: string;
  readonly history: string;
  readonly noHistory: string;
  readonly runStats: string;
  readonly allTimeStats: string;
  readonly playCountOne: string;
  readonly playCountOther: string;
  readonly winCountOne: string;
  readonly winCountOther: string;
  readonly locked: string;
  readonly purchaseResult: string;
  readonly doubleOrNothingWinNotification: string;
  readonly doubleOrNothingLossNotification: string;
  readonly wheelLossNotification: string;
  readonly wheelSpecialReadyNotification: string;
  readonly wheelClaim100CpNotification: string;
  readonly wheelClaimResearchNotification: string;
  readonly wheelClaimDoublePrefix: string;
  readonly wheelClaimDoubleSuffix: string;
  readonly wheelClaimStarStudyNotification: string;
  readonly wheelClaimAsteroidSearchNotification: string;
  readonly wheelClaimVoidPillageNotification: string;
  readonly wheelWinPrefix: string;
  readonly researchPoints: string;
  readonly wheelTimeReducedMessage: string;
  readonly wheelTimerAsteroidScanLabel: string;
  readonly wheelTimerStarStudyLabel: string;
  readonly wheelTimerVoidPillageLabel: string;
  readonly wheelTimerStarshipJourneyLabel: string;
  readonly wheelTimerGenericLabel: string;
  readonly wheelCurrencyCp: string;
  readonly wheelGenericWinNotification: string;
  readonly hiloLossNotification: string;
  readonly hiloFullDeckNotification: string;
  readonly hiloCashOutNotification: string;
  readonly voidPlainWinNotification: string;
  readonly voidLossNotification: string;
  readonly voidAntimatterWinNotification: string;
  readonly voidWinWithClueNotification: string;
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
    headerHelpLabel: "Casino information",
    headerHelp:
      "Welcome to the Galactic Casino!  Here the premise is, buy CP that you can use on the current run, and use it to gamble for prizes that benefit you in the current run.  Nothing here is for the long game, and CP is reset at the end of the run.  Enjoy playing the games and good luck! 🤔",
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
    selectPrizePlaceholder: "Select a special prize",
    wheelHelp:
      "The drop down will be enabled only if you win the Special Prize, i.e. the Special Colored segment of the wheel where you will be able to choose a prize from it.",
    claim: "Claim prize",
    higherLower: "Higher or Lower",
    start: "Start for 5 CP",
    higher: "Higher",
    lower: "Lower",
    cashOut: "Cash out",
    currentCard: "Current card",
    cardAccessibleName: "{rank} of {suit}",
    cardJack: "Jack",
    cardQueen: "Queen",
    cardKing: "King",
    cardAce: "Ace",
    cardSuitClubs: "clubs",
    cardSuitDiamonds: "diamonds",
    cardSuitHearts: "hearts",
    cardSuitSpades: "spades",
    currentPrize: "Current cash-out prize",
    voidSeer: "Visiting VoidSeer:",
    voidPrizeOType: "O Type Star Clue",
    voidPrizeManuscript: "Ancient Manuscript Clue",
    voidPrizeAntimatter: "Pillage Antimatter",
    tier: "Prize tier",
    chance: "Match chance",
    reveal: "Roll",
    history: "Recent game history",
    noHistory: "No casino games played yet.",
    runStats: "This run",
    allTimeStats: "All time",
    playCountOne: "play",
    playCountOther: "plays",
    winCountOne: "win",
    winCountOther: "wins",
    locked: "The Galactic Casino unlocks after you earn your first Ascendency Point.",
    purchaseResult: "Bought {amount} CP for {cost}.",
    doubleOrNothingWinNotification: "WIN! Stake doubled.",
    doubleOrNothingLossNotification: "LOSE! Better luck next time.",
    wheelLossNotification: "LOSE! Better luck next time.",
    wheelSpecialReadyNotification:
      "WIN! Special Prize! - Select a Prize from the dropdown to continue.",
    wheelClaim100CpNotification: "Special Prize Claimed! 100CP",
    wheelClaimResearchNotification: "Special Prize Claimed! 100,000 Research Points",
    wheelClaimDoublePrefix: "Special Prize Claimed! ",
    wheelClaimDoubleSuffix: " doubled",
    wheelClaimStarStudyNotification: "Special Prize Claimed! Space Telescope finished Star Study!",
    wheelClaimAsteroidSearchNotification:
      "Special Prize Claimed! Space Telescope finished Asteroid Search!",
    wheelClaimVoidPillageNotification:
      "Special Prize Claimed! Space Telescope finished Pillaging The Void!",
    wheelWinPrefix: "WON! ",
    researchPoints: "Research Points",
    wheelTimeReducedMessage: "WON! {label}: Time reduced from {from}s to {to}s",
    wheelTimerAsteroidScanLabel: "Space Telescope: Asteroid Scan",
    wheelTimerStarStudyLabel: "Space Telescope: Star Investigation",
    wheelTimerVoidPillageLabel: "Space Telescope: Void Pillage",
    wheelTimerStarshipJourneyLabel: "Starship Journey",
    wheelTimerGenericLabel: "Timer",
    wheelCurrencyCp: "CP",
    wheelGenericWinNotification: "WON!",
    hiloLossNotification: "LOSE! Better luck next time.",
    hiloFullDeckNotification: "WON! Well done you guessed all Cards! {prize}",
    hiloCashOutNotification: "You cashed out at {count} cards - {prize}",
    voidPlainWinNotification: "WIN!",
    voidLossNotification: "LOSE! Better luck next time",
    voidAntimatterWinNotification: "WIN! +{amount} Antimatter",
    voidWinWithClueNotification: "WIN! {clue}",
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
    title: "Casino Galáctico",
    headerHelpLabel: "Información del casino",
    headerHelp:
      "¡Bienvenido al Casino Galáctico! Aquí la premisa es, comprar PC que puedes usar en la run actual, y usarlo para apostar por premios que te benefician en la run actual. Nada aquí es para el juego largo, y PC se reinicia al final de la run. ¡Disfruta jugando los juegos y buena suerte! 🤔",
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
    selectPrizePlaceholder: "Selecciona un premio especial",
    wheelHelp:
      "El menú desplegable solo se habilitará si ganas el Premio Especial, es decir, el segmento de color especial de la rueda donde podrás elegir un premio de él.",
    claim: "Reclamar premio",
    higherLower: "Mayor o menor",
    start: "Empezar por 5 PC",
    higher: "Mayor",
    lower: "Menor",
    cashOut: "Retirar premio",
    currentCard: "Carta actual",
    cardAccessibleName: "{rank} de {suit}",
    cardJack: "Sota",
    cardQueen: "Reina",
    cardKing: "Rey",
    cardAce: "As",
    cardSuitClubs: "trébol",
    cardSuitDiamonds: "diamante",
    cardSuitHearts: "corazón",
    cardSuitSpades: "pica",
    currentPrize: "Premio para retirar",
    voidSeer: "Vidente del Vacío de Visita:",
    voidPrizeOType: "Pista de estrella tipo O",
    voidPrizeManuscript: "Pista de manuscrito antiguo",
    voidPrizeAntimatter: "Saquear antimateria",
    tier: "Nivel de premio",
    chance: "Probabilidad de coincidencia",
    reveal: "Lanzar",
    history: "Historial reciente",
    noHistory: "Aún no has jugado en el casino.",
    runStats: "Esta partida",
    allTimeStats: "Total",
    playCountOne: "jugada",
    playCountOther: "jugadas",
    winCountOne: "victoria",
    winCountOther: "victorias",
    locked: "El Casino galáctico se desbloquea al conseguir tu primer Punto de Ascendencia.",
    purchaseResult: "Has comprado {amount} PC por {cost}.",
    doubleOrNothingWinNotification: "¡GANASTE! Apuesta duplicada.",
    doubleOrNothingLossNotification: "¡PERDISTE! Mejor suerte la próxima.",
    wheelLossNotification: "¡PERDISTE! Mejor suerte la próxima.",
    wheelSpecialReadyNotification:
      "¡GANASTE! ¡Premio especial! - Selecciona un premio del menú para continuar.",
    wheelClaim100CpNotification: "¡Premio especial reclamado! 100CP",
    wheelClaimResearchNotification: "¡Premio especial reclamado! 100.000 puntos de investigación",
    wheelClaimDoublePrefix: "¡Premio especial reclamado! ",
    wheelClaimDoubleSuffix: " duplicado",
    wheelClaimStarStudyNotification:
      "¡Premio especial reclamado! ¡Telescopio espacial terminó el estudio estelar!",
    wheelClaimAsteroidSearchNotification:
      "¡Premio especial reclamado! ¡Telescopio espacial terminó la búsqueda de asteroides!",
    wheelClaimVoidPillageNotification:
      "¡Premio especial reclamado! ¡Telescopio espacial terminó de saquear el vacío!",
    wheelWinPrefix: "¡GANASTE! ",
    researchPoints: "Puntos de investigación",
    wheelTimeReducedMessage: "¡GANASTE! {label}: Tiempo reducido de {from}s a {to}s",
    wheelTimerAsteroidScanLabel: "Telescopio espacial: Escaneo de asteroides",
    wheelTimerStarStudyLabel: "Telescopio espacial: Investigación estelar",
    wheelTimerVoidPillageLabel: "Telescopio espacial: Saqueo del vacío",
    wheelTimerStarshipJourneyLabel: "Viaje de la nave estelar",
    wheelTimerGenericLabel: "Temporizador",
    wheelCurrencyCp: "CP",
    wheelGenericWinNotification: "¡GANASTE!",
    hiloLossNotification: "¡PERDISTE! Mejor suerte la próxima vez.",
    hiloFullDeckNotification: "¡GANASTE! ¡Bien hecho, acertaste todas las cartas! {prize}",
    hiloCashOutNotification: "Te retiraste con {count} cartas - {prize}",
    voidPlainWinNotification: "¡GANASTE!",
    voidLossNotification: "¡PERDISTE! Mejor suerte la próxima vez",
    voidAntimatterWinNotification: "¡GANASTE! +{amount} de antimateria",
    voidWinWithClueNotification: "¡GANASTE! {clue}",
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
    title: "Casino Galáctico",
    headerHelpLabel: "Informações do cassino",
    headerHelp:
      "Bem-vindo ao Cassino Galáctico! Aqui a ideia é comprar PC que você pode usar na run atual e usá-los para apostar em prêmios que beneficiam sua run atual. Nada aqui é para o longo prazo, e os PC são reiniciados ao final da run. Divirta-se jogando e boa sorte! 🤔",
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
    selectPrizePlaceholder: "Selecione um prémio especial",
    wheelHelp:
      "O menu suspenso só será habilitado se você ganhar o Prêmio Especial, ou seja, o segmento colorido especial da roda, onde poderá escolher um prêmio.",
    claim: "Reclamar prémio",
    higherLower: "Maior ou menor",
    start: "Começar por 5 PC",
    higher: "Maior",
    lower: "Menor",
    cashOut: "Levantar prémio",
    currentCard: "Carta atual",
    cardAccessibleName: "{rank} de {suit}",
    cardJack: "Valete",
    cardQueen: "Dama",
    cardKing: "Rei",
    cardAce: "Ás",
    cardSuitClubs: "paus",
    cardSuitDiamonds: "ouros",
    cardSuitHearts: "copas",
    cardSuitSpades: "espadas",
    currentPrize: "Prémio para levantar",
    voidSeer: "Vidente do Vazio Visitante:",
    voidPrizeOType: "Pista de estrela de tipo O",
    voidPrizeManuscript: "Pista de manuscrito antigo",
    voidPrizeAntimatter: "Saque de antimatéria",
    tier: "Nível do prémio",
    chance: "Probabilidade de coincidência",
    reveal: "Lançar",
    history: "Histórico recente",
    noHistory: "Ainda não jogaste no casino.",
    runStats: "Esta partida",
    allTimeStats: "Total",
    playCountOne: "jogada",
    playCountOther: "jogadas",
    winCountOne: "vitória",
    winCountOther: "vitórias",
    locked: "O Casino galáctico desbloqueia após ganhares o primeiro Ponto de Ascendência.",
    purchaseResult: "Compraste {amount} PC por {cost}.",
    doubleOrNothingWinNotification: "GANHOU! Aposta duplicada.",
    doubleOrNothingLossNotification: "PERDEU! Mais sorte da próxima vez.",
    wheelLossNotification: "PERDEU! Mais sorte da próxima vez.",
    wheelSpecialReadyNotification:
      "GANHOU! Prémio especial! - Selecione um prémio no menu para continuar.",
    wheelClaim100CpNotification: "Prémio especial reclamado! 100CP",
    wheelClaimResearchNotification: "Prémio especial reclamado! 100.000 pontos de investigação",
    wheelClaimDoublePrefix: "Prémio especial reclamado! ",
    wheelClaimDoubleSuffix: " duplicado",
    wheelClaimStarStudyNotification:
      "Prémio especial reclamado! O telescópio espacial terminou o estudo estelar!",
    wheelClaimAsteroidSearchNotification:
      "Prémio especial reclamado! O telescópio espacial terminou a busca por asteroides!",
    wheelClaimVoidPillageNotification:
      "Prémio especial reclamado! O telescópio espacial terminou de saquear o vazio!",
    wheelWinPrefix: "GANHOU! ",
    researchPoints: "Pontos de investigação",
    wheelTimeReducedMessage: "GANHOU! {label}: Tempo reduzido de {from}s para {to}s",
    wheelTimerAsteroidScanLabel: "Telescópio espacial: Busca de asteroides",
    wheelTimerStarStudyLabel: "Telescópio espacial: Investigação estelar",
    wheelTimerVoidPillageLabel: "Telescópio espacial: Pilhagem do vazio",
    wheelTimerStarshipJourneyLabel: "Viagem da nave estelar",
    wheelTimerGenericLabel: "Temporizador",
    wheelCurrencyCp: "CP",
    wheelGenericWinNotification: "GANHOU!",
    hiloLossNotification: "PERDEU! Mais sorte da próxima vez.",
    hiloFullDeckNotification: "GANHOU! Muito bem, acertou em todas as cartas! {prize}",
    hiloCashOutNotification: "Saiu com {count} cartas - {prize}",
    voidPlainWinNotification: "GANHOU!",
    voidLossNotification: "PERDEU! Mais sorte da próxima vez",
    voidAntimatterWinNotification: "GANHOU! +{amount} de antimatéria",
    voidWinWithClueNotification: "GANHOU! {clue}",
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
    title: "Galaktisches Casino",
    balance: "Casinopunkte",
    headerHelpLabel: "Informationen zum Casino",
    headerHelp:
      "Willkommen im Galaktischen Casino! Hier ist die Prämisse: Kaufe GP, die du im aktuellen Run verwenden kannst, und benutze sie, um um Preise zu spielen, die dich im aktuellen Run begünstigen. Nichts hier ist für das Langzeitspiel, und GP wird am Ende des Runs zurückgesetzt. Viel Spaß beim Spielen und viel Glück! 🤔",
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
    selectPrizePlaceholder: "Sonderpreis auswählen",
    wheelHelp:
      "Das Dropdown-Menü wird nur aktiviert, wenn du den Spezialpreis gewinnst, d.h. das spezielle farbige Segment des Rads, wo du einen Preis daraus wählen kannst.",
    claim: "Preis abholen",
    higherLower: "Höher oder niedriger",
    start: "Start für 5 CP",
    higher: "Höher",
    lower: "Niedriger",
    cashOut: "Auszahlen",
    currentCard: "Aktuelle Karte",
    cardAccessibleName: "{suit} {rank}",
    cardJack: "Bube",
    cardQueen: "Dame",
    cardKing: "König",
    cardAce: "Ass",
    cardSuitClubs: "Kreuz",
    cardSuitDiamonds: "Karo",
    cardSuitHearts: "Herz",
    cardSuitSpades: "Pik",
    currentPrize: "Aktueller Auszahlungsgewinn",
    voidSeer: "Besuch beim Leerenseher:",
    voidPrizeOType: "Hinweis auf einen O-Typ-Stern",
    voidPrizeManuscript: "Hinweis auf ein antikes Manuskript",
    voidPrizeAntimatter: "Antimaterie plündern",
    tier: "Preisstufe",
    chance: "Trefferchance",
    reveal: "Würfeln",
    history: "Letzte Spiele",
    noHistory: "Noch keine Casinospiele gespielt.",
    runStats: "Dieser Durchlauf",
    allTimeStats: "Gesamt",
    playCountOne: "Spiel",
    playCountOther: "Spiele",
    winCountOne: "Sieg",
    winCountOther: "Siege",
    locked: "Das galaktische Kasino wird nach dem ersten Aszendenzpunkt freigeschaltet.",
    purchaseResult: "{amount} CP für {cost} gekauft.",
    doubleOrNothingWinNotification: "GEWONNEN! Einsatz verdoppelt.",
    doubleOrNothingLossNotification: "VERLOREN! Viel Glück beim nächsten Mal.",
    wheelLossNotification: "VERLOREN! Viel Glück beim nächsten Mal.",
    wheelSpecialReadyNotification:
      "GEWONNEN! Sonderpreis! - Wähle einen Preis aus der Liste, um fortzufahren.",
    wheelClaim100CpNotification: "Sonderpreis beansprucht! 100CP",
    wheelClaimResearchNotification: "Sonderpreis beansprucht! 100.000 Forschungspunkte",
    wheelClaimDoublePrefix: "Sonderpreis beansprucht! ",
    wheelClaimDoubleSuffix: " verdoppelt",
    wheelClaimStarStudyNotification:
      "Sonderpreis beansprucht! Weltraumteleskop beendete Sternenstudie!",
    wheelClaimAsteroidSearchNotification:
      "Sonderpreis beansprucht! Weltraumteleskop beendete Asteroidensuche!",
    wheelClaimVoidPillageNotification:
      "Sonderpreis beansprucht! Weltraumteleskop beendete Plünderung der Leere!",
    wheelWinPrefix: "GEWONNEN! ",
    researchPoints: "Forschungspunkte",
    wheelTimeReducedMessage: "GEWONNEN! {label}: Zeit von {from}s auf {to}s verkürzt",
    wheelTimerAsteroidScanLabel: "Weltraumteleskop: Asteroidensuche",
    wheelTimerStarStudyLabel: "Weltraumteleskop: Sternenstudie",
    wheelTimerVoidPillageLabel: "Weltraumteleskop: Plünderung der Leere",
    wheelTimerStarshipJourneyLabel: "Raumschiffreise",
    wheelTimerGenericLabel: "Timer",
    wheelCurrencyCp: "CP",
    wheelGenericWinNotification: "GEWONNEN!",
    hiloLossNotification: "VERLOREN! Mehr Glück beim nächsten Mal.",
    hiloFullDeckNotification: "GEWONNEN! Gut gemacht, du hast alle Karten erraten! {prize}",
    hiloCashOutNotification: "Du hast bei {count} Karten ausgezahlt - {prize}",
    voidPlainWinNotification: "GEWONNEN!",
    voidLossNotification: "VERLOREN! Mehr Glück beim nächsten Mal",
    voidAntimatterWinNotification: "GEWONNEN! +{amount} Antimaterie",
    voidWinWithClueNotification: "GEWONNEN! {clue}",
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
    title: "Casinò Galattico",
    balance: "Punti casinò",
    buyTitle: "Compra punti casinò",
    payment: "Paga con",
    headerHelpLabel: "Informazioni sul casinò",
    headerHelp:
      "Benvenuto nel Casinò Galattico! Qui la premessa è: comprare PG che puoi usare nella run attuale, e usarli per giocare d'azzardo per premi che ti beneficiano nella run attuale. Niente qui è per il gioco a lungo termine, e i PG vengono resettati alla fine della run. Divertiti a giocare e buona fortuna! 🤔",
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
    selectPrizePlaceholder: "Seleziona un premio speciale",
    wheelHelp:
      "Il menu a discesa sarà abilitato solo se vinci il Premio Speciale, cioè il segmento colorato speciale della ruota dove potrai scegliere un premio.",
    claim: "Riscatta premio",
    higherLower: "Più alto o più basso",
    start: "Inizia per 5 PC",
    higher: "Più alto",
    lower: "Più basso",
    cashOut: "Ritira",
    currentCard: "Carta attuale",
    cardAccessibleName: "{rank} di {suit}",
    cardJack: "Fante",
    cardQueen: "Donna",
    cardKing: "Re",
    cardAce: "Asso",
    cardSuitClubs: "fiori",
    cardSuitDiamonds: "quadri",
    cardSuitHearts: "cuori",
    cardSuitSpades: "picche",
    currentPrize: "Premio da ritirare",
    voidSeer: "Veggente del Vuoto in Visita:",
    voidPrizeOType: "Indizio su una stella di tipo O",
    voidPrizeManuscript: "Indizio su un manoscritto antico",
    voidPrizeAntimatter: "Saccheggia antimateria",
    tier: "Livello del premio",
    chance: "Probabilità di corrispondenza",
    reveal: "Lancia",
    history: "Cronologia recente",
    noHistory: "Non hai ancora giocato al casinò.",
    runStats: "Questa partita",
    allTimeStats: "Totale",
    playCountOne: "partita",
    playCountOther: "partite",
    winCountOne: "vittoria",
    winCountOther: "vittorie",
    locked: "Il Casinò galattico si sblocca dopo il primo Punto di Ascendenza.",
    purchaseResult: "Hai comprato {amount} PC per {cost}.",
    doubleOrNothingWinNotification: "VITTORIA! Puntata raddoppiata.",
    doubleOrNothingLossNotification: "SCONFITTA! Più fortuna la prossima volta.",
    wheelLossNotification: "SCONFITTA! Più fortuna la prossima volta.",
    wheelSpecialReadyNotification:
      "VITTORIA! Premio speciale! - Seleziona un premio dal menu per continuare.",
    wheelClaim100CpNotification: "Premio speciale reclamato! 100CP",
    wheelClaimResearchNotification: "Premio speciale reclamato! 100.000 punti ricerca",
    wheelClaimDoublePrefix: "Premio speciale reclamato! ",
    wheelClaimDoubleSuffix: " raddoppiato",
    wheelClaimStarStudyNotification:
      "Premio speciale reclamato! Telescopio spaziale ha completato lo studio stellare!",
    wheelClaimAsteroidSearchNotification:
      "Premio speciale reclamato! Telescopio spaziale ha completato la ricerca di asteroidi!",
    wheelClaimVoidPillageNotification:
      "Premio speciale reclamato! Telescopio spaziale ha completato il saccheggio del Vuoto!",
    wheelWinPrefix: "VITTORIA! ",
    researchPoints: "Punti ricerca",
    wheelTimeReducedMessage: "VITTORIA! {label}: Tempo ridotto da {from}s a {to}s",
    wheelTimerAsteroidScanLabel: "Telescopio spaziale: Ricerca di asteroidi",
    wheelTimerStarStudyLabel: "Telescopio spaziale: Studio stellare",
    wheelTimerVoidPillageLabel: "Telescopio spaziale: Saccheggio del Vuoto",
    wheelTimerStarshipJourneyLabel: "Viaggio dell'astronave",
    wheelTimerGenericLabel: "Timer",
    wheelCurrencyCp: "CP",
    wheelGenericWinNotification: "VITTORIA!",
    hiloLossNotification: "HAI PERSO! Sarà per la prossima volta.",
    hiloFullDeckNotification: "VINTO! Bravo, hai indovinato tutte le carte! {prize}",
    hiloCashOutNotification: "Hai incassato a {count} carte - {prize}",
    voidPlainWinNotification: "VINTO!",
    voidLossNotification: "HAI PERSO! Sarà per la prossima volta",
    voidAntimatterWinNotification: "VINTO! +{amount} di antimateria",
    voidWinWithClueNotification: "VINTO! {clue}",
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
    title: "Casino Galactique",
    balance: "Points de casino",
    headerHelpLabel: "Informations sur le casino",
    headerHelp:
      "Bienvenue au Casino Galactique! Ici la prémisse est : acheter des PG que tu peux utiliser dans le run actuel, et les utiliser pour parier pour des prix qui te bénéficient dans le run actuel. Rien ici n'est pour le jeu à long terme, et les PG sont réinitialisés à la fin du run. Amuse-toi à jouer et bonne chance! 🤔",
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
    selectPrizePlaceholder: "Sélectionnez un prix spécial",
    wheelHelp:
      "Le menu déroulant ne sera activé que si tu gagnes le Prix Spécial, c'est-à-dire le segment coloré spécial de la roue où tu pourras choisir un prix parmi.",
    claim: "Réclamer le prix",
    higherLower: "Plus haut ou plus bas",
    start: "Commencer pour 5 PC",
    higher: "Plus haut",
    lower: "Plus bas",
    cashOut: "Encaisser",
    currentCard: "Carte actuelle",
    cardAccessibleName: "{rank} de {suit}",
    cardJack: "Valet",
    cardQueen: "Dame",
    cardKing: "Roi",
    cardAce: "As",
    cardSuitClubs: "trèfle",
    cardSuitDiamonds: "carreau",
    cardSuitHearts: "cœur",
    cardSuitSpades: "pique",
    currentPrize: "Prix à encaisser",
    voidSeer: "Visite du Voyant du Vide:",
    voidPrizeOType: "Indice d'étoile de type O",
    voidPrizeManuscript: "Indice de manuscrit ancien",
    voidPrizeAntimatter: "Piller de l'antimatière",
    tier: "Niveau du prix",
    chance: "Chance de correspondance",
    reveal: "Lancer",
    history: "Historique récent",
    noHistory: "Aucune partie de casino pour le moment.",
    runStats: "Cette partie",
    allTimeStats: "Total",
    playCountOne: "partie",
    playCountOther: "parties",
    winCountOne: "victoire",
    winCountOther: "victoires",
    locked: "Le Casino galactique se débloque après votre premier Point d'Ascendance.",
    purchaseResult: "{amount} PC achetés pour {cost}.",
    doubleOrNothingWinNotification: "GAGNÉ! Mise doublée.",
    doubleOrNothingLossNotification: "PERDU! Meilleure chance la prochaine fois.",
    wheelLossNotification: "PERDU! Meilleure chance la prochaine fois.",
    wheelSpecialReadyNotification:
      "GAGNÉ! Prix spécial! - Sélectionnez un prix dans la liste pour continuer.",
    wheelClaim100CpNotification: "Prix spécial réclamé! 100CP",
    wheelClaimResearchNotification: "Prix spécial réclamé! 100 000 points de recherche",
    wheelClaimDoublePrefix: "Prix spécial réclamé! ",
    wheelClaimDoubleSuffix: " doublé",
    wheelClaimStarStudyNotification:
      "Prix spécial réclamé! Télescope spatial a terminé l'étude stellaire!",
    wheelClaimAsteroidSearchNotification:
      "Prix spécial réclamé! Télescope spatial a terminé la recherche d'astéroïdes!",
    wheelClaimVoidPillageNotification:
      "Prix spécial réclamé! Télescope spatial a terminé le pillage du Vide!",
    wheelWinPrefix: "GAGNÉ! ",
    researchPoints: "Points de recherche",
    wheelTimeReducedMessage: "GAGNÉ! {label} : Temps réduit de {from}s à {to}s",
    wheelTimerAsteroidScanLabel: "Télescope spatial : Recherche d'astéroïdes",
    wheelTimerStarStudyLabel: "Télescope spatial : Étude des étoiles",
    wheelTimerVoidPillageLabel: "Télescope spatial : Pillage du Vide",
    wheelTimerStarshipJourneyLabel: "Voyage du vaisseau spatial",
    wheelTimerGenericLabel: "Minuteur",
    wheelCurrencyCp: "PC",
    wheelGenericWinNotification: "GAGNÉ!",
    hiloLossNotification: "PERDU! Plus de chance la prochaine fois.",
    hiloFullDeckNotification: "GAGNÉ! Bravo, vous avez deviné toutes les cartes! {prize}",
    hiloCashOutNotification: "Vous avez encaissé à {count} cartes - {prize}",
    voidPlainWinNotification: "GAGNÉ!",
    voidLossNotification: "PERDU! Plus de chance la prochaine fois",
    voidAntimatterWinNotification: "GAGNÉ! +{amount} d'antimatière",
    voidWinWithClueNotification: "GAGNÉ! {clue}",
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

export type CasinoSectionHelpKey =
  | "purchase"
  | "doubleOrNothing"
  | "wheel"
  | "higherLower"
  | "voidSeer";

const CASINO_SECTION_HELP_LABEL: Readonly<Record<LocaleId, string>> = {
  en: "{section} information",
  es: "Información de {section}",
  pt: "Informações de {section}",
  de: "Informationen zu {section}",
  it: "Informazioni su {section}",
  fr: "Informations sur {section}",
};

const VOID_SEER_CURRENCY: Readonly<Record<LocaleId, string>> = {
  en: "CP",
  es: "PC",
  pt: "PC",
  de: "CP",
  it: "PC",
  fr: "PC",
};

const SPECIAL_100_CP_PRIZE: Readonly<Record<LocaleId, string>> = {
  en: "100CP",
  es: "100PC",
  pt: "100 PC",
  de: "100CP",
  it: "100PC",
  fr: "100PC",
};

export function casinoVoidSeerCurrency(locale: LocaleId): string {
  return VOID_SEER_CURRENCY[locale];
}

/** Casino row descriptions mapped from Cosmic Forge localization.json. */
const CASINO_SECTION_HELP: Readonly<
  Record<LocaleId, Readonly<Record<CasinoSectionHelpKey, string>>>
> = {
  en: {
    purchase: "You can buy CP to use in the casino by trading Resources or Compounds.",
    doubleOrNothing: "Double or Nothing. Stake CP and spin for a chance to win double your stake.",
    wheel: "Wheel Of Fortune. Spend CP to spin the wheel and test your luck - {price}CP",
    higherLower:
      "Higher Or Lower. Choose Higher or Lower and cash out for the prize shown at any stage - {price}CP",
    voidSeer:
      "Master VoidSeer has numbers in each hand. If they match, you win the prize you select! Each prize has a CP prize and a number denoting how many possibilities are per hand, higher is harder!",
  },
  es: {
    purchase: "Puedes comprar CP para usar en el casino comerciando Recursos o Compuestos.",
    doubleOrNothing:
      "Doble o Nada. Apuesta CP y gira para tener la oportunidad de ganar el doble de tu apuesta.",
    wheel: "Rueda de la Fortuna. Gasta CP para girar la rueda y prueba tu suerte - {price}CP",
    higherLower:
      "Mayor o Menor. Elige Mayor o Menor y cobra el premio mostrado en cualquier etapa - {price}CP",
    voidSeer:
      "El Maestro Vidente del Vacío tiene números en cada mano. ¡Si coinciden, ganas el premio que seleccionas! Cada premio tiene un premio CP y un número que indica cuántas posibilidades hay por mano, ¡más alto es más difícil!",
  },
  pt: {
    purchase: "Você pode comprar CP para usar no cassino negociando Recursos ou Compostos.",
    doubleOrNothing:
      "Dobro ou Nada. Aposte CP e gire para ter a chance de ganhar o dobro da sua aposta.",
    wheel: "Roda da Fortuna. Gaste CP para girar a roda e testar sua sorte - {price}CP",
    higherLower:
      "Maior ou Menor. Escolha Maior ou Menor e receba o prêmio mostrado em qualquer etapa - {price}CP",
    voidSeer:
      "O Mestre Vidente do Vazio tem números em cada mão. Se eles coincidirem, você ganha o prêmio selecionado! Cada prêmio tem um valor em CP e um número que indica quantas chances existem por mão; quanto maior, mais difícil!",
  },
  de: {
    purchase:
      "Du kannst CP kaufen, um im Casino zu spielen, indem du Ressourcen oder Verbindungen handelst.",
    doubleOrNothing:
      "Doppelt oder Nichts. Setze CP ein und drehe, um die Chance zu haben, den doppelten Einsatz zu gewinnen.",
    wheel: "Glücksrad. Gib CP aus, um das Rad zu drehen und dein Glück zu testen - {price}CP",
    higherLower:
      "Höher oder Tiefer. Wähle Höher oder Tiefer und löse den angezeigten Preis in jeder Phase ein - {price}CP",
    voidSeer:
      "Meister LeereSeher hat Zahlen in jeder Hand. Wenn sie übereinstimmen, gewinnst du den Preis, den du wählst! Jeder Preis hat einen CP-Preis und eine Zahl, die angibt, wie viele Möglichkeiten pro Hand gibt, höher ist schwerer!",
  },
  it: {
    purchase: "Puoi acquistare CP da usare nel casinò commerciando Risorse o Composti.",
    doubleOrNothing:
      "Raddoppia o Niente. Scommetti CP e gira per avere la possibilità di vincere il doppio della tua scommessa.",
    wheel:
      "Ruota della Fortuna. Spendi CP per girare la ruota e metti alla prova la tua fortuna - {price}CP",
    higherLower:
      "Più Alto o Più Basso. Scegli Più Alto o Più Basso e incassa il premio mostrato in qualsiasi fase - {price}CP",
    voidSeer:
      "Il Maestro Veggente del Vuoto ha numeri in ogni mano. Se corrispondono, vinci il premio che selezioni! Ogni premio ha un premio CP e un numero che indica quante possibilità ci sono per mano, più alto è più difficile!",
  },
  fr: {
    purchase:
      "Vous pouvez acheter des CP à utiliser dans le casino en échangeant des Ressources ou Composés.",
    doubleOrNothing:
      "Double ou Rien. Misez des CP et tournez pour avoir une chance de gagner le double de votre mise.",
    wheel:
      "Roue de la Fortune. Dépensez des CP pour faire tourner la roue et testez votre chance - {price}CP",
    higherLower:
      "Plus Haut ou Plus Bas. Choisissez Plus Haut ou Plus Bas et encaissez le prix affiché à n'importe quelle étape - {price}CP",
    voidSeer:
      "Le Maître Voyant du Vide a des nombres dans chaque main. S'ils correspondent, vous gagnez le prix que vous sélectionnez! Chaque prix a un prix en CP et un nombre indiquant combien de possibilités il y a par main, plus c'est élevé plus c'est difficile!",
  },
};

type HiloCopyKey =
  | "cpPrize"
  | "cashBoost"
  | "researchBoost"
  | "resourceTopUp"
  | "compoundTopUp"
  | "doubleMaterial"
  | "researchGrant"
  | "cashGrant"
  | "researchGrantPlus"
  | "researchMega"
  | "cashMega"
  | "timeWarp"
  | "finishRocket"
  | "finishStarship"
  | "finishAsteroid"
  | "finishStarStudy"
  | "finishVoid"
  | "awardCash"
  | "awardResearch"
  | "awardMaterialAmount"
  | "awardMaterialDoubled"
  | "awardTimeWarp"
  | "awardFinishedAsteroidSearch"
  | "awardFinishedStarStudy"
  | "awardFinishedVoidPillage"
  | "awardFinishedRocketJourney"
  | "awardFinishedStarshipJourney";

const HILO_COPY: Record<LocaleId, Record<HiloCopyKey, string>> = {
  en: {
    cpPrize: "+{amount} CP",
    cashBoost: "Cash Boost",
    researchBoost: "Research Boost",
    resourceTopUp: "Resource Top-Up",
    compoundTopUp: "Compound Top-Up",
    doubleMaterial: "Double {material}",
    researchGrant: "Research Grant",
    cashGrant: "Cash Grant",
    researchGrantPlus: "Research Grant+",
    researchMega: "Research Mega",
    cashMega: "Cash Mega",
    timeWarp: "TimeWarp x{multiplier}",
    finishRocket: "Finish Rocket",
    finishStarship: "Finish Starship",
    finishAsteroid: "Finish Asteroid",
    finishStarStudy: "Finish Star Study",
    finishVoid: "Finish Void",
    awardCash: "{amount} Cash",
    awardResearch: "{amount} Research Points",
    awardMaterialAmount: "{amount} {material}",
    awardMaterialDoubled: "{material} doubled",
    awardTimeWarp: "TimeWarp x{multiplier} for {seconds}s",
    awardFinishedAsteroidSearch: "Finished Asteroid Search{suffix}",
    awardFinishedStarStudy: "Finished Star Study",
    awardFinishedVoidPillage: "Finished Void Pillage",
    awardFinishedRocketJourney: "Finished Rocket Journey{suffix}",
    awardFinishedStarshipJourney: "Finished Starship Journey ({star})",
  },
  es: {
    cpPrize: "+{amount} PC",
    cashBoost: "Impulso de Dinero",
    researchBoost: "Impulso de Investigación",
    resourceTopUp: "Recarga de Recursos",
    compoundTopUp: "Recarga de Compuestos",
    doubleMaterial: "Duplicar {material}",
    researchGrant: "Subvención de Investigación",
    cashGrant: "Subvención de Dinero",
    researchGrantPlus: "Subvención de Investigación+",
    researchMega: "Mega Investigación",
    cashMega: "Mega Dinero",
    timeWarp: "Distorsión Temporal x{multiplier}",
    finishRocket: "Terminar Cohete",
    finishStarship: "Terminar Nave Estelar",
    finishAsteroid: "Terminar Asteroide",
    finishStarStudy: "Terminar Estudio Estelar",
    finishVoid: "Terminar Vacío",
    awardCash: "{amount} de dinero",
    awardResearch: "{amount} puntos de investigación",
    awardMaterialAmount: "{amount} de {material}",
    awardMaterialDoubled: "{material} duplicado",
    awardTimeWarp: "Distorsión Temporal x{multiplier} durante {seconds}s",
    awardFinishedAsteroidSearch: "Búsqueda de asteroides terminada{suffix}",
    awardFinishedStarStudy: "Estudio estelar terminado",
    awardFinishedVoidPillage: "Saqueo del vacío terminado",
    awardFinishedRocketJourney: "Viaje del cohete terminado{suffix}",
    awardFinishedStarshipJourney: "Viaje de la nave estelar terminado ({star})",
  },
  pt: {
    cpPrize: "+{amount} PC",
    cashBoost: "Impulso de Dinheiro",
    researchBoost: "Impulso de Investigação",
    resourceTopUp: "Reposição de Recursos",
    compoundTopUp: "Reposição de Compostos",
    doubleMaterial: "Duplicar {material}",
    researchGrant: "Subsídio de Investigação",
    cashGrant: "Subsídio de Dinheiro",
    researchGrantPlus: "Subsídio de Investigação+",
    researchMega: "Mega Investigação",
    cashMega: "Mega Dinheiro",
    timeWarp: "Distorção Temporal x{multiplier}",
    finishRocket: "Terminar Foguetão",
    finishStarship: "Terminar Nave Estelar",
    finishAsteroid: "Terminar Asteroide",
    finishStarStudy: "Terminar Estudo Estelar",
    finishVoid: "Terminar Vazio",
    awardCash: "{amount} de dinheiro",
    awardResearch: "{amount} pontos de investigação",
    awardMaterialAmount: "{amount} de {material}",
    awardMaterialDoubled: "{material} duplicado",
    awardTimeWarp: "Distorção Temporal x{multiplier} durante {seconds}s",
    awardFinishedAsteroidSearch: "Busca por asteroides concluída{suffix}",
    awardFinishedStarStudy: "Estudo estelar concluído",
    awardFinishedVoidPillage: "Saque do vazio concluído",
    awardFinishedRocketJourney: "Viagem do foguetão concluída{suffix}",
    awardFinishedStarshipJourney: "Viagem da nave estelar concluída ({star})",
  },
  de: {
    cpPrize: "+{amount} CP",
    cashBoost: "Bargeld-Boost",
    researchBoost: "Forschungs-Boost",
    resourceTopUp: "Ressourcen-Auffüllung",
    compoundTopUp: "Verbindungs-Auffüllung",
    doubleMaterial: "{material} verdoppeln",
    researchGrant: "Forschungszuschuss",
    cashGrant: "Bargeldzuschuss",
    researchGrantPlus: "Forschungszuschuss+",
    researchMega: "Mega-Forschung",
    cashMega: "Mega-Bargeld",
    timeWarp: "Zeitsprung x{multiplier}",
    finishRocket: "Rakete Abschließen",
    finishStarship: "Sternenschiff Abschließen",
    finishAsteroid: "Asteroid Abschließen",
    finishStarStudy: "Sternenstudie Abschließen",
    finishVoid: "Leere Abschließen",
    awardCash: "{amount} Bargeld",
    awardResearch: "{amount} Forschungspunkte",
    awardMaterialAmount: "{amount} {material}",
    awardMaterialDoubled: "{material} verdoppelt",
    awardTimeWarp: "Zeitsprung x{multiplier} für {seconds}s",
    awardFinishedAsteroidSearch: "Asteroidensuche abgeschlossen{suffix}",
    awardFinishedStarStudy: "Sternenstudie abgeschlossen",
    awardFinishedVoidPillage: "Plünderung der Leere abgeschlossen",
    awardFinishedRocketJourney: "Raketenreise abgeschlossen{suffix}",
    awardFinishedStarshipJourney: "Sternenschiffreise abgeschlossen ({star})",
  },
  it: {
    cpPrize: "+{amount} PC",
    cashBoost: "Bonus Denaro",
    researchBoost: "Bonus Ricerca",
    resourceTopUp: "Ricarica Risorse",
    compoundTopUp: "Ricarica Composti",
    doubleMaterial: "Raddoppia {material}",
    researchGrant: "Sovvenzione Ricerca",
    cashGrant: "Sovvenzione Denaro",
    researchGrantPlus: "Sovvenzione Ricerca+",
    researchMega: "Mega Ricerca",
    cashMega: "Mega Denaro",
    timeWarp: "Salto Temporale x{multiplier}",
    finishRocket: "Completa Razzo",
    finishStarship: "Completa Astronave",
    finishAsteroid: "Completa Asteroide",
    finishStarStudy: "Completa Studio Stellare",
    finishVoid: "Completa Vuoto",
    awardCash: "{amount} di denaro",
    awardResearch: "{amount} punti ricerca",
    awardMaterialAmount: "{amount} di {material}",
    awardMaterialDoubled: "{material} raddoppiato",
    awardTimeWarp: "Salto Temporale x{multiplier} per {seconds}s",
    awardFinishedAsteroidSearch: "Ricerca di asteroidi completata{suffix}",
    awardFinishedStarStudy: "Studio stellare completato",
    awardFinishedVoidPillage: "Saccheggio del vuoto completato",
    awardFinishedRocketJourney: "Viaggio del razzo completato{suffix}",
    awardFinishedStarshipJourney: "Viaggio dell'astronave completato ({star})",
  },
  fr: {
    cpPrize: "+{amount} PC",
    cashBoost: "Bonus d'Argent",
    researchBoost: "Bonus de Recherche",
    resourceTopUp: "Recharge de Ressources",
    compoundTopUp: "Recharge de Composés",
    doubleMaterial: "Doubler {material}",
    researchGrant: "Subvention de Recherche",
    cashGrant: "Subvention en Argent",
    researchGrantPlus: "Subvention de Recherche+",
    researchMega: "Méga Recherche",
    cashMega: "Méga Argent",
    timeWarp: "Distorsion Temporelle x{multiplier}",
    finishRocket: "Terminer la Fusée",
    finishStarship: "Terminer le Vaisseau",
    finishAsteroid: "Terminer l'Astéroïde",
    finishStarStudy: "Terminer l'Étude Stellaire",
    finishVoid: "Terminer le Vide",
    awardCash: "{amount} en argent",
    awardResearch: "{amount} points de recherche",
    awardMaterialAmount: "{amount} de {material}",
    awardMaterialDoubled: "{material} doublé",
    awardTimeWarp: "Distorsion Temporelle x{multiplier} pendant {seconds}s",
    awardFinishedAsteroidSearch: "Recherche d'astéroïdes terminée{suffix}",
    awardFinishedStarStudy: "Étude stellaire terminée",
    awardFinishedVoidPillage: "Pillage du vide terminé",
    awardFinishedRocketJourney: "Voyage de la fusée terminé{suffix}",
    awardFinishedStarshipJourney: "Voyage du vaisseau terminé ({star})",
  },
};

export function casinoHiloText(locale: LocaleId, key: HiloCopyKey): string {
  return HILO_COPY[locale][key];
}

const O_TYPE_CLUES: Record<LocaleId, readonly [string, string, string]> = {
  en: [
    "{STAR} is giving off very high energy signals, it could be a type O star!",
    "Your instruments spike whenever they point toward {STAR}. All signs suggest an O-type star.",
    "Long-range scans detect extreme radiation from {STAR}. This could be an O-type system.",
  ],
  es: [
    "¡{STAR} emite señales de energía muy altas, podría ser una estrella de tipo O!",
    "Tus instrumentos se disparan cada vez que apuntan a {STAR}. Todo indica una estrella de tipo O.",
    "Los escaneos de largo alcance detectan radiación extrema en {STAR}. Podría ser un sistema de tipo O.",
  ],
  pt: [
    "{STAR} emite sinais de energia muito elevados, pode ser uma estrela de tipo O!",
    "Os seus instrumentos disparam sempre que apontam para {STAR}. Tudo indica uma estrela de tipo O.",
    "Os scans de longo alcance detetam radiação extrema de {STAR}. Pode ser um sistema de tipo O.",
  ],
  de: [
    "{STAR} sendet sehr energiereiche Signale aus — vielleicht ein Stern vom Typ O!",
    "Deine Instrumente schlagen aus, sobald sie auf {STAR} zeigen. Alles deutet auf einen O-Stern hin.",
    "Fernscans messen extreme Strahlung von {STAR}. Das könnte ein System vom Typ O sein.",
  ],
  it: [
    "{STAR} emette segnali ad altissima energia: potrebbe essere una stella di tipo O!",
    "I tuoi strumenti impazziscono ogni volta che puntano verso {STAR}. Tutto indica una stella di tipo O.",
    "Le scansioni a lungo raggio rilevano radiazioni estreme da {STAR}. Potrebbe essere un sistema di tipo O.",
  ],
  fr: [
    "{STAR} émet des signaux de très haute énergie, ce pourrait être une étoile de type O!",
    "Vos instruments s'affolent dès qu'ils pointent vers {STAR}. Tout indique une étoile de type O.",
    "Les scans longue portée détectent un rayonnement extrême venant de {STAR}. Ce pourrait être un système de type O.",
  ],
};

export type WheelNotificationCopyKey =
  | "claimStarshipWarp"
  | "claimRocketWarp"
  | "spinClaimBefore"
  | "spinInsufficientCp";

const WHEEL_NOTIFICATION_COPY: Record<LocaleId, Record<WheelNotificationCopyKey, string>> = {
  en: {
    claimStarshipWarp: "Special Prize Claimed! Starship warped instantly to {star}.",
    claimRocketWarp: "Special Prize Claimed! {rocket} is now at {destination}.",
    spinClaimBefore: "Claim your prize before spinning again.",
    spinInsufficientCp: "Not enough CP to spin the wheel.",
  },
  es: {
    claimStarshipWarp:
      "¡Premio especial reclamado! La nave estelar se teletransportó instantáneamente a {star}.",
    claimRocketWarp: "¡Premio especial reclamado! {rocket} ya está en {destination}.",
    spinClaimBefore: "Reclama tu premio antes de girar de nuevo.",
    spinInsufficientCp: "No hay suficientes CP para girar la rueda.",
  },
  pt: {
    claimStarshipWarp:
      "Prémio especial reclamado! A nave estelar foi teletransportada instantaneamente para {star}.",
    claimRocketWarp: "Prémio especial reclamado! {rocket} está agora em {destination}.",
    spinClaimBefore: "Reclame o seu prémio antes de girar novamente.",
    spinInsufficientCp: "Não há CP suficientes para girar a roda.",
  },
  de: {
    claimStarshipWarp:
      "Sonderpreis beansprucht! Das Sternenschiff wurde sofort zu {star} teleportiert.",
    claimRocketWarp: "Sonderpreis beansprucht! {rocket} ist jetzt bei {destination}.",
    spinClaimBefore: "Beanspruche deinen Preis, bevor du erneut drehst.",
    spinInsufficientCp: "Nicht genug CP, um das Rad zu drehen.",
  },
  it: {
    claimStarshipWarp:
      "Premio speciale reclamato! L'astronave è stata teletrasportata istantaneamente verso {star}.",
    claimRocketWarp: "Premio speciale reclamato! {rocket} si trova ora a {destination}.",
    spinClaimBefore: "Reclama il tuo premio prima di girare di nuovo.",
    spinInsufficientCp: "Non abbastanza CP per girare la ruota.",
  },
  fr: {
    claimStarshipWarp:
      "Prix spécial réclamé ! Le vaisseau spatial a été téléporté instantanément vers {star}.",
    claimRocketWarp: "Prix spécial réclamé ! {rocket} se trouve maintenant à {destination}.",
    spinClaimBefore: "Réclamez votre prix avant de tourner à nouveau.",
    spinInsufficientCp: "Pas assez de PC pour tourner la roue.",
  },
};

export function casinoWheelNotificationText(
  locale: LocaleId,
  key: WheelNotificationCopyKey,
): string {
  return WHEEL_NOTIFICATION_COPY[locale][key];
}

type CasinoHistoryCopyKey =
  | "specialReady"
  | "winResult"
  | "noAward"
  | "oTypeClue"
  | "manuscriptClue"
  | "baseDestination"
  | "asteroidDestinationPrefix";

const CASINO_HISTORY_COPY: Record<LocaleId, Record<CasinoHistoryCopyKey, string>> = {
  en: {
    specialReady: "Special prize ready",
    winResult: "Win: {prize}",
    noAward: "No award: {prize}",
    oTypeClue: "O-type star clue: {star}",
    manuscriptClue: "Manuscript clue: {star}",
    baseDestination: "Base",
    asteroidDestinationPrefix: "Asteroid ",
  },
  es: {
    specialReady: "Premio especial listo",
    winResult: "Victoria: {prize}",
    noAward: "Sin premio: {prize}",
    oTypeClue: "Pista de estrella de tipo O: {star}",
    manuscriptClue: "Pista de manuscrito: {star}",
    baseDestination: "Base",
    asteroidDestinationPrefix: "Asteroide ",
  },
  pt: {
    specialReady: "Prémio especial disponível",
    winResult: "Vitória: {prize}",
    noAward: "Sem prémio: {prize}",
    oTypeClue: "Pista de estrela de tipo O: {star}",
    manuscriptClue: "Pista de manuscrito: {star}",
    baseDestination: "Base",
    asteroidDestinationPrefix: "Asteroide ",
  },
  de: {
    specialReady: "Sonderpreis bereit",
    winResult: "Gewonnen: {prize}",
    noAward: "Kein Gewinn: {prize}",
    oTypeClue: "Hinweis auf einen O-Stern: {star}",
    manuscriptClue: "Manuskript-Hinweis: {star}",
    baseDestination: "Basis",
    asteroidDestinationPrefix: "Asteroid ",
  },
  it: {
    specialReady: "Premio speciale pronto",
    winResult: "Vittoria: {prize}",
    noAward: "Nessun premio: {prize}",
    oTypeClue: "Indizio su una stella di tipo O: {star}",
    manuscriptClue: "Indizio del manoscritto: {star}",
    baseDestination: "Base",
    asteroidDestinationPrefix: "Asteroide ",
  },
  fr: {
    specialReady: "Prix spécial prêt",
    winResult: "Gain : {prize}",
    noAward: "Aucun prix : {prize}",
    oTypeClue: "Indice d’étoile de type O : {star}",
    manuscriptClue: "Indice du manuscrit : {star}",
    baseDestination: "Base",
    asteroidDestinationPrefix: "Astéroïde ",
  },
};

export function casinoHistoryText(locale: LocaleId, key: CasinoHistoryCopyKey): string {
  return CASINO_HISTORY_COPY[locale][key];
}

export function casinoOTypeClue(locale: LocaleId, index: number): string {
  const clues = O_TYPE_CLUES[locale];
  return clues[((Math.trunc(index) % clues.length) + clues.length) % clues.length]!;
}

export function casinoText(locale: LocaleId, key: keyof CasinoCopy): string {
  return COPY[locale][key];
}

export function casinoSectionHelpText(locale: LocaleId, key: CasinoSectionHelpKey): string {
  return CASINO_SECTION_HELP[locale][key];
}

export function casinoSectionHelpLabel(locale: LocaleId, section: string): string {
  return CASINO_SECTION_HELP_LABEL[locale].replace("{section}", section);
}

const CASINO_HEADER_DESCRIPTION: Readonly<Record<LocaleId, string>> = {
  en: "Here you can gamble your hard earned products for instant gratification",
  es: "Aqu\u00ed puedes apostar tus productos duramente ganados por gratificaci\u00f3n instant\u00e1nea",
  pt: "Aqui podes apostar os teus produtos arduamente conquistados por gratifica\u00e7\u00e3o instant\u00e2nea",
  de: "Hier kannst du deine hart verdienten Produkte f\u00fcr sofortige Befriedigung verspielen",
  it: "Qui puoi giocare d'azzardo i tuoi prodotti duramente guadagnati per gratificazione immediata",
  fr: "Ici tu peux jouer tes produits durement gagn\u00e9s pour une gratification instantan\u00e9e",
};

export function casinoHeaderDescription(locale: LocaleId): string {
  return CASINO_HEADER_DESCRIPTION[locale];
}

export function casinoCountNoun(locale: LocaleId, kind: "play" | "win", count: number): string {
  const singular = new Intl.PluralRules(locale).select(count) === "one";
  const key =
    kind === "play"
      ? singular
        ? "playCountOne"
        : "playCountOther"
      : singular
        ? "winCountOne"
        : "winCountOther";
  return casinoText(locale, key);
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

export function casinoVoidSeerPrizeName(locale: LocaleId, tier: 1 | 2 | 3): string {
  const key = {
    1: "voidPrizeOType",
    2: "voidPrizeManuscript",
    3: "voidPrizeAntimatter",
  } as const;
  return casinoText(locale, key[tier]);
}

type FormatCasinoQuantity = (value: number, maximumFractionDigits?: number) => string;

export function casinoSpecialName(
  locale: LocaleId,
  prize: CasinoSpecialPrize,
  formatQuantity?: FormatCasinoQuantity,
): string {
  if (prize === "special_100cp") return SPECIAL_100_CP_PRIZE[locale];
  if (prize === "special_100k_research")
    return `${formatQuantity?.(100_000) ?? "100.000"} ${COPY[locale].prizeResearch.toLocaleLowerCase(locale)}`;
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

export function casinoPrizeText(
  locale: LocaleId,
  prizeKey: string,
  materialName?: string,
  formatQuantity?: FormatCasinoQuantity,
): string {
  const cp = /^hilo_cp_(\d+)$/.exec(prizeKey);
  if (cp)
    return casinoHiloText(locale, "cpPrize").replace(
      "{amount}",
      formatQuantity?.(Number(cp[1])) ?? cp[1]!,
    );
  if (prizeKey.startsWith("special_")) {
    if (prizeKey.startsWith("special_double_"))
      return casinoHiloText(locale, "doubleMaterial").replace(
        "{material}",
        materialName ?? prizeKey.slice("special_double_".length),
      );
    if (prizeKey === "special_finish_rocket_journey") return casinoHiloText(locale, "finishRocket");
    if (prizeKey === "special_finish_starship_journey")
      return casinoHiloText(locale, "finishStarship");
    if (prizeKey === "special_telescope_finish_asteroid_search")
      return casinoHiloText(locale, "finishAsteroid");
    if (prizeKey === "special_telescope_finish_star_study")
      return casinoHiloText(locale, "finishStarStudy");
    if (prizeKey === "special_telescope_finish_void_pillage")
      return casinoHiloText(locale, "finishVoid");
    return casinoSpecialName(locale, prizeKey as CasinoSpecialPrize, formatQuantity);
  }
  if (prizeKey.includes("cash_boost")) return casinoHiloText(locale, "cashBoost");
  if (prizeKey.includes("research_boost")) return casinoHiloText(locale, "researchBoost");
  if (prizeKey === "hilo_resource_topup") return casinoHiloText(locale, "resourceTopUp");
  if (prizeKey === "hilo_compound_topup") return casinoHiloText(locale, "compoundTopUp");
  if (prizeKey === "hilo_research_flat") return casinoHiloText(locale, "researchGrant");
  if (prizeKey === "hilo_cash_flat") return casinoHiloText(locale, "cashGrant");
  if (prizeKey === "hilo_research_big_flat") return casinoHiloText(locale, "researchGrantPlus");
  if (prizeKey === "hilo_research_mega") return casinoHiloText(locale, "researchMega");
  if (prizeKey === "hilo_cash_mega") return casinoHiloText(locale, "cashMega");
  const timeWarp = /^hilo_timewarp_(\d+)_(\d+)$/.exec(prizeKey);
  if (timeWarp)
    return casinoHiloText(locale, "timeWarp").replace(
      "{multiplier}",
      formatQuantity?.(Number(timeWarp[1]), 2) ?? timeWarp[1]!,
    );
  return prizeKey.replaceAll("_", " ");
}

export const LOCALIZATION_VALIDATION_DATA = {
  CASINO_HEADER_DESCRIPTION,
  COPY,
  HILO_COPY,
  O_TYPE_CLUES,
  WHEEL_NOTIFICATION_COPY,
  CASINO_HISTORY_COPY,
} as const;
