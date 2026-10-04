export const THEME_IDS = [
  "terminal",
  "dark",
  "misty",
  "light",
  "frosty",
  "summer",
  "supernova",
  "galaxy",
  "space",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export const DEFAULT_THEME_ID: ThemeId = "terminal";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEME_IDS.includes(value as ThemeId);
}
