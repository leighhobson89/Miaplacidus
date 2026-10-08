import type { GameState } from "../engine/state";
import { isValidGameState } from "../engine/state";
import { hasControlCharacters, normalizePioneerName } from "./validation";

export const SAVE_FORMAT = "miaplacidus.save" as const;
export const SAVE_SCHEMA_VERSION = 44 as const;
export const MAX_SAVE_JSON_CHARS = 1_000_000;
export const MAX_LOCAL_PAYLOAD_CHARS = 750_000;
export const MAX_PORTABLE_CODE_CHARS = 900_005;

export interface SaveEnvelopeV1 {
  readonly format: typeof SAVE_FORMAT;
  readonly schemaVersion: typeof SAVE_SCHEMA_VERSION;
  readonly slotId: string;
  readonly pioneerName: string;
  readonly createdAt: number;
  readonly savedAt: number;
  readonly revision: number;
  readonly state: GameState;
  readonly checksum: string;
}

export interface LegacySaveEnvelopeV1 extends Omit<SaveEnvelopeV1, "schemaVersion" | "state"> {
  readonly schemaVersion: 1;
  readonly state: unknown;
}

export type SaveErrorCode =
  | "empty"
  | "too-large"
  | "unknown-format"
  | "invalid-code"
  | "invalid-json"
  | "invalid-envelope"
  | "checksum"
  | "future-version"
  | "duplicate-name"
  | "not-found"
  | "conflict"
  | "storage-unavailable"
  | "quota"
  | "corrupt-slot";

export class SaveError extends Error {
  constructor(
    readonly code: SaveErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SaveError";
  }
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  const record = value as Record<string, unknown>;
  return (
    "{" +
    Object.keys(record)
      .sort()
      .map((key) => JSON.stringify(key) + ":" + canonicalJson(record[key]))
      .join(",") +
    "}"
  );
}

/** A corruption check, not an authentication mechanism. */
export function checksumFor(value: object): string {
  const input = canonicalJson(value);
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ (code + index), 0x85ebca6b) >>> 0;
  }
  return first.toString(16).padStart(8, "0") + second.toString(16).padStart(8, "0");
}

function exactKeys(value: object, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

export function isSaveEnvelope(value: unknown): value is SaveEnvelopeV1 {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const envelope = value as Partial<SaveEnvelopeV1>;
  if (
    !exactKeys(value, [
      "format",
      "schemaVersion",
      "slotId",
      "pioneerName",
      "createdAt",
      "savedAt",
      "revision",
      "state",
      "checksum",
    ])
  )
    return false;
  if (envelope.format !== SAVE_FORMAT || envelope.schemaVersion !== SAVE_SCHEMA_VERSION)
    return false;
  if (typeof envelope.slotId !== "string" || !/^[a-f0-9-]{16,64}$/i.test(envelope.slotId))
    return false;
  if (
    typeof envelope.pioneerName !== "string" ||
    normalizePioneerName(envelope.pioneerName).display !== envelope.pioneerName ||
    [...envelope.pioneerName].length > 32 ||
    hasControlCharacters(envelope.pioneerName)
  )
    return false;
  if (
    !Number.isSafeInteger(envelope.createdAt) ||
    envelope.createdAt! < 0 ||
    !Number.isSafeInteger(envelope.savedAt) ||
    envelope.savedAt! < envelope.createdAt!
  )
    return false;
  if (
    !Number.isSafeInteger(envelope.revision) ||
    envelope.revision! < 1 ||
    !isValidGameState(envelope.state)
  )
    return false;
  if (envelope.state.run.pioneerName !== envelope.pioneerName) return false;
  if (typeof envelope.checksum !== "string" || !/^[a-f0-9]{16}$/.test(envelope.checksum))
    return false;
  const { checksum, ...body } = envelope as SaveEnvelopeV1;
  return checksumFor(body) === checksum;
}

export function makeEnvelope(
  input: Omit<SaveEnvelopeV1, "format" | "schemaVersion" | "checksum">,
): SaveEnvelopeV1 {
  const state = input.state.run.space.antimatterBoostActive
    ? {
        ...input.state,
        run: {
          ...input.state.run,
          space: { ...input.state.run.space, antimatterBoostActive: false },
        },
      }
    : input.state;
  const body = {
    format: SAVE_FORMAT,
    schemaVersion: SAVE_SCHEMA_VERSION,
    ...input,
    state,
  } as const;
  const envelope = { ...body, checksum: checksumFor(body) };
  if (!isSaveEnvelope(envelope))
    throw new SaveError("invalid-envelope", "The game state cannot be saved in this format.");
  if (canonicalJson(envelope).length > MAX_SAVE_JSON_CHARS)
    throw new SaveError("too-large", "The save is too large to encode.");
  return envelope;
}
