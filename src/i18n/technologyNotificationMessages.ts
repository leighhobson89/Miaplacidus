import type { TechId, LocaleId } from "../content/ids";

/** Source-equivalent completion notices for every research technology. */
const notices = {
  en: {
    knowledgeSharing: "Knowledge Sharing Researched\n\nYou can now open Science Clubs!",
    fusionTheory: "Fusion Theory Researched\n\nUseful for future experiments!",
    hydrogenFusion: "Hydrogen Fusion Researched\n\nYou can now fuse Hydrogen!",
    heliumFusion: "Helium Fusion Researched\n\nYou can now fuse Helium!",
    carbonFusion: "Carbon Fusion Researched\n\nYou can now fuse Carbon!",
    basicPowerGeneration:
      "Basic Power Generation Researched\n\nYou can now build basic Power Stations!",
    sodiumIonPowerStorage:
      "Sodium Ion Power Storage Researched\n\nYou can build a Sodium Ion Battery to store energy!",
    solarPowerGeneration:
      "Solar Power Generation Researched\n\nYou can now build Solar Panels to generate power!",
    giganticTurbines:
      "Gigantic Turbines Researched\n\nThis opens up new research in power generation!",
    advancedPowerGeneration: "Advanced Power Generation Researched\n\nBuild Advanced Power Plants!",
    rocketComposites:
      "Rocket Composites Researched\n\nYou can now build Rocket Parts and Level 3 and 4 AutoBuyers!",
    advancedFuels: "Advanced Fuels Researched\n\nYou can now fuel Rockets!",
    planetaryNavigation: "Planetary Navigation Researched\n\nYou can now travel to Asteroids!",
    neonFusion: "Neon Fusion Researched\n\nYou can now fuse Neon!",
    oxygenFusion: "Oxygen Fusion Researched\n\nYou can now fuse Oxygen!",
    compounds: "Compounds Researched\n\nUnlocks the Compounds tab!",
    siliconFusion: "Silicon Fusion Researched\n\nYou can now fuse Silicon!",
    aggregateMixing: "Aggregate Mixing Researched\n\nYou can now produce Concrete compounds!",
    steelFoundries: "Steel Foundries Researched\n\nYou can now create Steel compounds!",
    nanoTubeTechnology:
      "Nano Tube Technology Researched\n\nWith this we can start to learn about how to fuse Carbon in the future!",
    hydroCarbons:
      "HydroCarbons Researched\n\nYou can gain access to Diesel Fuel once you have Compounds unlocked!",
    stellarCartography: "Stellar Cartography Researched\n\nYou unlocked Interstellar tab!",
    quantumComputing: "Quantum Computing Researched\n\nMore advanced Machinery is now available!",
    scienceLaboratories: "Science Laboratories Researched\n\nYou can now build Science Labs!",
    nobleGasCollection:
      "Noble Gas Collection Researched\n\nYou can now store Noble Gases when fused!",
    neutronCapture:
      "Neutron Capture Researched\n\nThis will now allow us to fuse Titanium, a versatile and durable material essential for advanced construction and technology!",
    glassManufacture: "Glass Manufacture Researched\n\nYou can now produce Glass compounds!",
    atmosphericTelescopes:
      "Atmospheric Telescopes Researched\n\nYou can now get data from the local stellar neighborhood!",
    fusionEfficiencyI: "Fusion Efficiency I Researched\n\n20% Boost to Fusion returns!",
    fusionEfficiencyII: "Fusion Efficiency II Researched\n\nFurther 20% Boost to Fusion returns!",
    fusionEfficiencyIII: "Fusion Efficiency III Researched\n\n100% Fusion returns!",
    orbitalConstruction: "Orbital Construction Researched\n\nYou can now build Starship Modules!",
    antimatterEngines:
      "Antimatter Engines Researched\n\nYou can now build Antimatter Engines allowing Interstellar Travel!",
    FTLTravelTheory:
      "FTL Travel Theory Researched\n\nYou can now research how to travel faster than light!",
    lifeSupportSystems:
      "Life Support Systems Researched\n\nYou can now sustain life in deep space!",
    starshipFleets:
      "Starship Fleets Researched\n\nYou can now construct Starship Offensive capabilities!",
    stellarScanners:
      "Stellar Scanners Researched\n\nWhen you arrive at a new Star System you can see details of alien life and if it poses a threat!",
    dysonSphereUnderstanding:
      "Dyson Sphere Understanding Researched\n\nYou now understand what a Dyson Sphere is.",
    dysonSphereCapabilities:
      "Dyson Sphere Capabilities Researched\n\nYou now understand what a Dyson Sphere can do.",
    dysonSphereDisconnect:
      "Dyson Sphere Disconnect Researched\n\nYou have disconnected the Dyson Sphere from the Miaplacidus System Force Field.",
    dysonSpherePower:
      "Dyson Sphere Power Researched\n\nYou can now harness the Dyson Sphere power for use within the system.",
    dysonSphereConnect:
      "Dyson Sphere Connect Researched\n\nYou can now connect the Dyson Sphere power across the galaxy.",
    celestialProcessingCoreUnderstanding:
      "Celestial Processing Core Understanding Researched\n\nYou now understand what the Celestial Processing Core is.",
    celestialProcessingCoreCapabilities:
      "Celestial Processing Core Capabilities Researched\n\nYou now understand what the Celestial Processing Core can do.",
    celestialProcessingCoreDisconnect:
      "Celestial Processing Core Disconnect Researched\n\nYou have disconnected the Celestial Processing Core from the Miaplacidus System Force Field.",
    celestialProcessingCorePower:
      "Celestial Processing Core Power Researched\n\nYou can now harness the Celestial Processing Core power for use within the system.",
    celestialProcessingCoreConnect:
      "Celestial Processing Core Connect Researched\n\nYou can now connect the Celestial Processing Core power across the galaxy.",
    plasmaForgeUnderstanding:
      "Plasma Forge Understanding Researched\n\nYou now understand what the Plasma Forge is.",
    plasmaForgeCapabilities:
      "Plasma Forge Capabilities Researched\n\nYou now understand what the Plasma Forge can do.",
    plasmaForgeDisconnect:
      "Plasma Forge Disconnect Researched\n\nYou have disconnected the Plasma Forge from the Miaplacidus System Force Field.",
    plasmaForgePower:
      "Plasma Forge Power Researched\n\nYou can now harness the Plasma Forge power for use within the system.",
    plasmaForgeConnect:
      "Plasma Forge Connect Researched\n\nYou can now connect the Plasma Forge power across the galaxy.",
    galacticMemoryArchiveUnderstanding:
      "Galactic Memory Archive Understanding Researched\n\nYou now understand what the Galactic Memory Archive is.",
    galacticMemoryArchiveCapabilities:
      "Galactic Memory Archive Capabilities Researched\n\nYou now understand what the Galactic Memory Archive can do.",
    galacticMemoryArchiveDisconnect:
      "Galactic Memory Archive Disconnect Researched\n\nYou have disconnected the Galactic Memory Archive from the Miaplacidus System Force Field.",
    galacticMemoryArchivePower:
      "Galactic Memory Archive Power Researched\n\nYou can now harness the Galactic Memory Archive power for use within the system.",
    galacticMemoryArchiveConnect:
      "Galactic Memory Archive Connect Researched\n\nYou can now connect the Galactic Memory Archive power across the galaxy.",
  },
  es: {
    knowledgeSharing:
      "Compartir Conocimiento Investigado\n\n¡Ahora puedes abrir Clubes de Ciencia!",
    fusionTheory: "Teoría de Fusión Investigada\n\n¡Útil para experimentos futuros!",
    hydrogenFusion: "Fusión de Hidrógeno Investigada\n\n¡Ahora puedes fusionar Hidrógeno!",
    heliumFusion: "Fusión de Helio Investigada\n\n¡Ahora puedes fusionar Helio!",
    carbonFusion: "Fusión de Carbono Investigadaº\n¡Ahora puedes fusionar Carbono!",
    basicPowerGeneration:
      "Generación de Energía Básica Investigada\n\n¡Ahora puedes construir Estaciones de Energía básicas!",
    sodiumIonPowerStorage:
      "Almacenamiento de Energión de Iones de Sodio Investigado\n\n¡Puedes construir una Batería de Iones de Sodio para almacenar energía!",
    solarPowerGeneration:
      "Generación de Energía Solar Investigada\n\n¡Ahora puedes construir Paneles Solares para generar energía!",
    giganticTurbines:
      "Turbinas Gigantescas Investigadas\n\n¡Esto abre nuevas investigaciones en generación de energía!",
    advancedPowerGeneration:
      "Generación de Energía Avanzada Investigada\n\n¡Construye Plantas de Energía Avanzadas!",
    rocketComposites:
      "Compuestos de Cohetes Investigados\n\n¡Ahora puedes construir Partes de Cohetes y Compradores Automáticos de Nivel 3 y 4!",
    advancedFuels:
      "Combustibles Avanzados Investigados\n\n¡Ahora puedes cargar combustible a los Cohetes!",
    planetaryNavigation: "Navegación Planetaria Investigada\n\n¡Ahora puedes viajar a Asteroides!",
    neonFusion: "Fusión de Neón Investigada\n\n¡Ahora puedes fusionar Neón!",
    oxygenFusion: "Fusión de Oxígeno Investigada\n\n¡Ahora puedes fusionar Oxígeno!",
    compounds: "Compuestos Investigados\n\n¡Desbloquea la pestaña de Compuestos!",
    siliconFusion: "Fusión de Silicio Investigada\n\n¡Ahora puedes fusionar Silicio!",
    aggregateMixing:
      "Mezcla de Agregados Investigada\n\n¡Ahora puedes producir compuestos de Hormigón!",
    steelFoundries: "Fundiciones de Acero Investigadas\n\n¡Ahora puedes crear compuestos de Acero!",
    nanoTubeTechnology:
      "Tecnología de Nanotubos Investigada\n\n¡Con esto podemos comenzar a aprender sobre cómo fusionar Carbono en el futuro!",
    hydroCarbons:
      "Hidrocarburos Investigados\n\n¡Puedes obtener acceso a Combustible Diésel una vez que tengas desbloqueados los Compuestos!",
    stellarCartography:
      "Cartografía Estelar Investigada\n\n¡Has desbloqueado la pestaña Interestelar!",
    quantumComputing:
      "Computación Cuántica Investigada\n\n¡Maquinaria más avanzada está ahora disponible!",
    scienceLaboratories:
      "Laboratorios Científicos Investigados\n\n¡Ahora puedes construir Laboratorios de Ciencia!",
    nobleGasCollection:
      "Recolección de Gases Nobles Investigada\n\n¡Ahora puedes almacenar Gases Nobles cuando se fusionen!",
    neutronCapture:
      "Captura de Neutrones Investigada\n\n¡Esto ahora nos permitirá fusionar Titanio, un material versátil y duradero esencial para la construcción y tecnología avanzadas!",
    glassManufacture:
      "Fabricación de Vidrio Investigada\n\n¡Ahora puedes producir compuestos de Vidrio!",
    atmosphericTelescopes:
      "Telescopios Atmosféricos Investigados\n\n¡Ahora puedes obtener datos del vecindario estelar local!",
    fusionEfficiencyI:
      "Eficiencia de Fusión I Investigada\n\n¡20% de aumento en los rendimientos de Fusión!",
    fusionEfficiencyII:
      "Eficiencia de Fusión II Investigada\n\n¡20% adicional de aumento en los rendimientos de Fusión!",
    fusionEfficiencyIII: "Eficiencia de Fusión III Investigada\n\n¡100% de rendimientos de Fusión!",
    orbitalConstruction:
      "Construcción Orbital Investigada\n\n¡Ahora puedes construir Módulos de Naves Estelares!",
    antimatterEngines:
      "Motores de Antimateria Investigados\n\n¡Ahora puedes construir Motores de Antimateria permitiendo Viajes Interestelares!",
    FTLTravelTheory:
      "Teoría de Viaje FTL Investigada\n\n¡Ahora puedes investigar cómo viajar más rápido que la luz!",
    lifeSupportSystems:
      "Sistemas de Soporte Vital Investigados\n\n¡Ahora puedes mantener la vida en el espacio profundo!",
    starshipFleets:
      "Flotas de Naves Estelares Investigadas\n\n¡Ahora puedes construir capacidades Ofensivas de Naves Estelares!",
    stellarScanners:
      "Escáneres Estelares Investigados\n\n¡Cuando llegues a un nuevo Sistema Estelar puedes ver detalles de vida alienígena y si representa una amenaza!",
    dysonSphereUnderstanding:
      "Comprensión de la Esfera de Dyson Investigada\n\nAhora entiendes qué es una Esfera de Dyson.",
    dysonSphereCapabilities:
      "Capacidades de la Esfera de Dyson Investigadas\n\nAhora entiendes lo que puede hacer una Esfera de Dyson.",
    dysonSphereDisconnect:
      "Desconexión de la Esfera de Dyson Investigada\n\nHas desconectado la Esfera de Dyson del Campo de Fuerza del Sistema Miaplacidus.",
    dysonSpherePower:
      "Energía de la Esfera de Dyson Investigada\n\nAhora puedes aprovechar la energía de la Esfera de Dyson para uso dentro del sistema.",
    dysonSphereConnect:
      "Conexión de la Esfera de Dyson Investigada\n\nAhora puedes conectar la energía de la Esfera de Dyson a través de la galaxia.",
    celestialProcessingCoreUnderstanding:
      "Comprensión del Núcleo de Procesamiento Celestial Investigada\n\nAhora entiendes qué es el Núcleo de Procesamiento Celestial.",
    celestialProcessingCoreCapabilities:
      "Capacidades del Núcleo de Procesamiento Celestial Investigadas\n\nAhora entiendes lo que puede hacer el Núcleo de Procesamiento Celestial.",
    celestialProcessingCoreDisconnect:
      "Desconexión del Núcleo de Procesamiento Celestial Investigada\n\nHas desconectado el Núcleo de Procesamiento Celestial del Campo de Fuerza del Sistema Miaplacidus.",
    celestialProcessingCorePower:
      "Energía del Núcleo de Procesamiento Celestial Investigada\n\nAhora puedes aprovechar la energía del Núcleo de Procesamiento Celestial para uso dentro del sistema.",
    celestialProcessingCoreConnect:
      "Conexión del Núcleo de Procesamiento Celestial Investigada\n\nAhora puedes conectar la energía del Núcleo de Procesamiento Celestial a través de la galaxia.",
    plasmaForgeUnderstanding:
      "Comprensión de la Forja de Plasma Investigada\n\nAhora entiendes qué es la Forja de Plasma.",
    plasmaForgeCapabilities:
      "Capacidades de la Forja de Plasma Investigadas\n\nAhora entiendes lo que puede hacer la Forja de Plasma.",
    plasmaForgeDisconnect:
      "Desconexión de la Forja de Plasma Investigada\n\nHas desconectado la Forja de Plasma del Campo de Fuerza del Sistema Miaplacidus.",
    plasmaForgePower:
      "Energía de la Forja de Plasma Investigada\n\nAhora puedes aprovechar la energía de la Forja de Plasma para uso dentro del sistema.",
    plasmaForgeConnect:
      "Conexión de la Forja de Plasma Investigada\n\nAhora puedes conectar la energía de la Forja de Plasma a través de la galaxia.",
    galacticMemoryArchiveUnderstanding:
      "Comprensión del Archivo de Memoria Galáctica Investigada\n\nAhora entiendes qué es el Archivo de Memoria Galáctica.",
    galacticMemoryArchiveCapabilities:
      "Capacidades del Archivo de Memoria Galáctica Investigadas\n\nAhora entiendes lo que puede hacer el Archivo de Memoria Galáctica.",
    galacticMemoryArchiveDisconnect:
      "Desconexión del Archivo de Memoria Galáctica Investigada\n\nHas desconectado el Archivo de Memoria Galáctica del Campo de Fuerza del Sistema Miaplacidus.",
    galacticMemoryArchivePower:
      "Energía del Archivo de Memoria Galáctica Investigada\n\nAhora puedes aprovechar la energía del Archivo de Memoria Galáctica para uso dentro del sistema.",
    galacticMemoryArchiveConnect:
      "Conexión del Archivo de Memoria Galáctica Investigada\n\nAhora puedes conectar la energía del Archivo de Memoria Galáctica a través de la galaxia.",
  },
  pt: {
    knowledgeSharing:
      "Compartilhamento de Conhecimento Pesquisado\n\nAgora você pode abrir Clubes de Ciência!",
    fusionTheory: "Teoria da Fusão Pesquisada\n\nÚtil para futuros experimentos!",
    hydrogenFusion: "Fusão de Hidrogênio Pesquisada\n\nAgora você pode fundir Hidrogênio!",
    heliumFusion: "Fusão de Hélio Pesquisada\n\nAgora você pode fundir Hélio!",
    carbonFusion: "Fusão de Carbono Pesquisada\nAgora você pode fundir Carbono!",
    basicPowerGeneration:
      "Geração Básica de Energia Pesquisada\n\nAgora você pode construir Estações de Energia básicas!",
    sodiumIonPowerStorage:
      "Armazenamento de Energia de Íons de Sódio Pesquisado\n\nVocê pode construir uma Bateria de Íons de Sódio para armazenar energia!",
    solarPowerGeneration:
      "Geração de Energia Solar Pesquisada\n\nAgora você pode construir Painéis Solares para gerar energia!",
    giganticTurbines:
      "Turbinas Gigantescas Pesquisadas\n\nIsso abre novas pesquisas em geração de energia!",
    advancedPowerGeneration:
      "Geração Avançada de Energia Pesquisada\n\nConstrua Usinas de Energia Avançadas!",
    rocketComposites:
      "Compostos de Foguetes Pesquisados\n\nAgora você pode construir Peças de Foguetes e Compradores Automáticos de Nível 3 e 4!",
    advancedFuels: "Combustíveis Avançados Pesquisados\n\nAgora você pode abastecer os Foguetes!",
    planetaryNavigation:
      "Navegação Planetária Pesquisada\n\nAgora você pode viajar até Asteroides!",
    neonFusion: "Fusão de Neônio Pesquisada\n\nAgora você pode fundir Neônio!",
    oxygenFusion: "Fusão de Oxigênio Pesquisada\n\nAgora você pode fundir Oxigênio!",
    compounds: "Compostos Pesquisados\n\nDesbloqueie a aba de Compostos!",
    siliconFusion: "Fusão de Silício Pesquisada\n\nAgora você pode fundir Silício!",
    aggregateMixing:
      "Mistura de Agregados Pesquisada\n\nAgora você pode produzir Compostos de Concreto!",
    steelFoundries: "Fundições de Aço Pesquisadas\n\nAgora você pode criar Compostos de Aço!",
    nanoTubeTechnology:
      "Tecnologia de Nanotubos Pesquisada\n\nCom isso, podemos começar a aprender como fundir Carbono no futuro!",
    hydroCarbons:
      "Hidrocarbonetos Pesquisados\n\nVocê pode obter acesso ao Combustível Diesel assim que tiver os Compostos desbloqueados!",
    stellarCartography: "Cartografia Estelar Pesquisada\n\nVocê desbloqueou a aba Interestelar!",
    quantumComputing:
      "Computação Quântica Pesquisada\n\nMáquinas mais avançadas estão agora disponíveis!",
    scienceLaboratories:
      "Laboratórios de Ciência Pesquisados\n\nAgora você pode construir Laboratórios de Ciência!",
    nobleGasCollection:
      "Coleta de Gases Nobres Pesquisada\n\nAgora você pode armazenar Gases Nobres quando forem fundidos!",
    neutronCapture:
      "Captura de Nêutrons Pesquisada\n\nIsso agora nos permitirá fundir Titânio, um material versátil e durável, essencial para construção e tecnologia avançadas!",
    glassManufacture:
      "Fabricação de Vidro Pesquisada\n\nAgora você pode produzir Compostos de Vidro!",
    atmosphericTelescopes:
      "Telescópios Atmosféricos Pesquisados\n\nAgora você pode obter dados da vizinhança estelar local!",
    fusionEfficiencyI:
      "Eficiência de Fusão I Pesquisada\n\nAumento de 20% nos rendimentos de Fusão!",
    fusionEfficiencyII:
      "Eficiência de Fusão II Pesquisada\n\nAumento adicional de 20% nos rendimentos de Fusão!",
    fusionEfficiencyIII: "Eficiência de Fusão III Pesquisada\n\nRendimentos de Fusão de 100%!",
    orbitalConstruction:
      "Construção Orbital Pesquisada\n\nAgora você pode construir Módulos de Naves Estelares!",
    antimatterEngines:
      "Motores de Antimatéria Pesquisados\n\nAgora você pode construir Motores de Antimatéria, permitindo Viagens Interestelares!",
    FTLTravelTheory:
      "Teoria de Viagem FTL Pesquisada\n\nAgora você pode pesquisar como viajar mais rápido que a luz!",
    lifeSupportSystems:
      "Sistemas de Suporte à Vida Pesquisados\n\nAgora você pode sustentar a vida no espaço profundo!",
    starshipFleets:
      "Frotas de Naves Estelares Pesquisadas\n\nAgora você pode construir capacidades Ofensivas de Naves Estelares!",
    stellarScanners:
      "Escâneres Estelares Pesquisados\n\nQuando chegar a um novo Sistema Estelar, você poderá ver detalhes sobre vida alienígena e se ela representa uma ameaça!",
    dysonSphereUnderstanding:
      "Compreensão da Esfera de Dyson Pesquisada\n\nAgora você entende o que é uma Esfera de Dyson.",
    dysonSphereCapabilities:
      "Capacidades da Esfera de Dyson Pesquisadas\n\nAgora você entende o que uma Esfera de Dyson pode fazer.",
    dysonSphereDisconnect:
      "Desconexão da Esfera de Dyson Pesquisada\n\nVocê desconectou a Esfera de Dyson do Campo de Força do Sistema Miaplacidus.",
    dysonSpherePower:
      "Energia da Esfera de Dyson Pesquisada\n\nAgora você pode aproveitar a energia da Esfera de Dyson para uso dentro do sistema.",
    dysonSphereConnect:
      "Conexão da Esfera de Dyson Pesquisada\n\nAgora você pode conectar a energia da Esfera de Dyson através da galáxia.",
    celestialProcessingCoreUnderstanding:
      "Compreensão do Núcleo de Processamento Celestial Pesquisada\n\nAgora você entende o que é o Núcleo de Processamento Celestial.",
    celestialProcessingCoreCapabilities:
      "Capacidades do Núcleo de Processamento Celestial Pesquisadas\n\nAgora você entende o que o Núcleo de Processamento Celestial pode fazer.",
    celestialProcessingCoreDisconnect:
      "Desconexão do Núcleo de Processamento Celestial Pesquisada\n\nVocê desconectou o Núcleo de Processamento Celestial do Campo de Força do Sistema Miaplacidus.",
    celestialProcessingCorePower:
      "Energia do Núcleo de Processamento Celestial Pesquisada\n\nAgora você pode aproveitar a energia do Núcleo de Processamento Celestial para uso dentro do sistema.",
    celestialProcessingCoreConnect:
      "Conexão do Núcleo de Processamento Celestial Pesquisada\n\nAgora você pode conectar a energia do Núcleo de Processamento Celestial através da galáxia.",
    plasmaForgeUnderstanding:
      "Compreensão da Forja de Plasma Pesquisada\n\nAgora você entende o que é a Forja de Plasma.",
    plasmaForgeCapabilities:
      "Capacidades da Forja de Plasma Pesquisadas\n\nAgora você entende o que a Forja de Plasma pode fazer.",
    plasmaForgeDisconnect:
      "Desconexão da Forja de Plasma Pesquisada\n\nVocê desconectou a Forja de Plasma do Campo de Força do Sistema Miaplacidus.",
    plasmaForgePower:
      "Energia da Forja de Plasma Pesquisada\n\nAgora você pode aproveitar a energia da Forja de Plasma para uso dentro do sistema.",
    plasmaForgeConnect:
      "Conexão da Forja de Plasma Pesquisada\n\nAgora você pode conectar a energia da Forja de Plasma através da galáxia.",
    galacticMemoryArchiveUnderstanding:
      "Compreensão do Arquivo de Memória Galáctica Pesquisada\n\nAgora você entende o que é o Arquivo de Memória Galáctica.",
    galacticMemoryArchiveCapabilities:
      "Capacidades do Arquivo de Memória Galáctica Pesquisadas\n\nAgora você entende o que o Arquivo de Memória Galáctica pode fazer.",
    galacticMemoryArchiveDisconnect:
      "Desconexão do Arquivo de Memória Galáctica Pesquisada\n\nVocê desconectou o Arquivo de Memória Galáctica do Campo de Força do Sistema Miaplacidus.",
    galacticMemoryArchivePower:
      "Energia do Arquivo de Memória Galáctica Pesquisada\n\nAgora você pode aproveitar a energia do Arquivo de Memória Galáctica para uso dentro do sistema.",
    galacticMemoryArchiveConnect:
      "Conexão do Arquivo de Memória Galáctica Pesquisada\n\nAgora você pode conectar a energia do Arquivo de Memória Galáctica através da galáxia.",
  },
  de: {
    knowledgeSharing: "Wissensaustausch Erforscht\n\nDu kannst jetzt Wissenschaftsklubs eröffnen!",
    fusionTheory: "Fusionstheorie Erforscht\n\nNützlich für zukünftige Experimente!",
    hydrogenFusion: "Wasserstoff-Fusion Erforscht\n\nDu kannst jetzt Wasserstoff fusionieren!",
    heliumFusion: "Helium-Fusion Erforscht\n\nDu kannst jetzt Helium fusionieren!",
    carbonFusion: "Kohlenstoff-Fusion Erforscht\n\nDu kannst jetzt Kohlenstoff fusionieren!",
    basicPowerGeneration:
      "Grundlegende Energieerzeugung Erforscht\n\nDu kannst jetzt grundlegende Kraftwerke bauen!",
    sodiumIonPowerStorage:
      "Natrium-Ionen-Energiespeicher Erforscht\n\nDu kannst eine Natrium-Ionen-Batterie bauen, um Energie zu speichern!",
    solarPowerGeneration:
      "Solarenergieerzeugung Erforscht\n\nDu kannst jetzt Solarpaneele bauen, um Energie zu erzeugen!",
    giganticTurbines:
      "Gigantische Turbinen Erforscht\n\nDies eröffnet neue Forschung in der Energieerzeugung!",
    advancedPowerGeneration:
      "Fortgeschrittene Energieerzeugung Erforscht\n\nBaue fortgeschrittene Kraftwerke!",
    rocketComposites:
      "Raketen-Verbundwerkstoffe Erforscht\n\nDu kannst jetzt Raketenteile und AutoBuyer der Stufe 3 und 4 bauen!",
    advancedFuels: "Fortgeschrittene Kraftstoffe Erforscht\n\nDu kannst jetzt Raketen betanken!",
    planetaryNavigation: "Planetare Navigation Erforscht\n\nDu kannst jetzt zu Asteroiden reisen!",
    neonFusion: "Neon-Fusion Erforscht\n\nDu kannst jetzt Neon fusionieren!",
    oxygenFusion: "Sauerstoff-Fusion Erforscht\n\nDu kannst jetzt Sauerstoff fusionieren!",
    compounds: "Verbindungen Erforscht\n\nSchaltet den Verbindungen-Tab frei!",
    siliconFusion: "Silizium-Fusion Erforscht\n\nDu kannst jetzt Silizium fusionieren!",
    aggregateMixing:
      "Zuschlagstoff-Mischung Erforscht\n\nDu kannst jetzt Betonverbindungen herstellen!",
    steelFoundries: "Stahlgiessereien Erforscht\n\nDu kannst jetzt Stahlverbindungen herstellen!",
    nanoTubeTechnology:
      "Nanoröhrchen-Technologie Erforscht\n\nDamit können wir beginnen zu lernen, wie man in Zukunft Kohlenstoff fusioniert!",
    hydroCarbons:
      "Kohlenwasserstoffe Erforscht\n\nDu kannst Zugang zu Dieselkraftstoff erhalten, sobald du Verbindungen freigeschaltet hast!",
    stellarCartography:
      "Sternenkartografie Erforscht\n\nDu hast den Interstellar-Tab freigeschaltet!",
    quantumComputing:
      "Quantencomputing Erforscht\n\nFortschrittlichere Maschinerie ist jetzt verfügbar!",
    scienceLaboratories:
      "Wissenschaftslabore Erforscht\n\nDu kannst jetzt Wissenschaftslabore bauen!",
    nobleGasCollection:
      "Edelgassammlung Erforscht\n\nDu kannst jetzt Edelgase speichern, wenn sie fusioniert sind!",
    neutronCapture:
      "Neutroneneinfang Erforscht\n\nDies ermöglicht es uns jetzt, Titan zu fusionieren, ein vielseitiges und haltbares Material, das für den fortgeschrittenen Bau und Technologie unerlässlich ist!",
    glassManufacture: "Glasherstellung Erforscht\n\nDu kannst jetzt Glasverbindungen herstellen!",
    atmosphericTelescopes:
      "Atmosphärische Teleskope Erforscht\n\nDu kannst jetzt Daten aus der lokalen Sternen- Nachbarschaft erhalten!",
    fusionEfficiencyI: "Fusionseffizienz I Erforscht\n\n20% Boost für Fusion-Rückgaben!",
    fusionEfficiencyII: "Fusionseffizienz II Erforscht\n\nWeitere 20% Boost für Fusion-Rückgaben!",
    fusionEfficiencyIII: "Fusionseffizienz III Erforscht\n\n100% Fusion-Rückgaben!",
    orbitalConstruction:
      "Orbitale Konstruktion Erforscht\n\nDu kannst jetzt Sternenschiff-Module bauen!",
    antimatterEngines:
      "Antimaterie-Triebwerke Erforscht\n\nDu kannst jetzt Antimaterie-Triebwerke bauen, die interstellare Reisen ermöglichen!",
    FTLTravelTheory:
      "FTL-Reisetheorie Erforscht\n\nDu kannst jetzt erforschen, wie man schneller als Licht reist!",
    lifeSupportSystems:
      "Lebenserhaltungssysteme Erforscht\n\nDu kannst jetzt Leben im Weltraum aufrechterhalten!",
    starshipFleets:
      "Sternenschiff-Flotten Erforscht\n\nDu kannst jetzt Sternenschiff-Offensivfähigkeiten bauen!",
    stellarScanners:
      "Sternenscanner Erforscht\n\nWenn du in einem neuen Sternensystem ankommst, kannst du Details über außerirdisches Leben sehen und ob es eine Bedrohung darstellt!",
    dysonSphereUnderstanding:
      "Dyson-Sphären-Verständnis Erforscht\n\nDu verstehst jetzt, was eine Dyson-Sphäre ist.",
    dysonSphereCapabilities:
      "Dyson-Sphären-Fähigkeiten Erforscht\n\nDu verstehst jetzt, was eine Dyson-Sphäre tun kann.",
    dysonSphereDisconnect:
      "Dyson-Sphären-Trennung Erforscht\n\nDu hast die Dyson-Sphäre vom Miaplacidus-System-Kraftfeld getrennt.",
    dysonSpherePower:
      "Dyson-Sphären-Energie Erforscht\n\nDu kannst jetzt die Energie der Dyson-Sphäre für die Nutzung im System nutzen.",
    dysonSphereConnect:
      "Dyson-Sphären-Verbindung Erforscht\n\nDu kannst jetzt die Energie der Dyson-Sphäre über die Galaxie hinweg verbinden.",
    celestialProcessingCoreUnderstanding:
      "Himmelskörper-Verarbeitungskern-Verständnis Erforscht\n\nDu verstehst jetzt, was der Himmelskörper-Verarbeitungskern ist.",
    celestialProcessingCoreCapabilities:
      "Himmelskörper-Verarbeitungskern-Fähigkeiten Erforscht\n\nDu verstehst jetzt, was der Himmelskörper-Verarbeitungskern tun kann.",
    celestialProcessingCoreDisconnect:
      "Himmelskörper-Verarbeitungskern-Trennung Erforscht\n\nDu hast den Himmelskörper-Verarbeitungskern vom Miaplacidus-System-Kraftfeld getrennt.",
    celestialProcessingCorePower:
      "Himmelskörper-Verarbeitungskern-Energie Erforscht\n\nDu kannst jetzt die Energie des Himmelskörper-Verarbeitungskerns für die Nutzung im System nutzen.",
    celestialProcessingCoreConnect:
      "Himmelskörper-Verarbeitungskern-Verbindung Erforscht\n\nDu kannst jetzt die Energie des Himmelskörper-Verarbeitungskerns über die Galaxie hinweg verbinden.",
    plasmaForgeUnderstanding:
      "Plasmaschmiede-Verständnis Erforscht\n\nDu verstehst jetzt, was die Plasmaschmiede ist.",
    plasmaForgeCapabilities:
      "Plasmaschmiede-Fähigkeiten Erforscht\n\nDu verstehst jetzt, was die Plasmaschmiede tun kann.",
    plasmaForgeDisconnect:
      "Plasmaschmiede-Trennung Erforscht\n\nDu hast die Plasmaschmiede vom Miaplacidus-System-Kraftfeld getrennt.",
    plasmaForgePower:
      "Plasmaschmiede-Energie Erforscht\n\nDu kannst jetzt die Energie der Plasmaschmiede für die Nutzung im System nutzen.",
    plasmaForgeConnect:
      "Plasmaschmiede-Verbindung Erforscht\n\nDu kannst jetzt die Energie der Plasmaschmiede über die Galaxie hinweg verbinden.",
    galacticMemoryArchiveUnderstanding:
      "Galaktisches Gedächtnisarchiv-Verständnis Erforscht\n\nDu verstehst jetzt, was das Galaktische Gedächtnisarchiv ist.",
    galacticMemoryArchiveCapabilities:
      "Galaktisches Gedächtnisarchiv-Fähigkeiten Erforscht\n\nDu verstehst jetzt, was das Galaktische Gedächtnisarchiv tun kann.",
    galacticMemoryArchiveDisconnect:
      "Galaktisches Gedächtnisarchiv-Trennung Erforscht\n\nDu hast das Galaktische Gedächtnisarchiv vom Miaplacidus-System-Kraftfeld getrennt.",
    galacticMemoryArchivePower:
      "Galaktisches Gedächtnisarchiv-Energie Erforscht\n\nDu kannst jetzt die Energie des Galaktischen Gedächtnisarchivs für die Nutzung im System nutzen.",
    galacticMemoryArchiveConnect:
      "Galaktisches Gedächtnisarchiv-Verbindung Erforscht\n\nDu kannst jetzt die Energie des Galaktischen Gedächtnisarchivs über die Galaxie hinweg verbinden.",
  },
  it: {
    knowledgeSharing:
      "Condivisione della Conoscenza Ricercata\n\nOra puoi aprire Club Scientifici!",
    fusionTheory: "Teoria della Fusione Ricercata\n\nUtile per esperimenti futuri!",
    hydrogenFusion: "Fusione dell'Idrogeno Ricercata\n\nOra puoi fondere l'Idrogeno!",
    heliumFusion: "Fusione dell'Elio Ricercata\n\nOra puoi fondere l'Elio!",
    carbonFusion: "Fusione del Carbonio Ricercata\n\nOra puoi fondere il Carbonio!",
    basicPowerGeneration:
      "Generazione di Energia di Base Ricercata\n\nOra puoi costruire Centrali Elettriche di base!",
    sodiumIonPowerStorage:
      "Accumulo di Energia a Ioni di Sodio Ricercato\n\nPuoi costruire una Batteria agli Ioni di Sodio per immagazzinare energia!",
    solarPowerGeneration:
      "Generazione di Energia Solare Ricercata\n\nOra puoi costruire Pannelli Solari per generare energia!",
    giganticTurbines:
      "Turbine Gigantesche Ricercate\n\nQuesto apre nuove ricerche nella generazione di energia!",
    advancedPowerGeneration:
      "Generazione di Energia Avanzata Ricercata\n\nCostruisci Centrali Elettriche Avanzate!",
    rocketComposites:
      "Compositi per Razzi Ricercati\n\nOra puoi costruire Parti di Razzi e AutoBuyer di Livello 3 e 4!",
    advancedFuels: "Carburanti Avanzati Ricercati\n\nOra puoi rifornire i Razzi di carburante!",
    planetaryNavigation:
      "Navigazione Planetaria Ricercata\n\nOra puoi viaggiare verso gli Asteroidi!",
    neonFusion: "Fusione del Neon Ricercata\n\nOra puoi fondere il Neon!",
    oxygenFusion: "Fusione dell'Ossigeno Ricercata\n\nOra puoi fondere l'Ossigeno!",
    compounds: "Composti Ricercati\n\nSblocca la scheda dei Composti!",
    siliconFusion: "Fusione del Silicio Ricercata\n\nOra puoi fondere il Silicio!",
    aggregateMixing:
      "Miscelazione Aggregati Ricercata\n\nOra puoi produrre composti di Calcestruzzo!",
    steelFoundries: "Fonderie di Acciaio Ricercate\n\nOra puoi creare composti di Acciaio!",
    nanoTubeTechnology:
      "Tecnologia dei Nanotubi Ricercata\n\nCon questo possiamo iniziare a imparare come fondere il Carbonio in futuro!",
    hydroCarbons:
      "Idrocarburi Ricercati\n\nPuoi accedere al Carburante Diesel una volta sbloccati i Composti!",
    stellarCartography: "Cartografia Stellare Ricercata\n\nHai sbloccato la scheda Interstellare!",
    quantumComputing:
      "Informatica Quantistica Ricercata\n\nMacchinari più avanzati sono ora disponibili!",
    scienceLaboratories:
      "Laboratori Scientifici Ricercati\n\nOra puoi costruire Laboratori Scientifici!",
    nobleGasCollection:
      "Raccolta di Gas Nobili Ricercata\n\nOra puoi immagazzinare Gas Nobili quando fusi!",
    neutronCapture:
      "Cattura di Neutroni Ricercata\n\nQuesto ci permetterà ora di fondere il Titanio, un materiale versatile e durevole essenziale per la costruzione avanzata e la tecnologia!",
    glassManufacture: "Fabbricazione del Vetro Ricercata\n\nOra puoi produrre composti di Vetro!",
    atmosphericTelescopes:
      "Telescopi Atmosferici Ricercati\n\nOra puoi ottenere dati dal vicinato stellare locale!",
    fusionEfficiencyI:
      "Efficienza di Fusione I Ricercata\n\n20% di aumento ai rendimenti della Fusione!",
    fusionEfficiencyII:
      "Efficienza di Fusione II Ricercata\n\nUlteriore 20% di aumento ai rendimenti della Fusione!",
    fusionEfficiencyIII: "Efficienza di Fusione III Ricercata\n\n100% di rendimenti della Fusione!",
    orbitalConstruction:
      "Costruzione Orbitale Ricercata\n\nOra puoi costruire Moduli di Astronavi!",
    antimatterEngines:
      "Motori ad Antimateria Ricercati\n\nOra puoi costruire Motori ad Antimateria che permettono Viaggi Interstellari!",
    FTLTravelTheory:
      "Teoria di Viaggio FTL Ricercata\n\nOra puoi ricercare come viaggiare più veloce della luce!",
    lifeSupportSystems:
      "Sistemi di Supporto Vitale Ricercati\n\nOra puoi sostenere la vita nello spazio profondo!",
    starshipFleets:
      "Flotte di Astronavi Ricercate\n\nOra puoi costruire capacità Offensive delle Astronavi!",
    stellarScanners:
      "Scanner Stellari Ricercati\n\nQuando arrivi in un nuovo Sistema Stellare puoi vedere dettagli della vita aliena e se rappresenta una minaccia!",
    dysonSphereUnderstanding:
      "Comprensione della Sfera di Dyson Ricercata\n\nOra capisci cos'è una Sfera di Dyson.",
    dysonSphereCapabilities:
      "Capacità della Sfera di Dyson Ricercate\n\nOra capisci cosa può fare una Sfera di Dyson.",
    dysonSphereDisconnect:
      "Disconnessione della Sfera di Dyson Ricercata\n\nHai disconnesso la Sfera di Dyson dal Campo di Forza del Sistema Miaplacidus.",
    dysonSpherePower:
      "Energia della Sfera di Dyson Ricercata\n\nOra puoi sfruttare l energia della Sfera di Dyson per l uso all interno del sistema.",
    dysonSphereConnect:
      "Connessione della Sfera di Dyson Ricercata\n\nOra puoi collegare l energia della Sfera di Dyson attraverso la galassia.",
    celestialProcessingCoreUnderstanding:
      "Comprensione del Nucleo di Elaborazione Celeste Ricercata\n\nOra capisci cos è il Nucleo di Elaborazione Celeste.",
    celestialProcessingCoreCapabilities:
      "Capacità del Nucleo di Elaborazione Celeste Ricercate\n\nOra capisci cosa può fare il Nucleo di Elaborazione Celeste.",
    celestialProcessingCoreDisconnect:
      "Disconnessione del Nucleo di Elaborazione Celeste Ricercata\n\nHai disconnesso il Nucleo di Elaborazione Celeste dal Campo di Forza del Sistema Miaplacidus.",
    celestialProcessingCorePower:
      "Energia del Nucleo di Elaborazione Celeste Ricercata\n\nOra puoi sfruttare l energia del Nucleo di Elaborazione Celeste per l uso all interno del sistema.",
    celestialProcessingCoreConnect:
      "Connessione del Nucleo di Elaborazione Celeste Ricercata\n\nOra puoi collegare l energia del Nucleo di Elaborazione Celeste attraverso la galassia.",
    plasmaForgeUnderstanding:
      "Comprensione della Fucina al Plasma Ricercata\n\nOra capisci cos è la Fucina al Plasma.",
    plasmaForgeCapabilities:
      "Capacità della Fucina al Plasma Ricercate\n\nOra capisci cosa può fare la Fucina al Plasma.",
    plasmaForgeDisconnect:
      "Disconnessione della Fucina al Plasma Ricercata\n\nHai disconnesso la Fucina al Plasma dal Campo di Forza del Sistema Miaplacidus.",
    plasmaForgePower:
      "Energia della Fucina al Plasma Ricercata\n\nOra puoi sfruttare l energia della Fucina al Plasma per l uso all interno del sistema.",
    plasmaForgeConnect:
      "Connessione della Fucina al Plasma Ricercata\n\nOra puoi collegare l energia della Fucina al Plasma attraverso la galassia.",
    galacticMemoryArchiveUnderstanding:
      "Comprensione dell Archivio di Memoria Galattica Ricercata\n\nOra capisci cos è l Archivio di Memoria Galattica.",
    galacticMemoryArchiveCapabilities:
      "Capacità dell Archivio di Memoria Galattica Ricercate\n\nOra capisci cosa può fare l Archivio di Memoria Galattica.",
    galacticMemoryArchiveDisconnect:
      "Disconnessione dell Archivio di Memoria Galattica Ricercata\n\nHai disconnesso l Archivio di Memoria Galattica dal Campo di Forza del Sistema Miaplacidus.",
    galacticMemoryArchivePower:
      "Energia dell Archivio di Memoria Galattica Ricercata\n\nOra puoi sfruttare l energia dell Archivio di Memoria Galattica per l uso all interno del sistema.",
    galacticMemoryArchiveConnect:
      "Connessione dell Archivio di Memoria Galattica Ricercata\n\nOra puoi collegare l energia dell Archivio di Memoria Galattica attraverso la galassia.",
  },
  fr: {
    knowledgeSharing:
      "Partage des Connaissances Recherché\n\nTu peux maintenant ouvrir des Clubs Scientifiques!",
    fusionTheory: "Théorie de la Fusion Recherchée\n\nUtile pour les expériences futures!",
    hydrogenFusion: "Fusion de l'Hydrogène Recherchée\n\nTu peux maintenant fusionner l'Hydrogène!",
    heliumFusion: "Fusion de l'Hélium Recherchée\n\nTu peux maintenant fusionner l'Hélium!",
    carbonFusion: "Fusion du Carbone Recherchée\n\nTu peux maintenant fusionner le Carbone!",
    basicPowerGeneration:
      "Génération d'Énergie de Base Recherchée\n\nTu peux maintenant construire des Centrales Électriques de base!",
    sodiumIonPowerStorage:
      "Stockage d'Énergie à Ions de Sodium Recherché\n\nTu peux construire une Batterie à Ions de Sodium pour stocker de l'énergie!",
    solarPowerGeneration:
      "Génération d'Énergie Solaire Recherchée\n\nTu peux maintenant construire des Panneaux Solaires pour générer de l'énergie!",
    giganticTurbines:
      "Turbines Géantes Recherchées\n\nCela ouvre de nouvelles recherches dans la production d'énergie!",
    advancedPowerGeneration:
      "Génération d'Énergie Avancée Recherchée\n\nConstruis des Centrales Électriques Avancées!",
    rocketComposites:
      "Composites de Fusées Recherchés\n\nTu peux maintenant construire des Pièces de Fusées et des AutoBuyers de Niveau 3 et 4!",
    advancedFuels:
      "Carburants Avancés Recherchés\n\nTu peux maintenant faire le plein de carburant des Fusées!",
    planetaryNavigation:
      "Navigation Planétaire Recherchée\n\nTu peux maintenant voyager vers les Astéroïdes!",
    neonFusion: "Fusion du Néon Recherchée\n\nTu peux maintenant fusionner le Néon!",
    oxygenFusion: "Fusion de l'Oxygène Recherchée\n\nTu peux maintenant fusionner l'Oxygène!",
    compounds: "Composés Recherchés\n\nDébloque l'onglet des Composés!",
    siliconFusion: "Fusion du Silicium Recherchée\n\nTu peux maintenant fusionner le Silicium!",
    aggregateMixing:
      "Mélange d'Agrégats Recherché\n\nTu peux maintenant produire des composés de Béton!",
    steelFoundries:
      "Fonderies d'Acier Recherchées\n\nTu peux maintenant créer des composés d'Acier!",
    nanoTubeTechnology:
      "Technologie des Nanotubes Recherchée\n\nAvec ceci, nous pouvons commencer à apprendre comment fusionner le Carbone dans le futur!",
    hydroCarbons:
      "Hydrocarbures Recherchés\n\nTu peux accéder au Carburant Diesel une fois que tu as débloqué les Composés!",
    stellarCartography:
      "Cartographie Stellaire Recherchée\n\nTu as débloqué l'onglet Interstellaire!",
    quantumComputing:
      "Informatique Quantique Recherchée\n\nDes machines plus avancées sont maintenant disponibles!",
    scienceLaboratories:
      "Laboratoires Scientifiques Recherchés\n\nTu peux maintenant construire des Laboratoires Scientifiques!",
    nobleGasCollection:
      "Collection de Gaz Nobles Recherchée\n\nTu peux maintenant stocker les Gaz Nobles lorsqu'ils sont fusionnés!",
    neutronCapture:
      "Capture de Neutrons Recherchée\n\nCela nous permettra maintenant de fusionner le Titane, un matériau versatile et durable essentiel pour la construction avancée et la technologie!",
    glassManufacture:
      "Fabrication de Verre Recherchée\n\nTu peux maintenant produire des composés de Verre!",
    atmosphericTelescopes:
      "Télescopes Atmosphériques Recherchés\n\nTu peux maintenant obtenir des données du voisinage stellaire local!",
    fusionEfficiencyI:
      "Efficacité de Fusion I Recherchée\n\n20% d'augmentation des rendements de Fusion!",
    fusionEfficiencyII:
      "Efficacité de Fusion II Recherchée\n\n20% d'augmentation supplémentaire des rendements de Fusion!",
    fusionEfficiencyIII: "Efficacité de Fusion III Recherchée\n\n100% de rendements de Fusion!",
    orbitalConstruction:
      "Construction Orbitale Recherchée\n\nTu peux maintenant construire des Modules de Vaisseaux Stellaires!",
    antimatterEngines:
      "Moteurs à Antimatière Recherchés\n\nTu peux maintenant construire des Moteurs à Antimatière permettant les Voyages Interstellaires!",
    FTLTravelTheory:
      "Théorie de Voyage FTL Recherchée\n\nTu peux maintenant rechercher comment voyager plus vite que la lumière!",
    lifeSupportSystems:
      "Systèmes de Support de Vie Recherchés\n\nTu peux maintenant maintenir la vie dans l'espace profond!",
    starshipFleets:
      "Flottes de Vaisseaux Stellaires Recherchées\n\nTu peux maintenant construire des capacités Offensives de Vaisseaux Stellaires!",
    stellarScanners:
      "Scanners Stellaires Recherchés\n\nQuand tu arrives dans un nouveau Système Stellaire, tu peux voir des détails sur la vie alien et si elle représente une menace!",
    dysonSphereUnderstanding:
      "Compréhension de la Sphère de Dyson Recherchée\n\nTu comprends maintenant ce qu'est une Sphère de Dyson.",
    dysonSphereCapabilities:
      "Capacités de la Sphère de Dyson Recherchées\n\nTu comprends maintenant ce qu'une Sphère de Dyson peut faire.",
    dysonSphereDisconnect:
      "Déconnexion de la Sphère de Dyson Recherchée\n\nTu as déconnecté la Sphère de Dyson du Champ de Force du Système Miaplacidus.",
    dysonSpherePower:
      "Énergie de la Sphère de Dyson Recherchée\n\nTu peux maintenant exploiter l énergie de la Sphère de Dyson pour une utilisation au sein du système.",
    dysonSphereConnect:
      "Connexion de la Sphère de Dyson Recherchée\n\nTu peux maintenant connecter l énergie de la Sphère de Dyson à travers la galaxie.",
    celestialProcessingCoreUnderstanding:
      "Compréhension du Cœur de Traitement Céleste Recherchée\n\nTu comprends maintenant ce qu est le Cœur de Traitement Céleste.",
    celestialProcessingCoreCapabilities:
      "Capacités du Cœur de Traitement Céleste Recherchées\n\nTu comprends maintenant ce qu un Cœur de Traitement Céleste peut faire.",
    celestialProcessingCoreDisconnect:
      "Déconnexion du Cœur de Traitement Céleste Recherchée\n\nTu as déconnecté le Cœur de Traitement Céleste du Champ de Force du Système Miaplacidus.",
    celestialProcessingCorePower:
      "Énergie du Cœur de Traitement Céleste Recherchée\n\nTu peux maintenant exploiter l énergie du Cœur de Traitement Céleste pour une utilisation au sein du système.",
    celestialProcessingCoreConnect:
      "Connexion du Cœur de Traitement Céleste Recherchée\n\nTu peux maintenant connecter l énergie du Cœur de Traitement Céleste à travers la galaxie.",
    plasmaForgeUnderstanding:
      "Compréhension de la Forge de Plasma Recherchée\n\nTu comprends maintenant ce qu est la Forge de Plasma.",
    plasmaForgeCapabilities:
      "Capacités de la Forge de Plasma Recherchées\n\nTu comprends maintenant ce qu une Forge de Plasma peut faire.",
    plasmaForgeDisconnect:
      "Déconnexion de la Forge de Plasma Recherchée\n\nTu as déconnecté la Forge de Plasma du Champ de Force du Système Miaplacidus.",
    plasmaForgePower:
      "Énergie de la Forge de Plasma Recherchée\n\nTu peux maintenant exploiter l énergie de la Forge de Plasma pour une utilisation au sein du système.",
    plasmaForgeConnect:
      "Connexion de la Forge de Plasma Recherchée\n\nTu peux maintenant connecter l énergie de la Forge de Plasma à travers la galaxie.",
    galacticMemoryArchiveUnderstanding:
      "Compréhension de l Archive de Mémoire Galactique Recherchée\n\nTu comprends maintenant ce qu est l Archive de Mémoire Galactique.",
    galacticMemoryArchiveCapabilities:
      "Capacités de l Archive de Mémoire Galactique Recherchées\n\nTu comprends maintenant ce qu un Archive de Mémoire Galactique peut faire.",
    galacticMemoryArchiveDisconnect:
      "Déconnexion de l Archive de Mémoire Galactique Recherchée\n\nTu as déconnecté l Archive de Mémoire Galactique du Champ de Force du Système Miaplacidus.",
    galacticMemoryArchivePower:
      "Énergie de l Archive de Mémoire Galactique Recherchée\n\nTu peux maintenant exploiter l énergie de l Archive de Mémoire Galactique pour une utilisation au sein du système.",
    galacticMemoryArchiveConnect:
      "Connexion de l Archive de Mémoire Galactique Recherchée\n\nTu peux maintenant connecter l énergie de l Archive de Mémoire Galactique à travers la galaxie.",
  },
} satisfies Record<LocaleId, Partial<Record<TechId, string>>>;

const fallback: Record<LocaleId, string> = {
  en: "{technology} Researched!",
  es: "?{technology} investigado!",
  pt: "{technology} pesquisado!",
  de: "{technology} erforscht!",
  it: "{technology} ricercato!",
  fr: "{technology} recherch? !",
};

export function technologyNotificationText(
  locale: LocaleId,
  id: TechId,
  technology: string,
): string {
  return notices[locale][id] ?? fallback[locale].replace("{technology}", technology);
}
