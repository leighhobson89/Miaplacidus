import type { LocaleId } from "../content/ids";

export type ResearchActionHelpId =
  | "researchAutoBuyer"
  | "scienceKit"
  | "scienceClub"
  | "scienceLab";

/** Exact localized Research option descriptions from Cosmic Forge's localization.json. */
export const RESEARCH_ACTION_HELP_MESSAGES = {
  en: {
    researchAutoBuyer:
      "Toggle the Research AutoBuyer ON and OFF. (Will research the first available tech with all requisites fulfilled)",
    scienceKit: "Purchase a Science Kit to start generating Research points.",
    scienceClub: "Open a Science Club to produce Research points more effectively.",
    scienceLab: "Build a Science Lab to do large amounts of Research - Power:",
  },
  es: {
    researchAutoBuyer:
      "Activa y desactiva el AutoComprador de Investigación. (Investigará la primera tecnología disponible con todos los requisitos cumplidos)",
    scienceKit: "Compra un Kit de Ciencia para comenzar a generar puntos de Investigación.",
    scienceClub: "Abre un Club de Ciencia para producir puntos de Investigación más efectivamente.",
    scienceLab:
      "Construye un Laboratorio de Ciencia para realizar grandes cantidades de Investigación - Energía:",
  },
  pt: {
    researchAutoBuyer:
      "Ative e desative o AutoComprador de Pesquisa. (Pesquisará a primeira tecnologia disponível com todos os requisitos atendidos)",
    scienceKit: "Compre um Kit de Ciência para começar a gerar pontos de Pesquisa.",
    scienceClub:
      "Abra um Clube de Ciência para produzir pontos de Pesquisa de forma mais eficiente.",
    scienceLab:
      "Construa um Laboratório de Ciência para realizar grandes quantidades de Pesquisa - Energia:",
  },
  de: {
    researchAutoBuyer:
      "Schalte den Forschungs-Autokäufer EIN und AUS. (Wird die erste verfügbare Technologie erforschen, wenn alle Voraussetzungen erfüllt sind)",
    scienceKit: "Kaufe ein Wissenschaftsset, um Forschungspunkte zu generieren.",
    scienceClub: "Eröffne einen Wissenschaftsklub, um effektiver Forschungspunkte zu produzieren.",
    scienceLab:
      "Baue ein Wissenschaftslabor, um große Mengen an Forschung zu betreiben - Leistung:",
  },
  it: {
    researchAutoBuyer:
      "Attiva e disattiva l'AutoAcquirente di Ricerca. (Ricercherà la prima tecnologia disponibile con tutti i requisiti soddisfatti)",
    scienceKit: "Acquista un Kit Scientifico per iniziare a generare punti Ricerca.",
    scienceClub: "Apri un Club Scientifico per produrre punti Ricerca più efficacemente.",
    scienceLab:
      "Costruisci un Laboratorio Scientifico per fare grandi quantità di Ricerca - Potenza:",
  },
  fr: {
    researchAutoBuyer:
      "Active et désactive l'Acheteur Automatique de Recherche. (Recherchera la première technologie disponible avec tous les prérequis remplis)",
    scienceKit: "Achète un Kit Scientifique pour commencer à générer des points de Recherche.",
    scienceClub:
      "Ouvre un Club Scientifique pour produire des points de Recherche plus efficacement.",
    scienceLab:
      "Construit un Laboratoire Scientifique pour faire de grandes quantités de Recherche - Puissance:",
  },
} as const satisfies Readonly<Record<LocaleId, Readonly<Record<ResearchActionHelpId, string>>>>;

export function researchActionHelp(locale: LocaleId, action: ResearchActionHelpId): string {
  return RESEARCH_ACTION_HELP_MESSAGES[locale][action];
}

export const LOCALIZATION_VALIDATION_DATA = { messages: RESEARCH_ACTION_HELP_MESSAGES } as const;
