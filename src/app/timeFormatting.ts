import type { LocaleId } from "../content/ids";
import type { NumberNotation } from "../engine/state";
import { topStatusText } from "../i18n/topStatusMessages";
import { formatNumber } from "./numberFormatting";

export function formatDuration(
  locale: LocaleId,
  milliseconds: number,
  notation: NumberNotation = "condensed",
): string {
  let remaining = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(remaining / 86_400);
  remaining %= 86_400;
  const hours = Math.floor(remaining / 3_600);
  remaining %= 3_600;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const parts: string[] = [];
  if (days > 0)
    parts.push(`${formatNumber(locale, days, 0, notation)}${topStatusText(locale, "day")}`);
  if (hours > 0 || days > 0)
    parts.push(`${formatNumber(locale, hours, 0, notation)}${topStatusText(locale, "hour")}`);
  if (minutes > 0 || hours > 0 || days > 0)
    parts.push(`${formatNumber(locale, minutes, 0, notation)}${topStatusText(locale, "minute")}`);
  parts.push(`${formatNumber(locale, seconds, 0, notation)}${topStatusText(locale, "second")}`);
  return parts.join(" ");
}

export function formatCountdown(
  locale: LocaleId,
  milliseconds: number,
  notation: NumberNotation = "condensed",
): string {
  const roundedUpToSecond = Math.ceil(Math.max(0, milliseconds) / 1000) * 1000;
  return formatDuration(locale, roundedUpToSecond, notation);
}
