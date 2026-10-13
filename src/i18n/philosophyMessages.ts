import type { PhilosophyId } from "../content/ids";
import type { PhilosophyAbilityId, PhilosophyRepeatableId } from "../content/philosophy";
import type { LocaleId } from "../content/ids";

export type PhilosophyUpgradeNoticeId =
  | Exclude<PhilosophyAbilityId, "rapidExpansion">
  | PhilosophyRepeatableId;

interface PhilosophyCopy {
  readonly title: string;
  readonly selectionNotifications: Readonly<Record<PhilosophyId, string>>;
  readonly intro: string;
  readonly headerDescription: string;
  readonly headerHelp: readonly string[];
  readonly choiceTitle: string;
  readonly choicePrompt: string;
  readonly ability: string;
  readonly abilityAction: string;
  readonly repeatables: string;
  readonly buy: string;
  readonly owned: string;
  readonly rank: string;
  readonly nextCost: string;
  readonly active: string;
  readonly unavailable: string;
  readonly researchShort: string;
  readonly paths: Readonly<
    Record<PhilosophyId, { readonly name: string; readonly summary: string }>
  >;
  readonly abilities: Readonly<
    Record<PhilosophyAbilityId, { readonly name: string; readonly effect: string }>
  >;
  readonly upgrades: Readonly<
    Record<PhilosophyRepeatableId, { readonly name: string; readonly effect: string }>
  >;
}

const COPY: Record<LocaleId, PhilosophyCopy> = {
  en: {
    title: "Philosophy",
    selectionNotifications: {
      constructor: "You are a CONSTRUCTOR!",
      supremacist: "You are a SUPREMACIST!",
      voidborn: "You are VOIDBORN!",
      expansionist: "You are an EXPANSIONIST!",
    },
    intro:
      "Choose a permanent path after your first star study. Its ability must be researched again each run; repeatable ranks persist.",
    headerDescription:
      "Here you can unlock special abilities for your philosophy, and research repeatable techs that improve your game.",
    headerHelp: [
      "Philosophy is an important mechanic. You choose it during your first run, and your choice cannot be changed for this save.",
      "The perks available for your chosen Philosophy are shown here below, and they are repeatable, meaning you can stack up a large bonus if you can pay the escalating cost to repeat purchase.",
      "Each Philosophy also has a powerful special ability. It is expensive and must be researched again each run; each path offers a different benefit.",
    ],
    choiceTitle: "Choose your civilization's philosophy",
    choicePrompt: "This choice is permanent for this save. Review each path before choosing.",
    ability: "Path ability",
    abilityAction: "UNLOCK",
    repeatables: "Repeatable research",
    buy: "Research",
    owned: "Active this run",
    rank: "Rank",
    nextCost: "Next cost",
    active: "Active",
    unavailable: "Not enough research points.",
    researchShort: "Research",
    paths: {
      constructor: {
        name: "Constructor",
        summary: "Expand infrastructure and reduce production costs.",
      },
      supremacist: {
        name: "Supremacist",
        summary: "Build stronger fleets and dominate through force.",
      },
      voidborn: { name: "Voidborn", summary: "Study the Void and accelerate stellar research." },
      expansionist: {
        name: "Expansionist",
        summary: "Move farther, build cheaper, and grow through conquest.",
      },
    },
    abilities: {
      spaceStorageTankResearch: {
        name: "Space Storage Tank Research:",
        effect: "ABILITY: Unlock Storage Research and base storage increases are not x2 but x5 every time.",
      },
      fleetHolograms: {
        name: "Fleet Holograms",
        effect:
          "After your first rebirth, vassalize at more than 3× enemy fleet power, regardless of traits or impression.",
      },
      voidSeers: {
        name: "Void Seers",
        effect: "Unlock Void Pillage telescope actions after your first rebirth.",
      },
      rapidExpansion: {
        name: "Rapid Expansion",
        effect: "Conquering a system gives you a chance to conquer up to three additional systems.",
      },
    },
    upgrades: {
      efficientAssembly: {
        name: "Efficient Assembly",
        effect: "Telescope and launch pad costs −1% per rank.",
      },
      laserMining: { name: "Laser Mining", effect: "Resource buyer prices −5% per rank." },
      massCompoundAssembly: {
        name: "Mass Compound Assembly",
        effect: "Compound recipe inputs −5% per rank, to a minimum of 1.",
      },
      energyDrones: {
        name: "Energy Drones",
        effect: "Energy and research building prices −5% per rank.",
      },
      hangarAutomation: { name: "Hangar Automation", effect: "Fleet prices −5% per rank." },
      syntheticPlating: {
        name: "Synthetic Plating",
        effect: "New fleet units gain +5% health per rank.",
      },
      antimatterEngineMinaturization: {
        name: "Antimatter Engine Miniaturization",
        effect: "New fleet units gain +5% speed per rank.",
      },
      laserIntensityResearch: {
        name: "Laser Intensity Research",
        effect: "New fleet units gain +5% attack per rank.",
      },
      stellarWhispers: {
        name: "Stellar Whispers",
        effect: "Initial alien impression +1 point per rank.",
      },
      stellarInsightManifold: {
        name: "Stellar Insight Manifold",
        effect: "Star-study time −1% per rank.",
      },
      asteroidDwellers: { name: "Asteroid Dwellers", effect: "Asteroid-search time −1% per rank." },
      ascendencyPhilosophy: {
        name: "Ascendency Philosophy",
        effect: "+1 Ascendency Point per rank after the first rebirth.",
      },
      spaceElevator: { name: "Space Elevator", effect: "Starship-part costs −5% per rank." },
      launchPadMassProduction: {
        name: "Launch Pad Mass Production",
        effect: "Rocket-part costs −5% per rank.",
      },
      asteroidAttractors: {
        name: "Asteroid Attractors",
        effect: "Rocket travel time −5% per rank.",
      },
      warpDrive: { name: "Warp Drive", effect: "Starship travel time −5% per rank." },
    },
  },
  es: {
    title: "Filosofía",
    selectionNotifications: {
      constructor: "¡Eres un CONSTRUCTOR!",
      supremacist: "¡Eres un SUPREMACISTA!",
      voidborn: "¡Eres NACIDO DEL VACÍO!",
      expansionist: "¡Eres un EXPANSIONISTA!",
    },
    intro:
      "Elige una senda permanente tras estudiar tu primera estrella. Debes volver a investigar su habilidad en cada partida; los rangos repetibles se conservan.",
    headerDescription:
      "Aquí puedes desbloquear habilidades especiales para tu filosofía, e investigar tecnologías repetibles que mejoran tu juego.",
    headerHelp: [
      "La Filosofía es una mecánica importante. La eliges durante tu primera partida y no puedes cambiarla en esta partida guardada.",
      "Las ventajas disponibles para tu Filosofía elegida se muestran aquí abajo, y son repetibles, lo que significa que puedes acumular un gran bono si puedes pagar el costo escalante para repetir la compra.",
      "Cada Filosofía también tiene una habilidad especial muy poderosa. Es cara y debes volver a investigarla en cada partida; cada senda ofrece un beneficio distinto.",
    ],
    choiceTitle: "Elige la filosofía de tu civilización",
    choicePrompt:
      "Esta elección será permanente en esta partida guardada. Revisa cada senda antes de elegir.",
    ability: "Habilidad de la senda",
    abilityAction: "DESBLOQUEAR",
    repeatables: "Investigación repetible",
    buy: "Investigar",
    owned: "Activa esta partida",
    rank: "Rango",
    nextCost: "Coste siguiente",
    active: "Activa",
    unavailable: "No tienes suficientes puntos de investigación.",
    researchShort: "de Investigación",
    paths: {
      constructor: {
        name: "Constructora",
        summary: "Amplía la infraestructura y reduce los costes de producción.",
      },
      supremacist: {
        name: "Supremacista",
        summary: "Construye flotas más fuertes y domina por la fuerza.",
      },
      voidborn: {
        name: "Nacida del Vacío",
        summary: "Estudia el Vacío y acelera la investigación estelar.",
      },
      expansionist: {
        name: "Expansionista",
        summary: "Viaja más lejos, construye más barato y crece mediante conquistas.",
      },
    },
    abilities: {
      spaceStorageTankResearch: {
        name: "Investigación de Tanques de Almacenamiento Espacial:",
        effect:
          "HABILIDAD: Desbloquea Investigación de Almacenamiento y los aumentos de almacenamiento base no son x2 sino x5 cada vez.",
      },
      fleetHolograms: {
        name: "Hologramas de flota",
        effect:
          "Tras el primer renacimiento, puedes vasallizar con más de 3× la fuerza enemiga, sin importar rasgos ni impresión.",
      },
      voidSeers: {
        name: "Videntes del Vacío",
        effect: "Desbloquea el saqueo del Vacío con el telescopio tras el primer renacimiento.",
      },
      rapidExpansion: {
        name: "Expansión rápida",
        effect: "Al conquistar un sistema, tienes la posibilidad de conquistar hasta tres sistemas adicionales.",
      },
    },
    upgrades: {
      efficientAssembly: {
        name: "Montaje eficiente",
        effect: "Costes de telescopio y plataforma de lanzamiento −1% por rango.",
      },
      laserMining: {
        name: "Minería láser",
        effect: "Precios de compradores de recursos −5% por rango.",
      },
      massCompoundAssembly: {
        name: "Montaje masivo de compuestos",
        effect: "Ingredientes de recetas −5% por rango, hasta un mínimo de 1.",
      },
      energyDrones: {
        name: "Drones de energía",
        effect: "Costes de edificios de energía e investigación −5% por rango.",
      },
      hangarAutomation: {
        name: "Automatización de hangares",
        effect: "Precios de flota −5% por rango.",
      },
      syntheticPlating: {
        name: "Blindaje sintético",
        effect: "Las nuevas unidades ganan +5% de salud por rango.",
      },
      antimatterEngineMinaturization: {
        name: "Miniaturización de motores de antimateria",
        effect: "Las nuevas unidades ganan +5% de velocidad por rango.",
      },
      laserIntensityResearch: {
        name: "Investigación de intensidad láser",
        effect: "Las nuevas unidades ganan +5% de ataque por rango.",
      },
      stellarWhispers: {
        name: "Susurros estelares",
        effect: "Impresión alienígena inicial +1 punto por rango.",
      },
      stellarInsightManifold: {
        name: "Manifold de conocimiento estelar",
        effect: "Tiempo de estudio estelar −1% por rango.",
      },
      asteroidDwellers: {
        name: "Habitantes de asteroides",
        effect: "Tiempo de búsqueda de asteroides −1% por rango.",
      },
      ascendencyPhilosophy: {
        name: "Filosofía de Ascendencia",
        effect: "+1 Punto de Ascendencia por rango tras el primer renacimiento.",
      },
      spaceElevator: {
        name: "Ascensor espacial",
        effect: "Costes de piezas de nave −5% por rango.",
      },
      launchPadMassProduction: {
        name: "Producción masiva en plataforma",
        effect: "Costes de piezas de cohete −5% por rango.",
      },
      asteroidAttractors: {
        name: "Atrayentes de asteroides",
        effect: "Tiempo de viaje de cohetes −5% por rango.",
      },
      warpDrive: {
        name: "Motor de curvatura",
        effect: "Tiempo de viaje de la nave −5% por rango.",
      },
    },
  },
  pt: {
    title: "Filosofia",
    selectionNotifications: {
      constructor: "És um CONSTRUTOR!",
      supremacist: "És um SUPREMACISTA!",
      voidborn: "És NASCIDO DO VAZIO!",
      expansionist: "És um EXPANSIONISTA!",
    },
    intro:
      "Escolhe um caminho permanente após estudar a primeira estrela. A habilidade tem de ser pesquisada novamente em cada partida; os níveis repetíveis mantêm-se.",
    headerDescription:
      "Aqui podes desbloquear habilidades especiais para a tua filosofia, e investigar tecnologias repetíveis que melhoram o teu jogo.",
    headerHelp: [
      "A Filosofia é uma mecânica importante. Escolhe-a durante a tua primeira partida; a escolha não pode ser alterada nesta gravação.",
      "As vantagens disponíveis para sua Filosofia escolhida são mostradas aqui abaixo e podem ser repetidas, o que significa que você pode acumular um grande bônus se conseguir pagar o custo crescente para repetir a compra.",
      "Cada Filosofia também tem uma habilidade especial poderosa. É cara e tem de ser pesquisada de novo em cada partida; cada caminho oferece um benefício diferente.",
    ],
    choiceTitle: "Escolhe a filosofia da tua civilização",
    choicePrompt:
      "Esta escolha é permanente nesta gravação. Analisa cada caminho antes de escolher.",
    ability: "Habilidade do caminho",
    abilityAction: "DESBLOQUEAR",
    repeatables: "Investigação repetível",
    buy: "Investigar",
    owned: "Ativa nesta partida",
    rank: "Nível",
    nextCost: "Próximo custo",
    active: "Ativa",
    unavailable: "Não tens pontos de investigação suficientes.",
    researchShort: "de Investigação",
    paths: {
      constructor: {
        name: "Construtora",
        summary: "Expande a infraestrutura e reduz os custos de produção.",
      },
      supremacist: {
        name: "Supremacista",
        summary: "Constrói frotas mais fortes e domina pela força.",
      },
      voidborn: {
        name: "Nascida do Vazio",
        summary: "Estuda o Vazio e acelera a investigação estelar.",
      },
      expansionist: {
        name: "Expansionista",
        summary: "Viaja mais longe, constrói por menos e cresce através de conquistas.",
      },
    },
    abilities: {
      spaceStorageTankResearch: {
        name: "Investigação de Tanques de Armazenamento Espacial:",
        effect: "HABILIDADE: Desbloqueie Pesquisa de Armazenamento e os aumentos de armazenamento base não serão x2, mas x5 a cada vez.",
      },
      fleetHolograms: {
        name: "Hologramas de frota",
        effect:
          "Após o primeiro renascimento, podes vassalizar com mais de 3× a força inimiga, sem depender de traços ou impressão.",
      },
      voidSeers: {
        name: "Videntes do Vazio",
        effect: "Desbloqueia o saque do Vazio pelo telescópio após o primeiro renascimento.",
      },
      rapidExpansion: {
        name: "Expansão rápida",
        effect: "Ao conquistares um sistema, tens a possibilidade de conquistar até três sistemas adicionais.",
      },
    },
    upgrades: {
      efficientAssembly: {
        name: "Montagem eficiente",
        effect: "Custos do telescópio e da plataforma de lançamento −1% por nível.",
      },
      laserMining: {
        name: "Mineração a laser",
        effect: "Preços dos compradores de recursos −5% por nível.",
      },
      massCompoundAssembly: {
        name: "Montagem em massa de compostos",
        effect: "Ingredientes das receitas −5% por nível, até ao mínimo de 1.",
      },
      energyDrones: {
        name: "Drones de energia",
        effect: "Custos dos edifícios de energia e investigação −5% por nível.",
      },
      hangarAutomation: { name: "Automação do hangar", effect: "Preços das frotas −5% por nível." },
      syntheticPlating: {
        name: "Blindagem sintética",
        effect: "Novas unidades ganham +5% de vida por nível.",
      },
      antimatterEngineMinaturization: {
        name: "Miniaturização dos motores de antimatéria",
        effect: "Novas unidades ganham +5% de velocidade por nível.",
      },
      laserIntensityResearch: {
        name: "Investigação da intensidade laser",
        effect: "Novas unidades ganham +5% de ataque por nível.",
      },
      stellarWhispers: {
        name: "Sussurros estelares",
        effect: "Impressão alienígena inicial +1 ponto por nível.",
      },
      stellarInsightManifold: {
        name: "Manifold de conhecimento estelar",
        effect: "Tempo de estudo estelar −1% por nível.",
      },
      asteroidDwellers: {
        name: "Habitantes de asteroides",
        effect: "Tempo de busca de asteroides −1% por nível.",
      },
      ascendencyPhilosophy: {
        name: "Filosofia da Ascendência",
        effect: "+1 Ponto de Ascendência por nível após o primeiro renascimento.",
      },
      spaceElevator: {
        name: "Elevador espacial",
        effect: "Custos das peças da nave −5% por nível.",
      },
      launchPadMassProduction: {
        name: "Produção em massa na plataforma",
        effect: "Custos das peças dos foguetões −5% por nível.",
      },
      asteroidAttractors: {
        name: "Atratores de asteroides",
        effect: "Tempo de viagem dos foguetões −5% por nível.",
      },
      warpDrive: { name: "Motor de dobra", effect: "Tempo de viagem da nave −5% por nível." },
    },
  },
  de: {
    title: "Philosophie",
    selectionNotifications: {
      constructor: "Du bist ein KONSTRUKTEUR!",
      supremacist: "Du bist ein SUPREMATIST!",
      voidborn: "Du bist LEERENGEBOREN!",
      expansionist: "Du bist ein EXPANSIONIST!",
    },
    intro:
      "Wähle nach der ersten Sternenstudie einen dauerhaften Pfad. Die Fähigkeit muss in jedem Durchlauf neu erforscht werden; wiederholbare Ränge bleiben erhalten.",
    headerDescription:
      "Hier kannst du spezielle Fähigkeiten für deine Philosophie freischalten, und wiederholbare Technologien erforschen, die dein Spiel verbessern.",
    headerHelp: [
      "Die Philosophie ist eine wichtige Spielmechanik. Du wählst sie in deinem ersten Durchlauf; für diesen Spielstand kann sie nicht geändert werden.",
      "Die Vorteile für deine gewählte Philosophie werden hier unten angezeigt, und sie sind wiederholbar, was bedeutet, dass du einen großen Bonus aufbauen kannst, wenn du die eskalierenden Kosten für den Wiederkauf bezahlen kannst.",
      "Jede Philosophie hat außerdem eine mächtige Spezialfähigkeit. Sie ist teuer und muss in jedem Durchlauf erneut erforscht werden; jeder Pfad bietet einen anderen Vorteil.",
    ],
    choiceTitle: "Wähle die Philosophie deiner Zivilisation",
    choicePrompt:
      "Diese Wahl bleibt für diesen Spielstand dauerhaft. Sieh dir jeden Pfad vor der Wahl an.",
    ability: "Pfadfähigkeit",
    abilityAction: "FREISCHALTEN",
    repeatables: "Wiederholbare Forschung",
    buy: "Erforschen",
    owned: "In diesem Durchlauf aktiv",
    rank: "Rang",
    nextCost: "Nächste Kosten",
    active: "Aktiv",
    unavailable: "Nicht genügend Forschungspunkte.",
    researchShort: "Forschung",
    paths: {
      constructor: {
        name: "Konstrukteur",
        summary: "Baue Infrastruktur aus und senke Produktionskosten.",
      },
      supremacist: {
        name: "Suprematist",
        summary: "Baue stärkere Flotten und herrsche mit Gewalt.",
      },
      voidborn: {
        name: "Leerengeboren",
        summary: "Erforsche die Leere und beschleunige Sternenforschung.",
      },
      expansionist: {
        name: "Expansionist",
        summary: "Reise weiter, baue günstiger und wachse durch Eroberungen.",
      },
    },
    abilities: {
      spaceStorageTankResearch: {
        name: "Forschung an Weltraumtanks:",
        effect: "FÄHIGKEIT: Schalte Lagermöglichkeiten-Forschung frei und Basislagererhöhungen sind nicht x2 sondern x5 jedes Mal.",
      },
      fleetHolograms: {
        name: "Flottenhologramme",
        effect:
          "Nach der ersten Wiedergeburt kannst du bei mehr als dreifacher feindlicher Flottenstärke unabhängig von Merkmalen oder Eindruck Vasallisieren.",
      },
      voidSeers: {
        name: "Leerseher",
        effect: "Schaltet nach der ersten Wiedergeburt die Leerenausplünderung am Teleskop frei.",
      },
      rapidExpansion: {
        name: "Rasche Expansion",
        effect: "Wenn du ein System eroberst, besteht die Chance, bis zu drei weitere Systeme zu erobern.",
      },
    },
    upgrades: {
      efficientAssembly: {
        name: "Effiziente Montage",
        effect: "Teleskop- und Startplattformkosten −1 % je Rang.",
      },
      laserMining: { name: "Laserabbau", effect: "Preise für Ressourcenkäufer −5 % je Rang." },
      massCompoundAssembly: {
        name: "Massenmontage von Verbindungen",
        effect: "Rezeptzutaten −5 % je Rang, mindestens 1.",
      },
      energyDrones: {
        name: "Energiedrohnen",
        effect: "Kosten für Energie- und Forschungsgebäude −5 % je Rang.",
      },
      hangarAutomation: { name: "Hangarautomatisierung", effect: "Flottenpreise −5 % je Rang." },
      syntheticPlating: {
        name: "Synthetische Panzerung",
        effect: "Neue Flotteneinheiten erhalten +5 % Gesundheit je Rang.",
      },
      antimatterEngineMinaturization: {
        name: "Miniaturisierung von Antimaterieantrieben",
        effect: "Neue Flotteneinheiten erhalten +5 % Geschwindigkeit je Rang.",
      },
      laserIntensityResearch: {
        name: "Forschung zur Laserintensität",
        effect: "Neue Flotteneinheiten erhalten +5 % Angriff je Rang.",
      },
      stellarWhispers: {
        name: "Sternenflüstern",
        effect: "Anfänglicher Eindruck bei Außerirdischen +1 je Rang.",
      },
      stellarInsightManifold: {
        name: "Sternenwissensmanifold",
        effect: "Dauer der Sternenstudie −1 % je Rang.",
      },
      asteroidDwellers: {
        name: "Asteroidenbewohner",
        effect: "Dauer der Asteroidensuche −1 % je Rang.",
      },
      ascendencyPhilosophy: {
        name: "Aszendenzphilosophie",
        effect: "+1 Aszendenzpunkt je Rang nach der ersten Wiedergeburt.",
      },
      spaceElevator: { name: "Weltraumaufzug", effect: "Kosten für Raumschiffteile −5 % je Rang." },
      launchPadMassProduction: {
        name: "Massenproduktion an der Startrampe",
        effect: "Kosten für Raketenteile −5 % je Rang.",
      },
      asteroidAttractors: {
        name: "Asteroiden-Anziehung",
        effect: "Raketenreisezeit −5 % je Rang.",
      },
      warpDrive: { name: "Warpantrieb", effect: "Raumschiffreisezeit −5 % je Rang." },
    },
  },
  it: {
    title: "Filosofia",
    selectionNotifications: {
      constructor: "Sei un COSTRUTTORE!",
      supremacist: "Sei un SUPREMATISTA!",
      voidborn: "Sei NATO DAL VUOTO!",
      expansionist: "Sei un ESPANSIONISTA!",
    },
    intro:
      "Scegli un percorso permanente dopo il primo studio stellare. L'abilità va ricercata di nuovo a ogni partita; i livelli ripetibili restano.",
    headerDescription:
      "Qui puoi sbloccare abilità speciali per la tua filosofia, e ricercare tecnologie ripetibili che migliorano il tuo gioco.",
    headerHelp: [
      "La Filosofia è una meccanica importante. La scegli durante la prima partita e non puoi cambiarla in questo salvataggio.",
      "I vantaggi disponibili per la tua Filosofia scelta sono mostrati qui sotto, e sono ripetibili, il che significa che puoi accumulare un grande bonus se puoi pagare il costo crescente per ripetere l'acquisto.",
      "Ogni Filosofia offre anche una potente abilità speciale. È costosa e va ricercata di nuovo in ogni partita; ogni percorso offre un vantaggio diverso.",
    ],
    choiceTitle: "Scegli la filosofia della tua civiltà",
    choicePrompt:
      "La scelta è permanente per questo salvataggio. Esamina ogni percorso prima di decidere.",
    ability: "Abilità del percorso",
    abilityAction: "SBLOCCA",
    repeatables: "Ricerca ripetibile",
    buy: "Ricerca",
    owned: "Attiva in questa partita",
    rank: "Livello",
    nextCost: "Costo successivo",
    active: "Attiva",
    unavailable: "Punti ricerca insufficienti.",
    researchShort: "di Ricerca",
    paths: {
      constructor: {
        name: "Costruttrice",
        summary: "Espande le infrastrutture e riduce i costi di produzione.",
      },
      supremacist: {
        name: "Suprematista",
        summary: "Crea flotte più forti e domina con la forza.",
      },
      voidborn: {
        name: "Nata dal Vuoto",
        summary: "Studia il Vuoto e accelera la ricerca stellare.",
      },
      expansionist: {
        name: "Espansionista",
        summary: "Viaggia più lontano, costruisce a minor costo e cresce con le conquiste.",
      },
    },
    abilities: {
      spaceStorageTankResearch: {
        name: "Ricerca sui Serbatoi Spaziali:",
        effect:
          "ABILITÀ: Sblocca Ricerca di Archiviazione e gli aumenti di archiviazione base non sono x2 ma x5 ogni volta.",
      },
      fleetHolograms: {
        name: "Ologrammi della flotta",
        effect:
          "Dopo la prima rinascita, puoi vassallizzare con oltre 3× la forza nemica, indipendentemente da tratti o impressione.",
      },
      voidSeers: {
        name: "Veggenza del Vuoto",
        effect: "Sblocca il saccheggio del Vuoto dal telescopio dopo la prima rinascita.",
      },
      rapidExpansion: {
        name: "Espansione rapida",
        effect: "Quando conquisti un sistema, hai la possibilità di conquistarne fino a tre aggiuntivi.",
      },
    },
    upgrades: {
      efficientAssembly: {
        name: "Assemblaggio efficiente",
        effect: "Costi di telescopio e piattaforma di lancio −1% per livello.",
      },
      laserMining: {
        name: "Estrazione laser",
        effect: "Prezzi degli acquirenti di risorse −5% per livello.",
      },
      massCompoundAssembly: {
        name: "Assemblaggio massivo di composti",
        effect: "Ingredienti delle ricette −5% per livello, fino a un minimo di 1.",
      },
      energyDrones: {
        name: "Droni energetici",
        effect: "Costi degli edifici energetici e di ricerca −5% per livello.",
      },
      hangarAutomation: {
        name: "Automazione dell'hangar",
        effect: "Prezzi delle flotte −5% per livello.",
      },
      syntheticPlating: {
        name: "Corazza sintetica",
        effect: "Le nuove unità ottengono +5% salute per livello.",
      },
      antimatterEngineMinaturization: {
        name: "Miniaturizzazione dei motori ad antimateria",
        effect: "Le nuove unità ottengono +5% velocità per livello.",
      },
      laserIntensityResearch: {
        name: "Ricerca sull'intensità laser",
        effect: "Le nuove unità ottengono +5% attacco per livello.",
      },
      stellarWhispers: {
        name: "Sussurri stellari",
        effect: "Impressione aliena iniziale +1 punto per livello.",
      },
      stellarInsightManifold: {
        name: "Manifold di conoscenza stellare",
        effect: "Tempo di studio stellare −1% per livello.",
      },
      asteroidDwellers: {
        name: "Abitanti degli asteroidi",
        effect: "Tempo di ricerca degli asteroidi −1% per livello.",
      },
      ascendencyPhilosophy: {
        name: "Filosofia dell'Ascendenza",
        effect: "+1 Punto Ascendenza per livello dopo la prima rinascita.",
      },
      spaceElevator: {
        name: "Ascensore spaziale",
        effect: "Costi dei componenti dell'astronave −5% per livello.",
      },
      launchPadMassProduction: {
        name: "Produzione di massa alla rampa",
        effect: "Costi dei componenti dei razzi −5% per livello.",
      },
      asteroidAttractors: {
        name: "Attrattori di asteroidi",
        effect: "Tempo di viaggio dei razzi −5% per livello.",
      },
      warpDrive: {
        name: "Motore a curvatura",
        effect: "Tempo di viaggio dell'astronave −5% per livello.",
      },
    },
  },
  fr: {
    title: "Philosophie",
    selectionNotifications: {
      constructor: "Vous êtes un CONSTRUCTEUR!",
      supremacist: "Vous êtes un SUPRÉMACISTE!",
      voidborn: "Vous êtes NÉ DU VIDE!",
      expansionist: "Vous êtes un EXPANSIONNISTE!",
    },
    intro:
      "Choisissez une voie permanente après votre première étude stellaire. Sa capacité doit être recherchée à nouveau à chaque partie ; les rangs répétables sont conservés.",
    headerDescription:
      "Ici tu peux débloquer des capacités spéciales pour ta philosophie, et rechercher des technologies répétables qui améliorent ton jeu.",
    headerHelp: [
      "La Philosophie est une mécanique importante. Tu la choisis pendant ta première partie et tu ne peux pas la modifier pour cette sauvegarde.",
      "Les avantages disponibles pour ta Philosophie choisie sont affichés ici ci-dessous, et ils sont répétables, ce qui signifie que tu peux accumuler un grand bonus si tu peux payer le coût croissant pour racheter.",
      "Chaque Philosophie possède aussi une puissante capacité spéciale. Elle est coûteuse et doit être recherchée à nouveau à chaque partie ; chaque voie offre un avantage différent.",
    ],
    choiceTitle: "Choisissez la philosophie de votre civilisation",
    choicePrompt:
      "Ce choix est permanent pour cette sauvegarde. Examinez chaque voie avant de choisir.",
    ability: "Capacité de la voie",
    abilityAction: "DÉBLOQUER",
    repeatables: "Recherche répétable",
    buy: "Rechercher",
    owned: "Active pendant cette partie",
    rank: "Rang",
    nextCost: "Coût suivant",
    active: "Active",
    unavailable: "Points de recherche insuffisants.",
    researchShort: "de Recherche",
    paths: {
      constructor: {
        name: "Constructrice",
        summary: "Développez les infrastructures et réduisez les coûts de production.",
      },
      supremacist: {
        name: "Suprémaciste",
        summary: "Constituez des flottes plus puissantes et dominez par la force.",
      },
      voidborn: {
        name: "Née du Vide",
        summary: "Étudiez le Vide et accélérez la recherche stellaire.",
      },
      expansionist: {
        name: "Expansionniste",
        summary: "Voyagez plus loin, construisez à moindre coût et progressez par la conquête.",
      },
    },
    abilities: {
      spaceStorageTankResearch: {
        name: "Recherche sur les Réservoirs Spatiaux:",
        effect:
          "CAPACITÉ: Débloque la Recherche de Stockage et les augmentations de stockage de base ne sont pas x2 mais x5 à chaque fois.",
      },
      fleetHolograms: {
        name: "Hologrammes de flotte",
        effect:
          "Après la première renaissance, vassalisez avec plus de 3× la puissance ennemie, quels que soient les traits ou l'impression.",
      },
      voidSeers: {
        name: "Voyants du Vide",
        effect: "Débloque le pillage du Vide au télescope après la première renaissance.",
      },
      rapidExpansion: {
        name: "Expansion rapide",
        effect: "Lorsque vous conquérez un système, vous avez une chance d'en conquérir jusqu'à trois autres.",
      },
    },
    upgrades: {
      efficientAssembly: {
        name: "Assemblage efficace",
        effect: "Coûts du télescope et de la rampe de lancement −1 % par rang.",
      },
      laserMining: {
        name: "Extraction laser",
        effect: "Prix des acheteurs de ressources −5 % par rang.",
      },
      massCompoundAssembly: {
        name: "Assemblage massif de composés",
        effect: "Ingrédients des recettes −5 % par rang, avec un minimum de 1.",
      },
      energyDrones: {
        name: "Drones énergétiques",
        effect: "Coûts des bâtiments d'énergie et de recherche −5 % par rang.",
      },
      hangarAutomation: {
        name: "Automatisation du hangar",
        effect: "Prix des flottes −5 % par rang.",
      },
      syntheticPlating: {
        name: "Blindage synthétique",
        effect: "Les nouvelles unités de flotte gagnent +5 % de santé par rang.",
      },
      antimatterEngineMinaturization: {
        name: "Miniaturisation des moteurs à antimatière",
        effect: "Les nouvelles unités de flotte gagnent +5 % de vitesse par rang.",
      },
      laserIntensityResearch: {
        name: "Recherche sur l'intensité laser",
        effect: "Les nouvelles unités de flotte gagnent +5 % d'attaque par rang.",
      },
      stellarWhispers: {
        name: "Murmures stellaires",
        effect: "Impression extraterrestre initiale +1 point par rang.",
      },
      stellarInsightManifold: {
        name: "Manifold de connaissance stellaire",
        effect: "Durée d'étude stellaire −1 % par rang.",
      },
      asteroidDwellers: {
        name: "Habitants des astéroïdes",
        effect: "Durée de recherche d'astéroïdes −1 % par rang.",
      },
      ascendencyPhilosophy: {
        name: "Philosophie de l'Ascendance",
        effect: "+1 point d'Ascendance par rang après la première renaissance.",
      },
      spaceElevator: {
        name: "Ascenseur spatial",
        effect: "Coûts des pièces du vaisseau −5 % par rang.",
      },
      launchPadMassProduction: {
        name: "Production de masse sur la rampe",
        effect: "Coûts des pièces de fusée −5 % par rang.",
      },
      asteroidAttractors: {
        name: "Attracteurs d'astéroïdes",
        effect: "Temps de trajet des fusées −5 % par rang.",
      },
      warpDrive: {
        name: "Propulsion supraluminique",
        effect: "Temps de trajet du vaisseau −5 % par rang.",
      },
    },
  },
};

const RAPID_EXPANSION_ACTIVATED_COPY: Record<LocaleId, string> = {
  en: "ABILITY: You now have a chance of capturing up to 3 nearby Systems for every 1!",
  es: "HABILIDAD: ¡Ahora tienes la oportunidad de capturar hasta 3 sistemas cercanos por cada 1!",
  pt: "HABILIDADE: Agora tens a possibilidade de capturar até 3 sistemas próximos por cada 1!",
  de: "FÄHIGKEIT: Du hast jetzt die Chance, pro System bis zu 3 nahegelegene Systeme zu erobern!",
  it: "ABILITÀ: Ora hai la possibilità di conquistare fino a 3 sistemi vicini per ognuno!",
  fr: "CAPACITÉ: Vous avez désormais une chance de capturer jusqu'à 3 systèmes proches pour chaque système!",
};

const PHILOSOPHY_UPGRADE_NOTICE_COPY: Record<
  LocaleId,
  Record<PhilosophyUpgradeNoticeId, string>
> = {
  en: {
    spaceStorageTankResearch: "ABILITY: Base storage expansion multiplier now 5x instead of 2x!",
    fleetHolograms:
      "ABILITY: You can now always Vassalize enemies provided your fleet is 3x larger than theirs!",
    voidSeers: "ABILITY: Space Telescope can now scan for instant Resources and Compounds!",
    efficientAssembly: "Space Building costs reduced by 1%!",
    laserMining: "Resources AutoBuyers 5% cheaper!",
    massCompoundAssembly: "Compounds recipes cheaper by 5%!",
    energyDrones: "Energy and Research Buildings 5% cheaper!",
    hangarAutomation: "Fleet build costs reduced by 5%!",
    syntheticPlating: "Fleet Armor increased by 5%!",
    antimatterEngineMinaturization: "Fleet Speed increased by 5%!",
    laserIntensityResearch: "Fleet Attack Power increased by 5%! (Applicable to Newly Built Ships)",
    stellarWhispers: "Initial Impression of enemies improved by 1%!",
    stellarInsightManifold: "Star Study speed increased by 1%!",
    asteroidDwellers: "Asteroid Search speed increased by 1%!",
    ascendencyPhilosophy: "Base Ascendency Point gain +1!",
    spaceElevator: "Starship Parts cost reduced by 5%!",
    launchPadMassProduction: "Rocket Parts cost reduced by 5%!",
    asteroidAttractors: "Rocket Travel time reduced by 5%!",
    warpDrive: "Starship Travel time reduced by 5%!",
  },
  es: {
    spaceStorageTankResearch:
      "HABILIDAD: ¡El multiplicador base de ampliación de almacenamiento ahora es 5x en vez de 2x!",
    fleetHolograms:
      "HABILIDAD: ¡Ahora siempre puedes vasallizar enemigos si tu flota es 3 veces mayor que la suya!",
    voidSeers:
      "HABILIDAD: ¡El Telescopio Espacial ya puede buscar recursos y compuestos instantáneos!",
    efficientAssembly: "¡Los costes de construcción espacial se reducen un 1%!",
    laserMining: "¡Los autocompradores de recursos son un 5% más baratos!",
    massCompoundAssembly: "¡Las recetas de compuestos son un 5% más baratas!",
    energyDrones: "¡Los edificios de energía e investigación son un 5% más baratos!",
    hangarAutomation: "¡Los costes de construcción de flota se reducen un 5%!",
    syntheticPlating: "¡El blindaje de la flota aumenta un 5%!",
    antimatterEngineMinaturization: "¡La velocidad de la flota aumenta un 5%!",
    laserIntensityResearch:
      "¡El poder de ataque de la flota aumenta un 5%! (Aplicable a las naves recién construidas)",
    stellarWhispers: "¡La impresión inicial de los enemigos mejora un 1%!",
    stellarInsightManifold: "¡La velocidad de estudio estelar aumenta un 1%!",
    asteroidDwellers: "¡La velocidad de búsqueda de asteroides aumenta un 1%!",
    ascendencyPhilosophy: "¡Ganancia base de Puntos de Ascendencia +1!",
    spaceElevator: "¡El coste de las piezas de nave estelar se reduce un 5%!",
    launchPadMassProduction: "¡El coste de las piezas de cohete se reduce un 5%!",
    asteroidAttractors: "¡El tiempo de viaje de los cohetes se reduce un 5%!",
    warpDrive: "¡El tiempo de viaje de la nave estelar se reduce un 5%!",
  },
  pt: {
    spaceStorageTankResearch:
      "HABILIDADE: O multiplicador base de expansão do armazenamento é agora 5x em vez de 2x!",
    fleetHolograms:
      "HABILIDADE: Agora podes sempre vassalizar inimigos se a tua frota for 3 vezes maior do que a deles!",
    voidSeers:
      "HABILIDADE: O Telescópio Espacial pode agora procurar instantaneamente recursos e compostos!",
    efficientAssembly: "Os custos de construção espacial são reduzidos em 1%!",
    laserMining: "Os autocompradores de recursos são 5% mais baratos!",
    massCompoundAssembly: "As receitas de compostos são 5% mais baratas!",
    energyDrones: "Os edifícios de energia e investigação são 5% mais baratos!",
    hangarAutomation: "Os custos de construção de frotas são reduzidos em 5%!",
    syntheticPlating: "A blindagem da frota aumenta em 5%!",
    antimatterEngineMinaturization: "A velocidade da frota aumenta em 5%!",
    laserIntensityResearch:
      "O poder de ataque da frota aumenta em 5%! (Aplicável às naves recém-construídas)",
    stellarWhispers: "A impressão inicial dos inimigos melhora em 1%!",
    stellarInsightManifold: "A velocidade do estudo estelar aumenta em 1%!",
    asteroidDwellers: "A velocidade de procura de asteroides aumenta em 1%!",
    ascendencyPhilosophy: "Ganho base de Pontos de Ascendência +1!",
    spaceElevator: "O custo das peças de nave estelar é reduzido em 5%!",
    launchPadMassProduction: "O custo das peças de foguetão é reduzido em 5%!",
    asteroidAttractors: "O tempo de viagem dos foguetões é reduzido em 5%!",
    warpDrive: "O tempo de viagem da nave estelar é reduzido em 5%!",
  },
  de: {
    spaceStorageTankResearch:
      "FÄHIGKEIT: Der Basis-Multiplikator für Lagererweiterung ist jetzt 5x statt 2x!",
    fleetHolograms:
      "FÄHIGKEIT: Du kannst Feinde jetzt immer unterwerfen, solange deine Flotte 3x größer ist als ihre!",
    voidSeers:
      "FÄHIGKEIT: Das Weltraumteleskop kann jetzt nach sofortigen Ressourcen und Verbindungen suchen!",
    efficientAssembly: "Kosten für Weltraumgebäude um 1% gesenkt!",
    laserMining: "Ressourcen-Autokäufer 5% günstiger!",
    massCompoundAssembly: "Verbindungsrezepte 5% günstiger!",
    energyDrones: "Energie- und Forschungsgebäude 5% günstiger!",
    hangarAutomation: "Flottenbaukosten um 5% gesenkt!",
    syntheticPlating: "Flottenpanzerung um 5% erhöht!",
    antimatterEngineMinaturization: "Flottengeschwindigkeit um 5% erhöht!",
    laserIntensityResearch: "Angriffskraft der Flotte um 5% erhöht! (Gilt für neu gebaute Schiffe)",
    stellarWhispers: "Erster Eindruck bei Feinden um 1% verbessert!",
    stellarInsightManifold: "Geschwindigkeit der Sternenstudie um 1% erhöht!",
    asteroidDwellers: "Geschwindigkeit der Asteroidensuche um 1% erhöht!",
    ascendencyPhilosophy: "Basis-Gewinn an Aufstiegspunkten +1!",
    spaceElevator: "Kosten für Sternenschiffteile um 5% gesenkt!",
    launchPadMassProduction: "Kosten für Raketenteile um 5% gesenkt!",
    asteroidAttractors: "Reisezeit der Raketen um 5% verkürzt!",
    warpDrive: "Reisezeit des Sternenschiffs um 5% verkürzt!",
  },
  it: {
    spaceStorageTankResearch:
      "ABILITÀ: Il moltiplicatore base di espansione dello stoccaggio ora è 5x invece di 2x!",
    fleetHolograms:
      "ABILITÀ: Ora puoi sempre vassallizzare i nemici se la tua flotta è 3 volte più grande della loro!",
    voidSeers: "ABILITÀ: Il Telescopio Spaziale può ora cercare risorse e composti istantanei!",
    efficientAssembly: "Costi delle costruzioni spaziali ridotti dell'1%!",
    laserMining: "Auto acquirenti di risorse più economici del 5%!",
    massCompoundAssembly: "Ricette dei composti più economiche del 5%!",
    energyDrones: "Edifici di energia e ricerca più economici del 5%!",
    hangarAutomation: "Costi di costruzione della flotta ridotti del 5%!",
    syntheticPlating: "Corazzatura della flotta aumentata del 5%!",
    antimatterEngineMinaturization: "Velocità della flotta aumentata del 5%!",
    laserIntensityResearch:
      "Potenza d'attacco della flotta aumentata del 5%! (Valido per le navi appena costruite)",
    stellarWhispers: "Impressione iniziale dei nemici migliorata dell'1%!",
    stellarInsightManifold: "Velocità dello studio stellare aumentata dell'1%!",
    asteroidDwellers: "Velocità di ricerca degli asteroidi aumentata dell'1%!",
    ascendencyPhilosophy: "Guadagno base di Punti Ascendenza +1!",
    spaceElevator: "Costo dei pezzi di astronave ridotto del 5%!",
    launchPadMassProduction: "Costo dei pezzi di razzo ridotto del 5%!",
    asteroidAttractors: "Tempo di viaggio dei razzi ridotto del 5%!",
    warpDrive: "Tempo di viaggio dell'astronave ridotto del 5%!",
  },
  fr: {
    spaceStorageTankResearch:
      "CAPACITÉ: Le multiplicateur de base d'extension du stockage passe de 2x à 5x!",
    fleetHolograms:
      "CAPACITÉ: Vous pouvez désormais toujours vassaliser vos ennemis si votre flotte est 3 fois plus grande que la leur!",
    voidSeers:
      "CAPACITÉ: Le Télescope Spatial peut désormais chercher des ressources et composés instantanés!",
    efficientAssembly: "Coûts des constructions spatiales réduits de 1%!",
    laserMining: "Auto-acheteurs de ressources 5% moins chers!",
    massCompoundAssembly: "Recettes de composés 5% moins chères!",
    energyDrones: "Bâtiments d'énergie et de recherche 5% moins chers!",
    hangarAutomation: "Coûts de construction de la flotte réduits de 5%!",
    syntheticPlating: "Blindage de la flotte augmenté de 5%!",
    antimatterEngineMinaturization: "Vitesse de la flotte augmentée de 5%!",
    laserIntensityResearch:
      "Puissance d'attaque de la flotte augmentée de 5%! (Applicable aux vaisseaux nouvellement construits)",
    stellarWhispers: "Première impression des ennemis améliorée de 1%!",
    stellarInsightManifold: "Vitesse d'étude stellaire augmentée de 1%!",
    asteroidDwellers: "Vitesse de recherche d'astéroïdes augmentée de 1%!",
    ascendencyPhilosophy: "Gain de base de Points d'Ascendance +1!",
    spaceElevator: "Coût des pièces de vaisseau réduit de 5%!",
    launchPadMassProduction: "Coût des pièces de fusée réduit de 5%!",
    asteroidAttractors: "Temps de voyage des fusées réduit de 5%!",
    warpDrive: "Temps de voyage du vaisseau réduit de 5%!",
  },
};

export function philosophyText(locale: LocaleId) {
  return COPY[locale];
}

export function rapidExpansionActivatedText(locale: LocaleId): string {
  return RAPID_EXPANSION_ACTIVATED_COPY[locale];
}

export function philosophyUpgradeNoticeText(
  locale: LocaleId,
  id: PhilosophyUpgradeNoticeId,
): string {
  return PHILOSOPHY_UPGRADE_NOTICE_COPY[locale][id];
}

export const LOCALIZATION_VALIDATION_DATA = {
  COPY,
  RAPID_EXPANSION_ACTIVATED_COPY,
  PHILOSOPHY_UPGRADE_NOTICE_COPY,
} as const;
