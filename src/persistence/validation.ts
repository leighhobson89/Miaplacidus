import { SaveError } from "./schema";

export const MAX_PIONEER_NAME_LENGTH = 32;

export function normalizePioneerName(input: string): { display: string; lookupKey: string } {
  const display = input.normalize("NFC").trim().replace(/\s+/gu, " ");
  const lookupKey = display
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\u00df/gu, "ss")
    .replace(/\u03c2/gu, "\u03c3");
  return { display, lookupKey };
}

export function validatePioneerName(input: string): { display: string; lookupKey: string } {
  if (typeof input !== "string") throw new SaveError("invalid-envelope", "Enter a pioneer name.");
  const name = normalizePioneerName(input);
  if (!name.display) throw new SaveError("invalid-envelope", "Enter a pioneer name.");
  if ([...name.display].length > MAX_PIONEER_NAME_LENGTH)
    throw new SaveError(
      "invalid-envelope",
      "Names can have up to " + MAX_PIONEER_NAME_LENGTH + " characters.",
    );
  if (hasControlCharacters(name.display))
    throw new SaveError("invalid-envelope", "That name contains characters that cannot be used.");
  if (!name.lookupKey) throw new SaveError("invalid-envelope", "Enter a pioneer name.");
  return name;
}

export function hasControlCharacters(input: string): boolean {
  for (const character of input) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint < 0x20 || (codePoint >= 0x7f && codePoint <= 0x9f)) return true;
  }
  return false;
}
