import type { LocaleId } from "../content/ids";
import { displayQuantity, truncateToDecimals } from "../engine/precision";
import type { NumberNotation } from "../engine/state";
export type { NumberNotation } from "../engine/state";

export interface CondensedNumberParts {
  readonly scaledValue: number;
  readonly suffix: string;
}

export function condensedNumberParts(value: number): CondensedNumberParts | null {
  if (!Number.isFinite(value) || value < 1_000) return null;
  if (value >= 1_000_000_000_000) {
    const exponent = Math.floor(Math.log10(value));
    return { scaledValue: value / 10 ** exponent, suffix: `e${exponent}` };
  }
  if (value >= 1_000_000_000) return { scaledValue: value / 1_000_000_000, suffix: "B" };
  if (value >= 1_000_000) return { scaledValue: value / 1_000_000, suffix: "M" };
  return { scaledValue: value / 1_000, suffix: "K" };
}

function formatCondensedNumber(
  locale: LocaleId,
  value: number,
  maximumFractionDigits: number,
  signDisplay: Intl.NumberFormatOptions["signDisplay"],
): string {
  const compact = condensedNumberParts(value);
  if (compact) {
    const mantissa = new Intl.NumberFormat(locale, {
      useGrouping: false,
      maximumFractionDigits: 1,
      signDisplay,
    }).format(truncateToDecimals(compact.scaledValue, 1));
    return `${mantissa}${compact.suffix}`;
  }

  const visibleValue = value >= 0 && maximumFractionDigits === 0 ? displayQuantity(value) : value;
  return new Intl.NumberFormat(locale, { maximumFractionDigits, signDisplay }).format(visibleValue);
}

export function formatNumber(
  locale: LocaleId,
  value: number,
  maximumFractionDigits = 0,
  notation: NumberNotation = "condensed",
  signDisplay: Intl.NumberFormatOptions["signDisplay"] = "auto",
): string {
  if (notation === "condensed") {
    return formatCondensedNumber(locale, value, maximumFractionDigits, signDisplay);
  }

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
