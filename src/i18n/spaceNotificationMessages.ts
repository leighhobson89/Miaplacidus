import type { LocaleId } from "../content/ids";

const en = {
  starshipReady: "Starship can now be launched!",
  starshipLaunched: "Starship launched toward {system}.",
  starshipArrived: "Starship arrived at {system}.",
  oTypeStarReachedHeader: "TYPE O STAR REACHED",
  oTypeStarReachedText:
    "Your Starship has reached orbit of the {star} System.\n\nThe star burns with a ferocity you have only ever seen in theory.\nAn O-type sun: rare, impossibly bright, and violently alive.\n\nThe crew falls silent.\nEven the instruments hesitate before agreeing on the readings.",
  factoryStarReachedText:
    "Your Starship arrived at the {star} System!\nYou gasp at what you see! The main star has been completely enveloped by a gigantic structure!\nIt looks to be some kind of {structure}\nNo wonder we didn't discover this System before,\nthe star is not visible due to the size of this structure!\nThis system is going to be heavily defended for sure, but if we can conquer it,\nfor sure it will open up vast opportunities for us...",
  galacticTabUnlocked: "Galactic Tab Unlocked!",
  telescopeBuilt: "Space Telescope Built!",
  launchPadBuilt: "Launch Pad Built!",
  starshipSystemScanned: "{star} System Scanned!",
  starStudyComplete: "Star Study Complete! Study range increased to {range}.\n\nTake a look at the Star Map!",
  asteroidScanMissed: "Asteroid not found after search!",
  voidPillageComplete: "Pillage Void Complete!",
  resourcesGained: "Resources Gained:",
  compoundsGained: "Compounds Gained:",
  asteroidDiscovered: "Asteroid Discovered!\n\n{asteroid}",
  legendaryAsteroidDiscovered:
    "Legendary Asteroid Discovered!\n\nThey named it after you!\n\n{asteroid}",
  rocketLaunched: "{rocket} launched.",
  rocketFuelReady: "{rocket} is ready for Launch!",
  rocketOutbound: "{rocket} is travelling to {asteroid}.",
  rocketReturning: "{rocket} is returning from {asteroid}.",
  rocketArrived: "{rocket} has reached {asteroid} and started mining Antimatter!",
  rocketReturned: "{rocket} has returned to be refuelled!",
  rain: "Rain in {system} is blocking rocket launches.",
  heavyRain: "Heavy rain in {system} is blocking rocket launches.",
  volcano: "Volcanic conditions at {system} are blocking rocket launches.",
  weatherHeavyRainNoLaunchWithBenefit:
    "Heavy Rain! No launches until it clears, but {material} stores benefit!",
  weatherHeavyRainNoLaunch: "Heavy Rain! No launches until it clears.",
  weatherHeavyRainWithBenefit: "Heavy Rain! {material} stores benefit!",
  weatherHeavyRain: "Heavy Rain!",
  weatherVolcanoNoLaunchAndSolar:
    "Volcano Eruption! No launches until it clears, and solar power generation severely affected!",
  weatherVolcanoNoLaunch: "Volcano Eruption! No launches until it clears.",
  weatherVolcanoSolarAffected: "Volcano Eruption! Solar power severely affected!",
  weatherVolcano: "Volcano Eruption!",
  battleVictory: "Victory in {system}: the enemy fleet was defeated.",
  battleDefeat: "Defeat at {system}: your fleet was defeated.",
  rapidExpansionPeaceful:
    "Rapid Expansion cannot capture extra systems when settling lifeless or unsentient worlds.",
  rapidExpansionNonConquest:
    "Rapid Expansion only triggers after conquest victories. No extra systems were captured.",
  rapidExpansionCapturedOne: "Rapid Expansion captured {count} extra system! - {starNames}",
  rapidExpansionCapturedMany: "Rapid Expansion captured {count} extra systems! - {starNames}",
  rapidExpansionNoEligible: "Rapid Expansion found no eligible nearby systems.",
  rapidExpansionFailed: "Rapid Expansion failed to capture any extra systems.",
} as const;

export type SpaceNotificationMessageKey = keyof typeof en;

export const SPACE_NOTIFICATION_MESSAGES: Record<
  LocaleId,
  Record<SpaceNotificationMessageKey, string>
> = {
  en,
  es: {
    starshipReady: "¡La nave estelar ya puede lanzarse!",
    starshipLaunched: "La nave estelar partió hacia {system}.",
    starshipArrived: "La nave estelar llegó a {system}.",
    oTypeStarReachedHeader: "ESTRELLA TIPO O ALCANZADA",
    oTypeStarReachedText:
      "Tu Nave Estelar ha alcanzado la órbita del Sistema {star}.\n\nLa estrella arde con una ferocidad que solo has visto en teoría.\nUn sol tipo O: raro, increíblemente brillante, y violentamente vivo.\n\nLa tripulación calla.\nIncluso los instrumentos dudan antes de ponerse de acuerdo en las lecturas.",
    factoryStarReachedText:
      "¡Tu nave estelar ha llegado al sistema {star}!\n¡Te quedas boquiabierto! ¡La estrella principal está completamente envuelta por una estructura gigantesca!\nParece ser una especie de {structure}\nCon razón no habíamos descubierto este sistema antes:\n¡la estrella no se ve debido al tamaño de esta estructura!\nSeguro que este sistema estará fuertemente defendido, pero si logramos conquistarlo,\nsin duda nos abrirá enormes oportunidades...",
    galacticTabUnlocked: "¡Pestaña Galáctica desbloqueada!",
    telescopeBuilt: "¡Telescopio Espacial construido!",
    launchPadBuilt: "¡Plataforma de Lanzamiento construida!",
    starshipSystemScanned: "¡Sistema {star} escaneado!",
    starStudyComplete: "¡Estudio estelar completado! El alcance de estudio ha aumentado a {range}.\n\n¡Echa un vistazo al mapa estelar!",
    asteroidScanMissed: "¡No se encontró ningún asteroide tras la búsqueda!",
    voidPillageComplete: "¡Saqueo del Vacío completado!",
    resourcesGained: "Recursos obtenidos:",
    compoundsGained: "Compuestos obtenidos:",
    asteroidDiscovered: "¡Asteroide descubierto!\n\n{asteroid}",
    legendaryAsteroidDiscovered:
      "¡Asteroide legendario descubierto!\n\n¡Le han puesto tu nombre!\n\n{asteroid}",
    rocketLaunched: "Se lanzó {rocket}.",
    rocketFuelReady: "¡{rocket} está listo para el lanzamiento!",
    rocketOutbound: "{rocket} viaja hacia {asteroid}.",
    rocketReturning: "{rocket} regresa desde {asteroid}.",
    rocketArrived: "¡{rocket} ha llegado a {asteroid} y ha empezado a extraer Antimateria!",
    rocketReturned: "¡{rocket} ha vuelto para repostar!",
    rain: "La lluvia en {system} impide los lanzamientos de cohetes.",
    heavyRain: "La lluvia intensa en {system} impide los lanzamientos de cohetes.",
    volcano: "La actividad volcánica en {system} impide los lanzamientos de cohetes.",
    weatherHeavyRainNoLaunchWithBenefit:
      "¡Lluvia intensa! No hay lanzamientos hasta que escampe, pero las reservas de {material} se benefician.",
    weatherHeavyRainNoLaunch: "¡Lluvia intensa! No hay lanzamientos hasta que escampe.",
    weatherHeavyRainWithBenefit: "¡Lluvia intensa! Las reservas de {material} se benefician.",
    weatherHeavyRain: "¡Lluvia intensa!",
    weatherVolcanoNoLaunchAndSolar:
      "¡Erupción volcánica! No hay lanzamientos hasta que se despeje, y la generación solar se ve gravemente afectada.",
    weatherVolcanoNoLaunch: "¡Erupción volcánica! No hay lanzamientos hasta que se despeje.",
    weatherVolcanoSolarAffected: "¡Erupción volcánica! La energía solar se ve gravemente afectada.",
    weatherVolcano: "¡Erupción volcánica!",
    battleVictory: "Victoria en {system}: la flota enemiga ha sido derrotada.",
    battleDefeat: "Derrota en {system}: tu flota ha sido vencida.",
    rapidExpansionPeaceful:
      "La Expansión Rápida no puede capturar sistemas adicionales al colonizar mundos sin vida o no conscientes.",
    rapidExpansionNonConquest:
      "La Expansión Rápida solo se activa tras victorias por conquista. No se capturaron sistemas adicionales.",
    rapidExpansionCapturedOne:
      "¡La Expansión Rápida capturó {count} sistema adicional! - {starNames}",
    rapidExpansionCapturedMany:
      "¡La Expansión Rápida capturó {count} sistemas adicionales! - {starNames}",
    rapidExpansionNoEligible: "La Expansión Rápida no encontró sistemas cercanos elegibles.",
    rapidExpansionFailed: "La Expansión Rápida no logró capturar ningún sistema adicional.",
  },
  pt: {
    starshipReady: "A nave estelar já pode ser lançada!",
    starshipLaunched: "A nave estelar partiu em direção a {system}.",
    starshipArrived: "A nave estelar chegou a {system}.",
    oTypeStarReachedHeader: "ESTRELA DE TIPO O ALCANÇADA",
    oTypeStarReachedText:
      "A tua Nave Estelar alcançou a órbita do Sistema {star}.\n\nA estrela arde com uma ferocidade que só viste em teoria.\nUma estrela de tipo O: rara, incrivelmente brilhante e violentamente viva.\n\nA tripulação fica em silêncio.\nAté os instrumentos hesitam antes de concordarem com as leituras.",
    factoryStarReachedText:
      "A tua nave estelar chegou ao sistema {star}!\nFicas boquiaberto! A estrela principal está completamente envolta por uma estrutura gigantesca!\nParece ser uma espécie de {structure}\nNão é de admirar que não tivéssemos descoberto este sistema antes:\na estrela não é visível devido ao tamanho desta estrutura!\nCertamente este sistema será fortemente defendido, mas se conseguirmos conquistá-lo,\nsem dúvida abrirá enormes oportunidades para nós...",
    galacticTabUnlocked: "Separador Galáctico desbloqueado!",
    telescopeBuilt: "Telescópio Espacial construído!",
    launchPadBuilt: "Plataforma de Lançamento construída!",
    starshipSystemScanned: "Sistema {star} analisado!",
    starStudyComplete: "Estudo estelar concluído! O alcance de estudo aumentou para {range}.\n\nConsulta o mapa estelar!",
    asteroidScanMissed: "Não foi encontrado nenhum asteroide após a procura!",
    voidPillageComplete: "Pilhagem do Vazio concluída!",
    resourcesGained: "Recursos obtidos:",
    compoundsGained: "Compostos obtidos:",
    asteroidDiscovered: "Asteroide descoberto!\n\n{asteroid}",
    legendaryAsteroidDiscovered:
      "Asteroide lendário descoberto!\n\nDeram-lhe o teu nome!\n\n{asteroid}",
    rocketLaunched: "{rocket} foi lançado.",
    rocketFuelReady: "{rocket} está pronto para o lançamento!",
    rocketOutbound: "{rocket} está a caminho de {asteroid}.",
    rocketReturning: "{rocket} está voltando de {asteroid}.",
    rocketArrived: "{rocket} chegou a {asteroid} e começou a extrair Antimatéria!",
    rocketReturned: "{rocket} regressou para reabastecer!",
    rain: "A chuva em {system} está impedindo lançamentos de foguetes.",
    heavyRain: "A chuva forte em {system} está impedindo lançamentos de foguetes.",
    volcano: "As condições vulcânicas em {system} estão impedindo lançamentos de foguetes.",
    weatherHeavyRainNoLaunchWithBenefit:
      "Chuva intensa! Não há lançamentos até parar de chover, mas as reservas de {material} beneficiam.",
    weatherHeavyRainNoLaunch: "Chuva intensa! Não há lançamentos até parar de chover.",
    weatherHeavyRainWithBenefit: "Chuva intensa! As reservas de {material} beneficiam.",
    weatherHeavyRain: "Chuva intensa!",
    weatherVolcanoNoLaunchAndSolar:
      "Erupção vulcânica! Não há lançamentos até a situação normalizar, e a geração solar é gravemente afetada.",
    weatherVolcanoNoLaunch: "Erupção vulcânica! Não há lançamentos até a situação normalizar.",
    weatherVolcanoSolarAffected: "Erupção vulcânica! A energia solar é gravemente afetada.",
    weatherVolcano: "Erupção vulcânica!",
    battleVictory: "Vitória em {system}: a frota inimiga foi derrotada.",
    battleDefeat: "Derrota em {system}: sua frota foi derrotada.",
    rapidExpansionPeaceful:
      "A Expansão Rápida não pode capturar sistemas adicionais ao colonizar mundos sem vida ou não conscientes.",
    rapidExpansionNonConquest:
      "A Expansão Rápida só é ativada após vitórias por conquista. Não foram capturados sistemas adicionais.",
    rapidExpansionCapturedOne:
      "A Expansão Rápida capturou {count} sistema adicional! - {starNames}",
    rapidExpansionCapturedMany:
      "A Expansão Rápida capturou {count} sistemas adicionais! - {starNames}",
    rapidExpansionNoEligible: "A Expansão Rápida não encontrou sistemas próximos elegíveis.",
    rapidExpansionFailed: "A Expansão Rápida não conseguiu capturar nenhum sistema adicional.",
  },
  de: {
    starshipReady: "Das Raumschiff kann jetzt starten!",
    starshipLaunched: "Das Sternenschiff ist nach {system} gestartet.",
    starshipArrived: "Das Sternenschiff hat {system} erreicht.",
    oTypeStarReachedHeader: "TYP-O-STERN ERREICHT",
    oTypeStarReachedText:
      "Dein Sternenschiff hat die Umlaufbahn des {star}-Systems erreicht.\n\nDer Stern brennt mit einer Wildheit, die du nur in der Theorie gesehen hast.\nEine Sonne vom Typ O: selten, unglaublich hell und gewaltsam lebendig.\n\nDie Crew verstummt.\nSelbst die Instrumente zögern, bevor sie sich über die Messwerte einig sind.",
    factoryStarReachedText:
      "Dein Raumschiff hat das System {star} erreicht!\nDu staunst über das, was du siehst! Der Hauptstern ist vollständig von einer gigantischen Struktur umhüllt!\nEs scheint sich um eine Art {structure} zu handeln\nKein Wunder, dass wir dieses System bisher nicht entdeckt haben,\nder Stern ist wegen der Größe dieser Struktur nicht sichtbar!\nDieses System wird sicher stark verteidigt sein, aber wenn wir es erobern können,\neröffnet es uns ganz sicher gewaltige Möglichkeiten...",
    galacticTabUnlocked: "Galaktischer Tab freigeschaltet!",
    telescopeBuilt: "Weltraumteleskop gebaut!",
    launchPadBuilt: "Startplattform gebaut!",
    starshipSystemScanned: "System {star} gescannt!",
    starStudyComplete: "Sternstudie abgeschlossen! Die Reichweite wurde auf {range} erhöht.\n\nSchau dir die Sternenkarte an!",
    asteroidScanMissed: "Nach der Suche wurde kein Asteroid gefunden!",
    voidPillageComplete: "Leerenplünderung abgeschlossen!",
    resourcesGained: "Erhaltene Ressourcen:",
    compoundsGained: "Erhaltene Verbindungen:",
    asteroidDiscovered: "Asteroid entdeckt!\n\n{asteroid}",
    legendaryAsteroidDiscovered:
      "Legendärer Asteroid entdeckt!\n\nEr wurde nach dir benannt!\n\n{asteroid}",
    rocketLaunched: "{rocket} wurde gestartet.",
    rocketFuelReady: "{rocket} ist startbereit!",
    rocketOutbound: "{rocket} fliegt zu {asteroid}.",
    rocketReturning: "{rocket} kehrt von {asteroid} zurück.",
    rocketArrived: "{rocket} hat {asteroid} erreicht und beginnt mit dem Antimaterie-Abbau!",
    rocketReturned: "{rocket} ist zum Auftanken zurückgekehrt!",
    rain: "Regen auf {system} verhindert Raketenstarts.",
    heavyRain: "Starker Regen auf {system} verhindert Raketenstarts.",
    volcano: "Vulkanische Bedingungen auf {system} verhindern Raketenstarts.",
    weatherHeavyRainNoLaunchWithBenefit:
      "Starkregen! Keine Starts, bis es aufklart, aber die {material}-Vorräte profitieren!",
    weatherHeavyRainNoLaunch: "Starkregen! Keine Starts, bis es aufklart.",
    weatherHeavyRainWithBenefit: "Starkregen! Die {material}-Vorräte profitieren!",
    weatherHeavyRain: "Starkregen!",
    weatherVolcanoNoLaunchAndSolar:
      "Vulkanausbruch! Keine Starts, bis es sich legt, und die Solarstromerzeugung ist stark beeinträchtigt!",
    weatherVolcanoNoLaunch: "Vulkanausbruch! Keine Starts, bis es sich legt.",
    weatherVolcanoSolarAffected: "Vulkanausbruch! Die Solarenergie ist stark beeinträchtigt!",
    weatherVolcano: "Vulkanausbruch!",
    battleVictory: "Sieg bei {system}: Die feindliche Flotte wurde besiegt.",
    battleDefeat: "Niederlage bei {system}: Deine Flotte wurde besiegt.",
    rapidExpansionPeaceful:
      "Schnelle Expansion kann keine zusätzlichen Systeme erobern, wenn leblose oder nicht empfindungsfähige Welten besiedelt werden.",
    rapidExpansionNonConquest:
      "Schnelle Expansion wird nur nach Eroberungssiegen ausgelöst. Es wurden keine zusätzlichen Systeme erobert.",
    rapidExpansionCapturedOne:
      "Schnelle Expansion hat {count} zusätzliches System erobert! - {starNames}",
    rapidExpansionCapturedMany:
      "Schnelle Expansion hat {count} zusätzliche Systeme erobert! - {starNames}",
    rapidExpansionNoEligible: "Schnelle Expansion hat keine geeigneten nahen Systeme gefunden.",
    rapidExpansionFailed: "Schnelle Expansion konnte keine zusätzlichen Systeme erobern.",
  },
  it: {
    starshipReady: "L'astronave può ora essere lanciata!",
    starshipLaunched: "L'astronave è partita verso {system}.",
    starshipArrived: "L'astronave è arrivata a {system}.",
    oTypeStarReachedHeader: "STELLA TIPO O RAGGIUNTA",
    oTypeStarReachedText:
      "La tua Nave Stellare ha raggiunto l'orbita del Sistema {star}.\n\nLa stella brucia con una ferocia che hai visto solo in teoria.\nUn sole di tipo O: raro, incredibilmente luminoso, e violentemente vivo.\n\nL'equipaggio tace.\nPersino gli strumenti esitano prima di concordare sulle letture.",
    factoryStarReachedText:
      "La tua astronave è arrivata al sistema {star}!\nResti a bocca aperta! La stella principale è completamente avvolta da una struttura gigantesca!\nSembra essere una specie di {structure}\nNon c'è da stupirsi che non avessimo scoperto prima questo sistema:\nla stella non è visibile a causa delle dimensioni di questa struttura!\nQuesto sistema sarà sicuramente ben difeso, ma se riusciamo a conquistarlo,\nci aprirà di certo enormi opportunità...",
    galacticTabUnlocked: "Scheda Galattica sbloccata!",
    telescopeBuilt: "Telescopio Spaziale costruito!",
    launchPadBuilt: "Piattaforma di Lancio costruita!",
    starshipSystemScanned: "Sistema {star} scansionato!",
    starStudyComplete: "Studio stellare completato! Il raggio di studio è aumentato a {range}.\n\nDai un'occhiata alla mappa stellare!",
    asteroidScanMissed: "Nessun asteroide trovato dopo la ricerca!",
    voidPillageComplete: "Saccheggio del Vuoto completato!",
    resourcesGained: "Risorse ottenute:",
    compoundsGained: "Composti ottenuti:",
    asteroidDiscovered: "Asteroide scoperto!\n\n{asteroid}",
    legendaryAsteroidDiscovered:
      "Asteroide leggendario scoperto!\n\nGli hanno dato il tuo nome!\n\n{asteroid}",
    rocketLaunched: "{rocket} è stato lanciato.",
    rocketFuelReady: "{rocket} è pronto al lancio!",
    rocketOutbound: "{rocket} sta viaggiando verso {asteroid}.",
    rocketReturning: "{rocket} sta tornando da {asteroid}.",
    rocketArrived: "{rocket} ha raggiunto {asteroid} e ha iniziato a estrarre Antimateria!",
    rocketReturned: "{rocket} è tornato per il rifornimento!",
    rain: "La pioggia su {system} impedisce i lanci dei razzi.",
    heavyRain: "La pioggia intensa su {system} impedisce i lanci dei razzi.",
    volcano: "Le condizioni vulcaniche su {system} impediscono i lanci dei razzi.",
    weatherHeavyRainNoLaunchWithBenefit:
      "Pioggia intensa! Nessun lancio finché non spiove, ma le scorte di {material} ne beneficiano!",
    weatherHeavyRainNoLaunch: "Pioggia intensa! Nessun lancio finché non spiove.",
    weatherHeavyRainWithBenefit: "Pioggia intensa! Le scorte di {material} ne beneficiano!",
    weatherHeavyRain: "Pioggia intensa!",
    weatherVolcanoNoLaunchAndSolar:
      "Eruzione vulcanica! Nessun lancio finché non si dirada, e la generazione solare è gravemente compromessa!",
    weatherVolcanoNoLaunch: "Eruzione vulcanica! Nessun lancio finché non si dirada.",
    weatherVolcanoSolarAffected: "Eruzione vulcanica! L'energia solare è gravemente compromessa!",
    weatherVolcano: "Eruzione vulcanica!",
    battleVictory: "Vittoria su {system}: la flotta nemica è stata sconfitta.",
    battleDefeat: "Sconfitta su {system}: la tua flotta è stata sconfitta.",
    rapidExpansionPeaceful:
      "L'Espansione Rapida non può conquistare sistemi extra quando si colonizzano mondi senza vita o non senzienti.",
    rapidExpansionNonConquest:
      "L'Espansione Rapida si attiva solo dopo vittorie di conquista. Nessun sistema extra è stato conquistato.",
    rapidExpansionCapturedOne:
      "L'Espansione Rapida ha conquistato {count} sistema extra! - {starNames}",
    rapidExpansionCapturedMany:
      "L'Espansione Rapida ha conquistato {count} sistemi extra! - {starNames}",
    rapidExpansionNoEligible: "L'Espansione Rapida non ha trovato sistemi vicini idonei.",
    rapidExpansionFailed: "L'Espansione Rapida non è riuscita a conquistare sistemi extra.",
  },
  fr: {
    starshipReady: "Le vaisseau stellaire peut maintenant être lancé !",
    starshipLaunched: "Le vaisseau spatial est parti vers {system}.",
    starshipArrived: "Le vaisseau spatial est arrivé à {system}.",
    oTypeStarReachedHeader: "ÉTOILE TYPE O ATTEINTE",
    oTypeStarReachedText:
      "Ton Vaisseau Stellaire a atteint l'orbite du Système {star}.\n\nL'étoile brûle avec une férocité que tu n'as vue qu'en théorie.\nUn soleil de type O: rare, incroyablement brillant, et violemment vivant.\n\nL'équipage se tait.\nMême les instruments hésitent avant de s'accorder sur les lectures.",
    factoryStarReachedText:
      "Votre vaisseau est arrivé dans le système {star}!\nVous restez bouche bée! L'étoile principale est entièrement enveloppée par une structure gigantesque!\nCela semble être une sorte de {structure}\nPas étonnant que nous n'ayons pas découvert ce système plus tôt,\nl'étoile est invisible à cause de la taille de cette structure!\nCe système sera sûrement lourdement défendu, mais si nous parvenons à le conquérir,\nil nous ouvrira à coup sûr d'immenses opportunités...",
    galacticTabUnlocked: "Onglet Galactique débloqué!",
    telescopeBuilt: "Télescope Spatial construit!",
    launchPadBuilt: "Pas de Tir construit!",
    starshipSystemScanned: "Système {star} scanné!",
    starStudyComplete: "Étude stellaire terminée ! La portée d'étude est passée à {range}.\n\nJetez un œil à la carte stellaire !",
    asteroidScanMissed: "Aucun astéroïde trouvé après la recherche!",
    voidPillageComplete: "Pillage du Vide terminé !",
    resourcesGained: "Ressources obtenues:",
    compoundsGained: "Composés obtenus:",
    asteroidDiscovered: "Astéroïde découvert!\n\n{asteroid}",
    legendaryAsteroidDiscovered:
      "Astéroïde légendaire découvert!\n\nIl porte votre nom!\n\n{asteroid}",
    rocketLaunched: "{rocket} a été lancé.",
    rocketFuelReady: "{rocket} est prêt au lancement!",
    rocketOutbound: "{rocket} se dirige vers {asteroid}.",
    rocketReturning: "{rocket} revient de {asteroid}.",
    rocketArrived: "{rocket} a atteint {asteroid} et a commencé à extraire de l'Antimatière!",
    rocketReturned: "{rocket} est revenu pour être ravitaillé!",
    rain: "La pluie sur {system} empêche les lancements de fusées.",
    heavyRain: "Les fortes pluies sur {system} empêchent les lancements de fusées.",
    volcano: "Les conditions volcaniques sur {system} empêchent les lancements de fusées.",
    weatherHeavyRainNoLaunchWithBenefit:
      "Forte pluie! Aucun lancement jusqu'à l'éclaircie, mais les réserves de {material} en profitent!",
    weatherHeavyRainNoLaunch: "Forte pluie! Aucun lancement jusqu'à l'éclaircie.",
    weatherHeavyRainWithBenefit: "Forte pluie! Les réserves de {material} en profitent!",
    weatherHeavyRain: "Forte pluie!",
    weatherVolcanoNoLaunchAndSolar:
      "Éruption volcanique! Aucun lancement jusqu'à dissipation, et la production solaire est fortement affectée!",
    weatherVolcanoNoLaunch: "Éruption volcanique! Aucun lancement jusqu'à dissipation.",
    weatherVolcanoSolarAffected: "Éruption volcanique! L'énergie solaire est fortement affectée!",
    weatherVolcano: "Éruption volcanique!",
    battleVictory: "Victoire sur {system} : la flotte ennemie a été vaincue.",
    battleDefeat: "Défaite sur {system} : votre flotte a été vaincue.",
    rapidExpansionPeaceful:
      "L'Expansion Rapide ne peut pas capturer de systèmes supplémentaires en colonisant des mondes sans vie ou non sensibles.",
    rapidExpansionNonConquest:
      "L'Expansion Rapide ne se déclenche qu'après des victoires par conquête. Aucun système supplémentaire n'a été capturé.",
    rapidExpansionCapturedOne:
      "L'Expansion Rapide a capturé {count} système supplémentaire ! - {starNames}",
    rapidExpansionCapturedMany:
      "L'Expansion Rapide a capturé {count} systèmes supplémentaires ! - {starNames}",
    rapidExpansionNoEligible: "L'Expansion Rapide n'a trouvé aucun système proche éligible.",
    rapidExpansionFailed: "L'Expansion Rapide n'a réussi à capturer aucun système supplémentaire.",
  },
};

export function spaceNotificationText(
  locale: LocaleId,
  key: SpaceNotificationMessageKey,
  values: Readonly<Record<string, string | number>> = {},
): string {
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    SPACE_NOTIFICATION_MESSAGES[locale][key],
  );
}
