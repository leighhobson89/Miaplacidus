import type { LocaleId } from "../content/ids";

export const TUTORIAL_MESSAGE_KEYS = [
  "title",
  "offer",
  "start",
  "noThanks",
  "skip",
  "step.collectHydrogen.title",
  "step.collectHydrogen.body",
  "step.sellHydrogen.title",
  "step.sellHydrogen.body",
  "step.sellHydrogenAction.title",
  "step.sellHydrogenAction.body",
  "step.explainCashStat.title",
  "step.explainCashStat.body",
  "step.explainTechnologyOptions.title",
  "step.explainTechnologyOptions.body",
  "step.buyHydrogenAutobuyer.title",
  "step.buyHydrogenAutobuyer.body",
  "step.buildScienceKit.title",
  "step.buildScienceKit.body",
  "step.pauseScienceKit.title",
  "step.pauseScienceKit.body",
  "step.explainResearchRate.title",
  "step.explainResearchRate.body",
  "step.resumeScienceKit.title",
  "step.resumeScienceKit.body",
  "step.inspectHydrogenStorage.title",
  "step.inspectHydrogenStorage.body",
  "step.increaseHydrogenStorage.title",
  "step.increaseHydrogenStorage.body",
  "step.exploreTechTree.title",
  "step.exploreTechTree.body",
  "step.researchKnowledgeSharing.title",
  "step.researchKnowledgeSharing.body",
  "step.visitVisualSettings.title",
  "step.visitVisualSettings.body",
  "step.visitAudioSettings.title",
  "step.visitAudioSettings.body",
  "step.readAudioSettings.title",
  "step.readAudioSettings.body",
  "step.visitMiaplaediaGetStarted.title",
  "step.visitMiaplaediaGetStarted.body",
  "step.visitMiaplaediaStory.title",
  "step.visitMiaplaediaStory.body",
  "step.visitMiaplaediaConceptsEarly.title",
  "step.visitMiaplaediaConceptsEarly.body",
  "step.visitMiaplaediaConceptsMid.title",
  "step.visitMiaplaediaConceptsMid.body",
  "step.visitMiaplaediaConceptsLate.title",
  "step.visitMiaplaediaConceptsLate.body",
  "step.completeGuidedTour.title",
  "step.completeGuidedTour.body",
  "openResources",
  "openResearch",
  "openTechTree",
  "openVisualSettings",
  "openAudioSettings",
  "openGetStarted",
  "openStory",
  "openEarlyConcepts",
  "openMidConcepts",
  "openLateConcepts",
  "continue",
  "finish",
  "stepProgress",
  "step.openThemeDropdown.title",
  "step.openThemeDropdown.body",
  "step.chooseDarkTheme.title",
  "step.chooseDarkTheme.body",
  "step.inspectScienceClub.title",
  "step.inspectScienceClub.body",
  "step.confirmHydrogenStorageUpgrade.title",
  "step.confirmHydrogenStorageUpgrade.body",
  "step.helpAutobuyerAlong.title",
  "step.helpAutobuyerAlong.body",
  "readHint",
] as const;

export type TutorialMessageKey = (typeof TUTORIAL_MESSAGE_KEYS)[number];

const messages: Readonly<Record<LocaleId, Readonly<Record<TutorialMessageKey, string>>>> = {
  en: {
    title: "Guided tutorial",
    offer:
      "Follow a few short steps through the early resource and research loop. You can skip it at any time.",
    start: "Start tutorial",
    noThanks: "No thanks",
    skip: "Skip tutorial",
    "step.collectHydrogen.title": "Collect Hydrogen",
    "step.collectHydrogen.body":
      "Use Collect until you have 50 Hydrogen. Then add an AutoBuyer to keep building your stock.",
    "step.sellHydrogen.title": "Hydrogen stock for sale",
    "step.sellHydrogen.body": "Let Hydrogen reach 300, then use Sell to exchange it for Cash.",
    "step.sellHydrogenAction.title": "Sell Hydrogen",
    "step.sellHydrogenAction.body": "Sell some Hydrogen to add Cash to your balance.",
    "step.explainCashStat.title": "Your Cash balance",
    "step.explainCashStat.body":
      "The Cash value in the run stat row shows your current balance. Selling Hydrogen adds to it.",
    "step.buyHydrogenAutobuyer.title": "Hydrogen AutoBuyer",
    "step.buyHydrogenAutobuyer.body":
      "A Hydrogen AutoBuyer adds Hydrogen over time, but its price rises after each purchase. Check its current price in Resources.",
    "step.buildScienceKit.title": "Build three Science Kits",
    "step.buildScienceKit.body":
      "In Research, buy three Science Kits. They produce Research Points over time.",
    "step.pauseScienceKit.title": "Pause a Science Kit",
    "step.pauseScienceKit.body":
      "In Research, use the Science Kit control to pause its production.",
    "step.explainResearchRate.title": "Research rate",
    "step.explainResearchRate.body":
      "The rate at the top of Research shows current Research Point production per second. A paused Science Kit adds nothing to that rate. Disabled buildings produce nothing and consume no energy.",
    "step.resumeScienceKit.title": "Resume a Science Kit",
    "step.resumeScienceKit.body":
      "Turn the Science Kit back on to restore its Research Point production.",
    "step.inspectHydrogenStorage.title": "Hydrogen storage",
    "step.inspectHydrogenStorage.body":
      "The Hydrogen readout shows your current stock and storage limit. Automatic production pauses when storage is full.",
    "step.increaseHydrogenStorage.title": "Increase storage",
    "step.increaseHydrogenStorage.body":
      "When Hydrogen storage is full, an upgrade doubles its capacity. The Hydrogen price is shown before purchase.",
    "step.exploreTechTree.title": "Explore the Tech Tree",
    "step.exploreTechTree.body":
      "The Tech Tree shows how technologies connect, along with their Research costs and prerequisites. It grows as you progress and reveal more options.",
    "step.explainTechnologyOptions.title": "Technology options",
    "step.explainTechnologyOptions.body":
      "Here you can view and select technologies to research.",
    "step.researchKnowledgeSharing.title": "Research Knowledge Sharing",
    "step.researchKnowledgeSharing.body":
      "Knowledge Sharing costs 150 Research Points. Earn enough, then research it in the Tech Tree to continue.",
    "step.visitVisualSettings.title": "Visual Options",
    "step.visitVisualSettings.body":
      "Preview the available themes in Visual Options. Keep the theme you prefer.",
    "step.visitAudioSettings.title": "Audio options",
    "step.visitAudioSettings.body":
      "Toggle Background audio to try the control. Game Options also contains sound-effect switches and volume controls.",
    "step.visitMiaplaediaGetStarted.title": "Miaplaedia: Get Started",
    "step.visitMiaplaediaGetStarted.body":
      "Get Started recaps the opening actions and introduces the next goals. The other guide sections remain available whenever you need them.",
    "step.visitMiaplaediaStory.title": "Miaplaedia: Story",
    "step.visitMiaplaediaStory.body":
      "The Story guide gives the background to this journey. You can read it now or return whenever you like.",
    "step.visitMiaplaediaConceptsEarly.title": "Early Concepts",
    "step.visitMiaplaediaConceptsEarly.body":
      "Early Concepts explains the first systems and resource loops. You can read it now or return later.",
    "step.visitMiaplaediaConceptsMid.title": "Mid Game Concepts",
    "step.visitMiaplaediaConceptsMid.body":
      "Mid Game Concepts covers systems that become useful as your colony develops.",
    "step.visitMiaplaediaConceptsLate.title": "Late Game Concepts",
    "step.visitMiaplaediaConceptsLate.body":
      "Late Game Concepts covers advanced systems for when you are ready to go further.",
    "step.completeGuidedTour.title": "Tour complete",
    "step.completeGuidedTour.body": "That's it — have fun exploring the galaxy!",
    openResources: "Open Resources",
    openResearch: "Open Research",
    openTechTree: "Open Tech Tree",
    openVisualSettings: "Open Visual Options",
    openAudioSettings: "Open Game Options",
    openGetStarted: "Open Get Started",
    openStory: "Open Story",
    openEarlyConcepts: "Open Early Concepts",
    openMidConcepts: "Open Mid Game Concepts",
    openLateConcepts: "Open Late Game Concepts",
    continue: "Continue",
    finish: "Finish tutorial",
    stepProgress: "Step {step} of {total}",
    "step.openThemeDropdown.title": "Open the theme selector",
    "step.openThemeDropdown.body": "Open the theme selector. In the next step, choose Dark.",
    "step.chooseDarkTheme.title": "Choose the Dark theme",
    "step.chooseDarkTheme.body":
      "Select Dark in Visual Options to see its palette. You can switch themes again at any time.",
    "step.inspectScienceClub.title": "Science Club",
    "step.inspectScienceClub.body":
      "Knowledge Sharing unlocks Science Clubs. Each produces 8 RP/s, with a starting price of 200 Cash.",
    "step.readAudioSettings.title": "Audio controls",
    "step.readAudioSettings.body":
      "Background audio and sound effects have separate switches and volume controls. You can adjust both later in Game Options.",
    readHint: "Take a moment to read this section before continuing.",
    "step.confirmHydrogenStorageUpgrade.title": "Storage expanded",
    "step.confirmHydrogenStorageUpgrade.body":
      "Your storage now holds twice as much Hydrogen. AutoBuyers refill it over time.",
    "step.helpAutobuyerAlong.title": "Help the AutoBuyer along",
    "step.helpAutobuyerAlong.body":
      "Use Collect to add Hydrogen manually while the AutoBuyer refills your storage.",
  },
  es: {
    title: "Tutorial guiado",
    offer:
      "Sigue unos pasos breves para conocer el ciclo inicial de recursos e investigaci\u00f3n. Puedes omitirlo en cualquier momento.",
    start: "Iniciar tutorial",
    noThanks: "No, gracias",
    skip: "Omitir tutorial",
    "step.collectHydrogen.title": "Recolecta hidr\u00f3geno",
    "step.collectHydrogen.body":
      "Usa Recolectar hasta tener 50 de hidr\u00f3geno. Despu\u00e9s, compra un comprador autom\u00e1tico para seguir acumul\u00e1ndolo.",
    "step.sellHydrogen.title": "Hidr\u00f3geno para vender",
    "step.sellHydrogen.body":
      "Deja que el hidr\u00f3geno llegue a 300 y luego usa Vender para cambiarlo por dinero.",
    "step.sellHydrogenAction.title": "Vende hidr\u00f3geno",
    "step.sellHydrogenAction.body":
      "Vende parte del hidr\u00f3geno para a\u00f1adir dinero a tu saldo.",
    "step.explainCashStat.title": "Tu saldo de dinero",
    "step.explainCashStat.body":
      "La cantidad de dinero en la fila de estad\u00edsticas de la partida muestra tu saldo actual. Vender hidr\u00f3geno lo aumenta.",
    "step.buildScienceKit.title": "Construye tres kits cient\u00edficos",
    "step.buildScienceKit.body":
      "En Investigaci\u00f3n, compra tres kits cient\u00edficos. Producen puntos de investigaci\u00f3n con el tiempo.",
    "step.exploreTechTree.title": "Explora el \u00e1rbol tecnol\u00f3gico",
    "step.exploreTechTree.body":
      "El \u00e1rbol tecnol\u00f3gico muestra c\u00f3mo se conectan las tecnolog\u00edas, junto con sus costes y requisitos de investigaci\u00f3n. Crece a medida que avanzas y descubres m\u00e1s opciones.",
    "step.explainTechnologyOptions.title": "Opciones tecnol\u00f3gicas",
    "step.explainTechnologyOptions.body":
      "Aqu\u00ed puedes consultar y seleccionar tecnolog\u00edas para investigar.",
    "step.researchKnowledgeSharing.title": "Investiga Compartir conocimientos",
    "step.researchKnowledgeSharing.body":
      "Compartir conocimientos cuesta 150 puntos de investigaci\u00f3n. Re\u00fane suficientes e investiga la tecnolog\u00eda en el \u00e1rbol tecnol\u00f3gico para continuar.",
    openResources: "Abrir Recursos",
    openResearch: "Abrir Investigaci\u00f3n",
    openTechTree: "Abrir \u00e1rbol tecnol\u00f3gico",
    "step.buyHydrogenAutobuyer.title": "AutoComprador de hidr\u00f3geno",
    "step.buyHydrogenAutobuyer.body":
      "El AutoComprador produce hidr\u00f3geno con el tiempo, pero su precio aumenta con cada compra. Abre Recursos para ver el precio.",
    "step.pauseScienceKit.title": "Pausa un kit cient\u00edfico",
    "step.pauseScienceKit.body":
      "En Investigaci\u00f3n, usa el control del kit cient\u00edfico para pausar su producci\u00f3n.",
    "step.explainResearchRate.title": "Producci\u00f3n de investigaci\u00f3n",
    "step.explainResearchRate.body":
      "La tasa en la parte superior de Investigaci\u00f3n muestra los puntos de investigaci\u00f3n que produces por segundo. Un kit pausado no contribuye a esa tasa. Las instalaciones desactivadas no producen nada ni consumen energ\u00eda.",
    "step.resumeScienceKit.title": "Reanuda un kit cient\u00edfico",
    "step.resumeScienceKit.body":
      "Vuelve a activar el kit cient\u00edfico para reanudar su producci\u00f3n de puntos de investigaci\u00f3n.",
    "step.inspectHydrogenStorage.title": "Almacenamiento de hidr\u00f3geno",
    "step.inspectHydrogenStorage.body":
      "El indicador de hidr\u00f3geno muestra tu cantidad actual y el l\u00edmite de almacenamiento. La producci\u00f3n autom\u00e1tica se pausa cuando se llena.",
    "step.increaseHydrogenStorage.title": "Aumenta el almacenamiento",
    "step.increaseHydrogenStorage.body":
      "Cuando el almacenamiento de hidr\u00f3geno est\u00e9 lleno, una mejora duplicar\u00e1 su capacidad. El precio en hidr\u00f3geno aparece antes de comprarla.",
    "step.visitVisualSettings.title": "Opciones visuales",
    "step.visitVisualSettings.body":
      "Prueba los temas disponibles en Opciones visuales. Puedes mantener el tema que prefieras.",
    "step.visitAudioSettings.title": "Opciones de audio",
    "step.visitAudioSettings.body":
      "Activa o desactiva el audio de fondo para probar el control. Opciones del juego tambi\u00e9n incluyen interruptores y controles de volumen para los efectos de sonido.",
    "step.visitMiaplaediaGetStarted.title": "Miaplaedia: Primeros pasos",
    "step.visitMiaplaediaGetStarted.body":
      "Primeros pasos repasa las acciones iniciales y presenta los siguientes objetivos. Las dem\u00e1s gu\u00edas estar\u00e1n disponibles cuando las necesites.",
    "step.visitMiaplaediaStory.title": "Miaplaedia: Historia",
    "step.visitMiaplaediaStory.body":
      "La gu\u00eda Historia ofrece el contexto de este viaje. Puedes leerla ahora o volver cuando quieras.",
    "step.visitMiaplaediaConceptsEarly.title": "Conceptos iniciales",
    "step.visitMiaplaediaConceptsEarly.body":
      "Conceptos iniciales explica los primeros sistemas y ciclos de recursos. Puedes leerlo ahora o volver m\u00e1s tarde.",
    "step.visitMiaplaediaConceptsMid.title": "Conceptos de mitad de partida",
    "step.visitMiaplaediaConceptsMid.body":
      "Conceptos de mitad de partida explica los sistemas que sirven cuando tu colonia se desarrolla.",
    "step.visitMiaplaediaConceptsLate.title": "Conceptos avanzados",
    "step.visitMiaplaediaConceptsLate.body":
      "Los conceptos avanzados te esperan cuando quieras conocer los sistemas m\u00e1s complejos.",
    "step.completeGuidedTour.title": "Recorrido completado",
    "step.completeGuidedTour.body": "Eso es todo: \u00a1divi\u00e9rtete explorando la galaxia!",
    openVisualSettings: "Abrir Opciones visuales",
    openAudioSettings: "Abrir Opciones del juego",
    openGetStarted: "Abrir Primeros pasos",
    openStory: "Abrir Historia",
    openEarlyConcepts: "Abrir Conceptos iniciales",
    openMidConcepts: "Abrir Conceptos de mitad de partida",
    openLateConcepts: "Abrir Conceptos avanzados",
    continue: "Continuar",
    finish: "Terminar tutorial",
    stepProgress: "Paso {step} de {total}",
    "step.openThemeDropdown.title": "Abrir el selector de tema",
    "step.openThemeDropdown.body": "Abre el selector de tema. En el siguiente paso, elige Oscuro.",
    "step.chooseDarkTheme.title": "Elige el tema Oscuro",
    "step.chooseDarkTheme.body":
      "Selecciona Oscuro en Opciones visuales para ver su paleta. Puedes volver a cambiar de tema cuando quieras.",
    "step.inspectScienceClub.title": "Club de Ciencia",
    "step.inspectScienceClub.body":
      "Compartir conocimientos desbloquea los Clubes de Ciencia. Cada uno produce 8 RP/s y cuesta inicialmente 200 de dinero.",
    "step.readAudioSettings.title": "Controles de audio",
    "step.readAudioSettings.body":
      "El audio de fondo y los efectos de sonido tienen interruptores y controles de volumen independientes. Puedes ajustarlos más tarde en Opciones del juego.",
    readHint: "Tómate un momento para leer esta sección antes de continuar.",
    "step.confirmHydrogenStorageUpgrade.title": "Almacenamiento ampliado",
    "step.confirmHydrogenStorageUpgrade.body":
      "El almacenamiento ahora admite el doble de hidrógeno. Los AutoCompradores lo reponen con el tiempo.",
    "step.helpAutobuyerAlong.title": "Ayuda al AutoComprador",
    "step.helpAutobuyerAlong.body":
      "Usa Recolectar para añadir hidrógeno manualmente mientras el AutoComprador repone el almacenamiento.",
  },
  pt: {
    title: "Tutorial guiado",
    offer:
      "Siga algumas etapas curtas para conhecer o ciclo inicial de recursos e pesquisa. Voc\u00ea pode pular a qualquer momento.",
    start: "Iniciar tutorial",
    noThanks: "N\u00e3o, obrigado",
    skip: "Pular tutorial",
    "step.collectHydrogen.title": "Colete hidrog\u00eanio",
    "step.collectHydrogen.body":
      "Use Coletar at\u00e9 ter 50 de hidrog\u00eanio. Depois, compre um comprador autom\u00e1tico para continuar acumulando.",
    "step.sellHydrogen.title": "Hidrog\u00eanio para venda",
    "step.sellHydrogen.body":
      "Deixe o hidrog\u00eanio chegar a 300 e depois use Vender para troc\u00e1-lo por dinheiro.",
    "step.sellHydrogenAction.title": "Venda hidrog\u00eanio",
    "step.sellHydrogenAction.body":
      "Venda parte do hidrog\u00eanio para aumentar seu saldo em dinheiro.",
    "step.explainCashStat.title": "Seu saldo em dinheiro",
    "step.explainCashStat.body":
      "O valor do dinheiro na linha de estat\u00edsticas da partida mostra seu saldo atual. Vender hidrog\u00eanio aumenta esse valor.",
    "step.buildScienceKit.title": "Construa tr\u00eas kits cient\u00edficos",
    "step.buildScienceKit.body":
      "Em Pesquisa, compre tr\u00eas kits cient\u00edficos. Eles produzem pontos de pesquisa com o tempo.",
    "step.exploreTechTree.title": "Explore a \u00e1rvore tecnol\u00f3gica",
    "step.exploreTechTree.body":
      "A \u00e1rvore tecnol\u00f3gica mostra como as tecnologias se conectam, com os respetivos custos e pr\u00e9-requisitos de pesquisa. Ela cresce \u00e0 medida que progride e revela mais op\u00e7\u00f5es.",
    "step.explainTechnologyOptions.title": "Op\u00e7\u00f5es tecnol\u00f3gicas",
    "step.explainTechnologyOptions.body":
      "Aqui pode consultar e selecionar tecnologias para pesquisar.",
    "step.researchKnowledgeSharing.title": "Pesquise Compartilhamento de conhecimento",
    "step.researchKnowledgeSharing.body":
      "Compartilhamento de conhecimento custa 150 pontos de pesquisa. Acumule o suficiente e pesquise a tecnologia na \u00e1rvore tecnol\u00f3gica para continuar.",
    openResources: "Abrir Recursos",
    openResearch: "Abrir Pesquisa",
    openTechTree: "Abrir \u00e1rvore tecnol\u00f3gica",
    "step.buyHydrogenAutobuyer.title": "AutoComprador de hidrog\u00eanio",
    "step.buyHydrogenAutobuyer.body":
      "O AutoComprador produz hidrog\u00eanio ao longo do tempo, mas o pre\u00e7o sobe a cada compra. Abra Recursos para ver o pre\u00e7o.",
    "step.pauseScienceKit.title": "Pause um kit cient\u00edfico",
    "step.pauseScienceKit.body":
      "Em Pesquisa, use o controle do kit cient\u00edfico para pausar a produ\u00e7\u00e3o.",
    "step.explainResearchRate.title": "Taxa de pesquisa",
    "step.explainResearchRate.body":
      "A taxa no topo de Pesquisa mostra os pontos de pesquisa produzidos por segundo. Um kit pausado n\u00e3o contribui para essa taxa. Estruturas desativadas n\u00e3o produzem nada nem consomem energia.",
    "step.resumeScienceKit.title": "Retome um kit cient\u00edfico",
    "step.resumeScienceKit.body":
      "Ative o kit cient\u00edfico novamente para retomar a produ\u00e7\u00e3o de pontos de pesquisa.",
    "step.inspectHydrogenStorage.title": "Armazenamento de hidrog\u00eanio",
    "step.inspectHydrogenStorage.body":
      "O indicador de hidrog\u00eanio mostra a quantidade atual e o limite de armazenamento. A produ\u00e7\u00e3o autom\u00e1tica para quando o armazenamento enche.",
    "step.increaseHydrogenStorage.title": "Aumente o armazenamento",
    "step.increaseHydrogenStorage.body":
      "Quando o armazenamento de hidrog\u00eanio estiver cheio, uma melhoria duplicar\u00e1 a capacidade. O pre\u00e7o em hidrog\u00eanio aparece antes da compra.",
    "step.visitVisualSettings.title": "Op\u00e7\u00f5es visuais",
    "step.visitVisualSettings.body":
      "Experimente os temas dispon\u00edveis em Op\u00e7\u00f5es visuais. Mantenha o tema de sua prefer\u00eancia.",
    "step.visitAudioSettings.title": "Op\u00e7\u00f5es de \u00e1udio",
    "step.visitAudioSettings.body":
      "Ative ou desative o \u00e1udio de fundo para testar o controle. Op\u00e7\u00f5es do jogo tamb\u00e9m incluem controles de efeitos sonoros e volume.",
    "step.visitMiaplaediaGetStarted.title": "Miaplaedia: Primeiros passos",
    "step.visitMiaplaediaGetStarted.body":
      "Primeiros passos relembra as a\u00e7\u00f5es iniciais e apresenta os pr\u00f3ximos objetivos. As outras guias ficam dispon\u00edveis quando precisar.",
    "step.visitMiaplaediaStory.title": "Miaplaedia: Hist\u00f3ria",
    "step.visitMiaplaediaStory.body":
      "O guia Hist\u00f3ria apresenta o contexto desta jornada. Voc\u00ea pode l\u00ea-lo agora ou voltar quando quiser.",
    "step.visitMiaplaediaConceptsEarly.title": "Conceitos iniciais",
    "step.visitMiaplaediaConceptsEarly.body":
      "Conceitos iniciais explica os primeiros sistemas e ciclos de recursos. Pode ler agora ou voltar depois.",
    "step.visitMiaplaediaConceptsMid.title": "Conceitos de meio de jogo",
    "step.visitMiaplaediaConceptsMid.body":
      "Conceitos de meio de jogo aborda sistemas que ajudam conforme a col\u00f4nia se desenvolve.",
    "step.visitMiaplaediaConceptsLate.title": "Conceitos avan\u00e7ados",
    "step.visitMiaplaediaConceptsLate.body":
      "Os Conceitos avan\u00e7ados apresentam sistemas mais complexos para quando quiseres continuar a explorar.",
    "step.completeGuidedTour.title": "Visita conclu\u00edda",
    "step.completeGuidedTour.body": "\u00c9 tudo — diverte-te a explorar a gal\u00e1xia!",
    openVisualSettings: "Abrir Op\u00e7\u00f5es visuais",
    openAudioSettings: "Abrir Op\u00e7\u00f5es do jogo",
    openGetStarted: "Abrir Primeiros passos",
    openStory: "Abrir Hist\u00f3ria",
    openEarlyConcepts: "Abrir Conceitos iniciais",
    openMidConcepts: "Abrir Conceitos de meio de jogo",
    openLateConcepts: "Abrir Conceitos avan\u00e7ados",
    continue: "Continuar",
    finish: "Concluir tutorial",
    stepProgress: "Etapa {step} de {total}",
    "step.openThemeDropdown.title": "Abrir o seletor de tema",
    "step.openThemeDropdown.body": "Abra o seletor de tema. Na próxima etapa, escolha Escuro.",
    "step.chooseDarkTheme.title": "Escolha o tema Escuro",
    "step.chooseDarkTheme.body":
      "Selecione Escuro em Opções visuais para ver a paleta. Você pode trocar de tema quando quiser.",
    "step.inspectScienceClub.title": "Clube de Ciência",
    "step.inspectScienceClub.body":
      "Compartilhamento de conhecimento desbloqueia os Clubes de Ciência. Cada um produz 8 RP/s e custa inicialmente 200 em dinheiro.",
    "step.readAudioSettings.title": "Controles de áudio",
    "step.readAudioSettings.body":
      "O áudio de fundo e os efeitos sonoros têm controles e volumes separados. Você pode ajustá-los mais tarde em Opções do jogo.",
    readHint: "Reserve um momento para ler esta seção antes de continuar.",
    "step.confirmHydrogenStorageUpgrade.title": "Armazenamento ampliado",
    "step.confirmHydrogenStorageUpgrade.body":
      "Agora o armazenamento comporta o dobro de hidrogênio. Os AutoCompradores o reabastecem com o tempo.",
    "step.helpAutobuyerAlong.title": "Ajude o AutoComprador",
    "step.helpAutobuyerAlong.body":
      "Use Coletar para adicionar hidrogênio manualmente enquanto o AutoComprador reabastece o armazenamento.",
  },
  de: {
    title: "Gef\u00fchrtes Tutorial",
    offer:
      "Lerne in wenigen Schritten den anf\u00e4nglichen Ressourcen- und Forschungsablauf kennen. Du kannst das Tutorial jederzeit \u00fcberspringen.",
    start: "Tutorial starten",
    noThanks: "Nein danke",
    skip: "Tutorial \u00fcberspringen",
    "step.collectHydrogen.title": "Wasserstoff sammeln",
    "step.collectHydrogen.body":
      "Sammle 50 Wasserstoff. Kaufe danach einen automatischen K\u00e4ufer, damit dein Vorrat weiterw\u00e4chst.",
    "step.sellHydrogen.title": "Wasserstoffvorrat zum Verkauf",
    "step.sellHydrogen.body":
      "Warte, bis du 300 Wasserstoff hast, und verkaufe ihn dann gegen Geld.",
    "step.sellHydrogenAction.title": "Wasserstoff verkaufen",
    "step.sellHydrogenAction.body":
      "Verkaufe etwas Wasserstoff, um deinen Geldbestand zu erh\u00f6hen.",
    "step.explainCashStat.title": "Dein Geldbestand",
    "step.explainCashStat.body":
      "Der Geldwert in der Lauf-Statuszeile zeigt deinen aktuellen Bestand. Durch den Verkauf von Wasserstoff steigt er.",
    "step.buildScienceKit.title": "Drei Wissenschaftssets bauen",
    "step.buildScienceKit.body":
      "Kaufe unter Forschung drei Wissenschaftssets. Sie erzeugen mit der Zeit Forschungspunkte.",
    "step.exploreTechTree.title": "Den Technologiebaum erkunden",
    "step.exploreTechTree.body":
      "Der Technologiebaum zeigt, wie Technologien zusammenh\u00e4ngen, sowie ihre Forschungskosten und Voraussetzungen. Im Spielverlauf w\u00e4chst er und enth\u00fcllt weitere Optionen.",
    "step.explainTechnologyOptions.title": "Technologieoptionen",
    "step.explainTechnologyOptions.body":
      "Hier kannst du Technologien ansehen und zur Erforschung ausw\u00e4hlen.",
    "step.researchKnowledgeSharing.title": "Wissensaustausch erforschen",
    "step.researchKnowledgeSharing.body":
      "Wissensaustausch kostet 150 Forschungspunkte. Sammle genug Punkte und erforsche die Technologie im Technologiebaum, um fortzufahren.",
    openResources: "Ressourcen \u00f6ffnen",
    openResearch: "Forschung \u00f6ffnen",
    openTechTree: "Technologiebaum \u00f6ffnen",
    "step.buyHydrogenAutobuyer.title": "Wasserstoff-AutoK\u00e4ufer",
    "step.buyHydrogenAutobuyer.body":
      "Der AutoK\u00e4ufer erzeugt mit der Zeit Wasserstoff, wird aber nach jedem Kauf teurer. \u00d6ffne Ressourcen, um den Preis zu sehen.",
    "step.pauseScienceKit.title": "Ein Wissenschaftsset pausieren",
    "step.pauseScienceKit.body":
      "Pausiere die Produktion des Wissenschaftssets mit dem Schalter unter Forschung.",
    "step.explainResearchRate.title": "Forschungsrate",
    "step.explainResearchRate.body":
      "Die Rate oben im Forschungsbereich zeigt die Forschungspunkte pro Sekunde. Ein pausiertes Wissenschaftsset tr\u00e4gt nichts dazu bei. Deaktivierte Geb\u00e4ude produzieren nichts und verbrauchen keine Energie.",
    "step.resumeScienceKit.title": "Ein Wissenschaftsset fortsetzen",
    "step.resumeScienceKit.body":
      "Schalte das Wissenschaftsset wieder ein, um seine Forschung fortzusetzen.",
    "step.inspectHydrogenStorage.title": "Wasserstofflager",
    "step.inspectHydrogenStorage.body":
      "Die Wasserstoffanzeige zeigt deinen Vorrat und die Lagergrenze. Automatische Produktion pausiert, wenn das Lager voll ist.",
    "step.increaseHydrogenStorage.title": "Lager erweitern",
    "step.increaseHydrogenStorage.body":
      "Wenn der Wasserstoffspeicher voll ist, verdoppelt ein Lager-Upgrade seine Kapazit\u00e4t. Der Wasserstoffpreis wird vor dem Kauf angezeigt.",
    "step.visitVisualSettings.title": "Visuelle Optionen",
    "step.visitVisualSettings.body":
      "Probiere die Designs unter Visuelle Optionen aus. Du kannst dein bevorzugtes Design beibehalten.",
    "step.visitAudioSettings.title": "Audiooptionen",
    "step.visitAudioSettings.body":
      "Schalte das Hintergrundaudio um, um den Schalter auszuprobieren. Unter Spieloptionen findest du außerdem Schalter und Lautst\u00e4rkeregler f\u00fcr Soundeffekte.",
    "step.visitMiaplaediaGetStarted.title": "Miaplaedia: Erste Schritte",
    "step.visitMiaplaediaGetStarted.body":
      "Erste Schritte fasst den Anfang zusammen und zeigt die n\u00e4chsten Ziele. Die anderen Ratgeber kannst du bei Bedarf jederzeit lesen.",
    "step.visitMiaplaediaStory.title": "Miaplaedia: Geschichte",
    "step.visitMiaplaediaStory.body":
      "Der Ratgeber Geschichte erklärt den Hintergrund dieser Reise. Du kannst ihn jetzt lesen oder später zurückkehren.",
    "step.visitMiaplaediaConceptsEarly.title": "Fr\u00fche Konzepte",
    "step.visitMiaplaediaConceptsEarly.body":
      "Fr\u00fche Konzepte erkl\u00e4rt die ersten Systeme und Ressourcenkreisl\u00e4ufe. Du kannst jetzt lesen oder sp\u00e4ter wiederkommen.",
    "step.visitMiaplaediaConceptsMid.title": "Konzepte f\u00fcr die Spielmitte",
    "step.visitMiaplaediaConceptsMid.body":
      "Die Konzepte f\u00fcr die Spielmitte behandeln Systeme, die mit deiner wachsenden Kolonie wichtig werden.",
    "step.visitMiaplaediaConceptsLate.title": "Sp\u00e4te Konzepte",
    "step.visitMiaplaediaConceptsLate.body":
      "Die sp\u00e4ten Konzepte behandeln fortgeschrittene Systeme f\u00fcr den weiteren Ausbau deiner Kolonie.",
    "step.completeGuidedTour.title": "Einführung abgeschlossen",
    "step.completeGuidedTour.body": "Das war's — viel Spaß beim Erkunden der Galaxie!",
    openVisualSettings: "Visuelle Optionen \u00f6ffnen",
    openAudioSettings: "Spieloptionen \u00f6ffnen",
    openGetStarted: "Erste Schritte \u00f6ffnen",
    openStory: "Geschichte \u00f6ffnen",
    openEarlyConcepts: "Fr\u00fche Konzepte \u00f6ffnen",
    openMidConcepts: "Konzepte f\u00fcr die Spielmitte \u00f6ffnen",
    openLateConcepts: "Sp\u00e4te Konzepte \u00f6ffnen",
    continue: "Weiter",
    finish: "Tutorial beenden",
    stepProgress: "Schritt {step} von {total}",
    "step.openThemeDropdown.title": "Themenauswahl öffnen",
    "step.openThemeDropdown.body": "Öffne die Themenauswahl. Wähle im nächsten Schritt Dunkel aus.",
    "step.chooseDarkTheme.title": "Dunkles Design auswählen",
    "step.chooseDarkTheme.body":
      "Wähle unter Visuelle Optionen das dunkle Design aus, um seine Farben zu sehen. Du kannst das Design jederzeit wieder wechseln.",
    "step.inspectScienceClub.title": "Wissenschaftsclub",
    "step.inspectScienceClub.body":
      "Wissensaustausch schaltet Wissenschaftsclubs frei. Jeder erzeugt 8 RP/s und kostet anfangs 200 Bargeld.",
    "step.readAudioSettings.title": "Audiosteuerung",
    "step.readAudioSettings.body":
      "Hintergrundaudio und Soundeffekte haben eigene Schalter und Lautstärkeregler. Du kannst beides später unter Spieloptionen anpassen.",
    readHint: "Nimm dir einen Moment Zeit, diesen Abschnitt vor dem Fortfahren zu lesen.",
    "step.confirmHydrogenStorageUpgrade.title": "Lager erweitert",
    "step.confirmHydrogenStorageUpgrade.body":
      "Dein Lager fasst jetzt doppelt so viel Wasserstoff. AutoKäufer füllen es mit der Zeit.",
    "step.helpAutobuyerAlong.title": "Hilf dem AutoKäufer nach",
    "step.helpAutobuyerAlong.body":
      "Mit Sammeln kannst du manuell Wasserstoff hinzufügen, während der AutoKäufer dein Lager auffüllt.",
  },
  it: {
    title: "Tutorial guidato",
    offer:
      "Segui alcuni brevi passaggi per conoscere il ciclo iniziale di risorse e ricerca. Puoi saltarlo in qualsiasi momento.",
    start: "Avvia il tutorial",
    noThanks: "No, grazie",
    skip: "Salta il tutorial",
    "step.collectHydrogen.title": "Raccogli idrogeno",
    "step.collectHydrogen.body":
      "Usa Raccogli finch\u00e9 non hai 50 unit\u00e0 di idrogeno. Poi acquista un acquirente automatico per continuare ad accumularlo.",
    "step.sellHydrogen.title": "Scorta di idrogeno per la vendita",
    "step.sellHydrogen.body":
      "Attendi di avere 300 unit\u00e0 di idrogeno, poi usa Vendi per scambiarlo con denaro.",
    "step.sellHydrogenAction.title": "Vendi idrogeno",
    "step.sellHydrogenAction.body": "Vendi un po' di idrogeno per aumentare il tuo saldo.",
    "step.explainCashStat.title": "Il tuo saldo",
    "step.explainCashStat.body":
      "Il valore del denaro nella riga delle statistiche della partita mostra il saldo attuale. Vendere idrogeno lo aumenta.",
    "step.buildScienceKit.title": "Costruisci tre kit scientifici",
    "step.buildScienceKit.body":
      "In Ricerca, acquista tre kit scientifici. Producono punti ricerca nel tempo.",
    "step.exploreTechTree.title": "Esplora l'albero tecnologico",
    "step.exploreTechTree.body":
      "L'albero tecnologico mostra i collegamenti tra le tecnologie, insieme ai costi di ricerca e ai prerequisiti. Cresce man mano che avanzi e rivela nuove opzioni.",
    "step.explainTechnologyOptions.title": "Opzioni tecnologiche",
    "step.explainTechnologyOptions.body":
      "Qui puoi consultare e selezionare le tecnologie da ricercare.",
    "step.researchKnowledgeSharing.title": "Ricerca Condivisione della conoscenza",
    "step.researchKnowledgeSharing.body":
      "Condivisione della conoscenza costa 150 punti ricerca. Accumulane abbastanza e ricerca la tecnologia nell'albero tecnologico per continuare.",
    openResources: "Apri Risorse",
    openResearch: "Apri Ricerca",
    openTechTree: "Apri albero tecnologico",
    "step.buyHydrogenAutobuyer.title": "AutoAcquirente di idrogeno",
    "step.buyHydrogenAutobuyer.body":
      "L'AutoAcquirente produce idrogeno nel tempo, ma il prezzo aumenta a ogni acquisto. Apri Risorse per controllare il costo.",
    "step.pauseScienceKit.title": "Metti in pausa un kit scientifico",
    "step.pauseScienceKit.body":
      "In Ricerca, usa il controllo del kit scientifico per sospenderne la produzione.",
    "step.explainResearchRate.title": "Tasso di ricerca",
    "step.explainResearchRate.body":
      "Il tasso in alto nella pagina Ricerca mostra i punti ricerca prodotti ogni secondo. Un kit in pausa non contribuisce al tasso. Gli edifici disattivati non producono nulla e non consumano energia.",
    "step.resumeScienceKit.title": "Riattiva un kit scientifico",
    "step.resumeScienceKit.body":
      "Riattiva il kit scientifico per riprendere la produzione di punti ricerca.",
    "step.inspectHydrogenStorage.title": "Deposito di idrogeno",
    "step.inspectHydrogenStorage.body":
      "L'indicatore dell'idrogeno mostra la scorta e il limite del deposito. La produzione automatica si ferma quando il deposito è pieno.",
    "step.increaseHydrogenStorage.title": "Aumenta il deposito",
    "step.increaseHydrogenStorage.body":
      "Quando il deposito di idrogeno è pieno, un potenziamento ne raddoppia la capacità. Il costo in idrogeno è mostrato prima dell'acquisto.",
    "step.visitVisualSettings.title": "Opzioni visive",
    "step.visitVisualSettings.body":
      "Prova i temi disponibili in Opzioni visive. Puoi mantenere quello che preferisci.",
    "step.visitAudioSettings.title": "Opzioni audio",
    "step.visitAudioSettings.body":
      "Attiva o disattiva l'audio di sottofondo per provare il comando. Nelle Opzioni di gioco trovi anche i comandi e i volumi degli effetti sonori.",
    "step.visitMiaplaediaGetStarted.title": "Miaplaedia: Per iniziare",
    "step.visitMiaplaediaGetStarted.body":
      "Per iniziare ripassa le prime azioni e presenta i prossimi obiettivi. Le altre guide restano disponibili quando ti servono.",
    "step.visitMiaplaediaStory.title": "Miaplaedia: Storia",
    "step.visitMiaplaediaStory.body":
      "La guida Storia racconta il contesto di questo viaggio. Puoi leggerla ora o tornare quando vuoi.",
    "step.visitMiaplaediaConceptsEarly.title": "Concetti iniziali",
    "step.visitMiaplaediaConceptsEarly.body":
      "I Concetti iniziali spiegano i primi sistemi e cicli di risorse. Puoi leggerli ora o tornare più tardi.",
    "step.visitMiaplaediaConceptsMid.title": "Concetti di metà gioco",
    "step.visitMiaplaediaConceptsMid.body":
      "I Concetti di metà gioco trattano sistemi utili mentre la colonia cresce.",
    "step.visitMiaplaediaConceptsLate.title": "Concetti avanzati",
    "step.visitMiaplaediaConceptsLate.body":
      "I Concetti avanzati presentano sistemi più complessi per quando vorrai proseguire.",
    "step.completeGuidedTour.title": "Visita completata",
    "step.completeGuidedTour.body": "È tutto — divertiti a esplorare la galassia!",
    openVisualSettings: "Apri Opzioni visive",
    openAudioSettings: "Apri Opzioni di gioco",
    openGetStarted: "Apri Per iniziare",
    openStory: "Apri Storia",
    openEarlyConcepts: "Apri Concetti iniziali",
    openMidConcepts: "Apri Concetti di metà gioco",
    openLateConcepts: "Apri Concetti avanzati",
    continue: "Continua",
    finish: "Termina il tutorial",
    stepProgress: "Passaggio {step} di {total}",
    "step.openThemeDropdown.title": "Apri il selettore del tema",
    "step.openThemeDropdown.body": "Apri il selettore del tema. Nel passaggio successivo, scegli Scuro.",
    "step.chooseDarkTheme.title": "Scegli il tema Scuro",
    "step.chooseDarkTheme.body":
      "Seleziona Scuro in Opzioni visive per vedere la sua tavolozza. Puoi cambiare tema in qualsiasi momento.",
    "step.inspectScienceClub.title": "Club scientifico",
    "step.inspectScienceClub.body":
      "Condivisione della conoscenza sblocca i Club scientifici. Ognuno produce 8 RP/s e costa inizialmente 200 in contanti.",
    "step.readAudioSettings.title": "Comandi audio",
    "step.readAudioSettings.body":
      "L'audio di sottofondo e gli effetti sonori hanno interruttori e volumi separati. Puoi regolarli in seguito nelle Opzioni di gioco.",
    readHint: "Dedica un momento alla lettura di questa sezione prima di continuare.",
    "step.confirmHydrogenStorageUpgrade.title": "Deposito ampliato",
    "step.confirmHydrogenStorageUpgrade.body":
      "Ora il deposito contiene il doppio dell'idrogeno. Gli AutoAcquirenti lo riempiono nel tempo.",
    "step.helpAutobuyerAlong.title": "Aiuta l'AutoAcquirente",
    "step.helpAutobuyerAlong.body":
      "Usa Raccogli per aggiungere idrogeno manualmente mentre l'AutoAcquirente riempie il deposito.",
  },
  fr: {
    title: "Tutoriel guid\u00e9",
    offer:
      "Suivez quelques \u00e9tapes pour d\u00e9couvrir le cycle initial des ressources et de la recherche. Vous pouvez l'ignorer \u00e0 tout moment.",
    start: "Commencer le tutoriel",
    noThanks: "Non merci",
    skip: "Ignorer le tutoriel",
    "step.collectHydrogen.title": "Collecter de l'hydrog\u00e8ne",
    "step.collectHydrogen.body":
      "Utilisez Collecter jusqu'\u00e0 avoir 50 unit\u00e9s d'hydrog\u00e8ne. Achetez ensuite un acheteur automatique pour continuer \u00e0 en accumuler.",
    "step.sellHydrogen.title": "Stock d'hydrog\u00e8ne \u00e0 vendre",
    "step.sellHydrogen.body":
      "Attendez d'avoir 300 unit\u00e9s d'hydrog\u00e8ne, puis utilisez Vendre pour l'\u00e9changer contre de l'argent.",
    "step.sellHydrogenAction.title": "Vendre de l'hydrog\u00e8ne",
    "step.sellHydrogenAction.body": "Vendez un peu d'hydrog\u00e8ne pour augmenter votre solde.",
    "step.explainCashStat.title": "Votre solde",
    "step.explainCashStat.body":
      "Le montant d'argent dans la rang\u00e9e de statistiques de la partie indique votre solde actuel. Vendre de l'hydrog\u00e8ne l'augmente.",
    "step.buildScienceKit.title": "Construire trois kits scientifiques",
    "step.buildScienceKit.body":
      "Dans Recherche, achetez trois kits scientifiques. Ils produisent des points de recherche au fil du temps.",
    "step.exploreTechTree.title": "Explorer l'arbre technologique",
    "step.exploreTechTree.body":
      "L'arbre technologique montre les liens entre les technologies, ainsi que leurs co\u00fbts et pr\u00e9requis de recherche. Il s'agrandit au fil de votre progression et r\u00e9v\u00e8le de nouvelles options.",
    "step.explainTechnologyOptions.title": "Options technologiques",
    "step.explainTechnologyOptions.body":
      "Vous pouvez consulter et s\u00e9lectionner ici les technologies \u00e0 rechercher.",
    "step.researchKnowledgeSharing.title": "Rechercher le Partage des connaissances",
    "step.researchKnowledgeSharing.body":
      "Le Partage des connaissances co\u00fbte 150 points de recherche. Accumulez-en assez, puis recherchez cette technologie dans l'arbre pour continuer.",
    openResources: "Ouvrir Ressources",
    openResearch: "Ouvrir Recherche",
    openTechTree: "Ouvrir l'arbre technologique",
    "step.buyHydrogenAutobuyer.title": "AutoAcheteur d'hydrogène",
    "step.buyHydrogenAutobuyer.body":
      "L'AutoAcheteur produit de l'hydrogène au fil du temps, mais son prix augmente après chaque achat. Ouvrez Ressources pour voir son prix.",
    "step.pauseScienceKit.title": "Mettre un kit scientifique en pause",
    "step.pauseScienceKit.body":
      "Dans Recherche, utilisez la commande du kit scientifique pour suspendre sa production.",
    "step.explainResearchRate.title": "Taux de recherche",
    "step.explainResearchRate.body":
      "Le taux en haut de Recherche indique les points de recherche produits par seconde. Un kit en pause n'y contribue pas. Les bâtiments désactivés ne produisent rien et ne consomment pas d'\u00e9nergie.",
    "step.resumeScienceKit.title": "Réactiver un kit scientifique",
    "step.resumeScienceKit.body":
      "Réactivez le kit scientifique pour reprendre sa production de points de recherche.",
    "step.inspectHydrogenStorage.title": "Stockage d'hydrogène",
    "step.inspectHydrogenStorage.body":
      "L'indicateur d'hydrogène affiche votre stock et la limite de stockage. La production automatique s'arrête lorsque le stockage est plein.",
    "step.increaseHydrogenStorage.title": "Augmenter le stockage",
    "step.increaseHydrogenStorage.body":
      "Quand le stockage d'hydrogène est plein, une amélioration double sa capacité. Le prix en hydrogène s'affiche avant l'achat.",
    "step.visitVisualSettings.title": "Options visuelles",
    "step.visitVisualSettings.body":
      "Essayez les thèmes disponibles dans Options visuelles. Gardez le thème de votre choix.",
    "step.visitAudioSettings.title": "Options audio",
    "step.visitAudioSettings.body":
      "Activez ou désactivez l’audio d’ambiance pour essayer la commande. Les options de jeu comprennent aussi les commandes et le volume des effets sonores.",
    "step.visitMiaplaediaGetStarted.title": "Miaplaedia : Premiers pas",
    "step.visitMiaplaediaGetStarted.body":
      "Premiers pas récapitule les actions initiales et présente les prochains objectifs. Les autres guides restent disponibles quand vous en avez besoin.",
    "step.visitMiaplaediaStory.title": "Miaplaedia : Histoire",
    "step.visitMiaplaediaStory.body":
      "Le guide Histoire présente le contexte de ce voyage. Vous pouvez le lire maintenant ou y revenir quand vous le souhaitez.",
    "step.visitMiaplaediaConceptsEarly.title": "Concepts de début de jeu",
    "step.visitMiaplaediaConceptsEarly.body":
      "Les concepts de début de jeu expliquent les premiers systèmes et cycles de ressources. Vous pouvez les lire maintenant ou plus tard.",
    "step.visitMiaplaediaConceptsMid.title": "Concepts de milieu de jeu",
    "step.visitMiaplaediaConceptsMid.body":
      "Les concepts de milieu de jeu présentent les systèmes utiles au développement de votre colonie.",
    "step.visitMiaplaediaConceptsLate.title": "Concepts de fin de jeu",
    "step.visitMiaplaediaConceptsLate.body":
      "Les concepts de fin de jeu présentent les systèmes avancés pour poursuivre votre progression.",
    "step.completeGuidedTour.title": "Visite guidée terminée",
    "step.completeGuidedTour.body": "C'est tout — amusez-vous à explorer la galaxie !",
    openVisualSettings: "Ouvrir Options visuelles",
    openAudioSettings: "Ouvrir Options de jeu",
    openGetStarted: "Ouvrir Premiers pas",
    openStory: "Ouvrir Histoire",
    openEarlyConcepts: "Ouvrir les concepts de début",
    openMidConcepts: "Ouvrir les concepts de milieu",
    openLateConcepts: "Ouvrir les concepts de fin",
    continue: "Continuer",
    finish: "Terminer le tutoriel",
    stepProgress: "\u00c9tape {step} sur {total}",
    "step.openThemeDropdown.title": "Ouvrir le sélecteur de thème",
    "step.openThemeDropdown.body": "Ouvrez le sélecteur de thème. À l’étape suivante, choisissez Sombre.",
    "step.chooseDarkTheme.title": "Choisir le th\u00e8me Sombre",
    "step.chooseDarkTheme.body":
      "S\u00e9lectionnez Sombre dans Options visuelles pour d\u00e9couvrir sa palette. Vous pourrez changer de th\u00e8me \u00e0 tout moment.",
    "step.inspectScienceClub.title": "Club scientifique",
    "step.inspectScienceClub.body":
      "Le Partage des connaissances d\u00e9bloque les clubs scientifiques. Chacun produit 8 RP/s et co\u00fbte 200 en argent au d\u00e9part.",
    "step.readAudioSettings.title": "Commandes audio",
    "step.readAudioSettings.body":
      "L’audio d’ambiance et les effets sonores ont des commandes et des volumes séparés. Vous pourrez les régler plus tard dans les options de jeu.",
    readHint: "Prenez un instant pour lire cette section avant de continuer.",
    "step.confirmHydrogenStorageUpgrade.title": "Stockage agrandi",
    "step.confirmHydrogenStorageUpgrade.body":
      "Votre stockage contient maintenant deux fois plus d'hydrogène. Les AutoAcheteurs le remplissent au fil du temps.",
    "step.helpAutobuyerAlong.title": "Aider l'AutoAcheteur",
    "step.helpAutobuyerAlong.body":
      "Utilisez Collecter pour ajouter de l'hydrogène manuellement pendant que l'AutoAcheteur remplit votre stockage.",
  },
};

export function tutorialText(locale: LocaleId, key: TutorialMessageKey): string {
  return messages[locale][key];
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
