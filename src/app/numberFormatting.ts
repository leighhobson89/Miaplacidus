import type { LocaleId } from "../content/ids";

export type NumberNotation = "standard" | "scientific";

export function formatNumber(
  locale: LocaleId,
  value: number,
  maximumFractionDigits = 0,
  notation: NumberNotation = "standard",
  signDisplay: Intl.NumberFormatOptions["signDisplay"] = "auto",
): string {
  return new Intl.NumberFormat(
    locale,
    notation === "scientific"
      ? {
          notation: "scientific",
          maximumSignificantDigits: Math.max(1, maximumFractionDigits + 1),
          signDisplay,
        }
      : { maximumFractionDigits, signDisplay },
  ).format(value);
}
