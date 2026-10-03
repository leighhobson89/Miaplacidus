import type { LegacyRunStateV1, GameState } from "../engine/state";
import {
  upgradeGameStateV1,
  upgradeGameStateV2,
  upgradeGameStateV3,
  upgradeGameStateV4,
  upgradeGameStateV5,
  upgradeGameStateV6,
  upgradeGameStateV7,
  upgradeGameStateV8,
  upgradeGameStateV9,
  upgradeGameStateV10,
  upgradeGameStateV11,
  upgradeGameStateV12,
  upgradeGameStateV13,
  upgradeGameStateV14,
  upgradeGameStateV15,
  upgradeGameStateV16,
  upgradeGameStateV17,
  upgradeGameStateV18,
  upgradeGameStateV19,
  type LegacyPermanentState,
} from "../engine/state";
import { makeEnvelope, SaveError, type SaveEnvelopeV1 } from "./schema";
import { normalizePioneerName } from "./validation";

interface LegacyEnvelopeBase {
  readonly format: "miaplacidus.save";
  readonly schemaVersion:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19;
  readonly slotId: string;
  readonly pioneerName: string;
  readonly createdAt: number;
  readonly savedAt: number;
  readonly revision: number;
  readonly state: unknown;
  readonly checksum: string;
}

export interface SaveEnvelopeV0 extends LegacyEnvelopeBase {
  readonly schemaVersion: 0;
  readonly state: {
    readonly schemaVersion: 0;
    readonly run: LegacyRunStateV1 | GameState["run"];
    readonly permanent: LegacyPermanentState;
    readonly settings: GameState["settings"];
  };
}

function validateLegacyEnvelope(
  value: unknown,
  version: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19,
): LegacyEnvelopeBase {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new SaveError("invalid-envelope", "The earlier save is not a valid object.");
  const envelope = value as Partial<LegacyEnvelopeBase>;
  const expectedKeys = [
    "format",
    "schemaVersion",
    "slotId",
    "pioneerName",
    "createdAt",
    "savedAt",
    "revision",
    "state",
    "checksum",
  ];
  const actualKeys = Object.keys(value).sort();
  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key, index) => key !== [...expectedKeys].sort()[index]) ||
    envelope.format !== "miaplacidus.save" ||
    envelope.schemaVersion !== version ||
    typeof envelope.slotId !== "string" ||
    !/^[a-f0-9-]{16,64}$/i.test(envelope.slotId) ||
    typeof envelope.pioneerName !== "string" ||
    normalizePioneerName(envelope.pioneerName).display !== envelope.pioneerName ||
    [...envelope.pioneerName].length > 32 ||
    !Number.isSafeInteger(envelope.createdAt) ||
    envelope.createdAt! < 0 ||
    !Number.isSafeInteger(envelope.savedAt) ||
    envelope.savedAt! < envelope.createdAt! ||
    !Number.isSafeInteger(envelope.revision) ||
    envelope.revision! < 1 ||
    !envelope.state ||
    typeof envelope.state !== "object" ||
    Array.isArray(envelope.state)
  ) {
    throw new SaveError("invalid-envelope", "The earlier save does not match its declared format.");
  }
  const state = envelope.state as Record<string, unknown>;
  if (state["schemaVersion"] !== version || !state["run"] || typeof state["run"] !== "object")
    throw new SaveError(
      "invalid-envelope",
      "The earlier save state does not match its declared format.",
    );
  const run = state["run"] as Record<string, unknown>;
  if (run["pioneerName"] !== envelope.pioneerName)
    throw new SaveError("invalid-envelope", "The earlier save name does not match its state.");
  return envelope as LegacyEnvelopeBase;
}

function verifyChecksum(envelope: LegacyEnvelopeBase, checksumFor: (body: object) => string): void {
  const { checksum, ...body } = envelope;
  if (
    typeof checksum !== "string" ||
    !/^[a-f0-9]{16}$/.test(checksum) ||
    checksumFor(body) !== checksum
  )
    throw new SaveError("checksum", "The earlier save failed its integrity check.");
}

function legacyStateToCurrent(envelope: LegacyEnvelopeBase, version: 0 | 1 | 2): GameState {
  const rawState = envelope.state as Record<string, unknown>;
  if (version === 2) {
    const upgraded = upgradeGameStateV2(rawState);
    if (!upgraded)
      throw new SaveError("invalid-envelope", "The v2 game state cannot be upgraded safely.");
    return upgraded;
  }
  const rawRun = rawState["run"] as Record<string, unknown>;
  const run = { ...rawRun };
  delete run["economy"];
  const stateV1 = {
    schemaVersion: 1,
    run,
    permanent: rawState["permanent"],
    settings: rawState["settings"],
    statistics:
      version === 1
        ? rawState["statistics"]
        : {
            lifetimeCashEarned: 0,
            lifetimeGoodsProduced: 0,
            acceptedCommands: 0,
            completedTimers: 0,
          },
  };
  const upgraded = upgradeGameStateV1(stateV1);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The earlier game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion3State(value: unknown): GameState {
  const upgraded = upgradeGameStateV3(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v3 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion4State(value: unknown): GameState {
  const upgraded = upgradeGameStateV4(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v4 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion5State(value: unknown): GameState {
  const upgraded = upgradeGameStateV5(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v5 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion6State(value: unknown): GameState {
  const upgraded = upgradeGameStateV6(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v6 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion7State(value: unknown): GameState {
  const upgraded = upgradeGameStateV7(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v7 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion8State(value: unknown): GameState {
  const upgraded = upgradeGameStateV8(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v8 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion9State(value: unknown): GameState {
  const upgraded = upgradeGameStateV9(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v9 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion10State(value: unknown): GameState {
  const upgraded = upgradeGameStateV10(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v10 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion11State(value: unknown): GameState {
  const upgraded = upgradeGameStateV11(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v11 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion12State(value: unknown): GameState {
  const upgraded = upgradeGameStateV12(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v12 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion13State(value: unknown): GameState {
  const upgraded = upgradeGameStateV13(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v13 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion14State(value: unknown): GameState {
  const upgraded = upgradeGameStateV14(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v14 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion15State(value: unknown): GameState {
  const upgraded = upgradeGameStateV15(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v15 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion16State(value: unknown): GameState {
  const upgraded = upgradeGameStateV16(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v16 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateVersion17State(value: unknown): GameState {
  const upgraded = upgradeGameStateV17(value);
  if (!upgraded)
    throw new SaveError("invalid-envelope", "The v17 game state cannot be upgraded safely.");
  return upgraded;
}

function migrateLegacy(
  value: unknown,
  version: 0 | 1 | 2,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, version);
  verifyChecksum(envelope, checksumFor);
  const state = legacyStateToCurrent(envelope, version);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV0(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  return migrateLegacy(value, 0, checksumFor);
}

export function migrateSaveV1(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  return migrateLegacy(value, 1, checksumFor);
}

export function migrateSaveV2(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  return migrateLegacy(value, 2, checksumFor);
}

export function migrateSaveV3(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 3);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion3State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV4(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 4);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion4State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV5(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 5);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion5State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV6(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 6);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion6State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV7(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 7);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion7State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV8(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 8);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion8State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV9(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 9);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion9State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV10(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 10);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion10State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV11(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 11);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion11State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV12(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 12);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion12State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV13(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 13);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion13State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV14(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 14);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion14State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV15(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 15);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion15State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV16(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 16);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion16State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV17(
  value: unknown,
  checksumFor: (body: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 17);
  verifyChecksum(envelope, checksumFor);
  const state = migrateVersion17State(envelope.state);
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV18(
  value: unknown,
  checksumFor: (value: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 18);
  verifyChecksum(envelope, checksumFor);
  const state = upgradeGameStateV18(envelope.state);
  if (!state) throw new SaveError("invalid-envelope", "The version 18 save state is invalid.");
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}

export function migrateSaveV19(
  value: unknown,
  checksumFor: (value: object) => string,
): SaveEnvelopeV1 {
  const envelope = validateLegacyEnvelope(value, 19);
  verifyChecksum(envelope, checksumFor);
  const state = upgradeGameStateV19(envelope.state);
  if (!state) throw new SaveError("invalid-envelope", "The version 19 save state is invalid.");
  return makeEnvelope({
    slotId: envelope.slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: envelope.savedAt,
    revision: envelope.revision,
    state,
  });
}
