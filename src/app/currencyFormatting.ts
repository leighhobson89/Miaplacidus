import type { LocaleId } from "../content/ids";
import { CURRENCY_SYMBOLS, type CurrencyId } from "../content/currency";
import { condensedNumberParts, type NumberNotation } from "./numberFormatting";
import { truncateToDecimals } from "../engine/precision";

export function formatCurrency(
  locale: LocaleId,
  value: number,
  currencyId: CurrencyId = "usd",
  fractionDigits = 2,
  notation: NumberNotation = "condensed",
): string {
  const compact = notation === "condensed" ? condensedNumberParts(value) : null;
  if (compact) {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).formatToParts(truncateToDecimals(compact.scaledValue, 1));
    const lastNumberPart = parts.reduce(
      (lastIndex, part, index) =>
        part.type === "integer" || part.type === "fraction" ? index : lastIndex,
      -1,
    );
    return parts
      .map((part, index) => {
        const content = part.type === "currency" ? CURRENCY_SYMBOLS[currencyId] : part.value;
        return `${content}${index === lastNumberPart ? compact.suffix : ""}`;
      })
      .join("");
  }

  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    notation: notation === "condensed" ? "standard" : notation,
  }).formatToParts(value);
  return parts
    .map((part) => (part.type === "currency" ? CURRENCY_SYMBOLS[currencyId] : part.value))
    .join("");
}
