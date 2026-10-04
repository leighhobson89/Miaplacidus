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
  makeEnvelope,
  SaveError,
  type SaveEnvelopeV1,
} from "./schema";
import {
  migrateSaveV0,
  migrateSaveV1,
  migrateSaveV2,
  migrateSaveV3,
  migrateSaveV4,
  migrateSaveV5,
  migrateSaveV6,
  migrateSaveV7,
  migrateSaveV8,
  migrateSaveV9,
  migrateSaveV10,
  migrateSaveV11,
  migrateSaveV12,
  migrateSaveV13,
  migrateSaveV14,
  migrateSaveV15,
  migrateSaveV16,
  migrateSaveV17,
  migrateSaveV18,
  migrateSaveV19,
  migrateSaveV20,
  migrateSaveV21,
  migrateSaveV22,
  migrateSaveV23,
  migrateSaveV24,
  migrateSaveV25,
  migrateSaveV26,
  migrateSaveV27,
  migrateSaveV28,
  migrateSaveV29,
  migrateSaveV30,
} from "./migrations";

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
    (parsed as { schemaVersion?: unknown }).schemaVersion === 1
  ) {
    return migrateSaveV1(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 2
  ) {
    return migrateSaveV2(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 3
  ) {
    return migrateSaveV3(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 4
  ) {
    return migrateSaveV4(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 5
  ) {
    return migrateSaveV5(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 6
  ) {
    return migrateSaveV6(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 7
  ) {
    return migrateSaveV7(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 8
  ) {
    return migrateSaveV8(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 9
  ) {
    return migrateSaveV9(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 10
  ) {
    return migrateSaveV10(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 11
  ) {
    return migrateSaveV11(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 12
  ) {
    return migrateSaveV12(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 13
  ) {
    return migrateSaveV13(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 14
  ) {
    return migrateSaveV14(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 15
  ) {
    return migrateSaveV15(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 16
  ) {
    return migrateSaveV16(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 17
  ) {
    return migrateSaveV17(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 18
  ) {
    return migrateSaveV18(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 19
  ) {
    return migrateSaveV19(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 20
  ) {
    return migrateSaveV20(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 21
  ) {
    return migrateSaveV21(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 22
  ) {
    return migrateSaveV22(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 23
  ) {
    return migrateSaveV23(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 24
  ) {
    return migrateSaveV24(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 25
  ) {
    return migrateSaveV25(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 26
  ) {
    return migrateSaveV26(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 27
  ) {
    return migrateSaveV27(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 28
  ) {
    return migrateSaveV28(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 29
  ) {
    return migrateSaveV29(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    (parsed as { schemaVersion?: unknown }).schemaVersion === 30
  ) {
    return migrateSaveV30(parsed, checksumFor);
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "schemaVersion" in parsed &&
    typeof (parsed as { schemaVersion?: unknown }).schemaVersion === "number" &&
    (parsed as { schemaVersion: number }).schemaVersion > 31
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
  if (!parsed.state.run.space.antimatterBoostActive) return parsed;
  return makeEnvelope({
    slotId: parsed.slotId,
    pioneerName: parsed.pioneerName,
    createdAt: parsed.createdAt,
    savedAt: parsed.savedAt,
    revision: parsed.revision,
    state: parsed.state,
  });
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
