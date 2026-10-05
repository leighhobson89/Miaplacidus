import type { LocaleId } from "../content/ids";
import { CURRENCY_SYMBOLS, type CurrencyId } from "../content/currency";
import type { NumberNotation } from "./numberFormatting";

export function formatCurrency(
  locale: LocaleId,
  value: number,
  currencyId: CurrencyId = "usd",
  fractionDigits = 2,
  notation: NumberNotation = "standard",
): string {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    notation,
  }).formatToParts(value);
  return parts
    .map((part) => (part.type === "currency" ? CURRENCY_SYMBOLS[currencyId] : part.value))
    .join("");
}
