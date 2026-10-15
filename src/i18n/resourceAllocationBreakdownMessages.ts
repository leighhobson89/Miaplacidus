import type { LocaleId } from "../content/ids";

export interface ResourceAllocationBreakdownCopy {
  readonly heading: string;
  readonly allocatable: string;
  readonly soldForCash: string;
  readonly compoundCeiling: string;
  readonly divertedToCreate: string;
  readonly unusedCompoundShare: string;
  readonly storage: string;
  readonly autoSellIncome: string;
  readonly autoCreationLabel: string;
  readonly throttledBy: string;
}

const COPY: Record<LocaleId, ResourceAllocationBreakdownCopy> = {
  en: {
    heading: "Production allocation",
    allocatable: "Allocatable: {rate}",
    soldForCash: "Sold for cash: {rate}",
    compoundCeiling: "Available to compounds: {rate}",
    divertedToCreate: "Resources diverted to create {compound}: {rate}",
    unusedCompoundShare: "Unused compound share: {rate}",
    storage: "To storage: {rate}",
    autoSellIncome: "Autosell income: {cashRate}",
    autoCreationLabel: "Auto Creation:",
    throttledBy: "Limited by {resource}",
  },
  es: {
    heading: "Asignación de producción",
    allocatable: "Asignable: {rate}",
    soldForCash: "Vendido por efectivo: {rate}",
    compoundCeiling: "Disponible para compuestos: {rate}",
    divertedToCreate: "Recursos desviados para crear {compound}: {rate}",
    unusedCompoundShare: "Parte sin usar para compuestos: {rate}",
    storage: "Al almacén: {rate}",
    autoSellIncome: "Ingresos por venta automática: {cashRate}",
    autoCreationLabel: "Creación automática:",
    throttledBy: "Limitado por {resource}",
  },
  pt: {
    heading: "Alocação de produção",
    allocatable: "Alocável: {rate}",
    soldForCash: "Vendido por dinheiro: {rate}",
    compoundCeiling: "Disponível para compostos: {rate}",
    divertedToCreate: "Recursos desviados para criar {compound}: {rate}",
    unusedCompoundShare: "Parcela não utilizada para compostos: {rate}",
    storage: "Para armazenamento: {rate}",
    autoSellIncome: "Receita de venda automática: {cashRate}",
    autoCreationLabel: "Criação automática:",
    throttledBy: "Limitado por {resource}",
  },
  de: {
    heading: "Produktionsaufteilung",
    allocatable: "Aufteilbar: {rate}",
    soldForCash: "Für Bargeld verkauft: {rate}",
    compoundCeiling: "Für Verbindungen verfügbar: {rate}",
    divertedToCreate: "Zur Herstellung von {compound} umgeleitete Ressourcen: {rate}",
    unusedCompoundShare: "Nicht genutzter Anteil für Verbindungen: {rate}",
    storage: "Zur Lagerung: {rate}",
    autoSellIncome: "Einnahmen aus Autoverkauf: {cashRate}",
    autoCreationLabel: "Automatische Herstellung:",
    throttledBy: "Begrenzt durch {resource}",
  },
  it: {
    heading: "Ripartizione della produzione",
    allocatable: "Ripartibile: {rate}",
    soldForCash: "Venduto per contanti: {rate}",
    compoundCeiling: "Disponibile per i composti: {rate}",
    divertedToCreate: "Risorse dirottate per creare {compound}: {rate}",
    unusedCompoundShare: "Quota non utilizzata per i composti: {rate}",
    storage: "In deposito: {rate}",
    autoSellIncome: "Entrate dalla vendita automatica: {cashRate}",
    autoCreationLabel: "Creazione automatica:",
    throttledBy: "Limitato da {resource}",
  },
  fr: {
    heading: "Répartition de la production",
    allocatable: "Répartissable : {rate}",
    soldForCash: "Vendu contre de l’argent : {rate}",
    compoundCeiling: "Disponible pour les composés : {rate}",
    divertedToCreate: "Ressources détournées pour créer {compound} : {rate}",
    unusedCompoundShare: "Part inutilisée pour les composés : {rate}",
    storage: "Vers le stockage : {rate}",
    autoSellIncome: "Revenus de la vente automatique : {cashRate}",
    autoCreationLabel: "Création automatique :",
    throttledBy: "Limité par {resource}",
  },
};

export function resourceAllocationBreakdownCopy(locale: LocaleId): ResourceAllocationBreakdownCopy {
  return COPY[locale];
}

export const LOCALIZATION_VALIDATION_DATA = { messages: COPY } as const;
