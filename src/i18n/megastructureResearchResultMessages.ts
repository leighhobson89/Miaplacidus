import type { LocaleId, TechId } from "../content/ids";
import type { RandomEventDialogCopy } from "./randomEventDialogTypes";

// Source copy from Cosmic Forge localization.json. HTML line breaks become readable prose and benefit lines.
const messages: Record<LocaleId, Partial<Record<TechId, RandomEventDialogCopy>>> = {
  en: {
    dysonSphereUnderstanding: {
      title: "UNDERSTANDING THE DYSON SPHERE",
      summary: "You have studied and now understand what the MegaStructure before you is - it is a Dyson Sphere",
      lines: [
        { text: "All Batteries Double in Capacity!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    dysonSphereCapabilities: {
      title: "DYSON SPHERE CAPABILITIES",
      summary: "After studying how the Dyson Sphere works you are now confident of its capabilities and you now want to plan how you are going to disconnect it from its current role so you can somehow harness it.",
      lines: [
        { text: "All Energy producing Buildings 25% more powerful!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    dysonSphereDisconnect: {
      title: "DISCONNECTING THE DYSON SPHERE",
      summary: "You have managed to disconnect the Dyson Sphere from its current role, which was providing power to the great force field around your home star Miaplacidus",
      lines: [
        { text: "Miaplacidus Milestone Achieved!", tone: "green-ready-text" },
        { text: "+0.15 Antimatter /s forever!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    dysonSpherePower: {
      title: "HARNESSING THE DYSON SPHERE",
      summary: "You have harnessed the Dyson Sphere for the benefit of this System, its huge power will benefit you as it provides the following bonus:",
      lines: [
        { text: "Power Always On for this System!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    dysonSphereConnect: {
      title: "CONNECTING THE DYSON SPHERE TO THE FABRIC",
      summary: "You have connected this Dyson Sphere into the fabric of the galaxy meaning its benefits are now permanently available in whichever system you might one day settle. This has enormous potential.",
      lines: [
        { text: "Power Always On!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    celestialProcessingCoreUnderstanding: {
      title: "UNDERSTANDING THE CELESTIAL PROCESSING CORE",
      summary: "You have studied and now understand what the MegaStructure before you is - it is a Celestial Processing Core",
      lines: [
        { text: "Gain 50 Research per Second!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    celestialProcessingCoreCapabilities: {
      title: "CELESTIAL PROCESSING CORE CAPABILITIES",
      summary: "After studying how the Celestial Processing Core works you are now confident of its capabilities and you now want to plan how you are going to disconnect it from its current role so you can somehow harness it.",
      lines: [
        { text: "Gain 100 Research per Second!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    celestialProcessingCoreDisconnect: {
      title: "DISCONNECTING THE CELESTIAL PROCESSING CORE",
      summary: "You have managed to disconnect the Celestial Processing Core from its current role which was providing processing power to the great force field around your home star Miaplacidus",
      lines: [
        { text: "Miaplacidus Milestone Achieved!", tone: "green-ready-text" },
        { text: "+0.15 Antimatter /s forever!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    celestialProcessingCorePower: {
      title: "HARNESSING THE CELESTIAL PROCESSING CORE",
      summary: "You have harnessed the Celestial Processing Core for the benefit of this System, its huge power will benefit you as it provides the following bonus:",
      lines: [
        { text: "Gain 150 Research per Second!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    celestialProcessingCoreConnect: {
      title: "CONNECTING THE CELESTIAL PROCESSING CORE TO THE FABRIC",
      summary: "You have connected this Celestial Processing Core into the fabric of the galaxy meaning its benefits are now permanently available in whichever system you might one day settle. This has enormous potential.",
      lines: [
        { text: "Gain 200 Research Per Second!", tone: "green-ready-text" },
        { text: "Gain 500 Research Per Second in every new System!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    plasmaForgeUnderstanding: {
      title: "UNDERSTANDING THE PLASMA FORGE",
      summary: "You have studied and now understand what the MegaStructure before you is - it is a Plasma Forge",
      lines: [
        { text: "+25% Resource AutoBuyer Rates!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    plasmaForgeCapabilities: {
      title: "PLASMA FORGE CAPABILITIES",
      summary: "After studying how the Plasma Forge works you are now confident of its capabilities and you now want to plan how you are going to disconnect it from its current role so you can somehow harness it.",
      lines: [
        { text: "+50% Resource AutoBuyer Rates!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    plasmaForgeDisconnect: {
      title: "DISCONNECTING THE PLASMA FORGE",
      summary: "You have managed to disconnect the Plasma Forge from its current role which was providing plasma to the great force field around your home star Miaplacidus",
      lines: [
        { text: "Miaplacidus Milestone Achieved!", tone: "green-ready-text" },
        { text: "+0.15 Antimatter /s forever!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    plasmaForgePower: {
      title: "HARNESSING THE PLASMA FORGE",
      summary: "You have harnessed the Plasma Forge for the benefit of this System, its huge power will benefit you as it provides the following bonus:",
      lines: [
        { text: "+75% Resource AutoBuyer Rates!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    plasmaForgeConnect: {
      title: "CONNECTING THE PLASMA FORGE TO THE FABRIC",
      summary: "You have connected this Plasma Forge into the fabric of the galaxy meaning its benefits are now permanently available in whichever system you might one day settle. This has enormous potential.",
      lines: [
        { text: "Double Resource AutoBuyer Rates!", tone: "green-ready-text" },
        { text: "Resource AutoBuyer Rates are 500% higher in every new System!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    galacticMemoryArchiveUnderstanding: {
      title: "UNDERSTANDING THE GALACTIC MEMORY ARCHIVE",
      summary: "You have studied and now understand what the MegaStructure before you is - it is a Galactic Memory Archive",
      lines: [
        { text: "All Resource And Compound Storage Capacity + 100K!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    galacticMemoryArchiveCapabilities: {
      title: "GALACTIC MEMORY ARCHIVE CAPABILITIES",
      summary: "After studying how the Galactic Memory Archive works you are now confident of its capabilities and you now want to plan how you are going to disconnect it from its current role so you can somehow harness it.",
      lines: [
        { text: "All Resource And Compound Storage Capacity + 1M!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    galacticMemoryArchiveDisconnect: {
      title: "DISCONNECTING THE GALACTIC MEMORY ARCHIVE",
      summary: "You have managed to disconnect the Galactic Memory Archive from its current role which was providing memory functions to the great force field around your home star Miaplacidus",
      lines: [
        { text: "Miaplacidus Milestone Achieved!", tone: "green-ready-text" },
        { text: "+0.15 Antimatter /s forever!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    galacticMemoryArchivePower: {
      title: "HARNESSING THE GALACTIC MEMORY ARCHIVE",
      summary: "You have harnessed the Galactic Memory Archive for the benefit of this System, its huge power will benefit you as it provides the following bonus:",
      lines: [
        { text: "All Resource And Compound Storage Capacity + 1B!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
    galacticMemoryArchiveConnect: {
      title: "CONNECTING THE GALACTIC MEMORY ARCHIVE TO THE FABRIC",
      summary: "You have connected this Galactic Memory Archive into the fabric of the galaxy meaning its benefits are now permanently available in whichever system you might one day settle. This has enormous potential.",
      lines: [
        { text: "All Resource And Compound Storage Capacity + 10B!", tone: "green-ready-text" },
        { text: "All Resource And Compound Storage Capacity starts at 10B in every new System!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRM",
    },
  },
  es: {
    dysonSphereUnderstanding: {
      title: "COMPRENDIENDO LA ESFERA DE DYSON",
      summary: "Has estudiado y ahora entiendes qué es la MegaEstructura ante ti - es una Esfera de Dyson",
      lines: [
        { text: "¡Todas las Baterías duplican su Capacidad!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSphereCapabilities: {
      title: "CAPACIDADES DE LA ESFERA DE DYSON",
      summary: "Después de estudiar cómo funciona la Esfera de Dyson ahora estás seguro de sus capacidades y ahora quieres planear cómo vas a desconectarla de su rol actual para que puedas aprovecharla de alguna manera.",
      lines: [
        { text: "¡Todos los Edificios Productores de Energía 25% más poderosos!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSphereDisconnect: {
      title: "DESCONECTANDO LA ESFERA DE DYSON",
      summary: "Has logrado desconectar la Esfera de Dyson de su rol actual, que estaba proporcionando energía al gran campo de fuerza alrededor de tu estrella hogar Miaplacidus",
      lines: [
        { text: "¡Hito de Miaplacidus Logrado!", tone: "green-ready-text" },
        { text: "¡+0.15 Antimateria /s para siempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSpherePower: {
      title: "APROVECHANDO LA ESFERA DE DYSON",
      summary: "Has aprovechado la Esfera de Dyson para el beneficio de este Sistema, su enorme poder te beneficiará ya que proporciona el siguiente bono:",
      lines: [
        { text: "¡Energía Siempre Encendida para este Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSphereConnect: {
      title: "CONECTANDO LA ESFERA DE DYSON AL TEJIDO",
      summary: "Has conectado esta Esfera de Dyson al tejido de la galaxia lo que significa que sus beneficios ahora están permanentemente disponibles en cualquier sistema en el que puedas asentarte algún día. Esto tiene un potencial enorme.",
      lines: [
        { text: "¡Energía Siempre Encendida!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreUnderstanding: {
      title: "COMPRENDIENDO EL NÚCLEO DE PROCESAMIENTO CELESTIAL",
      summary: "Has estudiado y ahora entiendes qué es la MegaEstructura ante ti - es un Núcleo de Procesamiento Celestial",
      lines: [
        { text: "¡Gana 50 Investigación por Segundo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreCapabilities: {
      title: "CAPACIDADES DEL NÚCLEO DE PROCESAMIENTO CELESTIAL",
      summary: "Después de estudiar cómo funciona el Núcleo de Procesamiento Celestial ahora estás seguro de sus capacidades y ahora quieres planear cómo vas a desconectarlo de su rol actual para que puedas aprovecharlo de alguna manera.",
      lines: [
        { text: "¡Gana 100 Investigación por Segundo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreDisconnect: {
      title: "DESCONECTANDO EL NÚCLEO DE PROCESAMIENTO CELESTIAL",
      summary: "Has logrado desconectar el Núcleo de Procesamiento Celestial de su rol actual que estaba proporcionando poder de procesamiento al gran campo de fuerza alrededor de tu estrella hogar Miaplacidus",
      lines: [
        { text: "¡Hito de Miaplacidus Logrado!", tone: "green-ready-text" },
        { text: "¡+0.15 Antimateria /s para siempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCorePower: {
      title: "APROVECHANDO EL NÚCLEO DE PROCESAMIENTO CELESTIAL",
      summary: "Has aprovechado el Núcleo de Procesamiento Celestial para el beneficio de este Sistema, su enorme poder te beneficiará ya que proporciona el siguiente bono:",
      lines: [
        { text: "¡Gana 150 Investigación por Segundo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreConnect: {
      title: "CONECTANDO EL NÚCLEO DE PROCESAMIENTO CELESTIAL AL TEJIDO",
      summary: "Has conectado este Núcleo de Procesamiento Celestial al tejido de la galaxia lo que significa que sus beneficios ahora están permanentemente disponibles en cualquier sistema en el que puedas asentarte algún día. Esto tiene un potencial enorme.",
      lines: [
        { text: "¡Gana 200 Investigación por Segundo!", tone: "green-ready-text" },
        { text: "¡Gana 500 Investigación por Segundo en cada nuevo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeUnderstanding: {
      title: "COMPRENDIENDO LA FORJA DE PLASMA",
      summary: "Has estudiado y ahora entiendes qué es la MegaEstructura ante ti - es una Forja de Plasma",
      lines: [
        { text: "¡+25% Tasas de AutoCompra de Recursos!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeCapabilities: {
      title: "CAPACIDADES DE LA FORJA DE PLASMA",
      summary: "Después de estudiar cómo funciona la Forja de Plasma ahora estás seguro de sus capacidades y ahora quieres planear cómo vas a desconectarla de su rol actual para que puedas aprovecharla de alguna manera.",
      lines: [
        { text: "¡+50% Tasas de AutoCompra de Recursos!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeDisconnect: {
      title: "DESCONECTANDO LA FORJA DE PLASMA",
      summary: "Has logrado desconectar la Forja de Plasma de su rol actual que estaba proporcionando plasma al gran campo de fuerza alrededor de tu estrella hogar Miaplacidus",
      lines: [
        { text: "¡Hito de Miaplacidus Logrado!", tone: "green-ready-text" },
        { text: "¡+0.15 Antimateria /s para siempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgePower: {
      title: "APROVECHANDO LA FORJA DE PLASMA",
      summary: "Has aprovechado la Forja de Plasma para el beneficio de este Sistema, su enorme poder te beneficiará ya que proporciona el siguiente bono:",
      lines: [
        { text: "¡+75% Tasas de AutoCompra de Recursos!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeConnect: {
      title: "CONECTANDO LA FORJA DE PLASMA AL TEJIDO",
      summary: "Has conectado esta Forja de Plasma al tejido de la galaxia lo que significa que sus beneficios ahora están permanentemente disponibles en cualquier sistema en el que puedas asentarte algún día. Esto tiene un potencial enorme.",
      lines: [
        { text: "¡Duplicar Tasas de AutoCompra de Recursos!", tone: "green-ready-text" },
        { text: "¡Las Tasas de AutoCompra de Recursos son 500% más altas en cada nuevo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveUnderstanding: {
      title: "COMPRENDIENDO EL ARCHIVO DE MEMORIA GALÁCTICA",
      summary: "Has estudiado y ahora entiendes qué es la MegaEstructura ante ti - es un Archivo de Memoria Galáctica",
      lines: [
        { text: "¡Capacidad de Almacenamiento de Todos los Recursos y Compuestos + 100K!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveCapabilities: {
      title: "CAPACIDADES DEL ARCHIVO DE MEMORIA GALÁCTICA",
      summary: "Después de estudiar cómo funciona el Archivo de Memoria Galáctica ahora estás seguro de sus capacidades y ahora quieres planear cómo vas a desconectarlo de su rol actual para que puedas aprovecharlo de alguna manera.",
      lines: [
        { text: "¡Capacidad de Almacenamiento de Todos los Recursos y Compuestos + 1M!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveDisconnect: {
      title: "DESCONECTANDO EL ARCHIVO DE MEMORIA GALÁCTICA",
      summary: "Has logrado desconectar el Archivo de Memoria Galáctica de su rol actual que estaba proporcionando funciones de memoria al gran campo de fuerza alrededor de tu estrella hogar Miaplacidus",
      lines: [
        { text: "¡Hito de Miaplacidus Logrado!", tone: "green-ready-text" },
        { text: "¡+0.15 Antimateria /s para siempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchivePower: {
      title: "APROVECHANDO EL ARCHIVO DE MEMORIA GALÁCTICA",
      summary: "Has aprovechado el Archivo de Memoria Galáctica para el beneficio de este Sistema, su enorme poder te beneficiará ya que proporciona el siguiente bono:",
      lines: [
        { text: "¡Capacidad de Almacenamiento de Todos los Recursos y Compuestos + 1B!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveConnect: {
      title: "CONECTANDO EL ARCHIVO DE MEMORIA GALÁCTICA AL TEJIDO",
      summary: "Has conectado este Archivo de Memoria Galáctica al tejido de la galaxia lo que significa que sus beneficios ahora están permanentemente disponibles en cualquier sistema en el que puedas asentarte algún día. Esto tiene un potencial enorme.",
      lines: [
        { text: "¡Capacidad de Almacenamiento de Todos los Recursos y Compuestos + 10B!", tone: "green-ready-text" },
        { text: "¡La Capacidad de Almacenamiento de Todos los Recursos y Compuestos comienza en 10B en cada nuevo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
  },
  pt: {
    dysonSphereUnderstanding: {
      title: "COMPREENDENDO A ESFERA DE DYSON",
      summary: "Estudaste e agora compreendes o que é a Megaestrutura diante de ti - é uma Esfera de Dyson",
      lines: [
        { text: "Todas as Baterias duplicam a sua Capacidade!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSphereCapabilities: {
      title: "CAPACIDADES DA ESFERA DE DYSON",
      summary: "Depois de estudar como funciona a Esfera de Dyson, estás agora seguro das suas capacidades e queres planear como a vais desligar do seu papel atual para que possas aproveitá-la de alguma forma.",
      lines: [
        { text: "Todos os Edifícios Produtores de Energia são 25% mais potentes!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSphereDisconnect: {
      title: "DESLIGANDO A ESFERA DE DYSON",
      summary: "Conseguiste desligar a Esfera de Dyson do seu papel atual, que estava a fornecer energia ao grande campo de força em torno da tua estrela natal, Miaplacidus",
      lines: [
        { text: "Marco de Miaplacidus Alcançado!", tone: "green-ready-text" },
        { text: "+0,15 Antimatéria /s para sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSpherePower: {
      title: "APROVEITANDO A ESFERA DE DYSON",
      summary: "Aproveitaste a Esfera de Dyson para benefício deste Sistema, o seu enorme poder irá beneficiar-te, fornecendo o seguinte bónus:",
      lines: [
        { text: "Energia Sempre Ligada para este Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    dysonSphereConnect: {
      title: "LIGANDO A ESFERA DE DYSON AO TECIDO",
      summary: "Ligaste esta Esfera de Dyson ao tecido da galáxia, o que significa que os seus benefícios estão agora permanentemente disponíveis em qualquer sistema onde possas estabelecer-te um dia. Isto tem um potencial enorme.",
      lines: [
        { text: "Energia Sempre Ligada!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreUnderstanding: {
      title: "COMPREENDENDO O NÚCLEO DE PROCESSAMENTO CELESTIAL",
      summary: "Estudaste e agora compreendes o que é a Megaestrutura diante de ti - é um Núcleo de Processamento Celestial",
      lines: [
        { text: "Ganha 50 de Investigação por Segundo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreCapabilities: {
      title: "CAPACIDADES DO NÚCLEO DE PROCESSAMENTO CELESTIAL",
      summary: "Depois de estudar como funciona o Núcleo de Processamento Celestial, estás agora seguro das suas capacidades e queres planear como o vais desligar do seu papel atual para que possas aproveitá-lo de alguma forma.",
      lines: [
        { text: "Ganha 100 de Investigação por Segundo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreDisconnect: {
      title: "DESLIGANDO O NÚCLEO DE PROCESSAMENTO CELESTIAL",
      summary: "Conseguiste desligar o Núcleo de Processamento Celestial do seu papel atual, que estava a fornecer poder de processamento ao grande campo de força em torno da tua estrela natal, Miaplacidus",
      lines: [
        { text: "Marco de Miaplacidus Alcançado!", tone: "green-ready-text" },
        { text: "+0,15 Antimatéria /s para sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCorePower: {
      title: "APROVEITANDO O NÚCLEO DE PROCESSAMENTO CELESTIAL",
      summary: "Aproveitaste o Núcleo de Processamento Celestial para benefício deste Sistema, o seu enorme poder irá beneficiar-te, fornecendo o seguinte bónus:",
      lines: [
        { text: "Ganha 150 de Investigação por Segundo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    celestialProcessingCoreConnect: {
      title: "LIGANDO O NÚCLEO DE PROCESSAMENTO CELESTIAL AO TECIDO",
      summary: "Ligaste este Núcleo de Processamento Celestial ao tecido da galáxia, o que significa que os seus benefícios estão agora permanentemente disponíveis em qualquer sistema onde possas estabelecer-te um dia. Isto tem um potencial enorme.",
      lines: [
        { text: "Ganha 200 de Investigação por Segundo!", tone: "green-ready-text" },
        { text: "Ganha 500 de Investigação por Segundo em cada novo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeUnderstanding: {
      title: "COMPREENDENDO A FORJA DE PLASMA",
      summary: "Estudaste e agora compreendes o que é a Megaestrutura diante de ti - é uma Forja de Plasma",
      lines: [
        { text: "+25% às Taxas de Compra Automática de Recursos!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeCapabilities: {
      title: "CAPACIDADES DA FORJA DE PLASMA",
      summary: "Depois de estudar como funciona a Forja de Plasma, estás agora seguro das suas capacidades e queres planear como a vais desligar do seu papel atual para que possas aproveitá-la de alguma forma.",
      lines: [
        { text: "+50% às Taxas de Compra Automática de Recursos!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeDisconnect: {
      title: "DESLIGANDO A FORJA DE PLASMA",
      summary: "Conseguiste desligar a Forja de Plasma do seu papel atual, que estava a fornecer plasma ao grande campo de força em torno da tua estrela natal, Miaplacidus",
      lines: [
        { text: "Marco de Miaplacidus Alcançado!", tone: "green-ready-text" },
        { text: "+0,15 Antimatéria /s para sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgePower: {
      title: "APROVEITANDO A FORJA DE PLASMA",
      summary: "Aproveitaste a Forja de Plasma para benefício deste Sistema, o seu enorme poder irá beneficiar-te, fornecendo o seguinte bónus:",
      lines: [
        { text: "+75% às Taxas de Compra Automática de Recursos!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    plasmaForgeConnect: {
      title: "LIGANDO A FORJA DE PLASMA AO TECIDO",
      summary: "Ligaste esta Forja de Plasma ao tecido da galáxia, o que significa que os seus benefícios estão agora permanentemente disponíveis em qualquer sistema onde possas estabelecer-te um dia. Isto tem um potencial enorme.",
      lines: [
        { text: "Duplicar as Taxas de Compra Automática de Recursos!", tone: "green-ready-text" },
        { text: "As Taxas de Compra Automática de Recursos são 500% mais altas em cada novo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveUnderstanding: {
      title: "COMPREENDENDO O ARQUIVO DE MEMÓRIA GALÁCTICA",
      summary: "Estudaste e agora compreendes o que é a Megaestrutura diante de ti - é um Arquivo de Memória Galáctica",
      lines: [
        { text: "Capacidade de Armazenamento de Todos os Recursos e Compostos + 100K!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveCapabilities: {
      title: "CAPACIDADES DO ARQUIVO DE MEMÓRIA GALÁCTICA",
      summary: "Depois de estudar como funciona o Arquivo de Memória Galáctica, estás agora seguro das suas capacidades e queres planear como o vais desligar do seu papel atual para que possas aproveitá-lo de alguma forma.",
      lines: [
        { text: "Capacidade de Armazenamento de Todos os Recursos e Compostos + 1M!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveDisconnect: {
      title: "DESLIGANDO O ARQUIVO DE MEMÓRIA GALÁCTICA",
      summary: "Conseguiste desligar o Arquivo de Memória Galáctica do seu papel atual, que estava a fornecer funções de memória ao grande campo de força em torno da tua estrela natal, Miaplacidus",
      lines: [
        { text: "Marco de Miaplacidus Alcançado!", tone: "green-ready-text" },
        { text: "+0,15 Antimatéria /s para sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchivePower: {
      title: "APROVEITANDO O ARQUIVO DE MEMÓRIA GALÁCTICA",
      summary: "Aproveitaste o Arquivo de Memória Galáctica para benefício deste Sistema, o seu enorme poder irá beneficiar-te, fornecendo o seguinte bónus:",
      lines: [
        { text: "Capacidade de Armazenamento de Todos os Recursos e Compostos + 1B!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
    galacticMemoryArchiveConnect: {
      title: "LIGANDO O ARQUIVO DE MEMÓRIA GALÁCTICA AO TECIDO",
      summary: "Ligaste este Arquivo de Memória Galáctica ao tecido da galáxia, o que significa que os seus benefícios estão agora permanentemente disponíveis em qualquer sistema onde possas estabelecer-te um dia. Isto tem um potencial enorme.",
      lines: [
        { text: "Capacidade de Armazenamento de Todos os Recursos e Compostos + 10B!", tone: "green-ready-text" },
        { text: "A Capacidade de Armazenamento de Todos os Recursos e Compostos começa em 10B em cada novo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMAR",
    },
  },
  de: {
    dysonSphereUnderstanding: {
      title: "DIE DYSON-SPHÄRE VERSTEHEN",
      summary: "Du hast studiert und verstehst jetzt, was die MegaStruktur vor dir ist - es ist eine Dyson-Sphäre",
      lines: [
        { text: "Alle Batterien verdoppeln ihre Kapazität!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    dysonSphereCapabilities: {
      title: "FÄHIGKEITEN DER DYSON-SPHÄRE",
      summary: "Nachdem du studiert hast, wie die Dyson-Sphäre funktioniert, bist du jetzt zuversichtlich über ihre Fähigkeiten und du willst jetzt planen, wie du sie von ihrer aktuellen Rolle trennen wirst, damit du sie irgendwie nutzen kannst.",
      lines: [
        { text: "Alle Energie produzierenden Gebäude 25% leistungsfähiger!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    dysonSphereDisconnect: {
      title: "DIE DYSON-SPHÄRE TRENNEN",
      summary: "Es ist dir gelungen, die Dyson-Sphäre von ihrer aktuellen Rolle zu trennen, die darin bestand, Energie für das große Kraftfeld um deinen Heimatstern Miaplacidus bereitzustellen",
      lines: [
        { text: "Miaplacidus-Meilenstein erreicht!", tone: "green-ready-text" },
        { text: "+0,15 Antimaterie /s für immer!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    dysonSpherePower: {
      title: "DIE DYSON-SPHÄRE NUTZEN",
      summary: "Du hast die Dyson-Sphäre zum Vorteil dieses Systems genutzt, ihre riesige Kraft wird dir zugutekommen, da sie folgenden Bonus bietet:",
      lines: [
        { text: "Energie Immer An für dieses System!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    dysonSphereConnect: {
      title: "DIE DYSON-SPHÄRE AN DAS GEWEBE ANSCHLIESSEN",
      summary: "Du hast diese Dyson-Sphäre an das Gewebe der Galaxis angeschlossen, was bedeutet, dass ihre Vorteile jetzt dauerhaft verfügbar sind, in welchem System du auch immer eines Tages siedeln magst. Dies hat enormes Potenzial.",
      lines: [
        { text: "Energie Immer An!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    celestialProcessingCoreUnderstanding: {
      title: "DAS HIMMLISCHE VERARBEITUNGSKERN VERSTEHEN",
      summary: "Du hast studiert und verstehst jetzt, was die MegaStruktur vor dir ist - es ist ein Himmlischer Verarbeitungskern",
      lines: [
        { text: "Erhalte 50 Forschung pro Sekunde!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    celestialProcessingCoreCapabilities: {
      title: "FÄHIGKEITEN DES HIMMLISCHEN VERARBEITUNGSKERNS",
      summary: "Nachdem du studiert hast, wie der Himmlische Verarbeitungskern funktioniert, bist du jetzt zuversichtlich über seine Fähigkeiten und du willst jetzt planen, wie du ihn von seiner aktuellen Rolle trennen wirst, damit du ihn irgendwie nutzen kannst.",
      lines: [
        { text: "Erhalte 100 Forschung pro Sekunde!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    celestialProcessingCoreDisconnect: {
      title: "DEN HIMMLISCHEN VERARBEITUNGSKERN TRENNEN",
      summary: "Es ist dir gelungen, den Himmlischen Verarbeitungskern von seiner aktuellen Rolle zu trennen, die darin bestand, Verarbeitungsleistung für das große Kraftfeld um deinen Heimatstern Miaplacidus bereitzustellen",
      lines: [
        { text: "Miaplacidus-Meilenstein erreicht!", tone: "green-ready-text" },
        { text: "+0,15 Antimaterie /s für immer!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    celestialProcessingCorePower: {
      title: "DEN HIMMLISCHEN VERARBEITUNGSKERN NUTZEN",
      summary: "Du hast den Himmlischen Verarbeitungskern zum Vorteil dieses Systems genutzt, seine riesige Kraft wird dir zugutekommen, da er folgenden Bonus bietet:",
      lines: [
        { text: "Erhalte 150 Forschung pro Sekunde!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    celestialProcessingCoreConnect: {
      title: "DEN HIMMLISCHEN VERARBEITUNGSKERN AN DAS GEWEBE ANSCHLIESSEN",
      summary: "Du hast diesen Himmlischen Verarbeitungskern an das Gewebe der Galaxis angeschlossen, was bedeutet, dass seine Vorteile jetzt dauerhaft verfügbar sind, in welchem System du auch immer eines Tages siedeln magst. Dies hat enormes Potenzial.",
      lines: [
        { text: "Erhalte 200 Forschung pro Sekunde!", tone: "green-ready-text" },
        { text: "Erhalte 500 Forschung pro Sekunde in jedem neuen System!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    plasmaForgeUnderstanding: {
      title: "DAS PLASMASCHMIEDEVERSTEHEN",
      summary: "Du hast studiert und verstehst jetzt, was die MegaStruktur vor dir ist - es ist eine Plasmaschmiede",
      lines: [
        { text: "+25% Ressourcen-AutoKäufer-Raten!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    plasmaForgeCapabilities: {
      title: "FÄHIGKEITEN DER PLASMASCHMIEDE",
      summary: "Nachdem du studiert hast, wie die Plasmaschmiede funktioniert, bist du jetzt zuversichtlich über ihre Fähigkeiten und du willst jetzt planen, wie du sie von ihrer aktuellen Rolle trennen wirst, damit du sie irgendwie nutzen kannst.",
      lines: [
        { text: "+50% Ressourcen-AutoKäufer-Raten!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    plasmaForgeDisconnect: {
      title: "DIE PLASMASCHMIEDE TRENNEN",
      summary: "Es ist dir gelungen, die Plasmaschmiede von ihrer aktuellen Rolle zu trennen, die darin bestand, Plasma für das große Kraftfeld um deinen Heimatstern Miaplacidus bereitzustellen",
      lines: [
        { text: "Miaplacidus-Meilenstein erreicht!", tone: "green-ready-text" },
        { text: "+0,15 Antimaterie /s für immer!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    plasmaForgePower: {
      title: "DIE PLASMASCHMIEDE NUTZEN",
      summary: "Du hast die Plasmaschmiede zum Vorteil dieses Systems genutzt, ihre riesige Kraft wird dir zugutekommen, da sie folgenden Bonus bietet:",
      lines: [
        { text: "+75% Ressourcen-AutoKäufer-Raten!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    plasmaForgeConnect: {
      title: "DIE PLASMASCHMIEDE AN DAS GEWEBE ANSCHLIESSEN",
      summary: "Du hast diese Plasmaschmiede an das Gewebe der Galaxis angeschlossen, was bedeutet, dass ihre Vorteile jetzt dauerhaft verfügbar sind, in welchem System du auch immer eines Tages siedeln magst. Dies hat enormes Potenzial.",
      lines: [
        { text: "Doppelte Ressourcen-AutoKäufer-Raten!", tone: "green-ready-text" },
        { text: "Ressourcen-AutoKäufer-Raten sind in jedem neuen System um 500% höher!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    galacticMemoryArchiveUnderstanding: {
      title: "DAS GALAKTISCHE GEDÄCHTNISARCHIV VERSTEHEN",
      summary: "Du hast studiert und verstehst jetzt, was die MegaStruktur vor dir ist - es ist ein Galaktisches Gedächtnisarchiv",
      lines: [
        { text: "Alle Ressourcen- und Verbindungsspeicherkapazitäten + 100K!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    galacticMemoryArchiveCapabilities: {
      title: "FÄHIGKEITEN DES GALAKTISCHEN GEDÄCHTNISARCHIVS",
      summary: "Nachdem du studiert hast, wie das Galaktische Gedächtnisarchiv funktioniert, bist du jetzt zuversichtlich über seine Fähigkeiten und du willst jetzt planen, wie du es von seiner aktuellen Rolle trennen wirst, damit du es irgendwie nutzen kannst.",
      lines: [
        { text: "Alle Ressourcen- und Verbindungsspeicherkapazitäten + 1M!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    galacticMemoryArchiveDisconnect: {
      title: "DAS GALAKTISCHE GEDÄCHTNISARCHIV TRENNEN",
      summary: "Es ist dir gelungen, das Galaktische Gedächtnisarchiv von seiner aktuellen Rolle zu trennen, die darin bestand, Speicherfunktionen für das große Kraftfeld um deinen Heimatstern Miaplacidus bereitzustellen",
      lines: [
        { text: "Miaplacidus-Meilenstein erreicht!", tone: "green-ready-text" },
        { text: "+0,15 Antimaterie /s für immer!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    galacticMemoryArchivePower: {
      title: "DAS GALAKTISCHE GEDÄCHTNISARCHIV NUTZEN",
      summary: "Du hast das Galaktische Gedächtnisarchiv zum Vorteil dieses Systems genutzt, seine riesige Kraft wird dir zugutekommen, da es folgenden Bonus bietet:",
      lines: [
        { text: "Alle Ressourcen- und Verbindungsspeicherkapazitäten + 1B!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
    galacticMemoryArchiveConnect: {
      title: "DAS GALAKTISCHE GEDÄCHTNISARCHIV AN DAS GEWEBE ANSCHLIESSEN",
      summary: "Du hast dieses Galaktische Gedächtnisarchiv an das Gewebe der Galaxis angeschlossen, was bedeutet, dass seine Vorteile jetzt dauerhaft verfügbar sind, in welchem System du auch immer eines Tages siedeln magst. Dies hat enormes Potenzial.",
      lines: [
        { text: "Alle Ressourcen- und Verbindungsspeicherkapazitäten + 10B!", tone: "green-ready-text" },
        { text: "Alle Ressourcen- und Verbindungsspeicherkapazitäten beginnen in jedem neuen System bei 10B!", tone: "green-ready-text" },
      ],
      confirmLabel: "BESTÄTIGEN",
    },
  },
  it: {
    dysonSphereUnderstanding: {
      title: "COMPRENDERE LA SFERA DI DYSON",
      summary: "Hai studiato e ora capisci cos'è la MegaStruttura davanti a te - è una Sfera di Dyson",
      lines: [
        { text: "Tutte le Batterie Raddoppiano la Capacità!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    dysonSphereCapabilities: {
      title: "CAPACITÀ DELLA SFERA DI DYSON",
      summary: "Dopo aver studiato come funziona la Sfera di Dyson ora sei sicuro delle sue capacità e ora vuoi pianificare come stai per disconnetterla dal suo ruolo attuale così da poterla sfruttare in qualche modo.",
      lines: [
        { text: "Tutti gli Edifici Produttori di Energia 25% più potenti!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    dysonSphereDisconnect: {
      title: "DISCONNETTENDO LA SFERA DI DYSON",
      summary: "Sei riuscito a disconnettere la Sfera di Dyson dal suo ruolo attuale, che consisteva nel fornire energia al grande campo di forza attorno alla tua stella natale Miaplacidus",
      lines: [
        { text: "Pietra Miliare di Miaplacidus Raggiunta!", tone: "green-ready-text" },
        { text: "+0,15 Antimateria /s per sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    dysonSpherePower: {
      title: "SFRUTTANDO LA SFERA DI DYSON",
      summary: "Hai sfruttato la Sfera di Dyson a beneficio di questo Sistema, la sua enorme potenza ti gioverà poiché fornisce il seguente bonus:",
      lines: [
        { text: "Energia Sempre Accesa per questo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    dysonSphereConnect: {
      title: "COLLEGANDO LA SFERA DI DYSON AL TESSUTO",
      summary: "Hai collegato questa Sfera di Dyson al tessuto della galassia il che significa che i suoi benefici sono ora permanentemente disponibili in qualunque sistema in cui potresti un giorno stabilirti. Questo ha un potenziale enorme.",
      lines: [
        { text: "Energia Sempre Accesa!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    celestialProcessingCoreUnderstanding: {
      title: "COMPRENDERE IL NUCLEO DI ELABORAZIONE CELESTE",
      summary: "Hai studiato e ora capisci cos'è la MegaStruttura davanti a te - è un Nucleo di Elaborazione Celeste",
      lines: [
        { text: "Ottieni 50 Ricerca al Secondo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    celestialProcessingCoreCapabilities: {
      title: "CAPACITÀ DEL NUCLEO DI ELABORAZIONE CELESTE",
      summary: "Dopo aver studiato come funziona il Nucleo di Elaborazione Celeste ora sei sicuro delle sue capacità e ora vuoi pianificare come stai per disconnetterlo dal suo ruolo attuale così da poterlo sfruttare in qualche modo.",
      lines: [
        { text: "Ottieni 100 Ricerca al Secondo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    celestialProcessingCoreDisconnect: {
      title: "DISCONNETTENDO IL NUCLEO DI ELABORAZIONE CELESTE",
      summary: "Sei riuscito a disconnettere il Nucleo di Elaborazione Celeste dal suo ruolo attuale che consisteva nel fornire potenza di elaborazione al grande campo di forza attorno alla tua stella natale Miaplacidus",
      lines: [
        { text: "Pietra Miliare di Miaplacidus Raggiunta!", tone: "green-ready-text" },
        { text: "+0,15 Antimateria /s per sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    celestialProcessingCorePower: {
      title: "SFRUTTANDO IL NUCLEO DI ELABORAZIONE CELESTE",
      summary: "Hai sfruttato il Nucleo di Elaborazione Celeste a beneficio di questo Sistema, la sua enorme potenza ti gioverà poiché fornisce il seguente bonus:",
      lines: [
        { text: "Ottieni 150 Ricerca al Secondo!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    celestialProcessingCoreConnect: {
      title: "COLLEGANDO IL NUCLEO DI ELABORAZIONE CELESTE AL TESSUTO",
      summary: "Hai collegato questo Nucleo di Elaborazione Celeste al tessuto della galassia il che significa che i suoi benefici sono ora permanentemente disponibili in qualunque sistema in cui potresti un giorno stabilirti. Questo ha un potenziale enorme.",
      lines: [
        { text: "Ottieni 200 Ricerca al Secondo!", tone: "green-ready-text" },
        { text: "Ottieni 500 Ricerca al Secondo in ogni nuovo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    plasmaForgeUnderstanding: {
      title: "COMPRENDERE LA FORGIA DI PLASMA",
      summary: "Hai studiato e ora capisci cos'è la MegaStruttura davanti a te - è una Forgia di Plasma",
      lines: [
        { text: "+25% Velocità AutoAcquisto Risorse!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    plasmaForgeCapabilities: {
      title: "CAPACITÀ DELLA FORGIA DI PLASMA",
      summary: "Dopo aver studiato come funziona la Forgia di Plasma ora sei sicuro delle sue capacità e ora vuoi pianificare come stai per disconnetterla dal suo ruolo attuale così da poterla sfruttare in qualche modo.",
      lines: [
        { text: "+50% Velocità AutoAcquisto Risorse!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    plasmaForgeDisconnect: {
      title: "DISCONNETTENDO LA FORGIA DI PLASMA",
      summary: "Sei riuscito a disconnettere la Forgia di Plasma dal suo ruolo attuale che consisteva nel fornire plasma al grande campo di forza attorno alla tua stella natale Miaplacidus",
      lines: [
        { text: "Pietra Miliare di Miaplacidus Raggiunta!", tone: "green-ready-text" },
        { text: "+0,15 Antimateria /s per sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    plasmaForgePower: {
      title: "SFRUTTANDO LA FORGIA DI PLASMA",
      summary: "Hai sfruttato la Forgia di Plasma a beneficio di questo Sistema, la sua enorme potenza ti gioverà poiché fornisce il seguente bonus:",
      lines: [
        { text: "+75% Velocità AutoAcquisto Risorse!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    plasmaForgeConnect: {
      title: "COLLEGANDO LA FORGIA DI PLASMA AL TESSUTO",
      summary: "Hai collegato questa Forgia di Plasma al tessuto della galassia il che significa che i suoi benefici sono ora permanentemente disponibili in qualunque sistema in cui potresti un giorno stabilirti. Questo ha un potenziale enorme.",
      lines: [
        { text: "Velocità AutoAcquisto Risorse Raddoppiate!", tone: "green-ready-text" },
        { text: "Le Velocità AutoAcquisto Risorse sono 500% più alte in ogni nuovo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    galacticMemoryArchiveUnderstanding: {
      title: "COMPRENDERE L'ARCHIVIO DELLA MEMORIA GALATTICA",
      summary: "Hai studiato e ora capisci cos'è la MegaStruttura davanti a te - è un Archivio della Memoria Galattica",
      lines: [
        { text: "Capacità di Archiviazione di Tutte le Risorse e i Composti + 100K!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    galacticMemoryArchiveCapabilities: {
      title: "CAPACITÀ DELL'ARCHIVIO DELLA MEMORIA GALATTICA",
      summary: "Dopo aver studiato come funziona l'Archivio della Memoria Galattica ora sei sicuro delle sue capacità e ora vuoi pianificare come stai per disconnetterlo dal suo ruolo attuale così da poterlo sfruttare in qualche modo.",
      lines: [
        { text: "Capacità di Archiviazione di Tutte le Risorse e i Composti + 1M!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    galacticMemoryArchiveDisconnect: {
      title: "DISCONNETTENDO L'ARCHIVIO DELLA MEMORIA GALATTICA",
      summary: "Sei riuscito a disconnettere l'Archivio della Memoria Galattica dal suo ruolo attuale che consisteva nel fornire funzioni di memoria al grande campo di forza attorno alla tua stella natale Miaplacidus",
      lines: [
        { text: "Pietra Miliare di Miaplacidus Raggiunta!", tone: "green-ready-text" },
        { text: "+0,15 Antimateria /s per sempre!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    galacticMemoryArchivePower: {
      title: "SFRUTTANDO L'ARCHIVIO DELLA MEMORIA GALATTICA",
      summary: "Hai sfruttato l'Archivio della Memoria Galattica a beneficio di questo Sistema, la sua enorme potenza ti gioverà poiché fornisce il seguente bonus:",
      lines: [
        { text: "Capacità di Archiviazione di Tutte le Risorse e i Composti + 1B!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
    galacticMemoryArchiveConnect: {
      title: "COLLEGANDO L'ARCHIVIO DELLA MEMORIA GALATTICA AL TESSUTO",
      summary: "Hai collegato questo Archivio della Memoria Galattica al tessuto della galassia il che significa che i suoi benefici sono ora permanentemente disponibili in qualunque sistema in cui potresti un giorno stabilirti. Questo ha un potenziale enorme.",
      lines: [
        { text: "Capacità di Archiviazione di Tutte le Risorse e i Composti + 10B!", tone: "green-ready-text" },
        { text: "La Capacità di Archiviazione di Tutte le Risorse e i Composti inizia a 10B in ogni nuovo Sistema!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFERMA",
    },
  },
  fr: {
    dysonSphereUnderstanding: {
      title: "COMPRENDRE LA SPHÈRE DE DYSON",
      summary: "Tu as étudié et comprends maintenant ce qu'est la MégaStructure devant toi - c'est une Sphère de Dyson",
      lines: [
        { text: "Toutes les Batteries Doublent en Capacité!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    dysonSphereCapabilities: {
      title: "CAPACITÉS DE LA SPHÈRE DE DYSON",
      summary: "Après avoir étudié comment fonctionne la Sphère de Dyson tu es maintenant confiant de ses capacités et tu veux maintenant planifier comment tu vas la déconnecter de son rôle actuel pour que tu puisses d'une manière ou d'une autre l'exploiter.",
      lines: [
        { text: "Tous les Bâtiments Producteurs d'Énergie 25% plus puissants!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    dysonSphereDisconnect: {
      title: "DÉCONNECTER LA SPHÈRE DE DYSON",
      summary: "Tu as réussi à déconnecter la Sphère de Dyson de son rôle actuel, qui consistait à fournir de l'énergie au grand champ de force autour de ton étoile natale Miaplacidus",
      lines: [
        { text: "Jalon Miaplacidus Atteint!", tone: "green-ready-text" },
        { text: "+0,15 Antimatière /s pour toujours!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    dysonSpherePower: {
      title: "EXPLOITER LA SPHÈRE DE DYSON",
      summary: "Tu as exploité la Sphère de Dyson au profit de ce Système, son immense pouvoir te bénéficiera car elle fournit le bonus suivant:",
      lines: [
        { text: "Énergie Toujours Active pour ce Système!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    dysonSphereConnect: {
      title: "CONNECTER LA SPHÈRE DE DYSON AU TISSU",
      summary: "Tu as connecté cette Sphère de Dyson au tissu de la galaxie ce qui signifie que ses bénéfices sont maintenant disponibles en permanence dans quelque système que tu pourrais un jour coloniser. Cela a un potentiel énorme.",
      lines: [
        { text: "Énergie Toujours Active!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    celestialProcessingCoreUnderstanding: {
      title: "COMPRENDRE LE NOYAU DE TRAITEMENT CÉLESTE",
      summary: "Tu as étudié et comprends maintenant ce qu'est la MégaStructure devant toi - c'est un Noyau de Traitement Céleste",
      lines: [
        { text: "Gagne 50 Recherche par Seconde!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    celestialProcessingCoreCapabilities: {
      title: "CAPACITÉS DU NOYAU DE TRAITEMENT CÉLESTE",
      summary: "Après avoir étudié comment fonctionne le Noyau de Traitement Céleste tu es maintenant confiant de ses capacités et tu veux maintenant planifier comment tu vas le déconnecter de son rôle actuel pour que tu puisses d'une manière ou d'une autre l'exploiter.",
      lines: [
        { text: "Gagne 100 Recherche par Seconde!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    celestialProcessingCoreDisconnect: {
      title: "DÉCONNECTER LE NOYAU DE TRAITEMENT CÉLESTE",
      summary: "Tu as réussi à déconnecter le Noyau de Traitement Céleste de son rôle actuel qui consistait à fournir une puissance de traitement au grand champ de force autour de ton étoile natale Miaplacidus",
      lines: [
        { text: "Jalon Miaplacidus Atteint!", tone: "green-ready-text" },
        { text: "+0,15 Antimatière /s pour toujours!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    celestialProcessingCorePower: {
      title: "EXPLOITER LE NOYAU DE TRAITEMENT CÉLESTE",
      summary: "Tu as exploité le Noyau de Traitement Céleste au profit de ce Système, son immense pouvoir te bénéficiera car il fournit le bonus suivant:",
      lines: [
        { text: "Gagne 150 Recherche par Seconde!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    celestialProcessingCoreConnect: {
      title: "CONNECTER LE NOYAU DE TRAITEMENT CÉLESTE AU TISSU",
      summary: "Tu as connecté ce Noyau de Traitement Céleste au tissu de la galaxie ce qui signifie que ses bénéfices sont maintenant disponibles en permanence dans quelque système que tu pourrais un jour coloniser. Cela a un potentiel énorme.",
      lines: [
        { text: "Gagne 200 Recherche par Seconde!", tone: "green-ready-text" },
        { text: "Gagne 500 Recherche par Seconde dans chaque nouveau Système!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    plasmaForgeUnderstanding: {
      title: "COMPRENDRE LA FORGE DE PLASMA",
      summary: "Tu as étudié et comprends maintenant ce qu'est la MégaStructure devant toi - c'est une Forge de Plasma",
      lines: [
        { text: "+25% Taux d'AutoAchat de Ressources!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    plasmaForgeCapabilities: {
      title: "CAPACITÉS DE LA FORGE DE PLASMA",
      summary: "Après avoir étudié comment fonctionne la Forge de Plasma tu es maintenant confiant de ses capacités et tu veux maintenant planifier comment tu vas la déconnecter de son rôle actuel pour que tu puisses d'une manière ou d'une autre l'exploiter.",
      lines: [
        { text: "+50% Taux d'AutoAchat de Ressources!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    plasmaForgeDisconnect: {
      title: "DÉCONNECTER LA FORGE DE PLASMA",
      summary: "Tu as réussi à déconnecter la Forge de Plasma de son rôle actuel qui consistait à fournir du plasma au grand champ de force autour de ton étoile natale Miaplacidus",
      lines: [
        { text: "Jalon Miaplacidus Atteint!", tone: "green-ready-text" },
        { text: "+0,15 Antimatière /s pour toujours!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    plasmaForgePower: {
      title: "EXPLOITER LA FORGE DE PLASMA",
      summary: "Tu as exploité la Forge de Plasma au profit de ce Système, son immense pouvoir te bénéficiera car il fournit le bonus suivant:",
      lines: [
        { text: "+75% Taux d'AutoAchat de Ressources!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    plasmaForgeConnect: {
      title: "CONNECTER LA FORGE DE PLASMA AU TISSU",
      summary: "Tu as connecté cette Forge de Plasma au tissu de la galaxie ce qui signifie que ses bénéfices sont maintenant disponibles en permanence dans quelque système que tu pourrais un jour coloniser. Cela a un potentiel énorme.",
      lines: [
        { text: "Taux d'AutoAchat de Ressources Doublés!", tone: "green-ready-text" },
        { text: "Les Taux d'AutoAchat de Ressources sont 500% plus élevés dans chaque nouveau Système!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    galacticMemoryArchiveUnderstanding: {
      title: "COMPRENDRE L'ARCHIVE DE MÉMOIRE GALACTIQUE",
      summary: "Tu as étudié et comprends maintenant ce qu'est la MégaStructure devant toi - c'est une Archive de Mémoire Galactique",
      lines: [
        { text: "Capacité de Stockage de Toutes les Ressources et Composés + 100K!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    galacticMemoryArchiveCapabilities: {
      title: "CAPACITÉS DE L'ARCHIVE DE MÉMOIRE GALACTIQUE",
      summary: "Après avoir étudié comment fonctionne l'Archive de Mémoire Galactique tu es maintenant confiant de ses capacités et tu veux maintenant planifier comment tu vas la déconnecter de son rôle actuel pour que tu puisses d'une manière ou d'une autre l'exploiter.",
      lines: [
        { text: "Capacité de Stockage de Toutes les Ressources et Composés + 1M!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    galacticMemoryArchiveDisconnect: {
      title: "DÉCONNECTER L'ARCHIVE DE MÉMOIRE GALACTIQUE",
      summary: "Tu as réussi à déconnecter l'Archive de Mémoire Galactique de son rôle actuel qui consistait à fournir des fonctions de mémoire au grand champ de force autour de ton étoile natale Miaplacidus",
      lines: [
        { text: "Jalon Miaplacidus Atteint!", tone: "green-ready-text" },
        { text: "+0,15 Antimatière /s pour toujours!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    galacticMemoryArchivePower: {
      title: "EXPLOITER L'ARCHIVE DE MÉMOIRE GALACTIQUE",
      summary: "Tu as exploité l'Archive de Mémoire Galactique au profit de ce Système, son immense pouvoir te bénéficiera car il fournit le bonus suivant:",
      lines: [
        { text: "Capacité de Stockage de Toutes les Ressources et Composés + 1B!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
    galacticMemoryArchiveConnect: {
      title: "CONNECTER L'ARCHIVE DE MÉMOIRE GALACTIQUE AU TISSU",
      summary: "Tu as connecté cette Archive de Mémoire Galactique au tissu de la galaxie ce qui signifie que ses bénéfices sont maintenant disponibles en permanence dans quelque système que tu pourrais un jour coloniser. Cela a un potentiel énorme.",
      lines: [
        { text: "Capacité de Stockage de Toutes les Ressources et Composés + 10B!", tone: "green-ready-text" },
        { text: "La Capacité de Stockage de Toutes les Ressources et Composés commence à 10B dans chaque nouveau Système!", tone: "green-ready-text" },
      ],
      confirmLabel: "CONFIRMER",
    },
  },
};

export function megastructureResearchResultCopy(
  locale: LocaleId,
  technologyId: TechId,
): RandomEventDialogCopy | null {
  return messages[locale][technologyId] ?? null;
}
