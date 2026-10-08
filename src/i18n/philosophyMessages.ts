import type { PhilosophyId } from "../content/ids";
import type { PhilosophyAbilityId, PhilosophyRepeatableId } from "../content/philosophy";
import type { LocaleId } from "../content/ids";

interface PhilosophyCopy {
  readonly title: string;
  readonly intro: string;
  readonly choiceTitle: string;
  readonly choicePrompt: string;
  readonly ability: string;
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
    intro:
      "Choose a permanent path after your first star study. Its ability must be researched again each run; repeatable ranks persist.",
    choiceTitle: "Choose your civilization's philosophy",
    choicePrompt: "This choice is permanent for this save. Review each path before choosing.",
    ability: "Path ability",
    repeatables: "Repeatable research",
    buy: "Research",
    owned: "Active this run",
    rank: "Rank",
    nextCost: "Next cost",
    active: "Active",
    unavailable: "Not enough research points.",
    researchShort: "research",
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
        name: "Storage Tank Research",
        effect: "Storage purchases grow capacity ×5 instead of ×2 this run.",
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
        effect:
          "A conquest can settle up to three nearby systems. Peaceful settlements do not trigger it.",
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
    intro:
      "Elige una senda permanente tras estudiar tu primera estrella. Debes volver a investigar su habilidad en cada partida; los rangos repetibles se conservan.",
    choiceTitle: "Elige la filosofía de tu civilización",
    choicePrompt:
      "Esta elección será permanente en esta partida guardada. Revisa cada senda antes de elegir.",
    ability: "Habilidad de la senda",
    repeatables: "Investigación repetible",
    buy: "Investigar",
    owned: "Activa esta partida",
    rank: "Rango",
    nextCost: "Coste siguiente",
    active: "Activa",
    unavailable: "No tienes suficientes puntos de investigación.",
    researchShort: "investigación",
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
        name: "Investigación de tanques de almacenamiento",
        effect:
          "Las mejoras de almacenamiento multiplican la capacidad ×5 en vez de ×2 durante esta partida.",
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
        effect:
          "Una conquista puede asentar hasta tres sistemas cercanos. Los asentamientos pacíficos no lo activan.",
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
    intro:
      "Escolhe um caminho permanente após estudar a primeira estrela. A habilidade tem de ser pesquisada novamente em cada partida; os níveis repetíveis mantêm-se.",
    choiceTitle: "Escolhe a filosofia da tua civilização",
    choicePrompt:
      "Esta escolha é permanente nesta gravação. Analisa cada caminho antes de escolher.",
    ability: "Habilidade do caminho",
    repeatables: "Investigação repetível",
    buy: "Investigar",
    owned: "Ativa nesta partida",
    rank: "Nível",
    nextCost: "Próximo custo",
    active: "Ativa",
    unavailable: "Não tens pontos de investigação suficientes.",
    researchShort: "investigação",
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
        name: "Investigação de tanques de armazenamento",
        effect: "As compras de armazenamento aumentam a capacidade ×5 em vez de ×2 nesta partida.",
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
        effect:
          "Uma conquista pode colonizar até três sistemas próximos. Colonizações pacíficas não ativam o efeito.",
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
    intro:
      "Wähle nach der ersten Sternenstudie einen dauerhaften Pfad. Die Fähigkeit muss in jedem Durchlauf neu erforscht werden; wiederholbare Ränge bleiben erhalten.",
    choiceTitle: "Wähle die Philosophie deiner Zivilisation",
    choicePrompt:
      "Diese Wahl bleibt für diesen Spielstand dauerhaft. Sieh dir jeden Pfad vor der Wahl an.",
    ability: "Pfadfähigkeit",
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
        name: "Forschung zu Speichertanks",
        effect: "Speicherkäufe erhöhen den Platz in diesem Durchlauf um ×5 statt ×2.",
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
        effect:
          "Eine Eroberung kann bis zu drei nahe Systeme besiedeln. Friedliche Besiedlungen lösen sie nicht aus.",
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
    intro:
      "Scegli un percorso permanente dopo il primo studio stellare. L'abilità va ricercata di nuovo a ogni partita; i livelli ripetibili restano.",
    choiceTitle: "Scegli la filosofia della tua civiltà",
    choicePrompt:
      "La scelta è permanente per questo salvataggio. Esamina ogni percorso prima di decidere.",
    ability: "Abilità del percorso",
    repeatables: "Ricerca ripetibile",
    buy: "Ricerca",
    owned: "Attiva in questa partita",
    rank: "Livello",
    nextCost: "Costo successivo",
    active: "Attiva",
    unavailable: "Punti ricerca insufficienti.",
    researchShort: "ricerca",
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
        name: "Ricerca sui serbatoi di stoccaggio",
        effect:
          "Gli acquisti di stoccaggio aumentano la capacità ×5 invece di ×2 in questa partita.",
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
        effect:
          "Una conquista può insediare fino a tre sistemi vicini. Gli insediamenti pacifici non la attivano.",
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
    intro:
      "Choisissez une voie permanente après votre première étude stellaire. Sa capacité doit être recherchée à nouveau à chaque partie ; les rangs répétables sont conservés.",
    choiceTitle: "Choisissez la philosophie de votre civilisation",
    choicePrompt:
      "Ce choix est permanent pour cette sauvegarde. Examinez chaque voie avant de choisir.",
    ability: "Capacité de la voie",
    repeatables: "Recherche répétable",
    buy: "Rechercher",
    owned: "Active pendant cette partie",
    rank: "Rang",
    nextCost: "Coût suivant",
    active: "Active",
    unavailable: "Points de recherche insuffisants.",
    researchShort: "recherche",
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
        name: "Recherche sur les réservoirs de stockage",
        effect:
          "Les achats de stockage multiplient la capacité par ×5 au lieu de ×2 pendant cette partie.",
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
        effect:
          "Une conquête peut établir jusqu'à trois systèmes voisins. Un établissement pacifique ne la déclenche pas.",
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

export function philosophyText(locale: LocaleId) {
  return COPY[locale];
}

export const LOCALIZATION_VALIDATION_DATA = { COPY } as const;
