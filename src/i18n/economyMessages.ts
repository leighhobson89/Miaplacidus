import type { LocaleId } from "../content/ids";

type EconomyLabel =
  | "resources"
  | "gases"
  | "liquids"
  | "solids"
  | "compounds"
  | "collect"
  | "sell"
  | "sellAll"
  | "saleAmount"
  | "salePreview"
  | "saleNotification"
  | "storage"
  | "energyStorage"
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
  | "source"
  | "target"
  | "amount"
  | "create"
  | "recipe"
  | "automaticCreation"
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
  | "generated"
  | "consumed"
  | "stored"
  | "capacity"
  | "powerGrid"
  | "powerAll"
  | "powerAllNeedsPlant"
  | "research"
  | "points"
  | "scienceBuildings"
  | "technologies"
  | "technology"
  | "technologyTree"
  | "treeProgress"
  | "shown"
  | "noAffordableTechnologies"
  | "researchTech"
  | "zoom"
  | "zoomIn"
  | "zoomOut"
  | "resetZoom"
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
  | "researchToUnlock"
  | "nanoBrokersRequirement"
  | "researchAutomation"
  | "researchAutobuyerLockedUntil";

const en: Record<EconomyLabel, string> = {
  resources: "Resources",
  gases: "Gases",
  liquids: "Liquids",
  solids: "Solids",
  compounds: "Compounds",
  collect: "Collect +1",
  sell: "Sell",
  sellAll: "Sell all",
  saleAmount: "Sale amount",
  salePreview: "Sale preview",
  saleNotification: "You sold {amount} {good} for {cash}!",
  storage: "Storage",
  energyStorage: "Energy Storage",
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
  source: "Source",
  target: "Output",
  amount: "Amount",
  create: "Create",
  recipe: "Recipe",
  automaticCreation: "Automatic creation",
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
  generated: "Generated",
  consumed: "Consumed",
  stored: "Stored",
  capacity: "Capacity",
  powerGrid: "Power grid",
  powerAll: "Power all plants",
  powerAllNeedsPlant: "Build a power plant before changing all plant states.",
  research: "Research",
  points: "Research points",
  scienceBuildings: "Science buildings",
  technologies: "Technologies",
  technology: "Technology",
  technologyTree: "Tech Tree",
  treeProgress: "Research to reveal technologies in the tree.",
  shown: "Shown",
  noAffordableTechnologies: "Earn more research points to reveal technologies.",
  researchTech: "Research technology",
  zoom: "Zoom",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Reset zoom",
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
  researchToUnlock: "Research {technology} to unlock this system.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Robotic Research Automation",
  researchAutobuyerLockedUntil: "(locked until {technology} is researched)",
};
const es: Record<EconomyLabel, string> = {
  resources: "Recursos",
  gases: "Gases",
  liquids: "Líquidos",
  solids: "Sólidos",
  compounds: "Compuestos",
  collect: "Recolectar +1",
  sell: "Vender",
  sellAll: "Vender todo",
  saleAmount: "Cantidad de venta",
  salePreview: "Vista previa de venta",
  saleNotification: "¡Has vendido {amount} de {good} por {cash}!",
  storage: "Almacenamiento",
  energyStorage: "Almacenamiento de energía",
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
  source: "Origen",
  target: "Resultado",
  amount: "Cantidad",
  create: "Crear",
  recipe: "Receta",
  automaticCreation: "Creación automática",
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
  generated: "Generada",
  consumed: "Consumida",
  stored: "Almacenada",
  capacity: "Capacidad",
  powerGrid: "Red eléctrica",
  powerAll: "Activar todas las plantas",
  powerAllNeedsPlant: "Construye una planta de energía antes de cambiar su estado.",
  research: "Investigación",
  points: "Puntos de investigación",
  scienceBuildings: "Edificios científicos",
  technologies: "Tecnologías",
  technology: "Tecnología",
  technologyTree: "Árbol tecnológico",
  treeProgress: "Investiga para revelar tecnologías en el árbol.",
  shown: "Visibles",
  noAffordableTechnologies: "Consigue más puntos de investigación para revelar tecnologías.",
  researchTech: "Investigar tecnología",
  zoom: "Zoom",
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  resetZoom: "Restablecer zoom",
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
  researchToUnlock: "Investiga {technology} para desbloquear este sistema.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Automatización robótica de investigación",
  researchAutobuyerLockedUntil: "(bloqueado hasta investigar {technology})",
};
const pt: Record<EconomyLabel, string> = {
  resources: "Recursos",
  gases: "Gases",
  liquids: "Líquidos",
  solids: "Sólidos",
  compounds: "Compostos",
  collect: "Recolher +1",
  sell: "Vender",
  sellAll: "Vender tudo",
  saleAmount: "Quantidade da venda",
  salePreview: "Prévia da venda",
  saleNotification: "Vendeste {amount} de {good} por {cash}!",
  storage: "Armazenamento",
  energyStorage: "Armazenamento de energia",
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
  source: "Origem",
  target: "Resultado",
  amount: "Quantidade",
  create: "Criar",
  recipe: "Receita",
  automaticCreation: "Criação automática",
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
  generated: "Gerada",
  consumed: "Consumida",
  stored: "Armazenada",
  capacity: "Capacidade",
  powerGrid: "Rede elétrica",
  powerAll: "Ligar todas as centrais",
  powerAllNeedsPlant: "Construa uma central antes de alterar o estado de todas.",
  research: "Pesquisa",
  points: "Pontos de pesquisa",
  scienceBuildings: "Edifícios científicos",
  technologies: "Tecnologias",
  technology: "Tecnologia",
  technologyTree: "Árvore tecnológica",
  treeProgress: "Pesquisa para revelar tecnologias na árvore.",
  shown: "Exibidas",
  noAffordableTechnologies: "Obtenha mais pontos de pesquisa para revelar tecnologias.",
  researchTech: "Pesquisar tecnologia",
  zoom: "Zoom",
  zoomIn: "Aumentar zoom",
  zoomOut: "Diminuir zoom",
  resetZoom: "Redefinir zoom",
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
  researchToUnlock: "Pesquisa {technology} para desbloquear este sistema.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Automação Robótica de Pesquisa",
  researchAutobuyerLockedUntil: "(bloqueado até pesquisar {technology})",
};
const de: Record<EconomyLabel, string> = {
  resources: "Ressourcen",
  gases: "Gase",
  liquids: "Flüssigkeiten",
  solids: "Feststoffe",
  compounds: "Verbindungen",
  collect: "+1 sammeln",
  sell: "Verkaufen",
  sellAll: "Alles verkaufen",
  saleAmount: "Verkaufsmenge",
  salePreview: "Verkaufswert",
  saleNotification: "Du hast {amount} {good} für {cash} verkauft!",
  storage: "Lager",
  energyStorage: "Energiespeicher",
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
  source: "Quelle",
  target: "Ausgabe",
  amount: "Menge",
  create: "Herstellen",
  recipe: "Rezept",
  automaticCreation: "Automatische Herstellung",
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
  generated: "Erzeugt",
  consumed: "Verbraucht",
  stored: "Gespeichert",
  capacity: "Kapazität",
  powerGrid: "Stromnetz",
  powerAll: "Alle Kraftwerke aktivieren",
  powerAllNeedsPlant: "Baue ein Kraftwerk, bevor du alle Kraftwerkszustände änderst.",
  research: "Forschung",
  points: "Forschungspunkte",
  scienceBuildings: "Forschungsgebäude",
  technologies: "Technologien",
  technology: "Technologie",
  technologyTree: "Technologiebaum",
  treeProgress: "Forsche, um Technologien im Baum sichtbar zu machen.",
  shown: "Sichtbar",
  noAffordableTechnologies: "Sammle mehr Forschungspunkte, um Technologien aufzudecken.",
  researchTech: "Technologie erforschen",
  zoom: "Zoom",
  zoomIn: "Vergrößern",
  zoomOut: "Verkleinern",
  resetZoom: "Zoom zurücksetzen",
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
  researchToUnlock: "Erforsche {technology}, um dieses System freizuschalten.",
  nanoBrokersRequirement: "Nano-Broker {level}",
  researchAutomation: "Robotische Forschungsautomatisierung",
  researchAutobuyerLockedUntil: "(gesperrt, bis {technology} erforscht ist)",
};
const it: Record<EconomyLabel, string> = {
  resources: "Risorse",
  gases: "Gas",
  liquids: "Liquidi",
  solids: "Solidi",
  compounds: "Composti",
  collect: "Raccogli +1",
  sell: "Vendi",
  sellAll: "Vendi tutto",
  saleAmount: "Quantità da vendere",
  salePreview: "Anteprima vendita",
  saleNotification: "Hai venduto {amount} di {good} per {cash}!",
  storage: "Deposito",
  energyStorage: "Deposito di energia",
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
  source: "Origine",
  target: "Risultato",
  amount: "Quantità",
  create: "Crea",
  recipe: "Ricetta",
  automaticCreation: "Creazione automatica",
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
  generated: "Generata",
  consumed: "Consumato",
  stored: "Immagazzinata",
  capacity: "Capacità",
  powerGrid: "Rete elettrica",
  powerAll: "Attiva tutte le centrali",
  powerAllNeedsPlant: "Costruisci una centrale prima di modificarne tutti gli stati.",
  research: "Ricerca",
  points: "Punti ricerca",
  scienceBuildings: "Edifici scientifici",
  technologies: "Tecnologie",
  technology: "Tecnologia",
  technologyTree: "Albero tecnologico",
  treeProgress: "Fai ricerca per rivelare le tecnologie nell’albero.",
  shown: "Visibili",
  noAffordableTechnologies: "Ottieni più punti ricerca per rivelare nuove tecnologie.",
  researchTech: "Ricerca tecnologia",
  zoom: "Zoom",
  zoomIn: "Ingrandisci",
  zoomOut: "Riduci",
  resetZoom: "Reimposta zoom",
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
  researchToUnlock: "Ricerca {technology} per sbloccare questo sistema.",
  nanoBrokersRequirement: "Nano Broker {level}",
  researchAutomation: "Automazione robotica della ricerca",
  researchAutobuyerLockedUntil: "(bloccato finché non viene ricercata {technology})",
};
const fr: Record<EconomyLabel, string> = {
  resources: "Ressources",
  gases: "Gaz",
  liquids: "Liquides",
  solids: "Solides",
  compounds: "Composés",
  collect: "Collecter +1",
  sell: "Vendre",
  sellAll: "Tout vendre",
  saleAmount: "Quantité à vendre",
  salePreview: "Aperçu de vente",
  saleNotification: "Vous avez vendu {amount} de {good} pour {cash}!",
  storage: "Stockage",
  energyStorage: "Stockage d’énergie",
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
  source: "Source",
  target: "Résultat",
  amount: "Quantité",
  create: "Créer",
  recipe: "Recette",
  automaticCreation: "Création automatique",
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
  generated: "Produite",
  consumed: "Consommée",
  stored: "Stockée",
  capacity: "Capacité",
  powerGrid: "Réseau électrique",
  powerAll: "Activer toutes les centrales",
  powerAllNeedsPlant: "Construisez une centrale avant de modifier l’état des centrales.",
  research: "Recherche",
  points: "Points de recherche",
  scienceBuildings: "Bâtiments scientifiques",
  technologies: "Technologies",
  technology: "Technologie",
  technologyTree: "Arbre technologique",
  treeProgress: "Faites des recherches pour révéler les technologies de l’arbre.",
  shown: "Affichées",
  noAffordableTechnologies: "Gagnez des points de recherche pour révéler des technologies.",
  researchTech: "Rechercher la technologie",
  zoom: "Zoom",
  zoomIn: "Zoom avant",
  zoomOut: "Zoom arrière",
  resetZoom: "Réinitialiser le zoom",
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
  researchToUnlock: "Recherchez {technology} pour débloquer ce système.",
  nanoBrokersRequirement: "Nano Brokers {level}",
  researchAutomation: "Automatisation robotique de la recherche",
  researchAutobuyerLockedUntil: "(verrouillé jusqu’à la recherche de {technology})",
};

const messages: Record<LocaleId, Record<EconomyLabel, string>> = { en, es, pt, de, it, fr };
export function economyLabel(locale: LocaleId, key: EconomyLabel): string {
  return messages[locale][key];
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
