import type { LocaleId } from "../content/ids";

const messages: Record<
  LocaleId,
  {
    ap: string;
    gp: string;
    antimatter: string;
    good: string;
    resources: string;
    compounds: string;
    rate: string;
    rateBonus: string;
    sale: string;
    recipe: string;
  }
> = {
  en: {
    ap: "{amount} AP",
    gp: "{amount} GP",
    antimatter: "{amount} antimatter",
    good: "{amount} {good}",
    resources: "2× resource stock",
    compounds: "2× compound stock",
    rate: "×{value} production",
    rateBonus: "+{value}% production",
    sale: "×{value} sale value",
    recipe: "×{value} recipe cost",
  },
  es: {
    ap: "{amount} PA",
    gp: "{amount} PG",
    antimatter: "{amount} de antimateria",
    good: "{amount} de {good}",
    resources: "2× existencias de recursos",
    compounds: "2× existencias de compuestos",
    rate: "×{value} de producción",
    rateBonus: "+{value}% de producción",
    sale: "×{value} del valor de venta",
    recipe: "×{value} del coste de receta",
  },
  pt: {
    ap: "{amount} AP",
    gp: "{amount} PG",
    antimatter: "{amount} de antimatéria",
    good: "{amount} de {good}",
    resources: "2× estoque de recursos",
    compounds: "2× estoque de compostos",
    rate: "×{value} de produção",
    rateBonus: "+{value}% de produção",
    sale: "×{value} do valor de venda",
    recipe: "×{value} do custo da receita",
  },
  de: {
    ap: "{amount} AP",
    gp: "{amount} GP",
    antimatter: "{amount} Antimaterie",
    good: "{amount} {good}",
    resources: "2× Ressourcenvorrat",
    compounds: "2× Verbindungsvorrat",
    rate: "×{value} Produktion",
    rateBonus: "+{value}% Produktion",
    sale: "×{value} Verkaufswert",
    recipe: "×{value} Rezeptkosten",
  },
  it: {
    ap: "{amount} PA",
    gp: "{amount} PG",
    antimatter: "{amount} antimateria",
    good: "{amount} {good}",
    resources: "2× scorte di risorse",
    compounds: "2× scorte di composti",
    rate: "×{value} produzione",
    rateBonus: "+{value}% produzione",
    sale: "×{value} valore di vendita",
    recipe: "×{value} costo della ricetta",
  },
  fr: {
    ap: "{amount} PA",
    gp: "{amount} PG",
    antimatter: "{amount} antimatière",
    good: "{amount} {good}",
    resources: "2× réserves de ressources",
    compounds: "2× réserves de composés",
    rate: "×{value} production",
    rateBonus: "+{value}% production",
    sale: "×{value} valeur de vente",
    recipe: "×{value} coût de recette",
  },
};

export type AchievementRewardMessage = keyof (typeof messages)["en"];
export function achievementRewardText(
  locale: LocaleId,
  key: AchievementRewardMessage,
  values: Record<string, string | number> = {},
): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (_match, name: string) =>
    String(values[name] ?? ""),
  );
}

export const LOCALIZATION_VALIDATION_DATA = { messages } as const;
