import type { EconomicGoodId, LocaleId } from "../content/ids";
import { createEconomyTickPlan } from "../engine/economySimulation";
import type { GameState } from "../engine/state";

const NAMES = {
  en: {
    hydrogen: "Hydrogen",
    helium: "Helium",
    carbon: "Carbon",
    neon: "Neon",
    oxygen: "Oxygen",
    sodium: "Sodium",
    silicon: "Silicon",
    iron: "Iron",
    diesel: "Diesel",
    glass: "Glass",
    steel: "Steel",
    concrete: "Concrete",
    water: "Water",
    titanium: "Titanium",
  },
  es: {
    hydrogen: "Hidrógeno",
    helium: "Helio",
    carbon: "Carbono",
    neon: "Neón",
    oxygen: "Oxígeno",
    sodium: "Sodio",
    silicon: "Silicio",
    iron: "Hierro",
    diesel: "Diesel",
    glass: "Vidrio",
    steel: "Acero",
    concrete: "Hormigón",
    water: "Agua",
    titanium: "Titanio",
  },
  pt: {
    hydrogen: "Hidrogénio",
    helium: "Hélio",
    carbon: "Carbono",
    neon: "Néon",
    oxygen: "Oxigénio",
    sodium: "Sódio",
    silicon: "Silício",
    iron: "Ferro",
    diesel: "Diesel",
    glass: "Vidro",
    steel: "Aço",
    concrete: "Betão",
    water: "Água",
    titanium: "Titânio",
  },
  de: {
    hydrogen: "Wasserstoff",
    helium: "Helium",
    carbon: "Kohlenstoff",
    neon: "Neon",
    oxygen: "Sauerstoff",
    sodium: "Natrium",
    silicon: "Silizium",
    iron: "Eisen",
    diesel: "Diesel",
    glass: "Glas",
    steel: "Stahl",
    concrete: "Beton",
    water: "Wasser",
    titanium: "Titan",
  },
  it: {
    hydrogen: "Idrogeno",
    helium: "Elio",
    carbon: "Carbonio",
    neon: "Neon",
    oxygen: "Ossigeno",
    sodium: "Sodio",
    silicon: "Silicio",
    iron: "Ferro",
    diesel: "Diesel",
    glass: "Vetro",
    steel: "Acciaio",
    concrete: "Cemento",
    water: "Acqua",
    titanium: "Titanio",
  },
  fr: {
    hydrogen: "Hydrogène",
    helium: "Hélium",
    carbon: "Carbone",
    neon: "Néon",
    oxygen: "Oxygène",
    sodium: "Sodium",
    silicon: "Silicium",
    iron: "Fer",
    diesel: "Diesel",
    glass: "Verre",
    steel: "Acier",
    concrete: "Béton",
    water: "Eau",
    titanium: "Titane",
  },
} as const satisfies Record<LocaleId, Record<EconomicGoodId, string>>;

export function economyGoodName(locale: LocaleId, id: EconomicGoodId): string {
  return NAMES[locale][id];
}

const PAGE_TITLE_OVERRIDES: Partial<Record<LocaleId, Partial<Record<EconomicGoodId, string>>>> = {
  // Cosmic Forge uses the side-menu name "Cemento" but the page heading "Calcestruzzo".
  it: { concrete: "Calcestruzzo" },
};

export function economyGoodPageTitle(locale: LocaleId, id: EconomicGoodId): string {
  return PAGE_TITLE_OVERRIDES[locale]?.[id] ?? economyGoodName(locale, id);
}

export function economyRatePerSecond(state: GameState, id: EconomicGoodId): number {
  return createEconomyTickPlan(state).netRatesPerSecond[id] ?? 0;
}
