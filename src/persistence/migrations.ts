import type { LegacyRunStateV1, GameState } from "../engine/state";
import { upgradeGameStateV1, upgradeGameStateV2 } from "../engine/state";
import { makeEnvelope, SaveError, type SaveEnvelopeV1 } from "./schema";
import { normalizePioneerName } from "./validation";

interface LegacyEnvelopeBase {
  readonly format: "miaplacidus.save";
  readonly schemaVersion: 0 | 1 | 2;
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
    readonly permanent: GameState["permanent"];
    readonly settings: GameState["settings"];
  };
}

function validateLegacyEnvelope(value: unknown, version: 0 | 1 | 2): LegacyEnvelopeBase {
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
