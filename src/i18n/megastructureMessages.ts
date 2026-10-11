import type { LocaleId } from "../content/ids";
import type { MegastructureId } from "../content/technology";

export interface MegastructureMessages {
  readonly title: string;
  readonly headerHelp: string;
  readonly introduction: string;
  readonly noManuscripts: string;
  readonly forceField: string;
  readonly forceFieldCleared: string;
  readonly forceFieldStrength: string;
  readonly forceFieldDown: string;
  readonly forceFieldKeepWeakening: string;
  readonly forceFieldCanMove: string;
  readonly manuscriptPending: string;
  readonly manuscriptReported: string;
  readonly notSettled: string;
  readonly notAtFactory: string;
  readonly insufficientResearch: string;
  readonly missingPrerequisites: string;
  readonly researchUnavailable: string;
  readonly stageProgressOne: string;
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
    headerHelp:
      "This shows your progress in harnessing the power of MegaStructures, and the slow dismantling of the Miaplacidus Force Field!",
    introduction:
      "Settle ancient manuscript sites to reveal factory stars. Conquer a factory star, rebirth into it, and research its five stages.",
    noManuscripts: "No ancient manuscripts have been found yet. Continue studying the stars.",
    forceField:
      "Miaplacidus force field: {level}/{total}. Complete stage 3 on all four structures to open the home system.",
    forceFieldCleared: "Miaplacidus force field: {level}/{total}. You can now move to Miaplacidus!",
    forceFieldStrength: "Force Field Strength:",
    forceFieldDown: "DOWN!",
    forceFieldKeepWeakening:
      "Keep searching and conquering Ancient Megastructures to weaken the Miaplacidus Force Field",
    forceFieldCanMove: "You can now move to Miaplacidus!",
    manuscriptPending:
      "Manuscript {number} is at {manuscript}; its factory location remains hidden.",
    manuscriptReported: "Manuscript {number} at {manuscript} reveals {structure} at {factory}.",
    notSettled: "Settle {factory} before researching this structure.",
    notAtFactory: "Start a run at the conquered factory star to research its stages.",
    stageProgressOne: "{count}/{total} stage researched",
    stageProgress: "{count}/{total} stages researched",
    stage: "Stage {number}",
    researched: "Researched",
    researchAction: "Research stage",
    researchCost: "{cost} RP",
    insufficientResearch: "Requires {required} RP; short by {shortfall} RP.",
    missingPrerequisites: "Research these technologies first: {technologies}.",
    researchUnavailable: "This stage is not available for research yet.",
    structureNames: {
      dysonSphere: "Dyson Sphere",
      celestialProcessingCore: "Celestial Processing Core",
      plasmaForge: "Plasma Forge",
      galacticMemoryArchive: "Galactic Memory Archive",
    },
  },
  es: {
    title: "Megaestructuras",
    headerHelp:
      "Esto muestra tu progreso en aprovechar el poder de las MegaEstructuras, y el lento desmantelamiento del Campo de Fuerza de Miaplacidus!",
    introduction:
      "Asienta los lugares de los manuscritos antiguos para revelar estrellas factoría. Conquista una estrella factoría, renace en ella e investiga sus cinco etapas.",
    noManuscripts: "Aún no se han encontrado manuscritos antiguos. Sigue estudiando las estrellas.",
    forceField:
      "Campo de fuerza de Miaplacidus: {level}/{total}. Completa la etapa 3 de las cuatro estructuras para abrir el sistema natal.",
    forceFieldCleared:
      "Campo de fuerza de Miaplacidus: {level}/{total}. ¡Ya puedes viajar a Miaplacidus!",
    forceFieldStrength: "Potencia del campo de fuerza:",
    forceFieldDown: "¡CAÍDO!",
    forceFieldKeepWeakening:
      "Sigue buscando y conquistando megaestructuras antiguas para debilitar el campo de fuerza de Miaplacidus",
    forceFieldCanMove: "¡Ya puedes viajar a Miaplacidus!",
    manuscriptPending:
      "El manuscrito {number} está en {manuscript}; la ubicación de la factoría sigue oculta.",
    manuscriptReported: "El manuscrito {number} de {manuscript} revela {structure} en {factory}.",
    notSettled: "Asienta {factory} antes de investigar esta estructura.",
    notAtFactory:
      "Inicia una partida en la estrella factoría conquistada para investigar sus etapas.",
    stageProgressOne: "{count}/{total} etapa investigada",
    stageProgress: "{count}/{total} etapas investigadas",
    stage: "Etapa {number}",
    researched: "Investigada",
    researchAction: "Investigar etapa",
    researchCost: "{cost} PI",
    insufficientResearch: "Requiere {required} PI; faltan {shortfall} PI.",
    missingPrerequisites: "Investiga primero estas tecnologías: {technologies}.",
    researchUnavailable: "Esta etapa aún no está disponible para investigar.",
    structureNames: {
      dysonSphere: "Esfera de Dyson",
      celestialProcessingCore: "Núcleo de Procesamiento Celestial",
      plasmaForge: "Forja de Plasma",
      galacticMemoryArchive: "Archivo de Memoria Galáctica",
    },
  },
  pt: {
    title: "Megaestruturas",
    headerHelp:
      "Isto mostra o teu progresso em aproveitar o poder das Megaestruturas e o lento desmantelamento do Campo de Força de Miaplacidus!",
    introduction:
      "Estabeleça os locais dos manuscritos antigos para revelar estrelas-fábrica. Conquiste uma estrela-fábrica, renasça nela e pesquise suas cinco etapas.",
    noManuscripts: "Nenhum manuscrito antigo foi encontrado. Continue estudando as estrelas.",
    forceField:
      "Campo de força de Miaplacidus: {level}/{total}. Conclua a etapa 3 das quatro estruturas para abrir o sistema natal.",
    forceFieldCleared:
      "Campo de força de Miaplacidus: {level}/{total}. Já podes viajar para Miaplacidus!",
    forceFieldStrength: "Potência do campo de força:",
    forceFieldDown: "CAÍDO!",
    forceFieldKeepWeakening:
      "Continua a procurar e conquistar megaconstruções antigas para enfraquecer o campo de força de Miaplacidus",
    forceFieldCanMove: "Já podes viajar para Miaplacidus!",
    manuscriptPending:
      "O manuscrito {number} está em {manuscript}; o local da fábrica continua oculto.",
    manuscriptReported: "O manuscrito {number} em {manuscript} revela {structure} em {factory}.",
    notSettled: "Estabeleça {factory} antes de pesquisar esta estrutura.",
    notAtFactory: "Inicie uma partida na estrela-fábrica conquistada para pesquisar suas etapas.",
    stageProgressOne: "{count}/{total} etapa pesquisada",
    stageProgress: "{count}/{total} etapas pesquisadas",
    stage: "Etapa {number}",
    researched: "Pesquisada",
    researchAction: "Pesquisar etapa",
    researchCost: "{cost} PI",
    insufficientResearch: "Requer {required} PI; faltam {shortfall} PI.",
    missingPrerequisites: "Pesquise estas tecnologias primeiro: {technologies}.",
    researchUnavailable: "Esta etapa ainda não está disponível para pesquisa.",
    structureNames: {
      dysonSphere: "Esfera de Dyson",
      celestialProcessingCore: "Núcleo de Processamento Celestial",
      plasmaForge: "Forja de Plasma",
      galacticMemoryArchive: "Arquivo de Memória Galáctica",
    },
  },
  de: {
    title: "Megastrukturen",
    headerHelp:
      "Dies zeigt deinen Fortschritt beim Nutzen der Kraft von MegaStrukturen, und die langsame Demontage des Miaplacidus-Kraftfeldes!",
    introduction:
      "Siedle die Fundorte alter Manuskripte, um Fabriksterne zu entdecken. Erobere einen Fabrikstern, starte dort nach einer Wiedergeburt und erforsche seine fünf Stufen.",
    noManuscripts: "Es wurden noch keine alten Manuskripte gefunden. Erforsche weiter die Sterne.",
    forceField:
      "Miaplacidus-Kraftfeld: {level}/{total}. Erforsche Stufe 3 aller vier Strukturen, um das Heimatsystem zu öffnen.",
    forceFieldCleared:
      "Miaplacidus-Kraftfeld: {level}/{total}. Du kannst jetzt nach Miaplacidus reisen!",
    forceFieldStrength: "Kraftfeldstärke:",
    forceFieldDown: "GEFALLEN!",
    forceFieldKeepWeakening:
      "Suche und erobere weiter antike Megastrukturen, um das Kraftfeld von Miaplacidus zu schwächen",
    forceFieldCanMove: "Du kannst jetzt nach Miaplacidus reisen!",
    manuscriptPending:
      "Manuskript {number} liegt auf {manuscript}; der Fabrikstandort bleibt verborgen.",
    manuscriptReported: "Manuskript {number} auf {manuscript} enthüllt {structure} auf {factory}.",
    notSettled: "Siedle {factory}, bevor du diese Struktur erforschst.",
    notAtFactory:
      "Starte einen Durchlauf auf dem eroberten Fabrikstern, um seine Stufen zu erforschen.",
    stageProgressOne: "{count}/{total} Stufe erforscht",
    stageProgress: "{count}/{total} Stufen erforscht",
    stage: "Stufe {number}",
    researched: "Erforscht",
    researchAction: "Stufe erforschen",
    researchCost: "{cost} FP",
    insufficientResearch: "Benötigt {required} FP; es fehlen {shortfall} FP.",
    missingPrerequisites: "Erforsche zuerst diese Technologien: {technologies}.",
    researchUnavailable: "Diese Stufe kann noch nicht erforscht werden.",
    structureNames: {
      dysonSphere: "Dyson-Sphäre",
      celestialProcessingCore: "Himmlischer Verarbeitungskern",
      plasmaForge: "Plasma-Schmiede",
      galacticMemoryArchive: "Galaktisches Gedächtnisarchiv",
    },
  },
  it: {
    title: "Megastrutture",
    headerHelp:
      "Questo mostra il tuo progresso nello sfruttare il potere delle MegaStrutture, e il lento smantellamento del Campo di Forza di Miaplacidus!",
    introduction:
      "Conquista i luoghi dei manoscritti antichi per rivelare le stelle fabbrica. Conquista una stella fabbrica, rinascici e ricerca le sue cinque fasi.",
    noManuscripts:
      "Non è ancora stato trovato alcun manoscritto antico. Continua a studiare le stelle.",
    forceField:
      "Campo di forza di Miaplacidus: {level}/{total}. Completa la fase 3 di tutte e quattro le strutture per aprire il sistema natale.",
    forceFieldCleared:
      "Campo di forza di Miaplacidus: {level}/{total}. Ora puoi spostarti su Miaplacidus!",
    forceFieldStrength: "Potenza del campo di forza:",
    forceFieldDown: "ABBATTUTO!",
    forceFieldKeepWeakening:
      "Continua a cercare e conquistare megastrutture antiche per indebolire il campo di forza di Miaplacidus",
    forceFieldCanMove: "Ora puoi spostarti su Miaplacidus!",
    manuscriptPending:
      "Il manoscritto {number} si trova su {manuscript}; il sito della fabbrica è ancora nascosto.",
    manuscriptReported: "Il manoscritto {number} su {manuscript} rivela {structure} su {factory}.",
    notSettled: "Conquista {factory} prima di ricercare questa struttura.",
    notAtFactory: "Inizia una partita nella stella fabbrica conquistata per ricercarne le fasi.",
    stageProgressOne: "{count}/{total} fase ricercata",
    stageProgress: "{count}/{total} fasi ricercate",
    stage: "Fase {number}",
    researched: "Ricercata",
    researchAction: "Ricerca fase",
    researchCost: "{cost} PR",
    insufficientResearch: "Richiede {required} PR; ne mancano {shortfall} PR.",
    missingPrerequisites: "Ricerca prima queste tecnologie: {technologies}.",
    researchUnavailable: "Questa fase non è ancora disponibile per la ricerca.",
    structureNames: {
      dysonSphere: "Sfera di Dyson",
      celestialProcessingCore: "Nucleo di Elaborazione Celestiale",
      plasmaForge: "Forgia al Plasma",
      galacticMemoryArchive: "Archivio di Memoria Galattica",
    },
  },
  fr: {
    title: "Mégastructures",
    headerHelp:
      "Ceci montre ta progression dans l'exploitation du pouvoir des MégaStructures, et le démantèlement lent du Champ de Force de Miaplacidus!",
    introduction:
      "Établissez les sites des manuscrits anciens pour révéler des étoiles-usines. Conquérez une étoile-usine, renaissez-y et recherchez ses cinq étapes.",
    noManuscripts: "Aucun manuscrit ancien n'a encore été trouvé. Continuez à étudier les étoiles.",
    forceField:
      "Champ de force de Miaplacidus : {level}/{total}. Terminez l'étape 3 des quatre structures pour ouvrir le système natal.",
    forceFieldCleared:
      "Champ de force de Miaplacidus : {level}/{total}. Vous pouvez maintenant vous rendre à Miaplacidus !",
    forceFieldStrength: "Puissance du champ de force:",
    forceFieldDown: "TOMBÉ!",
    forceFieldKeepWeakening:
      "Continuez à chercher et à conquérir des mégastructures anciennes pour affaiblir le champ de force de Miaplacidus",
    forceFieldCanMove: "Vous pouvez maintenant vous rendre à Miaplacidus!",
    manuscriptPending:
      "Le manuscrit {number} se trouve sur {manuscript} ; le site de l'usine reste caché.",
    manuscriptReported: "Le manuscrit {number} sur {manuscript} révèle {structure} sur {factory}.",
    notSettled: "Établissez {factory} avant de rechercher cette structure.",
    notAtFactory: "Commencez une partie sur l'étoile-usine conquise pour rechercher ses étapes.",
    stageProgressOne: "{count}/{total} étape recherchée",
    stageProgress: "{count}/{total} étapes recherchées",
    stage: "Étape {number}",
    researched: "Recherchée",
    researchAction: "Rechercher l'étape",
    researchCost: "{cost} PR",
    insufficientResearch: "Nécessite {required} PR ; il manque {shortfall} PR.",
    missingPrerequisites: "Recherchez d'abord ces technologies : {technologies}.",
    researchUnavailable: "Cette étape n'est pas encore disponible pour la recherche.",
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

export function megastructureStageProgress(
  locale: LocaleId,
  count: number,
  total: number,
  formatQuantity: (value: number) => string,
): string {
  const template =
    new Intl.PluralRules(locale).select(count) === "one"
      ? MESSAGES[locale].stageProgressOne
      : MESSAGES[locale].stageProgress;
  return template
    .replace("{count}", formatQuantity(count))
    .replace("{total}", formatQuantity(total));
}

export const LOCALIZATION_VALIDATION_DATA = { MESSAGES } as const;
