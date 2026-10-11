import type { AchievementId } from "../content/achievements";
import type { LocaleId } from "../content/ids";

// Exact source achievement-notice copy, keyed by the remake's stable achievement IDs.
export const ACHIEVEMENT_NOTIFICATION_COPY = {
  en: {
    collect50Hydrogen: "ACHIEVEMENT:\nYou have collected 50 Hydrogen!\n\nREWARD: {cashReward}",
    collect1000Hydrogen: "ACHIEVEMENT:\nYou have collected 1000 Hydrogen!\n\nREWARD: {cashReward}",
    collect5000Carbon: "ACHIEVEMENT:\nYou have collected 5000 Carbon!\n\nREWARD: {cashReward}",
    collect50000Iron: "ACHIEVEMENT:\nYou have collected 50000 Iron!\n\nREWARD: {cashReward}",
    collect100Precipitation:
      "ACHIEVEMENT:\nYou have collected 100 Precipitation!\n\nREWARD: {cashReward}",
    fuseElement: "ACHIEVEMENT:\nYou have fused an element!\n\nREWARD: {cashReward}",
    createSteel:
      "ACHIEVEMENT:\nYou have created Steel!\n\nREWARD: -20% Compound Creation Material Costs",
    createTitanium:
      "ACHIEVEMENT:\nYou have created Titanium!\n\nREWARD: -20% Compound Creation Material Costs",
    unlockCompounds: "ACHIEVEMENT:\nYou have unlocked Compounds!\n\nREWARD: {cashReward}",
    researchTechnology:
      "ACHIEVEMENT:\nYou have researched a new Technology!\n\nREWARD: {cashReward}",
    researchAllTechnologies: "ACHIEVEMENT:\nYou have researched all Technologies!\n\nREWARD: 1AP",
    achieve100FusionEfficiency:
      "ACHIEVEMENT:\nYou have achieved 100% Fusion efficiency!\n\nREWARD: {cashReward}",
    have50HoursWithOnePioneer:
      "ACHIEVEMENT:\nYou have logged 50 active hours with one Pioneer Name!\n\nREWARD: 50AP",
    buildPowerPlant:
      "ACHIEVEMENT:\nYou have built a Power Plant!\n\nREWARD: x1.1 all Resource Rates",
    buildSolarPowerPlant:
      "ACHIEVEMENT:\nYou have built a Solar Power Plant!\n\nREWARD: x1.2 all Resource Rates",
    collect100TitaniumAsPrecipitation:
      "ACHIEVEMENT:\nYou have collected 100 Titanium as Precipitation!\n\nREWARD: 50AP",
    gain100Cash:
      "ACHIEVEMENT:\nYou have gained 100 cash!\n\nREWARD: x1.1 all Resource & Compound Sales",
    gain10000Cash:
      "ACHIEVEMENT:\nYou have gained 10000 cash!\n\nREWARD: x1.2 all Resource & Compound Sales",
    gain100000Cash:
      "ACHIEVEMENT:\nYou have gained 100000 cash!\n\nREWARD: x1.2 all Resource & Compound Sales",
    gain1000000Cash:
      "ACHIEVEMENT:\nYou have gained 1000000 cash!\n\nREWARD: x1.5 all Resource & Compound Sales",
    seeAllNewsTickers:
      "ACHIEVEMENT:\nYou have seen all News Tickers!\n\nREWARD: Permanent x1.2 all Resource Rates",
    activateAllWackyNewsTickers:
      "ACHIEVEMENT:\nYou have activated all Wacky News Tickers!\n\nREWARD: Permanent -20% Compound Creation Material Costs",
    discoverLegendaryAsteroid:
      "ACHIEVEMENT:\nYou have discovered a Legendary Asteroid!\n\nREWARD: {cashReward}",
    have4RocketsMiningAntimatter:
      "ACHIEVEMENT:\nYou have 4 rockets simultaneously mining Antimatter!\n\nREWARD: {cashReward}",
    tripPower: "ACHIEVEMENT:\nYou have tripped the Power!\n\nREWARD: x1.1 all Resource Rates",
    discoverAsteroid:
      "ACHIEVEMENT:\nYou have discovered an Asteroid!\n\nREWARD: -5% Compound Creation Material Costs",
    launchRocket: "ACHIEVEMENT:\nYou have launched a Rocket!\n\nREWARD: x1.1 all Resource Rates",
    mineAllAntimatterAsteroid:
      "ACHIEVEMENT:\nYou have mined all Antimatter from an Asteroid!\n\nREWARD: 150 Antimatter",
    studyStar:
      "ACHIEVEMENT:\nYou have studied a Star!\n\nREWARD: -5% Compound Creation Material Costs",
    studyStarMoreThan5LYAway:
      "ACHIEVEMENT:\nYou have studied a Star more than 5ly away!\n\nREWARD: -10% Compound Creation Material Costs",
    studyStarMoreThan20LYAway:
      "ACHIEVEMENT:\nYou have studied a Star more than 20ly away!\n\nREWARD: -15% Compound Creation Material Costs",
    launchStarship: "ACHIEVEMENT:\nYou have launched a Starship!\n\nREWARD: {cashReward}",
    performGalacticMarketTransaction:
      "ACHIEVEMENT:\nYou have performed a Galactic Market transaction!\n\nREWARD: 1AP",
    trade10APForCash:
      "ACHIEVEMENT:\nYou have traded 10 AP for Cash in one transaction in the Galactic Market!\n\nREWARD: 5AP",
    initiateDiplomacyWithAlienRace:
      "ACHIEVEMENT:\nYou have initiated diplomacy with an alien race!\n\nREWARD: x1.1 all Resource Rates",
    bullyEnemyIntoSubmission:
      "ACHIEVEMENT:\nYou have bullied an enemy into submission!\n\nREWARD: 1AP",
    vassalizeEnemy: "ACHIEVEMENT:\nYou have vassalized an enemy!\n\nREWARD: 1AP",
    conquerEnemy: "ACHIEVEMENT:\nYou have conquered an enemy!\n\nREWARD: 1AP",
    conquerHiveMindEnemy: "ACHIEVEMENT:\nYou have conquered a Hive Mind enemy!\n\nREWARD: 2AP",
    conquerBelligerentEnemy: "ACHIEVEMENT:\nYou have conquered a Belligerent enemy!\n\nREWARD: 3AP",
    conquerEnemyWithoutScanning:
      "ACHIEVEMENT:\nYou have conquered an enemy without scanning the system!\n\nREWARD: 2AP",
    settleUnoccupiedSystem:
      "ACHIEVEMENT:\nYou have settled an unoccupied system!\n\nREWARD: {cashReward}",
    discoverSystemWithNoLife:
      "ACHIEVEMENT:\nYou have discovered a system with no life!\n\nREWARD: {cashReward}",
    settleSystem: "ACHIEVEMENT:\nYou have settled a system!\n\nREWARD: Pride!",
    spendAP:
      "ACHIEVEMENT:\nYou have spent Ascendency Points (AP)!\n\nREWARD: x1.1 all Resource Rates",
    liquidateAllAssets: "ACHIEVEMENT:\nYou have liquidated all assets!\n\nREWARD: Pride!",
    rebirth: "ACHIEVEMENT:\nYou have rebirthed!\n\nREWARD: Permanent x1.3 all Resource Rates",
    conquer10StarSystems: "ACHIEVEMENT:\nYou have conquered 10 star systems!\n\nREWARD: 10AP",
    conquer50StarSystems: "ACHIEVEMENT:\nYou have conquered 50 star systems!\n\nREWARD: 100AP",
    studyAllStarsInOneRun:
      "ACHIEVEMENT:\nYou have studied all Stars in the Star Map in one run!\n\nREWARD: Pride!",
    adoptPhilosophy: "ACHIEVEMENT:\nYou have adopted a Philosophy!\n\nREWARD: Pride!",
    discoverBlackHole: "ACHIEVEMENT:\nYou have discovered a Black Hole!\n\nREWARD: {cashReward}",
    activateBlackHoleOver10x:
      "ACHIEVEMENT:\nYou have activated a Black Hole at more than 10x Time Warp!\n\nREWARD: x2 all Resource quantities (capped at storage)",
    findAncientManuscript:
      "ACHIEVEMENT:\nYou have found an Ancient Manuscript!\n\nREWARD: x2 all Compound quantities (capped at storage)",
    conquerMegastructureSystem:
      "ACHIEVEMENT:\nYou have conquered a Megastructure System!\n\nREWARD: {cashReward}",
    bringDownMiaplacideanForceField:
      "ACHIEVEMENT:\nYou have brought down the Miaplacidean Force Field!\n\nREWARD: 100AP",
    completeGame: "ACHIEVEMENT:\nYou have completed the game!\n\nREWARD: Pride!",
    completeRunOnMiaplacidus:
      "ACHIEVEMENT:\nYou have completed a run on Miaplacidus!\n\nREWARD: 1GP",
    haveFleetSizeOf50EachShipType:
      "ACHIEVEMENT:\nYou have at least 50 of each ship type!\n\nREWARD: 1000000 Titanium (capped at storage)",
    tryAllThemes: "ACHIEVEMENT:\nYou have tried all Themes!\n\nREWARD: Pride!",
    buyCasinoPoints: "ACHIEVEMENT:\nYou Have Bought Some Casino Points!\n\nREWARD: Pride!",
    winAllCasinoGames: "ACHIEVEMENT:\nYou Have Won A Prize In All Casino Games!\n\nREWARD: 1GP",
    winWheelSpecialPrize:
      "ACHIEVEMENT:\nYou Have Claimed A Wheel Of Fortune Special Prize!\n\nREWARD: Pride!",
    restoreNearSpaceScannerArray:
      "ACHIEVEMENT:\nYou Have Restored The Near Space Scanner Array!\n\nREWARD: Pride!",
    findCosmicRip: "ACHIEVEMENT:\nYou Have Found The Cosmic Rip!\n\nREWARD: Pride!",
    gain1MTelemetryData:
      "ACHIEVEMENT:\nYou Have Gained 1,000,000 Telemetry Data!\n\nREWARD: Pride!",
    closeCosmicRip: "ACHIEVEMENT:\nYou Have Closed The Cosmic Rip!\n\nREWARD: Pride!",
    suffer5NegativeEvents:
      "ACHIEVEMENT:\nYou Have Suffered 5 Negative Instant Events!\n\nREWARD: Pride!",
    enjoyEndlessSummer: "ACHIEVEMENT:\nYou Are Enjoying An Endless Summer!\n\nREWARD: Pride!",
    completeOnboarding: "ACHIEVEMENT:\nYou Have Completed The Onboarding!\n\nREWARD: Pride!",
  },
  es: {
    collect50Hydrogen: "LOGRO:\n¡Has recolectado 50 Hidrógeno!\n\nRECOMPENSA: {cashReward}",
    collect1000Hydrogen: "LOGRO:\n¡Has recolectado 1000 Hidrógeno!\n\nRECOMPENSA: {cashReward}",
    collect5000Carbon: "LOGRO:\n¡Has recolectado 5000 Carbono!\n\nRECOMPENSA: {cashReward}",
    collect50000Iron: "LOGRO:\n¡Has recolectado 50000 Hierro!\n\nRECOMPENSA: {cashReward}",
    collect100Precipitation:
      "LOGRO:\n¡Has recolectado 100 Precipitación!\n\nRECOMPENSA: {cashReward}",
    fuseElement: "LOGRO:\n¡Has fusionado un elemento!\n\nRECOMPENSA: {cashReward}",
    createSteel:
      "LOGRO:\n¡Has creado Acero!\n\nRECOMPENSA: -20% Costes de Materiales de Creación de Compuestos",
    createTitanium:
      "LOGRO:\n¡Has creado Titanio!\n\nRECOMPENSA: -20% Costes de Materiales de Creación de Compuestos",
    unlockCompounds: "LOGRO:\n¡Has desbloqueado Compuestos!\n\nRECOMPENSA: {cashReward}",
    researchTechnology:
      "LOGRO:\n¡Has investigado una nueva Tecnología!\n\nRECOMPENSA: {cashReward}",
    researchAllTechnologies: "LOGRO:\n¡Has investigado todas las Tecnologías!\n\nRECOMPENSA: 1PA",
    achieve100FusionEfficiency:
      "LOGRO:\n¡Has logrado 100% de eficiencia de Fusión!\n\nRECOMPENSA: {cashReward}",
    have50HoursWithOnePioneer:
      "LOGRO:\n¡Has registrado 50 horas activas con un Nombre de Pionero!\n\nRECOMPENSA: 50PA",
    buildPowerPlant:
      "LOGRO:\n¡Has construido una Planta de Energía!\n\nRECOMPENSA: x1.1 todas las Tasas de Recursos",
    buildSolarPowerPlant:
      "LOGRO:\n¡Has construido una Planta de Energía Solar!\n\nRECOMPENSA: x1.2 todas las Tasas de Recursos",
    collect100TitaniumAsPrecipitation:
      "LOGRO:\n¡Has recolectado 100 Titanio como Precipitación!\n\nRECOMPENSA: 50PA",
    gain100Cash:
      "LOGRO:\n¡Has ganado 100 efectivo!\n\nRECOMPENSA: x1.1 todas las Ventas de Recursos y Compuestos",
    gain10000Cash:
      "LOGRO:\n¡Has ganado 10000 efectivo!\n\nRECOMPENSA: x1.2 todas las Ventas de Recursos y Compuestos",
    gain100000Cash:
      "LOGRO:\n¡Has ganado 100000 efectivo!\n\nRECOMPENSA: x1.2 todas las Ventas de Recursos y Compuestos",
    gain1000000Cash:
      "LOGRO:\n¡Has ganado 1000000 efectivo!\n\nRECOMPENSA: x1.5 todas las Ventas de Recursos y Compuestos",
    seeAllNewsTickers:
      "LOGRO:\n¡Has visto todos los Boletines de Noticias!\n\nRECOMPENSA: x1.2 permanente todas las Tasas de Recursos",
    activateAllWackyNewsTickers:
      "LOGRO:\n¡Has activado todos los Boletines de Noticias Locos!\n\nRECOMPENSA: -20% permanente Costes de Materiales de Creación de Compuestos",
    discoverLegendaryAsteroid:
      "LOGRO:\n¡Has descubierto un Asteroide Legendario!\n\nRECOMPENSA: {cashReward}",
    have4RocketsMiningAntimatter:
      "LOGRO:\n¡Tienes 4 cohetes minando Antimateria simultáneamente!\n\nRECOMPENSA: {cashReward}",
    tripPower: "LOGRO:\n¡Has disparado la Energía!\n\nRECOMPENSA: x1.1 todas las Tasas de Recursos",
    discoverAsteroid:
      "LOGRO:\n¡Has descubierto un Asteroide!\n\nRECOMPENSA: -5% Costes de Materiales de Creación de Compuestos",
    launchRocket: "LOGRO:\n¡Has lanzado un Cohete!\n\nRECOMPENSA: x1.1 todas las Tasas de Recursos",
    mineAllAntimatterAsteroid:
      "LOGRO:\n¡Has minado toda la Antimateria de un Asteroide!\n\nRECOMPENSA: 150 Antimateria",
    studyStar:
      "LOGRO:\n¡Has estudiado una Estrella!\n\nRECOMPENSA: -5% Costes de Materiales de Creación de Compuestos",
    studyStarMoreThan5LYAway:
      "LOGRO:\n¡Has estudiado una Estrella a más de 5al de distancia!\n\nRECOMPENSA: -10% Costes de Materiales de Creación de Compuestos",
    studyStarMoreThan20LYAway:
      "LOGRO:\n¡Has estudiado una Estrella a más de 20al de distancia!\n\nRECOMPENSA: -15% Costes de Materiales de Creación de Compuestos",
    launchStarship: "LOGRO:\n¡Has lanzado una Nave Estelar!\n\nRECOMPENSA: {cashReward}",
    performGalacticMarketTransaction:
      "LOGRO:\n¡Has realizado una transacción en el Mercado Galáctico!\n\nRECOMPENSA: 1PA",
    trade10APForCash:
      "LOGRO:\n¡Has intercambiado 10 PA por Efectivo en una transacción en el Mercado Galáctico!\n\nRECOMPENSA: 5PA",
    initiateDiplomacyWithAlienRace:
      "LOGRO:\n¡Has iniciado diplomacia con una raza alienígena!\n\nRECOMPENSA: x1.1 todas las Tasas de Recursos",
    bullyEnemyIntoSubmission:
      "LOGRO:\n¡Has intimidado a un enemigo hasta someterlo!\n\nRECOMPENSA: 1PA",
    vassalizeEnemy: "LOGRO:\n¡Has vasallizado a un enemigo!\n\nRECOMPENSA: 1PA",
    conquerEnemy: "LOGRO:\n¡Has conquistado a un enemigo!\n\nRECOMPENSA: 1PA",
    conquerHiveMindEnemy: "LOGRO:\n¡Has conquistado a un enemigo Mente Colmena!\n\nRECOMPENSA: 2PA",
    conquerBelligerentEnemy:
      "LOGRO:\n¡Has conquistado a un enemigo Beligerante!\n\nRECOMPENSA: 3PA",
    conquerEnemyWithoutScanning:
      "LOGRO:\n¡Has conquistado a un enemigo sin escanear el sistema!\n\nRECOMPENSA: 2PA",
    settleUnoccupiedSystem:
      "LOGRO:\n¡Has colonizado un sistema desocupado!\n\nRECOMPENSA: {cashReward}",
    discoverSystemWithNoLife:
      "LOGRO:\n¡Has descubierto un sistema sin vida!\n\nRECOMPENSA: {cashReward}",
    settleSystem: "LOGRO:\n¡Has colonizado un sistema!\n\nRECOMPENSA: ¡Orgullo!",
    spendAP:
      "LOGRO:\n¡Has gastado Puntos de Ascensión (PA)!\n\nRECOMPENSA: x1.1 todas las Tasas de Recursos",
    liquidateAllAssets: "LOGRO:\n¡Has liquidado todos los activos!\n\nRECOMPENSA: ¡Orgullo!",
    rebirth: "LOGRO:\n¡Has renacido!\n\nRECOMPENSA: x1.3 permanente todas las Tasas de Recursos",
    conquer10StarSystems: "LOGRO:\n¡Has conquistado 10 sistemas estelares!\n\nRECOMPENSA: 10PA",
    conquer50StarSystems: "LOGRO:\n¡Has conquistado 50 sistemas estelares!\n\nRECOMPENSA: 100PA",
    studyAllStarsInOneRun:
      "LOGRO:\n¡Has estudiado todas las Estrellas en el Mapa Estelar en una carrera!\n\nRECOMPENSA: ¡Orgullo!",
    adoptPhilosophy: "LOGRO:\n¡Has adoptado una Filosofía!\n\nRECOMPENSA: ¡Orgullo!",
    discoverBlackHole: "LOGRO:\n¡Has descubierto un Agujero Negro!\n\nRECOMPENSA: {cashReward}",
    activateBlackHoleOver10x:
      "LOGRO:\n¡Has activado un Agujero Negro a más de 10x Distorsión Temporal!\n\nRECOMPENSA: x2 todas las cantidades de Recursos (limitado al almacenamiento)",
    findAncientManuscript:
      "LOGRO:\n¡Has encontrado un Manuscrito Antiguo!\n\nRECOMPENSA: x2 todas las cantidades de Compuestos (limitado al almacenamiento)",
    conquerMegastructureSystem:
      "LOGRO:\n¡Has conquistado un Sistema de Megaestructura!\n\nRECOMPENSA: {cashReward}",
    bringDownMiaplacideanForceField:
      "LOGRO:\n¡Has derribado el Campo de Fuerza Miaplacideo!\n\nRECOMPENSA: 100PA",
    completeGame: "LOGRO:\n¡Has completado el juego!\n\nRECOMPENSA: ¡Orgullo!",
    completeRunOnMiaplacidus:
      "LOGRO:\n¡Has completado una carrera en Miaplacidus!\n\nRECOMPENSA: 1PG",
    haveFleetSizeOf50EachShipType:
      "LOGRO:\n¡Tienes al menos 50 de cada tipo de nave!\n\nRECOMPENSA: 1000000 Titanio (limitado al almacenamiento)",
    tryAllThemes: "LOGRO:\n¡Has probado todos los Temas!\n\nRECOMPENSA: ¡Orgullo!",
    buyCasinoPoints: "LOGRO:\n¡Has Comprado Algunos Puntos de Casino!\n\nRECOMPENSA: ¡Orgullo!",
    winAllCasinoGames:
      "LOGRO:\n¡Has Ganado Un Premio En Todos Los Juegos De Casino!\n\nRECOMPENSA: 1PG",
    winWheelSpecialPrize:
      "LOGRO:\n¡Has Reclamado Un Premio Especial De La Rueda De La Fortuna!\n\nRECOMPENSA: ¡Orgullo!",
    restoreNearSpaceScannerArray:
      "LOGRO:\n¡Has Restaurado El Array De Escáner De Espacio Cercano!\n\nRECOMPENSA: ¡Orgullo!",
    findCosmicRip: "LOGRO:\n¡Has Encontrado El Rasco Cósmico!\n\nRECOMPENSA: ¡Orgullo!",
    gain1MTelemetryData:
      "LOGRO:\n¡Has Ganado 1,000,000 De Datos De Telemetría!\n\nRECOMPENSA: ¡Orgullo!",
    closeCosmicRip: "LOGRO:\n¡Has Cerrado La Fisura Cósmica!\n\nRECOMPENSA: ¡Orgullo!",
    suffer5NegativeEvents:
      "LOGRO:\n¡Has Sufrido 5 Eventos Instantáneos Negativos!\n\nRECOMPENSA: ¡Orgullo!",
    enjoyEndlessSummer: "LOGRO:\n¡Estás Disfrutando De Un Verano Sin Fin!\n\nRECOMPENSA: ¡Orgullo!",
    completeOnboarding: "LOGRO:\n¡Has Completado La Incorporación!\n\nRECOMPENSA: ¡Orgullo!",
  },
  pt: {
    collect50Hydrogen: "CONQUISTA:\nVocê coletou 50 de Hidrogênio!\n\nRECOMPENSA: {cashReward}",
    collect1000Hydrogen: "CONQUISTA:\nVocê coletou 1000 de Hidrogênio!\n\nRECOMPENSA: {cashReward}",
    collect5000Carbon: "CONQUISTA:\nVocê coletou 5000 de Carbono!\n\nRECOMPENSA: {cashReward}",
    collect50000Iron: "CONQUISTA:\nVocê coletou 50000 de Ferro!\n\nRECOMPENSA: {cashReward}",
    collect100Precipitation:
      "CONQUISTA:\nVocê coletou 100 de Precipitação!\n\nRECOMPENSA: {cashReward}",
    fuseElement: "CONQUISTA:\nVocê fundiu um elemento!\n\nRECOMPENSA: {cashReward}",
    createSteel:
      "CONQUISTA:\nVocê criou Aço!\n\nRECOMPENSA: -20% nos Custos de Materiais para Criação de Compostos",
    createTitanium:
      "CONQUISTA:\nVocê criou Titânio!\n\nRECOMPENSA: -20% nos Custos de Materiais para Criação de Compostos",
    unlockCompounds: "CONQUISTA:\nVocê desbloqueou Compostos!\n\nRECOMPENSA: {cashReward}",
    researchTechnology:
      "CONQUISTA:\nVocê pesquisou uma nova Tecnologia!\n\nRECOMPENSA: {cashReward}",
    researchAllTechnologies: "CONQUISTA:\nVocê pesquisou todas as Tecnologias!\n\nRECOMPENSA: 1 AP",
    achieve100FusionEfficiency:
      "CONQUISTA:\nVocê alcançou 100% de eficiência de Fusão!\n\nRECOMPENSA: {cashReward}",
    have50HoursWithOnePioneer:
      "CONQUISTA:\nVocê registrou 50 horas ativas com um Pioneiro!\n\nRECOMPENSA: 50 AP",
    buildPowerPlant:
      "CONQUISTA:\nVocê construiu uma Usina de Energia!\n\nRECOMPENSA: x1,1 em todas as Taxas de Recursos",
    buildSolarPowerPlant:
      "CONQUISTA:\nVocê construiu uma Usina de Energia Solar!\n\nRECOMPENSA: x1,2 em todas as Taxas de Recursos",
    collect100TitaniumAsPrecipitation:
      "CONQUISTA:\nVocê coletou 100 de Titânio como Precipitação!\n\nRECOMPENSA: 50 AP",
    gain100Cash:
      "CONQUISTA:\nVocê ganhou 100 em Dinheiro!\n\nRECOMPENSA: x1,1 em todas as Vendas de Recursos e Compostos",
    gain10000Cash:
      "CONQUISTA:\nVocê ganhou 10000 em Dinheiro!\n\nRECOMPENSA: x1,2 em todas as Vendas de Recursos e Compostos",
    gain100000Cash:
      "CONQUISTA:\nVocê ganhou 100000 em Dinheiro!\n\nRECOMPENSA: x1,2 em todas as Vendas de Recursos e Compostos",
    gain1000000Cash:
      "CONQUISTA:\nVocê ganhou 1000000 em Dinheiro!\n\nRECOMPENSA: x1,5 em todas as Vendas de Recursos e Compostos",
    seeAllNewsTickers:
      "CONQUISTA:\nVocê viu todas as Faixas de Notícias!\n\nRECOMPENSA: x1,2 permanente em todas as Taxas de Recursos",
    activateAllWackyNewsTickers:
      "CONQUISTA:\nVocê ativou todas as Faixas de Notícias Malucas!\n\nRECOMPENSA: -20% permanente nos Custos de Materiais para Criação de Compostos",
    discoverLegendaryAsteroid:
      "CONQUISTA:\nVocê descobriu um Asteroide Lendário!\n\nRECOMPENSA: {cashReward}",
    have4RocketsMiningAntimatter:
      "CONQUISTA:\nVocê tem 4 foguetes minerando Antimatéria simultaneamente!\n\nRECOMPENSA: {cashReward}",
    tripPower:
      "CONQUISTA:\nVocê desligou a Energia!\n\nRECOMPENSA: x1,1 em todas as Taxas de Recursos",
    discoverAsteroid:
      "CONQUISTA:\nVocê descobriu um Asteroide!\n\nRECOMPENSA: -5% nos Custos de Materiais para Criação de Compostos",
    launchRocket:
      "CONQUISTA:\nVocê lançou um Foguete!\n\nRECOMPENSA: x1,1 em todas as Taxas de Recursos",
    mineAllAntimatterAsteroid:
      "CONQUISTA:\nVocê extraiu toda a Antimatéria de um Asteroide!\n\nRECOMPENSA: 150 de Antimatéria",
    studyStar:
      "CONQUISTA:\nVocê estudou uma Estrela!\n\nRECOMPENSA: -5% nos Custos de Materiais para Criação de Compostos",
    studyStarMoreThan5LYAway:
      "CONQUISTA:\nVocê estudou uma Estrela a mais de 5 anos-luz de distância!\n\nRECOMPENSA: -10% nos Custos de Materiais para Criação de Compostos",
    studyStarMoreThan20LYAway:
      "CONQUISTA:\nVocê estudou uma Estrela a mais de 20 anos-luz de distância!\n\nRECOMPENSA: -15% nos Custos de Materiais para Criação de Compostos",
    launchStarship: "CONQUISTA:\nVocê lançou uma Nave Estelar!\n\nRECOMPENSA: {cashReward}",
    performGalacticMarketTransaction:
      "CONQUISTA:\nVocê realizou uma transação no Mercado Galáctico!\n\nRECOMPENSA: 1 AP",
    trade10APForCash:
      "CONQUISTA:\nVocê trocou 10 AP por Dinheiro em uma transação no Mercado Galáctico!\n\nRECOMPENSA: 5 AP",
    initiateDiplomacyWithAlienRace:
      "CONQUISTA:\nVocê iniciou diplomacia com uma raça alienígena!\n\nRECOMPENSA: x1,1 em todas as Taxas de Recursos",
    bullyEnemyIntoSubmission:
      "CONQUISTA:\nVocê intimidou um inimigo até a submissão!\n\nRECOMPENSA: 1 AP",
    vassalizeEnemy: "CONQUISTA:\nVocê vassalizou um inimigo!\n\nRECOMPENSA: 1 AP",
    conquerEnemy: "CONQUISTA:\nVocê conquistou um inimigo!\n\nRECOMPENSA: 1 AP",
    conquerHiveMindEnemy:
      "CONQUISTA:\nVocê conquistou um inimigo Mente-Colmeia!\n\nRECOMPENSA: 2 AP",
    conquerBelligerentEnemy:
      "CONQUISTA:\nVocê conquistou um inimigo Beligerante!\n\nRECOMPENSA: 3 AP",
    conquerEnemyWithoutScanning:
      "CONQUISTA:\nVocê conquistou um inimigo sem escanear o sistema!\n\nRECOMPENSA: 2 AP",
    settleUnoccupiedSystem:
      "CONQUISTA:\nVocê colonizou um sistema desocupado!\n\nRECOMPENSA: {cashReward}",
    discoverSystemWithNoLife:
      "CONQUISTA:\nVocê descobriu um sistema sem vida!\n\nRECOMPENSA: {cashReward}",
    settleSystem: "CONQUISTA:\nVocê colonizou um sistema!\n\nRECOMPENSA: Orgulho!",
    spendAP:
      "CONQUISTA:\nVocê gastou Pontos de Ascendência (AP)!\n\nRECOMPENSA: x1,1 em todas as Taxas de Recursos",
    liquidateAllAssets: "CONQUISTA:\nVocê liquidou todos os ativos!\n\nRECOMPENSA: Orgulho!",
    rebirth:
      "CONQUISTA:\nVocê renasceu!\n\nRECOMPENSA: x1,3 permanente em todas as Taxas de Recursos",
    conquer10StarSystems: "CONQUISTA:\nVocê conquistou 10 sistemas estelares!\n\nRECOMPENSA: 10 AP",
    conquer50StarSystems:
      "CONQUISTA:\nVocê conquistou 50 sistemas estelares!\n\nRECOMPENSA: 100 AP",
    studyAllStarsInOneRun:
      "CONQUISTA:\nVocê estudou todas as Estrelas no Mapa Estelar em uma partida!\n\nRECOMPENSA: Orgulho!",
    adoptPhilosophy: "CONQUISTA:\nVocê adotou uma Filosofia!\n\nRECOMPENSA: Orgulho!",
    discoverBlackHole: "CONQUISTA:\nVocê descobriu um Buraco Negro!\n\nRECOMPENSA: {cashReward}",
    activateBlackHoleOver10x:
      "CONQUISTA:\nVocê ativou um Buraco Negro com Dobra Temporal superior a 10x!\n\nRECOMPENSA: x2 em todas as quantidades de Recursos (limitado ao armazenamento)",
    findAncientManuscript:
      "CONQUISTA:\nVocê encontrou um Manuscrito Antigo!\n\nRECOMPENSA: x2 em todas as quantidades de Compostos (limitado ao armazenamento)",
    conquerMegastructureSystem:
      "CONQUISTA:\nVocê conquistou um Sistema de Megasestrutura!\n\nRECOMPENSA: {cashReward}",
    bringDownMiaplacideanForceField:
      "CONQUISTA:\nVocê derrubou o Campo de Força Miaplacideano!\n\nRECOMPENSA: 100 AP",
    completeGame: "CONQUISTA:\nVocê concluiu o jogo!\n\nRECOMPENSA: Orgulho!",
    completeRunOnMiaplacidus:
      "CONQUISTA:\nVocê concluiu uma partida em Miaplacidus!\n\nRECOMPENSA: 1 PG",
    haveFleetSizeOf50EachShipType:
      "CONQUISTA:\nVocê tem pelo menos 50 de cada tipo de nave!\n\nRECOMPENSA: 1000000 de Titânio (limitado ao armazenamento)",
    tryAllThemes: "CONQUISTA:\nVocê experimentou todos os Temas!\n\nRECOMPENSA: Orgulho!",
    buyCasinoPoints: "CONQUISTA:\nVocê comprou Pontos de Cassino!\n\nRECOMPENSA: Orgulho!",
    winAllCasinoGames:
      "CONQUISTA:\nVocê ganhou um prêmio em todos os Jogos do Cassino!\n\nRECOMPENSA: 1 PG",
    winWheelSpecialPrize:
      "CONQUISTA:\nVocê ganhou um Prêmio Especial da Roda da Fortuna!\n\nRECOMPENSA: Orgulho!",
    restoreNearSpaceScannerArray:
      "CONQUISTA:\nVocê restaurou o Array de Scanner do Espaço Próximo!\n\nRECOMPENSA: Orgulho!",
    findCosmicRip: "CONQUISTA:\nVocê encontrou o Cosmic Rip!\n\nRECOMPENSA: Orgulho!",
    gain1MTelemetryData:
      "CONQUISTA:\nVocê obteve 1.000.000 de Dados de Telemetria!\n\nRECOMPENSA: Orgulho!",
    closeCosmicRip: "CONQUISTA:\nVocê fechou a Fenda Cósmica!\n\nRECOMPENSA: Orgulho!",
    suffer5NegativeEvents: "CONQUISTA:\nVocê sofreu 5 Eventos Negativos!\n\nRECOMPENSA: Orgulho!",
    enjoyEndlessSummer:
      "CONQUISTA:\nVocê está desfrutando de um Verão Sem Fim!\n\nRECOMPENSA: Orgulho!",
    completeOnboarding: "CONQUISTA:\nVocê concluiu a Introdução!\n\nRECOMPENSA: Orgulho!",
  },
  de: {
    collect50Hydrogen: "LEISTUNG:\nDu hast 50 Wasserstoff gesammelt!\n\nBELOHNUNG: {cashReward}",
    collect1000Hydrogen:
      "LEISTUNG:\nDu hast 1000 Wasserstoff gesammelt!\n\nBELOHNUNG: {cashReward}",
    collect5000Carbon: "LEISTUNG:\nDu hast 5000 Kohlenstoff gesammelt!\n\nBELOHNUNG: {cashReward}",
    collect50000Iron: "LEISTUNG:\nDu hast 50000 Eisen gesammelt!\n\nBELOHNUNG: {cashReward}",
    collect100Precipitation:
      "LEISTUNG:\nDu hast 100 Niederschlag gesammelt!\n\nBELOHNUNG: {cashReward}",
    fuseElement: "LEISTUNG:\nDu hast ein Element fusioniert!\n\nBELOHNUNG: {cashReward}",
    createSteel:
      "LEISTUNG:\nDu hast Stahl hergestellt!\n\nBELOHNUNG: -20% Verbindungsherstellungskosten",
    createTitanium:
      "LEISTUNG:\nDu hast Titan hergestellt!\n\nBELOHNUNG: -20% Verbindungsherstellungskosten",
    unlockCompounds: "LEISTUNG:\nDu hast Verbindungen freigeschaltet!\n\nBELOHNUNG: {cashReward}",
    researchTechnology:
      "LEISTUNG:\nDu hast eine neue Technologie erforscht!\n\nBELOHNUNG: {cashReward}",
    researchAllTechnologies: "LEISTUNG:\nDu hast alle Technologien erforscht!\n\nBELOHNUNG: 1AP",
    achieve100FusionEfficiency:
      "LEISTUNG:\nDu hast 100% Fusionseffizienz erreicht!\n\nBELOHNUNG: {cashReward}",
    have50HoursWithOnePioneer:
      "LEISTUNG:\nDu hast 50 aktive Stunden mit einem Pioniernamen aufgezeichnet!\n\nBELOHNUNG: 50AP",
    buildPowerPlant:
      "LEISTUNG:\nDu hast ein Kraftwerk gebaut!\n\nBELOHNUNG: x1.1 alle Ressourcenraten",
    buildSolarPowerPlant:
      "LEISTUNG:\nDu hast ein Solarkraftwerk gebaut!\n\nBELOHNUNG: x1.2 alle Ressourcenraten",
    collect100TitaniumAsPrecipitation:
      "LEISTUNG:\nDu hast 100 Titan als Niederschlag gesammelt!\n\nBELOHNUNG: 50AP",
    gain100Cash:
      "LEISTUNG:\nDu hast 100 Bargeld gewonnen!\n\nBELOHNUNG: x1.1 alle Ressourcen- und Verbindungsverkäufe",
    gain10000Cash:
      "LEISTUNG:\nDu hast 10000 Bargeld gewonnen!\n\nBELOHNUNG: x1.2 alle Ressourcen- und Verbindungsverkäufe",
    gain100000Cash:
      "LEISTUNG:\nDu hast 100000 Bargeld gewonnen!\n\nBELOHNUNG: x1.2 alle Ressourcen- und Verbindungsverkäufe",
    gain1000000Cash:
      "LEISTUNG:\nDu hast 1000000 Bargeld gewonnen!\n\nBELOHNUNG: x1.5 alle Ressourcen- und Verbindungsverkäufe",
    seeAllNewsTickers:
      "LEISTUNG:\nDu hast alle Nachrichtenticker gesehen!\n\nBELOHNUNG: Dauerhaft x1.2 alle Ressourcenraten",
    activateAllWackyNewsTickers:
      "LEISTUNG:\nDu hast alle verrückten Nachrichtenticker aktiviert!\n\nBELOHNUNG: Dauerhaft -20% Verbindungsherstellungskosten",
    discoverLegendaryAsteroid:
      "LEISTUNG:\nDu hast einen Legendären Asteroiden entdeckt!\n\nBELOHNUNG: {cashReward}",
    have4RocketsMiningAntimatter:
      "LEISTUNG:\nDu hast 4 Raketen, die gleichzeitig Antimaterie abbauen!\n\nBELOHNUNG: {cashReward}",
    tripPower: "LEISTUNG:\nDu hast den Strom ausgelöst!\n\nBELOHNUNG: x1.1 alle Ressourcenraten",
    discoverAsteroid:
      "LEISTUNG:\nDu hast einen Asteroiden entdeckt!\n\nBELOHNUNG: -5% Verbindungsherstellungskosten",
    launchRocket:
      "LEISTUNG:\nDu hast eine Rakete gestartet!\n\nBELOHNUNG: x1.1 alle Ressourcenraten",
    mineAllAntimatterAsteroid:
      "LEISTUNG:\nDu hast alle Antimaterie von einem Asteroiden abgebaut!\n\nBELOHNUNG: 150 Antimaterie",
    studyStar:
      "LEISTUNG:\nDu hast einen Stern studiert!\n\nBELOHNUNG: -5% Verbindungsherstellungskosten",
    studyStarMoreThan5LYAway:
      "LEISTUNG:\nDu hast einen Stern mehr als 5 Lj entfernt studiert!\n\nBELOHNUNG: -10% Verbindungsherstellungskosten",
    studyStarMoreThan20LYAway:
      "LEISTUNG:\nDu hast einen Stern mehr als 20 Lj entfernt studiert!\n\nBELOHNUNG: -15% Verbindungsherstellungskosten",
    launchStarship: "LEISTUNG:\nDu hast ein Raumschiff gestartet!\n\nBELOHNUNG: {cashReward}",
    performGalacticMarketTransaction:
      "LEISTUNG:\nDu hast eine Galaktische Markt-Transaktion durchgeführt!\n\nBELOHNUNG: 1AP",
    trade10APForCash:
      "LEISTUNG:\nDu hast 10 AP für Bargeld in einer Transaktion auf dem Galaktischen Markt getauscht!\n\nBELOHNUNG: 5AP",
    initiateDiplomacyWithAlienRace:
      "LEISTUNG:\nDu hast Diplomatie mit einer außerirdischen Rasse eingeleitet!\n\nBELOHNUNG: x1.1 alle Ressourcenraten",
    bullyEnemyIntoSubmission:
      "LEISTUNG:\nDu hast einen Feind zur Unterwerfung gezwungen!\n\nBELOHNUNG: 1AP",
    vassalizeEnemy: "LEISTUNG:\nDu hast einen Feind vasallisiert!\n\nBELOHNUNG: 1AP",
    conquerEnemy: "LEISTUNG:\nDu hast einen Feind erobert!\n\nBELOHNUNG: 1AP",
    conquerHiveMindEnemy: "LEISTUNG:\nDu hast einen Hive-Mind-Feind erobert!\n\nBELOHNUNG: 2AP",
    conquerBelligerentEnemy:
      "LEISTUNG:\nDu hast einen kriegerischen Feind erobert!\n\nBELOHNUNG: 3AP",
    conquerEnemyWithoutScanning:
      "LEISTUNG:\nDu hast einen Feind erobert, ohne das System zu scannen!\n\nBELOHNUNG: 2AP",
    settleUnoccupiedSystem:
      "LEISTUNG:\nDu hast ein unbesetztes System besiedelt!\n\nBELOHNUNG: {cashReward}",
    discoverSystemWithNoLife:
      "LEISTUNG:\nDu hast ein System ohne Leben entdeckt!\n\nBELOHNUNG: {cashReward}",
    settleSystem: "LEISTUNG:\nDu hast ein System besiedelt!\n\nBELOHNUNG: Stolz!",
    spendAP:
      "LEISTUNG:\nDu hast Aufstiegspunkte (AP) ausgegeben!\n\nBELOHNUNG: x1.1 alle Ressourcenraten",
    liquidateAllAssets: "LEISTUNG:\nDu hast alle Vermögenswerte liquidiert!\n\nBELOHNUNG: Stolz!",
    rebirth:
      "LEISTUNG:\nDu hast dich wiedergeboren!\n\nBELOHNUNG: Dauerhaft x1.3 alle Ressourcenraten",
    conquer10StarSystems: "LEISTUNG:\nDu hast 10 Sternsysteme erobert!\n\nBELOHNUNG: 10AP",
    conquer50StarSystems: "LEISTUNG:\nDu hast 50 Sternsysteme erobert!\n\nBELOHNUNG: 100AP",
    studyAllStarsInOneRun:
      "LEISTUNG:\nDu hast alle Sterne in der Sternenkarte in einem Durchgang studiert!\n\nBELOHNUNG: Stolz!",
    adoptPhilosophy: "LEISTUNG:\nDu hast eine Philosophie adoptiert!\n\nBELOHNUNG: Stolz!",
    discoverBlackHole: "LEISTUNG:\nDu hast ein Schwarzes Loch entdeckt!\n\nBELOHNUNG: {cashReward}",
    activateBlackHoleOver10x:
      "LEISTUNG:\nDu hast ein Schwarzes Loch mit mehr als 10x Zeitkrümmung aktiviert!\n\nBELOHNUNG: x2 alle Ressourcenmengen (begrenzt auf Lagerung)",
    findAncientManuscript:
      "LEISTUNG:\nDu hast ein altes Manuskript gefunden!\n\nBELOHNUNG: x2 alle Verbindungsmengen (begrenzt auf Lagerung)",
    conquerMegastructureSystem:
      "LEISTUNG:\nDu hast ein Megastruktur-System erobert!\n\nBELOHNUNG: {cashReward}",
    bringDownMiaplacideanForceField:
      "LEISTUNG:\nDu hast das Miaplacideanische Kraftfeld niedergelegt!\n\nBELOHNUNG: 100AP",
    completeGame: "LEISTUNG:\nDu hast das Spiel abgeschlossen!\n\nBELOHNUNG: Stolz!",
    completeRunOnMiaplacidus:
      "LEISTUNG:\nDu hast einen Lauf auf Miaplacidus abgeschlossen!\n\nBELOHNUNG: 1GP",
    haveFleetSizeOf50EachShipType:
      "LEISTUNG:\nDu hast mindestens 50 von jedem Schiffstyp!\n\nBELOHNUNG: 1000000 Titan (begrenzt auf Lagerung)",
    tryAllThemes: "LEISTUNG:\nDu hast alle Themen ausprobiert!\n\nBELOHNUNG: Stolz!",
    buyCasinoPoints: "LEISTUNG:\nDu Hast Einige Casino-Punkte Gekauft!\n\nBELOHNUNG: Stolz!",
    winAllCasinoGames:
      "LEISTUNG:\nDu Hast Einen Preis In Allen Casinospielen Gewonnen!\n\nBELOHNUNG: 1GP",
    winWheelSpecialPrize:
      "LEISTUNG:\nDu Hast Einen Glücksrad-Sonderpreis Beansprucht!\n\nBELOHNUNG: Stolz!",
    restoreNearSpaceScannerArray:
      "LEISTUNG:\nDu Hast Das Nahraum-Scanner-Array Wiederhergestellt!\n\nBELOHNUNG: Stolz!",
    findCosmicRip: "LEISTUNG:\nDu Hast Den Kosmischen Riss Gefunden!\n\nBELOHNUNG: Stolz!",
    gain1MTelemetryData:
      "LEISTUNG:\nDu Hast 1.000.000 Telemetriedaten Erhalten!\n\nBELOHNUNG: Stolz!",
    closeCosmicRip: "LEISTUNG:\nDu Hast Den Kosmischen Riss Geschlossen!\n\nBELOHNUNG: Stolz!",
    suffer5NegativeEvents:
      "LEISTUNG:\nDu Hast 5 Negative Sofortige Ereignisse Erlitten!\n\nBELOHNUNG: Stolz!",
    enjoyEndlessSummer: "LEISTUNG:\nDu Genießt Einen Endlosen Sommer!\n\nBELOHNUNG: Stolz!",
    completeOnboarding: "LEISTUNG:\nDu Hast Das Onboarding Abgeschlossen!\n\nBELOHNUNG: Stolz!",
  },
  it: {
    collect50Hydrogen: "OBIETTIVO:\nHai raccolto 50 Idrogeno!\n\nRICOMPENSA: {cashReward}",
    collect1000Hydrogen: "OBIETTIVO:\nHai raccolto 1000 Idrogeno!\n\nRICOMPENSA: {cashReward}",
    collect5000Carbon: "OBIETTIVO:\nHai raccolto 5000 Carbonio!\n\nRICOMPENSA: {cashReward}",
    collect50000Iron: "OBIETTIVO:\nHai raccolto 50000 Ferro!\n\nRICOMPENSA: {cashReward}",
    collect100Precipitation:
      "OBIETTIVO:\nHai raccolto 100 Precipitazione!\n\nRICOMPENSA: {cashReward}",
    fuseElement: "OBIETTIVO:\nHai fuso un elemento!\n\nRICOMPENSA: {cashReward}",
    createSteel:
      "OBIETTIVO:\nHai creato Acciaio!\n\nRICOMPENSA: -20% Costi Materiali Creazione Composti",
    createTitanium:
      "OBIETTIVO:\nHai creato Titanio!\n\nRICOMPENSA: -20% Costi Materiali Creazione Composti",
    unlockCompounds: "OBIETTIVO:\nHai sbloccato i Composti!\n\nRICOMPENSA: {cashReward}",
    researchTechnology:
      "OBIETTIVO:\nHai ricercato una nuova Tecnologia!\n\nRICOMPENSA: {cashReward}",
    researchAllTechnologies: "OBIETTIVO:\nHai ricercato tutte le Tecnologie!\n\nRICOMPENSA: 1PA",
    achieve100FusionEfficiency:
      "OBIETTIVO:\nHai raggiunto il 100% di efficienza di Fusione!\n\nRICOMPENSA: {cashReward}",
    have50HoursWithOnePioneer:
      "OBIETTIVO:\nHai registrato 50 ore attive con un Nome Pioniere!\n\nRICOMPENSA: 50PA",
    buildPowerPlant:
      "OBIETTIVO:\nHai costruito una Centrale Elettrica!\n\nRICOMPENSA: x1.1 tutte le Velocità di Risorse",
    buildSolarPowerPlant:
      "OBIETTIVO:\nHai costruito una Centrale Solare!\n\nRICOMPENSA: x1.2 tutte le Velocità di Risorse",
    collect100TitaniumAsPrecipitation:
      "OBIETTIVO:\nHai raccolto 100 Titanio come Precipitazione!\n\nRICOMPENSA: 50PA",
    gain100Cash:
      "OBIETTIVO:\nHai guadagnato 100 contanti!\n\nRICOMPENSA: x1.1 tutte le Vendite di Risorse e Composti",
    gain10000Cash:
      "OBIETTIVO:\nHai guadagnato 10000 contanti!\n\nRICOMPENSA: x1.2 tutte le Vendite di Risorse e Composti",
    gain100000Cash:
      "OBIETTIVO:\nHai guadagnato 100000 contanti!\n\nRICOMPENSA: x1.2 tutte le Vendite di Risorse e Composti",
    gain1000000Cash:
      "OBIETTIVO:\nHai guadagnato 1000000 contanti!\n\nRICOMPENSA: x1.5 tutte le Vendite di Risorse e Composti",
    seeAllNewsTickers:
      "OBIETTIVO:\nHai visto tutti i Ticker di Notizie!\n\nRICOMPENSA: Permanente x1.2 tutte le Velocità di Risorse",
    activateAllWackyNewsTickers:
      "OBIETTIVO:\nHai attivato tutti i Ticker di Notizie Stravaganti!\n\nRICOMPENSA: Permanente -20% Costi Materiali Creazione Composti",
    discoverLegendaryAsteroid:
      "OBIETTIVO:\nHai scoperto un Asteroide Leggendario!\n\nRICOMPENSA: {cashReward}",
    have4RocketsMiningAntimatter:
      "OBIETTIVO:\nHai 4 razzi che estraggono Antimateria simultaneamente!\n\nRICOMPENSA: {cashReward}",
    tripPower:
      "OBIETTIVO:\nHai interrotto l Energia!\n\nRICOMPENSA: x1.1 tutte le Velocità di Risorse",
    discoverAsteroid:
      "OBIETTIVO:\nHai scoperto un Asteroide!\n\nRICOMPENSA: -5% Costi Materiali Creazione Composti",
    launchRocket:
      "OBIETTIVO:\nHai lanciato un Razzo!\n\nRICOMPENSA: x1.1 tutte le Velocità di Risorse",
    mineAllAntimatterAsteroid:
      "OBIETTIVO:\nHai estratto tutta l Antimateria da un Asteroide!\n\nRICOMPENSA: 150 Antimateria",
    studyStar:
      "OBIETTIVO:\nHai studiato una Stella!\n\nRICOMPENSA: -5% Costi Materiali Creazione Composti",
    studyStarMoreThan5LYAway:
      "OBIETTIVO:\nHai studiato una Stella a più di 5al di distanza!\n\nRICOMPENSA: -10% Costi Materiali Creazione Composti",
    studyStarMoreThan20LYAway:
      "OBIETTIVO:\nHai studiato una Stella a più di 20al di distanza!\n\nRICOMPENSA: -15% Costi Materiali Creazione Composti",
    launchStarship: "OBIETTIVO:\nHai lanciato un Astronave!\n\nRICOMPENSA: {cashReward}",
    performGalacticMarketTransaction:
      "OBIETTIVO:\nHai effettuato una transazione nel Mercato Galattico!\n\nRICOMPENSA: 1PA",
    trade10APForCash:
      "OBIETTIVO:\nHai scambiato 10 PA per Contanti in una transazione nel Mercato Galattico!\n\nRICOMPENSA: 5PA",
    initiateDiplomacyWithAlienRace:
      "OBIETTIVO:\nHai iniziato la diplomazia con una razza aliena!\n\nRICOMPENSA: x1.1 tutte le Velocità di Risorse",
    bullyEnemyIntoSubmission:
      "OBIETTIVO:\nHai intimidito un nemico fino alla sottomissione!\n\nRICOMPENSA: 1PA",
    vassalizeEnemy: "OBIETTIVO:\nHai vassallizzato un nemico!\n\nRICOMPENSA: 1PA",
    conquerEnemy: "OBIETTIVO:\nHai conquistato un nemico!\n\nRICOMPENSA: 1PA",
    conquerHiveMindEnemy: "OBIETTIVO:\nHai conquistato un nemico Mente Alveare!\n\nRICOMPENSA: 2PA",
    conquerBelligerentEnemy:
      "OBIETTIVO:\nHai conquistato un nemico Belligerante!\n\nRICOMPENSA: 3PA",
    conquerEnemyWithoutScanning:
      "OBIETTIVO:\nHai conquistato un nemico senza scansionare il sistema!\n\nRICOMPENSA: 2PA",
    settleUnoccupiedSystem:
      "OBIETTIVO:\nHai colonizzato un sistema disoccupato!\n\nRICOMPENSA: {cashReward}",
    discoverSystemWithNoLife:
      "OBIETTIVO:\nHai scoperto un sistema senza vita!\n\nRICOMPENSA: {cashReward}",
    settleSystem: "OBIETTIVO:\nHai colonizzato un sistema!\n\nRICOMPENSA: Orgoglio!",
    spendAP:
      "OBIETTIVO:\nHai speso Punti Ascensione (PA)!\n\nRICOMPENSA: x1.1 tutte le Velocità di Risorse",
    liquidateAllAssets: "OBIETTIVO:\nHai liquidato tutti gli asset!\n\nRICOMPENSA: Orgoglio!",
    rebirth: "OBIETTIVO:\nSei rinato!\n\nRICOMPENSA: Permanente x1.3 tutte le Velocità di Risorse",
    conquer10StarSystems: "OBIETTIVO:\nHai conquistato 10 sistemi stellari!\n\nRICOMPENSA: 10PA",
    conquer50StarSystems: "OBIETTIVO:\nHai conquistato 50 sistemi stellari!\n\nRICOMPENSA: 100PA",
    studyAllStarsInOneRun:
      "OBIETTIVO:\nHai studiato tutte le Stelle nella Mappa Stellare in una corsa!\n\nRICOMPENSA: Orgoglio!",
    adoptPhilosophy: "OBIETTIVO:\nHai adottato una Filosofia!\n\nRICOMPENSA: Orgoglio!",
    discoverBlackHole: "OBIETTIVO:\nHai scoperto un Buco Nero!\n\nRICOMPENSA: {cashReward}",
    activateBlackHoleOver10x:
      "OBIETTIVO:\nHai attivato un Buco Nero a più di 10x Curvatura del Tempo!\n\nRICOMPENSA: x2 tutte le quantità di Risorse (limitate allo stoccaggio)",
    findAncientManuscript:
      "OBIETTIVO:\nHai trovato un Manoscritto Antico!\n\nRICOMPENSA: x2 tutte le quantità di Composti (limitate allo stoccaggio)",
    conquerMegastructureSystem:
      "OBIETTIVO:\nHai conquistato un Sistema di Megastruttura!\n\nRICOMPENSA: {cashReward}",
    bringDownMiaplacideanForceField:
      "OBIETTIVO:\nHai abbattuto il Campo di Forza Miaplacideo!\n\nRICOMPENSA: 100PA",
    completeGame: "OBIETTIVO:\nHai completato il gioco!\n\nRICOMPENSA: Orgoglio!",
    completeRunOnMiaplacidus:
      "OBIETTIVO:\nHai completato una corsa su Miaplacidus!\n\nRICOMPENSA: 1PG",
    haveFleetSizeOf50EachShipType:
      "OBIETTIVO:\nHai almeno 50 navi di ogni tipo!\n\nRICOMPENSA: 1000000 Titanio (limitato allo stoccaggio)",
    tryAllThemes: "OBIETTIVO:\nHai provato tutti i Temi!\n\nRICOMPENSA: Orgoglio!",
    buyCasinoPoints: "OBIETTIVO:\nHai Comprato Alcuni Punti Casinò!\n\nRICOMPENSA: Orgoglio!",
    winAllCasinoGames:
      "OBIETTIVO:\nHai Vinto Un Premio In Tutti I Giochi Da Casinò!\n\nRICOMPENSA: 1PG",
    winWheelSpecialPrize:
      "OBIETTIVO:\nHai Richiesto Un Premio Speciale Della Ruota Della Fortuna!\n\nRICOMPENSA: Orgoglio!",
    restoreNearSpaceScannerArray:
      "OBIETTIVO:\nHai Ripristinato L Array Di Scanner Dello Spazio Vicino!\n\nRICOMPENSA: Orgoglio!",
    findCosmicRip: "OBIETTIVO:\nHai Trovato Il Cosmic Rip!\n\nRICOMPENSA: Orgoglio!",
    gain1MTelemetryData:
      "OBIETTIVO:\nHai Ottenuto 1.000.000 Dati Di Telemetria!\n\nRICOMPENSA: Orgoglio!",
    closeCosmicRip: "OBIETTIVO:\nHai chiuso lo Strappo cosmico!\n\nRICOMPENSA: Orgoglio!",
    suffer5NegativeEvents:
      "OBIETTIVO:\nHai Subito 5 Eventi Istantanei Negativi!\n\nRICOMPENSA: Orgoglio!",
    enjoyEndlessSummer:
      "OBIETTIVO:\nStai Godendo Di Un Estate Senza Fine!\n\nRICOMPENSA: Orgoglio!",
    completeOnboarding: "OBIETTIVO:\nHai Completato L Onboarding!\n\nRICOMPENSA: Orgoglio!",
  },
  fr: {
    collect50Hydrogen: "SUCCÈS:\nVous avez collecté 50 Hydrogène!\n\nRÉCOMPENSE: {cashReward}",
    collect1000Hydrogen: "SUCCÈS:\nVous avez collecté 1000 Hydrogène!\n\nRÉCOMPENSE: {cashReward}",
    collect5000Carbon: "SUCCÈS:\nVous avez collecté 5000 Carbone!\n\nRÉCOMPENSE: {cashReward}",
    collect50000Iron: "SUCCÈS:\nVous avez collecté 50000 Fer!\n\nRÉCOMPENSE: {cashReward}",
    collect100Precipitation:
      "SUCCÈS:\nVous avez collecté 100 Précipitation!\n\nRÉCOMPENSE: {cashReward}",
    fuseElement: "SUCCÈS:\nVous avez fusionné un élément!\n\nRÉCOMPENSE: {cashReward}",
    createSteel:
      "SUCCÈS:\nVous avez créé de l Acier!\n\nRÉCOMPENSE: -20% Coûts Matériels de Création de Composés",
    createTitanium:
      "SUCCÈS:\nVous avez créé du Titane!\n\nRÉCOMPENSE: -20% Coûts Matériels de Création de Composés",
    unlockCompounds: "SUCCÈS:\nVous avez débloqué les Composés!\n\nRÉCOMPENSE: {cashReward}",
    researchTechnology:
      "SUCCÈS:\nVous avez recherché une nouvelle Technologie!\n\nRÉCOMPENSE: {cashReward}",
    researchAllTechnologies:
      "SUCCÈS:\nVous avez recherché toutes les Technologies!\n\nRÉCOMPENSE: 1AP",
    achieve100FusionEfficiency:
      "SUCCÈS:\nVous avez atteint 100% d efficacité de Fusion!\n\nRÉCOMPENSE: {cashReward}",
    have50HoursWithOnePioneer:
      "SUCCÈS:\nVous avez enregistré 50 heures actives avec un Nom de Pionnier!\n\nRÉCOMPENSE: 50AP",
    buildPowerPlant:
      "SUCCÈS:\nVous avez construit une Centrale Électrique!\n\nRÉCOMPENSE: x1.1 tous les Taux de Ressources",
    buildSolarPowerPlant:
      "SUCCÈS:\nVous avez construit une Centrale Solaire!\n\nRÉCOMPENSE: x1.2 tous les Taux de Ressources",
    collect100TitaniumAsPrecipitation:
      "SUCCÈS:\nVous avez collecté 100 Titane comme Précipitation!\n\nRÉCOMPENSE: 50AP",
    gain100Cash:
      "SUCCÈS:\nVous avez gagné 100 espèces!\n\nRÉCOMPENSE: x1.1 toutes les Ventes de Ressources et Composés",
    gain10000Cash:
      "SUCCÈS:\nVous avez gagné 10000 espèces!\n\nRÉCOMPENSE: x1.2 toutes les Ventes de Ressources et Composés",
    gain100000Cash:
      "SUCCÈS:\nVous avez gagné 100000 espèces!\n\nRÉCOMPENSE: x1.2 toutes les Ventes de Ressources et Composés",
    gain1000000Cash:
      "SUCCÈS:\nVous avez gagné 1000000 espèces!\n\nRÉCOMPENSE: x1.5 toutes les Ventes de Ressources et Composés",
    seeAllNewsTickers:
      "SUCCÈS:\nVous avez vu tous les Tickers d Actualités!\n\nRÉCOMPENSE: Permanent x1.2 tous les Taux de Ressources",
    activateAllWackyNewsTickers:
      "SUCCÈS:\nVous avez activé tous les Tickers d Actualités Farfelues!\n\nRÉCOMPENSE: Permanent -20% Coûts Matériels de Création de Composés",
    discoverLegendaryAsteroid:
      "SUCCÈS:\nVous avez découvert un Astéroïde Légendaire!\n\nRÉCOMPENSE: {cashReward}",
    have4RocketsMiningAntimatter:
      "SUCCÈS:\nVous avez 4 fusées minant de l Antimatière simultanément!\n\nRÉCOMPENSE: {cashReward}",
    tripPower:
      "SUCCÈS:\nVous avez déclenché l Énergie!\n\nRÉCOMPENSE: x1.1 tous les Taux de Ressources",
    discoverAsteroid:
      "SUCCÈS:\nVous avez découvert un Astéroïde!\n\nRÉCOMPENSE: -5% Coûts Matériels de Création de Composés",
    launchRocket:
      "SUCCÈS:\nVous avez lancé une Fusée!\n\nRÉCOMPENSE: x1.1 tous les Taux de Ressources",
    mineAllAntimatterAsteroid:
      "SUCCÈS:\nVous avez miné toute l Antimatière d un Astéroïde!\n\nRÉCOMPENSE: 150 Antimatière",
    studyStar:
      "SUCCÈS:\nVous avez étudié une Étoile!\n\nRÉCOMPENSE: -5% Coûts Matériels de Création de Composés",
    studyStarMoreThan5LYAway:
      "SUCCÈS:\nVous avez étudié une Étoile à plus de 5al de distance!\n\nRÉCOMPENSE: -10% Coûts Matériels de Création de Composés",
    studyStarMoreThan20LYAway:
      "SUCCÈS:\nVous avez étudié une Étoile à plus de 20al de distance!\n\nRÉCOMPENSE: -15% Coûts Matériels de Création de Composés",
    launchStarship: "SUCCÈS:\nVous avez lancé un Vaisseau Spatial!\n\nRÉCOMPENSE: {cashReward}",
    performGalacticMarketTransaction:
      "SUCCÈS:\nVous avez effectué une transaction sur le Marché Galactique!\n\nRÉCOMPENSE: 1AP",
    trade10APForCash:
      "SUCCÈS:\nVous avez échangé 10 AP contre des Espèces en une transaction sur le Marché Galactique!\n\nRÉCOMPENSE: 5AP",
    initiateDiplomacyWithAlienRace:
      "SUCCÈS:\nVous avez initié la diplomatie avec une race alien!\n\nRÉCOMPENSE: x1.1 tous les Taux de Ressources",
    bullyEnemyIntoSubmission:
      "SUCCÈS:\nVous avez intimidé un ennemi jusqu à sa soumission!\n\nRÉCOMPENSE: 1AP",
    vassalizeEnemy: "SUCCÈS:\nVous avez vassalisé un ennemi!\n\nRÉCOMPENSE: 1AP",
    conquerEnemy: "SUCCÈS:\nVous avez conquis un ennemi!\n\nRÉCOMPENSE: 1AP",
    conquerHiveMindEnemy:
      "SUCCÈS:\nVous avez conquis un ennemi Esprit de Ruche!\n\nRÉCOMPENSE: 2AP",
    conquerBelligerentEnemy: "SUCCÈS:\nVous avez conquis un ennemi Belliqueux!\n\nRÉCOMPENSE: 3AP",
    conquerEnemyWithoutScanning:
      "SUCCÈS:\nVous avez conquis un ennemi sans scanner le système!\n\nRÉCOMPENSE: 2AP",
    settleUnoccupiedSystem:
      "SUCCÈS:\nVous avez colonisé un système inoccupé!\n\nRÉCOMPENSE: {cashReward}",
    discoverSystemWithNoLife:
      "SUCCÈS:\nVous avez découvert un système sans vie!\n\nRÉCOMPENSE: {cashReward}",
    settleSystem: "SUCCÈS:\nVous avez colonisé un système!\n\nRÉCOMPENSE: Fierté!",
    spendAP:
      "SUCCÈS:\nVous avez dépensé des Points d Ascendance (AP)!\n\nRÉCOMPENSE: x1.1 tous les Taux de Ressources",
    liquidateAllAssets: "SUCCÈS:\nVous avez liquidé tous les actifs!\n\nRÉCOMPENSE: Fierté!",
    rebirth: "SUCCÈS:\nVous êtes renaît!\n\nRÉCOMPENSE: Permanent x1.3 tous les Taux de Ressources",
    conquer10StarSystems: "SUCCÈS:\nVous avez conquis 10 systèmes stellaires!\n\nRÉCOMPENSE: 10AP",
    conquer50StarSystems: "SUCCÈS:\nVous avez conquis 50 systèmes stellaires!\n\nRÉCOMPENSE: 100AP",
    studyAllStarsInOneRun:
      "SUCCÈS:\nVous avez étudié toutes les Étoiles dans la Carte Stellaire en une course!\n\nRÉCOMPENSE: Fierté!",
    adoptPhilosophy: "SUCCÈS:\nVous avez adopté une Philosophie!\n\nRÉCOMPENSE: Fierté!",
    discoverBlackHole: "SUCCÈS:\nVous avez découvert un Trou Noir!\n\nRÉCOMPENSE: {cashReward}",
    activateBlackHoleOver10x:
      "SUCCÈS:\nVous avez activé un Trou Noir à plus de 10x Distorsion Temporelle!\n\nRÉCOMPENSE: x2 toutes les quantités de Ressources (plafonnées au stockage)",
    findAncientManuscript:
      "SUCCÈS:\nVous avez trouvé un Manuscrit Ancien!\n\nRÉCOMPENSE: x2 toutes les quantités de Composés (plafonnées au stockage)",
    conquerMegastructureSystem:
      "SUCCÈS:\nVous avez conquis un Système de Mégastructure!\n\nRÉCOMPENSE: {cashReward}",
    bringDownMiaplacideanForceField:
      "SUCCÈS:\nVous avez abattu le Champ de Force Miaplacidéen!\n\nRÉCOMPENSE: 100AP",
    completeGame: "SUCCÈS:\nVous avez terminé le jeu!\n\nRÉCOMPENSE: Fierté!",
    completeRunOnMiaplacidus:
      "SUCCÈS:\nVous avez terminé une course sur Miaplacidus!\n\nRÉCOMPENSE: 1GP",
    haveFleetSizeOf50EachShipType:
      "SUCCÈS:\nVous avez au moins 50 de chaque type de vaisseau!\n\nRÉCOMPENSE: 1000000 Titane (plafonné au stockage)",
    tryAllThemes: "SUCCÈS:\nVous avez essayé tous les Thèmes!\n\nRÉCOMPENSE: Fierté!",
    buyCasinoPoints: "SUCCÈS:\nVous Avez Acheté Des Points De Casino!\n\nRÉCOMPENSE: Fierté!",
    winAllCasinoGames:
      "SUCCÈS:\nVous Avez Gagné Un Prix Dans Tous Les Jeux De Casino!\n\nRÉCOMPENSE: 1GP",
    winWheelSpecialPrize:
      "SUCCÈS:\nVous Avez Réclamé Un Prix Spécial De La Roue De La Fortune!\n\nRÉCOMPENSE: Fierté!",
    restoreNearSpaceScannerArray:
      "SUCCÈS:\nVous Avez Restauré Le Réseau De Scanner De L Espace Proche!\n\nRÉCOMPENSE: Fierté!",
    findCosmicRip: "SUCCÈS:\nVous Avez Trouvé Le Déchirure Cosmique!\n\nRÉCOMPENSE: Fierté!",
    gain1MTelemetryData:
      "SUCCÈS:\nVous Avez Gagné 1 000 000 De Données De Télémétrie!\n\nRÉCOMPENSE: Fierté!",
    closeCosmicRip: "SUCCÈS:\nVous avez fermé la Déchirure cosmique !\n\nRÉCOMPENSE: Fierté!",
    suffer5NegativeEvents:
      "SUCCÈS:\nVous Avez Subi 5 Événements Instantanés Négatifs!\n\nRÉCOMPENSE: Fierté!",
    enjoyEndlessSummer: "SUCCÈS:\nVous Profitez D Un Été Sans Fin!\n\nRÉCOMPENSE: Fierté!",
    completeOnboarding: "SUCCÈS:\nVous Avez Terminé L Intégration!\n\nRÉCOMPENSE: Fierté!",
  },
} as const satisfies Record<LocaleId, Record<AchievementId, string>>;
