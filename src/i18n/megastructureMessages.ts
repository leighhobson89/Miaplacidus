import type { LocaleId } from "../content/ids";
import type { MegastructureId } from "../content/technology";

export interface MegastructureMessages {
  readonly title: string;
  readonly introduction: string;
  readonly noManuscripts: string;
  readonly forceField: string;
  readonly manuscriptPending: string;
  readonly manuscriptReported: string;
  readonly notSettled: string;
  readonly notAtFactory: string;
  readonly stageProgress: string;
  readonly stage: string;
  readonly researched: string;
  readonly researchAction: string;
  readonly researchCost: string;
  readonly structureNames: Readonly<Record<MegastructureId, string>>;
}

const MESSAGES: Record<LocaleId, MegastructureMessages> = {
  en: {
    title: "Megastructures",
    introduction:
      "Settle ancient manuscript sites to reveal factory stars. Conquer a factory star, rebirth into it, and research its five stages.",
    noManuscripts: "No ancient manuscripts have been found yet. Continue studying the stars.",
    forceField:
      "Miaplacidus force field: {level}/4. Complete stage 3 on all four structures to open the home system.",
    manuscriptPending:
      "Manuscript {number} is at {manuscript}; its factory location remains hidden.",
    manuscriptReported: "Manuscript {number} at {manuscript} reveals {structure} at {factory}.",
    notSettled: "Settle {factory} before researching this structure.",
    notAtFactory: "Start a run at the conquered factory star to research its stages.",
    stageProgress: "{count}/5 stages researched",
    stage: "Stage {number}",
    researched: "Researched",
    researchAction: "Research stage",
    researchCost: "{cost} RP",
    structureNames: {
      dysonSphere: "Dyson Sphere",
      celestialProcessingCore: "Celestial Processing Core",
      plasmaForge: "Plasma Forge",
      galacticMemoryArchive: "Galactic Memory Archive",
    },
  },
  es: {
    title: "Megastructuras",
    introduction:
      "Asienta los lugares de los manuscritos antiguos para revelar estrellas factoría. Conquista una estrella factoría, renace en ella e investiga sus cinco etapas.",
    noManuscripts: "Aún no se han encontrado manuscritos antiguos. Sigue estudiando las estrellas.",
    forceField:
      "Campo de fuerza de Miaplacidus: {level}/4. Completa la etapa 3 de las cuatro estructuras para abrir el sistema natal.",
    manuscriptPending:
      "El manuscrito {number} está en {manuscript}; la ubicación de la factoría sigue oculta.",
    manuscriptReported: "El manuscrito {number} de {manuscript} revela {structure} en {factory}.",
    notSettled: "Asienta {factory} antes de investigar esta estructura.",
    notAtFactory:
      "Inicia una partida en la estrella factoría conquistada para investigar sus etapas.",
    stageProgress: "{count}/5 etapas investigadas",
    stage: "Etapa {number}",
    researched: "Investigada",
    researchAction: "Investigar etapa",
    researchCost: "{cost} PI",
    structureNames: {
      dysonSphere: "Esfera de Dyson",
      celestialProcessingCore: "Núcleo de Procesamiento Celestial",
      plasmaForge: "Forja de Plasma",
      galacticMemoryArchive: "Archivo de Memoria Galáctica",
    },
  },
  pt: {
    title: "Megastruturas",
    introduction:
      "Estabeleça os locais dos manuscritos antigos para revelar estrelas-fábrica. Conquiste uma estrela-fábrica, renasça nela e pesquise suas cinco etapas.",
    noManuscripts: "Nenhum manuscrito antigo foi encontrado. Continue estudando as estrelas.",
    forceField:
      "Campo de força de Miaplacidus: {level}/4. Conclua a etapa 3 das quatro estruturas para abrir o sistema natal.",
    manuscriptPending:
      "O manuscrito {number} está em {manuscript}; o local da fábrica continua oculto.",
    manuscriptReported: "O manuscrito {number} em {manuscript} revela {structure} em {factory}.",
    notSettled: "Estabeleça {factory} antes de pesquisar esta estrutura.",
    notAtFactory: "Inicie uma partida na estrela-fábrica conquistada para pesquisar suas etapas.",
    stageProgress: "{count}/5 etapas pesquisadas",
    stage: "Etapa {number}",
    researched: "Pesquisada",
    researchAction: "Pesquisar etapa",
    researchCost: "{cost} PI",
    structureNames: {
      dysonSphere: "Esfera de Dyson",
      celestialProcessingCore: "Núcleo de Processamento Celestial",
      plasmaForge: "Forja de Plasma",
      galacticMemoryArchive: "Arquivo de Memória Galáctica",
    },
  },
  de: {
    title: "Megastrukturen",
    introduction:
      "Siedle die Fundorte alter Manuskripte, um Fabriksterne zu entdecken. Erobere einen Fabrikstern, starte dort nach einer Wiedergeburt und erforsche seine fünf Stufen.",
    noManuscripts: "Es wurden noch keine alten Manuskripte gefunden. Erforsche weiter die Sterne.",
    forceField:
      "Miaplacidus-Kraftfeld: {level}/4. Erforsche Stufe 3 aller vier Strukturen, um das Heimatsystem zu öffnen.",
    manuscriptPending:
      "Manuskript {number} liegt auf {manuscript}; der Fabrikstandort bleibt verborgen.",
    manuscriptReported: "Manuskript {number} auf {manuscript} enthüllt {structure} auf {factory}.",
    notSettled: "Siedle {factory}, bevor du diese Struktur erforschst.",
    notAtFactory:
      "Starte einen Durchlauf auf dem eroberten Fabrikstern, um seine Stufen zu erforschen.",
    stageProgress: "{count}/5 Stufen erforscht",
    stage: "Stufe {number}",
    researched: "Erforscht",
    researchAction: "Stufe erforschen",
    researchCost: "{cost} FP",
    structureNames: {
      dysonSphere: "Dyson-Sphäre",
      celestialProcessingCore: "Himmlischer Verarbeitungskern",
      plasmaForge: "Plasma-Schmiede",
      galacticMemoryArchive: "Galaktisches Gedächtnisarchiv",
    },
  },
  it: {
    title: "Megastrutture",
    introduction:
      "Conquista i luoghi dei manoscritti antichi per rivelare le stelle fabbrica. Conquista una stella fabbrica, rinascici e ricerca le sue cinque fasi.",
    noManuscripts:
      "Non è ancora stato trovato alcun manoscritto antico. Continua a studiare le stelle.",
    forceField:
      "Campo di forza di Miaplacidus: {level}/4. Completa la fase 3 di tutte e quattro le strutture per aprire il sistema natale.",
    manuscriptPending:
      "Il manoscritto {number} si trova su {manuscript}; il sito della fabbrica è ancora nascosto.",
    manuscriptReported: "Il manoscritto {number} su {manuscript} rivela {structure} su {factory}.",
    notSettled: "Conquista {factory} prima di ricercare questa struttura.",
    notAtFactory: "Inizia una partita nella stella fabbrica conquistata per ricercarne le fasi.",
    stageProgress: "{count}/5 fasi ricercate",
    stage: "Fase {number}",
    researched: "Ricercata",
    researchAction: "Ricerca fase",
    researchCost: "{cost} PR",
    structureNames: {
      dysonSphere: "Sfera di Dyson",
      celestialProcessingCore: "Nucleo di Elaborazione Celestiale",
      plasmaForge: "Forgia al Plasma",
      galacticMemoryArchive: "Archivio di Memoria Galattica",
    },
  },
  fr: {
    title: "Mégastructures",
    introduction:
      "Établissez les sites des manuscrits anciens pour révéler des étoiles-usines. Conquérez une étoile-usine, renaissez-y et recherchez ses cinq étapes.",
    noManuscripts: "Aucun manuscrit ancien n'a encore été trouvé. Continuez à étudier les étoiles.",
    forceField:
      "Champ de force de Miaplacidus : {level}/4. Terminez l'étape 3 des quatre structures pour ouvrir le système natal.",
    manuscriptPending:
      "Le manuscrit {number} se trouve sur {manuscript} ; le site de l'usine reste caché.",
    manuscriptReported: "Le manuscrit {number} sur {manuscript} révèle {structure} sur {factory}.",
    notSettled: "Établissez {factory} avant de rechercher cette structure.",
    notAtFactory: "Commencez une partie sur l'étoile-usine conquise pour rechercher ses étapes.",
    stageProgress: "{count}/5 étapes recherchées",
    stage: "Étape {number}",
    researched: "Recherchée",
    researchAction: "Rechercher l'étape",
    researchCost: "{cost} PR",
    structureNames: {
      dysonSphere: "Sphère de Dyson",
      celestialProcessingCore: "Noyau de Traitement Céleste",
      plasmaForge: "Forge de Plasma",
      galacticMemoryArchive: "Archive de Mémoire Galactique",
    },
  },
};

export function megastructureText(locale: LocaleId): MegastructureMessages {
  return MESSAGES[locale];
}
