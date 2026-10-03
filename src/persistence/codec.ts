import {
  compressToEncodedURIComponent,
  compressToUTF16,
  decompressFromEncodedURIComponent,
  decompressFromUTF16,
} from "lz-string";
import {
  canonicalJson,
  checksumFor,
  isSaveEnvelope,
  MAX_LOCAL_PAYLOAD_CHARS,
  MAX_PORTABLE_CODE_CHARS,
  MAX_SAVE_JSON_CHARS,
  SaveError,
  type SaveEnvelopeV1,
} from "./schema";
import { migrateSaveV0 } from "./migrations";

export const PORTABLE_PREFIX = "MIA1:";

function parseEnvelope(json: string): SaveEnvelopeV1 {
  if (json.length > MAX_SAVE_JSON_CHARS)
    throw new SaveError("too-large", "The save exceeds the supported size.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new SaveError("invalid-json", "The save data is not valid JSON.");
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "format" in parsed &&
    (parsed as { format?: unknown }).format !== "miaplacidus.save"
  ) {
    throw new SaveError("unknown-format", "This is not a MIAPLACIDUS save code.");
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 0
  ) {
    return migrateSaveV0(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    typeof (parsed as { schemaVersion?: unknown }).schemaVersion === "number" &&
    (parsed as { schemaVersion: number }).schemaVersion > 1
  ) {
    throw new SaveError("future-version", "This save was made by a newer version of MIAPLACIDUS.");
  }
  if (!isSaveEnvelope(parsed)) {
    if (
      parsed &&
      typeof parsed === "object" &&
      "format" in parsed &&
      (parsed as { format?: unknown }).format !== "miaplacidus.save"
    )
      throw new SaveError("unknown-format", "This is not a MIAPLACIDUS save code.");
    throw new SaveError("checksum", "The save is incomplete or failed its integrity check.");
  }
  return parsed;
}

export function encodeLocal(envelope: SaveEnvelopeV1): string {
  const encoded = compressToUTF16(canonicalJson(envelope));
  if (encoded.length > MAX_LOCAL_PAYLOAD_CHARS)
    throw new SaveError("too-large", "This save is too large for local storage.");
  return encoded;
}

export function decodeLocal(encoded: string): SaveEnvelopeV1 {
  if (!encoded) throw new SaveError("empty", "There is no saved data.");
  if (encoded.length > MAX_LOCAL_PAYLOAD_CHARS)
    throw new SaveError("too-large", "The stored save exceeds the supported size.");
  const json = decompressFromUTF16(encoded);
  if (!json) throw new SaveError("invalid-code", "The stored save could not be decompressed.");
  return parseEnvelope(json);
}

export function encodePortable(envelope: SaveEnvelopeV1): string {
  const code = PORTABLE_PREFIX + compressToEncodedURIComponent(canonicalJson(envelope));
  if (code.length > MAX_PORTABLE_CODE_CHARS)
    throw new SaveError("too-large", "This save is too large to export as a code.");
  return code;
}

export function decodePortable(code: string): SaveEnvelopeV1 {
  const supplied = code.trim();
  if (!supplied) throw new SaveError("empty", "Paste a MIAPLACIDUS save code first.");
  if (supplied.length > MAX_PORTABLE_CODE_CHARS)
    throw new SaveError("too-large", "The supplied save code exceeds the supported size.");
  if (!supplied.startsWith(PORTABLE_PREFIX))
    throw new SaveError("unknown-format", "This code is not marked as a MIAPLACIDUS save.");
  const json = decompressFromEncodedURIComponent(supplied.slice(PORTABLE_PREFIX.length));
  if (!json)
    throw new SaveError(
      "invalid-code",
      "The save code is incomplete or uses an unsupported codec.",
    );
  return parseEnvelope(json);
}
