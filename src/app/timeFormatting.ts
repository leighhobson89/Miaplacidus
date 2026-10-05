import type { LocaleId } from "../content/ids";
import { topStatusText } from "../i18n/topStatusMessages";
import { formatNumber } from "./numberFormatting";

export function formatDuration(locale: LocaleId, milliseconds: number): string {
  let remaining = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(remaining / 86_400);
  remaining %= 86_400;
  const hours = Math.floor(remaining / 3_600);
  remaining %= 3_600;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${formatNumber(locale, days)}${topStatusText(locale, "day")}`);
  if (hours > 0 || days > 0)
    parts.push(`${formatNumber(locale, hours)}${topStatusText(locale, "hour")}`);
  if (minutes > 0 || hours > 0 || days > 0)
    parts.push(`${formatNumber(locale, minutes)}${topStatusText(locale, "minute")}`);
  parts.push(`${formatNumber(locale, seconds)}${topStatusText(locale, "second")}`);
  return parts.join(" ");
}
