import type { EconomicGoodId, LocaleId } from "../content/ids";

type EconomyLabel =
  | "resources"
  | "resourcesOverviewHelp"
  | "gases"
  | "liquids"
  | "solids"
  | "compounds"
  | "compoundsOverviewHelp"
  | "interstellarOverviewHelp"
  | "researchOverviewHelp"
  | "energyOverviewHelp"
  | "spaceMiningOverviewHelp"
  | "galacticOverviewHelp"
  | "settingsOverviewHelp"
  | "eventsOverviewHelp"
  | "hydrogenOverviewHelp"
  | "heliumOverviewHelp"
  | "carbonOverviewHelp"
  | "neonOverviewHelp"
  | "oxygenOverviewHelp"
  | "sodiumOverviewHelp"
  | "siliconOverviewHelp"
  | "ironOverviewHelp"
  | "dieselOverviewHelp"
  | "glassOverviewHelp"
  | "steelOverviewHelp"
  | "waterOverviewHelp"
  | "concreteOverviewHelp"
  | "titaniumOverviewHelp"
  | "collect"
  | "sell"
  | "sellAll"
  | "allStock"
  | "threeQuartersStock"
  | "twoThirdsStock"
  | "halfStock"
  | "oneThirdStock"
  | "saleAmount"
  | "salePreview"
  | "saleNotification"
  | "storageIncreasedNotice"
  | "storageFullNotice"
  | "autobuyerPurchaseNotice"
  | "hydrogenAdvancedCompressorHelp"
  | "storage"
  | "energyStorage"
  | "batteryStorageHelp"
  | "energyPowerHelp"
  | "energyPower"
  | "energySummary"
  | "increaseStorage"
  | "autobuyers"
  | "buyTier"
  | "pause"
  | "resume"
  | "owned"
  | "perSecond"
  | "lockedBy"
  | "unlocked"
  | "fuse"
  | "fusionCompleted"
  | "fusionDiscoveredNotice"
  | "fusionEfficiencyNotice"
  | "fusionStorageNotice"
  | "compoundCreatedNotice"
  | "source"
  | "target"
  | "amount"
  | "create"
  | "recipe"
  | "automaticCreation"
  | "autoCreateAllocationHelp"
  | "allocation"
  | "cashShare"
  | "compoundShare"
  | "allocationHelp"
  | "retainedShare"
  | "energy"
  | "generationMix"
  | "generationTotal"
  | "energyConsumption"
  | "powerGridOff"
  | "powerGridTripped"
  | "infinitePowerAvailable"
  | "generationChartSummary"
  | "powerPlantSupplyHelp"
  | "advancedPowerPlantHelp"
  | "solarPowerPlantRenewable"
  | "powerPlant1Help"
  | "powerPlant2Help"
  | "powerPlant3Help"
  | "battery1Help"
  | "battery2Help"
  | "battery3Help"
  | "generated"
  | "consumed"
  | "stored"
  | "capacity"
  | "activatePower"
  | "deactivatePower"
  | "research"
  | "points"
  | "scienceBuildings"
  | "scienceBuildingsHelp"
  | "researchSectionHelp"
  | "technologies"
  | "technology"
  | "technologyTree"
  | "treeProgress"
  | "shown"
  | "noAffordableTechnologies"
  | "researchPointsShortfall"
  | "researchTech"
  | "zoom"
  | "zoomIn"
  | "zoomOut"
  | "resetZoom"
  | "technologyTreePanHelp"
  | "prerequisites"
  | "ready"
  | "researched"
  | "manual"
  | "trip"
  | "recovery"
  | "buy"
  | "buyMax"
  | "disabled"
  | "initialHydrogen"
  | "increaseAllStorage"
  | "researchAutobuyer"
  | "notation"
  | "standardNotation"
  | "scientificNotation"
  | "unavailable"
  | "purchaseUnavailable"
  | "collectStorageFull"
  | "automaticProductionBlockedByStorage"
  | "saleNoStock"
  | "needGoodAmount"
  | "needCashAmount"
  | "compoundPreview"
  | "fusionPreview"
  | "fusionSourceShort"
  | "fusionWholeAmount"
  | "buyMaxPreview"
  | "buyMaxInsufficientMaterials"
  | "researchToUnlock"
  | "nanoBrokersRequirement"
  | "researchAutomation"
  | "researchAutobuyerLockedUntil";

const en: Record<EconomyLabel, string> = {
  resources: "Resources",
  resourcesOverviewHelp:
    "Here you can gain and sell resources. You can also upgrade your storage capacity and automate resource harvesting.  When you discover fusion, you will also handle that here.",
  gases: "Gases",
  liquids: "Liquids",
  solids: "Solids",
  compounds: "Compounds",
  compoundsOverviewHelp:
    "Here you can create and sell compounds from constituent parts or with advanced machinery.",
  interstellarOverviewHelp: "Here you can explore the galaxy and discover new stars and planets.",
  researchOverviewHelp:
    "In the Research section, you can unlock new technologies to progress through the game, and also get upgrades to farm research points.",
  energyOverviewHelp:
    "Here you can buy upgrades for generating power which is needed for more advanced buildings.",
  spaceMiningOverviewHelp:
    "Here you can build vessels to mine asteroids for valuable Antimatter, enabling you to visit locations in the Star Map, and really start to conquer the galaxy!",
  galacticOverviewHelp: "Here you can exchange your AP for permanent buffs, and reset runs.",
  settingsOverviewHelp: "Change the game settings to your liking.",
  eventsOverviewHelp:
    "Here you can see any ongoing or historical events and the effects they have.",
  hydrogenOverviewHelp:
    "The most basic element known to man, very cheap to produce and has a pretty low value, but anything can be created from it.",
  heliumOverviewHelp: "Lighter than air this one will make you float away!",
  carbonOverviewHelp: "This is the first stable solid element, made from fused Helium.",
  neonOverviewHelp: 'The first noble gas! Very "bright" of you to discover it!',
  oxygenOverviewHelp:
    "A vital element for most, Oxygen is highly reactive and essential for combustion and respiration.",
  sodiumOverviewHelp: "A soft, silvery metal.",
  siliconOverviewHelp:
    "The backbone of modern technology, it is a crucial component in electronics and solar panels.",
  ironOverviewHelp:
    "A strong and versatile metal, Iron is the foundation of construction and industry.",
  dieselOverviewHelp: "The first compound created by your hands, it is a useful early fuel.",
  glassOverviewHelp: "This is reinforced specialist glass and is great for solar applications.",
  steelOverviewHelp:
    "This is reinforced steel, highly durable and used in construction and manufacturing.",
  waterOverviewHelp:
    "Water is an essential resource which can be produced, or collected from rain in your reservoir.",
  concreteOverviewHelp:
    "Concrete is a fundamental building material used in construction, offering strength and versatility.",
  titaniumOverviewHelp:
    "Titanium is a strong, lightweight, and corrosion-resistant metal, needed for advanced construction.",
  collect: "Collect +1",
  sell: "Sell",
  sellAll: "Sell all",
  allStock: "All Stock",
  threeQuartersStock: "75% Stock",
  twoThirdsStock: "67% Stock",
  halfStock: "50% Stock",
  oneThirdStock: "33% Stock",
  saleAmount: "Sale amount",
  salePreview: "Sale preview",
  saleNotification: "You sold {amount} {good} for {cash}!",
  storageIncreasedNotice: "Increased {good} storage capacity to {capacity}.",
  storageFullNotice: "{good} storage is full.",
  autobuyerPurchaseNotice: "Autobuyers for {good} (tier {tier}): +{count}.",
  storage: "Storage",
  energyStorage: "Batteries",
  batteryStorageHelp:
    "Any buildings beyond the first level require power to operate, you can store that energy here. Batteries store surplus generated energy and supply it when generators cannot meet demand.",
  energyPower: "Power",
  energyPowerHelp:
    "Here you can buy upgrades for generating power which is needed for more advanced buildings.",
  energySummary: "Energy Summary",
  increaseStorage: "Increase storage",
  autobuyers: "Autobuyers",
  buyTier: "Buy tier",
  pause: "Pause",
  resume: "Resume",
  owned: "Owned",
  perSecond: "per second",
  lockedBy: "Locked by",
  unlocked: "Unlocked",
  fuse: "Fuse",
  fusionCompleted: "Fused {sourceAmount} {source} into {outputAmount} {target}.",
  fusionDiscoveredNotice:
    "Discovered {target} by fusing {sourceAmount} {source}: {generatedAmount} {target} generated, {outputAmount} stored; {efficiencyLost} lost to fusion inefficiency and {storageLost} to limited storage.",
  fusionEfficiencyNotice:
    "Fused {sourceAmount} {source} into {target}: received {outputAmount}; {lostAmount} lost to fusion inefficiency (ideal output {idealAmount}).",
  fusionStorageNotice:
    "Fused {sourceAmount} {source} into {target}: {generatedAmount} generated, {outputAmount} stored; {efficiencyLost} lost to inefficiency and {storageLost} exceeded storage.",
  compoundCreatedNotice: "You created {amount} {compound} from {parts}",
  source: "Source",
  target: "Output",
  amount: "Amount",
  create: "Create",
  recipe: "Recipe",
  automaticCreation: "Automatic creation",
  autoCreateAllocationHelp:
    "Automated creation draws only on the share each ingredient’s resource pane makes available to compounds. That share is split equally between every compound using it.",
  allocation: "Production allocation",
  cashShare: "Cash share",
  compoundShare: "Compound share",
  allocationHelp:
    "Drag either handle to change the split. With a handle focused, use the arrow keys to move it by 5%; Home and End move it to an endpoint.",
  retainedShare: "Retained share",
  energy: "Energy",
  generationMix: "Power generation mix",
  generationTotal: "Total generation",
  energyConsumption: "Total consumption",
  powerGridOff: "Power grid off: active generators are producing 0 kJ/s.",
  powerGridTripped: "Power tripped: active generators are producing 0 kJ/s.",
  infinitePowerAvailable: "Infinite power supply is active.",
  generationChartSummary:
    "{plant1}: {rate1} kJ/s; {plant2}: {rate2} kJ/s; {plant3}: {rate3} kJ/s. {totalLabel}: {total} kJ/s. {consumptionLabel}: {consumption} kJ/s.",
  powerPlantSupplyHelp:
    "These buildings provide the energy resource, and it is used by advanced buildings, without which they won't operate.",
  advancedPowerPlantHelp:
    "These buildings provide higher amounts of energy for powering a lot of machinery.",
  solarPowerPlantRenewable:
    "Solar power plants provide renewable energy without using any resources.",
  powerPlant1Help: "This is the first building available to produce energy.",
  powerPlant2Help:
    "This building produces clean, renewable energy without using resources, but its efficiency is weather dependant!",
  powerPlant3Help:
    "This building produces significantly more power than its earlier iteration, but consumes more resources.",
  battery1Help:
    "Store small amount of energy for use if power starts being used faster than it can be generated.",
  battery2Help:
    "Store larger amount of energy for use if power starts being used faster than it can be generated.",
  battery3Help:
    "Store a huge amount of energy for use if power starts being used faster than it can be generated.",
  generated: "Generated",
  consumed: "Consumed",
  stored: "Stored",
  capacity: "Capacity",
  activatePower: "Power On",
  deactivatePower: "Power Off",
  research: "Research",
  points: "Research points",
  scienceBuildings: "Science buildings",
  scienceBuildingsHelp:
    "Here you can buy upgrades to generate research points for unlocking new technology.",
  researchSectionHelp:
    "In the Research section, you can unlock new technologies to progress through the game, and also get upgrades to farm research points.",
  technologies: "Technologies",
  technology: "Technology",
  technologyTree: "Tech Tree",
  treeProgress: "Research to reveal technologies in the tree.",
  shown: "Shown",
  noAffordableTechnologies: "Earn more research points to reveal technologies.",
  researchPointsShortfall:
    "Research Points shortfall: {current} available; {required} required ({shortfall} more needed).",
  researchTech: "Research technology",
  zoom: "Zoom",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
  technologyTreePanHelp:
    "Here you can unlock new technologies to improve your game, provided you have enough research points! Here you can see a visual representation of technologies and what they provide. You can zoom with the mouse wheel. Focus the tree and use the arrow keys or Page Up/Down to pan.",
  prerequisites: "Prerequisites",
  ready: "Ready",
  researched: "Researched",
  manual: "Manual",
  trip: "Power trip",
  recovery: "Recovered",
  buy: "Buy",
  buyMax: "Buy max",
  disabled: "Disabled",
  initialHydrogen: "Hydrogen starts unlocked",
  increaseAllStorage: "Increase affordable storage",
  researchAutobuyer: "Research available technologies automatically",
  notation: "Number notation",
  standardNotation: "Standard",
  scientificNotation: "Scientific",
  unavailable: "Unmet demand",
  purchaseUnavailable: "You do not yet have the resources required for this purchase.",
  collectStorageFull: "Storage is full. Increase capacity to collect or create more.",
  automaticProductionBlockedByStorage: "Automatic production is blocked while storage is full.",
  saleNoStock: "No whole {good} units are available to sell.",
  needGoodAmount: "Need {amount} {good}.",
  needCashAmount: "Need {amount} cash.",
  compoundPreview: "Creates {amount} {good}; inputs required: {inputs}.",
  fusionPreview:
    "Fusing {sourceAmount} {source} may yield {minimum}–{maximum} {target}; up to {stored} fits in storage.",
  fusionSourceShort: "Need {amount} {source}; available: {available}.",
  fusionWholeAmount: "Enter a whole number of units to fuse.",
  buyMaxPreview: "Buy max: {count} · total cost {costs} · result {result}.",
  buyMaxInsufficientMaterials: "Need {required} {good}; available: {available}.",
  researchToUnlock: "Research {technology} to unlock this system.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Robotic Research Automation",
  researchAutobuyerLockedUntil: "(locked until {technology} is researched)",
  hydrogenAdvancedCompressorHelp:
    "Add an Advanced Hydrogen Compressor for enhanced automation.",
};
const es: Record<EconomyLabel, string> = {
  resources: "Recursos",
  resourcesOverviewHelp:
    "Aquí puedes obtener y vender recursos. También puedes mejorar tu capacidad de almacenamiento y automatizar la recolección de recursos. Cuando descubras la fusión, también la manejarás aquí.",
  gases: "Gases",
  liquids: "Líquidos",
  solids: "Sólidos",
  compounds: "Compuestos",
  compoundsOverviewHelp:
    "Aquí puedes crear y vender compuestos a partir de partes constituyentes o con maquinaria avanzada.",
  interstellarOverviewHelp:
    "Aquí puedes explorar la galaxia y descubrir nuevas estrellas y planetas.",
  researchOverviewHelp:
    "En la sección de Investigación, puedes desbloquear nuevas tecnologías para progresar en el juego, y también obtener mejoras para farmear puntos de investigación.",
  energyOverviewHelp:
    "Aquí puedes comprar mejoras para generar energía que se necesita para edificios más avanzados.",
  spaceMiningOverviewHelp:
    "Aquí puedes construir naves para minar asteroides en busca de valiosa Antimateria, permitiéndote visitar ubicaciones en el Mapa Estelar, ¡y realmente comenzar a conquistar la galaxia!",
  galacticOverviewHelp: "Aquí puedes intercambiar tus AP por mejoras permanentes y reiniciar runs.",
  settingsOverviewHelp: "Cambia la configuración del juego a tu gusto.",
  eventsOverviewHelp:
    "Aquí puedes ver cualquier evento en curso o histórico y los efectos que tienen.",
  hydrogenOverviewHelp:
    "El elemento más básico conocido por el hombre, muy barato de producir y tiene un valor bastante bajo, pero cualquier cosa puede crearse a partir de él.",
  heliumOverviewHelp: "¡Más ligero que el aire, este te hará flotar!",
  carbonOverviewHelp: "Este es el primer elemento sólido estable, hecho de Helio fusionado.",
  neonOverviewHelp: "¡El primer gas noble! ¡Muy \u0027brillante\u0027 de tu parte descubrirlo!",
  oxygenOverviewHelp:
    "Un elemento vital para la mayoría, el Oxígeno es altamente reactivo y esencial para la combustión y la respiración.",
  sodiumOverviewHelp: "Un metal suave y plateado.",
  siliconOverviewHelp:
    "La columna vertebral de la tecnología moderna, es un componente crucial en electrónica y paneles solares.",
  ironOverviewHelp:
    "Un metal fuerte y versátil, el Hierro es la base de la construcción y la industria.",
  dieselOverviewHelp: "El primer compuesto creado por tus manos, es un combustible útil temprano.",
  glassOverviewHelp:
    "Este es vidrio especialista reforzado y es excelente para aplicaciones solares.",
  steelOverviewHelp:
    "Este es acero reforzado, altamente duradero y usado en construcción y manufactura.",
  waterOverviewHelp:
    "El agua es un recurso esencial que puede producirse, o recolectarse de la lluvia en tu reservorio.",
  concreteOverviewHelp:
    "El hormigón es un material de construcción fundamental usado en construcción, ofreciendo fuerza y versatilidad.",
  titaniumOverviewHelp:
    "El Titanio es un metal fuerte, ligero y resistente a la corrosión, necesario para construcción avanzada.",
  collect: "Recolectar +1",
  sell: "Vender",
  sellAll: "Vender todo",
  allStock: "Todo el Stock",
  threeQuartersStock: "75% Stock",
  twoThirdsStock: "67% Stock",
  halfStock: "50% Stock",
  oneThirdStock: "33% Stock",
  saleAmount: "Cantidad de venta",
  salePreview: "Vista previa de venta",
  saleNotification: "¡Has vendido {amount} de {good} por {cash}!",
  storageIncreasedNotice: "Se aumentó la capacidad de almacenamiento de {good} a {capacity}.",
  storageFullNotice: "El almacenamiento de {good} está lleno.",
  autobuyerPurchaseNotice:
    "Compradores automáticos para {good} (nivel {tier}): +{count}.",
  storage: "Almacenamiento",
  energyStorage: "Baterías",
  batteryStorageHelp:
    "Cualquier edificio más allá del primer nivel requiere energía para operar, puedes almacenar esa energía aquí. Las baterías almacenan el excedente de energía generado y lo suministran cuando los generadores no cubren la demanda.",
  energyPower: "Potencia",
  energyPowerHelp:
    "Aquí puedes comprar mejoras para generar energía que se necesita para edificios más avanzados.",
  energySummary: "Resumen de energía",
  increaseStorage: "Aumentar almacenamiento",
  autobuyers: "Compradores automáticos",
  buyTier: "Comprar nivel",
  pause: "Pausar",
  resume: "Reanudar",
  owned: "Comprados",
  perSecond: "por segundo",
  lockedBy: "Requiere",
  unlocked: "Desbloqueado",
  fuse: "Fusionar",
  fusionCompleted: "Se fusionaron {sourceAmount} {source} para producir {outputAmount} {target}.",
  fusionDiscoveredNotice:
    "Descubriste {target} al fusionar {sourceAmount} {source}: se generaron {generatedAmount} {target} y se almacenaron {outputAmount}; se perdieron {efficiencyLost} por la eficiencia de fusión y {storageLost} por falta de espacio.",
  fusionEfficiencyNotice:
    "Se fusionaron {sourceAmount} {source} en {target}: se recibieron {outputAmount}; se perdieron {lostAmount} por eficiencia de fusión (producción ideal: {idealAmount}).",
  fusionStorageNotice:
    "Se fusionaron {sourceAmount} {source} en {target}: se generaron {generatedAmount}, se almacenaron {outputAmount}; {efficiencyLost} se perdieron por eficiencia y {storageLost} por falta de espacio.",
  compoundCreatedNotice: "Has creado {amount} de {compound} a partir de {parts}",
  source: "Origen",
  target: "Resultado",
  amount: "Cantidad",
  create: "Crear",
  recipe: "Receta",
  automaticCreation: "Creación automática",
  autoCreateAllocationHelp:
    "La creación automatizada solo utiliza la parte que el panel de cada ingrediente pone a disposición de los compuestos. Esa parte se divide equitativamente entre todos los compuestos que la usan.",
  allocation: "Asignación de producción",
  cashShare: "Parte para dinero",
  compoundShare: "Parte para compuestos",
  allocationHelp:
    "Arrastra cualquiera de los controles para cambiar la distribución. Con uno enfocado, usa las flechas para moverlo en pasos del 5 %; Inicio y Fin lo llevan a un extremo.",
  retainedShare: "Parte retenida",
  energy: "Energía",
  generationMix: "Mezcla de generación eléctrica",
  generationTotal: "Generación total",
  energyConsumption: "Consumo total",
  powerGridOff: "Red eléctrica apagada: los generadores activos producen 0 kJ/s.",
  powerGridTripped: "Corte eléctrico: los generadores activos producen 0 kJ/s.",
  infinitePowerAvailable: "El suministro de energía infinita está activo.",
  generationChartSummary:
    "{plant1}: {rate1} kJ/s; {plant2}: {rate2} kJ/s; {plant3}: {rate3} kJ/s. {totalLabel}: {total} kJ/s. {consumptionLabel}: {consumption} kJ/s.",
  powerPlantSupplyHelp:
    "Estos edificios proporcionan el recurso de energía, y es utilizado por edificios avanzados, sin los cuales no operarán.",
  advancedPowerPlantHelp:
    "Estos edificios proporcionan cantidades más altas de energía para alimentar mucha maquinaria.",
  solarPowerPlantRenewable:
    "Las plantas de energía solar proporcionan energía renovable sin usar ningún recurso.",
  powerPlant1Help: "Este es el primer edificio disponible para producir energía.",
  powerPlant2Help:
    "¡Este edificio produce energía limpia y renovable sin usar recursos, pero su eficiencia depende del clima!",
  powerPlant3Help:
    "Este edificio produce significativamente más energía que su versión anterior, pero consume más recursos.",
  battery1Help:
    "Almacena una pequeña cantidad de energía para usar si la energía comienza a usarse más rápido de lo que se puede generar.",
  battery2Help:
    "Almacena una mayor cantidad de energía para usar si la energía comienza a usarse más rápido de lo que se puede generar.",
  battery3Help:
    "Almacena una enorme cantidad de energía para usar si la energía comienza a usarse más rápido de lo que se puede generar.",
  generated: "Generada",
  consumed: "Consumida",
  stored: "Almacenada",
  capacity: "Capacidad",
  activatePower: "Encender",
  deactivatePower: "Apagar",
  research: "Investigación",
  points: "Puntos de investigación",
  scienceBuildings: "Edificios científicos",
  scienceBuildingsHelp:
    "Aquí puedes comprar mejoras para generar puntos de investigación para desbloquear nueva tecnología.",
  researchSectionHelp:
    "En la sección de Investigación, puedes desbloquear nuevas tecnologías para progresar en el juego, y también obtener mejoras para farmear puntos de investigación.",
  technologies: "Tecnologías",
  technology: "Tecnología",
  technologyTree: "Árbol tecnológico",
  treeProgress: "Investiga para revelar tecnologías en el árbol.",
  shown: "Visibles",
  noAffordableTechnologies: "Consigue más puntos de investigación para revelar tecnologías.",
  researchPointsShortfall:
    "Faltan puntos de investigación: hay {current}; se necesitan {required} (faltan {shortfall}).",
  researchTech: "Investigar tecnología",
  zoom: "Zoom",
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  resetZoom: "Restablecer zoom",
  technologyTreePanHelp:
    "Aquí puedes desbloquear nuevas tecnologías para mejorar tu juego, ¡siempre que tengas suficientes puntos de investigación! Aquí puedes ver una representación visual de las tecnologías y lo que proporcionan. Puedes hacer zoom con la rueda del ratón. Enfoca el árbol y usa las flechas o Re Pág/Av Pág para desplazarte.",
  prerequisites: "Requisitos previos",
  ready: "Disponible",
  researched: "Investigada",
  manual: "Manual",
  trip: "Corte eléctrico",
  recovery: "Restablecida",
  buy: "Comprar",
  buyMax: "Comprar máximo",
  disabled: "Desactivado",
  initialHydrogen: "El hidrógeno empieza desbloqueado",
  increaseAllStorage: "Ampliar almacenamiento asequible",
  researchAutobuyer: "Investigar tecnologías disponibles automáticamente",
  notation: "Notación numérica",
  standardNotation: "Estándar",
  scientificNotation: "Científica",
  unavailable: "Demanda sin cubrir",
  purchaseUnavailable: "Aún no tienes los recursos necesarios para esta compra.",
  collectStorageFull:
    "El almacenamiento está lleno. Amplía la capacidad para recolectar o crear más.",
  automaticProductionBlockedByStorage:
    "La producción automática está bloqueada mientras el almacenamiento esté lleno.",
  saleNoStock: "No hay unidades enteras de {good} disponibles para vender.",
  needGoodAmount: "Se necesitan {amount} {good}.",
  needCashAmount: "Se necesita {amount} de dinero.",
  compoundPreview: "Crea {amount} {good}; recursos necesarios: {inputs}.",
  fusionPreview:
    "Fusionar {sourceAmount} {source} puede producir entre {minimum} y {maximum} {target}; caben hasta {stored} en el almacenamiento.",
  fusionSourceShort: "Se necesitan {amount} {source}; disponibles: {available}.",
  fusionWholeAmount: "Introduce una cantidad entera de unidades para fusionar.",
  buyMaxPreview: "Compra máxima: {count} · coste total {costs} · resultado {result}.",
  buyMaxInsufficientMaterials: "Necesitas {required} {good}; disponible: {available}.",
  researchToUnlock: "Investiga {technology} para desbloquear este sistema.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Automatización robótica de investigación",
  researchAutobuyerLockedUntil: "(bloqueado hasta investigar {technology})",
  hydrogenAdvancedCompressorHelp:
    "Añade un Compresor Avanzado de Hidrógeno para automatización mejorada.",
};
const pt: Record<EconomyLabel, string> = {
  resources: "Recursos",
  resourcesOverviewHelp:
    "Aqui podes obter e vender recursos. Também podes melhorar a tua capacidade de armazenamento e automatizar a recolha de recursos. Quando descobrires a fusão, também a poderás gerir aqui.",
  gases: "Gases",
  liquids: "Líquidos",
  solids: "Sólidos",
  compounds: "Compostos",
  compoundsOverviewHelp:
    "Aqui podes criar e vender compostos a partir dos seus constituintes ou com maquinaria avançada.",
  interstellarOverviewHelp: "Aqui podes explorar a galáxia e descobrir novas estrelas e planetas.",
  researchOverviewHelp:
    "Na secção de Investigação, podes desbloquear novas tecnologias para progredir no jogo e também obter melhorias para obter pontos de investigação.",
  energyOverviewHelp:
    "Aqui podes comprar melhorias para gerar energia, necessária para edifícios mais avançados.",
  spaceMiningOverviewHelp:
    "Aqui podes construir naves para minerar asteroides em busca de valiosa Antimatéria, permitindo-te visitar localizações no Mapa Estelar e começar realmente a conquistar a galáxia!",
  galacticOverviewHelp: "Aqui podes trocar os teus AP por melhorias permanentes e reiniciar runs.",
  settingsOverviewHelp: "Altera as definições do jogo ao teu gosto.",
  eventsOverviewHelp: "Aqui podes ver qualquer evento atual ou histórico e os efeitos que têm.",
  hydrogenOverviewHelp:
    "O elemento mais básico conhecido pelo homem, muito barato de produzir e com um valor bastante baixo, mas qualquer coisa pode ser criada a partir dele.",
  heliumOverviewHelp: "Mais leve do que o ar, este vai fazer-te flutuar!",
  carbonOverviewHelp: "Este é o primeiro elemento sólido estável, feito a partir de Hélio fundido.",
  neonOverviewHelp: "O primeiro gás nobre! Muito \u0027brilhante\u0027 da tua parte descobri-lo!",
  oxygenOverviewHelp:
    "Um elemento vital para a maioria, o Oxigénio é altamente reativo e essencial para a combustão e a respiração.",
  sodiumOverviewHelp: "Um metal macio e prateado.",
  siliconOverviewHelp:
    "A espinha dorsal da tecnologia moderna, é um componente crucial na eletrónica e nos painéis solares.",
  ironOverviewHelp: "Um metal forte e versátil, o Ferro é a base da construção e da indústria.",
  dieselOverviewHelp:
    "O primeiro composto criado pelas tuas mãos, é um combustível útil no início do jogo.",
  glassOverviewHelp: "Este é vidro especialista reforçado e é excelente para aplicações solares.",
  steelOverviewHelp: "Este é aço reforçado, altamente durável e usado em construção e manufactura.",
  waterOverviewHelp:
    "A água é um recurso essencial que pode ser produzido, ou recolhido da chuva no teu reservatório.",
  concreteOverviewHelp:
    "O betão é um material de construção fundamental usado em construção, oferecendo força e versatilidade.",
  titaniumOverviewHelp:
    "O Titânio é um metal forte, leve e resistente à corrosão, necessário para construção avançada.",
  collect: "Recolher +1",
  sell: "Vender",
  sellAll: "Vender tudo",
  allStock: "Todo o Stock",
  threeQuartersStock: "75% do Stock",
  twoThirdsStock: "67% do Stock",
  halfStock: "50% do Stock",
  oneThirdStock: "33% do Stock",
  saleAmount: "Quantidade da venda",
  salePreview: "Prévia da venda",
  saleNotification: "Vendeste {amount} de {good} por {cash}!",
  storageIncreasedNotice: "A capacidade de armazenamento de {good} aumentou para {capacity}.",
  storageFullNotice: "O armazenamento de {good} está cheio.",
  autobuyerPurchaseNotice:
    "Compradores automáticos para {good} (nível {tier}): +{count}.",
  storage: "Armazenamento",
  energyStorage: "Baterias",
  batteryStorageHelp:
    "Qualquer edifício para além do primeiro nível requer energia para funcionar; podes armazenar essa energia aqui. As baterias armazenam o excedente de energia gerada e fornecem-na quando os geradores não conseguem satisfazer a procura.",
  energyPower: "Potência",
  energyPowerHelp:
    "Aqui podes comprar melhorias para gerar energia, necessária para edifícios mais avançados.",
  energySummary: "Resumo de energia",
  increaseStorage: "Aumentar armazenamento",
  autobuyers: "Compradores automáticos",
  buyTier: "Comprar nível",
  pause: "Pausar",
  resume: "Retomar",
  owned: "Adquiridos",
  perSecond: "por segundo",
  lockedBy: "Requer",
  unlocked: "Desbloqueado",
  fuse: "Fundir",
  fusionCompleted: "Fundiu {sourceAmount} {source} para produzir {outputAmount} {target}.",
  fusionDiscoveredNotice:
    "Descobriste {target} ao fundir {sourceAmount} {source}: foram gerados {generatedAmount} {target} e armazenados {outputAmount}; perderam-se {efficiencyLost} por eficiência de fusão e {storageLost} por falta de espaço.",
  fusionEfficiencyNotice:
    "Fundiu {sourceAmount} {source} em {target}: recebeu {outputAmount}; perdeu {lostAmount} por eficiência de fusão (produção ideal: {idealAmount}).",
  fusionStorageNotice:
    "Fundiu {sourceAmount} {source} em {target}: gerou {generatedAmount}, armazenou {outputAmount}; perdeu {efficiencyLost} por eficiência e {storageLost} por falta de espaço.",
  compoundCreatedNotice: "Criaste {amount} de {compound} a partir de {parts}",
  source: "Origem",
  target: "Resultado",
  amount: "Quantidade",
  create: "Criar",
  recipe: "Receita",
  automaticCreation: "Criação automática",
  autoCreateAllocationHelp:
    "A criação automatizada usa apenas a parte que o painel de cada ingrediente disponibiliza aos compostos. Essa parte é dividida igualmente entre todos os compostos que a usam.",
  allocation: "Distribuição da produção",
  cashShare: "Parcela para dinheiro",
  compoundShare: "Parcela para compostos",
  allocationHelp:
    "Arraste qualquer alça para alterar a divisão. Com uma alça em foco, use as setas para movê-la em passos de 5%; Home e End levam a uma extremidade.",
  retainedShare: "Parcela retida",
  energy: "Energia",
  generationMix: "Composição da geração de energia",
  generationTotal: "Geração total",
  energyConsumption: "Consumo total",
  powerGridOff: "Rede elétrica desligada: os geradores ativos produzem 0 kJ/s.",
  powerGridTripped: "Energia desarmada: os geradores ativos produzem 0 kJ/s.",
  infinitePowerAvailable: "O fornecimento de energia infinita está ativo.",
  generationChartSummary:
    "{plant1}: {rate1} kJ/s; {plant2}: {rate2} kJ/s; {plant3}: {rate3} kJ/s. {totalLabel}: {total} kJ/s. {consumptionLabel}: {consumption} kJ/s.",
  powerPlantSupplyHelp:
    "Estes edifícios fornecem o recurso de energia, que é utilizado por edifícios avançados, sem o qual não funcionarão.",
  advancedPowerPlantHelp:
    "Estes edifícios fornecem maiores quantidades de energia para alimentar muita maquinaria.",
  solarPowerPlantRenewable:
    "As centrais de energia solar fornecem energia renovável sem utilizar qualquer recurso.",
  powerPlant1Help: "Este é o primeiro edifício disponível para produzir energia.",
  powerPlant2Help:
    "Este edifício produz energia limpa e renovável sem usar recursos, mas sua eficiência depende do clima!",
  powerPlant3Help:
    "Este edifício produz significativamente mais energia que sua versão anterior, mas consome mais recursos.",
  battery1Help:
    "Armazena uma pequena quantidade de energia para usar caso a energia comece a ser consumida mais rapidamente do que pode ser gerada.",
  battery2Help:
    "Armazena uma quantidade maior de energia para usar caso a energia comece a ser consumida mais rapidamente do que pode ser gerada.",
  battery3Help:
    "Armazena uma enorme quantidade de energia para usar caso a energia comece a ser consumida mais rapidamente do que pode ser gerada.",
  generated: "Gerada",
  consumed: "Consumida",
  stored: "Armazenada",
  capacity: "Capacidade",
  activatePower: "Ligar",
  deactivatePower: "Desligar",
  research: "Investigação",
  points: "Pontos de pesquisa",
  scienceBuildings: "Edifícios científicos",
  scienceBuildingsHelp:
    "Aqui podes comprar melhorias para gerar pontos de investigação e desbloquear novas tecnologias.",
  researchSectionHelp:
    "Na secção de Investigação, podes desbloquear novas tecnologias para progredir no jogo e também obter melhorias para obter pontos de investigação.",
  technologies: "Tecnologias",
  technology: "Tecnologia",
  technologyTree: "Árvore tecnológica",
  treeProgress: "Pesquisa para revelar tecnologias na árvore.",
  shown: "Exibidas",
  noAffordableTechnologies: "Obtenha mais pontos de pesquisa para revelar tecnologias.",
  researchPointsShortfall:
    "Faltam pontos de pesquisa: disponíveis {current}; necessários {required} (faltam {shortfall}).",
  researchTech: "Pesquisar tecnologia",
  zoom: "Zoom",
  zoomIn: "Aumentar zoom",
  zoomOut: "Diminuir zoom",
  resetZoom: "Redefinir zoom",
  technologyTreePanHelp:
    "Aqui podes desbloquear novas tecnologias para melhorar o teu jogo, desde que tenhas pontos de investigação suficientes! Aqui podes ver uma representação visual das tecnologias e o que elas proporcionam. Podes fazer zoom com a roda do rato. Foca a árvore e usa as setas ou Page Up/Page Down para navegar.",
  prerequisites: "Pré-requisitos",
  ready: "Disponível",
  researched: "Pesquisada",
  manual: "Manual",
  trip: "Corte de energia",
  recovery: "Restabelecida",
  buy: "Comprar",
  buyMax: "Comprar o máximo",
  disabled: "Desativado",
  initialHydrogen: "O hidrogénio começa desbloqueado",
  increaseAllStorage: "Aumentar armazenamento acessível",
  researchAutobuyer: "Pesquisar tecnologias disponíveis automaticamente",
  notation: "Notação numérica",
  standardNotation: "Padrão",
  scientificNotation: "Científica",
  unavailable: "Procura por satisfazer",
  purchaseUnavailable: "Ainda não tens os recursos necessários para esta compra.",
  collectStorageFull:
    "O armazenamento está cheio. Aumente a capacidade para recolher ou criar mais.",
  automaticProductionBlockedByStorage:
    "A produção automática está bloqueada enquanto o armazenamento estiver cheio.",
  saleNoStock: "Não há unidades inteiras de {good} disponíveis para vender.",
  needGoodAmount: "São necessários {amount} {good}.",
  needCashAmount: "São necessários {amount} em dinheiro.",
  compoundPreview: "Cria {amount} {good}; recursos necessários: {inputs}.",
  fusionPreview:
    "Fundir {sourceAmount} {source} pode render {minimum}–{maximum} {target}; cabem até {stored} no armazenamento.",
  fusionSourceShort: "São necessários {amount} {source}; disponíveis: {available}.",
  fusionWholeAmount: "Introduza uma quantidade inteira de unidades para fundir.",
  buyMaxPreview: "Comprar o máximo: {count} · custo total {costs} · resultado {result}.",
  buyMaxInsufficientMaterials: "Você precisa de {required} {good}; disponível: {available}.",
  researchToUnlock: "Pesquisa {technology} para desbloquear este sistema.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Automação Robótica de Pesquisa",
  researchAutobuyerLockedUntil: "(bloqueado até pesquisar {technology})",
  hydrogenAdvancedCompressorHelp:
    "Adicione um Compressor Avançado de Hidrogênio para automação aprimorada.",
};
const de: Record<EconomyLabel, string> = {
  resources: "Ressourcen",
  resourcesOverviewHelp:
    "Hier kannst du Ressourcen gewinnen und verkaufen. Du kannst auch deine Lagerkapazität erweitern und die Ressourcengewinnung automatisieren. Wenn du Fusion entdeckst, wirst du das auch hier handhaben.",
  gases: "Gase",
  liquids: "Flüssigkeiten",
  solids: "Feststoffe",
  compounds: "Verbindungen",
  compoundsOverviewHelp:
    "Hier kannst du Verbindungen aus Bestandteilen oder mit fortschrittlicher Maschinerie herstellen und verkaufen.",
  interstellarOverviewHelp:
    "Hier kannst du die Galaxie erkunden und neue Sterne und Planeten entdecken.",
  researchOverviewHelp:
    "Im Forschungsbereich kannst du neue Technologien freischalten, um im Spiel voranzukommen, und auch Upgrades erhalten, um Forschungspunkte zu farmen.",
  energyOverviewHelp:
    "Hier kannst du Upgrades zum Erzeugen von Energie kaufen, die für fortgeschrittenere Gebäude benötigt wird.",
  spaceMiningOverviewHelp:
    "Hier kannst du Schiffe bauen, um Asteroiden nach wertvoller Antimaterie abzubauen, was dir ermöglicht, Orte auf der Sternenkarte zu besuchen, und wirklich damit zu beginnen, die Galaxie zu erobern!",
  galacticOverviewHelp:
    "Hier kannst du deine AP gegen permanente Buffs eintauschen und Runs zurücksetzen.",
  settingsOverviewHelp: "Ändere die Spieleinstellungen nach deinen Wünschen.",
  eventsOverviewHelp:
    "Hier kannst du alle laufenden oder historischen Ereignisse und ihre Auswirkungen sehen.",
  hydrogenOverviewHelp:
    "Das grundlegendste Element, das dem Menschen bekannt ist, sehr billig zu produzieren und hat einen ziemlich niedrigen Wert, aber alles kann davon erschaffen werden.",
  heliumOverviewHelp: "Leichter als Luft wird dieses dich davontragen!",
  carbonOverviewHelp:
    "Dies ist das erste stabile feste Element, hergestellt aus fusioniertem Helium.",
  neonOverviewHelp: "Das erste Edelgas! Sehr \u0027hell\u0027 von dir, es zu entdecken!",
  oxygenOverviewHelp:
    "Ein lebenswichtiges Element für die meisten, Sauerstoff ist hochreaktiv und essentiell für Verbrennung und Atmung.",
  sodiumOverviewHelp: "Ein weiches, silbriges Metall.",
  siliconOverviewHelp:
    "Das Rückgrat der modernen Technologie, es ist eine entscheidende Komponente in Elektronik und Solarpanelen.",
  ironOverviewHelp:
    "Ein starkes und vielseitiges Metall, Eisen ist die Grundlage von Bau und Industrie.",
  dieselOverviewHelp:
    "Die erste Verbindung, die von deinen Händen erschaffen wurde, es ist ein nützlicher früher Treibstoff.",
  glassOverviewHelp: "Dies ist verstärktes Spezialglas und ist großartig für Solaranwendungen.",
  steelOverviewHelp:
    "Dies ist verstärkter Stahl, hochgradig langlebig und in Bau und Fertigung eingesetzt.",
  waterOverviewHelp:
    "Wasser ist eine wesentliche Ressource, die produziert oder aus Regen in deinem Reservoir gesammelt werden kann.",
  concreteOverviewHelp:
    "Beton ist ein fundamentales Baumaterial, das im Bauwesen verwendet wird und Stärke sowie Vielseitigkeit bietet.",
  titaniumOverviewHelp:
    "Titan ist ein starkes, leichtes und korrosionsbeständiges Metall, benötigt für fortgeschrittenen Bau.",
  collect: "+1 sammeln",
  sell: "Verkaufen",
  sellAll: "Alles verkaufen",
  allStock: "Gesamter Bestand",
  threeQuartersStock: "75% Bestand",
  twoThirdsStock: "67% Bestand",
  halfStock: "50% Bestand",
  oneThirdStock: "33% Bestand",
  saleAmount: "Verkaufsmenge",
  salePreview: "Verkaufswert",
  saleNotification: "Du hast {amount} {good} für {cash} verkauft!",
  storageIncreasedNotice: "Der Speicherplatz für {good} wurde auf {capacity} erhöht.",
  storageFullNotice: "Der Speicher für {good} ist voll.",
  autobuyerPurchaseNotice:
    "Automatische Käufer für {good} (Stufe {tier}): +{count}.",
  storage: "Lager",
  energyStorage: "Batterien",
  batteryStorageHelp:
    "Jedes Gebäude jenseits der ersten Stufe benötigt Energie für den Betrieb; diese Energie kannst du hier speichern. Batterien speichern überschüssig erzeugte Energie und geben sie ab, wenn die Generatoren den Bedarf nicht decken können.",
  energyPower: "Leistung",
  energyPowerHelp:
    "Hier kannst du Upgrades zum Erzeugen von Energie kaufen, die für fortgeschrittenere Gebäude benötigt wird.",
  energySummary: "Energieübersicht",
  increaseStorage: "Lager erweitern",
  autobuyers: "Automatische Käufer",
  buyTier: "Stufe kaufen",
  pause: "Pausieren",
  resume: "Fortsetzen",
  owned: "Im Besitz",
  perSecond: "pro Sekunde",
  lockedBy: "Benötigt",
  unlocked: "Freigeschaltet",
  fuse: "Fusionieren",
  fusionCompleted: "{sourceAmount} {source} wurden zu {outputAmount} {target} fusioniert.",
  fusionDiscoveredNotice:
    "Bei der Fusion von {sourceAmount} {source} wurde {target} entdeckt: {generatedAmount} {target} erzeugt, {outputAmount} gespeichert; {efficiencyLost} gingen durch Fusionseffizienz und {storageLost} durch begrenzten Speicher verloren.",
  fusionEfficiencyNotice:
    "{sourceAmount} {source} zu {target} fusioniert: {outputAmount} erhalten; {lostAmount} durch Fusionseffizienz verloren (ideale Menge: {idealAmount}).",
  fusionStorageNotice:
    "{sourceAmount} {source} zu {target} fusioniert: {generatedAmount} erzeugt, {outputAmount} gespeichert; {efficiencyLost} durch Effizienz und {storageLost} durch begrenzten Speicher verloren.",
  compoundCreatedNotice: "Du hast {amount} {compound} aus {parts} hergestellt",
  source: "Quelle",
  target: "Ausgabe",
  amount: "Menge",
  create: "Herstellen",
  recipe: "Rezept",
  automaticCreation: "Automatische Herstellung",
  autoCreateAllocationHelp:
    "Die automatische Erstellung nutzt nur den Anteil, den die Ressourcenseite jeder Zutat für Verbindungen freigibt. Dieser Anteil wird gleichmäßig auf alle Verbindungen aufgeteilt, die ihn nutzen.",
  allocation: "Produktionsverteilung",
  cashShare: "Geldanteil",
  compoundShare: "Verbindungsanteil",
  allocationHelp:
    "Ziehe einen der Griffe, um die Aufteilung zu ändern. Mit fokussiertem Griff bewegen die Pfeiltasten ihn in 5-%-Schritten; Pos1 und Ende setzen ihn an ein Ende.",
  retainedShare: "Lageranteil",
  energy: "Energie",
  generationMix: "Stromerzeugungsmix",
  generationTotal: "Gesamterzeugung",
  energyConsumption: "Gesamtverbrauch",
  powerGridOff: "Stromnetz aus: Aktive Generatoren erzeugen 0 kJ/s.",
  powerGridTripped: "Stromausfall: Aktive Generatoren erzeugen 0 kJ/s.",
  infinitePowerAvailable: "Unbegrenzte Stromversorgung ist aktiv.",
  generationChartSummary:
    "{plant1}: {rate1} kJ/s; {plant2}: {rate2} kJ/s; {plant3}: {rate3} kJ/s. {totalLabel}: {total} kJ/s. {consumptionLabel}: {consumption} kJ/s.",
  powerPlantSupplyHelp:
    "Diese Gebäude bieten die Energieressource, und sie wird von fortgeschrittenen Gebäuden genutzt, ohne die sie nicht operieren können.",
  advancedPowerPlantHelp:
    "Diese Gebäude bieten höhere Mengen an Energie zum Betrieb vieler Maschinen.",
  solarPowerPlantRenewable:
    "Solarkraftwerke bieten erneuerbare Energie ohne Nutzung von Ressourcen.",
  powerPlant1Help: "Dies ist das erste Gebäude, das zur Energieerzeugung verfügbar ist.",
  powerPlant2Help:
    "Dieses Gebäude erzeugt saubere, erneuerbare Energie ohne Ressourcenverbrauch, aber seine Effizienz ist wetterabhängig!",
  powerPlant3Help:
    "Dieses Gebäude erzeugt deutlich mehr Energie als seine frühere Version, verbraucht aber mehr Ressourcen.",
  battery1Help:
    "Speichert eine kleine Energiemenge für den Fall, dass Energie schneller verbraucht als erzeugt wird.",
  battery2Help:
    "Speichert eine größere Energiemenge für den Fall, dass Energie schneller verbraucht als erzeugt wird.",
  battery3Help:
    "Speichert eine riesige Energiemenge für den Fall, dass Energie schneller verbraucht als erzeugt wird.",
  generated: "Erzeugt",
  consumed: "Verbraucht",
  stored: "Gespeichert",
  capacity: "Kapazität",
  activatePower: "Strom An",
  deactivatePower: "Strom Aus",
  research: "Forschung",
  points: "Forschungspunkte",
  scienceBuildings: "Forschungsgebäude",
  scienceBuildingsHelp:
    "Hier kannst du Upgrades kaufen, um Forschungspunkte zum Freischalten neuer Technologien zu generieren.",
  researchSectionHelp:
    "Im Forschungsbereich kannst du neue Technologien freischalten, um im Spiel voranzukommen, und auch Upgrades erhalten, um Forschungspunkte zu farmen.",
  technologies: "Technologien",
  technology: "Technologie",
  technologyTree: "Technologiebaum",
  treeProgress: "Forsche, um Technologien im Baum sichtbar zu machen.",
  shown: "Sichtbar",
  noAffordableTechnologies: "Sammle mehr Forschungspunkte, um Technologien aufzudecken.",
  researchPointsShortfall:
    "Forschungspunkte fehlen: {current} verfügbar; {required} benötigt ({shortfall} fehlen).",
  researchTech: "Technologie erforschen",
  zoom: "Zoom",
  zoomIn: "Vergrößern",
  zoomOut: "Verkleinern",
  resetZoom: "Zoom zurücksetzen",
  technologyTreePanHelp:
    "Hier kannst du neue Technologien freischalten, um dein Spiel zu verbessern, vorausgesetzt du hast genug Forschungspunkte! Hier kannst du eine visuelle Darstellung der Technologien und ihrer Bereitstellungen sehen. Du kannst mit dem Mausrad zoomen. Fokussiere den Baum und verschiebe ihn mit Pfeiltasten oder Bild auf/ab.",
  prerequisites: "Voraussetzungen",
  ready: "Bereit",
  researched: "Erforscht",
  manual: "Manuell",
  trip: "Stromausfall",
  recovery: "Wiederhergestellt",
  buy: "Kaufen",
  buyMax: "Maximum kaufen",
  disabled: "Deaktiviert",
  initialHydrogen: "Wasserstoff ist anfangs freigeschaltet",
  increaseAllStorage: "Bezahlbare Lager erweitern",
  researchAutobuyer: "Verfügbare Technologien automatisch erforschen",
  notation: "Zahlennotation",
  standardNotation: "Standard",
  scientificNotation: "Wissenschaftlich",
  unavailable: "Ungedeckter Bedarf",
  purchaseUnavailable: "Du hast noch nicht genug Ressourcen für diesen Kauf.",
  collectStorageFull:
    "Der Speicher ist voll. Erweitere die Kapazität, um mehr zu sammeln oder herzustellen.",
  automaticProductionBlockedByStorage:
    "Die automatische Produktion ist blockiert, solange der Speicher voll ist.",
  saleNoStock: "Es sind keine ganzen {good}-Einheiten zum Verkauf verfügbar.",
  needGoodAmount: "Benötigt werden {amount} {good}.",
  needCashAmount: "Benötigt werden {amount} Bargeld.",
  compoundPreview: "Erzeugt {amount} {good}; benötigte Rohstoffe: {inputs}.",
  fusionPreview:
    "Die Fusion von {sourceAmount} {source} kann {minimum}–{maximum} {target} ergeben; bis zu {stored} passen in den Speicher.",
  fusionSourceShort: "Benötigt werden {amount} {source}; verfügbar: {available}.",
  fusionWholeAmount: "Gib eine ganze Anzahl Einheiten für die Fusion ein.",
  buyMaxPreview: "Maximum kaufen: {count} · Gesamtkosten {costs} · Ergebnis {result}.",
  buyMaxInsufficientMaterials: "Benötigt: {required} {good}; verfügbar: {available}.",
  researchToUnlock: "Erforsche {technology}, um dieses System freizuschalten.",
  nanoBrokersRequirement: "Nano-Broker {level}",
  researchAutomation: "Robotische Forschungsautomatisierung",
  researchAutobuyerLockedUntil: "(gesperrt, bis {technology} erforscht ist)",
  hydrogenAdvancedCompressorHelp:
    "Füge einen fortgeschrittenen Wasserstoffkompressor für verbesserte Automatisierung hinzu.",
};
const it: Record<EconomyLabel, string> = {
  resources: "Risorse",
  resourcesOverviewHelp:
    "Qui puoi ottenere e vendere risorse. Puoi anche migliorare la capacità di archiviazione e automatizzare la raccolta delle risorse. Quando scoprirai la fusione, la gestirai anche qui.",
  gases: "Gas",
  liquids: "Liquidi",
  solids: "Solidi",
  compounds: "Composti",
  compoundsOverviewHelp:
    "Qui puoi creare e vendere composti da parti costituenti o con macchinari avanzati.",
  interstellarOverviewHelp: "Qui puoi esplorare la galassia e scoprire nuove stelle e pianeti.",
  researchOverviewHelp:
    "Nella sezione Ricerca, puoi sbloccare nuove tecnologie per progredire nel gioco, e anche ottenere potenziamenti per farmare punti ricerca.",
  energyOverviewHelp:
    "Qui puoi acquistare potenziamenti per generare energia necessaria per edifici più avanzati.",
  spaceMiningOverviewHelp:
    "Qui puoi costruire navi per estrarre asteroidi in cerca di preziosa Antimateria, permettendoti di visitare località nella Mappa Stellare, e davvero iniziare a conquistare la galassia!",
  galacticOverviewHelp:
    "Qui puoi scambiare i tuoi AP per potenziamenti permanenti e resettare le run.",
  settingsOverviewHelp: "Cambia le impostazioni di gioco a tuo piacimento.",
  eventsOverviewHelp: "Qui puoi vedere eventi in corso o storici e gli effetti che hanno.",
  hydrogenOverviewHelp:
    "L\u0027elemento più basilare conosciuto dall\u0027uomo, molto economico da produrre e ha un valore piuttosto basso, ma qualsiasi cosa può essere creata da esso.",
  heliumOverviewHelp: "Più leggero dell\u0027aria, questo ti farà fluttuare via!",
  carbonOverviewHelp: "Questo è il primo elemento solido stabile, fatto da Elio fuso.",
  neonOverviewHelp: "Il primo gas nobile! Molto \u0027luminoso\u0027 da parte tua scoprirlo!",
  oxygenOverviewHelp:
    "Un elemento vitale per la maggior parte, l\u0027Ossigeno è altamente reattivo ed essenziale per la combustione e la respirazione.",
  sodiumOverviewHelp: "Un metallo morbido e argenteo.",
  siliconOverviewHelp:
    "La spina dorsale della tecnologia moderna, è un componente cruciale nell\u0027elettronica e nei pannelli solari.",
  ironOverviewHelp:
    "Un metallo forte e versatile, il Ferro è la base della costruzione e dell\u0027industria.",
  dieselOverviewHelp: "Il primo composto creato dalle tue mani, è un utile carburante iniziale.",
  glassOverviewHelp: "Questo è vetro specialista rinforzato ed è ottimo per applicazioni solari.",
  steelOverviewHelp:
    "Questo è acciaio rinforzato, altamente durevole e usato in costruzione e produzione.",
  waterOverviewHelp:
    "L\u0027acqua è una risorsa essenziale che può essere prodotta, o raccolta dalla pioggia nel tuo bacino idrico.",
  concreteOverviewHelp:
    "Il calcestruzzo è un materiale da costruzione fondamentale usato in costruzione, offrendo forza e versatilità.",
  titaniumOverviewHelp:
    "Il Titanio è un metallo forte, leggero e resistente alla corrosione, necessario per costruzione avanzata.",
  collect: "Raccogli +1",
  sell: "Vendi",
  sellAll: "Vendi tutto",
  allStock: "Tutto lo Stock",
  threeQuartersStock: "75% Stock",
  twoThirdsStock: "67% Stock",
  halfStock: "50% Stock",
  oneThirdStock: "33% Stock",
  saleAmount: "Quantità da vendere",
  salePreview: "Anteprima vendita",
  saleNotification: "Hai venduto {amount} di {good} per {cash}!",
  storageIncreasedNotice: "Lo spazio di stoccaggio di {good} è stato aumentato a {capacity}.",
  storageFullNotice: "Lo stoccaggio di {good} è pieno.",
  autobuyerPurchaseNotice: "Automatismi per {good} (livello {tier}): +{count}.",
  storage: "Deposito",
  energyStorage: "Batterie",
  batteryStorageHelp:
    "Qualsiasi edificio oltre il primo livello richiede energia per operare, puoi immagazzinare quell'energia qui. Le batterie immagazzinano l'energia generata in eccesso e la forniscono quando i generatori non riescono a soddisfare la domanda.",
  energyPower: "Potenza",
  energyPowerHelp:
    "Qui puoi acquistare potenziamenti per generare energia necessaria per edifici più avanzati.",
  energySummary: "Riepilogo energia",
  increaseStorage: "Aumenta deposito",
  autobuyers: "Acquisti automatici",
  buyTier: "Compra livello",
  pause: "Pausa",
  resume: "Riprendi",
  owned: "Posseduti",
  perSecond: "al secondo",
  lockedBy: "Richiede",
  unlocked: "Sbloccato",
  fuse: "Fondi",
  fusionCompleted: "Fusi {sourceAmount} {source} per produrre {outputAmount} {target}.",
  fusionDiscoveredNotice:
    "Hai scoperto {target} fondendo {sourceAmount} {source}: generati {generatedAmount} {target}, ricevuti {outputAmount}; {efficiencyLost} persi per l'efficienza di fusione e {storageLost} per spazio insufficiente.",
  fusionEfficiencyNotice:
    "Fusi {sourceAmount} {source} in {target}: ricevuti {outputAmount}; {lostAmount} persi per l'efficienza di fusione (produzione ideale: {idealAmount}).",
  fusionStorageNotice:
    "Fusi {sourceAmount} {source} in {target}: generati {generatedAmount}, immagazzinati {outputAmount}; {efficiencyLost} persi per l'efficienza e {storageLost} per lo spazio insufficiente.",
  compoundCreatedNotice: "Hai creato {amount} di {compound} da {parts}",
  source: "Origine",
  target: "Risultato",
  amount: "Quantità",
  create: "Crea",
  recipe: "Ricetta",
  automaticCreation: "Creazione automatica",
  autoCreateAllocationHelp:
    "La creazione automatica attinge solo alla quota che il pannello di ogni ingrediente rende disponibile ai composti. Quella quota è divisa in parti uguali tra tutti i composti che la usano.",
  allocation: "Allocazione produzione",
  cashShare: "Quota denaro",
  compoundShare: "Quota composti",
  allocationHelp:
    "Trascina una maniglia per modificare la ripartizione. Con una maniglia attiva, usa le frecce per spostarla a intervalli del 5%; Inizio e Fine la portano a un'estremità.",
  retainedShare: "Quota conservata",
  energy: "Energia",
  generationMix: "Composizione della produzione elettrica",
  generationTotal: "Produzione totale",
  energyConsumption: "Consumo totale",
  powerGridOff: "Rete elettrica spenta: i generatori attivi producono 0 kJ/s.",
  powerGridTripped: "Interruzione elettrica: i generatori attivi producono 0 kJ/s.",
  infinitePowerAvailable: "La fornitura di energia infinita è attiva.",
  generationChartSummary:
    "{plant1}: {rate1} kJ/s; {plant2}: {rate2} kJ/s; {plant3}: {rate3} kJ/s. {totalLabel}: {total} kJ/s. {consumptionLabel}: {consumption} kJ/s.",
  powerPlantSupplyHelp:
    "Questi edifici forniscono la risorsa energetica, ed è usata da edifici avanzati, senza i quali non opereranno.",
  advancedPowerPlantHelp:
    "Questi edifici forniscono maggiori quantità di energia per alimentare molti macchinari.",
  solarPowerPlantRenewable:
    "Le centrali solari forniscono energia rinnovabile senza usare alcuna risorsa.",
  powerPlant1Help: "Questo è il primo edificio disponibile per produrre energia.",
  powerPlant2Help:
    "Questo edificio produce energia pulita e rinnovabile senza usare risorse, ma la sua efficienza dipende dal tempo!",
  powerPlant3Help:
    "Questo edificio produce significativamente più energia della sua versione precedente, ma consuma più risorse.",
  battery1Help:
    "Immagazzina una piccola quantità di energia da usare se l'energia inizia a essere consumata più velocemente di quanto possa essere generata.",
  battery2Help:
    "Immagazzina una maggiore quantità di energia da usare se l'energia inizia a essere consumata più velocemente di quanto possa essere generata.",
  battery3Help:
    "Immagazzina un'enorme quantità di energia da usare se l'energia inizia a essere consumata più velocemente di quanto possa essere generata.",
  generated: "Generata",
  consumed: "Consumato",
  stored: "Immagazzinata",
  capacity: "Capacità",
  activatePower: "Accendi",
  deactivatePower: "Spegni",
  research: "Ricerca",
  points: "Punti ricerca",
  scienceBuildings: "Edifici scientifici",
  scienceBuildingsHelp:
    "Qui puoi acquistare potenziamenti per generare punti ricerca per sbloccare nuove tecnologie.",
  researchSectionHelp:
    "Nella sezione Ricerca, puoi sbloccare nuove tecnologie per progredire nel gioco, e anche ottenere potenziamenti per farmare punti ricerca.",
  technologies: "Tecnologie",
  technology: "Tecnologia",
  technologyTree: "Albero tecnologico",
  treeProgress: "Fai ricerca per rivelare le tecnologie nell’albero.",
  shown: "Visibili",
  noAffordableTechnologies: "Ottieni più punti ricerca per rivelare nuove tecnologie.",
  researchPointsShortfall:
    "Punti ricerca mancanti: {current} disponibili; ne servono {required} (ne mancano {shortfall}).",
  researchTech: "Ricerca tecnologia",
  zoom: "Zoom",
  zoomIn: "Ingrandisci",
  zoomOut: "Riduci",
  resetZoom: "Reimposta zoom",
  technologyTreePanHelp:
    "Qui puoi sbloccare nuove tecnologie per migliorare il tuo gioco, a condizione che tu abbia abbastanza punti ricerca! Qui puoi vedere una rappresentazione visiva delle tecnologie e di ciò che forniscono. Puoi fare zoom con la rotella del mouse. Dai il focus all'albero e usa le frecce o Pag Su/Pag Giù per spostarti.",
  prerequisites: "Prerequisiti",
  ready: "Disponibile",
  researched: "Ricercata",
  manual: "Manuale",
  trip: "Interruzione elettrica",
  recovery: "Ripristinata",
  buy: "Compra",
  buyMax: "Compra il massimo",
  disabled: "Disattivato",
  initialHydrogen: "L'idrogeno è sbloccato all'inizio",
  increaseAllStorage: "Aumenta i depositi accessibili",
  researchAutobuyer: "Ricerca automaticamente le tecnologie disponibili",
  notation: "Notazione numerica",
  standardNotation: "Standard",
  scientificNotation: "Scientifica",
  unavailable: "Fabbisogno non coperto",
  purchaseUnavailable: "Non hai ancora risorse sufficienti per questo acquisto.",
  collectStorageFull: "Il deposito è pieno. Aumenta la capacità per raccogliere o creare altro.",
  automaticProductionBlockedByStorage:
    "La produzione automatica è bloccata finché lo stoccaggio è pieno.",
  saleNoStock: "Non ci sono unità intere di {good} da vendere.",
  needGoodAmount: "Servono {amount} {good}.",
  needCashAmount: "Servono {amount} in denaro.",
  compoundPreview: "Crea {amount} {good}; risorse necessarie: {inputs}.",
  fusionPreview:
    "Fondere {sourceAmount} {source} può produrre {minimum}–{maximum} {target}; nel deposito entrano fino a {stored}.",
  fusionSourceShort: "Servono {amount} {source}; disponibili: {available}.",
  fusionWholeAmount: "Inserisci un numero intero di unità da fondere.",
  buyMaxPreview: "Compra il massimo: {count} · costo totale {costs} · risultato {result}.",
  buyMaxInsufficientMaterials: "Servono {required} {good}; disponibili: {available}.",
  researchToUnlock: "Ricerca {technology} per sbloccare questo sistema.",
  nanoBrokersRequirement: "Nano Broker {level}",
  researchAutomation: "Automazione robotica della ricerca",
  researchAutobuyerLockedUntil: "(bloccato finché non viene ricercata {technology})",
  hydrogenAdvancedCompressorHelp:
    "Aggiungi un Compressore Avanzato di Idrogeno per automazione migliorata.",
};
const fr: Record<EconomyLabel, string> = {
  resources: "Ressources",
  resourcesOverviewHelp:
    "Ici tu peux gagner et vendre des ressources. Tu peux aussi améliorer ta capacité de stockage et automatiser la collecte des ressources. Quand tu découvriras la fusion, tu la géreras aussi ici.",
  gases: "Gaz",
  liquids: "Liquides",
  solids: "Solides",
  compounds: "Composés",
  compoundsOverviewHelp:
    "Ici tu peux créer et vendre des composés à partir de parties constitutives ou avec des machines avancées.",
  interstellarOverviewHelp:
    "Ici tu peux explorer la galaxie et découvrir de nouvelles étoiles et planètes.",
  researchOverviewHelp:
    "Dans la section Recherche, tu peux débloquer de nouvelles technologies pour progresser dans le jeu, et aussi obtenir des améliorations pour farmer des points de recherche.",
  energyOverviewHelp:
    "Ici tu peux acheter des améliorations pour générer de l\u0027énergie nécessaire pour des bâtiments plus avancés.",
  spaceMiningOverviewHelp:
    "Ici tu peux construire des vaisseaux pour extraire des astéroïdes en quête d\u0027Antimatière précieuse, permettant de visiter des lieux sur la Carte Stellaire, et vraiment commencer à conquérir la galaxie!",
  galacticOverviewHelp:
    "Ici tu peux échanger tes AP contre des buffs permanents et réinitialiser les runs.",
  settingsOverviewHelp: "Change les paramètres du jeu selon tes préférences.",
  eventsOverviewHelp:
    "Ici tu peux voir tout événement en cours ou historique et les effets qu\u0027ils ont.",
  hydrogenOverviewHelp:
    "L\u0027élément le plus basique connu de l\u0027homme, très bon marché à produire et a une valeur assez faible, mais n\u0027importe quoi peut être créé à partir de cela.",
  heliumOverviewHelp: "Plus léger que l\u0027air, celui-ci te fera flotter!",
  carbonOverviewHelp: "Ceci est le premier élément solide stable, fait d\u0027Hélium fusionné.",
  neonOverviewHelp: "Le premier gaz noble! Très \u0027brillant\u0027 de ta part de le découvrir!",
  oxygenOverviewHelp:
    "Un élément vital pour la plupart, l\u0027Oxygène est hautement réactif et essentiel pour la combustion et la respiration.",
  sodiumOverviewHelp: "Un métal mou et argenté.",
  siliconOverviewHelp:
    "La colonne vertébrale de la technologie moderne, c\u0027est un composant crucial dans l\u0027électronique et les panneaux solaires.",
  ironOverviewHelp:
    "Un métal fort et polyvalent, le Fer est le fondement de la construction et de l\u0027industrie.",
  dieselOverviewHelp:
    "Le premier composé créé par tes mains, c\u0027est un carburant utile pour débuter.",
  glassOverviewHelp:
    "C\u0027est du verre spécialiste renforcé et c\u0027est excellent pour les applications solaires.",
  steelOverviewHelp:
    "C\u0027est de l\u0027acier renforcé, hautement durable et utilisé dans la construction et la fabrication.",
  waterOverviewHelp:
    "L\u0027eau est une ressource essentielle qui peut être produite, ou collectée de la pluie dans ton réservoir.",
  concreteOverviewHelp:
    "Le béton est un matériau de construction fondamental utilisé dans la construction, offrant force et polyvalence.",
  titaniumOverviewHelp:
    "Le Titane est un métal fort, léger et résistant à la corrosion, nécessaire pour la construction avancée.",
  collect: "Collecter +1",
  sell: "Vendre",
  sellAll: "Tout vendre",
  allStock: "Tout le Stock",
  threeQuartersStock: "75% Stock",
  twoThirdsStock: "67% Stock",
  halfStock: "50% Stock",
  oneThirdStock: "33% Stock",
  saleAmount: "Quantité à vendre",
  salePreview: "Aperçu de vente",
  saleNotification: "Vous avez vendu {amount} de {good} pour {cash}!",
  storageIncreasedNotice: "La capacité de stockage de {good} a été augmentée à {capacity}.",
  storageFullNotice: "Le stockage de {good} est plein.",
  autobuyerPurchaseNotice: "Automatismes pour {good} (niveau {tier}) : +{count}.",
  storage: "Stockage",
  energyStorage: "Batteries",
  batteryStorageHelp:
    "Tout bâtiment au-delà du premier niveau nécessite de l'énergie pour fonctionner, tu peux stocker cette énergie ici. Les batteries stockent l’énergie produite en surplus et la fournissent lorsque les générateurs ne couvrent pas la demande.",
  energyPower: "Puissance",
  energyPowerHelp:
    "Ici tu peux acheter des améliorations pour générer de l'énergie nécessaire pour des bâtiments plus avancés.",
  energySummary: "Résumé énergétique",
  increaseStorage: "Augmenter le stockage",
  autobuyers: "Achats automatiques",
  buyTier: "Acheter le niveau",
  pause: "Mettre en pause",
  resume: "Reprendre",
  owned: "Possédés",
  perSecond: "par seconde",
  lockedBy: "Nécessite",
  unlocked: "Débloqué",
  fuse: "Fusionner",
  fusionCompleted: "{sourceAmount} {source} fusionnés pour produire {outputAmount} {target}.",
  fusionDiscoveredNotice:
    "Découverte de {target} en fusionnant {sourceAmount} {source} : {generatedAmount} {target} générés, {outputAmount} stockés ; {efficiencyLost} perdus à cause du rendement de fusion et {storageLost} faute de stockage.",
  fusionEfficiencyNotice:
    "{sourceAmount} {source} fusionnés en {target} : {outputAmount} reçus ; {lostAmount} perdus à cause du rendement de fusion (production idéale : {idealAmount}).",
  fusionStorageNotice:
    "{sourceAmount} {source} fusionnés en {target} : {generatedAmount} produits, {outputAmount} stockés ; {efficiencyLost} perdus par rendement et {storageLost} par manque de stockage.",
  compoundCreatedNotice: "Vous avez créé {amount} de {compound} à partir de {parts}",
  source: "Source",
  target: "Résultat",
  amount: "Quantité",
  create: "Créer",
  recipe: "Recette",
  automaticCreation: "Création automatique",
  autoCreateAllocationHelp:
    "La création automatisée ne puise que dans la part que le panneau de chaque ingrédient rend disponible aux composés. Cette part est divisée également entre tous les composés qui l’utilisent.",
  allocation: "Répartition de production",
  cashShare: "Part en argent",
  compoundShare: "Part en composés",
  allocationHelp:
    "Faites glisser une poignée pour modifier la répartition. Une fois sélectionnée, utilisez les flèches pour la déplacer par pas de 5 % ; Début et Fin la placent à une extrémité.",
  retainedShare: "Part conservée",
  energy: "Énergie",
  generationMix: "Répartition de la production électrique",
  generationTotal: "Production totale",
  energyConsumption: "Consommation totale",
  powerGridOff: "Réseau électrique éteint : les générateurs actifs produisent 0 kJ/s.",
  powerGridTripped: "Coupure électrique : les générateurs actifs produisent 0 kJ/s.",
  infinitePowerAvailable: "L’alimentation électrique illimitée est active.",
  generationChartSummary:
    "{plant1} : {rate1} kJ/s ; {plant2} : {rate2} kJ/s ; {plant3} : {rate3} kJ/s. {totalLabel} : {total} kJ/s. {consumptionLabel} : {consumption} kJ/s.",
  powerPlantSupplyHelp:
    "Ces bâtiments fournissent la ressource énergétique, et elle est utilisée par les bâtiments avancés, sans lesquels ils n'opéreront pas.",
  advancedPowerPlantHelp:
    "Ces bâtiments fournissent des quantités plus élevées d'énergie pour alimenter beaucoup de machines.",
  solarPowerPlantRenewable:
    "Les centrales solaires fournissent de l'énergie renouvelable sans utiliser de ressources.",
  powerPlant1Help: "C'est le premier bâtiment disponible pour produire de l'énergie.",
  powerPlant2Help:
    "Ce bâtiment produit de l'énergie propre et renouvelable sans utiliser de ressources, mais son efficacité dépend de la météo!",
  powerPlant3Help:
    "Ce bâtiment produit beaucoup plus d'énergie que sa version précédente, mais consomme plus de ressources.",
  battery1Help:
    "Stockez une petite quantité d'énergie à utiliser si l'énergie commence à être consommée plus vite qu'elle ne peut être générée.",
  battery2Help:
    "Stockez une plus grande quantité d'énergie à utiliser si l'énergie commence à être consommée plus vite qu'elle ne peut être générée.",
  battery3Help:
    "Stockez une énorme quantité d'énergie à utiliser si l'énergie commence à être consommée plus vite qu'elle ne peut être générée.",
  generated: "Produite",
  consumed: "Consommée",
  stored: "Stockée",
  capacity: "Capacité",
  activatePower: "Activer",
  deactivatePower: "Désactiver",
  research: "Recherche",
  points: "Points de recherche",
  scienceBuildings: "Bâtiments scientifiques",
  scienceBuildingsHelp:
    "Ici tu peux acheter des améliorations pour générer des points de recherche pour débloquer de nouvelles technologies.",
  researchSectionHelp:
    "Dans la section Recherche, tu peux débloquer de nouvelles technologies pour progresser dans le jeu, et aussi obtenir des améliorations pour farmer des points de recherche.",
  technologies: "Technologies",
  technology: "Technologie",
  technologyTree: "Arbre technologique",
  treeProgress: "Faites des recherches pour révéler les technologies de l’arbre.",
  shown: "Affichées",
  noAffordableTechnologies: "Gagnez des points de recherche pour révéler des technologies.",
  researchPointsShortfall:
    "Points de recherche manquants : {current} disponibles ; {required} nécessaires (il en manque {shortfall}).",
  researchTech: "Rechercher la technologie",
  zoom: "Zoom",
  zoomIn: "Zoom avant",
  zoomOut: "Zoom arrière",
  resetZoom: "Réinitialiser le zoom",
  technologyTreePanHelp:
    "Ici tu peux débloquer de nouvelles technologies pour améliorer ton jeu, à condition que tu aies assez de points de recherche ! Ici tu peux voir une représentation visuelle des technologies et de ce qu'elles fournissent. Tu peux zoomer avec la molette de la souris. Donne le focus à l'arbre, puis utilise les flèches ou Page précédente/Page suivante pour le déplacer.",
  prerequisites: "Prérequis",
  ready: "Disponible",
  researched: "Recherchée",
  manual: "Manuel",
  trip: "Coupure électrique",
  recovery: "Rétablie",
  buy: "Acheter",
  buyMax: "Acheter le maximum",
  disabled: "Désactivé",
  initialHydrogen: "L'hydrogène est débloqué au départ",
  increaseAllStorage: "Augmenter le stockage abordable",
  researchAutobuyer: "Rechercher automatiquement les technologies disponibles",
  notation: "Notation numérique",
  standardNotation: "Standard",
  scientificNotation: "Scientifique",
  unavailable: "Demande non satisfaite",
  purchaseUnavailable: "Vous n’avez pas encore les ressources nécessaires à cet achat.",
  collectStorageFull:
    "Le stockage est plein. Augmentez sa capacité pour collecter ou créer davantage.",
  automaticProductionBlockedByStorage:
    "La production automatique est bloquée tant que le stockage est plein.",
  saleNoStock: "Aucune unité entière de {good} n’est disponible à la vente.",
  needGoodAmount: "Il faut {amount} {good}.",
  needCashAmount: "Il faut {amount} en argent.",
  compoundPreview: "Produit {amount} {good} ; ressources nécessaires : {inputs}.",
  fusionPreview:
    "La fusion de {sourceAmount} {source} peut produire {minimum}–{maximum} {target} ; le stockage peut en contenir jusqu’à {stored}.",
  fusionSourceShort: "Il faut {amount} {source} ; disponibles : {available}.",
  fusionWholeAmount: "Saisissez un nombre entier d’unités à fusionner.",
  buyMaxPreview: "Acheter le maximum : {count} · coût total {costs} · résultat {result}.",
  buyMaxInsufficientMaterials: "Il faut {required} {good} ; disponible : {available}.",
  researchToUnlock: "Recherchez {technology} pour débloquer ce système.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Automatisation robotique de la recherche",
  researchAutobuyerLockedUntil: "(verrouillé jusqu’à la recherche de {technology})",
  hydrogenAdvancedCompressorHelp:
    "Ajoute un Compresseur Avancé d'Hydrogène pour une automatisation améliorée.",
};

const messages: Record<LocaleId, Record<EconomyLabel, string>> = { en, es, pt, de, it, fr };
export function economyLabel(locale: LocaleId, key: EconomyLabel): string {
  return messages[locale][key];
}

const ECONOMIC_GOOD_OVERVIEW_KEYS: Record<EconomicGoodId, EconomyLabel> = {
  hydrogen: "hydrogenOverviewHelp",
  helium: "heliumOverviewHelp",
  carbon: "carbonOverviewHelp",
  neon: "neonOverviewHelp",
  oxygen: "oxygenOverviewHelp",
  sodium: "sodiumOverviewHelp",
  silicon: "siliconOverviewHelp",
  iron: "ironOverviewHelp",
  diesel: "dieselOverviewHelp",
  glass: "glassOverviewHelp",
  steel: "steelOverviewHelp",
  water: "waterOverviewHelp",
  concrete: "concreteOverviewHelp",
  titanium: "titaniumOverviewHelp",
};

export function economyGoodOverviewHelp(locale: LocaleId, id: EconomicGoodId): string {
  return economyLabel(locale, ECONOMIC_GOOD_OVERVIEW_KEYS[id]);
}
export function formatEconomyMessage(
  locale: LocaleId,
  key: EconomyLabel,
  values: Readonly<Record<string, string>>,
): string {
  return Object.entries(values).reduce(
    (message, [placeholder, value]) => message.replaceAll(`{${placeholder}}`, value),
    economyLabel(locale, key),
  );
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
